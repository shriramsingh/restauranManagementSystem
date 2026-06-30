import { getServerSession } from 'next-auth'
import { notFound } from 'next/navigation'
import { authOptions } from '@/lib/auth'
import connectDB from '@/lib/mongodb'
import Order from '@/models/Order'
import Restaurant from '@/models/Restaurant'
import FormattedDate from '@/components/customer/FormattedDate'
import PrintButton from './PrintButton'

async function getOrderDetails(orderId: string, customerId: string) {
  await connectDB()
  
  const order = await Order.findOne({ 
    _id: orderId, 
    customerId 
  }).populate({
    path: 'restaurantId',
    select: 'name settings.currency address phone',
    model: Restaurant,
  }).lean()

  if (!order) {
    return null
  }

  return JSON.parse(JSON.stringify(order))
}

export default async function OrderReceiptPage({ params }: { params: { id: string } }) {
  const session = await getServerSession(authOptions)
  
  if (!session?.user?.id) {
    return notFound()
  }

  const order = await getOrderDetails(params.id, session.user.id)

  if (!order) {
    return notFound()
  }

  const currency = order.restaurantId?.settings?.currency || '₹'
  const restaurant = order.restaurantId

  return (
    <div className="bg-white p-8 max-w-2xl mx-auto my-8 shadow-lg print:shadow-none">
      <div className="text-center mb-8">
        <h1 className="text-3xl font-bold">{restaurant.name}</h1>
        <p className="text-gray-600">{`${restaurant.address.street}, ${restaurant.address.city}, ${restaurant.address.state} ${restaurant.address.zipCode}, ${restaurant.address.country}`}</p>
        <p className="text-gray-600">{restaurant.phone}</p>
      </div>

      <div className="border-b pb-4 mb-4">
        <h2 className="text-xl font-semibold">Order Receipt</h2>
        <div className="flex justify-between text-sm mt-2">
          <p><strong>Order #:</strong> {order.orderNumber}</p>
          <p><strong>Date:</strong> <FormattedDate date={order.createdAt} /></p>
        </div>
      </div>

      <div>
        <h3 className="text-lg font-semibold mb-2">Items</h3>
        <table className="w-full text-left">
          <thead>
            <tr className="border-b">
              <th className="py-2">Item</th>
              <th className="text-center">Qty</th>
              <th className="text-right">Price</th>
              <th className="text-right">Total</th>
            </tr>
          </thead>
          <tbody>
            {order.items.map((item: any) => (
              <tr key={item._id} className="border-b">
                <td className="py-2">{item.name}</td>
                <td className="text-center">{item.quantity}</td>
                <td className="text-right">{currency}{item.price.toFixed(2)}</td>
                <td className="text-right">{currency}{item.total.toFixed(2)}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div className="mt-6">
        <div className="flex justify-end">
          <div className="w-full md:w-1/2">
            <div className="flex justify-between mb-2">
              <span className="text-gray-600">Subtotal</span>
              <span>{currency}{order.subtotal.toFixed(2)}</span>
            </div>
            {order.tax > 0 && (
              <div className="flex justify-between mb-2">
                <span className="text-gray-600">Tax</span>
                <span>{currency}{order.tax.toFixed(2)}</span>
              </div>
            )}
            {order.discount > 0 && (
              <div className="flex justify-between mb-2 text-green-600">
                <span className="text-gray-600">Discount</span>
                <span>-{currency}{order.discount.toFixed(2)}</span>
              </div>
            )}
            <div className="border-t mt-2 pt-2 flex justify-between font-bold text-lg">
              <span>Total</span>
              <span>{currency}{order.total.toFixed(2)}</span>
            </div>
          </div>
        </div>
      </div>

      <div className="text-center text-gray-600 mt-12">
        <p>Thank you for your order!</p>
      </div>

      <div className="mt-8 text-center print:hidden">
        <PrintButton />
      </div>
    </div>
  )
}
