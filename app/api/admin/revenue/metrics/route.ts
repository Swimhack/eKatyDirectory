import { NextRequest, NextResponse } from 'next/server'
import { requireAdmin } from '@/lib/auth/require-admin'
import { getRevenueMetrics, createAdminClient } from '@/lib/supabase/admin'

export const dynamic = 'force-dynamic'

async function calculateMRRTrend() {
  const supabase = createAdminClient()
  const now = new Date()
  const trends = []

  // Calculate MRR for each of the last 6 months
  for (let i = 5; i >= 0; i--) {
    const targetDate = new Date(now.getFullYear(), now.getMonth() - i, 1)
    const nextMonth = new Date(now.getFullYear(), now.getMonth() - i + 1, 1)

    // Get partnerships that were active during this month
    const { data: partnerships, error } = await supabase
      .from('partnerships')
      .select(
        `
        *,
        tier:partnership_tiers(monthly_price)
      `
      )
      .lte('start_date', nextMonth.toISOString().split('T')[0])
      .or(
        `renewal_date.gte.${targetDate.toISOString().split('T')[0]},status.eq.active`
      )

    if (error) {
      console.error('Error calculating MRR trend:', error)
      continue
    }

    // Filter partnerships that were actually active in this month
    const activePartnerships = (partnerships || []).filter((p: any) => {
      const startDate = new Date(p.start_date)
      const renewalDate = new Date(p.renewal_date)

      // Partnership started before or during this month AND
      // (is still active OR renewal date is after this month)
      return (
        startDate <= nextMonth &&
        (p.status === 'active' || renewalDate >= targetDate)
      )
    })

    // Calculate MRR for this month
    const monthlyMRR = activePartnerships.reduce((sum: number, p: any) => {
      return sum + (p.tier?.monthly_price || 0)
    }, 0)

    trends.push({
      month: targetDate.toISOString().split('T')[0].substring(0, 7), // YYYY-MM format
      mrr: monthlyMRR,
      partnership_count: activePartnerships.length,
    })
  }

  return trends
}

/**
 * GET /api/admin/revenue/metrics
 * Get revenue metrics with optional period filter
 */
export async function GET(request: NextRequest) {
  const authResponse = await requireAdmin(request)
  if (authResponse) return authResponse

  try {
    const { searchParams } = new URL(request.url)
    const period = (searchParams.get('period') as 'month' | 'quarter' | 'year') || 'month'

    // Validate period
    if (!['month', 'quarter', 'year'].includes(period)) {
      return NextResponse.json(
        { error: 'Invalid period. Must be: month, quarter, or year' },
        { status: 400 }
      )
    }

    // Get revenue metrics for the period
    const { data: metrics, error } = await getRevenueMetrics(period)

    if (error || !metrics) {
      console.error('Error fetching revenue metrics:', error)
      return NextResponse.json(
        { error: 'Failed to fetch revenue metrics', details: error?.message },
        { status: 500 }
      )
    }

    // Calculate MRR trend for last 6 months
    const mrrTrend = await calculateMRRTrend()

    return NextResponse.json({
      period: metrics.period,
      total_mrr: metrics.total_mrr,
      active_partnerships: metrics.active_partnerships,
      new_partnerships: metrics.new_partnerships,
      churned_partnerships: metrics.churned_partnerships,
      partnerships_by_tier: metrics.partnerships_by_tier,
      mrr_trend: mrrTrend,
    })
  } catch (error) {
    console.error('Unexpected error in GET /api/admin/revenue/metrics:', error)
    return NextResponse.json(
      {
        error: 'Internal server error',
        details: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    )
  }
}
