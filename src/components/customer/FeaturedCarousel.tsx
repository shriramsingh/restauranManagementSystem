'use client'

import MenuItemCard from './MenuItemCard'

interface MenuItem {
  _id: string
  categoryId: string
  name: string
  description: string
  price: number
  isVegetarian: boolean
  isVegan: boolean
  isGlutenFree: boolean
  spiceLevel: string
  preparationTime: number
  images: string[]
  isFeatured: boolean
}

interface Restaurant {
  _id: string
  name: string
  settings: {
    currency: string
  }
}

export default function FeaturedCarousel({
  items,
  restaurant,
}: {
  items: MenuItem[]
  restaurant: Restaurant
}) {
  if (items.length === 0) return null

  return (
    <div className="space-y-4">
      <div>
        <h2 className="text-2xl font-bold text-gray-900">Specials & Promotions</h2>
        <p className="text-gray-600 mt-1">Don&apos;t miss out on our featured items!</p>
      </div>
      <div className="relative">
        <div className="flex space-x-6 overflow-x-auto pb-4 -mb-4">
          {items.map((item) => (
            <div key={item._id} className="min-w-[300px] flex-shrink-0">
              <MenuItemCard
                item={item}
                currency={restaurant.settings?.currency || 'USD'}
              />
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
