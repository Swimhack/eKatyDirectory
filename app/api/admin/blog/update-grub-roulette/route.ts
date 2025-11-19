import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { fixBrokenLinksInContent } from '@/lib/blog/utils'

// Verify admin authentication
function verifyAdminAuth(request: Request): boolean {
  const authHeader = request.headers.get('authorization')
  const apiKey = process.env.ADMIN_API_KEY || 'ekaty-admin-secret-2025'
  
  return authHeader === `Bearer ${apiKey}`
}

// POST - Update Grub Roulette article to add links to /spinner
export async function POST(request: NextRequest) {
  if (!verifyAdminAuth(request)) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  try {
    const slug = 'cant-decide-what-to-eat-try-grub-roulette-for-family-fun'
    
    const article = await prisma.blogArticle.findUnique({
      where: { slug }
    })
    
    if (!article) {
      return NextResponse.json(
        { error: 'Article not found' },
        { status: 404 }
      )
    }
    
    // Update content to add links to /spinner
    let updatedContent = article.content
    
    // Replace "Grub Roulette" mentions with links (but not if already in a link)
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
    
    // Add a prominent CTA section if not already present
    if (!updatedContent.includes('href="/spinner"')) {
      const ctaSection = `
<br><br>
<div style="background-color: #eff6ff; border-left: 4px solid #3b82f6; padding: 1.5rem; margin: 2rem 0; border-radius: 0.5rem;">
  <h3 style="margin-top: 0; color: #1e40af; font-size: 1.5rem; font-weight: 600;">🎰 Ready to Try Grub Roulette?</h3>
  <p style="margin-bottom: 1rem; color: #1e40af; font-size: 1.125rem;">
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
        updatedContent = updatedContent.substring(0, lastParagraphIndex) + ctaSection + updatedContent.substring(lastParagraphIndex)
      } else {
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
    
    return NextResponse.json({
      success: true,
      message: 'Article updated successfully with links to /spinner',
      article: {
        id: updated.id,
        title: updated.title,
        slug: updated.slug
      }
    })
  } catch (error: any) {
    console.error('Error updating article:', error)
    return NextResponse.json(
      { error: 'Failed to update article', message: error.message },
      { status: 500 }
    )
  }
}







