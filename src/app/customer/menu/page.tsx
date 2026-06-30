import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import connectDB from '@/lib/mongodb'
import MenuCategory from '@/models/MenuCategory'
import MenuItem from '@/models/MenuItem'
import Restaurant from '@/models/Restaurant'
import CustomerMenuClient from '@/components/customer/CustomerMenuClient'

async function getMenuData(restaurantId: string) {
  await connectDB()

  // Fetch all data in parallel
  const [categories, menuItems, restaurant] = await Promise.all([
    MenuCategory.find({ restaurantId, isActive: true }).sort({ sortOrder: 1 }).lean(),
    MenuItem.find({ restaurantId, isAvailable: true }).sort({ sortOrder: 1 }).lean(),
    Restaurant.findById(restaurantId).lean(),
  ]);

  return { categories, menuItems, restaurant }
}

export default async function CustomerMenu() {
  const session = await getServerSession(authOptions)

  let restaurantId = process.env.NEXT_PUBLIC_DEFAULT_RESTAURANT_ID
  let restaurant = null;

  await connectDB()

  if (!restaurantId || restaurantId === 'placeholder') {
    const firstRestaurant = await Restaurant.findOne().lean() as any
    if (firstRestaurant && firstRestaurant._id) {
      restaurant = firstRestaurant
      restaurantId = firstRestaurant._id.toString()
    }
  } else {
    restaurant = await Restaurant.findById(restaurantId).lean() as any
  }

  if (!restaurantId || !restaurant) {
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
      restaurant={JSON.parse(JSON.stringify(restaurant))}
      initialCategories={JSON.parse(JSON.stringify(categories))}
      initialItems={JSON.parse(JSON.stringify(menuItems))}
    />
  )
}
