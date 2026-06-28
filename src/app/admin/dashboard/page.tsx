import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import connectDB from '@/lib/mongodb'
import User from '@/models/User'
import Restaurant from '@/models/Restaurant'
import Order from '@/models/Order'
import Subscription from '@/models/Subscription'
import { getPeriodComparison, getRevenueComparison } from '@/lib/analytics'
import { 
  Users, 
  UtensilsCrossed, 
  ShoppingCart, 
  DollarSign,
  TrendingUp,
  TrendingDown,
  Activity
} from 'lucide-react'
import StatusBarChart from '@/components/charts/StatusBarChart'
import RevenueAreaChart from '@/components/charts/RevenueAreaChart'

async function getStats() {
  await connectDB()
  
  const totalUsers = await User.countDocuments()
  const totalRestaurants = await Restaurant.countDocuments()
  const totalOrders = await Order.countDocuments()
  const totalSubscriptions = await Subscription.countDocuments({ isActive: true })
  
  // Calculate revenue
  const orders = await Order.find({ paymentStatus: 'paid' })
  const totalRevenue = orders.reduce((sum, order) => sum + order.total, 0)
  
  // Get recent orders for charts and table
  const recentOrders = await Order.find()
    .sort({ createdAt: -1 })
    .limit(50)
    .populate('restaurantId', 'name')
  
  // Get subscription stats
  const subscriptions = await Subscription.find({ isActive: true })
  const subscriptionValue = subscriptions.reduce((total, sub) => {
    return total + (sub.billingPeriod === 'monthly' ? sub.price : sub.price * 12)
  }, 0)

  // Real trend data (month-over-month comparison)
  const userTrend = await getPeriodComparison(User, {})
  const restaurantTrend = await getPeriodComparison(Restaurant, {})
  const orderTrend = await getPeriodComparison(Order, {})
  const revenueTrend = await getRevenueComparison(Order, { paymentStatus: 'paid' })

  return {
    totalUsers,
    totalRestaurants,
    totalOrders,
    totalSubscriptions,
    totalRevenue,
    recentOrders,
    subscriptionValue,
    userTrend,
    restaurantTrend,
    orderTrend,
    revenueTrend,
  }
}

export default async function AdminDashboard() {
  const session = await getServerSession(authOptions)
  const stats = await getStats()

  const formatChange = (change: number, trend: 'up' | 'down' | 'flat') => {
    const sign = trend === 'up' ? '+' : trend === 'down' ? '' : ''
    return `${sign}${change}%`
  }

  const statCards = [
    {
      title: 'Total Users',
      value: stats.totalUsers,
      icon: Users,
      color: 'bg-blue-500',
      change: formatChange(stats.userTrend.change, stats.userTrend.trend),
      trend: stats.userTrend.trend
    },
    {
      title: 'Total Restaurants',
      value: stats.totalRestaurants,
      icon: UtensilsCrossed,
      color: 'bg-green-500',
      change: formatChange(stats.restaurantTrend.change, stats.restaurantTrend.trend),
      trend: stats.restaurantTrend.trend
    },
    {
      title: 'Total Orders',
      value: stats.totalOrders,
      icon: ShoppingCart,
      color: 'bg-purple-500',
      change: formatChange(stats.orderTrend.change, stats.orderTrend.trend),
      trend: stats.orderTrend.trend
    },
    {
      title: 'Total Revenue',
      value: `$${stats.totalRevenue.toFixed(2)}`,
      icon: DollarSign,
      color: 'bg-yellow-500',
      change: formatChange(stats.revenueTrend.change, stats.revenueTrend.trend),
      trend: stats.revenueTrend.trend
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
        <h1 className="text-3xl font-bold text-gray-900">Admin Dashboard</h1>
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
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Order Status Distribution</h3>
          <StatusBarChart orders={chartOrders} />
        </div>
      </div>

      {/* Additional Stats */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Active Subscriptions */}
        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-gray-900">Active Subscriptions</h3>
            <Activity className="text-gray-400" size={20} />
          </div>
          <div className="text-3xl font-bold text-gray-900 mb-2">{stats.totalSubscriptions}</div>
          <p className="text-sm text-gray-600">
            Subscription value: <span className="font-semibold text-green-600">${stats.subscriptionValue.toFixed(2)}</span>
          </p>
        </div>

        {/* Quick Actions */}
        <div className="bg-white rounded-lg shadow p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Quick Actions</h3>
          <div className="space-y-2">
            <a href="/admin/restaurants" className="block px-4 py-2 bg-blue-50 text-blue-600 rounded-lg hover:bg-blue-100 transition-colors">
              Manage Restaurants
            </a>
            <a href="/admin/subscriptions" className="block px-4 py-2 bg-green-50 text-green-600 rounded-lg hover:bg-green-100 transition-colors">
              Create Subscription Plan
            </a>
            <a href="/admin/users" className="block px-4 py-2 bg-purple-50 text-purple-600 rounded-lg hover:bg-purple-100 transition-colors">
              View All Users
            </a>
          </div>
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
                  Restaurant
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
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {order.restaurantId?.name || 'N/A'}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`px-2 py-1 text-xs font-medium rounded-full ${
                      order.status === 'completed' ? 'bg-green-100 text-green-800' :
                      order.status === 'pending' ? 'bg-yellow-100 text-yellow-800' :
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
