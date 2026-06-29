import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import connectDB from '@/lib/mongodb'
import Subscription from '@/models/Subscription'

export async function GET(request: NextRequest) {
  try {
    await connectDB()
    const session = await getServerSession(authOptions)
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const subscriptions = await Subscription.find().sort({ createdAt: -1 })
    return NextResponse.json(subscriptions)
  } catch (error: any) {
    return NextResponse.json({ error: 'Failed to fetch subscriptions', details: error.message }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    await connectDB()
    const session = await getServerSession(authOptions)
    if (!session || session.user.role !== 'super_admin') {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
    }

    const body = await request.json()
    const subscription = await Subscription.create(body)
    return NextResponse.json(subscription, { status: 201 })
  } catch (error: any) {
    return NextResponse.json({ error: 'Failed to create subscription', details: error.message }, { status: 500 })
  }
}
