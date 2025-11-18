# Research: Monetization & Outreach Dashboard

**Feature**: 001-monetization-dashboard
**Date**: 2025-01-18
**Status**: Complete

## Overview

This document resolves technical uncertainties identified in the planning phase and documents research findings for email service integration and testing framework selection.

---

## Research Task 1: Email Service Provider Selection

**Context**: System requires email delivery for outreach campaigns, follow-up sequences, and notifications (FR-003, FR-007, FR-011)

**Requirements**:
- Transactional email delivery with tracking (opens, clicks, bounces)
- Template management and personalization
- Rate limiting support (50 emails/hour)
- Webhook support for email events
- Cost-effective for startup/small business scale (100-500 emails/month initial volume)

### Options Evaluated

#### Option A: Resend
**Pros**:
- Modern developer-first API with excellent Next.js integration
- Built-in React email template support (@react-email/components)
- Simple webhook configuration
- Generous free tier (3,000 emails/month)
- Strong TypeScript SDK

**Cons**:
- Newer provider (less battle-tested than SendGrid)
- Smaller customer base means fewer community resources

**Pricing**: Free up to 3,000 emails/month, then $20/month for 50,000 emails

#### Option B: SendGrid
**Pros**:
- Industry standard, battle-tested reliability
- Extensive documentation and community support
- Advanced deliverability features
- Robust email analytics and reputation monitoring

**Cons**:
- More complex API
- Free tier limited (100 emails/day = 3,000/month)
- Less modern TypeScript support
- Overkill for initial scale

**Pricing**: Free up to 100 emails/day, then $19.95/month for 50,000 emails

#### Option C: AWS SES
**Pros**:
- Extremely cost-effective ($0.10 per 1,000 emails)
- High sending limits
- Integration with AWS ecosystem

**Cons**:
- Requires AWS account and IAM configuration
- More complex setup
- No built-in template management
- Requires separate tracking service
- Reputation management is manual

**Pricing**: $0.10 per 1,000 emails (outgoing) + data transfer costs

#### Option D: Mailgun
**Pros**:
- Developer-friendly API
- Good deliverability reputation
- Built-in email validation
- Flexible webhook system

**Cons**:
- Free tier only 5,000 emails for 3 months (then paid)
- Less generous than Resend for ongoing free usage
- Pricing can get expensive at scale

**Pricing**: $0 for 3 months (5,000 emails), then $35/month base

### Decision: Resend

**Rationale**:
1. **Modern Next.js Integration**: Resend has first-class Next.js support with TypeScript SDK and built-in API route patterns
2. **Developer Experience**: React email templates (@react-email) align perfectly with existing React codebase, enabling email templates to be built and tested like React components
3. **Cost Efficiency**: Free tier (3,000 emails/month) exceeds initial needs and provides growth runway
4. **Webhook Simplicity**: Simple webhook configuration matches Next.js API routes pattern
5. **Future-Proof**: Built for modern serverless/edge deployments (aligns with Fly.io hosting)

**Alternatives Rejected**:
- **SendGrid**: More complex API, no significant advantage for this use case
- **AWS SES**: Too much infrastructure overhead for a feature-focused implementation
- **Mailgun**: Less generous free tier and no React email template support

**Implementation Notes**:
- Use `@react-email/components` for email templates
- Use `resend` npm package for SDK
- Store API key in environment variables
- Implement webhook endpoint at `/api/webhooks/email` for tracking events

---

## Research Task 2: Testing Framework Selection

**Context**: Current project has no test configuration (package.json has no test dependencies). Need to establish testing for new admin features.

**Requirements**:
- Unit testing for React components and utilities
- Integration testing for API routes
- E2E testing for admin workflows
- TypeScript support
- Fast feedback cycle for TDD

### Options Evaluated

#### Option A: Jest + React Testing Library + Playwright
**Pros**:
- Jest is industry standard for React unit testing
- React Testing Library encourages good testing practices
- Playwright excellent for E2E with strong TypeScript support
- Large ecosystem and community

**Cons**:
- Jest can be slow for large test suites
- Requires configuration for Next.js App Router

#### Option B: Vitest + React Testing Library + Playwright
**Pros**:
- Vitest extremely fast (uses Vite)
- Better TypeScript support than Jest
- Simpler configuration
- Hot module reload for tests
- Compatible with Jest API (easy migration)

**Cons**:
- Slightly less mature than Jest
- Some community plugins still Jest-focused

**Decision**: Vitest + React Testing Library + Playwright

**Rationale**:
1. **Speed**: Vitest's performance aligns with TDD workflow needs (fast feedback)
2. **TypeScript**: Native TypeScript support without additional configuration
3. **Next.js 14**: Excellent compatibility with App Router and React Server Components
4. **Future-Ready**: Vite is the future of build tooling (Next.js 15 considering Turbopack/Vite)
5. **Playwright**: Best-in-class E2E testing with TypeScript support

