# ⚡ Quick Start - Monetization in 10 Minutes

## Prerequisites
- [ ] Stripe account created
- [ ] Node.js 18+ installed
- [ ] PostgreSQL database running

---

## Step 1: Configure Environment (3 minutes)

```bash
# Run interactive setup wizard
node scripts/setup-env.js
```

**OR manually create `.env`:**
```env
# Stripe (Get from https://dashboard.stripe.com/apikeys)
STRIPE_SECRET_KEY="sk_test_xxxxx"
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY="pk_test_xxxxx"
STRIPE_WEBHOOK_SECRET="whsec_xxxxx"

# Email (Get from https://sendgrid.com)
EMAIL_PROVIDER="sendgrid"
SENDGRID_API_KEY="SG.xxxxx"
EMAIL_FROM="billing@ekaty.com"

# Database
DATABASE_URL="postgresql://user:pass@localhost:5432/ekaty"
```

---

## Step 2: Create Stripe Products (2 minutes)

```bash
# Automated setup - creates everything
node scripts/stripe-setup.js

# Outputs:
# ✓ Created product: Basic Plan
# ✓ Created product: Pro Plan
# ✓ Created product: Premium Plan
# ✓ Created webhook endpoint
# ✓ Generated price IDs

# Copy price IDs to .env
```

---

## Step 3: Start Development (2 minutes)

```bash
# Terminal 1: Forward webhooks to localhost
stripe listen --forward-to localhost:3000/api/webhooks/stripe

# Terminal 2: Start Next.js dev server
npm run dev
```

---

## Step 4: Test Checkout (3 minutes)

### Test Basic Plan
1. Open http://localhost:3000/pricing
2. Click "Get Started" on Basic Plan
3. Fill checkout form:
   - Email: `test@example.com`
   - Card: `4242 4242 4242 4242`
   - Expiry: `12/25`
   - CVC: `123`
4. Complete checkout
5. Check Terminal 1 for webhook event
6. Verify at http://localhost:3000/owner/subscription

### Test Restaurant Claim
1. Open any restaurant page
2. Find "Claim Restaurant" card
3. Select tier and checkout
4. Verify subscription created

---

## ✅ Verification Checklist

- [ ] Checkout redirects to Stripe
- [ ] Webhook event received in Terminal 1
- [ ] Database updated (`npx prisma studio`)
- [ ] Email sent (check inbox/SendGrid logs)
- [ ] User dashboard shows subscription
- [ ] Admin dashboard shows stats

---

## 🔥 Common Test Cards

| Card Number | Result |
|------------|--------|
| `4242 4242 4242 4242` | Success |
| `4000 0000 0000 0002` | Decline |
| `4000 0025 0000 3155` | Requires authentication |

---

## 📂 Key Files

| File | Purpose |
|------|---------|
| `/app/pricing/page.tsx` | Pricing page |
| `/app/api/webhooks/stripe/route.ts` | Webhook handler |
| `/lib/subscriptions.ts` | Feature gating |
| `/components/ClaimRestaurantCard.tsx` | Claim UI |
| `/app/admin/subscriptions/page.tsx` | Admin dashboard |

---

## 🚀 Going Live

```bash
# 1. Switch Stripe to live mode
# Get live keys from dashboard

# 2. Re-run setup with live keys
STRIPE_SECRET_KEY=sk_live_xxxxx node scripts/stripe-setup.js

# 3. Update production secrets
fly secrets set STRIPE_SECRET_KEY="sk_live_xxxxx"
fly secrets set STRIPE_WEBHOOK_SECRET="whsec_live_xxxxx"
# ... (all price IDs)

# 4. Configure live webhook
# Add endpoint in Stripe Dashboard:
# https://ekaty.com/api/webhooks/stripe

# 5. Deploy
fly deploy

# 6. Test with real card (cancel immediately)
```

---

## 📊 Monitor Revenue

### Admin Dashboard
http://localhost:3000/admin/subscriptions

### Stripe Dashboard
https://dashboard.stripe.com

### Metrics to Track
- MRR (Monthly Recurring Revenue)
- Active subscriptions
- Conversion rate
- Churn rate

---

## 🆘 Troubleshooting

### Webhook Not Firing
```bash
# Check webhook is running
stripe listen --forward-to localhost:3000/api/webhooks/stripe

# Test manually
stripe trigger checkout.session.completed
```

### Payment Declining
```bash
# Use correct test card
4242 4242 4242 4242

# Check Stripe logs
stripe logs tail
```

### Email Not Sending
```bash
# Verify environment variable
echo $SENDGRID_API_KEY

# Test email service
curl -X POST http://localhost:3000/api/test-email
```

---

## 📖 Full Documentation

- **Setup Guide**: [MONETIZATION-SETUP.md](MONETIZATION-SETUP.md) - 60-minute detailed guide
- **Testing Guide**: [TESTING-GUIDE.md](TESTING-GUIDE.md) - 25+ test cases
- **Feature Overview**: [MONETIZATION-COMPLETE.md](MONETIZATION-COMPLETE.md) - Complete feature list

---

## 💰 Pricing Tiers

| Tier | Price | Target |
|------|-------|--------|
| Basic | $49/mo | Small restaurants |
| Pro | $99/mo | Growing restaurants |
| Premium | $199/mo | Established chains |
| Owner Claim | $10/mo | Ownership verification |
| Featured Claim | $99/mo | Enhanced visibility |

All include 14-day free trial!

---

## 🎯 Revenue Goals

| Subscribers | MRR | ARR |
|------------|-----|-----|
| 10 | $820 | $9,840 |
| 25 | $2,050 | $24,600 |
| 50 | $4,100 | $49,200 |
| 100 | $8,200 | $98,400 |

*Assumes $82/mo average across tiers*

---

**That's it! You're ready to accept payments.** 🎉

Questions? Check the full guides or email billing@ekaty.com
