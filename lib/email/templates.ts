import {
  Html,
  Head,
  Body,
  Container,
  Section,
  Text,
  Link,
  Button,
  Hr,
} from '@react-email/components'
import * as React from 'react'

/**
 * Replace template variables in string
 * Supports: {{restaurant_name}}, {{contact_name}}, {{cuisine}}, {{city}}, {{tier_name}}, {{tier_price}}
 */
export function replaceTemplateVariables(
  template: string,
  variables: Record<string, string>
): string {
  let result = template

  Object.entries(variables).forEach(([key, value]) => {
    const regex = new RegExp(`{{${key}}}`, 'g')
    result = result.replace(regex, value || '')
  })

  return result
}

/**
 * Generate personalized outreach email HTML
 */
export function generateOutreachEmail(
  lead: {
    business_name: string
    contact_name?: string
    email: string
    cuisine_type?: string[]
    city?: string
  },
  tier: {
    name: string
    monthly_price: number
    features: string[]
  },
  bodyTemplate: string
): string {
  const variables = {
    restaurant_name: lead.business_name,
    contact_name: lead.contact_name || 'Restaurant Owner',
    cuisine: lead.cuisine_type?.[0] || 'delicious food',
    city: lead.city || 'Katy',
    tier_name: tier.name,
    tier_price: `$${tier.monthly_price}`,
  }

  const personalizedBody = replaceTemplateVariables(bodyTemplate, variables)

  return `
<!DOCTYPE html>
<html>
  <head>
    <meta charset="utf-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
  </head>
  <body style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', 'Roboto', 'Helvetica Neue', Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px;">
    <div style="background-color: #f7f7f7; padding: 20px; border-radius: 8px;">
      <h1 style="color: #D97706; margin-bottom: 20px;">eKaty</h1>
      <div style="background-color: white; padding: 30px; border-radius: 8px;">
        ${personalizedBody}

        <div style="margin-top: 30px; padding: 20px; background-color: #FEF3C7; border-radius: 8px;">
          <h3 style="margin-top: 0; color: #92400E;">${tier.name} Partnership - ${variables.tier_price}/month</h3>
          <ul style="padding-left: 20px;">
            ${tier.features.map((feature) => `<li>${feature}</li>`).join('')}
          </ul>
        </div>

        <div style="margin-top: 30px; text-align: center;">
          <a href="https://ekaty.fly.dev/partner" style="display: inline-block; background-color: #D97706; color: white; padding: 12px 30px; text-decoration: none; border-radius: 6px; font-weight: 600;">View Partnership Options</a>
        </div>
      </div>

      <div style="margin-top: 20px; text-align: center; font-size: 12px; color: #666;">
        <p>eKaty - Connecting Katy, Texas with local restaurants</p>
        <p><a href="https://ekaty.fly.dev" style="color: #D97706;">Visit eKaty</a> | <a href="{{unsubscribe_url}}" style="color: #666;">Unsubscribe</a></p>
      </div>
    </div>
  </body>
</html>
  `.trim()
}

/**
 * Generate welcome email for new partners
 */
export function generateWelcomeEmail(
  restaurant: {
    name: string
    owner_name?: string
  },
  tier: {
    name: string
    monthly_price: number
  }
): string {
  return `
<!DOCTYPE html>
<html>
  <head>
    <meta charset="utf-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
  </head>
  <body style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', 'Roboto', 'Helvetica Neue', Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px;">
    <div style="background-color: #f7f7f7; padding: 20px; border-radius: 8px;">
      <h1 style="color: #D97706; margin-bottom: 20px;">Welcome to eKaty! 🎉</h1>
      <div style="background-color: white; padding: 30px; border-radius: 8px;">
        <h2>Hi ${restaurant.owner_name || 'there'}!</h2>
        <p>Welcome to the eKaty partner network! We're excited to have <strong>${restaurant.name}</strong> join our platform.</p>

        <div style="margin: 30px 0; padding: 20px; background-color: #FEF3C7; border-radius: 8px;">
          <h3 style="margin-top: 0; color: #92400E;">Your ${tier.name} Partnership</h3>
          <p>Monthly investment: <strong>$${tier.monthly_price}</strong></p>
          <p>Your listing is now active and visible to thousands of local food lovers in Katy, Texas!</p>
        </div>

        <h3>Next Steps:</h3>
        <ol>
          <li>Complete your restaurant profile</li>
          <li>Add photos of your dishes</li>
          <li>Keep your hours and menu up to date</li>
          <li>Monitor your analytics dashboard</li>
        </ol>

        <div style="margin-top: 30px; text-align: center;">
          <a href="https://ekaty.fly.dev/admin" style="display: inline-block; background-color: #D97706; color: white; padding: 12px 30px; text-decoration: none; border-radius: 6px; font-weight: 600;">Access Your Dashboard</a>
        </div>

        <p style="margin-top: 30px; font-size: 14px; color: #666;">Questions? Reply to this email or visit our support page.</p>
      </div>

      <div style="margin-top: 20px; text-align: center; font-size: 12px; color: #666;">
        <p>eKaty - Connecting Katy, Texas with local restaurants</p>
      </div>
    </div>
  </body>
</html>
  `.trim()
}

/**
 * Generate renewal reminder email
 */
export function generateRenewalReminderEmail(partnership: {
  restaurant_name: string
  tier_name: string
  monthly_price: number
  renewal_date: string
}): string {
  return `
<!DOCTYPE html>
<html>
  <head>
    <meta charset="utf-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
  </head>
  <body style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', 'Roboto', 'Helvetica Neue', Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px;">
    <div style="background-color: #f7f7f7; padding: 20px; border-radius: 8px;">
      <h1 style="color: #D97706; margin-bottom: 20px;">Partnership Renewal Reminder</h1>
      <div style="background-color: white; padding: 30px; border-radius: 8px;">
        <p>Hi there,</p>
        <p>Your <strong>${partnership.tier_name}</strong> partnership for <strong>${partnership.restaurant_name}</strong> will renew on <strong>${partnership.renewal_date}</strong>.</p>

        <div style="margin: 30px 0; padding: 20px; background-color: #FEF3C7; border-radius: 8px;">
          <h3 style="margin-top: 0; color: #92400E;">Renewal Details</h3>
          <p>Renewal amount: <strong>$${partnership.monthly_price}</strong></p>
          <p>Renewal date: <strong>${partnership.renewal_date}</strong></p>
        </div>

        <p>No action is required - your partnership will automatically renew. If you'd like to make changes to your plan or cancel, please contact us.</p>

        <div style="margin-top: 30px; text-align: center;">
          <a href="https://ekaty.fly.dev/admin" style="display: inline-block; background-color: #D97706; color: white; padding: 12px 30px; text-decoration: none; border-radius: 6px; font-weight: 600;">Manage Partnership</a>
        </div>

        <p style="margin-top: 30px; font-size: 14px; color: #666;">Questions? Reply to this email or contact support.</p>
      </div>

      <div style="margin-top: 20px; text-align: center; font-size: 12px; color: #666;">
        <p>eKaty - Connecting Katy, Texas with local restaurants</p>
      </div>
    </div>
  </body>
</html>
  `.trim()
}
