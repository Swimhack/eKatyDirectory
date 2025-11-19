# Quick Start: Monetization & Outreach Dashboard

**Feature**: 001-monetization-dashboard
**For**: Developers implementing this feature
**Last Updated**: 2025-01-18

## Prerequisites

Before starting implementation, ensure you have:

- [ ] Next.js 14 development environment running locally
- [ ] Supabase account with database access
- [ ] Node.js 18+ and npm installed
- [ ] Git branch `001-monetization-dashboard` checked out
- [ ] `.env.local` configured with Supabase credentials
- [ ] Familiarity with Next.js App Router and React Server Components

---

## Implementation Checklist

### Phase 1: Database Setup (Day 1)

- [ ] **Create migration file**: `supabase/migrations/002_monetization_schema.sql`
- [ ] **Add tables** from `data-model.md`:
  - `partnership_tiers`
  - `restaurant_leads`
  - `outreach_campaigns`
  - `outreach_emails`
  - `partnerships`
  - `partnership_applications`
  - `follow_up_sequences`
- [ ] **Add database functions**: Update timestamp triggers, renewal date calculator, campaign metrics updater
- [ ] **Add RLS policies**: Admin-only access with public read for active tiers
- [ ] **Run migration**: Apply to development database
- [ ] **Seed initial data**: Add 3 partnership tiers (Basic, Premium, Featured)
- [ ] **Update users table**: Add `role` column if not exists (`user` | `admin`)

**Verification**:
```bash
# Check tables exist
npm run supabase:db:inspect

# Verify RLS policies
npm run supabase:db:policies
```

---

### Phase 2: Email Service Integration (Day 1-2)

- [ ] **Install dependencies**:
  ```bash
  npm install resend @react-email/components
  ```

- [ ] **Get Resend API key**:
  - Sign up at https://resend.com
  - Create API key
  - Add to `.env.local`: `RESEND_API_KEY=re_...`

- [ ] **Create email client**: `lib/email/client.ts`
  - Initialize Resend client
  - Export `sendEmail()` function
  - Add error handling

- [ ] **Create email templates**: `lib/email/templates.ts`
  - `generateOutreachEmail(lead, tier, template)` → HTML
  - `generateWelcomeEmail(restaurant, tier)` → HTML
  - `generateRenewalReminderEmail(partnership)` → HTML
  - Use `@react-email/components` for structure

- [ ] **Create tracking helpers**: `lib/email/tracking.ts`
  - `generateTrackingPixel(emailId)` → URL
  - `generateTrackingLink(emailId, destination)` → URL
  - `processWebhook(event)` → update database

- [ ] **Create webhook endpoint**: `app/api/webhooks/email/route.ts`
  - Handle Resend webhooks (email.opened, email.clicked, email.bounced)
  - Update `outreach_emails` table with timestamps
  - Update `restaurant_leads` status based on events

**Verification**:
```typescript
// Test email sending (dev only)
import { sendEmail } from '@/lib/email/client'

const result = await sendEmail({
  to: 'test@example.com',
  subject: 'Test',
  html: '<p>Hello from eKaty</p>'
})
console.log('Email ID:', result.id)
```

---

### Phase 3: Testing Setup (Day 2)

- [ ] **Install test dependencies**:
  ```bash
  npm install -D vitest @vitejs/plugin-react @testing-library/react @testing-library/user-event @testing-library/jest-dom jsdom @playwright/test
  ```

- [ ] **Create Vitest config**: `vitest.config.ts`
  ```typescript
  import { defineConfig } from 'vitest/config'
  import react from '@vitejs/plugin-react'
  import path from 'path'

  export default defineConfig({
    plugins: [react()],
    test: {
      globals: true,
      environment: 'jsdom',
      setupFiles: './tests/setup.ts',
    },
    resolve: {
      alias: {
        '@': path.resolve(__dirname, './'),
      },
    },
  })
  ```

- [ ] **Create test setup**: `tests/setup.ts`
  ```typescript
  import '@testing-library/jest-dom'
  import { vi } from 'vitest'

  // Mock Supabase client
  vi.mock('@/lib/supabase/client', () => ({
    createClient: vi.fn(() => ({
      from: vi.fn(),
      auth: {
        getSession: vi.fn(),
        getUser: vi.fn(),
      },
    })),
  }))

  // Mock email client
  vi.mock('@/lib/email/client', () => ({
    sendEmail: vi.fn(() => ({ id: 'test-email-id' })),
  }))
  ```

