'use client'

import { useEffect, useState } from 'react'
import dynamic from 'next/dynamic'
import 'leaflet/dist/leaflet.css'

// Dynamically import map components to avoid SSR issues
const MapContainer = dynamic(
  () => import('react-leaflet').then((mod) => mod.MapContainer),
  { ssr: false }
)
const TileLayer = dynamic(
  () => import('react-leaflet').then((mod) => mod.TileLayer),
  { ssr: false }
)
const Marker = dynamic(
  () => import('react-leaflet').then((mod) => mod.Marker),
  { ssr: false }
)
const Popup = dynamic(
  () => import('react-leaflet').then((mod) => mod.Popup),
  { ssr: false }
)

interface Restaurant {
  id: string
  name: string
  slug: string
  address: string
  latitude: number
  longitude: number
  rating?: number
  cuisineTypes: string
  priceLevel: string
}

interface RestaurantMapProps {
  restaurants: Restaurant[]
  center?: [number, number]
  zoom?: number
  height?: string
}

export default function RestaurantMap({
  restaurants,
  center = [29.7858, -95.8244], // Katy, TX
  zoom = 13,
  height = '500px'
}: RestaurantMapProps) {
  const [isClient, setIsClient] = useState(false)
  const [L, setL] = useState<any>(null)

  useEffect(() => {
    setIsClient(true)
    // Import Leaflet on client side
    import('leaflet').then((leaflet) => {
      setL(leaflet.default)
      
      // Fix default marker icon issue with webpack
      delete (leaflet.default.Icon.Default.prototype as any)._getIconUrl
      leaflet.default.Icon.Default.mergeOptions({
        iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png',
        iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png',
        shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
      })
    })
  }, [])

  if (!isClient || !L) {
    return (
      <div 
        style={{ height }} 
        className="bg-gray-100 rounded-lg flex items-center justify-center"
      >
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading map...</p>
        </div>
      </div>
    )
  }

  return (
    <div style={{ height }} className="rounded-lg overflow-hidden shadow-lg relative">
      <MapContainer
        center={center}
        zoom={zoom}
        style={{ height: '100%', width: '100%' }}
        scrollWheelZoom={true}
      >
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />
        
        {restaurants.map((restaurant) => (
          <Marker
            key={restaurant.id}
            position={[restaurant.latitude, restaurant.longitude]}
          >
            <Popup>
              <div className="p-2 min-w-[200px]">
                <h3 className="font-bold text-lg mb-1">{restaurant.name}</h3>
                {restaurant.rating && (
                  <div className="flex items-center gap-1 mb-2">
                    <span className="text-yellow-500">⭐</span>
                    <span className="font-semibold">{restaurant.rating.toFixed(1)}</span>
                  </div>
                )}
                <p className="text-sm text-gray-600 mb-2">{restaurant.address}</p>
                <div className="flex gap-2 text-xs mb-3">
                  <span className="px-2 py-1 bg-gray-100 rounded">
                    {restaurant.cuisineTypes.split(',')[0]}
                  </span>
                  <span className="px-2 py-1 bg-gray-100 rounded">
                    {restaurant.priceLevel}
                  </span>
                </div>
                <a
                  href={`/restaurants/${restaurant.slug}`}
                  className="block w-full text-center px-3 py-2 bg-primary-600 text-white rounded hover:bg-primary-700 transition-colors text-sm font-medium"
                >
                  View Details
                </a>
              </div>
            </Popup>
          </Marker>
        ))}
      </MapContainer>
      
      {/* eKaty Logo Overlay */}
      <div className="absolute top-3 left-3 z-[1000] pointer-events-none">
        <div className="bg-white/80 backdrop-blur-md rounded-xl shadow-sm border border-white/40 px-3 py-1.5 transition-all hover:bg-white/90">
          <img src="/logo.png" alt="eKaty" className="h-6 w-auto opacity-90" />
        </div>
      </div>
    </div>
  )
}
