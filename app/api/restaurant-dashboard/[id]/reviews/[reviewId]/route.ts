import { NextRequest, NextResponse } from 'next/server'
import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

// POST - Respond to a review (restaurant owner only)
export async function POST(
  request: NextRequest,
  { params }: { params: { id: string; reviewId: string } }
) {
  try {
    // TODO: Verify restaurant owner authentication
    // Ensure the authenticated user owns this restaurant
    
    const body = await request.json()
    const { response } = body

    if (!response || response.trim().length === 0) {
      return NextResponse.json(
        { error: 'Response text is required' },
        { status: 400 }
      )
    }

    // Update the review with owner response
    const review = await prisma.review.update({
      where: { id: params.reviewId },
      data: {
        ownerResponse: response,
        ownerResponseDate: new Date()
      }
    })

    return NextResponse.json({
      success: true,
      review
    })

  } catch (error: any) {
    console.error('Failed to respond to review:', error)
    return NextResponse.json(
      { error: 'Failed to post response', message: error.message },
      { status: 500 }
    )
  }
}
