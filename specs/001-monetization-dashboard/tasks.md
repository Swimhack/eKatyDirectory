# Implementation Tasks: Monetization & Outreach Dashboard

**Branch**: `001-monetization-dashboard`
**Feature**: Monetization & Outreach Dashboard for restaurant partnerships
**Last Updated**: 2025-01-18

This file organizes all implementation tasks by user story priority, with parallelizable tasks marked [P] and user story labels [US#].

---

## Phase 1: Setup (Shared Infrastructure)

**Purpose**: Establish foundational infrastructure required by all user stories

- [X] [T001] [P] Install email service dependencies (`npm install resend @react-email/components`)
- [X] [T002] [P] Install testing dependencies (`npm install -D vitest @vitejs/plugin-react @testing-library/user-event @testing-library/jest-dom jsdom @playwright/test`)
- [X] [T003] Create Vitest configuration at `vitest.config.ts` with React plugin and jsdom environment
- [X] [T004] Create Playwright configuration at `playwright.config.ts` with baseURL and webServer settings
- [X] [T005] Create test setup file at `tests/setup.ts` with Supabase and email client mocks
- [X] [T006] Update package.json scripts section with `test`, `test:e2e`, and `test:coverage` commands
- [X] [T007] Create database migration file at `supabase/migrations/002_monetization_schema.sql` with all 7 tables
- [X] [T008] Add partnership_tiers table (id, name, slug, monthly_price, features, display_order, is_active, timestamps)
- [X] [T009] Add restaurant_leads table (id, business_name, contact_name, email, phone, address, city, cuisine_type, status, assigned_to, last_contacted_at, notes, source, timestamps)
- [X] [T010] Add outreach_campaigns table (id, name, created_by, subject_template, body_template, target_list, tier_showcase, status, scheduled_for, sent_at, total_sent, total_opened, total_clicked, timestamps)
- [X] [T011] Add outreach_emails table (id, campaign_id, lead_id, email_provider_id, subject, sent_at, opened_at, clicked_at, bounced_at, unsubscribed_at, bounce_reason, sequence_position, created_at)
- [X] [T012] Add partnerships table (id, restaurant_id, tier_id, status, start_date, renewal_date, billing_cycle, payment_status, last_payment_date, notes, timestamps)
- [X] [T013] Add partnership_applications table (id, business_name, contact_name, contact_email, contact_phone, address, city, cuisine_type, website, preferred_tier_id, status, reviewed_by, review_notes, submitted_at, reviewed_at)
- [X] [T014] Add follow_up_sequences table (id, name, trigger_status, steps, is_active, created_by, timestamps)
- [X] [T015] Create database indexes on all foreign keys and common query fields
- [X] [T016] Add update_updated_at_column() function and apply triggers to all tables with updated_at
- [X] [T017] Add calculate_renewal_date() function and trigger for partnerships table
- [X] [T018] Add update_campaign_metrics() function and trigger for outreach_emails table
- [X] [T019] Add update_lead_status_on_email() function and trigger for outreach_emails table
- [X] [T020] [P] Create RLS policy "Admins can manage tiers" on partnership_tiers table
- [X] [T021] [P] Create RLS policy "Public can view active tiers" on partnership_tiers table
- [X] [T022] [P] Create RLS policy "Admins can manage leads" on restaurant_leads table
- [X] [T023] [P] Create RLS policy "Admins can manage campaigns" on outreach_campaigns table
- [X] [T024] [P] Create RLS policy "Admins can view emails" on outreach_emails table
- [X] [T025] [P] Create RLS policy "Admins can manage partnerships" on partnerships table
- [X] [T026] [P] Create RLS policy "Restaurants can view their partnership" on partnerships table
- [X] [T027] [P] Create RLS policy "Anyone can submit applications" on partnership_applications table
- [X] [T028] [P] Create RLS policy "Admins can manage applications" on partnership_applications table
- [X] [T029] [P] Create RLS policy "Admins can manage sequences" on follow_up_sequences table
- [ ] [T030] Apply database migration to development environment (`supabase db push`)
- [X] [T031] Seed partnership tiers with 3 initial tiers (Basic $49, Premium $99, Featured $199)
- [ ] [T032] Update users table to add `role` column with values 'user' or 'admin' if not exists
- [ ] [T033] Generate TypeScript types from Supabase schema (`npm run supabase:types`)
- [ ] [T034] Get Resend API key from https://resend.com and add to `.env.local` as `RESEND_API_KEY`
- [ ] [T035] Create email client at `lib/email/client.ts` with sendEmail() function and error handling
- [ ] [T036] Create email templates at `lib/email/templates.ts` with generateOutreachEmail(), generateWelcomeEmail(), generateRenewalReminderEmail() using @react-email/components
- [ ] [T037] Create email tracking helpers at `lib/email/tracking.ts` with generateTrackingPixel(), generateTrackingLink(), processWebhook()
- [ ] [T038] Create email webhook endpoint at `app/api/webhooks/email/route.ts` handling Resend events (email.opened, email.clicked, email.bounced)
- [ ] [T039] Create admin middleware at `lib/auth/require-admin.ts` with requireAdmin() function checking session and user role
- [ ] [T040] Create rate limiter utility at `lib/utils/rate-limiter.ts` implementing token bucket algorithm (50/hour, 200/day)
- [ ] [T041] Create CSV export utility at `lib/utils/export.ts` with generateCSV() function
- [ ] [T042] Update admin layout to include navigation links for monetization features at `components/admin/layout/AdminNav.tsx`
- [ ] [T043] Write unit test for requireAdmin() middleware (unauthorized, forbidden, success cases)
- [ ] [T044] Write unit test for rate limiter (within limit, exceeded limit, reset after window)
- [ ] [T045] Write unit test for CSV export utility (empty data, valid data, special characters)
- [ ] [T046] Run all setup tests to verify infrastructure (`npm test`)

---

## Phase 2: Foundational (Blocking Prerequisites)

**Purpose**: Build shared components and patterns used by multiple user stories

- [ ] [T047] Create MetricsCard component at `components/admin/monetization/MetricsCard.tsx` displaying stat title, value, change percentage
- [ ] [T048] Write unit test for MetricsCard component (renders value, displays change, handles missing data)
- [ ] [T049] Create admin-specific database queries at `lib/supabase/admin.ts` with helper functions for common queries
- [ ] [T050] Update main admin page at `app/admin/page.tsx` to add navigation cards linking to monetization features

---

## Phase 3: User Story 1 - Outreach Campaign (P1) 🎯 MVP

**User Story**: As an admin, I want to generate personalized restaurant owner outreach emails so that I can attract new paid partnerships efficiently

**Success Criteria**:
- ✅ SC-001: Generate 20 personalized emails in < 15 seconds
- ✅ SC-002: Email open rate tracking functional

### Tasks:

- [ ] [T051] [US1] Create restaurant leads API route at `app/api/admin/leads/route.ts` with GET (list with filters) and POST (create)
- [ ] [T052] [US1] Create restaurant leads detail API route at `app/api/admin/leads/[id]/route.ts` with GET (detail with history) and PATCH (update)
- [ ] [T053] [US1] Add email format validation via CHECK constraint on restaurant_leads.email
- [ ] [T054] [US1] Add status enum validation via CHECK constraint on restaurant_leads.status
- [ ] [T055] [US1] Write integration test for leads API (create lead, list leads with filters, update lead status)
- [ ] [T056] [US1] Create lead management page at `app/admin/monetization/leads/page.tsx` with table, filters, add button
- [ ] [T057] [US1] Create LeadSelector component at `components/admin/monetization/LeadSelector.tsx` with multi-select capability and search
- [ ] [T058] [US1] Write unit test for LeadSelector component (select leads, deselect leads, search filtering)
- [ ] [T059] [US1] Write E2E test for add new lead flow (navigate to page, fill form, submit, verify in list)
- [ ] [T060] [US1] Create outreach campaigns API route at `app/api/admin/outreach/route.ts` with GET (list) and POST (create)
- [ ] [T061] [US1] Create outreach campaign detail API route at `app/api/admin/outreach/[id]/route.ts` with GET (detail) and PATCH (update)
- [ ] [T062] [US1] Create outreach send API route at `app/api/admin/outreach/send/route.ts` with POST (send emails) and rate limiting
- [ ] [T063] [US1] Implement rate limiting enforcement in send API (check 50/hour, 200/day limits, return 429 if exceeded)
- [ ] [T064] [US1] Write integration test for outreach API (create campaign, send with rate limiting, verify emails created)
- [ ] [T065] [US1] Create campaign list page at `app/admin/monetization/outreach/page.tsx` with table showing status, stats, actions
- [ ] [T066] [US1] Create campaign detail page at `app/admin/monetization/outreach/[campaignId]/page.tsx` with edit form and send button
- [ ] [T067] [US1] Create EmailTemplateEditor component at `components/admin/monetization/EmailTemplateEditor.tsx` with rich text editing and variable insertion
- [ ] [T068] [US1] Create OutreachTable component at `components/admin/monetization/OutreachTable.tsx` displaying campaigns with metrics
- [ ] [T069] [US1] Implement template variable replacement logic ({{restaurant_name}}, {{contact_name}}, {{cuisine}}, {{city}}, {{tier_name}}, {{tier_price}})
- [ ] [T070] [US1] Write unit test for template variable replacement (all variables replaced, missing variables handled, HTML escaping)
- [ ] [T071] [US1] Write E2E test for create and send campaign flow (create campaign, select leads, send, verify email tracking)
- [ ] [T072] [US1] Test email sending with test account (verify delivery, open tracking pixel, click tracking links)
- [ ] [T073] [US1] Verify SC-001: Generate 20 personalized emails in < 15 seconds (performance benchmark)
- [ ] [T074] [US1] Verify SC-002: Email open rate tracking functional (send test email, trigger webhook, verify database update)

---

## Phase 4: User Story 2 - Partnership Tiers (P1)

**User Story**: As an admin, I want to define partnership tiers with pricing so that restaurants can choose packages matching their budget

**Success Criteria**:
- ✅ SC-004: Define 3 tiers (Basic, Premium, Featured) with pricing
- ✅ SC-005: Public tier comparison page displays correctly

### Tasks:

- [ ] [T075] [US2] Create partnership tiers API route at `app/api/admin/tiers/route.ts` with GET (list) and POST (create)
- [ ] [T076] [US2] Create partnership tier detail API route at `app/api/admin/tiers/[id]/route.ts` with GET (detail), PATCH (update), DELETE (soft delete)
- [ ] [T077] [US2] Write integration test for tiers API (create tier, list tiers, update tier, soft delete)
- [ ] [T078] [US2] Create tier management page at `app/admin/monetization/tiers/page.tsx` with tier cards and edit buttons
- [ ] [T079] [US2] Create TierForm component at `components/admin/monetization/TierForm.tsx` with validation for name, slug, price, features
- [ ] [T080] [US2] Create TierComparison component at `components/admin/monetization/TierComparison.tsx` displaying features in comparison table
- [ ] [T081] [US2] Write unit test for TierForm component (validates monthly price > 0, validates slug uniqueness, validates features array)
- [ ] [T082] [US2] Write E2E test for create new tier flow (navigate, fill form, submit, verify tier appears)
- [ ] [T083] [US2] Create public partnership page at `app/partner/page.tsx` with tier comparison and apply button
- [ ] [T084] [US2] Write E2E test for public tier comparison page (loads tiers, displays features, click apply redirects to form)
- [ ] [T085] [US2] Verify SC-004: Define 3 tiers with pricing (check database has Basic $49, Premium $99, Featured $199)
- [ ] [T086] [US2] Verify SC-005: Public tier comparison page displays correctly (responsive layout, all features visible, correct pricing)

---

## Phase 5: User Story 3 - Revenue Dashboard (P2)

**User Story**: As an admin, I want to track revenue metrics and active partnerships so that I can measure business growth

**Success Criteria**:
- ✅ SC-003: Revenue metrics refresh in < 30 seconds
- ✅ SC-007: Revenue report export generates in < 10 seconds

### Tasks:

- [ ] [T087] [US3] Create partnerships API route at `app/api/admin/partnerships/route.ts` with GET (list active)
- [ ] [T088] [US3] Create partnership detail API route at `app/api/admin/partnerships/[id]/route.ts` with GET (detail)
- [ ] [T089] [US3] Create revenue metrics API route at `app/api/admin/revenue/metrics/route.ts` with GET (aggregated metrics)
- [ ] [T090] [US3] Create revenue export API route at `app/api/admin/revenue/export/route.ts` with GET (CSV download)
- [ ] [T091] [US3] Implement MRR calculation logic (sum all active partnerships.tier.monthly_price)
- [ ] [T092] [US3] Implement partnerships by tier aggregation (group by tier, count, sum revenue)
- [ ] [T093] [US3] Implement revenue trend calculation (monthly MRR for last 6 months)
- [ ] [T094] [US3] Write integration test for revenue metrics API (verify MRR calculation, tier breakdown, trend data)
- [ ] [T095] [US3] Write integration test for CSV export (verify headers, data rows, special characters)
- [ ] [T096] [US3] Create revenue dashboard page at `app/admin/monetization/revenue/page.tsx` with metrics cards and chart
- [ ] [T097] [US3] Create RevenueChart component at `components/admin/monetization/RevenueChart.tsx` using Chart.js or Recharts for trend line
- [ ] [T098] [US3] Write unit test for revenue calculation logic (correct MRR, handles empty data, handles multiple tiers)
- [ ] [T099] [US3] Write E2E test for export report download (click export, verify CSV file downloads)
- [ ] [T100] [US3] Verify SC-003: Revenue metrics refresh < 30 seconds (performance benchmark with 500 partnerships)
- [ ] [T101] [US3] Verify SC-007: Revenue report export < 10 seconds (performance benchmark with 500 partnerships)

---

## Phase 6: User Story 4 - Automated Follow-Ups (P2)

**User Story**: As an admin, I want to automate follow-up email sequences so that I can nurture leads without manual effort

**Success Criteria**:
- ✅ SC-006: Follow-up sequence triggers automatically based on lead status

### Tasks:

- [ ] [T102] [US4] Create follow-up sequences API route at `app/api/admin/sequences/route.ts` with CRUD operations
- [ ] [T103] [US4] Write integration test for sequences API (create sequence, list sequences, update steps)
- [ ] [T104] [US4] Create FollowUpSequenceForm component at `components/admin/monetization/FollowUpSequenceForm.tsx` with step builder UI
- [ ] [T105] [US4] Implement sequence step validation (delay_days > 0, stop_conditions valid, templates not empty)
- [ ] [T106] [US4] Write unit test for sequence trigger logic (correct delay calculation, stop conditions respected, sequence position increments)
- [ ] [T107] [US4] Create background job scheduler documentation for future cron implementation (check leads, calculate next send, respect stop conditions)
- [ ] [T108] [US4] Write E2E test for sequence creation flow (create sequence, add steps, save, verify in list)
- [ ] [T109] [US4] Verify SC-006: Follow-up sequence configuration can trigger based on status (manual test: create sequence, simulate status change, verify logic)

---

## Phase 7: User Story 5 - Partnership Applications (P3)

**User Story**: As a restaurant owner, I want to submit a partnership application so that I can join the platform without waiting for outreach

**Success Criteria**:
- ✅ SC-008: Public application form submits successfully
- ✅ SC-009: Admin receives notification of new application

### Tasks:

- [ ] [T110] [US5] Create public partnership application API route at `app/api/partner/apply/route.ts` with POST (public submission)
- [ ] [T111] [US5] Create admin applications list API route at `app/api/admin/applications/route.ts` with GET (list pending)
- [ ] [T112] [US5] Create admin application detail API route at `app/api/admin/applications/[id]/route.ts` with GET (detail)
- [ ] [T113] [US5] Create admin application approval API route at `app/api/admin/applications/[id]/approve/route.ts` with POST (approve/reject)
- [ ] [T114] [US5] Implement approval logic (create partnership, update application status, send welcome email)
- [ ] [T115] [US5] Write integration test for application workflow (submit application, admin approves, partnership created, welcome email sent)
- [ ] [T116] [US5] Create public partnership application form on existing `app/partner/page.tsx` below tier comparison
- [ ] [T117] [US5] Create admin applications page at `app/admin/monetization/applications/page.tsx` with pending applications list
- [ ] [T118] [US5] Create ApplicationCard component at `components/admin/monetization/ApplicationCard.tsx` with approve/reject actions
- [ ] [T119] [US5] Write unit test for application form validation (required fields, email format, phone format)
- [ ] [T120] [US5] Write E2E test for submit application flow (fill form, submit, verify confirmation message)
- [ ] [T121] [US5] Write E2E test for admin approve application flow (navigate to applications, approve, verify partnership created)
- [ ] [T122] [US5] Verify SC-008: Public application form submits successfully (submit test application, check database)
- [ ] [T123] [US5] Verify SC-009: Admin receives notification (manual test: submit application, check if notification appears in admin UI)

---

## Phase 8: Polish & Cross-Cutting Concerns

**Purpose**: Final quality assurance, accessibility, security, and documentation

- [ ] [T124] [P] Run accessibility audit on all monetization pages using axe-core or Lighthouse
- [ ] [T125] [P] Fix accessibility issues (keyboard navigation, ARIA labels, color contrast, screen reader support)
- [ ] [T126] [P] Test all forms with keyboard-only navigation
- [ ] [T127] [P] Add loading states to all data-fetching components
- [ ] [T128] [P] Add error boundaries to all page components
- [ ] [T129] [P] Add optimistic UI updates for form submissions
- [ ] [T130] [P] Verify all admin routes protected with requireAdmin() middleware
- [ ] [T131] [P] Verify RLS policies enforced on all tables (test unauthorized access)
- [ ] [T132] [P] Verify email addresses validated before storing (test invalid formats rejected)
- [ ] [T133] [P] Verify rate limiting enforced server-side (test client cannot bypass)
- [ ] [T134] [P] Verify webhook endpoints verify Resend signature (test unauthorized webhooks rejected)
- [ ] [T135] [P] Verify SQL injection prevented via Supabase query builder (test malicious input)
- [ ] [T136] [P] Verify XSS prevented in email templates (test script tags escaped)
- [ ] [T137] Run full test suite (`npm test && npm run test:e2e`)
- [ ] [T138] Fix any failing tests
- [ ] [T139] Apply database migration to production Supabase instance
- [ ] [T140] Add Resend API key to production environment variables on Fly.io
- [ ] [T141] Configure webhook URL in Resend dashboard: `https://ekaty.fly.dev/api/webhooks/email`
- [ ] [T142] Create at least one admin user in production database (set `role = 'admin'`)
- [ ] [T143] Verify partnership tiers seeded in production database
- [ ] [T144] Verify email sending domain verified in Resend dashboard
- [ ] [T145] Monitor production for first 24 hours after deployment (check logs for errors)

---

## Summary

**Total Tasks**: 145
**Parallelizable Tasks**: 25 (marked with [P])
**Phases**: 8
**User Stories Covered**: 5 (US1-P1, US2-P1, US3-P2, US4-P2, US5-P3)

**Critical Path**:
1. Phase 1 Setup (database, email, testing, auth) - **BLOCKING ALL**
2. Phase 2 Foundational (shared components) - **BLOCKING ALL USER STORIES**
3. Phase 3 User Story 1 (Outreach Campaign) - **P1 MVP** 🎯
4. Phase 4 User Story 2 (Partnership Tiers) - **P1**
5. Phase 5 User Story 3 (Revenue Dashboard) - **P2**
6. Phase 6 User Story 4 (Automated Follow-Ups) - **P2**
7. Phase 7 User Story 5 (Partnership Applications) - **P3**
8. Phase 8 Polish (quality, security, deployment) - **FINAL**

**Estimated Timeline**: 10 business days (based on quickstart.md plan)

**Parallel Execution Opportunities**:
- After Phase 1 complete: User Stories 1, 2, 3, 4, 5 can be developed in parallel by different developers
- After Phase 2 complete: All user story UI components can be built in parallel
- Phase 8 security checks (T124-T136) can run in parallel

**Testing Strategy**:
- Unit tests: 13 (components, utilities, functions)
- Integration tests: 8 (API routes, database operations)
- E2E tests: 9 (user workflows)
- Total tests: 30

**Success Criteria Coverage**:
- ✅ SC-001: Email generation performance (T073)
- ✅ SC-002: Email tracking (T074)
- ✅ SC-003: Revenue metrics performance (T100)
- ✅ SC-004: Define 3 tiers (T085)
- ✅ SC-005: Public tier page (T086)
- ✅ SC-006: Follow-up automation (T109)
- ✅ SC-007: Export performance (T101)
- ✅ SC-008: Application submission (T122)
- ✅ SC-009: Admin notification (T123)
