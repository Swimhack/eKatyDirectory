import { NextRequest, NextResponse } from 'next/server'
import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs'
import { cookies } from 'next/headers'
import { Database } from '@/lib/supabase/types'

export async function POST(request: NextRequest) {
  try {
    const supabase = createRouteHandlerClient<Database>({ cookies })

    // Check authentication
    const {
      data: { session },
    } = await supabase.auth.getSession()

    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Parse request body
    const body = await request.json()
    const { restaurant_id, rating, comment } = body

    // Validation
    if (!restaurant_id) {
      return NextResponse.json(
        { error: 'restaurant_id is required' },
        { status: 400 }
      )
    }

    if (!rating || rating < 1 || rating > 5) {
      return NextResponse.json(
        { error: 'rating must be between 1 and 5' },
        { status: 400 }
      )
    }

    if (!comment || comment.trim().length === 0) {
      return NextResponse.json(
        { error: 'comment is required' },
        { status: 400 }
      )
    }

    if (comment.length > 500) {
      return NextResponse.json(
        { error: 'comment must be 500 characters or less' },
        { status: 400 }
      )
    }

    // Check if restaurant exists
    const { data: restaurant, error: restaurantError } = await supabase
      .from('restaurants')
      .select('id')
      .eq('id', restaurant_id)
      .single()

    if (restaurantError || !restaurant) {
      return NextResponse.json(
        { error: 'Restaurant not found' },
        { status: 404 }
      )
    }

    // Check if user already reviewed this restaurant
    const { data: existing } = await supabase
      .from('reviews')
      .select('id')
      .eq('user_id', session.user.id)
      .eq('restaurant_id', restaurant_id)
      .single()

    if (existing) {
      return NextResponse.json(
        { error: 'You have already reviewed this restaurant' },
        { status: 409 }
      )
    }

    // Create review
    const { data, error } = await supabase
      .from('reviews')
      .insert({
        user_id: session.user.id,
        restaurant_id,
        rating,
        comment: comment.trim(),
      })
      .select(
        `
        *,
        user:users (
          full_name,
          email
        )
      `
      )
      .single()

    if (error) throw error

    return NextResponse.json({ data }, { status: 201 })
  } catch (error) {
    console.error('Reviews API Error:', error)
    return NextResponse.json(
      { error: 'Failed to create review' },
      { status: 500 }
    )
  }
}
