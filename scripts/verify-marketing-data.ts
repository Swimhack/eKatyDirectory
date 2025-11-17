import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function verifyMarketingData() {
  try {
    const withMarketing = await prisma.restaurant.findMany({
      where: {
        metadata: { not: null }
      },
      select: {
        id: true,
        name: true,
        cuisineTypes: true,
        metadata: true
      }
    })

    let count = 0
    const samples: any[] = []

    for (const r of withMarketing) {
      try {
        const meta = JSON.parse(r.metadata as string)
        if (meta.marketing) {
          count++
          if (samples.length < 5) {
            samples.push({
              name: r.name,
              cuisine: r.cuisineTypes,
              hasKidsDeal: !!meta.marketing.kidsDeal,
              kidsDays: meta.marketing.kidsDeal?.days || [],
              specialsCount: meta.marketing.specials?.length || 0
            })
          }
        }
      } catch {}
    }

    console.log('\n📊 Marketing Data Verification\n')
    console.log(`Total restaurants with marketing data: ${count}\n`)

    console.log('Sample restaurants:\n')
    samples.forEach((s, i) => {
      console.log(`${i + 1}. ${s.name} (${s.cuisine})`)
      console.log(`   Kids Deal: ${s.hasKidsDeal ? 'Yes' : 'No'}`)
      console.log(`   Days: ${s.kidsDays.join(', ')}`)
      console.log(`   Specials: ${s.specialsCount}`)
      console.log('')
    })

  } catch (error) {
    console.error('❌ Error:', error)
  } finally {
    await prisma.$disconnect()
  }
}

verifyMarketingData()
