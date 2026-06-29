import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import connectDB from '@/lib/mongodb'
import Table from '@/models/Table'
import { Table2 } from 'lucide-react'
import StaffTableActions from '@/components/staff/StaffTableActions'
import AutoRefresh from '@/components/AutoRefresh'
import { getRestaurantIdForOwner } from '@/lib/get-restaurant-id'

async function getStaffTables(restaurantId: string) {
  await connectDB()
  const tables = await Table.find({ restaurantId }).sort({ tableNumber: 1 })
  return tables
}

export default async function StaffTables() {
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

  const tables = await getStaffTables(restaurantId)

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-gray-900">Table Status</h1>
        <p className="text-gray-600 mt-1">Monitor and manage table status</p>
      </div>

      <AutoRefresh intervalMs={30000}>
        {/* Tables Grid */}
        {tables.length === 0 ? (
          <div className="bg-white rounded-lg shadow p-12 text-center">
            <Table2 className="w-16 h-16 mx-auto text-gray-400 mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">No tables configured</h3>
            <p className="text-gray-600">Tables will appear here once configured by the owner.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
            {tables.map((table: any) => (
              <StaffTableActions
                key={table._id.toString()}
                table={{
                  _id: table._id.toString(),
                  tableNumber: table.tableNumber,
                  capacity: table.capacity,
                  status: table.status,
                  location: table.location || undefined,
                }}
              />
            ))}
          </div>
        )}
      </AutoRefresh>
    </div>
  )
}