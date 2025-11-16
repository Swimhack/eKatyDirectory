'use client'

import { decodePersonalityCard } from '@/lib/shareable-card'
import { notFound } from 'next/navigation'
import Link from 'next/link'
import { useState, useEffect } from 'react'

const personalityResults: Record<string, { title: string, color: string, emoji: string }> = {
  adventurous: {
    title: 'The Food Adventurer',
    color: 'from-orange-500 to-red-500',
    emoji: '🎲'
  },
  traditional: {
    title: 'The Family Classic',
    color: 'from-blue-500 to-indigo-500',
    emoji: '❤️'
  },
  explorer: {
    title: 'The Culinary Explorer',
    color: 'from-purple-500 to-pink-500',
    emoji: '🔍'
  },
  'health-conscious': {
    title: 'The Mindful Diner',
    color: 'from-green-500 to-emerald-500',
    emoji: '🌱'
  }
}

// Metadata generation moved to a separate function since this is now a client component
// We'll handle metadata via head tags in the component

function ShareButton({ shareUrl, shareText, title }: { shareUrl: string, shareText: string, title: string }) {
  const [copied, setCopied] = useState(false)

  const handleShare = async () => {
    if (typeof navigator !== 'undefined' && navigator.share) {
      try {
        await navigator.share({
          title: `My Katy Dining Personality: ${title}`,
          text: shareText,
          url: shareUrl
        })
      } catch (err) {
        // User cancelled
      }
    } else if (typeof navigator !== 'undefined' && navigator.clipboard) {
      navigator.clipboard.writeText(shareUrl)
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    }
  }

  return (
    <button
      onClick={handleShare}
      className="inline-flex items-center gap-2 px-6 py-3 bg-primary-600 text-white rounded-lg font-semibold hover:bg-primary-700 transition-colors shadow-md hover:shadow-lg"
    >
      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.368 2.684 3 3 0 00-5.368-2.684z" />
      </svg>
      {copied ? 'Copied!' : 'Share Link'}
    </button>
  )
}

