import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import connectDB from '@/lib/mongodb'
import MenuItem from '@/models/MenuItem'
import {
  CreateMenuItemSchema,
  UpdateMenuItemSchema,
} from '@/lib/validation'

// GET /api/menu-items — List menu items
export async function GET(request: NextRequest) {
  try {
    await connectDB()
    const session = await getServerSession(authOptions)
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { searchParams } = new URL(request.url)
    const restaurantId = searchParams.get('restaurantId')
    const categoryId = searchParams.get('categoryId')
    const isAvailable = searchParams.get('isAvailable')
    const isFeatured = searchParams.get('isFeatured')

    const filter: any = {}
    if (restaurantId) {
      filter.restaurantId = restaurantId
    } else if (session.user.role === 'restaurant_owner' || session.user.role === 'staff') {
      filter.restaurantId = session.user.restaurantId
    }
    if (categoryId) filter.categoryId = categoryId
    if (isAvailable !== null) filter.isAvailable = isAvailable === 'true'
    if (isFeatured !== null) filter.isFeatured = isFeatured === 'true'

    const items = await MenuItem.find(filter).sort({ sortOrder: 1, name: 1 })
    return NextResponse.json(items)
  } catch (error) {
    console.error('Error fetching menu items:', error)
    return NextResponse.json(
      { error: 'Failed to fetch menu items' },
      { status: 500 }
    )
  }
}

// POST /api/menu-items — Create menu item
export async function POST(request: NextRequest) {
  try {
    await connectDB()
    const session = await getServerSession(authOptions)
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await request.json()
    const validation = CreateMenuItemSchema.safeParse(body)
    if (!validation.success) {
      return NextResponse.json(
        { error: 'Validation failed', details: validation.error.flatten() },
        { status: 400 }
      )
    }

    const data = validation.data

    if (session.user.role === 'restaurant_owner' || session.user.role === 'staff') {
      data.restaurantId = session.user.restaurantId
    }
    if (!data.restaurantId) {
      return NextResponse.json(
        { error: 'Restaurant ID is required' },
        { status: 400 }
      )
    }

    const item = await MenuItem.create(data)
    return NextResponse.json(item, { status: 201 })
  } catch (error: any) {
    console.error('Error creating menu item:', error)
    return NextResponse.json(
      { error: 'Failed to create menu item', details: error.message },
      { status: 500 }
    )
  }
}
