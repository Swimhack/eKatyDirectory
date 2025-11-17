import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function updateHarlemRoadBBQ() {
  console.log('🔍 Finding Harlem Road BBQ...\n')

  const restaurant = await prisma.restaurant.findFirst({
    where: {
      name: { contains: 'Harlem Road' }
    }
  })

  if (!restaurant) {
    console.log('❌ Harlem Road BBQ not found')
    process.exit(1)
  }

  console.log(`✅ Found: ${restaurant.name}`)
  console.log(`Current cuisine types: ${restaurant.cuisineTypes}`)

  // Update cuisine types to include BBQ
  const updated = await prisma.restaurant.update({
    where: { id: restaurant.id },
    data: {
      cuisineTypes: 'BBQ, Texas BBQ, Barbecue'
    }
  })

  console.log(`\n✅ Updated cuisine types to: ${updated.cuisineTypes}`)
  console.log('\n📋 Restaurant Details:')
  console.log(`   ID: ${updated.id}`)
  console.log(`   Name: ${updated.name}`)
  console.log(`   Address: ${updated.address}`)
  console.log(`   Cuisine Types: ${updated.cuisineTypes}`)
  console.log(`   Rating: ${updated.rating}`)
  console.log(`   Active: ${updated.active}`)

  await prisma.$disconnect()
}

updateHarlemRoadBBQ().catch(console.error)
