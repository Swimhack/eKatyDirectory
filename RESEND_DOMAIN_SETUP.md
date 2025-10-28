# Resend Domain Setup Guide for ekaty.com

## Current Email Setup

✅ **ekaty.com is using Microsoft 365/Outlook for email**
- MX Record: `ekaty-com.mail.protection.outlook.com`
- You're already receiving emails at james@ekaty.com
- Current SPF: `v=spf1 include:spf.protection.outlook.com -all`

## Goal

Send emails from **james@ekaty.com** via Resend while still receiving emails via Outlook.

---

## Step 1: Add Domain in Resend

1. Go to [Resend Dashboard](https://resend.com/domains)
2. Click **"Add Domain"**
3. Enter: `ekaty.com`
4. Click **"Add"**

Resend will provide you with DNS records to add.

---

## Step 2: DNS Records to Add

You'll need to add these DNS records (Resend will show you the exact values):

### A) DKIM Records (Authentication)
**Type:** TXT  
**Name:** Something like `resend._domainkey.ekaty.com`  
**Value:** A long string starting with `p=MII...`

### B) SPF Record (Sender Authentication)
**IMPORTANT:** You already have an SPF record. You need to **UPDATE** it, not add a new one.

**Current SPF:**
```
v=spf1 include:spf.protection.outlook.com -all
```

**Updated SPF (add Resend):**
```
v=spf1 include:spf.protection.outlook.com include:resend.com -all
```

**Where to update:**
- In your DNS provider (wherever ekaty.com DNS is managed)
- Find the existing TXT record with `v=spf1`
- Edit it to include `include:resend.com`

### C) Domain Verification (Optional)
**Type:** TXT  
**Name:** `@` or `ekaty.com`  
**Value:** Something like `resend-verify=abc123...`

---

## Step 3: Add DNS Records

### Where to Add Records?

Your DNS is likely managed at one of these places:
- **GoDaddy** (if domain registered there)
- **Cloudflare** (if using their DNS)
- **Namecheap** (if registered there)
- **Microsoft 365 Admin** (if Microsoft manages DNS)

### How to Add:

1. Log into your DNS provider
2. Go to DNS Management / DNS Settings
3. Add the records Resend provides
4. **Important:** Update (don't add) the SPF record

---

## Step 4: Verify in Resend

1. After adding DNS records, go back to Resend dashboard
2. Click **"Verify"** next to your domain
3. It may take a few minutes to 48 hours for DNS to propagate
4. Once verified, you'll see a green checkmark ✓

---

## Step 5: Update Your Code

Once verified, update the email sender in the code:

**From (current test setup):**
```typescript
from: 'eKaty Contact Form <onboarding@resend.dev>'
```

**To (production with verified domain):**
```typescript
from: 'eKaty <james@ekaty.com>'
```

---

## Testing Before Full Verification

You can test email sending right now using `onboarding@resend.dev`. This is already working!

1. Visit: https://ekaty.fly.dev/contact
2. Submit a form
3. Email arrives at james@ekaty.com (from onboarding@resend.dev)

---

## Important Notes

### ✅ Safe to Do:
- Adding DKIM TXT records (won't affect current email)
- Adding verification TXT records (won't affect current email)
- Updating SPF to include both Outlook and Resend

### ⚠️ Don't Change:
- Your MX record (keep Outlook for receiving emails)
- The `include:spf.protection.outlook.com` part of SPF

### 🔍 Check Your DNS Provider

Run this command to see your nameservers:
```powershell
nslookup -type=NS ekaty.com
```

This will tell you where your DNS is managed.

---

## Quick Start Commands

### Check current DNS:
```powershell
# Check MX (mail) records
nslookup -type=MX ekaty.com

# Check TXT (SPF, DKIM) records
nslookup -type=TXT ekaty.com

# Check nameservers
nslookup -type=NS ekaty.com
```

### After adding records, verify:
```powershell
# Check if new TXT records are live
nslookup -type=TXT resend._domainkey.ekaty.com
```

---

## Need Help?

1. **Find DNS Provider:** Run `nslookup -type=NS ekaty.com`
2. **Get Resend Records:** Go to https://resend.com/domains
3. **Questions?** Let me know what records Resend provides and I'll help you add them!
