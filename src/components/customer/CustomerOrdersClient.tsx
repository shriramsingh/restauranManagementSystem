'use client'

import { useRouter } from 'next/navigation'
import { useState, useMemo } from 'react'
import useSWR from 'swr'
import {
  ShoppingCart,
  Clock,
  CheckCircle,
  Truck,
  UtensilsCrossed,
  Package,
  XCircle,
  Bike,
  Loader,
  Search,
} from 'lucide-react'
import FormattedDate from './FormattedDate'
import ReorderButton from './ReorderButton'

interface OrderItem {
  menuItemId: string
  name: string
  quantity: number
  price: number
  total: number
}

interface Order {
  _id: string
  orderNumber: string
  status: string
  orderType: 'dine_in' | 'takeaway' | 'delivery'
  total: number
  items: OrderItem[]
  createdAt: string
  currency: string
}

const fetcher = (url: string) => fetch(url).then((res) => res.json())

const statusConfig: Record<string, { icon: any; color: string; bg: string; label: string }> = {
  pending: { icon: Clock, color: 'text-yellow-600', bg: 'bg-yellow-50', label: 'Order Received' },
  confirmed: { icon: CheckCircle, color: 'text-blue-600', bg: 'bg-blue-50', label: 'Confirmed' },
  preparing: { icon: UtensilsCrossed, color: 'text-orange-600', bg: 'bg-orange-50', label: 'Preparing' },
  ready: { icon: Package, color: 'text-purple-600', bg: 'bg-purple-50', label: 'Ready for Pickup' },
  served: { icon: UtensilsCrossed, color: 'text-green-600', bg: 'bg-green-50', label: 'Served' },
  completed: { icon: CheckCircle, color: 'text-green-600', bg: 'bg-green-50', label: 'Completed' },
  cancelled: { icon: XCircle, color: 'text-red-600', bg: 'bg-red-50', label: 'Cancelled' },
  out_for_delivery: { icon: Bike, color: 'text-blue-600', bg: 'bg-blue-50', label: 'Out for Delivery' },
  delivered: { icon: Truck, color: 'text-green-600', bg: 'bg-green-50', label: 'Delivered' },
}

const orderTypeStatusFlows = {
  dine_in: {
    steps: ['pending', 'confirmed', 'preparing', 'served', 'completed'],
    labels: ['Received', 'Confirmed', 'Preparing', 'Served', 'Completed'],
  },
  takeaway: {
    steps: ['pending', 'confirmed', 'preparing', 'ready', 'completed'],
    labels: ['Received', 'Confirmed', 'Preparing', 'Ready', 'Collected'],
  },
  delivery: {
    steps: ['pending', 'confirmed', 'preparing', 'out_for_delivery', 'delivered'],
    labels: ['Received', 'Confirmed', 'Preparing', 'On its way', 'Delivered'],
  },
}

const statusOptions = [
  'all',
  'pending',
  'confirmed',
  'preparing',
  'ready',
  'served',
  'completed',
  'cancelled',
  'out_for_delivery',
  'delivered',
]

