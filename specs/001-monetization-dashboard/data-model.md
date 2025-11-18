# Data Model: Monetization & Outreach Dashboard

**Feature**: 001-monetization-dashboard
**Date**: 2025-01-18
**Database**: PostgreSQL (Supabase)

## Overview

This document defines the database schema for the monetization and outreach dashboard, including tables for campaigns, partnership tiers, restaurant leads, partnerships, outreach emails, and applications.

---

## Schema Diagram

```
┌─────────────────┐       ┌──────────────────┐       ┌─────────────────┐
│  users (exist)  │       │ partnership_tiers│       │ restaurant_leads│
│                 │       │                  │       │                 │
│ - id (PK)       │       │ - id (PK)        │       │ - id (PK)       │
│ - email         │       │ - name           │       │ - business_name │
│ - role          │◀──┐   │ - monthly_price  │   ┌──▶│ - contact_name  │
└─────────────────┘   │   │ - features       │   │   │ - email         │
                      │   │ - display_order  │   │   │ - status        │
                      │   └──────────────────┘   │   │ - assigned_to   │
                      │                          │   └─────────────────┘
                      │   ┌──────────────────┐   │            │
                      │   │ outreach_campaigns│   │            │
                      │   │                  │   │            │
                      │   │ - id (PK)        │   │            │
                      └───│ - created_by     │   │            │
                          │ - name           │   │            │
                          │ - target_list    │───┘            │
                          └──────────────────┘                │
                                   │                          │
                                   │                          │
                          ┌────────▼──────────┐               │
                          │ outreach_emails   │               │
                          │                   │               │
                          │ - id (PK)         │               │
                          │ - campaign_id     │               │
                          │ - lead_id         │───────────────┘
                          │ - sent_at         │
                          │ - opened_at       │
                          │ - clicked_at      │
                          └───────────────────┘

┌─────────────────┐       ┌──────────────────┐
│ partnerships    │       │ partnership_apps │
│                 │       │                  │
│ - id (PK)       │       │ - id (PK)        │
│ - restaurant_id │       │ - business_name  │
│ - tier_id       │       │ - contact_email  │
│ - status        │       │ - preferred_tier │
│ - start_date    │       │ - status         │
│ - renewal_date  │       │ - submitted_at   │
└─────────────────┘       └──────────────────┘
```

---

## Table Definitions

### 1. `partnership_tiers`

Stores partnership pricing tiers with features and benefits.

**Columns**:

| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| `id` | UUID | PRIMARY KEY, DEFAULT uuid_generate_v4() | Unique identifier |
| `name` | TEXT | NOT NULL | Tier name (e.g., "Basic", "Premium", "Featured") |
| `slug` | TEXT | NOT NULL, UNIQUE | URL-friendly identifier (e.g., "basic", "premium") |
| `monthly_price` | NUMERIC(10,2) | NOT NULL | Price in dollars per month |
| `features` | JSONB | NOT NULL, DEFAULT '[]' | Array of feature descriptions |
| `display_order` | INTEGER | NOT NULL, DEFAULT 0 | Sort order for display (ascending) |
| `is_active` | BOOLEAN | NOT NULL, DEFAULT true | Whether tier is currently offered |
| `created_at` | TIMESTAMPTZ | NOT NULL, DEFAULT now() | Creation timestamp |
| `updated_at` | TIMESTAMPTZ | NOT NULL, DEFAULT now() | Last update timestamp |

**Indexes**:
- `idx_tiers_slug` on `slug`
- `idx_tiers_active_order` on `(is_active, display_order)`

**Features JSON Structure**:
```json
[
  "Featured placement in search results",
  "Premium badge on listing",
  "Priority support",
  "Monthly analytics report"
]
```

**Sample Data**:
```sql
INSERT INTO partnership_tiers (name, slug, monthly_price, features, display_order) VALUES
('Basic', 'basic', 49.00, '["Standard listing", "Business hours display", "Contact information"]', 1),
('Premium', 'premium', 99.00, '["Featured placement", "Photo gallery (10 images)", "Priority support", "Basic analytics"]', 2),
('Featured', 'featured', 199.00, '["Top search placement", "Unlimited photos", "Priority support", "Advanced analytics", "Social media integration", "Promotional campaigns"]', 3);
```

---

### 2. `restaurant_leads`

Stores potential partner restaurants for outreach campaigns.

**Columns**:

| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| `id` | UUID | PRIMARY KEY, DEFAULT uuid_generate_v4() | Unique identifier |
| `business_name` | TEXT | NOT NULL | Restaurant name |
| `contact_name` | TEXT | | Owner/manager name (if known) |
| `email` | TEXT | NOT NULL, UNIQUE | Primary contact email |
| `phone` | TEXT | | Phone number |
| `address` | TEXT | | Street address |
| `city` | TEXT | NOT NULL, DEFAULT 'Katy' | City |
| `cuisine_type` | TEXT[] | DEFAULT '{}' | Array of cuisine types |
| `status` | TEXT | NOT NULL, DEFAULT 'prospective' | Lead status |
| `assigned_to` | UUID | REFERENCES users(id) ON DELETE SET NULL | Admin user assigned to this lead |
| `last_contacted_at` | TIMESTAMPTZ | | Last outreach attempt |
| `notes` | TEXT | | Internal notes |
| `source` | TEXT | | How lead was acquired |
| `created_at` | TIMESTAMPTZ | NOT NULL, DEFAULT now() | Creation timestamp |
| `updated_at` | TIMESTAMPTZ | NOT NULL, DEFAULT now() | Last update timestamp |

**Status Values**:
- `prospective`: Not yet contacted
- `contacted`: Initial email sent
- `engaged`: Responded to email or clicked link
- `interested`: Expressed interest in partnership
- `negotiating`: In active discussion
- `converted`: Became a paying partner
- `declined`: Not interested
- `invalid_email`: Email bounced

**Indexes**:
- `idx_leads_email` on `email`
- `idx_leads_status` on `status`
- `idx_leads_assigned` on `assigned_to`
- `idx_leads_updated` on `updated_at`

**Validation Rules**:
- Email format validation (via CHECK constraint)
- Status must be one of defined values (via CHECK constraint)

---

### 3. `outreach_campaigns`

Stores outreach campaign configurations and metadata.

**Columns**:

| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| `id` | UUID | PRIMARY KEY, DEFAULT uuid_generate_v4() | Unique identifier |
| `name` | TEXT | NOT NULL | Campaign name for internal tracking |
| `created_by` | UUID | NOT NULL, REFERENCES users(id) ON DELETE CASCADE | Admin who created campaign |
| `subject_template` | TEXT | NOT NULL | Email subject line template |
| `body_template` | TEXT | NOT NULL | Email body HTML template |
| `target_list` | UUID[] | NOT NULL | Array of restaurant_leads IDs |
| `tier_showcase` | UUID[] | | Array of partnership_tiers IDs to highlight |
| `status` | TEXT | NOT NULL, DEFAULT 'draft' | Campaign status |
| `scheduled_for` | TIMESTAMPTZ | | Scheduled send time (NULL = send now) |
| `sent_at` | TIMESTAMPTZ | | Actual send timestamp |
| `total_sent` | INTEGER | NOT NULL, DEFAULT 0 | Number of emails sent |
| `total_opened` | INTEGER | NOT NULL, DEFAULT 0 | Number of opens |
| `total_clicked` | INTEGER | NOT NULL, DEFAULT 0 | Number of clicks |
| `created_at` | TIMESTAMPTZ | NOT NULL, DEFAULT now() | Creation timestamp |
| `updated_at` | TIMESTAMPTZ | NOT NULL, DEFAULT now() | Last update timestamp |

**Status Values**:
- `draft`: Being edited, not sent
- `scheduled`: Scheduled for future send
- `sending`: Currently sending
- `sent`: Completed
- `paused`: Manually paused
- `failed`: Send failed

**Indexes**:
- `idx_campaigns_created_by` on `created_by`
- `idx_campaigns_status` on `status`
- `idx_campaigns_scheduled` on `scheduled_for`

**Template Variable Support**:
Templates use `{{variable}}` syntax:
- `{{restaurant_name}}`: Business name
- `{{contact_name}}`: Owner/manager name
- `{{cuisine}}`: Primary cuisine type
- `{{city}}`: Restaurant city
- `{{tier_name}}`: Partnership tier name
- `{{tier_price}}`: Tier monthly price

---

### 4. `outreach_emails`

Stores individual emails sent as part of campaigns with tracking data.

**Columns**:

| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| `id` | UUID | PRIMARY KEY, DEFAULT uuid_generate_v4() | Unique identifier |
| `campaign_id` | UUID | NOT NULL, REFERENCES outreach_campaigns(id) ON DELETE CASCADE | Parent campaign |
| `lead_id` | UUID | NOT NULL, REFERENCES restaurant_leads(id) ON DELETE CASCADE | Target restaurant |
| `email_provider_id` | TEXT | | External email service message ID (Resend ID) |
| `subject` | TEXT | NOT NULL | Rendered subject line |
| `sent_at` | TIMESTAMPTZ | NOT NULL, DEFAULT now() | Send timestamp |
| `opened_at` | TIMESTAMPTZ | | First open timestamp |
| `clicked_at` | TIMESTAMPTZ | | First click timestamp |
| `bounced_at` | TIMESTAMPTZ | | Bounce timestamp |
| `unsubscribed_at` | TIMESTAMPTZ | | Unsubscribe timestamp |
| `bounce_reason` | TEXT | | Bounce error message |
| `sequence_position` | INTEGER | NOT NULL, DEFAULT 0 | Position in follow-up sequence (0 = initial) |
| `created_at` | TIMESTAMPTZ | NOT NULL, DEFAULT now() | Creation timestamp |

**Indexes**:
- `idx_emails_campaign` on `campaign_id`
- `idx_emails_lead` on `lead_id`
- `idx_emails_provider` on `email_provider_id`
- `idx_emails_sent` on `sent_at`

**Tracking Implementation**:
- Opens tracked via 1x1 pixel image: `/api/webhooks/email/open/{email_id}`
- Clicks tracked via redirect: `/api/webhooks/email/click/{email_id}?url={destination}`
- Bounces/unsubscribes via Resend webhooks: `/api/webhooks/email`

---

### 5. `partnerships`

Stores active paid partnerships with restaurants.

**Columns**:

| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| `id` | UUID | PRIMARY KEY, DEFAULT uuid_generate_v4() | Unique identifier |
| `restaurant_id` | UUID | NOT NULL, REFERENCES restaurants(id) ON DELETE CASCADE | Partner restaurant |
| `tier_id` | UUID | NOT NULL, REFERENCES partnership_tiers(id) ON DELETE RESTRICT | Active tier |
| `status` | TEXT | NOT NULL, DEFAULT 'active' | Partnership status |
| `start_date` | DATE | NOT NULL, DEFAULT CURRENT_DATE | Partnership start date |
| `renewal_date` | DATE | NOT NULL | Next renewal date |
| `billing_cycle` | TEXT | NOT NULL, DEFAULT 'monthly' | Billing frequency |
| `payment_status` | TEXT | NOT NULL, DEFAULT 'pending' | Current payment status |
| `last_payment_date` | DATE | | Last successful payment |
| `notes` | TEXT | | Internal notes |
| `created_at` | TIMESTAMPTZ | NOT NULL, DEFAULT now() | Creation timestamp |
| `updated_at` | TIMESTAMPTZ | NOT NULL, DEFAULT now() | Last update timestamp |

**Status Values**:
- `active`: Currently active partnership
- `past_due`: Payment failed, grace period
- `canceled`: Manually canceled
- `expired`: Not renewed
- `trial`: Free trial period

**Payment Status Values**:
- `pending`: Awaiting first payment
- `current`: Paid up to date
- `failed`: Payment attempt failed
- `dunning`: In retry cycle

**Indexes**:
- `idx_partnerships_restaurant` on `restaurant_id`
- `idx_partnerships_tier` on `tier_id`
- `idx_partnerships_status` on `status`
- `idx_partnerships_renewal` on `renewal_date`

**Business Rules**:
- One active partnership per restaurant
- Renewal date auto-calculated based on billing cycle
- Status changes trigger email notifications

---

### 6. `partnership_applications`

Stores inbound partnership applications from restaurant owners.

**Columns**:

| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| `id` | UUID | PRIMARY KEY, DEFAULT uuid_generate_v4() | Unique identifier |
| `business_name` | TEXT | NOT NULL | Restaurant name |
| `contact_name` | TEXT | NOT NULL | Owner/manager name |
| `contact_email` | TEXT | NOT NULL | Contact email |
| `contact_phone` | TEXT | | Contact phone |
| `address` | TEXT | NOT NULL | Restaurant address |
| `city` | TEXT | NOT NULL, DEFAULT 'Katy' | City |
| `cuisine_type` | TEXT | | Primary cuisine type |
| `website` | TEXT | | Restaurant website |
| `preferred_tier_id` | UUID | REFERENCES partnership_tiers(id) ON DELETE SET NULL | Selected tier (if any) |
| `status` | TEXT | NOT NULL, DEFAULT 'pending' | Application status |
| `reviewed_by` | UUID | REFERENCES users(id) ON DELETE SET NULL | Admin who reviewed |
| `review_notes` | TEXT | | Admin notes from review |
| `submitted_at` | TIMESTAMPTZ | NOT NULL, DEFAULT now() | Submission timestamp |
| `reviewed_at` | TIMESTAMPTZ | | Review timestamp |

