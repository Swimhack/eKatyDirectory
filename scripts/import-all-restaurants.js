const fetch = require('node-fetch');

const ADMIN_KEY = 'ekaty-admin-secret-2025';
const BASE_URL = 'http://localhost:3001';

// Comprehensive list of restaurants to import
const restaurantsToImport = [
  // Asian Town Restaurants (already imported, but checking)
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
  'AMA Kitchen Katy',

  // Additional Chinese Restaurants
  'Tiger Noodle House Katy',
  'Taste of China Katy',
  'Chung Wang BBQ Katy',
  'P.F. Chang\'s Katy',
  'Panda Express Katy',
  'China Garden Katy',
  'Hunan Chef Katy',
  'Peking Chinese Restaurant Katy',

  // Japanese Restaurants
  'Kokai Sushi Lounge Katy',
  'Yaki Sushi AYCE Katy',
  'Gyu-Kaku Japanese BBQ Katy',
  'Twenty Five Teishoku House Katy',
  'Airi Ramen Katy',
  'Samurai Japanese Steakhouse Katy',
  'Sushi Sake Katy',
  'Ra Sushi Katy',
  'Kaze Sushi Bar Katy',

  // Korean Restaurants
  'Spicy House Katy',
  'Soju 101 Katy',
  'Gen Korean BBQ Katy',
  'Korean Noodle House Katy',

  // Vietnamese Restaurants
  'Yummy Quan Hu Tieu Nam Vang Katy',
  'Corner 99 Viet Kitchen Katy',
  'To Soc Chon Katy',
  'Pho Binh Katy',
  'Viet Kitchen Katy',

  // Thai Restaurants
  'Ginger Thai Katy',
  'Thai Spice Asian Gourmet Katy',
  'Thai Cottage Katy',
  'Siam Cuisine Katy',

  // Pan-Asian/Fusion
  'Chocho Hot Pot Katy',
  'Jia Kitchen Katy',
  'GiAu Bar N Bites Katy',

  // Indian Restaurants
  'Maharaja Bhog Katy',
  'Clay Oven Katy',
  'Bombay Brasserie Katy',
  'India\'s Restaurant Katy',
  'Biryani Pot Katy',

  // Mexican Restaurants
  'Gringo\'s Mexican Kitchen Katy',
  'Chuy\'s Katy',
  'Taco Cabana Katy',
  'Torchy\'s Tacos Katy',
  'El Tiempo Cantina Katy',
  'Pappasito\'s Cantina Katy',
  'Ninfa\'s on Navigation Katy',
  'Los Cucos Mexican Cafe Katy',
  'Escalante\'s Mexican Grille Katy',
  'Blue Agave Katy',

  // BBQ & Southern
  'Killen\'s BBQ Katy',
  'Rudy\'s Country Store and Bar-B-Q Katy',
  'Spring Creek Barbeque Katy',
  'Dickey\'s Barbecue Pit Katy',
  'The Brisket House Katy',

  // American/Burgers
  'Five Guys Katy',
  'In-N-Out Burger Katy',
  'Whataburger Katy',
  'Shake Shack Katy',
  'The Burger Joint Katy',
  'Buffalo Wild Wings Katy',
  'Twin Peaks Katy',
  'Local Foods Katy',

  // Italian
  'Carrabba\'s Italian Grill Katy',
  'Olive Garden Katy',
  'Romano\'s Macaroni Grill Katy',
  'Zio\'s Italian Kitchen Katy',
  'Grimaldi\'s Pizzeria Katy',

  // Seafood
  'Pappadeaux Seafood Kitchen Katy',
  'Saltgrass Steak House Katy',
  'Red Lobster Katy',
  'Landry\'s Seafood House Katy',
  'Truluck\'s Ocean\'s Finest Seafood Katy',

  // Steakhouses
  'Perry\'s Steakhouse Katy',
  'Texas Roadhouse Katy',
  'LongHorn Steakhouse Katy',
  'Outback Steakhouse Katy',
  'III Forks Katy',

  // Breakfast/Brunch
  'Snooze AM Eatery Katy',
  'First Watch Katy',
  'Another Broken Egg Cafe Katy',
  'IHOP Katy',
  'Denny\'s Katy',

  // Mediterranean/Middle Eastern
  'Aladdin Mediterranean Cuisine Katy',
  'Niko Niko\'s Katy',
  'Cazba Mediterranean Grille Katy',
  'Shawarma Press Katy',

  // Fast Casual
  'Chipotle Mexican Grill Katy',
  'Panera Bread Katy',
  'Jason\'s Deli Katy',
  'Freshii Katy',
  'Newk\'s Eatery Katy',

  // Chains/Popular
  'Chili\'s Grill & Bar Katy',
  'Applebee\'s Grill + Bar Katy',
  'TGI Fridays Katy',
  'BJ\'s Restaurant & Brewhouse Katy',
  'The Cheesecake Factory Katy',
  'Maggiano\'s Little Italy Katy',
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
  console.log(`=== Comprehensive Restaurant Import for Katy ===`);
  console.log(`Total restaurants to check: ${restaurantsToImport.length}\n`);

  const missing = [];
  const existing = [];
  const notFound = [];
  const errors = [];

  let count = 0;

  for (const restaurant of restaurantsToImport) {
    count++;
    console.log(`[${count}/${restaurantsToImport.length}] Checking: ${restaurant}`);
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

  console.log(`\n=== Summary ===`);
  console.log(`✓ Already in database: ${existing.length}`);
  console.log(`! Need to import: ${missing.length}`);
  console.log(`? Not found: ${notFound.length}`);
  console.log(`✗ Errors: ${errors.length}`);

  if (missing.length > 0) {
    console.log(`\n=== Importing ${missing.length} restaurants ===\n`);

    let imported = 0;
    let failed = 0;

    for (const restaurant of missing) {
      console.log(`[${imported + failed + 1}/${missing.length}] Importing: ${restaurant.name}`);
      const result = await importRestaurant(restaurant.name, restaurant.data.name);

      if (result.success) {
        console.log(`  ✓ Successfully imported!`);
        console.log(`    ID: ${result.restaurant?.id}`);
        console.log(`    Slug: ${result.restaurant?.slug}`);
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
  console.log(`Total checked: ${restaurantsToImport.length}`);
  console.log(`Already existed: ${existing.length}`);
  console.log(`Newly imported: ${missing.length}`);
  console.log(`Not found: ${notFound.length}`);
  console.log(`Errors: ${errors.length}`);
}

main().catch(console.error);
