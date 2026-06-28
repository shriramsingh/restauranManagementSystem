import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import connectDB from '@/lib/mongodb'
import Staff from '@/models/Staff'
import User from '@/models/User'
import { CreateStaffSchema } from '@/lib/validation'
import { checkStaffLimit } from '@/lib/subscription'

function normalizeStaff(staff: any) {
  if (!staff) return null
  return {
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
}

// Auto-generate unique employee ID for a restaurant
async function generateEmployeeId(restaurantId: string): Promise<string> {
  const existingStaff = await Staff.find({ restaurantId })
    .sort({ employeeId: -1 })
    .limit(1)

  if (existingStaff.length === 0) {
    return 'EMP001'
  }

  const lastId = existingStaff[0].employeeId
  const match = lastId.match(/(\d+)$/) // Extract trailing digits
  const lastNum = match ? parseInt(match[1]) : 0
  const nextNum = lastNum + 1
  const padded = nextNum.toString().padStart(3, '0')
  return `EMP${padded}`
}

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

    const staffList = await Staff.find(filter)
      .populate('userId', 'name email phone')
      .sort({ createdAt: -1 })

    return NextResponse.json(staffList.map(normalizeStaff))
  } catch (error: any) {
    console.error('GET /api/staff error:', error)
    return NextResponse.json(
      { error: 'Failed to fetch staff', details: error.message },
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
      console.log('POST /api/staff: no session')
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    console.log('POST /api/staff: session.user =', JSON.stringify(session.user))

    const allowedRoles = ['super_admin', 'restaurant_owner']
    if (!allowedRoles.includes(session.user.role)) {
      console.log('POST /api/staff: role not allowed:', session.user.role)
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
    }

    const body = await request.json()
    console.log('POST /api/staff: body =', JSON.stringify(body))

    const validation = CreateStaffSchema.safeParse(body)
    if (!validation.success) {
      console.log('POST /api/staff: validation failed:', validation.error.flatten())
      return NextResponse.json(
        { error: 'Validation failed', details: validation.error.flatten() },
        { status: 400 }
      )
    }

    const data = validation.data
    console.log('POST /api/staff: validated data =', JSON.stringify(data))

    if (session.user.role === 'restaurant_owner' || session.user.role === 'staff') {
      data.restaurantId = session.user.restaurantId
    }

    // Fallback: if owner has no restaurantId in session, look it up
    if (!data.restaurantId && session.user.role === 'restaurant_owner') {
      console.log('POST /api/staff: looking up restaurant by ownerId:', session.user.id)
      const Restaurant = (await import('@/models/Restaurant')).default
      const restaurant = await Restaurant.findOne({ ownerId: session.user.id })
      console.log('POST /api/staff: found restaurant =', restaurant ? restaurant._id.toString() : null)
      if (restaurant) {
        data.restaurantId = restaurant._id.toString()
      }
    }

    if (!data.restaurantId) {
      console.log('POST /api/staff: no restaurantId after fallback')
      return NextResponse.json(
        { error: 'Restaurant ID is required. Please log out and log back in if this persists.' },
        { status: 400 }
      )
    }

    console.log('POST /api/staff: using restaurantId =', data.restaurantId)

    const employeeId = data.employeeId || await generateEmployeeId(data.restaurantId)
    console.log('POST /api/staff: generated employeeId =', employeeId)

    // Check staff limit
    console.log('POST /api/staff: checking staff limit for restaurantId =', data.restaurantId)
    const limitCheck = await checkStaffLimit(data.restaurantId)
    console.log('POST /api/staff: limitCheck =', JSON.stringify(limitCheck))
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

      try {
        console.log('POST /api/staff: checking if user exists:', email)
        const existingUser = await User.findOne({ email })
        if (existingUser) {
          return NextResponse.json(
            { error: 'User with this email already exists' },
            { status: 400 }
          )
        }

        console.log('POST /api/staff: creating user with name:', name, 'email:', email)
        const newUser = await User.create({
          name,
          email,
          password: password || 'password123',
          role: 'staff',
          phone: body.phone || undefined,
        })
        userId = newUser._id.toString()
        console.log('POST /api/staff: created user with id:', userId)
      } catch (userErr: any) {
        console.error('User creation failed:', userErr)
        return NextResponse.json(
          { error: 'Failed to create user account', details: userErr.message },
          { status: 500 }
        )
      }
    }

    try {
      console.log('POST /api/staff: creating staff record with userId:', userId, 'employeeId:', employeeId)
      const staff = await Staff.create({
        ...data,
        userId,
        employeeId,
      })
      console.log('POST /api/staff: staff created with id:', staff._id.toString())

      const populated = await Staff.findById(staff._id).populate(
        'userId',
        'name email phone'
      )

      if (!populated) {
        return NextResponse.json(
          { error: 'Staff created but could not be retrieved' },
          { status: 500 }
        )
      }

      console.log('POST /api/staff: success, returning staff')
      return NextResponse.json(normalizeStaff(populated), { status: 201 })
    } catch (staffErr: any) {
      console.error('Staff creation failed:', staffErr)
      return NextResponse.json(
        { error: 'Failed to create staff record', details: staffErr.message },
        { status: 500 }
      )
    }
  } catch (error: any) {
    console.error('POST /api/staff unhandled error:', error)
    console.error('POST /api/staff stack:', error.stack)
    return NextResponse.json(
      { error: 'Failed to create staff', details: error.message },
      { status: 500 }
    )
  }
}
