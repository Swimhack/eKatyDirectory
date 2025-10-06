'use client'

import { useState } from 'react'

export default function AdminPage() {
  const [isSeeding, setIsSeeding] = useState(false)
  const [seedResult, setSeedResult] = useState<string | null>(null)
  const [adminToken, setAdminToken] = useState('')

  const handleSeedDatabase = async () => {
    if (!adminToken.trim()) {
      setSeedResult('Please enter the admin token (Supabase Service Role Key)')
      return
    }

    setIsSeeding(true)
    setSeedResult(null)

    try {
      const response = await fetch('/api/admin/seed', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${adminToken.trim()}`,
          'Content-Type': 'application/json'
        }
      })

      const data = await response.json()

      if (response.ok) {
        setSeedResult(`✅ Success: ${data.message}`)
      } else {
        setSeedResult(`❌ Error: ${data.error} - ${data.details || ''}`)
      }
    } catch (error) {
      setSeedResult(`💥 Network Error: ${error instanceof Error ? error.message : 'Unknown error'}`)
    } finally {
      setIsSeeding(false)
    }
  }

  return (
    <div className="container mx-auto px-4 py-12">
      <div className="max-w-2xl mx-auto">
        <h1 className="text-3xl font-bold text-gray-900 mb-8">
          eKaty Admin Panel
        </h1>

        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 mb-8">
          <h2 className="text-xl font-semibold text-gray-900 mb-4">
            Database Seeding
          </h2>
          <p className="text-gray-600 mb-6">
            Seed the database with restaurant data for Katy, Texas. This will add approximately 20 restaurants
            with complete information including addresses, phone numbers, hours, and categories.
          </p>

          <div className="mb-4">
            <label htmlFor="adminToken" className="block text-sm font-medium text-gray-700 mb-2">
              Admin Token (Supabase Service Role Key)
            </label>
            <input
              id="adminToken"
              type="password"
              value={adminToken}
              onChange={(e) => setAdminToken(e.target.value)}
              placeholder="Enter your Supabase service role key..."
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-brand-500 focus:border-transparent"
            />
            <p className="text-xs text-gray-500 mt-1">
              This should be your Supabase service role key (not the anon key)
            </p>
          </div>

          <button
            onClick={handleSeedDatabase}
            disabled={isSeeding || !adminToken.trim()}
            className="w-full btn-primary py-3 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isSeeding ? (
              <span className="flex items-center justify-center">
                <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                Seeding Database...
              </span>
            ) : (
              '🌱 Seed Restaurant Database'
            )}
          </button>

          {seedResult && (
            <div className={`mt-4 p-4 rounded-lg ${
              seedResult.startsWith('✅') 
                ? 'bg-green-50 border border-green-200 text-green-800' 
                : 'bg-red-50 border border-red-200 text-red-800'
            }`}>
              <pre className="whitespace-pre-wrap text-sm">{seedResult}</pre>
            </div>
          )}
        </div>

        <div className="bg-blue-50 border border-blue-200 rounded-lg p-6">
          <h3 className="text-lg font-semibold text-blue-900 mb-2">
            📋 What this seeding includes:
          </h3>
          <ul className="text-blue-800 space-y-1 text-sm">
            <li>• <strong>20+ Real Restaurants</strong> in Katy, TX area</li>
            <li>• <strong>Complete Information:</strong> Addresses, phone numbers, hours, websites</li>
            <li>• <strong>Categories:</strong> Mexican, American, Asian, Italian, BBQ, Fine Dining, etc.</li>
            <li>• <strong>Featured Listings:</strong> Popular restaurants marked as featured</li>
            <li>• <strong>Price Levels:</strong> $ to $$$$ rating for each restaurant</li>
            <li>• <strong>GPS Coordinates:</strong> Accurate lat/lng for mapping</li>
            <li>• <strong>Sample Reviews:</strong> Initial reviews for featured restaurants</li>
          </ul>
        </div>

        <div className="mt-6 text-center">
          <p className="text-sm text-gray-500">
            After seeding, visit{' '}
            <a href="/discover" className="text-brand-600 hover:underline">
              /discover
            </a>{' '}
            to see the restaurants or try{' '}
            <a href="/spinner" className="text-brand-600 hover:underline">
              Grub Roulette
            </a>
            !
          </p>
        </div>
      </div>
    </div>
  )
}