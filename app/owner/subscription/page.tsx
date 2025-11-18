'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { SUBSCRIPTION_PRICING } from '@/lib/subscriptions'

interface SubscriptionData {
  tier: string
  status: string
  currentPeriodEnd: string | null
  cancelAtPeriodEnd: boolean
}

export default function SubscriptionPage() {
  const [subscription, setSubscription] = useState<SubscriptionData | null>(null)
  const [loading, setLoading] = useState(true)
  const [canceling, setCanceling] = useState(false)

  useEffect(() => {
    loadSubscription()
  }, [])

  async function loadSubscription() {
    try {
      const res = await fetch('/api/subscriptions/manage')
      const data = await res.json()
      setSubscription(data)
    } catch (error) {
      console.error('Failed to load subscription:', error)
    } finally {
      setLoading(false)
    }
  }

  async function cancelSubscription() {
    if (!confirm('Are you sure you want to cancel your subscription? You will retain access until the end of your billing period.')) {
      return
    }

    setCanceling(true)
    try {
      const res = await fetch('/api/subscriptions/manage', {
        method: 'DELETE'
      })

      const data = await res.json()

      if (data.success) {
        alert('Subscription canceled. You will retain access until ' + new Date(data.currentPeriodEnd).toLocaleDateString())
        loadSubscription()
      } else {
        alert('Error: ' + data.error)
      }
    } catch (error) {
      alert('Failed to cancel subscription')
    } finally {
      setCanceling(false)
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-xl text-gray-600">Loading subscription...</div>
      </div>
    )
  }

  const isFree = !subscription || subscription.tier === 'FREE'
  const isActive = subscription && ['active', 'trialing'].includes(subscription.status)

  return (
    <div className="min-h-screen bg-gray-50 py-12">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            Your Subscription
          </h1>
          <p className="text-gray-600">
            Manage your eKaty subscription and billing
          </p>
        </div>

        {/* Current Plan */}
        <div className="bg-white rounded-lg shadow-md p-8 mb-8">
          <div className="flex items-center justify-between mb-6">
            <div>
              <div className="text-sm text-gray-600 mb-1">Current Plan</div>
              <div className="text-3xl font-bold text-gray-900">
                {subscription?.tier || 'Free'}
              </div>
            </div>
            <div className={`px-4 py-2 rounded-full text-sm font-semibold ${
              isActive
                ? 'bg-green-100 text-green-800'
                : 'bg-gray-100 text-gray-800'
            }`}>
              {subscription?.status || 'None'}
            </div>
          </div>

          {subscription?.currentPeriodEnd && (
            <div className="border-t pt-6 mt-6">
              <div className="grid grid-cols-2 gap-6">
                <div>
                  <div className="text-sm text-gray-600 mb-1">Next Billing Date</div>
                  <div className="text-lg font-semibold text-gray-900">
                    {new Date(subscription.currentPeriodEnd).toLocaleDateString()}
                  </div>
                </div>
                <div>
                  <div className="text-sm text-gray-600 mb-1">Monthly Cost</div>
                  <div className="text-lg font-semibold text-gray-900">
                    ${subscription.tier === 'BASIC' ? '49' : subscription.tier === 'PRO' ? '99' : '199'}/mo
                  </div>
                </div>
              </div>

              {subscription.cancelAtPeriodEnd && (
                <div className="mt-6 bg-yellow-50 border border-yellow-200 rounded-lg p-4">
                  <div className="text-sm text-yellow-800">
                    Your subscription will be canceled on {new Date(subscription.currentPeriodEnd).toLocaleDateString()}.
                    You will retain access until then.
                  </div>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Plan Features */}
        <div className="bg-white rounded-lg shadow-md p-8 mb-8">
          <h2 className="text-xl font-bold text-gray-900 mb-6">
            {isFree ? 'Upgrade to unlock these features:' : 'Your plan includes:'}
          </h2>

          {isFree && (
            <div className="space-y-3 mb-6">
              <div className="flex items-center">
                <svg className="w-5 h-5 text-gray-400 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
                <span className="text-gray-600">Limited visibility in search results</span>
              </div>
              <div className="flex items-center">
                <svg className="w-5 h-5 text-gray-400 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
                <span className="text-gray-600">No analytics or insights</span>
              </div>
              <div className="flex items-center">
                <svg className="w-5 h-5 text-gray-400 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
                <span className="text-gray-600">Cannot promote deals or specials</span>
              </div>
            </div>
          )}

          {!isFree && subscription && (
            <div className="space-y-3">
              {subscription.tier === 'BASIC' && (
                <>
                  <Feature text="Enhanced profile with photos" />
                  <Feature text="Kids deals & specials promotion" />
                  <Feature text="Basic analytics dashboard" />
                  <Feature text="Email support" />
                </>
              )}

              {subscription.tier === 'PRO' && (
                <>
                  <Feature text="Everything in Basic, plus:" bold />
                  <Feature text="Featured placement in search" />
                  <Feature text="Advanced analytics & insights" />
                  <Feature text="Email marketing campaigns" />
                  <Feature text="Social media integration" />
                  <Feature text="Priority support" />
                </>
              )}

              {subscription.tier === 'PREMIUM' && (
                <>
                  <Feature text="Everything in Pro, plus:" bold />
                  <Feature text="Homepage featured placement" />
                  <Feature text="Dedicated account manager" />
                  <Feature text="Custom landing page design" />
                  <Feature text="API access" />
                  <Feature text="White-label marketing materials" />
                </>
              )}
            </div>
          )}
        </div>

        {/* Action Buttons */}
        <div className="flex gap-4">
          {isFree ? (
            <Link
              href="/pricing"
              className="flex-1 bg-primary-600 text-white px-6 py-3 rounded-lg font-semibold hover:bg-primary-700 transition-colors text-center"
            >
              Upgrade Now
            </Link>
          ) : (
            <>
              <Link
                href="/pricing"
                className="flex-1 bg-gray-600 text-white px-6 py-3 rounded-lg font-semibold hover:bg-gray-700 transition-colors text-center"
              >
                Change Plan
              </Link>

              {!subscription?.cancelAtPeriodEnd && (
                <button
                  onClick={cancelSubscription}
                  disabled={canceling}
                  className="flex-1 bg-red-600 text-white px-6 py-3 rounded-lg font-semibold hover:bg-red-700 transition-colors disabled:opacity-50"
                >
                  {canceling ? 'Canceling...' : 'Cancel Subscription'}
                </button>
              )}
            </>
          )}
        </div>

        {/* Support */}
        <div className="mt-8 text-center text-sm text-gray-600">
          Need help? Contact us at{' '}
          <a href="mailto:james@ekaty.com" className="text-primary-600 hover:underline">
            james@ekaty.com
          </a>
        </div>
      </div>
    </div>
  )
}

function Feature({ text, bold = false }: { text: string; bold?: boolean }) {
  return (
    <div className="flex items-center">
      <svg className="w-5 h-5 text-green-500 mr-3 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
      </svg>
      <span className={bold ? 'font-semibold' : ''}>{text}</span>
    </div>
  )
}
