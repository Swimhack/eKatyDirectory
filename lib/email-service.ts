/**
 * Email Service
 *
 * Unified email sending service that supports multiple providers:
 * - SendGrid (recommended)
 * - Resend (modern alternative)
 * - Postmark (high deliverability)
 * - SMTP (fallback)
 */

import {
  paymentSuccessEmail,
  paymentFailedEmail,
  trialEndingEmail,
  subscriptionCanceledEmail,
  subscriptionChangedEmail
} from './email-templates'

export interface EmailOptions {
  to: string
  subject: string
  html: string
  text: string
  from?: string
}

/**
 * Email Service Configuration
 */
const emailConfig = {
  provider: (process.env.EMAIL_PROVIDER || 'sendgrid') as 'sendgrid' | 'resend' | 'postmark' | 'smtp',
  from: process.env.EMAIL_FROM || 'billing@ekaty.com',
  fromName: process.env.EMAIL_FROM_NAME || 'eKaty.com Billing',

  // SendGrid
  sendgridApiKey: process.env.SENDGRID_API_KEY,

  // Resend
  resendApiKey: process.env.RESEND_API_KEY,

  // Postmark
  postmarkApiKey: process.env.POSTMARK_API_KEY,

  // SMTP
  smtpHost: process.env.SMTP_HOST,
  smtpPort: parseInt(process.env.SMTP_PORT || '587'),
  smtpUser: process.env.SMTP_USER,
  smtpPassword: process.env.SMTP_PASSWORD
}

/**
 * Send email using configured provider
 */
export async function sendEmail(options: EmailOptions): Promise<boolean> {
  const from = options.from || `${emailConfig.fromName} <${emailConfig.from}>`

  try {
    switch (emailConfig.provider) {
      case 'sendgrid':
        return await sendWithSendGrid({ ...options, from })
      case 'resend':
        return await sendWithResend({ ...options, from })
      case 'postmark':
        return await sendWithPostmark({ ...options, from })
      case 'smtp':
        return await sendWithSMTP({ ...options, from })
      default:
        console.error('No valid email provider configured')
        return false
    }
  } catch (error) {
    console.error('Email sending failed:', error)
    return false
  }
}

/**
 * SendGrid Implementation
 */
async function sendWithSendGrid(options: EmailOptions): Promise<boolean> {
  if (!emailConfig.sendgridApiKey) {
    console.warn('SendGrid API key not configured, skipping email')
    return false
  }

  try {
    const response = await fetch('https://api.sendgrid.com/v3/mail/send', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${emailConfig.sendgridApiKey}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        personalizations: [{
          to: [{ email: options.to }],
          subject: options.subject
        }],
        from: { email: emailConfig.from, name: emailConfig.fromName },
        content: [
          { type: 'text/plain', value: options.text },
          { type: 'text/html', value: options.html }
        ]
      })
    })

    if (!response.ok) {
      const error = await response.text()
      console.error('SendGrid error:', error)
      return false
    }

    console.log(`Email sent to ${options.to} via SendGrid`)
    return true
  } catch (error) {
    console.error('SendGrid send failed:', error)
    return false
  }
}

/**
 * Resend Implementation
 */
async function sendWithResend(options: EmailOptions): Promise<boolean> {
  if (!emailConfig.resendApiKey) {
    console.warn('Resend API key not configured, skipping email')
    return false
  }

  try {
    const response = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${emailConfig.resendApiKey}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        from: options.from,
        to: options.to,
        subject: options.subject,
        html: options.html,
        text: options.text
      })
    })

    if (!response.ok) {
      const error = await response.text()
      console.error('Resend error:', error)
      return false
    }

    console.log(`Email sent to ${options.to} via Resend`)
    return true
  } catch (error) {
    console.error('Resend send failed:', error)
    return false
  }
}

/**
 * Postmark Implementation
 */
