'use client'

import Link from 'next/link'
import { useState } from 'react'
import { Menu, X, Search, User, Bell, Heart, LogOut } from 'lucide-react'
import { clsx } from 'clsx'
import { useAuth } from '@/lib/auth-context'
import { useRouter } from 'next/navigation'

export function Navbar() {
  const [isOpen, setIsOpen] = useState(false)
  const { user, signOut, loading } = useAuth()
  const router = useRouter()

  const handleSignOut = async () => {
    try {
      await signOut()
      router.push('/')
    } catch (error) {
      console.error('Error signing out:', error)
    }
  }

  return (
    <nav className="bg-white shadow-sm border-b border-gray-200 sticky top-0 z-50 safe-top">
      <div className="container-mobile">
        <div className="flex justify-between items-center h-14 md:h-16">
          {/* Mobile-optimized Logo */}
          <Link href="/" className="flex items-center space-x-2 md:space-x-3 min-h-[44px]">
            <div className="relative">
              {/* Main logo circle with warm gradient */}
              <div className="w-8 h-8 md:w-10 md:h-10 bg-gradient-to-br from-brand-400 to-brand-600 rounded-full flex items-center justify-center shadow-md">
                <span className="text-white font-bold text-sm md:text-lg">🏘️</span>
              </div>
              {/* Small accent dot */}
              <div className="absolute -top-0.5 -right-0.5 md:-top-1 md:-right-1 w-2 h-2 md:w-3 md:h-3 bg-warm-400 rounded-full border border-white md:border-2"></div>
            </div>
            <div className="flex flex-col">
              <span className="font-bold text-lg md:text-xl text-gray-900 leading-tight">eKaty</span>
              <span className="text-xs text-brand-600 font-medium -mt-0.5 md:-mt-1 hidden xs:block">Local Flavors</span>
            </div>
          </Link>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center space-x-8">
            <Link
              href="/discover"
              className="text-gray-700 hover:text-brand-600 font-medium transition-colors min-h-[44px] flex items-center"
            >
              Discover
            </Link>
            <Link
              href="/map"
              className="text-gray-700 hover:text-brand-600 font-medium transition-colors min-h-[44px] flex items-center"
            >
              Map
            </Link>
            <Link
              href="/spinner"
              className="text-gray-700 hover:text-brand-600 font-medium transition-colors min-h-[44px] flex items-center"
            >
              Grub Roulette
            </Link>
            <Link
              href="/contact"
              className="text-gray-700 hover:text-brand-600 font-medium transition-colors min-h-[44px] flex items-center"
            >
              Contact
            </Link>
          </div>

          {/* Mobile actions & Desktop Auth */}
          <div className="flex items-center space-x-2">
            {/* Search button for mobile */}
            <button className="md:hidden p-2 rounded-lg text-gray-700 hover:bg-gray-100 transition-colors min-h-[44px] min-w-[44px] flex items-center justify-center">
              <Search size={20} />
            </button>

            {/* Desktop Auth */}
            {!loading && (
              <>
                {user ? (
                  <>
                    <Link
                      href="/dashboard"
                      className="hidden md:flex items-center space-x-1 text-gray-700 hover:text-brand-600 font-medium transition-colors min-h-[44px] px-2"
                    >
                      <User size={18} />
                      <span>Dashboard</span>
                    </Link>
                    <Link
                      href="/favorites"
                      className="hidden md:flex items-center space-x-1 text-gray-700 hover:text-brand-600 font-medium transition-colors min-h-[44px] px-2"
                    >
                      <Heart size={18} />
                      <span>Favorites</span>
                    </Link>
                    <button
                      onClick={handleSignOut}
                      className="hidden md:flex items-center space-x-1 text-gray-700 hover:text-brand-600 font-medium transition-colors min-h-[44px] px-2"
                    >
                      <LogOut size={18} />
                      <span>Sign Out</span>
                    </button>
                  </>
                ) : (
                  <Link
                    href="/auth"
                    className="hidden md:flex items-center space-x-1 text-gray-700 hover:text-brand-600 font-medium transition-colors min-h-[44px] px-2"
                  >
                    <User size={18} />
                    <span>Sign In</span>
                  </Link>
                )}
              </>
            )}

            {/* Mobile menu button */}
            <button
              onClick={() => setIsOpen(!isOpen)}
              className="md:hidden p-2 rounded-lg text-gray-700 hover:bg-gray-100 transition-colors min-h-[44px] min-w-[44px] flex items-center justify-center"
            >
              {isOpen ? <X size={20} /> : <Menu size={20} />}
            </button>
          </div>
        </div>

        {/* Mobile Navigation - Slide down menu */}
        {isOpen && (
          <div className="md:hidden border-t border-gray-200 animate-slide-up">
            <div className="py-4 space-y-1">
              <Link
                href="/discover"
                className="block px-4 py-3 text-gray-700 hover:text-brand-600 hover:bg-warm-50 font-medium transition-colors min-h-[44px] flex items-center"
                onClick={() => setIsOpen(false)}
              >
                <Search size={18} className="mr-3" />
                Discover Restaurants
              </Link>
              <Link
                href="/map"
                className="block px-4 py-3 text-gray-700 hover:text-brand-600 hover:bg-warm-50 font-medium transition-colors min-h-[44px] flex items-center"
                onClick={() => setIsOpen(false)}
              >
                <span className="mr-3 text-lg">🗺️</span>
                Restaurant Map
              </Link>
              <Link
                href="/spinner"
                className="block px-4 py-3 text-gray-700 hover:text-brand-600 hover:bg-warm-50 font-medium transition-colors min-h-[44px] flex items-center"
                onClick={() => setIsOpen(false)}
              >
                <span className="mr-3 text-lg">🎲</span>
                Grub Roulette
              </Link>
              <Link
                href="/contact"
                className="block px-4 py-3 text-gray-700 hover:text-brand-600 hover:bg-warm-50 font-medium transition-colors min-h-[44px] flex items-center"
                onClick={() => setIsOpen(false)}
              >
                <span className="mr-3 text-lg">💬</span>
                Contact Us
              </Link>
              <div className="border-t border-gray-200 my-2"></div>
              {!loading && (
                <>
                  {user ? (
                    <>
                      <Link
                        href="/dashboard"
                        className="block px-4 py-3 text-gray-700 hover:text-brand-600 hover:bg-warm-50 font-medium transition-colors min-h-[44px] flex items-center"
                        onClick={() => setIsOpen(false)}
                      >
                        <User size={18} className="mr-3" />
                        <span>My Dashboard</span>
                      </Link>
                      <Link
                        href="/favorites"
                        className="block px-4 py-3 text-gray-700 hover:text-brand-600 hover:bg-warm-50 font-medium transition-colors min-h-[44px] flex items-center"
                        onClick={() => setIsOpen(false)}
                      >
                        <Heart size={18} className="mr-3" />
                        <span>My Favorites</span>
                      </Link>
                      <button
                        onClick={() => {
                          handleSignOut()
                          setIsOpen(false)
                        }}
                        className="w-full text-left block px-4 py-3 text-gray-700 hover:text-brand-600 hover:bg-warm-50 font-medium transition-colors min-h-[44px] flex items-center"
                      >
                        <LogOut size={18} className="mr-3" />
                        <span>Sign Out</span>
                      </button>
                    </>
                  ) : (
                    <Link
                      href="/auth"
                      className="block px-4 py-3 text-gray-700 hover:text-brand-600 hover:bg-warm-50 font-medium transition-colors min-h-[44px] flex items-center"
                      onClick={() => setIsOpen(false)}
                    >
                      <User size={18} className="mr-3" />
                      <span>Sign In / Register</span>
                    </Link>
                  )}
                </>
              )}
            </div>
          </div>
        )}
      </div>
    </nav>
  )
}