# Complete Monetization Setup Guide

## Overview
This guide will enable all monetization features for eKaty.com, including Stripe payments, subscriptions, and billing management.

## Prerequisites
- Stripe account (create at https://stripe.com)
- Node.js 18+ installed
- Stripe CLI installed (`npm install -g stripe`)

---

## Phase 1: Stripe Account Setup (15 minutes)

### Step 1: Create Stripe Account
1. Go to https://dashboard.stripe.com/register
2. Sign up with business email
3. Complete business verification
4. Enable "Test Mode" for initial setup

### Step 2: Get API Keys
1. Navigate to **Developers > API Keys**
2. Copy **Publishable key** (starts with `pk_test_`)
3. Copy **Secret key** (starts with `sk_test_`)
4. Save these - you'll need them for `.env`

### Step 3: Install Stripe CLI
```bash
# Windows (using Scoop)
scoop bucket add stripe https://github.com/stripe/scoop-stripe-cli.git
scoop install stripe

# macOS
brew install stripe/stripe-cli/stripe

# Linux
wget https://github.com/stripe/stripe-cli/releases/download/v1.19.4/stripe_1.19.4_linux_x86_64.tar.gz
tar -xvf stripe_1.19.4_linux_x86_64.tar.gz
sudo mv stripe /usr/local/bin/
```

### Step 4: Login to Stripe CLI
```bash
stripe login
# This will open browser for authentication
```

---

## Phase 2: Automated Product & Price Creation (5 minutes)

### Run the Setup Script
```bash
# Make script executable
chmod +x scripts/stripe-setup.sh

# Run setup script (creates products, prices, webhook)
node scripts/stripe-setup.js

# This will output:
# ✓ Created product: Basic Plan
# ✓ Created price: price_xxx (monthly)
# ✓ Created price: price_yyy (annual)
# ... (and so on for Pro and Premium)
# ✓ Created webhook endpoint
# ✓ Webhook secret: whsec_xxxxx
```

The script will automatically:
- Create 3 products (Basic, Pro, Premium)
- Create 6 prices (monthly + annual for each tier)
- Configure webhook endpoint
- Output all credentials for `.env`

---

## Phase 3: Environment Configuration (5 minutes)

### Update `.env` File
```bash
# Copy the output from stripe-setup.js script
# Or manually add:

STRIPE_SECRET_KEY="sk_test_xxxxxxxxxxxxx"
STRIPE_PUBLISHABLE_KEY="pk_test_xxxxxxxxxxxxx"
STRIPE_WEBHOOK_SECRET="whsec_xxxxxxxxxxxxx"

# Price IDs (from script output)
NEXT_PUBLIC_STRIPE_PRICE_BASIC_MONTHLY="price_xxxxx"
NEXT_PUBLIC_STRIPE_PRICE_BASIC_ANNUAL="price_xxxxx"
NEXT_PUBLIC_STRIPE_PRICE_PRO_MONTHLY="price_xxxxx"
NEXT_PUBLIC_STRIPE_PRICE_PRO_ANNUAL="price_xxxxx"
NEXT_PUBLIC_STRIPE_PRICE_PREMIUM_MONTHLY="price_xxxxx"
NEXT_PUBLIC_STRIPE_PRICE_PREMIUM_ANNUAL="price_xxxxx"

# Restaurant claim prices
NEXT_PUBLIC_STRIPE_PRICE_OWNER="price_xxxxx"
NEXT_PUBLIC_STRIPE_PRICE_FEATURED="price_xxxxx"
NEXT_PUBLIC_STRIPE_PRICE_PREMIUM_CLAIM="price_xxxxx"
```

### For Production (Fly.io)
```bash
# Set secrets one by one
fly secrets set STRIPE_SECRET_KEY="sk_live_xxxxx"
fly secrets set STRIPE_WEBHOOK_SECRET="whsec_xxxxx"
fly secrets set NEXT_PUBLIC_STRIPE_PRICE_BASIC_MONTHLY="price_xxxxx"
fly secrets set NEXT_PUBLIC_STRIPE_PRICE_BASIC_ANNUAL="price_xxxxx"
fly secrets set NEXT_PUBLIC_STRIPE_PRICE_PRO_MONTHLY="price_xxxxx"
fly secrets set NEXT_PUBLIC_STRIPE_PRICE_PRO_ANNUAL="price_xxxxx"
fly secrets set NEXT_PUBLIC_STRIPE_PRICE_PREMIUM_MONTHLY="price_xxxxx"
fly secrets set NEXT_PUBLIC_STRIPE_PRICE_PREMIUM_ANNUAL="price_xxxxx"

# Or use bulk import
fly secrets import < .env.production
```

---

## Phase 4: Webhook Configuration (5 minutes)

### Option A: Automated (Recommended)
The `stripe-setup.js` script already created the webhook. Verify:
```bash
stripe webhooks list
```

### Option B: Manual Setup
1. Go to **Developers > Webhooks** in Stripe Dashboard
2. Click **Add endpoint**
3. Endpoint URL: `https://ekaty.com/api/webhooks/stripe`
4. Select events:
   - `checkout.session.completed`
   - `customer.subscription.created`
   - `customer.subscription.updated`
   - `customer.subscription.deleted`
   - `invoice.payment_succeeded`
   - `invoice.payment_failed`
5. Click **Add endpoint**
6. Copy **Signing secret** (starts with `whsec_`)
7. Add to `.env` as `STRIPE_WEBHOOK_SECRET`

### Test Webhook Locally
```bash
# Forward Stripe events to local server
stripe listen --forward-to localhost:3000/api/webhooks/stripe

# In another terminal, trigger test event
stripe trigger checkout.session.completed
```

---

## Phase 5: Enable Customer Portal (5 minutes)

### Configure Self-Service Portal
1. Go to **Settings > Billing > Customer Portal**
2. Enable these features:
   - ✓ Invoice history
   - ✓ Update payment method
   - ✓ Cancel subscription
   - ✓ Update subscription (upgrade/downgrade)
3. Set cancellation behavior:
   - Cancel at end of billing period (recommended)
4. Customize branding (logo, colors)
5. Save changes

### Portal Features Enabled
- View invoices and payment history
- Update payment method
- Cancel subscription
- Upgrade/downgrade between tiers
- Download receipts

---

## Phase 6: Email Notification Setup (10 minutes)

### Configure SendGrid (Email Provider)
```bash
# Install SendGrid
npm install @sendgrid/mail

# Add to .env
SENDGRID_API_KEY="SG.xxxxxxxxxxxxx"
SENDGRID_FROM_EMAIL="billing@ekaty.com"
```

### Email Templates Created
The system includes templates for:
- ✓ Payment succeeded confirmation
- ✓ Payment failed warning
- ✓ Trial ending reminder (7 days, 3 days, 1 day)
- ✓ Subscription canceled confirmation
- ✓ Upgrade/downgrade confirmation
- ✓ Receipt with invoice link

All templates are in `/lib/email-templates.ts`

---

## Phase 7: Testing Checklist (15 minutes)

### Test Mode Checkout
```bash
# Start development server
npm run dev

# Visit pricing page
open http://localhost:3000/pricing
```

### Test Credit Cards (Stripe Test Mode)
```
Success: 4242 4242 4242 4242
Decline: 4000 0000 0000 0002
Auth Required: 4000 0025 0000 3155

Any future expiry date, any CVC, any ZIP
```

### Complete Test Flow
1. **Sign Up** → Create new account
2. **Visit Pricing** → http://localhost:3000/pricing
3. **Select Plan** → Click "Get Started" on Pro plan
4. **Checkout** → Enter test card `4242 4242 4242 4242`
5. **Success** → Verify redirect to success page
6. **Webhook** → Check logs for subscription creation
7. **Dashboard** → Visit `/owner/subscription` - verify tier shows "PRO"
8. **Features** → Verify feature gates work (access to PRO features)
9. **Upgrade** → Upgrade to Premium, verify proration
10. **Portal** → Visit billing portal, update payment method
11. **Cancel** → Cancel subscription, verify cancels at period end
12. **Email** → Check email notifications sent

### Webhook Testing
```bash
# Listen for webhooks
stripe listen --forward-to localhost:3000/api/webhooks/stripe

# Trigger test events
stripe trigger checkout.session.completed
stripe trigger customer.subscription.updated
stripe trigger invoice.payment_succeeded
stripe trigger invoice.payment_failed
```

### Database Verification
```bash
# Check subscription created
npx prisma studio

# Verify:
# - User.subscriptionTier = "PRO"
# - User.subscriptionStatus = "active"
# - User.stripeCustomerId populated
# - Subscription record exists
# - Payment record exists
```

---

## Phase 8: Going Live (Production)

### Switch to Live Mode
1. Go to Stripe Dashboard
2. Toggle from **Test Mode** to **Live Mode**
3. Complete business verification (required for live)
4. Get live API keys from **Developers > API Keys**

### Update Production Environment
```bash
# Live API keys
fly secrets set STRIPE_SECRET_KEY="sk_live_xxxxx"
fly secrets set STRIPE_PUBLISHABLE_KEY="pk_live_xxxxx"

# Live webhook secret (re-run stripe-setup.js in live mode)
fly secrets set STRIPE_WEBHOOK_SECRET="whsec_live_xxxxx"

# Live price IDs (re-run stripe-setup.js in live mode)
fly secrets set NEXT_PUBLIC_STRIPE_PRICE_BASIC_MONTHLY="price_live_xxxxx"
# ... (all 6 price IDs)
```

### Webhook Production URL
Update webhook endpoint URL to:
```
https://ekaty.com/api/webhooks/stripe
```

### Compliance Requirements
Before accepting real payments:
- ✓ Complete Stripe business verification
- ✓ Add terms of service at `/terms`
- ✓ Add privacy policy at `/privacy`
- ✓ Add refund policy
- ✓ Update checkout with legal links
- ✓ Enable tax collection (if required)
- ✓ Configure email receipts

---

## Phase 9: Monitoring & Analytics

### Stripe Dashboard Metrics
Monitor daily:
- **Revenue** → Payments > Overview
- **MRR** → Billing > Subscriptions
- **Churn** → Billing > Subscriptions > Canceled
- **Failed Payments** → Payments > Failed

### Database Analytics
```sql
-- Active subscriptions by tier
SELECT subscriptionTier, COUNT(*) as count
FROM User
WHERE subscriptionStatus = 'active'
GROUP BY subscriptionTier;

-- Monthly Recurring Revenue
SELECT
  subscriptionTier,
  COUNT(*) as subscribers,
  CASE
    WHEN subscriptionTier = 'BASIC' THEN COUNT(*) * 49
    WHEN subscriptionTier = 'PRO' THEN COUNT(*) * 99
    WHEN subscriptionTier = 'PREMIUM' THEN COUNT(*) * 199
  END as mrr
FROM User
WHERE subscriptionStatus = 'active'
GROUP BY subscriptionTier;

-- Payment success rate
SELECT
  status,
  COUNT(*) as count,
  SUM(amount) as total
FROM Payment
WHERE createdAt > NOW() - INTERVAL '30 days'
GROUP BY status;
```

### Alert Setup
Configure alerts for:
- Failed payments > 5 per day
- Cancellations > 10 per week
- Webhook failures
- Subscription downgrades

---

## Revenue Projections

Based on 249 target restaurants:

| Conversion | Subscribers | Avg Price | Annual Revenue |
|-----------|-------------|-----------|----------------|
| 10% (Conservative) | 25 | $82/mo | **$24,600** |
| 15% (Realistic) | 37 | $82/mo | **$36,408** |
| 20% (Optimistic) | 50 | $82/mo | **$49,200** |
| 30% (Best Case) | 75 | $82/mo | **$73,800** |

**Break-even**: ~6 subscribers (covers hosting + ops)

---

## Troubleshooting

### Webhook Not Firing
```bash
# Check webhook endpoint
stripe webhooks list

# Test manually
stripe trigger checkout.session.completed

# Check logs
stripe logs tail
```

### Payment Declined
- Use test cards from Stripe docs
- Check Stripe dashboard for decline reason
- Verify API keys are correct

### Subscription Not Updating
- Check webhook logs in `/api/webhooks/stripe`
- Verify `STRIPE_WEBHOOK_SECRET` matches
- Check database for subscription record

### Feature Gate Not Working
```typescript
// Debug feature access
const access = await hasFeatureAccess(userId, 'advancedAnalytics');
console.log('Feature access:', access);
```

---

## Support Resources

- **Stripe Documentation**: https://stripe.com/docs
- **Stripe CLI Reference**: https://stripe.com/docs/cli
- **Webhook Testing**: https://stripe.com/docs/webhooks/test
- **Test Cards**: https://stripe.com/docs/testing
- **Customer Portal**: https://stripe.com/docs/billing/subscriptions/integrating-customer-portal

---

## Security Checklist

- ✓ API keys stored in environment variables (never in code)
- ✓ Webhook signature verification enabled
- ✓ HTTPS enforced on production
- ✓ Stripe customer portal configured
- ✓ Row-level security on database
- ✓ PCI compliance (handled by Stripe Checkout)
- ✓ Terms of service and privacy policy linked

---

## Next Steps After Setup

1. **Marketing Launch**
   - Email outreach to 249 restaurants
   - Pricing page optimization
   - Landing page with value proposition

2. **Feature Development**
   - Restaurant analytics dashboard
   - Kids deals management interface
   - Featured placement UI

3. **Growth Optimization**
   - A/B test pricing tiers
   - Free trial length optimization
   - Upgrade prompts in dashboard

4. **Customer Success**
   - Onboarding email sequence
   - Feature adoption tracking
   - Churn prevention workflows

---

**Estimated Total Setup Time**: 60 minutes
**Estimated Revenue (Month 1)**: $0-500
**Estimated Revenue (Month 6)**: $2,000-5,000
**Estimated Revenue (Year 1)**: $25,000-50,000

🚀 **Ready to launch!**
