import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import connectDB from '@/lib/mongodb'
import MenuCategory from '@/models/MenuCategory'
import MenuItem from '@/models/MenuItem'
import Restaurant from '@/models/Restaurant'
import OwnerMenuManager from '@/components/owner/OwnerMenuManager'
import { getRestaurantIdForOwner } from '@/lib/get-restaurant-id'

async function getMenuData(restaurantId: string) {
  await connectDB()
  // Fetch all data in parallel
  const [categories, menuItems, restaurant] = await Promise.all([
    MenuCategory.find({ restaurantId }).sort({ sortOrder: 1 }).lean(),
    MenuItem.find({ restaurantId }).sort({ sortOrder: 1 }).lean(),
    Restaurant.findById(restaurantId).select('settings.currency').lean(),
  ]);
  return { categories, menuItems, restaurant }
}

export default async function OwnerMenu() {
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

  const { categories, menuItems, restaurant } = await getMenuData(restaurantId)

  const currency = (restaurant as any)?.settings?.currency || '₹'

  return (
    <OwnerMenuManager
      initialCategories={JSON.parse(JSON.stringify(categories))}
      initialItems={JSON.parse(JSON.stringify(menuItems))}
      currency={currency}
    />
  )
}