import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { getCurrentUser } from '@/lib/auth'

export async function GET(request: NextRequest) {
  try {
    const user = await getCurrentUser()
    if (!user || user.role !== 'ADMIN') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Get all active restaurants
    const allRestaurants = await prisma.restaurant.findMany({
      where: { active: true },
      select: {
        id: true,
        name: true,
        phone: true,
        website: true,
        cuisineTypes: true,
        priceLevel: true,
        rating: true,
        reviewCount: true,
        featured: true,
        metadata: true,
        address: true
      }
    })

    // Parse marketing data
    const restaurantsWithData = allRestaurants.map(r => {
      let hasMarketing = false
      if (r.metadata) {
        try {
          const meta = JSON.parse(r.metadata as string)
          hasMarketing = !!meta.marketing
        } catch {}
      }
      return { ...r, hasMarketing }
    })

    // Segment restaurants
    const segments = [
      {
        name: 'High-Value Targets',
        criteria: 'Rating ≥4.0, 50+ reviews, no marketing',
        restaurants: restaurantsWithData.filter(r =>
          !r.hasMarketing &&
          !r.featured &&
          r.rating && r.rating >= 4.0 &&
          r.reviewCount >= 50
        ).map(r => ({
          id: r.id,
          name: r.name,
          phone: r.phone,
          website: r.website,
          cuisine: r.cuisineTypes,
          rating: r.rating,
          reviews: r.reviewCount,
          address: r.address
        }))
      },
      {
        name: 'Family-Friendly Upsell',
        criteria: 'Already has marketing, not featured',
        restaurants: restaurantsWithData.filter(r =>
          r.hasMarketing &&
          !r.featured
        ).map(r => ({
          id: r.id,
          name: r.name,
          phone: r.phone,
          website: r.website,
          cuisine: r.cuisineTypes,
          rating: r.rating,
          reviews: r.reviewCount,
          address: r.address
        }))
      },
      {
        name: 'Featured Placement Candidates',
        criteria: 'Rating ≥4.5, 100+ reviews',
        restaurants: restaurantsWithData.filter(r =>
          !r.featured &&
          r.rating && r.rating >= 4.5 &&
          r.reviewCount >= 100
        ).map(r => ({
          id: r.id,
          name: r.name,
          phone: r.phone,
          website: r.website,
          cuisine: r.cuisineTypes,
          rating: r.rating,
          reviews: r.reviewCount,
          address: r.address
        }))
      },
      {
        name: 'Phone-Only Quick Wins',
        criteria: 'Has phone, no website',
        restaurants: restaurantsWithData.filter(r =>
          r.phone && !r.website
        ).map(r => ({
          id: r.id,
          name: r.name,
          phone: r.phone,
          website: r.website,
          cuisine: r.cuisineTypes,
          rating: r.rating,
          reviews: r.reviewCount,
          address: r.address
        }))
      }
    ]

    // Calculate segment counts and potential revenue
    const segmentsWithStats = segments.map(s => ({
      ...s,
      count: s.restaurants.length,
      potentialRevenue: Math.floor(s.restaurants.length * 0.15 * 99) // 15% avg conversion
    }))

    // Calculate overall stats (mock for now - would come from tracking table)
    const totalTargets = segmentsWithStats.reduce((sum, s) => sum + s.count, 0)

    const stats = {
      totalTargets,
      emailsSent: 0, // Would come from OutreachLog table
      smsSent: 0,
      responses: 0,
      conversions: 0,
      revenue: 0
    }

    return NextResponse.json({
      segments: segmentsWithStats,
      stats
    })

  } catch (error) {
    console.error('Error loading outreach segments:', error)
    return NextResponse.json({ error: 'Failed to load segments' }, { status: 500 })
  }
}
