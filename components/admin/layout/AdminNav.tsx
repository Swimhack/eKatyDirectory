'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import {
  LayoutDashboard,
  Mail,
  DollarSign,
  Users,
  FileText,
  Settings,
  TrendingUp,
} from 'lucide-react'

const navItems = [
  {
    label: 'Dashboard',
    href: '/admin',
    icon: LayoutDashboard,
  },
  {
    label: 'Monetization',
    href: '/admin/monetization',
    icon: DollarSign,
    children: [
      {
        label: 'Outreach Campaigns',
        href: '/admin/monetization/outreach',
        icon: Mail,
      },
      {
        label: 'Restaurant Leads',
        href: '/admin/monetization/leads',
        icon: Users,
      },
      {
        label: 'Partnership Tiers',
        href: '/admin/monetization/tiers',
        icon: Settings,
      },
      {
        label: 'Revenue Tracking',
        href: '/admin/monetization/revenue',
        icon: TrendingUp,
      },
      {
        label: 'Applications',
        href: '/admin/monetization/applications',
        icon: FileText,
      },
    ],
  },
]

export default function AdminNav() {
  const pathname = usePathname()

  const isActive = (href: string) => {
    if (href === '/admin') {
      return pathname === '/admin'
    }
    return pathname?.startsWith(href)
  }

  return (
    <nav className="bg-white border-r border-gray-200 w-64 min-h-screen p-4">
      <div className="mb-8">
        <Link
          href="/admin"
          className="text-2xl font-bold text-amber-600 hover:text-amber-700"
        >
          eKaty Admin
        </Link>
      </div>

      <ul className="space-y-2">
        {navItems.map((item) => {
          const Icon = item.icon
          const active = isActive(item.href)

          return (
            <li key={item.href}>
              <Link
                href={item.href}
                className={`flex items-center gap-3 px-4 py-2 rounded-lg transition-colors ${
                  active
                    ? 'bg-amber-50 text-amber-700 font-medium'
                    : 'text-gray-700 hover:bg-gray-50'
                }`}
              >
                <Icon className="w-5 h-5" />
                <span>{item.label}</span>
              </Link>

              {item.children && active && (
                <ul className="ml-8 mt-2 space-y-1">
                  {item.children.map((child) => {
                    const ChildIcon = child.icon
                    const childActive = isActive(child.href)

                    return (
                      <li key={child.href}>
                        <Link
                          href={child.href}
                          className={`flex items-center gap-2 px-3 py-1.5 rounded text-sm transition-colors ${
                            childActive
                              ? 'bg-amber-100 text-amber-800 font-medium'
                              : 'text-gray-600 hover:bg-gray-50'
                          }`}
                        >
                          <ChildIcon className="w-4 h-4" />
                          <span>{child.label}</span>
                        </Link>
                      </li>
                    )
                  })}
                </ul>
              )}
            </li>
          )
        })}
      </ul>
    </nav>
  )
}