**Testing Strategy**:
- **Unit Tests**: React components, utility functions, email templates
- **Integration Tests**: API routes with mock Supabase client
- **E2E Tests**: Critical admin workflows (outreach campaign creation, email sending)
- **TDD Approach**: Write tests → Get approval → Implement

**Packages to Add**:
```json
{
  "devDependencies": {
    "vitest": "^1.2.0",
    "@vitejs/plugin-react": "^4.2.1",
    "@testing-library/react": "^14.1.2",
    "@testing-library/user-event": "^14.5.1",
    "@testing-library/jest-dom": "^6.1.5",
    "jsdom": "^23.2.0",
    "@playwright/test": "^1.40.1"
  }
}
```

**Configuration Files Needed**:
- `vitest.config.ts`: Vitest configuration
- `playwright.config.ts`: E2E test configuration
- `tests/setup.ts`: Test setup and global mocks

**Alternatives Rejected**:
- **Jest**: Slower, more configuration overhead
- **Cypress**: Less flexible than Playwright, harder TypeScript integration

---

## Best Practices Research

### Email Personalization Patterns

**Research**: Effective restaurant outreach email templates

**Findings**:
1. **Subject Line**: Personalize with restaurant name and value proposition
   - Example: "Grow {Restaurant Name}'s visibility in Katy, TX - Join eKaty"
2. **Opening**: Acknowledge their business and location
   - Example: "Hi {Owner Name}, we noticed {Restaurant Name} on {Street} serves amazing {Cuisine}"
3. **Value Proposition**: Lead with benefit, not feature
   - Focus on "more customers" not "listing features"
4. **Social Proof**: Include local success stories
   - "20+ Katy restaurants already partnering"
5. **Clear CTA**: Single, obvious next step
   - "View Partnership Options" button, not multiple links

**Implementation**:
- Store template variables in database: `{restaurant_name}`, `{cuisine}`, `{owner_name}`, `{address}`
- Generate preview before sending
- A/B testing placeholders for future iteration

### Rate Limiting Best Practices

**Research**: Email sending rate limits to avoid spam detection

**Findings**:
1. **Industry Standards**:
   - Warm-up period: Start with 50 emails/day for new domain, increase gradually
   - Burst limit: Never exceed 50 emails/hour for new senders
   - Daily limit: 200 emails/day safe threshold for first month

2. **Implementation Patterns**:
   - Token bucket algorithm for rate limiting
   - Track per-admin and global limits
   - Queue emails for delayed sending if limit reached

**Decision**: Implement sliding window rate limiter
- 50 emails per hour per admin user
- 200 emails per day globally
- Store sent timestamps in database
- Display remaining quota in UI

### Admin Authorization Patterns

**Research**: Secure admin route protection in Next.js

**Findings**:
1. **Supabase Roles**: Use database roles for admin authorization
   - Add `role` column to `users` table (values: 'user', 'admin')
   - RLS policies check `auth.jwt() ->> 'role' = 'admin'`

2. **Middleware Protection**:
   - Next.js middleware checks auth session
   - Redirect to login if not authenticated
   - Check admin role from user metadata
   - Block non-admin users with 403

3. **API Route Security**:
   - Every admin API route validates admin role
   - Use shared `requireAdmin()` middleware function
   - Consistent error responses

**Implementation**:
```typescript
// lib/auth/require-admin.ts
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

---

## Technology Decisions Summary

| Decision | Choice | Rationale |
|----------|--------|-----------|
| Email Service | Resend | Modern Next.js integration, React email templates, generous free tier |
| Unit Testing | Vitest | Fast, native TypeScript, Next.js 14 compatibility |
| E2E Testing | Playwright | Best-in-class, strong TypeScript support, reliable |
| Rate Limiting | Token bucket (sliding window) | Industry standard, prevents spam detection |
| Admin Auth | Supabase roles + middleware | Leverages existing auth, minimal additional complexity |

---

## Risks & Mitigation

### Risk 1: Email Deliverability
**Risk**: Outreach emails marked as spam
**Mitigation**:
- Implement SPF/DKIM/DMARC records for sending domain
- Start with low volume (warm-up period)
- Include unsubscribe link in every email
- Monitor bounce/complaint rates via webhook
- Provide opt-out immediately on first complaint

### Risk 2: Rate Limit Circumvention
**Risk**: Admin users find ways to bypass rate limits
**Mitigation**:
- Server-side rate limit enforcement (not client-side)
- Database-backed tracking (not in-memory)
- Audit log for all sent emails
- Alert on suspicious activity (>45 emails/hour sustained)

### Risk 3: Testing Overhead
**Risk**: Test suite becomes slow, TDD abandoned
**Mitigation**:
- Use Vitest for speed
- Mock external services (Supabase, Resend)
- Parallel test execution
- Focus on high-value tests (critical paths)
- CI/CD integration to prevent regressions

---

## Next Steps

Phase 1 can now proceed with:
1. Data model design using Supabase PostgreSQL
2. API contract definitions for admin endpoints
3. Quick-start guide for developers

**Resolved Clarifications**:
- ✅ Email service: Resend
- ✅ Testing framework: Vitest + Playwright
