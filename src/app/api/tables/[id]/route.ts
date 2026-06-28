import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import connectDB from '@/lib/mongodb'
import Table from '@/models/Table'
import { UpdateTableSchema } from '@/lib/validation'

// GET /api/tables/[id] — Get single table
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

    const table = await Table.findById(params.id)
    if (!table) {
      return NextResponse.json({ error: 'Table not found' }, { status: 404 })
    }

    return NextResponse.json(table)
  } catch (error) {
    console.error('Error fetching table:', error)
    return NextResponse.json(
      { error: 'Failed to fetch table' },
      { status: 500 }
    )
  }
}

// PUT /api/tables/[id] — Update table
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
    const validation = UpdateTableSchema.safeParse(body)
    if (!validation.success) {
      return NextResponse.json(
        { error: 'Validation failed', details: validation.error.flatten() },
        { status: 400 }
      )
    }

    const table = await Table.findByIdAndUpdate(
      params.id,
      { $set: validation.data },
      { new: true }
    )

    if (!table) {
      return NextResponse.json({ error: 'Table not found' }, { status: 404 })
    }

    return NextResponse.json(table)
  } catch (error: any) {
    console.error('Error updating table:', error)
    return NextResponse.json(
      { error: 'Failed to update table', details: error.message },
      { status: 500 }
    )
  }
}

// DELETE /api/tables/[id] — Delete table
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

    const table = await Table.findByIdAndDelete(params.id)
    if (!table) {
      return NextResponse.json({ error: 'Table not found' }, { status: 404 })
    }

    return NextResponse.json({ message: 'Table deleted successfully' })
  } catch (error: any) {
    console.error('Error deleting table:', error)
    return NextResponse.json(
      { error: 'Failed to delete table', details: error.message },
      { status: 500 }
    )
  }
}
