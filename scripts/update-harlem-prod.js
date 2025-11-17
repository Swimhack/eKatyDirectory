const fetch = require('node-fetch');

const ADMIN_KEY = 'ekaty-admin-secret-2025';
const BASE_URL = 'https://ekaty.fly.dev';

async function updateHarlemRoadBBQ() {
  console.log('🔍 Finding and updating Harlem Road BBQ in production...\n');

  try {
    // Find the restaurant
    const searchResponse = await fetch(`${BASE_URL}/api/restaurants?search=harlem`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
    });

    const searchData = await searchResponse.json();
    const harlemRestaurant = searchData.restaurants.find(r => r.name.includes('Harlem Road'));

    if (!harlemRestaurant) {
      console.error('❌ Harlem Road BBQ not found in production');
      process.exit(1);
    }

    console.log(`✅ Found: ${harlemRestaurant.name} (ID: ${harlemRestaurant.id})`);
    console.log(`Current cuisine types: ${harlemRestaurant.cuisineTypes}`);

    // Update the restaurant
    const updateResponse = await fetch(`${BASE_URL}/api/admin/restaurants/${harlemRestaurant.id}`, {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${ADMIN_KEY}`,
      },
      body: JSON.stringify({
        cuisineTypes: 'BBQ, Texas BBQ, Barbecue',
      }),
    });

    if (!updateResponse.ok) {
      const errorData = await updateResponse.json();
      console.error('❌ Failed to update:', errorData.error || 'Unknown error');
      process.exit(1);
    }

    const updatedData = await updateResponse.json();
    console.log(`\n✅ Successfully updated!`);
    console.log(`New cuisine types: ${updatedData.restaurant.cuisineTypes}`);

  } catch (error) {
    console.error('❌ Error:', error.message);
    process.exit(1);
  }
}

updateHarlemRoadBBQ();
