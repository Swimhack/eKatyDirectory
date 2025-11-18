import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { getCurrentUser } from '@/lib/auth'

export async function GET(request: NextRequest) {
  try {
    const user = await getCurrentUser()
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const restaurants = await prisma.restaurant.findMany({
      orderBy: [
        { featured: 'desc' },
        { name: 'asc' }
      ],
      select: {
        id: true,
        name: true,
        slug: true,
        email: true,
        address: true,
        zipCode: true,
        phone: true,
        website: true,
        featured: true,
        verified: true,
        active: true,
        logoUrl: true,
        categories: true,
        cuisineTypes: true,
        priceLevel: true,
        createdAt: true
      }
    })

    return NextResponse.json({ restaurants })
  } catch (error) {
    console.error('Error fetching restaurants:', error)
    return NextResponse.json({ error: 'Failed to fetch restaurants' }, { status: 500 })
  }
}
