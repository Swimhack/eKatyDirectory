import { NextRequest, NextResponse } from 'next/server';
import { fetchAllKatyRestaurants, fetchDetailedRestaurantData, getApiUsageStats } from '@/lib/google-places/fetcher';
import { importRestaurants, getImportStats } from '@/lib/google-places/importer';
import { validateApiKey } from '@/lib/google-places/client';

// This endpoint should be protected in production
// Add authentication middleware or check for admin role

export async function GET(request: NextRequest) {
  // Get current stats without running import
  try {
    const stats = await getImportStats();
    const usage = getApiUsageStats();
    
    return NextResponse.json({
      status: 'ready',
      stats,
      apiUsage: usage,
    });
  } catch (error: any) {
    return NextResponse.json(
      { error: 'Failed to get stats', message: error.message },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  // Check for admin authorization (simplified for now)
  const authHeader = request.headers.get('authorization');
  
  // In production, validate this properly
  if (process.env.NODE_ENV === 'production' && authHeader !== `Bearer ${process.env.ADMIN_API_KEY}`) {
    return NextResponse.json(
      { error: 'Unauthorized' },
      { status: 401 }
    );
  }
  
  // Validate API key
  if (!validateApiKey()) {
    return NextResponse.json(
      { error: 'Google API key not configured' },
      { status: 500 }
    );
  }
  
  try {
    const body = await request.json();
    const { mode = 'test' } = body; // 'test' or 'full'
    
    let restaurants;
    
    if (mode === 'test') {
      // Test mode: fetch only from downtown Katy with small radius
      console.log('Running test import (Downtown Katy only)...');
      restaurants = await fetchNearbyRestaurants(
        { lat: 29.7858, lng: -95.8245 },
        2000 // 2km radius for test
      );
      restaurants = restaurants.slice(0, 10); // Limit to 10 for test
    } else {
      // Full mode: fetch all Katy restaurants
      console.log('Running full import (all Katy areas)...');
      restaurants = await fetchAllKatyRestaurants();
    }
    
    if (restaurants.length === 0) {
      return NextResponse.json(
        { error: 'No restaurants found' },
        { status: 404 }
      );
    }
    
    // Fetch detailed data
    const detailedRestaurants = await fetchDetailedRestaurantData(restaurants);
    
    // Import to database
    const importResults = await importRestaurants(detailedRestaurants, {
      updateExisting: true,
    });
    
    // Get final stats
    const stats = await getImportStats();
    const usage = getApiUsageStats();
    
    return NextResponse.json({
      success: true,
      mode,
      results: {
        discovered: restaurants.length,
        detailed: detailedRestaurants.length,
        created: importResults.created,
        updated: importResults.updated,
        failed: importResults.failed,
      },
      stats,
      apiUsage: usage,
    });
    
  } catch (error: any) {
    console.error('Import error:', error);
    return NextResponse.json(
      { error: 'Import failed', message: error.message },
      { status: 500 }
    );
  }
}

// Helper function for the API route
async function fetchNearbyRestaurants(
  location: { lat: number; lng: number },
  radius: number
): Promise<any[]> {
  const { fetchNearbyRestaurants: fetch } = await import('@/lib/google-places/fetcher');
  return fetch(location, radius);
}