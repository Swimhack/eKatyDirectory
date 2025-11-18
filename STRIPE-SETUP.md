# Stripe Subscription Setup Guide

Complete Stripe integration for eKaty restaurant subscriptions.

## What's Been Built

### 1. Database Schema ✅
- **User model**: Added `subscriptionTier`, `subscriptionStatus`, `stripeCustomerId`
- **Subscription model**: Tracks active subscriptions with Stripe IDs
- **Payment model**: Records all payment transactions

### 2. Pricing Page ✅
- **Route**: `/pricing`
- **Features**:
  - 3 subscription tiers (Basic $49, Pro $99, Premium $199)
  - Monthly/Annual billing toggle (20% discount for annual)
  - Feature comparison for each tier
  - 14-day free trial on all plans
  - Direct Stripe Checkout integration

### 3. Stripe Checkout API ✅
- **Route**: `/api/subscriptions/create-checkout`
- **Features**:
  - Creates Stripe checkout sessions
  - Assigns customers to subscriptions
  - Implements 14-day free trial
  - Handles success/cancel redirects

### 4. Webhook Handler ✅
- **Route**: `/api/webhooks/stripe`
- **Handles**:
  - `customer.subscription.created` - New subscription
  - `customer.subscription.updated` - Upgrade/downgrade
  - `customer.subscription.deleted` - Cancellation
  - `invoice.payment_succeeded` - Successful payment
  - `invoice.payment_failed` - Payment failure
  - `checkout.session.completed` - Checkout complete
- **Actions**:
  - Updates user subscription tier automatically
  - Creates payment records
  - Handles payment failures with grace period

### 5. Subscription Management API ✅
- **Route**: `/api/subscriptions/manage`
- **Methods**:
  - `GET` - Fetch current subscription status
  - `PATCH` - Upgrade/downgrade plan
  - `DELETE` - Cancel subscription (at period end)

### 6. Feature Gating System ✅
- **File**: `/lib/subscriptions.ts`
- **Features**:
  - `getUserSubscription()` - Get user's tier and features
  - `hasFeatureAccess()` - Check if user can access feature
  - `meetsMinimumTier()` - Tier hierarchy validation
  - Complete feature matrix for all tiers

### 7. Restaurant Owner Dashboard ✅
- **Route**: `/owner/subscription`
- **Features**:
  - View current plan and status
  - Next billing date display
  - Feature list for current tier
  - Upgrade/downgrade buttons
  - Cancel subscription option

### 8. Checkout Success Page ✅
- **Route**: `/owner/subscription/success`
- **Features**:
  - Success confirmation with confetti
  - Next steps guide
  - Trial information display
  - Support contact options

## Stripe Setup Steps

### Step 1: Create Stripe Account
1. Go to https://stripe.com
2. Sign up for a Stripe account
3. Complete business verification (required for live mode)

### Step 2: Get API Keys
1. Navigate to **Developers** > **API Keys**
2. Copy your **Secret Key** (starts with `sk_test_` or `sk_live_`)
3. Copy your **Publishable Key** (starts with `pk_test_` or `pk_live_`)

### Step 3: Create Products and Prices
Navigate to **Products** > **Add Product** and create:

#### Basic Plan
- **Name**: eKaty Basic
- **Description**: Enhanced profile with photos, kids deals, and basic analytics
- **Pricing**:
  - Monthly: $49/month (save price ID as `price_basic_monthly`)
  - Annual: $470/year (save price ID as `price_basic_annual`)

#### Pro Plan
- **Name**: eKaty Pro
- **Description**: Featured placement, advanced analytics, and email marketing
- **Pricing**:
  - Monthly: $99/month (save price ID as `price_pro_monthly`)
  - Annual: $950/year (save price ID as `price_pro_annual`)

#### Premium Plan
- **Name**: eKaty Premium
- **Description**: Homepage placement, dedicated support, and API access
- **Pricing**:
  - Monthly: $199/month (save price ID as `price_premium_monthly`)
  - Annual: $1,910/year (save price ID as `price_premium_annual`)

### Step 4: Update Price IDs
Update `/app/pricing/page.tsx` with your actual Stripe price IDs:

```typescript
const pricingTiers = [
  {
    name: 'Basic',
    price: 49,
    priceId: 'price_1ABC123', // Replace with actual Stripe Price ID
    // ...
  },
  // ... update all 6 price IDs (3 tiers × 2 billing cycles)
]
```

