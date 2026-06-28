import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import connectDB from '@/lib/mongodb'
import Subscription from '@/models/Subscription'
import Link from 'next/link'

async function getSubscriptions() {
  await connectDB()
  const subscriptions = await Subscription.find().sort({ createdAt: -1 })
  return subscriptions
}

export default async function AdminSubscriptions() {
  const session = await getServerSession(authOptions)
  const subscriptions = await getSubscriptions()

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Subscription Plans</h1>
          <p className="text-gray-600 mt-1">Manage subscription plans for restaurants</p>
        </div>
        <Link
          href="/admin/subscriptions/create"
          className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors"
        >
          Create Plan
        </Link>
      </div>

      {/* Subscription Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {subscriptions.map((subscription: any) => (
          <div key={subscription._id.toString()} className="bg-white rounded-lg shadow-lg overflow-hidden">
            {subscription.isPopular && (
              <div className="bg-gradient-to-r from-blue-500 to-purple-600 text-white text-center py-2 text-sm font-medium">
                Most Popular
              </div>
            )}
            <div className="p-6">
              <h3 className="text-2xl font-bold text-gray-900 mb-2">{subscription.name}</h3>
              <p className="text-gray-600 mb-4">{subscription.description}</p>
              
              <div className="mb-6">
                <span className="text-4xl font-bold text-gray-900">${subscription.price}</span>
                <span className="text-gray-600">/{subscription.billingPeriod}</span>
              </div>

              <div className="space-y-3 mb-6">
                <div className="flex items-center text-sm">
                  <span className="text-gray-600">Restaurants:</span>
                  <span className="ml-auto font-medium text-gray-900">
                    {subscription.features.maxRestaurants === -1 ? 'Unlimited' : subscription.features.maxRestaurants}
                  </span>
                </div>
                <div className="flex items-center text-sm">
                  <span className="text-gray-600">Staff per Restaurant:</span>
                  <span className="ml-auto font-medium text-gray-900">
                    {subscription.features.maxStaffPerRestaurant === -1 ? 'Unlimited' : subscription.features.maxStaffPerRestaurant}
                  </span>
                </div>
                <div className="flex items-center text-sm">
                  <span className="text-gray-600">Storage:</span>
                  <span className="ml-auto font-medium text-gray-900">{subscription.features.storageGB} GB</span>
                </div>
              </div>

              <div className="border-t pt-4 mb-4">
                <p className="text-sm font-medium text-gray-900 mb-2">Features:</p>
                <ul className="space-y-2">
                  {subscription.features.features.slice(0, 4).map((feature: string, idx: number) => (
                    <li key={idx} className="flex items-start text-sm">
                      <svg className="w-5 h-5 text-green-500 mr-2 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                      </svg>
                      <span className="text-gray-600">{feature}</span>
                    </li>
                  ))}
                </ul>
              </div>

              <div className="flex gap-2">
                <Link
                  href={`/admin/subscriptions/${subscription._id}`}
                  className="flex-1 bg-blue-50 text-blue-600 text-center py-2 rounded-lg hover:bg-blue-100 transition-colors text-sm font-medium"
                >
                  View Details
                </Link>
                <Link
                  href={`/admin/subscriptions/${subscription._id}/edit`}
                  className="flex-1 bg-gray-100 text-gray-700 text-center py-2 rounded-lg hover:bg-gray-200 transition-colors text-sm font-medium"
                >
                  Edit
                </Link>
              </div>
            </div>
          </div>
        ))}
      </div>

      {subscriptions.length === 0 && (
        <div className="bg-white rounded-lg shadow p-12 text-center">
          <div className="text-gray-400 mb-4">
            <svg className="w-16 h-16 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z" />
            </svg>
          </div>
          <h3 className="text-lg font-medium text-gray-900 mb-2">No subscription plans</h3>
          <p className="text-gray-600 mb-4">Get started by creating your first subscription plan.</p>
          <Link
            href="/admin/subscriptions/create"
            className="inline-block bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 transition-colors"
          >
            Create First Plan
          </Link>
        </div>
      )}
    </div>
  )
}