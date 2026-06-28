import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import connectDB from '@/lib/mongodb'
import Restaurant from '@/models/Restaurant'
import { Settings } from 'lucide-react'

export default async function OwnerSettings() {
  const session = await getServerSession(authOptions)
  
  if (!session?.user?.restaurantId) {
    return <div>No restaurant assigned</div>
  }

  await connectDB()
  const restaurant = await Restaurant.findById(session.user.restaurantId)

  if (!restaurant) {
    return <div>Restaurant not found</div>
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-gray-900">Restaurant Settings</h1>
        <p className="text-gray-600 mt-1">Manage your restaurant profile and settings</p>
      </div>

      {/* Restaurant Info */}
      <div className="bg-white rounded-lg shadow p-6">
        <h2 className="text-xl font-semibold text-gray-900 mb-4">Restaurant Information</h2>
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Restaurant Name</label>
            <input
              type="text"
              defaultValue={restaurant.name}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Email</label>
            <input
              type="email"
              defaultValue={restaurant.email}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Phone</label>
            <input
              type="tel"
              defaultValue={restaurant.phone}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Description</label>
            <textarea
              rows={3}
              defaultValue={restaurant.description}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>

          <button className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 transition-colors">
            Save Changes
          </button>
        </div>
      </div>

      {/* Subscription Info */}
      <div className="bg-white rounded-lg shadow p-6">
        <h2 className="text-xl font-semibold text-gray-900 mb-4">Subscription Details</h2>
        <div className="space-y-2">
          <p className="text-sm text-gray-600">Status: <span className="font-medium text-gray-900 capitalize">{restaurant.subscriptionStatus}</span></p>
          <p className="text-sm text-gray-600">Start Date: <span className="font-medium text-gray-900">{new Date(restaurant.subscriptionStartDate).toLocaleDateString()}</span></p>
          <p className="text-sm text-gray-600">End Date: <span className="font-medium text-gray-900">{new Date(restaurant.subscriptionEndDate).toLocaleDateString()}</span></p>
        </div>
      </div>
    </div>
  )
}