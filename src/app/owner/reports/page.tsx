import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import connectDB from '@/lib/mongodb'
import Order from '@/models/Order'
import MenuItem from '@/models/MenuItem'
import OwnerReportsClient from '@/components/owner/OwnerReportsClient'
import { getRestaurantIdForOwner } from '@/lib/get-restaurant-id'

async function getReportsData(restaurantId: string) {
  await connectDB()

  const now = new Date()
  const startOfDay = new Date(now.getFullYear(), now.getMonth(), now.getDate())
  const startOfWeek = new Date(now)
  startOfWeek.setDate(now.getDate() - now.getDay())
  const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1)

  const todayRevenue = await Order.aggregate([
    { $match: { restaurantId, createdAt: { $gte: startOfDay }, status: { $ne: 'cancelled' } } },
    { $group: { _id: null, total: { $sum: '$total' }, count: { $sum: 1 } } }
  ])
  const weekRevenue = await Order.aggregate([
    { $match: { restaurantId, createdAt: { $gte: startOfWeek }, status: { $ne: 'cancelled' } } },
    { $group: { _id: null, total: { $sum: '$total' }, count: { $sum: 1 } } }
  ])
  const monthRevenue = await Order.aggregate([
    { $match: { restaurantId, createdAt: { $gte: startOfMonth }, status: { $ne: 'cancelled' } } },
    { $group: { _id: null, total: { $sum: '$total' }, count: { $sum: 1 } } }
  ])

  const topItems = await Order.aggregate([
    { $match: { restaurantId, status: { $ne: 'cancelled' } } },
    { $unwind: '$items' },
    { $group: { _id: '$items.name', totalSold: { $sum: '$items.quantity' }, revenue: { $sum: '$items.total' } } },
    { $sort: { totalSold: -1 } },
    { $limit: 10 }
  ])

  const ordersByHour = await Order.aggregate([
    { $match: { restaurantId, createdAt: { $gte: startOfMonth } } },
    { $group: { _id: { $hour: '$createdAt' }, count: { $sum: 1 }, revenue: { $sum: '$total' } } },
    { $sort: { _id: 1 } }
  ])

  const ordersByStatus = await Order.aggregate([
    { $match: { restaurantId } },
    { $group: { _id: '$status', count: { $sum: 1 }, revenue: { $sum: '$total' } } }
  ])

  const thirtyDaysAgo = new Date(now)
  thirtyDaysAgo.setDate(now.getDate() - 30)
  const dailyRevenue = await Order.aggregate([
    { $match: { restaurantId, createdAt: { $gte: thirtyDaysAgo }, status: { $ne: 'cancelled' } } },
    { $group: { _id: { $dateToString: { format: '%Y-%m-%d', date: '$createdAt' } }, revenue: { $sum: '$total' }, count: { $sum: 1 } } },
    { $sort: { _id: 1 } }
  ])

  return {
    today: todayRevenue[0] || { total: 0, count: 0 },
    thisWeek: weekRevenue[0] || { total: 0, count: 0 },
    thisMonth: monthRevenue[0] || { total: 0, count: 0 },
    topItems,
    ordersByHour,
    ordersByStatus,
    dailyRevenue,
  }
}

export default async function OwnerReports() {
  const session = await getServerSession(authOptions)
  const restaurantId = await getRestaurantIdForOwner()

  if (!restaurantId) {
    return (
      <div className="bg-white rounded-lg shadow p-12 text-center">
        <h3 className="text-lg font-medium text-gray-900 mb-2">No restaurant assigned</h3>
        <p className="text-gray-600 mb-4">Please log out and log back in to refresh your session.</p>
      </div>
    )
  }

  const data = await getReportsData(restaurantId)

  return (
    <OwnerReportsClient
      todayRevenue={data.today.total}
      todayOrders={data.today.count}
      weekRevenue={data.thisWeek.total}
      weekOrders={data.thisWeek.count}
      monthRevenue={data.thisMonth.total}
      monthOrders={data.thisMonth.count}
      topItems={data.topItems.map((i: any) => ({ name: i._id, totalSold: i.totalSold, revenue: i.revenue }))}
      ordersByHour={data.ordersByHour.map((h: any) => ({ hour: h._id, count: h.count, revenue: h.revenue }))}
      ordersByStatus={data.ordersByStatus.map((s: any) => ({ status: s._id, count: s.count, revenue: s.revenue }))}
      dailyRevenue={data.dailyRevenue.map((d: any) => ({ date: d._id, revenue: d.revenue, count: d.count }))}
    />
  )
}
