/**
 * Script to generate 10 SEO-optimized blog articles spaced over 8 weeks
 * Dates: August 15, 2025 to October 5, 2025
 */

const ADMIN_API_KEY = 'ekaty-admin-secret-2025'
const API_URL = process.env.API_URL || 'https://ekaty.fly.dev'

// Article titles optimized for SEO and family engagement
// Dates span 8 weeks from August 15, 2025 to October 5, 2025
const articleTitles = [
  {
    title: 'Best Family-Friendly Restaurants in Katy Texas 2025: Top 15 Kid-Friendly Dining Spots',
    date: '2025-08-15',
    keywords: 'family-friendly restaurants Katy Texas 2025, kid-friendly restaurants Katy, best family dining Katy TX, restaurants with kids menu Katy'
  },
  {
    title: 'Back to School Dining Deals in Katy 2025: Family Restaurant Specials for August',
    date: '2025-08-22',
    keywords: 'back to school deals Katy Texas 2025, restaurant specials Katy, family dining deals August 2025, Katy restaurant promotions'
  },
  {
    title: 'Weekend Brunch Spots in Katy Texas 2025: Best Family Brunch Restaurants for Saturday & Sunday',
    date: '2025-08-29',
    keywords: 'brunch restaurants Katy Texas 2025, weekend brunch Katy, family brunch spots Katy TX, best brunch Katy 2025'
  },
  {
    title: 'Labor Day Weekend Dining Guide 2025: Top Katy Restaurants Open for Family Celebrations',
    date: '2025-09-05',
    keywords: 'Labor Day restaurants Katy Texas 2025, Labor Day weekend dining Katy, family restaurants open Labor Day, Katy TX holiday dining'
  },
  {
    title: 'Budget-Friendly Family Restaurants in Katy 2025: Great Meals Under $50 for Families of 4',
    date: '2025-09-12',
    keywords: 'budget restaurants Katy Texas 2025, affordable family dining Katy, cheap eats Katy TX, family restaurants under $50 Katy'
  },
  {
    title: 'Best Outdoor Patio Dining in Katy Texas 2025: Family-Friendly Restaurants with Patios',
    date: '2025-09-19',
    keywords: 'patio dining Katy Texas 2025, outdoor restaurants Katy, family patio restaurants Katy TX, al fresco dining Katy'
  },
  {
    title: 'Birthday Party Restaurants in Katy 2025: Top 10 Family-Friendly Venues for Kids Birthdays',
    date: '2025-09-26',
    keywords: 'birthday party restaurants Katy Texas 2025, kids birthday party venues Katy, family birthday dining Katy TX, birthday celebration restaurants'
  },
  {
    title: 'Fall Family Dining Guide 2025: Best Katy Restaurants for Autumn Family Meals',
    date: '2025-10-03',
    keywords: 'fall dining Katy Texas 2025, autumn restaurants Katy, family fall dining Katy TX, seasonal restaurants Katy 2025'
  },
  {
    title: 'Date Night Restaurants in Katy Texas 2025: Top 12 Romantic Dining Spots for Parents',
    date: '2025-09-15',
    keywords: 'date night restaurants Katy Texas 2025, romantic dining Katy, couples restaurants Katy TX, fine dining Katy for couples'
  },
  {
    title: 'Mexican Restaurants in Katy Texas 2025: Best Family-Friendly Mexican Food Spots',
    date: '2025-08-28',
    keywords: 'Mexican restaurants Katy Texas 2025, family Mexican dining Katy, best Mexican food Katy TX, authentic Mexican restaurants Katy'
  }
]

// Calculate dates spaced out over 8 weeks
function calculateDates() {
  const startDate = new Date('2025-08-15')
  const endDate = new Date('2025-10-05')
  const totalDays = Math.floor((endDate.getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24))
  const daysBetween = totalDays / (articleTitles.length - 1)
  
  return articleTitles.map((article, index) => {
    const daysToAdd = Math.floor(index * daysBetween)
    const date = new Date(startDate)
    date.setDate(date.getDate() + daysToAdd)
    return {
      ...article,
      date: date.toISOString().split('T')[0]
    }
  })
}

async function sleep(ms: number) {
  return new Promise(resolve => setTimeout(resolve, ms))
}

