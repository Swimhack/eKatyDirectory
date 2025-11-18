/**
 * Email Templates for Billing Notifications
 *
 * Provides HTML email templates for Stripe billing events
 * Compatible with SendGrid, Resend, Postmark, or any email service
 */

interface EmailTemplate {
  subject: string
  html: string
  text: string
}

interface PaymentSuccessData {
  userName: string
  amount: number
  currency: string
  invoiceUrl: string
  planName: string
  nextBillingDate: string
}

interface PaymentFailedData {
  userName: string
  amount: number
  currency: string
  planName: string
  retryDate: string
  updatePaymentUrl: string
}

interface TrialEndingData {
  userName: string
  planName: string
  amount: number
  currency: string
  trialEndDate: string
  daysRemaining: number
}

interface SubscriptionCanceledData {
  userName: string
  planName: string
  cancelDate: string
  accessEndDate: string
}

interface SubscriptionChangedData {
  userName: string
  oldPlan: string
  newPlan: string
  effectiveDate: string
  prorationAmount?: number
}

/**
 * Base email layout wrapper
 */
function emailLayout(content: string, preheader: string = ''): string {
  return `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <meta name="x-apple-disable-message-reformatting">
  <title>eKaty.com</title>
  <style>
    body { margin: 0; padding: 0; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; }
    .email-container { max-width: 600px; margin: 0 auto; }
    .header { background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); padding: 40px 20px; text-align: center; }
    .header h1 { color: #ffffff; margin: 0; font-size: 28px; }
    .content { background: #ffffff; padding: 40px 30px; }
    .footer { background: #f7fafc; padding: 30px 20px; text-align: center; color: #718096; font-size: 14px; }
    .button { display: inline-block; padding: 14px 32px; background: #667eea; color: #ffffff; text-decoration: none; border-radius: 8px; font-weight: 600; margin: 20px 0; }
    .button:hover { background: #5568d3; }
    .alert-warning { background: #fef3cd; border-left: 4px solid #f59e0b; padding: 16px; margin: 20px 0; border-radius: 4px; }
    .alert-success { background: #d1fae5; border-left: 4px solid #10b981; padding: 16px; margin: 20px 0; border-radius: 4px; }
    .alert-info { background: #dbeafe; border-left: 4px solid #3b82f6; padding: 16px; margin: 20px 0; border-radius: 4px; }
    .invoice-details { background: #f7fafc; padding: 20px; border-radius: 8px; margin: 20px 0; }
    .invoice-row { display: flex; justify-content: space-between; padding: 10px 0; border-bottom: 1px solid #e2e8f0; }
    .invoice-row:last-child { border-bottom: none; font-weight: 600; }
  </style>
</head>
<body style="background-color: #f7fafc;">
  ${preheader ? `<div style="display: none; max-height: 0; overflow: hidden;">${preheader}</div>` : ''}
  <div class="email-container">
    <div class="header">
      <h1>🍴 eKaty.com</h1>
      <p style="color: #e2e8f0; margin: 10px 0 0 0;">Katy's Restaurant Guide</p>
    </div>
    <div class="content">
      ${content}
    </div>
    <div class="footer">
      <p><strong>eKaty.com</strong></p>
      <p>Your trusted guide to Katy's best restaurants</p>
      <p style="margin-top: 20px;">
        <a href="https://ekaty.com" style="color: #667eea; text-decoration: none;">Visit eKaty.com</a> •
        <a href="https://ekaty.com/owner/subscription" style="color: #667eea; text-decoration: none;">Manage Subscription</a> •
        <a href="mailto:billing@ekaty.com" style="color: #667eea; text-decoration: none;">Contact Support</a>
      </p>
      <p style="color: #a0aec0; font-size: 12px; margin-top: 20px;">
        © ${new Date().getFullYear()} eKaty.com. All rights reserved.
      </p>
    </div>
  </div>
</body>
</html>
  `.trim()
}

/**
 * Payment Succeeded - Receipt Email
 */
