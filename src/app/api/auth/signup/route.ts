import { NextRequest, NextResponse } from 'next/server'
import connectDB from '@/lib/mongodb'
import User from '@/models/User'
import { SignupSchema } from '@/lib/validation'
import { rateLimit } from '@/lib/rate-limit'

function getIp(req: NextRequest): string {
  const forwarded = req.headers.get('x-forwarded-for')
  return forwarded ? forwarded.split(',')[0].trim() : 'unknown'
}

export async function POST(request: NextRequest) {
  try {
    // Rate limit by IP
    const ip = getIp(request)
    const limit = rateLimit(`signup:${ip}`)
    if (!limit.success) {
      return NextResponse.json(
        { error: 'Too many signup attempts. Please try again later.' },
        { status: 429 }
      )
    }

    await connectDB()

    const body = await request.json()

    // Validate request body with Zod
    const validation = SignupSchema.safeParse(body)
    if (!validation.success) {
      return NextResponse.json(
        { error: 'Validation failed', details: validation.error.flatten() },
        { status: 400 }
      )
    }

    const { name, email, password, role, phone, address } = validation.data

    // Check if user already exists
    const existingUser = await User.findOne({ email })
    if (existingUser) {
      return NextResponse.json(
        { error: 'User with this email already exists' },
        { status: 400 }
      )
    }

    // Create user (password is hashed automatically by the model's pre-save hook)
    const user = await User.create({
      name,
      email,
      password,
      role,
      phone,
      address,
    })

    // Return user without password
    const { password: _, ...userWithoutPassword } = user.toObject()

    return NextResponse.json(
      { message: 'User created successfully', user: userWithoutPassword },
      { status: 201 }
    )
  } catch (error) {
    console.error('Signup error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}