- [ ] **Create Playwright config**: `playwright.config.ts`
  ```typescript
  import { defineConfig } from '@playwright/test'

  export default defineConfig({
    testDir: './tests/e2e',
    use: {
      baseURL: 'http://localhost:3000',
    },
    webServer: {
      command: 'npm run dev',
      port: 3000,
      reuseExistingServer: !process.env.CI,
    },
  })
  ```

- [ ] **Update package.json scripts**:
  ```json
  {
    "scripts": {
      "test": "vitest",
      "test:e2e": "playwright test",
      "test:coverage": "vitest --coverage"
    }
  }
  ```

**Verification**:
```bash
# Run unit tests
npm test

# Run E2E tests
npm run test:e2e
```

---

### Phase 4: Admin Authorization (Day 2-3)

- [ ] **Create admin middleware**: `lib/auth/require-admin.ts`
  ```typescript
  export async function requireAdmin(request: NextRequest) {
    const supabase = createRouteHandlerClient({ cookies })
    const { data: { session } } = await supabase.auth.getSession()

    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { data: user } = await supabase
      .from('users')
      .select('role')
      .eq('id', session.user.id)
      .single()

    if (user?.role !== 'admin') {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
    }

    return null // Success
  }
  ```

- [ ] **Protect admin routes**: Use middleware in all admin API routes
- [ ] **Create admin navigation**: `components/admin/layout/AdminNav.tsx`
  - Monetization dashboard link
  - Outreach link
  - Tiers link
  - Revenue link
  - Applications link

- [ ] **Update main admin page**: `app/admin/page.tsx`
  - Add navigation cards linking to monetization features
  - Show quick stats (total revenue, pending applications)

**Verification**:
- [ ] Try accessing `/admin/monetization` without auth → redirect to `/auth`
- [ ] Try accessing with regular user → 403 error
- [ ] Access with admin user → success

---

### Phase 5: Partnership Tiers (Day 3-4)

**API Routes**:
- [ ] `app/api/admin/tiers/route.ts`: GET (list), POST (create)
- [ ] `app/api/admin/tiers/[id]/route.ts`: GET (detail), PATCH (update), DELETE (soft delete)

**UI Components**:
- [ ] `components/admin/monetization/TierForm.tsx`: Create/edit tier form
- [ ] `components/admin/monetization/TierComparison.tsx`: Tier comparison table

**Pages**:
- [ ] `app/admin/monetization/tiers/page.tsx`: Tier management page
- [ ] `app/partner/page.tsx`: Public partnership page with tier comparison

**Tests**:
- [ ] Unit: TierForm validation
- [ ] Integration: Tier CRUD APIs
- [ ] E2E: Create new tier flow

---

### Phase 6: Restaurant Leads (Day 4-5)

**API Routes**:
- [ ] `app/api/admin/leads/route.ts`: GET (list with filters), POST (create)
- [ ] `app/api/admin/leads/[id]/route.ts`: GET (detail with history), PATCH (update)

**UI Components**:
- [ ] `components/admin/monetization/LeadSelector.tsx`: Multi-select lead picker
- [ ] Create leads table component with status filters

**Pages**:
- [ ] `app/admin/monetization/leads/page.tsx`: Lead management page

**Tests**:
- [ ] Unit: Lead status validation
- [ ] Integration: Lead CRUD APIs
- [ ] E2E: Add new lead flow

---

### Phase 7: Outreach Campaigns (Day 5-7)

**API Routes**:
- [ ] `app/api/admin/outreach/route.ts`: GET (list), POST (create campaign)
- [ ] `app/api/admin/outreach/[id]/route.ts`: GET (detail), PATCH (update)
- [ ] `app/api/admin/outreach/send/route.ts`: POST (send campaign emails)

**UI Components**:
- [ ] `components/admin/monetization/EmailTemplateEditor.tsx`: Rich text email editor
- [ ] `components/admin/monetization/OutreachTable.tsx`: Campaign list with stats

**Pages**:
- [ ] `app/admin/monetization/outreach/page.tsx`: Campaign list
- [ ] `app/admin/monetization/outreach/[campaignId]/page.tsx`: Campaign detail/edit

