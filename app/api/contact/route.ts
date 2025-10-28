import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { sendContactNotification, sendConfirmationEmail } from '@/lib/email'

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    
    const {
      name,
      email,
      phone,
      restaurantName,
      subject,
      message,
      type = 'general'
    } = body

    // Validate required fields
    if (!name || !email || !subject || !message) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      )
    }

    // Save to database
    const submission = await prisma.contactSubmission.create({
      data: {
        name,
        email,
        phone,
        subject,
        message,
        type,
        metadata: restaurantName ? JSON.stringify({ restaurantName }) : null,
        responded: false
      }
    })

    // Send notification email to James@eKaty.com
    const emailResult = await sendContactNotification({
      name,
      email,
      phone,
      restaurantName,
      subject,
      message,
      type
    })

    // Send confirmation email to user
    await sendConfirmationEmail(name, email, subject)

    console.log('Contact submission saved and emails sent:', submission.id, emailResult)

    return NextResponse.json({
      success: true,
      message: 'Your message has been sent successfully',
      id: submission.id
    })
    
  } catch (error) {
    console.error('Error processing contact form:', error)
    return NextResponse.json(
      { error: 'Failed to process contact form' },
      { status: 500 }
    )
  }
}