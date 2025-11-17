import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { getCurrentUser } from '@/lib/auth'

export const dynamic = 'force-dynamic'

export async function GET(request: NextRequest) {
  try {
    const user = await getCurrentUser()

    if (!user || user.role !== 'ADMIN') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const url = new URL(request.url)
    const view = url.searchParams.get('view') || 'overview'
    const days = parseInt(url.searchParams.get('days') || '7')

    const startDate = new Date()
    startDate.setDate(startDate.getDate() - days)

    switch (view) {
      case 'overview':
        return await getOverview(days)

      case 'launch':
        return await getLaunchMetrics(days)

      case 'restaurants':
        return await getRestaurantAnalytics(days)

      case 'sessions':
        return await getSessionAnalytics(startDate)

      case 'funnels':
        return await getFunnelAnalytics(days)

      case 'performance':
        return await getPerformanceMetrics(days)

      default:
        return NextResponse.json({ error: 'Invalid view' }, { status: 400 })
    }
  } catch (error) {
    console.error('Analytics API error:', error)
    return NextResponse.json(
      { error: 'Failed to fetch analytics' },
      { status: 500 }
    )
  }
}

async function getOverview(days: number) {
  const startDate = new Date()
  startDate.setDate(startDate.getDate() - days)
  const dateStr = startDate.toISOString().split('T')[0]

  // Get daily metrics
  const dailyMetrics = await prisma.launchMetric.findMany({
    where: {
      date: { gte: dateStr },
    },
    orderBy: { date: 'asc' },
  })

  // Get session stats
  const sessions = await prisma.userSession.findMany({
    where: {
      startTime: { gte: startDate },
    },
  })

  // Get event counts
  const events = await prisma.analyticsEvent.groupBy({
    by: ['eventCategory'],
    where: {
      timestamp: { gte: startDate },
    },
    _count: true,
  })

  // Get top restaurants
  const topRestaurants = await prisma.restaurantAnalytics.findMany({
    where: {
      date: { gte: dateStr },
    },
    orderBy: {
      profileViews: 'desc',
    },
    take: 10,
  })

  return NextResponse.json({
    success: true,
    data: {
      dailyMetrics,
      sessionStats: {
        total: sessions.length,
        converted: sessions.filter(s => s.converted).length,
        avgDuration: sessions.reduce((acc, s) => acc + (s.duration || 0), 0) / sessions.length || 0,
        deviceBreakdown: sessions.reduce((acc: any, s) => {
          acc[s.deviceType] = (acc[s.deviceType] || 0) + 1
          return acc
        }, {}),
      },
      eventsByCategory: events,
      topRestaurants,
    },
  })
}

async function getLaunchMetrics(days: number) {
  const startDate = new Date()
  startDate.setDate(startDate.getDate() - days)
  const dateStr = startDate.toISOString().split('T')[0]

  const metrics = await prisma.launchMetric.findMany({
    where: {
      date: { gte: dateStr },
    },
    orderBy: { date: 'asc' },
  })

  // Get giveaway entries
  const giveawayEntries = await prisma.launchGiveawayEntry.findMany({
    where: {
      createdAt: { gte: startDate },
    },
    orderBy: { createdAt: 'desc' },
  })

  // Get coupon stats
  const coupons = await prisma.launchCoupon.findMany({
    include: {
      redemptions: {
        where: {
          redemptionDate: { gte: startDate },
        },
      },
    },
  })

  // Get flyer downloads
  const flyerDownloads = await prisma.flyerDownload.groupBy({
    by: ['flyerType'],
    where: {
      createdAt: { gte: startDate },
    },
    _count: true,
  })

  return NextResponse.json({
    success: true,
    data: {
      metrics,
      giveawayEntries,
      coupons,
      flyerDownloads,
    },
  })
}

async function getRestaurantAnalytics(days: number) {
  const startDate = new Date()
  startDate.setDate(startDate.getDate() - days)
  const dateStr = startDate.toISOString().split('T')[0]

  const analytics = await prisma.restaurantAnalytics.findMany({
    where: {
      date: { gte: dateStr },
    },
    orderBy: [
      { date: 'desc' },
      { profileViews: 'desc' },
    ],
  })

  // Aggregate by restaurant
  const byRestaurant = analytics.reduce((acc: any, a) => {
    if (!acc[a.restaurantId]) {
      acc[a.restaurantId] = {
        restaurantId: a.restaurantId,
        totalViews: 0,
        totalClicks: 0,
        totalSpins: 0,
        totalFavorites: 0,
      }
    }
    acc[a.restaurantId].totalViews += a.profileViews
    acc[a.restaurantId].totalClicks += a.websiteClicks + a.phoneClicks + a.directionsClicks
    acc[a.restaurantId].totalSpins += a.rouletteSpins
    acc[a.restaurantId].totalFavorites += a.favoritesAdded
    return acc
  }, {})

  return NextResponse.json({
    success: true,
    data: {
      analytics,
      byRestaurant: Object.values(byRestaurant),
    },
  })
}

