'use client'

import { useState } from 'react'
import { useAuth } from '@/lib/auth-context'
import { useRouter } from 'next/navigation'
import { Star } from 'lucide-react'

interface ReviewFormProps {
  restaurantId: string
  restaurantName: string
  onSuccess?: () => void
}

export default function ReviewForm({
  restaurantId,
  restaurantName,
  onSuccess,
}: ReviewFormProps) {
  const { user } = useAuth()
  const router = useRouter()
  const [rating, setRating] = useState(0)
  const [hoverRating, setHoverRating] = useState(0)
  const [comment, setComment] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)

    if (!user) {
      router.push(`/auth?redirect=/restaurant/${restaurantId}`)
      return
    }

    if (rating === 0) {
      setError('Please select a rating')
      return
    }

    if (!comment.trim()) {
      setError('Please write a comment')
      return
    }

    if (comment.length > 500) {
      setError('Comment must be 500 characters or less')
      return
    }

    setLoading(true)

    try {
      const response = await fetch('/api/reviews', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          restaurant_id: restaurantId,
          rating,
          comment: comment.trim(),
        }),
      })

      if (!response.ok) {
        const error = await response.json()
        throw new Error(error.error || 'Failed to submit review')
      }

      setSuccess(true)
      setRating(0)
      setComment('')

      if (onSuccess) {
        onSuccess()
      }

      // Refresh the page after a short delay to show the new review
      setTimeout(() => {
        router.refresh()
      }, 1500)
    } catch (err) {
      if (err instanceof Error) {
        setError(err.message)
      } else {
        setError('Failed to submit review. Please try again.')
      }
    } finally {
      setLoading(false)
    }
  }

  if (!user) {
    return (
      <div className="card text-center py-8">
        <h3 className="text-xl font-semibold text-gray-900 mb-2">
          Sign in to Leave a Review
        </h3>
        <p className="text-gray-600 mb-4">
          Share your experience with {restaurantName}
        </p>
        <button
          onClick={() => router.push(`/auth?redirect=/restaurant/${restaurantId}`)}
          className="btn-primary px-6 py-2"
        >
          Sign In
        </button>
      </div>
    )
  }

  if (success) {
    return (
      <div className="card text-center py-8">
        <div className="text-6xl mb-4">✨</div>
        <h3 className="text-xl font-semibold text-gray-900 mb-2">
          Thank You for Your Review!
        </h3>
        <p className="text-gray-600">
          Your review has been submitted successfully.
        </p>
      </div>
    )
  }

  return (
    <div className="card">
      <h3 className="text-xl font-semibold text-gray-900 mb-4">
        Write a Review
      </h3>

      {error && (
        <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg text-red-700 text-sm">
          {error}
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-4">
        {/* Star Rating */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Your Rating
          </label>
          <div className="flex items-center space-x-1">
            {[1, 2, 3, 4, 5].map((star) => (
              <button
                key={star}
                type="button"
                onClick={() => setRating(star)}
                onMouseEnter={() => setHoverRating(star)}
                onMouseLeave={() => setHoverRating(0)}
                className="min-h-[44px] min-w-[44px] flex items-center justify-center transition-transform hover:scale-110"
                aria-label={`Rate ${star} stars`}
              >
                <Star
                  size={32}
                  className={`
                    transition-colors
                    ${
                      star <= (hoverRating || rating)
                        ? 'fill-yellow-400 text-yellow-400'
                        : 'text-gray-300'
                    }
                  `}
                />
              </button>
            ))}
          </div>
          {rating > 0 && (
            <p className="text-sm text-gray-600 mt-1">
              {rating === 1 && 'Poor'}
              {rating === 2 && 'Fair'}
              {rating === 3 && 'Good'}
              {rating === 4 && 'Very Good'}
              {rating === 5 && 'Excellent'}
            </p>
          )}
        </div>

        {/* Comment */}
        <div>
          <label
            htmlFor="comment"
            className="block text-sm font-medium text-gray-700 mb-1"
          >
            Your Review
          </label>
          <textarea
            id="comment"
            value={comment}
            onChange={(e) => setComment(e.target.value)}
            placeholder="Share your experience..."
            rows={4}
            maxLength={500}
            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-brand-500 focus:border-transparent resize-none"
            disabled={loading}
          />
          <p className="text-xs text-gray-500 mt-1 text-right">
            {comment.length}/500 characters
          </p>
        </div>

        {/* Submit Button */}
        <button
          type="submit"
          disabled={loading || rating === 0 || !comment.trim()}
          className="w-full btn-primary py-3 min-h-[44px] disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {loading ? (
            <span className="flex items-center justify-center">
              <svg
                className="animate-spin -ml-1 mr-3 h-5 w-5 text-white"
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 24 24"
              >
                <circle
                  className="opacity-25"
                  cx="12"
                  cy="12"
                  r="10"
                  stroke="currentColor"
                  strokeWidth="4"
                ></circle>
                <path
                  className="opacity-75"
                  fill="currentColor"
                  d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                ></path>
              </svg>
              Submitting...
            </span>
          ) : (
            'Submit Review'
          )}
        </button>
      </form>
    </div>
  )
}
