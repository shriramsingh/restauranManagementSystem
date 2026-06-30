import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import connectDB from '@/lib/mongodb'
import Setting from '@/models/Setting'
import { z } from 'zod'

const settingSchema = z.object({
  currency: z.string().min(1, 'Currency is required'),
  taxRate: z.number().min(0, 'Tax rate must be a positive number'),
})

// GET /api/settings
export async function GET(request: NextRequest) {
  try {
    await connectDB()
    const session = await getServerSession(authOptions)
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { searchParams } = new URL(request.url)
    const restaurantId = searchParams.get('restaurantId')

    if (!restaurantId) {
      return NextResponse.json({ error: 'Restaurant ID is required' }, { status: 400 })
    }

    let settings = await Setting.findOne({ restaurantId })

    if (!settings) {
      // Create default settings if they don't exist
      settings = await Setting.create({
        restaurantId,
        currency: '$',
        taxRate: 0.08,
      })
    }

    return NextResponse.json(settings)
  } catch (error) {
    console.error('Error fetching settings:', error)
    return NextResponse.json({ error: 'Failed to fetch settings' }, { status: 500 })
  }
}

// POST /api/settings
export async function POST(request: NextRequest) {
  try {
    await connectDB()
    const session = await getServerSession(authOptions)
    if (!session || (session.user.role !== 'restaurant_owner' && session.user.role !== 'super_admin')) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await request.json()
    const validation = settingSchema.safeParse(body)
    if (!validation.success) {
      return NextResponse.json({ error: 'Validation failed', details: validation.error.flatten() }, { status: 400 })
    }

    const { currency, taxRate } = validation.data
    const { searchParams } = new URL(request.url)
    const restaurantId = searchParams.get('restaurantId')

    if (!restaurantId) {
        return NextResponse.json({ error: 'Restaurant ID is required' }, { status: 400 })
    }

    // super_admin can update any restaurant's settings
    // restaurant_owner can only update their own restaurant's settings
    if (session.user.role === 'restaurant_owner' && session.user.restaurantId !== restaurantId) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const settings = await Setting.findOneAndUpdate(
      { restaurantId },
      { currency, taxRate },
      { new: true, upsert: true }
    )

    return NextResponse.json(settings)
  } catch (error) {
    console.error('Error updating settings:', error)
    return NextResponse.json({ error: 'Failed to update settings' }, { status: 500 })
  }
}
