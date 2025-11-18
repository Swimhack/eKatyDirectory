import { NextRequest, NextResponse } from 'next/server'
import { PrismaClient } from '@prisma/client'
import { Resend } from 'resend'

const prisma = new PrismaClient()

// POST /api/admin/bulk-email/restaurants
// One-off admin-only endpoint to email all restaurants using Resend.
// Secured with ADMIN_API_KEY header so it cannot be called publicly.

export async function POST(request: NextRequest) {
  try {
    const adminKey = request.headers.get('x-admin-api-key')
    const expectedKey = process.env.ADMIN_API_KEY

    if (!expectedKey) {
      console.error('ADMIN_API_KEY is not configured; refusing bulk email request')
      return NextResponse.json(
        { error: 'Admin API key not configured' },
        { status: 500 }
      )
    }

    if (!adminKey || adminKey !== expectedKey) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    if (!process.env.RESEND_API_KEY || process.env.RESEND_API_KEY === 'dummy_key_for_build') {
      console.error('RESEND_API_KEY not configured correctly; refusing bulk email request')
      return NextResponse.json(
        { error: 'Email not configured' },
        { status: 500 }
      )
    }

    const resend = new Resend(process.env.RESEND_API_KEY)

    console.log('[bulk-email] Loading restaurants with email addresses...')

    const restaurants = await prisma.restaurant.findMany({
      where: {
        email: { not: null },
      },
      select: {
        id: true,
        name: true,
        email: true,
        slug: true,
        active: true,
      },
      orderBy: {
        name: 'asc',
      },
    })

    console.log(`[bulk-email] Found ${restaurants.length} restaurants with emails`)

    let sentCount = 0
    let errorCount = 0

    for (let index = 0; index < restaurants.length; index++) {
      const restaurant = restaurants[index]
      const email = restaurant.email?.trim()
      if (!email) continue

      const url = `https://ekaty.com/restaurants/${restaurant.slug}`
      const subject = 'Your restaurant is now on eKaty.com'

      const emailNumber = index + 1
      const includeBcc = emailNumber % 100 === 0

      console.log(
        `[bulk-email] Sending #${emailNumber} to ${email} (${restaurant.name}) -> ${url}${includeBcc ? ' [with BCC]' : ''}`
      )

      try {
        const html = buildEmailHtml(restaurant.name, url)

        const { error } = await resend.emails.send({
          from: 'James from eKaty <james@ekaty.com>',
          to: email,
          bcc: includeBcc ? 'james@ekaty.com' : undefined,
          subject,
          html,
        })

        if (error) {
          console.error(`[bulk-email] Error sending to ${email}:`, error)
          errorCount += 1
        } else {
          sentCount += 1
        }

        // Gentle rate limiting to avoid hammering the email provider
        await new Promise((resolve) => setTimeout(resolve, 500))
      } catch (err) {
        console.error(`[bulk-email] Unexpected error for ${email}:`, err)
        errorCount += 1
      }
    }

    console.log('[bulk-email] Completed bulk send', { sentCount, errorCount })

    return NextResponse.json({
      success: true,
      sent: sentCount,
      errors: errorCount,
      total: restaurants.length,
    })
  } catch (error) {
    console.error('[bulk-email] Fatal error in bulk email endpoint:', error)
    return NextResponse.json(
      { error: 'Bulk email failed' },
      { status: 500 }
    )
  } finally {
    await prisma.$disconnect()
  }
}

function buildEmailHtml(name: string | null, url: string) {
  const safeName = name?.trim() || 'there'

  return `
    <div style="font-family: system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif; line-height: 1.6; max-width: 640px; margin: 0 auto;">
      <h2 style="color:#ea580c;">Your restaurant is now listed on eKaty.com</h2>

      <p>Hi ${safeName},</p>

      <p>
        We wanted to let you know that we've added your restaurant to
        <strong>eKaty.com</strong> – a local guide to the best family-friendly restaurants in Katy.
      </p>

      <p>
        You can view your directory listing here:<br/>
        <a href="${url}" style="color:#ea580c; word-break:break-all;">${url}</a>
      </p>

      <p>
        On your eKaty listing you can:
      </p>
      <ul>
        <li>Highlight kids-eat-free nights and family deals</li>
        <li>Show photos, hours, and contact details</li>
        <li>Be featured in our local articles and kids-deals roundups</li>
      </ul>

      <p>
        If you’d like us to update any details (hours, photos, kids deals) or if
        this email reached the wrong contact, just reply directly to this email
        and we’ll take care of it.
      </p>

      <p>Thanks for serving Katy families,<br/>The eKaty Team<br/>
      <a href="https://ekaty.com" style="color:#ea580c;">https://ekaty.com</a></p>
    </div>
  `
}
