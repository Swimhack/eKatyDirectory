/**
 * Script to generate full AI content for all blog articles
 * Run with: npx ts-node scripts/generate-full-blog-content.ts
 */

const API_URL = 'https://ekaty.fly.dev'
const ADMIN_API_KEY = 'ekaty-admin-secret-2025'

const articleSlugs = [
  'best-family-friendly-restaurants-in-katy-texas-2025-top-15-kid-friendly-dining-spots',
  'back-to-school-dining-deals-in-katy-2025-family-restaurant-specials-for-august',
  'weekend-brunch-spots-in-katy-texas-2025-best-family-brunch-restaurants-for-saturday-sunday',
  'labor-day-weekend-dining-guide-2025-top-katy-restaurants-open-for-family-celebrations',
  'budget-friendly-family-restaurants-in-katy-2025-great-meals-under-50-for-families-of-4',
  'best-outdoor-patio-dining-in-katy-texas-2025-family-friendly-restaurants-with-patios',
  'birthday-party-restaurants-in-katy-2025-top-10-family-friendly-venues-for-kids-birthdays',
  'fall-family-dining-guide-2025-best-katy-restaurants-for-autumn-family-meals',
  'date-night-restaurants-in-katy-texas-2025-top-12-romantic-dining-spots-for-parents',
  'mexican-restaurants-in-katy-texas-2025-best-family-friendly-mexican-food-spots'
]

async function sleep(ms: number) {
  return new Promise(resolve => setTimeout(resolve, ms))
}

async function getArticle(slug: string) {
  const response = await fetch(`${API_URL}/api/blog?slug=${slug}`)
  if (!response.ok) {
    return null
  }
  const data = await response.json()
  return data // API returns article directly when using slug parameter
}

async function updateArticleContent(article: any) {
  // First, generate new content using quick_generate
  const generateResponse = await fetch(`${API_URL}/api/admin/blog`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${ADMIN_API_KEY}`
    },
    body: JSON.stringify({
      action: 'quick_generate',
      title: article.title
    })
  })

  const generated = await generateResponse.json()
  
  if (!generated.success || !generated.article) {
    return generated
  }

  // Then update the existing article with the new content
  const updateResponse = await fetch(`${API_URL}/api/admin/blog`, {
    method: 'PUT',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${ADMIN_API_KEY}`
    },
    body: JSON.stringify({
      id: article.id,
      title: article.title,
      content: generated.article.content,
      metaDescription: generated.article.metaDescription,
      keywords: article.keywords || generated.article.keywords,
      authorName: article.authorName,
      contactEmail: article.contactEmail,
      phoneNumber: article.phoneNumber,
      status: article.status,
      publishedDate: article.publishedDate
    })
  })

  return updateResponse.json()
}

async function generateAllContent() {
  console.log('🚀 Starting full content generation for all blog articles...\n')
  console.log(`📝 Will regenerate ${articleSlugs.length} articles with AI content`)
  console.log(`⏱️  This will take approximately ${Math.ceil(articleSlugs.length * 1.5)} minutes\n`)
  console.log('='.repeat(80) + '\n')
  
  let success = 0
  let errors = 0

  for (let i = 0; i < articleSlugs.length; i++) {
    const slug = articleSlugs[i]
    
    try {
      console.log(`[${i + 1}/${articleSlugs.length}] Processing: ${slug}`)
      
      // Get the article
      console.log('   📖 Fetching article...')
      const article = await getArticle(slug)
      
      if (!article) {
        console.log('   ❌ Article not found\n')
        errors++
        continue
      }

      // Check if it needs regeneration
      if (article.content && !article.content.includes('currently being generated')) {
        console.log('   ✅ Already has full content, skipping\n')
        success++
        continue
      }

      // Generate new content with AI
      console.log('   🤖 Generating AI content (this takes 30-60 seconds)...')
      const result = await updateArticleContent(article)

      if (result.success) {
        console.log('   ✅ Content generated successfully!')
        console.log(`   📝 URL: ${API_URL}/blog/${slug}\n`)
        success++
      } else {
        console.log(`   ❌ Error: ${result.error}\n`)
        errors++
      }

      // Wait between requests to avoid rate limiting
      if (i < articleSlugs.length - 1) {
        console.log('   ⏸️  Waiting 90 seconds before next article...\n')
        await sleep(90000)
      }
    } catch (error) {
      console.error(`   ❌ Error processing ${slug}:`, error)
      errors++
      console.log('')
    }
  }

  console.log('='.repeat(80))
  console.log('\n✨ Content generation complete!\n')
  console.log(`📊 Summary:`)
  console.log(`   ✅ Success: ${success}/${articleSlugs.length}`)
  console.log(`   ❌ Errors: ${errors}/${articleSlugs.length}`)
  console.log(`\n🌐 View all articles at: ${API_URL}/blog\n`)
}

generateAllContent().catch((error) => {
  console.error('Fatal error:', error)
  process.exit(1)
})
