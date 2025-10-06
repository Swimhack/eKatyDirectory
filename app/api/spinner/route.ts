import { NextRequest, NextResponse } from 'next/server'
import { getRandomRestaurant } from '@/lib/supabase/restaurants'
import { createServerClient } from '@/lib/supabase/server'

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { categories, priceLevel, radius } = body

    // Get random restaurant based on parameters
    const restaurant = await getRandomRestaurant({
      categories,
      priceLevel,
      radius
    })

    if (!restaurant) {
      return NextResponse.json(
        { error: 'No restaurants found matching criteria' },
        { status: 404 }
      )
    }

    // Log the spin for analytics
    const supabase = createServerClient()
    const { data: { user } } = await supabase.auth.getUser()
    
    await supabase
      .from('spins')
      .insert({
        user_id: user?.id || null,
        restaurant_id: restaurant.id,
        spin_params: { categories, priceLevel, radius }
      })

    return NextResponse.json({ restaurant })
  } catch (error) {
    console.error('Error spinning restaurant:', error)
    return NextResponse.json(
      { error: 'Failed to spin restaurant' },
      { status: 500 }
    )
  }
}