#!/bin/bash

echo "======================================================================"
echo "eKaty Deployment Diagnostics"
echo "======================================================================"
echo ""

# Check git status
echo "[1] Git Status:"
echo "Current branch: $(git branch --show-current)"
echo "Latest commit: $(git log -1 --oneline)"
echo "Remote status:"
git fetch origin
git status -sb
echo ""

# Check GitHub Actions workflow file
echo "[2] GitHub Actions Configuration:"
if [ -f ".github/workflows/deploy.yml" ]; then
    echo "✓ Deploy workflow exists"
    echo "Triggers on branches:"
    grep -A 2 "branches:" .github/workflows/deploy.yml | head -4
else
    echo "✗ No deploy workflow found!"
fi
echo ""

# Check Dockerfile
echo "[3] Docker Configuration:"
if [ -f "Dockerfile" ]; then
    echo "✓ Dockerfile exists"
else
    echo "✗ Dockerfile missing!"
fi
echo ""

# Check fly.toml
echo "[4] Fly.io Configuration:"
if [ -f "fly.toml" ]; then
    echo "✓ fly.toml exists"
    echo "App name: $(grep 'app = ' fly.toml)"
    echo "Region: $(grep 'primary_region = ' fly.toml)"
else
    echo "✗ fly.toml missing!"
fi
echo ""

# Check build output
echo "[5] Local Build Status:"
if [ -d ".next/standalone" ]; then
    echo "✓ Standalone build exists"
    echo "Partner page: $([ -f ".next/standalone/.next/server/app/partner/page.js" ] && echo '✓ EXISTS' || echo '✗ MISSING')"
    echo "Admin leads: $([ -f ".next/standalone/.next/server/app/admin/monetization/leads/page.js" ] && echo '✓ EXISTS' || echo '✗ MISSING')"
    echo "Tiers API: $([ -f ".next/standalone/.next/server/app/api/tiers/route.js" ] && echo '✓ EXISTS' || echo '✗ MISSING')"
else
    echo "✗ No build output found - run 'npm run build' first"
fi
echo ""

# Check environment file
echo "[6] Environment Configuration:"
if [ -f ".env.local" ]; then
    echo "✓ .env.local exists"
    echo "NEXT_PUBLIC_SUPABASE_URL: $(grep -q 'NEXT_PUBLIC_SUPABASE_URL' .env.local && echo '✓ SET' || echo '✗ MISSING')"
    echo "NEXT_PUBLIC_SUPABASE_ANON_KEY: $(grep -q 'NEXT_PUBLIC_SUPABASE_ANON_KEY' .env.local && echo '✓ SET' || echo '✗ MISSING')"
    echo "RESEND_API_KEY: $(grep -q 'RESEND_API_KEY' .env.local && echo '✓ SET' || echo '✗ MISSING')"
else
    echo "⚠ .env.local not found (needed for local testing only)"
fi
echo ""

# Check Node.js version
echo "[7] Node.js Version:"
echo "Local: $(node --version)"
echo "Required: 18.x (per Dockerfile)"
echo ""

echo "======================================================================"
echo "Recommendations:"
echo "======================================================================"
echo ""
echo "1. Check GitHub Actions workflow at:"
echo "   https://github.com/Swimhack/ekatyfinal2025/actions"
echo ""
echo "2. If workflow failed, review error logs in GitHub Actions"
echo ""
echo "3. If workflow succeeded but still 404, check Fly.io deployment:"
echo "   flyctl logs --app ekaty"
echo "   flyctl status --app ekaty"
echo ""
echo "4. Manual deployment command:"
echo "   flyctl deploy --remote-only --app ekaty"
echo ""
echo "5. Test production endpoints:"
echo "   curl -I https://ekaty.com/partner"
echo "   curl -I https://ekaty.fly.dev/partner"
echo ""
