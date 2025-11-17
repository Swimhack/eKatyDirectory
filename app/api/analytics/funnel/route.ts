import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export const dynamic = 'force-dynamic'

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()

    const {
      sessionId,
      funnelType,
      step,
      restaurantId,
      metadata,
    } = body

    if (!sessionId || !funnelType || !step) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      )
    }

    // Find or create funnel
    let funnel = await prisma.conversionFunnel.findFirst({
      where: {
        sessionId,
        funnelType,
        completed: false,
      },
      orderBy: {
        createdAt: 'desc',
      },
    })

    const now = new Date()

    if (!funnel) {
      // Create new funnel
      funnel = await prisma.conversionFunnel.create({
        data: {
          sessionId,
          funnelType,
          restaurantId: restaurantId || null,
          metadata: metadata || null,
          step1Time: step === 1 ? now : null,
          step2Time: step === 2 ? now : null,
          step3Time: step === 3 ? now : null,
          step4Time: step === 4 ? now : null,
          completed: step === 4,
        },
      })
    } else {
      // Update existing funnel
      const updateData: any = {
        [`step${step}Time`]: now,
      }

      if (step === 4) {
        updateData.completed = true
      }

      if (restaurantId) {
        updateData.restaurantId = restaurantId
      }

      funnel = await prisma.conversionFunnel.update({
        where: { id: funnel.id },
        data: updateData,
      })
    }

    return NextResponse.json({ success: true, funnelId: funnel.id })
  } catch (error) {
    console.error('Funnel tracking error:', error)
    return NextResponse.json(
      { error: 'Failed to track funnel' },
      { status: 500 }
    )
  }
}
