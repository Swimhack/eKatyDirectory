import { PrismaClient } from '@prisma/client'
import * as bcrypt from 'bcrypt'
import { fetchAllKatyRestaurants, fetchDetailedRestaurantData } from '../lib/google-places/fetcher'
import { importRestaurants, deduplicateRestaurants } from '../lib/google-places/importer'
import { validateApiKey } from '../lib/google-places/client'

const prisma = new PrismaClient()

async function seedUsers() {
  console.log('🌱 Seeding users...')
  
  const users = [
    {
      email: 'admin@ekaty.com',
      name: 'Admin User',
      passwordHash: await bcrypt.hash('admin123!', 10),
      role: 'ADMIN' as const
    },
    {
      email: 'demo@ekaty.com',
      name: 'Demo User',
      passwordHash: await bcrypt.hash('demo123', 10),
      role: 'USER' as const
    },
    {
      email: 'editor@ekaty.com',
      name: 'Editor User',
      passwordHash: await bcrypt.hash('editor123!', 10),
      role: 'EDITOR' as const
    }
  ]
  
  for (const user of users) {
    await prisma.user.upsert({
      where: { email: user.email },
      update: {},
      create: user
    })
  }
  
  console.log('✅ Users seeded')
}

async function seedRestaurantsFromGoogle() {
  console.log('🌱 Seeding restaurants from Google Places API...')
  
  // Check if API key is configured
  if (!validateApiKey()) {
    console.error('❌ Error: Google Maps API key is not configured!')
    console.error('Please add GOOGLE_MAPS_API_KEY to your environment variables')
    console.error('For production, set it in fly.toml or as a secret')
    throw new Error('Google Maps API key is required')
  }

  try {
    // Step 1: Discover all restaurants
    console.log('📍 Discovering restaurants in Katy, TX area...')
    const restaurants = await fetchAllKatyRestaurants()
    
    if (restaurants.length === 0) {
      throw new Error('No restaurants found. Please check your API key and quota.')
    }

    console.log(`✅ Found ${restaurants.length} unique restaurants!`)

    // Step 2: Fetch detailed data
    console.log('📋 Fetching detailed information...')
    console.log('This may take several minutes. Please be patient...')
    
    const detailedRestaurants = await fetchDetailedRestaurantData(
      restaurants,
      (current, total) => {
        // Update progress in place
        process.stdout.write(`\rProgress: ${current}/${total} (${Math.round(current/total * 100)}%)`)
      }
    )
    
    console.log('') // New line after progress
    console.log(`✅ Fetched details for ${detailedRestaurants.length} restaurants!`)

    // Step 3: Import to database
    console.log('💾 Importing to database...')
    
    const importResults = await importRestaurants(detailedRestaurants, {
      updateExisting: true,
      onProgress: (current, total, restaurant) => {
        process.stdout.write(`\rImporting: ${current}/${total} - ${restaurant?.name || 'Processing...'}`)
      }
    })
    
    console.log('') // New line after progress
    
    // Step 4: Clean up duplicates
    console.log('🧹 Cleaning up duplicates...')
    const duplicatesRemoved = await deduplicateRestaurants()
    
    // Display results
    console.log('\n📊 Import Results:')
    console.log('='.repeat(50))
    console.log(`✅ Created: ${importResults.created} new restaurants`)
    console.log(`🔄 Updated: ${importResults.updated} existing restaurants`)
    console.log(`❌ Failed: ${importResults.failed} imports`)
    console.log(`🧹 Duplicates removed: ${duplicatesRemoved}`)
    
    console.log('✅ Restaurants seeded from Google Places')
    
  } catch (error) {
    console.error('❌ Error importing from Google Places:', error)
    throw error
  }
}

