import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import connectDB from '@/lib/mongodb'
import Order from '@/models/Order'
import { ShoppingCart } from 'lucide-react'
import StaffOrderActions from '@/components/staff/StaffOrderActions'
import AutoRefresh from '@/components/AutoRefresh'
import { getRestaurantIdForOwner } from '@/lib/get-restaurant-id'

async function getStaffOrders(restaurantId: string) {
  await connectDB()
  const orders = await Order.find({ restaurantId })
    .sort({ createdAt: -1 })
    .limit(50)
  return orders
}

export default async function StaffOrders() {
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

  const orders = await getStaffOrders(restaurantId)

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-gray-900">Order Management</h1>
        <p className="text-gray-600 mt-1">Process and manage customer orders</p>
      </div>

      <AutoRefresh intervalMs={30000}>
        {/* Orders List */}
        {orders.length === 0 ? (
          <div className="bg-white rounded-lg shadow p-12 text-center">
            <ShoppingCart className="w-16 h-16 mx-auto text-gray-400 mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">No orders yet</h3>
            <p className="text-gray-600">Orders will appear here when customers place them.</p>
          </div>
        ) : (
          <div className="space-y-4">
            {orders.map((order: any) => (
              <StaffOrderActions
                key={order._id.toString()}
                order={{
                  _id: order._id.toString(),
                  orderNumber: order.orderNumber,
                  status: order.status,
                  items: order.items.map((item: any) => ({
                    quantity: item.quantity,
                    name: item.name,
                    total: item.total,
                  })),
                  orderType: order.orderType,
                  total: order.total,
                  createdAt: order.createdAt.toISOString(),
                }}
              />
            ))}
          </div>
        )}
      </AutoRefresh>
    </div>
  )
}