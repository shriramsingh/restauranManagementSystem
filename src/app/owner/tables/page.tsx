import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import connectDB from '@/lib/mongodb'
import Table from '@/models/Table'
import OwnerTableManager from '@/components/owner/OwnerTableManager'

async function getTables(restaurantId: string) {
  await connectDB()
  const tables = await Table.find({ restaurantId }).sort({ tableNumber: 1 })
  return tables
}

export default async function OwnerTables() {
  const session = await getServerSession(authOptions)

  if (!session?.user?.restaurantId) {
    return <div>No restaurant assigned</div>
  }

  const tables = await getTables(session.user.restaurantId)

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