import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import connectDB from '@/lib/mongodb'
import Order from '@/models/Order'
import { CreateOrderSchema, UpdateOrderSchema } from '@/lib/validation'
import { checkOrderLimit } from '@/lib/subscription'

// GET /api/orders — List orders
export async function GET(request: NextRequest) {
  try {
    await connectDB()
    const session = await getServerSession(authOptions)
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { searchParams } = new URL(request.url)
    const page = parseInt(searchParams.get('page') || '1')
    const limit = parseInt(searchParams.get('limit') || '20')
    const status = searchParams.get('status')
    const skip = (page - 1) * limit

    const filter: any = {}

    if (session.user.role === 'super_admin') {
      // Admin can see all, optionally filter by restaurantId
      const restaurantId = searchParams.get('restaurantId')
      if (restaurantId) filter.restaurantId = restaurantId
    } else if (session.user.role === 'restaurant_owner' || session.user.role === 'staff') {
      filter.restaurantId = session.user.restaurantId
    } else if (session.user.role === 'customer') {
      filter.customerId = session.user.id
    }

    if (status) filter.status = status

    const orders = await Order.find(filter)
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit)

    const total = await Order.countDocuments(filter)

    return NextResponse.json({
      orders,
      total,
      pages: Math.ceil(total / limit),
      currentPage: page,
    })
  } catch (error) {
    console.error('Error fetching orders:', error)
    return NextResponse.json(
      { error: 'Failed to fetch orders' },
      { status: 500 }
    )
  }
}

// POST /api/orders — Create order
export async function POST(request: NextRequest) {
  try {
    await connectDB()
    const session = await getServerSession(authOptions)
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await request.json()
    const validation = CreateOrderSchema.safeParse(body)
    if (!validation.success) {
      return NextResponse.json(
        { error: 'Validation failed', details: validation.error.flatten() },
        { status: 400 }
      )
    }

    const data = validation.data

    // Determine restaurantId
    let restaurantId = data.restaurantId
    if (!restaurantId && (session.user.role === 'restaurant_owner' || session.user.role === 'staff')) {
      restaurantId = session.user.restaurantId
    }
    if (!restaurantId) {
      return NextResponse.json(
        { error: 'Restaurant ID is required' },
        { status: 400 }
      )
    }

    // Check subscription limit for orders
    const limitCheck = await checkOrderLimit(restaurantId)
    if (!limitCheck.allowed) {
      return NextResponse.json(
        { error: limitCheck.message },
        { status: 403 }
      )
    }

    // Generate order number
    const timestamp = Date.now().toString(36).toUpperCase()
    const random = Math.floor(Math.random() * 1000)
      .toString()
      .padStart(3, '0')
    const orderNumber = `ORD-${timestamp}-${random}`

    // Set customerId from session if customer role
    const customerId =
      session.user.role === 'customer' ? session.user.id : data.customerId

    const orderData = {
      ...data,
      restaurantId,
      orderNumber,
      customerId: customerId || undefined,
      status: data.status || 'pending',
      tax: data.tax || 0,
      discount: data.discount || 0,
      paymentStatus: 'pending',
    }

    const order = await Order.create(orderData)
    return NextResponse.json(order, { status: 201 })
  } catch (error: any) {
    console.error('Error creating order:', error)
    return NextResponse.json(
      { error: 'Failed to create order', details: error.message },
      { status: 500 }
    )
  }
}
