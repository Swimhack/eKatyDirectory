# 🚀 Production Deployment Checklist

## Pre-Deployment

### 1. Stripe Setup
- [ ] Complete Stripe business verification
- [ ] Switch to Live mode in Stripe Dashboard
- [ ] Get live API keys (sk_live_ and pk_live_)
- [ ] Run setup script with live keys: `STRIPE_SECRET_KEY=sk_live_xxx node scripts/stripe-setup.js`
- [ ] Save all 9 live price IDs
- [ ] Create live webhook endpoint in Stripe Dashboard
- [ ] Point webhook to: `https://ekaty.com/api/webhooks/stripe`
- [ ] Copy live webhook secret (whsec_live_)

### 2. Email Service
- [ ] SendGrid account verified and production-ready
- [ ] Domain verification complete (SPF/DKIM records)
- [ ] From email address verified
- [ ] Production API key obtained
- [ ] Test email delivery to multiple providers (Gmail, Outlook, Yahoo)

### 3. Database
- [ ] Production database provisioned
- [ ] Connection pooling configured
- [ ] Backups enabled (daily minimum)
- [ ] SSL/TLS enabled
- [ ] Row-level security verified
- [ ] Indexes optimized

### 4. Security
- [ ] All API keys in environment variables (not in code)
- [ ] HTTPS enforced on all routes
- [ ] Webhook signature verification enabled
- [ ] Admin routes protected with authentication
- [ ] Rate limiting configured
- [ ] Security headers set (HSTS, CSP, etc.)

### 5. Legal & Compliance
- [ ] Terms of Service published at /terms
- [ ] Privacy Policy published at /privacy
- [ ] Refund Policy defined and published
- [ ] Cookie consent banner (if EU visitors)
- [ ] GDPR compliance reviewed
- [ ] PCI compliance (handled by Stripe)

---

## Deployment Steps

### Step 1: Configure Production Environment
```bash
# Create production .env file
cp .env .env.production

# Update with live credentials
vim .env.production
```

**Production Environment Variables:**
```env
# Stripe LIVE keys
STRIPE_SECRET_KEY="sk_live_xxxxxxxxxxxxxxxxxxxxx"
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY="pk_live_xxxxxxxxxxxxxxxxxxxxx"
STRIPE_WEBHOOK_SECRET="whsec_live_xxxxxxxxxxxxxxxxxxxxx"

# Live Price IDs
NEXT_PUBLIC_STRIPE_PRICE_BASIC_MONTHLY="price_xxxxx"
NEXT_PUBLIC_STRIPE_PRICE_BASIC_ANNUAL="price_xxxxx"
NEXT_PUBLIC_STRIPE_PRICE_PRO_MONTHLY="price_xxxxx"
NEXT_PUBLIC_STRIPE_PRICE_PRO_ANNUAL="price_xxxxx"
NEXT_PUBLIC_STRIPE_PRICE_PREMIUM_MONTHLY="price_xxxxx"
NEXT_PUBLIC_STRIPE_PRICE_PREMIUM_ANNUAL="price_xxxxx"
NEXT_PUBLIC_STRIPE_PRICE_OWNER="price_xxxxx"
NEXT_PUBLIC_STRIPE_PRICE_FEATURED="price_xxxxx"
NEXT_PUBLIC_STRIPE_PRICE_PREMIUM_CLAIM="price_xxxxx"

# Email
EMAIL_PROVIDER="sendgrid"
SENDGRID_API_KEY="SG.live_xxxxxxxxxxxxxxxxxxxxx"
EMAIL_FROM="billing@ekaty.com"

# Database
DATABASE_URL="postgresql://user:pass@production-db:5432/ekaty?sslmode=require"

# NextAuth
NEXTAUTH_SECRET="production_secret_from_openssl_rand_base64_32"
NEXTAUTH_URL="https://ekaty.com"
```

### Step 2: Set Fly.io Secrets
```bash
# Import all secrets at once
fly secrets import < .env.production

# Or set individually
fly secrets set STRIPE_SECRET_KEY="sk_live_xxxxx"
fly secrets set STRIPE_WEBHOOK_SECRET="whsec_live_xxxxx"
fly secrets set SENDGRID_API_KEY="SG.xxxxx"
# ... (repeat for all secrets)

# Verify secrets are set
fly secrets list
```

