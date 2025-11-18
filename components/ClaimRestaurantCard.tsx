'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { useToast } from '@/contexts/ToastContext'

interface ClaimRestaurantCardProps {
  restaurantId: string
  restaurantName: string
  restaurantEmail?: string | null
}

export default function ClaimRestaurantCard({
  restaurantId,
  restaurantName,
  restaurantEmail
}: ClaimRestaurantCardProps) {
  const router = useRouter()
  const toast = useToast()
  const [selectedTier, setSelectedTier] = useState<'owner' | 'featured' | 'premium'>('owner')
  const [loading, setLoading] = useState(false)

  const tiers = [
    {
      id: 'owner' as const,
      name: 'Owner Verification',
      price: 10,
      priceId: process.env.NEXT_PUBLIC_STRIPE_PRICE_OWNER || 'price_owner',
      description: 'Claim and verify your restaurant',
      features: [
        'Verified owner badge',
        'Respond to reviews',
        'Update business information',
        'Add photos and menu items',
        'Basic analytics dashboard'
      ],
      color: 'bg-blue-50 border-blue-200',
      buttonColor: 'bg-blue-600 hover:bg-blue-700'
    },
    {
      id: 'featured' as const,
      name: 'Featured Listing',
      price: 99,
      priceId: process.env.NEXT_PUBLIC_STRIPE_PRICE_FEATURED || 'price_featured',
      description: 'Enhanced visibility and features',
      features: [
        '✓ Everything in Owner',
        'Featured placement in search',
        'Homepage banner rotation',
        'Kids deals promotion',
        'Email marketing campaigns',
        'Advanced analytics',
        'Priority support'
      ],
      color: 'bg-purple-50 border-purple-200',
      buttonColor: 'bg-purple-600 hover:bg-purple-700',
      popular: true
    },
    {
      id: 'premium' as const,
      name: 'Premium Marketing',
      price: 199,
      priceId: process.env.NEXT_PUBLIC_STRIPE_PRICE_PREMIUM_CLAIM || 'price_premium_claim',
      description: 'Complete marketing suite',
      features: [
        '✓ Everything in Featured',
        'Top search placement',
        'Social media integration',
        'A/B testing campaigns',
        'Competitor benchmarking',
        'White-label branding',
        'Dedicated account manager'
      ],
      color: 'bg-gradient-to-br from-yellow-50 to-orange-50 border-yellow-300',
      buttonColor: 'bg-gradient-to-r from-yellow-600 to-orange-600 hover:from-yellow-700 hover:to-orange-700'
    }
  ]

  const handleClaimClick = async () => {
    setLoading(true)

    try {
      const tier = tiers.find(t => t.id === selectedTier)
      if (!tier) throw new Error('Invalid tier selected')

      // Create checkout session
      const response = await fetch('/api/stripe/create-checkout', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          restaurantId,
          restaurantName,
          restaurantEmail,
          tier: selectedTier,
          priceId: tier.priceId,
          successUrl: `${window.location.origin}/owner/subscription/success?session_id={CHECKOUT_SESSION_ID}`,
          cancelUrl: window.location.href
        })
      })

      if (!response.ok) {
        const error = await response.json()
        throw new Error(error.message || 'Failed to create checkout session')
      }

      const { url } = await response.json()

      // Redirect to Stripe Checkout
      window.location.href = url
    } catch (error) {
      console.error('Claim error:', error)
      toast.error(error instanceof Error ? error.message : 'Failed to start claim process')
      setLoading(false)
    }
  }

  return (
    <div className="bg-white rounded-lg shadow-lg p-6 border-2 border-primary-200">
      <div className="flex items-start gap-3 mb-4">
        <div className="bg-primary-100 rounded-full p-3">
          <svg className="w-6 h-6 text-primary-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
          </svg>
        </div>
        <div className="flex-1">
          <h3 className="text-xl font-bold text-gray-900 mb-1">
            Are you the owner?
          </h3>
          <p className="text-gray-600 text-sm">
            Claim your restaurant and unlock powerful marketing tools
          </p>
        </div>
      </div>

      {/* Tier Selection */}
      <div className="space-y-3 mb-6">
        {tiers.map((tier) => (
          <button
            key={tier.id}
            onClick={() => setSelectedTier(tier.id)}
            className={`
              w-full text-left p-4 rounded-lg border-2 transition-all
              ${selectedTier === tier.id
                ? `${tier.color} border-opacity-100 shadow-md`
                : 'bg-white border-gray-200 hover:border-gray-300'
              }
              relative
            `}
          >
            {tier.popular && (
              <div className="absolute -top-2 right-4 bg-purple-600 text-white text-xs px-2 py-1 rounded-full font-semibold">
                MOST POPULAR
              </div>
            )}

            <div className="flex items-start justify-between mb-2">
              <div className="flex-1">
                <div className="font-bold text-gray-900">{tier.name}</div>
                <div className="text-sm text-gray-600">{tier.description}</div>
              </div>
              <div className="text-right ml-4">
                <div className="text-2xl font-bold text-gray-900">${tier.price}</div>
                <div className="text-xs text-gray-500">/month</div>
              </div>
            </div>

            {selectedTier === tier.id && (
              <ul className="space-y-1 mt-3 text-sm text-gray-700">
                {tier.features.map((feature, idx) => (
                  <li key={idx} className="flex items-start gap-2">
                    <svg className="w-4 h-4 text-green-600 mt-0.5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                    <span>{feature}</span>
                  </li>
                ))}
              </ul>
            )}
          </button>
        ))}
      </div>

      {/* Benefits Banner */}
      <div className="bg-gradient-to-r from-green-50 to-blue-50 rounded-lg p-4 mb-6 border border-green-200">
        <div className="flex items-center gap-2 mb-2">
          <svg className="w-5 h-5 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v13m0-13V6a2 2 0 112 2h-2zm0 0V5.5A2.5 2.5 0 109.5 8H12zm-7 4h14M5 12a2 2 0 110-4h14a2 2 0 110 4M5 12v7a2 2 0 002 2h10a2 2 0 002-2v-7" />
          </svg>
          <span className="font-semibold text-gray-900">🎁 Free 14-Day Trial</span>
        </div>
        <p className="text-sm text-gray-600">
          Try all features risk-free. Cancel anytime during trial period.
        </p>
      </div>

      {/* CTA Button */}
      <button
        onClick={handleClaimClick}
        disabled={loading}
        className={`
          w-full py-4 px-6 rounded-lg text-white font-bold text-lg
          transition-all transform hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed
          ${tiers.find(t => t.id === selectedTier)?.buttonColor}
          shadow-lg hover:shadow-xl
        `}
      >
        {loading ? (
          <span className="flex items-center justify-center gap-2">
            <svg className="animate-spin h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
            </svg>
            Processing...
          </span>
        ) : (
          `Claim Restaurant - $${tiers.find(t => t.id === selectedTier)?.price}/mo`
        )}
      </button>

      {/* Trust Signals */}
      <div className="mt-4 flex items-center justify-center gap-6 text-xs text-gray-500">
        <div className="flex items-center gap-1">
          <svg className="w-4 h-4 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
          </svg>
          <span>Secure Checkout</span>
        </div>
        <div className="flex items-center gap-1">
          <svg className="w-4 h-4 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          <span>Cancel Anytime</span>
        </div>
        <div className="flex items-center gap-1">
          <svg className="w-4 h-4 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
          </svg>
          <span>Instant Setup</span>
        </div>
      </div>

      {/* Fine Print */}
      <p className="mt-4 text-xs text-gray-500 text-center">
        By claiming, you agree to verify your ownership.
        All plans include 14-day free trial, then billed monthly.
      </p>
    </div>
  )
}
