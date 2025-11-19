import { NextRequest, NextResponse } from 'next/server'
import { requireAdmin } from '@/lib/auth/require-admin'
import { createAdminClient } from '@/lib/supabase/admin'

/**
 * GET /api/admin/tiers/[id]
 * Get a single partnership tier by ID
 */
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  const authResponse = await requireAdmin(request)
  if (authResponse) return authResponse

  try {
    const { id } = params

    const supabase = createAdminClient()
    const { data, error } = await supabase
      .from('partnership_tiers')
      .select('*')
      .eq('id', id)
      .single()

    if (error) {
      console.error('Error fetching partnership tier:', error)
      return NextResponse.json(
        { error: 'Failed to fetch partnership tier', details: error.message },
        { status: error.code === 'PGRST116' ? 404 : 500 }
      )
    }

    if (!data) {
      return NextResponse.json(
        { error: 'Partnership tier not found' },
        { status: 404 }
      )
    }

    return NextResponse.json({ tier: data })
  } catch (error) {
    console.error('Unexpected error in GET /api/admin/tiers/[id]:', error)
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
 * PATCH /api/admin/tiers/[id]
 * Update a partnership tier
 */
export async function PATCH(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  const authResponse = await requireAdmin(request)
  if (authResponse) return authResponse

  try {
    const { id } = params
    const body = await request.json()
    const { name, slug, monthly_price, features, display_order, is_active } =
      body

    // Build update object with only provided fields
    const updates: any = {}
    if (name !== undefined) updates.name = name
    if (slug !== undefined) updates.slug = slug
    if (monthly_price !== undefined) {
      // Validate monthly_price if provided
      if (typeof monthly_price !== 'number' || monthly_price <= 0) {
        return NextResponse.json(
          {
            error: 'Invalid monthly_price',
            details: 'monthly_price must be a positive number',
          },
          { status: 400 }
        )
      }
      updates.monthly_price = monthly_price
    }
    if (features !== undefined) {
      // Validate features if provided
      if (!Array.isArray(features)) {
        return NextResponse.json(
          {
            error: 'Invalid features',
            details: 'features must be an array',
          },
          { status: 400 }
        )
      }
      updates.features = features
    }
    if (display_order !== undefined) updates.display_order = display_order
    if (is_active !== undefined) updates.is_active = is_active

    // Set updated_at timestamp
    updates.updated_at = new Date().toISOString()

    if (Object.keys(updates).length === 1) {
      // Only updated_at was set
      return NextResponse.json(
        {
          error: 'No fields to update',
          details: 'At least one field must be provided',
        },
        { status: 400 }
      )
    }

    const supabase = createAdminClient()
    const { data, error } = await supabase
      .from('partnership_tiers')
      .update(updates)
      .eq('id', id)
      .select()
      .single()

    if (error) {
      console.error('Error updating partnership tier:', error)
      return NextResponse.json(
        { error: 'Failed to update partnership tier', details: error.message },
        { status: error.code === 'PGRST116' ? 404 : 500 }
      )
    }

    if (!data) {
      return NextResponse.json(
        { error: 'Partnership tier not found' },
        { status: 404 }
      )
    }

    return NextResponse.json({ tier: data })
  } catch (error) {
    console.error('Unexpected error in PATCH /api/admin/tiers/[id]:', error)
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
 * DELETE /api/admin/tiers/[id]
 * Soft delete a partnership tier (set is_active = false)
 */
export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  const authResponse = await requireAdmin(request)
  if (authResponse) return authResponse

  try {
    const { id } = params

    const supabase = createAdminClient()
    const { data, error } = await supabase
      .from('partnership_tiers')
      .update({
        is_active: false,
        updated_at: new Date().toISOString(),
      })
      .eq('id', id)
      .select()
      .single()

    if (error) {
      console.error('Error deleting partnership tier:', error)
      return NextResponse.json(
        { error: 'Failed to delete partnership tier', details: error.message },
        { status: error.code === 'PGRST116' ? 404 : 500 }
      )
    }

    if (!data) {
      return NextResponse.json(
        { error: 'Partnership tier not found' },
        { status: 404 }
      )
    }

    return NextResponse.json({
      message: 'Partnership tier deactivated successfully',
      tier: data,
    })
  } catch (error) {
    console.error('Unexpected error in DELETE /api/admin/tiers/[id]:', error)
    return NextResponse.json(
      {
        error: 'Internal server error',
        details: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    )
  }
}
