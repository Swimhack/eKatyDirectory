import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { getCurrentUser } from '@/lib/auth'

export const dynamic = 'force-dynamic'

export async function GET(request: NextRequest) {
  try {
    // Verify admin authentication
    const user = await getCurrentUser()
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Get counts and recent data
    const [
      totalRestaurants,
      activeRestaurants,
      featuredRestaurants,
      totalUsers,
      totalReviews,
      totalBlogArticles,
      publishedBlogArticles,
      recentRestaurants,
      recentBlogArticles
    ] = await Promise.all([
      prisma.restaurant.count(),
      prisma.restaurant.count({ where: { active: true } }),
      prisma.restaurant.count({ where: { featured: true } }),
      prisma.user.count(),
      prisma.review.count(),
      prisma.blogArticle.count(),
      prisma.blogArticle.count({ where: { status: 'published' } }),
      prisma.restaurant.findMany({
        orderBy: { createdAt: 'desc' },
        take: 5,
        select: {
          id: true,
          name: true,
          slug: true,
          featured: true,
          verified: true,
          active: true
        }
      }),
      prisma.blogArticle.findMany({
        orderBy: { publishedDate: 'desc' },
        take: 5,
        select: {
          id: true,
          title: true,
          slug: true,
          publishedDate: true,
          status: true
        }
      })
    ])

    return NextResponse.json({
      totalRestaurants,
      activeRestaurants,
      featuredRestaurants,
      totalUsers,
      totalReviews,
      totalBlogArticles,
      publishedBlogArticles,
      recentRestaurants,
      recentBlogArticles
    })

  } catch (error: any) {
    console.error('Failed to fetch stats:', error)
    return NextResponse.json(
      { error: 'Failed to fetch stats', message: error.message },
      { status: 500 }
    )
  }
}
