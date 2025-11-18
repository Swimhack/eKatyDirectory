import { NextRequest, NextResponse } from 'next/server'
import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs'
import { cookies } from 'next/headers'

/**
 * Tracking pixel endpoint for email opens
 * Returns a 1x1 transparent GIF
 */
export async function GET(
  request: NextRequest,
  { params }: { params: { emailId: string } }
) {
  const { emailId } = params

  try {
    const supabase = createRouteHandlerClient({ cookies })

    // Update the email record with opened_at timestamp (only if not already opened)
    const { error } = await supabase
      .from('outreach_emails')
      .update({ opened_at: new Date().toISOString() })
      .eq('id', emailId)
      .is('opened_at', null)

    if (error) {
      console.error('Error tracking email open:', error)
    }
  } catch (error) {
    console.error('Tracking pixel error:', error)
  }

  // Return a 1x1 transparent GIF
  const transparentGif = Buffer.from(
    'R0lGODlhAQABAIAAAAAAAP///yH5BAEAAAAALAAAAAABAAEAAAIBRAA7',
    'base64'
  )

  return new NextResponse(transparentGif, {
    status: 200,
    headers: {
      'Content-Type': 'image/gif',
      'Cache-Control': 'no-store, no-cache, must-revalidate',
    },
  })
}

export const dynamic = 'force-dynamic'
