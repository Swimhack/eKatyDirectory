'use client'

import Link from 'next/link'

export default function ReviewsPage() {
  return (
    <div className="min-h-screen bg-gray-50">
      <div className="bg-white border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Manage Reviews</h1>
              <p className="text-gray-600 mt-1">Moderate and manage user reviews</p>
            </div>
            <Link 
              href="/admin/dashboard"
              className="text-primary-600 hover:text-primary-700 font-medium"
            >
              ← Back to Dashboard
            </Link>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="bg-white rounded-lg shadow p-8 text-center">
          <div className="text-6xl mb-4">⭐</div>
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Reviews Management</h2>
          <p className="text-gray-600 mb-6">Review moderation features coming soon</p>
          <Link
            href="/admin/dashboard"
            className="inline-block px-6 py-3 bg-primary-600 text-white rounded-lg hover:bg-primary-700 font-medium"
          >
            Back to Dashboard
          </Link>
        </div>
      </div>
    </div>
  )
}