export default function SharePersonalityPage({ params }: { params: { cardId: string } }) {
  const cardData = decodePersonalityCard(params.cardId)
  
  if (!cardData) {
    notFound()
  }

  const baseUrl = typeof window !== 'undefined' ? window.location.origin : (process.env.NEXT_PUBLIC_APP_URL || 'https://ekaty.fly.dev')
  const shareUrl = `${baseUrl}/share/personality/${params.cardId}`
  const shareText = `I'm a ${cardData.title} on eKaty! Discover your Katy dining personality:`

  useEffect(() => {
    // Update document title and meta tags for social sharing
    if (cardData) {
      document.title = `${cardData.title} | My Katy Dining Personality - eKaty`
      
      // Update or create meta tags
      const updateMetaTag = (property: string, content: string) => {
        let meta = document.querySelector(`meta[property="${property}"]`) || 
                   document.querySelector(`meta[name="${property}"]`)
        if (!meta) {
          meta = document.createElement('meta')
          meta.setAttribute(property.includes('og:') ? 'property' : 'name', property)
          document.head.appendChild(meta)
        }
        meta.setAttribute('content', content)
      }
      
      updateMetaTag('og:title', cardData.title)
      updateMetaTag('og:description', cardData.description)
      updateMetaTag('og:url', shareUrl)
      updateMetaTag('og:type', 'website')
      updateMetaTag('twitter:card', 'summary_large_image')
      updateMetaTag('twitter:title', cardData.title)
      updateMetaTag('twitter:description', cardData.description)
    }
  }, [cardData, shareUrl])

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
      <div className="max-w-2xl w-full">
        {/* Shareable Card */}
        <div className={`bg-gradient-to-br ${cardData.color} rounded-3xl p-12 text-white text-center shadow-2xl mb-8`}>
          <div className="text-7xl mb-6">{cardData.title.split(' ').pop()}</div>
          <h1 className="text-4xl font-bold mb-6">{cardData.title}</h1>
          <p className="text-xl mb-8 opacity-90 leading-relaxed">{cardData.description}</p>
          
          <div className="flex flex-wrap justify-center gap-3 mb-8">
            {cardData.traits.map((trait, i) => (
              <span 
                key={i} 
                className="bg-white/20 backdrop-blur-sm px-6 py-3 rounded-full text-lg font-medium"
              >
                {trait}
              </span>
            ))}
          </div>

          <div className="bg-white/10 backdrop-blur-sm rounded-xl p-6 mb-8">
            <p className="text-lg font-medium">Discover your Katy dining personality at eKaty.com</p>
          </div>

          {/* eKaty Branding */}
          <div className="mt-8 pt-6 border-t border-white/20">
            <Link href="/" className="inline-flex items-center gap-2 text-white/80 hover:text-white transition-colors">
              <img src="/logo.png" alt="eKaty" className="h-6 w-auto" />
              <span className="font-semibold">eKaty.com</span>
            </Link>
          </div>
        </div>

        {/* Share Buttons */}
        <div className="bg-white rounded-2xl shadow-xl p-8">
          <h2 className="text-2xl font-bold text-gray-900 mb-6 text-center">
            Share Your Dining Personality! 🎉
          </h2>
          
          <div className="flex flex-wrap gap-3 justify-center mb-6">
            <a
              href={`https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(shareUrl)}&quote=${encodeURIComponent(shareText)}`}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 px-6 py-3 bg-blue-600 text-white rounded-lg font-semibold hover:bg-blue-700 transition-colors shadow-md hover:shadow-lg"
            >
              <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/>
              </svg>
              Share on Facebook
            </a>
            
            <a
              href={`https://twitter.com/intent/tweet?url=${encodeURIComponent(shareUrl)}&text=${encodeURIComponent(shareText)}`}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 px-6 py-3 bg-sky-500 text-white rounded-lg font-semibold hover:bg-sky-600 transition-colors shadow-md hover:shadow-lg"
            >
              <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                <path d="M23.953 4.57a10 10 0 01-2.825.775 4.958 4.958 0 002.163-2.723c-.951.555-2.005.959-3.127 1.184a4.92 4.92 0 00-8.384 4.482C7.69 8.095 4.067 6.13 1.64 3.162a4.822 4.822 0 00-.666 2.475c0 1.71.87 3.213 2.188 4.096a4.904 4.904 0 01-2.228-.616v.06a4.923 4.923 0 003.946 4.827 4.996 4.996 0 01-2.212.085 4.936 4.936 0 004.604 3.417 9.867 9.867 0 01-6.102 2.105c-.39 0-.779-.023-1.17-.067a13.995 13.995 0 007.557 2.209c9.053 0 13.998-7.496 13.998-13.985 0-.21 0-.42-.015-.63A9.935 9.935 0 0024 4.59z"/>
              </svg>
              Share on Twitter
            </a>

            <a
              href={`https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(shareUrl)}`}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 px-6 py-3 bg-blue-700 text-white rounded-lg font-semibold hover:bg-blue-800 transition-colors shadow-md hover:shadow-lg"
            >
              <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z"/>
              </svg>
              Share on LinkedIn
            </a>
          </div>

          <div className="text-center">
            <button
              onClick={async () => {
                if (navigator.share) {
                  try {
                    await navigator.share({
                      title: `My Katy Dining Personality: ${cardData.title}`,
                      text: shareText,
                      url: shareUrl
                    })
                  } catch (err) {
                    // User cancelled
                  }
                } else {
                  navigator.clipboard.writeText(shareUrl)
                  alert('Link copied to clipboard!')
                }
              }}
              className="inline-flex items-center gap-2 px-6 py-3 bg-primary-600 text-white rounded-lg font-semibold hover:bg-primary-700 transition-colors shadow-md hover:shadow-lg"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.368 2.684 3 3 0 00-5.368-2.684z" />
              </svg>
              Share Link
            </button>
          </div>

          <div className="mt-8 pt-6 border-t border-gray-200 text-center">
            <Link 
              href="/personality"
              className="text-primary-600 hover:text-primary-700 font-semibold"
            >
              ← Take the Quiz Again
            </Link>
            {' • '}
            <Link 
              href="/"
              className="text-primary-600 hover:text-primary-700 font-semibold"
            >
              Explore eKaty
            </Link>
          </div>
        </div>
      </div>
    </div>
  )
}

