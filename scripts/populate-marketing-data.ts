import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

interface MarketingKidsDeal {
  enabled: boolean
  days: string[]
  description: string
}

interface MarketingSpecial {
  title: string
  day: string
  timeWindow: string
  description: string
  tags: string[]
}

interface MarketingMeta {
  marketing?: {
    kidsDeal?: MarketingKidsDeal
    specials?: MarketingSpecial[]
  }
}

async function populateMarketingData() {
  try {
    console.log('🔍 Finding family-friendly restaurants...')

    // Get restaurants that are family-friendly
    const restaurants = await prisma.restaurant.findMany({
      where: {
        active: true,
        cuisineTypes: {
          in: ['American', 'Mexican', 'Italian', 'Pizza', 'BBQ', 'Burgers', 'Tex-Mex']
        }
      },
      select: {
        id: true,
        name: true,
        cuisineTypes: true,
        metadata: true
      }
    })

    console.log(`📊 Found ${restaurants.length} family-friendly restaurants`)

    let updated = 0

    for (const restaurant of restaurants) {
      // Parse existing metadata
      let meta: MarketingMeta = {}
      if (restaurant.metadata) {
        try {
          meta = JSON.parse(restaurant.metadata as string)
        } catch {
          meta = {}
        }
      }

      // Skip if already has marketing data
      if (meta.marketing) {
        console.log(`⏭️  Skipping ${restaurant.name} - already has marketing data`)
        continue
      }

      // Initialize marketing object
      meta.marketing = {}

      const cuisine = restaurant.cuisineTypes

      // Add kids deals based on cuisine type
      if (cuisine === 'Pizza') {
        meta.marketing.kidsDeal = {
          enabled: true,
          days: ['Monday', 'Tuesday', 'Wednesday'],
          description: 'Kids eat free with purchase of adult entree. One free kids meal per adult entree. Valid for children 12 and under.'
        }
        meta.marketing.specials = [
          {
            title: 'Family Night Special',
            day: 'Monday',
            timeWindow: '5pm-9pm',
            description: 'Large 2-topping pizza + 2 liter soda for $19.99',
            tags: ['family-friendly', 'pizza-deal']
          }
        ]
      } else if (cuisine === 'Mexican' || cuisine === 'Tex-Mex') {
        meta.marketing.kidsDeal = {
          enabled: true,
          days: ['Tuesday', 'Thursday'],
          description: 'Kids menu items starting at $4.99. Includes drink and dessert. For children 12 and under.'
        }
        meta.marketing.specials = [
          {
            title: 'Taco Tuesday',
            day: 'Tuesday',
            timeWindow: '4pm-9pm',
            description: '$1.50 tacos all day. Choose from beef, chicken, or carnitas.',
            tags: ['taco-tuesday', 'happy-hour']
          },
          {
            title: 'Margarita Monday',
            day: 'Monday',
            timeWindow: '4pm-close',
            description: '$5 house margaritas and $2 off premium margaritas',
            tags: ['happy-hour', 'drinks']
          }
        ]
      } else if (cuisine === 'American' || cuisine === 'Burgers') {
        meta.marketing.kidsDeal = {
          enabled: true,
          days: ['Wednesday', 'Thursday', 'Sunday'],
          description: 'Kids eat free on Wednesdays and Sundays. One free kids meal per adult entree purchased.'
        }
        meta.marketing.specials = [
          {
            title: 'Burger & Beer Wednesday',
            day: 'Wednesday',
            timeWindow: '5pm-close',
            description: 'Half-price burgers with purchase of any draft beer',
            tags: ['burger-special', 'happy-hour']
          }
        ]
      } else if (cuisine === 'Italian') {
        meta.marketing.kidsDeal = {
          enabled: true,
          days: ['Sunday'],
          description: 'Kids pasta bowls just $5.99 all day Sunday. Includes garlic bread and juice.'
        }
        meta.marketing.specials = [
          {
            title: 'Wine Down Wednesday',
            day: 'Wednesday',
            timeWindow: '4pm-close',
            description: 'Half-price wine bottles and $6 appetizers',
            tags: ['wine-special', 'happy-hour']
          }
        ]
      } else if (cuisine === 'BBQ') {
        meta.marketing.kidsDeal = {
          enabled: true,
          days: ['Monday', 'Tuesday', 'Wednesday'],
          description: 'Kids BBQ plates just $6.99. Choice of meat, 2 sides, and drink.'
        }
        meta.marketing.specials = [
          {
            title: 'Rib Night',
            day: 'Thursday',
            timeWindow: '5pm-9pm',
            description: 'Half rack of ribs for $12.99',
            tags: ['ribs', 'dinner-special']
          }
        ]
      }

      // Update restaurant metadata
      await prisma.restaurant.update({
        where: { id: restaurant.id },
        data: {
          metadata: JSON.stringify(meta)
        }
      })

      updated++
      console.log(`✅ Updated ${restaurant.name} (${cuisine})`)
    }

    console.log(`\n🎉 Successfully updated ${updated} restaurants with marketing data`)

  } catch (error) {
    console.error('❌ Error populating marketing data:', error)
    throw error
  } finally {
    await prisma.$disconnect()
  }
}

populateMarketingData()
