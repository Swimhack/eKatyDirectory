/**
 * Script to unfeature all restaurants in the database
 * This clears all featured spots so they can be sold
 * 
 * Usage: npm run unfeature-all
 */

import { prisma } from '../lib/prisma'

async function unfeatureAllRestaurants() {
  try {
    console.log('🔍 Checking featured restaurants...')
    
    // Count how many are currently featured
    const featuredCount = await prisma.restaurant.count({
      where: { featured: true }
    })

    if (featuredCount === 0) {
      console.log('✅ No featured restaurants found. Nothing to do.')
      return
    }

    console.log(`📊 Found ${featuredCount} featured restaurant(s)`)

    // Update all featured restaurants to unfeatured
    const result = await prisma.restaurant.updateMany({
      where: { featured: true },
      data: { featured: false }
    })

    console.log(`✅ Successfully unfeatured ${result.count} restaurant(s)`)
    console.log('🎯 All featured spots are now available for sale!')

  } catch (error) {
    console.error('❌ Error unfeaturing restaurants:', error)
    process.exit(1)
  } finally {
    await prisma.$disconnect()
  }
}

// Run the script
unfeatureAllRestaurants()