async function generateAndPublishArticle(article: typeof articleTitles[0], index: number, total: number, retries = 3) {
  console.log(`\n[${index + 1}/${total}] Generating: "${article.title}"`)
  console.log(`📅 Scheduled for: ${article.date}`)
  console.log('⏳ This may take 30-60 seconds...\n')

  for (let attempt = 1; attempt <= retries; attempt++) {
    try {
      if (attempt > 1) {
        const waitTime = Math.min(30000 * attempt, 120000) // Max 2 minutes
        console.log(`⏸️  Retry attempt ${attempt}/${retries} - waiting ${waitTime/1000} seconds...\n`)
        await sleep(waitTime)
      }

      const response = await fetch(`${API_URL}/api/admin/blog`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${ADMIN_API_KEY}`
        },
        body: JSON.stringify({
          action: 'quick_generate',
          title: article.title,
          status: 'published'
        })
      })

      const data = await response.json()

      if (data.success && data.article) {
        // Update the article with the specific publish date
        const updateResponse = await fetch(`${API_URL}/api/admin/blog`, {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${ADMIN_API_KEY}`
          },
          body: JSON.stringify({
            id: data.article.id,
            title: data.article.title,
            content: data.article.content,
            metaDescription: data.article.metaDescription,
            keywords: article.keywords || data.article.keywords,
            authorName: data.article.authorName,
            contactEmail: data.article.contactEmail,
            phoneNumber: data.article.phoneNumber,
            status: 'published',
            publishedDate: new Date(article.date).toISOString()
          })
        })

        const updateData = await updateResponse.json()

        if (updateData.success) {
          console.log(`✅ Article published successfully!`)
          console.log(`   Slug: ${data.article.slug}`)
          console.log(`   Date: ${article.date}`)
          console.log(`   URL: ${API_URL}/blog/${data.article.slug}`)
          return { success: true, article: updateData.article }
        } else {
          console.log(`⚠️  Article created but date update failed: ${updateData.error}`)
          return { success: true, article: data.article }
        }
      } else {
        const errorMsg = data.error || 'Unknown error'
        if (errorMsg.includes('Overloaded') && attempt < retries) {
          console.log(`⚠️  API overloaded, will retry...`)
          continue
        }
        console.error(`❌ Error: ${errorMsg}`)
        return { success: false, error: errorMsg }
      }
    } catch (error) {
      const errorMsg = error instanceof Error ? error.message : 'Unknown error'
      if (attempt < retries) {
        console.log(`⚠️  Error occurred, will retry: ${errorMsg}`)
        continue
      }
      console.error(`❌ Error generating article:`, errorMsg)
      return { success: false, error: errorMsg }
    }
  }

  return { success: false, error: 'Max retries exceeded' }
}

async function generateAllArticles() {
  console.log('🚀 Starting batch article generation...\n')
  console.log(`📝 Will generate ${articleTitles.length} SEO-optimized articles`)
  console.log(`📅 Date range: August 15, 2025 to October 5, 2025 (past 8 weeks)`)
  console.log(`📅 Current date: ${new Date().toISOString().split('T')[0]}`)
  console.log(`\n💡 Note: Articles will be backdated to appear as if published during this period\n`)
  console.log('='.repeat(80))

  const articlesWithDates = calculateDates()
  const results = []

  for (let i = 0; i < articlesWithDates.length; i++) {
    const result = await generateAndPublishArticle(articlesWithDates[i], i, articlesWithDates.length)
    results.push(result)
    
    // Wait longer between articles to avoid rate limiting (60 seconds)
    if (i < articlesWithDates.length - 1) {
      console.log('\n⏸️  Waiting 60 seconds before next article to avoid rate limits...\n')
      await sleep(60000)
    }
  }

  console.log('\n' + '='.repeat(80))
  console.log('\n✨ Batch article generation complete!\n')
  
  const successful = results.filter(r => r.success).length
  const failed = results.filter(r => !r.success).length
  
  console.log(`📊 Summary:`)
  console.log(`   ✅ Successful: ${successful}/${articleTitles.length}`)
  console.log(`   ❌ Failed: ${failed}/${articleTitles.length}`)
  
  if (successful > 0) {
    console.log(`\n🌐 View articles at: ${API_URL}/blog`)
  }
}

generateAllArticles().catch(console.error)

