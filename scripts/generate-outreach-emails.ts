import { PrismaClient } from '@prisma/client'
import { getTemplateForSegment } from '../lib/outreach/email-templates'
import * as fs from 'fs'
import * as path from 'path'

const prisma = new PrismaClient()

interface RestaurantSegment {
  segment: string
  restaurants: any[]
  criteria: string
}

async function generateOutreachEmails() {
  try {
    console.log('📧 Generating personalized outreach emails for 245 restaurants...\n')

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
        priceLevel: true,
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

    // Segment restaurants
    const segments: RestaurantSegment[] = [
      {
        segment: 'High-Value Targets',
        criteria: 'Rating ≥4.0, 50+ reviews, no marketing',
        restaurants: restaurantsWithData.filter(r =>
          !r.hasMarketing &&
          !r.featured &&
          r.rating && r.rating >= 4.0 &&
          r.reviewCount >= 50
        )
      },
      {
        segment: 'Family-Friendly Upsell',
        criteria: 'Already has marketing, not featured',
        restaurants: restaurantsWithData.filter(r =>
          r.hasMarketing &&
          !r.featured
        )
      },
      {
        segment: 'Featured Placement Candidates',
        criteria: 'Rating ≥4.5, 100+ reviews',
        restaurants: restaurantsWithData.filter(r =>
          !r.featured &&
          r.rating && r.rating >= 4.5 &&
          r.reviewCount >= 100
        )
      },
      {
        segment: 'Phone-Only Quick Wins',
        criteria: 'Has phone, no website',
        restaurants: restaurantsWithData.filter(r =>
          r.phone && !r.website
        )
      }
    ]

    // Create output directory
    const outputDir = path.join(process.cwd(), 'outreach-emails')
    if (!fs.existsSync(outputDir)) {
      fs.mkdirSync(outputDir, { recursive: true })
    }

    let totalEmails = 0
    const emailBatches: any[] = []

    // Generate emails for each segment
    for (const { segment, criteria, restaurants } of segments) {
      console.log(`\n📨 ${segment}: ${restaurants.length} restaurants`)
      console.log(`   Criteria: ${criteria}`)

      const segmentDir = path.join(outputDir, segment.toLowerCase().replace(/\s+/g, '-'))
      if (!fs.existsSync(segmentDir)) {
        fs.mkdirSync(segmentDir, { recursive: true })
      }

      for (const restaurant of restaurants) {
        const restaurantData = {
          name: restaurant.name,
          rating: restaurant.rating,
          reviewCount: restaurant.reviewCount,
          phone: restaurant.phone,
          website: restaurant.website,
          cuisine: restaurant.cuisineTypes,
          address: restaurant.address
        }

        // Generate initial email (Day 0)
        const initialEmail = getTemplateForSegment(segment, restaurantData)

        // Generate follow-up emails (Day 3, Day 7)
        const followUp3 = getTemplateForSegment(segment, restaurantData, 3)
        const followUp7 = getTemplateForSegment(segment, restaurantData, 7)

        // Save individual email files
        const restaurantSlug = restaurant.slug
        const emailFilePath = path.join(segmentDir, `${restaurantSlug}.md`)

        const emailContent = `# ${restaurant.name} - Outreach Email Sequence

## Restaurant Details
- **Name:** ${restaurant.name}
- **Phone:** ${restaurant.phone || 'N/A'}
- **Website:** ${restaurant.website || 'N/A'}
- **Email:** ${restaurant.email || 'N/A'}
- **Rating:** ${restaurant.rating || 'N/A'}/5
- **Reviews:** ${restaurant.reviewCount}
- **Cuisine:** ${restaurant.cuisineTypes}
- **Address:** ${restaurant.address}
- **Segment:** ${segment}

---

## EMAIL 1: Initial Outreach (Day 0)

**Subject:** ${initialEmail.subject}

**Preview:** ${initialEmail.preview}

**Body:**

${initialEmail.body}

**CTA:** ${initialEmail.cta}
**URL:** ${initialEmail.ctaUrl}

---

## EMAIL 2: Follow-Up (Day 3)

**Subject:** ${followUp3.subject}

**Preview:** ${followUp3.preview}

**Body:**

${followUp3.body}

**CTA:** ${followUp3.cta}
**URL:** ${followUp3.ctaUrl}

---

## EMAIL 3: Last Chance (Day 7)

**Subject:** ${followUp7.subject}

**Preview:** ${followUp7.preview}

**Body:**

${followUp7.body}

**CTA:** ${followUp7.cta}
**URL:** ${followUp7.ctaUrl}

---

## Recommended Sending Schedule

1. **Day 0 (Now):** Send initial email
2. **Day 3:** Send follow-up if no response
3. **Day 7:** Send last chance if still no response

## Next Steps After Response

- **Interested:** Send onboarding email with login credentials
- **Questions:** Book 15-min call to address concerns
- **Not Now:** Add to nurture campaign for 30 days later
- **Not Interested:** Remove from list, mark as inactive

---

*Generated by eKaty Outreach System*
*Date: ${new Date().toISOString()}*
`

        fs.writeFileSync(emailFilePath, emailContent)

        // Add to batch data for automation
        emailBatches.push({
          restaurantId: restaurant.id,
          restaurantName: restaurant.name,
          segment,
          email: restaurant.email,
          phone: restaurant.phone,
          website: restaurant.website,
          day0Subject: initialEmail.subject,
          day0Body: initialEmail.body,
          day3Subject: followUp3.subject,
          day3Body: followUp3.body,
          day7Subject: followUp7.subject,
          day7Body: followUp7.body
        })

        totalEmails++
      }

      console.log(`   ✅ Generated ${restaurants.length} email sequences`)
    }

    // Create master CSV for email automation platforms
    const csvHeader = [
      'Restaurant ID',
      'Restaurant Name',
      'Segment',
      'Email',
      'Phone',
      'Website',
      'Day 0 Subject',
      'Day 0 Body',
      'Day 3 Subject',
      'Day 3 Body',
      'Day 7 Subject',
      'Day 7 Body'
    ].join(',')

    const csvRows = emailBatches.map(batch => [
      batch.restaurantId,
      `"${batch.restaurantName}"`,
      `"${batch.segment}"`,
      batch.email || '',
      batch.phone || '',
      batch.website || '',
      `"${batch.day0Subject.replace(/"/g, '""')}"`,
      `"${batch.day0Body.replace(/"/g, '""')}"`,
      `"${batch.day3Subject.replace(/"/g, '""')}"`,
      `"${batch.day3Body.replace(/"/g, '""')}"`,
      `"${batch.day7Subject.replace(/"/g, '""')}"`,
      `"${batch.day7Body.replace(/"/g, '""')}"`
    ].join(','))

    const masterCsv = [csvHeader, ...csvRows].join('\n')
    fs.writeFileSync(path.join(outputDir, 'master-email-batch.csv'), masterCsv)

    // Create summary report
    const summary = `# eKaty Restaurant Outreach Campaign
## Generated: ${new Date().toLocaleString()}

### Campaign Overview
- **Total Restaurants:** ${totalEmails}
- **Total Emails Generated:** ${totalEmails * 3} (3 per restaurant)
- **Segments:** ${segments.length}

### Breakdown by Segment

${segments.map(s => `#### ${s.segment}
- Restaurants: ${s.restaurants.length}
- Criteria: ${s.criteria}
- Emails: ${s.restaurants.length * 3}
`).join('\n')}

### Revenue Projections

**Conservative (10% conversion at $99/month avg):**
- Conversions: ${Math.floor(totalEmails * 0.10)}
- Monthly Revenue: $${Math.floor(totalEmails * 0.10 * 99).toLocaleString()}
- Annual Revenue: $${Math.floor(totalEmails * 0.10 * 99 * 12).toLocaleString()}

**Optimistic (20% conversion at $99/month avg):**
- Conversions: ${Math.floor(totalEmails * 0.20)}
- Monthly Revenue: $${Math.floor(totalEmails * 0.20 * 99).toLocaleString()}
- Annual Revenue: $${Math.floor(totalEmails * 0.20 * 99 * 12).toLocaleString()}

### Files Generated

1. **Individual Email Sequences:** ${totalEmails} markdown files organized by segment
2. **Master CSV:** \`master-email-batch.csv\` for bulk email platforms
3. **Summary Report:** This file

### Next Steps

#### Option 1: Manual Outreach (Personalized, High Touch)
1. Review individual email files in segment folders
2. Customize as needed for high-value targets
3. Send from personal email (james@ekaty.com)
4. Track responses in spreadsheet

#### Option 2: Automated Outreach (Scale, Low Touch)
1. Import \`master-email-batch.csv\` into:
   - Mailchimp
   - SendGrid
   - HubSpot
   - ActiveCampaign
2. Set up 3-email sequence (Day 0, Day 3, Day 7)
3. Enable tracking and response automation

#### Option 3: Hybrid Approach (Recommended)
1. **High-Value Targets (102):** Manual, personalized outreach
2. **Phone-Only Quick Wins (24):** SMS + Email automation
3. **Family-Friendly Upsell (89):** Automated email sequence
4. **Featured Candidates (30):** Personal phone calls

### Recommended Tools

**Email Automation:**
- SendGrid (2,000 free emails/month)
- Mailchimp (1,000 free emails/month)
- Gmail + Mail Merge (Chrome extension)

**SMS Outreach:**
- Twilio ($0.0079/SMS)
- SimpleTexting (500 free texts/month)

**Phone Outreach:**
- Just call them! :)

### Tracking

Create a simple Google Sheet to track:
- Restaurant Name
- Segment
- Day 0 Sent (Date)
- Day 3 Sent (Date)
- Day 7 Sent (Date)
- Response (Yes/No/Maybe)
- Conversion (Yes/No)
- Revenue ($)

---

**Ready to launch?** Let's get these 245 restaurants signed up!
`

    fs.writeFileSync(path.join(outputDir, 'CAMPAIGN-SUMMARY.md'), summary)

    console.log(`\n\n✅ EMAIL GENERATION COMPLETE!`)
    console.log(`\n📊 Summary:`)
    console.log(`   • ${totalEmails} restaurants targeted`)
    console.log(`   • ${totalEmails * 3} total emails generated (3 per restaurant)`)
    console.log(`   • Files saved to: ${outputDir}`)
    console.log(`\n📁 Generated Files:`)
    console.log(`   • Individual email sequences: ${totalEmails} markdown files`)
    console.log(`   • Master CSV for automation: master-email-batch.csv`)
    console.log(`   • Campaign summary: CAMPAIGN-SUMMARY.md`)
    console.log(`\n💰 Revenue Potential:`)
    console.log(`   • 10% conversion: $${Math.floor(totalEmails * 0.10 * 99).toLocaleString()}/month`)
    console.log(`   • 20% conversion: $${Math.floor(totalEmails * 0.20 * 99).toLocaleString()}/month`)
    console.log(`\n🚀 Next Step: Open the outreach-emails folder and start sending!`)

  } catch (error) {
    console.error('❌ Error generating emails:', error)
    throw error
  } finally {
    await prisma.$disconnect()
  }
}

generateOutreachEmails()
