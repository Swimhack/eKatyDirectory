'use client'

export function SearchFilters() {
  return (
    <div className="card">
      <h3 className="font-semibold text-lg mb-4">Filters</h3>
      
      <div className="space-y-6">
        {/* Search */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Search
          </label>
          <input
            type="text"
            placeholder="Restaurant name or cuisine"
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-brand-500 focus:border-transparent"
          />
        </div>

        {/* Categories */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Cuisine Type
          </label>
          <div className="space-y-2">
            {['Mexican', 'American', 'Asian', 'Italian', 'BBQ'].map((category) => (
              <label key={category} className="flex items-center">
                <input type="checkbox" className="mr-2" />
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
            {[
              { label: '$ - Budget', value: 1 },
              { label: '$$ - Moderate', value: 2 },
              { label: '$$$ - Expensive', value: 3 },
              { label: '$$$$ - Very Expensive', value: 4 },
            ].map((price) => (
              <label key={price.value} className="flex items-center">
                <input type="checkbox" className="mr-2" />
                <span className="text-sm">{price.label}</span>
              </label>
            ))}
          </div>
        </div>

        <button className="w-full btn-primary">
          Apply Filters
        </button>
      </div>
    </div>
  )
}