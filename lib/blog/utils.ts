/**
 * Blog utility functions for eKaty
 */

export function slugify(text: string): string {
  return text
    .toString()
    .toLowerCase()
    .trim()
    .replace(/\s+/g, '-')
    .replace(/[^\w\-]+/g, '')
    .replace(/\-\-+/g, '-')
    .replace(/^-+/, '')
    .replace(/-+$/, '')
}

export function generateExcerpt(content: string, length: number = 150): string {
  const text = content.replace(/<[^>]*>/g, '') // Remove HTML tags
  if (text.length <= length) return text
  const excerpt = text.substring(0, length)
  const lastSpace = excerpt.lastIndexOf(' ')
  return lastSpace > 0 ? excerpt.substring(0, lastSpace) + '...' : excerpt + '...'
}

export function estimateReadingTime(content: string): number {
  const text = content.replace(/<[^>]*>/g, '')
  const words = text.split(/\s+/).filter(word => word.length > 0)
  const minutes = Math.ceil(words.length / 200)
  return Math.max(1, minutes)
}

export function parseKeywords(keywords: string | null): string[] {
  if (!keywords) return []
  return keywords
    .split(',')
    .map(k => k.trim())
    .filter(k => k.length > 0)
}

export function fixBrokenLinksInContent(content: string): string {
  // Define valid internal links mapping for eKaty
  const linkReplacements: Record<string, string> = {
    // Restaurant pages
    '/restaurants': '/discover',
    '/restaurant': '/discover',
    'restaurants': '/discover',
    
    // Main pages
    '/contact': '/contact',
    'contact': '/contact',
    '/discover': '/discover',
    '/categories': '/categories',
    '/spinner': '/spinner',
    '/grub-roulette': '/spinner',
  }
  
  let fixedContent = content
  
  // Fix href links
  for (const [broken, fixed] of Object.entries(linkReplacements)) {
    const patterns = [
      new RegExp(`href=["']${broken.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}["']`, 'gi'),
      new RegExp(`href=["']${broken.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}/["']`, 'gi'),
    ]
    
    patterns.forEach(pattern => {
      fixedContent = fixedContent.replace(pattern, `href="${fixed}"`)
    })
  }
  
  // Fix placeholder links
  fixedContent = fixedContent.replace(/href=["']#["']/gi, 'href="/contact"')
  fixedContent = fixedContent.replace(/href=["']\/["']/gi, 'href="/"')
  
  return fixedContent
}

export function generateArticleSchema(article: {
  title: string
  metaDescription?: string | null
  content: string
  publishedDate?: Date | null
  authorName: string
  slug: string
}) {
  const baseUrl = process.env.NEXT_PUBLIC_APP_URL || 'https://ekaty.fly.dev'
  
  return {
    '@context': 'https://schema.org',
    '@type': 'Article',
    headline: article.title,
    description: article.metaDescription || generateExcerpt(article.content),
    datePublished: article.publishedDate ? new Date(article.publishedDate).toISOString() : new Date().toISOString(),
    dateModified: new Date().toISOString(),
    author: {
      '@type': 'Person',
      name: article.authorName || 'James Strickland'
    },
    publisher: {
      '@type': 'Organization',
      name: 'eKaty',
      logo: {
        '@type': 'ImageObject',
        url: `${baseUrl}/logo.png`
      }
    },
    mainEntityOfPage: {
      '@type': 'WebPage',
      '@id': `${baseUrl}/blog/${article.slug}`
    }
  }
}





