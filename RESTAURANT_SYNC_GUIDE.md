# Restaurant Data Sync System

This guide explains how the automated restaurant data synchronization works.

## 🎯 Overview

The system automatically syncs restaurant data from Google Places API daily to keep your database up-to-date with:
- New restaurants
- Updated hours, ratings, and reviews
- Current photos and contact information
- Business status changes

## 🏗️ Architecture

### Components

1. **API Route** (`/api/admin/sync`)
   - POST: Triggers a full sync
   - GET: Returns sync status and history

2. **Cron Job** (`lib/cron/restaurant-sync.ts`)
   - Runs daily at 3 AM CST
   - Automatically calls the sync API

3. **CLI Tool** (`scripts/sync-restaurants.ts`)
   - Manual sync trigger for testing
   - Status checking

## 📅 Automated Daily Sync

### When It Runs
- **Schedule**: Every day at 3:00 AM CST (9:00 AM UTC)
- **Triggered by**: Node-cron job in `instrumentation.ts`
- **Automatic**: Starts when your Next.js app starts

### What It Does
1. Fetches all restaurants in Katy, TX area (6 search zones)
2. Gets detailed info for each restaurant (hours, photos, reviews)
3. Updates existing records or creates new ones
4. Removes duplicate entries
5. Logs results to audit log

### How It Updates
- **New restaurants**: Created with all data
- **Existing restaurants**: Updated with latest data from Google
- **Closed businesses**: Marked as inactive
- **Duplicates**: Automatically merged

## 🔧 Manual Sync

### Start Dev Server
```bash
npm run dev
```

### Trigger Sync
```bash
npm run sync-restaurants
```

### Check Status
```bash
npm run sync-restaurants status
```

## 🔑 Configuration

### Environment Variables

Add to `.env`:

```env
# Google Places API
GOOGLE_MAPS_API_KEY="your-api-key"

# Admin API Key (for sync authentication)
ADMIN_API_KEY="your-secret-admin-key"

# App URL
NEXT_PUBLIC_APP_URL="http://localhost:3000"
```

### Security

The sync endpoint requires authentication via Bearer token:

```bash
curl -X POST http://localhost:3000/api/admin/sync \
  -H "Authorization: Bearer your-secret-admin-key"
```

## 📊 Monitoring

### View Recent Syncs

```bash
npm run sync-restaurants status
```

Output shows:
- Total restaurants in database
- Active restaurant count
- Last 10 sync operations with results

### Check Logs

The sync creates audit log entries in your database:
- Action: `RESTAURANT_SYNC` (success)
- Action: `RESTAURANT_SYNC_FAILED` (error)

## 🚀 Production Deployment

### Fly.io Setup

1. **Set secrets**:
```bash
fly secrets set GOOGLE_MAPS_API_KEY="your-key"
fly secrets set ADMIN_API_KEY="your-admin-key"
```

2. **Deploy**:
```bash
fly deploy
```

3. **Verify cron is running**:
```bash
fly logs
```

Look for: `⏰ Starting daily restaurant sync cron job`

### Alternative: External Cron

If you prefer external cron services (like GitHub Actions or cron-job.org):

1. Disable the built-in cron in `instrumentation.ts`
2. Set up external service to hit your API:

```bash
curl -X POST https://ekaty.fly.dev/api/admin/sync \
  -H "Authorization: Bearer $ADMIN_API_KEY"
```

## 💰 Cost Estimation

### Google Places API Costs
- **Nearby Search**: $32 per 1,000 requests
- **Place Details**: $17 per 1,000 requests

### Typical Daily Sync
- ~6 nearby searches (one per zone)
- ~300-400 detail requests
- **Cost**: ~$7-8 per day = ~$240/month

### Optimization Tips
1. Only sync during off-peak hours (current: 3 AM)
2. Use rate limiting (built-in)
3. Cache unchanged data (automatically handled)
4. Consider weekly syncs instead of daily if budget is tight

## 🔍 Troubleshooting

### Sync Not Running

**Check if cron started**:
```bash
# Local dev
npm run dev
# Look for: "⏰ Starting daily restaurant sync cron job"
```

**Verify instrumentation is enabled** in `next.config.js`:
```javascript
experimental: {
  instrumentationHook: true
}
```

### Sync Fails

**Check API key**:
```bash
npm run import:test
```

**Check API quota**:
- Visit Google Cloud Console
- Check Places API usage
- Ensure billing is enabled

**Check logs**:
```bash
# Local
Check terminal output

# Production
fly logs
```

### Authentication Errors

Verify `ADMIN_API_KEY` matches in:
1. `.env` file
2. Sync request headers
3. API route validation

## 📈 Scaling

### High Traffic
- Increase rate limits in `lib/google-places/client.ts`
- Use pagination for large result sets
- Consider read replicas for database

### Large Cities
- Adjust search zones in `KATY_SEARCH_CONFIG`
- Increase search radius
- Add more search points

### Multiple Locations
- Create separate sync jobs per city
- Use location-based filtering
- Shard database by geographic region

## 🎯 Best Practices

1. **Test locally first**: Always test sync with `npm run sync-restaurants` before deploying
2. **Monitor costs**: Check Google Cloud Console weekly
3. **Review logs**: Check audit logs for failures
4. **Update regularly**: Keep Google Places SDK updated
5. **Backup data**: Regular database backups before major syncs

## 📞 Support

For issues or questions:
1. Check logs: `npm run sync-restaurants status`
2. Review Google API quota
3. Verify environment variables
4. Check API key permissions in Google Cloud Console

---

**Last Updated**: 2025-01-25
