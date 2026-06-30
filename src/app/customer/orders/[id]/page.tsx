import { getServerSession } from 'next-auth'
import { notFound } from 'next/navigation'
import { authOptions } from '@/lib/auth'
import connectDB from '@/lib/mongodb'
import Order from '@/models/Order'
import Restaurant from '@/models/Restaurant'
import FormattedDate from '@/components/customer/FormattedDate'
import {
  Clock,
  CheckCircle,
  UtensilsCrossed,
  Package,
  XCircle,
  Bike,
  Truck,
} from 'lucide-react'

import ReorderButton from '@/components/customer/ReorderButton'

// It's recommended to move these configs to a shared file (e.g., in /lib) if they are used in multiple places.
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

async function getOrderDetails(orderId: string, customerId: string, restaurantId: string) {
  await connectDB()
  
  const order = await Order.findOne({ 
    _id: orderId, 
    customerId 
  }).lean()

  if (!order) {
    return null
  }

  const restaurant = await Restaurant.findById(restaurantId).select('settings.currency').lean();

  return {
    order: JSON.parse(JSON.stringify(order)), // Serialize to plain object
    currency: restaurant?.settings?.currency || '$',
  }
}

export default async function OrderDetailsPage({ params }: { params: { id: string } }) {
  const session = await getServerSession(authOptions)
  
  if (!session?.user?.id) {
    // This should ideally be handled by the layout, but as a safeguard:
    return notFound()
  }

  const data = await getOrderDetails(params.id, session.user.id, session.user.restaurantId)

  if (!data) {
    return notFound()
  }

  const { order, currency } = data
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
  
  const canReorder = order.status === 'completed' || order.status === 'cancelled';

  return (
    <div className="bg-white rounded-lg shadow-lg p-6 md:p-8 max-w-4xl mx-auto">
      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-start mb-6">
        <div>
          <h1 className="text-2xl md:text-3xl font-bold text-gray-900">Order #{order.orderNumber}</h1>
          <p className="text-sm text-gray-500 mt-1">
            <FormattedDate date={order.createdAt} /> &middot;{' '}
            <span className="capitalize">{order.orderType.replace('_', ' ')}</span>
          </p>
        </div>
        <div className={`flex items-center gap-2 px-3 py-1 rounded-full ${config.bg} mt-4 md:mt-0`}>
          <Icon size={16} className={config.color} />
          <span className={`text-sm font-medium ${config.color}`}>{config.label}</span>
        </div>
      </div>

      {/* Progress Tracker */}
      {!isCancelled && (
        <div className="mb-8">
          <h2 className="text-lg font-semibold text-gray-800 mb-3">Order Status</h2>
          <div className="flex items-center gap-1">
            {flow.steps.map((step, idx) => (
              <div key={step} className="flex-1 flex items-center">
                <div
                  className={`w-3 h-3 rounded-full ${
                    idx <= currentStep ? 'bg-blue-600' : 'bg-gray-300'
                  } ${idx === currentStep ? 'ring-2 ring-blue-300' : ''}`}
                />
                {idx < flow.steps.length - 1 && (
                  <div
                    className={`flex-1 h-1 mx-1 ${
                      idx < currentStep ? 'bg-blue-600' : 'bg-gray-200'
                    }`}
                  />
                )}
              </div>
            ))}
          </div>
          <div className="flex justify-between mt-2 text-xs text-gray-500 px-1">
            {flow.labels.map((label) => (
              <span key={label} className="flex-1 text-center">{label}</span>
            ))}
          </div>
        </div>
      )}

      {/* Order Items */}
      <div className="mb-8">
        <h2 className="text-lg font-semibold text-gray-800 mb-3">Order Summary</h2>
        <div className="divide-y divide-gray-200 border border-gray-200 rounded-lg">
          {order.items.map((item: any, idx: number) => (
            <div key={idx} className="flex justify-between items-center p-4">
              <div>
                <p className="font-medium text-gray-800">{item.name}</p>
                <p className="text-sm text-gray-600">
                  {item.quantity} x {currency}{item.price.toFixed(2)}
                </p>
              </div>
              <p className="text-gray-900 font-semibold">{currency}{item.total.toFixed(2)}</p>
            </div>
          ))}
          <div className="flex justify-between items-center p-4 bg-gray-50">
            <span className="font-semibold text-gray-900 text-lg">Total</span>
            <span className="font-bold text-blue-600 text-xl">{currency}{order.total.toFixed(2)}</span>
          </div>
        </div>
      </div>
      
      {/* Re-order button */}
      {canReorder && (
        <div className="mt-6 text-center">
          <ReorderButton items={order.items} currency={currency} />
        </div>
      )}
    </div>
  )
}
