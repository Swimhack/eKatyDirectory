// Validate restaurant coverage by checking production API
const BASE_URL = 'https://ekaty.fly.dev'

// Restaurants mentioned in web search results
const knownKatyRestaurants = [
  // From search results - BBQ
  { name: "Roegels", category: "BBQ", source: "Houston Chronicle" },
  { name: "Daddy Duncan's BBQ", category: "BBQ", source: "Wanderlog" },
  { name: "Midway BBQ", category: "BBQ", source: "Known local" },
  { name: "Dozier's BBQ", category: "BBQ", source: "Known local" },
  
  // From search results - Mexican
  { name: "Los Cucos Mexican Cafe", category: "Mexican", source: "Wanderlog" },
  { name: "Pappasito's Cantina", category: "Mexican", source: "Known chain" },
  { name: "Lupe Tortilla", category: "Mexican", source: "Known local" },
  
  // From search results - American/Casual
  { name: "BJ's Restaurant", category: "American", source: "Katy Magazine" },
  { name: "Cheddar's", category: "American", source: "Katy Magazine" },
  { name: "Local Table", category: "American", source: "Eater Houston" },
  { name: "Dish Society", category: "American", source: "Katy Magazine" },
  { name: "Texas Roadhouse", category: "American", source: "Known chain" },
  { name: "Fuddruckers", category: "American", source: "Katy Magazine" },
  
  // From search results - Italian
  { name: "Palinuro Italian", category: "Italian", source: "OpenTable" },
  
  // From search results - Asian
  { name: "Phat Eatery", category: "Asian", source: "Exit 4 Escape" },
  { name: "Spicy House", category: "Asian", source: "Reddit" },
  { name: "Sushi Nine", category: "Asian", source: "Reddit" },
  
  // From search results - Other
  { name: "Union Kitchen", category: "American", source: "Exit 4 Escape" },
  { name: "Agave Rio", category: "Mexican", source: "Katy Magazine" },
]

interface Restaurant {
  id: string
  name: string
  cuisineTypes: string
  categories: string
  address: string
  rating: number | null
  reviewCount: number
}

async function searchRestaurant(searchTerm: string): Promise<Restaurant[]> {
  try {
    const response = await fetch(`${BASE_URL}/api/restaurants?q=${encodeURIComponent(searchTerm)}&limit=5`)
    const data = await response.json()
    return data.restaurants || []
  } catch (error) {
    console.error(`Error searching for "${searchTerm}":`, error)
    return []
  }
}

async function validateProductionCoverage() {
  console.log('🔍 Validating Restaurant Coverage Against Production Database\n')
  console.log('Checking restaurants mentioned in web search results...\n')
  console.log('='.repeat(80))
  
  let foundCount = 0
  let notFoundCount = 0
  const notFoundList: Array<{name: string, category: string, source: string}> = []
  
  for (const restaurant of knownKatyRestaurants) {
    // Search by first word of restaurant name
    const searchTerm = restaurant.name.split(' ')[0]
    const results = await searchRestaurant(searchTerm)
    
    // Check if any result matches
    const found = results.find(r => 
      r.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      searchTerm.toLowerCase().includes(r.name.toLowerCase().split(' ')[0])
    )
    
    if (found) {
      foundCount++
      console.log(`✅ FOUND: ${restaurant.name}`)
      console.log(`   Database Name: ${found.name}`)
      console.log(`   Address: ${found.address}`)
      console.log(`   Cuisine: ${found.cuisineTypes}`)
      console.log(`   Rating: ${found.rating || 'N/A'} ⭐ (${found.reviewCount} reviews)`)
      console.log(`   Source: ${restaurant.source}`)
      console.log('')
    } else {
      notFoundCount++
      notFoundList.push(restaurant)
      console.log(`❌ NOT FOUND: ${restaurant.name}`)
      console.log(`   Expected Category: ${restaurant.category}`)
      console.log(`   Source: ${restaurant.source}`)
      console.log('')
    }
    
    // Small delay to avoid rate limiting
    await new Promise(resolve => setTimeout(resolve, 200))
  }
  
  console.log('='.repeat(80))
  console.log('\n📊 COVERAGE SUMMARY')
  console.log(`Total Restaurants Checked: ${knownKatyRestaurants.length}`)
  console.log(`Found in Database: ${foundCount} (${Math.round(foundCount / knownKatyRestaurants.length * 100)}%)`)
  console.log(`Not Found: ${notFoundCount} (${Math.round(notFoundCount / knownKatyRestaurants.length * 100)}%)`)
  
  if (notFoundList.length > 0) {
    console.log('\n⚠️  Missing Restaurants (from web search):')
    notFoundList.forEach(r => console.log(`   - ${r.name} (${r.category}) - Source: ${r.source}`))
  }
  
  // Get category counts
  console.log('\n📋 Category Counts in Production:')
  const categories = ['BBQ', 'Mexican', 'American', 'Italian', 'Asian', 'Seafood', 'Breakfast']
  
  for (const category of categories) {
    try {
      const response = await fetch(`${BASE_URL}/api/restaurants?category=${encodeURIComponent(category)}&limit=1`)
      const data = await response.json()
      console.log(`   ${category}: ${data.pagination?.total || 0} restaurants`)
      await new Promise(resolve => setTimeout(resolve, 200))
    } catch (error) {
      console.log(`   ${category}: Error fetching count`)
    }
  }
  
  // Sample some restaurants from each category
  console.log('\n🍽️  Sample Restaurants by Category:')
  for (const category of ['BBQ', 'Mexican', 'American']) {
    try {
      const response = await fetch(`${BASE_URL}/api/restaurants?category=${encodeURIComponent(category)}&limit=3`)
      const data = await response.json()
      console.log(`\n${category}:`)
      data.restaurants?.forEach((r: Restaurant) => {
        console.log(`   • ${r.name} - ${r.address}`)
      })
      await new Promise(resolve => setTimeout(resolve, 200))
    } catch (error) {
      console.log(`   Error fetching ${category} restaurants`)
    }
  }
}

validateProductionCoverage()
  .then(() => {
    console.log('\n✅ Validation complete!')
    process.exit(0)
  })
  .catch(error => {
    console.error('\n❌ Validation failed:', error)
    process.exit(1)
  })
