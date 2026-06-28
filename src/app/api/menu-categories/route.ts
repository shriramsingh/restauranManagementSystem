import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import connectDB from '@/lib/mongodb'
import MenuCategory from '@/models/MenuCategory'
import {
  CreateMenuCategorySchema,
  UpdateMenuCategorySchema,
} from '@/lib/validation'

// GET /api/menu-categories — List categories
export async function GET(request: NextRequest) {
  try {
    await connectDB()
    const session = await getServerSession(authOptions)
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { searchParams } = new URL(request.url)
    const restaurantId = searchParams.get('restaurantId')

    const filter: any = {}
    if (restaurantId) {
      filter.restaurantId = restaurantId
    } else if (session.user.role === 'restaurant_owner' || session.user.role === 'staff') {
      filter.restaurantId = session.user.restaurantId
    }

    const categories = await MenuCategory.find(filter).sort({ sortOrder: 1, name: 1 })
    return NextResponse.json(categories)
  } catch (error) {
    console.error('Error fetching menu categories:', error)
    return NextResponse.json(
      { error: 'Failed to fetch menu categories' },
      { status: 500 }
    )
  }
}

// POST /api/menu-categories — Create category
export async function POST(request: NextRequest) {
  try {
    await connectDB()
    const session = await getServerSession(authOptions)
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await request.json()
    const validation = CreateMenuCategorySchema.safeParse(body)
    if (!validation.success) {
      return NextResponse.json(
        { error: 'Validation failed', details: validation.error.flatten() },
        { status: 400 }
      )
    }

    const data = validation.data

    // Inject restaurantId from session if owner/staff
    if (session.user.role === 'restaurant_owner' || session.user.role === 'staff') {
      data.restaurantId = session.user.restaurantId
    }
    if (!data.restaurantId) {
      return NextResponse.json(
        { error: 'Restaurant ID is required' },
        { status: 400 }
      )
    }

    const category = await MenuCategory.create(data)
    return NextResponse.json(category, { status: 201 })
  } catch (error: any) {
    console.error('Error creating menu category:', error)
    return NextResponse.json(
      { error: 'Failed to create menu category', details: error.message },
      { status: 500 }
    )
  }
}
