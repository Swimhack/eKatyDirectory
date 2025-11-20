import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { getCurrentUser } from '@/lib/auth'
import { getTemplateForSegment } from '@/lib/outreach/email-templates'

export const dynamic = 'force-dynamic'

export async function GET(request: NextRequest) {
  try {
    const user = await getCurrentUser()
    if (!user || user.role !== 'ADMIN') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const url = new URL(request.url)
    const segment = url.searchParams.get('segment') || 'all'

    // Get restaurants for the requested segment
    const allRestaurants = await prisma.restaurant.findMany({
      where: { active: true },
      select: {
        id: true,
        name: true,
        slug: true,
        phone: true,
        website: true,
        email: true,
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
        } catch { }
      }
      return { ...r, hasMarketing }
    })

    // Filter by segment
    let filteredRestaurants = restaurantsWithData

    if (segment === 'High-Value Targets') {
      filteredRestaurants = restaurantsWithData.filter(r =>
        !r.hasMarketing && !r.featured && r.rating && r.rating >= 4.0 && r.reviewCount >= 50
      )
    } else if (segment === 'Family-Friendly Upsell') {
      filteredRestaurants = restaurantsWithData.filter(r => r.hasMarketing && !r.featured)
    } else if (segment === 'Featured Placement Candidates') {
      filteredRestaurants = restaurantsWithData.filter(r =>
        !r.featured && r.rating && r.rating >= 4.5 && r.reviewCount >= 100
      )
    } else if (segment === 'Phone-Only Quick Wins') {
      filteredRestaurants = restaurantsWithData.filter(r => r.phone && !r.website)
    }

    // Generate CSV with email templates
    const csvRows = filteredRestaurants.map(r => {
      const restaurantData = {
        name: r.name,
        rating: r.rating,
        reviewCount: r.reviewCount,
        phone: r.phone,
        website: r.website,
        cuisine: r.cuisineTypes,
        address: r.address
      }

      const emailTemplate = getTemplateForSegment(segment, restaurantData)

      return {
        'Restaurant Name': r.name,
        'Phone': r.phone || '',
        'Website': r.website || '',
        'Email': r.email || '',
        'Cuisine': r.cuisineTypes || '',
        'Rating': r.rating || '',
        'Reviews': r.reviewCount,
        'Address': r.address,
        'Segment': segment,
        'Email Subject': emailTemplate.subject,
        'Email Body': emailTemplate.body.replace(/\n/g, ' ').substring(0, 500),
        'CTA': emailTemplate.cta,
        'CTA URL': emailTemplate.ctaUrl,
        'Profile URL': `https://ekaty.com/restaurants/${r.slug}`
      }
    })

    // Convert to CSV
    const headers = Object.keys(csvRows[0] || {})
    const csvHeader = headers.map(h => `"${h}"`).join(',')
    const csvBody = csvRows.map(row =>
      headers.map(h => {
        const value = (row as any)[h] || ''
        return `"${String(value).replace(/"/g, '""')}"`
      }).join(',')
    ).join('\n')

    const csv = `${csvHeader}\n${csvBody}`

    return new NextResponse(csv, {
      headers: {
        'Content-Type': 'text/csv',
        'Content-Disposition': `attachment; filename="${segment.toLowerCase().replace(/\s+/g, '-')}-outreach.csv"`
      }
    })

  } catch (error) {
    console.error('Error exporting CSV:', error)
    return NextResponse.json({ error: 'Failed to export' }, { status: 500 })
  }
}
