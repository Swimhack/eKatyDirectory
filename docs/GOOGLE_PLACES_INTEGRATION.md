# Google Places API Integration Plan for eKaty

## Overview
This document outlines the complete implementation plan for integrating Google Places API to populate the eKaty restaurant database with real restaurant data from Katy, Texas.

## Required Google APIs

### 1. Google Places API (New)
- **Purpose**: Fetch restaurant data, details, and photos
- **Endpoints Needed**:
  - Nearby Search: Find all restaurants in Katy area
  - Place Details: Get detailed information about each restaurant
  - Place Photos: Retrieve restaurant photos
- **Pricing**: 
  - Nearby Search: $32 per 1,000 requests
  - Place Details: $17 per 1,000 requests (Basic), $25 per 1,000 (Contact), $30 per 1,000 (Atmosphere)
  - Place Photos: $7 per 1,000 requests
- **Rate Limits**: 
  - 50,000 requests per day default (can request increase)
  - 100 requests per second

### 2. Google Maps Geocoding API
- **Purpose**: Convert addresses to coordinates if needed
- **Pricing**: $5 per 1,000 requests
- **Rate Limits**: 50 requests per second

## Data Collection Strategy

### Geographic Coverage
```javascript
// Katy, TX area boundaries
const KATY_BOUNDS = {
  center: { lat: 29.7858, lng: -95.8245 },
  // Cover entire Greater Katy area including:
  // - Downtown Katy
  // - Cinco Ranch
  // - Seven Lakes
  // - Grand Lakes
  // - Fulshear
  radius: 15000 // 15km radius to cover all Katy suburbs
};

// Additional search points for complete coverage
const SEARCH_POINTS = [
  { lat: 29.7858, lng: -95.8245, name: "Downtown Katy" },
  { lat: 29.7377, lng: -95.8247, name: "Cinco Ranch" },
  { lat: 29.7752, lng: -95.7577, name: "Seven Lakes" },
  { lat: 29.6911, lng: -95.8988, name: "Fulshear" },
  { lat: 29.8316, lng: -95.8285, name: "North Katy" },
  { lat: 29.7294, lng: -95.8981, name: "West Katy" }
];
```

### Data Fields to Collect

From Google Places API:
- `place_id` - Unique Google identifier
- `name` - Restaurant name
- `formatted_address` - Full address
- `geometry.location` - Lat/lng coordinates
- `formatted_phone_number` - Phone number
- `website` - Restaurant website
- `types` - Categories (e.g., "restaurant", "bar", "cafe")
- `price_level` - Price range (0-4 scale)
- `rating` - Google rating
- `user_ratings_total` - Number of Google reviews
- `opening_hours` - Operating hours
- `photos` - Photo references
- `reviews` - Google reviews (limited to 5 most relevant)
- `business_status` - Operational status

## Implementation Steps

### Step 1: Environment Setup

```bash
# Required packages
npm install @googlemaps/google-maps-services-js
npm install dotenv
npm install p-limit  # For rate limiting
npm install node-cron  # For scheduled updates
```

### Step 2: API Configuration

Create `.env.local`:
```env
# Google API Keys
GOOGLE_MAPS_API_KEY=your_api_key_here
GOOGLE_PLACES_API_KEY=your_places_api_key_here

# API Configuration
GOOGLE_PLACES_RATE_LIMIT=50  # requests per second
GOOGLE_PLACES_DAILY_LIMIT=45000  # Leave buffer below 50k limit

# Image Storage (choose one)
IMAGE_STORAGE_TYPE=cloudinary  # or 'local' or 's3'
CLOUDINARY_URL=your_cloudinary_url
# OR
AWS_S3_BUCKET=your_s3_bucket
AWS_ACCESS_KEY_ID=your_access_key
AWS_SECRET_ACCESS_KEY=your_secret_key
```

### Step 3: Database Schema Updates

The current schema is already well-structured. We'll use these fields:
- `source`: Set to "google_places"
- `sourceId`: Store Google place_id
- `metadata`: Store additional Google data as JSON
- `lastVerified`: Track when data was last updated

### Step 4: Service Layer Architecture

```typescript
// File structure
/lib
  /google-places
    /client.ts         # Google API client setup
    /fetcher.ts        # Data fetching logic
    /transformer.ts    # Transform Google data to our schema
    /importer.ts       # Import data to database
    /scheduler.ts      # Scheduled update jobs
  /images
    /storage.ts        # Image storage abstraction
    /cloudinary.ts     # Cloudinary implementation
    /optimizer.ts      # Image optimization
```

## Cost Estimation

### Initial Data Load (One-time)
Assuming ~500 restaurants in Greater Katy area:
- Nearby Search: 6 search points × 3 pages each = 18 requests = $0.58
- Place Details: 500 restaurants × 1 request = 500 requests = $15.00
- Place Photos: 500 restaurants × 5 photos = 2,500 requests = $17.50
- **Total Initial Load: ~$33.08**

### Monthly Updates
- Daily verification of 50 restaurants: 50 × 30 = 1,500 requests = $45.00/month
- New restaurant checks weekly: 4 × 18 = 72 requests = $2.30/month
- **Total Monthly: ~$47.30**

## Legal and Compliance

### Google Places API Terms of Service Requirements

1. **Attribution**: Must display "Powered by Google" logo
2. **Data Storage**: 
   - Can cache basic data for 30 days
   - Photos can be cached but must check for updates
   - Reviews must be refreshed regularly
3. **Display Requirements**:
   - Must show Google reviews alongside any other reviews
   - Cannot filter or reorder Google reviews
   - Must link to Google Maps for directions

### Implementation Requirements

```typescript
// Required attribution component
const GoogleAttribution = () => (
  <div className="google-attribution">
    <img src="/powered_by_google.png" alt="Powered by Google" />
    <a href="https://maps.google.com" target="_blank" rel="noopener noreferrer">
      View on Google Maps
    </a>
  </div>
);
```

## Error Handling and Fallbacks

### Rate Limiting Strategy
```typescript
const rateLimiter = pLimit(50); // 50 concurrent requests
const dailyCounter = new DailyCounter(45000); // Daily limit

async function fetchWithRateLimit(fn: Function) {
  if (dailyCounter.isExceeded()) {
    throw new Error('Daily API limit reached');
  }
  return rateLimiter(() => {
    dailyCounter.increment();
    return fn();
  });
}
```

### Error Recovery
- Implement exponential backoff for failed requests
- Store failed imports in a retry queue
- Log all API errors for monitoring
- Fallback to cached data if API is unavailable

## Security Considerations

1. **API Key Protection**:
   - Never expose API keys in client-side code
   - Use environment variables
   - Implement API key restrictions in Google Cloud Console
   - Restrict to specific IP addresses for production

2. **Data Validation**:
   - Sanitize all input from Google API
   - Validate coordinates are within Katy bounds
   - Verify business is actually a restaurant

## Monitoring and Maintenance

### Metrics to Track
- API usage and costs
- Success/failure rates
- Data freshness
- Image storage usage
- User engagement with Google-sourced content

### Alerts to Set Up
- API quota approaching limit
- High error rate
- Stale data (not updated in 30+ days)
- Budget threshold exceeded

## Next Steps

1. Create Google Cloud Platform account
2. Enable required APIs
3. Generate and secure API keys
4. Implement base service layer
5. Test with small subset of data
6. Implement full import pipeline
7. Set up monitoring and alerts
8. Deploy to production