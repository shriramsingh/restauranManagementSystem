'use client'

import { useCart } from '@/components/customer/CartProvider'
import { UtensilsCrossed } from 'lucide-react'

interface MenuItem {
  _id: string
  name: string
  description?: string
  price: number
  isVegetarian?: boolean
  isVegan?: boolean
  isGlutenFree?: boolean
  spiceLevel?: string
  preparationTime?: number
  images?: string[]
}

export default function MenuItemCard({ item }: { item: MenuItem }) {
  const { addItem, items } = useCart()
  const inCart = items.find((i) => i.menuItemId === item._id)

  const handleAdd = () => {
    addItem({
      menuItemId: item._id,
      name: item.name,
      price: item.price,
    })
  }

  return (
    <div className="bg-white rounded-lg shadow overflow-hidden hover:shadow-lg transition-shadow">
      <div className="h-48 bg-gradient-to-br from-blue-100 to-purple-100 flex items-center justify-center">
        {item.images && item.images.length > 0 ? (
          <img
            src={item.images[0]}
            alt={item.name}
            className="w-full h-full object-cover"
          />
        ) : (
          <UtensilsCrossed className="w-16 h-16 text-gray-400" />
        )}
      </div>

      <div className="p-4">
        <div className="flex justify-between items-start mb-2">
          <h3 className="text-lg font-semibold text-gray-900">{item.name}</h3>
          <span className="text-lg font-bold text-blue-600">${item.price.toFixed(2)}</span>
        </div>

        {item.description && (
          <p className="text-sm text-gray-600 mb-3 line-clamp-2">{item.description}</p>
        )}

        <div className="flex flex-wrap gap-2 mb-3">
          {item.isVegetarian && (
            <span className="px-2 py-1 bg-green-100 text-green-800 text-xs rounded-full">Vegetarian</span>
          )}
          {item.isVegan && (
            <span className="px-2 py-1 bg-green-100 text-green-800 text-xs rounded-full">Vegan</span>
          )}
          {item.isGlutenFree && (
            <span className="px-2 py-1 bg-yellow-100 text-yellow-800 text-xs rounded-full">Gluten Free</span>
          )}
          {item.spiceLevel && (
            <span className="px-2 py-1 bg-red-100 text-red-800 text-xs rounded-full">{item.spiceLevel}</span>
          )}
        </div>

        {item.preparationTime && (
          <p className="text-sm text-gray-500 mb-3">{item.preparationTime} mins prep</p>
        )}

        <button
          onClick={handleAdd}
          className={`w-full py-2 rounded-lg transition-colors ${
            inCart
              ? 'bg-green-600 text-white hover:bg-green-700'
              : 'bg-blue-600 text-white hover:bg-blue-700'
          }`}
        >
          {inCart ? `Added (${inCart.quantity})` : 'Add to Order'}
        </button>
      </div>
    </div>
  )
}
