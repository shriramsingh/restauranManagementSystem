'use client'

import { useCart } from './CartProvider'
import { toast } from 'sonner'
import { RotateCw } from 'lucide-react'
import { Button } from '@/components/ui/button'

interface OrderItem {
  menuItemId: string
  name: string
  price: number
  quantity: number
}

interface ReorderButtonProps {
  items: OrderItem[]
  currency: string
}

export default function ReorderButton({ items, currency }: ReorderButtonProps) {
  const { addItem } = useCart()

  const handleReorder = () => {
    if (!items || items.length === 0) {
      toast.error('No items to re-order.')
      return
    }

    try {
      // The custom CartProvider's addItem expects a quantity property on the item object,
      // even if its TypeScript type suggests otherwise. We map the order items to the 
      // format expected by the cart.
      items.forEach(orderItem => {
        const cartItem = {
          id: orderItem.menuItemId,
          name: orderItem.name,
          price: orderItem.price,
          currency: currency,
          quantity: orderItem.quantity,
        }
        // The use-shopping-cart addItem function is wrapped in our CartProvider.
        // It takes the item and an options object, where we specify the quantity.
        addItem(cartItem)
      })

      toast.success(`${items.length} item(s) have been added to your cart!`)
    } catch (error) {
      console.error('Re-order failed:', error)
      toast.error('There was an issue adding items to your cart.')
    }
  }

  return (
    <Button onClick={handleReorder}>
      <RotateCw className="mr-2 h-4 w-4" />
      Re-order
    </Button>
  )
}
