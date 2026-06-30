'use client'

import { useState } from 'react'
import { ShoppingCart, X, Eye, CheckCircle, XCircle, Filter } from 'lucide-react'

interface OrderItem {
  menuItemId: string
  name: string
  quantity: number
  price: number
  total: number
  specialInstructions?: string
}

interface Order {
  _id: string
  orderNumber: string
  orderType: string
  status: string
  paymentStatus: string
  paymentMethod?: string
  total: number
  subtotal: number
  tax: number
  discount: number
  items: OrderItem[]
  notes?: string
  customerName?: string
  customerPhone?: string
  createdAt: string
}

const statusFlow: Record<string, string[]> = {
  pending: ['confirmed', 'cancelled'],
  confirmed: ['preparing', 'cancelled'],
  preparing: ['ready', 'cancelled'],
  ready: ['served', 'cancelled'],
  served: ['completed'],
  completed: [],
  cancelled: [],
}

const statusColors: Record<string, string> = {
  pending: 'bg-yellow-100 text-yellow-800',
  confirmed: 'bg-blue-100 text-blue-800',
  preparing: 'bg-orange-100 text-orange-800',
  ready: 'bg-purple-100 text-purple-800',
  served: 'bg-green-100 text-green-800',
  completed: 'bg-green-100 text-green-800',
  cancelled: 'bg-red-100 text-red-800',
}

const paymentStatusColors: Record<string, string> = {
  pending: 'bg-yellow-100 text-yellow-800',
  paid: 'bg-green-100 text-green-800',
  refunded: 'bg-ray-100 text-gray-800',
  failed: 'bg-red-100 text-red-800',
}

