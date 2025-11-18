import { Resend } from 'resend'

// Initialize Resend client
const resend = new Resend(process.env.RESEND_API_KEY)

/**
 * Send an email using Resend API
 * @param options Email sending options
 * @returns Resend email response with email ID
 * @throws Error if sending fails
 */
export async function sendEmail(options: {
  to: string | string[]
  subject: string
  html: string
  from?: string
  tags?: Record<string, string>
}) {
  try {
    const { to, subject, html, from = 'eKaty <noreply@ekaty.com>', tags } = options

    const response = await resend.emails.send({
      from,
      to,
      subject,
      html,
      tags,
    })

    if (response.error) {
      throw new Error(`Email sending failed: ${response.error.message}`)
    }

    return {
      id: response.data?.id,
      success: true,
    }
  } catch (error) {
    console.error('Email sending error:', error)
    throw error instanceof Error
      ? error
      : new Error('Unknown email sending error')
  }
}

/**
 * Send multiple emails in batch (respecting rate limits)
 * @param emails Array of email options
 * @returns Array of results
 */
export async function sendBatchEmails(
  emails: Array<{
    to: string
    subject: string
    html: string
    from?: string
    tags?: Record<string, string>
  }>
) {
  const results = []

  for (const email of emails) {
    try {
      const result = await sendEmail(email)
      results.push({ success: true, result, email: email.to })
    } catch (error) {
      results.push({
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error',
        email: email.to,
      })
    }
  }

  return results
}
