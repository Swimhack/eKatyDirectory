import { NextRequest, NextResponse } from 'next/server'
import { requireAdmin } from '@/lib/auth/require-admin'
import { getActivePartnerships } from '@/lib/supabase/admin'

/**
 * GET /api/admin/partnerships
 * List active partnerships with tier and restaurant details
 */
export async function GET(request: NextRequest) {
  const authResponse = await requireAdmin(request)
  if (authResponse) return authResponse

  try {
    const { data, error } = await getActivePartnerships()

    if (error) {
      console.error('Error fetching partnerships:', error)
      return NextResponse.json(
        { error: 'Failed to fetch partnerships', details: error.message },
        { status: 500 }
      )
    }

    // Transform data to include flattened tier and restaurant details
    const partnerships = (data || []).map((partnership: any) => ({
      id: partnership.id,
      restaurant_id: partnership.restaurant_id,
      restaurant_name: partnership.restaurant?.name || 'Unknown',
      tier_id: partnership.tier_id,
      tier_name: partnership.tier?.name || 'Unknown',
      monthly_price: partnership.tier?.monthly_price || 0,
      status: partnership.status,
      start_date: partnership.start_date,
      renewal_date: partnership.renewal_date,
      billing_cycle: partnership.billing_cycle,
      payment_status: partnership.payment_status,
      last_payment_date: partnership.last_payment_date,
      created_at: partnership.created_at,
      updated_at: partnership.updated_at,
    }))

    return NextResponse.json({
      partnerships,
      total: partnerships.length,
    })
  } catch (error) {
    console.error('Unexpected error in GET /api/admin/partnerships:', error)
    return NextResponse.json(
      {
        error: 'Internal server error',
        details: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    )
  }
}
