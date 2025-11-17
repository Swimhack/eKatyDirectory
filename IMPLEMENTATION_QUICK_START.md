# Quick Start Implementation Guide
## Hourly Monitoring & Critical Security Fixes

---

## 🚨 CRITICAL FIXES (Do First - 30 Minutes)

### 1. Remove Environment Files from Git (5 minutes)

```bash
cd "c:\STRICKLAND\Strickland Technology Marketing\ekaty.com-2025"

# Remove sensitive files from git (keeps local copies)
git rm --cached .env.production .env.stripe

# Commit and push
git commit -m "Security: Remove sensitive env files from version control"
git push

# Verify removal
git ls-files | grep .env
# Should only show: .env.example, blog_manager/.env.example
```

### 2. Update Next.js (10 minutes)

```bash
# Update Next.js to patch critical CVE
npm update next@14.2.33

# Test
npm test
npm run build

# Commit
git add package.json package-lock.json
git commit -m "Security: Update Next.js to 14.2.33 (fixes CVE-2025-XXXXX)"
git push
```

### 3. Fix Session Token Generation (15 minutes)

**File:** `app/api/auth/login/route.ts`

**Change this:**
```typescript
// ❌ WEAK
const sessionToken = `sess_${user.id}_${Date.now()}`
```

**To this:**
```typescript
// ✅ SECURE
import crypto from 'crypto'

const sessionToken = crypto.randomBytes(32).toString('hex')
```

**Full code:**
```typescript
import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import bcrypt from 'bcryptjs'
import crypto from 'crypto' // ADD THIS

export async function POST(request: NextRequest) {
  try {
    const { email, password } = await request.json()

    if (!email || !password) {
      return NextResponse.json(
        { error: 'Email and password are required' },
        { status: 400 }
      )
    }

    const normalizedEmail = email.toLowerCase()
    const user = await prisma.user.findUnique({
      where: { email: normalizedEmail }
    })

    if (!user) {
      return NextResponse.json(
        { error: 'Invalid email or password' },
        { status: 401 }
      )
    }

    const isValidPassword = await bcrypt.compare(password, user.passwordHash)

    if (!isValidPassword) {
      return NextResponse.json(
        { error: 'Invalid email or password' },
        { status: 401 }
      )
    }

    const response = NextResponse.json({
      success: true,
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
        role: user.role
      }
    })

    // CHANGE THIS LINE
    const sessionToken = crypto.randomBytes(32).toString('hex')

    response.cookies.set('ekaty_user_id', user.id, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 60 * 60 * 24 * 7
    })

    response.cookies.set('ekaty_session', sessionToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 60 * 60 * 24 * 7
    })

    response.cookies.set('ekaty_user_role', user.role, {
      httpOnly: false,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 60 * 60 * 24 * 7
    })

    return response
  } catch (error) {
    console.error('[auth/login] Login error', error)
    return NextResponse.json(
      { error: 'An error occurred during login' },
      { status: 500 }
    )
  }
}
```

**Test and deploy:**
```bash
npm run build
git add app/api/auth/login/route.ts
git commit -m "Security: Use crypto.randomBytes for session tokens"
git push
```

---

## ⚡ HOURLY MONITORING SETUP (15 Minutes)

### 1. Create Instrumentation File

