import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs'
import { cookies } from 'next/headers'

/**
 * Admin-specific database query helpers
 * All functions assume admin authentication has been verified
 */

export function createAdminClient() {
  return createRouteHandlerClient({ cookies })
}

/**
 * Get all partnership tiers
 */
export async function getPartnershipTiers(includeInactive = false) {
  const supabase = createAdminClient()

  let query = supabase
    .from('partnership_tiers')
    .select('*')
    .order('display_order', { ascending: true })

  if (!includeInactive) {
    query = query.eq('is_active', true)
  }

  return await query
}

/**
 * Get restaurant leads with optional filters
 */
export async function getRestaurantLeads(filters?: {
  status?: string
  assigned_to?: string
  limit?: number
  offset?: number
}) {
  const supabase = createAdminClient()

  let query = supabase
    .from('restaurant_leads')
    .select('*', { count: 'exact' })
    .order('created_at', { ascending: false })

  if (filters?.status) {
    query = query.eq('status', filters.status)
  }

  if (filters?.assigned_to) {
    query = query.eq('assigned_to', filters.assigned_to)
  }

  if (filters?.limit) {
    const offset = filters.offset || 0
    query = query.range(offset, offset + filters.limit - 1)
  }

  return await query
}

/**
 * Get outreach campaigns with optional status filter
 */
export async function getOutreachCampaigns(status?: string) {
  const supabase = createAdminClient()

  let query = supabase
    .from('outreach_campaigns')
    .select('*')
    .order('created_at', { ascending: false })

  if (status) {
    query = query.eq('status', status)
  }

  return await query
}

/**
 * Get campaign details with email statistics
 */
export async function getCampaignDetails(campaignId: string) {
  const supabase = createAdminClient()

  const [campaignResult, emailsResult] = await Promise.all([
    supabase
      .from('outreach_campaigns')
      .select('*')
      .eq('id', campaignId)
      .single(),
    supabase
      .from('outreach_emails')
      .select('*')
      .eq('campaign_id', campaignId)
      .order('sent_at', { ascending: false }),
  ])

  return {
    campaign: campaignResult.data,
    emails: emailsResult.data || [],
    error: campaignResult.error || emailsResult.error,
  }
}

/**
 * Get active partnerships with tier and restaurant details
 */
export async function getActivePartnerships() {
  const supabase = createAdminClient()

  return await supabase
    .from('partnerships')
    .select(
      `
      *,
      tier:partnership_tiers(*),
      restaurant:restaurants(*)
    `
    )
    .eq('status', 'active')
    .order('created_at', { ascending: false })
}

/**
 * Get revenue metrics for a time period
 */
export async function getRevenueMetrics(period: 'month' | 'quarter' | 'year') {
  const supabase = createAdminClient()

  const now = new Date()
  let startDate: Date

  switch (period) {
    case 'month':
      startDate = new Date(now.getFullYear(), now.getMonth(), 1)
      break
    case 'quarter':
      const quarterStartMonth = Math.floor(now.getMonth() / 3) * 3
      startDate = new Date(now.getFullYear(), quarterStartMonth, 1)
      break
    case 'year':
      startDate = new Date(now.getFullYear(), 0, 1)
      break
  }

  // Get active partnerships with tier information
  const { data: partnerships, error } = await supabase
    .from('partnerships')
    .select(
      `
      *,
      tier:partnership_tiers(monthly_price)
    `
    )
    .eq('status', 'active')

  if (error || !partnerships) {
    return { data: null, error }
  }

  // Calculate MRR (Monthly Recurring Revenue)
  const totalMRR = partnerships.reduce((sum, p: any) => {
    return sum + (p.tier?.monthly_price || 0)
  }, 0)

  // Get partnerships created in period
  const { count: newPartnerships } = await supabase
    .from('partnerships')
    .select('id', { count: 'exact', head: true })
    .gte('created_at', startDate.toISOString())
    .eq('status', 'active')

  // Get partnerships that ended in period
  const { count: churnedPartnerships } = await supabase
    .from('partnerships')
    .select('id', { count: 'exact', head: true })
    .gte('updated_at', startDate.toISOString())
    .in('status', ['canceled', 'expired'])

  // Group by tier
  const partnershipsByTier = partnerships.reduce((acc: any, p: any) => {
    const tierId = p.tier_id
    if (!acc[tierId]) {
      acc[tierId] = {
        count: 0,
        revenue: 0,
      }
    }
    acc[tierId].count++
    acc[tierId].revenue += p.tier?.monthly_price || 0
    return acc
  }, {})

  return {
    data: {
      period,
      total_mrr: totalMRR,
      active_partnerships: partnerships.length,
      new_partnerships: newPartnerships || 0,
      churned_partnerships: churnedPartnerships || 0,
      partnerships_by_tier: partnershipsByTier,
    },
    error: null,
  }
}

/**
 * Get pending partnership applications
 */
export async function getPendingApplications() {
  const supabase = createAdminClient()

  return await supabase
    .from('partnership_applications')
    .select('*')
    .eq('status', 'pending')
    .order('submitted_at', { ascending: false })
}

/**
 * Get lead details with outreach history
 */
export async function getLeadDetails(leadId: string) {
  const supabase = createAdminClient()

  const [leadResult, emailsResult] = await Promise.all([
    supabase.from('restaurant_leads').select('*').eq('id', leadId).single(),
    supabase
      .from('outreach_emails')
      .select(
        `
        *,
        campaign:outreach_campaigns(name)
      `
      )
      .eq('lead_id', leadId)
      .order('sent_at', { ascending: false }),
  ])

  return {
    lead: leadResult.data,
    emails: emailsResult.data || [],
    error: leadResult.error || emailsResult.error,
  }
}
