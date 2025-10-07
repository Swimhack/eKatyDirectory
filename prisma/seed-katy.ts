import { PrismaClient } from '@prisma/client'
import * as bcrypt from 'bcrypt'
import * as fs from 'fs'
import * as path from 'path'

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
      email: 'editor@ekaty.com',
      name: 'Editor User',
      passwordHash: await bcrypt.hash('editor123!', 10),
      role: 'EDITOR' as const
    },
    {
      email: 'john.doe@example.com',
      name: 'John Doe',
      passwordHash: await bcrypt.hash('user123!', 10),
      role: 'USER' as const
    },
    {
      email: 'jane.smith@example.com',
      name: 'Jane Smith',
      passwordHash: await bcrypt.hash('user123!', 10),
      role: 'USER' as const
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

async function seedRestaurants() {
  console.log('🌱 Seeding real Katy restaurants...')
  
  const katyRestaurantsPath = path.join(process.cwd(), 'prisma', 'seed-data', 'katy-restaurants.json')
  const katyRestaurantsData = JSON.parse(fs.readFileSync(katyRestaurantsPath, 'utf-8'))
  
  for (const restaurant of katyRestaurantsData.restaurants) {
    // Map price range to our enum
    const priceMap: { [key: string]: string } = {
      '$': 'BUDGET',
      '$$': 'MODERATE',
      '$$$': 'UPSCALE',
      '$$$$': 'FINE_DINING'
    }
    
    // Convert hours object to JSON string
    const hoursJson = JSON.stringify({
      monday: restaurant.hours.mon === 'Closed' ? { closed: true } : { open: restaurant.hours.mon.split(' - ')[0], close: restaurant.hours.mon.split(' - ')[1] },
      tuesday: restaurant.hours.tue === 'Closed' ? { closed: true } : { open: restaurant.hours.tue.split(' - ')[0], close: restaurant.hours.tue.split(' - ')[1] },
      wednesday: restaurant.hours.wed === 'Closed' ? { closed: true } : { open: restaurant.hours.wed.split(' - ')[0], close: restaurant.hours.wed.split(' - ')[1] },
      thursday: restaurant.hours.thu === 'Closed' ? { closed: true } : { open: restaurant.hours.thu.split(' - ')[0], close: restaurant.hours.thu.split(' - ')[1] },
      friday: restaurant.hours.fri === 'Closed' ? { closed: true } : { open: restaurant.hours.fri.split(' - ')[0], close: restaurant.hours.fri.split(' - ')[1] },
      saturday: restaurant.hours.sat === 'Closed' ? { closed: true } : { open: restaurant.hours.sat.split(' - ')[0], close: restaurant.hours.sat.split(' - ')[1] },
      sunday: restaurant.hours.sun === 'Closed' ? { closed: true } : { open: restaurant.hours.sun.split(' - ')[0], close: restaurant.hours.sun.split(' - ')[1] }
    })
    
    const data = {
      name: restaurant.name,
      slug: restaurant.slug,
      description: restaurant.description,
      address: restaurant.address,
      city: restaurant.city,
      state: restaurant.state,
      zipCode: restaurant.zip,
      latitude: 29.7752 + (Math.random() * 0.1 - 0.05), // Around Katy area
      longitude: -95.8244 + (Math.random() * 0.1 - 0.05),
      phone: restaurant.phone,
      website: restaurant.website || null,
      email: `contact@${restaurant.slug}.com`,
      categories: restaurant.cuisineType,
      cuisineTypes: restaurant.tags.join(','),
      hours: hoursJson,
      priceLevel: priceMap[restaurant.priceRange] || 'MODERATE',
      photos: restaurant.image,
      logoUrl: restaurant.image,
      featured: restaurant.rating >= 4.5,
      verified: true,
      active: true,
      rating: restaurant.rating,
      reviewCount: Math.floor(Math.random() * 200) + 50,
      source: 'manual',
      sourceId: null,
      metadata: JSON.stringify({
        features: restaurant.features,
        tags: restaurant.tags
      })
    }
    
    await prisma.restaurant.upsert({
      where: { slug: data.slug },
      update: data,
      create: data
    })
  }
  
  console.log(`✅ ${katyRestaurantsData.restaurants.length} real Katy restaurants seeded`)
}

async function seedReviews() {
  console.log('🌱 Seeding realistic reviews...')
  
  const users = await prisma.user.findMany({ where: { role: 'USER' } })
  const restaurants = await prisma.restaurant.findMany()
  
  const reviewTemplates = {
    excellent: [
      "Absolutely love this place! The {food} was incredible and the service was top-notch.",
      "Best {cuisine} in Katy! Everything we ordered was delicious.",
      "Amazing experience from start to finish. The {feature} really sets them apart.",
      "This is our new favorite spot! The {food} is consistently excellent.",
      "Wow! The {food} exceeded our expectations. Can't wait to come back!"
    ],
    good: [
      "Really enjoyed our meal here. The {food} was great and portions were generous.",
      "Good {cuisine} at reasonable prices. The {feature} is a nice touch.",
      "Solid choice for {cuisine}. Service was friendly and attentive.",
      "Nice atmosphere and good food. The {food} was particularly tasty.",
      "Enjoyed our visit. The {feature} makes this place stand out."
    ],
    average: [
      "Decent {cuisine} but nothing extraordinary. Service was okay.",
      "Food was alright, but I've had better {cuisine} elsewhere.",
      "Average experience overall. The {food} was fine but not memorable.",
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
      const metadata = restaurant.metadata ? JSON.parse(restaurant.metadata) : { features: [], tags: [] }
      const features = metadata.features || []
      const tags = metadata.tags || []
      
      const text = template
        .replace('{food}', ['food', 'dishes', 'meal'][Math.floor(Math.random() * 3)])
        .replace('{cuisine}', restaurant.categories || 'food')
        .replace('{feature}', features[0] || 'atmosphere')
      
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
          text: text,
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
  console.log('🌱 Starting database seed with real Katy restaurant data...')
  
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
  await seedRestaurants()
  await seedReviews()
  await seedFavorites()
  
  console.log('✅ Database seeded successfully with real Katy data!')
}

main()
  .catch((e) => {
    console.error('❌ Seed failed:', e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })