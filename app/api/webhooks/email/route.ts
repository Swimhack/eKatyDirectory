import { NextRequest, NextResponse } from 'next/server'
import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs'
import { cookies } from 'next/headers'
import { processWebhook } from '@/lib/email/tracking'

/**
 * Webhook endpoint for Resend email events
 * Handles: email.opened, email.clicked, email.bounced, email.complained, email.unsubscribed
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const supabase = createRouteHandlerClient({ cookies })

    // Process the webhook event
    const event = processWebhook(body)

    // Find the email record by provider ID
    const { data: email, error: emailError } = await supabase
      .from('outreach_emails')
      .select('id, lead_id, campaign_id')
      .eq('email_provider_id', event.emailProviderId)
      .single()

    if (emailError || !email) {
      console.warn('Email record not found for provider ID:', event.emailProviderId)
      return NextResponse.json({ success: false, error: 'Email not found' }, { status: 404 })
    }

    // Update email record based on event type
    const updates: Record<string, any> = {}

    switch (event.type) {
      case 'opened':
        updates.opened_at = event.timestamp.toISOString()
        break
      case 'clicked':
        updates.clicked_at = event.timestamp.toISOString()
        break
      case 'bounced':
        updates.bounced_at = event.timestamp.toISOString()
        updates.bounce_reason = event.rawEvent.data.reason || 'Unknown'
        break
      case 'unsubscribed':
        updates.unsubscribed_at = event.timestamp.toISOString()
        break
      default:
        // For other events (sent, delivered, complained), just log
        console.log('Received email event:', event.type, email.id)
        return NextResponse.json({ success: true })
    }

    // Update the email record
    const { error: updateError } = await supabase
      .from('outreach_emails')
      .update(updates)
      .eq('id', email.id)

    if (updateError) {
      console.error('Error updating email record:', updateError)
      return NextResponse.json(
        { success: false, error: 'Update failed' },
        { status: 500 }
      )
    }

    console.log(`Email ${event.type} event processed for email ID:`, email.id)

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Webhook processing error:', error)
    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    )
  }
}

export const dynamic = 'force-dynamic'
