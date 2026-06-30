import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import connectDB from '@/lib/mongodb'
import Order from '@/models/Order'
import Restaurant from '@/models/Restaurant'

export async function GET() {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user?.id) {
      return NextResponse.json({ message: 'Unauthorized' }, { status: 401 })
    }

    await connectDB()
    const orders = await Order.find({ customerId: session.user.id })
      .populate({
          path: 'restaurantId',
          select: 'settings.currency',
          model: Restaurant
      })
      .sort({ createdAt: -1 })
      .limit(100)
      .lean()

    const formattedOrders = orders.map((o: any) => ({
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
    }))

    return NextResponse.json(formattedOrders)
  } catch (error) {
    console.error('Error fetching customer orders:', error)
    return NextResponse.json({ message: 'Internal Server Error' }, { status: 500 })
  }
}
