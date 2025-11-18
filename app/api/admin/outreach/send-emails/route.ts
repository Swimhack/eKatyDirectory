import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { getCurrentUser } from '@/lib/auth'
import { getTemplateForSegment } from '@/lib/outreach/email-templates'

export async function POST(request: NextRequest) {
  try {
    const user = await getCurrentUser()
    if (!user || user.role !== 'ADMIN') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { segment } = await request.json()

    if (!segment) {
      return NextResponse.json({ error: 'Segment required' }, { status: 400 })
    }

    // Get restaurants for the segment
    const allRestaurants = await prisma.restaurant.findMany({
      where: { active: true },
      select: {
        id: true,
        name: true,
        slug: true,
        phone: true,
        website: true,
        email: true,
        cuisineTypes: true,
        rating: true,
        reviewCount: true,
        featured: true,
        metadata: true,
        address: true
      }
    })

    // Parse marketing data
    const restaurantsWithData = allRestaurants.map(r => {
      let hasMarketing = false
      if (r.metadata) {
        try {
          const meta = JSON.parse(r.metadata as string)
          hasMarketing = !!meta.marketing
        } catch {}
      }
      return { ...r, hasMarketing }
    })

    // Filter by segment
    let targetRestaurants = restaurantsWithData

    if (segment === 'High-Value Targets') {
      targetRestaurants = restaurantsWithData.filter(r =>
        !r.hasMarketing && !r.featured && r.rating && r.rating >= 4.0 && r.reviewCount >= 50
      )
    } else if (segment === 'Family-Friendly Upsell') {
      targetRestaurants = restaurantsWithData.filter(r => r.hasMarketing && !r.featured)
    } else if (segment === 'Featured Placement Candidates') {
      targetRestaurants = restaurantsWithData.filter(r =>
        !r.featured && r.rating && r.rating >= 4.5 && r.reviewCount >= 100
      )
    } else if (segment === 'Phone-Only Quick Wins') {
      targetRestaurants = restaurantsWithData.filter(r => r.phone && !r.website)
    }

    // In production, this would integrate with SendGrid/Mailchimp/etc
    // For now, we'll just log the emails that would be sent

    const emailsToSend = targetRestaurants.map(r => {
      const restaurantData = {
        name: r.name,
        rating: r.rating,
        reviewCount: r.reviewCount,
        phone: r.phone,
        website: r.website,
        cuisine: r.cuisineTypes,
        address: r.address
      }

      const template = getTemplateForSegment(segment, restaurantData)

      return {
        restaurantId: r.id,
        restaurantName: r.name,
        to: r.email || `info@${r.slug}.com`, // Fallback email
        subject: template.subject,
        body: template.body,
        ctaUrl: template.ctaUrl
      }
    })

    // Log outreach attempt (you would create an OutreachLog table)
    console.log(`Would send ${emailsToSend.length} emails for segment: ${segment}`)

    // In production, integrate with email service:
    /*
    const sendgrid = require('@sendgrid/mail')
    sendgrid.setApiKey(process.env.SENDGRID_API_KEY)

    for (const email of emailsToSend) {
      await sendgrid.send({
        to: email.to,
        from: 'james@ekaty.com',
        subject: email.subject,
        text: email.body,
        html: email.body.replace(/\n/g, '<br>')
      })
    }
    */

    return NextResponse.json({
      success: true,
      sent: emailsToSend.length,
      message: `Ready to send ${emailsToSend.length} emails. Integrate SendGrid API key to actually send.`,
      preview: emailsToSend.slice(0, 3) // Show first 3 for preview
    })

  } catch (error) {
    console.error('Error sending emails:', error)
    return NextResponse.json({ error: 'Failed to send emails' }, { status: 500 })
  }
}
