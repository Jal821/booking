'use client'
import Link from 'next/link'
import { usePathname } from 'next/navigation'

const navigation = [
  { name: 'Dashboard', href: '/admin' },
  { name: 'Bookings', href: '/admin/bookings' },
  { name: 'Services', href: '/admin/services' },
  { name: 'Staff', href: '/admin/staff' },
  { name: 'Settings', href: '/admin/settings' },
  { name: '🔔 Notifications', href: '/admin/notifications' },
]

export function Sidebar() {
  const pathname = usePathname()

  return (
    <div className="w-64 bg-gray-900 text-white flex flex-col">
      <div className="p-6 border-b border-gray-700">
        <h1 className="text-xl font-bold">Booking Admin</h1>
        <p className="text-gray-400 text-sm mt-1">Salon Management</p>
      </div>
      <nav className="flex-1 p-4 space-y-1">
        {navigation.map((item) => (
          <Link
            key={item.name}
            href={item.href}
            className={`block px-4 py-2.5 rounded-lg text-sm font-medium transition-colors ${
              pathname === item.href
                ? 'bg-indigo-600 text-white'
                : 'text-gray-300 hover:bg-gray-700 hover:text-white'
            }`}
          >
            {item.name}
          </Link>
        ))}
      </nav>
      <div className="p-4 border-t border-gray-700">
        <p className="text-gray-400 text-xs">v1.0.0</p>
      </div>
    </div>
  )
}