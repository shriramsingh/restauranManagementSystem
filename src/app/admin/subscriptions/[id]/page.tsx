import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import connectDB from '@/lib/mongodb'
import Subscription from '@/models/Subscription'
import Link from 'next/link'
import { notFound } from 'next/navigation'

async function getSubscription(id: string) {
  await connectDB()
  const subscription = await Subscription.findById(id)
  return subscription
}

export default async function SubscriptionDetail({ params }: { params: { id: string } }) {
  const session = await getServerSession(authOptions)
  const subscription = await getSubscription(params.id)

  if (!subscription) {
    notFound()
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">{subscription.name}</h1>
          <p className="text-gray-600 mt-1">Subscription Plan Details</p>
        </div>
        <div className="flex gap-2">
          <Link href={`/admin/subscriptions/${params.id}/edit`} className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors">
            Edit Plan
          </Link>
          <Link href="/admin/subscriptions" className="bg-gray-100 text-gray-700 px-4 py-2 rounded-lg hover:bg-gray-200 transition-colors">
            Back to Plans
          </Link>
        </div>
      </div>

      <div className="bg-white rounded-lg shadow p-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <p className="text-sm text-gray-600">Description</p>
            <p className="text-gray-900 font-medium">{subscription.description}</p>
          </div>
          <div>
            <p className="text-sm text-gray-600">Price</p>
            <p className="text-gray-900 font-medium">${subscription.price}/{subscription.billingPeriod}</p>
          </div>
          <div>
            <p className="text-sm text-gray-600">Max Restaurants</p>
            <p className="text-gray-900 font-medium">{subscription.features?.maxRestaurants === -1 ? 'Unlimited' : subscription.features?.maxRestaurants}</p>
          </div>
          <div>
            <p className="text-sm text-gray-600">Max Staff per Restaurant</p>
            <p className="text-gray-900 font-medium">{subscription.features?.maxStaffPerRestaurant === -1 ? 'Unlimited' : subscription.features?.maxStaffPerRestaurant}</p>
          </div>
          <div>
            <p className="text-sm text-gray-600">Max Orders per Month</p>
            <p className="text-gray-900 font-medium">{subscription.features?.maxOrdersPerMonth === -1 ? 'Unlimited' : subscription.features?.maxOrdersPerMonth}</p>
          </div>
          <div>
            <p className="text-sm text-gray-600">Storage</p>
            <p className="text-gray-900 font-medium">{subscription.features?.storageGB} GB</p>
          </div>
          <div>
            <p className="text-sm text-gray-600">Status</p>
            <span className={`px-2 py-1 text-xs font-medium rounded-full ${subscription.isActive ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
              {subscription.isActive ? 'Active' : 'Inactive'}
            </span>
          </div>
          <div>
            <p className="text-sm text-gray-600">Popular</p>
            <span className={`px-2 py-1 text-xs font-medium rounded-full ${subscription.isPopular ? 'bg-blue-100 text-blue-800' : 'bg-gray-100 text-gray-800'}`}>
              {subscription.isPopular ? 'Yes' : 'No'}
            </span>
          </div>
        </div>
      </div>

      <div className="bg-white rounded-lg shadow p-6">
        <h2 className="text-xl font-semibold text-gray-900 mb-4">Features</h2>
        <ul className="space-y-2">
          {subscription.features?.features?.map((feature: string, idx: number) => (
            <li key={idx} className="flex items-start text-sm">
              <svg className="w-5 h-5 text-green-500 mr-2 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
              </svg>
              <span className="text-gray-600">{feature}</span>
            </li>
          ))}
        </ul>
      </div>
    </div>
  )
}
