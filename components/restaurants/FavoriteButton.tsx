'use client'

import { useState, useEffect } from 'react'
import { useAuth } from '@/lib/auth-context'
import { useRouter } from 'next/navigation'
import { Heart } from 'lucide-react'

interface FavoriteButtonProps {
  restaurantId: string
  initialFavorited?: boolean
  size?: 'sm' | 'md' | 'lg'
  className?: string
}

export default function FavoriteButton({
  restaurantId,
  initialFavorited = false,
  size = 'md',
  className = '',
}: FavoriteButtonProps) {
  const { user } = useAuth()
  const router = useRouter()
  const [favorited, setFavorited] = useState(initialFavorited)
  const [loading, setLoading] = useState(false)

  // Check if restaurant is favorited when user logs in
  useEffect(() => {
    if (user && !initialFavorited) {
      checkFavoriteStatus()
    }
  }, [user])

  const checkFavoriteStatus = async () => {
    try {
      const response = await fetch('/api/favorites')
      if (response.ok) {
        const data = await response.json()
        const isFavorited = data.restaurants?.some(
          (r: any) => r.id === restaurantId
        )
        setFavorited(isFavorited)
      }
    } catch (error) {
      console.error('Error checking favorite status:', error)
    }
  }

  const toggleFavorite = async (e: React.MouseEvent) => {
    e.preventDefault()
    e.stopPropagation()

    if (!user) {
      // Redirect to login with return URL
      router.push(`/auth?redirect=/restaurant/${restaurantId}`)
      return
    }

    setLoading(true)
    const method = favorited ? 'DELETE' : 'POST'

    try {
      const response = await fetch('/api/favorites', {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ restaurant_id: restaurantId }),
      })

      if (!response.ok) {
        const error = await response.json()
        throw new Error(error.error || 'Failed to update favorite')
      }

      // Optimistically update UI
      setFavorited(!favorited)
    } catch (error) {
      console.error('Failed to toggle favorite:', error)
      // Could show a toast notification here
    } finally {
      setLoading(false)
    }
  }

  const sizeClasses = {
    sm: 'min-h-[36px] min-w-[36px] p-2',
    md: 'min-h-[44px] min-w-[44px] p-2',
    lg: 'min-h-[52px] min-w-[52px] p-3',
  }

  const iconSizes = {
    sm: 'w-4 h-4',
    md: 'w-6 h-6',
    lg: 'w-7 h-7',
  }

  return (
    <button
      onClick={toggleFavorite}
      disabled={loading}
      className={`
        ${sizeClasses[size]}
        flex items-center justify-center
        rounded-full bg-white shadow-md
        hover:shadow-lg transition-all
        disabled:opacity-50 disabled:cursor-not-allowed
        ${className}
      `}
      aria-label={favorited ? 'Remove from favorites' : 'Add to favorites'}
      title={favorited ? 'Remove from favorites' : 'Add to favorites'}
    >
      {loading ? (
        <svg
          className={`${iconSizes[size]} animate-spin text-gray-400`}
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
      ) : (
        <Heart
          className={`
            ${iconSizes[size]}
            transition-colors
            ${
              favorited
                ? 'fill-red-500 text-red-500'
                : 'text-gray-400 hover:text-red-400'
            }
          `}
        />
      )}
    </button>
  )
}
