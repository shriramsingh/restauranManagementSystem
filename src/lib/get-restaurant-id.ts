import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import connectDB from '@/lib/mongodb'
import Restaurant from '@/models/Restaurant'

/**
 * Get the restaurant ID for the current owner from session or DB fallback.
 * This handles stale JWTs that don't include restaurantId.
 */
export async function getRestaurantIdForOwner(): Promise<string | null> {
  const session = await getServerSession(authOptions)
  
  if (session?.user?.restaurantId) {
    return session.user.restaurantId
  }
  
  if (session?.user?.id) {
    await connectDB()
    const restaurant = await Restaurant.findOne({ ownerId: session.user.id })
    if (restaurant) {
      return restaurant._id.toString()
    }
  }
  
  return null
}

/**
 * Get the restaurant ID for staff members (from session).
 */
export async function getRestaurantIdForStaff(): Promise<string | null> {
  const session = await getServerSession(authOptions)
  return session?.user?.restaurantId || null
}
