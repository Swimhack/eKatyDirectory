import { NextRequest, NextResponse } from 'next/server'
import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

// PATCH - Approve or reject a claim (admin only)
export async function PATCH(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const adminKey = request.headers.get('x-admin-key')

    // Verify admin authentication
    if (adminKey !== process.env.ADMIN_API_KEY) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await request.json()
    const { status, adminNotes, reviewedBy } = body

    if (!['approved', 'rejected'].includes(status)) {
      return NextResponse.json(
        { error: 'Status must be approved or rejected' },
        { status: 400 }
      )
    }

    // Update claim
    const claim = await prisma.restaurantClaim.update({
      where: { id: params.id },
      data: {
        status,
        adminNotes,
        reviewedBy,
        reviewedAt: new Date()
      },
      include: {
        user: true,
        restaurant: true
      }
    })

    // If approved, create restaurant ownership
    if (status === 'approved') {
      await prisma.restaurantOwner.upsert({
        where: {
          userId_restaurantId: {
            userId: claim.userId,
            restaurantId: claim.restaurantId
          }
        },
        create: {
          userId: claim.userId,
          restaurantId: claim.restaurantId,
          role: 'owner',
          verified: true
        },
        update: {
          verified: true
        }
      })
    }

    return NextResponse.json({ claim })

  } catch (error: any) {
    console.error('Failed to update claim:', error)
    return NextResponse.json(
      { error: 'Failed to update claim', message: error.message },
      { status: 500 }
    )
  }
}