async function sendWithPostmark(options: EmailOptions): Promise<boolean> {
  if (!emailConfig.postmarkApiKey) {
    console.warn('Postmark API key not configured, skipping email')
    return false
  }

  try {
    const response = await fetch('https://api.postmarkapp.com/email', {
      method: 'POST',
      headers: {
        'X-Postmark-Server-Token': emailConfig.postmarkApiKey,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        From: options.from,
        To: options.to,
        Subject: options.subject,
        HtmlBody: options.html,
        TextBody: options.text,
        MessageStream: 'outbound'
      })
    })

    if (!response.ok) {
      const error = await response.text()
      console.error('Postmark error:', error)
      return false
    }

    console.log(`Email sent to ${options.to} via Postmark`)
    return true
  } catch (error) {
    console.error('Postmark send failed:', error)
    return false
  }
}

/**
 * SMTP Implementation (using nodemailer)
 */
async function sendWithSMTP(options: EmailOptions): Promise<boolean> {
  if (!emailConfig.smtpHost || !emailConfig.smtpUser || !emailConfig.smtpPassword) {
    console.warn('SMTP credentials not configured, skipping email')
    return false
  }

  try {
    // Note: This requires the nodemailer package
    // Install with: npm install nodemailer @types/nodemailer
    const nodemailer = await import('nodemailer')

    const transporter = nodemailer.createTransport({
      host: emailConfig.smtpHost,
      port: emailConfig.smtpPort,
      secure: emailConfig.smtpPort === 465,
      auth: {
        user: emailConfig.smtpUser,
        pass: emailConfig.smtpPassword
      }
    })

    await transporter.sendMail({
      from: options.from,
      to: options.to,
      subject: options.subject,
      text: options.text,
      html: options.html
    })

    console.log(`Email sent to ${options.to} via SMTP`)
    return true
  } catch (error) {
    console.error('SMTP send failed:', error)
    return false
  }
}

/**
 * Helper functions for common billing emails
 */

export async function sendPaymentSuccessEmail(
  to: string,
  userName: string,
  amount: number,
  currency: string,
  invoiceUrl: string,
  planName: string,
  nextBillingDate: string
): Promise<boolean> {
  const template = paymentSuccessEmail({
    userName,
    amount,
    currency,
    invoiceUrl,
    planName,
    nextBillingDate
  })

  return sendEmail({
    to,
    subject: template.subject,
    html: template.html,
    text: template.text
  })
}

export async function sendPaymentFailedEmail(
  to: string,
  userName: string,
  amount: number,
  currency: string,
  planName: string,
  retryDate: string,
  updatePaymentUrl: string
): Promise<boolean> {
  const template = paymentFailedEmail({
    userName,
    amount,
    currency,
    planName,
    retryDate,
    updatePaymentUrl
  })

  return sendEmail({
    to,
    subject: template.subject,
    html: template.html,
    text: template.text
  })
}

export async function sendTrialEndingEmail(
  to: string,
  userName: string,
  planName: string,
  amount: number,
  currency: string,
  trialEndDate: string,
  daysRemaining: number
): Promise<boolean> {
  const template = trialEndingEmail({
    userName,
    planName,
    amount,
    currency,
    trialEndDate,
    daysRemaining
  })

  return sendEmail({
    to,
    subject: template.subject,
    html: template.html,
    text: template.text
  })
}

export async function sendSubscriptionCanceledEmail(
  to: string,
  userName: string,
  planName: string,
  cancelDate: string,
  accessEndDate: string
): Promise<boolean> {
  const template = subscriptionCanceledEmail({
    userName,
    planName,
    cancelDate,
    accessEndDate
  })

  return sendEmail({
    to,
    subject: template.subject,
    html: template.html,
    text: template.text
  })
}

export async function sendSubscriptionChangedEmail(
  to: string,
  userName: string,
  oldPlan: string,
  newPlan: string,
  effectiveDate: string,
  prorationAmount?: number
): Promise<boolean> {
  const template = subscriptionChangedEmail({
    userName,
    oldPlan,
    newPlan,
    effectiveDate,
    prorationAmount
  })

  return sendEmail({
    to,
    subject: template.subject,
    html: template.html,
    text: template.text
  })
}

/**
 * Test email configuration
 */
export async function testEmailConfiguration(testEmail: string): Promise<boolean> {
  return sendEmail({
    to: testEmail,
    subject: 'eKaty.com - Email Configuration Test',
    html: '<h1>Success!</h1><p>Your email configuration is working correctly.</p>',
    text: 'Success! Your email configuration is working correctly.'
  })
}
