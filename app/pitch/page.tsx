'use client'

import { useState } from 'react'
import Link from 'next/link'

export default function PitchDeckPage() {
  const [activeTab, setActiveTab] = useState<'restaurants' | 'investors'>('restaurants')

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary-50 via-white to-secondary-50">
      {/* Hero Section */}
      <div className="relative overflow-hidden bg-gradient-to-r from-primary-600 to-primary-800 text-white">
        <div className="absolute inset-0 bg-black opacity-10"></div>
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
          <div className="text-center">
            <h1 className="text-5xl md:text-6xl font-bold mb-6">
              Welcome to eKaty
            </h1>
            <p className="text-xl md:text-2xl mb-8 text-primary-100">
              Katy's Premier Restaurant Discovery Platform
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <button
                onClick={() => setActiveTab('restaurants')}
                className={`px-8 py-4 rounded-lg font-semibold text-lg transition-all ${
                  activeTab === 'restaurants'
                    ? 'bg-white text-primary-700 shadow-lg scale-105'
                    : 'bg-primary-700 text-white hover:bg-primary-600'
                }`}
              >
                🍽️ For Restaurants
              </button>
              <button
                onClick={() => setActiveTab('investors')}
                className={`px-8 py-4 rounded-lg font-semibold text-lg transition-all ${
                  activeTab === 'investors'
                    ? 'bg-white text-primary-700 shadow-lg scale-105'
                    : 'bg-primary-700 text-white hover:bg-primary-600'
                }`}
              >
                💰 For Investors
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Restaurant Partners Section */}
      {activeTab === 'restaurants' && (
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
          {/* Value Proposition */}
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-gray-900 mb-4">
              Grow Your Restaurant with eKaty
            </h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              Join Katy's fastest-growing restaurant discovery platform and connect with thousands of hungry local diners
            </p>
          </div>

          {/* Stats */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6 mb-16">
            <div className="bg-white rounded-lg shadow-lg p-6 text-center">
              <div className="text-4xl font-bold text-primary-600 mb-2">500+</div>
              <div className="text-gray-600">Restaurants Listed</div>
            </div>
            <div className="bg-white rounded-lg shadow-lg p-6 text-center">
              <div className="text-4xl font-bold text-primary-600 mb-2">50K+</div>
              <div className="text-gray-600">Monthly Visitors</div>
            </div>
            <div className="bg-white rounded-lg shadow-lg p-6 text-center">
              <div className="text-4xl font-bold text-primary-600 mb-2">15K+</div>
              <div className="text-gray-600">Active Users</div>
            </div>
            <div className="bg-white rounded-lg shadow-lg p-6 text-center">
              <div className="text-4xl font-bold text-primary-600 mb-2">95%</div>
              <div className="text-gray-600">User Satisfaction</div>
            </div>
          </div>

          {/* Benefits */}
          <div className="mb-16">
            <h3 className="text-3xl font-bold text-gray-900 mb-8 text-center">Why Partner with eKaty?</h3>
            <div className="grid md:grid-cols-3 gap-8">
              <div className="bg-white rounded-lg shadow-lg p-8">
                <div className="text-5xl mb-4">🎯</div>
                <h4 className="text-xl font-bold text-gray-900 mb-3">Targeted Local Reach</h4>
                <p className="text-gray-600">
                  Connect directly with Katy residents actively searching for their next dining experience
                </p>
              </div>
              <div className="bg-white rounded-lg shadow-lg p-8">
                <div className="text-5xl mb-4">📱</div>
                <h4 className="text-xl font-bold text-gray-900 mb-3">Mobile-First Platform</h4>
                <p className="text-gray-600">
                  Beautiful, responsive design that showcases your restaurant perfectly on any device
                </p>
              </div>
              <div className="bg-white rounded-lg shadow-lg p-8">
                <div className="text-5xl mb-4">⭐</div>
                <h4 className="text-xl font-bold text-gray-900 mb-3">Reviews & Ratings</h4>
                <p className="text-gray-600">
                  Build trust with authentic reviews and ratings from real local diners
                </p>
              </div>
              <div className="bg-white rounded-lg shadow-lg p-8">
                <div className="text-5xl mb-4">📸</div>
                <h4 className="text-xl font-bold text-gray-900 mb-3">Visual Showcase</h4>
                <p className="text-gray-600">
                  High-quality photo galleries that make mouths water and drive foot traffic
                </p>
              </div>
              <div className="bg-white rounded-lg shadow-lg p-8">
                <div className="text-5xl mb-4">🎲</div>
                <h4 className="text-xl font-bold text-gray-900 mb-3">Grub Roulette</h4>
                <p className="text-gray-600">
                  Get discovered by indecisive diners through our viral "spin to decide" feature
                </p>
              </div>
              <div className="bg-white rounded-lg shadow-lg p-8">
                <div className="text-5xl mb-4">📊</div>
                <h4 className="text-xl font-bold text-gray-900 mb-3">Analytics Dashboard</h4>
                <p className="text-gray-600">
                  Track views, clicks, and engagement to optimize your restaurant's presence
                </p>
              </div>
            </div>
          </div>

          {/* Pricing Tiers */}
          <div className="mb-16">
            <h3 className="text-3xl font-bold text-gray-900 mb-8 text-center">Simple, Transparent Pricing</h3>
            <div className="grid md:grid-cols-3 gap-8">
              {/* Free Tier */}
              <div className="bg-white rounded-lg shadow-lg p-8 border-2 border-gray-200">
                <div className="text-center mb-6">
                  <h4 className="text-2xl font-bold text-gray-900 mb-2">Free Listing</h4>
                  <div className="text-4xl font-bold text-gray-900 mb-2">$0</div>
                  <div className="text-gray-600">Forever Free</div>
                </div>
                <ul className="space-y-3 mb-8">
                  <li className="flex items-start">
                    <span className="text-green-500 mr-2">✓</span>
                    <span className="text-gray-600">Basic restaurant profile</span>
                  </li>
                  <li className="flex items-start">
                    <span className="text-green-500 mr-2">✓</span>
                    <span className="text-gray-600">Up to 5 photos</span>
                  </li>
                  <li className="flex items-start">
                    <span className="text-green-500 mr-2">✓</span>
                    <span className="text-gray-600">Customer reviews</span>
                  </li>
                  <li className="flex items-start">
                    <span className="text-green-500 mr-2">✓</span>
                    <span className="text-gray-600">Search visibility</span>
                  </li>
                </ul>
                <button className="w-full px-6 py-3 bg-gray-200 text-gray-700 rounded-lg font-semibold hover:bg-gray-300">
                  Current Plan
                </button>
              </div>

              {/* Featured Tier */}
              <div className="bg-gradient-to-br from-primary-600 to-primary-800 rounded-lg shadow-xl p-8 border-4 border-primary-400 transform scale-105">
                <div className="text-center mb-6">
                  <div className="inline-block bg-yellow-400 text-gray-900 px-3 py-1 rounded-full text-sm font-bold mb-3">
                    MOST POPULAR
                  </div>
                  <h4 className="text-2xl font-bold text-white mb-2">Featured</h4>
                  <div className="text-4xl font-bold text-white mb-2">$99</div>
                  <div className="text-primary-100">per month</div>
                </div>
                <ul className="space-y-3 mb-8">
                  <li className="flex items-start">
                    <span className="text-yellow-400 mr-2">✓</span>
                    <span className="text-white">Everything in Free</span>
                  </li>
                  <li className="flex items-start">
                    <span className="text-yellow-400 mr-2">✓</span>
                    <span className="text-white">Featured badge & placement</span>
                  </li>
                  <li className="flex items-start">
                    <span className="text-yellow-400 mr-2">✓</span>
                    <span className="text-white">Unlimited photos</span>
                  </li>
                  <li className="flex items-start">
                    <span className="text-yellow-400 mr-2">✓</span>
                    <span className="text-white">Priority in Grub Roulette</span>
                  </li>
                  <li className="flex items-start">
                    <span className="text-yellow-400 mr-2">✓</span>
                    <span className="text-white">Analytics dashboard</span>
                  </li>
                  <li className="flex items-start">
                    <span className="text-yellow-400 mr-2">✓</span>
                    <span className="text-white">Social media promotion</span>
                  </li>
                </ul>
                <button className="w-full px-6 py-3 bg-white text-primary-700 rounded-lg font-semibold hover:bg-primary-50">
                  Get Featured
                </button>
              </div>

              {/* Premium Tier */}
              <div className="bg-white rounded-lg shadow-lg p-8 border-2 border-gray-200">
                <div className="text-center mb-6">
                  <h4 className="text-2xl font-bold text-gray-900 mb-2">Premium</h4>
                  <div className="text-4xl font-bold text-gray-900 mb-2">$199</div>
                  <div className="text-gray-600">per month</div>
                </div>
                <ul className="space-y-3 mb-8">
                  <li className="flex items-start">
                    <span className="text-green-500 mr-2">✓</span>
                    <span className="text-gray-600">Everything in Featured</span>
                  </li>
                  <li className="flex items-start">
                    <span className="text-green-500 mr-2">✓</span>
                    <span className="text-gray-600">Homepage banner placement</span>
                  </li>
                  <li className="flex items-start">
                    <span className="text-green-500 mr-2">✓</span>
                    <span className="text-gray-600">Email newsletter feature</span>
                  </li>
                  <li className="flex items-start">
                    <span className="text-green-500 mr-2">✓</span>
                    <span className="text-gray-600">Dedicated account manager</span>
                  </li>
                  <li className="flex items-start">
                    <span className="text-green-500 mr-2">✓</span>
                    <span className="text-gray-600">Custom promotions</span>
                  </li>
                  <li className="flex items-start">
                    <span className="text-green-500 mr-2">✓</span>
                    <span className="text-gray-600">Priority support</span>
                  </li>
                </ul>
                <button className="w-full px-6 py-3 bg-primary-600 text-white rounded-lg font-semibold hover:bg-primary-700">
                  Go Premium
                </button>
              </div>
            </div>
          </div>

          {/* CTA */}
          <div className="bg-gradient-to-r from-primary-600 to-primary-800 rounded-2xl shadow-2xl p-12 text-center text-white">
            <h3 className="text-3xl font-bold mb-4">Ready to Grow Your Restaurant?</h3>
            <p className="text-xl text-primary-100 mb-8 max-w-2xl mx-auto">
              Join hundreds of Katy restaurants already thriving on eKaty
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link
                href="/advertise"
                className="px-8 py-4 bg-white text-primary-700 rounded-lg font-semibold text-lg hover:bg-primary-50 inline-block"
              >
                Get Started Free
              </Link>
              <a
                href="mailto:partners@ekaty.com"
                className="px-8 py-4 bg-primary-700 text-white rounded-lg font-semibold text-lg hover:bg-primary-600 inline-block"
              >
                Contact Sales
              </a>
            </div>
          </div>
        </div>
      )}

      {/* Investors Section */}
      {activeTab === 'investors' && (
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
          {/* Investment Opportunity */}
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-gray-900 mb-4">
              Invest in Katy's Food Future
            </h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              Join us in building the premier hyperlocal restaurant discovery platform for one of America's fastest-growing cities
            </p>
          </div>

          {/* The Opportunity */}
          <div className="grid md:grid-cols-2 gap-12 mb-16">
            <div className="bg-white rounded-lg shadow-lg p-8">
              <h3 className="text-2xl font-bold text-gray-900 mb-6">🎯 The Opportunity</h3>
              <ul className="space-y-4 text-gray-600">
                <li className="flex items-start">
                  <span className="text-primary-600 mr-2 font-bold">•</span>
                  <span><strong>Katy, TX:</strong> Population 500K+ and growing 3% annually</span>
                </li>
                <li className="flex items-start">
                  <span className="text-primary-600 mr-2 font-bold">•</span>
                  <span><strong>Affluent Market:</strong> Median household income $95K+</span>
                </li>
                <li className="flex items-start">
                  <span className="text-primary-600 mr-2 font-bold">•</span>
                  <span><strong>Restaurant Density:</strong> 500+ establishments and growing</span>
                </li>
                <li className="flex items-start">
                  <span className="text-primary-600 mr-2 font-bold">•</span>
                  <span><strong>Market Gap:</strong> No dominant hyperlocal discovery platform</span>
                </li>
                <li className="flex items-start">
                  <span className="text-primary-600 mr-2 font-bold">•</span>
                  <span><strong>First Mover:</strong> Establishing brand dominance early</span>
                </li>
              </ul>
            </div>

            <div className="bg-white rounded-lg shadow-lg p-8">
              <h3 className="text-2xl font-bold text-gray-900 mb-6">💡 Our Solution</h3>
              <ul className="space-y-4 text-gray-600">
                <li className="flex items-start">
                  <span className="text-primary-600 mr-2 font-bold">•</span>
                  <span><strong>Hyperlocal Focus:</strong> Deep Katy market penetration</span>
                </li>
                <li className="flex items-start">
                  <span className="text-primary-600 mr-2 font-bold">•</span>
                  <span><strong>Viral Features:</strong> Grub Roulette drives engagement</span>
                </li>
                <li className="flex items-start">
                  <span className="text-primary-600 mr-2 font-bold">•</span>
                  <span><strong>Multi-Revenue:</strong> Ads, featured listings, partnerships</span>
                </li>
                <li className="flex items-start">
                  <span className="text-primary-600 mr-2 font-bold">•</span>
                  <span><strong>Low CAC:</strong> Organic growth through community engagement</span>
                </li>
                <li className="flex items-start">
                  <span className="text-primary-600 mr-2 font-bold">•</span>
                  <span><strong>Scalable:</strong> Model replicable to other Houston suburbs</span>
                </li>
              </ul>
            </div>
          </div>

          {/* Traction */}
          <div className="bg-gradient-to-br from-green-50 to-emerald-50 rounded-2xl shadow-lg p-12 mb-16">
            <h3 className="text-3xl font-bold text-gray-900 mb-8 text-center">📈 Our Traction</h3>
            <div className="grid md:grid-cols-4 gap-8">
              <div className="text-center">
                <div className="text-5xl font-bold text-green-600 mb-2">500+</div>
                <div className="text-gray-700 font-medium">Restaurants Listed</div>
              </div>
              <div className="text-center">
                <div className="text-5xl font-bold text-green-600 mb-2">50K+</div>
                <div className="text-gray-700 font-medium">Monthly Users</div>
              </div>
              <div className="text-center">
                <div className="text-5xl font-bold text-green-600 mb-2">15K+</div>
                <div className="text-gray-700 font-medium">Active Members</div>
              </div>
              <div className="text-center">
                <div className="text-5xl font-bold text-green-600 mb-2">$5K</div>
                <div className="text-gray-700 font-medium">MRR (Growing)</div>
              </div>
            </div>
          </div>

          {/* Business Model */}
          <div className="mb-16">
            <h3 className="text-3xl font-bold text-gray-900 mb-8 text-center">💰 Revenue Streams</h3>
            <div className="grid md:grid-cols-3 gap-8">
              <div className="bg-white rounded-lg shadow-lg p-8">
                <div className="text-5xl mb-4">🏷️</div>
                <h4 className="text-xl font-bold text-gray-900 mb-3">Featured Listings</h4>
                <p className="text-gray-600 mb-4">
                  $99-$199/month per restaurant for premium placement and features
                </p>
                <div className="text-sm text-gray-500">
                  Target: 50 restaurants = $5K-10K MRR
                </div>
              </div>
              <div className="bg-white rounded-lg shadow-lg p-8">
                <div className="text-5xl mb-4">📢</div>
                <h4 className="text-xl font-bold text-gray-900 mb-3">Display Advertising</h4>
                <p className="text-gray-600 mb-4">
                  Banner ads, sponsored content, and email newsletter placements
                </p>
                <div className="text-sm text-gray-500">
                  Target: $2K-5K MRR from local businesses
                </div>
              </div>
              <div className="bg-white rounded-lg shadow-lg p-8">
                <div className="text-5xl mb-4">🤝</div>
                <h4 className="text-xl font-bold text-gray-900 mb-3">Strategic Partnerships</h4>
                <p className="text-gray-600 mb-4">
                  Delivery services, reservation systems, and loyalty programs
                </p>
                <div className="text-sm text-gray-500">
                  Target: $3K-8K MRR from integrations
                </div>
              </div>
            </div>
          </div>

          {/* Investment Ask */}
          <div className="bg-gradient-to-r from-purple-600 to-indigo-800 rounded-2xl shadow-2xl p-12 text-white mb-16">
            <div className="text-center mb-8">
              <h3 className="text-4xl font-bold mb-4">Investment Opportunity</h3>
              <p className="text-xl text-purple-100">
                Seeking $100K seed round to accelerate growth
              </p>
            </div>
            <div className="grid md:grid-cols-3 gap-8 mb-8">
              <div className="text-center">
                <div className="text-3xl font-bold mb-2">$100K</div>
                <div className="text-purple-100">Raise Amount</div>
              </div>
              <div className="text-center">
                <div className="text-3xl font-bold mb-2">10%</div>
                <div className="text-purple-100">Equity Offered</div>
              </div>
              <div className="text-center">
                <div className="text-3xl font-bold mb-2">$1M</div>
                <div className="text-purple-100">Post-Money Valuation</div>
              </div>
            </div>
            <div className="bg-white/10 rounded-lg p-6">
              <h4 className="font-bold text-xl mb-4">Use of Funds:</h4>
              <ul className="space-y-2 text-purple-100">
                <li>• <strong>40%</strong> - Marketing & User Acquisition</li>
                <li>• <strong>30%</strong> - Product Development & Features</li>
                <li>• <strong>20%</strong> - Sales & Restaurant Partnerships</li>
                <li>• <strong>10%</strong> - Operations & Infrastructure</li>
              </ul>
            </div>
          </div>

          {/* Why Now */}
          <div className="bg-white rounded-lg shadow-lg p-12 mb-16">
            <h3 className="text-3xl font-bold text-gray-900 mb-8 text-center">⏰ Why Now?</h3>
            <div className="grid md:grid-cols-2 gap-8">
              <div>
                <h4 className="text-xl font-bold text-gray-900 mb-4">Market Timing</h4>
                <ul className="space-y-3 text-gray-600">
                  <li className="flex items-start">
                    <span className="text-green-500 mr-2">✓</span>
                    <span>Post-pandemic dining boom in suburbs</span>
                  </li>
                  <li className="flex items-start">
                    <span className="text-green-500 mr-2">✓</span>
                    <span>Katy experiencing rapid population growth</span>
                  </li>
                  <li className="flex items-start">
                    <span className="text-green-500 mr-2">✓</span>
                    <span>Restaurants seeking digital marketing solutions</span>
                  </li>
                  <li className="flex items-start">
                    <span className="text-green-500 mr-2">✓</span>
                    <span>Community-focused platforms gaining traction</span>
                  </li>
                </ul>
              </div>
              <div>
                <h4 className="text-xl font-bold text-gray-900 mb-4">Competitive Advantage</h4>
                <ul className="space-y-3 text-gray-600">
                  <li className="flex items-start">
                    <span className="text-green-500 mr-2">✓</span>
                    <span>First-mover in Katy hyperlocal space</span>
                  </li>
                  <li className="flex items-start">
                    <span className="text-green-500 mr-2">✓</span>
                    <span>Unique viral features (Grub Roulette)</span>
                  </li>
                  <li className="flex items-start">
                    <span className="text-green-500 mr-2">✓</span>
                    <span>Strong community engagement & trust</span>
                  </li>
                  <li className="flex items-start">
                    <span className="text-green-500 mr-2">✓</span>
                    <span>Lean, efficient solo-founder operation</span>
                  </li>
                </ul>
              </div>
            </div>
          </div>

          {/* CTA */}
          <div className="bg-gradient-to-r from-indigo-600 to-purple-800 rounded-2xl shadow-2xl p-12 text-center text-white">
            <h3 className="text-3xl font-bold mb-4">Let's Build the Future Together</h3>
            <p className="text-xl text-indigo-100 mb-8 max-w-2xl mx-auto">
              Join us in revolutionizing how Katy discovers and supports local restaurants
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <a
                href="mailto:invest@ekaty.com"
                className="px-8 py-4 bg-white text-indigo-700 rounded-lg font-semibold text-lg hover:bg-indigo-50 inline-block"
              >
                Request Pitch Deck
              </a>
              <a
                href="mailto:invest@ekaty.com?subject=Schedule Meeting"
                className="px-8 py-4 bg-indigo-700 text-white rounded-lg font-semibold text-lg hover:bg-indigo-600 inline-block border-2 border-white"
              >
                Schedule Meeting
              </a>
            </div>
          </div>
        </div>
      )}

      {/* Footer */}
      <div className="bg-gray-900 text-white py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <Link href="/" className="text-2xl font-bold text-white hover:text-primary-400 mb-4 inline-block">
            eKaty
          </Link>
          <p className="text-gray-400 mb-4">
            Connecting Katy with its best restaurants
          </p>
          <div className="flex justify-center gap-6 text-sm text-gray-400">
            <a href="mailto:partners@ekaty.com" className="hover:text-white">partners@ekaty.com</a>
            <span>|</span>
            <a href="mailto:invest@ekaty.com" className="hover:text-white">invest@ekaty.com</a>
          </div>
        </div>
      </div>
    </div>
  )
}
