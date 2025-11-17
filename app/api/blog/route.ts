import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { generateExcerpt } from '@/lib/blog/utils'

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams
    const slug = searchParams.get('slug')
    const limit = parseInt(searchParams.get('limit') || '20')
    const offset = parseInt(searchParams.get('offset') || '0')
    
    // Get single article by slug
    if (slug) {
      const article = await prisma.blogArticle.findUnique({
        where: { slug }
      })
      
      if (!article || article.status !== 'published') {
        return NextResponse.json(
          { error: 'Article not found' },
          { status: 404 }
        )
      }
      
      return NextResponse.json(article)
    }
    
    // Get paginated list of published articles
    const [articles, total] = await Promise.all([
      prisma.blogArticle.findMany({
        where: { status: 'published' },
        orderBy: { publishedDate: 'desc' },
        take: limit,
        skip: offset
      }),
      prisma.blogArticle.count({
        where: { status: 'published' }
      })
    ])
    
    // Add excerpts
    const articlesWithExcerpts = articles.map(article => ({
      ...article,
      excerpt: generateExcerpt(article.content)
    }))
    
    return NextResponse.json({
      articles: articlesWithExcerpts,
      pagination: {
        total,
        limit,
        offset,
        hasMore: offset + limit < total
      }
    })
  } catch (error) {
    console.error('Error fetching blog articles:', error)
    return NextResponse.json(
      { error: 'Failed to fetch articles' },
      { status: 500 }
    )
  }
}






