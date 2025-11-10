import { NextRequest, NextResponse } from 'next/server'
import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

// GET - List all claim requests (admin only)
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const status = searchParams.get('status')
    const adminKey = request.headers.get('x-admin-key')

    // Verify admin authentication
    if (adminKey !== process.env.ADMIN_API_KEY) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const claims = await prisma.restaurantClaim.findMany({
      where: status ? { status } : undefined,
      include: {
        user: {
          select: {
            id: true,
            email: true,
            name: true
          }
        },
        restaurant: {
          select: {
            id: true,
            name: true,
            slug: true,
            address: true,
            phone: true,
            website: true
          }
        }
      },
      orderBy: { createdAt: 'desc' }
    })

    return NextResponse.json({ claims })

  } catch (error: any) {
    console.error('Failed to fetch claims:', error)
    return NextResponse.json(
      { error: 'Failed to fetch claims', message: error.message },
      { status: 500 }
    )
  }
}

// POST - Create a claim request
export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { userId, restaurantId } = body

    if (!userId || !restaurantId) {
      return NextResponse.json(
        { error: 'User ID and Restaurant ID are required' },
        { status: 400 }
      )
    }

    // Check if claim already exists
    const existingClaim = await prisma.restaurantClaim.findFirst({
      where: {
        userId,
        restaurantId,
        status: { in: ['pending', 'approved'] }
      }
    })

    if (existingClaim) {
      return NextResponse.json(
        { error: 'Claim request already exists', claim: existingClaim },
        { status: 400 }
      )
    }

    // Create claim request
    const claim = await prisma.restaurantClaim.create({
      data: {
        userId,
        restaurantId,
        status: 'pending'
      },
      include: {
        restaurant: true
      }
    })

    return NextResponse.json({ claim })

  } catch (error: any) {
    console.error('Failed to create claim:', error)
    return NextResponse.json(
      { error: 'Failed to create claim', message: error.message },
      { status: 500 }
    )
  }
}
