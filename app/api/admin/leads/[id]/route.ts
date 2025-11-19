import { NextRequest, NextResponse } from 'next/server'
import { requireAdmin } from '@/lib/auth/require-admin'
import { getLeadDetails } from '@/lib/supabase/admin'
import { createAdminClient } from '@/lib/supabase/admin'

/**
 * GET /api/admin/leads/[id]
 * Get lead details with outreach history
 */
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  const authResponse = await requireAdmin(request)
  if (authResponse) return authResponse

  try {
    const { id } = params

    const { lead, emails, error } = await getLeadDetails(id)

    if (error) {
      console.error('Error fetching lead details:', error)
      return NextResponse.json(
        { error: 'Failed to fetch lead details', details: error.message },
        { status: 500 }
      )
    }

    if (!lead) {
      return NextResponse.json({ error: 'Lead not found' }, { status: 404 })
    }

    return NextResponse.json({
      lead,
      emails,
    })
  } catch (error) {
    console.error('Unexpected error in GET /api/admin/leads/[id]:', error)
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
 * PATCH /api/admin/leads/[id]
 * Update a restaurant lead
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

    const {
      business_name,
      contact_name,
      email,
      phone,
      address,
      city,
      cuisine_type,
      status,
      assigned_to,
      last_contacted_at,
      notes,
      source,
    } = body

    const supabase = createAdminClient()

    // Build update object with only provided fields
    const updateData: any = {}
    if (business_name !== undefined) updateData.business_name = business_name
    if (contact_name !== undefined) updateData.contact_name = contact_name
    if (email !== undefined) updateData.email = email
    if (phone !== undefined) updateData.phone = phone
    if (address !== undefined) updateData.address = address
    if (city !== undefined) updateData.city = city
    if (cuisine_type !== undefined) updateData.cuisine_type = cuisine_type
    if (status !== undefined) updateData.status = status
    if (assigned_to !== undefined) updateData.assigned_to = assigned_to
    if (last_contacted_at !== undefined)
      updateData.last_contacted_at = last_contacted_at
    if (notes !== undefined) updateData.notes = notes
    if (source !== undefined) updateData.source = source

    const { data, error } = await supabase
      .from('restaurant_leads')
      .update(updateData)
      .eq('id', id)
      .select()
      .single()

    if (error) {
      console.error('Error updating restaurant lead:', error)
      return NextResponse.json(
        { error: 'Failed to update restaurant lead', details: error.message },
        { status: 500 }
      )
    }

    if (!data) {
      return NextResponse.json({ error: 'Lead not found' }, { status: 404 })
    }

    return NextResponse.json({ lead: data })
  } catch (error) {
    console.error('Unexpected error in PATCH /api/admin/leads/[id]:', error)
    return NextResponse.json(
      {
        error: 'Internal server error',
        details: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    )
  }
}
