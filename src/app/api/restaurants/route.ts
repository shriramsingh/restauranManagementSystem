import { NextRequest, NextResponse } from 'next/server'
import connectDB from '@/lib/mongodb'
import Restaurant from '@/models/Restaurant'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { CreateRestaurantSchema } from '@/lib/validation'

// GET /api/restaurants — List all restaurants (paginated)
export async function GET(request: NextRequest) {
  try {
    await connectDB()
    const session = await getServerSession(authOptions)

    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { searchParams } = new URL(request.url)
    const page = parseInt(searchParams.get('page') || '1')
    const limit = parseInt(searchParams.get('limit') || '10')
    const skip = (page - 1) * limit

    const restaurants = await Restaurant.find()
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit)
      .populate('ownerId', 'name email')
      .populate('subscriptionId', 'name price')

    const total = await Restaurant.countDocuments()

    return NextResponse.json({
      restaurants,
      total,
      pages: Math.ceil(total / limit),
      currentPage: page,
    })
  } catch (error) {
    console.error('Error fetching restaurants:', error)
    return NextResponse.json(
      { error: 'Failed to fetch restaurants' },
      { status: 500 }
    )
  }
}

// POST /api/restaurants — Create a new restaurant
export async function POST(request: NextRequest) {
  try {
    await connectDB()
    const session = await getServerSession(authOptions)

    if (!session || session.user?.role !== 'super_admin') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await request.json()

    // Validate request body with Zod
    const validation = CreateRestaurantSchema.safeParse(body)
    if (!validation.success) {
      return NextResponse.json(
        {
          error: 'Validation failed',
          details: validation.error.flatten(),
        },
        { status: 400 }
      )
    }

    const data = validation.data

    // Validate required fields (Zod already ensures these, but belt-and-suspenders)
    if (!data.name || !data.email || !data.phone || !data.address) {
      return NextResponse.json(
        {
          error: 'Missing required fields: name, email, phone, and address are required',
        },
        { status: 400 }
      )
    }

    // Validate address sub-fields
    if (
      data.address &&
      (!data.address.street ||
        !data.address.city ||
        !data.address.state ||
        !data.address.zipCode ||
        !data.address.country)
    ) {
      return NextResponse.json(
        {
          error:
            'All address fields (street, city, state, zipCode, country) are required',
        },
        { status: 400 }
      )
    }

    // Get first subscription if not provided
    const Subscription = (await import('@/models/Subscription')).default
    const defaultSubscription = await Subscription.findOne()

    if (!defaultSubscription && !data.subscriptionId) {
      return NextResponse.json(
        {
          error: 'No subscription plan found. Please create a subscription plan first.',
        },
        { status: 400 }
      )
    }

    // Build restaurant data with defaults
    const restaurantData: any = {
      name: data.name,
      email: data.email,
      phone: data.phone,
      cuisine: Array.isArray(data.cuisine)
        ? data.cuisine
        : typeof data.cuisine === 'string'
        ? data.cuisine.split(',').map((c: string) => c.trim())
        : [],
      subscriptionId: data.subscriptionId || defaultSubscription._id,
      subscriptionStatus: data.subscriptionStatus || 'trial',
      subscriptionStartDate: data.subscriptionStartDate
        ? new Date(data.subscriptionStartDate)
        : new Date(),
      subscriptionEndDate: data.subscriptionEndDate
        ? new Date(data.subscriptionEndDate)
        : new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
      isActive: data.isActive !== undefined ? data.isActive : true,
      settings: data.settings || {
        currency: 'USD',
        taxRate: 0,
        allowOnlineOrders: true,
        allowTableReservation: true,
        autoAcceptOrders: false,
      },
    }

    // Add address if provided
    if (data.address) {
      restaurantData.address = data.address
    }

    // Add optional fields if provided
    if (data.ownerId) restaurantData.ownerId = data.ownerId
    if (data.description) restaurantData.description = data.description
    if (data.logo) restaurantData.logo = data.logo
    if (data.coverImage) restaurantData.coverImage = data.coverImage
    if (data.openingHours) restaurantData.openingHours = data.openingHours

    try {
      const restaurant = await Restaurant.create(restaurantData)
      return NextResponse.json(restaurant, { status: 201 })
    } catch (mongooseError: any) {
      console.error('Mongoose validation error:', mongooseError)

      // Extract validation errors
      const validationErrors: any = {}
      if (mongooseError.errors) {
        Object.keys(mongooseError.errors).forEach((key: string) => {
          validationErrors[key] = mongooseError.errors[key].message
        })
      }

      return NextResponse.json(
        {
          error: 'Validation error',
          details: mongooseError.message,
          fields: validationErrors,
        },
        { status: 400 }
      )
    }
  } catch (error: any) {
    console.error('Error creating restaurant:', error)
    return NextResponse.json(
      {
        error: 'Failed to create restaurant',
        details: error.message,
      },
      { status: 500 }
    )
  }
}
