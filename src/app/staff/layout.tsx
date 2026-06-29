import { redirect } from 'next/navigation'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import StaffSidebar from '@/components/staff/StaffSidebar'

export default async function StaffLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const session = await getServerSession(authOptions)
  
  if (!session || session.user?.role !== 'staff') {
    redirect('/auth/signin')
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <StaffSidebar />
      <div className="lg:pl-64">
        <main className="p-6 lg:p-8">
          {children}
        </main>
      </div>
    </div>
  )
}
