import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { getServerSession } from 'next-auth'

export async function GET(request: NextRequest) {
  try {
    // Check if user is admin
    const session = await getServerSession()
    if (!session?.user || !['ADMIN', 'EDITOR'].includes((session.user as any).role)) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { searchParams } = new URL(request.url)
    const statusFilter = searchParams.get('status') || 'all'

    // Build where clause
    const where: any = {}
    if (statusFilter !== 'all') {
      where.status = statusFilter
    }

    // Fetch subscriptions with user data
    const subscriptions = await prisma.subscription.findMany({
      where,
      include: {
        user: {
          select: {
            id: true,
            email: true,
            name: true
          }
        }
      },
      orderBy: {
        createdAt: 'desc'
      }
    })

    // Calculate statistics
    const stats = await calculateStats()

    return NextResponse.json({
      subscriptions,
      stats
    })
  } catch (error) {
    console.error('Error fetching subscriptions:', error)
    return NextResponse.json(
      { error: 'Failed to fetch subscriptions' },
      { status: 500 }
    )
  }
}

async function calculateStats() {
  // Total subscriptions
  const totalSubscriptions = await prisma.subscription.count()

  // Active subscriptions
  const activeSubscriptions = await prisma.subscription.count({
    where: { status: 'active' }
  })

  // Canceled subscriptions
  const canceledSubscriptions = await prisma.subscription.count({
    where: { status: 'canceled' }
  })

  // Past due subscriptions
  const pastDueSubscriptions = await prisma.subscription.count({
    where: { status: 'past_due' }
  })

  // Subscriptions by tier
  const tierCounts = await prisma.user.groupBy({
    by: ['subscriptionTier'],
    _count: true,
    where: {
      subscriptionStatus: 'active'
    }
  })

  const byTier = {
    FREE: 0,
    BASIC: 0,
    PRO: 0,
    PREMIUM: 0
  }

  tierCounts.forEach((tier: any) => {
    byTier[tier.subscriptionTier as keyof typeof byTier] = tier._count
  })

  // Calculate MRR (Monthly Recurring Revenue)
  const tierPricing: Record<string, number> = {
    FREE: 0,
    BASIC: 49,
    PRO: 99,
    PREMIUM: 199
  }

  let mrr = 0
  tierCounts.forEach((tier: any) => {
    const tierName = tier.subscriptionTier
    const pricing = tierPricing[tierName] || 0
    mrr += pricing * tier._count
  })

  return {
    totalSubscriptions,
    activeSubscriptions,
    canceledSubscriptions,
    pastDueSubscriptions,
    mrr,
    byTier
  }
}
