import MapPageContent from '@/components/map/MapPageContent'

export const metadata = {
  title: 'Restaurant Map - eKaty',
  description: 'Explore restaurants in Katy, Texas on an interactive map. Find restaurants near you with our location-based search.',
}

export default function MapPage() {
  return (
    <div className="container mx-auto px-4 py-8">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-4xl sm:text-5xl font-bold text-gray-900 mb-4">
            🗺️ Restaurant Map
          </h1>
          <p className="text-lg text-gray-600 max-w-2xl mx-auto">
            Explore restaurants visually on the map. Use &quot;Near Me&quot; to find restaurants closest to your location!
          </p>
        </div>

        {/* Map Content */}
        <MapPageContent />
      </div>
    </div>
  )
}
