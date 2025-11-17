import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function auditRestaurantData() {
  console.log('🔍 Starting Restaurant Data Audit...\n')

  try {
    // 1. Total counts
    const total = await prisma.restaurant.count()
    const active = await prisma.restaurant.count({ where: { active: true } })
    const inactive = total - active
    const googleSourced = await prisma.restaurant.count({ where: { source: 'google_places' } })

    console.log('📊 RESTAURANT COUNTS')
    console.log(`Total Restaurants: ${total}`)
    console.log(`Active: ${active}`)
    console.log(`Inactive: ${inactive}`)
    console.log(`Google-Sourced: ${googleSourced}`)
    console.log()

    // 2. Contact Information Completeness
    const noPhone = await prisma.restaurant.count({
      where: {
        OR: [
          { phone: null },
          { phone: '' }
        ]
      }
    })

    const noWebsite = await prisma.restaurant.count({
      where: {
        OR: [
          { website: null },
          { website: '' }
        ]
      }
    })

    const noEmail = await prisma.restaurant.count({
      where: {
        OR: [
          { email: null },
          { email: '' }
        ]
      }
    })

    console.log('📞 CONTACT INFORMATION COMPLETENESS')
    console.log(`Missing Phone: ${noPhone} (${((noPhone/total)*100).toFixed(1)}%)`)
    console.log(`Missing Website: ${noWebsite} (${((noWebsite/total)*100).toFixed(1)}%)`)
    console.log(`Missing Email: ${noEmail} (${((noEmail/total)*100).toFixed(1)}%)`)
    console.log()

    // 3. Data Quality Issues
    const allRest = await prisma.restaurant.findMany({
      select: { photos: true, description: true, cuisineTypes: true }
    })

    const noPhotos = allRest.filter(r => !r.photos || r.photos === '').length
    const noDescription = allRest.filter(r => !r.description || r.description === '').length
    const noCuisine = allRest.filter(r => !r.cuisineTypes || r.cuisineTypes === '').length

    console.log('🖼️  DATA QUALITY')
    console.log(`No Photos: ${noPhotos} (${((noPhotos/total)*100).toFixed(1)}%)`)
    console.log(`No Description: ${noDescription} (${((noDescription/total)*100).toFixed(1)}%)`)
    console.log(`No Cuisine Type: ${noCuisine} (${((noCuisine/total)*100).toFixed(1)}%)`)
    console.log()

    // 4. Verification Status
    const lastVerifiedCounts = await prisma.$queryRaw<Array<{status: string, count: number}>>`
      SELECT
        CASE
          WHEN last_verified IS NULL THEN 'never'
          WHEN last_verified > datetime('now', '-7 days') THEN 'recent'
          WHEN last_verified > datetime('now', '-30 days') THEN 'stale'
          ELSE 'very_stale'
        END as status,
        COUNT(*) as count
      FROM restaurants
      GROUP BY status
    `

    console.log('✅ VERIFICATION STATUS')
    lastVerifiedCounts.forEach(({ status, count }) => {
      console.log(`${status}: ${count}`)
    })
    console.log()

    // 5. Duplicate Detection
    const duplicates = await prisma.$queryRaw<Array<{sourceId: string, count: number}>>`
      SELECT source_id as sourceId, COUNT(*) as count
      FROM restaurants
      WHERE source_id IS NOT NULL
      GROUP BY source_id
      HAVING count > 1
    `

    console.log('🔄 DUPLICATE DETECTION')
    console.log(`Potential Duplicates: ${duplicates.length}`)
    if (duplicates.length > 0) {
      console.log('Duplicate Source IDs:', duplicates.slice(0, 5))
    }
    console.log()

    // 6. Top Cuisines
    const allRestaurants = await prisma.restaurant.findMany({
      select: { cuisineTypes: true }
    })

    const cuisineCount = new Map<string, number>()
    allRestaurants.forEach(r => {
      if (r.cuisineTypes) {
        const cuisines = r.cuisineTypes.split(',').map(c => c.trim())
        cuisines.forEach(cuisine => {
          cuisineCount.set(cuisine, (cuisineCount.get(cuisine) || 0) + 1)
        })
      }
    })

    const topCuisines = Array.from(cuisineCount.entries())
      .sort((a, b) => b[1] - a[1])
      .slice(0, 10)

    console.log('🍽️  TOP 10 CUISINES')
    topCuisines.forEach(([cuisine, count]) => {
      console.log(`${cuisine}: ${count}`)
    })
    console.log()

    // 7. Missing Required Fields
    const criticalData = await prisma.restaurant.findMany({
      select: { address: true, latitude: true, longitude: true }
    })

    const missingAddress = criticalData.filter(r => !r.address || r.address === '').length
    const invalidCoords = criticalData.filter(r => r.latitude === 0 || r.longitude === 0).length

    console.log('🚨 CRITICAL ISSUES')
    console.log(`Missing Address: ${missingAddress}`)
    console.log(`Invalid Coordinates: ${invalidCoords}`)
    console.log()

    // 8. Browsability Check
    const invalidSlugs = await prisma.$queryRaw<Array<{id: string, name: string, slug: string}>>`
      SELECT id, name, slug
      FROM restaurants
      WHERE slug IS NULL OR slug = '' OR slug NOT LIKE '%-%'
      LIMIT 10
    `

    console.log('🔗 BROWSABILITY')
    console.log(`Restaurants with invalid slugs: ${invalidSlugs.length}`)
    if (invalidSlugs.length > 0) {
      console.log('Examples:')
      invalidSlugs.forEach(r => {
        console.log(`  - ${r.name} (slug: ${r.slug || 'null'})`)
      })
    }
    console.log()

    // 9. Recommendations
    console.log('💡 RECOMMENDATIONS')
    const issues = []

    if (noPhone > total * 0.1) {
      issues.push(`⚠️  ${((noPhone/total)*100).toFixed(1)}% of restaurants missing phone numbers - high priority`)
    }

    if (noWebsite > total * 0.3) {
      issues.push(`⚠️  ${((noWebsite/total)*100).toFixed(1)}% of restaurants missing websites - moderate priority`)
    }

    if (noPhotos > total * 0.1) {
      issues.push(`⚠️  ${((noPhotos/total)*100).toFixed(1)}% of restaurants missing photos - impacts user engagement`)
    }

    if (duplicates.length > 0) {
      issues.push(`⚠️  ${duplicates.length} potential duplicate entries need deduplication`)
    }

    if (invalidSlugs.length > 0) {
      issues.push(`⚠️  ${invalidSlugs.length} restaurants have invalid slugs - breaks browsability`)
    }

    if (missingAddress > 0 || invalidCoords > 0) {
      issues.push(`🚨 CRITICAL: ${missingAddress + invalidCoords} restaurants have missing/invalid location data`)
    }

    if (issues.length === 0) {
      console.log('✅ All data quality checks passed!')
    } else {
      issues.forEach(issue => console.log(issue))
    }

    console.log('\n✅ Audit Complete!')

  } catch (error) {
    console.error('Error during audit:', error)
  } finally {
    await prisma.$disconnect()
  }
}

auditRestaurantData()
