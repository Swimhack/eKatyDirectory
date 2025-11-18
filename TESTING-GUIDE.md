# Complete Monetization Testing Guide

## Overview
This guide provides step-by-step instructions to test all monetization features end-to-end, including Stripe payments, subscriptions, webhooks, and email notifications.

---

## Pre-Testing Setup

### 1. Environment Configuration
Ensure all environment variables are set:
```bash
# Run environment setup script
node scripts/setup-env.js

# Or manually verify .env has:
STRIPE_SECRET_KEY=sk_test_xxxxx
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_test_xxxxx
STRIPE_WEBHOOK_SECRET=whsec_xxxxx
# ... (all price IDs)
EMAIL_PROVIDER=sendgrid
SENDGRID_API_KEY=SG.xxxxx
```

### 2. Create Stripe Products & Prices
```bash
# Run automated setup script
node scripts/stripe-setup.js

# This creates:
# - 3 subscription products (Basic, Pro, Premium)
# - 6 price IDs (monthly + annual)
# - 3 claim products (Owner, Featured, Premium)
# - Webhook endpoint
```

### 3. Start Local Webhook Listener
```bash
# In terminal 1 - Start webhook forwarding
stripe listen --forward-to localhost:3000/api/webhooks/stripe

# Copy the webhook signing secret (starts with whsec_)
# Add to .env as STRIPE_WEBHOOK_SECRET
```

### 4. Start Development Server
```bash
# In terminal 2
npm run dev

# Server should be running at http://localhost:3000
```

---

## Test Suite 1: Subscription Checkout Flow

### Test 1.1: Basic Plan Signup
**Objective**: Verify complete signup and checkout flow

1. **Navigate to pricing page**
   ```
   http://localhost:3000/pricing
   ```

2. **Click "Get Started" on Basic Plan**
   - Should redirect to Stripe Checkout
   - Verify price shows $49.00/month
   - Verify "14-day free trial" is displayed

3. **Fill out checkout form**
   - Email: `test+basic@example.com`
   - Card: `4242 4242 4242 4242` (test card)
   - Expiry: Any future date (e.g., 12/25)
   - CVC: Any 3 digits (e.g., 123)
   - Name: `Test Basic User`
   - Country: United States
   - ZIP: Any 5 digits (e.g., 90210)

4. **Complete checkout**
   - Click "Subscribe"
   - Should redirect to success page

5. **Verify webhook received**
   - Check terminal 1 (webhook listener)
   - Should see: `checkout.session.completed` event

6. **Verify database update**
   ```bash
   npx prisma studio

   # Check:
   # - User record created with email test+basic@example.com
   # - subscriptionTier = "BASIC"
   # - subscriptionStatus = "trialing" or "active"
   # - stripeCustomerId populated
   # - Subscription record created
   ```

7. **Verify email sent**
   - Check SendGrid dashboard (or email inbox)
   - Should receive trial confirmation email

8. **Navigate to subscription dashboard**
   ```
   http://localhost:3000/owner/subscription
   ```
   - Verify shows "Basic Plan"
   - Verify shows trial end date
   - Verify shows next billing date

**Expected Result**: ✅ User successfully subscribed to Basic plan with 14-day trial

---

### Test 1.2: Pro Plan Signup
**Objective**: Test different subscription tier

1. **Repeat Test 1.1 steps with Pro Plan**
   - Use email: `test+pro@example.com`
   - Verify price: $99.00/month
   - Verify tier in database: "PRO"

**Expected Result**: ✅ User successfully subscribed to Pro plan

---

### Test 1.3: Premium Plan Signup
**Objective**: Test highest tier

1. **Repeat Test 1.1 steps with Premium Plan**
   - Use email: `test+premium@example.com`
   - Verify price: $199.00/month
   - Verify tier in database: "PREMIUM"

**Expected Result**: ✅ User successfully subscribed to Premium plan

---

## Test Suite 2: Restaurant Claim Flow

### Test 2.1: Owner Claim ($10/mo)
**Objective**: Test restaurant ownership claim

1. **Navigate to restaurant page**
   ```
   http://localhost:3000/restaurants/[any-restaurant-slug]
   ```

2. **Locate "Claim Restaurant" card**
   - Should be visible in right sidebar
   - Should show 3 tier options

3. **Select "Owner Verification" tier**
   - Price: $10/month
   - Features listed

4. **Click "Claim Restaurant"**
   - Should redirect to Stripe Checkout
   - Verify restaurant name in checkout
   - Verify price $10.00/month

5. **Complete checkout**
   - Email: `test+owner@example.com`
   - Card: `4242 4242 4242 4242`
   - Complete form

6. **Verify webhook and database**
   - Check subscription created
   - Verify tier metadata includes restaurant ID

