// Fix Harlem Road Texas BBQ cuisine type
// Run this with: fly ssh console -C "node scripts/fix-harlem-road-bbq.js"

const { PrismaClient } = require('@prisma/client')
const prisma = new PrismaClient()

async function fixHarlemRoad() {
  console.log('🔍 Finding Harlem Road Texas BBQ...')

  const restaurant = await prisma.restaurant.findFirst({
    where: {
      name: { contains: 'Harlem Road Texas' }
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

  // Also delete the incorrect "Harlem Road" entry if it exists
  const incorrectEntry = await prisma.restaurant.findFirst({
    where: {
      name: 'Harlem Road',
      address: 'Harlem Rd'
    }
  })

  if (incorrectEntry) {
    await prisma.restaurant.delete({
      where: { id: incorrectEntry.id }
    })
    console.log('🗑️  Deleted incorrect "Harlem Road" entry')
  }

  await prisma.$disconnect()
}

fixHarlemRoad().catch(console.error)
