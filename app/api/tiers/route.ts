import { NextResponse } from 'next/server'
import { createServerClient } from '@/lib/supabase/server'

/**
 * GET /api/tiers
 * Public endpoint - List all active partnership tiers
 */
export async function GET() {
  try {
    const supabase = createServerClient()

    const { data, error } = await supabase
      .from('partnership_tiers')
      .select('*')
      .eq('is_active', true)
      .order('display_order', { ascending: true })

    if (error) {
      console.error('Error fetching partnership tiers:', error)
      return NextResponse.json(
        { error: 'Failed to fetch partnership tiers', details: error.message },
        { status: 500 }
      )
    }

    return NextResponse.json({
      tiers: data || [],
    })
  } catch (error) {
    console.error('Unexpected error in GET /api/tiers:', error)
    return NextResponse.json(
      {
        error: 'Internal server error',
        details: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    )
  }
}
