import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export const dynamic = 'force-dynamic'

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()

    const {
      sessionId,
      eventType,
      eventCategory,
      eventAction,
      eventLabel,
      eventValue,
      page,
      referrer,
      restaurantId,
      deviceType,
      browser,
      os,
      screenWidth,
      screenHeight,
      metadata,
    } = body

    if (!sessionId || !eventType || !eventCategory || !eventAction) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      )
    }

    // Create analytics event
    const event = await prisma.analyticsEvent.create({
      data: {
        sessionId,
        eventType,
        eventCategory,
        eventAction,
        eventLabel: eventLabel || null,
        eventValue: eventValue || null,
        page: page || null,
        referrer: referrer || null,
        restaurantId: restaurantId || null,
        deviceType: deviceType || null,
        browser: browser || null,
        os: os || null,
        screenWidth: screenWidth || null,
        screenHeight: screenHeight || null,
        metadata: metadata || null,
      },
    })

    // Update session event count
    await prisma.userSession.updateMany({
      where: { sessionId },
      data: {
        events: {
          increment: 1
        },
        endTime: new Date(),
      },
    })

    // Track page views in session
    if (eventType === 'page_view') {
      await prisma.userSession.updateMany({
        where: { sessionId },
        data: {
          pageViews: {
            increment: 1
          },
          exitPage: page,
        },
      })
    }

    // Track conversions
    if (eventCategory === 'conversion' && eventAction.includes('success')) {
      await prisma.userSession.updateMany({
        where: { sessionId },
        data: {
          converted: true,
          conversionType: eventType,
        },
      })
    }

    // Update restaurant analytics if restaurant-related
    if (restaurantId && eventType === 'restaurant_interaction') {
      const today = new Date().toISOString().split('T')[0]

      let incrementField: any = {}
      if (eventAction === 'view') incrementField = { profileViews: 1 }
      else if (eventAction === 'map_click') incrementField = { mapClicks: 1 }
      else if (eventAction === 'roulette_spin') incrementField = { rouletteSpins: 1 }
      else if (eventAction === 'roulette_win') incrementField = { rouletteWins: 1 }
      else if (eventAction === 'favorite_add') incrementField = { favoritesAdded: 1 }
      else if (eventAction === 'favorite_remove') incrementField = { favoritesRemoved: 1 }
      else if (eventAction === 'share') incrementField = { shareClicks: 1 }
      else if (eventAction === 'phone_click') incrementField = { phoneClicks: 1 }
      else if (eventAction === 'website_click') incrementField = { websiteClicks: 1 }
      else if (eventAction === 'directions_click') incrementField = { directionsClicks: 1 }

      if (Object.keys(incrementField).length > 0) {
        await prisma.restaurantAnalytics.upsert({
          where: {
            restaurantId_date: {
              restaurantId,
              date: today,
            },
          },
          create: {
            restaurantId,
            date: today,
            ...Object.fromEntries(
              Object.entries(incrementField).map(([k, v]) => [k, v as number])
            ),
          },
          update: Object.fromEntries(
            Object.entries(incrementField).map(([k]) => [k, { increment: 1 }])
          ),
        })
      }
    }

    // Update daily launch metrics
    if (eventCategory === 'launch') {
      const today = new Date().toISOString().split('T')[0]

      let incrementField: any = {}
      if (eventAction === 'giveaway_entry') incrementField = { giveawayEntries: 1 }
      else if (eventAction === 'coupon_generated') incrementField = { couponsGenerated: 1 }
      else if (eventAction === 'coupon_redeemed') incrementField = { couponsRedeemed: 1 }
      else if (eventAction === 'flyer_download') incrementField = { flyersDownloaded: 1 }
      else if (eventAction === 'social_share') incrementField = { socialShares: 1 }

      if (Object.keys(incrementField).length > 0) {
        await prisma.launchMetric.upsert({
          where: { date: today },
          create: {
            date: today,
            ...Object.fromEntries(
              Object.entries(incrementField).map(([k, v]) => [k, v as number])
            ),
          },
          update: Object.fromEntries(
            Object.entries(incrementField).map(([k]) => [k, { increment: 1 }])
          ),
        })
      }
    }

    return NextResponse.json({ success: true, eventId: event.id })
  } catch (error) {
    console.error('Analytics tracking error:', error)
    return NextResponse.json(
      { error: 'Failed to track event' },
      { status: 500 }
    )
  }
}
