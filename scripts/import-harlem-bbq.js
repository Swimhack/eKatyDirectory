const fetch = require('node-fetch');

const ADMIN_KEY = 'ekaty-admin-secret-2025';
const BASE_URL = 'http://localhost:3000';

async function importHarlemRoadBBQ() {
  console.log('🔍 Importing Harlem Road BBQ from Google Places...\n');

  try {
    const response = await fetch(`${BASE_URL}/api/admin/import-restaurant`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${ADMIN_KEY}`,
      },
      body: JSON.stringify({
        restaurantName: 'Harlem Road BBQ',
      }),
    });

    const data = await response.json();

    if (!response.ok) {
      console.error('❌ Failed to import:', data.error || data.details || 'Unknown error');
      process.exit(1);
    }

    console.log('✅ Successfully imported Harlem Road BBQ!');
    console.log('\n📋 Restaurant Details:');
    console.log(`   Name: ${data.restaurant.name}`);
    console.log(`   Address: ${data.restaurant.address}`);
    console.log(`   Cuisine: ${data.restaurant.cuisineTypes}`);
    console.log(`   Rating: ${data.restaurant.rating || 'N/A'}`);
    console.log(`   Phone: ${data.restaurant.phone || 'N/A'}`);
    console.log(`   Website: ${data.restaurant.website || 'N/A'}`);
    console.log(`   Slug: ${data.restaurant.slug}`);
    console.log(`   Active: ${data.restaurant.active}`);

  } catch (error) {
    console.error('❌ Error importing restaurant:', error.message);
    process.exit(1);
  }
}

importHarlemRoadBBQ();
