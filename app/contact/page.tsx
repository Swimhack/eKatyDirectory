'use client'

import { useState } from 'react'

export default function ContactPage() {
  const [formType, setFormType] = useState<'contact' | 'advertise'>('contact')
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    restaurantName: '',
    subject: '',
    message: '',
    type: 'general'
  })
  const [submitting, setSubmitting] = useState(false)
  const [submitted, setSubmitted] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setSubmitting(true)
    
    try {
      // Auto-set subject for advertising form
      const subject = formType === 'advertise' 
        ? `Advertising Inquiry - ${formData.restaurantName || 'New Restaurant'}` 
        : formData.subject

      const response = await fetch('/api/contact', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          ...formData,
          subject,
          type: formType === 'advertise' ? 'advertising' : formData.type
        })
      })

      if (response.ok) {
        setSubmitted(true)
        setFormData({
          name: '',
          email: '',
          phone: '',
          restaurantName: '',
          subject: '',
          message: '',
          type: 'general'
        })
      }
    } catch (error) {
      console.error('Error submitting form:', error)
      alert('Failed to submit form. Please try again.')
    } finally {
      setSubmitting(false)
    }
  }

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    })
  }

  if (submitted) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center px-4">
        <div className="max-w-md w-full text-center">
          <div className="bg-white rounded-lg shadow-lg p-8">
            <div className="text-6xl mb-4">✅</div>
            <h2 className="text-2xl font-bold text-gray-900 mb-2">Thank You!</h2>
            <p className="text-gray-600 mb-6">
              We've received your {formType === 'advertise' ? 'advertising inquiry' : 'message'} and will get back to you within 24-48 hours.
            </p>
            <button
              onClick={() => {
                setSubmitted(false)
                setFormType('contact')
              }}
              className="btn-primary"
            >
              Send Another Message
            </button>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-gradient-to-r from-primary-600 to-primary-700 text-white py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h1 className="text-4xl font-bold mb-4">Get in Touch</h1>
          <p className="text-xl text-primary-100">
            Contact us or advertise your restaurant on eKaty
          </p>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">
          {/* Contact Info */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-lg shadow-md p-6 mb-6">
              <h2 className="text-xl font-semibold mb-4">Contact Information</h2>
              <div className="space-y-4">
                <div>
                  <h3 className="font-medium text-gray-700">Email</h3>
                  <a href="mailto:James@eKaty.com" className="text-primary-600 hover:text-primary-700">
                    James@eKaty.com
                  </a>
                </div>
                <div>
                  <h3 className="font-medium text-gray-700">Phone</h3>
                  <a href="tel:+17134446732" className="text-primary-600 hover:text-primary-700">
                    (713) 444-6732
                  </a>
                </div>
                <div>
                  <h3 className="font-medium text-gray-700">Office Hours</h3>
                  <p className="text-gray-600">Monday - Friday: 9AM - 6PM CST</p>
                </div>
              </div>
            </div>

            <div className="bg-primary-50 border border-primary-200 rounded-lg p-6">
              <h3 className="text-lg font-semibold text-primary-900 mb-3">
                🚀 Advertise Your Restaurant
              </h3>
              <p className="text-primary-700 mb-4">
                Reach thousands of hungry customers in Katy with our featured listings and promotional opportunities.
              </p>
              <ul className="space-y-2 text-sm text-primary-700">
                <li className="flex items-start">
                  <span className="mr-2">✓</span>
                  Featured homepage placement
                </li>
                <li className="flex items-start">
                  <span className="mr-2">✓</span>
                  Priority in search results
                </li>
                <li className="flex items-start">
                  <span className="mr-2">✓</span>
                  Detailed analytics dashboard
                </li>
                <li className="flex items-start">
                  <span className="mr-2">✓</span>
                  Promotional banners & offers
                </li>
              </ul>
            </div>
          </div>

          {/* Contact Form */}
          <div className="lg:col-span-2">
            <div className="bg-white rounded-lg shadow-md p-8">
              {/* Form Type Toggle */}
              <div className="flex rounded-lg bg-gray-100 p-1 mb-8">
                <button
                  type="button"
                  onClick={() => setFormType('contact')}
                  className={`flex-1 py-2 px-4 rounded-md font-medium transition-colors ${
                    formType === 'contact'
                      ? 'bg-white text-primary-600 shadow-sm'
                      : 'text-gray-600 hover:text-gray-900'
                  }`}
                >
                  General Contact
                </button>
                <button
                  type="button"
                  onClick={() => setFormType('advertise')}
                  className={`flex-1 py-2 px-4 rounded-md font-medium transition-colors ${
                    formType === 'advertise'
                      ? 'bg-white text-primary-600 shadow-sm'
                      : 'text-gray-600 hover:text-gray-900'
                  }`}
                >
                  Advertise with Us
                </button>
              </div>

              <form onSubmit={handleSubmit} className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-1">
                      Your Name *
                    </label>
                    <input
                      type="text"
                      id="name"
                      name="name"
                      value={formData.name}
                      onChange={handleChange}
                      required
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                    />
                  </div>

                  <div>
                    <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">
                      Email Address *
                    </label>
                    <input
                      type="email"
                      id="email"
                      name="email"
                      value={formData.email}
                      onChange={handleChange}
                      required
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                    />
                  </div>

                  {formType === 'advertise' && (
                    <>
                      <div>
                        <label htmlFor="restaurantName" className="block text-sm font-medium text-gray-700 mb-1">
                          Restaurant Name *
                        </label>
                        <input
                          type="text"
                          id="restaurantName"
                          name="restaurantName"
                          value={formData.restaurantName}
                          onChange={handleChange}
                          required
                          className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                        />
                      </div>

                      <div>
                        <label htmlFor="phone" className="block text-sm font-medium text-gray-700 mb-1">
                          Phone Number
                        </label>
                        <input
                          type="tel"
                          id="phone"
                          name="phone"
                          value={formData.phone}
                          onChange={handleChange}
                          className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                        />
                      </div>
                    </>
                  )}

                  {formType === 'contact' && (
                    <div className="md:col-span-2">
                      <label htmlFor="subject" className="block text-sm font-medium text-gray-700 mb-1">
                        Subject *
                      </label>
                      <input
                        type="text"
                        id="subject"
                        name="subject"
                        value={formData.subject}
                        onChange={handleChange}
                        required
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                      />
                    </div>
                  )}
                </div>

                {formType === 'contact' && (
                  <div>
                    <label htmlFor="type" className="block text-sm font-medium text-gray-700 mb-1">
                      Inquiry Type
                    </label>
                    <select
                      id="type"
                      name="type"
                      value={formData.type}
                      onChange={handleChange}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                    >
                      <option value="general">General Inquiry</option>
                      <option value="support">Technical Support</option>
                      <option value="feedback">Feedback</option>
                      <option value="partnership">Partnership</option>
                    </select>
                  </div>
                )}

                <div>
                  <label htmlFor="message" className="block text-sm font-medium text-gray-700 mb-1">
                    Message *
                  </label>
                  <textarea
                    id="message"
                    name="message"
                    value={formData.message}
                    onChange={handleChange}
                    required
                    rows={6}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 resize-none"
                    placeholder={
                      formType === 'advertise'
                        ? 'Tell us about your restaurant and what advertising options you\'re interested in...'
                        : 'How can we help you?'
                    }
                  />
                </div>

                <button
                  type="submit"
                  disabled={submitting}
                  className="w-full btn-primary flex items-center justify-center"
                >
                  {submitting ? (
                    <>
                      <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                      </svg>
                      Sending...
                    </>
                  ) : (
                    formType === 'advertise' ? 'Send Advertising Inquiry' : 'Send Message'
                  )}
                </button>
              </form>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}