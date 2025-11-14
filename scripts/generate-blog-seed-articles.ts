/**
 * Script to generate 10 SEO-optimized blog articles for eKaty blog launch
 * Run with: npm run generate:blog-seed
 */

import { prisma } from '../lib/prisma'
import { generateArticleWithAI } from '../lib/blog/anthropic'
import { slugify } from '../lib/blog/utils'

const articleTitles = [
  'Best Family-Friendly Restaurants in Katy, Texas: A Complete Guide for Parents',
  'Kid-Friendly Menus: Where to Dine with Picky Eaters in Katy',
  'Budget-Friendly Family Dining: Great Meals Under $50 in Katy',
  'Weekend Brunch Spots Perfect for Families in Katy, Texas',
  'Birthday Party Restaurants: Where to Celebrate in Katy',
  'Outdoor Dining: Patio Restaurants Perfect for Katy Families',
  'Date Night Spots with Kid-Friendly Options in Katy',
  'Healthy Options: Nutritious Family Dining in Katy, Texas',
  'Quick Bites: Fast-Casual Spots for Busy Katy Families',
  'Holiday Dining: Where to Celebrate with Family in Katy, Texas'
]

async function generateSeedArticles() {
  console.log('🚀 Starting blog seed article generation...\n')
  console.log(`📝 Will generate ${articleTitles.length} SEO-optimized articles\n`)

  let successCount = 0
  let skipCount = 0
  let errorCount = 0

  for (let i = 0; i < articleTitles.length; i++) {
    const title = articleTitles[i]
    console.log(`[${i + 1}/${articleTitles.length}] Generating: "${title}"`)

    try {
      // Check if article already exists
      const slug = slugify(title)
      const existing = await prisma.blogArticle.findUnique({
        where: { slug }
      })

      if (existing) {
        console.log(`   ⚠️  Article already exists (slug: ${slug}), skipping...\n`)
        skipCount++
        continue
      }

      // Generate article with AI
      console.log(`   🤖 Calling AI to generate content...`)
      const articleData = await generateArticleWithAI({
        title,
        length: 'medium',
        tone: 'casual',
        keywords: `Katy Texas, family dining, family-friendly restaurants, ${title.toLowerCase().split(' ').slice(0, 3).join(' ')}`
      })

      // Create article in database
      const article = await prisma.blogArticle.create({
        data: {
          title: articleData.title,
          slug: slugify(articleData.title),
          content: articleData.content,
          metaDescription: articleData.metaDescription,
          keywords: articleData.keywords,
          authorName: 'James Strickland',
          contactEmail: 'james@stricklandtechnology.net',
          phoneNumber: '713-444-6732',
          status: 'published',
          publishedDate: new Date()
        }
      })

      console.log(`   ✅ Created: ${article.title}`)
      console.log(`   📝 Slug: /blog/${article.slug}`)
      console.log(`   📊 Status: ${article.status}\n`)
      successCount++

      // Wait 3 seconds between requests to avoid rate limiting
      if (i < articleTitles.length - 1) {
        console.log(`   ⏳ Waiting 3 seconds before next article...\n`)
        await new Promise(resolve => setTimeout(resolve, 3000))
      }
    } catch (error: any) {
      console.error(`   ❌ Error generating "${title}":`, error.message)
      console.log('')
      errorCount++
    }
  }

  console.log('\n✨ Blog seed article generation complete!')
  console.log(`\n📊 Summary:`)
  console.log(`   ✅ Successfully created: ${successCount}`)
  console.log(`   ⚠️  Skipped (already exists): ${skipCount}`)
  console.log(`   ❌ Errors: ${errorCount}`)
  console.log(`\n🌐 View articles at: https://ekaty.fly.dev/blog`)
  
  await prisma.$disconnect()
}

generateSeedArticles()
  .catch((error) => {
    console.error('Fatal error:', error)
    process.exit(1)
  })

