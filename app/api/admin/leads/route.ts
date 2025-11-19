import { NextRequest, NextResponse } from 'next/server'
import { requireAdmin } from '@/lib/auth/require-admin'
import { getRestaurantLeads } from '@/lib/supabase/admin'
import { createAdminClient } from '@/lib/supabase/admin'

/**
 * GET /api/admin/leads
 * List restaurant leads with optional filters
 */
export async function GET(request: NextRequest) {
  const authResponse = await requireAdmin(request)
  if (authResponse) return authResponse

  try {
    const { searchParams } = new URL(request.url)
    const status = searchParams.get('status') || undefined
    const assigned_to = searchParams.get('assigned_to') || undefined
    const limit = searchParams.get('limit')
      ? parseInt(searchParams.get('limit')!)
      : undefined
    const offset = searchParams.get('offset')
      ? parseInt(searchParams.get('offset')!)
      : undefined

    const { data, error, count } = await getRestaurantLeads({
      status,
      assigned_to,
      limit,
      offset,
    })

    if (error) {
      console.error('Error fetching restaurant leads:', error)
      return NextResponse.json(
        { error: 'Failed to fetch restaurant leads', details: error.message },
        { status: 500 }
      )
    }

    return NextResponse.json({
      leads: data || [],
      total: count || 0,
    })
  } catch (error) {
    console.error('Unexpected error in GET /api/admin/leads:', error)
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
 * POST /api/admin/leads
 * Create a new restaurant lead
 */
export async function POST(request: NextRequest) {
  const authResponse = await requireAdmin(request)
  if (authResponse) return authResponse

  try {
    const body = await request.json()
    const {
      business_name,
      contact_name,
      email,
      phone,
      address,
      city,
      cuisine_type,
      status = 'new',
      assigned_to,
      notes,
      source,
    } = body

    // Validation
    if (!business_name || !contact_name || !email || !city) {
      return NextResponse.json(
        {
          error: 'Missing required fields',
          details:
            'business_name, contact_name, email, and city are required',
        },
        { status: 400 }
      )
    }

    const supabase = createAdminClient()
    const { data, error } = await supabase
      .from('restaurant_leads')
      .insert({
        business_name,
        contact_name,
        email,
        phone,
        address,
        city,
        cuisine_type,
        status,
        assigned_to,
        notes,
        source,
      })
      .select()
      .single()

    if (error) {
      console.error('Error creating restaurant lead:', error)
      return NextResponse.json(
        { error: 'Failed to create restaurant lead', details: error.message },
        { status: 500 }
      )
    }

    return NextResponse.json({ lead: data }, { status: 201 })
  } catch (error) {
    console.error('Unexpected error in POST /api/admin/leads:', error)
    return NextResponse.json(
      {
        error: 'Internal server error',
        details: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    )
  }
}
