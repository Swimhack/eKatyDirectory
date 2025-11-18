'use client'

import { useState } from 'react'
import Link from 'next/link'

const pricingTiers = [
  {
    name: 'Basic',
    price: 49,
    priceIdMonthly: process.env.NEXT_PUBLIC_STRIPE_PRICE_BASIC_MONTHLY || 'price_basic_monthly',
    priceIdAnnual: process.env.NEXT_PUBLIC_STRIPE_PRICE_BASIC_ANNUAL || 'price_basic_annual',
    description: 'Perfect for getting started',
    features: [
      'Enhanced profile with photos',
      'Kids deals & specials promotion',
      'Contact information display',
      'Basic analytics dashboard',
      'Customer review responses',
      'Mobile-optimized profile',
      'Email support'
    ],
    cta: 'Start Free Trial',
    popular: false,
    color: 'blue'
  },
  {
    name: 'Pro',
    price: 99,
    priceIdMonthly: process.env.NEXT_PUBLIC_STRIPE_PRICE_PRO_MONTHLY || 'price_pro_monthly',
    priceIdAnnual: process.env.NEXT_PUBLIC_STRIPE_PRICE_PRO_ANNUAL || 'price_pro_annual',
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
    cta: 'Start Free Trial',
    popular: true,
    color: 'purple'
  },
  {
    name: 'Premium',
    price: 199,
    priceIdMonthly: process.env.NEXT_PUBLIC_STRIPE_PRICE_PREMIUM_MONTHLY || 'price_premium_monthly',
    priceIdAnnual: process.env.NEXT_PUBLIC_STRIPE_PRICE_PREMIUM_ANNUAL || 'price_premium_annual',
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
    cta: 'Start Free Trial',
    popular: false,
    color: 'yellow'
  }
]

export default function PricingPage() {
  const [billingCycle, setBillingCycle] = useState<'monthly' | 'annual'>('monthly')
  const [isLoading, setIsLoading] = useState<string | null>(null)

  const handleCheckout = async (tier: typeof pricingTiers[0]) => {
    setIsLoading(tier.name)

    try {
      const priceId = billingCycle === 'monthly' ? tier.priceIdMonthly : tier.priceIdAnnual

      const response = await fetch('/api/subscriptions/create-checkout', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          priceId,
          billingCycle,
          tierName: tier.name
        })
      })

      const data = await response.json()

      if (data.url) {
        window.location.href = data.url
      } else {
        alert('Error creating checkout session. Please try again.')
        setIsLoading(null)
      }
    } catch (error) {
      console.error('Checkout error:', error)
      alert('Failed to start checkout. Please try again.')
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
          <div className="inline-block bg-green-100 text-green-800 px-4 py-2 rounded-full text-sm font-semibold mb-4">
            🎁 14-Day Free Trial • No Credit Card Required
          </div>
          <h1 className="text-5xl font-bold text-gray-900 mb-4">
            Simple, Transparent Pricing
          </h1>
          <p className="text-xl text-gray-600 max-w-2xl mx-auto mb-2">
            Choose the plan that fits your restaurant's growth stage.
          </p>
          <p className="text-lg text-gray-500 max-w-2xl mx-auto mb-8">
            Join <strong>249 restaurants</strong> in Katy already growing with eKaty.com
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
                  onClick={() => handleCheckout(tier)}
                  disabled={isLoading === tier.name}
                  className={`w-full py-3 px-6 rounded-lg font-semibold transition-all transform hover:scale-105 ${
                    tier.popular
                      ? 'bg-primary-600 text-white hover:bg-primary-700 shadow-lg'
                      : 'bg-gray-900 text-white hover:bg-gray-800'
                  } disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none`}
                >
                  {isLoading === tier.name ? (
                    <span className="flex items-center justify-center">
                      <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                      </svg>
                      Processing...
                    </span>
                  ) : tier.cta}
                </button>

                <p className="text-xs text-gray-500 text-center mt-3">
                  No credit card required • Cancel anytime
                </p>

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

        {/* Trust Signals */}
        <div className="mt-16 bg-white rounded-2xl shadow-lg p-8">
          <h2 className="text-2xl font-bold text-gray-900 text-center mb-8">
            Why Restaurants Choose eKaty.com
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="text-center">
              <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <svg className="w-8 h-8 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                </svg>
              </div>
              <h3 className="font-semibold text-gray-900 mb-2">Secure & Trusted</h3>
              <p className="text-gray-600">PCI-compliant payment processing through Stripe</p>
            </div>
            <div className="text-center">
              <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <svg className="w-8 h-8 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                </svg>
              </div>
              <h3 className="font-semibold text-gray-900 mb-2">Instant Setup</h3>
              <p className="text-gray-600">Get started in minutes, not days</p>
            </div>
            <div className="text-center">
              <div className="w-16 h-16 bg-purple-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <svg className="w-8 h-8 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M18 9v3m0 0v3m0-3h3m-3 0h-3m-2-5a4 4 0 11-8 0 4 4 0 018 0zM3 20a6 6 0 0112 0v1H3v-1z" />
                </svg>
              </div>
              <h3 className="font-semibold text-gray-900 mb-2">Dedicated Support</h3>
              <p className="text-gray-600">Email and priority support on all plans</p>
            </div>
          </div>
        </div>

        {/* CTA Section */}
        <div className="mt-16 bg-gradient-to-r from-primary-600 to-primary-700 rounded-2xl shadow-xl p-12 text-center">
          <h2 className="text-3xl font-bold text-white mb-4">
            Ready to grow your restaurant?
          </h2>
          <p className="text-xl text-primary-100 mb-8 max-w-2xl mx-auto">
            Join 249 restaurants in Katy already using eKaty to reach more families
            and grow their business. Start your free trial today!
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <button
              onClick={() => handleCheckout(pricingTiers[1])}
              className="bg-white text-primary-600 px-8 py-4 rounded-lg font-bold text-lg hover:bg-gray-100 transition-colors shadow-lg"
            >
              Start Free Trial (Pro)
            </button>
            <Link
              href="/contact"
              className="inline-block bg-primary-800 text-white px-8 py-4 rounded-lg font-bold text-lg hover:bg-primary-900 transition-colors"
            >
              Contact Sales
            </Link>
          </div>
          <p className="text-primary-200 mt-4 text-sm">
            No credit card required • 14-day free trial • Cancel anytime
          </p>
        </div>
      </div>
    </div>
  )
}
