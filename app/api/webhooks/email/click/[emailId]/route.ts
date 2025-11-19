import { NextRequest, NextResponse } from 'next/server'
import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs'
import { cookies } from 'next/headers'

/**
 * Tracking endpoint for email link clicks
 * Records the click and redirects to the destination URL
 */
export async function GET(
  request: NextRequest,
  { params }: { params: { emailId: string } }
) {
  const { emailId } = params
  const { searchParams } = new URL(request.url)
  const destination = searchParams.get('url')

  if (!destination) {
    return NextResponse.json(
      { error: 'Missing destination URL' },
      { status: 400 }
    )
  }

  try {
    const supabase = createRouteHandlerClient({ cookies })

    // Update the email record with clicked_at timestamp (only if not already clicked)
    const { error } = await supabase
      .from('outreach_emails')
      .update({ clicked_at: new Date().toISOString() })
      .eq('id', emailId)
      .is('clicked_at', null)

    if (error) {
      console.error('Error tracking email click:', error)
    }
  } catch (error) {
    console.error('Click tracking error:', error)
  }

  // Redirect to the destination URL
  return NextResponse.redirect(destination, { status: 302 })
}

export const dynamic = 'force-dynamic'
