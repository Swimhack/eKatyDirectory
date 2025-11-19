'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { Home, Search, Dice6, MessageCircle, User } from 'lucide-react'
import { clsx } from 'clsx'

const navItems = [
  {
    href: '/',
    label: 'Home',
    icon: Home,
  },
  {
    href: '/discover',
    label: 'Discover',
    icon: Search,
  },
  {
    href: '/spinner',
    label: 'Roulette',
    icon: Dice6,
  },
  {
    href: '/contact',
    label: 'Contact',
    icon: MessageCircle,
  },
  {
    href: '/auth',
    label: 'Profile',
    icon: User,
  },
]

export function BottomNav() {
  const pathname = usePathname()

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-50 md:hidden bg-white border-t border-gray-200 pb-safe-bottom">
      <div className="flex items-center justify-around px-2 py-2">
        {navItems.map((item) => {
          const isActive = pathname === item.href
          const Icon = item.icon
          
          return (
            <Link
              key={item.href}
              href={item.href}
              className={clsx(
                'flex flex-col items-center justify-center min-w-0 flex-1 py-2 px-1 rounded-lg transition-colors relative group',
                'min-h-[44px]', // Touch target minimum
                isActive 
                  ? 'text-brand-600 bg-brand-50' 
                  : 'text-gray-500 hover:text-brand-600 hover:bg-warm-50 active:bg-warm-100'
              )}
            >
              <Icon 
                size={20} 
                className={clsx(
                  'mb-1 transition-transform group-active:scale-95',
                  isActive && 'text-brand-600'
                )} 
              />
              <span 
                className={clsx(
                  'text-xs font-medium truncate max-w-full leading-tight',
                  isActive && 'text-brand-600'
                )}
              >
                {item.label}
              </span>
              
              {/* Active indicator */}
              {isActive && (
                <div className="absolute -top-[1px] left-1/2 transform -translate-x-1/2 w-8 h-0.5 bg-brand-600 rounded-full" />
              )}
            </Link>
          )
        })}
      </div>
    </nav>
  )
}