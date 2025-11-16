'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { generateExcerpt } from '@/lib/blog/utils'

interface BlogArticle {
  id: string
  title: string
  slug: string
  content: string
  metaDescription?: string | null
  publishedDate?: Date | null
  authorName: string
}

interface BlogPreviewProps {
  limit?: number
  showTitle?: boolean
  familyFocused?: boolean
}

export default function BlogPreview({ limit = 3, showTitle = true, familyFocused = false }: BlogPreviewProps) {
  const [articles, setArticles] = useState<BlogArticle[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetch('/api/blog?limit=' + limit)
      .then(res => res.json())
      .then(data => {
        setArticles(data.articles || [])
        setLoading(false)
      })
      .catch(err => {
        console.error('Error fetching blog articles:', err)
        setLoading(false)
      })
  }, [limit])

  if (loading) {
    return (
      <div className="space-y-4">
        {[1, 2, 3].map(i => (
          <div key={i} className="bg-gray-200 rounded-lg h-32 animate-pulse"></div>
        ))}
      </div>
    )
  }

  if (articles.length === 0) {
    return null
  }

  return (
    <div className="space-y-6">
      {showTitle && (
        <div className="flex items-center justify-between">
          <h2 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
            <span className="text-3xl">📝</span>
            {familyFocused ? 'Family Dining Tips & Stories' : 'Latest from Our Blog'}
          </h2>
          <Link 
            href="/blog" 
            className="text-primary-600 hover:text-primary-700 font-medium text-sm"
          >
            View All →
          </Link>
        </div>
      )}
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {articles.map((article) => (
          <Link
            key={article.id}
            href={`/blog/${article.slug}`}
            className="bg-white rounded-xl shadow-md hover:shadow-xl transition-all overflow-hidden group border border-gray-100"
          >
            {/* Header with gradient */}
            <div className="bg-gradient-to-br from-primary-50 to-orange-50 p-6 pb-4">
              <h3 className="text-lg font-bold text-gray-900 group-hover:text-primary-600 transition-colors leading-snug">
                {article.title}
              </h3>
            </div>
            
            {/* Content */}
            <div className="p-6 pt-4">
              {article.metaDescription ? (
                <p className="text-gray-600 text-sm mb-4 line-clamp-3 leading-relaxed">
                  {article.metaDescription}
                </p>
              ) : (
                <p className="text-gray-600 text-sm mb-4 line-clamp-3 leading-relaxed">
                  {generateExcerpt(article.content, 120)}
                </p>
              )}
              
              {/* Footer */}
              <div className="flex items-center justify-between pt-4 border-t border-gray-100">
                {article.publishedDate && (
                  <span className="flex items-center gap-1 text-xs text-gray-500">
                    <span className="text-base">📅</span>
                    {new Date(article.publishedDate).toLocaleDateString('en-US', {
                      month: 'short',
                      day: 'numeric',
                      year: 'numeric'
                    })}
                  </span>
                )}
                <span className="text-primary-600 group-hover:text-primary-700 font-semibold text-sm flex items-center gap-1">
                  Read More
                  <svg className="w-4 h-4 group-hover:translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                  </svg>
                </span>
              </div>
            </div>
          </Link>
        ))}
      </div>
    </div>
  )
}





