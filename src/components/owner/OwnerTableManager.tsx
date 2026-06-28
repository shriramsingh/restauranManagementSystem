'use client'

import { useState } from 'react'
import { Table2, Plus, Edit, Trash2, X, QrCode } from 'lucide-react'

interface Table {
  _id: string
  tableNumber: string
  capacity: number
  status: string
  location?: string
}

interface QrData {
  tableId: string
  tableNumber: string
  menuUrl: string
  qrCodeUrl: string
}

const getStatusColor = (status: string) => {
  switch (status) {
    case 'available': return 'bg-green-100 text-green-800'
    case 'occupied': return 'bg-red-100 text-red-800'
    case 'reserved': return 'bg-yellow-100 text-yellow-800'
    case 'cleaning': return 'bg-gray-100 text-gray-800'
    default: return 'bg-gray-100 text-gray-800'
  }
}

export default function OwnerTableManager({ initialTables }: { initialTables: Table[] }) {
  const [tables, setTables] = useState<Table[]>(initialTables)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')

  const [modalOpen, setModalOpen] = useState(false)
  const [editModalOpen, setEditModalOpen] = useState(false)
  const [deleteConfirm, setDeleteConfirm] = useState<string | null>(null)
  const [editingTable, setEditingTable] = useState<Table | null>(null)
  const [qrModal, setQrModal] = useState<QrData | null>(null)

  const [form, setForm] = useState({ tableNumber: '', capacity: '', status: 'available', location: '' })

  const showSuccess = (msg: string) => {
    setSuccess(msg)
    setTimeout(() => setSuccess(''), 3000)
  }

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError('')
    try {
      const res = await fetch('/api/tables', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...form,
          capacity: parseInt(form.capacity),
        }),
      })
      const data = await res.json()
      if (!res.ok) {
        setError(data.error || 'Failed to create table')
      } else {
        setTables((prev) => [...prev, data])
        setForm({ tableNumber: '', capacity: '', status: 'available', location: '' })
        setModalOpen(false)
        showSuccess('Table created successfully')
      }
    } catch {
      setError('Network error')
    } finally {
      setLoading(false)
    }
  }

  const handleUpdate = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!editingTable) return
    setLoading(true)
    setError('')
    try {
      const res = await fetch(`/api/tables/${editingTable._id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...form,
          capacity: parseInt(form.capacity),
        }),
      })
      const data = await res.json()
      if (!res.ok) {
        setError(data.error || 'Failed to update table')
      } else {
        setTables((prev) => prev.map((t) => (t._id === editingTable._id ? data : t)))
        setEditModalOpen(false)
        setEditingTable(null)
        showSuccess('Table updated successfully')
      }
    } catch {
      setError('Network error')
    } finally {
      setLoading(false)
    }
  }

  const handleDelete = async () => {
    if (!deleteConfirm) return
    setLoading(true)
    setError('')
    try {
      const res = await fetch(`/api/tables/${deleteConfirm}`, { method: 'DELETE' })
      if (!res.ok) {
        const data = await res.json()
        setError(data.error || 'Failed to delete table')
      } else {
        setTables((prev) => prev.filter((t) => t._id !== deleteConfirm))
        setDeleteConfirm(null)
        showSuccess('Table deleted successfully')
      }
    } catch {
      setError('Network error')
    } finally {
      setLoading(false)
    }
  }

  const openEdit = (table: Table) => {
    setEditingTable(table)
    setForm({
      tableNumber: table.tableNumber,
      capacity: table.capacity.toString(),
      status: table.status,
      location: table.location || '',
    })
    setEditModalOpen(true)
  }

  const handleGenerateQr = async (tableId: string) => {
    setLoading(true)
    try {
      const res = await fetch(`/api/tables/${tableId}/qr`)
      const data = await res.json()
      if (!res.ok) {
        setError(data.error || 'Failed to generate QR code')
      } else {
        setQrModal(data)
      }
    } catch {
      setError('Network error')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="space-y-6">
      {success && (
        <div className="bg-green-50 border border-green-200 text-green-700 px-4 py-3 rounded">
          {success}
        </div>
      )}
      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded">
          {error}
        </div>
      )}

      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Table Management</h1>
          <p className="text-gray-600 mt-1">Manage your restaurant tables</p>
        </div>
        <button
          onClick={() => setModalOpen(true)}
          className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors flex items-center gap-2"
        >
          <Plus size={20} />
          Add Table
        </button>
      </div>

      {/* Tables Grid */}
      {tables.length === 0 ? (
        <div className="bg-white rounded-lg shadow p-12 text-center">
          <Table2 className="w-16 h-16 mx-auto text-gray-400 mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">No tables configured</h3>
          <p className="text-gray-600 mb-4">Add tables to start managing your restaurant layout.</p>
          <button
            onClick={() => setModalOpen(true)}
            className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 transition-colors"
          >
            Add First Table
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          {tables.map((table) => (
            <div key={table._id} className="bg-white rounded-lg shadow p-6">
              <div className="flex justify-between items-start mb-4">
                <div>
                  <h3 className="text-xl font-bold text-gray-900">Table {table.tableNumber}</h3>
                  <p className="text-sm text-gray-600">Capacity: {table.capacity} people</p>
                </div>
                <span className={`px-2 py-1 text-xs font-medium rounded-full ${getStatusColor(table.status)}`}>
                  {table.status}
                </span>
              </div>
              
              {table.location && (
                <p className="text-sm text-gray-600 mb-3">Location: {table.location}</p>
              )}

              <div className="flex gap-2 mt-4">
                <button
                  onClick={() => handleGenerateQr(table._id)}
                  className="flex-1 bg-purple-50 text-purple-600 py-2 rounded hover:bg-purple-100 transition-colors text-sm flex items-center justify-center gap-1"
                >
                  <QrCode size={14} /> QR
                </button>
                <button
                  onClick={() => openEdit(table)}
                  className="flex-1 bg-blue-50 text-blue-600 py-2 rounded hover:bg-blue-100 transition-colors text-sm flex items-center justify-center gap-1"
                >
                  <Edit size={14} /> Edit
                </button>
                <button
                  onClick={() => setDeleteConfirm(table._id)}
                  className="flex-1 bg-red-50 text-red-600 py-2 rounded hover:bg-red-100 transition-colors text-sm flex items-center justify-center gap-1"
                >
                  <Trash2 size={14} /> Delete
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Create/Edit Modal */}
      {(modalOpen || editModalOpen) && (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-lg shadow-xl max-w-md w-full p-6">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-semibold text-gray-900">
                {editModalOpen ? 'Edit Table' : 'Add Table'}
              </h3>
              <button onClick={() => { editModalOpen ? setEditModalOpen(false) : setModalOpen(false) }}>
                <X size={20} />
              </button>
            </div>
            <form onSubmit={editModalOpen ? handleUpdate : handleCreate} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Table Number</label>
                <input
                  type="text"
                  required
                  value={form.tableNumber}
                  onChange={(e) => setForm({ ...form, tableNumber: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Capacity</label>
                <input
                  type="number"
                  min="1"
                  required
                  value={form.capacity}
                  onChange={(e) => setForm({ ...form, capacity: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Status</label>
                <select
                  value={form.status}
                  onChange={(e) => setForm({ ...form, status: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                >
                  <option value="available">Available</option>
                  <option value="occupied">Occupied</option>
                  <option value="reserved">Reserved</option>
                  <option value="cleaning">Cleaning</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Location</label>
                <input
                  type="text"
                  value={form.location}
                  onChange={(e) => setForm({ ...form, location: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="e.g., Indoor, Outdoor, Patio"
                />
              </div>
              <button
                type="submit"
                disabled={loading}
                className="w-full bg-blue-600 text-white py-2 rounded-lg hover:bg-blue-700 disabled:opacity-50 transition-colors"
              >
                {loading ? 'Saving...' : editModalOpen ? 'Update Table' : 'Create Table'}
              </button>
            </form>
          </div>
        </div>
      )}

      {/* Delete Confirm */}
      {deleteConfirm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-lg shadow-xl max-w-sm w-full p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-2">Delete Table?</h3>
            <p className="text-gray-600 mb-4">This action cannot be undone.</p>
            <div className="flex gap-3">
              <button
                onClick={() => setDeleteConfirm(null)}
                className="flex-1 bg-gray-100 text-gray-700 py-2 rounded-lg hover:bg-gray-200 transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleDelete}
                disabled={loading}
                className="flex-1 bg-red-600 text-white py-2 rounded-lg hover:bg-red-700 disabled:opacity-50 transition-colors"
              >
                {loading ? 'Deleting...' : 'Delete'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* QR Code Modal */}
      {qrModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-lg shadow-xl max-w-md w-full p-6">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-semibold text-gray-900">
                QR Code — Table {qrModal.tableNumber}
              </h3>
              <button onClick={() => setQrModal(null)}><X size={20} /></button>
            </div>
            <div className="text-center">
              <p className="text-sm text-gray-600 mb-3">
                Customers can scan this code to view the menu and place orders.
              </p>
              <img
                src={qrModal.qrCodeUrl}
                alt={`QR Code for Table ${qrModal.tableNumber}`}
                className="mx-auto mb-4 rounded-lg border border-gray-200"
                style={{ maxWidth: 300 }}
              />
              <p className="text-xs text-gray-500 mb-4 break-all">{qrModal.menuUrl}</p>
              <a
                href={qrModal.qrCodeUrl}
                download={`table-${qrModal.tableNumber}-qr.png`}
                className="inline-block bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors text-sm"
              >
                Download QR Code
              </a>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
