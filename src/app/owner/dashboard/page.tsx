import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import connectDB from '@/lib/mongodb'
import Order from '@/models/Order'
import Restaurant from '@/models/Restaurant'
import MenuItem from '@/models/MenuItem'
import Table from '@/models/Table'
import { getPeriodComparison, getRevenueComparison } from '@/lib/analytics'
import { 
  ShoppingCart, 
  DollarSign,
  TrendingUp,
  TrendingDown,
  Users,
  UtensilsCrossed,
  Table2
} from 'lucide-react'
import RevenueAreaChart from '@/components/charts/RevenueAreaChart'
import OrderStatusPieChart from '@/components/charts/OrderStatusPieChart'

async function getOwnerStats(restaurantId: string) {
  await connectDB()
  
  const totalOrders = await Order.countDocuments({ restaurantId })
  const totalRevenue = await Order.aggregate([
    { $match: { restaurantId: restaurantId, paymentStatus: 'paid' } },
    { $group: { _id: null, total: { $sum: '$total' } } }
  ])
  
  const menuItems = await MenuItem.countDocuments({ restaurantId })
  const tables = await Table.countDocuments({ restaurantId })
  
  const recentOrders = await Order.find({ restaurantId })
    .sort({ createdAt: -1 })
    .limit(50)

  // Real trends
  const orderTrend = await getPeriodComparison(Order, { restaurantId })
  const revenueTrend = await getRevenueComparison(Order, { restaurantId, paymentStatus: 'paid' })

  return {
    totalOrders,
    totalRevenue: totalRevenue[0]?.total || 0,
    menuItems,
    tables,
    recentOrders,
    orderTrend,
    revenueTrend,
  }
}

export default async function OwnerDashboard() {
  const session = await getServerSession(authOptions)
  
  if (!session?.user?.restaurantId) {
    return <div>No restaurant assigned</div>
  }

  const stats = await getOwnerStats(session.user.restaurantId)

  const formatChange = (change: number, trend: 'up' | 'down' | 'flat') => {
    const sign = trend === 'up' ? '+' : trend === 'down' ? '' : ''
    return `${sign}${change}%`
  }

  const statCards = [
    {
      title: 'Total Orders',
      value: stats.totalOrders,
      icon: ShoppingCart,
      color: 'bg-blue-500',
      change: formatChange(stats.orderTrend.change, stats.orderTrend.trend),
      trend: stats.orderTrend.trend,
    },
    {
      title: 'Total Revenue',
      value: `$${stats.totalRevenue.toFixed(2)}`,
      icon: DollarSign,
      color: 'bg-green-500',
      change: formatChange(stats.revenueTrend.change, stats.revenueTrend.trend),
      trend: stats.revenueTrend.trend,
    },
    {
      title: 'Menu Items',
      value: stats.menuItems,
      icon: UtensilsCrossed,
      color: 'bg-purple-500',
      change: null,
      trend: 'flat' as const,
    },
    {
      title: 'Tables',
      value: stats.tables,
      icon: Table2,
      color: 'bg-yellow-500',
      change: null,
      trend: 'flat' as const,
    },
  ]

  const chartOrders = stats.recentOrders.map((o: any) => ({
    status: o.status,
    total: o.total,
    createdAt: o.createdAt.toISOString(),
  }))

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-gray-900">Restaurant Dashboard</h1>
        <p className="text-gray-600 mt-1">Welcome back, {session?.user?.name}</p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {statCards.map((stat) => {
          const Icon = stat.icon
          return (
            <div key={stat.title} className="bg-white rounded-lg shadow p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600 mb-1">{stat.title}</p>
                  <p className="text-2xl font-bold text-gray-900">{stat.value}</p>
                  {stat.change !== null && (
                    <div className="flex items-center mt-2 text-sm">
                      {stat.trend === 'up' ? (
                        <TrendingUp className="text-green-500 mr-1" size={16} />
                      ) : stat.trend === 'down' ? (
                        <TrendingDown className="text-red-500 mr-1" size={16} />
                      ) : (
                        <span className="text-gray-400 mr-1">-</span>
                      )}
                      <span className={stat.trend === 'up' ? 'text-green-500' : stat.trend === 'down' ? 'text-red-500' : 'text-gray-500'}>
                        {stat.change}
                      </span>
                      <span className="text-gray-500 ml-1">from last month</span>
                    </div>
                  )}
                </div>
                <div className={`${stat.color} p-4 rounded-lg`}>
                  <Icon className="text-white" size={24} />
                </div>
              </div>
            </div>
          )
        })}
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white rounded-lg shadow p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Revenue (Last 7 Days)</h3>
          <RevenueAreaChart orders={chartOrders} />
        </div>
        <div className="bg-white rounded-lg shadow p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Order Status</h3>
          <OrderStatusPieChart orders={chartOrders} />
        </div>
      </div>

      {/* Recent Orders */}
      <div className="bg-white rounded-lg shadow">
        <div className="p-6 border-b border-gray-200">
          <h3 className="text-lg font-semibold text-gray-900">Recent Orders</h3>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Order #
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Type
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Status
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Total
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Date
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {stats.recentOrders.slice(0, 10).map((order: any) => (
                <tr key={order._id.toString()} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                    #{order.orderNumber}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 capitalize">
                    {order.orderType.replace('_', ' ')}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`px-2 py-1 text-xs font-medium rounded-full ${
                      order.status === 'completed' ? 'bg-green-100 text-green-800' :
                      order.status === 'pending' ? 'bg-yellow-100 text-yellow-800' :
                      order.status === 'preparing' ? 'bg-blue-100 text-blue-800' :
                      'bg-gray-100 text-gray-800'
                    }`}>
                      {order.status}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    ${order.total.toFixed(2)}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {new Date(order.createdAt).toLocaleDateString()}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}
