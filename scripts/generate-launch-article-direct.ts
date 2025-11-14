/**
 * Script to generate and publish the eKaty launch article via API
 */

const ADMIN_API_KEY = 'ekaty-admin-secret-2025'
const API_URL = process.env.API_URL || 'https://ekaty.fly.dev'

async function generateAndPublishArticle() {
  console.log('🚀 Generating eKaty launch article via API...\n')

  try {
    const title = 'eKaty Launch Celebration: Flyers, Deals, Coupons & Giveaways - Join the Buzz!'
    
    console.log(`📝 Title: "${title}"\n`)
    console.log('⏳ Generating article (this may take 30-60 seconds)...\n')

    const response = await fetch(`${API_URL}/api/admin/blog`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${ADMIN_API_KEY}`
      },
      body: JSON.stringify({
        action: 'quick_generate',
        title: title
      })
    })

    const data = await response.json()

    if (data.success) {
      console.log('✅ Article generated and published successfully!\n')
      console.log('='.repeat(80))
      console.log('ARTICLE DETAILS:')
      console.log('='.repeat(80))
      console.log(`\nTitle: ${data.article.title}`)
      console.log(`\nSlug: ${data.article.slug}`)
      console.log(`\nStatus: ${data.article.status}`)
      console.log(`\nPublished: ${data.article.publishedDate}`)
      console.log(`\nMeta Description: ${data.article.metaDescription}`)
      console.log(`\nKeywords: ${data.article.keywords}`)
      console.log('\n' + '='.repeat(80))
      console.log('\n✨ Article is now live!')
      console.log(`\n🌐 View it at: ${API_URL}/blog/${data.article.slug}`)
    } else {
      console.error('❌ Error:', data.error)
      process.exit(1)
    }

  } catch (error) {
    console.error('❌ Error generating article:', error)
    process.exit(1)
  }
}

generateAndPublishArticle()

