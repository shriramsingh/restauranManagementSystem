import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { Settings } from 'lucide-react'

export default async function AdminSettings() {
  const session = await getServerSession(authOptions)

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-gray-900">System Settings</h1>
        <p className="text-gray-600 mt-1">Manage application-wide settings</p>
      </div>

      {/* General Settings */}
      <div className="bg-white rounded-lg shadow p-6">
        <h2 className="text-xl font-semibold text-gray-900 mb-4">General Settings</h2>
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Application Name</label>
            <input
              type="text"
              defaultValue="Restaurant Management System"
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Support Email</label>
            <input
              type="email"
              defaultValue="support@restaurantmanagement.com"
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>

          <button className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 transition-colors">
            Save Settings
          </button>
        </div>
      </div>

      {/* System Information */}
      <div className="bg-white rounded-lg shadow p-6">
        <h2 className="text-xl font-semibold text-gray-900 mb-4">System Information</h2>
        <div className="space-y-2">
          <p className="text-sm text-gray-600">Version: <span className="font-medium text-gray-900">1.0.0</span></p>
          <p className="text-sm text-gray-600">Database: <span className="font-medium text-gray-900">MongoDB</span></p>
          <p className="text-sm text-gray-600">Environment: <span className="font-medium text-gray-900">Development</span></p>
        </div>
      </div>
    </div>
  )
}