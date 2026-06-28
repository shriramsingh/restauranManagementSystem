import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import connectDB from '@/lib/mongodb'
import Staff from '@/models/Staff'
import OwnerStaffManager from '@/components/owner/OwnerStaffManager'

async function getStaffMembers(restaurantId: string) {
  await connectDB()
  const staff = await Staff.find({ restaurantId })
    .populate('userId', 'name email phone')
    .sort({ createdAt: -1 })
  return staff
}

export default async function OwnerStaff() {
  const session = await getServerSession(authOptions)

  if (!session?.user?.restaurantId) {
    return <div>No restaurant assigned</div>
  }

  const staffMembers = await getStaffMembers(session.user.restaurantId)

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