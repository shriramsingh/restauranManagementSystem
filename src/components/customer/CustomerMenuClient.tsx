'use client'

import { useState, useMemo } from 'react'
import MenuItemCard from '@/components/customer/MenuItemCard'
import CartDrawer from '@/components/customer/CartDrawer'
import { ShoppingCart, Search } from 'lucide-react'
import { useCart } from './CartProvider'
import FeaturedCarousel from './FeaturedCarousel'

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
  isFeatured: boolean
  spiceLevel: string
  preparationTime: number
  images: string[]
}

interface Restaurant {
  _id: string
  name: string
  settings: {
    currency: string
  }
}

export default function CustomerMenuClient({
  restaurant,
  initialCategories,
  initialItems,
}: {
  restaurant: Restaurant
  initialCategories: Category[]
  initialItems: MenuItem[]
}) {
  const [searchQuery, setSearchQuery] = useState('')
  const [cartOpen, setCartOpen] = useState(false)
  const [filter, setFilter] = useState<'all' | 'veg' | 'vegan' | 'gluten-free'>('all')
  const [priceRange, setPriceRange] = useState<[number, number]>([0, 100])
  const { itemCount } = useCart()

  const { featuredItems, regularItems, maxPrice } = useMemo(() => {
    const featured = initialItems.filter(item => item.isFeatured);
    const regular = initialItems.filter(item => !item.isFeatured);
    const max = Math.max(...initialItems.map(item => item.price), 100);
    return { featuredItems: featured, regularItems: regular, maxPrice: Math.ceil(max) };
  }, [initialItems]);

  if (priceRange[1] === 100 && maxPrice > 100) {
    setPriceRange([0, maxPrice]);
  }


  const filteredItems = regularItems.filter((item) => {
    const matchesSearch = item.name.toLowerCase().includes(searchQuery.toLowerCase())
    const matchesFilter =
      filter === 'all' ? true :
      filter === 'veg' ? item.isVegetarian :
      filter === 'vegan' ? item.isVegan :
      item.isGlutenFree
    const matchesPrice = item.price >= priceRange[0] && item.price <= priceRange[1];
    return matchesSearch && matchesFilter && matchesPrice
  })

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">{restaurant.name}</h1>
          <p className="text-gray-600 mt-1">Browse our menu and place your order</p>
        </div>
        <button
          onClick={() => setCartOpen(true)}
          className="relative bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors flex items-center gap-2"
        >
          <ShoppingCart size={20} />
          View Cart
          {itemCount > 0 && (
            <span className="absolute -top-2 -right-2 bg-red-500 text-white text-xs font-bold w-5 h-5 flex items-center justify-center rounded-full">
              {itemCount}
            </span>
          )}
        </button>
      </div>

      {/* Featured Items Carousel */}
      <FeaturedCarousel items={featuredItems} restaurant={restaurant} />


      {/* Search and Filters */}
      <div className="p-4 bg-gray-50 rounded-lg space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={20} />
            <input
              type="text"
              placeholder="Search menu items..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>
          <div className="flex items-center gap-2 flex-wrap">
            <span className="text-sm font-medium text-gray-700">Filter by:</span>
            {(['all', 'veg', 'vegan', 'gluten-free'] as const).map((f) => (
              <button
                key={f}
                onClick={() => setFilter(f)}
                className={`px-3 py-1.5 rounded-full text-sm font-medium transition-colors ${
                  filter === f
                    ? 'bg-blue-600 text-white'
                    : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                }`}
              >
                {f === 'all' ? 'All' : f === 'veg' ? 'Vegetarian' : f === 'vegan' ? 'Vegan' : 'Gluten-Free'}
              </button>
            ))}
          </div>
        </div>
        <div className='w-full'>
          <label htmlFor="price-range" className="block text-sm font-medium text-gray-700 mb-2">
            Price Range: {restaurant.settings.currency}{priceRange[0]} - {restaurant.settings.currency}{priceRange[1]}
          </label>
          <input
            type="range"
            id="price-range"
            min={0}
            max={maxPrice}
            value={priceRange[1]}
            onChange={(e) => setPriceRange([priceRange[0], parseInt(e.target.value, 10)])}
            className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer"
          />
        </div>
      </div>

      {/* Menu Categories and Items */}
      {initialCategories.length === 0 ? (
        <div className="bg-white rounded-lg shadow p-12 text-center">
          <p className="text-gray-600">No menu categories available yet.</p>
        </div>
      ) : (
        <div className="space-y-8">
          {initialCategories.map((category) => {
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
                    <MenuItemCard
                      key={item._id}
                      item={item}
                      currency={restaurant.settings?.currency || 'USD'}
                    />
                  ))}
                </div>
              </div>
            )
          })}

          {filteredItems.length === 0 && searchQuery.length > 0 &&(
            <div className="bg-white rounded-lg shadow p-12 text-center">
              <p className="text-gray-600">No items match your search.</p>
            </div>
          )}
        </div>
      )}

      <CartDrawer
        open={cartOpen}
        onClose={() => setCartOpen(false)}
        restaurant={restaurant}
      />
    </div>
  )
}
