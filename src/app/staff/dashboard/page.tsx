import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import connectDB from '@/lib/mongodb'
import Order from '@/models/Order'
import Table from '@/models/Table'
import { 
  ShoppingCart, 
  Clock,
  CheckCircle,
  AlertCircle
} from 'lucide-react'

async function getStaffStats(restaurantId: string) {
  await connectDB()
  
  const pendingOrders = await Order.countDocuments({ 
    restaurantId, 
    status: 'pending' 
  })
  
  const preparingOrders = await Order.countDocuments({ 
    restaurantId, 
    status: 'preparing' 
  })
  
  const readyOrders = await Order.countDocuments({ 
    restaurantId, 
    status: 'ready' 
  })
  
  const totalOrders = await Order.countDocuments({ restaurantId })
  
  const availableTables = await Table.countDocuments({ 
    restaurantId, 
    status: 'available' 
  })
  
  const occupiedTables = await Table.countDocuments({ 
    restaurantId, 
    status: 'occupied' 
  })

  const recentOrders = await Order.find({ restaurantId })
    .sort({ createdAt: -1 })
    .limit(10)

  return {
    pendingOrders,
    preparingOrders,
    readyOrders,
    totalOrders,
    availableTables,
    occupiedTables,
    recentOrders,
  }
}

export default async function StaffDashboard() {
  const session = await getServerSession(authOptions)
  
  if (!session?.user?.restaurantId) {
    return <div>No restaurant assigned</div>
  }

  const stats = await getStaffStats(session.user.restaurantId)

  const statCards = [
    {
      title: 'Pending Orders',
      value: stats.pendingOrders,
      icon: AlertCircle,
      color: 'bg-yellow-500',
    },
    {
      title: 'Preparing',
      value: stats.preparingOrders,
      icon: Clock,
      color: 'bg-blue-500',
    },
    {
      title: 'Ready to Serve',
      value: stats.readyOrders,
      icon: CheckCircle,
      color: 'bg-green-500',
    },
    {
      title: 'Total Orders Today',
      value: stats.totalOrders,
      icon: ShoppingCart,
      color: 'bg-purple-500',
    },
  ]

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-gray-900">Staff Dashboard</h1>
        <p className="text-gray-600 mt-1">Welcome, {session?.user?.name}</p>
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
                </div>
                <div className={`${stat.color} p-4 rounded-lg`}>
                  <Icon className="text-white" size={24} />
                </div>
              </div>
            </div>
          )
        })}
      </div>

      {/* Table Status */}
      <div className="bg-white rounded-lg shadow p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Table Status</h3>
        <div className="grid grid-cols-2 gap-4">
          <div className="bg-green-50 border border-green-200 rounded-lg p-4">
            <div className="text-2xl font-bold text-green-900">{stats.availableTables}</div>
            <div className="text-sm text-green-700">Available Tables</div>
          </div>
          <div className="bg-red-50 border border-red-200 rounded-lg p-4">
            <div className="text-2xl font-bold text-red-900">{stats.occupiedTables}</div>
            <div className="text-sm text-red-700">Occupied Tables</div>
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
                  Type
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Status
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Total
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Time
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {stats.recentOrders.map((order: any) => (
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
                      order.status === 'ready' ? 'bg-purple-100 text-purple-800' :
                      'bg-gray-100 text-gray-800'
                    }`}>
                      {order.status}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    ${order.total.toFixed(2)}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {new Date(order.createdAt).toLocaleTimeString()}
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