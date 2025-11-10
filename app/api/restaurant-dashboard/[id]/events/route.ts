import { NextRequest, NextResponse } from 'next/server'
import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

// POST - Create a new event
export async function POST(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    // TODO: Verify restaurant owner authentication
    
    const body = await request.json()
    const { title, description, startDate, endDate, imageUrl } = body

    if (!title || !description || !startDate) {
      return NextResponse.json(
        { error: 'Title, description, and start date are required' },
        { status: 400 }
      )
    }

    const event = await prisma.event.create({
      data: {
        restaurantId: params.id,
        title,
        description,
        startDate: new Date(startDate),
        endDate: endDate ? new Date(endDate) : new Date(startDate),
        imageUrl,
        active: true
      }
    })

    return NextResponse.json({
      success: true,
      event
    })

  } catch (error: any) {
    console.error('Failed to create event:', error)
    return NextResponse.json(
      { error: 'Failed to create event', message: error.message },
      { status: 500 }
    )
  }
}
