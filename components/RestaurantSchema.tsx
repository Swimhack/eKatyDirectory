interface RestaurantSchemaProps {
  restaurant: {
    name: string
    description: string
    address: string
    phone?: string
    website?: string
    cuisineTypes?: string
    priceLevel?: string
    rating?: number
    latitude?: number
    longitude?: number
  }
}

export default function RestaurantSchema({ restaurant }: RestaurantSchemaProps) {
  const schema = {
    "@context": "https://schema.org",
    "@type": "Restaurant",
    "name": restaurant.name,
    "description": restaurant.description,
    "address": {
      "@type": "PostalAddress",
      "streetAddress": restaurant.address.split(',')[0],
      "addressLocality": "Katy",
      "addressRegion": "TX",
      "postalCode": restaurant.address.match(/\d{5}/)?.[0] || "77449",
      "addressCountry": "US"
    },
    "geo": restaurant.latitude && restaurant.longitude ? {
      "@type": "GeoCoordinates",
      "latitude": restaurant.latitude,
      "longitude": restaurant.longitude
    } : undefined,
    "telephone": restaurant.phone,
    "url": restaurant.website,
    "servesCuisine": restaurant.cuisineTypes?.split(',') || [],
    "priceRange": restaurant.priceLevel === 'BUDGET' ? '$' : 
                  restaurant.priceLevel === 'MODERATE' ? '$$' :
                  restaurant.priceLevel === 'UPSCALE' ? '$$$' : '$$$$',
    "aggregateRating": restaurant.rating ? {
      "@type": "AggregateRating",
      "ratingValue": restaurant.rating,
      "bestRating": "5",
      "worstRating": "1"
    } : undefined,
    "areaServed": {
      "@type": "City",
      "name": "Katy",
      "containedIn": {
        "@type": "State",
        "name": "Texas"
      }
    }
  }

  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }}
    />
  )
}
