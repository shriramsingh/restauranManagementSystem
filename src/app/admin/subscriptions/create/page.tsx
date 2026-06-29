'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'

export default function CreateSubscription() {
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const [form, setForm] = useState({
    name: '',
    description: '',
    price: '',
    billingPeriod: 'monthly',
    maxRestaurants: '1',
    maxStaffPerRestaurant: '5',
    maxOrdersPerMonth: '500',
    storageGB: '5',
    features: '',
    isActive: true,
    isPopular: false,
  })

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError('')

    try {
      const res = await fetch('/api/subscriptions', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...form,
          price: Number(form.price),
          features: {
            maxRestaurants: Number(form.maxRestaurants),
            maxStaffPerRestaurant: Number(form.maxStaffPerRestaurant),
            maxOrdersPerMonth: Number(form.maxOrdersPerMonth),
            storageGB: Number(form.storageGB),
            features: form.features.split('\n').filter(f => f.trim()),
          },
        }),
      })

      const data = await res.json()
      if (!res.ok) {
        setError(data.error || 'Failed to create subscription')
        setLoading(false)
        return
      }

      router.push('/admin/subscriptions')
    } catch {
      setError('An error occurred. Please try again.')
      setLoading(false)
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Create Subscription Plan</h1>
          <p className="text-gray-600 mt-1">Add a new subscription plan for restaurants</p>
        </div>
        <Link href="/admin/subscriptions" className="bg-gray-100 text-gray-700 px-4 py-2 rounded-lg hover:bg-gray-200 transition-colors">
          Back to Plans
        </Link>
      </div>

      <div className="bg-white rounded-lg shadow p-6 max-w-2xl">
        <form onSubmit={handleSubmit} className="space-y-6">
          {error && (
            <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded">
              {error}
            </div>
          )}

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Plan Name *</label>
              <input type="text" required value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Price ($) *</label>
              <input type="number" required value={form.price} onChange={(e) => setForm({ ...form, price: e.target.value })} className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500" />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Description</label>
            <textarea value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} rows={3} className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500" />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Billing Period</label>
              <select value={form.billingPeriod} onChange={(e) => setForm({ ...form, billingPeriod: e.target.value })} className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500">
                <option value="monthly">Monthly</option>
                <option value="yearly">Yearly</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Max Restaurants (-1 for unlimited)</label>
              <input type="number" value={form.maxRestaurants} onChange={(e) => setForm({ ...form, maxRestaurants: e.target.value })} className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Max Staff per Restaurant (-1 for unlimited)</label>
              <input type="number" value={form.maxStaffPerRestaurant} onChange={(e) => setForm({ ...form, maxStaffPerRestaurant: e.target.value })} className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Max Orders per Month (-1 for unlimited)</label>
              <input type="number" value={form.maxOrdersPerMonth} onChange={(e) => setForm({ ...form, maxOrdersPerMonth: e.target.value })} className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Storage (GB)</label>
              <input type="number" value={form.storageGB} onChange={(e) => setForm({ ...form, storageGB: e.target.value })} className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500" />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Features (one per line)</label>
            <textarea value={form.features} onChange={(e) => setForm({ ...form, features: e.target.value })} rows={5} placeholder="Basic menu management&#10;Order management&#10;Email support" className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500" />
          </div>

          <div className="flex items-center gap-4">
            <label className="flex items-center gap-2">
              <input type="checkbox" checked={form.isPopular} onChange={(e) => setForm({ ...form, isPopular: e.target.checked })} className="rounded" />
              <span className="text-sm text-gray-700">Mark as Popular</span>
            </label>
          </div>

          <div className="flex gap-4">
            <button type="submit" disabled={loading} className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 disabled:opacity-50 transition-colors">
              {loading ? 'Creating...' : 'Create Plan'}
            </button>
            <Link href="/admin/subscriptions" className="bg-gray-100 text-gray-700 px-6 py-2 rounded-lg hover:bg-gray-200 transition-colors">
              Cancel
            </Link>
          </div>
        </form>
      </div>
    </div>
  )
}
