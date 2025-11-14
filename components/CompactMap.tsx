'use client'

import { useEffect, useState } from 'react'
import dynamic from 'next/dynamic'
import 'leaflet/dist/leaflet.css'

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
  latitude: number
  longitude: number
  rating?: number
}

interface CompactMapProps {
  restaurants: Restaurant[]
  height?: string
}

export default function CompactMap({ restaurants, height = '300px' }: CompactMapProps) {
  const [isClient, setIsClient] = useState(false)
  const [L, setL] = useState<any>(null)

  useEffect(() => {
    setIsClient(true)
    import('leaflet').then((leaflet) => {
      setL(leaflet.default)
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
      <div style={{ height }} className="bg-gray-100 rounded-lg flex items-center justify-center">
        <p className="text-gray-500 text-sm">Loading map...</p>
      </div>
    )
  }

  // Calculate center from restaurants
  const center: [number, number] = restaurants.length > 0
    ? [
        restaurants.reduce((sum, r) => sum + r.latitude, 0) / restaurants.length,
        restaurants.reduce((sum, r) => sum + r.longitude, 0) / restaurants.length
      ]
    : [29.7858, -95.8244]

  return (
    <div style={{ height }} className="rounded-lg overflow-hidden relative">
      <MapContainer
        center={center}
        zoom={12}
        style={{ height: '100%', width: '100%' }}
        scrollWheelZoom={false}
        zoomControl={false}
      >
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />
        {restaurants.map((restaurant) => (
          <Marker key={restaurant.id} position={[restaurant.latitude, restaurant.longitude]}>
            <Popup>
              <div className="text-center">
                <p className="font-semibold">{restaurant.name}</p>
                {restaurant.rating && <p className="text-sm">⭐ {restaurant.rating.toFixed(1)}</p>}
                <a href={`/restaurants/${restaurant.slug}`} className="text-primary-600 text-sm">View</a>
              </div>
            </Popup>
          </Marker>
        ))}
      </MapContainer>
      
      {/* eKaty Logo Overlay - Compact */}
      <div className="absolute top-2 left-2 z-[1000] pointer-events-none">
        <div className="bg-white/75 backdrop-blur-md rounded-lg shadow-sm border border-white/30 px-2 py-1">
          <img src="/logo.png" alt="eKaty" className="h-5 w-auto opacity-85" />
        </div>
      </div>
    </div>
  )
}
