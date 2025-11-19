/**
 * Script to generate a single article with proper date
 * Usage: npm run generate:single-article "Article Title" "2025-08-15" "keywords, here"
 */

const ADMIN_API_KEY = 'ekaty-admin-secret-2025'
const API_URL = process.env.API_URL || 'https://ekaty.fly.dev'

const [,, title, date, keywords] = process.argv

if (!title || !date) {
  console.log('Usage: npm run generate:single-article "Article Title" "2025-08-15" "keywords, here"')
  process.exit(1)
}

async function generateArticle() {
  console.log(`\n🚀 Generating article...\n`)
  console.log(`📝 Title: "${title}"`)
  console.log(`📅 Date: ${date}`)
  if (keywords) console.log(`🔑 Keywords: ${keywords}`)
  console.log('⏳ This may take 30-60 seconds...\n')

  try {
    const response = await fetch(`${API_URL}/api/admin/blog`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${ADMIN_API_KEY}`
      },
      body: JSON.stringify({
        action: 'quick_generate',
        title: title,
        status: 'published'
      })
    })

    const data = await response.json()

    if (data.success && data.article) {
      // Update with specific date and keywords
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
          keywords: keywords || data.article.keywords,
          authorName: data.article.authorName,
          contactEmail: data.article.contactEmail,
          phoneNumber: data.article.phoneNumber,
          status: 'published',
          publishedDate: new Date(date).toISOString()
        })
      })

      const updateData = await updateResponse.json()

      if (updateData.success) {
        console.log(`\n✅ Article published successfully!`)
        console.log(`   Slug: ${data.article.slug}`)
        console.log(`   Date: ${date}`)
        console.log(`   URL: ${API_URL}/blog/${data.article.slug}`)
      } else {
        console.log(`⚠️  Article created but date update failed: ${updateData.error}`)
      }
    } else {
      console.error(`❌ Error: ${data.error}`)
      process.exit(1)
    }
  } catch (error) {
    console.error(`❌ Error:`, error)
    process.exit(1)
  }
}

generateArticle()







