import { createServerComponentClient } from '@supabase/auth-helpers-nextjs'
import { cookies } from 'next/headers'
import { redirect } from 'next/navigation'
import { Database } from '@/lib/supabase/types'
import RestaurantsGrid from '@/components/restaurants/RestaurantsGrid'
import Link from 'next/link'

export const metadata = {
  title: 'My Dashboard - eKaty',
  description: 'View your favorite restaurants, reviews, and activity',
}

export default async function DashboardPage() {
  const supabase = createServerComponentClient<Database>({ cookies })

  // Check authentication
  const {
    data: { session },
  } = await supabase.auth.getSession()

  if (!session) {
    redirect('/auth?redirect=/dashboard')
  }

  // Fetch user's favorites
  const { data: favorites } = await supabase
    .from('favorites')
    .select(
      `
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
    .limit(6)

  // Fetch user's reviews
  const { data: reviews } = await supabase
    .from('reviews')
    .select(
      `
      id,
      rating,
      comment,
      created_at,
      restaurant:restaurants (
        id,
        name
      )
    `
    )
    .eq('user_id', session.user.id)
    .order('created_at', { ascending: false })
    .limit(5)

  const favoriteRestaurants =
    favorites?.map((fav: any) => fav.restaurant).filter(Boolean) ?? []

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl sm:text-4xl font-bold text-gray-900 mb-2">
            My Dashboard
          </h1>
          <p className="text-gray-600">Welcome back!</p>
        </div>

        {/* Quick Stats */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-8">
          <div className="card text-center">
            <div className="text-3xl font-bold text-brand-600 mb-1">
              {favoriteRestaurants.length}
            </div>
            <div className="text-sm text-gray-600">Favorite Restaurants</div>
          </div>
          <div className="card text-center">
            <div className="text-3xl font-bold text-brand-600 mb-1">
              {reviews?.length || 0}
            </div>
            <div className="text-sm text-gray-600">Reviews Written</div>
          </div>
          <div className="card text-center">
            <div className="text-3xl font-bold text-brand-600 mb-1">
              {session.user.email?.charAt(0).toUpperCase() || '👤'}
            </div>
            <div className="text-sm text-gray-600 truncate">
              {session.user.email}
            </div>
          </div>
        </div>

        {/* My Favorites */}
        <div className="mb-8">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-2xl font-bold text-gray-900">My Favorites</h2>
            <Link
              href="/favorites"
              className="text-brand-600 hover:text-brand-700 font-medium text-sm"
            >
              View All →
            </Link>
          </div>

          {favoriteRestaurants.length > 0 ? (
            <RestaurantsGrid
              restaurants={favoriteRestaurants}
              showFavoriteButton={true}
              showSort={false}
            />
          ) : (
            <div className="card text-center py-8">
              <div className="text-6xl mb-4">💚</div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">
                No favorites yet
              </h3>
              <p className="text-gray-600 mb-4">
                Start exploring and save your favorite restaurants!
              </p>
              <Link href="/discover" className="btn-primary inline-block px-6 py-2">
                Discover Restaurants
              </Link>
            </div>
          )}
        </div>

        {/* My Reviews */}
        <div>
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-2xl font-bold text-gray-900">My Recent Reviews</h2>
          </div>

          {reviews && reviews.length > 0 ? (
            <div className="card">
              <div className="space-y-4">
                {reviews.map((review: any) => (
                  <div
                    key={review.id}
                    className="pb-4 border-b border-gray-200 last:border-b-0 last:pb-0"
                  >
                    <div className="flex items-start justify-between mb-2">
                      <Link
                        href={`/restaurant/${review.restaurant?.id}`}
                        className="font-semibold text-gray-900 hover:text-brand-600"
                      >
                        {review.restaurant?.name}
                      </Link>
                      <div className="flex items-center">
                        <span className="text-yellow-400">
                          {'★'.repeat(review.rating)}
                        </span>
                      </div>
                    </div>
                    <p className="text-gray-700 text-sm mb-1">{review.comment}</p>
                    <p className="text-xs text-gray-500">
                      {new Date(review.created_at).toLocaleDateString('en-US', {
                        year: 'numeric',
                        month: 'long',
                        day: 'numeric',
                      })}
                    </p>
                  </div>
                ))}
              </div>
            </div>
          ) : (
            <div className="card text-center py-8">
              <div className="text-6xl mb-4">📝</div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">
                No reviews yet
              </h3>
              <p className="text-gray-600 mb-4">
                Share your dining experiences with the community!
              </p>
              <Link href="/discover" className="btn-primary inline-block px-6 py-2">
                Find Restaurants
              </Link>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
