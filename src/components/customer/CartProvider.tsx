'use client'

import { createContext, useContext, useState, useCallback, ReactNode } from 'react'

export interface CartItem {
  menuItemId: string
  name: string
  price: number
  quantity: number
  specialInstructions?: string
}

interface CartContextType {
  items: CartItem[]
  addItem: (item: Omit<CartItem, 'quantity'>) => void
  addItems: (items: Omit<CartItem, 'quantity'>[]) => void
  removeItem: (menuItemId: string) => void
  updateQuantity: (menuItemId: string, quantity: number) => void
  clearCart: () => void
  total: number
  itemCount: number
  isCartOpen: boolean
  openCart: () => void
  closeCart: () => void
}

const CartContext = createContext<CartContextType | undefined>(undefined)

export function CartProvider({ children }: { children: ReactNode }) {
  const [items, setItems] = useState<CartItem[]>([])
  const [isCartOpen, setIsCartOpen] = useState(false)

  const openCart = useCallback(() => setIsCartOpen(true), [])
  const closeCart = useCallback(() => setIsCartOpen(false), [])

  const addItem = useCallback((item: Omit<CartItem, 'quantity'>) => {
    setItems((prev) => {
      const existing = prev.find((i) => i.menuItemId === item.menuItemId)
      if (existing) {
        return prev.map((i) =>
          i.menuItemId === item.menuItemId
            ? { ...i, quantity: i.quantity + 1 }
            : i
        )
      }
      return [...prev, { ...item, quantity: 1 }]
    })
  }, [])

  const addItems = useCallback((newItems: (Omit<CartItem, 'quantity'> & { quantity: number })[]) => {
    setItems((prev) => {
      const updatedItems = [...prev]
      newItems.forEach(newItem => {
        const existingIndex = updatedItems.findIndex(i => i.menuItemId === newItem.menuItemId)
        if (existingIndex > -1) {
          updatedItems[existingIndex] = {
            ...updatedItems[existingIndex],
            quantity: updatedItems[existingIndex].quantity + newItem.quantity,
          }
        } else {
          updatedItems.push(newItem)
        }
      })
      return updatedItems
    })
  }, [])

  const removeItem = useCallback((menuItemId: string) => {
    setItems((prev) => prev.filter((i) => i.menuItemId !== menuItemId))
  }, [])

  const updateQuantity = useCallback((menuItemId: string, quantity: number) => {
    if (quantity <= 0) {
      removeItem(menuItemId)
      return
    }
    setItems((prev) =>
      prev.map((i) =>
        i.menuItemId === menuItemId ? { ...i, quantity } : i
      )
    )
  }, [removeItem])

  const clearCart = useCallback(() => {
    setItems([])
  }, [])

  const total = items.reduce((sum, item) => sum + item.price * item.quantity, 0)
  const itemCount = items.reduce((sum, item) => sum + item.quantity, 0)

  return (
    <CartContext.Provider
      value={{ 
        items, 
        addItem, 
        addItems, 
        removeItem, 
        updateQuantity, 
        clearCart, 
        total, 
        itemCount,
        isCartOpen,
        openCart,
        closeCart
      }}
    >
      {children}
    </CartContext.Provider>
  )
}

export function useCart() {
  const context = useContext(CartContext)
  if (context === undefined) {
    throw new Error('useCart must be used within a CartProvider')
  }
  return context
}
