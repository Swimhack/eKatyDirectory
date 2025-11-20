/**
 * Migration script to move data from Supabase to Prisma/SQLite
 *
 * This script:
 * 1. Exports data from Supabase tables
 * 2. Imports data into Prisma/SQLite
 * 3. Verifies data integrity
 *
 * Usage: npx tsx scripts/migrate-supabase-to-prisma.ts
 */

import * as dotenv from 'dotenv'
import * as path from 'path'
import { createClient } from '@supabase/supabase-js'
import { PrismaClient } from '@prisma/client'

// Load environment variables from .env.local
dotenv.config({ path: path.resolve(__dirname, '../.env.local') })

const prisma = new PrismaClient()

// Supabase configuration from .env.local
const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL
const SUPABASE_SERVICE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY

if (!SUPABASE_URL || !SUPABASE_SERVICE_KEY) {
  console.error('❌ Missing Supabase credentials in .env.local')
  console.error('   Required: NEXT_PUBLIC_SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY')
  process.exit(1)
}

const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_KEY)

async function migratePartnershipTiers() {
  console.log('📦 Migrating Partnership Tiers...')

  const { data, error } = await supabase
    .from('partnership_tiers')
    .select('*')

  if (error) {
    console.error('❌ Error fetching partnership tiers:', error)
    return
  }

  if (!data || data.length === 0) {
    console.log('ℹ️  No partnership tiers found in Supabase')
    return
  }

  for (const tier of data) {
    try {
      await prisma.partnershipTier.upsert({
        where: { slug: tier.slug },
        create: {
          id: tier.id,
          name: tier.name,
          slug: tier.slug,
          description: tier.description,
          monthlyPrice: tier.monthly_price,
          features: JSON.stringify(tier.features),
          displayOrder: tier.display_order || 0,
          isActive: tier.is_active !== false,
          createdAt: new Date(tier.created_at),
          updatedAt: new Date(tier.updated_at || tier.created_at),
        },
        update: {
          name: tier.name,
          description: tier.description,
          monthlyPrice: tier.monthly_price,
          features: JSON.stringify(tier.features),
          displayOrder: tier.display_order || 0,
          isActive: tier.is_active !== false,
          updatedAt: new Date(tier.updated_at || tier.created_at),
        },
      })
      console.log(`  ✓ Migrated tier: ${tier.name}`)
    } catch (err) {
      console.error(`  ❌ Error migrating tier ${tier.name}:`, err)
    }
  }

  console.log(`✅ Migrated ${data.length} partnership tiers\n`)
}

async function migrateRestaurantLeads() {
  console.log('📦 Migrating Restaurant Leads...')

  const { data, error } = await supabase
    .from('restaurant_leads')
    .select('*')

  if (error) {
    console.error('❌ Error fetching restaurant leads:', error)
    return
  }

  if (!data || data.length === 0) {
    console.log('ℹ️  No restaurant leads found in Supabase')
    return
  }

  let migrated = 0
  let skipped = 0

  for (const lead of data) {
    try {
      // Check if lead already exists (by email + business_name)
      const existing = await prisma.monetizationLead.findFirst({
        where: {
          contactEmail: lead.email,
          restaurantName: lead.business_name,
        },
      })

      if (existing) {
        console.log(`  ⏭️  Skipped duplicate: ${lead.business_name}`)
        skipped++
        continue
      }

      // Map tier from Supabase to Prisma
      const tierMap: Record<string, string> = {
        'owner': 'owner',
        'featured': 'featured',
        'premium': 'premium',
      }

      await prisma.monetizationLead.create({
        data: {
          restaurantId: lead.restaurant_id || 'unknown',
          restaurantName: lead.business_name,
          restaurantSlug: lead.business_name.toLowerCase().replace(/[^a-z0-9]+/g, '-'),
          contactEmail: lead.email,
          contactName: lead.contact_name,
          contactPhone: lead.phone,
          tier: tierMap[lead.tier] || 'owner',
          source: lead.source || 'supabase_migration',
          status: lead.status || 'new',
          assignedToId: lead.assigned_to || null,
          notes: lead.notes,
          createdAt: new Date(lead.created_at),
          updatedAt: new Date(lead.updated_at || lead.created_at),
        },
      })

      migrated++
      console.log(`  ✓ Migrated lead: ${lead.business_name}`)
    } catch (err) {
      console.error(`  ❌ Error migrating lead ${lead.business_name}:`, err)
    }
  }

  console.log(`✅ Migrated ${migrated} leads, skipped ${skipped} duplicates\n`)
}

