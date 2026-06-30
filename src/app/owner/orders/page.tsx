import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import connectDB from '@/lib/mongodb'
import Order from '@/models/Order'
import Restaurant from '@/models/Restaurant'
import OwnerOrdersClient from '@/components/owner/OwnerOrdersClient'
import { getRestaurantIdForOwner } from '@/lib/get-restaurant-id'
import { unstable_noStore as noStore } from 'next/cache'

async function getRestaurantOrders(restaurantId: string) {
  await connectDB()
  const orders = await Order.find({ restaurantId })
    .sort({ createdAt: -1 })
    .limit(100)
    .lean()
  return orders
}

async function getRestaurantCurrency(restaurantId: string) {
  const restaurant = await Restaurant.findById(restaurantId).select('settings.currency').lean()
  return restaurant?.settings?.currency || 'USD'
}

export default async function OwnerOrders() {
  noStore();
  const session = await getServerSession(authOptions)
  const restaurantId = await getRestaurantIdForOwner()

  if (!restaurantId) {
    return (
      <div className="bg-white rounded-lg shadow p-12 text-center">
        <h3 className="text-lg font-medium text-gray-900 mb-2">No restaurant assigned</h3>
        <p className="text-gray-600 mb-4">Please log out and log back in to refresh your session.</p>
      </div>
    )
  }

  const [orders, currency] = await Promise.all([
    getRestaurantOrders(restaurantId),
    getRestaurantCurrency(restaurantId),
  ])

  return (
    <OwnerOrdersClient
      initialOrders={orders.map((o: any) => ({
        _id: o._id.toString(),
        orderNumber: o.orderNumber,
        orderType: o.orderType,
        status: o.status,
        paymentStatus: o.paymentStatus,
        paymentMethod: o.paymentMethod || '',
        total: o.total,
        subtotal: o.subtotal,
        tax: o.tax || 0,
        discount: o.discount || 0,
        items: o.items.map((item: any) => ({
          menuItemId: item.menuItemId?.toString() || item.menuItemId,
          name: item.name,
          quantity: item.quantity,
          price: item.price,
          total: item.total,
          specialInstructions: item.specialInstructions || '',
        })),
        notes: o.notes || '',
        customerName: o.customerName || '',
        customerPhone: o.customerPhone || '',
        createdAt: o.createdAt.toISOString(),
      }))}
      currency={currency}
    />
  )
}