'use client'

import {
  ShoppingCart,
  Clock,
  CheckCircle,
  Truck,
  UtensilsCrossed,
  Package,
  XCircle,
} from 'lucide-react'

interface OrderItem {
  name: string
  quantity: number
  price: number
  total: number
}

interface Order {
  _id: string
  orderNumber: string
  status: string
  orderType: string
  total: number
  items: OrderItem[]
  createdAt: string
}

const statusConfig: Record<string, { icon: any; color: string; bg: string; label: string }> = {
  pending: { icon: Clock, color: 'text-yellow-600', bg: 'bg-yellow-50', label: 'Order Received' },
  confirmed: { icon: CheckCircle, color: 'text-blue-600', bg: 'bg-blue-50', label: 'Confirmed' },
  preparing: { icon: UtensilsCrossed, color: 'text-orange-600', bg: 'bg-orange-50', label: 'Preparing' },
  ready: { icon: Package, color: 'text-purple-600', bg: 'bg-purple-50', label: 'Ready for Pickup' },
  served: { icon: Truck, color: 'text-green-600', bg: 'bg-green-50', label: 'Served' },
  completed: { icon: CheckCircle, color: 'text-green-600', bg: 'bg-green-50', label: 'Completed' },
  cancelled: { icon: XCircle, color: 'text-red-600', bg: 'bg-red-50', label: 'Cancelled' },
}

const statusSteps = ['pending', 'confirmed', 'preparing', 'ready', 'served', 'completed']

export default function CustomerOrdersClient({ orders }: { orders: Order[] }) {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-gray-900">My Orders</h1>
        <p className="text-gray-600 mt-1">Track your order history and status</p>
      </div>

      {orders.length === 0 ? (
        <div className="bg-white rounded-lg shadow p-12 text-center">
          <ShoppingCart className="w-16 h-16 mx-auto text-gray-400 mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">No orders yet</h3>
          <p className="text-gray-600 mb-4">Browse our menu and place your first order!</p>
          <a
            href="/customer/menu"
            className="inline-block bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 transition-colors"
          >
            Browse Menu
          </a>
        </div>
      ) : (
        <div className="space-y-6">
          {orders.map((order) => {
            const config = statusConfig[order.status] || statusConfig.pending
            const Icon = config.icon
            const currentStep = statusSteps.indexOf(order.status)
            const isCancelled = order.status === 'cancelled'

            return (
              <div key={order._id} className="bg-white rounded-lg shadow p-6">
                {/* Order Header */}
                <div className="flex justify-between items-start mb-4">
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900">Order #{order.orderNumber}</h3>
                    <p className="text-sm text-gray-500">
                      {new Date(order.createdAt).toLocaleString()} &middot;{' '}
                      <span className="capitalize">{order.orderType.replace('_', ' ')}</span>
                    </p>
                  </div>
                  <div className={`flex items-center gap-2 px-3 py-1 rounded-full ${config.bg}`}>
                    <Icon size={16} className={config.color} />
                    <span className={`text-sm font-medium ${config.color}`}>{config.label}</span>
                  </div>
                </div>

                {/* Progress Tracker */}
                {!isCancelled && (
                  <div className="mb-6">
                    <div className="flex items-center gap-1">
                      {statusSteps.slice(0, 5).map((step, idx) => {
                        const isCompleted = idx <= currentStep
                        const isCurrent = idx === currentStep
                        return (
                          <div key={step} className="flex-1 flex items-center">
                            <div
                              className={`w-3 h-3 rounded-full ${
                                isCompleted ? 'bg-blue-600' : 'bg-gray-300'
                              } ${isCurrent ? 'ring-2 ring-blue-300' : ''}`}
                            />
                            {idx < 4 && (
                              <div
                                className={`flex-1 h-1 mx-1 ${
                                  idx < currentStep ? 'bg-blue-600' : 'bg-gray-200'
                                }`}
                              />
                            )}
                          </div>
                        )
                      })}
                    </div>
                    <div className="flex justify-between mt-1 text-xs text-gray-500">
                      <span>Received</span>
                      <span>Preparing</span>
                      <span>Ready</span>
                      <span>Served</span>
                      <span>Done</span>
                    </div>
                  </div>
                )}

                {/* Order Items */}
                <div className="border-t border-gray-200 pt-4">
                  <div className="space-y-2">
                    {order.items.map((item, idx) => (
                      <div key={idx} className="flex justify-between text-sm">
                        <span className="text-gray-700">
                          {item.quantity}x {item.name}
                        </span>
                        <span className="text-gray-900 font-medium">${item.total.toFixed(2)}</span>
                      </div>
                    ))}
                  </div>
                  <div className="border-t border-gray-200 mt-3 pt-3 flex justify-between">
                    <span className="font-semibold text-gray-900">Total</span>
                    <span className="font-bold text-blue-600 text-lg">${order.total.toFixed(2)}</span>
                  </div>
                </div>
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}
