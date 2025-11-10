import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

// List of well-known restaurants in Katy, TX to validate
const knownKatyRestaurants = [
  // BBQ
  { name: "Midway BBQ", category: "BBQ" },
  { name: "Dozier's BBQ", category: "BBQ" },
  { name: "Red River BBQ", category: "BBQ" },
  
  // Mexican
  { name: "Chuy's", category: "Mexican" },
  { name: "Pappasito's Cantina", category: "Mexican" },
  { name: "Lupe Tortilla", category: "Mexican" },
  { name: "El Tiempo Cantina", category: "Mexican" },
  
  // American/Burgers
  { name: "Whataburger", category: "American" },
  { name: "Five Guys", category: "American" },
  { name: "BJ's Restaurant", category: "American" },
  
  // Italian
  { name: "Olive Garden", category: "Italian" },
  { name: "Romano's Macaroni Grill", category: "Italian" },
  
  // Asian
  { name: "P.F. Chang's", category: "Asian" },
  { name: "Pei Wei", category: "Asian" },
  
  // Seafood
  { name: "Pappadeaux Seafood Kitchen", category: "Seafood" },
  { name: "Red Lobster", category: "Seafood" },
  
  // Steakhouse
  { name: "Texas Roadhouse", category: "American" },
  { name: "Saltgrass Steak House", category: "American" },
  
  // Breakfast
  { name: "IHOP", category: "Breakfast" },
  { name: "Snooze", category: "Breakfast" },
]

async function validateRestaurantCoverage() {
  console.log('🔍 Validating Restaurant Coverage in eKaty Database\n')
  console.log('=' .repeat(70))
  
  let foundCount = 0
  let notFoundCount = 0
  const notFoundList: string[] = []
  
  for (const restaurant of knownKatyRestaurants) {
    // Search for restaurant by name (case-insensitive, partial match)
    const found = await prisma.restaurant.findFirst({
      where: {
        name: {
          contains: restaurant.name.split(' ')[0], // Search by first word
        },
        active: true
      },
      select: {
        id: true,
        name: true,
        address: true,
        cuisineTypes: true,
        categories: true,
        rating: true,
        reviewCount: true
      }
    })
    
    if (found) {
      foundCount++
      console.log(`✅ FOUND: ${restaurant.name}`)
      console.log(`   Database Name: ${found.name}`)
      console.log(`   Address: ${found.address}`)
      console.log(`   Cuisine Types: ${found.cuisineTypes}`)
      console.log(`   Rating: ${found.rating || 'N/A'} (${found.reviewCount} reviews)`)
      console.log('')
    } else {
      notFoundCount++
      notFoundList.push(restaurant.name)
      console.log(`❌ NOT FOUND: ${restaurant.name} (${restaurant.category})`)
      console.log('')
    }
  }
  
  console.log('=' .repeat(70))
  console.log('\n📊 COVERAGE SUMMARY')
  console.log(`Total Restaurants Checked: ${knownKatyRestaurants.length}`)
  console.log(`Found in Database: ${foundCount} (${Math.round(foundCount / knownKatyRestaurants.length * 100)}%)`)
  console.log(`Not Found: ${notFoundCount} (${Math.round(notFoundCount / knownKatyRestaurants.length * 100)}%)`)
  
  if (notFoundList.length > 0) {
    console.log('\n⚠️  Missing Restaurants:')
    notFoundList.forEach(name => console.log(`   - ${name}`))
  }
  
  // Get total restaurant count
  const totalRestaurants = await prisma.restaurant.count({
    where: { active: true }
  })
  
  console.log(`\n📈 Total Active Restaurants in Database: ${totalRestaurants}`)
  
  // Get category breakdown
  console.log('\n📋 Category Breakdown:')
  const categories = ['BBQ', 'Mexican', 'American', 'Italian', 'Asian', 'Seafood', 'Breakfast']
  
  for (const category of categories) {
    const count = await prisma.restaurant.count({
      where: {
        OR: [
          { cuisineTypes: { contains: category } },
          { categories: { contains: category } }
        ],
        active: true
      }
    })
    console.log(`   ${category}: ${count} restaurants`)
  }
}

validateRestaurantCoverage()
  .catch(console.error)
  .finally(() => prisma.$disconnect())
