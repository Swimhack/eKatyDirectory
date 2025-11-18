/**
 * Generate a 1x1 tracking pixel URL for email opens
 * @param emailId UUID of the outreach_email record
 * @returns URL to tracking pixel endpoint
 */
export function generateTrackingPixel(emailId: string): string {
  const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://ekaty.fly.dev'
  return `${baseUrl}/api/webhooks/email/open/${emailId}`
}

/**
 * Generate a tracked link URL that redirects to destination
 * @param emailId UUID of the outreach_email record
 * @param destination URL to redirect to after tracking
 * @returns URL to tracking endpoint with redirect
 */
export function generateTrackingLink(
  emailId: string,
  destination: string
): string {
  const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://ekaty.fly.dev'
  const encodedDestination = encodeURIComponent(destination)
  return `${baseUrl}/api/webhooks/email/click/${emailId}?url=${encodedDestination}`
}

/**
 * Process Resend webhook event and extract relevant data
 * @param event Resend webhook payload
 * @returns Processed webhook data
 */
export function processWebhook(event: {
  type: string
  created_at: string
  data: {
    email_id?: string
    to?: string
    subject?: string
    [key: string]: any
  }
}) {
  const { type, created_at, data } = event

  // Map Resend event types to our tracking fields
  const eventTypeMap: Record<string, string> = {
    'email.sent': 'sent',
    'email.delivered': 'delivered',
    'email.opened': 'opened',
    'email.clicked': 'clicked',
    'email.bounced': 'bounced',
    'email.complained': 'complained',
    'email.unsubscribed': 'unsubscribed',
  }

  const mappedType = eventTypeMap[type] || 'unknown'

  return {
    type: mappedType,
    timestamp: new Date(created_at),
    emailProviderId: data.email_id,
    recipient: data.to,
    subject: data.subject,
    rawEvent: event,
  }
}

/**
 * Inject tracking pixel into email HTML
 * @param html Email HTML content
 * @param emailId UUID of the outreach_email record
 * @returns HTML with tracking pixel injected
 */
export function injectTrackingPixel(html: string, emailId: string): string {
  const pixelUrl = generateTrackingPixel(emailId)
  const trackingPixel = `<img src="${pixelUrl}" width="1" height="1" alt="" style="display:none;" />`

  // Inject before closing body tag
  if (html.includes('</body>')) {
    return html.replace('</body>', `${trackingPixel}</body>`)
  }

  // Fallback: append at the end
  return html + trackingPixel
}

/**
 * Replace links in email HTML with tracked links
 * @param html Email HTML content
 * @param emailId UUID of the outreach_email record
 * @returns HTML with tracked links
 */
export function injectTrackedLinks(html: string, emailId: string): string {
  // Match href attributes in anchor tags
  const hrefRegex = /href=["']([^"']+)["']/g

  return html.replace(hrefRegex, (match, url) => {
    // Don't track unsubscribe links, mailto links, or anchors
    if (
      url.startsWith('mailto:') ||
      url.startsWith('#') ||
      url.includes('unsubscribe')
    ) {
      return match
    }

    const trackedUrl = generateTrackingLink(emailId, url)
    return `href="${trackedUrl}"`
  })
}
