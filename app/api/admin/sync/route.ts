import { NextResponse } from 'next/server'
import { PrismaClient } from '@prisma/client'
import { fetchAllKatyRestaurants, fetchDetailedRestaurantData } from '@/lib/google-places/fetcher'
import { importRestaurants, deduplicateRestaurants } from '@/lib/google-places/importer'
import { validateApiKey } from '@/lib/google-places/client'

const prisma = new PrismaClient()

// Verify API key from request
function verifyAdminAuth(request: Request): boolean {
  const authHeader = request.headers.get('authorization')
  const apiKey = process.env.ADMIN_API_KEY || 'your-secret-admin-key'
  
  return authHeader === `Bearer ${apiKey}`
}

export async function POST(request: Request) {
  // Verify admin authentication
  if (!verifyAdminAuth(request)) {
    return NextResponse.json(
      { error: 'Unauthorized' },
      { status: 401 }
    )
  }

  // Check if Google API is configured
  if (!validateApiKey()) {
    return NextResponse.json(
      { error: 'Google Maps API key is not configured' },
      { status: 500 }
    )
  }

  try {
    console.log('🔄 Starting daily restaurant sync...')
    
    // Step 1: Discover all restaurants
    console.log('📍 Discovering restaurants in Katy, TX area...')
    const restaurants = await fetchAllKatyRestaurants()
    
    if (restaurants.length === 0) {
      return NextResponse.json(
        { error: 'No restaurants found' },
        { status: 500 }
      )
    }

    console.log(`✅ Found ${restaurants.length} unique restaurants`)

    // Step 2: Fetch detailed data
    console.log('📋 Fetching detailed information...')
    const detailedRestaurants = await fetchDetailedRestaurantData(
      restaurants,
      (current, total) => {
        console.log(`Progress: ${current}/${total} (${Math.round(current/total * 100)}%)`)
      }
    )
    
    console.log(`✅ Fetched details for ${detailedRestaurants.length} restaurants`)

    // Step 3: Import to database (update existing records)
    console.log('💾 Updating database...')
    const importResults = await importRestaurants(detailedRestaurants, {
      updateExisting: true,
      onProgress: (current, total, restaurant) => {
        console.log(`Importing: ${current}/${total} - ${restaurant?.name || 'Processing...'}`)
      }
    })
    
    // Step 4: Clean up duplicates
    console.log('🧹 Cleaning up duplicates...')
    const duplicatesRemoved = await deduplicateRestaurants()
    
    // Log the sync event
    await prisma.auditLog.create({
      data: {
        action: 'RESTAURANT_SYNC',
        entity: 'Restaurant',
        entityId: 'system',
        changes: JSON.stringify({
          created: importResults.created,
          updated: importResults.updated,
          failed: importResults.failed,
          duplicatesRemoved
        }),
        userId: null // System action
      }
    })

    const result = {
      success: true,
      timestamp: new Date().toISOString(),
      stats: {
        discovered: restaurants.length,
        created: importResults.created,
        updated: importResults.updated,
        failed: importResults.failed,
        duplicatesRemoved
      }
    }
    
    console.log('✅ Daily sync completed successfully')
    console.log(JSON.stringify(result, null, 2))
    
    return NextResponse.json(result)
    
  } catch (error) {
    console.error('❌ Sync failed:', error)
    
    // Log the error
    await prisma.auditLog.create({
      data: {
        action: 'RESTAURANT_SYNC_FAILED',
        entity: 'Restaurant',
        entityId: 'system',
        changes: JSON.stringify({
          error: error instanceof Error ? error.message : 'Unknown error'
        }),
        userId: null
      }
    })
    
    return NextResponse.json(
      { 
        error: 'Sync failed', 
        message: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    )
  } finally {
    await prisma.$disconnect()
  }
}

// GET endpoint to check last sync status
export async function GET(request: Request) {
  // Verify admin authentication
  if (!verifyAdminAuth(request)) {
    return NextResponse.json(
      { error: 'Unauthorized' },
      { status: 401 }
    )
  }

  try {
    // Get the most recent sync logs
    const recentSyncs = await prisma.auditLog.findMany({
      where: {
        action: {
          in: ['RESTAURANT_SYNC', 'RESTAURANT_SYNC_FAILED']
        }
      },
      orderBy: {
        createdAt: 'desc'
      },
      take: 10
    })

    // Get total restaurant count
    const totalRestaurants = await prisma.restaurant.count()
    const activeRestaurants = await prisma.restaurant.count({
      where: { active: true }
    })

    return NextResponse.json({
      totalRestaurants,
      activeRestaurants,
      recentSyncs: recentSyncs.map(log => ({
        timestamp: log.createdAt,
        action: log.action,
        details: log.changes ? JSON.parse(log.changes) : null
      }))
    })
  } catch (error) {
    console.error('Error fetching sync status:', error)
    return NextResponse.json(
      { error: 'Failed to fetch sync status' },
      { status: 500 }
    )
  } finally {
    await prisma.$disconnect()
  }
}