export function paymentSuccessEmail(data: PaymentSuccessData): EmailTemplate {
  const formattedAmount = `$${(data.amount / 100).toFixed(2)}`

  const html = emailLayout(`
    <h2 style="color: #1a202c; margin-top: 0;">Payment Received ✓</h2>

    <div class="alert-success">
      <p style="margin: 0; color: #065f46;">
        <strong>Thank you!</strong> Your payment was successful.
      </p>
    </div>

    <p style="color: #4a5568; line-height: 1.6;">
      Hi ${data.userName},
    </p>

    <p style="color: #4a5568; line-height: 1.6;">
      Your payment for <strong>${data.planName}</strong> has been processed successfully.
    </p>

    <div class="invoice-details">
      <div class="invoice-row">
        <span style="color: #718096;">Plan</span>
        <span style="color: #1a202c; font-weight: 600;">${data.planName}</span>
      </div>
      <div class="invoice-row">
        <span style="color: #718096;">Amount Paid</span>
        <span style="color: #1a202c; font-weight: 600;">${formattedAmount} ${data.currency.toUpperCase()}</span>
      </div>
      <div class="invoice-row">
        <span style="color: #718096;">Next Billing Date</span>
        <span style="color: #1a202c; font-weight: 600;">${data.nextBillingDate}</span>
      </div>
    </div>

    <center>
      <a href="${data.invoiceUrl}" class="button">View Invoice</a>
    </center>

    <p style="color: #718096; font-size: 14px; margin-top: 30px;">
      Need help? Reply to this email or contact us at billing@ekaty.com
    </p>
  `, `Payment received for ${data.planName}`)

  const text = `
Payment Received

Hi ${data.userName},

Your payment for ${data.planName} has been processed successfully.

Amount Paid: ${formattedAmount} ${data.currency.toUpperCase()}
Next Billing Date: ${data.nextBillingDate}

View Invoice: ${data.invoiceUrl}

Need help? Contact us at billing@ekaty.com

© ${new Date().getFullYear()} eKaty.com
  `.trim()

  return {
    subject: `Payment Received - ${data.planName}`,
    html,
    text
  }
}

/**
 * Payment Failed - Action Required
 */
export function paymentFailedEmail(data: PaymentFailedData): EmailTemplate {
  const formattedAmount = `$${(data.amount / 100).toFixed(2)}`

  const html = emailLayout(`
    <h2 style="color: #1a202c; margin-top: 0;">Payment Failed ⚠️</h2>

    <div class="alert-warning">
      <p style="margin: 0; color: #92400e;">
        <strong>Action Required:</strong> We couldn't process your payment.
      </p>
    </div>

    <p style="color: #4a5568; line-height: 1.6;">
      Hi ${data.userName},
    </p>

    <p style="color: #4a5568; line-height: 1.6;">
      We attempted to charge your payment method for <strong>${data.planName}</strong> but the payment failed.
    </p>

    <div class="invoice-details">
      <div class="invoice-row">
        <span style="color: #718096;">Plan</span>
        <span style="color: #1a202c; font-weight: 600;">${data.planName}</span>
      </div>
      <div class="invoice-row">
        <span style="color: #718096;">Amount Due</span>
        <span style="color: #dc2626; font-weight: 600;">${formattedAmount} ${data.currency.toUpperCase()}</span>
      </div>
      <div class="invoice-row">
        <span style="color: #718096;">Next Retry</span>
        <span style="color: #1a202c; font-weight: 600;">${data.retryDate}</span>
      </div>
    </div>

    <p style="color: #4a5568; line-height: 1.6;">
      <strong>What to do next:</strong>
    </p>

    <ul style="color: #4a5568; line-height: 1.8;">
      <li>Update your payment method to avoid service interruption</li>
      <li>We'll automatically retry the payment on ${data.retryDate}</li>
      <li>If payment fails multiple times, your subscription will be canceled</li>
    </ul>

    <center>
      <a href="${data.updatePaymentUrl}" class="button">Update Payment Method</a>
    </center>

    <p style="color: #718096; font-size: 14px; margin-top: 30px;">
      Questions? Contact us at billing@ekaty.com
    </p>
  `, `Action required: Payment failed for ${data.planName}`)

  const text = `
Payment Failed - Action Required

Hi ${data.userName},

We attempted to charge your payment method for ${data.planName} but the payment failed.

Amount Due: ${formattedAmount} ${data.currency.toUpperCase()}
Next Retry: ${data.retryDate}

Please update your payment method to avoid service interruption.

Update Payment Method: ${data.updatePaymentUrl}

Questions? Contact us at billing@ekaty.com

© ${new Date().getFullYear()} eKaty.com
  `.trim()

  return {
    subject: `Action Required: Payment Failed - ${data.planName}`,
    html,
    text
  }
}

