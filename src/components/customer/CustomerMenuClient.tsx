'use client'

import { useState } from 'react'
import { CartProvider, useCart } from '@/components/customer/CartProvider'
import MenuItemCard from '@/components/customer/MenuItemCard'
import CartDrawer from '@/components/customer/CartDrawer'
import { ShoppingCart, Search } from 'lucide-react'

interface Category {
  _id: string
  name: string
  description: string
}

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
}

export default function CustomerMenuClient({
  restaurantId,
  initialCategories,
  initialItems,
}: {
  restaurantId: string
  initialCategories: Category[]
  initialItems: MenuItem[]
}) {
  return (
    <CartProvider>
      <MenuContent
        restaurantId={restaurantId}
        categories={initialCategories}
        items={initialItems}
      />
    </CartProvider>
  )
}

function MenuContent({
  restaurantId,
  categories,
  items,
}: {
  restaurantId: string
  categories: Category[]
  items: MenuItem[]
}) {
  const [searchQuery, setSearchQuery] = useState('')
  const [selectedCategory, setSelectedCategory] = useState('')
  const [cartOpen, setCartOpen] = useState(false)
  const { itemCount } = useCart()

  const filteredItems = items.filter((item) => {
    const matchesSearch = item.name.toLowerCase().includes(searchQuery.toLowerCase())
    const matchesCategory = !selectedCategory || item.categoryId === selectedCategory
    return matchesSearch && matchesCategory
  })

  return (
    <div className="space-y-6">
      {/* Header with Cart */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Our Menu</h1>
          <p className="text-gray-600 mt-1">Discover delicious dishes crafted with care</p>
        </div>
        <button
          onClick={() => setCartOpen(true)}
          className="relative bg-blue-600 text-white p-3 rounded-lg hover:bg-blue-700 transition-colors"
        >
          <ShoppingCart size={24} />
          {itemCount > 0 && (
            <span className="absolute -top-2 -right-2 bg-red-500 text-white text-xs font-bold w-5 h-5 rounded-full flex items-center justify-center">
              {itemCount}
            </span>
          )}
        </button>
      </div>

      {/* Search and Filter */}
      <div className="bg-white rounded-lg shadow p-4">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="md:col-span-2">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
              <input
                type="text"
                placeholder="Search menu items..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>
          </div>
          <div>
            <select
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="">All Categories</option>
              {categories.map((category) => (
                <option key={category._id} value={category._id}>
                  {category.name}
                </option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* Menu Categories and Items */}
      {categories.length === 0 ? (
        <div className="bg-white rounded-lg shadow p-12 text-center">
          <h3 className="text-lg font-medium text-gray-900 mb-2">No menu items available</h3>
          <p className="text-gray-600">Check back later for delicious offerings!</p>
        </div>
      ) : (
        <div className="space-y-8">
          {categories.map((category) => {
            const categoryItems = filteredItems.filter(
              (item) => item.categoryId === category._id
            )

            if (categoryItems.length === 0) return null

            return (
              <div key={category._id}>
                <div className="mb-4">
                  <h2 className="text-2xl font-bold text-gray-900">{category.name}</h2>
                  {category.description && (
                    <p className="text-gray-600 mt-1">{category.description}</p>
                  )}
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {categoryItems.map((item) => (
                    <MenuItemCard key={item._id} item={item} />
                  ))}
                </div>
              </div>
            )
          })}

          {filteredItems.length === 0 && (
            <div className="bg-white rounded-lg shadow p-12 text-center">
              <p className="text-gray-600">No items match your search.</p>
            </div>
          )}
        </div>
      )}

      <CartDrawer
        open={cartOpen}
        onClose={() => setCartOpen(false)}
        restaurantId={restaurantId}
      />
    </div>
  )
}
