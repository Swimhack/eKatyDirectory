'use client'

import Link from 'next/link'

export default function LaunchPromotionSection() {
  const promotions = [
    {
      icon: '🎁',
      title: 'Win Free Meals',
      description: 'Enter our launch giveaway for a chance to win $500 in restaurant gift cards!',
      color: 'from-pink-500 to-rose-600',
      link: '/blog/ekaty-launch-celebration-flyers-deals-giveaways-join-the-buzz',
      cta: 'Enter Now'
    },
    {
      icon: '🎫',
      title: 'Exclusive Coupons',
      description: 'Get 20% off at participating Katy restaurants. Limited time launch offer!',
      color: 'from-blue-500 to-indigo-600',
      link: '/blog/ekaty-launch-celebration-flyers-deals-giveaways-join-the-buzz',
      cta: 'Get Coupons'
    },
    {
      icon: '📄',
      title: 'Download Flyers',
      description: 'Share the eKaty launch with friends! Download printable flyers and social media graphics.',
      color: 'from-green-500 to-emerald-600',
      link: '/blog/ekaty-launch-celebration-flyers-deals-giveaways-join-the-buzz',
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
                <Link
                  href={promo.link}
                  className="inline-flex items-center bg-white text-gray-900 px-4 py-2 rounded-lg font-semibold text-sm hover:bg-gray-100 transition-colors"
                >
                  {promo.cta}
                  <svg className="w-4 h-4 ml-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                  </svg>
                </Link>
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
    </section>
  )
}





