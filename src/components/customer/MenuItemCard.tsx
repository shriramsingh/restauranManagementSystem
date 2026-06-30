'use client'

import { useCart } from '@/components/customer/CartProvider'
import { UtensilsCrossed, Minus, Plus, Trash2, Star } from 'lucide-react'

interface MenuItem {
  _id: string
  name: string
  description?: string
  price: number
  isVegetarian?: boolean
  isVegan?: boolean
  isGlutenFree?: boolean
  isFeatured?: boolean
  spiceLevel?: string
  preparationTime?: number
  images?: string[]
}

export default function MenuItemCard({ item, currency }: { item: MenuItem, currency: string }) {
  const { addItem, updateQuantity, items } = useCart()
  const inCart = items.find((i) => i.menuItemId === item._id)

  const handleAdd = () => {
    addItem({
      menuItemId: item._id,
      name: item.name,
      price: item.price,
    })
  }

  return (
    <div className="bg-white rounded-lg shadow overflow-hidden hover:shadow-lg transition-shadow flex flex-col">
      <div className="relative h-48 bg-gradient-to-br from-blue-100 to-purple-100 flex items-center justify-center">
        {item.isFeatured && (
          <div className="absolute top-2 right-2 bg-yellow-400 text-gray-900 text-xs font-bold px-2 py-1 rounded-full flex items-center gap-1">
            <Star size={12} />
            Featured
          </div>
        )}
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

      <div className="p-4 flex-1 flex flex-col">
        <div className="flex justify-between items-start mb-2">
          <h3 className="text-lg font-semibold text-gray-900">{item.name}</h3>
          <span className="text-lg font-bold text-blue-600">{currency}{item.price.toFixed(2)}</span>
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
        
        <div className="mt-auto">
          {inCart ? (
            <div className="flex items-center justify-between w-full">
              <button
                onClick={() => updateQuantity(item._id, inCart.quantity - 1)}
                className="bg-gray-200 text-gray-700 hover:bg-gray-300 w-10 h-10 rounded-full transition-colors flex items-center justify-center"
                aria-label="Remove one item"
              >
                {inCart.quantity === 1 ? <Trash2 size={16} /> : <Minus size={16} />}
              </button>
              <span className="font-bold text-lg">{inCart.quantity}</span>
              <button
                onClick={() => updateQuantity(item._id, inCart.quantity + 1)}
                className="bg-gray-200 text-gray-700 hover:bg-gray-300 w-10 h-10 rounded-full transition-colors flex items-center justify-center"
                aria-label="Add one item"
              >
                <Plus size={16} />
              </button>
            </div>
          ) : (
            <button
              onClick={handleAdd}
              className="w-full py-2 rounded-lg transition-colors bg-blue-600 text-white hover:bg-blue-700"
            >
              Add to Order
            </button>
          )}
        </div>
      </div>
    </div>
  )
}
