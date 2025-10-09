#!/usr/bin/env node
import { config } from 'dotenv';
import client, { GOOGLE_CONFIG, validateApiKey } from '../lib/google-places/client';

// Load environment variables
config({ path: '.env.local' });

async function testGoogleApi() {
  console.log('\n🔍 Testing Google Places API Connection...\n');
  
  // Check if API key exists
  if (!validateApiKey()) {
    console.error('❌ No API key found in environment variables.');
    console.log('\nPlease add to .env.local:');
    console.log('GOOGLE_MAPS_API_KEY=your_api_key_here\n');
    process.exit(1);
  }
  
  console.log('✅ API Key found');
  console.log(`📍 Testing with Downtown Katy coordinates...`);
  
  try {
    // Test with a simple nearby search for one restaurant
    const response = await client.placesNearby({
      params: {
        location: { lat: 29.7858, lng: -95.8245 },
        radius: 1000, // 1km radius for test
        type: 'restaurant',
        key: GOOGLE_CONFIG.apiKey,
      },
      timeout: 10000,
    });
    
    if (response.data.status === 'OK') {
      console.log(`\n✅ API Connection successful!`);
      console.log(`📊 Found ${response.data.results.length} restaurants in test area`);
      
      if (response.data.results.length > 0) {
        const sample = response.data.results[0];
        console.log('\n📍 Sample restaurant:');
        console.log(`   Name: ${sample.name}`);
        console.log(`   Address: ${sample.vicinity}`);
        console.log(`   Rating: ${sample.rating || 'N/A'}`);
        console.log(`   Price Level: ${sample.price_level || 'N/A'}`);
      }
      
      console.log('\n✨ Your API key is working correctly!');
      console.log('You can now run the full import with: npm run import:google\n');
      
    } else {
      console.error(`\n❌ API returned status: ${response.data.status}`);
      
      if (response.data.status === 'REQUEST_DENIED') {
        console.log('\nPossible issues:');
        console.log('1. API key is invalid');
        console.log('2. Places API (New) is not enabled in Google Cloud Console');
        console.log('3. API key restrictions are blocking requests\n');
      } else if (response.data.status === 'OVER_QUERY_LIMIT') {
        console.log('\nYou have exceeded your daily quota.');
        console.log('Wait until tomorrow or upgrade your Google Cloud billing.\n');
      }
      
      if (response.data.error_message) {
        console.log(`Error message: ${response.data.error_message}`);
      }
    }
    
  } catch (error: any) {
    console.error('\n❌ Failed to connect to Google API');
    console.error(`Error: ${error.message}`);
    
    if (error.response?.data) {
      console.error('API Response:', error.response.data);
    }
    
    console.log('\nTroubleshooting steps:');
    console.log('1. Verify your API key is correct');
    console.log('2. Ensure Places API (New) is enabled at:');
    console.log('   https://console.cloud.google.com/apis/library/places-backend.googleapis.com');
    console.log('3. Check API key restrictions in Google Cloud Console');
    console.log('4. Verify billing is enabled on your Google Cloud project\n');
    
    process.exit(1);
  }
}

testGoogleApi().catch(console.error);