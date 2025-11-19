'use client'

import { useEffect, useState } from 'react'
import { Star } from 'lucide-react'
import ReviewForm from './ReviewForm'

interface Review {
  id: string
  rating: number
  comment: string
  created_at: string
  user: {
    full_name: string
    email: string
  }
}

interface ReviewsListProps {
  restaurantId: string
  restaurantName: string
}

export default function ReviewsList({
  restaurantId,
  restaurantName,
}: ReviewsListProps) {
  const [reviews, setReviews] = useState<Review[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const fetchReviews = async () => {
    try {
      setLoading(true)
      const response = await fetch(`/api/restaurants/${restaurantId}/reviews`)

      if (!response.ok) {
        throw new Error('Failed to fetch reviews')
      }

      const data = await response.json()
      setReviews(data.reviews || [])
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load reviews')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchReviews()
  }, [restaurantId])

  const handleReviewSuccess = () => {
    // Refetch reviews after a new review is submitted
    fetchReviews()
  }

  return (
    <div className="space-y-8">
      {/* Review Form */}
      <ReviewForm
        restaurantId={restaurantId}
        restaurantName={restaurantName}
        onSuccess={handleReviewSuccess}
      />

      {/* Reviews List */}
      <div className="card">
        <h3 className="text-xl font-semibold text-gray-900 mb-6">
          Customer Reviews ({reviews.length})
        </h3>

        {loading && (
          <div className="space-y-4">
            {[1, 2, 3].map((i) => (
              <div key={i} className="animate-pulse">
                <div className="flex items-center space-x-2 mb-2">
                  <div className="h-4 bg-gray-200 rounded w-24"></div>
                  <div className="h-4 bg-gray-200 rounded w-32"></div>
                </div>
                <div className="h-3 bg-gray-200 rounded mb-2"></div>
                <div className="h-3 bg-gray-200 rounded w-3/4"></div>
              </div>
            ))}
          </div>
        )}

        {error && (
          <div className="text-center py-8">
            <p className="text-red-600">{error}</p>
          </div>
        )}

        {!loading && !error && reviews.length === 0 && (
          <div className="text-center py-8">
            <div className="text-6xl mb-4">📝</div>
            <h4 className="text-lg font-semibold text-gray-900 mb-2">
              No Reviews Yet
            </h4>
            <p className="text-gray-600">
              Be the first to review {restaurantName}!
            </p>
          </div>
        )}

        {!loading && !error && reviews.length > 0 && (
          <div className="space-y-6">
            {reviews.map((review) => (
              <div
                key={review.id}
                className="pb-6 border-b border-gray-200 last:border-b-0 last:pb-0"
              >
                {/* Review Header */}
                <div className="flex items-start justify-between mb-3">
                  <div>
                    <div className="flex items-center space-x-2 mb-1">
                      <span className="font-semibold text-gray-900">
                        {review.user?.full_name || 'Anonymous'}
                      </span>
                      <div className="flex items-center">
                        {[...Array(5)].map((_, i) => (
                          <Star
                            key={i}
                            size={16}
                            className={`
                              ${
                                i < review.rating
                                  ? 'fill-yellow-400 text-yellow-400'
                                  : 'text-gray-300'
                              }
                            `}
                          />
                        ))}
                      </div>
                    </div>
                    <p className="text-sm text-gray-500">
                      {new Date(review.created_at).toLocaleDateString('en-US', {
                        year: 'numeric',
                        month: 'long',
                        day: 'numeric',
                      })}
                    </p>
                  </div>
                </div>

                {/* Review Comment */}
                <p className="text-gray-700 leading-relaxed">{review.comment}</p>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
