#!/usr/bin/env node
import { config } from 'dotenv';
import { fetchAllKatyRestaurants, fetchDetailedRestaurantData, getApiUsageStats } from '../lib/google-places/fetcher';
import { importRestaurants, getImportStats, deduplicateRestaurants } from '../lib/google-places/importer';
import { validateApiKey } from '../lib/google-places/client';

// Load environment variables
config({ path: '.env.local' });

// Command line colors for better readability
const colors = {
  reset: '\x1b[0m',
  bright: '\x1b[1m',
  green: '\x1b[32m',
  yellow: '\x1b[33m',
  red: '\x1b[31m',
  cyan: '\x1b[36m',
};

function log(message: string, color: string = colors.reset) {
  console.log(`${color}${message}${colors.reset}`);
}

async function main() {
  log('\n🍴 eKaty Restaurant Import from Google Places', colors.bright);
  log('='.repeat(50), colors.cyan);

  // Check if API key is configured
  if (!validateApiKey()) {
    log('\n❌ Error: Google Maps API key is not configured!', colors.red);
    log('Please add GOOGLE_MAPS_API_KEY to your .env.local file', colors.yellow);
    log('\nSteps to get an API key:', colors.cyan);
    log('1. Go to https://console.cloud.google.com');
    log('2. Create a new project or select existing');
    log('3. Enable "Places API (New)"');
    log('4. Go to Credentials and create an API key');
    log('5. Add the key to .env.local as GOOGLE_MAPS_API_KEY=your_key_here');
    process.exit(1);
  }

  try {
    // Step 1: Discover all restaurants
    log('\n📍 Step 1: Discovering restaurants in Katy, TX area...', colors.cyan);
    const restaurants = await fetchAllKatyRestaurants();
    
    if (restaurants.length === 0) {
      log('No restaurants found. Please check your API key and quota.', colors.yellow);
      process.exit(1);
    }

    log(`✅ Found ${restaurants.length} unique restaurants!`, colors.green);

    // Step 2: Fetch detailed data
    log('\n📋 Step 2: Fetching detailed information...', colors.cyan);
    log('This may take several minutes. Please be patient...', colors.yellow);
    
    const detailedRestaurants = await fetchDetailedRestaurantData(
      restaurants,
      (current, total) => {
        // Update progress in place
        process.stdout.write(`\rProgress: ${current}/${total} (${Math.round(current/total * 100)}%)`);
      }
    );
    
    console.log(''); // New line after progress
    log(`✅ Fetched details for ${detailedRestaurants.length} restaurants!`, colors.green);

    // Step 3: Import to database
    log('\n💾 Step 3: Importing to database...', colors.cyan);
    
    const importResults = await importRestaurants(detailedRestaurants, {
      updateExisting: true,
      onProgress: (current, total, restaurant) => {
        process.stdout.write(`\rImporting: ${current}/${total} - ${restaurant?.name || 'Processing...'}`);
      }
    });
    
    console.log(''); // New line after progress
    
    // Step 4: Clean up duplicates
    log('\n🧹 Step 4: Cleaning up duplicates...', colors.cyan);
    const duplicatesRemoved = await deduplicateRestaurants();
    
    // Display results
    log('\n📊 Import Results:', colors.bright);
    log('='.repeat(50), colors.cyan);
    log(`✅ Created: ${importResults.created} new restaurants`, colors.green);
    log(`🔄 Updated: ${importResults.updated} existing restaurants`, colors.yellow);
    log(`❌ Failed: ${importResults.failed} imports`, colors.red);
    log(`🧹 Duplicates removed: ${duplicatesRemoved}`, colors.cyan);
    
    // Display API usage
    const usage = getApiUsageStats();
    log('\n📈 API Usage:', colors.bright);
    log(`Requests used: ${usage.dailyRequestCount}/${usage.dailyLimit}`, colors.cyan);
    log(`Remaining today: ${usage.remainingRequests}`, colors.green);
    
    // Get final stats
    const stats = await getImportStats();
    log('\n📊 Database Statistics:', colors.bright);
    log(`Total restaurants: ${stats.totalRestaurants}`, colors.cyan);
    log(`Google sourced: ${stats.googleSourced}`, colors.cyan);
    
    if (stats.topCuisines.length > 0) {
      log('\n🍽️ Top Cuisines:', colors.bright);
      stats.topCuisines.forEach((item, index) => {
        log(`  ${index + 1}. ${item.cuisine}: ${item.count} restaurants`);
      });
    }
    
    log('\n✨ Import completed successfully!', colors.green);
    log('\nNext steps:', colors.cyan);
    log('1. Visit your website to see the imported restaurants');
    log('2. Set up scheduled updates to keep data fresh');
    log('3. Configure image caching if needed');
    
  } catch (error: any) {
    log(`\n❌ Import failed: ${error.message}`, colors.red);
    console.error(error);
    process.exit(1);
  }
}

// Handle graceful shutdown
process.on('SIGINT', () => {
  log('\n\n⚠️ Import interrupted by user', colors.yellow);
  process.exit(0);
});

// Run the import
main().catch(error => {
  log(`\n❌ Unexpected error: ${error.message}`, colors.red);
  console.error(error);
  process.exit(1);
});