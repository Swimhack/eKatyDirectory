# eKaty Database Setup Guide

This guide will help you set up the Supabase database and seed it with restaurant data for Katy, Texas.

## Prerequisites

1. **Supabase Project**: You should have a Supabase project set up
   - Project URL: `https://xlelbtiigxiodsbrqtgkls.supabase.co`
   - Service role key configured in environment variables

2. **Environment Variables**: `.env.local` file should be configured with:
   - `NEXT_PUBLIC_SUPABASE_URL`
   - `NEXT_PUBLIC_SUPABASE_ANON_KEY`
   - `SUPABASE_SERVICE_ROLE_KEY`

## Step 1: Create Database Schema

1. **Go to your Supabase Dashboard**
   - Navigate to https://supabase.com/dashboard
   - Select your `xlelbtiigxiodsbrqtgkls` project

2. **Open SQL Editor**
   - Click on "SQL Editor" in the left sidebar
   - Click "New Query"

3. **Run the Schema SQL**
   - Copy the entire contents of `lib/supabase/schema.sql`
   - Paste it into the SQL editor
   - Click "Run" to execute the schema creation

This will create:
- ✅ All required tables (users, restaurants, reviews, favorites, spins)
- ✅ Proper indexes for performance
- ✅ Row Level Security (RLS) policies
- ✅ Automatic triggers for rating calculations
- ✅ User profile creation triggers

## Step 2: Seed Restaurant Data

### Method 1: Local Script (Recommended)

```bash
# Run the seeding script locally
npm run seed-db
```

This will:
- Connect to your Supabase database
- Check for existing restaurants (avoids duplicates)
- Insert 20+ real Katy, TX restaurants with complete data
- Add sample reviews for featured restaurants

### Method 2: Web Admin Interface

1. **Start the development server**
   ```bash
   npm run dev
   ```

2. **Navigate to Admin Panel**
   - Go to http://localhost:3000/admin
   - Enter your Supabase Service Role Key
   - Click "🌱 Seed Restaurant Database"

### Method 3: Production API Endpoint

For the deployed app at https://ekaty.fly.dev:

```bash
curl -X POST https://ekaty.fly.dev/api/admin/seed \
  -H "Authorization: Bearer YOUR_SUPABASE_SERVICE_ROLE_KEY" \
  -H "Content-Type: application/json"
```

## Step 3: Verify Data

After seeding, you should have:

### Restaurants (20+ entries)
- **Mexican**: Chuy's, El Tiempo Cantina, Guadalajara Mexican Restaurant
- **American/Burgers**: Whataburger, The Rustic, Hopdoddy Burger Bar
- **Asian**: Pei Wei Asian Kitchen, Pho Saigon, Sushi Katana
- **Italian**: Romano's Macaroni Grill, Russo's New York Pizzeria
- **BBQ**: Rudy's Country Store and Bar-B-Q
- **Fine Dining**: Perry's Steakhouse & Grille
- **Breakfast**: First Watch, Snooze
- **Local Favorites**: Local Foods, Mo's Irish Pub, The Rouxpour

### Data Quality
- ✅ **Complete addresses** with GPS coordinates
- ✅ **Phone numbers** for all restaurants
- ✅ **Business hours** for each day of the week
- ✅ **Price levels** ($ to $$$$)
- ✅ **Categories** for filtering and search
- ✅ **Featured restaurants** marked for homepage display
- ✅ **Website URLs** where available

### Sample Reviews
- Featured restaurants will have initial reviews
- Ratings from 4-5 stars with realistic review text
- Sample user account created for reviews

## Step 4: Test the Application

1. **Visit the live app**: https://ekaty.fly.dev
2. **Test key features**:
   - **Homepage**: Should show featured restaurants
   - **Discover page** (/discover): Browse and filter restaurants
   - **Grub Roulette** (/spinner): Random restaurant selection
   - **Restaurant detail pages**: Click any restaurant for full details
   - **Search functionality**: Try searching for "Mexican" or "Burgers"

## Troubleshooting

### Common Issues

**Error: "Missing environment variables"**
- Ensure `.env.local` exists and has all required variables
- Check that variable names match exactly (no typos)

**Error: "relation 'restaurants' does not exist"**
- The database schema hasn't been created yet
- Run the SQL schema in Supabase SQL Editor first

**Error: "Unauthorized - Invalid admin token"**
- You're using the anon key instead of the service role key
- Use the longer service role key for admin operations

**Error: "All seed restaurants already exist"**
- The seeding was already completed successfully
- Data is already in your database - check Supabase dashboard

### Verify Database in Supabase

1. Go to Supabase Dashboard → Table Editor
2. Select "restaurants" table
3. You should see 20+ restaurants with complete data
4. Check "reviews" table for sample reviews
5. Verify "users" table has the sample reviewer account

## Data Structure Reference

### Restaurant Fields
```javascript
{
  name: string,           // Restaurant name
  address: string,        // Full address
  lat: number,           // Latitude coordinate
  lng: number,           // Longitude coordinate  
  phone: string,         // Phone number
  website: string|null,  // Website URL
  categories: string[],  // Cuisine categories
  hours: object,         // Operating hours by day
  price_level: 1-4,      // Price range ($ to $$$$)
  photos: string[],      // Photo URLs (empty initially)
  featured: boolean,     // Featured on homepage
  source: string,        // Data source identifier
}
```

### Categories Available
- Mexican, Tex-Mex, American, Burgers, Asian, Chinese, Japanese, Vietnamese
- Italian, Pizza, BBQ, Southern, Steakhouse, Fine Dining, Seafood
- Breakfast, Brunch, Fast Food, Fast Casual, Casual Dining, Upscale Casual
- Irish, Pub, Sports Bar, Live Music, Healthy Options, Local, Family-owned

## Next Steps

After successful seeding:

1. **Update Featured Restaurants**: Modify which restaurants are featured
2. **Add Restaurant Photos**: Upload photos to Supabase Storage
3. **Encourage User Reviews**: Get real users to add authentic reviews
4. **Monitor Performance**: Check database performance and add indexes if needed
5. **Regular Updates**: Keep restaurant information current (hours, phone, etc.)

The database is now ready to serve the Katy, Texas community! 🎉