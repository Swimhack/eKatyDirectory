import { NextRequest, NextResponse } from 'next/server'
import { requireAdmin } from '@/lib/auth/require-admin'
import { createAdminClient, getRevenueMetrics } from '@/lib/supabase/admin'

export async function GET(request: NextRequest) {
  const adminError = await requireAdmin(request)
  if (adminError) {
    return adminError
  }

  try {
    const searchParams = request.nextUrl.searchParams
    const period = searchParams.get('period') || 'month'
    const format = searchParams.get('format') || 'json'

    // Validate period
    if (!['month', 'quarter', 'year'].includes(period)) {
      return NextResponse.json(
        { error: 'Invalid period', details: 'Period must be "month", "quarter", or "year"' },
        { status: 400 }
      )
    }

    const result = await getRevenueMetrics(period as 'month' | 'quarter' | 'year')

    if (result.error || !result.data) {
      return NextResponse.json(
        { error: 'Failed to fetch revenue metrics' },
        { status: 500 }
      )
    }

    // If CSV format is requested
    if (format === 'csv') {
      const csv = generateRevenueCSV(result.data)
      const today = new Date().toISOString().split('T')[0]

      return new NextResponse(csv, {
        status: 200,
        headers: {
          'Content-Type': 'text/csv; charset=utf-8',
          'Content-Disposition': `attachment; filename="revenue-${period}-${today}.csv"`,
        },
      })
    }

    return NextResponse.json(
      {
        data: result.data,
        period,
      },
      { status: 200 }
    )
  } catch (error) {
    console.error('Revenue API error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

/**
 * Generate CSV from revenue metrics
 */
function generateRevenueCSV(data: any): string {
  const rows: string[] = []

  // Header row
  rows.push('Metric,Value')

  // Summary metrics
  rows.push(`Total MRR,$${data.total_mrr.toFixed(2)}`)
  rows.push(`Active Partnerships,${data.active_partnerships}`)
  rows.push(`New Partnerships,${data.new_partnerships}`)
  rows.push(`Churned Partnerships,${data.churned_partnerships}`)

  // Tier breakdown header
  rows.push('')
  rows.push('Tier Breakdown')
  rows.push('Tier ID,Partnership Count,Revenue')

  // Tier data
  for (const [tierId, tierData] of Object.entries(data.partnerships_by_tier)) {
    const tier = tierData as any
    rows.push(
      `${escapeCSVField(tierId)},${tier.count},${tier.revenue.toFixed(2)}`
    )
  }

  return rows.join('\n')
}

/**
 * Escape CSV field values
 */
function escapeCSVField(field: any): string {
  if (field === null || field === undefined) {
    return ''
  }

  const str = String(field)

  // If field contains comma, quote, or newline, wrap in quotes and escape quotes
  if (str.includes(',') || str.includes('"') || str.includes('\n')) {
    return `"${str.replace(/"/g, '""')}"` // Escape quotes by doubling them
  }

  return str
}
