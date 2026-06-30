import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import connectDB from '@/lib/mongodb'
import Restaurant from '@/models/Restaurant'
import { Settings } from 'lucide-react'
import { getRestaurantIdForOwner } from '@/lib/get-restaurant-id'

import OwnerSettingsForm from '@/components/owner/OwnerSettingsForm'

export default async function OwnerSettings() {
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

  await connectDB()
  const restaurant = await Restaurant.findById(restaurantId).lean() as any

  if (!restaurant) {
    return (
      <div className="bg-white rounded-lg shadow p-12 text-center">
        <h3 className="text-lg font-medium text-gray-900 mb-2">Restaurant not found</h3>
        <p className="text-gray-600 mb-4">The restaurant data could not be loaded.</p>
      </div>
    )
  }

  // The lean object is serializable and can be passed to the client component.
  const plainRestaurant = JSON.parse(JSON.stringify(restaurant));

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-gray-900">Restaurant Settings</h1>
        <p className="text-gray-600 mt-1">Manage your restaurant profile and settings</p>
      </div>

      {/* Restaurant Info Form */}
      <OwnerSettingsForm restaurant={plainRestaurant} />

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