async function getSessionAnalytics(startDate: Date) {
  const sessions = await prisma.userSession.findMany({
    where: {
      startTime: { gte: startDate },
    },
    orderBy: { startTime: 'desc' },
    take: 100,
  })

  // Calculate session duration
  const sessionsWithDuration = sessions.map(s => {
    if (s.endTime && s.startTime) {
      const duration = Math.floor((s.endTime.getTime() - s.startTime.getTime()) / 1000)
      return { ...s, calculatedDuration: duration }
    }
    return s
  })

  // Aggregate stats
  const stats = {
    totalSessions: sessions.length,
    bounceRate: (sessions.filter(s => s.bounced).length / sessions.length) * 100,
    conversionRate: (sessions.filter(s => s.converted).length / sessions.length) * 100,
    avgPageViews: sessions.reduce((acc, s) => acc + s.pageViews, 0) / sessions.length,
    deviceBreakdown: sessions.reduce((acc: any, s) => {
      acc[s.deviceType] = (acc[s.deviceType] || 0) + 1
      return acc
    }, {}),
    referrerBreakdown: sessions.reduce((acc: any, s) => {
      const ref = s.referrerDomain || 'direct'
      acc[ref] = (acc[ref] || 0) + 1
      return acc
    }, {}),
  }

  return NextResponse.json({
    success: true,
    data: {
      sessions: sessionsWithDuration,
      stats,
    },
  })
}

async function getFunnelAnalytics(days: number) {
  const startDate = new Date()
  startDate.setDate(startDate.getDate() - days)

  const funnels = await prisma.conversionFunnel.findMany({
    where: {
      createdAt: { gte: startDate },
    },
    orderBy: { createdAt: 'desc' },
  })

  // Aggregate by funnel type
  const byType = funnels.reduce((acc: any, f) => {
    if (!acc[f.funnelType]) {
      acc[f.funnelType] = {
        type: f.funnelType,
        total: 0,
        completed: 0,
        abandoned: 0,
        step1: 0,
        step2: 0,
        step3: 0,
        step4: 0,
      }
    }
    acc[f.funnelType].total++
    if (f.completed) acc[f.funnelType].completed++
    if (f.abandoned) acc[f.funnelType].abandoned++
    if (f.step1Time) acc[f.funnelType].step1++
    if (f.step2Time) acc[f.funnelType].step2++
    if (f.step3Time) acc[f.funnelType].step3++
    if (f.step4Time) acc[f.funnelType].step4++
    return acc
  }, {})

  return NextResponse.json({
    success: true,
    data: {
      funnels,
      byType: Object.values(byType),
    },
  })
}

async function getPerformanceMetrics(days: number) {
  const startDate = new Date()
  startDate.setDate(startDate.getDate() - days)

  const metrics = await prisma.pagePerformance.findMany({
    where: {
      timestamp: { gte: startDate },
    },
    orderBy: { timestamp: 'desc' },
  })

  // Aggregate by page
  const byPage = metrics.reduce((acc: any, m) => {
    if (!acc[m.page]) {
      acc[m.page] = {
        page: m.page,
        samples: 0,
        avgLCP: 0,
        avgFCP: 0,
        avgTTFB: 0,
        avgCLS: 0,
      }
    }
    acc[m.page].samples++
    if (m.lcp) acc[m.page].avgLCP += m.lcp
    if (m.fcp) acc[m.page].avgFCP += m.fcp
    if (m.ttfb) acc[m.page].avgTTFB += m.ttfb
    if (m.cls) acc[m.page].avgCLS += m.cls
    return acc
  }, {})

  // Calculate averages
  Object.values(byPage).forEach((page: any) => {
    page.avgLCP = page.avgLCP / page.samples
    page.avgFCP = page.avgFCP / page.samples
    page.avgTTFB = page.avgTTFB / page.samples
    page.avgCLS = page.avgCLS / page.samples
  })

  return NextResponse.json({
    success: true,
    data: {
      metrics,
      byPage: Object.values(byPage),
    },
  })
}
