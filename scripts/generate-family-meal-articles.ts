/**
 * Generate 10 SEO-optimized blog articles about family meal planning trends
 * Fun, engaging content without promoting specific restaurants
 */

const BASE_URL = process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000'
const ADMIN_KEY = process.env.ADMIN_API_KEY || 'ekaty-admin-secret-2025'

const articleTitles = [
  "Sheet Pan Suppers: The Ultimate Time-Saving Family Dinner Hack for Busy Weeknights",
  "Meal Prep Sunday: How Houston Families Are Revolutionizing Their Weekly Dinner Routine",
  "The Rise of Plant-Forward Family Meals: Making Vegetables the Star Without the Fuss",
  "Taco Tuesday 2.0: Creative Ways Katy Families Are Reinventing Family Dinner Night Traditions",
  "The 15-Minute Meal Movement: Quick Family Dinners That Actually Taste Amazing",
  "Build-Your-Own Bowl Nights: Why Customizable Family Meals Are Taking Over Katy Kitchens",
  "Freezer Friendly Favorites: How Smart Families Are Beating Weeknight Dinner Stress",
  "The Breakfast-for-Dinner Trend: Why Houston Parents Are Flipping the Script on Family Meals",
  "One-Pot Wonders: The Secret to Less Cleanup and More Family Time at Dinner",
  "Theme Night Magic: How Creative Dinner Themes Are Making Family Meals Fun Again"
]

async function generateArticle(title: string, index: number) {
  console.log(`\n[${index + 1}/10] Generating: "${title}"`)

  try {
    const response = await fetch(`${BASE_URL}/api/admin/blog`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${ADMIN_KEY}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        action: 'quick_generate',
        title: title,
        authorName: 'The eKaty Team',
        contactEmail: 'hello@ekaty.com',
        phoneNumber: '281-555-MEAL',
        status: 'published'
      })
    })

    if (!response.ok) {
      const error = await response.json()
      throw new Error(error.error || `HTTP ${response.status}`)
    }

    const result = await response.json()
    console.log(`✅ Success: ${result.article.slug}`)
    console.log(`   Published: ${result.article.publishedDate}`)
    console.log(`   Keywords: ${result.article.keywords?.slice(0, 50)}...`)

    return { success: true, article: result.article }
  } catch (error) {
    console.error(`❌ Failed: ${error instanceof Error ? error.message : String(error)}`)
    return { success: false, error: error instanceof Error ? error.message : String(error) }
  }
}

async function generateAllArticles() {
  console.log('🚀 Starting generation of 10 family meal planning articles...\n')
  console.log('Target: Fun, SEO-optimized content about local meal planning trends')
  console.log('Note: No restaurant promotion - pure helpful content!\n')
  console.log('=' .repeat(70))

  const results = []

  for (let i = 0; i < articleTitles.length; i++) {
    const result = await generateArticle(articleTitles[i], i)
    results.push(result)

    // Rate limiting - wait 3 seconds between generations to avoid overwhelming the API
    if (i < articleTitles.length - 1) {
      console.log('   ⏳ Waiting 3 seconds before next article...')
      await new Promise(resolve => setTimeout(resolve, 3000))
    }
  }

  console.log('\n' + '=' .repeat(70))
  console.log('\n📊 GENERATION SUMMARY')
  console.log('=' .repeat(70))

  const successful = results.filter(r => r.success)
  const failed = results.filter(r => !r.success)

  console.log(`✅ Successfully generated: ${successful.length}`)
  console.log(`❌ Failed: ${failed.length}`)

  if (successful.length > 0) {
    console.log('\n✨ Published Articles:')
    successful.forEach((result, i) => {
      if (result.article) {
        console.log(`   ${i + 1}. ${result.article.title}`)
        console.log(`      → https://ekaty.com/blog/${result.article.slug}`)
      }
    })
  }

  if (failed.length > 0) {
    console.log('\n⚠️  Failed Articles:')
    failed.forEach((result, i) => {
      console.log(`   ${i + 1}. ${result.error}`)
    })
  }

  console.log('\n' + '=' .repeat(70))
  console.log('🎉 Article generation complete!\n')
}

// Run the generator
generateAllArticles().catch(console.error)
