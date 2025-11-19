import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { getCurrentUser } from '@/lib/auth'

export const dynamic = 'force-dynamic'

export async function GET(request: NextRequest) {
  try {
    const user = await getCurrentUser()
    if (!user || user.role !== 'ADMIN') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const url = new URL(request.url)
    const search = (url.searchParams.get('search') || '').toLowerCase()
    const status = url.searchParams.get('status') || 'all'
    const featured = url.searchParams.get('featured')

    const restaurants = await prisma.restaurant.findMany({
      orderBy: [{ featured: 'desc' }, { name: 'asc' }],
      select: {
        id: true,
        name: true,
        slug: true,
        address: true,
        city: true,
        state: true,
        zipCode: true,
        phone: true,
        email: true,
        website: true,
        featured: true,
        verified: true,
        active: true,
        categories: true,
        cuisineTypes: true,
        priceLevel: true,
        metadata: true,
      },
    })

    const filtered = restaurants.filter(r => {
      const matchesSearch = !search
        || r.name.toLowerCase().includes(search)
        || r.address.toLowerCase().includes(search)
        || (r.categories || '').toLowerCase().includes(search)
        || (r.cuisineTypes || '').toLowerCase().includes(search)

      const matchesStatus =
        status === 'all'
          ? true
          : status === 'active'
            ? r.active
            : status === 'inactive'
              ? !r.active
              : status === 'featured'
                ? r.featured
                : true

      const matchesFeatured =
        featured == null
          ? true
          : featured === 'true'
            ? r.featured
            : !r.featured

      return matchesSearch && matchesStatus && matchesFeatured
    })

    const mapped = filtered.map(r => {
      let marketing: any = null
      if (r.metadata) {
        try {
          const parsed = JSON.parse(r.metadata as string)
          marketing = parsed.marketing || null
        } catch {
          marketing = null
        }
      }

      return {
        ...r,
        marketing,
      }
    })

    return NextResponse.json({ restaurants: mapped })
  } catch (error) {
    console.error('Marketing restaurants API error:', error)
    return NextResponse.json({ error: 'Failed to fetch marketing data' }, { status: 500 })
  }
}