**Expected Result**: ✅ Restaurant claim successful with owner tier

---

### Test 2.2: Featured Claim ($99/mo)
**Objective**: Test featured listing claim

1. **Repeat Test 2.1 with Featured tier**
   - Select "Featured Listing" option
   - Verify price: $99.00/month
   - Use email: `test+featured@example.com`

**Expected Result**: ✅ Restaurant claim successful with featured tier

---

## Test Suite 3: Payment Webhooks

### Test 3.1: Payment Succeeded
**Objective**: Verify payment success handling

1. **Trigger payment success webhook**
   ```bash
   stripe trigger invoice.payment_succeeded
   ```

2. **Check terminal output**
   - Should log: "Payment succeeded for user..."

3. **Check database**
   ```bash
   npx prisma studio

   # Verify Payment record created:
   # - status = "succeeded"
   # - amount = invoice amount
   # - paidAt populated
   ```

4. **Check email sent**
   - Look for "Payment Received" email
   - Verify includes:
     - Invoice amount
     - Plan name
     - Next billing date
     - Link to invoice

**Expected Result**: ✅ Payment recorded and confirmation email sent

---

### Test 3.2: Payment Failed
**Objective**: Verify payment failure handling

1. **Use declining test card**
   - Card: `4000 0000 0000 0002` (always declines)
   - Create new subscription with this card

2. **Verify webhook received**
   - Check for `invoice.payment_failed` event

3. **Check database**
   ```bash
   # Verify:
   # - Payment record with status = "failed"
   # - Subscription status = "past_due"
   # - User subscriptionStatus = "past_due"
   ```

4. **Check email sent**
   - Look for "Payment Failed - Action Required" email
   - Verify includes:
     - Amount due
     - Retry date
     - Link to update payment method

**Expected Result**: ✅ Failed payment recorded and warning email sent

---

## Test Suite 4: Subscription Management

### Test 4.1: Upgrade Subscription
**Objective**: Test tier upgrade with proration

1. **Login as Basic user**
   ```
   http://localhost:3000/owner/subscription
   ```

2. **Click "Change Plan"**
   - Select "Pro Plan"
   - Click "Upgrade to Pro"

3. **Verify proration shown**
   - Should show prorated amount
   - Should explain immediate upgrade

4. **Complete upgrade**
   - Confirm change

5. **Verify webhook**
   - Check for `customer.subscription.updated` event

6. **Check database**
   ```bash
   # Verify:
   # - User.subscriptionTier = "PRO"
   # - Subscription.tier = "PRO"
   # - Subscription updated timestamp
   ```

7. **Check email**
   - Look for "Subscription Upgraded" email
   - Verify shows old and new plan

**Expected Result**: ✅ Subscription upgraded with prorated charges

---

### Test 4.2: Downgrade Subscription
**Objective**: Test tier downgrade

1. **Login as Premium user**
2. **Downgrade to Basic**
   - Select "Basic Plan"
   - Verify downgrade takes effect at period end
3. **Verify database**
   - Subscription.cancelAtPeriodEnd should be false
   - New tier should be scheduled

**Expected Result**: ✅ Downgrade scheduled for end of billing period

---

### Test 4.3: Cancel Subscription
**Objective**: Test subscription cancellation

1. **Login as any paid user**
   ```
   http://localhost:3000/owner/subscription
   ```

2. **Click "Cancel Subscription"**
   - Confirm cancellation

3. **Verify Stripe Customer Portal**
   - Should redirect to Stripe portal
   - Or show in-app cancellation confirmation

4. **Check webhook**
   - Look for `customer.subscription.updated` event
   - cancelAtPeriodEnd should be true

5. **Check database**
   ```bash
   # Verify:
   # - Subscription.cancelAtPeriodEnd = true
   # - User still has access until period end
   ```

6. **Check email**
   - Look for "Subscription Canceled" email
   - Verify shows:
     - Cancellation date
     - Access until date

7. **Simulate period end**
   ```bash
   stripe trigger customer.subscription.deleted
   ```

8. **Verify final state**
   ```bash
   # Check database:
   # - Subscription.status = "canceled"
   # - Subscription.canceledAt populated
   # - User.subscriptionTier = "FREE"
   # - User.subscriptionStatus = "canceled"
   ```

**Expected Result**: ✅ Subscription canceled, user retains access until period end

---

## Test Suite 5: Billing Portal

### Test 5.1: Access Billing Portal
**Objective**: Verify Stripe Customer Portal integration

1. **Login as paid user**
2. **Navigate to**
   ```
   http://localhost:3000/api/stripe/portal
   ```

3. **Verify redirect**
   - Should redirect to Stripe Customer Portal
   - Should show user's subscription

