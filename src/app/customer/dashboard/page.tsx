import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import connectDB from '@/lib/mongodb'
import Order from '@/models/Order'
import { 
  ShoppingCart, 
  Clock,
  CheckCircle,
  UtensilsCrossed
} from 'lucide-react'
import OrderStatusPieChart from '@/components/charts/OrderStatusPieChart'

async function getCustomerStats(customerId: string) {
  await connectDB()
  
  const totalOrders = await Order.countDocuments({ customerId })
  const pendingOrders = await Order.countDocuments({ 
    customerId, 
    status: { $in: ['pending', 'confirmed', 'preparing'] }
  })
  const completedOrders = await Order.countDocuments({ 
    customerId, 
    status: 'completed' 
  })
  
  const recentOrders = await Order.find({ customerId })
    .sort({ createdAt: -1 })
    .limit(50)

  return {
    totalOrders,
    pendingOrders,
    completedOrders,
    recentOrders,
  }
}

export default async function CustomerDashboard() {
  const session = await getServerSession(authOptions)
  
  if (!session?.user?.id) {
    return <div>Please sign in</div>
  }

  const stats = await getCustomerStats(session.user.id)

  const statCards = [
    {
      title: 'Total Orders',
      value: stats.totalOrders,
      icon: ShoppingCart,
      color: 'bg-blue-500',
    },
    {
      title: 'Active Orders',
      value: stats.pendingOrders,
      icon: Clock,
      color: 'bg-yellow-500',
    },
    {
      title: 'Completed Orders',
      value: stats.completedOrders,
      icon: CheckCircle,
      color: 'bg-green-500',
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
        <h1 className="text-3xl font-bold text-gray-900">Welcome!</h1>
        <p className="text-gray-600 mt-1">Hello, {session?.user?.name}. Ready to order?</p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {statCards.map((stat) => {
          const Icon = stat.icon
          return (
            <div key={stat.title} className="bg-white rounded-lg shadow p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600 mb-1">{stat.title}</p>
                  <p className="text-2xl font-bold text-gray-900">{stat.value}</p>
                </div>
                <div className={`${stat.color} p-4 rounded-lg`}>
                  <Icon className="text-white" size={24} />
                </div>
              </div>
            </div>
          )
        })}
      </div>

      {/* Order Status Chart */}
      {stats.recentOrders.length > 0 && (
        <div className="bg-white rounded-lg shadow p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Order Status Distribution</h3>
          <div className="max-w-md mx-auto">
            <OrderStatusPieChart orders={chartOrders} />
          </div>
        </div>
      )}

      {/* Quick Actions */}
      <div className="bg-white rounded-lg shadow p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Quick Actions</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <a
            href="/customer/menu"
            className="flex items-center gap-4 p-4 bg-blue-50 rounded-lg hover:bg-blue-100 transition-colors"
          >
            <div className="bg-blue-500 p-3 rounded-lg">
              <UtensilsCrossed className="text-white" size={24} />
            </div>
            <div>
              <h4 className="font-medium text-gray-900">Browse Menu</h4>
              <p className="text-sm text-gray-600">Explore our delicious offerings</p>
            </div>
          </a>
          <a
            href="/customer/orders"
            className="flex items-center gap-4 p-4 bg-green-50 rounded-lg hover:bg-green-100 transition-colors"
          >
            <div className="bg-green-500 p-3 rounded-lg">
              <ShoppingCart className="text-white" size={24} />
            </div>
            <div>
              <h4 className="font-medium text-gray-900">View Orders</h4>
              <p className="text-sm text-gray-600">Track your order history</p>
            </div>
          </a>
        </div>
      </div>

      {/* Recent Orders */}
      {stats.recentOrders.length > 0 && (
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
      )}
    </div>
  )
}
