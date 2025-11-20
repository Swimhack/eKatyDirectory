import { NextRequest, NextResponse } from 'next/server'
import { requireAdmin } from '@/lib/auth/require-admin'

export const dynamic = 'force-dynamic'
import { createAdminClient } from '@/lib/supabase/admin'

/**
 * GET /api/admin/tiers
 * List all partnership tiers ordered by display_order
 */
export async function GET(request: NextRequest) {
  const authResponse = await requireAdmin(request)
  if (authResponse) return authResponse

  try {
    const { searchParams } = new URL(request.url)
    const includeInactive = searchParams.get('include_inactive') === 'true'

    const supabase = createAdminClient()
    let query = supabase
      .from('partnership_tiers')
      .select('*')
      .order('display_order', { ascending: true })

    if (!includeInactive) {
      query = query.eq('is_active', true)
    }

    const { data, error } = await query

    if (error) {
      console.error('Error fetching partnership tiers:', error)
      return NextResponse.json(
        { error: 'Failed to fetch partnership tiers', details: error.message },
        { status: 500 }
      )
    }

    return NextResponse.json({
      tiers: data || [],
    })
  } catch (error) {
    console.error('Unexpected error in GET /api/admin/tiers:', error)
    return NextResponse.json(
      {
        error: 'Internal server error',
        details: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    )
  }
}

/**
 * POST /api/admin/tiers
 * Create a new partnership tier
 */
export async function POST(request: NextRequest) {
  const authResponse = await requireAdmin(request)
  if (authResponse) return authResponse

  try {
    const body = await request.json()
    const {
      name,
      slug,
      monthly_price,
      features,
      display_order = 0,
      is_active = true,
    } = body

    // Validation
    if (!name || !slug || monthly_price === undefined || !features) {
      return NextResponse.json(
        {
          error: 'Missing required fields',
          details: 'name, slug, monthly_price, and features are required',
        },
        { status: 400 }
      )
    }

    // Validate monthly_price is positive
    if (typeof monthly_price !== 'number' || monthly_price <= 0) {
      return NextResponse.json(
        {
          error: 'Invalid monthly_price',
          details: 'monthly_price must be a positive number',
        },
        { status: 400 }
      )
    }

    // Validate features is an array
    if (!Array.isArray(features)) {
      return NextResponse.json(
        {
          error: 'Invalid features',
          details: 'features must be an array',
        },
        { status: 400 }
      )
    }

    const supabase = createAdminClient()
    const { data, error } = await supabase
      .from('partnership_tiers')
      .insert({
        name,
        slug,
        monthly_price,
        features,
        display_order,
        is_active,
      })
      .select()
      .single()

    if (error) {
      console.error('Error creating partnership tier:', error)
      return NextResponse.json(
        { error: 'Failed to create partnership tier', details: error.message },
        { status: 500 }
      )
    }

    return NextResponse.json({ tier: data }, { status: 201 })
  } catch (error) {
    console.error('Unexpected error in POST /api/admin/tiers:', error)
    return NextResponse.json(
      {
        error: 'Internal server error',
        details: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    )
  }
}
