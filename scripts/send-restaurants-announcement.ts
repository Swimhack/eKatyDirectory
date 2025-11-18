import { PrismaClient } from '@prisma/client'
import { Resend } from 'resend'

// One-off script to email all restaurants using the same configuration
// pattern as the contact form (Resend + james@ekaty.com sender).
//
// Usage (from project root, with ts-node):
//   RESEND_API_KEY=your_key npx ts-node scripts/send-restaurants-announcement.ts
//
// IMPORTANT: This will send real emails. Test first with a small subset
// or a staging database.

const resendApiKey = process.env.RESEND_API_KEY

if (!resendApiKey || resendApiKey === 'dummy_key_for_build') {
  throw new Error('RESEND_API_KEY is not configured or is using the dummy build key.')
}

const resend = new Resend(resendApiKey)
const prisma = new PrismaClient()

const FROM_EMAIL = 'James from eKaty <james@ekaty.com>'
const BCC_EMAIL = 'james@ekaty.com'

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

async function main() {
  console.log('Loading restaurants with email addresses...')

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

  console.log(`Found ${restaurants.length} restaurants with emails.`)

  for (let index = 0; index < restaurants.length; index++) {
    const restaurant = restaurants[index]
    const email = restaurant.email?.trim()
    if (!email) {
      continue
    }

    const url = `https://ekaty.com/restaurants/${restaurant.slug}`
    const subject = 'Your restaurant is now on eKaty.com'

    const emailNumber = index + 1
    const includeBcc = emailNumber % 100 === 0

    console.log(`Sending #${emailNumber} to ${email} (${restaurant.name}) -> ${url}${includeBcc ? ' [with BCC]' : ''}`)

    try {
      const { data, error } = await resend.emails.send({
        from: FROM_EMAIL,
        to: email,
        // Only BCC James on every 100th email to avoid flooding his inbox
        bcc: includeBcc ? BCC_EMAIL : undefined,
        subject,
        html: buildEmailHtml(restaurant.name, url),
      })

      if (error) {
        console.error(`Error sending to ${email}:`, error)
      } else {
        console.log(`Sent to ${email}, id=${data?.id}`)
      }

      // Gentle rate limiting
      await new Promise((resolve) => setTimeout(resolve, 500))
    } catch (err) {
      console.error(`Unexpected error for ${email}:`, err)
    }
  }

  await prisma.$disconnect()
  console.log('Done sending emails.')
}

main().catch((err) => {
  console.error('Fatal error in send-restaurants-announcement:', err)
  prisma.$disconnect().finally(() => process.exit(1))
})
