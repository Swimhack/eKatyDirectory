'use client'

import { useState, useEffect } from 'react'
import { Check, Star, TrendingUp, Users, BarChart3, Phone, Mail, Building2 } from 'lucide-react'

interface Tier {
  id: string
  name: string
  slug: string
  monthly_price: number
  features: string[]
  display_order: number
  is_active: boolean
}

export default function PartnerPage() {
  const [tiers, setTiers] = useState<Tier[]>([])
  const [loading, setLoading] = useState(true)
  const [selectedTier, setSelectedTier] = useState<string>('')
  const [formData, setFormData] = useState({
    businessName: '',
    contactName: '',
    email: '',
    phone: '',
    message: '',
  })

  useEffect(() => {
    fetchTiers()
  }, [])

  const fetchTiers = async () => {
    try {
      const response = await fetch('/api/tiers')
      const data = await response.json()
      setTiers(data.tiers || [])
    } catch (error) {
      console.error('Error fetching tiers:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleApplyClick = (tierSlug: string) => {
    setSelectedTier(tierSlug)
    // Scroll to application form
    const formSection = document.getElementById('application-form')
    if (formSection) {
      formSection.scrollIntoView({ behavior: 'smooth', block: 'start' })
    }
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    // Form submission will be handled in Phase 7
    console.log('Form submitted:', { ...formData, selectedTier })
    alert('Thank you for your interest! We will contact you soon.')
  }

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    })
  }

  return (
    <div className="min-h-screen bg-warm-50">
      {/* Hero Section */}
      <section className="bg-gradient-to-br from-brand-600 via-brand-500 to-brand-700 text-white section-spacing">
        <div className="container-mobile text-center">
          <h1 className="font-bold mb-4 md:mb-6 text-white">
            Partner with eKaty
          </h1>
          <p className="text-lg md:text-xl text-brand-50 mb-6 md:mb-8 max-w-3xl mx-auto leading-relaxed">
            Join Katy's premier restaurant discovery platform and connect with thousands of local food lovers.
            Increase your visibility, reach new customers, and grow your business with our proven partnership program.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center items-center text-brand-50">
            <div className="flex items-center gap-2">
              <Users className="h-5 w-5" />
              <span className="font-semibold">10,000+ Active Users</span>
            </div>
            <div className="flex items-center gap-2">
              <TrendingUp className="h-5 w-5" />
              <span className="font-semibold">3x Average Traffic Increase</span>
            </div>
          </div>
        </div>
      </section>

      {/* Partnership Benefits */}
      <section className="section-spacing bg-white">
        <div className="container-mobile">
          <h2 className="text-center mb-8 md:mb-12">
            Why Partner with eKaty?
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 md:gap-8">
            <div className="card text-center">
              <div className="inline-flex items-center justify-center w-12 h-12 md:w-16 md:h-16 bg-brand-100 text-brand-600 rounded-full mb-4">
                <Star className="h-6 w-6 md:h-8 md:w-8" />
              </div>
              <h3 className="mb-3">Increased Visibility</h3>
              <p className="text-gray-600 leading-relaxed">
                Get discovered by thousands of local food enthusiasts actively searching for their next dining experience in Katy.
              </p>
            </div>

            <div className="card text-center">
              <div className="inline-flex items-center justify-center w-12 h-12 md:w-16 md:h-16 bg-brand-100 text-brand-600 rounded-full mb-4">
                <TrendingUp className="h-6 w-6 md:h-8 md:w-8" />
              </div>
              <h3 className="mb-3">Drive More Customers</h3>
              <p className="text-gray-600 leading-relaxed">
                Our platform connects hungry diners with your restaurant through intelligent search, categories, and our popular Grub Roulette feature.
              </p>
            </div>

            <div className="card text-center">
              <div className="inline-flex items-center justify-center w-12 h-12 md:w-16 md:h-16 bg-brand-100 text-brand-600 rounded-full mb-4">
                <BarChart3 className="h-6 w-6 md:h-8 md:w-8" />
              </div>
              <h3 className="mb-3">Powerful Analytics</h3>
              <p className="text-gray-600 leading-relaxed">
                Track your performance with detailed insights on profile views, customer engagement, and review trends.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Pricing Tiers */}
      <section className="section-spacing">
        <div className="container-mobile">
          <h2 className="text-center mb-4">
            Choose Your Partnership Tier
          </h2>
          <p className="text-center text-gray-600 mb-8 md:mb-12 max-w-2xl mx-auto">
            Select the plan that best fits your restaurant's goals. All tiers include our core features with increasing levels of visibility and support.
          </p>

          {loading ? (
            <div className="text-center py-12">
              <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-brand-600"></div>
              <p className="mt-4 text-gray-600">Loading partnership tiers...</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 md:gap-8 max-w-6xl mx-auto">
              {tiers.map((tier, index) => (
                <div
                  key={tier.id}
                  className={`card relative ${
                    index === 1 ? 'ring-2 ring-brand-500 shadow-xl' : ''
                  }`}
                >
                  {index === 1 && (
                    <div className="absolute -top-4 left-1/2 -translate-x-1/2">
                      <span className="bg-brand-500 text-white px-4 py-1 rounded-full text-sm font-semibold shadow-lg">
                        Most Popular
                      </span>
                    </div>
                  )}

                  <div className="text-center mb-6">
                    <h3 className="text-2xl mb-2">{tier.name}</h3>
                    <div className="flex items-baseline justify-center gap-1">
                      <span className="text-4xl font-bold text-brand-600">
                        ${tier.monthly_price}
                      </span>
                      <span className="text-gray-600">/month</span>
                    </div>
                  </div>

                  <ul className="space-y-3 mb-8">
                    {tier.features.map((feature, featureIndex) => (
                      <li key={featureIndex} className="flex items-start gap-3">
                        <Check className="h-5 w-5 text-brand-600 flex-shrink-0 mt-0.5" />
                        <span className="text-gray-700 text-sm md:text-base">{feature}</span>
                      </li>
                    ))}
                  </ul>

                  <button
                    onClick={() => handleApplyClick(tier.slug)}
                    className={`w-full py-3 px-6 rounded-lg font-semibold transition-all ${
                      index === 1
                        ? 'bg-brand-500 hover:bg-brand-600 text-white shadow-md hover:shadow-lg'
                        : 'bg-white hover:bg-brand-50 text-brand-600 border-2 border-brand-500'
                    }`}
                  >
                    Apply Now
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>
      </section>

      {/* Application Form */}
      <section id="application-form" className="section-spacing bg-white">
        <div className="container-mobile">
          <div className="max-w-3xl mx-auto">
            <h2 className="text-center mb-4">
              Start Your Partnership Today
            </h2>
            <p className="text-center text-gray-600 mb-8 md:mb-12">
              Fill out the form below and our team will contact you within 24 hours to discuss your partnership options.
            </p>

            <form onSubmit={handleSubmit} className="card">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label htmlFor="businessName" className="block text-sm font-semibold text-gray-700 mb-2">
                    <Building2 className="inline h-4 w-4 mr-1" />
                    Restaurant Name *
                  </label>
                  <input
                    type="text"
                    id="businessName"
                    name="businessName"
                    required
                    value={formData.businessName}
                    onChange={handleInputChange}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-brand-500 focus:border-transparent min-h-[44px]"
                    placeholder="Your Restaurant Name"
                  />
                </div>

                <div>
                  <label htmlFor="contactName" className="block text-sm font-semibold text-gray-700 mb-2">
                    Contact Name *
                  </label>
                  <input
                    type="text"
                    id="contactName"
                    name="contactName"
                    required
                    value={formData.contactName}
                    onChange={handleInputChange}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-brand-500 focus:border-transparent min-h-[44px]"
                    placeholder="Your Name"
                  />
                </div>

                <div>
                  <label htmlFor="email" className="block text-sm font-semibold text-gray-700 mb-2">
                    <Mail className="inline h-4 w-4 mr-1" />
                    Email Address *
                  </label>
                  <input
                    type="email"
                    id="email"
                    name="email"
                    required
                    value={formData.email}
                    onChange={handleInputChange}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-brand-500 focus:border-transparent min-h-[44px]"
                    placeholder="your@email.com"
                  />
                </div>

                <div>
                  <label htmlFor="phone" className="block text-sm font-semibold text-gray-700 mb-2">
                    <Phone className="inline h-4 w-4 mr-1" />
                    Phone Number *
                  </label>
                  <input
                    type="tel"
                    id="phone"
                    name="phone"
                    required
                    value={formData.phone}
                    onChange={handleInputChange}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-brand-500 focus:border-transparent min-h-[44px]"
                    placeholder="(123) 456-7890"
                  />
                </div>

                <div className="md:col-span-2">
                  <label htmlFor="selectedTier" className="block text-sm font-semibold text-gray-700 mb-2">
                    Preferred Partnership Tier *
                  </label>
                  <select
                    id="selectedTier"
                    name="selectedTier"
                    required
                    value={selectedTier}
                    onChange={(e) => setSelectedTier(e.target.value)}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-brand-500 focus:border-transparent min-h-[44px]"
                  >
                    <option value="">Select a tier</option>
                    {tiers.map((tier) => (
                      <option key={tier.id} value={tier.slug}>
                        {tier.name} - ${tier.monthly_price}/month
                      </option>
                    ))}
                  </select>
                </div>

                <div className="md:col-span-2">
                  <label htmlFor="message" className="block text-sm font-semibold text-gray-700 mb-2">
                    Additional Information (Optional)
                  </label>
                  <textarea
                    id="message"
                    name="message"
                    rows={4}
                    value={formData.message}
                    onChange={handleInputChange}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-brand-500 focus:border-transparent resize-none"
                    placeholder="Tell us about your restaurant, any questions you have, or specific needs..."
                  />
                </div>
              </div>

              <div className="mt-8">
                <button
                  type="submit"
                  className="w-full btn-primary text-lg"
                >
                  Submit Application
                </button>
                <p className="text-sm text-gray-500 text-center mt-4">
                  We'll review your application and contact you within 24 hours
                </p>
              </div>
            </form>
          </div>
        </div>
      </section>

      {/* FAQ Section */}
      <section className="section-spacing">
        <div className="container-mobile">
          <h2 className="text-center mb-8 md:mb-12">
            Frequently Asked Questions
          </h2>
          <div className="max-w-3xl mx-auto space-y-6">
            <div className="card">
              <h3 className="mb-3 text-lg">How quickly will I see results?</h3>
              <p className="text-gray-600 leading-relaxed">
                Most partners see increased profile views within the first week. On average, restaurants experience
                a 3x increase in customer engagement within the first month of partnership.
              </p>
            </div>

            <div className="card">
              <h3 className="mb-3 text-lg">Can I upgrade or downgrade my tier?</h3>
              <p className="text-gray-600 leading-relaxed">
                Yes! You can change your partnership tier at any time. Upgrades take effect immediately, and
                downgrades will be applied at your next billing cycle.
              </p>
            </div>

            <div className="card">
              <h3 className="mb-3 text-lg">What payment methods do you accept?</h3>
              <p className="text-gray-600 leading-relaxed">
                We accept all major credit cards and can set up automated monthly billing for your convenience.
                Annual payment options are also available with a discount.
              </p>
            </div>

            <div className="card">
              <h3 className="mb-3 text-lg">Is there a contract or commitment period?</h3>
              <p className="text-gray-600 leading-relaxed">
                Our partnerships are month-to-month with no long-term contracts. You can cancel anytime with
                30 days notice. We believe in earning your business every month.
              </p>
            </div>

            <div className="card">
              <h3 className="mb-3 text-lg">What kind of support do partners receive?</h3>
              <p className="text-gray-600 leading-relaxed">
                All partners receive email support, with response times varying by tier. Premium and Featured
                tiers include priority support with faster response times and dedicated account assistance.
              </p>
            </div>

            <div className="card">
              <h3 className="mb-3 text-lg">How do I manage my restaurant's profile?</h3>
              <p className="text-gray-600 leading-relaxed">
                Once approved, you'll receive access to a dedicated partner dashboard where you can update your
                information, upload photos, view analytics, and manage your listing in real-time.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="section-spacing bg-gradient-to-br from-brand-600 to-brand-700 text-white">
        <div className="container-mobile text-center">
          <h2 className="mb-4 text-white">
            Ready to Grow Your Restaurant?
          </h2>
          <p className="text-lg text-brand-50 mb-8 max-w-2xl mx-auto">
            Join the most trusted restaurant discovery platform in Katy and start connecting with more customers today.
          </p>
          <button
            onClick={() => handleApplyClick('')}
            className="bg-white text-brand-600 hover:bg-brand-50 px-8 py-4 rounded-lg font-semibold text-lg shadow-lg hover:shadow-xl transition-all"
          >
            Start Your Application
          </button>
        </div>
      </section>
    </div>
  )
}
