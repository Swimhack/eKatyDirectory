import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

interface OutreachSegment {
  name: string
  criteria: string
  count: number
  restaurants: Array<{
    id: string
    name: string
    phone: string | null
    website: string | null
    email: string | null
    cuisineTypes: string | null
    priceLevel: string
    rating: number | null
    reviewCount: number
    hasMarketing: boolean
    featured: boolean
  }>
  valueProposition: string
}

async function analyzeRestaurantsForOutreach() {
  try {
    console.log('🔍 Analyzing 267 restaurants for outreach targeting...\n')

    const allRestaurants = await prisma.restaurant.findMany({
      where: { active: true },
      select: {
        id: true,
        name: true,
        phone: true,
        website: true,
        cuisineTypes: true,
        priceLevel: true,
        rating: true,
        reviewCount: true,
        featured: true,
        metadata: true,
        address: true,
        city: true,
        state: true,
        zipCode: true
      }
    })

    // Parse marketing data
    const restaurantsWithData = allRestaurants.map(r => {
      let hasMarketing = false
      if (r.metadata) {
        try {
          const meta = JSON.parse(r.metadata as string)
          hasMarketing = !!meta.marketing
        } catch {}
      }
      return {
        ...r,
        hasMarketing,
        email: null // We'll extract from website if needed
      }
    })

    // Segment 1: High-Value Targets (Top performers without marketing)
    const highValueTargets = restaurantsWithData.filter(r =>
      !r.hasMarketing &&
      !r.featured &&
      r.rating && r.rating >= 4.0 &&
      r.reviewCount >= 50
    )

    // Segment 2: Family-Friendly (Already have marketing, upsell to Premium)
    const familyFriendly = restaurantsWithData.filter(r =>
      r.hasMarketing &&
      !r.featured &&
      (r.cuisineTypes?.includes('Pizza') ||
       r.cuisineTypes?.includes('Mexican') ||
       r.cuisineTypes?.includes('American') ||
       r.cuisineTypes?.includes('BBQ'))
    )

    // Segment 3: Featured Upgrade Candidates (Active, good reviews, not featured)
    const featuredCandidates = restaurantsWithData.filter(r =>
      !r.featured &&
      r.rating && r.rating >= 4.5 &&
      r.reviewCount >= 100
    )

    // Segment 4: Quick Win - Has Phone Only
    const hasPhoneOnly = restaurantsWithData.filter(r =>
      r.phone && !r.website
    )

    // Segment 5: Premium Targets (High price, high ratings)
    const premiumTargets = restaurantsWithData.filter(r =>
      r.priceLevel === '$$$' || r.priceLevel === '$$$$' &&
      r.rating && r.rating >= 4.3 &&
      !r.featured
    )

    const segments: OutreachSegment[] = [
      {
        name: 'High-Value Targets',
        criteria: 'Rating ≥4.0, 50+ reviews, no marketing',
        count: highValueTargets.length,
        restaurants: highValueTargets,
        valueProposition: 'Get discovered by 10,000+ monthly diners searching "restaurants near me in Katy". Your high ratings deserve more visibility - claim your free listing and get featured for just $99/month.'
      },
      {
        name: 'Family-Friendly Upsell',
        criteria: 'Already has marketing, not featured',
        count: familyFriendly.length,
        restaurants: familyFriendly,
        valueProposition: 'Your kids deals are live! Upgrade to Premium for $199/month to get featured placement, priority search results, and 3x more clicks. Limited spots available.'
      },
      {
        name: 'Featured Placement Candidates',
        criteria: 'Rating ≥4.5, 100+ reviews, not featured',
        count: featuredCandidates.length,
        restaurants: featuredCandidates,
        valueProposition: 'You\'re already a top-rated restaurant in Katy. Get featured placement for $99/month and capture customers actively searching for the best dining options.'
      },
      {
        name: 'Phone-Only Quick Wins',
        criteria: 'Has phone, no website (easy conversion)',
        count: hasPhoneOnly.length,
        restaurants: hasPhoneOnly,
        valueProposition: 'We noticed you don\'t have a website. Get a free eKaty profile page that ranks on Google and drives calls to your restaurant. Upgrade to Pro for just $49/month to add special offers.'
      },
      {
        name: 'Premium Restaurant Targets',
        criteria: '$$$ or $$$$, rating ≥4.3',
        count: premiumTargets.length,
        restaurants: premiumTargets,
        valueProposition: 'Premium dining deserves premium placement. Join our exclusive Featured tier for $199/month and dominate search results for fine dining in Katy. ROI guaranteed or money back.'
      }
    ]

    console.log('📊 OUTREACH SEGMENTATION ANALYSIS\n')
    console.log('═'.repeat(80))

    let totalTargets = 0
    segments.forEach((segment, index) => {
      console.log(`\n${index + 1}. ${segment.name}`)
      console.log(`   Criteria: ${segment.criteria}`)
      console.log(`   Count: ${segment.count} restaurants`)
      console.log(`   Value Prop: ${segment.valueProposition}`)
      totalTargets += segment.count
    })

    console.log('\n' + '═'.repeat(80))
    console.log(`\n📈 TOTAL OUTREACH TARGETS: ${totalTargets} restaurants`)
    console.log(`💰 POTENTIAL REVENUE (if 10% convert to $99/mo): $${(totalTargets * 0.10 * 99).toFixed(0)}/month`)
    console.log(`💰 POTENTIAL REVENUE (if 20% convert to $99/mo): $${(totalTargets * 0.20 * 99).toFixed(0)}/month\n`)

    // Export detailed data
    console.log('📋 TOP 10 HIGH-VALUE TARGETS:\n')
    highValueTargets.slice(0, 10).forEach((r, i) => {
      console.log(`${i + 1}. ${r.name}`)
      console.log(`   Phone: ${r.phone || 'N/A'}`)
      console.log(`   Website: ${r.website || 'N/A'}`)
      console.log(`   Rating: ${r.rating}/5 (${r.reviewCount} reviews)`)
      console.log(`   Cuisine: ${r.cuisineTypes}`)
      console.log(`   Address: ${r.address}, ${r.city}, ${r.state} ${r.zipCode}`)
      console.log('')
    })

    // Generate CSV for outreach
    const csvData = segments.flatMap(segment =>
      segment.restaurants.map(r => ({
        segment: segment.name,
        name: r.name,
        phone: r.phone || '',
        website: r.website || '',
        cuisine: r.cuisineTypes || '',
        rating: r.rating || '',
        reviews: r.reviewCount || '',
        priceLevel: r.priceLevel,
        address: r.address,
        valueProposition: segment.valueProposition
      }))
    )

    const csvHeader = [
      'Segment',
      'Restaurant Name',
      'Phone',
      'Website',
      'Cuisine',
      'Rating',
      'Reviews',
      'Price Level',
      'Address',
      'Value Proposition'
    ].join(',')

    const csvRows = csvData.map(row => [
      `"${row.segment}"`,
      `"${row.name}"`,
      `"${row.phone}"`,
      `"${row.website}"`,
      `"${row.cuisine}"`,
      row.rating,
      row.reviews,
      `"${row.priceLevel}"`,
      `"${row.address}"`,
      `"${row.valueProposition}"`
    ].join(','))

    const csv = [csvHeader, ...csvRows].join('\n')

    const fs = require('fs')
    fs.writeFileSync('restaurant-outreach-targets.csv', csv)
    console.log('✅ Exported outreach targets to: restaurant-outreach-targets.csv\n')

    return segments

  } catch (error) {
    console.error('❌ Error analyzing restaurants:', error)
    throw error
  } finally {
    await prisma.$disconnect()
  }
}

analyzeRestaurantsForOutreach()
