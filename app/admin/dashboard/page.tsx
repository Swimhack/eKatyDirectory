'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'

interface Stats {
  totalRestaurants: number
  totalUsers: number
  totalReviews: number
  activeRestaurants: number
}

export default function AdminDashboard() {
  const [stats, setStats] = useState<Stats | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchStats()
  }, [])

  const fetchStats = async () => {
    try {
      const response = await fetch('/api/admin/stats', {
        headers: {
          'Authorization': 'Bearer ekaty-admin-secret-2025'
        }
      })
      const data = await response.json()
      setStats(data)
    } catch (error) {
      console.error('Failed to fetch stats:', error)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Admin Dashboard</h1>
              <p className="text-gray-600 mt-1">Manage your eKaty platform</p>
            </div>
            <Link 
              href="/"
              className="text-primary-600 hover:text-primary-700 font-medium"
            >
              ← Back to Site
            </Link>
          </div>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {loading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {[...Array(4)].map((_, i) => (
              <div key={i} className="bg-white rounded-lg shadow p-6 animate-pulse">
                <div className="h-4 bg-gray-200 rounded w-1/2 mb-4"></div>
                <div className="h-8 bg-gray-200 rounded w-1/3"></div>
              </div>
            ))}
          </div>
        ) : stats ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <div className="bg-white rounded-lg shadow p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600">Total Restaurants</p>
                  <p className="text-3xl font-bold text-gray-900 mt-2">{stats.totalRestaurants}</p>
                </div>
                <div className="text-4xl">🍽️</div>
              </div>
            </div>

            <div className="bg-white rounded-lg shadow p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600">Active Restaurants</p>
                  <p className="text-3xl font-bold text-green-600 mt-2">{stats.activeRestaurants}</p>
                </div>
                <div className="text-4xl">✅</div>
              </div>
            </div>

            <div className="bg-white rounded-lg shadow p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600">Total Users</p>
                  <p className="text-3xl font-bold text-gray-900 mt-2">{stats.totalUsers}</p>
                </div>
                <div className="text-4xl">👥</div>
              </div>
            </div>

            <div className="bg-white rounded-lg shadow p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600">Total Reviews</p>
                  <p className="text-3xl font-bold text-gray-900 mt-2">{stats.totalReviews}</p>
                </div>
                <div className="text-4xl">⭐</div>
              </div>
            </div>
          </div>
        ) : null}

        {/* Quick Actions */}
        <div className="mt-8">
          <h2 className="text-2xl font-bold text-gray-900 mb-6">Quick Actions</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            
            {/* Manage Restaurants */}
            <Link href="/admin/restaurants" className="bg-white rounded-lg shadow hover:shadow-lg transition-shadow p-6 block">
              <div className="flex items-start">
                <div className="text-4xl mr-4">🍽️</div>
                <div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-2">Manage Restaurants</h3>
                  <p className="text-sm text-gray-600">View, edit, and manage all restaurants</p>
                </div>
              </div>
            </Link>

            {/* Manage Users */}
            <Link href="/admin/users" className="bg-white rounded-lg shadow hover:shadow-lg transition-shadow p-6 block">
              <div className="flex items-start">
                <div className="text-4xl mr-4">👥</div>
                <div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-2">Manage Users</h3>
                  <p className="text-sm text-gray-600">View and edit user profiles</p>
                </div>
              </div>
            </Link>

            {/* Import Restaurant */}
            <Link href="/admin/import" className="bg-white rounded-lg shadow hover:shadow-lg transition-shadow p-6 block">
              <div className="flex items-start">
                <div className="text-4xl mr-4">📥</div>
                <div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-2">Import Restaurant</h3>
                  <p className="text-sm text-gray-600">Add new restaurants from Google Places</p>
                </div>
              </div>
            </Link>

            {/* Sync Data */}
            <Link href="/admin/sync" className="bg-white rounded-lg shadow hover:shadow-lg transition-shadow p-6 block">
              <div className="flex items-start">
                <div className="text-4xl mr-4">🔄</div>
                <div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-2">Sync Data</h3>
                  <p className="text-sm text-gray-600">Run multi-source restaurant sync</p>
                </div>
              </div>
            </Link>

            {/* Reviews */}
            <Link href="/admin/reviews" className="bg-white rounded-lg shadow hover:shadow-lg transition-shadow p-6 block">
              <div className="flex items-start">
                <div className="text-4xl mr-4">⭐</div>
                <div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-2">Manage Reviews</h3>
                  <p className="text-sm text-gray-600">Moderate and manage user reviews</p>
                </div>
              </div>
            </Link>

            {/* Analytics */}
            <Link href="/admin/analytics" className="bg-white rounded-lg shadow hover:shadow-lg transition-shadow p-6 block">
              <div className="flex items-start">
                <div className="text-4xl mr-4">📊</div>
                <div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-2">Analytics</h3>
                  <p className="text-sm text-gray-600">View platform statistics and insights</p>
                </div>
              </div>
            </Link>

          </div>
        </div>

        {/* Recent Activity */}
        <div className="mt-8">
          <h2 className="text-2xl font-bold text-gray-900 mb-6">System Status</h2>
          <div className="bg-white rounded-lg shadow p-6">
            <div className="space-y-4">
              <div className="flex items-center justify-between py-3 border-b">
                <div className="flex items-center">
                  <div className="w-2 h-2 bg-green-500 rounded-full mr-3"></div>
                  <span className="text-gray-900 font-medium">Database</span>
                </div>
                <span className="text-green-600 text-sm font-medium">Operational</span>
              </div>
              <div className="flex items-center justify-between py-3 border-b">
                <div className="flex items-center">
                  <div className="w-2 h-2 bg-green-500 rounded-full mr-3"></div>
                  <span className="text-gray-900 font-medium">API</span>
                </div>
                <span className="text-green-600 text-sm font-medium">Operational</span>
              </div>
              <div className="flex items-center justify-between py-3">
                <div className="flex items-center">
                  <div className="w-2 h-2 bg-green-500 rounded-full mr-3"></div>
                  <span className="text-gray-900 font-medium">Google Places API</span>
                </div>
                <span className="text-green-600 text-sm font-medium">Connected</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
