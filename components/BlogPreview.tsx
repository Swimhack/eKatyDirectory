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
            className="bg-white rounded-lg shadow-md hover:shadow-lg transition-all p-6 group"
          >
            <div className="flex items-start justify-between mb-3">
              <h3 className="text-lg font-semibold text-gray-900 group-hover:text-primary-600 transition-colors line-clamp-2">
                {article.title}
              </h3>
            </div>
            
            {article.metaDescription ? (
              <p className="text-gray-600 text-sm mb-4 line-clamp-2">
                {article.metaDescription}
              </p>
            ) : (
              <p className="text-gray-600 text-sm mb-4 line-clamp-2">
                {generateExcerpt(article.content, 100)}
              </p>
            )}
            
            <div className="flex items-center justify-between text-xs text-gray-500">
              {article.publishedDate && (
                <span>
                  📅 {new Date(article.publishedDate).toLocaleDateString('en-US', {
                    month: 'short',
                    day: 'numeric',
                    year: 'numeric'
                  })}
                </span>
              )}
              <span className="text-primary-600 group-hover:text-primary-700 font-medium">
                Read More →
              </span>
            </div>
          </Link>
        ))}
      </div>
    </div>
  )
}



