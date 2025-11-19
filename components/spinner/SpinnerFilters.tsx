'use client'

import { useState } from 'react'

interface SpinnerFiltersProps {
  onFiltersChange: (filters: { categories: string[]; priceLevel: number[] }) => void
}

const CATEGORIES = ['Mexican', 'American', 'Asian', 'Italian', 'BBQ', 'Seafood', 'Pizza']
const PRICE_LEVELS = [
  { label: '$', value: 1 },
  { label: '$$', value: 2 },
  { label: '$$$', value: 3 },
  { label: '$$$$', value: 4 },
]

export default function SpinnerFilters({ onFiltersChange }: SpinnerFiltersProps) {
  const [selectedCategories, setSelectedCategories] = useState<string[]>([])
  const [selectedPrices, setSelectedPrices] = useState<number[]>([])
  const [isOpen, setIsOpen] = useState(false)

  const handleCategoryToggle = (category: string) => {
    const newCategories = selectedCategories.includes(category)
      ? selectedCategories.filter((c) => c !== category)
      : [...selectedCategories, category]

    setSelectedCategories(newCategories)
    onFiltersChange({ categories: newCategories, priceLevel: selectedPrices })
  }

  const handlePriceToggle = (price: number) => {
    const newPrices = selectedPrices.includes(price)
      ? selectedPrices.filter((p) => p !== price)
      : [...selectedPrices, price]

    setSelectedPrices(newPrices)
    onFiltersChange({ categories: selectedCategories, priceLevel: newPrices })
  }

  const handleClearAll = () => {
    setSelectedCategories([])
    setSelectedPrices([])
    onFiltersChange({ categories: [], priceLevel: [] })
  }

  const hasActiveFilters = selectedCategories.length > 0 || selectedPrices.length > 0

  return (
    <div className="card max-w-2xl mx-auto mb-8">
      {/* Mobile Toggle Button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="w-full flex items-center justify-between md:hidden min-h-[44px]"
      >
        <span className="font-semibold text-lg">
          Filter Your Spin {hasActiveFilters && `(${selectedCategories.length + selectedPrices.length})`}
        </span>
        <span className="text-2xl">{isOpen ? '▲' : '▼'}</span>
      </button>

      {/* Desktop Title */}
      <h3 className="hidden md:block font-semibold text-lg mb-4">
        Filter Your Spin
        {hasActiveFilters && (
          <span className="ml-2 text-sm text-brand-600">
            ({selectedCategories.length + selectedPrices.length} active)
          </span>
        )}
      </h3>

      {/* Filters Content */}
      <div className={`${isOpen ? 'block' : 'hidden'} md:block mt-4 md:mt-0`}>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Categories */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-3">
              Cuisine Type
            </label>
            <div className="flex flex-wrap gap-2">
              {CATEGORIES.map((category) => (
                <button
                  key={category}
                  onClick={() => handleCategoryToggle(category)}
                  className={`
                    px-4 py-2 rounded-full text-sm font-medium transition-all min-h-[36px]
                    ${
                      selectedCategories.includes(category)
                        ? 'bg-brand-500 text-white shadow-md'
                        : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                    }
                  `}
                >
                  {category}
                </button>
              ))}
            </div>
          </div>

          {/* Price Levels */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-3">
              Price Range
            </label>
            <div className="flex flex-wrap gap-2">
              {PRICE_LEVELS.map((price) => (
                <button
                  key={price.value}
                  onClick={() => handlePriceToggle(price.value)}
                  className={`
                    px-6 py-2 rounded-full text-lg font-bold transition-all min-h-[36px]
                    ${
                      selectedPrices.includes(price.value)
                        ? 'bg-brand-500 text-white shadow-md'
                        : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                    }
                  `}
                >
                  {price.label}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Clear Button */}
        {hasActiveFilters && (
          <button
            onClick={handleClearAll}
            className="mt-4 w-full px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors min-h-[44px] font-medium"
          >
            Clear All Filters
          </button>
        )}
      </div>
    </div>
  )
}
