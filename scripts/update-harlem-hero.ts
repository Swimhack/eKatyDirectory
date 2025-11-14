import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function updateHarlemHeroImage() {
  try {
    // Find Harlem Road BBQ
    const restaurant = await prisma.restaurant.findFirst({
      where: {
        OR: [
          { name: { contains: 'Harlem Road BBQ' } },
          { slug: 'harlem-road-bbq' }
        ]
      }
    })

    if (!restaurant) {
      console.error('Harlem Road BBQ not found')
      return
    }

    console.log('Found restaurant:', restaurant.name)

    // Parse existing metadata
    const metadata = restaurant.metadata ? JSON.parse(restaurant.metadata) : {}
    
    // Set the hero image
    metadata.heroImage = '/DESIGN/harlem_road_bbq.jpg'

    // Update the restaurant
    await prisma.restaurant.update({
      where: { id: restaurant.id },
      data: {
        metadata: JSON.stringify(metadata),
        updatedAt: new Date()
      }
    })

    console.log('✅ Successfully updated hero image for Harlem Road BBQ')
    console.log('Hero image URL:', metadata.heroImage)
  } catch (error) {
    console.error('Error updating hero image:', error)
  } finally {
    await prisma.$disconnect()
  }
}

updateHarlemHeroImage()