**Status Values**:
- `pending`: Awaiting review
- `approved`: Application approved
- `rejected`: Application rejected
- `converted`: Became a partnership

**Indexes**:
- `idx_applications_status` on `status`
- `idx_applications_email` on `contact_email`
- `idx_applications_submitted` on `submitted_at`

---

### 7. `follow_up_sequences`

Stores automated follow-up email sequence configurations.

**Columns**:

| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| `id` | UUID | PRIMARY KEY, DEFAULT uuid_generate_v4() | Unique identifier |
| `name` | TEXT | NOT NULL | Sequence name |
| `trigger_status` | TEXT | NOT NULL | Lead status that triggers sequence |
| `steps` | JSONB | NOT NULL | Array of follow-up steps |
| `is_active` | BOOLEAN | NOT NULL, DEFAULT true | Whether sequence is enabled |
| `created_by` | UUID | NOT NULL, REFERENCES users(id) ON DELETE CASCADE | Admin who created |
| `created_at` | TIMESTAMPTZ | NOT NULL, DEFAULT now() | Creation timestamp |
| `updated_at` | TIMESTAMPTZ | NOT NULL, DEFAULT now() | Last update timestamp |

**Steps JSON Structure**:
```json
[
  {
    "position": 1,
    "delay_days": 3,
    "subject_template": "Following up: {{restaurant_name}} partnership",
    "body_template": "Hi {{contact_name}}, wanted to follow up...",
    "stop_conditions": ["engaged", "interested", "declined"]
  },
  {
    "position": 2,
    "delay_days": 7,
    "subject_template": "Last chance: {{restaurant_name}} special offer",
    "body_template": "This is our final attempt...",
    "stop_conditions": ["engaged", "interested", "declined"]
  }
]
```

---

## Row Level Security (RLS) Policies

### Admin-Only Access

All admin tables require `role = 'admin'` check:

```sql
-- Partnership tiers: Admins full access, public read-only for active tiers
CREATE POLICY "Admins can manage tiers"
  ON partnership_tiers FOR ALL
  USING (auth.jwt() ->> 'role' = 'admin');

CREATE POLICY "Public can view active tiers"
  ON partnership_tiers FOR SELECT
  USING (is_active = true);

-- Restaurant leads: Admin-only access
CREATE POLICY "Admins can manage leads"
  ON restaurant_leads FOR ALL
  USING (auth.jwt() ->> 'role' = 'admin');

-- Outreach campaigns: Admin-only access
CREATE POLICY "Admins can manage campaigns"
  ON outreach_campaigns FOR ALL
  USING (auth.jwt() ->> 'role' = 'admin');

-- Outreach emails: Admin-only access
CREATE POLICY "Admins can view emails"
  ON outreach_emails FOR SELECT
  USING (auth.jwt() ->> 'role' = 'admin');

-- Partnerships: Admins can manage, restaurants can view their own
CREATE POLICY "Admins can manage partnerships"
  ON partnerships FOR ALL
  USING (auth.jwt() ->> 'role' = 'admin');

CREATE POLICY "Restaurants can view their partnership"
  ON partnerships FOR SELECT
  USING (restaurant_id IN (
    SELECT id FROM restaurants WHERE auth.uid() = ANY(admin_users)
  ));

-- Partnership applications: Public can create, admins can manage
CREATE POLICY "Anyone can submit applications"
  ON partnership_applications FOR INSERT
  WITH CHECK (true);

CREATE POLICY "Admins can manage applications"
  ON partnership_applications FOR ALL
  USING (auth.jwt() ->> 'role' = 'admin');

-- Follow-up sequences: Admin-only access
CREATE POLICY "Admins can manage sequences"
  ON follow_up_sequences FOR ALL
  USING (auth.jwt() ->> 'role' = 'admin');
```

---

## Database Functions & Triggers

### 1. Auto-Update Timestamp Trigger

```sql
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ language 'plpgsql';

-- Apply to all tables with updated_at
CREATE TRIGGER update_partnership_tiers_updated_at BEFORE UPDATE ON partnership_tiers FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_restaurant_leads_updated_at BEFORE UPDATE ON restaurant_leads FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_outreach_campaigns_updated_at BEFORE UPDATE ON outreach_campaigns FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_partnerships_updated_at BEFORE UPDATE ON partnerships FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_follow_up_sequences_updated_at BEFORE UPDATE ON follow_up_sequences FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
```

