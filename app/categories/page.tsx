'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import RestaurantCard from '@/components/RestaurantCard'

const allCategories = [
  { name: 'Mexican', emoji: '🌮', description: 'Tacos, burritos, and authentic Mexican cuisine' },
  { name: 'BBQ', emoji: '🍖', description: 'Smoked meats and Texas-style barbecue' },
  { name: 'Asian', emoji: '🥢', description: 'Chinese, Japanese, Thai, and more' },
  { name: 'American', emoji: '🍔', description: 'Burgers, steaks, and comfort food' },
  { name: 'Seafood', emoji: '🦐', description: 'Fresh catches and coastal favorites' },
  { name: 'Indian', emoji: '🍛', description: 'Curries, tandoori, and spiced delights' },
  { name: 'Greek', emoji: '🥙', description: 'Mediterranean flavors and fresh ingredients' },
  { name: 'Breakfast', emoji: '🥞', description: 'All-day breakfast and brunch spots' },
  { name: 'Italian', emoji: '🍝', description: 'Pizza, pasta, and Italian classics' },
  { name: 'Chinese', emoji: '🥟', description: 'Authentic Chinese and fusion dishes' },
  { name: 'Japanese', emoji: '🍱', description: 'Sushi, ramen, and Japanese cuisine' },
  { name: 'Thai', emoji: '🌶️', description: 'Spicy and flavorful Thai dishes' },
  { name: 'Vietnamese', emoji: '🍜', description: 'Pho, banh mi, and Vietnamese specialties' },
  { name: 'Bar', emoji: '🍺', description: 'Pubs, sports bars, and nightlife' },
  { name: 'Healthy', emoji: '🥗', description: 'Salads, smoothies, and healthy options' },
  { name: 'Desserts', emoji: '🍰', description: 'Sweet treats and dessert spots' }
]

export default function CategoriesPage() {
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null)
  const [restaurants, setRestaurants] = useState<any[]>([])
  const [loading, setLoading] = useState(false)
  const [counts, setCounts] = useState<Record<string, number>>({})

  // Fetch category counts on mount
  useEffect(() => {
    fetchCategoryCounts()
  }, [])

  // Fetch restaurants when category is selected
  useEffect(() => {
    if (selectedCategory) {
      fetchRestaurantsByCategory(selectedCategory)
    }
  }, [selectedCategory])

  const fetchCategoryCounts = async () => {
    // In a real app, this would be a dedicated API endpoint
    // For now, we'll simulate it
    const fakeCounts: Record<string, number> = {}
    allCategories.forEach(cat => {
      fakeCounts[cat.name] = Math.floor(Math.random() * 30) + 5
    })
    setCounts(fakeCounts)
  }

  const fetchRestaurantsByCategory = async (category: string) => {
    setLoading(true)
    try {
      const response = await fetch(`/api/restaurants?category=${category}&limit=12`)
      const data = await response.json()
      setRestaurants(data.restaurants || [])
    } catch (error) {
      console.error('Error fetching restaurants:', error)
      setRestaurants([])
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-gradient-to-r from-primary-600 to-primary-700 text-white py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h1 className="text-4xl font-bold mb-4">Browse by Category</h1>
          <p className="text-xl text-primary-100">
            Explore Katy's diverse culinary landscape
          </p>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {!selectedCategory ? (
          // Categories Grid
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {allCategories.map((category) => (
              <button
                key={category.name}
                onClick={() => setSelectedCategory(category.name)}
                className="bg-white rounded-lg shadow-md hover:shadow-lg transition-all p-6 text-left group"
              >
                <div className="flex items-start justify-between mb-4">
                  <span className="text-5xl group-hover:scale-110 transition-transform">
                    {category.emoji}
                  </span>
                  {counts[category.name] && (
                    <span className="bg-primary-100 text-primary-700 px-2 py-1 rounded text-sm font-medium">
                      {counts[category.name]} restaurants
                    </span>
                  )}
                </div>
                <h3 className="text-xl font-semibold text-gray-900 mb-2">
                  {category.name}
                </h3>
                <p className="text-sm text-gray-600">
                  {category.description}
                </p>
              </button>
            ))}
          </div>
        ) : (
          // Category Results
          <div>
            {/* Back Button and Header */}
            <div className="mb-8">
              <button
                onClick={() => {
                  setSelectedCategory(null)
                  setRestaurants([])
                }}
                className="text-primary-600 hover:text-primary-700 font-medium mb-4 inline-flex items-center"
              >
                <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                </svg>
                Back to Categories
              </button>
              
              <div className="flex items-center gap-4">
                <span className="text-4xl">
                  {allCategories.find(c => c.name === selectedCategory)?.emoji}
                </span>
                <div>
                  <h2 className="text-3xl font-bold text-gray-900">
                    {selectedCategory} Restaurants
                  </h2>
                  <p className="text-gray-600">
                    {allCategories.find(c => c.name === selectedCategory)?.description}
                  </p>
                </div>
              </div>
            </div>

            {/* Restaurant Grid */}
            {loading ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                {[...Array(8)].map((_, i) => (
                  <div key={i} className="bg-gray-200 rounded-lg h-64 animate-pulse"></div>
                ))}
              </div>
            ) : restaurants.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                {restaurants.map((restaurant) => (
                  <RestaurantCard key={restaurant.id} restaurant={restaurant} />
                ))}
              </div>
            ) : (
              <div className="text-center py-12 bg-white rounded-lg">
                <div className="text-6xl mb-4">😕</div>
                <h3 className="text-xl font-semibold text-gray-900 mb-2">
                  No {selectedCategory} restaurants found
                </h3>
                <p className="text-gray-600 mb-6">
                  Try browsing other categories
                </p>
                <button
                  onClick={() => setSelectedCategory(null)}
                  className="btn-primary"
                >
                  View All Categories
                </button>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  )
}