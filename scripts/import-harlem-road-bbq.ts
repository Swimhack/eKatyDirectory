#!/usr/bin/env node
import { config } from 'dotenv';
import { Client } from '@googlemaps/google-maps-services-js';
import { PrismaClient } from '@prisma/client';
import { transformGooglePlaceToRestaurant } from '../lib/google-places/transformer.js';

// Load environment variables
config({ path: '.env.local' });

const client = new Client({});
const prisma = new PrismaClient();

async function importHarlemRoadBBQ() {
  console.log('🔍 Searching for Harlem Road BBQ...\n');

  const apiKey = process.env.GOOGLE_MAPS_API_KEY || process.env.GOOGLE_PLACES_API_KEY;

  if (!apiKey) {
    console.error('❌ Error: Google Maps API key not configured');
    process.exit(1);
  }

  try {
    // Search for Harlem Road BBQ
    const searchResponse = await client.textSearch({
      params: {
        query: 'Harlem Road BBQ Katy TX',
        key: apiKey,
      },
    });

    if (!searchResponse.data.results || searchResponse.data.results.length === 0) {
      console.log('❌ Harlem Road BBQ not found in Google Places');
      process.exit(1);
    }

    const place = searchResponse.data.results[0];
    console.log(`✅ Found: ${place.name}`);
    console.log(`📍 Address: ${place.formatted_address}`);
    console.log(`⭐ Rating: ${place.rating || 'N/A'}`);
    console.log(`📝 Place ID: ${place.place_id}\n`);

    // Fetch detailed information
    console.log('📋 Fetching detailed information...');
    const detailsResponse = await client.placeDetails({
      params: {
        place_id: place.place_id || '',
        fields: [
          'place_id',
          'name',
          'formatted_address',
          'geometry',
          'formatted_phone_number',
          'website',
          'rating',
          'user_ratings_total',
          'price_level',
          'opening_hours',
          'photos',
          'types',
          'business_status',
        ],
        key: apiKey,
      },
    });

    const detailedPlace = detailsResponse.data.result;
    console.log('✅ Detailed information fetched\n');

    // Transform to our restaurant format
    console.log('🔄 Transforming data...');
    const restaurantData = transformGooglePlaceToRestaurant(detailedPlace);

    // Check if already exists
    const existing = await prisma.restaurant.findFirst({
      where: {
        OR: [
          { sourceId: restaurantData.sourceId },
          { name: { contains: 'Harlem Road BBQ' } },
        ],
      },
    });

    if (existing) {
      console.log(`\n🔄 Updating existing restaurant: ${existing.name}`);

      const updated = await prisma.restaurant.update({
        where: { id: existing.id },
        data: {
          ...restaurantData,
          slug: existing.slug, // Keep original slug
          updatedAt: new Date(),
          lastVerified: new Date(),
        },
      });

      console.log('✅ Restaurant updated successfully!');
      console.log(`\n📋 Restaurant Details:`);
      console.log(`   ID: ${updated.id}`);
      console.log(`   Name: ${updated.name}`);
      console.log(`   Slug: ${updated.slug}`);
      console.log(`   Address: ${updated.address}`);
      console.log(`   Phone: ${updated.phone || 'N/A'}`);
      console.log(`   Website: ${updated.website || 'N/A'}`);
      console.log(`   Rating: ${updated.rating || 'N/A'}`);
      console.log(`   Cuisine: ${updated.cuisineTypes}`);
      console.log(`   Active: ${updated.active}`);
    } else {
      console.log(`\n✨ Creating new restaurant: ${restaurantData.name}`);

      // Ensure unique slug
      let slug = restaurantData.slug;
      let counter = 1;

      while (await prisma.restaurant.findUnique({ where: { slug } })) {
        slug = `${restaurantData.slug}-${counter}`;
        counter++;
      }

      const created = await prisma.restaurant.create({
        data: {
          ...restaurantData,
          slug,
        },
      });

      console.log('✅ Restaurant created successfully!');
      console.log(`\n📋 Restaurant Details:`);
      console.log(`   ID: ${created.id}`);
      console.log(`   Name: ${created.name}`);
      console.log(`   Slug: ${created.slug}`);
      console.log(`   Address: ${created.address}`);
      console.log(`   Phone: ${created.phone || 'N/A'}`);
      console.log(`   Website: ${created.website || 'N/A'}`);
      console.log(`   Rating: ${created.rating || 'N/A'}`);
      console.log(`   Cuisine: ${created.cuisineTypes}`);
      console.log(`   Active: ${created.active}`);
    }

    console.log('\n✨ Import completed successfully!');

  } catch (error: any) {
    console.error('❌ Error:', error.message);
    if (error.response?.data) {
      console.error('API Error:', JSON.stringify(error.response.data, null, 2));
    }
    process.exit(1);
  } finally {
    await prisma.$disconnect();
  }
}

importHarlemRoadBBQ().catch(console.error);
