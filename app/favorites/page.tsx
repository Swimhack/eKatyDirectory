import { createServerComponentClient } from '@supabase/auth-helpers-nextjs'
import { cookies } from 'next/headers'
import { redirect } from 'next/navigation'
import { Database } from '@/lib/supabase/database.types'
import RestaurantsGrid from '@/components/restaurants/RestaurantsGrid'
import Link from 'next/link'

export const metadata = {
  title: 'My Favorites - eKaty',
  description: 'View and manage your favorite restaurants in Katy, Texas',
}

export default async function FavoritesPage() {
  const supabase = createServerComponentClient<Database>({ cookies })

  // Check authentication
  const {
    data: { session },
  } = await supabase.auth.getSession()

  if (!session) {
    redirect('/auth?redirect=/favorites')
  }

  // Fetch user's favorites with restaurant details
  const { data: favorites, error } = await supabase
    .from('favorites')
    .select(
      `
      id,
      created_at,
      restaurant:restaurants (
        id,
        name,
        description,
        address,
        city,
        categories,
        price_level,
        rating,
        review_count,
        phone,
        website,
        photo_urls
      )
    `
    )
    .eq('user_id', session.user.id)
    .order('created_at', { ascending: false })

  if (error) {
    console.error('Error fetching favorites:', error)
  }

  // Extract restaurants from the nested structure
  const restaurants = favorites?.map((fav: any) => fav.restaurant).filter(Boolean) ?? []

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl sm:text-4xl font-bold text-gray-900 mb-2">
            My Favorites
          </h1>
          <p className="text-gray-600">
            {restaurants.length === 0
              ? 'Start saving your favorite restaurants!'
              : `You have ${restaurants.length} favorite ${
                  restaurants.length === 1 ? 'restaurant' : 'restaurants'
                }`}
          </p>
        </div>

        {/* Empty State */}
        {restaurants.length === 0 && (
          <div className="card text-center py-12">
            <div className="max-w-md mx-auto">
              <div className="text-6xl mb-4">💚</div>
              <h2 className="text-2xl font-semibold text-gray-900 mb-2">
                No favorites yet
              </h2>
              <p className="text-gray-600 mb-6">
                Start exploring restaurants and tap the heart icon to save your favorites.
              </p>
              <Link
                href="/discover"
                className="btn-primary inline-block px-6 py-3"
              >
                Discover Restaurants
              </Link>
            </div>
          </div>
        )}

        {/* Favorites Grid */}
        {restaurants.length > 0 && (
          <RestaurantsGrid
            restaurants={restaurants}
            showFavoriteButton={true}
            showSort={true}
          />
        )}
      </div>
    </div>
  )
}
