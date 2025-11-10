'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'

const allCategories = [
  { name: 'Mexican', slug: 'mexican', emoji: '🌮', description: 'Tacos, burritos, and authentic Mexican cuisine' },
  { name: 'BBQ', slug: 'bbq', emoji: '🍖', description: 'Smoked meats and Texas-style barbecue' },
  { name: 'Asian', slug: 'asian', emoji: '🥢', description: 'Chinese, Japanese, Thai, and more' },
  { name: 'American', slug: 'american', emoji: '🍔', description: 'Burgers, steaks, and comfort food' },
  { name: 'Seafood', slug: 'seafood', emoji: '🦐', description: 'Fresh catches and coastal favorites' },
  { name: 'Indian', slug: 'indian', emoji: '🍛', description: 'Curries, tandoori, and spiced delights' },
  { name: 'Greek', slug: 'greek', emoji: '🥙', description: 'Mediterranean flavors and fresh ingredients' },
  { name: 'Breakfast', slug: 'breakfast', emoji: '🥞', description: 'All-day breakfast and brunch spots' },
  { name: 'Italian', slug: 'italian', emoji: '🍝', description: 'Pizza, pasta, and Italian classics' },
  { name: 'Chinese', slug: 'chinese', emoji: '🥟', description: 'Authentic Chinese and fusion dishes' },
  { name: 'Japanese', slug: 'japanese', emoji: '🍱', description: 'Sushi, ramen, and Japanese cuisine' },
  { name: 'Thai', slug: 'thai', emoji: '🌶️', description: 'Spicy and flavorful Thai dishes' },
  { name: 'Vietnamese', slug: 'vietnamese', emoji: '🍜', description: 'Pho, banh mi, and Vietnamese specialties' },
  { name: 'Bar', slug: 'bar', emoji: '🍺', description: 'Pubs, sports bars, and nightlife' },
  { name: 'Healthy', slug: 'healthy', emoji: '🥗', description: 'Salads, smoothies, and healthy options' },
  { name: 'Desserts', slug: 'desserts', emoji: '🍰', description: 'Sweet treats and dessert spots' }
]

export default function CategoriesPage() {
  const [counts, setCounts] = useState<Record<string, number>>({})

  // Fetch category counts on mount
  useEffect(() => {
    fetchCategoryCounts()
  }, [])

  const fetchCategoryCounts = async () => {
    // Fetch real counts from the API for each category
    const realCounts: Record<string, number> = {}
    
    // Fetch counts for all categories in parallel
    const countPromises = allCategories.map(async (cat) => {
      try {
        const response = await fetch(`/api/restaurants?category=${encodeURIComponent(cat.name)}&limit=1`)
        const data = await response.json()
        return { category: cat.name, count: data.pagination?.total || 0 }
      } catch (error) {
        console.error(`Error fetching count for ${cat.name}:`, error)
        return { category: cat.name, count: 0 }
      }
    })
    
    const results = await Promise.all(countPromises)
    results.forEach(({ category, count }) => {
      realCounts[category] = count
    })
    
    setCounts(realCounts)
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
        {/* Categories Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {allCategories.map((category) => (
            <Link
              key={category.name}
              href={`/categories/${category.slug}`}
              className="bg-white rounded-lg shadow-md hover:shadow-lg transition-all p-6 text-left group block"
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
            </Link>
          ))}
        </div>
      </div>
    </div>
  )
}