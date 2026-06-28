import mongoose from 'mongoose'
import connectDB from './mongodb'
import Restaurant from '@/models/Restaurant'
import Subscription from '@/models/Subscription'
import Order from '@/models/Order'
import Staff from '@/models/Staff'

interface LimitCheckResult {
  allowed: boolean
  current: number
  limit: number
  message: string
}

/**
 * Check if a restaurant is within its subscription plan limits.
 * Returns -1 as limit means unlimited.
 */
async function checkLimit(
  restaurantId: string,
  type: 'orders' | 'staff' | 'restaurants'
): Promise<LimitCheckResult> {
  await connectDB()

  // Validate restaurantId is a valid ObjectId string
  if (!restaurantId || !mongoose.Types.ObjectId.isValid(restaurantId)) {
    return { allowed: false, current: 0, limit: 0, message: 'Invalid restaurant ID' }
  }

  // Find restaurant without populate (to avoid MissingSchemaError)
  const restaurant = await Restaurant.findById(restaurantId)

  if (!restaurant) {
    return { allowed: false, current: 0, limit: 0, message: 'Restaurant not found' }
  }

  // Manually look up subscription instead of populate
  const subscription = restaurant.subscriptionId
    ? await Subscription.findById(restaurant.subscriptionId)
    : null

  if (!subscription) {
    return { allowed: false, current: 0, limit: 0, message: 'No subscription found' }
  }

  let current = 0
  let limit = 0

  switch (type) {
    case 'orders': {
      const now = new Date()
      const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1)
      const endOfMonth = new Date(now.getFullYear(), now.getMonth() + 1, 1)
      current = await Order.countDocuments({
        restaurantId: new mongoose.Types.ObjectId(restaurantId),
        createdAt: { $gte: startOfMonth, $lt: endOfMonth },
      })
      limit = (subscription.features as any)?.maxOrdersPerMonth ?? -1
      break
    }
    case 'staff': {
      current = await Staff.countDocuments({
        restaurantId: new mongoose.Types.ObjectId(restaurantId),
        isActive: true,
      })
      limit = (subscription.features as any)?.maxStaffPerRestaurant ?? -1
      break
    }
    case 'restaurants': {
      // For restaurant owner creating additional restaurants
      const ownerId = restaurant.ownerId
      if (ownerId) {
        current = await Restaurant.countDocuments({ ownerId })
      } else {
        current = 1
      }
      limit = (subscription.features as any)?.maxRestaurants ?? -1
      break
    }
  }

  // -1 means unlimited
  if (limit === -1) {
    return { allowed: true, current, limit, message: 'Unlimited' }
  }

  if (current >= limit) {
    return {
      allowed: false,
      current,
      limit,
      message: `Limit reached: ${current}/${limit} ${type} used. Please upgrade your subscription.`,
    }
  }

  return {
    allowed: true,
    current,
    limit,
    message: `${current}/${limit} ${type} used`,
  }
}

export async function checkOrderLimit(restaurantId: string): Promise<LimitCheckResult> {
  return checkLimit(restaurantId, 'orders')
}

export async function checkStaffLimit(restaurantId: string): Promise<LimitCheckResult> {
  return checkLimit(restaurantId, 'staff')
}

export async function checkRestaurantLimit(ownerId: string): Promise<LimitCheckResult> {
  await connectDB()
  const restaurant = await Restaurant.findOne({ ownerId })
  if (!restaurant) {
    return { allowed: true, current: 0, limit: 0, message: 'No restaurant found' }
  }
  return checkLimit(restaurant._id.toString(), 'restaurants')
}

export async function getSubscriptionInfo(restaurantId: string) {
  await connectDB()
  const restaurant = await Restaurant.findById(restaurantId)
  if (!restaurant) return null

  const subscription = restaurant.subscriptionId
    ? await Subscription.findById(restaurant.subscriptionId)
    : null

  return {
    name: subscription?.name,
    status: restaurant.subscriptionStatus,
    endDate: restaurant.subscriptionEndDate,
    features: (subscription?.features as any),
  }
}
