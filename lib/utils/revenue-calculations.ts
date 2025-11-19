/**
 * Revenue calculation utilities for MRR, tier aggregation, and trend analysis
 */

export interface Partnership {
  id: string
  tier_id: string
  status: string
  created_at: string
  updated_at: string
  tier?: {
    id: string
    monthly_price: number
    name: string
  }
}

export interface TierBreakdown {
  [tierId: string]: {
    count: number
    revenue: number
  }
}

export interface RevenueTrend {
  date: string
  mrr: number
  active_partnerships: number
}

/**
 * Calculate Monthly Recurring Revenue (MRR) from active partnerships
 * MRR is the sum of monthly prices from all active partnerships
 *
 * @param partnerships - Array of partnership objects
 * @returns Total MRR amount
 */
export function calculateMRR(partnerships: Partnership[]): number {
  if (!partnerships || partnerships.length === 0) {
    return 0
  }

  return partnerships.reduce((sum, partnership) => {
    const monthlyPrice = partnership.tier?.monthly_price || 0
    return sum + Math.max(0, monthlyPrice) // Ensure we don't add negative values
  }, 0)
}

/**
 * Aggregate partnerships by tier with count and revenue totals
 *
 * @param partnerships - Array of partnership objects
 * @returns Object with tier IDs as keys and aggregated data
 */
export function aggregateByTier(partnerships: Partnership[]): TierBreakdown {
  if (!partnerships || partnerships.length === 0) {
    return {}
  }

  return partnerships.reduce((acc, partnership) => {
    const tierId = partnership.tier_id

    if (!acc[tierId]) {
      acc[tierId] = {
        count: 0,
        revenue: 0,
      }
    }

    acc[tierId].count++
    const monthlyPrice = partnership.tier?.monthly_price || 0
    acc[tierId].revenue += Math.max(0, monthlyPrice)

    return acc
  }, {} as TierBreakdown)
}

/**
 * Generate 6-month revenue trend data
 *
 * @param partnerships - Array of partnership objects
 * @returns Array of trend data points, newest first
 */
export function calculateRevenueTrend(
  partnerships: Partnership[]
): RevenueTrend[] {
  const trend: RevenueTrend[] = []

  // Generate 6 months of data going backward from today
  for (let i = 5; i >= 0; i--) {
    const date = new Date()
    date.setMonth(date.getMonth() - i)
    date.setDate(1)

    const dateStr = date.toISOString().split('T')[0]

    // Count partnerships that were active in this month
    const activeInMonth = partnerships.filter((p) => {
      const createdDate = new Date(p.created_at)
      const updatedDate = new Date(p.updated_at)

      // Check if partnership was created on or before this month
      // and is still active (no updated_at in future) or was active during month
      return (
        createdDate <= date &&
        (p.status === 'active' || updatedDate >= date)
      )
    })

    const mrr = calculateMRR(activeInMonth)

    trend.push({
      date: dateStr,
      mrr,
      active_partnerships: activeInMonth.length,
    })
  }

  return trend
}

/**
 * Validate partnership data and filter invalid entries
 *
 * @param partnerships - Array of partnership objects
 * @returns Cleaned array with valid partnerships only
 */
export function validatePartnershipData(
  partnerships: Partnership[]
): Partnership[] {
  if (!partnerships || !Array.isArray(partnerships)) {
    return []
  }

  return partnerships.filter((p) => {
    // Check required fields
    if (!p.id || !p.tier_id || !p.status) {
      return false
    }

    // Check tier pricing is valid if present
    if (p.tier && typeof p.tier.monthly_price !== 'number') {
      return false
    }

    // Ensure monthly_price is non-negative
    if (p.tier && p.tier.monthly_price < 0) {
      return false
    }

    return true
  })
}

/**
 * Get partnership statistics for a given period
 *
 * @param partnerships - Array of partnership objects
 * @param startDate - Start date for period
 * @param endDate - End date for period
 * @returns Statistics object with new and churned counts
 */
export function getPartnershipStats(
  partnerships: Partnership[],
  startDate: Date,
  endDate: Date
): { newCount: number; churnedCount: number } {
  if (!partnerships || partnerships.length === 0) {
    return { newCount: 0, churnedCount: 0 }
  }

  let newCount = 0
  let churnedCount = 0

  partnerships.forEach((p) => {
    const createdDate = new Date(p.created_at)
    const updatedDate = new Date(p.updated_at)

    // Count new partnerships created in period
    if (createdDate >= startDate && createdDate <= endDate) {
      newCount++
    }

    // Count churned partnerships (canceled/expired) in period
    if (
      updatedDate >= startDate &&
      updatedDate <= endDate &&
      ['canceled', 'expired'].includes(p.status)
    ) {
      churnedCount++
    }
  })

  return { newCount, churnedCount }
}
