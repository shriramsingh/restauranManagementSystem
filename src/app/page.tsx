import { redirect } from 'next/navigation'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import connectDB from '@/lib/mongodb'
import User from '@/models/User'

export default async function Home() {
  const session = await getServerSession(authOptions)
  
  if (session) {
    const role = session.user?.role
    
    switch (role) {
      case 'super_admin':
        redirect('/admin/dashboard')
      case 'restaurant_owner':
        redirect('/owner/dashboard')
      case 'staff':
        redirect('/staff/dashboard')
      case 'customer':
        redirect('/customer/dashboard')
      default:
        redirect('/auth/signin')
    }
  }

  // Check if database is seeded
  try {
    await connectDB()
    const userCount = await User.countDocuments()
    
    if (userCount === 0) {
      redirect('/setup')
    } else {
      redirect('/auth/signin')
    }
  } catch (error) {
    // If database connection fails, redirect to setup
    redirect('/setup')
  }
}
