import { NextRequest, NextResponse } from 'next/server'

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { name, email, message, type = 'general' } = body

    // Basic validation
    if (!name || !email || !message) {
      return NextResponse.json(
        { error: 'Name, email, and message are required' },
        { status: 400 }
      )
    }

    // In a real implementation, you would:
    // 1. Store the message in your database
    // 2. Send email notifications
    // 3. Integrate with a service like SendGrid, Resend, or similar
    
    console.log('Contact form submission:', {
      name,
      email,
      message,
      type,
      timestamp: new Date().toISOString()
    })

    // For now, just return success
    return NextResponse.json({ 
      success: true, 
      message: 'Thank you for your message! We\'ll get back to you soon.' 
    })
  } catch (error) {
    console.error('Error processing contact form:', error)
    return NextResponse.json(
      { error: 'Failed to process contact form' },
      { status: 500 }
    )
  }
}