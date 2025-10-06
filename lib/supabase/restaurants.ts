import { createServerClient } from './server'
import { Restaurant } from './database.types'

export async function getRestaurants(
  filters?: {
    search?: string
    categories?: string[]
    priceLevel?: number[]
    featured?: boolean
    limit?: number
  }
): Promise<Restaurant[]> {
  const supabase = createServerClient()
  
  let query = supabase
    .from('restaurants')
    .select('*')
    .order('featured', { ascending: false })
    .order('rating', { ascending: false })

  if (filters?.search) {
    query = query.or(`name.ilike.%${filters.search}%, categories.cs.{${filters.search}}`)
  }

  if (filters?.categories && filters.categories.length > 0) {
    query = query.overlaps('categories', filters.categories)
  }

  if (filters?.priceLevel && filters.priceLevel.length > 0) {
    query = query.in('price_level', filters.priceLevel)
  }

  if (filters?.featured !== undefined) {
    query = query.eq('featured', filters.featured)
  }

  if (filters?.limit) {
    query = query.limit(filters.limit)
  }

  const { data, error } = await query

  if (error) {
    console.error('Error fetching restaurants:', error)
    return []
  }

  return data || []
}

export async function getRestaurant(id: string): Promise<Restaurant | null> {
  const supabase = createServerClient()
  
  const { data, error } = await supabase
    .from('restaurants')
    .select('*')
    .eq('id', id)
    .single()

  if (error) {
    console.error('Error fetching restaurant:', error)
    return null
  }

  return data
}

export async function getFeaturedRestaurants(limit = 6): Promise<Restaurant[]> {
  return getRestaurants({ featured: true, limit })
}

export async function getRandomRestaurant(
  params?: {
    categories?: string[]
    priceLevel?: number[]
    radius?: number // miles from Katy center
  }
): Promise<Restaurant | null> {
  const restaurants = await getRestaurants({
    categories: params?.categories,
    priceLevel: params?.priceLevel,
    limit: 100 // Get a pool to randomize from
  })

  if (restaurants.length === 0) return null
  
  const randomIndex = Math.floor(Math.random() * restaurants.length)
  return restaurants[randomIndex]
}