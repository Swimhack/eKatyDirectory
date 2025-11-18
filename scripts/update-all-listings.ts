import dotenv from 'dotenv'
import { PrismaClient } from '@prisma/client'
import { fetchPlaceDetails } from '../lib/google-places/fetcher'
import { transformGooglePlaceToRestaurant } from '../lib/google-places/transformer'

dotenv.config({ path: '.env.local' })
dotenv.config({ path: '.env' })

const prisma = new PrismaClient()

interface UpdateStats {
  total: number
  updated: number
  skipped: number
  failed: number
  adminProtected: number
  noSourceId: number
  errors: string[]
}

/**
 * Update all restaurant listings from Google Places
 * ALWAYS respects admin overrides - never overwrites admin-edited fields
 */
async function updateAllListings() {
  console.log('🔄 Starting bulk restaurant update from Google Places...')
  console.log('🛡️  Admin overrides will be PRESERVED - admin edits are protected\n')

  const stats: UpdateStats = {
    total: 0,
    updated: 0,
    skipped: 0,
    failed: 0,
    adminProtected: 0,
    noSourceId: 0,
    errors: []
  }

  try {
    // Fetch all active restaurants with Google Places sourceId
    const restaurants = await prisma.restaurant.findMany({
      where: {
        active: true,
        source: 'google_places',
        sourceId: { not: null }
      },
      select: {
        id: true,
        name: true,
        sourceId: true,
        adminOverrides: true,
        lastVerified: true,
        slug: true
      },
      orderBy: {
        lastVerified: 'asc' // Update oldest first
      }
    })

    stats.total = restaurants.length
    console.log(`📊 Found ${stats.total} restaurants to update\n`)

    if (stats.total === 0) {
      console.log('ℹ️  No restaurants found with Google Places sourceId')
      return
    }

    // Process each restaurant
    for (let i = 0; i < restaurants.length; i++) {
      const restaurant = restaurants[i]
      const progress = `[${i + 1}/${stats.total}]`

      console.log(`${progress} Processing: ${restaurant.name}`)

      if (!restaurant.sourceId) {
        console.log(`   ⚠️  No sourceId - skipping`)
        stats.noSourceId++
        stats.skipped++
        continue
      }

      try {
        // Fetch latest data from Google Places
        console.log(`   🌐 Fetching from Google Places (ID: ${restaurant.sourceId})`)
        const placeDetails = await fetchPlaceDetails(restaurant.sourceId)

        if (!placeDetails) {
          console.log(`   ❌ Failed to fetch - place not found`)
          stats.failed++
          stats.errors.push(`${restaurant.name}: Place not found on Google`)
          continue
        }

        // Transform Google data to restaurant format
        const freshData = transformGooglePlaceToRestaurant(placeDetails)

        // Parse admin overrides (protected fields)
        const adminOverrides = restaurant.adminOverrides
          ? JSON.parse(restaurant.adminOverrides)
          : {}

        const protectedFields = Object.keys(adminOverrides).filter(key => adminOverrides[key])

        if (protectedFields.length > 0) {
          console.log(`   🛡️  Admin-protected fields: ${protectedFields.join(', ')}`)
          stats.adminProtected++
        }

        // Build update data - exclude admin-protected fields
        const updateData: any = {}
        let hasChanges = false

        // List of fields that can be updated from Google Places
        const updatableFields = [
          'name',
          'address',
          'phone',
          'website',
          'hours',
          'rating',
          'reviewCount',
          'photos',
          'priceLevel',
          'latitude',
          'longitude',
          'categories',
          'cuisineTypes',
          'description'
        ]

        for (const field of updatableFields) {
          // Only update if NOT protected by admin
          if (!adminOverrides[field]) {
            if (freshData[field] !== undefined) {
              updateData[field] = freshData[field]
              hasChanges = true
            }
          }
        }

        // Always preserve these fields
        updateData.slug = restaurant.slug // Never change slug (breaks URLs)
        updateData.adminOverrides = restaurant.adminOverrides // Preserve locks
        updateData.lastVerified = new Date()
        updateData.updatedAt = new Date()

        if (!hasChanges) {
          console.log(`   ℹ️  No changes needed - all fields protected or unchanged`)
          stats.skipped++
        } else {
          // Update the restaurant
          await prisma.restaurant.update({
            where: { id: restaurant.id },
            data: updateData
          })

          console.log(`   ✅ Updated successfully`)
          stats.updated++
        }

        // Rate limiting - respect Google Places API limits
        await new Promise(resolve => setTimeout(resolve, 100)) // 10 requests/second max

      } catch (error: any) {
        console.log(`   ❌ Failed: ${error.message}`)
        stats.failed++
        stats.errors.push(`${restaurant.name}: ${error.message}`)
      }

      console.log('') // Blank line between restaurants
    }

    // Print summary
    console.log('\n' + '='.repeat(60))
    console.log('📊 UPDATE SUMMARY')
    console.log('='.repeat(60))
    console.log(`Total Restaurants: ${stats.total}`)
    console.log(`✅ Updated: ${stats.updated}`)
    console.log(`⏭️  Skipped: ${stats.skipped}`)
    console.log(`❌ Failed: ${stats.failed}`)
    console.log(`🛡️  With Admin Protection: ${stats.adminProtected}`)
    console.log(`⚠️  No SourceId: ${stats.noSourceId}`)

    if (stats.errors.length > 0) {
      console.log('\n❌ ERRORS:')
      stats.errors.forEach(error => console.log(`   • ${error}`))
    }

    console.log('='.repeat(60))
    console.log(`\n⏰ Completed at: ${new Date().toLocaleString()}`)

  } catch (error) {
    console.error('\n❌ Fatal error during update:', error)
    throw error
  } finally {
    await prisma.$disconnect()
  }
}

// Run the update
updateAllListings()
  .then(() => {
    console.log('\n✨ Update process completed successfully')
    process.exit(0)
  })
  .catch((error) => {
    console.error('\n💥 Update process failed:', error)
    process.exit(1)
  })
