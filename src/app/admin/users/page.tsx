import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import connectDB from '@/lib/mongodb'
import User from '@/models/User'
import AdminUsersClient from '@/components/admin/AdminUsersClient'

async function getAllUsers() {
  await connectDB()
  const users = await User.find()
    .select('-password')
    .sort({ createdAt: -1 })
    .limit(200)
  return users
}

export default async function AdminUsers() {
  const session = await getServerSession(authOptions)
  if (session?.user?.role !== 'super_admin') {
    return <div className="p-8 text-red-600">Unauthorized</div>
  }

  const users = await getAllUsers()

  return (
    <AdminUsersClient
      initialUsers={users.map((u: any) => ({
        _id: u._id.toString(),
        name: u.name,
        email: u.email,
        role: u.role,
        phone: u.phone || '',
        isActive: u.isActive,
        createdAt: u.createdAt.toISOString(),
      }))}
    />
  )
}
