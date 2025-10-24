# Google Maps API Setup for eKaty

This guide will help you set up the Google Maps API key needed to populate the database with real restaurant data from Google Places.

## Step 1: Create a Google Cloud Project

1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Create a new project or select an existing one
3. Note your project ID

## Step 2: Enable Required APIs

Enable the following APIs in your Google Cloud project:

1. **Places API (New)** - For fetching restaurant data
2. **Maps JavaScript API** - For map functionality (optional)
3. **Geocoding API** - For address geocoding (optional)

To enable APIs:
1. Go to "APIs & Services" > "Library"
2. Search for each API and click "Enable"

## Step 3: Create API Key

1. Go to "APIs & Services" > "Credentials"
2. Click "Create Credentials" > "API Key"
3. Copy the generated API key
4. (Optional) Restrict the API key to specific APIs for security

## Step 4: Configure the API Key

### For Local Development:
Add the API key to your `.env.local` file:
```
GOOGLE_MAPS_API_KEY=your_actual_api_key_here
```

### For Production (Fly.io):
1. Set the API key as a secret in Fly.io:
   ```bash
   fly secrets set GOOGLE_MAPS_API_KEY=your_actual_api_key_here
   ```

2. Or update the `fly.toml` file directly (not recommended for security):
   ```toml
   [env]
     GOOGLE_MAPS_API_KEY = "your_actual_api_key_here"
   ```

## Step 5: Test the Setup

Run the import script locally to test:
```bash
npm run import:google
```

This will:
1. Fetch all restaurants in the Katy, TX area
2. Get detailed information for each restaurant
3. Import them into your database

## API Quotas and Limits

- **Places API (New)**: 1000 requests per day (free tier)
- **Places Details API**: 1000 requests per day (free tier)
- **Rate Limit**: 50 requests per second

The import script is designed to respect these limits and will take several minutes to complete.

## Troubleshooting

### "API key not configured" error
- Make sure the API key is set in your environment variables
- Check that the key is valid and not expired

### "Quota exceeded" error
- You've hit the daily limit for the free tier
- Wait 24 hours or upgrade to a paid plan
- Check your usage in Google Cloud Console

### "No restaurants found" error
- Verify the Places API is enabled
- Check that your API key has the correct permissions
- Ensure billing is enabled (required for Places API)

## Cost Considerations

- **Free Tier**: 1000 requests per day for each API
- **Paid Tier**: $0.017 per request for Places API
- **Estimated Cost**: ~$0.50-2.00 for initial import of 200-500 restaurants

## Security Best Practices

1. **Restrict API Key**: Limit to specific APIs and IP addresses
2. **Use Secrets**: Store API keys as environment variables, not in code
3. **Monitor Usage**: Set up billing alerts to avoid unexpected charges
4. **Rotate Keys**: Regularly rotate API keys for security

## Next Steps

After setting up the API key:

1. Deploy the updated application to Fly.io
2. The database will be automatically populated with real restaurant data
3. Users will be able to search and discover actual restaurants in Katy, TX
4. Set up scheduled updates to keep the data fresh (optional)
