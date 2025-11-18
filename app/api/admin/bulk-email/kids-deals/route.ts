import { NextRequest, NextResponse } from 'next/server'
import { PrismaClient } from '@prisma/client'
import { Resend } from 'resend'

const prisma = new PrismaClient()

// POST /api/admin/bulk-email/kids-deals
// Admin-only endpoint to email restaurants about kids-eat-free verification
// Secured with ADMIN_API_KEY header

export async function POST(request: NextRequest) {
  try {
    const adminKey = request.headers.get('x-admin-api-key')
    const expectedKey = process.env.ADMIN_API_KEY

    if (!expectedKey) {
      console.error('ADMIN_API_KEY is not configured')
      return NextResponse.json(
        { error: 'Admin API key not configured' },
        { status: 500 }
      )
    }

    if (!adminKey || adminKey !== expectedKey) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    if (!process.env.RESEND_API_KEY || process.env.RESEND_API_KEY === 'dummy_key_for_build') {
      console.error('RESEND_API_KEY not configured correctly')
      return NextResponse.json(
        { error: 'Email not configured' },
        { status: 500 }
      )
    }

    const resend = new Resend(process.env.RESEND_API_KEY)

    console.log('[kids-deals-email] Loading kids deal candidate restaurants...')

    // Get restaurants with kids deals in marketing metadata
    const restaurants = await prisma.restaurant.findMany({
      where: {
        email: { not: null },
        active: true,
      },
      select: {
        id: true,
        name: true,
        email: true,
        slug: true,
        metadata: true,
      },
      orderBy: {
        name: 'asc',
      },
    })

    // Filter to only those with kidsDeal in marketing metadata
    const kidsDealsRestaurants = restaurants.filter(r => {
      if (!r.metadata) return false
      try {
        const meta = JSON.parse(r.metadata)
        return meta.marketing?.kidsDeal?.enabled === true
      } catch {
        return false
      }
    })

    console.log(`[kids-deals-email] Found ${kidsDealsRestaurants.length} restaurants with kids deals`)

    let sentCount = 0
    let errorCount = 0

    for (let index = 0; index < kidsDealsRestaurants.length; index++) {
      const restaurant = kidsDealsRestaurants[index]
      const email = restaurant.email?.trim()
      if (!email) continue

      const url = `https://ekaty.com/restaurants/${restaurant.slug}`
      const subject = 'Verify your Kids-Eat-Free program on eKaty.com'

      const emailNumber = index + 1
      const includeBcc = emailNumber % 50 === 0

      console.log(
        `[kids-deals-email] Sending #${emailNumber} to ${email} (${restaurant.name})${includeBcc ? ' [with BCC]' : ''}`
      )

      try {
        const html = buildKidsDealsEmailHtml(restaurant.name, url)

        const { error } = await resend.emails.send({
          from: 'James from eKaty <james@ekaty.com>',
          to: email,
          bcc: includeBcc ? 'james@ekaty.com' : undefined,
          subject,
          html,
        })

        if (error) {
          console.error(`[kids-deals-email] Error sending to ${email}:`, error)
          errorCount += 1
        } else {
          sentCount += 1
        }

        // Rate limiting
        await new Promise((resolve) => setTimeout(resolve, 600))
      } catch (err) {
        console.error(`[kids-deals-email] Unexpected error for ${email}:`, err)
        errorCount += 1
      }
    }

    console.log('[kids-deals-email] Completed bulk send', { sentCount, errorCount })

    return NextResponse.json({
      success: true,
      sent: sentCount,
      errors: errorCount,
      total: kidsDealsRestaurants.length,
    })
  } catch (error) {
    console.error('[kids-deals-email] Fatal error:', error)
    return NextResponse.json(
      { error: 'Bulk email failed' },
      { status: 500 }
    )
  } finally {
    await prisma.$disconnect()
  }
}

function buildKidsDealsEmailHtml(name: string | null, url: string) {
  const safeName = name?.trim() || 'there'

  return `
    <div style="font-family: system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif; line-height: 1.6; max-width: 640px; margin: 0 auto;">
      <h2 style="color:#ea580c;">Help us verify your Kids-Eat-Free program!</h2>

      <p>Hi ${safeName},</p>

      <p>
        We've noticed that your restaurant may offer a <strong>kids-eat-free program</strong>, and we'd love to feature
        this information prominently on <strong>eKaty.com</strong> to help local families discover your restaurant.
      </p>

      <p>
        Your current eKaty listing:<br/>
        <a href="${url}" style="color:#ea580c; word-break:break-all;">${url}</a>
      </p>

      <h3 style="color:#334155; font-size: 18px;">Can you help us verify the details?</h3>

      <p>
        Please reply to this email with the following information about your kids-eat-free program:
      </p>
      <ul>
        <li><strong>Days:</strong> Which day(s) of the week is it available? (e.g., Monday, Tuesday, etc.)</li>
        <li><strong>Age limit:</strong> What's the maximum age for kids? (e.g., 12 and under)</li>
        <li><strong>Requirements:</strong> Any conditions? (e.g., one free kids meal per adult entrée)</li>
        <li><strong>Time restrictions:</strong> Specific hours? (e.g., 4-7 PM)</li>
      </ul>

      <p>
        Once confirmed, we'll highlight your kids-eat-free program in:
      </p>
      <ul>
        <li>Our <strong>Kids-Eat-Free Directory</strong> that families search weekly</li>
        <li>Your enhanced restaurant listing with prominent badging</li>
        <li>Our weekly family dining newsletter (2,500+ subscribers)</li>
        <li>Social media posts featuring family-friendly restaurants</li>
      </ul>

      <p style="background: #fef3c7; border-left: 4px solid #f59e0b; padding: 12px; margin: 20px 0;">
        <strong>✨ Want even more visibility?</strong><br/>
        Ask us about our Premium Restaurant Partnership program that includes homepage features,
        dedicated blog articles, and priority placement in search results.
      </p>

      <p>
        Just reply to this email with your kids-eat-free details, or let me know if you'd like
        to discuss partnership opportunities!
      </p>

      <p>
        Thanks for making Katy a great place for families,<br/>
        James<br/>
        Founder, eKaty.com<br/>
        <a href="https://ekaty.com" style="color:#ea580c;">https://ekaty.com</a>
      </p>

      <p style="font-size: 12px; color: #64748b; margin-top: 40px;">
        If your restaurant doesn't offer a kids-eat-free program, or if you'd like us to remove any
        information from your listing, just reply and let us know.
      </p>
    </div>
  `
}
