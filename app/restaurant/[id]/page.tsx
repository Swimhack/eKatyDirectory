import { RestaurantHeader, RestaurantInfo, RestaurantMap } from '@/components/ui/placeholders'
import ReviewsList from '@/components/restaurants/ReviewsList'
import { getRestaurant } from '@/lib/supabase/restaurants'
import { notFound } from 'next/navigation'

interface RestaurantPageProps {
  params: {
    id: string
  }
}

export async function generateMetadata({ params }: RestaurantPageProps) {
  const restaurant = await getRestaurant(params.id)
  
  if (!restaurant) {
    return {
      title: 'Restaurant Not Found - eKaty'
    }
  }

  return {
    title: `${restaurant.name} - eKaty`,
    description: `${restaurant.name} in Katy, Texas. View menu, hours, reviews and more.`,
  }
}

export default async function RestaurantPage({ params }: RestaurantPageProps) {
  const restaurant = await getRestaurant(params.id)

  if (!restaurant) {
    notFound()
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <RestaurantHeader restaurant={restaurant} />
      
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mt-8">
        <div className="lg:col-span-2 space-y-8">
          <RestaurantInfo restaurant={restaurant} />
          <ReviewsList
            restaurantId={restaurant.id}
            restaurantName={restaurant.name}
          />
        </div>

        <div className="lg:col-span-1">
          <div className="sticky top-4">
            <RestaurantMap restaurant={restaurant} />
          </div>
        </div>
      </div>
    </div>
  )
}