4. **Test portal features**
   - ✓ Update payment method
   - ✓ View invoices
   - ✓ Download receipts
   - ✓ Cancel subscription
   - ✓ Upgrade/downgrade (if configured)

**Expected Result**: ✅ Portal accessible and functional

---

## Test Suite 6: Feature Gating

### Test 6.1: Free User Restrictions
**Objective**: Verify free users have limited access

1. **Login as free user** (no subscription)
2. **Attempt to access premium features**
   ```typescript
   // Test in browser console:
   const hasAccess = await fetch('/api/features/check?feature=advancedAnalytics').then(r => r.json())
   console.log(hasAccess) // Should be false
   ```

3. **Verify UI restrictions**
   - Premium features should show upgrade prompts
   - Feature cards should display "Upgrade Required"

**Expected Result**: ✅ Free users blocked from premium features

---

### Test 6.2: Basic User Access
**Objective**: Verify Basic tier feature access

1. **Login as Basic user**
2. **Test feature access**
   ```typescript
   // Should have access to:
   - enhancedProfile ✓
   - photoUploads ✓
   - basicAnalytics ✓
   - emailSupport ✓

   // Should NOT have access to:
   - featuredPlacement ✗
   - advancedAnalytics ✗
   - prioritySupport ✗
   ```

**Expected Result**: ✅ Basic tier features accessible, Pro/Premium blocked

---

### Test 6.3: Pro User Access
**Objective**: Verify Pro tier feature access

1. **Login as Pro user**
2. **Test expanded feature access**
   ```typescript
   // Should have access to:
   - Everything in Basic ✓
   - featuredPlacement ✓
   - advancedAnalytics ✓
   - emailCampaigns ✓

   // Should NOT have access to:
   - homepagePlacement ✗
   - accountManager ✗
   ```

**Expected Result**: ✅ Pro tier features accessible

---

### Test 6.4: Premium User Access
**Objective**: Verify Premium tier has full access

1. **Login as Premium user**
2. **Test all features**
   ```typescript
   // Should have access to:
   - Everything in Basic + Pro ✓
   - homepagePlacement ✓
   - accountManager ✓
   - whiteLabel ✓
   - apiAccess ✓
   ```

**Expected Result**: ✅ All features accessible

---

## Test Suite 7: Admin Dashboard

### Test 7.1: Subscription Overview
**Objective**: Verify admin can monitor subscriptions

1. **Login as admin user**
2. **Navigate to**
   ```
   http://localhost:3000/admin/subscriptions
   ```

3. **Verify stats display**
   - Total subscriptions count
   - Active subscriptions
   - Canceled subscriptions
   - Past due subscriptions
   - MRR (Monthly Recurring Revenue)

4. **Verify tier breakdown**
   - Count by FREE/BASIC/PRO/PREMIUM
   - Should match database counts

5. **Test filters**
   - Click "Active" - shows only active
   - Click "Canceled" - shows only canceled
   - Click "Past Due" - shows only past_due
   - Click "All" - shows everything

6. **Test search**
   - Enter email - filters by email
   - Enter name - filters by name
   - Enter tier - filters by tier

**Expected Result**: ✅ Admin dashboard shows accurate subscription data

---

### Test 7.2: Cancel User Subscription (Admin)
**Objective**: Verify admin can cancel subscriptions

1. **On admin subscriptions page**
2. **Find active subscription**
3. **Click "Cancel"**
   - Confirm cancellation

4. **Verify updates**
   - Row should update to show "Cancels at period end"
   - Status should remain "active"

5. **Check Stripe Dashboard**
   - Open subscription link
   - Verify cancelAtPeriodEnd = true

**Expected Result**: ✅ Admin can cancel user subscriptions

---

## Test Suite 8: Email Notifications

### Test 8.1: Trial Ending Reminders
**Objective**: Verify trial ending emails sent

**Note**: This requires a scheduled job or manual trigger

1. **Create test subscription with trial ending soon**
2. **Manually trigger email**
   ```typescript
   // In browser console or API route:
   await sendTrialEndingEmail(
     'test@example.com',
     'Test User',
     'Pro Plan',
     9900, // $99.00
     'usd',
     '2025-01-30',
     3 // 3 days remaining
   )
   ```

3. **Check email received**
   - Subject: "Your Pro Plan Trial Ends in 3 days"
   - Body includes trial end date
   - Body includes pricing after trial
   - CTA to manage subscription

**Expected Result**: ✅ Trial reminder email sent correctly

---

### Test 8.2: Email Configuration Test
**Objective**: Verify email service is working

1. **Run email test script**
   ```bash
   # Create test script: scripts/test-email.js
   node scripts/test-email.js
   ```

