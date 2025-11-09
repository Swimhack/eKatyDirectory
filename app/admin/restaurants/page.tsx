'use client'

import { useState, useEffect } from 'react'

interface Restaurant {
  id: string
  name: string
  slug: string
  phone: string | null
  website: string | null
  address: string
  city: string
  active: boolean
  source: string | null
  adminOverrides: string | null
  lastVerified: string | null
}

const LOCKABLE_FIELDS = [
  'phone',
  'website',
  'hours',
  'email',
  'address',
  'description',
  'photos'
]

export default function AdminRestaurantsPage() {
  const [restaurants, setRestaurants] = useState<Restaurant[]>([])
  const [loading, setLoading] = useState(true)
  const [selectedRestaurant, setSelectedRestaurant] = useState<Restaurant | null>(null)
  const [apiKey, setApiKey] = useState('')
  const [syncing, setSyncing] = useState(false)
  const [syncResult, setSyncResult] = useState<any>(null)

  useEffect(() => {
    // Load API key from localStorage
    const saved = localStorage.getItem('ekaty_admin_key')
    if (saved) setApiKey(saved)

    fetchRestaurants()
  }, [])

  const fetchRestaurants = async () => {
    try {
      const response = await fetch('/api/admin/restaurants/list', {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('ekaty_admin_key') || ''}`
        }
      })
      if (response.ok) {
        const data = await response.json()
        setRestaurants(data.restaurants || [])
      }
    } catch (error) {
      console.error('Failed to fetch restaurants:', error)
    } finally {
      setLoading(false)
    }
  }

  const saveApiKey = () => {
    localStorage.setItem('ekaty_admin_key', apiKey)
    fetchRestaurants()
  }

  const toggleFieldLock = async (restaurantId: string, field: string, currentlyLocked: boolean) => {
    try {
      const response = await fetch(`/api/admin/restaurants/${restaurantId}/override`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${apiKey}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          field,
          locked: !currentlyLocked
        })
      })

      if (response.ok) {
        await fetchRestaurants()
        if (selectedRestaurant?.id === restaurantId) {
          const updated = restaurants.find(r => r.id === restaurantId)
          if (updated) setSelectedRestaurant(updated)
        }
      } else {
        alert('Failed to update field lock')
      }
    } catch (error) {
      console.error('Error toggling field lock:', error)
      alert('Error updating field lock')
    }
  }

  const getLockedFields = (restaurant: Restaurant): string[] => {
    if (!restaurant.adminOverrides) return []
    try {
      const overrides = JSON.parse(restaurant.adminOverrides)
      return Object.keys(overrides).filter(key => overrides[key])
    } catch {
      return []
    }
  }

  const triggerSync = async () => {
    setSyncing(true)
    setSyncResult(null)
    try {
      const response = await fetch('/api/admin/sync', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${apiKey}`
        }
      })
      const result = await response.json()
      setSyncResult(result)
      await fetchRestaurants()
    } catch (error) {
      setSyncResult({ error: 'Sync failed', message: String(error) })
    } finally {
      setSyncing(false)
    }
  }

  if (loading) {
    return <div className="p-8">Loading...</div>
  }

  return (
    <div className="min-h-screen bg-gray-50 p-8">
      <div className="max-w-7xl mx-auto">
        <h1 className="text-3xl font-bold mb-8">Restaurant Admin</h1>

        {/* API Key Input */}
        <div className="bg-white p-6 rounded-lg shadow mb-8">
          <h2 className="text-xl font-semibold mb-4">Admin API Key</h2>
          <div className="flex gap-4">
            <input
              type="password"
              value={apiKey}
              onChange={(e) => setApiKey(e.target.value)}
              placeholder="Enter admin API key"
              className="flex-1 px-4 py-2 border rounded"
            />
            <button
              onClick={saveApiKey}
              className="px-6 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
            >
              Save
            </button>
          </div>
        </div>

        {/* Sync Controls */}
        <div className="bg-white p-6 rounded-lg shadow mb-8">
          <h2 className="text-xl font-semibold mb-4">Sync Control</h2>
          <button
            onClick={triggerSync}
            disabled={syncing || !apiKey}
            className="px-6 py-2 bg-green-600 text-white rounded hover:bg-green-700 disabled:bg-gray-400"
          >
            {syncing ? 'Syncing...' : 'Trigger Sync Now'}
          </button>

          {syncResult && (
            <div className={`mt-4 p-4 rounded ${syncResult.success ? 'bg-green-50' : 'bg-red-50'}`}>
              <pre className="text-sm overflow-auto">{JSON.stringify(syncResult, null, 2)}</pre>
            </div>
          )}
        </div>

        {/* Restaurant List */}
        <div className="bg-white rounded-lg shadow">
          <div className="p-6 border-b">
            <h2 className="text-xl font-semibold">
              Restaurants ({restaurants.length} total, {restaurants.filter(r => r.active).length} active)
            </h2>
          </div>

          <div className="divide-y">
            {restaurants.map((restaurant) => {
              const lockedFields = getLockedFields(restaurant)
              const isSelected = selectedRestaurant?.id === restaurant.id

              return (
                <div key={restaurant.id} className="p-4 hover:bg-gray-50">
                  <div className="flex justify-between items-start">
                    <div className="flex-1">
                      <h3 className="font-semibold text-lg">{restaurant.name}</h3>
                      <p className="text-sm text-gray-600">{restaurant.address}, {restaurant.city}</p>
                      <div className="flex gap-4 mt-2 text-sm">
                        <span className={`px-2 py-1 rounded ${restaurant.active ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
                          {restaurant.active ? 'Active' : 'Inactive'}
                        </span>
                        {restaurant.source && (
                          <span className="px-2 py-1 rounded bg-blue-100 text-blue-800">
                            {restaurant.source}
                          </span>
                        )}
                        {lockedFields.length > 0 && (
                          <span className="px-2 py-1 rounded bg-yellow-100 text-yellow-800">
                            🔒 {lockedFields.length} locked fields
                          </span>
                        )}
                      </div>
                    </div>

                    <button
                      onClick={() => setSelectedRestaurant(isSelected ? null : restaurant)}
                      className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
                    >
                      {isSelected ? 'Hide' : 'Manage'}
                    </button>
                  </div>

                  {isSelected && (
                    <div className="mt-4 p-4 bg-gray-50 rounded">
                      <h4 className="font-semibold mb-3">Field Lock Management</h4>
                      <div className="grid grid-cols-2 gap-2">
                        {LOCKABLE_FIELDS.map(field => {
                          const isLocked = lockedFields.includes(field)
                          return (
                            <button
                              key={field}
                              onClick={() => toggleFieldLock(restaurant.id, field, isLocked)}
                              className={`px-4 py-2 rounded text-left ${
                                isLocked
                                  ? 'bg-yellow-100 text-yellow-800 border-2 border-yellow-400'
                                  : 'bg-white text-gray-700 border'
                              }`}
                            >
                              {isLocked ? '🔒' : '🔓'} {field}
                            </button>
                          )
                        })}
                      </div>
                      <p className="text-xs text-gray-500 mt-3">
                        🔒 = Locked (Google won't overwrite) | 🔓 = Unlocked (Google can update)
                      </p>
                    </div>
                  )}
                </div>
              )
            })}
          </div>
        </div>
      </div>
    </div>
  )
}