**File:** `instrumentation.ts` (create in root if doesn't exist)

```typescript
import { initializeCronJobs } from '@/lib/cron'

export function register() {
  if (process.env.NEXT_RUNTIME === 'nodejs') {
    initializeCronJobs()
  }
}
```

### 2. Enable Instrumentation in Next.js Config

**File:** `next.config.js`

Add this if not present:
```javascript
module.exports = {
  // ... existing config
  experimental: {
    instrumentationHook: true,
  },
}
```

### 3. Deploy

```bash
git add instrumentation.ts next.config.js
git commit -m "Feature: Enable hourly restaurant monitoring"
git push
```

### 4. Verify After Deployment

Wait 5 minutes after deployment, then:

```bash
# Check monitoring status
curl -H "Authorization: Bearer $ADMIN_API_KEY" \
  https://ekaty.com/api/admin/monitoring/status | jq
```

**Expected response:**
```json
{
  "monitoring": {
    "status": "completed",
    "lastRun": "2025-11-17T20:00:00Z",
    "lastRunStats": {
      "checked": 50,
      "updated": 47,
      "failed": 3
    }
  },
  "statistics": {
    "staleRestaurants": 217,
    "apiUsage": {
      "today": 50,
      "limit": 45000,
      "remaining": 44950,
      "percentUsed": "0.1%"
    }
  },
  "health": {
    "isRunning": true,
    "hasQuota": true,
    "needsAttention": false
  }
}
```

---

## 📊 MONITORING DASHBOARD (Optional - 1 Hour)

Create a simple admin page to view monitoring status:

**File:** `app/admin/monitoring/page.tsx`

```typescript
'use client'

import { useEffect, useState } from 'react'

export default function MonitoringPage() {
  const [status, setStatus] = useState<any>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchStatus()
    const interval = setInterval(fetchStatus, 60000) // Refresh every minute
    return () => clearInterval(interval)
  }, [])

  async function fetchStatus() {
    try {
      const res = await fetch('/api/admin/monitoring/status', {
        headers: {
          'Authorization': `Bearer ${process.env.NEXT_PUBLIC_ADMIN_API_KEY}`
        }
      })
      const data = await res.json()
      setStatus(data)
    } catch (error) {
      console.error('Failed to fetch status:', error)
    } finally {
      setLoading(false)
    }
  }

  if (loading) return <div>Loading...</div>

  return (
    <div className="p-8">
      <h1 className="text-3xl font-bold mb-8">Restaurant Monitoring</h1>

      {/* Status Card */}
      <div className="bg-white shadow rounded-lg p-6 mb-6">
        <h2 className="text-xl font-semibold mb-4">Current Status</h2>
        <div className="grid grid-cols-3 gap-4">
          <div>
            <p className="text-gray-600">Status</p>
            <p className="text-2xl font-bold">{status?.monitoring?.status}</p>
          </div>
          <div>
            <p className="text-gray-600">Last Run</p>
            <p className="text-lg">{new Date(status?.monitoring?.lastRun).toLocaleString()}</p>
          </div>
          <div>
            <p className="text-gray-600">Last Update</p>
            <p className="text-lg">{status?.monitoring?.lastRunStats?.updated} restaurants</p>
          </div>
        </div>
      </div>

      {/* Statistics Card */}
      <div className="bg-white shadow rounded-lg p-6 mb-6">
        <h2 className="text-xl font-semibold mb-4">24-Hour Statistics</h2>
        <div className="grid grid-cols-4 gap-4">
          <div>
            <p className="text-gray-600">Runs</p>
            <p className="text-2xl font-bold">{status?.statistics?.last24Hours?.runs}</p>
          </div>
          <div>
            <p className="text-gray-600">Checked</p>
            <p className="text-2xl font-bold">{status?.statistics?.last24Hours?.checked}</p>
          </div>
          <div>
            <p className="text-gray-600">Updated</p>
            <p className="text-2xl font-bold text-green-600">{status?.statistics?.last24Hours?.updated}</p>
          </div>
          <div>
            <p className="text-gray-600">Success Rate</p>
            <p className="text-2xl font-bold">{status?.statistics?.last24Hours?.successRate}</p>
          </div>
        </div>
      </div>

      {/* API Quota Card */}
      <div className="bg-white shadow rounded-lg p-6 mb-6">
        <h2 className="text-xl font-semibold mb-4">API Quota</h2>
        <div className="grid grid-cols-3 gap-4">
          <div>
            <p className="text-gray-600">Today's Usage</p>
            <p className="text-2xl font-bold">{status?.statistics?.apiUsage?.today?.toLocaleString()}</p>
          </div>
          <div>
            <p className="text-gray-600">Remaining</p>
            <p className="text-2xl font-bold">{status?.statistics?.apiUsage?.remaining?.toLocaleString()}</p>
          </div>
          <div>
            <p className="text-gray-600">Percent Used</p>
            <p className="text-2xl font-bold">{status?.statistics?.apiUsage?.percentUsed}</p>
          </div>
        </div>
        <div className="mt-4">
          <div className="w-full bg-gray-200 rounded-full h-4">
            <div
              className="bg-blue-600 h-4 rounded-full"
              style={{ width: status?.statistics?.apiUsage?.percentUsed }}
            />
          </div>
        </div>
      </div>

      {/* Health Status */}
      <div className="bg-white shadow rounded-lg p-6">
        <h2 className="text-xl font-semibold mb-4">Health Status</h2>
        <div className="space-y-2">
          <div className="flex items-center">
            <span className={`w-3 h-3 rounded-full mr-3 ${status?.health?.isRunning ? 'bg-green-500' : 'bg-red-500'}`} />
            <span>Monitoring Running: {status?.health?.isRunning ? 'Yes' : 'No'}</span>
          </div>
          <div className="flex items-center">
            <span className={`w-3 h-3 rounded-full mr-3 ${status?.health?.hasQuota ? 'bg-green-500' : 'bg-yellow-500'}`} />
            <span>API Quota Available: {status?.health?.hasQuota ? 'Yes' : 'Low'}</span>
          </div>
          <div className="flex items-center">
            <span className={`w-3 h-3 rounded-full mr-3 ${!status?.health?.needsAttention ? 'bg-green-500' : 'bg-red-500'}`} />
            <span>Needs Attention: {status?.health?.needsAttention ? 'Yes' : 'No'}</span>
          </div>
        </div>
      </div>

      {/* Stale Restaurants */}
      <div className="bg-white shadow rounded-lg p-6 mt-6">
        <h2 className="text-xl font-semibold mb-4">Queue Status</h2>
        <p className="text-gray-600">Restaurants awaiting update:</p>
        <p className="text-3xl font-bold text-orange-600">{status?.statistics?.staleRestaurants}</p>
        <p className="text-sm text-gray-500 mt-2">
          Estimated time to refresh all: {Math.ceil(status?.statistics?.staleRestaurants / 50)} hours
        </p>
      </div>
    </div>
  )
}
```

---

## 🧪 TESTING LOCALLY

### Test Hourly Monitoring

```bash
# Start cron jobs in development
npx tsx scripts/start-cron-jobs.ts
```

Output should show:
```
============================================================
🚀 STARTING CRON JOBS
============================================================
⏰ Starting daily restaurant sync cron job
📅 Schedule: 0 3 * * * (3 AM daily)
✅ Daily sync cron job started successfully
⏰ Starting hourly restaurant monitoring
📅 Schedule: 0 * * * * (every hour)
📊 Batch size: 50 restaurants/hour
✅ Hourly monitoring started successfully
============================================================
✅ All cron jobs started successfully
============================================================

⏰ Cron jobs are running. Press Ctrl+C to stop.
```

### Trigger Manual Run

In another terminal:
```bash
curl -X POST \
  -H "Authorization: Bearer your-secret-admin-key" \
  http://localhost:3000/api/admin/monitoring/status

# Check status
curl -H "Authorization: Bearer your-secret-admin-key" \
  http://localhost:3000/api/admin/monitoring/status | jq
```

### Run Audits

```bash
# Data quality audit
npx tsx scripts/audit-restaurant-data.ts

# Security audit
npx tsx scripts/security-audit.ts
```

---

## ✅ DEPLOYMENT CHECKLIST

### Pre-Deployment
- [ ] ✅ Removed .env files from git
- [ ] ✅ Updated Next.js to 14.2.33
- [ ] ✅ Fixed session token generation
- [ ] ✅ Created instrumentation.ts
- [ ] ✅ Enabled instrumentationHook in next.config.js
- [ ] ✅ All tests pass (`npm test`)
- [ ] ✅ Build successful (`npm run build`)

### Deployment
- [ ] Push to git repository
- [ ] Deploy to Fly.io (or your platform)
- [ ] Verify deployment successful
- [ ] Wait 5 minutes for first cron run

### Post-Deployment
- [ ] Check `/api/admin/monitoring/status`
- [ ] Verify hourly monitoring running
- [ ] Check AuditLog for HOURLY_MONITORING entries
- [ ] Monitor for 24 hours
- [ ] Verify restaurants being updated

---

## 📞 TROUBLESHOOTING

### Monitoring Not Running

**Check logs:**
```bash
# Fly.io
fly logs

# Vercel
vercel logs

# Local
Check terminal output
```

**Common issues:**
1. `instrumentationHook` not enabled in next.config.js
2. `instrumentation.ts` not created
3. ADMIN_API_KEY not set in production
4. GOOGLE_MAPS_API_KEY missing or invalid

### API Quota Exceeded

**Check usage:**
```bash
curl -H "Authorization: Bearer $ADMIN_API_KEY" \
  https://ekaty.com/api/admin/monitoring/status
```

**Solutions:**
- Reduce batch size in `lib/cron/hourly-monitoring.ts`
- Increase `staleThresholdDays` (less frequent updates)
- Check for runaway processes

### High Failure Rate

**Check AuditLog:**
```sql
SELECT * FROM audit_logs
WHERE action IN ('MONITORING_FAILED', 'MONITORING_HIGH_FAILURE')
ORDER BY created_at DESC
LIMIT 10;
```

**Common causes:**
- Google API key invalid/expired
- Network issues
- Rate limiting
- Invalid sourceId in database

---

## 🔗 USEFUL LINKS

- **Full Report:** `BACKEND_SECURITY_AUDIT_REPORT.md`
- **Monitoring Status:** `https://ekaty.com/api/admin/monitoring/status`
- **Daily Sync:** Runs automatically at 3 AM CST
- **Hourly Monitoring:** Runs every hour on the hour

---

## ⏱️ ESTIMATED TIME

- **Critical fixes:** 30 minutes
- **Monitoring setup:** 15 minutes
- **Testing:** 15 minutes
- **Total:** ~1 hour

---

**Last Updated:** November 17, 2025
