import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import connectDB from '@/lib/mongodb'
import Order from '@/models/Order'
import { UpdateOrderSchema } from '@/lib/validation'
import Transaction from '@/models/Transaction'

// GET /api/orders/[id] — Get single order
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    await connectDB()
    const session = await getServerSession(authOptions)
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const order = await Order.findById(params.id)
    if (!order) {
      return NextResponse.json({ error: 'Order not found' }, { status: 404 })
    }

    // Role-based access check
    if (
      session.user.role !== 'super_admin' &&
      order.restaurantId?.toString() !== session.user.restaurantId &&
      order.customerId?.toString() !== session.user.id
    ) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
    }

    return NextResponse.json(order)
  } catch (error) {
    console.error('Error fetching order:', error)
    return NextResponse.json(
      { error: 'Failed to fetch order' },
      { status: 500 }
    )
  }
}

// PUT /api/orders/[id] — Update order
export async function PUT(
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
    const validation = UpdateOrderSchema.safeParse(body)
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

    // Role-based access check
    if (
      session.user.role !== 'super_admin' &&
      order.restaurantId?.toString() !== session.user.restaurantId
    ) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
    }

    const updated = await Order.findByIdAndUpdate(
      params.id,
      { $set: validation.data },
      { new: true }
    )

    return NextResponse.json(updated)
  } catch (error: any) {
    console.error('Error updating order:', error)
    return NextResponse.json(
      { error: 'Failed to update order', details: error.message },
      { status: 500 }
    )
  }
}

// DELETE /api/orders/[id] — Delete order (admin only)
export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    await connectDB()
    const session = await getServerSession(authOptions)
    if (!session || session.user.role !== 'super_admin') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const order = await Order.findByIdAndDelete(params.id)
    if (!order) {
      return NextResponse.json({ error: 'Order not found' }, { status: 404 })
    }

    return NextResponse.json({ message: 'Order deleted successfully' })
  } catch (error: any) {
    console.error('Error deleting order:', error)
    return NextResponse.json(
      { error: 'Failed to delete order', details: error.message },
      { status: 500 }
    )
  }
}

// PATCH /api/orders/[id] — Partially update order (e.g., payment status)
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

    // We can use a less strict validation here for partial updates
    // For now, let's just validate the fields we expect
    const validation = UpdateOrderSchema.partial().safeParse(body)
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

    // Role-based access check
    if (
      session.user.role !== 'super_admin' &&
      order.restaurantId?.toString() !== session.user.restaurantId
    ) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
    }

    const updateData = validation.data

    // If payment status is changing, create a transaction
    if (updateData.paymentStatus && updateData.paymentStatus !== order.paymentStatus) {
      const { paymentStatus, paymentMethod } = updateData
      if (paymentStatus === 'paid' || paymentStatus === 'refunded') {
        const transaction = new Transaction({
          restaurantId: order.restaurantId,
          orderId: order._id,
          amount: order.total,
          type: paymentStatus === 'paid' ? 'sale' : 'refund',
          paymentMethod: paymentMethod || order.paymentMethod || 'online',
          transactionId: `${order._id}-${Date.now()}`, // Placeholder
          status: 'completed',
        })
        await transaction.save()

        // Add transaction to order
        if (!order.transactions) {
          order.transactions = []
        }
        order.transactions.push(transaction._id)
        await order.save()
      }
    }

    const updated = await Order.findByIdAndUpdate(
      params.id,
      { $set: updateData },
      { new: true }
    )

    return NextResponse.json(updated)
  } catch (error: any) {
    console.error('Error updating order:', error)
    return NextResponse.json(
      { error: 'Failed to update order', details: error.message },
      { status: 500 }
    )
  }
}
