import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { cookies } from 'next/headers'

// GET - Get user's claim requests
export async function GET(request: NextRequest) {
  try {
    const cookieStore = await cookies()
    const userId = cookieStore.get('ekaty_user_id')?.value

    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const claims = await prisma.restaurantClaim.findMany({
      where: { userId },
      include: {
        restaurant: {
          select: {
            id: true,
            name: true,
            slug: true,
            address: true,
            phone: true,
            email: true
          }
        }
      },
      orderBy: { createdAt: 'desc' }
    })

    return NextResponse.json({ claims })
  } catch (error) {
    console.error('Failed to fetch claims:', error)
    return NextResponse.json({ error: 'Failed to fetch claims' }, { status: 500 })
  }
}

// POST - Submit a claim request
export async function POST(request: NextRequest) {
  try {
    const cookieStore = await cookies()
    const userId = cookieStore.get('ekaty_user_id')?.value

    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { restaurantId, verificationMethod, verificationData } = await request.json()

    if (!restaurantId) {
      return NextResponse.json({ error: 'Restaurant ID is required' }, { status: 400 })
    }

    // Check if restaurant exists
    const restaurant = await prisma.restaurant.findUnique({
      where: { id: restaurantId }
    })

    if (!restaurant) {
      return NextResponse.json({ error: 'Restaurant not found' }, { status: 404 })
    }

    // Check if user already has a pending or approved claim
    const existingClaim = await prisma.restaurantClaim.findFirst({
      where: {
        userId,
        restaurantId,
        status: { in: ['pending', 'approved'] }
      }
    })

    if (existingClaim) {
      return NextResponse.json(
        { error: 'You already have a claim request for this restaurant' },
        { status: 400 }
      )
    }

    // Create claim request
    const claim = await prisma.restaurantClaim.create({
      data: {
        userId,
        restaurantId,
        verificationMethod: verificationMethod || 'manual',
        verificationData: verificationData ? JSON.stringify(verificationData) : null,
        status: 'pending'
      },
      include: {
        restaurant: {
          select: {
            id: true,
            name: true,
            slug: true,
            address: true
          }
        }
      }
    })

    return NextResponse.json({ success: true, claim })
  } catch (error) {
    console.error('Failed to create claim:', error)
    return NextResponse.json({ error: 'Failed to create claim' }, { status: 500 })
  }
}
