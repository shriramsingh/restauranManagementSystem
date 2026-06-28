'use client'

import { useState } from 'react'

interface Table {
  _id: string
  tableNumber: string
  capacity: number
  status: string
  location?: string
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

export default function StaffTableActions({ table: initialTable }: { table: Table }) {
  const [table, setTable] = useState<Table>(initialTable)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const handleStatusChange = async (newStatus: string) => {
    if (newStatus === table.status) return
    setLoading(true)
    setError('')

    try {
      const res = await fetch(`/api/tables/${table._id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: newStatus }),
      })

      const data = await res.json()

      if (!res.ok) {
        setError(data.error || 'Failed to update status')
      } else {
        setTable((prev) => ({ ...prev, status: newStatus }))
      }
    } catch (err) {
      setError('Network error. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="bg-white rounded-lg shadow p-6">
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

      <div className="mt-4">
        <select
          value={table.status}
          onChange={(e) => handleStatusChange(e.target.value)}
          disabled={loading}
          className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent disabled:opacity-50"
        >
          <option value="available">Available</option>
          <option value="occupied">Occupied</option>
          <option value="reserved">Reserved</option>
          <option value="cleaning">Cleaning</option>
        </select>
        {loading && <p className="text-sm text-gray-500 mt-1">Updating...</p>}
        {error && <p className="text-sm text-red-600 mt-1">{error}</p>}
      </div>
    </div>
  )
}
