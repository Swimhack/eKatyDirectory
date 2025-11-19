const fetch = require('node-fetch');

const ADMIN_KEY = 'ekaty-admin-secret-2025';
const BASE_URL = 'http://localhost:3000';

// Mexican restaurants from research - using exact names from Google Places
const mexicanRestaurants = [
  // Top-rated from research
  'Ferso\'s Mexican Cuisine Katy',
  'TJ Birria Y Mas Katy',
  'Castillo\'s Mexican Restaurant Katy',
  'El Asador Mexican Restaurant Katy',
  'Gringo\'s Mexican Kitchen Katy', // Already in list, but checking
  'Los Cucos Mexican Cafe Katy',
  'Ray\'s Mexican Restaurant Katy',
  'Alicia\'s Mexican Grille Katy',
  'Basa\'s Mexican Grill Katy',
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
  console.log(`=== Adding Mexican Restaurants to eKaty Database ===`);
  console.log(`Total restaurants to check: ${mexicanRestaurants.length}\n`);

  const missing = [];
  const existing = [];
  const notFound = [];
  const errors = [];

  let count = 0;

  // Step 1: Check which restaurants are missing
  for (const restaurant of mexicanRestaurants) {
    count++;
    console.log(`[${count}/${mexicanRestaurants.length}] Checking: ${restaurant}`);
    const result = await checkRestaurant(restaurant);

    if (result.error) {
      console.log(`  ✗ Error: ${result.error}`);
      errors.push(restaurant);
    } else if (result.found === false) {
      console.log('  ? Not found on Google Places');
      notFound.push(restaurant);
    } else if (result.restaurant?.inDatabase === true) {
      console.log('  ✓ Already in database');
      existing.push(restaurant);
    } else if (result.restaurant?.inDatabase === false) {
      console.log('  ! Found but NOT in database - will import');
      missing.push({
        name: restaurant,
        placeId: result.restaurant?.placeId,
        data: result.restaurant
      });
    }

    // Rate limit: wait 150ms between requests
    await new Promise(resolve => setTimeout(resolve, 150));
  }

  console.log(`\n=== Check Summary ===`);
  console.log(`✓ Already in database: ${existing.length}`);
  console.log(`! Need to import: ${missing.length}`);
  console.log(`? Not found: ${notFound.length}`);
  console.log(`✗ Errors: ${errors.length}`);

  // Step 2: Import missing restaurants
  if (missing.length > 0) {
    console.log(`\n=== Importing ${missing.length} Missing Restaurants ===\n`);

    let imported = 0;
    let failed = 0;

    for (const restaurant of missing) {
      console.log(`[${imported + failed + 1}/${missing.length}] Importing: ${restaurant.name}`);
      const result = await importRestaurant(restaurant.name, restaurant.data.name);

      if (result.success) {
        console.log(`  ✓ Successfully imported!`);
        console.log(`    ID: ${result.restaurant?.id}`);
        console.log(`    Slug: ${result.restaurant?.slug}`);
        console.log(`    Address: ${result.restaurant?.address}`);
        console.log(`    Phone: ${result.restaurant?.phone}`);
        imported++;
      } else {
        console.log(`  ✗ Import failed: ${result.error || result.message}`);
        failed++;
      }

      // Rate limit: wait 400ms between imports
      await new Promise(resolve => setTimeout(resolve, 400));
    }

    console.log(`\n=== Import Complete ===`);
    console.log(`✓ Successfully imported: ${imported}`);
    console.log(`✗ Failed to import: ${failed}`);
  }

  console.log(`\n=== Final Summary ===`);
  console.log(`Total checked: ${mexicanRestaurants.length}`);
  console.log(`Already existed: ${existing.length}`);
  console.log(`Newly imported: ${missing.length}`);
  console.log(`Not found: ${notFound.length}`);
  console.log(`Errors: ${errors.length}`);

  if (notFound.length > 0) {
    console.log(`\n=== Restaurants Not Found on Google Places ===`);
    notFound.forEach(name => console.log(`  - ${name}`));
  }
}

main().catch(console.error);
