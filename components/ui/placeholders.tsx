'use client'

import { useEffect, useState } from 'react'

// Placeholder components for spinner functionality
export function SpinWheel() {
  return (
    <div className="card text-center p-8">
      <div className="w-64 h-64 mx-auto mb-8 bg-gradient-to-br from-brand-400 to-brand-600 rounded-full flex items-center justify-center">
        <div className="text-white text-6xl">🎰</div>
      </div>
    </div>
  )
}

export function RestaurantResult({ restaurant }: { restaurant: any }) {
  return (
    <div className="card p-6">
      <h3 className="text-2xl font-bold mb-2">{restaurant?.name || 'Restaurant Name'}</h3>
      <p className="text-gray-600">{restaurant?.address || 'Address'}</p>
    </div>
  )
}