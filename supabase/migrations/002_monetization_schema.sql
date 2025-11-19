-- Monetization & Outreach Dashboard Schema
-- Feature: 001-monetization-dashboard
-- Date: 2025-01-18
-- Description: Complete database schema for restaurant partnership monetization

-- Enable UUID extension if not already enabled
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ============================================================================
-- TABLE 1: partnership_tiers
-- Stores partnership pricing tiers with features and benefits
-- ============================================================================

CREATE TABLE IF NOT EXISTS partnership_tiers (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name TEXT NOT NULL,
  slug TEXT NOT NULL UNIQUE,
  monthly_price NUMERIC(10,2) NOT NULL CHECK (monthly_price >= 0),
  features JSONB NOT NULL DEFAULT '[]'::jsonb,
  display_order INTEGER NOT NULL DEFAULT 0,
  is_active BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Indexes for partnership_tiers
CREATE INDEX IF NOT EXISTS idx_tiers_slug ON partnership_tiers(slug);
CREATE INDEX IF NOT EXISTS idx_tiers_active_order ON partnership_tiers(is_active, display_order);

-- ============================================================================
-- TABLE 2: restaurant_leads
-- Stores potential partner restaurants for outreach campaigns
-- ============================================================================

CREATE TABLE IF NOT EXISTS restaurant_leads (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  business_name TEXT NOT NULL,
  contact_name TEXT,
  email TEXT NOT NULL UNIQUE CHECK (email ~* '^[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}$'),
  phone TEXT,
  address TEXT,
  city TEXT NOT NULL DEFAULT 'Katy',
  cuisine_type TEXT[] DEFAULT '{}'::TEXT[],
  status TEXT NOT NULL DEFAULT 'prospective' CHECK (status IN ('prospective', 'contacted', 'engaged', 'interested', 'negotiating', 'converted', 'declined', 'invalid_email')),
  assigned_to UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  last_contacted_at TIMESTAMPTZ,
  notes TEXT,
  source TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Indexes for restaurant_leads
CREATE INDEX IF NOT EXISTS idx_leads_email ON restaurant_leads(email);
CREATE INDEX IF NOT EXISTS idx_leads_status ON restaurant_leads(status);
CREATE INDEX IF NOT EXISTS idx_leads_assigned ON restaurant_leads(assigned_to);
CREATE INDEX IF NOT EXISTS idx_leads_updated ON restaurant_leads(updated_at);

-- ============================================================================
-- TABLE 3: outreach_campaigns
-- Stores outreach campaign configurations and metadata
-- ============================================================================

CREATE TABLE IF NOT EXISTS outreach_campaigns (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name TEXT NOT NULL,
  created_by UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  subject_template TEXT NOT NULL,
  body_template TEXT NOT NULL,
  target_list UUID[] NOT NULL DEFAULT '{}'::UUID[],
  tier_showcase UUID[] DEFAULT '{}'::UUID[],
  status TEXT NOT NULL DEFAULT 'draft' CHECK (status IN ('draft', 'scheduled', 'sending', 'sent', 'paused', 'failed')),
  scheduled_for TIMESTAMPTZ,
  sent_at TIMESTAMPTZ,
  total_sent INTEGER NOT NULL DEFAULT 0,
  total_opened INTEGER NOT NULL DEFAULT 0,
  total_clicked INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Indexes for outreach_campaigns
CREATE INDEX IF NOT EXISTS idx_campaigns_created_by ON outreach_campaigns(created_by);
CREATE INDEX IF NOT EXISTS idx_campaigns_status ON outreach_campaigns(status);
CREATE INDEX IF NOT EXISTS idx_campaigns_scheduled ON outreach_campaigns(scheduled_for);

-- ============================================================================
-- TABLE 4: outreach_emails
-- Stores individual emails sent as part of campaigns with tracking data
-- ============================================================================

CREATE TABLE IF NOT EXISTS outreach_emails (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  campaign_id UUID NOT NULL REFERENCES outreach_campaigns(id) ON DELETE CASCADE,
  lead_id UUID NOT NULL REFERENCES restaurant_leads(id) ON DELETE CASCADE,
  email_provider_id TEXT,
  subject TEXT NOT NULL,
  sent_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  opened_at TIMESTAMPTZ,
  clicked_at TIMESTAMPTZ,
  bounced_at TIMESTAMPTZ,
  unsubscribed_at TIMESTAMPTZ,
  bounce_reason TEXT,
  sequence_position INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Indexes for outreach_emails
CREATE INDEX IF NOT EXISTS idx_emails_campaign ON outreach_emails(campaign_id);
CREATE INDEX IF NOT EXISTS idx_emails_lead ON outreach_emails(lead_id);
CREATE INDEX IF NOT EXISTS idx_emails_provider ON outreach_emails(email_provider_id);
CREATE INDEX IF NOT EXISTS idx_emails_sent ON outreach_emails(sent_at);

-- ============================================================================
-- TABLE 5: partnerships
-- Stores active paid partnerships with restaurants
-- ============================================================================

CREATE TABLE IF NOT EXISTS partnerships (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  restaurant_id UUID NOT NULL REFERENCES restaurants(id) ON DELETE CASCADE,
  tier_id UUID NOT NULL REFERENCES partnership_tiers(id) ON DELETE RESTRICT,
  status TEXT NOT NULL DEFAULT 'active' CHECK (status IN ('active', 'past_due', 'canceled', 'expired', 'trial')),
  start_date DATE NOT NULL DEFAULT CURRENT_DATE,
  renewal_date DATE NOT NULL,
  billing_cycle TEXT NOT NULL DEFAULT 'monthly' CHECK (billing_cycle IN ('monthly', 'quarterly', 'yearly')),
  payment_status TEXT NOT NULL DEFAULT 'pending' CHECK (payment_status IN ('pending', 'current', 'failed', 'dunning')),
  last_payment_date DATE,
  notes TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Indexes for partnerships
CREATE INDEX IF NOT EXISTS idx_partnerships_restaurant ON partnerships(restaurant_id);
CREATE INDEX IF NOT EXISTS idx_partnerships_tier ON partnerships(tier_id);
CREATE INDEX IF NOT EXISTS idx_partnerships_status ON partnerships(status);
CREATE INDEX IF NOT EXISTS idx_partnerships_renewal ON partnerships(renewal_date);

-- ============================================================================
-- TABLE 6: partnership_applications
-- Stores inbound partnership applications from restaurant owners
-- ============================================================================

CREATE TABLE IF NOT EXISTS partnership_applications (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  business_name TEXT NOT NULL,
  contact_name TEXT NOT NULL,
  contact_email TEXT NOT NULL CHECK (contact_email ~* '^[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}$'),
  contact_phone TEXT,
  address TEXT NOT NULL,
  city TEXT NOT NULL DEFAULT 'Katy',
  cuisine_type TEXT,
  website TEXT,
  preferred_tier_id UUID REFERENCES partnership_tiers(id) ON DELETE SET NULL,
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'rejected', 'converted')),
  reviewed_by UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  review_notes TEXT,
  submitted_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  reviewed_at TIMESTAMPTZ
);

-- Indexes for partnership_applications
CREATE INDEX IF NOT EXISTS idx_applications_status ON partnership_applications(status);
CREATE INDEX IF NOT EXISTS idx_applications_email ON partnership_applications(contact_email);
CREATE INDEX IF NOT EXISTS idx_applications_submitted ON partnership_applications(submitted_at);

-- ============================================================================
-- TABLE 7: follow_up_sequences
-- Stores automated follow-up email sequence configurations
-- ============================================================================

CREATE TABLE IF NOT EXISTS follow_up_sequences (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name TEXT NOT NULL,
  trigger_status TEXT NOT NULL CHECK (trigger_status IN ('prospective', 'contacted', 'engaged', 'interested', 'negotiating', 'converted', 'declined', 'invalid_email')),
  steps JSONB NOT NULL DEFAULT '[]'::jsonb,
  is_active BOOLEAN NOT NULL DEFAULT true,
  created_by UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- ============================================================================
-- DATABASE FUNCTIONS & TRIGGERS
-- ============================================================================

-- Function: Auto-update timestamp trigger
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ language 'plpgsql';

-- Apply update_updated_at trigger to all tables with updated_at
CREATE TRIGGER update_partnership_tiers_updated_at
  BEFORE UPDATE ON partnership_tiers
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_restaurant_leads_updated_at
  BEFORE UPDATE ON restaurant_leads
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_outreach_campaigns_updated_at
  BEFORE UPDATE ON outreach_campaigns
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_partnerships_updated_at
  BEFORE UPDATE ON partnerships
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_follow_up_sequences_updated_at
  BEFORE UPDATE ON follow_up_sequences
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Function: Auto-calculate renewal date
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

CREATE TRIGGER set_partnership_renewal_date
  BEFORE INSERT OR UPDATE OF start_date, billing_cycle ON partnerships
  FOR EACH ROW EXECUTE FUNCTION calculate_renewal_date();

-- Function: Update campaign metrics
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

CREATE TRIGGER update_campaign_stats
  AFTER INSERT OR UPDATE ON outreach_emails
  FOR EACH ROW EXECUTE FUNCTION update_campaign_metrics();

-- Function: Update lead status on email events
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

CREATE TRIGGER update_lead_on_email_event
  AFTER UPDATE ON outreach_emails
  FOR EACH ROW EXECUTE FUNCTION update_lead_status_on_email();

-- ============================================================================
-- ROW LEVEL SECURITY (RLS) POLICIES
-- ============================================================================

-- Enable RLS on all tables
ALTER TABLE partnership_tiers ENABLE ROW LEVEL SECURITY;
ALTER TABLE restaurant_leads ENABLE ROW LEVEL SECURITY;
ALTER TABLE outreach_campaigns ENABLE ROW LEVEL SECURITY;
ALTER TABLE outreach_emails ENABLE ROW LEVEL SECURITY;
ALTER TABLE partnerships ENABLE ROW LEVEL SECURITY;
ALTER TABLE partnership_applications ENABLE ROW LEVEL SECURITY;
ALTER TABLE follow_up_sequences ENABLE ROW LEVEL SECURITY;

-- Partnership tiers: Admins can manage, public can view active tiers
CREATE POLICY "Admins can manage tiers"
  ON partnership_tiers FOR ALL
  USING (EXISTS (
    SELECT 1 FROM auth.users
    WHERE id = auth.uid()
    AND raw_user_meta_data->>'role' = 'admin'
  ));

CREATE POLICY "Public can view active tiers"
  ON partnership_tiers FOR SELECT
  USING (is_active = true);

-- Restaurant leads: Admin-only access
CREATE POLICY "Admins can manage leads"
  ON restaurant_leads FOR ALL
  USING (EXISTS (
    SELECT 1 FROM auth.users
    WHERE id = auth.uid()
    AND raw_user_meta_data->>'role' = 'admin'
  ));

-- Outreach campaigns: Admin-only access
CREATE POLICY "Admins can manage campaigns"
  ON outreach_campaigns FOR ALL
  USING (EXISTS (
    SELECT 1 FROM auth.users
    WHERE id = auth.uid()
    AND raw_user_meta_data->>'role' = 'admin'
  ));

-- Outreach emails: Admin-only access
CREATE POLICY "Admins can view emails"
  ON outreach_emails FOR SELECT
  USING (EXISTS (
    SELECT 1 FROM auth.users
    WHERE id = auth.uid()
    AND raw_user_meta_data->>'role' = 'admin'
  ));

-- Partnerships: Admins can manage, restaurants can view their own
CREATE POLICY "Admins can manage partnerships"
  ON partnerships FOR ALL
  USING (EXISTS (
    SELECT 1 FROM auth.users
    WHERE id = auth.uid()
    AND raw_user_meta_data->>'role' = 'admin'
  ));

-- Partnership applications: Public can create, admins can manage
CREATE POLICY "Anyone can submit applications"
  ON partnership_applications FOR INSERT
  WITH CHECK (true);

CREATE POLICY "Admins can manage applications"
  ON partnership_applications FOR ALL
  USING (EXISTS (
    SELECT 1 FROM auth.users
    WHERE id = auth.uid()
    AND raw_user_meta_data->>'role' = 'admin'
  ));

-- Follow-up sequences: Admin-only access
CREATE POLICY "Admins can manage sequences"
  ON follow_up_sequences FOR ALL
  USING (EXISTS (
    SELECT 1 FROM auth.users
    WHERE id = auth.uid()
    AND raw_user_meta_data->>'role' = 'admin'
  ));

-- ============================================================================
-- SEED DATA
-- ============================================================================

-- Insert initial partnership tiers
INSERT INTO partnership_tiers (name, slug, monthly_price, features, display_order)
VALUES
  ('Basic', 'basic', 49.00,
   '["Standard listing", "Business hours display", "Contact information"]'::jsonb,
   1),
  ('Premium', 'premium', 99.00,
   '["Featured placement", "Photo gallery (10 images)", "Priority support", "Basic analytics"]'::jsonb,
   2),
  ('Featured', 'featured', 199.00,
   '["Top search placement", "Unlimited photos", "Priority support", "Advanced analytics", "Social media integration", "Promotional campaigns"]'::jsonb,
   3)
ON CONFLICT (slug) DO NOTHING;

-- ============================================================================
-- MIGRATION COMPLETE
-- ============================================================================
