import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import connectDB from '@/lib/mongodb'
import Staff from '@/models/Staff'
import { UpdateStaffSchema } from '@/lib/validation'

// GET /api/staff/[id] — Get single staff
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

    const staff = await Staff.findById(params.id).populate(
      'userId',
      'name email phone'
    )
    if (!staff) {
      return NextResponse.json({ error: 'Staff not found' }, { status: 404 })
    }

    const normalized = {
      _id: staff._id.toString(),
      userId: staff.userId
        ? {
            _id: staff.userId._id?.toString(),
            name: staff.userId.name || '',
            email: staff.userId.email || '',
            phone: staff.userId.phone || undefined,
          }
        : null,
      restaurantId: staff.restaurantId?.toString(),
      employeeId: staff.employeeId,
      position: staff.position,
      department: staff.department,
      salary: staff.salary || 0,
      isActive: staff.isActive,
      hireDate: staff.hireDate?.toISOString(),
      createdAt: staff.createdAt?.toISOString(),
      updatedAt: staff.updatedAt?.toISOString(),
    }

    return NextResponse.json(normalized)
  } catch (error) {
    console.error('Error fetching staff:', error)
    return NextResponse.json(
      { error: 'Failed to fetch staff' },
      { status: 500 }
    )
  }
}

// PUT /api/staff/[id] — Update staff
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
    const validation = UpdateStaffSchema.safeParse(body)
    if (!validation.success) {
      return NextResponse.json(
        { error: 'Validation failed', details: validation.error.flatten() },
        { status: 400 }
      )
    }

    const staff = await Staff.findByIdAndUpdate(
      params.id,
      { $set: validation.data },
      { new: true }
    ).populate('userId', 'name email phone')

    if (!staff) {
      return NextResponse.json({ error: 'Staff not found' }, { status: 404 })
    }

    const normalized = {
      _id: staff._id.toString(),
      userId: staff.userId
        ? {
            _id: staff.userId._id?.toString(),
            name: staff.userId.name || '',
            email: staff.userId.email || '',
            phone: staff.userId.phone || undefined,
          }
        : null,
      restaurantId: staff.restaurantId?.toString(),
      employeeId: staff.employeeId,
      position: staff.position,
      department: staff.department,
      salary: staff.salary || 0,
      isActive: staff.isActive,
      hireDate: staff.hireDate?.toISOString(),
      createdAt: staff.createdAt?.toISOString(),
      updatedAt: staff.updatedAt?.toISOString(),
    }

    return NextResponse.json(normalized)
  } catch (error: any) {
    console.error('Error updating staff:', error)
    return NextResponse.json(
      { error: 'Failed to update staff', details: error.message },
      { status: 500 }
    )
  }
}

// DELETE /api/staff/[id] — Delete staff
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

    const staff = await Staff.findByIdAndDelete(params.id)
    if (!staff) {
      return NextResponse.json({ error: 'Staff not found' }, { status: 404 })
    }

    return NextResponse.json({ message: 'Staff deleted successfully' })
  } catch (error: any) {
    console.error('Error deleting staff:', error)
    return NextResponse.json(
      { error: 'Failed to delete staff', details: error.message },
      { status: 500 }
    )
  }
}
