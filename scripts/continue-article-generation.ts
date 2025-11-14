/**
 * Script to continue generating blog articles - checks existing and generates missing ones
 * Usage: npm run continue:articles
 */

import { prisma } from '../lib/prisma'
import { slugify } from '../lib/blog/utils'

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

async function sleep(ms: number) {
  return new Promise(resolve => setTimeout(resolve, ms))
}

async function checkExistingArticles() {
  const existingArticles = await prisma.blogArticle.findMany({
    select: { slug: true, title: true }
  })
  
  const existingSlugs = new Set(existingArticles.map(a => a.slug))
  const existingTitles = new Set(existingArticles.map(a => a.title.toLowerCase()))
  
  return { existingSlugs, existingTitles, existingArticles }
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

async function continueArticleGeneration() {
  console.log('🚀 Starting article generation continuation...\n')
  
  // Check existing articles
  console.log('📋 Checking existing articles...')
  const { existingSlugs, existingTitles } = await checkExistingArticles()
  console.log(`   Found ${existingSlugs.size} existing articles\n`)

  // Filter out articles that already exist
  const articlesToGenerate = articleTitles.filter(article => {
    const slug = slugify(article.title)
    const titleLower = article.title.toLowerCase()
    return !existingSlugs.has(slug) && !existingTitles.has(titleLower)
  })

  if (articlesToGenerate.length === 0) {
    console.log('✨ All articles have already been generated!')
    console.log(`\n📊 Summary:`)
    console.log(`   ✅ All ${articleTitles.length} articles exist`)
    console.log(`\n🌐 View articles at: ${API_URL}/blog`)
    await prisma.$disconnect()
    return
  }

  console.log(`📝 Will generate ${articlesToGenerate.length} missing articles`)
  console.log(`⏭️  Skipping ${articleTitles.length - articlesToGenerate.length} existing articles`)
  console.log(`📅 Date range: August 15, 2025 to October 5, 2025`)
  console.log(`\n💡 Note: Articles will be backdated to appear as if published during this period\n`)
  console.log('='.repeat(80))

  const results = []

  for (let i = 0; i < articlesToGenerate.length; i++) {
    const result = await generateAndPublishArticle(articlesToGenerate[i], i, articlesToGenerate.length)
    results.push(result)
    
    // Wait longer between articles to avoid rate limiting (60 seconds)
    if (i < articlesToGenerate.length - 1) {
      console.log('\n⏸️  Waiting 60 seconds before next article to avoid rate limits...\n')
      await sleep(60000)
    }
  }

  console.log('\n' + '='.repeat(80))
  console.log('\n✨ Article generation continuation complete!\n')
  
  const successful = results.filter(r => r.success).length
  const failed = results.filter(r => !r.success).length
  
  console.log(`📊 Summary:`)
  console.log(`   ✅ Successfully generated: ${successful}/${articlesToGenerate.length}`)
  console.log(`   ❌ Failed: ${failed}/${articlesToGenerate.length}`)
  console.log(`   ⏭️  Skipped (already exist): ${articleTitles.length - articlesToGenerate.length}`)
  
  if (successful > 0) {
    console.log(`\n🌐 View articles at: ${API_URL}/blog`)
  }
  
  await prisma.$disconnect()
}

continueArticleGeneration().catch((error) => {
  console.error('Fatal error:', error)
  process.exit(1)
})