2. **Or use API endpoint**
   ```bash
   curl -X POST http://localhost:3000/api/test-email \
     -H "Content-Type: application/json" \
     -d '{"email":"your-email@example.com"}'
   ```

3. **Check inbox**
   - Should receive test email
   - Verify formatting looks correct

**Expected Result**: ✅ Test email received successfully

---

## Test Suite 9: Error Handling

### Test 9.1: Invalid Card
**Objective**: Test declined card handling

1. **Use decline test card**
   - Card: `4000 0000 0000 0002`
2. **Attempt checkout**
3. **Verify error shown**
   - Stripe shows "Card declined" message
   - User stays on checkout page
   - Can retry with different card

**Expected Result**: ✅ Graceful error handling for declined cards

---

### Test 9.2: Webhook Signature Failure
**Objective**: Test webhook security

1. **Send invalid webhook**
   ```bash
   curl -X POST http://localhost:3000/api/webhooks/stripe \
     -H "Content-Type: application/json" \
     -H "stripe-signature: invalid_signature" \
     -d '{"type":"customer.subscription.created"}'
   ```

2. **Check logs**
   - Should see "Webhook signature verification failed"
   - Should return 400 status

**Expected Result**: ✅ Invalid webhooks rejected

---

## Test Suite 10: Production Readiness

### Test 10.1: Switch to Live Mode
**Objective**: Prepare for production launch

1. **Complete Stripe business verification**
   - Submit business details
   - Wait for approval

2. **Get live API keys**
   - Stripe Dashboard > Developers > API Keys
   - Toggle to "Live mode"
   - Copy live keys

3. **Re-run Stripe setup in live mode**
   ```bash
   # Set STRIPE_SECRET_KEY to live key in .env
   STRIPE_SECRET_KEY=sk_live_xxxxx node scripts/stripe-setup.js
   ```

4. **Update production environment**
   ```bash
   fly secrets set STRIPE_SECRET_KEY="sk_live_xxxxx"
   fly secrets set STRIPE_WEBHOOK_SECRET="whsec_live_xxxxx"
   # ... all price IDs with live_ prefix
   ```

5. **Configure live webhook**
   - Stripe Dashboard > Developers > Webhooks
   - Add endpoint: `https://ekaty.com/api/webhooks/stripe`
   - Copy new webhook secret

6. **Deploy to production**
   ```bash
   fly deploy
   ```

7. **Test with real card** (small amount)
   - Use personal card
   - Subscribe to Basic plan
   - Verify full flow works
   - Cancel immediately

**Expected Result**: ✅ Production environment ready for launch

---

## Troubleshooting

### Webhook Not Firing
```bash
# Check webhook endpoint
stripe webhooks list

# Check webhook events
stripe events list

# Test webhook manually
stripe trigger customer.subscription.created

# Check logs
stripe logs tail
```

### Database Not Updating
```bash
# Check Prisma connection
npx prisma db pull

# Check for errors in webhook handler
# Look at terminal output when webhook fires

# Check user exists
npx prisma studio
# Search for user by email
```

### Email Not Sending
```bash
# Check environment variables
echo $SENDGRID_API_KEY

# Test email service directly
node scripts/test-email.js

# Check SendGrid dashboard for blocked/bounced emails
```

### Payment Declining
```bash
# Use correct test cards:
# Success: 4242 4242 4242 4242
# Decline: 4000 0000 0000 0002
# Auth Required: 4000 0025 0000 3155

# Check Stripe Dashboard > Payments
# Look for decline reason
```

---

## Test Checklist Summary

### Before Launch ✅
- [ ] All environment variables configured
- [ ] Stripe products and prices created
- [ ] Webhooks configured and tested
- [ ] Email service configured and tested
- [ ] All subscription tiers tested
- [ ] Payment success flow tested
- [ ] Payment failure flow tested
- [ ] Upgrade/downgrade tested
- [ ] Cancellation flow tested
- [ ] Feature gating verified
- [ ] Admin dashboard functional
- [ ] Email notifications working
- [ ] Error handling verified
- [ ] Production environment ready
- [ ] Business verification complete
- [ ] Terms of service added
- [ ] Privacy policy added
- [ ] Refund policy defined

### Performance Benchmarks
- [ ] Checkout page loads < 2s
- [ ] Webhook response < 1s
- [ ] Database queries < 100ms
- [ ] Email delivery < 30s

### Security Checks
- [ ] Webhook signature validation enabled
- [ ] API keys in environment variables
- [ ] HTTPS enforced on production
- [ ] Row-level security on database
- [ ] Admin routes protected
- [ ] User data isolated by organization

---

**Total Test Cases**: 25+
**Estimated Testing Time**: 3-4 hours
**Prerequisites**: Stripe account, test mode enabled, local development environment

🚀 **Ready to accept real payments!**
