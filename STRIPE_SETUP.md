# Stripe Subscription Setup Guide

## 🎯 Overview

This system enables restaurant owners to claim their profiles via Stripe subscriptions with automated verification and admin approval workflows.

## 📋 Features Implemented

### ✅ Subscription Tiers
- **Owner Access** - $10/month: Profile management, review responses, events
- **Featured** - $99/month: Everything + featured placement
- **Premium** - $199/month: Everything + homepage banners

### ✅ Auto-Verification
- Email domain matching (e.g., owner@restaurant.com matches restaurant.com)
- Stripe payment verification
- Manual admin approval fallback

### ✅ Admin Controls
- View all claim requests at `/admin/claims`
- Approve/reject with notes
- View verification data
- Track subscription status

## 🚀 Setup Instructions

### 1. Create Stripe Products & Prices

Go to [Stripe Dashboard](https://dashboard.stripe.com/products) and create:

**Product 1: Restaurant Owner Access**
- Name: "Restaurant Owner Access"
- Description: "Manage your restaurant profile on eKaty"
- Price: $10/month recurring
- Copy the Price ID (starts with `price_`)

**Product 2: Featured Restaurant**
- Name: "Featured Restaurant"  
- Description: "Featured placement + all owner features"
- Price: $99/month recurring
- Copy the Price ID

**Product 3: Premium Restaurant**
- Name: "Premium Restaurant"
- Description: "Homepage banners + all features"
- Price: $199/month recurring
- Copy the Price ID

### 2. Configure Environment Variables

Add to your `.env` file:

```bash
# Stripe Keys
STRIPE_PUBLISHABLE_KEY=pk_live_51R9RpGAuYycpID5hykEKz1PLYpMC5f2xVcejaqipi31fCuAH4Yuwkxaz8oaTW1gxaZKFueKPfxBnj8zmsdhWICM7006c7mCTz2
STRIPE_SECRET_KEY=sk_live_YOUR_SECRET_KEY_HERE

# Price IDs from Step 1
STRIPE_PRICE_OWNER=price_1ABC123...
STRIPE_PRICE_FEATURED=price_1DEF456...
STRIPE_PRICE_PREMIUM=price_1GHI789...

# Will configure in Step 3
STRIPE_WEBHOOK_SECRET=whsec_...

# Base URL
NEXT_PUBLIC_BASE_URL=https://ekaty.fly.dev
```

### 3. Set Up Stripe Webhooks

1. Go to [Stripe Webhooks](https://dashboard.stripe.com/webhooks)
2. Click "Add endpoint"
3. Enter URL: `https://ekaty.fly.dev/api/stripe/webhooks`
4. Select events to listen for:
   - `checkout.session.completed`
   - `customer.subscription.created`
   - `customer.subscription.updated`
   - `customer.subscription.deleted`
   - `invoice.payment_succeeded`
   - `invoice.payment_failed`
5. Copy the "Signing secret" (starts with `whsec_`)
6. Add to `.env` as `STRIPE_WEBHOOK_SECRET`

### 4. Deploy to Fly.io

Set secrets on Fly.io:

```bash
fly secrets set STRIPE_SECRET_KEY=sk_live_...
fly secrets set STRIPE_WEBHOOK_SECRET=whsec_...
fly secrets set STRIPE_PRICE_OWNER=price_...
fly secrets set STRIPE_PRICE_FEATURED=price_...
fly secrets set STRIPE_PRICE_PREMIUM=price_...
```

### 5. Run Database Migration

```bash
npx prisma migrate dev --name add_subscriptions
npx prisma generate
```

## 🔄 User Flow

### Restaurant Owner Claims Profile

1. **Discovery**: Owner finds their restaurant on eKaty
2. **Claim**: Clicks "Claim This Profile" button
3. **Signup**: Creates account (if new user)
4. **Payment**: Redirected to Stripe Checkout ($10/mo)
5. **Verification**: 
   - ✅ Auto-approved if email domain matches website
   - ⏳ Manual review if no auto-verification
6. **Access**: Gets dashboard access immediately or after approval

### Admin Approval Workflow

1. Go to `/admin/claims`
2. View pending claims with verification data
3. Review restaurant details and user info
4. Approve or reject with notes
5. Owner gets access upon approval

## 🎨 Frontend Components Needed

### Add "Claim Profile" Button

Add to restaurant detail pages (`/app/restaurants/[slug]/page.tsx`):

```tsx
<button
  onClick={() => handleClaimProfile(restaurant.id)}
  className="px-6 py-3 bg-primary-600 text-white rounded-lg"
>
  🔒 Claim This Profile
</button>
```

### Claim Handler

```tsx
const handleClaimProfile = async (restaurantId: string) => {
  // Check if user is logged in
  if (!userId) {
    router.push('/auth/signin?redirect=/claim')
    return
  }

  // Create checkout session
  const response = await fetch('/api/stripe/create-checkout', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      userId,
      restaurantId,
      tier: 'owner' // or 'featured', 'premium'
    })
  })

  const { url } = await response.json()
  window.location.href = url // Redirect to Stripe
}
```

## 🔐 Security Features

### ✅ Implemented
- Stripe webhook signature verification
- Admin API key authentication
- User ownership verification
- Subscription status checks

### 🔒 Best Practices
- Never expose secret keys in frontend
- Validate all webhook events
- Check subscription status before granting access
- Log all admin actions

## 📊 Admin Dashboard

Access at: `https://ekaty.fly.dev/admin/claims`

Features:
- Filter by status (pending/approved/rejected)
- View verification data
- One-click approve/reject
- Add admin notes
- Track review history

## 🧪 Testing

### Test Mode
1. Use Stripe test keys for development
2. Test cards: `4242 4242 4242 4242` (any future date, any CVC)
3. Trigger webhooks manually in Stripe Dashboard

### Production
1. Use live keys
2. Test with real payment method
3. Monitor webhook logs in Stripe Dashboard

## 💰 Revenue Tracking

View in Stripe Dashboard:
- Monthly Recurring Revenue (MRR)
- Active subscriptions
- Churn rate
- Failed payments

## 🆘 Troubleshooting

### Webhook Not Receiving Events
- Check webhook URL is correct
- Verify endpoint is publicly accessible
- Check Stripe webhook logs for errors

### Auto-Verification Not Working
- Verify email domain extraction logic
- Check restaurant website URL format
- Review verification data in admin panel

### Payment Failing
- Check Stripe secret key is correct
- Verify price IDs match products
- Review Stripe logs for errors

## 📞 Support

For issues:
1. Check Stripe Dashboard logs
2. Review application logs
3. Test webhook endpoint manually
4. Contact Stripe support if needed

## 🎯 Next Steps

1. ✅ Create Stripe products
2. ✅ Configure environment variables
3. ✅ Set up webhooks
4. ✅ Deploy to Fly.io
5. ✅ Run database migration
6. ⏳ Add "Claim Profile" buttons to restaurant pages
7. ⏳ Test end-to-end flow
8. ⏳ Monitor first subscriptions
