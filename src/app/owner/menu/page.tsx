import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import connectDB from '@/lib/mongodb'
import MenuCategory from '@/models/MenuCategory'
import MenuItem from '@/models/MenuItem'
import OwnerMenuManager from '@/components/owner/OwnerMenuManager'
import { getRestaurantIdForOwner } from '@/lib/get-restaurant-id'

async function getMenuData(restaurantId: string) {
  await connectDB()
  const categories = await MenuCategory.find({ restaurantId }).sort({ sortOrder: 1 })
  const menuItems = await MenuItem.find({ restaurantId }).sort({ sortOrder: 1 })
  return { categories, menuItems }
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

  const { categories, menuItems } = await getMenuData(restaurantId)

  return (
    <OwnerMenuManager
      initialCategories={categories.map((c: any) => ({
        _id: c._id.toString(),
        name: c.name,
        description: c.description || undefined,
      }))}
      initialItems={menuItems.map((i: any) => ({
        _id: i._id.toString(),
        categoryId: i.categoryId.toString(),
        name: i.name,
        description: i.description || '',
        price: i.price,
        isVegetarian: i.isVegetarian || false,
        isAvailable: i.isAvailable !== false,
        preparationTime: i.preparationTime || undefined,
      }))}
    />
  )
}