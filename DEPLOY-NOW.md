# Manual Deployment Instructions

## Quick Deploy (Recommended)

Run this single command from the project directory:

```bash
flyctl deploy --remote-only --app ekaty
```

This will:
1. Build the app on Fly.io servers
2. Deploy to production
3. Take about 5-8 minutes

## If You Don't Have flyctl Installed

Install Fly.io CLI first:

**Windows (PowerShell):**
```powershell
iwr https://fly.io/install.ps1 -useb | iex
```

**Mac/Linux:**
```bash
curl -L https://fly.io/install.sh | sh
```

## After Installing flyctl

1. Login to Fly.io:
```bash
flyctl auth login
```

2. Deploy:
```bash
cd "C:\STRICKLAND\Strickland Technology Marketing\ekaty-25"
flyctl deploy --remote-only --app ekaty
```

## What's Wrong with GitHub Actions?

You MUST check this URL to see what's happening:
```
https://github.com/Swimhack/ekatyfinal2025/actions
```

Look for:
- ❌ Red X = Failed (click to see error logs)
- ⏳ Yellow circle = Still running (wait for it)
- ✅ Green check = Succeeded (but deployment still broken - check Fly.io)
- 🚫 No recent runs = Workflow didn't trigger (GitHub secrets might be missing)

## If GitHub Actions Shows "Failed"

Common issues:
1. **Missing secrets** - Check GitHub repo settings → Secrets and variables → Actions
   - Need: FLY_API_TOKEN
   - Need: NEXT_PUBLIC_SUPABASE_URL
   - Need: NEXT_PUBLIC_SUPABASE_ANON_KEY

2. **Build timeout** - The remote build might be too slow

3. **Fly.io authentication** - Token might have expired

## Verify Deployment Worked

After deploying, test these URLs:
- https://ekaty.fly.dev/partner (should load partnership page)
- https://ekaty.fly.dev/api/tiers (should return JSON)
- https://ekaty.fly.dev/admin/monetization/leads (should redirect to login)

If still 404, check Fly.io logs:
```bash
flyctl logs --app ekaty
```
