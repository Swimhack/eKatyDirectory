# Google Places API Setup Instructions

## ✅ Code Implementation Complete!

All the code for importing restaurants from Google Places is now ready. Here's what you need to do:

## 🔑 Step 1: Get Your Google API Key

1. Go to [Google Cloud Console](https://console.cloud.google.com)
2. Create a new project (or select existing)
3. Enable **"Places API (New)"** - IMPORTANT: Use the NEW Places API
   - Direct link: https://console.cloud.google.com/apis/library/places-backend.googleapis.com
4. Go to "Credentials" → "Create Credentials" → "API Key"
5. Copy your API key

## 📝 Step 2: Configure Your Environment

1. Open `.env.local` file
2. Add your API key:
   ```
   GOOGLE_MAPS_API_KEY=your_actual_api_key_here
   ```

## 🧪 Step 3: Test Your API Connection

Run this command to verify everything works:
```bash
npm run import:test
```

This will test your API key and show you a sample restaurant from Katy.

## 🚀 Step 4: Run Full Import

Once the test passes, import ALL restaurants:
```bash
npm run import:google
```

This will:
- Search 6 different areas in Katy
- Find ~300-500 restaurants
- Get detailed info for each
- Save them to your database with real photos

## 📸 Step 5: Add Google Attribution Logo

Download the "Powered by Google" logo from:
https://developers.google.com/maps/documentation/places/web-service/policies#logo_requirements

Save it as: `/public/powered_by_google_on_white.png`

## 💰 Cost Estimate

- Initial full import: ~$30-35
- Monthly updates: ~$45-50
- Daily limit: 50,000 requests (you'll use <1,000 for full import)

## 🔄 Optional: Set Up Auto-Updates

For production on Fly.io, add your API key as a secret:
```bash
fly secrets set GOOGLE_MAPS_API_KEY=your_actual_api_key_here
```

## 📊 Monitor Your Usage

Check import stats anytime:
- Via CLI: `npm run import:google` (shows stats without importing)
- Via API: `GET /api/admin/import/google-places`
- In Google Cloud Console: Check your API usage dashboard

## ⚠️ Important Notes

1. **API Key Security**: Never commit your API key to Git
2. **Attribution Required**: The GoogleAttribution component must be shown wherever Google data appears
3. **Data Freshness**: Google requires you to refresh data regularly (we handle this automatically)
4. **Rate Limits**: The importer respects Google's rate limits automatically

## 🎯 What Happens After Import

Your database will have:
- Real restaurant names and addresses
- Actual phone numbers and websites
- Real Google ratings and review counts
- Up to 10 photos per restaurant
- Operating hours
- Cuisine types detected from names
- Price levels (Budget/Moderate/Upscale/Premium)

## 🚨 Troubleshooting

If the import fails:

1. **"REQUEST_DENIED"**: Enable Places API (New) in Google Cloud Console
2. **"OVER_QUERY_LIMIT"**: You've hit daily limit, wait 24 hours
3. **"INVALID_REQUEST"**: Check your API key is correct
4. **No restaurants found**: API key might have IP restrictions

## 📱 Next Steps After Import

1. Visit your site - restaurants should appear immediately
2. Images will load from Google's servers directly
3. Set up nightly updates to keep data fresh
4. Add your own review system on top of Google reviews

---

Ready to import? Start with Step 1 above to get your API key!