# eKaty Restaurant Database Maintenance Agent

**Purpose:** Autonomous agent for maintaining 100% uptime and data accuracy of the eKaty restaurant database using Google Places API.

**Version:** 1.0  
**Last Updated:** 2025-10-28  
**Owner:** james@ekaty.com

---

## Table of Contents

1. [Overview](#overview)
2. [Architecture](#architecture)
3. [Database Schema](#database-schema)
4. [Google Places API Integration](#google-places-api-integration)
5. [API Keys & Authentication](#api-keys--authentication)
6. [Restaurant Data Model](#restaurant-data-model)
7. [Sync Process](#sync-process)
8. [Error Handling & Recovery](#error-handling--recovery)
9. [Monitoring & Alerts](#monitoring--alerts)
10. [Best Practices](#best-practices)
11. [Implementation Guide](#implementation-guide)
12. [Troubleshooting](#troubleshooting)

---

## Overview

### Mission
Maintain an accurate, complete, and continuously updated database of all restaurants in Katy, Texas with zero downtime and 100% data integrity.

### Key Objectives
- ✅ **Daily Sync**: Automated daily updates from Google Places API
- ✅ **Zero Downtime**: Continuous operation without service interruption
- ✅ **Complete Coverage**: All restaurants in Katy area (15km radius)
- ✅ **Data Accuracy**: Real-time verification of business status, hours, photos
- ✅ **Error Recovery**: Automatic retry and failure handling
- ✅ **Audit Trail**: Complete logging of all sync operations

### Current Status
- **Database**: SQLite (production) / PostgreSQL (scalable option)
- **Location**: Katy, TX (29.7858, -95.8245)
- **Coverage**: 6 search points covering 15km radius
- **Deployment**: Fly.io with scheduled cron jobs
- **API**: Google Places API (new Places API v3 compatible)

---

## Architecture

### System Components

```
┌─────────────────────────────────────────────────────────────┐
│                     eKaty Application                       │
│                   (Next.js 14 + Prisma)                    │
└─────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────┐
│               Maintenance Agent (Cron Job)                  │
│  - Daily Sync Scheduler                                     │
│  - Google Places API Client                                 │
│  - Data Transformer                                         │
│  - Database Importer                                        │
│  - Error Handler                                            │
└─────────────────────────────────────────────────────────────┘
                              │
            ┌─────────────────┴─────────────────┐
            ▼                                   ▼
┌───────────────────────┐         ┌───────────────────────┐
│  Google Places API    │         │  SQLite Database      │
│  - Place Search       │         │  - Restaurants        │
│  - Place Details      │         │  - Reviews            │
│  - Photos             │         │  - Audit Logs         │
└───────────────────────┘         └───────────────────────┘
```

### Data Flow

1. **Trigger**: Daily cron job (3:00 AM CST)
2. **Discovery**: Fetch all restaurants from 6 search points
3. **Details**: Fetch detailed data for each restaurant
4. **Transform**: Convert Google data to eKaty schema
5. **Import**: Update database (upsert existing, create new)
6. **Cleanup**: Remove duplicates and inactive restaurants
7. **Audit**: Log sync results and statistics
8. **Monitor**: Check for errors and send alerts

---

## Database Schema

### Restaurant Table
**Primary entity storing all restaurant data**

```typescript
model Restaurant {
  id            String      @id @default(cuid())
  name          String
  slug          String      @unique
  description   String?
  address       String
  city          String      @default("Katy")
  state         String      @default("TX")
  zipCode       String
  latitude      Float
  longitude     Float
  phone         String?
  website       String?
  email         String?
  categories    String      // Comma-separated
  cuisineTypes  String      // Comma-separated
  hours         String      // JSON string
  priceLevel    String      @default("MODERATE")
  photos        String      // Comma-separated URLs
  logoUrl       String?
  featured      Boolean     @default(false)
  verified      Boolean     @default(false)
  active        Boolean     @default(true)
  rating        Float?
  reviewCount   Int         @default(0)
  source        String?     // "google_places"
  sourceId      String?     // Google Place ID
  metadata      String?     // JSON with additional data
  createdAt     DateTime    @default(now())
  updatedAt     DateTime    @updatedAt
  lastVerified  DateTime?   // Last sync timestamp
}
```

### Key Fields for Sync

| Field | Type | Purpose | Source |
|-------|------|---------|--------|
| `sourceId` | String | Google Place ID (unique identifier) | `place_id` |
| `lastVerified` | DateTime | Last successful sync | System timestamp |
| `active` | Boolean | Business operational status | `business_status` |
| `metadata` | JSON | Raw Google data for reference | Full API response |

### Audit Log Table
**Tracks all sync operations**

```typescript
model AuditLog {
  id        String   @id @default(cuid())
  entity    String   // "Restaurant"
  entityId  String   // "system" for bulk operations
  action    String   // "RESTAURANT_SYNC", "RESTAURANT_SYNC_FAILED"
  userId    String?  // null for system operations
  changes   String?  // JSON with sync statistics
  metadata  String?  // Additional context
  createdAt DateTime @default(now())
}
```

---

## Google Places API Integration

### API Key Setup

#### Environment Variables
```bash
# Google Maps API Key (required)
GOOGLE_MAPS_API_KEY="AIza..."

# Admin API Key (for triggering syncs)
ADMIN_API_KEY="ekaty-admin-secret-2025"

# Database Connection
DATABASE_URL="file:/data/ekaty.db"  # SQLite (production)
# DATABASE_URL="postgresql://..."  # PostgreSQL (scalable)

# App Configuration
NEXT_PUBLIC_APP_URL="https://ekaty.fly.dev"
```

#### Getting Google API Key

1. **Go to Google Cloud Console**: https://console.cloud.google.com
2. **Create/Select Project**: "eKaty-Production"
3. **Enable APIs**:
   - Places API (New)
   - Places API
   - Maps JavaScript API
   - Geocoding API
4. **Create Credentials**: API Key
5. **Restrict Key** (Security):
   - **Application restrictions**: HTTP referrers or IP addresses
   - **API restrictions**: Select above APIs only
6. **Copy Key**: Store securely in environment variables

#### API Quotas & Limits

```typescript
export const GOOGLE_CONFIG = {
  apiKey: process.env.GOOGLE_MAPS_API_KEY || '',
  rateLimit: 50,      // Concurrent requests
  dailyLimit: 45000,  // Daily request limit (conservative)
};
```

**Default Google Limits:**
- **Place Search**: $32 per 1000 requests
- **Place Details**: $17 per 1000 requests
- **Photos**: $7 per 1000 requests
- **Free Tier**: $200/month credit (~10,000 requests/month)

**Our Usage:**
- ~300 restaurants × 2 requests (search + details) = 600 requests/day
- ~18,000 requests/month (well within free tier)

### Search Configuration

#### Coverage Areas
6 strategic points covering entire Katy area:

```typescript
export const KATY_SEARCH_CONFIG = {
  center: { lat: 29.7858, lng: -95.8245 },
  radius: 15000, // 15km
  searchPoints: [
    { lat: 29.7858, lng: -95.8245, name: 'Downtown Katy' },
    { lat: 29.7377, lng: -95.8247, name: 'Cinco Ranch' },
    { lat: 29.7752, lng: -95.7577, name: 'Seven Lakes' },
    { lat: 29.6911, lng: -95.8988, name: 'Fulshear' },
    { lat: 29.8316, lng: -95.8285, name: 'North Katy' },
    { lat: 29.7294, lng: -95.8981, name: 'West Katy' },
  ],
};
```

**Coverage Strategy:**
- Each point searches 5km radius
- Overlapping coverage ensures no gaps
- Deduplication by `place_id` prevents duplicates

### API Endpoints Used

#### 1. Places Nearby Search
```typescript
client.placesNearby({
  params: {
    location: { lat: 29.7858, lng: -95.8245 },
    radius: 5000,
    type: 'restaurant',
    key: GOOGLE_CONFIG.apiKey,
  }
})
```

**Returns:** Basic restaurant list with `place_id`

#### 2. Place Details
```typescript
client.placeDetails({
  params: {
    place_id: 'ChIJ...',
    fields: [
      'name',
      'formatted_address',
      'geometry',
      'formatted_phone_number',
      'international_phone_number',
      'website',
      'opening_hours',
      'price_level',
      'rating',
      'user_ratings_total',
      'reviews',
      'photos',
      'types',
      'business_status',
      'url',
      'vicinity',
      'editorial_summary',
    ],
    key: GOOGLE_CONFIG.apiKey,
  }
})
```

**Returns:** Complete restaurant details

#### 3. Photos
```typescript
const photoUrl = `https://maps.googleapis.com/maps/api/place/photo?` +
  `maxwidth=1200&maxheight=800&` +
  `photoreference=${photo.photo_reference}&` +
  `key=${GOOGLE_CONFIG.apiKey}`;
```

**Returns:** Photo URL (up to 10 photos per restaurant)

---

## Restaurant Data Model

### Data Mapping (Google → eKaty)

| eKaty Field | Google Places Field | Transformation |
|-------------|-------------------|----------------|
| `name` | `name` | Direct |
| `slug` | `name` | URL-friendly: lowercase, hyphens |
| `address` | `formatted_address` | Extract street address |
| `city` | - | Fixed: "Katy" |
| `state` | - | Fixed: "TX" |
| `zipCode` | `formatted_address` | Extract via regex |
| `latitude` | `geometry.location.lat` | Direct |
| `longitude` | `geometry.location.lng` | Direct |
| `phone` | `formatted_phone_number` | Direct |
| `website` | `website` | Direct |
| `categories` | `types` | Map to readable categories |
| `cuisineTypes` | `types`, `name` | Extract cuisine from name/types |
| `hours` | `opening_hours.weekday_text` | Convert to JSON object |
| `priceLevel` | `price_level` | Convert 0-4 to BUDGET/MODERATE/UPSCALE/PREMIUM |
| `photos` | `photos[].photo_reference` | Convert to photo URLs, comma-separated |
| `rating` | `rating` | Direct (1-5 scale) |
| `reviewCount` | `user_ratings_total` | Direct |
| `active` | `business_status` | `OPERATIONAL` → true |
| `source` | - | Fixed: "google_places" |
| `sourceId` | `place_id` | Direct (unique identifier) |

### Data Transformation Example

**Google Response:**
```json
{
  "place_id": "ChIJN1t_tDeuEmsRUsoyG83frY4",
  "name": "Chuy's Tex-Mex",
  "formatted_address": "22720 Morton Ranch Rd, Katy, TX 77449",
  "geometry": {
    "location": { "lat": 29.7858, "lng": -95.8245 }
  },
  "price_level": 2,
  "rating": 4.3,
  "user_ratings_total": 1245,
  "types": ["restaurant", "food", "point_of_interest"],
  "business_status": "OPERATIONAL",
  "opening_hours": {
    "weekday_text": [
      "Monday: 11:00 AM – 10:00 PM",
      "Tuesday: 11:00 AM – 10:00 PM",
      ...
    ]
  },
  "photos": [
    { "photo_reference": "Aaw_FcK..." }
  ]
}
```

**eKaty Record:**
```typescript
{
  name: "Chuy's Tex-Mex",
  slug: "chuys-tex-mex",
  address: "22720 Morton Ranch Rd",
  city: "Katy",
  state: "TX",
  zipCode: "77449",
  latitude: 29.7858,
  longitude: -95.8245,
  phone: null,
  website: null,
  categories: "Restaurant",
  cuisineTypes: "Tex-Mex, Mexican",
  hours: '{"monday":"11:00 AM – 10:00 PM",...}',
  priceLevel: "MODERATE",
  photos: "https://maps.googleapis.com/maps/api/place/photo?...",
  rating: 4.3,
  reviewCount: 1245,
  active: true,
  source: "google_places",
  sourceId: "ChIJN1t_tDeuEmsRUsoyG83frY4",
  lastVerified: "2025-10-28T03:00:00Z"
}
```

---

## Sync Process

### Daily Sync Flow

```mermaid
graph TD
    A[Cron Trigger 3:00 AM] --> B[Verify API Keys]
    B --> C[Discover Restaurants]
    C --> D[Fetch Details]
    D --> E[Transform Data]
    E --> F[Update Database]
    F --> G[Remove Duplicates]
    G --> H[Log Results]
    H --> I[Send Alerts if Errors]
```

### Step-by-Step Process

#### 1. Trigger Sync
```typescript
// Triggered via:
// - Cron job (daily at 3:00 AM CST)
// - Manual API call
// - CLI command: npm run sync-restaurants

POST /api/admin/sync
Headers: {
  Authorization: "Bearer ekaty-admin-secret-2025"
}
```

#### 2. Discover Restaurants
```typescript
async function fetchAllKatyRestaurants() {
  const allRestaurants = new Map();
  
  for (const point of KATY_SEARCH_CONFIG.searchPoints) {
    const restaurants = await fetchNearbyRestaurants(
      { lat: point.lat, lng: point.lng },
      5000
    );
    
    // Deduplicate by place_id
    restaurants.forEach(r => {
      allRestaurants.set(r.place_id, r);
    });
    
    await delay(1000); // Rate limiting
  }
  
  return Array.from(allRestaurants.values());
}
```

**Expected Result:** ~250-350 unique restaurants

#### 3. Fetch Detailed Data
```typescript
async function fetchDetailedRestaurantData(restaurants) {
  const detailedData = [];
  
  for (const restaurant of restaurants) {
    try {
      const details = await fetchPlaceDetails(restaurant.place_id);
      detailedData.push({ ...restaurant, details });
      await delay(100); // Rate limiting
    } catch (error) {
      console.error(`Failed for ${restaurant.name}:`, error);
      detailedData.push(restaurant); // Use basic data
    }
  }
  
  return detailedData;
}
```

**Rate Limiting:** 100ms between requests (600 requests/minute)

#### 4. Transform Data
```typescript
function transformGooglePlaceToRestaurant(place) {
  return {
    name: place.name,
    slug: createSlug(place.name),
    address: extractStreetAddress(place.formatted_address),
    city: 'Katy',
    state: 'TX',
    zipCode: extractZipCode(place.formatted_address),
    latitude: place.geometry.location.lat,
    longitude: place.geometry.location.lng,
    phone: place.formatted_phone_number,
    website: place.website,
    categories: extractCategories(place.types),
    cuisineTypes: extractCuisineTypes(place.types, place.name),
    hours: convertOpeningHours(place.opening_hours),
    priceLevel: convertPriceLevel(place.price_level),
    photos: place.photos?.map(p => getPhotoUrl(p.photo_reference)).join(','),
    logoUrl: place.photos?.[0] ? getPhotoUrl(place.photos[0].photo_reference) : null,
    featured: place.rating >= 4.5 && place.user_ratings_total >= 100,
    verified: true,
    active: place.business_status === 'OPERATIONAL',
    rating: place.rating,
    reviewCount: place.user_ratings_total,
    source: 'google_places',
    sourceId: place.place_id,
    metadata: JSON.stringify({
      google_place_id: place.place_id,
      google_url: place.url,
      google_rating: place.rating,
      last_google_update: new Date().toISOString(),
    }),
    lastVerified: new Date(),
  };
}
```

#### 5. Import to Database (Upsert)
```typescript
async function importRestaurants(restaurants, options) {
  let created = 0;
  let updated = 0;
  let failed = 0;
  
  for (const restaurant of restaurants) {
    try {
      // Check if exists by sourceId (Google Place ID)
      const existing = await prisma.restaurant.findFirst({
        where: { sourceId: restaurant.sourceId }
      });
      
      if (existing) {
        // Update existing
        await prisma.restaurant.update({
          where: { id: existing.id },
          data: {
            ...restaurant,
            updatedAt: new Date(),
            lastVerified: new Date(),
          }
        });
        updated++;
      } else {
        // Create new
        await prisma.restaurant.create({
          data: restaurant
        });
        created++;
      }
    } catch (error) {
      console.error(`Failed to import ${restaurant.name}:`, error);
      failed++;
    }
  }
  
  return { created, updated, failed };
}
```

#### 6. Remove Duplicates
```typescript
async function deduplicateRestaurants() {
  // Find duplicates by sourceId
  const duplicates = await prisma.$queryRaw`
    SELECT sourceId, COUNT(*) as count
    FROM restaurants
    WHERE sourceId IS NOT NULL
    GROUP BY sourceId
    HAVING count > 1
  `;
  
  let removed = 0;
  
  for (const dup of duplicates) {
    // Keep newest, delete others
    const restaurants = await prisma.restaurant.findMany({
      where: { sourceId: dup.sourceId },
      orderBy: { createdAt: 'desc' }
    });
    
    for (let i = 1; i < restaurants.length; i++) {
      await prisma.restaurant.delete({
        where: { id: restaurants[i].id }
      });
      removed++;
    }
  }
  
  return removed;
}
```

#### 7. Log Results
```typescript
await prisma.auditLog.create({
  data: {
    action: 'RESTAURANT_SYNC',
    entity: 'Restaurant',
    entityId: 'system',
    changes: JSON.stringify({
      discovered: 300,
      created: 5,
      updated: 290,
      failed: 5,
      duplicatesRemoved: 2,
      timestamp: new Date().toISOString(),
    }),
    userId: null // System operation
  }
});
```

---

## Error Handling & Recovery

### Error Categories

#### 1. API Errors
**Causes:**
- Rate limit exceeded
- API key invalid/expired
- Network timeout
- Daily quota exhausted

**Handling:**
```typescript
try {
  const response = await fetchPlaceDetails(placeId);
  return response;
} catch (error) {
  if (error.response?.status === 429) {
    // Rate limit - wait and retry
    await delay(5000);
    return fetchPlaceDetails(placeId);
  } else if (error.response?.status === 403) {
    // Invalid API key - alert admin
    await sendAlert('Google API key is invalid or expired');
    throw error;
  } else {
    // Other error - log and continue
    console.error(`API error for ${placeId}:`, error);
    return null;
  }
}
```

#### 2. Database Errors
**Causes:**
- Connection lost
- Disk space full
- Constraint violations
- Lock timeouts

**Handling:**
```typescript
try {
  await prisma.restaurant.create({ data: restaurant });
} catch (error) {
  if (error.code === 'P2002') {
    // Unique constraint violation - update instead
    await prisma.restaurant.update({
      where: { slug: restaurant.slug },
      data: restaurant
    });
  } else {
    // Log error and continue with next restaurant
    console.error(`Database error:`, error);
    await logError('DATABASE_ERROR', error);
  }
}
```

#### 3. Data Transformation Errors
**Causes:**
- Missing required fields
- Invalid data format
- Unexpected API response structure

**Handling:**
```typescript
try {
  const transformed = transformGooglePlaceToRestaurant(place);
  return transformed;
} catch (error) {
  console.error(`Transform error for ${place.name}:`, error);
  // Return fallback data
  return {
    name: place.name || 'Unknown Restaurant',
    slug: createSlug(place.name || 'unknown'),
    address: place.formatted_address || 'Address not available',
    // ... minimal required fields
  };
}
```

### Retry Strategy

```typescript
async function retryOperation<T>(
  operation: () => Promise<T>,
  maxRetries: number = 3,
  delay: number = 1000
): Promise<T> {
  for (let i = 0; i < maxRetries; i++) {
    try {
      return await operation();
    } catch (error) {
      if (i === maxRetries - 1) throw error;
      await new Promise(resolve => setTimeout(resolve, delay * (i + 1)));
    }
  }
  throw new Error('Max retries exceeded');
}

// Usage
const details = await retryOperation(
  () => fetchPlaceDetails(placeId),
  3,
  2000
);
```

### Failure Recovery

**If sync fails completely:**

1. **Log the failure:**
```typescript
await prisma.auditLog.create({
  data: {
    action: 'RESTAURANT_SYNC_FAILED',
    entity: 'Restaurant',
    entityId: 'system',
    changes: JSON.stringify({
      error: error.message,
      timestamp: new Date().toISOString(),
    })
  }
});
```

2. **Send alert email:**
```typescript
await sendEmail({
  to: 'james@ekaty.com',
  subject: '🚨 eKaty Restaurant Sync Failed',
  body: `Daily sync failed at ${new Date().toISOString()}\n\nError: ${error.message}`
});
```

3. **Automatic retry in 1 hour:**
```typescript
// Scheduled retry via cron or webhook
setTimeout(() => {
  triggerSync();
}, 60 * 60 * 1000);
```

---

## Monitoring & Alerts

### Health Checks

#### 1. Database Health
```typescript
async function checkDatabaseHealth() {
  try {
    const totalRestaurants = await prisma.restaurant.count();
    const activeRestaurants = await prisma.restaurant.count({ where: { active: true } });
    const recentlyUpdated = await prisma.restaurant.count({
      where: { lastVerified: { gte: new Date(Date.now() - 48 * 60 * 60 * 1000) } }
    });
    
    return {
      healthy: totalRestaurants > 200 && recentlyUpdated > totalRestaurants * 0.9,
      totalRestaurants,
      activeRestaurants,
      recentlyUpdated,
      lastCheck: new Date(),
    };
  } catch (error) {
    return { healthy: false, error: error.message };
  }
}
```

#### 2. API Quota Check
```typescript
function checkApiQuota() {
  const stats = getApiUsageStats();
  return {
    healthy: stats.remainingRequests > 1000,
    dailyUsed: stats.dailyRequestCount,
    dailyLimit: stats.dailyLimit,
    remainingRequests: stats.remainingRequests,
    resetTime: stats.resetTime,
  };
}
```

#### 3. Sync Status
```typescript
async function checkSyncStatus() {
  const lastSync = await prisma.auditLog.findFirst({
    where: { action: 'RESTAURANT_SYNC' },
    orderBy: { createdAt: 'desc' }
  });
  
  const hoursSinceSync = lastSync 
    ? (Date.now() - lastSync.createdAt.getTime()) / (1000 * 60 * 60)
    : 999;
  
  return {
    healthy: hoursSinceSync < 26, // Alert if no sync in 26 hours
    lastSyncTime: lastSync?.createdAt,
    hoursSinceSync,
    lastSyncStats: lastSync?.changes ? JSON.parse(lastSync.changes) : null,
  };
}
```

### Alert Conditions

**Send alert when:**
- ❌ Sync fails completely
- ❌ No sync in 26 hours
- ❌ Restaurant count drops by >10%
- ❌ Active restaurants < 200
- ❌ API quota exhausted
- ⚠️ >5% of updates fail
- ⚠️ Sync takes >30 minutes

### Alert Implementation

```typescript
async function sendAlert(type: string, message: string, data?: any) {
  // Email alert
  await sendEmail({
    to: 'james@ekaty.com',
    from: 'james@ekaty.com',
    subject: `🚨 eKaty Alert: ${type}`,
    html: `
      <h2>${type}</h2>
      <p>${message}</p>
      <pre>${JSON.stringify(data, null, 2)}</pre>
      <p>Timestamp: ${new Date().toISOString()}</p>
      <p><a href="https://ekaty.fly.dev/api/admin/sync">Trigger Manual Sync</a></p>
    `
  });
  
  // Log to database
  await prisma.auditLog.create({
    data: {
      action: `ALERT_${type.toUpperCase().replace(/\s/g, '_')}`,
      entity: 'System',
      entityId: 'monitoring',
      metadata: JSON.stringify({ message, data, timestamp: new Date() })
    }
  });
}
```

---

## Best Practices

### 1. Rate Limiting
```typescript
// Use p-limit for concurrent request control
import pLimit from 'p-limit';
const limiter = pLimit(50); // Max 50 concurrent requests

// Batch requests with delays
for (const restaurant of restaurants) {
  await limiter(() => fetchPlaceDetails(restaurant.place_id));
  await delay(100); // 100ms between requests
}
```

### 2. Idempotency
```typescript
// Always use sourceId (Google Place ID) for lookups
const existing = await prisma.restaurant.findFirst({
  where: { sourceId: googlePlaceId }
});

// Upsert pattern
if (existing) {
  await prisma.restaurant.update({ where: { id: existing.id }, data });
} else {
  await prisma.restaurant.create({ data });
}
```

### 3. Data Validation
```typescript
function validateRestaurantData(restaurant: any): boolean {
  return !!(
    restaurant.name &&
    restaurant.address &&
    restaurant.latitude &&
    restaurant.longitude &&
    restaurant.sourceId
  );
}

// Use before import
if (!validateRestaurantData(restaurant)) {
  console.warn(`Invalid data for ${restaurant.name}`);
  return;
}
```

### 4. Incremental Updates
```typescript
// Only fetch details for restaurants not updated in 24 hours
const staleRestaurants = await prisma.restaurant.findMany({
  where: {
    OR: [
      { lastVerified: { lt: new Date(Date.now() - 24 * 60 * 60 * 1000) } },
      { lastVerified: null }
    ]
  }
});

// Update only stale records
for (const restaurant of staleRestaurants) {
  const details = await fetchPlaceDetails(restaurant.sourceId);
  await updateRestaurant(restaurant.id, details);
}
```

### 5. Backup Before Major Operations
```typescript
// Before sync, backup current data
async function backupDatabase() {
  const restaurants = await prisma.restaurant.findMany();
  fs.writeFileSync(
    `backup-${Date.now()}.json`,
    JSON.stringify(restaurants, null, 2)
  );
}

// Restore if needed
async function restoreDatabase(backupFile: string) {
  const data = JSON.parse(fs.readFileSync(backupFile, 'utf8'));
  for (const restaurant of data) {
    await prisma.restaurant.create({ data });
  }
}
```

### 6. Logging & Observability
```typescript
// Structured logging
console.log(JSON.stringify({
  level: 'info',
  action: 'restaurant_sync',
  phase: 'discovery',
  restaurants_found: 300,
  timestamp: new Date().toISOString(),
}));

// Performance tracking
const startTime = Date.now();
await syncRestaurants();
const duration = Date.now() - startTime;
console.log(`Sync completed in ${duration}ms`);
```

---

## Implementation Guide

### Quick Start

#### 1. Clone Repository
```bash
git clone https://github.com/Swimhack/ekatyfinal2025.git
cd ekatyfinal2025
```

#### 2. Install Dependencies
```bash
npm install
```

#### 3. Configure Environment
```bash
# Copy example env
cp .env.example .env

# Edit .env with your keys
GOOGLE_MAPS_API_KEY="AIza..."
ADMIN_API_KEY="your-secret-key"
DATABASE_URL="file:./dev.db"
```

#### 4. Setup Database
```bash
# Generate Prisma client
npm run prisma:generate

# Run migrations
npm run prisma:migrate

# Initial seed (optional)
npm run prisma:seed
```

#### 5. Test Sync Locally
```bash
# Start dev server
npm run dev

# In another terminal, trigger sync
npm run sync-restaurants

# Check status
npm run sync-restaurants status
```

#### 6. Deploy to Production
```bash
# Set production secrets
fly secrets set GOOGLE_MAPS_API_KEY="AIza..."
fly secrets set ADMIN_API_KEY="your-secret-key"

# Deploy
fly deploy

# Verify deployment
fly status
fly logs
```

### Cron Job Setup (Fly.io)

#### Create `lib/cron/restaurant-sync.ts`:
```typescript
import cron from 'node-cron';

export function startRestaurantSync() {
  // Run daily at 3:00 AM CST
  cron.schedule('0 3 * * *', async () => {
    console.log('Starting scheduled restaurant sync...');
    
    try {
      const response = await fetch(`${process.env.NEXT_PUBLIC_APP_URL}/api/admin/sync`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${process.env.ADMIN_API_KEY}`,
        }
      });
      
      const result = await response.json();
      console.log('Sync completed:', result);
    } catch (error) {
      console.error('Scheduled sync failed:', error);
    }
  }, {
    timezone: 'America/Chicago'
  });
  
  console.log('Restaurant sync cron job started (3:00 AM CST daily)');
}
```

#### Initialize in `instrumentation.ts`:
```typescript
export async function register() {
  if (process.env.NEXT_RUNTIME === 'nodejs') {
    const { startRestaurantSync } = await import('./lib/cron/restaurant-sync');
    startRestaurantSync();
  }
}
```

### Manual Sync Triggers

#### Via CLI:
```bash
npm run sync-restaurants
```

#### Via API:
```bash
curl -X POST https://ekaty.fly.dev/api/admin/sync \
  -H "Authorization: Bearer ekaty-admin-secret-2025" \
  -H "Content-Type: application/json"
```

#### Via Browser:
```javascript
// Admin dashboard button
async function triggerSync() {
  const response = await fetch('/api/admin/sync', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${ADMIN_API_KEY}`,
    }
  });
  
  const result = await response.json();
  alert(`Sync completed: ${result.stats.updated} updated, ${result.stats.created} created`);
}
```

---

## Troubleshooting

### Common Issues

#### 1. "Google API key is not configured"
**Solution:**
```bash
# Check if key is set
fly secrets list

# Set the key
fly secrets set GOOGLE_MAPS_API_KEY="AIza..."

# Restart app
fly machine restart <machine-id>
```

#### 2. "Daily API limit reached"
**Solution:**
```typescript
// Check current usage
const stats = getApiUsageStats();
console.log(stats);

// Increase limit in config (if needed)
export const GOOGLE_CONFIG = {
  dailyLimit: 50000, // Increase from 45000
};

// Wait until quota resets (midnight UTC)
```

#### 3. "No restaurants found"
**Solution:**
```typescript
// Test API connection
npm run test-google-api

// Check search configuration
console.log(KATY_SEARCH_CONFIG);

// Manually test one point
const restaurants = await fetchNearbyRestaurants(
  { lat: 29.7858, lng: -95.8245 },
  5000
);
console.log(`Found: ${restaurants.length}`);
```

#### 4. "Database locked" (SQLite)
**Solution:**
```typescript
// Enable WAL mode for better concurrency
await prisma.$executeRaw`PRAGMA journal_mode=WAL;`;

// Or migrate to PostgreSQL for production
DATABASE_URL="postgresql://..."
```

#### 5. Sync takes too long (>30 minutes)
**Solution:**
```typescript
// Reduce rate limiting delay
await delay(50); // Instead of 100ms

// Increase concurrent requests
const limiter = pLimit(100); // Instead of 50

// Or split sync across multiple runs
const batch1 = restaurants.slice(0, 100);
const batch2 = restaurants.slice(100, 200);
```

### Debug Mode

```typescript
// Enable verbose logging
process.env.DEBUG = 'ekaty:*';

// Log all API requests
client.interceptors.request.use(config => {
  console.log('API Request:', config.url, config.params);
  return config;
});

// Log all database queries
const prisma = new PrismaClient({
  log: ['query', 'info', 'warn', 'error'],
});
```

### Health Check Endpoint

```typescript
// GET /api/health
export async function GET() {
  const dbHealth = await checkDatabaseHealth();
  const apiHealth = await checkApiQuota();
  const syncHealth = await checkSyncStatus();
  
  const overallHealth = dbHealth.healthy && apiHealth.healthy && syncHealth.healthy;
  
  return NextResponse.json({
    healthy: overallHealth,
    timestamp: new Date().toISOString(),
    checks: {
      database: dbHealth,
      googleApi: apiHealth,
      sync: syncHealth,
    }
  }, {
    status: overallHealth ? 200 : 500
  });
}
```

---

## Agent Implementation Checklist

### Phase 1: Setup (Day 1)
- [ ] Create Google Cloud Project
- [ ] Enable Google Places API
- [ ] Generate and restrict API key
- [ ] Set environment variables in Fly.io
- [ ] Test API connection
- [ ] Verify database schema

### Phase 2: Core Functionality (Day 2-3)
- [ ] Implement restaurant discovery
- [ ] Implement detail fetching
- [ ] Build data transformer
- [ ] Create database importer
- [ ] Add deduplication logic
- [ ] Test full sync locally

### Phase 3: Automation (Day 4)
- [ ] Setup cron job
- [ ] Configure daily schedule
- [ ] Test automated sync
- [ ] Verify sync runs at 3 AM

### Phase 4: Error Handling (Day 5)
- [ ] Add retry logic
- [ ] Implement error logging
- [ ] Create audit log entries
- [ ] Test failure scenarios

### Phase 5: Monitoring (Day 6)
- [ ] Setup health checks
- [ ] Configure email alerts
- [ ] Create admin dashboard
- [ ] Test alert conditions

### Phase 6: Optimization (Day 7)
- [ ] Tune rate limiting
- [ ] Optimize database queries
- [ ] Add caching where appropriate
- [ ] Performance testing

### Phase 7: Production (Day 8+)
- [ ] Deploy to production
- [ ] Monitor first few syncs
- [ ] Adjust based on real data
- [ ] Document any custom changes

---

## Appendix

### File Structure
```
ekaty.com-2025/
├── app/
│   └── api/
│       └── admin/
│           └── sync/
│               └── route.ts          # Main sync endpoint
├── lib/
│   ├── google-places/
│   │   ├── client.ts                # Google API client config
│   │   ├── fetcher.ts               # API request functions
│   │   ├── transformer.ts           # Data transformation
│   │   └── importer.ts              # Database import logic
│   ├── cron/
│   │   └── restaurant-sync.ts       # Cron job scheduler
│   └── email.ts                     # Email notifications
├── scripts/
│   └── sync-restaurants.ts          # CLI sync tool
├── prisma/
│   └── schema.prisma                # Database schema
└── instrumentation.ts               # App initialization
```

### Key Functions Reference

| Function | File | Purpose |
|----------|------|---------|
| `fetchAllKatyRestaurants()` | `fetcher.ts` | Discover all restaurants |
| `fetchPlaceDetails()` | `fetcher.ts` | Get detailed restaurant data |
| `transformGooglePlaceToRestaurant()` | `transformer.ts` | Convert Google → eKaty format |
| `importRestaurants()` | `importer.ts` | Save to database (upsert) |
| `deduplicateRestaurants()` | `importer.ts` | Remove duplicate entries |
| `startRestaurantSync()` | `restaurant-sync.ts` | Initialize cron job |

### API Endpoints

| Method | Endpoint | Purpose | Auth |
|--------|----------|---------|------|
| POST | `/api/admin/sync` | Trigger sync | Admin API Key |
| GET | `/api/admin/sync` | Get sync status | Admin API Key |
| GET | `/api/health` | Health check | None |

### Environment Variables

```bash
# Required
GOOGLE_MAPS_API_KEY="AIza..."
ADMIN_API_KEY="ekaty-admin-secret-2025"
DATABASE_URL="file:/data/ekaty.db"

# Optional
GOOGLE_PLACES_RATE_LIMIT="50"
GOOGLE_PLACES_DAILY_LIMIT="45000"
NEXT_PUBLIC_APP_URL="https://ekaty.fly.dev"
RESEND_API_KEY="re_..."  # For email alerts
```

### Useful Commands

```bash
# Development
npm run dev                          # Start dev server
npm run sync-restaurants             # Trigger manual sync
npm run sync-restaurants status      # Check sync status

# Database
npm run prisma:generate              # Generate Prisma client
npm run prisma:migrate              # Run migrations
npm run prisma:studio               # Open database GUI

# Production
fly deploy                           # Deploy to Fly.io
fly status                           # Check app status
fly logs                             # View logs
fly secrets list                     # List environment secrets
fly secrets set KEY="value"          # Set secret
fly machine restart <id>             # Restart machine
```

---

## Support & Contact

**Primary Contact:** james@ekaty.com  
**Repository:** https://github.com/Swimhack/ekatyfinal2025  
**Production URL:** https://ekaty.fly.dev  
**Documentation:** This file + `/docs` folder

**For Issues:**
1. Check Fly.io logs: `fly logs`
2. Review audit logs in database
3. Test Google API: `npm run test-google-api`
4. Contact james@ekaty.com with error details

---

**Last Updated:** 2025-10-28  
**Version:** 1.0  
**Status:** Production Ready ✅