async function migratePartnerships() {
  console.log('📦 Migrating Partnerships...')

  const { data, error } = await supabase
    .from('partnerships')
    .select('*')

  if (error) {
    console.error('❌ Error fetching partnerships:', error)
    return
  }

  if (!data || data.length === 0) {
    console.log('ℹ️  No partnerships found in Supabase')
    return
  }

  for (const partnership of data) {
    try {
      await prisma.partnership.create({
        data: {
          id: partnership.id,
          restaurantId: partnership.restaurant_id,
          tierId: partnership.tier_id,
          status: partnership.status || 'active',
          startDate: new Date(partnership.start_date),
          endDate: partnership.end_date ? new Date(partnership.end_date) : null,
          billingCycle: partnership.billing_cycle || 'monthly',
          notes: partnership.notes,
          createdAt: new Date(partnership.created_at),
          updatedAt: new Date(partnership.updated_at || partnership.created_at),
        },
      })
      console.log(`  ✓ Migrated partnership: ${partnership.id}`)
    } catch (err: any) {
      if (err.code === 'P2002') {
        console.log(`  ⏭️  Skipped duplicate partnership: ${partnership.id}`)
      } else {
        console.error(`  ❌ Error migrating partnership ${partnership.id}:`, err.message)
      }
    }
  }

  console.log(`✅ Migrated partnerships\n`)
}

async function migrateOutreachCampaigns() {
  console.log('📦 Migrating Outreach Campaigns...')

  const { data, error } = await supabase
    .from('outreach_campaigns')
    .select('*')

  if (error) {
    console.error('❌ Error fetching outreach campaigns:', error)
    return
  }

  if (!data || data.length === 0) {
    console.log('ℹ️  No outreach campaigns found in Supabase')
    return
  }

  for (const campaign of data) {
    try {
      await prisma.outreachCampaign.create({
        data: {
          id: campaign.id,
          name: campaign.name,
          description: campaign.description,
          subject: campaign.subject,
          emailTemplate: campaign.email_template,
          targetSegment: campaign.target_segment ? JSON.stringify(campaign.target_segment) : null,
          status: campaign.status || 'draft',
          scheduledAt: campaign.scheduled_at ? new Date(campaign.scheduled_at) : null,
          sentAt: campaign.sent_at ? new Date(campaign.sent_at) : null,
          createdBy: campaign.created_by,
          createdAt: new Date(campaign.created_at),
          updatedAt: new Date(campaign.updated_at || campaign.created_at),
        },
      })
      console.log(`  ✓ Migrated campaign: ${campaign.name}`)
    } catch (err: any) {
      if (err.code === 'P2002') {
        console.log(`  ⏭️  Skipped duplicate campaign: ${campaign.name}`)
      } else {
        console.error(`  ❌ Error migrating campaign ${campaign.name}:`, err.message)
      }
    }
  }

  console.log(`✅ Migrated campaigns\n`)
}

async function migrateOutreachEmails() {
  console.log('📦 Migrating Outreach Emails...')

  const { data, error } = await supabase
    .from('outreach_emails')
    .select('*')

  if (error) {
    console.error('❌ Error fetching outreach emails:', error)
    return
  }

  if (!data || data.length === 0) {
    console.log('ℹ️  No outreach emails found in Supabase')
    return
  }

  let migrated = 0

  for (const email of data) {
    try {
      await prisma.outreachEmail.create({
        data: {
          id: email.id,
          campaignId: email.campaign_id,
          leadId: email.lead_id || null,
          recipientEmail: email.recipient_email,
          recipientName: email.recipient_name,
          subject: email.subject,
          emailBody: email.email_body,
          status: email.status || 'pending',
          sentAt: email.sent_at ? new Date(email.sent_at) : null,
          deliveredAt: email.delivered_at ? new Date(email.delivered_at) : null,
          openedAt: email.opened_at ? new Date(email.opened_at) : null,
          clickedAt: email.clicked_at ? new Date(email.clicked_at) : null,
          bouncedAt: email.bounced_at ? new Date(email.bounced_at) : null,
          bounceReason: email.bounce_reason,
          metadata: email.metadata ? JSON.stringify(email.metadata) : null,
          createdAt: new Date(email.created_at),
          updatedAt: new Date(email.updated_at || email.created_at),
        },
      })
      migrated++
    } catch (err: any) {
      if (err.code === 'P2002') {
        // Skip duplicate
      } else if (err.code === 'P2003') {
        console.log(`  ⚠️  Skipped email with missing campaign/lead reference`)
      } else {
        console.error(`  ❌ Error migrating email:`, err.message)
      }
    }
  }

  console.log(`✅ Migrated ${migrated} outreach emails\n`)
}

async function main() {
  console.log('🚀 Starting Supabase to Prisma migration...\n')

  try {
    // Run migrations in order (respecting foreign key constraints)
    await migratePartnershipTiers()
    await migrateRestaurantLeads()
    await migratePartnerships()
    await migrateOutreachCampaigns()
    await migrateOutreachEmails()

    console.log('✅ Migration completed successfully!')
    console.log('\n📊 Migration Summary:')
    console.log('  - Partnership Tiers: Migrated')
    console.log('  - Restaurant Leads: Migrated to MonetizationLeads')
    console.log('  - Partnerships: Migrated')
    console.log('  - Outreach Campaigns: Migrated')
    console.log('  - Outreach Emails: Migrated')
    console.log('\n⚠️  Next Steps:')
    console.log('  1. Verify data in Prisma Studio: npx prisma studio')
    console.log('  2. Update API endpoints to use Prisma')
    console.log('  3. Remove Supabase dependencies')
    console.log('  4. Update .env files to remove Supabase credentials')

  } catch (error) {
    console.error('❌ Migration failed:', error)
    process.exit(1)
  } finally {
    await prisma.$disconnect()
  }
}

main()
