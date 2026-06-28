'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { 
  Home,
  LayoutDashboard, 
  UtensilsCrossed, 
  Users, 
  CreditCard, 
  Settings,
  LogOut,
  Menu,
  X,
  ShoppingCart,
  Table2
} from 'lucide-react'
import { useState } from 'react'
import { signOut } from 'next-auth/react'

const menuItems = [
  { href: '/owner/dashboard', label: 'Home', icon: Home },
  { href: '/owner/menu', label: 'Menu Management', icon: UtensilsCrossed },
  { href: '/owner/tables', label: 'Tables', icon: Table2 },
  { href: '/owner/orders', label: 'Orders', icon: ShoppingCart },
  { href: '/owner/staff', label: 'Staff', icon: Users },
  { href: '/owner/reports', label: 'Reports', icon: CreditCard },
  { href: '/owner/settings', label: 'Settings', icon: Settings },
]

export default function OwnerSidebar() {
  const pathname = usePathname()
  const [isOpen, setIsOpen] = useState(false)

  const handleSignOut = async () => {
    await signOut({ callbackUrl: '/auth/signin' })
  }

  return (
    <>
      {/* Mobile menu button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="lg:hidden fixed top-4 left-4 z-50 p-2 bg-white rounded-lg shadow-md"
      >
        {isOpen ? <X size={24} /> : <Menu size={24} />}
      </button>

      {/* Sidebar */}
      <aside className={`
        fixed top-0 left-0 z-40 h-screen transition-transform
        ${isOpen ? 'translate-x-0' : '-translate-x-full'}
        lg:translate-x-0
        w-64 bg-white border-r border-gray-200
      `}>
        <div className="h-full flex flex-col">
          {/* Logo / Home link */}
          <Link href="/owner/dashboard" className="h-16 flex items-center justify-center border-b border-gray-200 hover:bg-gray-50 transition-colors">
            <h1 className="text-xl font-bold text-gray-900">Restaurant Panel</h1>
          </Link>

          {/* Navigation */}
          <nav className="flex-1 overflow-y-auto p-4">
            <ul className="space-y-2">
              {menuItems.map((item) => {
                const Icon = item.icon
                const isActive = pathname === item.href || pathname.startsWith(item.href + '/')
                
                return (
                  <li key={item.href}>
                    <Link
                      href={item.href}
                      onClick={() => setIsOpen(false)}
                      className={`
                        flex items-center gap-3 px-4 py-3 rounded-lg transition-colors
                        ${isActive 
                          ? 'bg-blue-50 text-blue-600' 
                          : 'text-gray-700 hover:bg-gray-50'
                        }
                      `}
                    >
                      <Icon size={20} />
                      <span className="font-medium">{item.label}</span>
                    </Link>
                  </li>
                )
              })}
            </ul>
          </nav>

          {/* Sign out button */}
          <div className="p-4 border-t border-gray-200">
            <button
              onClick={handleSignOut}
              className="flex items-center gap-3 px-4 py-3 w-full text-gray-700 hover:bg-gray-50 rounded-lg transition-colors"
            >
              <LogOut size={20} />
              <span className="font-medium">Sign Out</span>
            </button>
          </div>
        </div>
      </aside>

      {/* Overlay */}
      {isOpen && (
        <div
          onClick={() => setIsOpen(false)}
          className="fixed inset-0 bg-black bg-opacity-50 z-30 lg:hidden"
        />
      )}
    </>
  )
}