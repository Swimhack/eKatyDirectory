import { PrismaClient } from '@prisma/client'
import * as fs from 'fs'
import * as path from 'path'

const prisma = new PrismaClient()

/**
 * SMS Template Generator for Phone-Only Restaurants
 * These have the highest conversion potential - personal touch works best
 */

function generateSlug(name: string): string {
  return name
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/(^-|-$)/g, '')
}

async function generateSmsOutreach() {
  try {
    console.log('📱 Generating SMS outreach for phone-only restaurants...\n')

    const phoneOnlyRestaurants = await prisma.restaurant.findMany({
      where: {
        active: true,
        phone: { not: null },
        website: null
      },
      select: {
        id: true,
        name: true,
        phone: true,
        address: true,
        cuisineTypes: true,
        rating: true,
        reviewCount: true
      }
    })

    console.log(`Found ${phoneOnlyRestaurants.length} phone-only restaurants\n`)

    const smsMessages: any[] = []

    for (const restaurant of phoneOnlyRestaurants) {
      const slug = generateSlug(restaurant.name)

      // SMS Message 1 (Initial - 160 chars max for single SMS)
      const sms1 = `Hi ${restaurant.name}! We built you a FREE website at ekaty.com/restaurants/${slug}. Claim it in 2 min to get more customers. -James, eKaty`

      // SMS Message 2 (Follow-up - Day 3)
      const sms2 = `Quick follow-up - Did you see your FREE profile page? 10K+ people search restaurants in Katy monthly. Claim yours: ekaty.com/restaurants/${slug} -James`

      // SMS Message 3 (Last Chance - Day 7)
      const sms3 = `Last chance ${restaurant.name}! Your FREE listing expires soon. Takes 2 min to claim: ekaty.com/restaurants/${slug}?claim=true Reply STOP to opt out. -James`

      smsMessages.push({
        restaurantId: restaurant.id,
        restaurantName: restaurant.name,
        phone: restaurant.phone,
        cuisine: restaurant.cuisineTypes,
        rating: restaurant.rating,
        reviews: restaurant.reviewCount,
        sms1,
        sms2,
        sms3,
        profileUrl: `https://ekaty.com/restaurants/${slug}`,
        claimUrl: `https://ekaty.com/restaurants/${slug}?claim=true`
      })
    }

    // Create SMS batch file
    const outputDir = path.join(process.cwd(), 'outreach-emails', 'sms-outreach')
    if (!fs.existsSync(outputDir)) {
      fs.mkdirSync(outputDir, { recursive: true })
    }

    // Generate detailed SMS script
    const smsScript = `# SMS Outreach Campaign - Phone-Only Restaurants
## ${smsMessages.length} High-Conversion Targets

**Why SMS Works for This Segment:**
- They already use their phone for business
- No website = they need a web presence
- Personal touch = higher conversion
- SMS open rate: 98% (vs 20% for email)

**Campaign Structure:**
1. **Day 0:** Initial SMS announcing free website
2. **Day 3:** Follow-up if no response
3. **Day 7:** Last chance message

**Cost:** ~$0.024 total per restaurant (3 messages @ $0.0079 each via Twilio)

---

## SMS Messages (Copy/Paste Ready)

${smsMessages.map((msg, index) => `
### ${index + 1}. ${msg.restaurantName}
**Phone:** ${msg.phone}
**Rating:** ${msg.rating}/5 (${msg.reviews} reviews)
**Cuisine:** ${msg.cuisine}
**Profile URL:** ${msg.profileUrl}

#### Message 1 (Day 0 - Send Now)
\`\`\`
${msg.sms1}
\`\`\`
*Length: ${msg.sms1.length} characters*

#### Message 2 (Day 3 - If No Response)
\`\`\`
${msg.sms2}
\`\`\`
*Length: ${msg.sms2.length} characters*

#### Message 3 (Day 7 - Last Chance)
\`\`\`
${msg.sms3}
\`\`\`
*Length: ${msg.sms3.length} characters*

---
`).join('\n')}

## Sending Options

### Option 1: Manual (Personal, Highest Conversion)
1. Use your personal phone
2. Send from your actual number (more trust)
3. Copy/paste each message
4. Track responses manually
5. **Best for:** First 10-20 restaurants

### Option 2: Twilio (Semi-Automated)
1. Sign up at twilio.com (free trial: $15 credit)
2. Get a local Katy, TX number
3. Use their API or web interface
4. Track responses in dashboard
5. **Cost:** $0.024 per restaurant (3 messages)
6. **Best for:** All ${smsMessages.length} restaurants

### Option 3: SimpleTexting (Fully Automated)
1. Sign up at simpletexting.com (500 free texts/month)
2. Upload contacts
3. Schedule 3-message sequence
4. Auto-track responses
5. **Best for:** Large-scale campaigns

