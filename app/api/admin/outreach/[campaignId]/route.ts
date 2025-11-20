import { NextRequest, NextResponse } from 'next/server'
import { requireAdmin } from '@/lib/auth/require-admin'

export const dynamic = 'force-dynamic'
import { getCampaignDetails } from '@/lib/supabase/admin'
import { createAdminClient } from '@/lib/supabase/admin'

/**
 * GET /api/admin/outreach/[campaignId]
 * Get campaign details with email statistics
 */
export async function GET(
  request: NextRequest,
  { params }: { params: { campaignId: string } }
) {
  const authResponse = await requireAdmin(request)
  if (authResponse) return authResponse

  try {
    const { campaignId } = params

    const { campaign, emails, error } = await getCampaignDetails(campaignId)

    if (error) {
      console.error('Error fetching campaign details:', error)
      return NextResponse.json(
        { error: 'Failed to fetch campaign details', details: error.message },
        { status: 500 }
      )
    }

    if (!campaign) {
      return NextResponse.json(
        { error: 'Campaign not found' },
        { status: 404 }
      )
    }

    return NextResponse.json({
      campaign,
      emails,
    })
  } catch (error) {
    console.error('Unexpected error in GET /api/admin/outreach/[campaignId]:', error)
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
 * PATCH /api/admin/outreach/[campaignId]
 * Update an outreach campaign
 */
export async function PATCH(
  request: NextRequest,
  { params }: { params: { campaignId: string } }
) {
  const authResponse = await requireAdmin(request)
  if (authResponse) return authResponse

  try {
    const { campaignId } = params
    const body = await request.json()

    const {
      name,
      subject_template,
      body_template,
      target_list,
      tier_showcase,
      status,
      scheduled_for,
    } = body

    const supabase = createAdminClient()

    // Build update object with only provided fields
    const updateData: any = {}
    if (name !== undefined) updateData.name = name
    if (subject_template !== undefined)
      updateData.subject_template = subject_template
    if (body_template !== undefined) updateData.body_template = body_template
    if (target_list !== undefined) updateData.target_list = target_list
    if (tier_showcase !== undefined) updateData.tier_showcase = tier_showcase
    if (status !== undefined) updateData.status = status
    if (scheduled_for !== undefined) updateData.scheduled_for = scheduled_for

    const { data, error } = await supabase
      .from('outreach_campaigns')
      .update(updateData)
      .eq('id', campaignId)
      .select()
      .single()

    if (error) {
      console.error('Error updating outreach campaign:', error)
      return NextResponse.json(
        {
          error: 'Failed to update outreach campaign',
          details: error.message,
        },
        { status: 500 }
      )
    }

    if (!data) {
      return NextResponse.json(
        { error: 'Campaign not found' },
        { status: 404 }
      )
    }

    return NextResponse.json({ campaign: data })
  } catch (error) {
    console.error('Unexpected error in PATCH /api/admin/outreach/[campaignId]:', error)
    return NextResponse.json(
      {
        error: 'Internal server error',
        details: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    )
  }
}
