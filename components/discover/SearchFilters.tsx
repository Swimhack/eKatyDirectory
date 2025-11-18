'use client'

import { useState, useEffect } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'

const CATEGORIES = ['Mexican', 'American', 'Asian', 'Italian', 'BBQ', 'Seafood', 'Pizza']
const PRICE_LEVELS = [
  { label: '$ - Budget', value: 1 },
  { label: '$$ - Moderate', value: 2 },
  { label: '$$$ - Expensive', value: 3 },
  { label: '$$$$ - Very Expensive', value: 4 },
]

export function SearchFilters() {
  const router = useRouter()
  const searchParams = useSearchParams()

  // Initialize state from URL params
  const [search, setSearch] = useState(searchParams.get('search') || '')
  const [selectedCategories, setSelectedCategories] = useState<string[]>(() => {
    const categories = searchParams.get('categories')
    return categories ? categories.split(',') : []
  })
  const [selectedPrices, setSelectedPrices] = useState<number[]>(() => {
    const priceLevel = searchParams.get('priceLevel')
    return priceLevel ? priceLevel.split(',').map(Number) : []
  })

  const updateURL = (
    newSearch: string,
    newCategories: string[],
    newPrices: number[]
  ) => {
    const params = new URLSearchParams()

    if (newSearch) {
      params.set('search', newSearch)
    }

    if (newCategories.length > 0) {
      params.set('categories', newCategories.join(','))
    }

    if (newPrices.length > 0) {
      params.set('priceLevel', newPrices.join(','))
    }

    const queryString = params.toString()
    router.push(queryString ? `/discover?${queryString}` : '/discover')
  }

  const handleSearchChange = (value: string) => {
    setSearch(value)
  }

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    updateURL(search, selectedCategories, selectedPrices)
  }

  const handleCategoryToggle = (category: string) => {
    const newCategories = selectedCategories.includes(category)
      ? selectedCategories.filter((c) => c !== category)
      : [...selectedCategories, category]

    setSelectedCategories(newCategories)
    updateURL(search, newCategories, selectedPrices)
  }

  const handlePriceToggle = (price: number) => {
    const newPrices = selectedPrices.includes(price)
      ? selectedPrices.filter((p) => p !== price)
      : [...selectedPrices, price]

    setSelectedPrices(newPrices)
    updateURL(search, selectedCategories, newPrices)
  }

  const handleClearFilters = () => {
    setSearch('')
    setSelectedCategories([])
    setSelectedPrices([])
    router.push('/discover')
  }

  const hasActiveFilters =
    search || selectedCategories.length > 0 || selectedPrices.length > 0

  return (
    <div className="card">
      <h3 className="font-semibold text-lg mb-4">Filters</h3>

      <div className="space-y-6">
        {/* Search */}
        <form onSubmit={handleSearchSubmit}>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Search
          </label>
          <div className="flex space-x-2">
            <input
              type="text"
              value={search}
              onChange={(e) => handleSearchChange(e.target.value)}
              placeholder="Restaurant name or cuisine"
              className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-brand-500 focus:border-transparent min-h-[44px]"
            />
            <button
              type="submit"
              className="px-4 py-2 bg-brand-500 text-white rounded-lg hover:bg-brand-600 transition-colors min-h-[44px]"
            >
              Go
            </button>
          </div>
        </form>

        {/* Categories */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Cuisine Type
          </label>
          <div className="space-y-2">
            {CATEGORIES.map((category) => (
              <label
                key={category}
                className="flex items-center cursor-pointer min-h-[36px]"
              >
                <input
                  type="checkbox"
                  checked={selectedCategories.includes(category)}
                  onChange={() => handleCategoryToggle(category)}
                  className="mr-2 min-h-[20px] min-w-[20px] cursor-pointer"
                />
                <span className="text-sm">{category}</span>
              </label>
            ))}
          </div>
        </div>

        {/* Price Level */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Price Range
          </label>
          <div className="space-y-2">
            {PRICE_LEVELS.map((price) => (
              <label
                key={price.value}
                className="flex items-center cursor-pointer min-h-[36px]"
              >
                <input
                  type="checkbox"
                  checked={selectedPrices.includes(price.value)}
                  onChange={() => handlePriceToggle(price.value)}
                  className="mr-2 min-h-[20px] min-w-[20px] cursor-pointer"
                />
                <span className="text-sm">{price.label}</span>
              </label>
            ))}
          </div>
        </div>

        {/* Clear Filters */}
        {hasActiveFilters && (
          <button
            onClick={handleClearFilters}
            className="w-full px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors min-h-[44px]"
          >
            Clear All Filters
          </button>
        )}
      </div>
    </div>
  )
}