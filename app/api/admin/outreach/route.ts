import { NextRequest, NextResponse } from 'next/server'
import { requireAdmin } from '@/lib/auth/require-admin'
import { getOutreachCampaigns } from '@/lib/supabase/admin'
import { createAdminClient } from '@/lib/supabase/admin'

/**
 * GET /api/admin/outreach
 * List outreach campaigns with optional status filter
 */
export async function GET(request: NextRequest) {
  const authResponse = await requireAdmin(request)
  if (authResponse) return authResponse

  try {
    const { searchParams } = new URL(request.url)
    const status = searchParams.get('status') || undefined

    const { data, error } = await getOutreachCampaigns(status)

    if (error) {
      console.error('Error fetching outreach campaigns:', error)
      return NextResponse.json(
        {
          error: 'Failed to fetch outreach campaigns',
          details: error.message,
        },
        { status: 500 }
      )
    }

    return NextResponse.json({
      campaigns: data || [],
    })
  } catch (error) {
    console.error('Unexpected error in GET /api/admin/outreach:', error)
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
 * POST /api/admin/outreach
 * Create a new outreach campaign
 */
export async function POST(request: NextRequest) {
  const authResponse = await requireAdmin(request)
  if (authResponse) return authResponse

  try {
    const body = await request.json()
    const {
      name,
      subject_template,
      body_template,
      target_list,
      tier_showcase,
      status = 'draft',
      scheduled_for,
    } = body

    // Validation
    if (!name || !subject_template || !body_template) {
      return NextResponse.json(
        {
          error: 'Missing required fields',
          details: 'name, subject_template, and body_template are required',
        },
        { status: 400 }
      )
    }

    // Get the current user session for created_by
    const supabase = createAdminClient()
    const {
      data: { session },
    } = await supabase.auth.getSession()

    if (!session?.user?.id) {
      return NextResponse.json(
        { error: 'Unauthorized - session required' },
        { status: 401 }
      )
    }

    const { data, error } = await supabase
      .from('outreach_campaigns')
      .insert({
        name,
        created_by: session.user.id,
        subject_template,
        body_template,
        target_list: target_list || [],
        tier_showcase: tier_showcase || null,
        status,
        scheduled_for: scheduled_for || null,
      })
      .select()
      .single()

    if (error) {
      console.error('Error creating outreach campaign:', error)
      return NextResponse.json(
        {
          error: 'Failed to create outreach campaign',
          details: error.message,
        },
        { status: 500 }
      )
    }

    return NextResponse.json({ campaign: data }, { status: 201 })
  } catch (error) {
    console.error('Unexpected error in POST /api/admin/outreach:', error)
    return NextResponse.json(
      {
        error: 'Internal server error',
        details: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    )
  }
}
