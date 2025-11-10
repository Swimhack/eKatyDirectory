const fetch = require('node-fetch');

const ADMIN_KEY = 'ekaty-admin-secret-2025';
const BASE_URL = 'http://localhost:3001';

const asianTownRestaurants = [
  'Mala Sichuan Bistro Katy',
  'Phat Eatery Katy',
  'Haidilao Hotpot Katy',
  'Supreme Dumplings Katy',
  'Ten Seconds Yunnan Rice Noodle Katy',
  'Yummy Pho Bo Ne Katy',
  'Hong Kong Food Street Katy',
  'Loves Dumpling House Katy',
  'Uncle Chin Kitchen Katy',
  'Bon Galbi Katy',
  'Tan Tan Wok Katy',
  'AMA Kitchen Katy'
];

async function checkRestaurant(name) {
  try {
    const response = await fetch(
      `${BASE_URL}/api/admin/import-restaurant?q=${encodeURIComponent(name)}`,
      {
        headers: {
          'Authorization': `Bearer ${ADMIN_KEY}`
        }
      }
    );

    const data = await response.json();
    return { name, ...data };
  } catch (error) {
    return { name, error: error.message };
  }
}

async function importRestaurant(name, fullName) {
  try {
    const response = await fetch(
      `${BASE_URL}/api/admin/import-restaurant`,
      {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${ADMIN_KEY}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ restaurantName: fullName })
      }
    );

    const data = await response.json();
    return { name, ...data };
  } catch (error) {
    return { name, error: error.message };
  }
}

async function main() {
  console.log('=== Checking Asian Town Restaurants ===\n');

  const missing = [];

  for (const restaurant of asianTownRestaurants) {
    console.log(`Checking: ${restaurant}`);
    const result = await checkRestaurant(restaurant);

    if (result.error) {
      console.log(`  ✗ Error: ${result.error}`);
    } else if (result.found === false) {
      console.log('  ✗ Not found on Google Places');
    } else if (result.restaurant?.inDatabase === true) {
      console.log('  ✓ Already in database');
      console.log(`    Name: ${result.restaurant?.name}`);
      console.log(`    Address: ${result.restaurant?.address}`);
    } else if (result.restaurant?.inDatabase === false) {
      console.log('  ! Found on Google Places but NOT in database');
      console.log(`    Place ID: ${result.restaurant?.placeId}`);
      console.log(`    Address: ${result.restaurant?.address}`);
      console.log(`    Rating: ${result.restaurant?.rating}`);
      missing.push({
        name: restaurant,
        placeId: result.restaurant?.placeId,
        data: result.restaurant
      });
    } else {
      console.log(`  ? Unknown status`);
      console.log(`    Result: ${JSON.stringify(result, null, 2)}`);
    }

    console.log('');

    // Rate limit: wait 200ms between requests
    await new Promise(resolve => setTimeout(resolve, 200));
  }

  if (missing.length > 0) {
    console.log(`\n=== Found ${missing.length} restaurants to import ===\n`);

    for (const restaurant of missing) {
      console.log(`Importing: ${restaurant.name}`);
      const result = await importRestaurant(restaurant.name, restaurant.data.name);

      if (result.success) {
        console.log(`  ✓ Successfully imported!`);
        console.log(`    ID: ${result.restaurant?.id}`);
        console.log(`    Slug: ${result.restaurant?.slug}`);
      } else {
        console.log(`  ✗ Import failed: ${result.error || result.message}`);
      }

      console.log('');

      // Rate limit: wait 500ms between imports
      await new Promise(resolve => setTimeout(resolve, 500));
    }
  } else {
    console.log('\n✓ All Asian Town restaurants are already in the database!');
  }

  console.log('\n=== Complete ===');
}

main().catch(console.error);
