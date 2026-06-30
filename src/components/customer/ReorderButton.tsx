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

export default function ReorderButton({ items }: ReorderButtonProps) {
  const { addItems } = useCart()

  const handleReorder = () => {
    if (!items || items.length === 0) {
      toast.error('No items to re-order.')
      return
    }

    try {
      const itemsToAdd = items.map(item => ({
        menuItemId: item.menuItemId,
        name: item.name,
        price: item.price,
        quantity: item.quantity,
      }))
      
      addItems(itemsToAdd)

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