export default function CustomerOrdersClient({ initialOrders }: { initialOrders: Order[] }) {
  const router = useRouter()
  const [searchTerm, setSearchTerm] = useState('')
  const [statusFilter, setStatusFilter] = useState('all')

  const { data: orders, error } = useSWR<Order[]>('/api/customer/orders', fetcher, {
    refreshInterval: 5000,
    fallbackData: initialOrders,
  })

  const filteredOrders = useMemo(() => {
    if (!orders) return []
    return orders.filter((order) => {
      const matchesSearch =
        order.orderNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
        order.items.some((item) => item.name.toLowerCase().includes(searchTerm.toLowerCase()))
      const matchesStatus = statusFilter === 'all' || order.status === statusFilter
      return matchesSearch && matchesStatus
    })
  }, [orders, searchTerm, statusFilter])

  const handleOrderClick = (orderId: string) => {
    router.push(`/customer/orders/${orderId}`)
  }

  if (error) {
    return <div className="p-8 text-red-500">Failed to load orders. Please try again later.</div>
  }

  if (!orders) {
    return (
      <div className="flex justify-center items-center p-12">
        <Loader className="w-16 h-16 animate-spin text-blue-600" />
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-gray-900">My Orders</h1>
        <p className="text-gray-600 mt-1">Track your order history and status in real-time.</p>
      </div>

      <div className="flex flex-col md:flex-row gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
          <input
            type="text"
            placeholder="Search by order # or item..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500"
          />
        </div>
        <select
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
          className="border border-gray-300 rounded-lg px-4 py-2 focus:ring-blue-500 focus:border-blue-500"
        >
          {statusOptions.map((status) => (
            <option key={status} value={status}>
              {status.charAt(0).toUpperCase() + status.slice(1).replace(/_/g, ' ')}
            </option>
          ))}
        </select>
      </div>

      {filteredOrders.length === 0 ? (
        <div className="bg-white rounded-lg shadow p-12 text-center">
          <ShoppingCart className="w-16 h-16 mx-auto text-gray-400 mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">
            {orders.length > 0 ? 'No matching orders found' : 'No orders yet'}
          </h3>
          <p className="text-gray-600 mb-4">
            {orders.length > 0
              ? 'Try adjusting your search or filter.'
              : 'Browse our menu and place your first order!'}
          </p>
          {orders.length === 0 && (
            <a
              href="/customer/menu"
              className="inline-block bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 transition-colors"
            >
              Browse Menu
            </a>
          )}
        </div>
      ) : (
        <div className="space-y-6">
          {filteredOrders.map((order) => {
            const config = statusConfig[order.status] || statusConfig.pending
            const Icon = config.icon
            
            const flow = orderTypeStatusFlows[order.orderType as keyof typeof orderTypeStatusFlows] || orderTypeStatusFlows.dine_in
            
            let effectiveStatus = order.status;
            if (order.orderType === 'dine_in' && order.status === 'ready') {
              effectiveStatus = 'preparing';
            }

            let currentStep = flow.steps.indexOf(effectiveStatus)
            const isCancelled = order.status === 'cancelled'

            if (order.status === 'completed' && currentStep === -1) {
              currentStep = flow.steps.length - 1;
            }

            const canReorder = order.status === 'completed' || order.status === 'cancelled'

            return (
              <div 
                key={order._id} 
                className="bg-white rounded-lg shadow p-6 transition-shadow"
                onClick={!canReorder ? () => handleOrderClick(order._id) : undefined}
              >
                <div 
                  className={canReorder ? 'cursor-pointer' : ''}
                  onClick={canReorder ? () => handleOrderClick(order._id) : undefined}
                >
                  <div className="flex justify-between items-start mb-4">
                    <div>
                      <h3 className="text-lg font-semibold text-gray-900">Order #{order.orderNumber}</h3>
                      <p className="text-sm text-gray-500">
                        <FormattedDate date={order.createdAt} /> &middot;{' '}
                        <span className="capitalize">{order.orderType.replace('_', ' ')}</span>
                      </p>
                    </div>
                    <div className={`flex items-center gap-2 px-3 py-1 rounded-full ${config.bg}`}>
                      <Icon size={16} className={config.color} />
                      <span className={`text-sm font-medium ${config.color}`}>{config.label}</span>
                    </div>
                  </div>

                  {!isCancelled && (
                    <div className="mb-6">
                      <div className="flex items-center gap-1">
                        {flow.steps.map((step, idx) => {
                          const isCompleted = idx <= currentStep
                          const isCurrent = idx === currentStep
                          return (
                            <div key={step} className="flex-1 flex items-center">
                              <div
                                className={`w-3 h-3 rounded-full ${
                                  isCompleted ? 'bg-blue-600' : 'bg-gray-300'
                                } ${isCurrent ? 'ring-2 ring-blue-300' : ''}`}
                              />
                              {idx < flow.steps.length - 1 && (
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
                        {flow.labels.map((label) => (
                          <span key={label}>{label}</span>
                        ))}
                      </div>
                    </div>
                  )}

                  <div className="border-t border-gray-200 pt-4">
                    <div className="space-y-2">
                      {order.items.map((item, idx) => (
                        <div key={idx} className="flex justify-between text-sm">
                          <span className="text-gray-700">
                            {item.quantity}x {item.name}
                          </span>
                          <span className="text-gray-900 font-medium">{order.currency}{item.total.toFixed(2)}</span>
                        </div>
                      ))}
                    </div>
                    <div className="border-t border-gray-200 mt-3 pt-3 flex justify-between">
                      <span className="font-semibold text-gray-900">Total</span>
                      <span className="font-bold text-blue-600 text-lg">{order.currency}{order.total.toFixed(2)}</span>
                    </div>
                  </div>
                </div>

                {canReorder && (
                  <div 
                    className="mt-4 pt-4 border-t border-gray-200 text-right"
                    onClick={(e) => e.stopPropagation()}
                  >
                    <ReorderButton items={order.items} currency={order.currency} />
                  </div>
                )}
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}
