import type { Metadata } from 'next'
import Link from 'next/link'

export const metadata: Metadata = {
  title: 'Admin Dashboard | eKaty',
  description: 'eKaty Admin Dashboard',
}

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <div className="min-h-screen bg-gray-50">
      {/* Admin Header */}
      <header className="bg-white shadow-sm border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center space-x-4">
              <Link href="/" className="flex items-center space-x-2">
                <span className="text-lg font-bold text-gray-900">Admin</span>
              </Link>
            </div>

            <nav className="flex items-center space-x-6">
              <Link
                href="/admin/dashboard"
                className="text-gray-700 hover:text-primary-600 font-medium transition-colors"
              >
                Dashboard
              </Link>
              <Link
                href="/admin/analytics"
                className="text-gray-700 hover:text-primary-600 font-medium transition-colors"
              >
                Analytics
              </Link>
              <Link
                href="/admin/marketing"
                className="text-gray-700 hover:text-primary-600 font-medium transition-colors"
              >
                Marketing
              </Link>
              <Link
                href="/admin/outreach"
                className="text-gray-700 hover:text-primary-600 font-medium transition-colors"
              >
                Outreach
              </Link>
              <Link
                href="/admin/restaurants"
                className="text-gray-700 hover:text-primary-600 font-medium transition-colors"
              >
                Restaurants
              </Link>
              <Link
                href="/admin/suggestions"
                className="text-gray-700 hover:text-primary-600 font-medium transition-colors"
              >
                Suggestions
              </Link>
              <Link
                href="/admin/blog"
                className="text-gray-700 hover:text-primary-600 font-medium transition-colors"
              >
                Blog
              </Link>
              <Link
                href="/favorites"
                className="text-gray-700 hover:text-primary-600 font-medium transition-colors"
              >
                Favorites
              </Link>
              <Link
                href="/spinner?favoritesOnly=true"
                className="text-gray-700 hover:text-primary-600 font-medium transition-colors"
              >
                Spin Favorites
              </Link>
              <Link
                href="/"
                className="text-gray-500 hover:text-gray-700 transition-colors"
              >
                ← Back to Site
              </Link>
            </nav>
          </div>
        </div>
      </header>

      {/* Admin Content */}
      <main>
        {children}
      </main>
    </div>
  )
}