**Rate Limiting**:
- [ ] `lib/utils/rate-limiter.ts`: Token bucket implementation
  ```typescript
  export async function checkRateLimit(userId: string, limit: number, window: number) {
    const supabase = createClient()
    const now = new Date()
    const windowStart = new Date(now.getTime() - window * 1000)

    const { count } = await supabase
      .from('outreach_emails')
      .select('id', { count: 'exact', head: true })
      .eq('campaign_id', userId) // Or use admin user ID
      .gte('sent_at', windowStart.toISOString())

    return {
      allowed: (count || 0) < limit,
      remaining: Math.max(0, limit - (count || 0)),
      resetAt: new Date(now.getTime() + window * 1000)
    }
  }
  ```

**Tests**:
- [ ] Unit: Email template variable replacement
- [ ] Integration: Campaign send API with rate limiting
- [ ] E2E: Create and send campaign flow

---

### Phase 8: Revenue Dashboard (Day 7-8)

**API Routes**:
- [ ] `app/api/admin/partnerships/route.ts`: GET (list active)
- [ ] `app/api/admin/partnerships/[id]/route.ts`: GET (detail)
- [ ] `app/api/admin/revenue/metrics/route.ts`: GET (aggregated metrics)
- [ ] `app/api/admin/revenue/export/route.ts`: GET (CSV export)

**UI Components**:
- [ ] `components/admin/monetization/RevenueChart.tsx`: Line chart (use Chart.js or Recharts)
- [ ] `components/admin/monetization/MetricsCard.tsx`: Stat display card

**Pages**:
- [ ] `app/admin/monetization/revenue/page.tsx`: Revenue dashboard

**CSV Export**:
- [ ] `lib/utils/export.ts`:
  ```typescript
  export function generateCSV(data: any[], headers: string[]) {
    const rows = data.map(row => headers.map(h => row[h] || '').join(','))
    return [headers.join(','), ...rows].join('\n')
  }
  ```

**Tests**:
- [ ] Unit: Revenue calculation logic
- [ ] Integration: Metrics API response structure
- [ ] E2E: Export report download

---

### Phase 9: Partnership Applications (Day 8-9)

**API Routes**:
- [ ] `app/api/partner/apply/route.ts`: POST (public application submission)
- [ ] `app/api/admin/applications/route.ts`: GET (list pending)
- [ ] `app/api/admin/applications/[id]/route.ts`: GET (detail)
- [ ] `app/api/admin/applications/[id]/approve/route.ts`: POST (approve → create partnership)

**UI Components**:
- [ ] `components/admin/monetization/ApplicationCard.tsx`: Application review card

**Pages**:
- [ ] `app/admin/monetization/applications/page.tsx`: Pending applications list

**Tests**:
- [ ] Unit: Application form validation
- [ ] Integration: Application approval creates partnership
- [ ] E2E: Submit application → admin approves flow

---

### Phase 10: Automated Follow-Ups (Day 9-10)

**API Routes**:
- [ ] `app/api/admin/sequences/route.ts`: CRUD for follow-up sequences

**Background Job** (future):
- [ ] Create cron job or scheduled function to trigger follow-ups
- [ ] Check leads with `last_contacted_at` + `delay_days`
- [ ] Send follow-up emails respecting stop conditions

**UI Components**:
- [ ] `components/admin/monetization/FollowUpSequenceForm.tsx`: Sequence builder

**Tests**:
- [ ] Unit: Sequence trigger logic
- [ ] Integration: Sequence creation API

---

## Development Workflow

### 1. TDD Approach

For each feature:

1. **Write test first** → Get user approval → See test fail → Implement → See test pass
2. Example:
   ```typescript
   // tests/unit/tier-form.test.tsx
   describe('TierForm', () => {
     it('validates monthly price is greater than zero', () => {
       render(<TierForm />)
       fireEvent.change(screen.getByLabelText('Monthly Price'), { target: { value: '-10' } })
       fireEvent.submit(screen.getByRole('button', { name: 'Save' }))
       expect(screen.getByText('Price must be positive')).toBeInTheDocument()
     })
   })
   ```

### 2. Database-First

Always create database tables and types before building UI:

```bash
# Generate TypeScript types from Supabase schema
npm run supabase:types
```

### 3. Component Isolation

Build components in isolation before integrating into pages:

