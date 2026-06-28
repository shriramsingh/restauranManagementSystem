import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import connectDB from '@/lib/mongodb'
import Staff from '@/models/Staff'
import User from '@/models/User'
import { CreateStaffSchema, UpdateStaffSchema } from '@/lib/validation'
import { checkStaffLimit } from '@/lib/subscription'

// GET /api/staff — List staff
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

    const staff = await Staff.find(filter)
      .populate('userId', 'name email phone')
      .sort({ createdAt: -1 })

    // Normalize to plain objects with guaranteed field structure
    const normalized = staff.map((s: any) => ({
      _id: s._id.toString(),
      userId: s.userId
        ? {
            _id: s.userId._id?.toString(),
            name: s.userId.name || '',
            email: s.userId.email || '',
            phone: s.userId.phone || undefined,
          }
        : null,
      restaurantId: s.restaurantId?.toString(),
      employeeId: s.employeeId,
      position: s.position,
      department: s.department,
      salary: s.salary || 0,
      isActive: s.isActive,
      hireDate: s.hireDate?.toISOString(),
      createdAt: s.createdAt?.toISOString(),
      updatedAt: s.updatedAt?.toISOString(),
    }))

    return NextResponse.json(normalized)
  } catch (error) {
    console.error('Error fetching staff:', error)
    return NextResponse.json(
      { error: 'Failed to fetch staff' },
      { status: 500 }
    )
  }
}

// POST /api/staff — Create staff
export async function POST(request: NextRequest) {
  try {
    await connectDB()
    const session = await getServerSession(authOptions)
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await request.json()
    const validation = CreateStaffSchema.safeParse(body)
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

    // Check staff limit
    const limitCheck = await checkStaffLimit(data.restaurantId)
    if (!limitCheck.allowed) {
      return NextResponse.json(
        { error: limitCheck.message },
        { status: 403 }
      )
    }

    let userId = data.userId

    // If no userId, create a new user
    if (!userId) {
      const { name, email, password } = body
      if (!name || !email) {
        return NextResponse.json(
          { error: 'Name and email are required when creating a new user' },
          { status: 400 }
        )
      }

      const existingUser = await User.findOne({ email })
      if (existingUser) {
        return NextResponse.json(
          { error: 'User with this email already exists' },
          { status: 400 }
        )
      }

      const newUser = await User.create({
        name,
        email,
        password: password || 'password123',
        role: 'staff',
        phone: body.phone || undefined,
      })
      userId = newUser._id.toString()
    }

    const staff = await Staff.create({
      ...data,
      userId,
    })

    // Build the normalized response manually to ensure proper structure
    const populated = await Staff.findById(staff._id).populate(
      'userId',
      'name email phone'
    )

    // Normalize to a plain object with guaranteed field structure
    const response = {
      _id: populated._id.toString(),
      userId: populated.userId
        ? {
            _id: populated.userId._id?.toString(),
            name: populated.userId.name || '',
            email: populated.userId.email || '',
            phone: populated.userId.phone || undefined,
          }
        : null,
      restaurantId: populated.restaurantId?.toString(),
      employeeId: populated.employeeId,
      position: populated.position,
      department: populated.department,
      salary: populated.salary || 0,
      isActive: populated.isActive,
      hireDate: populated.hireDate?.toISOString(),
      createdAt: populated.createdAt?.toISOString(),
      updatedAt: populated.updatedAt?.toISOString(),
    }

    return NextResponse.json(response, { status: 201 })
  } catch (error: any) {
    console.error('Error creating staff:', error)
    return NextResponse.json(
      { error: 'Failed to create staff', details: error.message },
      { status: 500 }
    )
  }
}