/**
 * Trial Ending Soon - Reminder
 */
export function trialEndingEmail(data: TrialEndingData): EmailTemplate {
  const formattedAmount = `$${(data.amount / 100).toFixed(2)}`
  const urgency = data.daysRemaining <= 1 ? 'Tomorrow' : `in ${data.daysRemaining} days`

  const html = emailLayout(`
    <h2 style="color: #1a202c; margin-top: 0;">Your Free Trial is Ending Soon</h2>

    <div class="alert-info">
      <p style="margin: 0; color: #1e3a8a;">
        <strong>Reminder:</strong> Your trial ends ${urgency}
      </p>
    </div>

    <p style="color: #4a5568; line-height: 1.6;">
      Hi ${data.userName},
    </p>

    <p style="color: #4a5568; line-height: 1.6;">
      Your 14-day free trial of <strong>${data.planName}</strong> is ending ${urgency} on ${data.trialEndDate}.
    </p>

    <div class="invoice-details">
      <div class="invoice-row">
        <span style="color: #718096;">Plan</span>
        <span style="color: #1a202c; font-weight: 600;">${data.planName}</span>
      </div>
      <div class="invoice-row">
        <span style="color: #718096;">Trial Ends</span>
        <span style="color: #dc2626; font-weight: 600;">${data.trialEndDate}</span>
      </div>
      <div class="invoice-row">
        <span style="color: #718096;">After Trial</span>
        <span style="color: #1a202c; font-weight: 600;">${formattedAmount} ${data.currency.toUpperCase()}/month</span>
      </div>
    </div>

    <p style="color: #4a5568; line-height: 1.6;">
      <strong>What happens next:</strong>
    </p>

    <ul style="color: #4a5568; line-height: 1.8;">
      <li>After your trial ends, we'll charge ${formattedAmount}/month</li>
      <li>You can cancel anytime before ${data.trialEndDate} to avoid charges</li>
      <li>Continue enjoying all premium features uninterrupted</li>
    </ul>

    <center>
      <a href="https://ekaty.com/owner/subscription" class="button">Manage Subscription</a>
    </center>

    <p style="color: #718096; font-size: 14px; margin-top: 30px;">
      Want to cancel? No problem! Just visit your subscription page.
    </p>
  `, `Your ${data.planName} trial ends ${urgency}`)

  const text = `
Your Free Trial is Ending Soon

Hi ${data.userName},

Your 14-day free trial of ${data.planName} is ending ${urgency} on ${data.trialEndDate}.

After your trial ends, we'll charge ${formattedAmount} ${data.currency.toUpperCase()}/month.

You can cancel anytime before ${data.trialEndDate} to avoid charges.

Manage Subscription: https://ekaty.com/owner/subscription

© ${new Date().getFullYear()} eKaty.com
  `.trim()

  return {
    subject: `Your ${data.planName} Trial Ends ${urgency}`,
    html,
    text
  }
}

/**
 * Subscription Canceled - Confirmation
 */
export function subscriptionCanceledEmail(data: SubscriptionCanceledData): EmailTemplate {
  const html = emailLayout(`
    <h2 style="color: #1a202c; margin-top: 0;">Subscription Canceled</h2>

    <p style="color: #4a5568; line-height: 1.6;">
      Hi ${data.userName},
    </p>

    <p style="color: #4a5568; line-height: 1.6;">
      Your <strong>${data.planName}</strong> subscription has been canceled as requested.
    </p>

    <div class="invoice-details">
      <div class="invoice-row">
        <span style="color: #718096;">Canceled Plan</span>
        <span style="color: #1a202c; font-weight: 600;">${data.planName}</span>
      </div>
      <div class="invoice-row">
        <span style="color: #718096;">Cancellation Date</span>
        <span style="color: #1a202c; font-weight: 600;">${data.cancelDate}</span>
      </div>
      <div class="invoice-row">
        <span style="color: #718096;">Access Until</span>
        <span style="color: #10b981; font-weight: 600;">${data.accessEndDate}</span>
      </div>
    </div>

    <div class="alert-info">
      <p style="margin: 0; color: #1e3a8a;">
        <strong>Good news!</strong> You'll continue to have full access until ${data.accessEndDate}.
      </p>
    </div>

    <p style="color: #4a5568; line-height: 1.6;">
      We're sorry to see you go! If you change your mind, you can reactivate your subscription anytime.
    </p>

    <center>
      <a href="https://ekaty.com/pricing" class="button">Reactivate Subscription</a>
    </center>

    <p style="color: #718096; font-size: 14px; margin-top: 30px;">
      Questions or feedback? We'd love to hear from you at billing@ekaty.com
    </p>
  `, `Your ${data.planName} subscription has been canceled`)

  const text = `
Subscription Canceled

Hi ${data.userName},

Your ${data.planName} subscription has been canceled as requested.

Cancellation Date: ${data.cancelDate}
Access Until: ${data.accessEndDate}

You'll continue to have full access until ${data.accessEndDate}.

Reactivate anytime: https://ekaty.com/pricing

Questions or feedback? Contact us at billing@ekaty.com

© ${new Date().getFullYear()} eKaty.com
  `.trim()

  return {
    subject: `Subscription Canceled - ${data.planName}`,
    html,
    text
  }
}

