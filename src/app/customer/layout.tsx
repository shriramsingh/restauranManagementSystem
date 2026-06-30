import { redirect } from 'next/navigation'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import CustomerSidebar from '@/components/customer/CustomerSidebar'
import { CartProvider } from '@/components/customer/CartProvider'
import CartDrawer from '@/components/customer/CartDrawer'
import connectDB from '@/lib/mongodb'
import Restaurant from '@/models/Restaurant'
import { IRestaurant } from '@/models/Restaurant'

async function getRestaurantForCart() {
  await connectDB()
  // For now, we'll just grab the first restaurant to source currency info etc.
  // This should be revisited to handle multi-restaurant scenarios more gracefully.
  const restaurant = await Restaurant.findOne().lean()
  return JSON.parse(JSON.stringify(restaurant))
}

export default async function CustomerLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const session = await getServerSession(authOptions)
  const restaurant = await getRestaurantForCart()
  
  if (!session || session.user?.role !== 'customer') {
    redirect('/auth/signin')
  }

  if (!restaurant) {
    // Handle case where no restaurants are found
    return (
        <div className="min-h-screen bg-gray-50 flex items-center justify-center">
            <p>No restaurants available at the moment. Please check back later.</p>
        </div>
    )
  }

  return (
    <CartProvider>
      <div className="min-h-screen bg-gray-50">
        <CustomerSidebar />
        <CartDrawer restaurant={restaurant as IRestaurant} />
        <div className="lg:pl-64">
          <main className="p-6 lg:p-8">
            {children}
          </main>
        </div>
      </div>
    </CartProvider>
  )
}