### Step 3: Database Migration
```bash
# Run production migrations
fly ssh console -C "npx prisma migrate deploy"

# Verify migration status
fly ssh console -C "npx prisma migrate status"

# Seed database if needed
fly ssh console -C "npx prisma db seed"
```

### Step 4: Deploy Application
```bash
# Build and deploy
fly deploy

# Monitor deployment
fly logs

# Check status
fly status

# Open in browser
fly open
```

### Step 5: Configure Stripe Webhook
1. Go to https://dashboard.stripe.com/webhooks
2. Click "Add endpoint"
3. URL: `https://ekaty.com/api/webhooks/stripe`
4. Events to send:
   - `checkout.session.completed`
   - `customer.subscription.created`
   - `customer.subscription.updated`
   - `customer.subscription.deleted`
   - `invoice.payment_succeeded`
   - `invoice.payment_failed`
5. Click "Add endpoint"
6. Copy signing secret
7. Update Fly secret: `fly secrets set STRIPE_WEBHOOK_SECRET="whsec_live_xxxxx"`

### Step 6: Test Production Webhook
```bash
# From Stripe Dashboard, click "Send test webhook"
# Or use Stripe CLI
stripe trigger checkout.session.completed --stripe-version 2024-12-18.acacia

# Check logs
fly logs
```

---

## Post-Deployment Testing

### Critical Path Testing
- [ ] Visit https://ekaty.com
- [ ] Navigate to /pricing
- [ ] Click "Get Started" on Basic plan
- [ ] Complete checkout with REAL card (use personal card)
- [ ] Verify webhook received (check logs: `fly logs`)
- [ ] Verify email received
- [ ] Visit /owner/subscription - verify shows subscription
- [ ] Visit /api/stripe/portal - verify portal loads
- [ ] IMMEDIATELY cancel subscription in portal
- [ ] Verify cancellation confirmation

### Secondary Testing
- [ ] Test Pro plan checkout
- [ ] Test Premium plan checkout
- [ ] Test restaurant claim flow
- [ ] Test payment method update in portal
- [ ] Test subscription upgrade
- [ ] Test admin dashboard: /admin/subscriptions
- [ ] Test feature gating (free vs paid)

### Monitoring Setup
- [ ] Add Stripe webhook to monitoring
- [ ] Set up Sentry error tracking
- [ ] Configure uptime monitoring (Pingdom, UptimeRobot)
- [ ] Set up revenue alerts (Stripe)
- [ ] Create dashboard for key metrics

---

## Launch Day

### Morning (8 AM)
- [ ] Verify all systems operational
- [ ] Check webhook endpoint responding
- [ ] Test email delivery
- [ ] Review Stripe dashboard for any issues
- [ ] Prepare support email monitoring

### Marketing Launch (10 AM)
- [ ] Send announcement email to restaurant list (249 contacts)
- [ ] Post on social media
- [ ] Update website banner
- [ ] Enable pricing page CTAs

### Throughout Day
- [ ] Monitor Stripe Dashboard for signups
- [ ] Watch webhook logs for errors
- [ ] Respond to support emails < 1 hour
- [ ] Track conversion metrics
- [ ] Note any issues in log

### Evening (6 PM)
- [ ] Review day's metrics
- [ ] Address any issues encountered
- [ ] Plan next day's activities
- [ ] Send summary to stakeholders

---

## Monitoring & Alerts

### Key Metrics to Track
| Metric | Tool | Alert Threshold |
|--------|------|----------------|
| Signups | Stripe Dashboard | Daily email summary |
| MRR | Stripe Dashboard | Check weekly |
| Failed Payments | Stripe | Alert if > 5/day |
| Webhook Errors | Fly.io Logs | Alert immediately |
| Email Bounces | SendGrid | Alert if > 10% |
| Page Load Time | Vercel/Fly | Alert if > 3s |
| Uptime | Pingdom | Alert if down > 1 min |

### Daily Checks (10 minutes)
1. Stripe Dashboard - Check new subscriptions
2. Fly.io Logs - Look for errors
3. SendGrid - Check email delivery rate
4. Support Inbox - Respond to inquiries
5. Admin Dashboard - Review stats

### Weekly Review (30 minutes)
1. Revenue trends - Up or down?
2. Conversion rate - Optimizations needed?
3. Churn analysis - Why are users canceling?
4. Feature adoption - What's being used?
5. Support tickets - Common issues?

