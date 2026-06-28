import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import connectDB from '@/lib/mongodb'
import MenuCategory from '@/models/MenuCategory'
import MenuItem from '@/models/MenuItem'
import OwnerMenuManager from '@/components/owner/OwnerMenuManager'

async function getMenuData(restaurantId: string) {
  await connectDB()

  const categories = await MenuCategory.find({ restaurantId }).sort({ sortOrder: 1 })
  const menuItems = await MenuItem.find({ restaurantId }).sort({ sortOrder: 1 })

  return { categories, menuItems }
}

export default async function OwnerMenu() {
  const session = await getServerSession(authOptions)

  if (!session?.user?.restaurantId) {
    return <div>No restaurant assigned</div>
  }

  const { categories, menuItems } = await getMenuData(session.user.restaurantId)

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