```tsx
// Example: Test TierForm in Storybook or via standalone route
export default function TierFormTest() {
  return <TierForm onSubmit={(data) => console.log(data)} />
}
```

---

## Common Patterns

### API Route Structure

```typescript
// app/api/admin/example/route.ts
import { requireAdmin } from '@/lib/auth/require-admin'

export async function GET(request: NextRequest) {
  const authError = await requireAdmin(request)
  if (authError) return authError

  const supabase = createRouteHandlerClient({ cookies })

  // Query database
  const { data, error } = await supabase
    .from('table_name')
    .select('*')

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }

  return NextResponse.json({ data })
}

export const dynamic = 'force-dynamic' // Prevent static optimization
```

### Email Sending Pattern

```typescript
import { sendEmail } from '@/lib/email/client'
import { generateOutreachEmail } from '@/lib/email/templates'

const htmlContent = generateOutreachEmail(lead, tier, campaign.body_template)

const result = await sendEmail({
  to: lead.email,
  subject: campaign.subject_template.replace('{{restaurant_name}}', lead.business_name),
  html: htmlContent,
  tags: { campaign_id: campaign.id, lead_id: lead.id }
})

// Store email record
await supabase.from('outreach_emails').insert({
  campaign_id: campaign.id,
  lead_id: lead.id,
  email_provider_id: result.id,
  subject: result.subject,
})
```

---

## Troubleshooting

### Supabase RLS Blocking Queries

**Symptom**: API returns empty arrays even though data exists

**Fix**: Disable RLS temporarily for debugging:
```sql
ALTER TABLE partnership_tiers DISABLE ROW LEVEL SECURITY;
```

Then re-enable and fix policies.

### Email Sending Fails

**Symptom**: `sendEmail()` throws error

**Debug**:
1. Check Resend API key is valid
2. Verify sender domain is verified in Resend dashboard
3. Check rate limits (free tier: 100 emails/day)

### TypeScript Type Errors

**Symptom**: Database types don't match actual schema

**Fix**: Regenerate types from Supabase:
```bash
npx supabase gen types typescript --project-id <your-project-id> > lib/supabase/database.types.ts
```

---

## Performance Tips

1. **Batch Insert**: When sending campaigns, insert all email records at once:
   ```typescript
   await supabase.from('outreach_emails').insert(emailRecords)
   ```

2. **Pagination**: Always paginate large lists (leads, campaigns):
   ```typescript
   .range(offset, offset + limit - 1)
   ```

3. **Debounce Search**: Add 300ms debounce to lead search input

4. **Cache Metrics**: Cache revenue metrics for 5 minutes (React Query or SWR)

---

## Security Checklist

- [ ] All admin API routes protected with `requireAdmin()`
- [ ] RLS policies enforced on all tables
- [ ] Email addresses validated before storing
- [ ] Rate limiting enforced server-side
- [ ] Sensitive data (API keys) in environment variables only
- [ ] Webhook endpoints verify Resend signature
- [ ] SQL injection prevented (using Supabase query builder, not raw SQL)
- [ ] XSS prevented (React escapes by default, but validate email HTML)

---

## Launch Checklist

Before deploying to production:

- [ ] All tests passing (`npm test && npm run test:e2e`)
- [ ] Database migration applied to production
- [ ] Resend API key added to production environment variables
- [ ] Webhook URL configured in Resend dashboard: `https://ekaty.fly.dev/api/webhooks/email`
- [ ] At least one admin user created (set `role = 'admin'` in database)
- [ ] Partnership tiers seeded
- [ ] Email sending domain verified in Resend
- [ ] Rate limits configured (50/hour, 200/day)
- [ ] Monitoring/logging enabled (Sentry, LogRocket, etc.)

---

## Resources

- **API Contract**: See `contracts/openapi.yaml`
- **Data Model**: See `data-model.md`
- **Research Notes**: See `research.md`
- **Supabase Docs**: https://supabase.com/docs
- **Resend Docs**: https://resend.com/docs
- **Vitest Docs**: https://vitest.dev
- **Playwright Docs**: https://playwright.dev

---

## Need Help?

- Check existing implementation patterns in `/app/api/restaurants/route.ts`
- Review authentication flow in `/lib/auth-context.tsx`
- Refer to database schema in `/lib/supabase/database.types.ts`
- Ask in team Slack #engineering channel
