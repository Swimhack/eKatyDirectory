import { NextRequest, NextResponse } from 'next/server'
import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

// GET - Fetch restaurant dashboard data
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    // TODO: Verify restaurant owner authentication
    // const session = await getSession(request)
    // if (!session || session.restaurantId !== params.id) {
    //   return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    // }

    const restaurant = await prisma.restaurant.findUnique({
      where: { id: params.id },
      include: {
        reviews: {
          include: {
            user: {
              select: {
                name: true,
                email: true
              }
            }
          },
          orderBy: { createdAt: 'desc' },
          take: 50
        },
        events: {
          where: {
            endDate: {
              gte: new Date()
            }
          },
          orderBy: { startDate: 'asc' }
        }
      }
    })

    if (!restaurant) {
      return NextResponse.json({ error: 'Restaurant not found' }, { status: 404 })
    }

    return NextResponse.json({
      restaurant: {
        id: restaurant.id,
        name: restaurant.name,
        slug: restaurant.slug,
        description: restaurant.description,
        address: restaurant.address,
        phone: restaurant.phone,
        website: restaurant.website,
        hours: restaurant.hours,
        cuisineTypes: restaurant.cuisineTypes,
        priceLevel: restaurant.priceLevel,
        rating: restaurant.rating,
        reviewCount: restaurant.reviewCount,
        active: restaurant.active
      },
      reviews: restaurant.reviews.map(review => ({
        id: review.id,
        rating: review.rating,
        comment: review.comment,
        userName: review.user?.name || 'Anonymous',
        createdAt: review.createdAt,
        response: review.ownerResponse
      })),
      events: restaurant.events
    })

  } catch (error: any) {
    console.error('Failed to fetch restaurant dashboard:', error)
    return NextResponse.json(
      { error: 'Failed to fetch dashboard data', message: error.message },
      { status: 500 }
    )
  }
}

// PATCH - Update restaurant profile
export async function PATCH(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    // TODO: Verify restaurant owner authentication
    
    const body = await request.json()
    const { name, description, phone, website, address, hours } = body

    const restaurant = await prisma.restaurant.update({
      where: { id: params.id },
      data: {
        ...(name && { name }),
        ...(description && { description }),
        ...(phone && { phone }),
        ...(website && { website }),
        ...(address && { address }),
        ...(hours && { hours }),
        updatedAt: new Date()
      }
    })

    return NextResponse.json({
      success: true,
      restaurant
    })

  } catch (error: any) {
    console.error('Failed to update restaurant:', error)
    return NextResponse.json(
      { error: 'Failed to update restaurant', message: error.message },
      { status: 500 }
    )
  }
}
