import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export const dynamic = 'force-dynamic'

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()

    const {
      sessionId,
      landingPage,
      referrer,
      referrerDomain,
      utmSource,
      utmMedium,
      utmCampaign,
      deviceType,
      browser,
      os,
      screenWidth,
      screenHeight,
    } = body

    if (!sessionId || !landingPage) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      )
    }

    // Check if session already exists
    const existing = await prisma.userSession.findUnique({
      where: { sessionId },
    })

    if (existing) {
      return NextResponse.json({ success: true, sessionId, existing: true })
    }

    // Create new session
    const session = await prisma.userSession.create({
      data: {
        sessionId,
        landingPage,
        referrer: referrer || null,
        referrerDomain: referrerDomain || null,
        utmSource: utmSource || null,
        utmMedium: utmMedium || null,
        utmCampaign: utmCampaign || null,
        deviceType: deviceType || 'unknown',
        browser: browser || 'unknown',
        os: os || 'unknown',
        screenWidth: screenWidth || null,
        screenHeight: screenHeight || null,
        pageViews: 1,
      },
    })

    // Update daily metrics
    const today = new Date().toISOString().split('T')[0]
    await prisma.launchMetric.upsert({
      where: { date: today },
      create: {
        date: today,
        pageViews: 1,
      },
      update: {
        pageViews: {
          increment: 1
        },
      },
    })

    return NextResponse.json({
      success: true,
      sessionId: session.sessionId,
    })
  } catch (error) {
    console.error('Session tracking error:', error)
    return NextResponse.json(
      { error: 'Failed to create session' },
      { status: 500 }
    )
  }
}