export default function OwnerOrdersClient({ initialOrders, currency }: { initialOrders: Order[], currency: string }) {
  const [orders, setOrders] = useState<Order[]>(initialOrders)
  const [filterStatus, setFilterStatus] = useState('')
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')

  const showSuccess = (msg: string) => {
    setSuccess(msg)
    setTimeout(() => setSuccess(''), 3000)
  }

  const filteredOrders = filterStatus
    ? orders.filter((o) => o.status === filterStatus)
    : orders

  const handleStatusUpdate = async (orderId: string, newStatus: string) => {
    setLoading(true)
    setError('')
    try {
      const res = await fetch(`/api/orders/${orderId}/status`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: newStatus }),
      })
      const data = await res.json()
      if (!res.ok) {
        setError(data.error || 'Failed to update status')
      } else {
        setOrders((prev) => prev.map((o) => (o._id === orderId ? { ...o, status: newStatus } : o)))
        if (selectedOrder && selectedOrder._id === orderId) {
          setSelectedOrder({ ...selectedOrder, status: newStatus })
        }
        showSuccess(`Order status updated to ${newStatus}`)
      }
    } catch {
      setError('Network error')
    } finally {
      setLoading(false)
    }
  }

  const handlePaymentUpdate = async (orderId: string, newPaymentStatus: string) => {
    setLoading(true)
    setError('')
    try {
      const res = await fetch(`/api/orders/${orderId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ paymentStatus: newPaymentStatus }),
      })
      const data = await res.json()
      if (!res.ok) {
        setError(data.error || 'Failed to update payment')
      } else {
        setOrders((prev) => prev.map((o) => (o._id === orderId ? { ...o, paymentStatus: newPaymentStatus } : o)))
        if (selectedOrder && selectedOrder._id === orderId) {
          setSelectedOrder({ ...selectedOrder, paymentStatus: newPaymentStatus })
        }
        showSuccess(`Payment status updated to ${newPaymentStatus}`)
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
      <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Order Management</h1>
          <p className="text-gray-600 mt-1">View and manage all orders</p>
        </div>
        <div className="flex items-center gap-2">
          <Filter size={18} className="text-gray-500" />
          <select
            value={filterStatus}
            onChange={(e) => setFilterStatus(e.target.value)}
            className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm"
          >
            <option value="">All Statuses</option>
            <option value="pending">Pending</option>
            <option value="confirmed">Confirmed</option>
            <option value="preparing">Preparing</option>
            <option value="ready">Ready</option>
            <option value="served">Served</option>
            <option value="completed">Completed</option>
            <option value="cancelled">Cancelled</option>
          </select>
        </div>
      </div>

      {/* Orders List */}
      {filteredOrders.length === 0 ? (
        <div className="bg-white rounded-lg shadow p-12 text-center">
          <ShoppingCart className="w-16 h-16 mx-auto text-gray-400 mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">
            {filterStatus ? 'No orders with this status' : 'No orders yet'}
          </h3>
          <p className="text-gray-600">
            {filterStatus ? 'Try a different filter.' : 'Orders will appear here when customers place them.'}
          </p>
        </div>
      ) : (
        <div className="bg-white rounded-lg shadow overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Order #</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Type</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Total</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Payment</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Date</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Actions</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {filteredOrders.map((order) => (
                  <tr key={order._id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                      #{order.orderNumber}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 capitalize">
                      {order.orderType.replace('_', ' ')}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`px-2 py-1 text-xs font-medium rounded-full ${statusColors[order.status] || 'bg-gray-100 text-gray-800'}`}>
                        {order.status}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {currency}{order.total.toFixed(2)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`px-2 py-1 text-xs font-medium rounded-full ${paymentStatusColors[order.paymentStatus] || 'bg-gray-100 text-gray-800'}`}>
                        {order.paymentStatus}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {new Date(order.createdAt).toLocaleDateString()}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                      <button
                        onClick={() => setSelectedOrder(order)}
                        className="text-blue-600 hover:text-blue-900 flex items-center gap-1"
                      >
                        <Eye size={16} /> View
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Order Detail Modal */}
      {selectedOrder && (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6 border-b border-gray-200 flex justify-between items-center">
              <div>
                <h3 className="text-xl font-semibold text-gray-900">Order #{selectedOrder.orderNumber}</h3>
                <p className="text-sm text-gray-500">
                  {new Date(selectedOrder.createdAt).toLocaleString()}
                </p>
              </div>
              <button
                onClick={() => setSelectedOrder(null)}
                className="p-1 hover:bg-gray-100 rounded"
              >
                <X size={20} />
              </button>
            </div>

            <div className="p-6 space-y-6">
              {/* Customer Info */}
              {(selectedOrder.customerName || selectedOrder.customerPhone) && (
                <div className="bg-gray-50 p-4 rounded-lg">
                  <h4 className="text-sm font-medium text-gray-700 mb-2">Customer</h4>
                  {selectedOrder.customerName && <p className="text-sm text-gray-900">{selectedOrder.customerName}</p>}
                  {selectedOrder.customerPhone && <p className="text-sm text-gray-600">{selectedOrder.customerPhone}</p>}
                </div>
              )}

              {/* Order Items */}
              <div>
                <h4 className="text-sm font-medium text-gray-700 mb-2">Items</h4>
                <div className="space-y-2">
                  {selectedOrder.items.map((item, idx) => (
                    <div key={idx} className="flex justify-between items-center p-3 border border-gray-200 rounded-lg">
                      <div>
                        <p className="font-medium text-gray-900">{item.name}</p>
                        <p className="text-sm text-gray-600">{item.quantity} x {currency}{item.price.toFixed(2)}</p>
                        {item.specialInstructions && (
                          <p className="text-xs text-gray-500 mt-1">Note: {item.specialInstructions}</p>
                        )}
                      </div>
                      <p className="font-medium text-gray-900">{currency}{item.total.toFixed(2)}</p>
                    </div>
                  ))}
                </div>
              </div>

              {/* Order Totals */}
              <div className="bg-gray-50 p-4 rounded-lg space-y-2">
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">Subtotal</span>
                  <span className="text-gray-900">{currency}{selectedOrder.subtotal.toFixed(2)}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">Tax</span>
                  <span className="text-gray-900">{currency}{(selectedOrder.tax || 0).toFixed(2)}</span>
                </div>
                {selectedOrder.discount > 0 && (
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-600">Discount</span>
                    <span className="text-green-600">-{currency}{selectedOrder.discount.toFixed(2)}</span>
                  </div>
                )}
                <div className="flex justify-between text-lg font-bold border-t border-gray-200 pt-2">
                  <span className="text-gray-900">Total</span>
                  <span className="text-gray-900">{currency}{selectedOrder.total.toFixed(2)}</span>
                </div>
              </div>

              {selectedOrder.notes && (
                <div className="bg-yellow-50 p-4 rounded-lg">
                  <h4 className="text-sm font-medium text-gray-700 mb-1">Special Instructions</h4>
                  <p className="text-sm text-gray-600">{selectedOrder.notes}</p>
                </div>
              )}

              {/* Status Actions */}
              <div>
                <h4 className="text-sm font-medium text-gray-700 mb-2">Update Status</h4>
                <div className="flex flex-wrap gap-2">
                  {statusFlow[selectedOrder.status]?.map((nextStatus) => (
                    <button
                      key={nextStatus}
                      onClick={() => handleStatusUpdate(selectedOrder._id, nextStatus)}
                      disabled={loading}
                      className={`px-3 py-2 rounded-lg text-sm font-medium transition-colors disabled:opacity-50 ${
                        nextStatus === 'cancelled'
                          ? 'bg-red-100 text-red-700 hover:bg-red-200'
                          : 'bg-blue-100 text-blue-700 hover:bg-blue-200'
                      }`}
                    >
                      {nextStatus === 'cancelled' ? (
                        <span className="flex items-center gap-1"><XCircle size={14} /> Cancel</span>
                      ) : (
                        <span className="flex items-center gap-1"><CheckCircle size={14} /> Mark {nextStatus}</span>
                      )}
                    </button>
                  ))}
                  {statusFlow[selectedOrder.status]?.length === 0 && (
                    <p className="text-sm text-gray-500">No further actions available</p>
                  )}
                </div>
              </div>

              {/* Payment Actions */}
              <div>
                <h4 className="text-sm font-medium text-gray-700 mb-2">Update Payment</h4>
                <div className="flex flex-wrap gap-2">
                  {selectedOrder.paymentStatus !== 'paid' && (
                    <button
                      onClick={() => handlePaymentUpdate(selectedOrder._id, 'paid')}
                      disabled={loading}
                      className="px-3 py-2 bg-green-100 text-green-700 rounded-lg text-sm font-medium hover:bg-green-200 transition-colors disabled:opacity-50"
                    >
                      Mark as Paid
                    </button>
                  )}
                  {selectedOrder.paymentStatus === 'paid' && (
                    <button
                      onClick={() => handlePaymentUpdate(selectedOrder._id, 'refunded')}
                      disabled={loading}
                      className="px-3 py-2 bg-gray-100 text-gray-700 rounded-lg text-sm font-medium hover:bg-gray-200 transition-colors disabled:opacity-50"
                    >
                      Mark as Refunded
                    </button>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
