import { NextRequest, NextResponse } from 'next/server'
import { requireAdmin } from '@/lib/auth/require-admin'

export const dynamic = 'force-dynamic'
import { createAdminClient } from '@/lib/supabase/admin'
import { checkRateLimit } from '@/lib/utils/rate-limiter'
import { sendEmail } from '@/lib/email/client'
import { replaceTemplateVariables } from '@/lib/utils/template-variables'

interface SendRequest {
  campaignId: string
  leadIds: string[]
  tierId?: string
}

/**
 * POST /api/admin/outreach/send
 * Send outreach emails with rate limiting
 */
export async function POST(request: NextRequest) {
  const authResponse = await requireAdmin(request)
  if (authResponse) return authResponse

  try {
    const body: SendRequest = await request.json()
    const { campaignId, leadIds, tierId } = body

    // Validation
    if (!campaignId || !leadIds || leadIds.length === 0) {
      return NextResponse.json(
        {
          error: 'Missing required fields',
          details: 'campaignId and leadIds are required',
        },
        { status: 400 }
      )
    }

    const supabase = createAdminClient()

    // Get current user session
    const {
      data: { session },
    } = await supabase.auth.getSession()

    if (!session?.user?.id) {
      return NextResponse.json(
        { error: 'Unauthorized - session required' },
        { status: 401 }
      )
    }

    // Check rate limit (50/hour, 200/day)
    // Check hourly limit
    const hourlyLimit = await checkRateLimit(session.user.id, 50, 3600)

    if (!hourlyLimit.allowed) {
      return NextResponse.json(
        {
          error: 'Rate limit exceeded',
          details: 'You can send 50 emails per hour. Please try again later.',
          remaining: hourlyLimit.remaining,
          resetAt: hourlyLimit.resetAt,
        },
        { status: 429 }
      )
    }

    // Check daily limit
    const dailyLimit = await checkRateLimit(session.user.id, 200, 86400)

    if (!dailyLimit.allowed) {
      return NextResponse.json(
        {
          error: 'Rate limit exceeded',
          details: 'You can send 200 emails per day. Please try again later.',
          remaining: dailyLimit.remaining,
          resetAt: dailyLimit.resetAt,
        },
        { status: 429 }
      )
    }

    // Fetch campaign details
    const { data: campaign, error: campaignError } = await supabase
      .from('outreach_campaigns')
      .select('*')
      .eq('id', campaignId)
      .single()

    if (campaignError || !campaign) {
      return NextResponse.json(
        { error: 'Campaign not found', details: campaignError?.message },
        { status: 404 }
      )
    }

    // Fetch tier details if provided
    let tier = null
    if (tierId || campaign.tier_showcase) {
      const tierIdToFetch = tierId || campaign.tier_showcase
      const { data: tierData } = await supabase
        .from('partnership_tiers')
        .select('*')
        .eq('id', tierIdToFetch)
        .single()
      tier = tierData
    }

    // Fetch leads
    const { data: leads, error: leadsError } = await supabase
      .from('restaurant_leads')
      .select('*')
      .in('id', leadIds)

    if (leadsError || !leads) {
      return NextResponse.json(
        { error: 'Failed to fetch leads', details: leadsError?.message },
        { status: 500 }
      )
    }

    // Send emails to each lead
    const results = []
    let successCount = 0
    let failureCount = 0

    for (const lead of leads) {
      try {
        // Prepare template variables
        const variables = {
          restaurant_name: lead.business_name,
          contact_name: lead.contact_name,
          cuisine: lead.cuisine_type || 'restaurant',
          city: lead.city,
          tier_name: tier?.name || '',
          tier_price: tier?.monthly_price?.toString() || '',
        }

        // Replace template variables in subject
        const subject = replaceTemplateVariables(
          campaign.subject_template,
          variables,
          false // Don't escape HTML in subject
        )

        // Replace template variables in body
        const emailBody = replaceTemplateVariables(
          campaign.body_template,
          variables,
          false // Plain text email
        )

        // Send email
        const emailResult = await sendEmail({
          to: lead.email,
          subject,
          html: emailBody.replace(/\n/g, '<br>'), // Convert newlines to HTML
        })

        // Record email sent
        await supabase.from('outreach_emails').insert({
          campaign_id: campaignId,
          lead_id: lead.id,
          email_provider_id: emailResult.id || null,
          subject,
          sent_at: new Date().toISOString(),
        })

        // Update lead last_contacted_at
        await supabase
          .from('restaurant_leads')
          .update({ last_contacted_at: new Date().toISOString() })
          .eq('id', lead.id)

        successCount++
        results.push({
          leadId: lead.id,
          email: lead.email,
          status: 'sent',
        })
      } catch (error) {
        failureCount++
        results.push({
          leadId: lead.id,
          email: lead.email,
          status: 'failed',
          error: error instanceof Error ? error.message : 'Unknown error',
        })
      }
    }

    // Update campaign stats
    await supabase
      .from('outreach_campaigns')
      .update({
        total_sent: (campaign.total_sent || 0) + successCount,
        status: 'sent',
        sent_at: new Date().toISOString(),
      })
      .eq('id', campaignId)

    return NextResponse.json({
      message: `Sent ${successCount} emails, ${failureCount} failed`,
      successCount,
      failureCount,
      results,
    })
  } catch (error) {
    console.error('Unexpected error in POST /api/admin/outreach/send:', error)
    return NextResponse.json(
      {
        error: 'Internal server error',
        details: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    )
  }
}
