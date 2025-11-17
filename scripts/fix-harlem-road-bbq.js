// Fix Harlem Road Texas BBQ cuisine type
// Run this with: fly ssh console -C "node scripts/fix-harlem-road-bbq.js"

const { PrismaClient } = require('@prisma/client')
const prisma = new PrismaClient()

async function fixHarlemRoad() {
  console.log('🔍 Updating Harlem Road Texas BBQ...')

  // Direct update by ID
  const restaurantId = 'cmi34ro6x0000zu9ehyg4mibk'

  try {
    const updated = await prisma.restaurant.update({
      where: { id: restaurantId },
      data: {
        cuisineTypes: 'BBQ, Texas BBQ, Barbecue'
      }
    })

    console.log(`✅ Updated: ${updated.name}`)
    console.log(`✅ New cuisine: ${updated.cuisineTypes}`)
  } catch (error) {
    console.log(`❌ Error: ${error.message}`)
  }

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
