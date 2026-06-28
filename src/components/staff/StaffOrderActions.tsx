'use client'

import { useState } from 'react'

interface Order {
  _id: string
  orderNumber: string
  status: string
  items: { quantity: number; name: string; total: number }[]
  orderType: string
  total: number
  createdAt: string
}

const statusFlow: Record<string, string> = {
  pending: 'confirmed',
  confirmed: 'preparing',
  preparing: 'ready',
  ready: 'served',
}

const statusLabel: Record<string, string> = {
  pending: 'Confirm Order',
  confirmed: 'Start Preparing',
  preparing: 'Mark Ready',
  ready: 'Mark Served',
}

const statusColor: Record<string, string> = {
  pending: 'bg-blue-600 hover:bg-blue-700',
  confirmed: 'bg-yellow-600 hover:bg-yellow-700',
  preparing: 'bg-green-600 hover:bg-green-700',
  ready: 'bg-purple-600 hover:bg-purple-700',
}

export default function StaffOrderActions({ order: initialOrder }: { order: Order }) {
  const [order, setOrder] = useState<Order>(initialOrder)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const nextStatus = statusFlow[order.status]

  const handleUpdate = async () => {
    if (!nextStatus) return
    setLoading(true)
    setError('')

    try {
      const res = await fetch(`/api/orders/${order._id}/status`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: nextStatus }),
      })

      const data = await res.json()

      if (!res.ok) {
        setError(data.error || 'Failed to update status')
      } else {
        setOrder((prev) => ({ ...prev, status: nextStatus }))
      }
    } catch (err) {
      setError('Network error. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed': return 'bg-green-100 text-green-800'
      case 'pending': return 'bg-yellow-100 text-yellow-800'
      case 'confirmed': return 'bg-blue-100 text-blue-800'
      case 'preparing': return 'bg-orange-100 text-orange-800'
      case 'ready': return 'bg-purple-100 text-purple-800'
      case 'cancelled': return 'bg-red-100 text-red-800'
      default: return 'bg-gray-100 text-gray-800'
    }
  }

  return (
    <div className="bg-white rounded-lg shadow p-6">
      <div className="flex justify-between items-start mb-4">
        <div>
          <h3 className="text-lg font-semibold text-gray-900">Order #{order.orderNumber}</h3>
          <p className="text-sm text-gray-500">
            {new Date(order.createdAt).toLocaleString()}
          </p>
        </div>
        <span className={`px-3 py-1 text-sm font-medium rounded-full ${getStatusColor(order.status)}`}>
          {order.status}
        </span>
      </div>

      <div className="border-t pt-4">
        <div className="space-y-2 mb-4">
          {order.items.map((item, idx) => (
            <div key={idx} className="flex justify-between text-sm">
              <span className="text-gray-700">
                {item.quantity}x {item.name}
              </span>
              <span className="text-gray-900 font-medium">
                ${item.total.toFixed(2)}
              </span>
            </div>
          ))}
        </div>

        <div className="border-t pt-3 flex justify-between items-center">
          <div className="text-sm text-gray-600">
            <span className="capitalize">{order.orderType.replace('_', ' ')}</span>
          </div>
          <div className="text-lg font-bold text-gray-900">
            ${order.total.toFixed(2)}
          </div>
        </div>

        {error && (
          <p className="text-red-600 text-sm mt-3">{error}</p>
        )}

        <div className="mt-4 flex gap-2">
          {nextStatus && (
            <button
              onClick={handleUpdate}
              disabled={loading}
              className={`flex-1 text-white py-2 rounded transition-colors disabled:opacity-50 ${statusColor[order.status] || 'bg-gray-600'}`}
            >
              {loading ? 'Updating...' : statusLabel[order.status]}
            </button>
          )}
          {order.status === 'served' && (
            <span className="flex-1 text-center py-2 bg-green-100 text-green-800 rounded text-sm font-medium">
              Order Complete
            </span>
          )}
        </div>
      </div>
    </div>
  )
}
