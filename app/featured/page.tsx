'use client'

import { useState, useEffect } from 'react'
import RestaurantCard from '@/components/RestaurantCard'
import Link from 'next/link'

export default function FeaturedPage() {
  const [restaurants, setRestaurants] = useState<any[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchFeaturedRestaurants()
  }, [])

  const fetchFeaturedRestaurants = async () => {
    try {
      const response = await fetch('/api/restaurants?featured=true&limit=20')
      const data = await response.json()
      setRestaurants(data.restaurants || [])
    } catch (error) {
      console.error('Error fetching featured restaurants:', error)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-gradient-to-r from-primary-600 to-primary-700 text-white py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <div className="inline-flex items-center justify-center w-20 h-20 bg-white/10 backdrop-blur-sm rounded-full mb-6">
            <span className="text-4xl">⭐</span>
          </div>
          <h1 className="text-5xl font-bold mb-4">Featured Restaurants</h1>
          <p className="text-xl text-primary-100 mb-8 max-w-2xl mx-auto">
            Hand-picked restaurants offering the best dining experiences in Katy. 
            These establishments go above and beyond to serve our community.
          </p>
          <Link href="/contact" className="inline-flex items-center bg-white text-primary-600 px-6 py-3 rounded-lg font-semibold hover:bg-gray-100 transition-colors">
            <span className="mr-2">🚀</span>
            Get Your Restaurant Featured
          </Link>
        </div>
      </div>

      {/* Benefits Section */}
      <div className="bg-white py-12 border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-2xl font-bold text-center mb-8">Why Go Featured?</h2>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            <div className="text-center">
              <div className="text-3xl mb-3">🏆</div>
              <h3 className="font-semibold mb-2">Premium Placement</h3>
              <p className="text-sm text-gray-600">Top positions in search results and homepage visibility</p>
            </div>
            <div className="text-center">
              <div className="text-3xl mb-3">📈</div>
              <h3 className="font-semibold mb-2">3x More Views</h3>
              <p className="text-sm text-gray-600">Featured restaurants get 3x more profile views</p>
            </div>
            <div className="text-center">
              <div className="text-3xl mb-3">⚡</div>
              <h3 className="font-semibold mb-2">Priority Support</h3>
              <p className="text-sm text-gray-600">Dedicated account manager and priority support</p>
            </div>
            <div className="text-center">
              <div className="text-3xl mb-3">📊</div>
              <h3 className="font-semibold mb-2">Analytics Dashboard</h3>
              <p className="text-sm text-gray-600">Track views, clicks, and customer engagement</p>
            </div>
          </div>
        </div>
      </div>

      {/* Featured Restaurants Grid */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {loading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[...Array(6)].map((_, i) => (
              <div key={i} className="bg-gray-200 rounded-lg h-64 animate-pulse"></div>
            ))}
          </div>
        ) : restaurants.length > 0 ? (
          <>
            <div className="mb-6 flex items-center justify-between">
              <div>
                <span className="text-sm text-gray-500">Showing</span>
                <span className="ml-2 text-2xl font-bold text-gray-900">{restaurants.length}</span>
                <span className="ml-2 text-sm text-gray-500">featured restaurants</span>
              </div>
              <Link href="/discover?featured=true" className="text-primary-600 hover:text-primary-700 font-medium">
                View in Discover →
              </Link>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {restaurants.map((restaurant) => (
                <div key={restaurant.id} className="relative">
                  <div className="absolute -top-2 -right-2 z-10 bg-yellow-400 text-yellow-900 p-2 rounded-full shadow-lg">
                    <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                      <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                    </svg>
                  </div>
                  <RestaurantCard restaurant={restaurant} />
                </div>
              ))}
            </div>
          </>
        ) : (
          <div className="text-center py-12">
            <div className="text-6xl mb-4">🍽️</div>
            <h2 className="text-2xl font-semibold text-gray-900 mb-2">
              No featured restaurants yet
            </h2>
            <p className="text-gray-600 mb-6">
              Check back soon for our hand-picked selections
            </p>
            <Link href="/discover" className="btn-primary">
              Browse All Restaurants
            </Link>
          </div>
        )}

        {/* CTA Section */}
        {restaurants.length > 0 && (
          <div className="mt-16 bg-gradient-to-r from-primary-500 to-primary-600 rounded-2xl p-8 text-white text-center">
            <h2 className="text-3xl font-bold mb-4">
              Want Your Restaurant Featured?
            </h2>
            <p className="text-xl mb-6 text-primary-100">
              Join these amazing restaurants and reach thousands of hungry customers
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link href="/contact" className="bg-white text-primary-600 px-8 py-3 rounded-lg font-semibold hover:bg-gray-100 transition-colors">
                Learn More About Advertising
              </Link>
              <Link href="/spinner" className="bg-primary-700 text-white px-8 py-3 rounded-lg font-semibold hover:bg-primary-800 transition-colors">
                Try Grub Roulette
              </Link>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}