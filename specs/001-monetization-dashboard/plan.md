# Implementation Plan: Monetization & Outreach Dashboard

**Branch**: `001-monetization-dashboard` | **Date**: 2025-01-18 | **Spec**: [spec.md](./spec.md)
**Input**: Feature specification from `/specs/001-monetization-dashboard/spec.md`

**Note**: This template is filled in by the `/speckit.plan` command. See `.specify/templates/commands/plan.md` for the execution workflow.

## Summary

Build a comprehensive admin dashboard for restaurant outreach and monetization, enabling administrators to generate personalized outreach emails, define partnership tiers with pricing, track revenue metrics, automate follow-up sequences, and manage inbound partnership applications. The system will leverage the existing Next.js 14 + Supabase architecture with new admin-specific routes, database tables for campaign management, and email service integration for automated outreach.

## Technical Context

**Language/Version**: TypeScript 5.5 / Node.js (Next.js 14.2)
**Primary Dependencies**:
- Next.js 14.2 (App Router)
- React 18.3
- Supabase (Auth + PostgreSQL)
- @supabase/auth-helpers-nextjs 0.10.0
- Tailwind CSS 3.4.4
- Lucide React (icons)
- NEEDS CLARIFICATION: Email service provider (SendGrid, Resend, AWS SES, or Mailgun)

**Storage**: PostgreSQL via Supabase
**Testing**: NEEDS CLARIFICATION (Jest/Vitest for unit tests, Playwright for E2E recommended but not currently configured)
**Target Platform**: Web application (browser-based admin dashboard, Fly.io deployment)
**Project Type**: Web (extending existing Next.js monorepo with new admin routes)
**Performance Goals**:
- Dashboard page load < 2 seconds
- Email generation for 20 restaurants < 15 seconds (per spec SC-001)
- Revenue metrics refresh < 30 seconds (per spec SC-003)
- Report export < 10 seconds for 500 partnerships (per spec SC-007)

**Constraints**:
- Must integrate with existing Supabase auth (no separate admin auth system)
- Email rate limiting: max 50 emails/hour to prevent spam detection (per spec FR-006)
- Must work within existing mobile-first design system (44px touch targets, responsive breakpoints)
- Admin routes must be protected (authentication + authorization checks)

**Scale/Scope**:
- 10-20 admin users (small team managing outreach)
- Up to 500 restaurant partnerships tracked simultaneously
- Email campaign targeting 100-200 restaurants at a time
- 6 months of historical revenue data displayed

## Constitution Check

*GATE: Must pass before Phase 0 research. Re-check after Phase 1 design.*

**Constitution Status**: N/A - No project constitution defined yet (constitution.md contains template placeholders)

**Pre-Design Gates**: ✅ PASS
- Feature spec completed and validated
- Technical context documented with 2 clarifications identified
- No constitution violations (constitution not yet defined)

**Post-Design Gates**: To be evaluated after Phase 1 design completion

## Project Structure

### Documentation (this feature)

```text
specs/[###-feature]/
├── plan.md              # This file (/speckit.plan command output)
├── research.md          # Phase 0 output (/speckit.plan command)
├── data-model.md        # Phase 1 output (/speckit.plan command)
├── quickstart.md        # Phase 1 output (/speckit.plan command)
├── contracts/           # Phase 1 output (/speckit.plan command)
└── tasks.md             # Phase 2 output (/speckit.tasks command - NOT created by /speckit.plan)
```

### Source Code (repository root)

```text
app/
├── admin/
│   ├── monetization/
│   │   ├── page.tsx                 # Main monetization dashboard
│   │   ├── outreach/
│   │   │   ├── page.tsx             # Outreach campaign management
│   │   │   └── [campaignId]/
│   │   │       └── page.tsx         # Campaign detail/edit
│   │   ├── tiers/
│   │   │   └── page.tsx             # Partnership tier management
│   │   ├── revenue/
│   │   │   └── page.tsx             # Revenue tracking dashboard
│   │   └── applications/
│   │       └── page.tsx             # Inbound partnership applications
│   └── page.tsx                     # Admin home (existing - may link to monetization)
│
├── api/
│   ├── admin/
│   │   ├── outreach/
│   │   │   ├── route.ts             # List/create campaigns
│   │   │   ├── [id]/route.ts        # Update/delete campaign
│   │   │   └── send/route.ts        # Send emails
│   │   ├── tiers/
│   │   │   ├── route.ts             # CRUD partnership tiers
│   │   │   └── [id]/route.ts
│   │   ├── leads/
│   │   │   ├── route.ts             # List/create restaurant leads
│   │   │   └── [id]/route.ts        # Update lead status
│   │   ├── partnerships/
│   │   │   ├── route.ts             # List active partnerships
│   │   │   └── [id]/route.ts        # Partnership details
│   │   ├── revenue/
│   │   │   ├── metrics/route.ts     # Aggregate revenue metrics
│   │   │   └── export/route.ts      # Export revenue report (CSV)
│   │   └── applications/
│   │       ├── route.ts             # List applications
│   │       └── [id]/
│   │           ├── route.ts         # Application details
│   │           └── approve/route.ts # Approve/reject
│   ├── partner/
│   │   └── apply/route.ts           # Public partnership application form
│   └── webhooks/
│       └── email/route.ts           # Email webhook (opens, clicks, bounces)
│
├── partner/
│   └── page.tsx                     # Public "Partner With Us" page
│
components/
├── admin/
│   ├── monetization/
│   │   ├── OutreachTable.tsx        # Campaign list table
│   │   ├── EmailTemplateEditor.tsx  # Email template form
│   │   ├── LeadSelector.tsx         # Restaurant lead picker
│   │   ├── TierForm.tsx             # Partnership tier CRUD form
│   │   ├── TierComparison.tsx       # Tier comparison table
│   │   ├── RevenueChart.tsx         # Revenue trend chart
│   │   ├── MetricsCard.tsx          # Revenue metric display
│   │   ├── ApplicationCard.tsx      # Partnership application card
│   │   └── FollowUpSequenceForm.tsx # Automated follow-up config
│   └── layout/
│       └── AdminNav.tsx             # Admin navigation sidebar
│
lib/
├── email/
│   ├── client.ts                    # Email service client wrapper
│   ├── templates.ts                 # Email template generator
│   └── tracking.ts                  # Open/click tracking helpers
├── supabase/
│   └── admin.ts                     # Admin-specific database queries
└── utils/
    ├── rate-limiter.ts              # Email rate limiting utility
    └── export.ts                    # CSV export utility

supabase/
└── migrations/
    └── 002_monetization_schema.sql  # New tables for this feature
```

**Structure Decision**: Extending existing Next.js App Router structure with new admin routes under `/app/admin/monetization/` and corresponding API routes under `/app/api/admin/`. This maintains consistency with the existing admin seeding page at `/app/admin/page.tsx` while organizing monetization features in a dedicated subdirectory for clarity and scalability.

## Complexity Tracking

> **Fill ONLY if Constitution Check has violations that must be justified**

| Violation | Why Needed | Simpler Alternative Rejected Because |
|-----------|------------|-------------------------------------|
| [e.g., 4th project] | [current need] | [why 3 projects insufficient] |
| [e.g., Repository pattern] | [specific problem] | [why direct DB access insufficient] |
