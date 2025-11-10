import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function checkBBQRestaurants() {
  console.log('🔍 Checking BBQ restaurants in database...\n')
  
  // Check BBQ restaurants
  const bbqRestaurants = await prisma.restaurant.findMany({
    where: {
      OR: [
        { cuisineTypes: { contains: 'BBQ' } },
        { categories: { contains: 'BBQ' } }
      ],
      active: true
    },
    select: {
      id: true,
      name: true,
      cuisineTypes: true,
      categories: true,
      active: true
    }
  })
  
  console.log(`✅ Found ${bbqRestaurants.length} BBQ restaurants\n`)
  
  if (bbqRestaurants.length > 0) {
    console.log('📋 BBQ Restaurants:')
    bbqRestaurants.forEach((r, i) => {
      console.log(`\n${i + 1}. ${r.name}`)
      console.log(`   ID: ${r.id}`)
      console.log(`   Cuisine Types: ${r.cuisineTypes}`)
      console.log(`   Categories: ${r.categories}`)
      console.log(`   Active: ${r.active}`)
    })
  }
  
  // Check total restaurants
  const totalRestaurants = await prisma.restaurant.count({ where: { active: true } })
  console.log(`\n📊 Total active restaurants: ${totalRestaurants}`)
  
  await prisma.$disconnect()
}

checkBBQRestaurants().catch(console.error)