async function seedReviews() {
  console.log('🌱 Seeding realistic reviews...')
  
  const users = await prisma.user.findMany({ where: { role: 'USER' } })
  const restaurants = await prisma.restaurant.findMany()
  
  const reviewTemplates = {
    excellent: [
      "Absolutely love this place! The food was incredible and the service was top-notch.",
      "Best restaurant in Katy! Everything we ordered was delicious.",
      "Amazing experience from start to finish. The atmosphere really sets them apart.",
      "This is our new favorite spot! The food is consistently excellent.",
      "Wow! The food exceeded our expectations. Can't wait to come back!"
    ],
    good: [
      "Really enjoyed our meal here. The food was great and portions were generous.",
      "Good food at reasonable prices. The service is a nice touch.",
      "Solid choice for dining. Service was friendly and attentive.",
      "Nice atmosphere and good food. The dishes were particularly tasty.",
      "Enjoyed our visit. The atmosphere makes this place stand out."
    ],
    average: [
      "Decent food but nothing extraordinary. Service was okay.",
      "Food was alright, but I've had better elsewhere.",
      "Average experience overall. The food was fine but not memorable.",
      "It's okay for a quick meal, but wouldn't go out of my way to come here.",
      "Mixed experience - some dishes were good, others were just okay."
    ]
  }
  
  for (const restaurant of restaurants) {
    const numReviews = Math.floor(Math.random() * 5) + 3 // 3-8 reviews per restaurant
    
    for (let i = 0; i < numReviews && i < users.length; i++) {
      const user = users[i % users.length]
      const rating = restaurant.rating ? Math.max(2, Math.min(5, restaurant.rating + (Math.random() - 0.5))) : Math.floor(Math.random() * 2) + 3
      
      let templates: string[]
      if (rating >= 4.5) {
        templates = reviewTemplates.excellent
      } else if (rating >= 3.5) {
        templates = reviewTemplates.good
      } else {
        templates = reviewTemplates.average
      }
      
      const template = templates[Math.floor(Math.random() * templates.length)]
      
      await prisma.review.upsert({
        where: {
          restaurantId_userId: {
            restaurantId: restaurant.id,
            userId: user.id
          }
        },
        update: {},
        create: {
          restaurantId: restaurant.id,
          userId: user.id,
          rating: Math.round(rating),
          title: rating >= 4 ? "Great experience!" : rating >= 3 ? "Good meal" : "Just okay",
          text: template,
          verified: Math.random() > 0.3,
          photos: Math.random() > 0.7 ? restaurant.photos || '' : ''
        }
      })
    }
  }
  
  console.log('✅ Realistic reviews seeded')
}

async function seedFavorites() {
  console.log('🌱 Seeding favorites...')
  
  const users = await prisma.user.findMany({ where: { role: 'USER' } })
  const restaurants = await prisma.restaurant.findMany()
  
  for (const user of users) {
    // Each user favorites 3-7 restaurants
    const numFavorites = Math.floor(Math.random() * 5) + 3
    const shuffled = [...restaurants].sort(() => 0.5 - Math.random())
    const toFavorite = shuffled.slice(0, numFavorites)
    
    for (const restaurant of toFavorite) {
      await prisma.favorite.upsert({
        where: {
          userId_restaurantId: {
            userId: user.id,
            restaurantId: restaurant.id
          }
        },
        update: {},
        create: {
          userId: user.id,
          restaurantId: restaurant.id
        }
      })
    }
  }
  
  console.log('✅ Favorites seeded')
}

async function main() {
  console.log('🌱 Starting database seed with Google Places data...')
  
  // Clear existing data
  await prisma.review.deleteMany()
  await prisma.favorite.deleteMany()
  await prisma.contactSubmission.deleteMany()
  await prisma.spin.deleteMany()
  await prisma.ad.deleteMany()
  await prisma.auditLog.deleteMany()
  await prisma.restaurant.deleteMany()
  await prisma.user.deleteMany()
  
  // Seed in order
  await seedUsers()
  await seedRestaurantsFromGoogle()
  await seedReviews()
  await seedFavorites()
  
  console.log('✅ Database seeded successfully with Google Places data!')
}

main()
  .catch((e) => {
    console.error('❌ Seed failed:', e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
