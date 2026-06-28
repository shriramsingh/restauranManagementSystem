import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import connectDB from '@/lib/mongodb'
import Order from '@/models/Order'
import OwnerOrdersClient from '@/components/owner/OwnerOrdersClient'

async function getRestaurantOrders(restaurantId: string) {
  await connectDB()
  const orders = await Order.find({ restaurantId })
    .sort({ createdAt: -1 })
    .limit(100)
  return orders
}

export default async function OwnerOrders() {
  const session = await getServerSession(authOptions)

  if (!session?.user?.restaurantId) {
    return <div>No restaurant assigned</div>
  }

  const orders = await getRestaurantOrders(session.user.restaurantId)

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
    />
  )
}