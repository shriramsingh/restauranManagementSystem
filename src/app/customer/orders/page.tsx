import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import connectDB from '@/lib/mongodb'
import Order from '@/models/Order'
import CustomerOrdersClient from '@/components/customer/CustomerOrdersClient'
import Restaurant from '@/models/Restaurant'

export const revalidate = 0;

async function getCustomerOrders(customerId: string) {
  await connectDB()
  const orders = await Order.find({ customerId })
    .populate({
        path: 'restaurantId',
        select: 'settings.currency',
        model: Restaurant
    })
    .sort({ createdAt: -1 })
    .limit(100)
    .lean()
  return orders
}

export default async function CustomerOrdersPage() {
  const session = await getServerSession(authOptions)
  if (!session?.user?.id) {
    return <div className="p-8">Please sign in</div>
  }

  const orders = await getCustomerOrders(session.user.id)

  return (
    <CustomerOrdersClient
      orders={orders.map((o: any) => ({
        _id: o._id.toString(),
        orderNumber: o.orderNumber,
        status: o.status,
        orderType: o.orderType,
        total: o.total,
        currency: o.restaurantId?.settings?.currency || '₹',
        items: o.items.map((item: any) => ({
          menuItemId: item.menuItemId.toString(),
          name: item.name,
          quantity: item.quantity,
          price: item.price,
          total: item.total,
        })),
        createdAt: o.createdAt.toISOString(),
      }))}
    />
  )
}
