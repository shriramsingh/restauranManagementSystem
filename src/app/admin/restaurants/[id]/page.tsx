import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import connectDB from '@/lib/mongodb'
import Restaurant from '@/models/Restaurant'
import { notFound } from 'next/navigation'
import Link from 'next/link'

async function getRestaurant(id: string) {
  await connectDB()
  const restaurant = await Restaurant.findById(id)
    .populate('ownerId', 'name email')
    .populate('subscriptionId', 'name price features')
  
  return restaurant
}

export default async function RestaurantDetail({ params }: { params: { id: string } }) {
  const session = await getServerSession(authOptions)
  const restaurant = await getRestaurant(params.id)

  if (!restaurant) {
    notFound()
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">{restaurant.name}</h1>
          <p className="text-gray-600 mt-1">Restaurant Details</p>
        </div>
        <Link
          href="/admin/restaurants"
          className="bg-gray-100 text-gray-700 px-4 py-2 rounded-lg hover:bg-gray-200 transition-colors"
        >
          Back to List
        </Link>
      </div>

      {/* Restaurant Info */}
      <div className="bg-white rounded-lg shadow p-6">
        <h2 className="text-xl font-semibold text-gray-900 mb-4">Basic Information</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <p className="text-sm text-gray-600">Email</p>
            <p className="text-gray-900 font-medium">{restaurant.email}</p>
          </div>
          <div>
            <p className="text-sm text-gray-600">Phone</p>
            <p className="text-gray-900 font-medium">{restaurant.phone}</p>
          </div>
          <div>
            <p className="text-sm text-gray-600">Owner</p>
            <p className="text-gray-900 font-medium">{restaurant.ownerId?.name || 'N/A'}</p>
            <p className="text-sm text-gray-500">{restaurant.ownerId?.email || 'N/A'}</p>
          </div>
          <div>
            <p className="text-sm text-gray-600">Status</p>
            <span className={`px-2 py-1 text-xs font-medium rounded-full ${
              restaurant.subscriptionStatus === 'active' ? 'bg-green-100 text-green-800' :
              restaurant.subscriptionStatus === 'trial' ? 'bg-blue-100 text-blue-800' :
              'bg-red-100 text-red-800'
            }`}>
              {restaurant.subscriptionStatus}
            </span>
          </div>
        </div>
      </div>

      {/* Address */}
      <div className="bg-white rounded-lg shadow p-6">
        <h2 className="text-xl font-semibold text-gray-900 mb-4">Address</h2>
        <p className="text-gray-900">
          {restaurant.address.street}<br />
          {restaurant.address.city}, {restaurant.address.state} {restaurant.address.zipCode}<br />
          {restaurant.address.country}
        </p>
      </div>

      {/* Subscription */}
      <div className="bg-white rounded-lg shadow p-6">
        <h2 className="text-xl font-semibold text-gray-900 mb-4">Subscription Plan</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <p className="text-sm text-gray-600">Plan</p>
            <p className="text-gray-900 font-medium">{restaurant.subscriptionId?.name || 'N/A'}</p>
          </div>
          <div>
            <p className="text-sm text-gray-600">Price</p>
            <p className="text-gray-900 font-medium">${restaurant.subscriptionId?.price || 0}/mo</p>
          </div>
          <div>
            <p className="text-sm text-gray-600">Start Date</p>
            <p className="text-gray-900 font-medium">{new Date(restaurant.subscriptionStartDate).toLocaleDateString()}</p>
          </div>
          <div>
            <p className="text-sm text-gray-600">End Date</p>
            <p className="text-gray-900 font-medium">{new Date(restaurant.subscriptionEndDate).toLocaleDateString()}</p>
          </div>
        </div>
      </div>

      {/* Settings */}
      <div className="bg-white rounded-lg shadow p-6">
        <h2 className="text-xl font-semibold text-gray-900 mb-4">Settings</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <p className="text-sm text-gray-600">Currency</p>
            <p className="text-gray-900 font-medium">{restaurant.settings.currency}</p>
          </div>
          <div>
            <p className="text-sm text-gray-600">Tax Rate</p>
            <p className="text-gray-900 font-medium">{restaurant.settings.taxRate}%</p>
          </div>
          <div>
            <p className="text-sm text-gray-600">Online Orders</p>
            <p className="text-gray-900 font-medium">{restaurant.settings.allowOnlineOrders ? 'Enabled' : 'Disabled'}</p>
          </div>
          <div>
            <p className="text-sm text-gray-600">Table Reservation</p>
            <p className="text-gray-900 font-medium">{restaurant.settings.allowTableReservation ? 'Enabled' : 'Disabled'}</p>
          </div>
        </div>
      </div>
    </div>
  )
}