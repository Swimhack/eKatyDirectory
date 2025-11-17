// Direct database update script for Harlem Road BBQ
// Run this with: fly ssh console -C "node scripts/update-harlem-db-direct.js"

const { PrismaClient } = require('@prisma/client')
const prisma = new PrismaClient()

async function updateHarlem() {
  console.log('🔍 Finding Harlem Road BBQ...')

  const restaurant = await prisma.restaurant.findFirst({
    where: {
      name: { contains: 'Harlem Road' }
    }
  })

  if (!restaurant) {
    console.log('❌ Not found')
    await prisma.$disconnect()
    return
  }

  console.log(`✅ Found: ${restaurant.name}`)
  console.log(`Current cuisine: ${restaurant.cuisineTypes}`)

  const updated = await prisma.restaurant.update({
    where: { id: restaurant.id },
    data: {
      cuisineTypes: 'BBQ, Texas BBQ, Barbecue'
    }
  })

  console.log(`✅ Updated to: ${updated.cuisineTypes}`)
  await prisma.$disconnect()
}

updateHarlem().catch(console.error)