/**
 * Subscription Changed - Upgrade/Downgrade Confirmation
 */
export function subscriptionChangedEmail(data: SubscriptionChangedData): EmailTemplate {
  const isUpgrade = data.newPlan.includes('Premium') || data.newPlan.includes('Pro')
  const changeType = isUpgrade ? 'Upgraded' : 'Changed'

  const html = emailLayout(`
    <h2 style="color: #1a202c; margin-top: 0;">Subscription ${changeType} ✓</h2>

    <div class="alert-success">
      <p style="margin: 0; color: #065f46;">
        <strong>Success!</strong> Your subscription has been ${changeType.toLowerCase()}.
      </p>
    </div>

    <p style="color: #4a5568; line-height: 1.6;">
      Hi ${data.userName},
    </p>

    <p style="color: #4a5568; line-height: 1.6;">
      Your subscription has been successfully changed from <strong>${data.oldPlan}</strong> to <strong>${data.newPlan}</strong>.
    </p>

    <div class="invoice-details">
      <div class="invoice-row">
        <span style="color: #718096;">Previous Plan</span>
        <span style="color: #718096;">${data.oldPlan}</span>
      </div>
      <div class="invoice-row">
        <span style="color: #718096;">New Plan</span>
        <span style="color: #10b981; font-weight: 600;">${data.newPlan}</span>
      </div>
      <div class="invoice-row">
        <span style="color: #718096;">Effective Date</span>
        <span style="color: #1a202c; font-weight: 600;">${data.effectiveDate}</span>
      </div>
      ${data.prorationAmount ? `
      <div class="invoice-row">
        <span style="color: #718096;">Proration ${data.prorationAmount > 0 ? 'Credit' : 'Charge'}</span>
        <span style="color: #1a202c; font-weight: 600;">$${Math.abs(data.prorationAmount / 100).toFixed(2)}</span>
      </div>
      ` : ''}
    </div>

    <p style="color: #4a5568; line-height: 1.6;">
      You now have access to all <strong>${data.newPlan}</strong> features!
    </p>

    <center>
      <a href="https://ekaty.com/owner/subscription" class="button">View Subscription</a>
    </center>

    <p style="color: #718096; font-size: 14px; margin-top: 30px;">
      Questions? Contact us at billing@ekaty.com
    </p>
  `, `Your subscription has been ${changeType.toLowerCase()} to ${data.newPlan}`)

  const text = `
Subscription ${changeType}

Hi ${data.userName},

Your subscription has been successfully changed from ${data.oldPlan} to ${data.newPlan}.

Effective Date: ${data.effectiveDate}
${data.prorationAmount ? `Proration ${data.prorationAmount > 0 ? 'Credit' : 'Charge'}: $${Math.abs(data.prorationAmount / 100).toFixed(2)}` : ''}

You now have access to all ${data.newPlan} features!

View Subscription: https://ekaty.com/owner/subscription

Questions? Contact us at billing@ekaty.com

© ${new Date().getFullYear()} eKaty.com
  `.trim()

  return {
    subject: `Subscription ${changeType} - ${data.newPlan}`,
    html,
    text
  }
}

/**
 * Export all templates
 */
export const emailTemplates = {
  paymentSuccess: paymentSuccessEmail,
  paymentFailed: paymentFailedEmail,
  trialEnding: trialEndingEmail,
  subscriptionCanceled: subscriptionCanceledEmail,
  subscriptionChanged: subscriptionChangedEmail
}
