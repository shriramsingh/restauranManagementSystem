import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import connectDB from '@/lib/mongodb'
import Table from '@/models/Table'
import { CreateTableSchema, UpdateTableSchema } from '@/lib/validation'

// GET /api/tables — List tables
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

    const tables = await Table.find(filter).sort({ tableNumber: 1 })
    return NextResponse.json(tables)
  } catch (error) {
    console.error('Error fetching tables:', error)
    return NextResponse.json(
      { error: 'Failed to fetch tables' },
      { status: 500 }
    )
  }
}

// POST /api/tables — Create table
export async function POST(request: NextRequest) {
  try {
    await connectDB()
    const session = await getServerSession(authOptions)
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await request.json()
    const validation = CreateTableSchema.safeParse(body)
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

    const table = await Table.create(data)
    return NextResponse.json(table, { status: 201 })
  } catch (error: any) {
    console.error('Error creating table:', error)
    return NextResponse.json(
      { error: 'Failed to create table', details: error.message },
      { status: 500 }
    )
  }
}