---

## Rollback Plan

### If Critical Issues Occur

#### Option 1: Quick Fix
```bash
# Fix code locally
# Deploy immediately
fly deploy

# Monitor logs
fly logs
```

#### Option 2: Rollback to Previous Version
```bash
# List deployments
fly releases

# Rollback to previous version
fly releases rollback <version>

# Verify rollback
fly status
```

#### Option 3: Disable Monetization (Emergency)
```bash
# Temporarily disable pricing page
# Update /app/pricing/page.tsx to show maintenance message

# Or set feature flag
fly secrets set MONETIZATION_ENABLED="false"
```

---

## Common Issues & Solutions

### Issue: Webhook Not Receiving Events
**Symptoms**: Subscriptions created but database not updating

**Solutions**:
1. Check webhook URL in Stripe Dashboard
2. Verify endpoint is accessible: `curl https://ekaty.com/api/webhooks/stripe`
3. Check webhook secret matches
4. Review logs: `fly logs`

### Issue: Payment Declining
**Symptoms**: Users report card won't process

**Solutions**:
1. Check Stripe Dashboard for decline reason
2. Verify test mode disabled
3. Check 3D Secure requirements
4. Review risk/fraud settings

### Issue: Emails Not Sending
**Symptoms**: No confirmation emails received

**Solutions**:
1. Check SendGrid API key valid
2. Verify from address authenticated
3. Check SPF/DKIM records
4. Review email logs in SendGrid

### Issue: High Churn Rate
**Symptoms**: Many cancellations after trial

**Solutions**:
1. Survey canceled users
2. Review feature adoption metrics
3. Improve onboarding experience
4. Add retention campaigns

---

## Success Criteria

### Week 1 Goals
- [ ] 5+ trial signups
- [ ] 0 critical errors
- [ ] < 2 hour support response time
- [ ] 100% webhook reliability
- [ ] 98%+ email delivery rate

### Month 1 Goals
- [ ] 25+ subscribers (10% of 249 target)
- [ ] $2,000+ MRR
- [ ] < 5% churn rate
- [ ] 10%+ conversion rate
- [ ] 95%+ customer satisfaction

### Quarter 1 Goals
- [ ] 50+ subscribers (20% of target)
- [ ] $4,000+ MRR
- [ ] Break-even on costs
- [ ] Positive customer reviews
- [ ] Expand to annual plans

---

## Post-Launch Optimization

### A/B Tests to Run
1. **Pricing tiers** - Test $39/$79/$149 vs $49/$99/$199
2. **Trial length** - Test 7 vs 14 vs 30 days
3. **CTA copy** - "Start Free Trial" vs "Get Started"
4. **Annual discount** - Test 15% vs 20% vs 25% off
5. **Feature positioning** - Which features to highlight

### Features to Add
1. **Usage analytics** - Show value delivered to customers
2. **Referral program** - Incentivize word-of-mouth
3. **API access** - For enterprise tier
4. **White-label** - For large restaurant groups
5. **Annual plans** - Improve retention

### Conversion Optimizations
1. Add social proof to pricing page
2. Create comparison table
3. Add live chat support
4. Offer onboarding call for Premium
5. Create video testimonials

---

## Emergency Contacts

### Technical Issues
- **Developer**: [Your contact]
- **Fly.io Support**: https://fly.io/docs/support/
- **Stripe Support**: https://support.stripe.com

### Business Issues
- **Payment Processing**: billing@ekaty.com
- **Customer Support**: support@ekaty.com
- **Legal Questions**: legal@ekaty.com

### Escalation Path
1. Check logs and documentation first
2. Search Stripe/Fly.io docs
3. Post in community forums
4. Contact support (include logs/screenshots)
5. Escalate to engineering team if critical

---

## Documentation Updates

After launch, update these docs:
- [ ] Add actual conversion rates to projections
- [ ] Document any issues encountered
- [ ] Update troubleshooting guide with solutions
- [ ] Add customer testimonials
- [ ] Create internal runbook

---

## Celebration! 🎉

Once deployed and first payment received:
- [ ] Notify team of successful launch
- [ ] Share milestone on social media
- [ ] Document lessons learned
- [ ] Plan growth strategy
- [ ] Celebrate with team!

---

**You've got this!** This checklist ensures a smooth, successful launch.

*Last updated: ${new Date().toISOString().split('T')[0]}*
