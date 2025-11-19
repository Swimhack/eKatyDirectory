import { NextRequest, NextResponse } from 'next/server'
import { requireAdmin } from '@/lib/auth/require-admin'
import { createAdminClient } from '@/lib/supabase/admin'

/**
 * GET /api/admin/partnerships/[id]
 * Get single partnership detail
 */
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  const authResponse = await requireAdmin(request)
  if (authResponse) return authResponse

  try {
    const { id } = params

    if (!id) {
      return NextResponse.json(
        { error: 'Partnership ID is required' },
        { status: 400 }
      )
    }

    const supabase = createAdminClient()
    const { data: partnership, error } = await supabase
      .from('partnerships')
      .select(
        `
        *,
        tier:partnership_tiers(*),
        restaurant:restaurants(*)
      `
      )
      .eq('id', id)
      .single()

    if (error) {
      console.error('Error fetching partnership details:', error)
      return NextResponse.json(
        { error: 'Failed to fetch partnership details', details: error.message },
        { status: 500 }
      )
    }

    if (!partnership) {
      return NextResponse.json(
        { error: 'Partnership not found' },
        { status: 404 }
      )
    }

    // Format the response
    const formattedPartnership = {
      id: partnership.id,
      restaurant_id: partnership.restaurant_id,
      restaurant_name: partnership.restaurant?.name || 'Unknown',
      restaurant_address: partnership.restaurant?.address || '',
      restaurant_city: partnership.restaurant?.city || '',
      restaurant_cuisine: partnership.restaurant?.cuisine_type || '',
      tier_id: partnership.tier_id,
      tier_name: partnership.tier?.name || 'Unknown',
      tier_description: partnership.tier?.description || '',
      monthly_price: partnership.tier?.monthly_price || 0,
      features: partnership.tier?.features || [],
      status: partnership.status,
      start_date: partnership.start_date,
      renewal_date: partnership.renewal_date,
      billing_cycle: partnership.billing_cycle,
      payment_status: partnership.payment_status,
      last_payment_date: partnership.last_payment_date,
      notes: partnership.notes,
      created_at: partnership.created_at,
      updated_at: partnership.updated_at,
    }

    return NextResponse.json({ partnership: formattedPartnership })
  } catch (error) {
    console.error('Unexpected error in GET /api/admin/partnerships/[id]:', error)
    return NextResponse.json(
      {
        error: 'Internal server error',
        details: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    )
  }
}
