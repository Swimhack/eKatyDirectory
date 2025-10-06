'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Search } from 'lucide-react'

export function Hero() {
  const [searchQuery, setSearchQuery] = useState('')
  const router = useRouter()

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault()
    if (searchQuery.trim()) {
      router.push(`/discover?search=${encodeURIComponent(searchQuery.trim())}`)
    } else {
      router.push('/discover')
    }
  }

  return (
    <section className="bg-gradient-to-br from-warm-50 via-brand-50 to-earth-100 section-spacing">
      <div className="container-mobile text-center">
        <h1 className="font-bold text-gray-900 mb-4 md:mb-6">
          Your Katy Community&apos;s
          <span className="block text-brand-600">Favorite Local Spots</span>
        </h1>
        
        <p className="text-gray-600 mb-6 md:mb-8 max-w-2xl mx-auto text-base md:text-xl">
          Bringing families together over great food. Discover authentic flavors and 
          beloved local restaurants that make our community special.
        </p>

        {/* Search Bar */}
        <form onSubmit={handleSearch} className="max-w-2xl mx-auto mb-6 md:mb-8">
          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-3 md:pl-4 flex items-center pointer-events-none">
              <Search className="h-4 w-4 md:h-5 md:w-5 text-gray-400" />
            </div>
            <input
              type="text"
              placeholder="Search restaurants, cuisines..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="block w-full pl-10 md:pl-12 pr-3 md:pr-4 py-3 md:py-4 text-base md:text-lg border border-gray-300 rounded-xl focus:ring-2 focus:ring-brand-500 focus:border-transparent shadow-lg min-h-[44px]"
            />
          </div>
          <button
            type="submit"
            className="mt-3 md:mt-4 btn-primary text-base md:text-lg px-6 md:px-8"
          >
            Find Restaurants
          </button>
        </form>

        {/* Quick Actions */}
        <div className="flex flex-col sm:flex-row gap-3 md:gap-4 justify-center">
          <button
            onClick={() => router.push('/spinner')}
            className="btn-secondary text-sm md:text-base min-h-[44px] px-4 md:px-6"
          >
            🎲 Try Grub Roulette
          </button>
          <button
            onClick={() => router.push('/discover')}
            className="btn-secondary text-sm md:text-base min-h-[44px] px-4 md:px-6"
          >
            Browse All Restaurants
          </button>
        </div>
      </div>
    </section>
  )
}