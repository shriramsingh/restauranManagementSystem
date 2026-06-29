import mongoose from 'mongoose'
import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import connectDB from '@/lib/mongodb'
import Order from '@/models/Order'
import MenuItem from '@/models/MenuItem'
import Table from '@/models/Table'
import { getRestaurantIdForOwner } from '@/lib/get-restaurant-id'
import { z } from 'zod'

const querySchema = z.object({
  startDate: z.string(),
  endDate: z.string(),
})

async function getOwnerStats(
  restaurantId: string,
  startDate: Date,
  endDate: Date,
) {
  await connectDB()

  const matchConditions = {
    restaurantId: new mongoose.Types.ObjectId(restaurantId),
    createdAt: { $gte: startDate, $lte: endDate },
    status: { $ne: 'cancelled' },
    paymentStatus: 'paid',
  }

  const totalOrders = await Order.countDocuments(matchConditions)
  const totalRevenue = await Order.aggregate([
    { $match: matchConditions },
    { $group: { _id: null, total: { $sum: '$total' } } },
  ])
  const menuItems = await MenuItem.countDocuments({ restaurantId })
  const tables = await Table.countDocuments({ restaurantId })
  
  const chartOrders = await Order.find({
    restaurantId,
    createdAt: { $gte: startDate, $lte: endDate },
  })
    .select('status total createdAt paymentStatus')
    .sort({ createdAt: -1 })

  // For trends, compare to the previous period of the same length
  const diff = endDate.getTime() - startDate.getTime()
  const prevStartDate = new Date(startDate.getTime() - diff)
  const prevEndDate = new Date(endDate.getTime() - diff)

  const prevMatchConditions = {
    ...matchConditions,
    createdAt: { $gte: prevStartDate, $lte: prevEndDate },
  }

  const prevTotalOrders = await Order.countDocuments(prevMatchConditions)
  const prevTotalRevenue = await Order.aggregate([
    { $match: prevMatchConditions },
    { $group: { _id: null, total: { $sum: '$total' } } },
  ])

  const totalRefunded = await Order.aggregate([
    {
      $match: {
        restaurantId: new mongoose.Types.ObjectId(restaurantId),
        createdAt: { $gte: startDate, $lte: endDate },
        paymentStatus: 'refunded',
      },
    },
    { $group: { _id: null, total: { $sum: '$total' } } },
  ])

  const calculateTrend = (current: number, previous: number) => {
    if (previous === 0) {
      return { change: current > 0 ? 100 : 0, trend: current > 0 ? 'up' : 'flat' }
    }
    const change = ((current - previous) / previous) * 100
    return {
      change: Math.round(change),
      trend: change > 0 ? 'up' : change < 0 ? 'down' : 'flat',
    }
  }

  const orderTrend = calculateTrend(totalOrders, prevTotalOrders)
  const revenueTrend = calculateTrend(
    totalRevenue[0]?.total || 0,
    prevTotalRevenue[0]?.total || 0,
  )

  return {
    totalOrders,
    totalRevenue: totalRevenue[0]?.total || 0,
    totalRefunded: totalRefunded[0]?.total || 0,
    menuItems,
    tables,
    chartOrders,
    orderTrend,
    revenueTrend,
  }
}

export async function GET(request: Request) {
  const session = await getServerSession(authOptions)
  if (!session || session.user.role !== 'restaurant_owner') {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
  }

  const restaurantId = await getRestaurantIdForOwner()
  if (!restaurantId) {
    return NextResponse.json({ error: 'Restaurant not found' }, { status: 404 })
  }

  const { searchParams } = new URL(request.url)
  const query = querySchema.safeParse(Object.fromEntries(searchParams))

  if (!query.success) {
    return NextResponse.json({ error: query.error.format() }, { status: 400 })
  }

  const { startDate: startDateStr, endDate: endDateStr } = query.data
  const startDate = new Date(startDateStr)
  const endDate = new Date(endDateStr)
  endDate.setHours(23, 59, 59, 999)
  startDate.setHours(0, 0, 0, 0)
  
  try {
    const data = await getOwnerStats(restaurantId, startDate, endDate)
    return NextResponse.json(data)
  } catch (error) {
    console.error('Failed to fetch dashboard data:', error)
    return NextResponse.json(
      { error: 'Internal Server Error' },
      { status: 500 },
    )
  }
}


