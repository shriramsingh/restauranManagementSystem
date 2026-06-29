import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import connectDB from '@/lib/mongodb'
import Staff from '@/models/Staff'
import Restaurant from '@/models/Restaurant'
import OwnerStaffManager from '@/components/owner/OwnerStaffManager'

async function getRestaurantIdForOwner(session: any): Promise<string | null> {
  await connectDB()
  
  // If session has restaurantId, use it
  if (session?.user?.restaurantId) {
    return session.user.restaurantId
  }
  
  // Fallback: look up restaurant by ownerId
  if (session?.user?.id) {
    const restaurant = await Restaurant.findOne({ ownerId: session.user.id })
    if (restaurant) {
      return restaurant._id.toString()
    }
  }
  
  return null
}

async function getStaffMembers(restaurantId: string) {
  await connectDB()
  const staff = await Staff.find({ restaurantId })
    .populate('userId', 'name email phone')
    .sort({ createdAt: -1 })
  return staff
}

export default async function OwnerStaff() {
  const session = await getServerSession(authOptions)
  
  const restaurantId = await getRestaurantIdForOwner(session)
  
  if (!restaurantId) {
    return (
      <div className="bg-white rounded-lg shadow p-12 text-center">
        <h3 className="text-lg font-medium text-gray-900 mb-2">No restaurant assigned</h3>
        <p className="text-gray-600 mb-4">Please log out and log back in, or contact your administrator.</p>
      </div>
    )
  }

  const staffMembers = await getStaffMembers(restaurantId)

  return (
    <OwnerStaffManager
      initialStaff={staffMembers.map((s: any) => ({
        _id: s._id.toString(),
        userId: s.userId
          ? {
              _id: s.userId._id?.toString(),
              name: s.userId.name || '',
              email: s.userId.email || '',
              phone: s.userId.phone || undefined,
            }
          : null,
        employeeId: s.employeeId,
        position: s.position,
        department: s.department,
        salary: s.salary || 0,
        isActive: s.isActive,
      }))}
    />
  )
}