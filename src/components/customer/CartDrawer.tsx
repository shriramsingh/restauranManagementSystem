'use client'

import { useState } from 'react'
import { useCart } from '@/components/customer/CartProvider'
import { X, Minus, Plus, ShoppingBag } from 'lucide-react'

import { IRestaurant } from '@/models/Restaurant'

export default function CartDrawer({
  restaurant,
}: {
  restaurant: IRestaurant
}) {
  const { isCartOpen, closeCart, items, removeItem, updateQuantity, total, clearCart } = useCart()
  const [orderType, setOrderType] = useState<'dine_in' | 'takeaway' | 'delivery'>('dine_in')
  const [notes, setNotes] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [orderPlaced, setOrderPlaced] = useState(false)
  const [orderNumber, setOrderNumber] = useState('')

  const currency = restaurant.settings?.currency || '₹';

  const handlePlaceOrder = async () => {
    if (items.length === 0) return
    setLoading(true)
    setError('')

    const subtotal = items.reduce((sum, item) => sum + item.price * item.quantity, 0)
    const tax = subtotal * (restaurant.settings?.taxRate || 0) / 100
    const orderTotal = subtotal + tax

    const orderItems = items.map((item) => ({
      menuItemId: item.menuItemId,
      name: item.name,
      quantity: item.quantity,
      price: item.price,
      total: item.price * item.quantity,
    }))

    try {
      const res = await fetch('/api/orders', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          restaurantId: restaurant._id,
          orderType,
          items: orderItems,
          subtotal,
          tax,
          total: orderTotal,
          notes,
        }),
      })

      const data = await res.json()

      if (!res.ok) {
        setError(data.error || 'Failed to place order')
      } else {
        setOrderNumber(data.orderNumber)
        setOrderPlaced(true)
        clearCart()
      }
    } catch {
      setError('Network error. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  if (!isCartOpen) return null

  return (
    <div className="fixed inset-0 z-50 flex">
      {/* Backdrop */}
      <div className="flex-1 bg-black bg-opacity-50" onClick={closeCart} />

      {/* Drawer */}
      <div className="w-full max-w-md bg-white shadow-xl flex flex-col h-full">
        <div className="p-4 border-b border-gray-200 flex justify-between items-center">
          <h2 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
            <ShoppingBag size={20} />
            Your Cart
          </h2>
          <button onClick={closeCart} className="p-1 hover:bg-gray-100 rounded">
            <X size={20} />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto p-4">
          {orderPlaced ? (
            <div className="text-center py-8">
              <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <ShoppingBag className="text-green-600" size={32} />
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-2">Order Placed!</h3>
              <p className="text-gray-600 mb-4">Your order number is <strong>#{orderNumber}</strong></p>
              <p className="text-sm text-gray-500">You can track your order in the Orders page.</p>
              <button
                onClick={() => { setOrderPlaced(false); closeCart(); }}
                className="mt-4 bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 transition-colors"
              >
                Continue Shopping
              </button>
            </div>
          ) : items.length === 0 ? (
            <div className="text-center py-8">
              <ShoppingBag className="w-12 h-12 text-gray-300 mx-auto mb-3" />
              <p className="text-gray-500">Your cart is empty.</p>
              <p className="text-sm text-gray-400 mt-1">Add some delicious items!</p>
            </div>
          ) : (
            <div className="space-y-4">
              {items.map((item) => (
                <div key={item.menuItemId} className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
                  <div className="flex-1">
                    <h4 className="font-medium text-gray-900">{item.name}</h4>
                    <p className="text-sm text-gray-600">{currency}{item.price.toFixed(2)} each</p>
                  </div>
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => updateQuantity(item.menuItemId, item.quantity - 1)}
                      className="w-8 h-8 bg-white border border-gray-300 rounded-full flex items-center justify-center hover:bg-gray-100"
                    >
                      <Minus size={14} />
                    </button>
                    <span className="w-6 text-center font-medium">{item.quantity}</span>
                    <button
                      onClick={() => updateQuantity(item.menuItemId, item.quantity + 1)}
                      className="w-8 h-8 bg-white border border-gray-300 rounded-full flex items-center justify-center hover:bg-gray-100"
                    >
                      <Plus size={14} />
                    </button>
                  </div>
                  <div className="text-right min-w-[60px]">
                    <p className="font-medium text-gray-900">
                      {currency}{(item.price * item.quantity).toFixed(2)}
                    </p>
                    <button
                      onClick={() => removeItem(item.menuItemId)}
                      className="text-xs text-red-600 hover:text-red-700"
                    >
                      Remove
                    </button>
                  </div>
                </div>
              ))}

              {/* Order Type */}
              <div className="pt-4">
                <label className="block text-sm font-medium text-gray-700 mb-2">Order Type</label>
                <div className="grid grid-cols-3 gap-2">
                  {(['dine_in', 'takeaway', 'delivery'] as const).map((type) => (
                    <button
                      key={type}
                      onClick={() => setOrderType(type)}
                      className={`py-2 px-3 rounded-lg text-sm font-medium transition-colors ${
                        orderType === type
                          ? 'bg-blue-600 text-white'
                          : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                      }`}
                    >
                      {type === 'dine_in' ? 'Dine In' : type === 'takeaway' ? 'Takeaway' : 'Delivery'}
                    </button>
                  ))}
                </div>
              </div>

              {/* Notes */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Special Instructions</label>
                <textarea
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  placeholder="Any special requests..."
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm"
                  rows={2}
                />
              </div>
            </div>
          )}

          {error && (
            <p className="text-red-600 text-sm mt-3">{error}</p>
          )}
        </div>

        {!orderPlaced && items.length > 0 && (
          <div className="p-4 border-t border-gray-200">
            <div className="flex justify-between items-center mb-2">
              <span className="text-gray-600">Subtotal</span>
              <span className="font-medium">{currency}{total.toFixed(2)}</span>
            </div>
            <div className="flex justify-between items-center mb-2">
              <span className="text-gray-600">Tax</span>
              <span className="font-medium">${(total * 0.08).toFixed(2)}</span>
            </div>
            <div className="flex justify-between items-center mb-4 text-lg">
              <span className="font-semibold">Total</span>
              <span className="font-bold text-blue-600">${(total * 1.08).toFixed(2)}</span>
            </div>
            <button
              onClick={handlePlaceOrder}
              disabled={loading}
              className="w-full bg-blue-600 text-white py-3 rounded-lg font-medium hover:bg-blue-700 disabled:opacity-50 transition-colors"
            >
              {loading ? 'Placing Order...' : 'Place Order'}
            </button>
          </div>
        )}
      </div>
    </div>
  )
}