### 2. Auto-Calculate Renewal Date

```sql
CREATE OR REPLACE FUNCTION calculate_renewal_date()
RETURNS TRIGGER AS $$
BEGIN
  IF NEW.billing_cycle = 'monthly' THEN
    NEW.renewal_date = NEW.start_date + INTERVAL '1 month';
  ELSIF NEW.billing_cycle = 'quarterly' THEN
    NEW.renewal_date = NEW.start_date + INTERVAL '3 months';
  ELSIF NEW.billing_cycle = 'yearly' THEN
    NEW.renewal_date = NEW.start_date + INTERVAL '1 year';
  END IF;
  RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER set_partnership_renewal_date BEFORE INSERT OR UPDATE OF start_date, billing_cycle ON partnerships FOR EACH ROW EXECUTE FUNCTION calculate_renewal_date();
```

### 3. Update Campaign Metrics

```sql
CREATE OR REPLACE FUNCTION update_campaign_metrics()
RETURNS TRIGGER AS $$
BEGIN
  IF TG_OP = 'INSERT' THEN
    UPDATE outreach_campaigns
    SET total_sent = total_sent + 1
    WHERE id = NEW.campaign_id;
  END IF;

  IF NEW.opened_at IS NOT NULL AND (OLD IS NULL OR OLD.opened_at IS NULL) THEN
    UPDATE outreach_campaigns
    SET total_opened = total_opened + 1
    WHERE id = NEW.campaign_id;
  END IF;

  IF NEW.clicked_at IS NOT NULL AND (OLD IS NULL OR OLD.clicked_at IS NULL) THEN
    UPDATE outreach_campaigns
    SET total_clicked = total_clicked + 1
    WHERE id = NEW.campaign_id;
  END IF;

  RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_campaign_stats AFTER INSERT OR UPDATE ON outreach_emails FOR EACH ROW EXECUTE FUNCTION update_campaign_metrics();
```

### 4. Update Lead Status on Email Events

```sql
CREATE OR REPLACE FUNCTION update_lead_status_on_email()
RETURNS TRIGGER AS $$
BEGIN
  IF NEW.opened_at IS NOT NULL AND (OLD IS NULL OR OLD.opened_at IS NULL) THEN
    UPDATE restaurant_leads
    SET status = 'engaged', last_contacted_at = NEW.opened_at
    WHERE id = NEW.lead_id AND status = 'contacted';
  END IF;

  IF NEW.bounced_at IS NOT NULL AND (OLD IS NULL OR OLD.bounced_at IS NULL) THEN
    UPDATE restaurant_leads
    SET status = 'invalid_email'
    WHERE id = NEW.lead_id;
  END IF;

  RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_lead_on_email_event AFTER UPDATE ON outreach_emails FOR EACH ROW EXECUTE FUNCTION update_lead_status_on_email();
```

---

## Migration Script

See `supabase/migrations/002_monetization_schema.sql` for complete schema creation script.

---

## Data Relationships Summary

1. **Users → Restaurant Leads**: Admins can be assigned to leads
2. **Users → Campaigns**: Admins create and manage campaigns
3. **Campaigns → Leads**: Campaigns target multiple leads
4. **Campaigns → Emails**: Each campaign sends multiple emails
5. **Emails → Leads**: Each email targets one lead
6. **Partnerships → Restaurants**: Each restaurant has one active partnership
7. **Partnerships → Tiers**: Each partnership has one tier
8. **Applications → Tiers**: Applicants can select preferred tier
9. **Sequences → Users**: Admins create sequences
10. **Sequences → Leads**: Sequences trigger based on lead status

---

## Performance Considerations

1. **Indexing Strategy**:
   - All foreign keys indexed
   - Common query patterns indexed (status, dates)
   - Email provider ID indexed for webhook lookups

2. **Partitioning** (future consideration):
   - Partition `outreach_emails` by `sent_at` date if volume exceeds 100k records
   - Archive old campaigns (>1 year) to separate table

3. **Query Optimization**:
   - Aggregate metrics cached in campaign table (avoid COUNT(*) queries)
   - Use materialized views for revenue dashboard if queries become slow

4. **Rate Limiting Storage**:
   - Store email send timestamps in `outreach_emails` table
   - Query last hour of sends to enforce rate limit
   - Consider Redis for high-frequency rate limit checks if needed
