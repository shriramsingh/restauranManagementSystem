import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import connectDB from '@/lib/mongodb'
import Table from '@/models/Table'
import OwnerTableManager from '@/components/owner/OwnerTableManager'
import { getRestaurantIdForOwner } from '@/lib/get-restaurant-id'

async function getTables(restaurantId: string) {
  await connectDB()
  const tables = await Table.find({ restaurantId }).sort({ tableNumber: 1 })
  return tables
}

export default async function OwnerTables() {
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

  const tables = await getTables(restaurantId)

  return (
    <OwnerTableManager
      initialTables={tables.map((t: any) => ({
        _id: t._id.toString(),
        tableNumber: t.tableNumber,
        capacity: t.capacity,
        status: t.status,
        location: t.location || undefined,
      }))}
    />
  )
}