## Twilio Quick Start Script

\`\`\`javascript
// Send SMS via Twilio API
const twilio = require('twilio');
const client = new twilio('YOUR_ACCOUNT_SID', 'YOUR_AUTH_TOKEN');

const restaurants = ${JSON.stringify(smsMessages.slice(0, 5), null, 2)};

async function sendInitialSms() {
  for (const r of restaurants) {
    await client.messages.create({
      body: r.sms1,
      from: '+1YOUR_TWILIO_NUMBER',
      to: r.phone
    });
    console.log(\`Sent to \${r.restaurantName}\`);
    await new Promise(resolve => setTimeout(resolve, 1000)); // 1 sec delay
  }
}

sendInitialSms();
\`\`\`

## Expected Results

**Based on SMS marketing benchmarks:**
- Open Rate: 98%
- Response Rate: 15-20%
- Conversion Rate: 8-12%

**Revenue Projection:**
- Restaurants: ${smsMessages.length}
- 10% conversion = ${Math.floor(smsMessages.length * 0.10)} signups
- Avg plan: $49/month
- **Monthly Revenue: $${Math.floor(smsMessages.length * 0.10 * 49)}**
- **Annual Revenue: $${Math.floor(smsMessages.length * 0.10 * 49 * 12)}**

**ROI:**
- Cost: $${(smsMessages.length * 0.024).toFixed(2)} (Twilio)
- Revenue (first month): $${Math.floor(smsMessages.length * 0.10 * 49)}
- **ROI: ${Math.floor((smsMessages.length * 0.10 * 49) / (smsMessages.length * 0.024))}x**

## Compliance Notes

✅ **CAN-SPAM Compliant:**
- Include your name/business
- Provide opt-out (Reply STOP)
- Honor opt-outs immediately

✅ **TCPA Compliant:**
- Business-to-business (B2B) communications
- Informational (not pure advertising)
- One-to-one messaging preferred

## Response Handling

**If they reply "YES" or "INTERESTED":**
→ Send claim link with brief instructions
→ Offer 15-min onboarding call
→ Follow up next day if they don't claim

**If they reply with QUESTIONS:**
→ Answer briefly via SMS
→ Offer to call them directly
→ Be helpful and personal

**If they reply "NOT INTERESTED" or "STOP":**
→ Respect their wishes
→ Remove from SMS list
→ Maybe try email instead?

**If NO RESPONSE:**
→ Send follow-up on Day 3
→ Last chance on Day 7
→ Then stop (don't be annoying)

---

**Ready to text?** Start with the top 5 restaurants and see how they respond!

*Generated: ${new Date().toLocaleString()}*
`

    fs.writeFileSync(path.join(outputDir, 'SMS-CAMPAIGN.md'), smsScript)

    // Generate CSV for Twilio/SimpleTexting
    const csvHeader = ['Phone', 'Restaurant Name', 'Message 1', 'Message 2', 'Message 3', 'Profile URL'].join(',')
    const csvRows = smsMessages.map(msg => [
      msg.phone,
      `"${msg.restaurantName}"`,
      `"${msg.sms1.replace(/"/g, '""')}"`,
      `"${msg.sms2.replace(/"/g, '""')}"`,
      `"${msg.sms3.replace(/"/g, '""')}"`,
      msg.profileUrl
    ].join(','))

    const csv = [csvHeader, ...csvRows].join('\n')
    fs.writeFileSync(path.join(outputDir, 'sms-batch.csv'), csv)

    console.log(`✅ SMS Campaign Generated!`)
    console.log(`\n📊 Summary:`)
    console.log(`   • ${smsMessages.length} phone-only restaurants`)
    console.log(`   • ${smsMessages.length * 3} total messages (3 per restaurant)`)
    console.log(`   • Cost: $${(smsMessages.length * 0.024).toFixed(2)} via Twilio`)
    console.log(`\n💰 Revenue Potential:`)
    console.log(`   • 10% conversion: $${Math.floor(smsMessages.length * 0.10 * 49)}/month`)
    console.log(`   • ROI: ${Math.floor((smsMessages.length * 0.10 * 49) / (smsMessages.length * 0.024))}x`)
    console.log(`\n📁 Files Created:`)
    console.log(`   • SMS-CAMPAIGN.md - Detailed campaign guide`)
    console.log(`   • sms-batch.csv - For Twilio/SimpleTexting`)
    console.log(`\n📱 Next Step: Start texting! Highest conversion potential.`)

  } catch (error) {
    console.error('❌ Error generating SMS campaign:', error)
    throw error
  } finally {
    await prisma.$disconnect()
  }
}

generateSmsOutreach()
