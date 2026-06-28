import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import connectDB from '@/lib/mongodb'
import MenuCategory from '@/models/MenuCategory'
import { UpdateMenuCategorySchema } from '@/lib/validation'

// GET /api/menu-categories/[id] — Get single category
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

    const category = await MenuCategory.findById(params.id)
    if (!category) {
      return NextResponse.json({ error: 'Category not found' }, { status: 404 })
    }

    return NextResponse.json(category)
  } catch (error) {
    console.error('Error fetching menu category:', error)
    return NextResponse.json(
      { error: 'Failed to fetch menu category' },
      { status: 500 }
    )
  }
}

// PUT /api/menu-categories/[id] — Update category
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
    const validation = UpdateMenuCategorySchema.safeParse(body)
    if (!validation.success) {
      return NextResponse.json(
        { error: 'Validation failed', details: validation.error.flatten() },
        { status: 400 }
      )
    }

    const category = await MenuCategory.findByIdAndUpdate(
      params.id,
      { $set: validation.data },
      { new: true }
    )

    if (!category) {
      return NextResponse.json({ error: 'Category not found' }, { status: 404 })
    }

    return NextResponse.json(category)
  } catch (error: any) {
    console.error('Error updating menu category:', error)
    return NextResponse.json(
      { error: 'Failed to update menu category', details: error.message },
      { status: 500 }
    )
  }
}

// DELETE /api/menu-categories/[id] — Delete category
export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    await connectDB()
    const session = await getServerSession(authOptions)
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const category = await MenuCategory.findByIdAndDelete(params.id)
    if (!category) {
      return NextResponse.json({ error: 'Category not found' }, { status: 404 })
    }

    return NextResponse.json({ message: 'Category deleted successfully' })
  } catch (error: any) {
    console.error('Error deleting menu category:', error)
    return NextResponse.json(
      { error: 'Failed to delete menu category', details: error.message },
      { status: 500 }
    )
  }
}
