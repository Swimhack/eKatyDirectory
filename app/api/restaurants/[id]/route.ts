import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { id } = params
    
    // Try to find by ID or slug
    const restaurant = await prisma.restaurant.findFirst({
      where: {
        OR: [
          { id },
          { slug: id }
        ],
        active: true
      },
      include: {
        reviews: {
          include: {
            user: {
              select: {
                id: true,
                name: true
              }
            }
          },
          orderBy: {
            createdAt: 'desc'
          },
          take: 10
        },
        _count: {
          select: {
            reviews: true,
            favorites: true
          }
        }
      }
    })
    
    if (!restaurant) {
      return NextResponse.json(
        { error: 'Restaurant not found' },
        { status: 404 }
      )
    }
    
    // Parse string fields back to arrays for response
    const formattedRestaurant = {
      ...restaurant,
      categories: restaurant.categories ? restaurant.categories.split(',').map((c: string) => c.trim()) : [],
      cuisineTypes: restaurant.cuisineTypes ? restaurant.cuisineTypes.split(',').map((c: string) => c.trim()) : [],
      photos: restaurant.photos ? restaurant.photos.split(',').map((p: string) => p.trim()) : [],
      hours: restaurant.hours ? JSON.parse(restaurant.hours) : {},
      reviews: restaurant.reviews.map((review: any) => ({
        ...review,
        photos: review.photos ? review.photos.split(',').map((p: string) => p.trim()) : []
      }))
    }
    
    return NextResponse.json(formattedRestaurant)
    
  } catch (error) {
    console.error('Error fetching restaurant:', error)
    return NextResponse.json(
      { error: 'Failed to fetch restaurant' },
      { status: 500 }
    )
  }
}