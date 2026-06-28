import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import connectDB from '@/lib/mongodb'
import MenuCategory from '@/models/MenuCategory'
import MenuItem from '@/models/MenuItem'
import CustomerMenuClient from '@/components/customer/CustomerMenuClient'

async function getMenuData(restaurantId: string) {
  await connectDB()

  const categories = await MenuCategory.find({
    restaurantId,
    isActive: true
  }).sort({ sortOrder: 1 })

  const menuItems = await MenuItem.find({
    restaurantId,
    isAvailable: true
  }).sort({ sortOrder: 1 })

  return { categories, menuItems }
}

export default async function CustomerMenu() {
  const session = await getServerSession(authOptions)

  let restaurantId = process.env.NEXT_PUBLIC_DEFAULT_RESTAURANT_ID

  if (!restaurantId || restaurantId === 'placeholder') {
    await connectDB()
    const Restaurant = (await import('@/models/Restaurant')).default
    const firstRestaurant = await Restaurant.findOne()

    if (!firstRestaurant) {
      return (
        <div className="min-h-screen flex items-center justify-center">
          <div className="text-center">
            <h3 className="text-lg font-medium text-gray-900 mb-2">No restaurants available</h3>
            <p className="text-gray-600">Please check back later.</p>
          </div>
        </div>
      )
    }

    restaurantId = firstRestaurant._id.toString()
  }

  if (!restaurantId) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h3 className="text-lg font-medium text-gray-900 mb-2">No restaurants available</h3>
          <p className="text-gray-600">Please check back later.</p>
        </div>
      </div>
    )
  }

  const { categories, menuItems } = await getMenuData(restaurantId)

  return (
    <CustomerMenuClient
      restaurantId={restaurantId}
      initialCategories={categories.map((c: any) => ({
        _id: c._id.toString(),
        name: c.name,
        description: c.description || '',
      }))}
      initialItems={menuItems.map((i: any) => ({
        _id: i._id.toString(),
        categoryId: i.categoryId.toString(),
        name: i.name,
        description: i.description || '',
        price: i.price,
        isVegetarian: i.isVegetarian || false,
        isVegan: i.isVegan || false,
        isGlutenFree: i.isGlutenFree || false,
        spiceLevel: i.spiceLevel || '',
        preparationTime: i.preparationTime || 0,
        images: i.images || [],
      }))}
    />
  )
}
