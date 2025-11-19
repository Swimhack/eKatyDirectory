'use client'

import { useState } from 'react'
import Link from 'next/link'

export default function LaunchBanner() {
  const [isVisible, setIsVisible] = useState(true)

  if (!isVisible) return null

  return (
    <div className="bg-gradient-to-r from-yellow-400 via-orange-500 to-pink-500 text-white relative overflow-hidden">
      {/* Animated background pattern */}
      <div className="absolute inset-0 opacity-20">
        <div className="absolute inset-0" style={{
          backgroundImage: 'repeating-linear-gradient(45deg, transparent, transparent 10px, rgba(255,255,255,0.1) 10px, rgba(255,255,255,0.1) 20px)',
          animation: 'slide 20s linear infinite'
        }}></div>
      </div>
      
      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3 flex-1">
            <div className="flex items-center space-x-2 animate-pulse">
              <span className="text-2xl">🎉</span>
              <span className="font-bold text-sm md:text-base">
                eKaty Launch Celebration!
              </span>
            </div>
            <div className="hidden md:flex items-center space-x-4 text-sm">
              <span className="flex items-center space-x-1">
                <span>🎁</span>
                <span>Giveaways</span>
              </span>
              <span className="flex items-center space-x-1">
                <span>🎫</span>
                <span>Coupons</span>
              </span>
              <span className="flex items-center space-x-1">
                <span>📄</span>
                <span>Flyers</span>
              </span>
            </div>
          </div>
          
          <div className="flex items-center space-x-3">
            <Link
              href="/blog/ekaty-launch-celebration-flyers-deals-giveaways-join-the-buzz"
              className="bg-white text-orange-600 px-4 py-1.5 rounded-full font-semibold text-sm hover:bg-gray-100 transition-colors whitespace-nowrap"
            >
              Learn More →
            </Link>
            <button
              onClick={() => setIsVisible(false)}
              className="text-white hover:text-gray-200 transition-colors p-1"
              aria-label="Close banner"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
        </div>
      </div>
      
      <style jsx>{`
        @keyframes slide {
          0% { transform: translateX(0); }
          100% { transform: translateX(20px); }
        }
      `}</style>
    </div>
  )
}







