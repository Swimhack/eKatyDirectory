import { SearchFilters } from '@/components/discover/SearchFilters'
import { RestaurantGrid } from '@/components/discover/RestaurantGrid'
import { Suspense } from 'react'

export const metadata = {
  title: 'Discover Restaurants - eKaty',
  description: 'Search and filter restaurants in Katy, Texas by cuisine, price, rating and more.',
}

export default function DiscoverPage() {
  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-4">
          Discover Restaurants
        </h1>
        <p className="text-gray-600">
          Find the perfect restaurant in Katy with our advanced search and filters.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
        {/* Filters Sidebar */}
        <div className="lg:col-span-1">
          <div className="sticky top-4">
            <Suspense fallback={<div>Loading filters...</div>}>
              <SearchFilters />
            </Suspense>
          </div>
        </div>

        {/* Results */}
        <div className="lg:col-span-3">
          <Suspense fallback={<div>Loading restaurants...</div>}>
            <RestaurantGrid />
          </Suspense>
        </div>
      </div>
    </div>
  )
}