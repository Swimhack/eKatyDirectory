'use client'

import { useEffect, useState } from 'react'
import Image from 'next/image'

// Placeholder components for spinner functionality
export function SpinWheel() {
  return (
    <div className="card text-center p-8">
      <div className="w-64 h-64 mx-auto mb-8 bg-gradient-to-br from-brand-400 to-brand-600 rounded-full flex items-center justify-center">
        <div className="text-white text-6xl">🎲</div>
      </div>
      <button className="btn-primary text-xl px-8 py-4">
        Spin the Wheel!
      </button>
      <p className="text-gray-600 mt-4">
        Click to discover your next restaurant adventure!
      </p>
    </div>
  )
}

export function SpinHistory() {
  const [spins, setSpins] = useState<Array<{ id: string; restaurant_name: string; created_at: string }>>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function fetchSpinHistory() {
      try {
        const response = await fetch('/api/spins/recent')
        if (response.ok) {
          const data = await response.json()
          setSpins(data.spins || [])
        }
      } catch (error) {
        console.error('Error fetching spin history:', error)
      } finally {
        setLoading(false)
      }
    }

    fetchSpinHistory()
  }, [])

  if (loading) {
    return (
      <div className="card">
        <h3 className="font-semibold text-lg mb-4">Recent Spins</h3>
        <div className="space-y-3">
          {[1, 2, 3].map((i) => (
            <div key={i} className="flex justify-between items-center p-3 bg-gray-50 rounded-lg animate-pulse">
              <div className="h-4 bg-gray-200 rounded w-24"></div>
              <div className="h-3 bg-gray-200 rounded w-16"></div>
            </div>
          ))}
        </div>
      </div>
    )
  }

  return (
    <div className="card">
      <h3 className="font-semibold text-lg mb-4">Recent Spins</h3>
      {spins.length === 0 ? (
        <div className="text-center py-6">
          <div className="text-3xl mb-2">🎲</div>
          <p className="text-gray-600 text-sm">No recent spins. Try the roulette!</p>
        </div>
      ) : (
        <div className="space-y-3">
          {spins.map((spin) => (
            <div key={spin.id} className="flex justify-between items-center p-3 bg-gray-50 rounded-lg">
              <span className="font-medium">{spin.restaurant_name}</span>
              <span className="text-sm text-gray-600">
                {new Date(spin.created_at).toLocaleDateString()}
              </span>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}

// Auth components
export function AuthForms() {
  return (
    <div className="card">
      <h3 className="text-xl font-semibold mb-6 text-center">Sign In</h3>
      <form className="space-y-4">
        <input
          type="email"
          placeholder="Email address"
          className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-brand-500"
        />
        <input
          type="password"
          placeholder="Password"
          className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-brand-500"
        />
        <button type="submit" className="w-full btn-primary py-3">
          Sign In
        </button>
      </form>
      <p className="text-center text-sm text-gray-600 mt-4">
        Don&apos;t have an account? <span className="text-brand-600 hover:underline cursor-pointer">Sign up</span>
      </p>
    </div>
  )
}

// Contact components
export function ContactForm() {
  return (
    <div className="card">
      <form className="space-y-4">
        <input
          type="text"
          placeholder="Your Name"
          className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-brand-500"
        />
        <input
          type="email"
          placeholder="Email Address"
          className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-brand-500"
        />
        <textarea
          rows={4}
          placeholder="Your Message"
          className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-brand-500"
        ></textarea>
        <button type="submit" className="w-full btn-primary py-3">
          Send Message
        </button>
      </form>
    </div>
  )
}

export function BusinessInquiry() {
  return (
    <div className="card">
      <form className="space-y-4">
        <input
          type="text"
          placeholder="Restaurant Name"
          className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-brand-500"
        />
        <input
          type="text"
          placeholder="Contact Person"
          className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-brand-500"
        />
        <input
          type="email"
          placeholder="Business Email"
          className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-brand-500"
        />
        <select className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-brand-500">
          <option value="">Inquiry Type</option>
          <option value="listing">Get Listed</option>
          <option value="advertising">Advertising</option>
          <option value="partnership">Partnership</option>
        </select>
        <textarea
          rows={4}
          placeholder="Tell us about your restaurant and goals"
          className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-brand-500"
        ></textarea>
        <button type="submit" className="w-full btn-primary py-3">
          Submit Inquiry
        </button>
      </form>
    </div>
  )
}

// Restaurant detail components
export function RestaurantHeader({ restaurant }: { restaurant: any }) {
  const handleCall = () => {
    if (restaurant.phone) {
      window.location.href = `tel:${restaurant.phone}`
    }
  }

  const handleDirections = () => {
    if (restaurant.lat && restaurant.lng) {
      const url = `https://maps.google.com/maps?daddr=${restaurant.lat},${restaurant.lng}`
      window.open(url, '_blank')
    } else if (restaurant.address) {
      const url = `https://maps.google.com/maps?daddr=${encodeURIComponent(restaurant.address)}`
      window.open(url, '_blank')
    }
  }

  const photos = restaurant.photos || []
  const primaryPhoto = photos.length > 0 ? photos[0] : 'https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?w=800&q=80'

  return (
    <div>
      {/* Photo Gallery */}
      {photos.length > 0 && (
        <div className="mb-6">
          <div className="grid grid-cols-1 lg:grid-cols-4 gap-4">
            <div className="lg:col-span-3">
              <div className="relative h-96 rounded-lg overflow-hidden">
                <Image
                  src={primaryPhoto}
                  alt={`${restaurant.name} main photo`}
                  fill
                  className="object-cover"
                  sizes="(max-width: 768px) 100vw, 75vw"
                />
              </div>
            </div>
            {photos.length > 1 && (
              <div className="lg:col-span-1 grid grid-cols-2 lg:grid-cols-1 gap-4">
                {photos.slice(1, 3).map((photo: string, index: number) => (
                  <div key={index} className="relative h-44 lg:h-44 rounded-lg overflow-hidden">
                    <Image
                      src={photo}
                      alt={`${restaurant.name} photo ${index + 2}`}
                      fill
                      className="object-cover"
                      sizes="(max-width: 768px) 50vw, 25vw"
                    />
                  </div>
                ))}
                {photos.length > 3 && (
                  <div className="relative h-44 lg:h-44 rounded-lg overflow-hidden bg-black bg-opacity-70 flex items-center justify-center">
                    <span className="text-white text-lg font-medium">
                      +{photos.length - 3} more
                    </span>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      )}
      
      {/* Restaurant Info */}
      <div className="card">
        <h1 className="text-3xl font-bold mb-2">{restaurant.name}</h1>
        <p className="text-gray-600 mb-4">
          {restaurant.categories?.join(', ')} • {'$'.repeat(restaurant.price_level)} 
          {restaurant.rating && (
            <> • ⭐ {restaurant.rating.toFixed(1)} ({restaurant.review_count || 0} reviews)</>
          )}
        </p>
        <div className="flex gap-4 flex-wrap">
          {restaurant.phone && (
            <button onClick={handleCall} className="btn-primary">
              Call Restaurant
            </button>
          )}
          <button onClick={handleDirections} className="btn-secondary">
            Get Directions
          </button>
          <button className="btn-secondary">
            Save to Favorites
          </button>
        </div>
      </div>
    </div>
  )
}

export function RestaurantInfo({ restaurant }: { restaurant: any }) {
  const formatHours = (hours: any) => {
    if (!hours) return 'Hours not available'
    
    const daysOfWeek = ['monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday']
    const dayNames = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun']
    
    return daysOfWeek.map((day, index) => {
      const time = hours[day]
      return (
        <div key={day} className="flex justify-between">
          <span className="font-medium">{dayNames[index]}</span>
          <span>{time || 'Closed'}</span>
        </div>
      )
    })
  }

  return (
    <div className="card">
      <h2 className="text-xl font-semibold mb-4">Restaurant Information</h2>
      <div className="space-y-4">
        {restaurant.address && (
          <div>
            <h3 className="font-medium mb-2">Address</h3>
            <p className="text-gray-600">{restaurant.address}</p>
          </div>
        )}
        {restaurant.hours && (
          <div>
            <h3 className="font-medium mb-2">Hours</h3>
            <div className="text-gray-600 space-y-1">
              {formatHours(restaurant.hours)}
            </div>
          </div>
        )}
        {restaurant.phone && (
          <div>
            <h3 className="font-medium mb-2">Contact</h3>
            <p className="text-gray-600">
              <a href={`tel:${restaurant.phone}`} className="hover:text-brand-600">
                {restaurant.phone}
              </a>
            </p>
          </div>
        )}
        {restaurant.website && (
          <div>
            <h3 className="font-medium mb-2">Website</h3>
            <p className="text-gray-600">
              <a 
                href={restaurant.website} 
                target="_blank" 
                rel="noopener noreferrer"
                className="text-brand-600 hover:text-brand-700 underline"
              >
                Visit Website
              </a>
            </p>
          </div>
        )}
      </div>
    </div>
  )
}

import { Review, User } from '@/lib/supabase/database.types'

type ReviewWithUser = Review & {
  users: Pick<User, 'name'>
}

export function RestaurantReviews({ restaurantId }: { restaurantId: string }) {
  const [reviews, setReviews] = useState<ReviewWithUser[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function fetchReviews() {
      try {
        const response = await fetch(`/api/restaurants/${restaurantId}/reviews`)
        if (response.ok) {
          const data = await response.json()
          setReviews(data.reviews || [])
        }
      } catch (error) {
        console.error('Error fetching reviews:', error)
      } finally {
        setLoading(false)
      }
    }

    fetchReviews()
  }, [restaurantId])

  if (loading) {
    return (
      <div className="card">
        <h2 className="text-xl font-semibold mb-4">Reviews</h2>
        <div className="space-y-4">
          {[1, 2, 3].map((i) => (
            <div key={i} className="animate-pulse">
              <div className="flex items-center mb-2">
                <div className="h-4 bg-gray-200 rounded w-24"></div>
                <div className="h-4 bg-gray-200 rounded w-20 ml-2"></div>
                <div className="h-3 bg-gray-200 rounded w-16 ml-auto"></div>
              </div>
              <div className="h-4 bg-gray-200 rounded w-full mb-2"></div>
              <div className="h-4 bg-gray-200 rounded w-3/4"></div>
            </div>
          ))}
        </div>
      </div>
    )
  }

  return (
    <div className="card">
      <h2 className="text-xl font-semibold mb-4">Reviews</h2>
      {reviews.length === 0 ? (
        <div className="text-center py-8">
          <div className="text-4xl mb-2">💬</div>
          <p className="text-gray-600">No reviews yet. Be the first to share your experience!</p>
        </div>
      ) : (
        <div className="space-y-4">
          {reviews.map((review) => (
            <div key={review.id} className="border-b border-gray-200 pb-4 last:border-b-0">
              <div className="flex items-center mb-2">
                <span className="text-yellow-400">
                  {'★'.repeat(review.rating)}{'☆'.repeat(5 - review.rating)}
                </span>
                <span className="ml-2 font-medium">{review.users.name}</span>
                <span className="ml-auto text-sm text-gray-600">
                  {new Date(review.created_at).toLocaleDateString()}
                </span>
              </div>
              {review.text && (
                <p className="text-gray-700">{review.text}</p>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  )
}

export function RestaurantMap({ restaurant }: { restaurant: any }) {
  return (
    <div className="card">
      <h3 className="font-semibold mb-4">Location</h3>
      <div className="h-64 bg-gray-200 rounded-lg flex items-center justify-center">
        <span className="text-gray-600">Map will be displayed here</span>
      </div>
    </div>
  )
}