import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import connectDB from '@/lib/mongodb'
import Order from '@/models/Order'
import { UpdateOrderStatusSchema } from '@/lib/validation'

// PATCH /api/orders/[id]/status — Update order status only
export async function PATCH(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    await connectDB()
    const session = await getServerSession(authOptions)
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await request.json()
    const validation = UpdateOrderStatusSchema.safeParse(body)
    if (!validation.success) {
      return NextResponse.json(
        { error: 'Validation failed', details: validation.error.flatten() },
        { status: 400 }
      )
    }

    const order = await Order.findById(params.id)
    if (!order) {
      return NextResponse.json({ error: 'Order not found' }, { status: 404 })
    }

    // Role-based access: owner, staff, or admin can update status
    if (
      session.user.role !== 'super_admin' &&
      order.restaurantId?.toString() !== session.user.restaurantId
    ) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
    }

    const updateData: any = { status: validation.data.status }
    if (validation.data.preparedBy) updateData.preparedBy = validation.data.preparedBy
    if (validation.data.servedBy) updateData.servedBy = validation.data.servedBy

    const updated = await Order.findByIdAndUpdate(
      params.id,
      { $set: updateData },
      { new: true }
    )

    return NextResponse.json(updated)
  } catch (error: any) {
    console.error('Error updating order status:', error)
    return NextResponse.json(
      { error: 'Failed to update order status', details: error.message },
      { status: 500 }
    )
  }
}
