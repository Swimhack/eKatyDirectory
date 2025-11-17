'use client'

import Link from 'next/link'
import { useState, useEffect } from 'react'
import React from 'react'

export default function LaunchPromotionSection() {
  const [showGiveawayModal, setShowGiveawayModal] = useState(false)
  const [showCouponModal, setShowCouponModal] = useState(false)
  const [showFlyerModal, setShowFlyerModal] = useState(false)

  const promotions = [
    {
      icon: '🎁',
      title: 'Win Free Meals',
      description: 'Enter our launch giveaway for a chance to win $500 in restaurant gift cards!',
      color: 'from-pink-500 to-rose-600',
      action: () => setShowGiveawayModal(true),
      cta: 'Enter Now'
    },
    {
      icon: '🎫',
      title: 'Exclusive Coupons',
      description: 'Get 20% off at participating Katy restaurants. Limited time launch offer!',
      color: 'from-blue-500 to-indigo-600',
      action: () => setShowCouponModal(true),
      cta: 'Get Coupons'
    },
    {
      icon: '📄',
      title: 'Download Flyers',
      description: 'Share the eKaty launch with friends! Download printable flyers and social media graphics.',
      color: 'from-green-500 to-emerald-600',
      action: () => setShowFlyerModal(true),
      cta: 'Download'
    },
    {
      icon: '⭐',
      title: 'Early Adopter Deals',
      description: 'Be among the first to discover amazing restaurants and unlock special launch deals!',
      color: 'from-purple-500 to-violet-600',
      link: '/discover',
      cta: 'Explore'
    }
  ]

  return (
    <section className="py-16 bg-gradient-to-br from-primary-50 via-white to-primary-50 relative overflow-hidden">
      {/* Decorative elements */}
      <div className="absolute top-0 left-0 w-64 h-64 bg-primary-200 rounded-full opacity-20 blur-3xl"></div>
      <div className="absolute bottom-0 right-0 w-64 h-64 bg-pink-200 rounded-full opacity-20 blur-3xl"></div>
      
      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="text-center mb-12">
          <div className="inline-flex items-center justify-center w-20 h-20 bg-gradient-to-br from-yellow-400 to-orange-500 rounded-full mb-4 shadow-lg">
            <span className="text-4xl">🎊</span>
          </div>
          <h2 className="text-4xl md:text-5xl font-bold text-gray-900 mb-4">
            Launch Celebration Specials! 🎉
          </h2>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto">
            Join the eKaty launch buzz! We're celebrating with amazing deals, coupons, giveaways, and flyers for Katy families!
          </p>
          <div className="mt-6 flex items-center justify-center space-x-2 text-sm text-gray-500">
            <span>🤖</span>
            <span>From James Strickland's AI Article Agent</span>
          </div>
        </div>

        {/* Promotion Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-12">
          {promotions.map((promo, index) => (
            <div
              key={index}
              className={`bg-gradient-to-br ${promo.color} rounded-2xl p-6 text-white shadow-xl hover:shadow-2xl transition-all duration-300 transform hover:-translate-y-2 relative overflow-hidden`}
            >
              {/* Decorative circle */}
              <div className="absolute top-0 right-0 w-32 h-32 bg-white opacity-10 rounded-full -mr-16 -mt-16"></div>

              <div className="relative z-10">
                <div className="text-5xl mb-4">{promo.icon}</div>
                <h3 className="text-xl font-bold mb-2">{promo.title}</h3>
                <p className="text-white/90 text-sm mb-4 leading-relaxed">
                  {promo.description}
                </p>
                {promo.link ? (
                  <Link
                    href={promo.link}
                    className="inline-flex items-center bg-white text-gray-900 px-4 py-2 rounded-lg font-semibold text-sm hover:bg-gray-100 transition-colors"
                  >
                    {promo.cta}
                    <svg className="w-4 h-4 ml-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                    </svg>
                  </Link>
                ) : (
                  <button
                    onClick={promo.action}
                    className="inline-flex items-center bg-white text-gray-900 px-4 py-2 rounded-lg font-semibold text-sm hover:bg-gray-100 transition-colors"
                  >
                    {promo.cta}
                    <svg className="w-4 h-4 ml-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                    </svg>
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>

        {/* Call to Action */}
        <div className="bg-gradient-to-r from-primary-600 to-primary-700 rounded-2xl p-8 md:p-12 text-center text-white shadow-2xl">
          <div className="max-w-3xl mx-auto">
            <div className="text-6xl mb-4">🚀</div>
            <h3 className="text-3xl md:text-4xl font-bold mb-4">
              Don't Miss Out on the Launch Buzz!
            </h3>
            <p className="text-xl text-primary-100 mb-8">
              Get all the details about our flyers, deals, coupons, and giveaways. Join thousands of Katy families celebrating the launch of eKaty!
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link
                href="/blog/ekaty-launch-celebration-flyers-deals-giveaways-join-the-buzz"
                className="bg-white text-primary-600 px-8 py-4 rounded-lg font-semibold hover:bg-gray-100 transition-colors inline-flex items-center justify-center text-lg"
              >
                <span className="mr-2">📖</span>
                Read Full Launch Article
              </Link>
              <Link
                href="/discover"
                className="bg-primary-800 text-white px-8 py-4 rounded-lg font-semibold hover:bg-primary-900 transition-colors inline-flex items-center justify-center text-lg border-2 border-white/20"
              >
                <span className="mr-2">🔍</span>
                Start Discovering
              </Link>
            </div>
          </div>
        </div>

        {/* Trust Badges */}
        <div className="mt-12 flex flex-wrap items-center justify-center gap-8 text-gray-600">
          <div className="flex items-center space-x-2">
            <span className="text-2xl">✅</span>
            <span className="text-sm font-medium">100% Free to Use</span>
          </div>
          <div className="flex items-center space-x-2">
            <span className="text-2xl">🎁</span>
            <span className="text-sm font-medium">Exclusive Launch Deals</span>
          </div>
          <div className="flex items-center space-x-2">
            <span className="text-2xl">👨‍👩‍👧‍👦</span>
            <span className="text-sm font-medium">Family-Focused</span>
          </div>
          <div className="flex items-center space-x-2">
            <span className="text-2xl">🤖</span>
            <span className="text-sm font-medium">AI-Powered</span>
          </div>
        </div>
      </div>

      {/* Giveaway Modal */}
      {showGiveawayModal && (
        <GiveawayModal onClose={() => setShowGiveawayModal(false)} />
      )}

      {/* Coupon Modal */}
      {showCouponModal && (
        <CouponModal onClose={() => setShowCouponModal(false)} />
      )}

      {/* Flyer Modal */}
      {showFlyerModal && (
        <FlyerModal onClose={() => setShowFlyerModal(false)} />
      )}
    </section>
  )
}

// Giveaway Entry Modal
function GiveawayModal({ onClose }: { onClose: () => void }) {
  const [formData, setFormData] = useState({ email: '', name: '', phone: '' })
  const [status, setStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle')
  const [message, setMessage] = useState('')

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setStatus('loading')

    try {
      const response = await fetch('/api/launch/giveaway', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData)
      })

      const data = await response.json()

      if (response.ok) {
        setStatus('success')
        setMessage('You\'re entered! Good luck! 🎉')
        setTimeout(onClose, 3000)
      } else {
        setStatus('error')
        setMessage(data.error || 'Failed to enter giveaway')
      }
    } catch (error) {
      setStatus('error')
      setMessage('Something went wrong. Please try again.')
    }
  }

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50" onClick={onClose}>
      <div className="bg-white rounded-2xl max-w-md w-full p-8" onClick={(e) => e.stopPropagation()}>
        <div className="text-center mb-6">
          <div className="text-6xl mb-4">🎁</div>
          <h2 className="text-3xl font-bold text-gray-900 mb-2">Win $500 in Gift Cards!</h2>
          <p className="text-gray-600">Enter the eKaty launch giveaway</p>
        </div>

        {status === 'success' ? (
          <div className="text-center py-8">
            <div className="text-6xl mb-4">🎉</div>
            <p className="text-xl font-semibold text-green-600">{message}</p>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Name *</label>
              <input
                type="text"
                required
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                placeholder="Your full name"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Email *</label>
              <input
                type="email"
                required
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                placeholder="your@email.com"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Phone (optional)</label>
              <input
                type="tel"
                value={formData.phone}
                onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                placeholder="(123) 456-7890"
              />
            </div>

            {status === 'error' && (
              <div className="bg-red-50 text-red-700 px-4 py-3 rounded-lg text-sm">
                {message}
              </div>
            )}

            <div className="flex gap-3">
              <button
                type="button"
                onClick={onClose}
                className="flex-1 px-4 py-3 border border-gray-300 rounded-lg font-semibold hover:bg-gray-50 transition-colors"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={status === 'loading'}
                className="flex-1 px-4 py-3 bg-gradient-to-r from-pink-500 to-rose-600 text-white rounded-lg font-semibold hover:opacity-90 transition-opacity disabled:opacity-50"
              >
                {status === 'loading' ? 'Entering...' : 'Enter Giveaway'}
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  )
}

// Coupon Modal
function CouponModal({ onClose }: { onClose: () => void }) {
  const [coupons, setCoupons] = useState<any[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetch('/api/launch/coupons')
      .then(res => res.json())
      .then(data => {
        setCoupons(data.coupons || [])
        setLoading(false)
      })
      .catch(() => setLoading(false))
  }, [])

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50 overflow-y-auto" onClick={onClose}>
      <div className="bg-white rounded-2xl max-w-2xl w-full p-8 my-8" onClick={(e) => e.stopPropagation()}>
        <button
          onClick={onClose}
          className="absolute top-4 right-4 bg-white text-gray-600 hover:text-gray-900 hover:bg-gray-100 transition-all p-2 rounded-full shadow-lg border-2 border-gray-200 hover:border-gray-300 z-50"
          aria-label="Close"
        >
          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2.5}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>

        <div className="text-center mb-6">
          <div className="text-6xl mb-4">🎫</div>
          <h2 className="text-3xl font-bold text-gray-900 mb-2">Launch Coupons</h2>
          <p className="text-gray-600">Save 20% at participating Katy restaurants!</p>
        </div>

        {loading ? (
          <div className="text-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600 mx-auto"></div>
          </div>
        ) : coupons.length === 0 ? (
          <div className="text-center py-12">
            <p className="text-gray-500">No active coupons available at the moment.</p>
          </div>
        ) : (
          <div className="space-y-4">
            {coupons.map((coupon, index) => (
              <div key={index} className="border-2 border-dashed border-primary-300 rounded-xl p-6 bg-gradient-to-r from-blue-50 to-indigo-50">
                <div className="flex items-center justify-between mb-3">
                  <div>
                    <div className="text-2xl font-bold text-primary-600">{coupon.discountPercent}% OFF</div>
                    <div className="text-sm text-gray-600">{coupon.restaurantName}</div>
                  </div>
                  <div className="bg-white px-4 py-2 rounded-lg border-2 border-primary-200">
                    <div className="text-xs text-gray-500 uppercase">Code</div>
                    <div className="text-lg font-bold text-gray-900">{coupon.code}</div>
                  </div>
                </div>
                {coupon.minPurchase && (
                  <p className="text-xs text-gray-600 mb-2">
                    Minimum purchase: ${coupon.minPurchase}
                  </p>
                )}
                <p className="text-xs text-gray-500">
                  Valid until {new Date(coupon.validUntil).toLocaleDateString()} • {coupon.remaining} remaining
                </p>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}

// Flyer Download Modal
function FlyerModal({ onClose }: { onClose: () => void }) {
  const [flyers, setFlyers] = useState<any[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetch('/api/launch/flyers')
      .then(res => res.json())
      .then(data => {
        setFlyers(data.flyers || [])
        setLoading(false)
      })
      .catch(() => setLoading(false))
  }, [])

  const handleDownload = async (flyerType: string) => {
    try {
      const response = await fetch('/api/launch/flyers', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ flyerType })
      })

      const data = await response.json()
      if (data.downloadUrl) {
        window.open(data.downloadUrl, '_blank')
      }
    } catch (error) {
      console.error('Download failed:', error)
    }
  }

  const socialFlyers = flyers.filter(f => f.category === 'social')
  const printableFlyers = flyers.filter(f => f.category === 'printable')

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50 overflow-y-auto" onClick={onClose}>
      <div className="bg-white rounded-2xl max-w-3xl w-full p-8 my-8" onClick={(e) => e.stopPropagation()}>
        <button
          onClick={onClose}
          className="absolute top-4 right-4 bg-white text-gray-600 hover:text-gray-900 hover:bg-gray-100 transition-all p-2 rounded-full shadow-lg border-2 border-gray-200 hover:border-gray-300 z-50"
          aria-label="Close"
        >
          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2.5}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>

        <div className="text-center mb-6">
          <div className="text-6xl mb-4">📄</div>
          <h2 className="text-3xl font-bold text-gray-900 mb-2">Download Launch Flyers</h2>
          <p className="text-gray-600">Share eKaty with your friends and family!</p>
        </div>

        {loading ? (
          <div className="text-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600 mx-auto"></div>
          </div>
        ) : (
          <>
            <div className="mb-8">
              <h3 className="text-xl font-bold text-gray-900 mb-4">📱 Social Media Graphics</h3>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {socialFlyers.map((flyer, index) => (
                  <div key={index} className="border-2 border-gray-200 rounded-xl p-4 hover:border-primary-400 transition-colors">
                    <div className="text-4xl mb-2 text-center">🖼️</div>
                    <h4 className="font-semibold text-gray-900 text-center mb-1">{flyer.name}</h4>
                    <p className="text-xs text-gray-500 text-center mb-3">{flyer.dimensions}</p>
                    <button
                      onClick={() => handleDownload(flyer.type)}
                      className="w-full bg-primary-600 text-white px-4 py-2 rounded-lg font-semibold hover:bg-primary-700 transition-colors text-sm"
                    >
                      Download {flyer.format.toUpperCase()}
                    </button>
                  </div>
                ))}
              </div>
            </div>

            <div>
              <h3 className="text-xl font-bold text-gray-900 mb-4">🖨️ Printable Materials</h3>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {printableFlyers.map((flyer, index) => (
                  <div key={index} className="border-2 border-gray-200 rounded-xl p-4 hover:border-primary-400 transition-colors">
                    <div className="text-4xl mb-2 text-center">📄</div>
                    <h4 className="font-semibold text-gray-900 text-center mb-1">{flyer.name}</h4>
                    <p className="text-xs text-gray-500 text-center mb-3">{flyer.dimensions}</p>
                    <button
                      onClick={() => handleDownload(flyer.type)}
                      className="w-full bg-primary-600 text-white px-4 py-2 rounded-lg font-semibold hover:bg-primary-700 transition-colors text-sm"
                    >
                      Download {flyer.format.toUpperCase()}
                    </button>
                  </div>
                ))}
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  )
}





