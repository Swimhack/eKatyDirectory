import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function fixHarlemHeroImage() {
  try {
    // Find Harlem Road BBQ by slug
    const restaurant = await prisma.restaurant.findFirst({
      where: {
        slug: 'harlem-road-bbq'
      }
    })

    if (!restaurant) {
      console.error('❌ Harlem Road BBQ not found')
      return
    }

    console.log('✅ Found restaurant:', restaurant.name)
    console.log('Current metadata:', restaurant.metadata)

    // Create new metadata with heroImage
    const metadata = {
      heroImage: '/DESIGN/harlem_road_bbq.jpg'
    }

    // Update the restaurant
    const updated = await prisma.restaurant.update({
      where: { id: restaurant.id },
      data: {
        metadata: JSON.stringify(metadata),
        updatedAt: new Date()
      }
    })

    console.log('✅ Successfully updated!')
    console.log('New metadata:', updated.metadata)
    
    // Verify the update
    const verified = await prisma.restaurant.findUnique({
      where: { id: restaurant.id }
    })
    
    console.log('\n📋 Verification:')
    console.log('Stored metadata:', verified?.metadata)
    const parsedMeta = verified?.metadata ? JSON.parse(verified.metadata) : {}
    console.log('Parsed heroImage:', parsedMeta.heroImage)
    
  } catch (error) {
    console.error('❌ Error:', error)
  } finally {
    await prisma.$disconnect()
  }
}

fixHarlemHeroImage()
