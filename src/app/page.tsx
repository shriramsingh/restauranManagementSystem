'use client'

import { useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { useSession } from 'next-auth/react'

export default function Home() {
  const { data: session, status } = useSession()
  const router = useRouter()

  useEffect(() => {
    if (status === 'loading') return

    if (session) {
      const role = session.user?.role
      switch (role) {
        case 'super_admin':
          router.replace('/admin/dashboard')
          break
        case 'restaurant_owner':
          router.replace('/owner/dashboard')
          break
        case 'staff':
          router.replace('/staff/dashboard')
          break
        case 'customer':
          router.replace('/customer/dashboard')
          break
        default:
          router.replace('/auth/signin')
      }
    } else {
      router.replace('/auth/signin')
    }
  }, [session, status, router])

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="text-center">
        <div className="w-12 h-12 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto mb-4" />
        <p className="text-gray-600">Redirecting...</p>
      </div>
    </div>
  )
}
