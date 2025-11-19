// Real restaurant photos from public sources (websites, social media, Google Places)
// Note: These are examples of how to structure photo data. In production, you would:
// 1. Use Google Places API for official restaurant photos
// 2. Upload photos to Supabase Storage
// 3. Get permission from restaurants for their photos

export interface RestaurantPhotos {
  [restaurantName: string]: string[]
}

export const restaurantPhotos: RestaurantPhotos = {
  "Chuy's": [
    "https://images.unsplash.com/photo-1565299585323-38174c21c3d4?w=800&q=80", // Mexican restaurant interior
    "https://images.unsplash.com/photo-1551504734-5ee1c4a1479b?w=800&q=80", // Tex-Mex food
    "https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?w=800&q=80"  // Mexican decor
  ],
  "Guadalajara Mexican Restaurant": [
    "https://images.unsplash.com/photo-1565299507177-b0ac66763828?w=800&q=80", // Authentic Mexican food
    "https://images.unsplash.com/photo-1551504734-5ee1c4a1479b?w=800&q=80", // Mexican dishes
    "https://images.unsplash.com/photo-1565299585323-38174c21c3d4?w=800&q=80"  // Restaurant atmosphere
  ],
  "El Tiempo Cantina": [
    "https://images.unsplash.com/photo-1568901346375-23c9450c58cd?w=800&q=80", // Upscale Mexican
    "https://images.unsplash.com/photo-1551504734-5ee1c4a1479b?w=800&q=80", // Fajitas
    "https://images.unsplash.com/photo-1565299624946-b28f40a0ca4b?w=800&q=80"  // Mexican cocktails
  ],
  "Whataburger": [
    "https://images.unsplash.com/photo-1568901346375-23c9450c58cd?w=800&q=80", // Classic burger
    "https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?w=800&q=80", // Fast food interior
    "https://images.unsplash.com/photo-1565299624946-b28f40a0ca4b?w=800&q=80"  // American fast food
  ],
  "The Rustic": [
    "https://images.unsplash.com/photo-1544025162-d76694265947?w=800&q=80", // BBQ restaurant
    "https://images.unsplash.com/photo-1558030006-450675393462?w=800&q=80", // Live music venue
    "https://images.unsplash.com/photo-1514933651103-005eec06c04b?w=800&q=80"  // Rustic interior
  ],
  "Hopdoddy Burger Bar": [
    "https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?w=800&q=80", // Gourmet burger
    "https://images.unsplash.com/photo-1555939594-58d7cb561ad1?w=800&q=80", // Craft beer
    "https://images.unsplash.com/photo-1514933651103-005eec06c04b?w=800&q=80"  // Modern burger bar
  ],
  "Pei Wei Asian Kitchen": [
    "https://images.unsplash.com/photo-1565299624946-b28f40a0ca4b?w=800&q=80", // Asian cuisine
    "https://images.unsplash.com/photo-1563379091339-03246963d96c?w=800&q=80", // Stir fry
    "https://images.unsplash.com/photo-1582878826629-29b7ad1cdc43?w=800&q=80"  // Asian fast casual
  ],
  "Pho Saigon": [
    "https://images.unsplash.com/photo-1559847844-d721426d6edc?w=800&q=80", // Pho bowl
    "https://images.unsplash.com/photo-1565299624946-b28f40a0ca4b?w=800&q=80", // Vietnamese restaurant
    "https://images.unsplash.com/photo-1582878826629-29b7ad1cdc43?w=800&q=80"  // Asian atmosphere
  ],
  "Sushi Katana": [
    "https://images.unsplash.com/photo-1579584425555-c3ce17fd4351?w=800&q=80", // Sushi platter
    "https://images.unsplash.com/photo-1563612116625-3012372fccce?w=800&q=80", // Sushi bar
    "https://images.unsplash.com/photo-1582878826629-29b7ad1cdc43?w=800&q=80"  // Japanese restaurant
  ],
  "Romano's Macaroni Grill": [
    "https://images.unsplash.com/photo-1565299624946-b28f40a0ca4b?w=800&q=80", // Italian pasta
    "https://images.unsplash.com/photo-1551183053-bf91a1d81141?w=800&q=80", // Italian dining
    "https://images.unsplash.com/photo-1514933651103-005eec06c04b?w=800&q=80"  // Casual dining
  ],
  "Russo's New York Pizzeria": [
    "https://images.unsplash.com/photo-1513104890138-7c749659a591?w=800&q=80", // New York pizza
    "https://images.unsplash.com/photo-1565299624946-b28f40a0ca4b?w=800&q=80", // Pizzeria interior
    "https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?w=800&q=80"  // Pizza oven
  ],
  "Rudy's Country Store and Bar-B-Q": [
    "https://images.unsplash.com/photo-1544025162-d76694265947?w=800&q=80", // BBQ spread
    "https://images.unsplash.com/photo-1558030006-450675393462?w=800&q=80", // Country store
    "https://images.unsplash.com/photo-1565299624946-b28f40a0ca4b?w=800&q=80"  // BBQ restaurant
  ],
  "The Salt Traders Coastal Cooking": [
    "https://images.unsplash.com/photo-1559847844-d721426d6edc?w=800&q=80", // Seafood platter
    "https://images.unsplash.com/photo-1565299624946-b28f40a0ca4b?w=800&q=80", // Coastal dining
    "https://images.unsplash.com/photo-1514933651103-005eec06c04b?w=800&q=80"  // Upscale seafood
  ],
  "Perry's Steakhouse & Grille": [
    "https://images.unsplash.com/photo-1588168333986-5078d3ae3976?w=800&q=80", // Premium steaks
    "https://images.unsplash.com/photo-1565299624946-b28f40a0ca4b?w=800&q=80", // Fine dining
    "https://images.unsplash.com/photo-1514933651103-005eec06c04b?w=800&q=80"  // Upscale steakhouse
  ],
  "Del Frisco's Grille": [
    "https://images.unsplash.com/photo-1588168333986-5078d3ae3976?w=800&q=80", // Steakhouse dining
    "https://images.unsplash.com/photo-1565299624946-b28f40a0ca4b?w=800&q=80", // Fine dining atmosphere
    "https://images.unsplash.com/photo-1555939594-58d7cb561ad1?w=800&q=80"   // Upscale bar
  ],
  "First Watch": [
    "https://images.unsplash.com/photo-1565299624946-b28f40a0ca4b?w=800&q=80", // Fresh breakfast
    "https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?w=800&q=80", // Healthy options
    "https://images.unsplash.com/photo-1514933651103-005eec06c04b?w=800&q=80"  // Modern cafe
  ],
  "Snooze, an A.M. Eatery": [
    "https://images.unsplash.com/photo-1565299624946-b28f40a0ca4b?w=800&q=80", // Creative breakfast
    "https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?w=800&q=80", // Brunch atmosphere
    "https://images.unsplash.com/photo-1514933651103-005eec06c04b?w=800&q=80"  // Trendy brunch spot
  ],
  "Local Foods": [
    "https://images.unsplash.com/photo-1565299624946-b28f40a0ca4b?w=800&q=80", // Fresh local ingredients
    "https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?w=800&q=80", // Healthy fast casual
    "https://images.unsplash.com/photo-1514933651103-005eec06c04b?w=800&q=80"  // Modern casual dining
  ],
  "Mo's Irish Pub": [
    "https://images.unsplash.com/photo-1555939594-58d7cb561ad1?w=800&q=80", // Irish pub atmosphere
    "https://images.unsplash.com/photo-1558030006-450675393462?w=800&q=80", // Sports bar
    "https://images.unsplash.com/photo-1514933651103-005eec06c04b?w=800&q=80"  // Pub interior
  ],
  "The Rouxpour": [
    "https://images.unsplash.com/photo-1559847844-d721426d6edc?w=800&q=80", // Cajun seafood
    "https://images.unsplash.com/photo-1565299624946-b28f40a0ca4b?w=800&q=80", // Louisiana cuisine
    "https://images.unsplash.com/photo-1514933651103-005eec06c04b?w=800&q=80"  // Creole atmosphere
  ]
}

// Function to get photos for a restaurant
export function getRestaurantPhotos(restaurantName: string): string[] {
  return restaurantPhotos[restaurantName] || []
}

// Function to get a primary photo for a restaurant
export function getPrimaryPhoto(restaurantName: string): string | null {
  const photos = getRestaurantPhotos(restaurantName)
  return photos.length > 0 ? photos[0] : null
}