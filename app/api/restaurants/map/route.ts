import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function GET(request: NextRequest) {
  try {
    const restaurants = await prisma.restaurant.findMany({
      where: {
        active: true
      },
      select: {
        id: true,
        name: true,
        slug: true,
        address: true,
        latitude: true,
        longitude: true,
        rating: true,
        cuisineTypes: true,
        priceLevel: true
      },
      orderBy: { name: 'asc' }
    })

    // Filter out restaurants without coordinates
    const validRestaurants = restaurants
      .filter(r => r.latitude !== null && r.longitude !== null)
      .map(r => ({
        id: r.id,
        name: r.name,
        slug: r.slug,
        address: r.address,
        latitude: r.latitude!,
        longitude: r.longitude!,
        rating: r.rating,
        cuisineTypes: r.cuisineTypes,
        priceLevel: r.priceLevel
      }))

    return NextResponse.json({
      restaurants: validRestaurants,
      count: validRestaurants.length
    })
  } catch (error) {
    console.error('Failed to fetch restaurants for map:', error)
    return NextResponse.json(
      { error: 'Failed to fetch restaurants' },
      { status: 500 }
    )
  }
}
