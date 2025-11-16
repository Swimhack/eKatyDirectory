import { Resend } from 'resend'

const resend = new Resend(process.env.RESEND_API_KEY || 'dummy_key_for_build')

interface ContactEmailData {
  name: string
  email: string
  phone?: string
  restaurantName?: string
  subject: string
  message: string
  type: string
}

export async function sendContactNotification(data: ContactEmailData) {
  try {
    // Check if API key is configured
    if (!process.env.RESEND_API_KEY || process.env.RESEND_API_KEY === 'dummy_key_for_build') {
      console.warn('RESEND_API_KEY not configured - email not sent')
      return { success: false, error: 'Email not configured' }
    }
    
    const { name, email, phone, restaurantName, subject, message, type } = data
    
    const emailContent = `
      New Contact Form Submission
      
      Type: ${type === 'advertising' ? 'Advertising Inquiry' : type.charAt(0).toUpperCase() + type.slice(1)}
      Name: ${name}
      Email: ${email}
      ${phone ? `Phone: ${phone}` : ''}
      ${restaurantName ? `Restaurant Name: ${restaurantName}` : ''}
      Subject: ${subject}
      
      Message:
      ${message}
      
      ---
      Submitted from eKaty.com
    `

    const htmlContent = `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h2 style="color: #2563eb;">New Contact Form Submission</h2>
        
        <div style="background-color: #f3f4f6; padding: 20px; border-radius: 8px; margin: 20px 0;">
          <p><strong>Type:</strong> ${type === 'advertising' ? 'Advertising Inquiry' : type.charAt(0).toUpperCase() + type.slice(1)}</p>
          <p><strong>Name:</strong> ${name}</p>
          <p><strong>Email:</strong> <a href="mailto:${email}">${email}</a></p>
          ${phone ? `<p><strong>Phone:</strong> <a href="tel:${phone}">${phone}</a></p>` : ''}
          ${restaurantName ? `<p><strong>Restaurant Name:</strong> ${restaurantName}</p>` : ''}
          <p><strong>Subject:</strong> ${subject}</p>
        </div>
        
        <div style="margin: 20px 0;">
          <h3 style="color: #374151;">Message:</h3>
          <p style="white-space: pre-wrap; background-color: #f9fafb; padding: 15px; border-left: 4px solid #2563eb;">${message}</p>
        </div>
        
        <hr style="border: none; border-top: 1px solid #e5e7eb; margin: 30px 0;">
        <p style="color: #6b7280; font-size: 14px;">Submitted from <a href="https://ekaty.com" style="color: #2563eb;">eKaty.com</a></p>
      </div>
    `

    console.log('Attempting to send contact notification email to James@eKaty.com')
    
    const response = await resend.emails.send({
      from: 'James from eKaty <james@ekaty.com>',
      to: 'james@ekaty.com',
      replyTo: email,
      subject: `${type === 'advertising' ? '🚀 Advertising Inquiry' : '📧 Contact Form'}: ${subject}`,
      text: emailContent,
      html: htmlContent,
    })

    console.log('Contact notification email sent successfully:', response.data)
    return { success: true, id: response.data?.id }
  } catch (error) {
    console.error('Error sending contact notification email:', error)
    return { success: false, error }
  }
}

export async function sendConfirmationEmail(name: string, email: string, subject: string) {
  try {
    // Check if API key is configured
    if (!process.env.RESEND_API_KEY || process.env.RESEND_API_KEY === 'dummy_key_for_build') {
      console.warn('RESEND_API_KEY not configured - confirmation email not sent')
      return { success: false, error: 'Email not configured' }
    }
    
    const htmlContent = `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h2 style="color: #2563eb;">Thank You for Contacting eKaty!</h2>
        
        <p>Hi ${name},</p>
        
        <p>We've received your message regarding "<strong>${subject}</strong>" and will get back to you within 24-48 hours.</p>
        
        <div style="background-color: #eff6ff; padding: 20px; border-radius: 8px; margin: 20px 0; border-left: 4px solid #2563eb;">
          <p style="margin: 0;">Our team at eKaty is dedicated to helping you discover the best restaurants in Katy, Texas. We'll review your message and respond as soon as possible.</p>
        </div>
        
        <p>Best regards,<br>
        The eKaty Team</p>
        
        <hr style="border: none; border-top: 1px solid #e5e7eb; margin: 30px 0;">
        <p style="color: #6b7280; font-size: 14px;">
          eKaty - Best Restaurants in Katy, Texas<br>
          <a href="https://ekaty.com" style="color: #2563eb;">ekaty.com</a> | 
          <a href="mailto:James@eKaty.com" style="color: #2563eb;">James@eKaty.com</a> | 
          <a href="tel:+17134446732" style="color: #2563eb;">(713) 444-6732</a>
        </p>
      </div>
    `

    console.log(`Attempting to send confirmation email to ${email}`)
    
    const response = await resend.emails.send({
      from: 'James from eKaty <james@ekaty.com>',
      to: email,
      subject: `We received your message - eKaty`,
      html: htmlContent,
    })

    console.log('Confirmation email sent successfully:', response.data)
    return { success: true }
  } catch (error) {
    console.error('Error sending confirmation email:', error)
    return { success: false, error }
  }
}

