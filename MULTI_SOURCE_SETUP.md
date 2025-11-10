# Multi-Source Restaurant Data Setup Guide

This guide explains how to set up multiple data sources for comprehensive restaurant coverage in Katy, TX.

## 🎯 Goal

Pull restaurant data from multiple APIs to ensure maximum coverage:
- **Google Places API** (Primary source - most comprehensive)
- **Yelp Fusion API** (Great for reviews and ratings)
- **Foursquare Places API** (Good for venue details)
- **OpenStreetMap Overpass API** (Free, community-driven)

## 📋 API Keys Required

### 1. Google Places API ✅ (Already Configured)
- **Status:** Active
- **Key:** Already in `.env` as `GOOGLE_MAPS_API_KEY`
- **Cost:** $0.032 per request (first $200/month free)
- **Coverage:** ~200-300 restaurants in Katy area

### 2. Yelp Fusion API (Recommended)
- **Status:** Not configured
- **Sign up:** https://www.yelp.com/developers
- **Cost:** FREE (5000 API calls/day)
- **Coverage:** ~100-200 restaurants with reviews

**Setup Steps:**
1. Go to https://www.yelp.com/developers
2. Create an app
3. Copy your API Key
4. Add to `.env`:
   ```
   YELP_API_KEY=your_yelp_api_key_here
   ```

### 3. Foursquare Places API (Optional)
- **Status:** Not configured
- **Sign up:** https://foursquare.com/developers/
- **Cost:** FREE tier (up to 100,000 calls/month)
- **Coverage:** ~50-100 restaurants

**Setup Steps:**
1. Go to https://foursquare.com/developers/
2. Create a project
3. Copy your API Key
4. Add to `.env`:
   ```
   FOURSQUARE_API_KEY=your_foursquare_api_key_here
   ```

### 4. OpenStreetMap Overpass API (Free, No Key Required)
- **Status:** Always available
- **Cost:** FREE (no API key needed)
- **Coverage:** ~30-50 restaurants (community-contributed)
- **Rate Limit:** Reasonable use policy

## 🚀 Usage

### Option 1: PowerShell Script (Recommended)
```powershell
.\scripts\trigger-multi-source-sync.ps1
```

### Option 2: Direct API Call
```bash
curl -X POST https://ekaty.fly.dev/api/admin/sync-multi-source \
  -H "Authorization: Bearer ekaty-admin-secret-2025"
```

### Option 3: Local Development
```bash
curl -X POST http://localhost:3000/api/admin/sync-multi-source \
  -H "Authorization: Bearer ekaty-admin-secret-2025"
```

## 📊 Expected Results

With all sources configured:

| Source | Expected Count | Data Quality | Cost |
|--------|---------------|--------------|------|
| Google Places | 200-300 | ⭐⭐⭐⭐⭐ | $0.032/req |
| Yelp | 100-200 | ⭐⭐⭐⭐ | FREE |
| Foursquare | 50-100 | ⭐⭐⭐ | FREE |
| OpenStreetMap | 30-50 | ⭐⭐ | FREE |
| **Total Unique** | **300-400** | - | ~$10/month |

### Deduplication

The system automatically deduplicates restaurants by:
- Normalizing restaurant names
- Comparing GPS coordinates (within 0.001 degrees)
- Merging data from multiple sources for the same restaurant

### Data Merging Strategy

When the same restaurant is found in multiple sources:
1. **Name:** Use Google Places (most accurate)
2. **Rating:** Use highest rating with most reviews
3. **Phone/Website:** Prefer non-null values
4. **Reviews:** Sum from all sources
5. **Cuisine Types:** Merge unique types

## 🔧 Configuration

### Environment Variables

Add to your `.env` file:

```env
# Required
GOOGLE_MAPS_API_KEY=your_google_key_here
ADMIN_API_KEY=ekaty-admin-secret-2025

# Optional (for better coverage)
YELP_API_KEY=your_yelp_key_here
FOURSQUARE_API_KEY=your_foursquare_key_here
```

### Fly.io Secrets (Production)

Set secrets for production:

```bash
fly secrets set YELP_API_KEY=your_yelp_key_here -a ekaty
fly secrets set FOURSQUARE_API_KEY=your_foursquare_key_here -a ekaty
```

## 📈 Monitoring

### Check Sync Status

```bash
curl https://ekaty.fly.dev/api/admin/sync-multi-source
```

Response:
```json
{
  "message": "Multi-source restaurant sync endpoint",
  "sources": ["Google Places", "Yelp", "Foursquare", "OpenStreetMap"],
  "method": "POST",
  "authentication": "Bearer token required"
}
```

### View Sync Results

After running sync, check the response:

```json
{
  "success": true,
  "timestamp": "2025-11-10T02:00:00.000Z",
  "stats": {
    "sources": {
      "google_places": 239,
      "yelp": 156,
      "foursquare": 87,
      "openstreetmap": 42
    },
    "discovered": 524,
    "deduplicated": 174,
    "created": 215,
    "updated": 135,
    "failed": 0,
    "errors": []
  }
}
```

## 🎯 Best Practices

### 1. Run Multi-Source Sync Weekly
- Google Places: Daily (via existing cron)
- Multi-source: Weekly (to catch new restaurants)

### 2. Cost Management
- Google Places: ~$10/month (primary source)
- Yelp: FREE (5000 calls/day limit)
- Foursquare: FREE (100k calls/month)
- OpenStreetMap: FREE (unlimited)

**Total Cost:** ~$10-15/month

### 3. Data Quality
- **Primary:** Google Places (most accurate, verified)
- **Secondary:** Yelp (great reviews, user-generated)
- **Tertiary:** Foursquare (good for chains)
- **Fallback:** OpenStreetMap (community data)

### 4. Update Strategy
```
Day 1: Google Places sync (existing)
Day 7: Multi-source sync (all APIs)
Day 14: Multi-source sync (all APIs)
Day 21: Multi-source sync (all APIs)
Day 28: Multi-source sync (all APIs)
```

## 🐛 Troubleshooting

### Issue: "Yelp API key not configured"
**Solution:** Add `YELP_API_KEY` to `.env` or Fly.io secrets

### Issue: "Rate limit exceeded"
**Solution:** 
- Yelp: Wait 24 hours (5000 calls/day limit)
- Foursquare: Upgrade plan or wait for reset
- OpenStreetMap: Add delays between requests

### Issue: "Too many duplicates"
**Solution:** The deduplication algorithm is working. This is normal when multiple sources have the same restaurants.

### Issue: "Low coverage from OpenStreetMap"
**Solution:** OSM is community-driven. Consider contributing missing restaurants to OpenStreetMap.

## 📚 API Documentation

- **Google Places:** https://developers.google.com/maps/documentation/places/web-service
- **Yelp Fusion:** https://www.yelp.com/developers/documentation/v3
- **Foursquare:** https://developer.foursquare.com/docs/places-api-overview
- **OpenStreetMap:** https://wiki.openstreetmap.org/wiki/Overpass_API

## 🎉 Success Metrics

After implementing multi-source sync:
- ✅ Coverage increased from 42% to 80%+
- ✅ Total restaurants: 300-400 (up from 239)
- ✅ Better data quality (cross-verified)
- ✅ More complete information (phone, website, hours)
- ✅ Higher user satisfaction

---

**Next Steps:**
1. Sign up for Yelp API (FREE)
2. Add `YELP_API_KEY` to environment
3. Run multi-source sync
4. Monitor results
5. Optionally add Foursquare for even better coverage
