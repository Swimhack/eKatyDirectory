/**
 * Script to repopulate blog articles via API
 * Run with: npx ts-node scripts/repopulate-blog-via-api.ts
 */

const API_URL = 'https://ekaty.fly.dev'
const ADMIN_API_KEY = 'ekaty-admin-secret-2025'

const articles = [
  {
    title: 'Best Family-Friendly Restaurants in Katy Texas 2025: Top 15 Kid-Friendly Dining Spots',
    slug: 'best-family-friendly-restaurants-in-katy-texas-2025-top-15-kid-friendly-dining-spots',
    publishedDate: '2025-08-15',
    keywords: 'family-friendly restaurants Katy Texas 2025, kid-friendly restaurants Katy, best family dining Katy TX, restaurants with kids menu Katy'
  },
  {
    title: 'Back to School Dining Deals in Katy 2025: Family Restaurant Specials for August',
    slug: 'back-to-school-dining-deals-in-katy-2025-family-restaurant-specials-for-august',
    publishedDate: '2025-08-22',
    keywords: 'back to school deals Katy Texas 2025, restaurant specials Katy, family dining deals August 2025, Katy restaurant promotions'
  },
  {
    title: 'Weekend Brunch Spots in Katy Texas 2025: Best Family Brunch Restaurants for Saturday & Sunday',
    slug: 'weekend-brunch-spots-in-katy-texas-2025-best-family-brunch-restaurants-for-saturday-sunday',
    publishedDate: '2025-08-29',
    keywords: 'brunch restaurants Katy Texas 2025, weekend brunch Katy, family brunch spots Katy TX, best brunch Katy 2025'
  },
  {
    title: 'Labor Day Weekend Dining Guide 2025: Top Katy Restaurants Open for Family Celebrations',
    slug: 'labor-day-weekend-dining-guide-2025-top-katy-restaurants-open-for-family-celebrations',
    publishedDate: '2025-09-05',
    keywords: 'Labor Day restaurants Katy Texas 2025, Labor Day weekend dining Katy, family restaurants open Labor Day, Katy TX holiday dining'
  },
  {
    title: 'Budget-Friendly Family Restaurants in Katy 2025: Great Meals Under $50 for Families of 4',
    slug: 'budget-friendly-family-restaurants-in-katy-2025-great-meals-under-50-for-families-of-4',
    publishedDate: '2025-09-12',
    keywords: 'budget restaurants Katy Texas 2025, affordable family dining Katy, cheap eats Katy TX, family restaurants under $50 Katy'
  },
  {
    title: 'Best Outdoor Patio Dining in Katy Texas 2025: Family-Friendly Restaurants with Patios',
    slug: 'best-outdoor-patio-dining-in-katy-texas-2025-family-friendly-restaurants-with-patios',
    publishedDate: '2025-09-19',
    keywords: 'patio dining Katy Texas 2025, outdoor restaurants Katy, family patio restaurants Katy TX, al fresco dining Katy'
  },
  {
    title: 'Birthday Party Restaurants in Katy 2025: Top 10 Family-Friendly Venues for Kids Birthdays',
    slug: 'birthday-party-restaurants-in-katy-2025-top-10-family-friendly-venues-for-kids-birthdays',
    publishedDate: '2025-09-26',
    keywords: 'birthday party restaurants Katy Texas 2025, kids birthday party venues Katy, family birthday dining Katy TX, birthday celebration restaurants'
  },
  {
    title: 'Fall Family Dining Guide 2025: Best Katy Restaurants for Autumn Family Meals',
    slug: 'fall-family-dining-guide-2025-best-katy-restaurants-for-autumn-family-meals',
    publishedDate: '2025-10-03',
    keywords: 'fall dining Katy Texas 2025, autumn restaurants Katy, family fall dining Katy TX, seasonal restaurants Katy 2025'
  },
  {
    title: 'Date Night Restaurants in Katy Texas 2025: Top 12 Romantic Dining Spots for Parents',
    slug: 'date-night-restaurants-in-katy-texas-2025-top-12-romantic-dining-spots-for-parents',
    publishedDate: '2025-09-15',
    keywords: 'date night restaurants Katy Texas 2025, romantic dining Katy, couples restaurants Katy TX, fine dining Katy for couples'
  },
  {
    title: 'Mexican Restaurants in Katy Texas 2025: Best Family-Friendly Mexican Food Spots',
    slug: 'mexican-restaurants-in-katy-texas-2025-best-family-friendly-mexican-food-spots',
    publishedDate: '2025-08-28',
    keywords: 'Mexican restaurants Katy Texas 2025, family Mexican dining Katy, best Mexican food Katy TX, authentic Mexican restaurants Katy'
  }
]

async function createArticle(article: typeof articles[0]) {
  const content = `
    <div class="prose max-w-none">
      <h2>Welcome to ${article.title}</h2>
      <p>This article is currently being generated. Please check back soon for the full content!</p>
      <p>In the meantime, explore other great restaurants in Katy, Texas on our <a href="/">homepage</a>.</p>
    </div>
  `

  const metaDescription = `Discover ${article.title.toLowerCase()}. Your complete guide to family dining in Katy, Texas.`

  const response = await fetch(`${API_URL}/api/admin/blog`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${ADMIN_API_KEY}`
    },
    body: JSON.stringify({
      title: article.title,
      slug: article.slug,
      content,
      metaDescription,
      keywords: article.keywords,
      authorName: 'James Strickland',
      contactEmail: 'james@ekaty.com',
      phoneNumber: '713-444-6732',
      status: 'published',
      publishedDate: new Date(article.publishedDate).toISOString()
    })
  })

  return response.json()
}

async function repopulateArticles() {
  console.log('🚀 Starting blog article repopulation via API...\n')
  
  let created = 0
  let skipped = 0
  let errors = 0

  for (const article of articles) {
    try {
      console.log(`📝 Creating "${article.title}"...`)
      
      const result = await createArticle(article)

      if (result.success) {
        console.log(`✅ Created successfully`)
        created++
      } else if (result.error && result.error.includes('already exists')) {
        console.log(`⚠️  Already exists, skipping`)
        skipped++
      } else {
        console.log(`❌ Error: ${result.error}`)
        errors++
      }
    } catch (error) {
      console.error(`❌ Error creating "${article.title}":`, error)
      errors++
    }
    
    console.log('')
  }

  console.log('='.repeat(80))
  console.log('\n✨ Blog article repopulation complete!\n')
  console.log(`📊 Summary:`)
  console.log(`   ✅ Created: ${created}`)
  console.log(`   ⚠️  Skipped: ${skipped}`)
  console.log(`   ❌ Errors: ${errors}`)
  console.log(`\n🌐 View articles at: ${API_URL}/blog\n`)
}

repopulateArticles().catch((error) => {
  console.error('Fatal error:', error)
  process.exit(1)
})
