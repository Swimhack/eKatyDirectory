# eKaty Deployment Guide

## 🚀 Production Deployment

The eKaty app is deployed to **Fly.io** at [https://ekaty.fly.dev](https://ekaty.fly.dev)

## 📋 Prerequisites

- [Fly.io CLI](https://fly.io/docs/hands-on/install-flyctl/) installed
- Fly.io account with access to the `ekaty` app
- Node.js 18+ installed locally
- Environment variables configured

## 🔧 Environment Setup

### Required Environment Variables

The following environment variables must be set in Fly.io:

```bash
# Supabase Configuration (Set as build args during deployment)
NEXT_PUBLIC_SUPABASE_URL=https://xlelbtiigxiodsbrqtgkls.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_anon_key_here
NEXT_PUBLIC_APP_URL=https://ekaty.fly.dev

# Optional: Supabase Service Role (if using admin features)
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key_here
```

### Setting Secrets in Fly.io

```bash
# Set secrets (runtime environment variables)
flyctl secrets set SUPABASE_SERVICE_ROLE_KEY=your_service_role_key_here --app ekaty

# Build args must be passed during deployment
flyctl deploy --build-arg NEXT_PUBLIC_SUPABASE_URL=your_url \
              --build-arg NEXT_PUBLIC_SUPABASE_ANON_KEY=your_key \
              --build-arg NEXT_PUBLIC_APP_URL=https://ekaty.fly.dev
```

## 🎯 Manual Deployment

### 1. Deploy to Fly.io

```bash
# Navigate to project directory
cd "C:\STRICKLAND\Strickland Technology Marketing\ekaty-25"

# Deploy with build arguments
flyctl deploy --remote-only \
  --build-arg NEXT_PUBLIC_SUPABASE_URL=https://xlelbtiigxiodsbrqtgkls.supabase.co \
  --build-arg NEXT_PUBLIC_SUPABASE_ANON_KEY=your_key \
  --build-arg NEXT_PUBLIC_APP_URL=https://ekaty.fly.dev \
  --app ekaty
```

### 2. Verify Deployment

After deployment, run the verification script:

```bash
npm run verify-deployment
```

This will:
- Check if the homepage loads correctly
- Test mobile responsiveness
- Verify API endpoints
- Capture screenshots
- Generate a verification report

## 🤖 Automated CI/CD with GitHub Actions

### Setup

The repository includes a GitHub Actions workflow that automatically:
1. ✅ Type checks the code
2. ✅ Lints the code
3. ✅ Builds the app locally for testing
4. 🚀 Deploys to Fly.io
5. ⏳ Waits for deployment to stabilize
6. 🧪 Runs Puppeteer verification tests
7. 📸 Captures and uploads screenshots
8. 📊 Generates deployment reports

### Required GitHub Secrets

Set these secrets in your GitHub repository settings:

```
FLY_API_TOKEN=your_fly_api_token
NEXT_PUBLIC_SUPABASE_URL=https://xlelbtiigxiodsbrqtgkls.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_anon_key
```

To get your Fly API token:
```bash
flyctl auth token
```

### Triggering Deployments

The workflow runs automatically when you:
- Push to the `main` or `master` branch
- Manually trigger via GitHub Actions UI

```bash
# Push changes to trigger deployment
git add .
git commit -m "feat: your changes"
git push origin master
```

## 📊 Verification Scripts

### Available Scripts

```bash
# Full deployment verification
npm run verify-deployment

# Mobile-first verification
npm run verify-mobile

# Combined: Deploy and verify
npm run deploy-verify
```

### Verification Tests

The Puppeteer scripts test:
- ✅ Homepage loads with 200 status
- ✅ All key UI elements present
- ✅ Mobile viewport rendering
- ✅ API endpoints return data
- ✅ Performance metrics
- 📸 Visual regression via screenshots

## 🔍 Monitoring

### Check App Status

```bash
# View app status
flyctl status --app ekaty

# View logs
flyctl logs --app ekaty

# View machines
flyctl machine list --app ekaty

# SSH into a machine
flyctl ssh console --app ekaty
```

### View in Dashboard

Visit [https://fly.io/apps/ekaty/monitoring](https://fly.io/apps/ekaty/monitoring)

## 🛠️ Troubleshooting

### App Not Starting

1. Check logs:
   ```bash
   flyctl logs --app ekaty
   ```

2. Verify build arguments were passed correctly

3. Restart machines:
   ```bash
   flyctl machine restart <machine-id> --app ekaty
   ```

### Database Connection Issues

1. Verify Supabase URL and keys are correct
2. Check that Supabase project is accessible
3. Verify environment variables are set in Fly.io

### Deployment Failures

1. Check if build completed successfully
2. Verify Dockerfile syntax
3. Ensure all dependencies are in package.json
4. Check Fly.io build logs

### Clean Slate Deployment

If you need to start fresh:

```bash
# Destroy all machines
flyctl machine list --app ekaty
flyctl machine destroy <machine-id> --app ekaty --force

# Deploy fresh
flyctl deploy --remote-only \
  --build-arg NEXT_PUBLIC_SUPABASE_URL=your_url \
  --build-arg NEXT_PUBLIC_SUPABASE_ANON_KEY=your_key \
  --build-arg NEXT_PUBLIC_APP_URL=https://ekaty.fly.dev \
  --app ekaty
```

## 🎨 Architecture

### Docker Multi-Stage Build

The app uses a multi-stage Docker build for optimal production size:

1. **Base**: Node 18 Alpine
2. **Deps**: Install dependencies
3. **Builder**: Build Next.js app with standalone output
4. **Runner**: Minimal production image (~44 MB)

### Next.js Configuration

- **Output**: `standalone` - Optimized for production
- **Image Optimization**: Configured for Supabase storage
- **Compression**: Enabled
- **Server Components**: Optimized with Supabase external packages

### Fly.io Configuration

- **Region**: Dallas (DFW) - Central US for optimal latency
- **Auto-scaling**: 
  - Min machines: 1
  - Auto-stop: Suspend when idle
  - Auto-start: On incoming requests
- **Memory**: 1GB per machine
- **CPU**: Shared CPU, 1 core

## 📚 Additional Resources

- [Fly.io Documentation](https://fly.io/docs/)
- [Next.js Deployment](https://nextjs.org/docs/deployment)
- [Supabase Documentation](https://supabase.com/docs)
- [GitHub Actions](https://docs.github.com/en/actions)

## 🆘 Support

For deployment issues:
1. Check the logs first: `flyctl logs --app ekaty`
2. Review the deployment verification report
3. Check GitHub Actions workflow runs
4. Contact the development team

---

**Last Updated**: 2025-10-07  
**Production URL**: https://ekaty.fly.dev  
**Status**: ✅ Operational
