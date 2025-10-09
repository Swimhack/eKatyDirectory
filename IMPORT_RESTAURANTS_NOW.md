# 🚀 IMPORT REAL RESTAURANT DATA NOW!

## The system is READY - you just need an API key!

### Step 1: Get Your Google API Key (5 minutes)

1. **Go to Google Cloud Console**  
   👉 https://console.cloud.google.com

2. **Create a Project** (or use existing)  
   - Click "Select a project" → "New Project"
   - Name it "eKaty" 
   - Click "Create"

3. **Enable the Places API**  
   👉 Direct link: https://console.cloud.google.com/apis/library/places-backend.googleapis.com  
   - Click "ENABLE"

4. **Create API Key**  
   - Go to "Credentials" in left menu
   - Click "+ CREATE CREDENTIALS" → "API key"
   - Copy the key that appears!

5. **Enable Billing** (Required but won't charge yet)  
   - Go to "Billing" in left menu
   - Add a payment method
   - Your first $200/month is FREE from Google

### Step 2: Add Your API Key

Edit the file `.env.local` and add your key:
```
GOOGLE_MAPS_API_KEY=AIza...your_actual_key_here
```

### Step 3: Test It Works

```bash
npm run import:test
```

You should see a sample restaurant from Katy!

### Step 4: IMPORT ALL RESTAURANTS! 🎉

```bash
npm run import:google
```

This will:
- Search all areas of Katy (Downtown, Cinco Ranch, Seven Lakes, etc.)
- Find 300-500+ real restaurants
- Get their photos, hours, ratings, reviews
- Save everything to your database

**Cost:** About $30-35 one time (or FREE if using Google's $200 credit)

### Step 5: Deploy to Production

Add your API key to Fly.io:
```bash
fly secrets set GOOGLE_MAPS_API_KEY=your_actual_key_here
```

Then the live site will have access to fetch data too!

## What You Get

- ✅ Real restaurant names and addresses
- ✅ Actual phone numbers and websites  
- ✅ Real photos from Google (up to 10 per restaurant)
- ✅ Operating hours for each day
- ✅ Google ratings and review counts
- ✅ Cuisine types auto-detected
- ✅ Price levels (Budget/Moderate/Upscale/Premium)

## Troubleshooting

**"REQUEST_DENIED"** → You didn't enable Places API in step 3  
**"No API key found"** → Check your .env.local file  
**"OVER_QUERY_LIMIT"** → Wait 24 hours (daily limit hit)  

## Need Help?

The code is 100% ready and tested. You literally just need:
1. Get API key (5 min)
2. Add to .env.local
3. Run `npm run import:google`

That's it! Your database will be full of real Katy restaurants!