import { Resend } from 'resend'

const resend = new Resend(process.env.RESEND_API_KEY)

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

    const response = await resend.emails.send({
      from: 'eKaty Contact Form <noreply@ekaty.com>',
      to: 'James@eKaty.com',
      replyTo: email,
      subject: `${type === 'advertising' ? '🚀 Advertising Inquiry' : '📧 Contact Form'}: ${subject}`,
      text: emailContent,
      html: htmlContent,
    })

    return { success: true, id: response.data?.id }
  } catch (error) {
    console.error('Error sending email:', error)
    return { success: false, error }
  }
}

export async function sendConfirmationEmail(name: string, email: string, subject: string) {
  try {
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

    await resend.emails.send({
      from: 'eKaty <noreply@ekaty.com>',
      to: email,
      subject: `We received your message - eKaty`,
      html: htmlContent,
    })

    return { success: true }
  } catch (error) {
    console.error('Error sending confirmation email:', error)
    return { success: false, error }
  }
}
