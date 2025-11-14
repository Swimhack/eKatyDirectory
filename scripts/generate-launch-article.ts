/**
 * Script to generate the eKaty launch buzz article
 */

import { generateArticleFromTitle } from '../lib/blog/anthropic'

async function generateLaunchArticle() {
  console.log('🚀 Generating eKaty launch article...\n')

  try {
    const title = 'eKaty Launch Celebration: Flyers, Deals, Coupons & Giveaways - Join the Buzz!'
    
    console.log(`📝 Generating article: "${title}"\n`)
    console.log('⏳ This may take 30-60 seconds...\n')

    const articleData = await generateArticleFromTitle(title)

    console.log('✅ Article generated successfully!\n')
    console.log('=' .repeat(80))
    console.log('TITLE:')
    console.log(articleData.title)
    console.log('\n' + '='.repeat(80))
    console.log('\nMETA DESCRIPTION:')
    console.log(articleData.metaDescription)
    console.log('\n' + '='.repeat(80))
    console.log('\nKEYWORDS:')
    console.log(articleData.keywords)
    console.log('\n' + '='(80))
    console.log('\nCONTENT:')
    console.log(articleData.content)
    console.log('\n' + '='.repeat(80))

    console.log('\n✨ Article generation complete!')
    console.log('\n💡 To publish this article, use the admin blog interface at /admin/blog')
    console.log('   or call the API endpoint POST /api/admin/blog with:')
    console.log(`   { "action": "quick_generate", "title": "${title}" }`)

  } catch (error) {
    console.error('❌ Error generating article:', error)
    process.exit(1)
  }
}

generateLaunchArticle()



