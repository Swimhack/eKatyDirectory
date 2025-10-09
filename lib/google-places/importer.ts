import { PrismaClient } from '@prisma/client';
import { transformGooglePlaceToRestaurant, transformGooglePlacesToRestaurants } from './transformer';

const prisma = new PrismaClient();

// Import a single restaurant
export async function importRestaurant(googlePlace: any): Promise<any> {
  try {
    const restaurantData = transformGooglePlaceToRestaurant(googlePlace);
    
    // Check if restaurant already exists
    const existing = await prisma.restaurant.findFirst({
      where: {
        OR: [
          { sourceId: restaurantData.sourceId },
          { slug: restaurantData.slug }
        ]
      }
    });

    if (existing) {
      // Update existing restaurant
      console.log(`Updating existing restaurant: ${restaurantData.name}`);
      
      return await prisma.restaurant.update({
        where: { id: existing.id },
        data: {
          ...restaurantData,
          slug: existing.slug, // Keep original slug to avoid breaking URLs
          updatedAt: new Date(),
          lastVerified: new Date(),
        }
      });
    } else {
      // Create new restaurant
      console.log(`Creating new restaurant: ${restaurantData.name}`);
      
      // Ensure unique slug
      let slug = restaurantData.slug;
      let counter = 1;
      
      while (await prisma.restaurant.findUnique({ where: { slug } })) {
        slug = `${restaurantData.slug}-${counter}`;
        counter++;
      }
      
      return await prisma.restaurant.create({
        data: {
          ...restaurantData,
          slug,
        }
      });
    }
  } catch (error) {
    console.error('Error importing restaurant:', error);
    throw error;
  }
}

// Batch import multiple restaurants
export async function importRestaurants(
  googlePlaces: any[],
  options: {
    updateExisting?: boolean;
    onProgress?: (current: number, total: number, restaurant?: any) => void;
  } = {}
): Promise<{
  created: number;
  updated: number;
  failed: number;
  restaurants: any[];
}> {
  const results = {
    created: 0,
    updated: 0,
    failed: 0,
    restaurants: [] as any[],
  };

  const transformedRestaurants = transformGooglePlacesToRestaurants(googlePlaces);

  for (let i = 0; i < transformedRestaurants.length; i++) {
    const restaurantData = transformedRestaurants[i];
    
    try {
      // Check if restaurant already exists
      const existing = await prisma.restaurant.findFirst({
        where: {
          OR: [
            { sourceId: restaurantData.sourceId },
            { slug: restaurantData.slug }
          ]
        }
      });

      if (existing) {
        if (options.updateExisting) {
          // Update existing restaurant
          const updated = await prisma.restaurant.update({
            where: { id: existing.id },
            data: {
              ...restaurantData,
              slug: existing.slug, // Keep original slug
              updatedAt: new Date(),
              lastVerified: new Date(),
            }
          });
          
          results.updated++;
          results.restaurants.push(updated);
          
          console.log(`Updated: ${restaurantData.name}`);
        } else {
          console.log(`Skipped existing: ${restaurantData.name}`);
        }
      } else {
        // Create new restaurant with unique slug
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
          }
        });
        
        results.created++;
        results.restaurants.push(created);
        
        console.log(`Created: ${restaurantData.name}`);
      }
      
      if (options.onProgress) {
        options.onProgress(i + 1, transformedRestaurants.length, restaurantData);
      }
    } catch (error) {
      console.error(`Failed to import ${restaurantData.name}:`, error);
      results.failed++;
    }
  }

  return results;
}

// Update restaurants that haven't been verified recently
export async function updateStaleRestaurants(
  daysOld: number = 30,
  limit: number = 50
): Promise<any[]> {
  const cutoffDate = new Date();
  cutoffDate.setDate(cutoffDate.getDate() - daysOld);

  const staleRestaurants = await prisma.restaurant.findMany({
    where: {
      source: 'google_places',
      OR: [
        { lastVerified: { lt: cutoffDate } },
        { lastVerified: null }
      ]
    },
    take: limit,
    orderBy: { lastVerified: 'asc' }
  });

  console.log(`Found ${staleRestaurants.length} restaurants needing update`);
  
  const updatedRestaurants = [];
  
  for (const restaurant of staleRestaurants) {
    if (restaurant.sourceId) {
      try {
        // This would need to fetch fresh data from Google
        // For now, just update the lastVerified timestamp
        const updated = await prisma.restaurant.update({
          where: { id: restaurant.id },
          data: { lastVerified: new Date() }
        });
        
        updatedRestaurants.push(updated);
        console.log(`Updated verification for: ${restaurant.name}`);
      } catch (error) {
        console.error(`Failed to update ${restaurant.name}:`, error);
      }
    }
  }

  return updatedRestaurants;
}

// Get import statistics
export async function getImportStats() {
  const total = await prisma.restaurant.count();
  const googleSourced = await prisma.restaurant.count({
    where: { source: 'google_places' }
  });
  
  const lastVerifiedCounts = await prisma.restaurant.groupBy({
    by: ['source'],
    _count: true,
    where: {
      lastVerified: {
        gte: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000) // Last 30 days
      }
    }
  });

  const cuisineStats = await prisma.restaurant.findMany({
    select: { cuisineTypes: true }
  });

  const cuisineCount = new Map();
  cuisineStats.forEach(r => {
    const cuisines = r.cuisineTypes.split(',').map(c => c.trim());
    cuisines.forEach(cuisine => {
      cuisineCount.set(cuisine, (cuisineCount.get(cuisine) || 0) + 1);
    });
  });

  return {
    totalRestaurants: total,
    googleSourced,
    recentlyVerified: lastVerifiedCounts,
    topCuisines: Array.from(cuisineCount.entries())
      .sort((a, b) => b[1] - a[1])
      .slice(0, 10)
      .map(([cuisine, count]) => ({ cuisine, count })),
  };
}

// Clean up duplicate restaurants
export async function deduplicateRestaurants() {
  const restaurants = await prisma.restaurant.findMany({
    orderBy: { createdAt: 'asc' }
  });

  const seen = new Map();
  const duplicates = [];

  for (const restaurant of restaurants) {
    const key = restaurant.sourceId || restaurant.name.toLowerCase();
    
    if (seen.has(key)) {
      duplicates.push(restaurant);
    } else {
      seen.set(key, restaurant);
    }
  }

  console.log(`Found ${duplicates.length} potential duplicates`);

  // Remove duplicates (keeping the first occurrence)
  for (const duplicate of duplicates) {
    try {
      await prisma.restaurant.delete({
        where: { id: duplicate.id }
      });
      console.log(`Removed duplicate: ${duplicate.name}`);
    } catch (error) {
      console.error(`Failed to remove duplicate ${duplicate.name}:`, error);
    }
  }

  return duplicates.length;
}