import { NextRequest, NextResponse } from 'next/server'
import { createServerClient } from '@/lib/supabase/server'

export async function GET(request: NextRequest) {
  try {
    const supabase = createServerClient()
    
    const { data: spins, error } = await supabase
      .from('spins')
      .select(`
        id,
        created_at,
        restaurants(name)
      `)
      .order('created_at', { ascending: false })
      .limit(10)

    if (error) {
      console.error('Error fetching recent spins:', error)
      return NextResponse.json(
        { error: 'Failed to fetch recent spins' },
        { status: 500 }
      )
    }

    // Transform the data to include restaurant names
    const transformedSpins = spins?.map(spin => ({
      id: spin.id,
      restaurant_name: (spin.restaurants as any)?.name || 'Unknown Restaurant',
      created_at: spin.created_at
    })) || []

    return NextResponse.json({ spins: transformedSpins })
  } catch (error) {
    console.error('Error in spins API:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}