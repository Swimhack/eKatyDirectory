import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

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
        phone: phone || null,
        subject,
        message,
        type,
        metadata: restaurantName ? { restaurantName } : null,
        responded: false
      }
    })

    // In production, you would send an email notification here
    // For now, we'll just log it
    console.log('New contact submission:', submission)

    // Send confirmation email to user (in production)
    // await sendEmail({
    //   to: email,
    //   subject: 'We received your message',
    //   template: 'contact-confirmation',
    //   data: { name, subject }
    // })

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