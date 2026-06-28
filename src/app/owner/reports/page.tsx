import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import connectDB from '@/lib/mongodb'
import Order from '@/models/Order'
import MenuItem from '@/models/MenuItem'
import OwnerReportsClient from '@/components/owner/OwnerReportsClient'

async function getReportsData(restaurantId: string) {
  await connectDB()

  const now = new Date()
  const startOfDay = new Date(now.getFullYear(), now.getMonth(), now.getDate())
  const startOfWeek = new Date(now)
  startOfWeek.setDate(now.getDate() - now.getDay())
  const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1)

  // Revenue stats
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

  // Top selling items (aggregate from order items)
  const topItems = await Order.aggregate([
    { $match: { restaurantId, status: { $ne: 'cancelled' } } },
    { $unwind: '$items' },
    { $group: { _id: '$items.name', totalSold: { $sum: '$items.quantity' }, revenue: { $sum: '$items.total' } } },
    { $sort: { totalSold: -1 } },
    { $limit: 10 }
  ])

  // Orders by hour (for peak hours)
  const ordersByHour = await Order.aggregate([
    { $match: { restaurantId, createdAt: { $gte: startOfMonth } } },
    { $group: { _id: { $hour: '$createdAt' }, count: { $sum: 1 }, revenue: { $sum: '$total' } } },
    { $sort: { _id: 1 } }
  ])

  // Orders by status
  const ordersByStatus = await Order.aggregate([
    { $match: { restaurantId } },
    { $group: { _id: '$status', count: { $sum: 1 }, revenue: { $sum: '$total' } } }
  ])

  // Daily revenue for chart (last 30 days)
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
  if (!session?.user?.restaurantId) {
    return <div className="p-8">No restaurant assigned</div>
  }

  const data = await getReportsData(session.user.restaurantId)

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