### Step 5: Set Up Webhook
1. Navigate to **Developers** > **Webhooks**
2. Click **Add endpoint**
3. **Endpoint URL**: `https://yourdomain.com/api/webhooks/stripe`
4. **Events to send**:
   - `customer.subscription.created`
   - `customer.subscription.updated`
   - `customer.subscription.deleted`
   - `invoice.payment_succeeded`
   - `invoice.payment_failed`
   - `checkout.session.completed`
5. Save and copy the **Webhook Signing Secret** (starts with `whsec_`)

### Step 6: Configure Environment Variables
Add to your `.env` file:

```bash
# Stripe Keys
STRIPE_SECRET_KEY="sk_test_YOUR_SECRET_KEY"
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY="pk_test_YOUR_PUBLISHABLE_KEY"
STRIPE_WEBHOOK_SECRET="whsec_YOUR_WEBHOOK_SECRET"
NEXT_PUBLIC_BASE_URL="https://ekaty.com" # or your domain
```

### Step 7: Enable Billing Portal (Optional)
1. Navigate to **Settings** > **Billing**
2. Enable **Customer Portal**
3. Configure allowed actions:
   - Update payment method ✅
   - View invoices ✅
   - Cancel subscription ✅

## Testing

### Test Mode
1. Use test API keys (starting with `sk_test_` and `pk_test_`)
2. Test card numbers:
   - Success: `4242 4242 4242 4242`
   - Declined: `4000 0000 0000 0002`
   - Requires authentication: `4000 0027 6000 3184`
3. Any future expiry date and any 3-digit CVC

### Test Webhook Locally
Install Stripe CLI:
```bash
stripe login
stripe listen --forward-to localhost:3000/api/webhooks/stripe
```

### Test Subscription Flow
1. Visit `/pricing`
2. Click "Get Started" on any tier
3. Enter test card: `4242 4242 4242 4242`
4. Complete checkout
5. Verify subscription created in Stripe Dashboard
6. Check webhook events received
7. Verify user tier updated in database

## Go Live

### 1. Switch to Live Mode
- Replace test keys with live keys in `.env`
- Update webhook endpoint to production URL
- Test with real card (small amount)

### 2. Update Price IDs
- Create live products/prices in Stripe
- Update all price IDs in code to live versions

### 3. Monitor Dashboard
- Watch for successful subscriptions
- Monitor webhook deliveries
- Track failed payments

## Feature Gating Usage

Use the subscription system in your code:

```typescript
import { getUserSubscription, hasFeatureAccess } from '@/lib/subscriptions'

// Check user's subscription
const { tier, features, status } = await getUserSubscription(userId)

// Check specific feature access
const canUsePro = await hasFeatureAccess(userId, 'featuredPlacement')
if (!canUsePro) {
  return 'Please upgrade to Pro to access this feature'
}

// Use feature flags
if (features.emailCampaigns) {
  // Show email marketing features
}
```

## Revenue Projections

Based on 249 target restaurants:

### Conservative (10% Conversion)
- 25 restaurants × average $82/mo = **$2,050/month**
- **$24,600/year**

### Realistic (15% Conversion)
- 37 restaurants × average $82/mo = **$3,034/month**
- **$36,408/year**

### Optimistic (20% Conversion)
- 50 restaurants × average $82/mo = **$4,100/month**
- **$49,200/year**

### Best Case (30% Conversion)
- 75 restaurants × average $82/mo = **$6,150/month**
- **$73,800/year**

## Support

For Stripe support:
- **Documentation**: https://stripe.com/docs
- **Support**: https://support.stripe.com
- **API Reference**: https://stripe.com/docs/api

For implementation help:
- Email: james@ekaty.com
- Webhook debugging: Check `/api/webhooks/stripe` logs
- Subscription issues: Check Stripe Dashboard > Subscriptions

## Next Steps

1. ✅ Complete Stripe account setup
2. ✅ Create products and pricing
3. ✅ Configure webhook endpoint
4. ✅ Test subscription flow
5. ✅ Launch outreach campaigns (from `/admin/outreach`)
6. ✅ Monitor conversions and revenue
7. ✅ Scale with paid advertising

Your Stripe subscription system is ready to generate revenue!
