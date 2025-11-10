import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import './globals.css'
import Link from 'next/link'

const inter = Inter({ subsets: ['latin'] })

export const metadata: Metadata = {
  metadataBase: new URL('https://ekaty.fly.dev'),
  title: 'Best Restaurants in Katy TX | Katy Texas Restaurant Guide | eKaty',
  description: 'Find the best restaurants in Katy, Texas! Explore 500+ local dining options including Katy Asian Town, Mexican, BBQ, seafood & more. Try our Grub Roulette restaurant picker!',
  keywords: 'restaurants in Katy TX, Katy Texas restaurants, best restaurants Katy, Katy Asian Town restaurants, where to eat Katy TX, Mexican restaurants Katy, BBQ Katy Texas, Asian restaurants Katy, restaurant guide Katy, dining Katy TX',
  authors: [{ name: 'Strickland Technology' }],
  openGraph: {
    title: 'Best Restaurants in Katy TX | Complete Dining Guide',
    description: 'Discover 500+ restaurants in Katy, Texas. From Katy Asian Town to local BBQ favorites. AI-powered recommendations & Grub Roulette picker!',
    url: 'https://ekaty.fly.dev',
    siteName: 'eKaty - Katy TX Restaurant Guide',
    locale: 'en_US',
    type: 'website',
  },
  alternates: {
    canonical: 'https://ekaty.fly.dev'
  }
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <body className={`${inter.className} bg-gray-50`}>
        {/* Navigation Header */}
        <header className="bg-white shadow-sm border-b border-gray-200 sticky top-0 z-50">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex justify-between items-center h-16">
              {/* Logo and Brand */}
              <div className="flex items-center">
                <Link href="/" className="flex items-center space-x-2">
                  <div className="w-10 h-10 bg-primary-600 rounded-lg flex items-center justify-center">
                    <span className="text-white font-bold text-xl">e</span>
                  </div>
                  <span className="text-2xl font-bold text-gray-900">Katy</span>
                </Link>
              </div>
              
              {/* Main Navigation */}
              <nav className="hidden md:flex items-center space-x-8">
                <Link 
                  href="/discover" 
                  className="text-gray-700 hover:text-primary-600 font-medium transition-colors"
                >
                  Discover
                </Link>
                <Link 
                  href="/spinner" 
                  className="text-gray-700 hover:text-primary-600 font-medium transition-colors flex items-center space-x-1"
                >
                  <span>🎰</span>
                  <span>Grub Roulette</span>
                </Link>
                <Link 
                  href="/categories" 
                  className="text-gray-700 hover:text-primary-600 font-medium transition-colors"
                >
                  Categories
                </Link>
                <Link 
                  href="/contact" 
                  className="text-gray-700 hover:text-primary-600 font-medium transition-colors"
                >
                  Advertise
                </Link>
              </nav>
              
              {/* Auth Buttons */}
              <div className="flex items-center space-x-4">
                <Link 
                  href="/auth/signin" 
                  className="text-gray-700 hover:text-primary-600 font-medium transition-colors"
                >
                  Sign In
                </Link>
                <Link 
                  href="/auth/signup" 
                  className="btn-primary text-sm"
                >
                  Sign Up
                </Link>
              </div>
              
              {/* Mobile Menu Button */}
              <button className="md:hidden p-2 rounded-lg hover:bg-gray-100">
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                </svg>
              </button>
            </div>
          </div>
        </header>
        
        {/* Main Content */}
        <main className="min-h-[calc(100vh-4rem)]">
          {children}
        </main>
        
        {/* Footer */}
        <footer className="bg-secondary-900 text-white py-12 mt-20">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
              {/* Brand Column */}
              <div>
                <div className="flex items-center space-x-2 mb-4">
                  <div className="w-8 h-8 bg-primary-600 rounded-lg flex items-center justify-center">
                    <span className="text-white font-bold">e</span>
                  </div>
                  <span className="text-xl font-bold">Katy</span>
                </div>
                <p className="text-gray-400 text-sm">
                  Your AI-powered guide to the best restaurants in Katy, Texas.
                </p>
                <p className="text-gray-500 text-xs mt-4">
                  Powered by Strickland Technology
                </p>
              </div>
              
              {/* Explore Column */}
              <div>
                <h3 className="font-semibold mb-4">Explore</h3>
                <ul className="space-y-2 text-sm">
                  <li><Link href="/discover" className="text-gray-400 hover:text-white">All Restaurants</Link></li>
                  <li><Link href="/spinner" className="text-gray-400 hover:text-white">Grub Roulette</Link></li>
                  <li><Link href="/categories" className="text-gray-400 hover:text-white">Categories</Link></li>
                  <li><Link href="/featured" className="text-gray-400 hover:text-white">Featured</Link></li>
                </ul>
              </div>
              
              {/* Popular Categories */}
              <div>
                <h3 className="font-semibold mb-4">Popular Categories</h3>
                <ul className="space-y-2 text-sm">
                  <li><Link href="/discover?category=Mexican" className="text-gray-400 hover:text-white">Mexican</Link></li>
                  <li><Link href="/discover?category=BBQ" className="text-gray-400 hover:text-white">BBQ</Link></li>
                  <li><Link href="/discover?category=Asian" className="text-gray-400 hover:text-white">Asian</Link></li>
                  <li><Link href="/discover?category=American" className="text-gray-400 hover:text-white">American</Link></li>
                </ul>
              </div>
              
              {/* Business Column */}
              <div>
                <h3 className="font-semibold mb-4">For Businesses</h3>
                <ul className="space-y-2 text-sm">
                  <li><Link href="/pitch" className="text-gray-400 hover:text-white">Restaurant Partners</Link></li>
                  <li><Link href="/pitch" className="text-gray-400 hover:text-white">Investor Relations</Link></li>
                  <li><Link href="/contact" className="text-gray-400 hover:text-white">Advertise With Us</Link></li>
                  <li><Link href="/privacy" className="text-gray-400 hover:text-white">Privacy Policy</Link></li>
                </ul>
              </div>
            </div>
            
            <div className="border-t border-gray-800 mt-8 pt-8 text-center text-sm text-gray-500">
              &copy; {new Date().getFullYear()} eKaty.com. All rights reserved.
            </div>
          </div>
        </footer>
      </body>
    </html>
  )
}