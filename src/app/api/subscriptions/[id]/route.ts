import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import connectDB from '@/lib/mongodb'
import Subscription from '@/models/Subscription'

export async function GET(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    await connectDB()
    const session = await getServerSession(authOptions)
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const subscription = await Subscription.findById(params.id)
    if (!subscription) {
      return NextResponse.json({ error: 'Subscription not found' }, { status: 404 })
    }

    return NextResponse.json(subscription)
  } catch (error: any) {
    return NextResponse.json({ error: 'Failed to fetch subscription', details: error.message }, { status: 500 })
  }
}

export async function PUT(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    await connectDB()
    const session = await getServerSession(authOptions)
    if (!session || session.user.role !== 'super_admin') {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
    }

    const body = await request.json()
    const subscription = await Subscription.findByIdAndUpdate(params.id, body, { new: true })
    if (!subscription) {
      return NextResponse.json({ error: 'Subscription not found' }, { status: 404 })
    }

    return NextResponse.json(subscription)
  } catch (error: any) {
    return NextResponse.json({ error: 'Failed to update subscription', details: error.message }, { status: 500 })
  }
}

export async function DELETE(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    await connectDB()
    const session = await getServerSession(authOptions)
    if (!session || session.user.role !== 'super_admin') {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
    }

    const subscription = await Subscription.findByIdAndDelete(params.id)
    if (!subscription) {
      return NextResponse.json({ error: 'Subscription not found' }, { status: 404 })
    }

    return NextResponse.json({ message: 'Subscription deleted' })
  } catch (error: any) {
    return NextResponse.json({ error: 'Failed to delete subscription', details: error.message }, { status: 500 })
  }
}
