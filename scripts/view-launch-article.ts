/**
 * Script to view the eKaty launch article content
 */

const API_URL = process.env.API_URL || 'https://ekaty.fly.dev'

async function viewArticle() {
  try {
    const slug = 'ekaty-launch-celebration-flyers-deals-giveaways-join-the-buzz'
    
    const response = await fetch(`${API_URL}/api/blog`)
    const data = await response.json()
    
    const article = data.articles?.find((a: any) => a.slug === slug)
    
    if (article) {
      console.log('='.repeat(80))
      console.log('ARTICLE CONTENT:')
      console.log('='.repeat(80))
      console.log(`\nTitle: ${article.title}`)
      console.log(`\nMeta Description: ${article.metaDescription}`)
      console.log(`\nKeywords: ${article.keywords}`)
      console.log('\n' + '='.repeat(80))
      console.log('\nCONTENT PREVIEW (first 2000 chars):\n')
      console.log(article.content.substring(0, 2000))
      console.log('\n' + '='.repeat(80))
      console.log(`\n🌐 Full article: ${API_URL}/blog/${slug}`)
    } else {
      console.log('Article not found')
    }
  } catch (error) {
    console.error('Error:', error)
  }
}

viewArticle()





