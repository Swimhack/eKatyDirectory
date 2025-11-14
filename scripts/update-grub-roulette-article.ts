/**
 * Script to update the Grub Roulette blog article to link to /spinner
 * Run with: npm run update:grub-roulette-article
 */

import { prisma } from '../lib/prisma'
import { fixBrokenLinksInContent } from '../lib/blog/utils'

async function updateGrubRouletteArticle() {
  const slug = 'cant-decide-what-to-eat-try-grub-roulette-for-family-fun'
  
  console.log(`🔍 Finding article with slug: ${slug}`)
  
  const article = await prisma.blogArticle.findUnique({
    where: { slug }
  })
  
  if (!article) {
    console.error(`❌ Article not found with slug: ${slug}`)
    await prisma.$disconnect()
    return
  }
  
  console.log(`✅ Found article: "${article.title}"`)
  console.log(`📝 Updating content to add links to /spinner...\n`)
  
  // Update content to add links to /spinner
  let updatedContent = article.content
  
  // Replace "Grub Roulette" mentions with links (but not if already in a link)
  // Use a more sophisticated regex that avoids replacing text inside <a> tags
  updatedContent = updatedContent.replace(
    /Grub Roulette/gi,
    (match, offset, string) => {
      // Check if we're inside an anchor tag
      const beforeText = string.substring(0, offset)
      const afterText = string.substring(offset + match.length)
      
      // Find the last <a> tag before this position
      const lastATag = beforeText.lastIndexOf('<a')
      const lastCloseATag = beforeText.lastIndexOf('</a>')
      
      // If there's an open <a> tag without a closing tag, we're inside a link
      if (lastATag > lastCloseATag) {
        return match // Don't replace, we're inside a link
      }
      
      // Replace with link
      return `<a href="/spinner" style="color: #3b82f6; font-weight: 600; text-decoration: underline;">${match}</a>`
    }
  )
  
  // Also add a prominent CTA link near the end
  if (!updatedContent.includes('href="/spinner"')) {
    // Add a call-to-action before the final paragraph
    const ctaSection = `
<br><br>
<div style="background-color: #eff6ff; border-left: 4px solid #3b82f6; padding: 1.5rem; margin: 2rem 0; border-radius: 0.5rem;">
  <h3 style="margin-top: 0; color: #1e40af;">🎰 Ready to Try Grub Roulette?</h3>
  <p style="margin-bottom: 1rem; color: #1e40af;">
    Don't just read about it – experience the fun! Use our interactive <a href="/spinner" style="color: #2563eb; font-weight: 600; text-decoration: underline;">Grub Roulette spinner</a> to discover your next family dining adventure in Katy.
  </p>
  <a href="/spinner" style="display: inline-block; background-color: #3b82f6; color: white; padding: 0.75rem 1.5rem; border-radius: 0.5rem; text-decoration: none; font-weight: 600; margin-top: 0.5rem;">
    🎰 Spin Now →
  </a>
</div>
`
    
    // Insert before the last section or at the end
    const lastParagraphIndex = updatedContent.lastIndexOf('<p>')
    if (lastParagraphIndex > updatedContent.length - 500) {
      // Insert before last paragraph
      updatedContent = updatedContent.substring(0, lastParagraphIndex) + ctaSection + updatedContent.substring(lastParagraphIndex)
    } else {
      // Append at the end
      updatedContent = updatedContent + ctaSection
    }
  }
  
  // Clean up any broken links
  updatedContent = fixBrokenLinksInContent(updatedContent)
  
  // Update the article
  const updated = await prisma.blogArticle.update({
    where: { id: article.id },
    data: {
      content: updatedContent
    }
  })
  
  console.log(`✅ Article updated successfully!`)
  console.log(`📄 Article ID: ${updated.id}`)
  console.log(`🔗 View at: https://ekaty.fly.dev/blog/${updated.slug}`)
  console.log(`\n✨ Links to /spinner have been added throughout the article!`)
  
  await prisma.$disconnect()
}

updateGrubRouletteArticle()
  .catch((error) => {
    console.error('Fatal error:', error)
    process.exit(1)
  })

