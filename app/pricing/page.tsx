'use client'

import { useState } from 'react'
import Link from 'next/link'

const pricingTiers = [
  {
    name: 'Basic',
    price: 49,
    priceId: 'price_basic_monthly', // Will be replaced with actual Stripe Price ID
    description: 'Perfect for getting started',
    features: [
      'Enhanced profile with photos',
      'Kids deals & specials promotion',
      'Contact information display',
      'Basic analytics dashboard',
      'Customer review responses',
      'Mobile-optimized profile'
    ],
    cta: 'Get Started',
    popular: false
  },
  {
    name: 'Pro',
    price: 99,
    priceId: 'price_pro_monthly',
    description: 'Best for growing restaurants',
    features: [
      'Everything in Basic, plus:',
      'Featured placement in search',
      'Advanced analytics & insights',
      'Email marketing campaigns',
      'Social media integration',
      'Priority customer support',
      'A/B testing for promotions',
      'Competitor benchmarking'
    ],
    cta: 'Upgrade to Pro',
    popular: true
  },
  {
    name: 'Premium',
    price: 199,
    priceId: 'price_premium_monthly',
    description: 'For serious market dominance',
    features: [
      'Everything in Pro, plus:',
      'Homepage featured placement',
      'Dedicated account manager',
      'Custom landing page design',
      'Advanced SEO optimization',
      'API access for integrations',
      'White-label marketing materials',
      'Quarterly strategy sessions',
      'Priority feature requests'
    ],
    cta: 'Go Premium',
    popular: false
  }
]

