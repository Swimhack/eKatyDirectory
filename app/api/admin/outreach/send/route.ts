import { NextRequest, NextResponse } from 'next/server'
import { requireAdmin } from '@/lib/auth/require-admin'
import { createAdminClient } from '@/lib/supabase/admin'
import { checkRateLimit } from '@/lib/utils/rate-limiter'
import { sendEmail } from '@/lib/email/client'
import { generateOutreachEmail } from '@/lib/email/templates'

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
    const rateLimitResult = await checkRateLimit(session.user.id)

    if (!rateLimitResult.allowed) {
      return NextResponse.json(
        {
          error: 'Rate limit exceeded',
          details: `You can send ${rateLimitResult.limit} emails per ${rateLimitResult.window}. Please try again later.`,
          limit: rateLimitResult.limit,
          window: rateLimitResult.window,
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
        // Generate personalized email
        const emailHtml = generateOutreachEmail({
          restaurantName: lead.business_name,
          contactName: lead.contact_name,
          cuisine: lead.cuisine_type || 'restaurant',
          city: lead.city,
          tierName: tier?.name,
          tierPrice: tier?.monthly_price,
          leadId: lead.id,
          campaignId: campaign.id,
        })

        // Replace template variables in subject
        const subject = campaign.subject_template
          .replace('{{restaurant_name}}', lead.business_name)
          .replace('{{contact_name}}', lead.contact_name)
          .replace('{{cuisine}}', lead.cuisine_type || 'restaurant')
          .replace('{{city}}', lead.city)
          .replace('{{tier_name}}', tier?.name || '')
          .replace('{{tier_price}}', tier?.monthly_price?.toString() || '')

        // Send email
        const emailResult = await sendEmail({
          to: lead.email,
          subject,
          html: emailHtml,
        })

        if (emailResult.success) {
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
        } else {
          failureCount++
          results.push({
            leadId: lead.id,
            email: lead.email,
            status: 'failed',
            error: emailResult.error,
          })
        }
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
