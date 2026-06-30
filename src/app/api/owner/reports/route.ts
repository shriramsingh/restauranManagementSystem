import { NextResponse } from 'next/server'
import mongoose from 'mongoose'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import connectDB from '@/lib/mongodb'
import Order from '@/models/Order'
import Restaurant from '@/models/Restaurant'
import { getRestaurantIdForOwner } from '@/lib/get-restaurant-id'
import { z } from 'zod'

export const dynamic = 'force-dynamic'

const querySchema = z.object({
  startDate: z.string().optional(),
  endDate: z.string().optional(),
})

async function getReportsData(
  restaurantId: string,
  startDate: Date,
  endDate: Date,
) {
  await connectDB()

  const restaurant = await Restaurant.findById(restaurantId).select('settings.currency')
  const currency = restaurant?.settings?.currency || 'USD'

  const matchConditions = {
    restaurantId: new mongoose.Types.ObjectId(restaurantId),
    createdAt: { $gte: startDate, $lte: endDate },
    status: { $ne: 'cancelled' },
    paymentStatus: 'paid',
  }

  const revenue = await Order.aggregate([
    { $match: matchConditions },
    { $group: { _id: null, total: { $sum: '$total' }, count: { $sum: 1 } } },
  ])

  const totalRefunded = await Order.aggregate([
    {
      $match: {
        restaurantId: new mongoose.Types.ObjectId(restaurantId),
        createdAt: { $gte: startDate, $lte: endDate },
        paymentStatus: 'refunded',
      },
    },
    { $group: { _id: null, total: { $sum: '$total' }, count: { $sum: 1 } } },
  ])

  const topItems = await Order.aggregate([
    { $match: matchConditions },
    { $unwind: '$items' },
    {
      $group: {
        _id: '$items.name',
        totalSold: { $sum: '$items.quantity' },
        revenue: { $sum: '$items.total' },
      },
    },
    { $sort: { totalSold: -1 } },
    { $limit: 10 },
  ])

  const ordersByHour = await Order.aggregate([
    { $match: { ...matchConditions, createdAt: { $gte: startDate, $lte: endDate } } },
    {
      $group: {
        _id: { $hour: '$createdAt' },
        count: { $sum: 1 },
        revenue: { $sum: '$total' },
      },
    },
    { $sort: { _id: 1 } },
  ])

  const ordersByStatus = await Order.aggregate([
    {
      $match: {
        restaurantId: new mongoose.Types.ObjectId(restaurantId),
        createdAt: { $gte: startDate, $lte: endDate },
      },
    },
    {
      $group: {
        _id: '$status',
        count: { $sum: 1 },
        revenue: { $sum: '$total' },
      },
    },
  ])

  const dailyRevenue = await Order.aggregate([
    { $match: matchConditions },
    {
      $group: {
        _id: { $dateToString: { format: '%Y-%m-%d', date: '$createdAt' } },
        revenue: { $sum: '$total' },
        count: { $sum: 1 },
      },
    },
    { $sort: { _id: 1 } },
  ])

  return {
    revenue: revenue[0] || { total: 0, count: 0 },
    totalRefunded: totalRefunded[0] || { total: 0, count: 0 },
    topItems,
    ordersByHour,
    ordersByStatus,
    dailyRevenue,
    currency,
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

  let { startDate: startDateStr, endDate: endDateStr } = query.data

  const endDate = endDateStr ? new Date(endDateStr) : new Date()
  const startDate = startDateStr
    ? new Date(startDateStr)
    : new Date(endDate.getFullYear(), endDate.getMonth(), 1)

  endDate.setHours(23, 59, 59, 999)
  startDate.setHours(0, 0, 0, 0)
  
  try {
    const data = await getReportsData(restaurantId, startDate, endDate)
    return NextResponse.json(data)
  } catch (error) {
    console.error('Failed to fetch report data:', error)
    return NextResponse.json(
      { error: 'Internal Server Error' },
      { status: 500 },
    )
  }
}