export async function sendMagicLinkEmail(email: string, name: string, magicLinkUrl: string) {
  try {
    // Check if API key is configured
    if (!process.env.RESEND_API_KEY || process.env.RESEND_API_KEY === 'dummy_key_for_build') {
      console.warn('RESEND_API_KEY not configured - magic link email not sent')
      return { success: false, error: 'Email not configured' }
    }

    const htmlContent = `
      <!DOCTYPE html>
      <html>
        <head>
          <meta charset="utf-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
        </head>
        <body style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px;">
          <div style="background: linear-gradient(135deg, #2563eb 0%, #1d4ed8 100%); padding: 40px 20px; text-align: center; border-radius: 12px 12px 0 0;">
            <h1 style="color: white; margin: 0; font-size: 28px; font-weight: bold;">Welcome to eKaty! 🍽️</h1>
          </div>
          
          <div style="background: white; padding: 40px 30px; border: 1px solid #e5e7eb; border-top: none; border-radius: 0 0 12px 12px;">
            <p style="font-size: 16px; margin-bottom: 20px;">Hi ${name || 'there'}!</p>
            
            <p style="font-size: 16px; margin-bottom: 25px;">
              Click the button below to sign in to your eKaty account. This link will expire in 15 minutes.
            </p>
            
            <div style="text-align: center; margin: 35px 0;">
              <a href="${magicLinkUrl}" style="display: inline-block; background: #2563eb; color: white; padding: 16px 40px; text-decoration: none; border-radius: 8px; font-weight: 600; font-size: 16px; box-shadow: 0 4px 6px rgba(37, 99, 235, 0.3);">
                Sign In to eKaty
              </a>
            </div>
            
            <p style="font-size: 14px; color: #6b7280; margin-top: 30px;">
              Or copy and paste this link into your browser:
            </p>
            <p style="font-size: 12px; color: #2563eb; word-break: break-all; background: #f3f4f6; padding: 12px; border-radius: 6px; margin-top: 10px;">
              ${magicLinkUrl}
            </p>
            
            <hr style="border: none; border-top: 1px solid #e5e7eb; margin: 30px 0;">
            
            <p style="font-size: 14px; color: #6b7280; margin-bottom: 10px;">
              <strong>What you can do with eKaty:</strong>
            </p>
            <ul style="font-size: 14px; color: #6b7280; padding-left: 20px;">
              <li>Save your favorite restaurants</li>
              <li>Write and share reviews</li>
              <li>Get personalized recommendations</li>
              <li>Use Grub Roulette to discover new places</li>
            </ul>
            
            <hr style="border: none; border-top: 1px solid #e5e7eb; margin: 30px 0;">
            
            <p style="color: #6b7280; font-size: 12px; margin-top: 20px;">
              If you didn't request this email, you can safely ignore it.
            </p>
            
            <p style="color: #6b7280; font-size: 14px; margin-top: 30px;">
              eKaty - Best Restaurants in Katy, Texas<br>
              <a href="https://ekaty.com" style="color: #2563eb;">ekaty.com</a>
            </p>
          </div>
        </body>
      </html>
    `

    console.log(`Attempting to send magic link email to ${email}`)
    
    const response = await resend.emails.send({
      from: 'James from eKaty <james@ekaty.com>',
      to: email,
      subject: '🔐 Your eKaty Sign In Link',
      html: htmlContent,
    })

    console.log('Magic link email sent successfully:', response.data)
    return { success: true, id: response.data?.id }
  } catch (error) {
    console.error('Error sending magic link email:', error)
    return { success: false, error }
  }
}
