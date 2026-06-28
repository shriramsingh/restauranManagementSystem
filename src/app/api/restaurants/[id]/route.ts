import { NextRequest, NextResponse } from 'next/server'
import connectDB from '@/lib/mongodb'
import Restaurant from '@/models/Restaurant'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { UpdateRestaurantSchema } from '@/lib/validation'

// GET /api/restaurants/[id] — Get a single restaurant
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

    const restaurant = await Restaurant.findById(params.id)
      .populate('ownerId', 'name email')
      .populate('subscriptionId', 'name price features')

    if (!restaurant) {
      return NextResponse.json(
        { error: 'Restaurant not found' },
        { status: 404 }
      )
    }

    return NextResponse.json(restaurant)
  } catch (error) {
    console.error('Error fetching restaurant:', error)
    return NextResponse.json(
      { error: 'Failed to fetch restaurant' },
      { status: 500 }
    )
  }
}

// PUT /api/restaurants/[id] — Update a restaurant
export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    await connectDB()
    const session = await getServerSession(authOptions)

    if (!session || session.user?.role !== 'super_admin') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await request.json()

    // Validate request body
    const validation = UpdateRestaurantSchema.safeParse(body)
    if (!validation.success) {
      return NextResponse.json(
        {
          error: 'Validation failed',
          details: validation.error.flatten(),
        },
        { status: 400 }
      )
    }

    // Build a mutable payload object from validated data
    const updatePayload: any = { ...validation.data }

    // Normalize cuisine field if present
    if (updatePayload.cuisine) {
      updatePayload.cuisine = Array.isArray(updatePayload.cuisine)
        ? updatePayload.cuisine
        : typeof updatePayload.cuisine === 'string'
        ? updatePayload.cuisine.split(',').map((c: string) => c.trim())
        : []
    }

    // Convert date strings to Date objects if present
    if (updatePayload.subscriptionStartDate) {
      updatePayload.subscriptionStartDate = new Date(
        updatePayload.subscriptionStartDate
      )
    }
    if (updatePayload.subscriptionEndDate) {
      updatePayload.subscriptionEndDate = new Date(
        updatePayload.subscriptionEndDate
      )
    }

    const restaurant = await Restaurant.findByIdAndUpdate(
      params.id,
      { $set: updatePayload },
      { new: true }
    )

    if (!restaurant) {
      return NextResponse.json(
        { error: 'Restaurant not found' },
        { status: 404 }
      )
    }

    return NextResponse.json(restaurant)
  } catch (error: any) {
    console.error('Error updating restaurant:', error)
    return NextResponse.json(
      {
        error: 'Failed to update restaurant',
        details: error.message,
      },
      { status: 500 }
    )
  }
}

// DELETE /api/restaurants/[id] — Delete a restaurant
export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    await connectDB()
    const session = await getServerSession(authOptions)

    if (!session || session.user?.role !== 'super_admin') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const restaurant = await Restaurant.findByIdAndDelete(params.id)

    if (!restaurant) {
      return NextResponse.json(
        { error: 'Restaurant not found' },
        { status: 404 }
      )
    }

    return NextResponse.json({ message: 'Restaurant deleted successfully' })
  } catch (error: any) {
    console.error('Error deleting restaurant:', error)
    return NextResponse.json(
      {
        error: 'Failed to delete restaurant',
        details: error.message,
      },
      { status: 500 }
    )
  }
}
