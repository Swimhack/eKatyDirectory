import { Client, PlaceInputType } from '@googlemaps/google-maps-services-js';

// Initialize the Google Maps client
const client = new Client({});

// Configuration
export const GOOGLE_CONFIG = {
  apiKey: process.env.GOOGLE_MAPS_API_KEY || '',
  placesApiKey: process.env.GOOGLE_PLACES_API_KEY || process.env.GOOGLE_MAPS_API_KEY || '',
  rateLimit: parseInt(process.env.GOOGLE_PLACES_RATE_LIMIT || '50'),
  dailyLimit: parseInt(process.env.GOOGLE_PLACES_DAILY_LIMIT || '45000'),
};

// Katy, TX search configuration
export const KATY_SEARCH_CONFIG = {
  center: { lat: 29.7858, lng: -95.8245 },
  radius: 15000, // 15km radius
  searchPoints: [
    { lat: 29.7858, lng: -95.8245, name: 'Downtown Katy' },
    { lat: 29.7377, lng: -95.8247, name: 'Cinco Ranch' },
    { lat: 29.7752, lng: -95.7577, name: 'Seven Lakes' },
    { lat: 29.6911, lng: -95.8988, name: 'Fulshear' },
    { lat: 29.8316, lng: -95.8285, name: 'North Katy' },
    { lat: 29.7294, lng: -95.8981, name: 'West Katy' },
  ],
};

// Validate API key is present
export function validateApiKey(): boolean {
  if (!GOOGLE_CONFIG.apiKey) {
    console.error('Google Maps API key is not configured');
    return false;
  }
  return true;
}

// Export configured client
export default client;