export default function PricingPage() {
  const [billingCycle, setBillingCycle] = useState<'monthly' | 'annual'>('monthly')
  const [isLoading, setIsLoading] = useState<string | null>(null)

  const handleCheckout = async (priceId: string, tierName: string) => {
    setIsLoading(tierName)

    try {
      const response = await fetch('/api/subscriptions/create-checkout', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          priceId,
          billingCycle
        })
      })

      const data = await response.json()

      if (data.url) {
        window.location.href = data.url
      } else {
        alert('Error creating checkout session')
        setIsLoading(null)
      }
    } catch (error) {
      console.error('Checkout error:', error)
      alert('Failed to start checkout')
      setIsLoading(null)
    }
  }

  const getPrice = (basePrice: number) => {
    if (billingCycle === 'annual') {
      return Math.floor(basePrice * 12 * 0.8) // 20% discount for annual
    }
    return basePrice
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 to-white py-16">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold text-gray-900 mb-4">
            Simple, Transparent Pricing
          </h1>
          <p className="text-xl text-gray-600 max-w-2xl mx-auto mb-8">
            Choose the plan that fits your restaurant's growth stage.
            All plans include a 14-day free trial.
          </p>

          {/* Billing Toggle */}
          <div className="inline-flex items-center bg-gray-100 rounded-lg p-1">
            <button
              onClick={() => setBillingCycle('monthly')}
              className={`px-6 py-2 rounded-md font-medium transition-all ${
                billingCycle === 'monthly'
                  ? 'bg-white text-gray-900 shadow'
                  : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              Monthly
            </button>
            <button
              onClick={() => setBillingCycle('annual')}
              className={`px-6 py-2 rounded-md font-medium transition-all ${
                billingCycle === 'annual'
                  ? 'bg-white text-gray-900 shadow'
                  : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              Annual
              <span className="ml-2 text-xs bg-green-100 text-green-800 px-2 py-1 rounded-full">
                Save 20%
              </span>
            </button>
          </div>
        </div>

        {/* Pricing Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-16">
          {pricingTiers.map((tier) => (
            <div
              key={tier.name}
              className={`relative bg-white rounded-2xl shadow-lg transition-transform hover:scale-105 ${
                tier.popular ? 'ring-2 ring-primary-500 shadow-xl' : ''
              }`}
            >
              {tier.popular && (
                <div className="absolute -top-4 left-1/2 transform -translate-x-1/2">
                  <span className="bg-primary-500 text-white px-4 py-1 rounded-full text-sm font-semibold">
                    Most Popular
                  </span>
                </div>
              )}

              <div className="p-8">
                <h3 className="text-2xl font-bold text-gray-900 mb-2">
                  {tier.name}
                </h3>
                <p className="text-gray-600 mb-6">{tier.description}</p>

                <div className="mb-6">
                  <div className="flex items-baseline">
                    <span className="text-5xl font-bold text-gray-900">
                      ${billingCycle === 'monthly' ? tier.price : Math.floor(tier.price * 0.8)}
                    </span>
                    <span className="text-gray-600 ml-2">
                      /{billingCycle === 'monthly' ? 'mo' : 'mo'}
                    </span>
                  </div>
                  {billingCycle === 'annual' && (
                    <p className="text-sm text-green-600 mt-1">
                      ${Math.floor(tier.price * 12 * 0.8)}/year • Save ${Math.floor(tier.price * 12 * 0.2)}
                    </p>
                  )}
                </div>

                <button
                  onClick={() => handleCheckout(tier.priceId, tier.name)}
                  disabled={isLoading === tier.name}
                  className={`w-full py-3 px-6 rounded-lg font-semibold transition-colors ${
                    tier.popular
                      ? 'bg-primary-600 text-white hover:bg-primary-700'
                      : 'bg-gray-900 text-white hover:bg-gray-800'
                  } disabled:opacity-50 disabled:cursor-not-allowed`}
                >
                  {isLoading === tier.name ? 'Loading...' : tier.cta}
                </button>

                <div className="mt-8 space-y-4">
                  {tier.features.map((feature, index) => (
                    <div key={index} className="flex items-start">
                      <svg
                        className="w-5 h-5 text-green-500 mt-0.5 mr-3 flex-shrink-0"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M5 13l4 4L19 7"
                        />
                      </svg>
                      <span className={feature.startsWith('Everything') ? 'font-semibold' : ''}>
                        {feature}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* FAQ Section */}
        <div className="max-w-3xl mx-auto">
          <h2 className="text-3xl font-bold text-gray-900 text-center mb-8">
            Frequently Asked Questions
          </h2>

          <div className="space-y-6">
            <div className="bg-white rounded-lg shadow p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-2">
                Can I cancel anytime?
              </h3>
              <p className="text-gray-600">
                Yes! You can cancel your subscription at any time with no penalties.
                Your plan will remain active until the end of your billing period.
              </p>
            </div>

            <div className="bg-white rounded-lg shadow p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-2">
                What happens after the free trial?
              </h3>
              <p className="text-gray-600">
                After your 14-day free trial, your card will be charged automatically.
                You'll receive an email reminder 3 days before the trial ends.
              </p>
            </div>

            <div className="bg-white rounded-lg shadow p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-2">
                Can I upgrade or downgrade my plan?
              </h3>
              <p className="text-gray-600">
                Absolutely! You can change your plan at any time. Upgrades take effect
                immediately, and downgrades will apply at the start of your next billing cycle.
              </p>
            </div>

            <div className="bg-white rounded-lg shadow p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-2">
                Do you offer refunds?
              </h3>
              <p className="text-gray-600">
                We offer a 30-day money-back guarantee. If you're not satisfied within
                the first 30 days, we'll refund your payment in full.
              </p>
            </div>
          </div>
        </div>

        {/* CTA Section */}
        <div className="mt-16 bg-gradient-to-r from-primary-600 to-primary-700 rounded-2xl shadow-xl p-12 text-center">
          <h2 className="text-3xl font-bold text-white mb-4">
            Ready to grow your restaurant?
          </h2>
          <p className="text-xl text-primary-100 mb-8 max-w-2xl mx-auto">
            Join hundreds of restaurants already using eKaty to reach more families
            and grow their business.
          </p>
          <Link
            href="/admin/restaurants"
            className="inline-block bg-white text-primary-600 px-8 py-3 rounded-lg font-semibold hover:bg-gray-100 transition-colors"
          >
            View Your Restaurant Dashboard
          </Link>
        </div>
      </div>
    </div>
  )
}
