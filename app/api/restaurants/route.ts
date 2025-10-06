import { NextRequest, NextResponse } from 'next/server'
import { getRestaurants } from '@/lib/supabase/restaurants'

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams
    const search = searchParams.get('search') || undefined
    const categories = searchParams.get('categories')?.split(',') || undefined
    const priceLevel = searchParams.get('priceLevel')?.split(',').map(Number) || undefined
    const featured = searchParams.get('featured') === 'true' ? true : undefined
    const limit = searchParams.get('limit') ? Number(searchParams.get('limit')) : undefined

    const restaurants = await getRestaurants({
      search,
      categories,
      priceLevel,
      featured,
      limit
    })

    return NextResponse.json({ restaurants })
  } catch (error) {
    console.error('Error fetching restaurants:', error)
    return NextResponse.json(
      { error: 'Failed to fetch restaurants' },
      { status: 500 }
    )
  }
}