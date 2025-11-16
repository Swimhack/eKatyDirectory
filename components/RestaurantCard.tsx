import Link from 'next/link'

interface RestaurantCardProps {
  restaurant: any
}

export default function RestaurantCard({ restaurant }: RestaurantCardProps) {
  const getPriceLevelDisplay = (level: string) => {
    switch (level) {
      case 'BUDGET': return '$'
      case 'MODERATE': return '$$'
      case 'UPSCALE': return '$$$'
      case 'PREMIUM': return '$$$$'
      default: return '$$'
    }
  }

  // Parse photos if they're a string (comma-separated)
  const photos = Array.isArray(restaurant.photos) 
    ? restaurant.photos 
    : restaurant.photos 
      ? restaurant.photos.split(',').map((p: string) => p.trim()).filter(Boolean)
      : []

  // Use hero image if available, otherwise fall back to first photo or logo
  const thumbnailImage = restaurant.heroImage || (photos.length > 0 ? photos[0] : restaurant.logoUrl)

  return (
    <Link href={`/restaurants/${restaurant.slug || restaurant.id}`}>
      <div className="card overflow-hidden hover:shadow-xl transition-all duration-200 cursor-pointer group">
        {/* Image */}
        <div className="relative h-48 bg-gray-200 overflow-hidden">
          {thumbnailImage ? (
            <img 
              src={thumbnailImage} 
              alt={restaurant.name}
              className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300"
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-gray-300 to-gray-400">
              <div className="text-center text-gray-500">
                <svg className="w-12 h-12 mx-auto mb-2 opacity-50" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                </svg>
                <p className="text-xs font-medium">No photo available</p>
              </div>
            </div>
          )}
          {restaurant.featured && (
            <div className="absolute top-2 left-2 bg-primary-600 text-white px-2 py-1 rounded text-xs font-semibold">
              FEATURED
            </div>
          )}
          {restaurant.distance && (
            <div className="absolute top-2 right-2 bg-black bg-opacity-50 text-white px-2 py-1 rounded text-xs">
              {restaurant.distance.toFixed(1)} mi
            </div>
          )}
        </div>
        
        {/* Content */}
        <div className="p-4">
          <div className="flex justify-between items-start mb-2">
            <h3 className="text-lg font-semibold text-gray-900 group-hover:text-primary-600 transition-colors">
              {restaurant.name}
            </h3>
            <span className="text-sm font-medium text-gray-500">
              {getPriceLevelDisplay(restaurant.priceLevel)}
            </span>
          </div>
          
          {/* Categories */}
          <div className="flex flex-wrap gap-1 mb-2">
            {restaurant.categories?.slice(0, 3).map((cat: string) => (
              <span key={cat} className="text-xs bg-gray-100 text-gray-600 px-2 py-1 rounded">
                {cat}
              </span>
            ))}
          </div>
          
          {/* Rating and Reviews */}
          <div className="flex items-center justify-between mt-3">
            <div className="flex items-center">
              {restaurant.rating && (
                <>
                  <div className="flex items-center">
                    <svg className="w-4 h-4 text-yellow-500 fill-current" viewBox="0 0 20 20">
                      <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                    </svg>
                    <span className="ml-1 text-sm font-medium text-gray-700">
                      {restaurant.rating.toFixed(1)}
                    </span>
                  </div>
                  <span className="ml-2 text-xs text-gray-500">
                    ({restaurant.reviewCount || restaurant._count?.reviews || 0} reviews)
                  </span>
                </>
              )}
            </div>
            
            {restaurant._count?.favorites > 0 && (
              <div className="flex items-center text-xs text-gray-500">
                <svg className="w-3 h-3 mr-1" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M3.172 5.172a4 4 0 015.656 0L10 6.343l1.172-1.171a4 4 0 115.656 5.656L10 17.657l-6.828-6.829a4 4 0 010-5.656z" clipRule="evenodd" />
                </svg>
                {restaurant._count.favorites}
              </div>
            )}
          </div>
          
          {/* Address */}
          {restaurant.address && (
            <p className="text-xs text-gray-500 mt-2 truncate">
              {restaurant.address}, {restaurant.city}, {restaurant.state}
            </p>
          )}
        </div>
      </div>
    </Link>
  )
}