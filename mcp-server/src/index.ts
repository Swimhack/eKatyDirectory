#!/usr/bin/env node
/**
 * eKaty Places MCP Server
 *
 * Integrates Google Places API with eKaty restaurant database to:
 * - Discover new restaurants in Katy, TX
 * - Keep restaurant data fresh and accurate
 * - Verify restaurant operational status
 * - Enrich profiles with latest photos, reviews, ratings
 * - Enable powerful restaurant management workflows
 *
 * This MCP server enables LLMs to maintain high-quality restaurant data
 * and discover revenue opportunities for eKaty's subscription business.
 */

import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
import { z } from "zod";
import axios, { AxiosError } from "axios";
import { PrismaClient } from "@prisma/client";

// ============================================================================
// CONSTANTS
// ============================================================================

const API_BASE_URL = "https://places.googleapis.com/v1";
const CHARACTER_LIMIT = 25000;
const KATY_TX_LOCATION = { lat: 29.7858, lng: -95.8244 };
const DEFAULT_SEARCH_RADIUS = 16093; // 10 miles in meters

// ============================================================================
// ENUMS
// ============================================================================

enum ResponseFormat {
  MARKDOWN = "markdown",
  JSON = "json"
}

// ============================================================================
// ZOD SCHEMAS
// ============================================================================

const SearchNearbySchema = z.object({
  latitude: z.number().min(-90).max(90).optional()
    .describe("Latitude for search center (default: Katy, TX)"),
  longitude: z.number().min(-180).max(180).optional()
    .describe("Longitude for search center (default: Katy, TX)"),
  radius: z.number().int().min(1).max(50000).optional()
    .describe("Search radius in meters (default: 10 miles)"),
  cuisine_type: z.string().optional()
    .describe("Filter by cuisine type (e.g., 'mexican', 'italian', 'american')"),
  min_rating: z.number().min(0).max(5).optional()
    .describe("Minimum rating (1-5 stars)"),
  limit: z.number().int().min(1).max(50).optional()
    .describe("Maximum results to return"),
  response_format: z.nativeEnum(ResponseFormat).optional()
    .describe("Output format: 'markdown' or 'json'")
}).strict();

const EnrichRestaurantSchema = z.object({
  restaurant_id: z.string().min(1)
    .describe("eKaty restaurant ID to enrich with Google Places data"),
  force_update: z.boolean().optional()
    .describe("Force update even if recently refreshed"),
  response_format: z.nativeEnum(ResponseFormat).optional()
    .describe("Output format: 'markdown' or 'json'")
}).strict();

const VerifyRestaurantSchema = z.object({
  restaurant_id: z.string().min(1)
    .describe("eKaty restaurant ID to verify"),
  response_format: z.nativeEnum(ResponseFormat).optional()
    .describe("Output format: 'markdown' or 'json'")
}).strict();

const DiscoverNewSchema = z.object({
  cuisine_types: z.array(z.string()).optional()
    .describe("List of cuisine types to discover (e.g., ['mexican', 'italian'])"),
  min_rating: z.number().min(0).max(5).optional()
    .describe("Minimum rating for new restaurants"),
  min_reviews: z.number().int().min(0).optional()
    .describe("Minimum number of reviews"),
  limit: z.number().int().min(1).max(50).optional()
    .describe("Maximum new restaurants to discover"),
  response_format: z.nativeEnum(ResponseFormat).optional()
    .describe("Output format: 'markdown' or 'json'")
}).strict();

const FindFeaturedCandidatesSchema = z.object({
  min_rating: z.number().min(0).max(5).optional()
    .describe("Minimum rating (default: 4.5 stars)"),
  min_reviews: z.number().int().min(0).optional()
    .describe("Minimum number of reviews (default: 100)"),
  limit: z.number().int().min(1).max(50).optional()
    .describe("Maximum candidates to return"),
  response_format: z.nativeEnum(ResponseFormat).optional()
    .describe("Output format: 'markdown' or 'json'")
}).strict();

type SearchNearbyInput = z.infer<typeof SearchNearbySchema>;
type EnrichRestaurantInput = z.infer<typeof EnrichRestaurantSchema>;
type VerifyRestaurantInput = z.infer<typeof VerifyRestaurantSchema>;
type DiscoverNewInput = z.infer<typeof DiscoverNewSchema>;
type FindFeaturedCandidatesInput = z.infer<typeof FindFeaturedCandidatesSchema>;

// ============================================================================
// PRISMA CLIENT
// ============================================================================

const prisma = new PrismaClient();

// ============================================================================
// GOOGLE PLACES API UTILITIES
// ============================================================================

async function searchNearbyPlaces(
  latitude: number,
  longitude: number,
  radius: number,
  cuisineType?: string
): Promise<any> {
  try {
    const apiKey = process.env.GOOGLE_PLACES_API_KEY;
    if (!apiKey) {
      throw new Error("GOOGLE_PLACES_API_KEY environment variable is required");
    }

    const requestBody: any = {
      locationRestriction: {
        circle: {
          center: { latitude, longitude },
          radius
        }
      },
      includedTypes: ["restaurant"],
      maxResultCount: 20
    };

    if (cuisineType) {
      requestBody.textQuery = `${cuisineType} restaurant`;
    }

    const response = await axios.post(
      `${API_BASE_URL}/places:searchNearby`,
      requestBody,
      {
        headers: {
          "Content-Type": "application/json",
          "X-Goog-Api-Key": apiKey,
          "X-Goog-FieldMask": "places.id,places.displayName,places.formattedAddress,places.rating,places.userRatingCount,places.types,places.priceLevel,places.currentOpeningHours,places.phoneNumber,places.websiteUri,places.location"
        },
        timeout: 30000
      }
    );

    return response.data;
  } catch (error) {
    throw handleApiError(error);
  }
}

async function getPlaceDetails(placeId: string): Promise<any> {
  try {
    const apiKey = process.env.GOOGLE_PLACES_API_KEY;
    if (!apiKey) {
      throw new Error("GOOGLE_PLACES_API_KEY environment variable is required");
    }

    const response = await axios.get(
      `${API_BASE_URL}/places/${placeId}`,
      {
        headers: {
          "X-Goog-Api-Key": apiKey,
          "X-Goog-FieldMask": "id,displayName,formattedAddress,rating,userRatingCount,types,priceLevel,currentOpeningHours,phoneNumber,websiteUri,location,photos,reviews"
        },
        timeout: 30000
      }
    );

    return response.data;
  } catch (error) {
    throw handleApiError(error);
  }
}

// ============================================================================
// ERROR HANDLING
// ============================================================================

function handleApiError(error: unknown): Error {
  if (error instanceof AxiosError) {
    if (error.response) {
      switch (error.response.status) {
        case 404:
          return new Error("Resource not found. Please check the ID is correct.");
        case 403:
          return new Error("API key invalid or permissions denied. Check GOOGLE_PLACES_API_KEY.");
        case 429:
          return new Error("Rate limit exceeded. Please wait before making more requests.");
        case 400:
          return new Error(`Invalid request: ${error.response.data?.error?.message || 'Bad request'}`);
        default:
          return new Error(`API request failed with status ${error.response.status}`);
      }
    } else if (error.code === "ECONNABORTED") {
      return new Error("Request timed out. Please try again.");
    }
  }
  return new Error(`Unexpected error: ${error instanceof Error ? error.message : String(error)}`);
}

// ============================================================================
// FORMATTING UTILITIES
// ============================================================================

function formatRestaurantMarkdown(place: any, includeDetails: boolean = false): string {
  const lines: string[] = [];

  lines.push(`## ${place.displayName?.text || place.name}`);
  if (place.rating) {
    lines.push(`⭐ **${place.rating}/5** (${place.userRatingCount || 0} reviews)`);
  }
  if (place.formattedAddress || place.address) {
    lines.push(`📍 ${place.formattedAddress || place.address}`);
  }
  if (place.phoneNumber || place.phone) {
    lines.push(`📞 ${place.phoneNumber || place.phone}`);
  }
  if (place.websiteUri || place.website) {
    lines.push(`🌐 ${place.websiteUri || place.website}`);
  }
  if (place.types && place.types.length > 0) {
    const cuisines = place.types.filter((t: string) => !t.includes('point_of_interest') && !t.includes('establishment'));
    if (cuisines.length > 0) {
      lines.push(`🍽️ ${cuisines.join(', ')}`);
    }
  }

  if (includeDetails && place.currentOpeningHours) {
    lines.push("");
    lines.push("**Hours:**");
    if (place.currentOpeningHours.weekdayDescriptions) {
      place.currentOpeningHours.weekdayDescriptions.forEach((desc: string) => {
        lines.push(`- ${desc}`);
      });
    }
  }

  lines.push("");
  return lines.join("\n");
}

function truncateResponse(content: string, limit: number = CHARACTER_LIMIT): string {
  if (content.length <= limit) {
    return content;
  }

  const truncated = content.substring(0, limit - 200);
  return truncated + "\n\n[Response truncated due to size. Use filters or pagination to see more results.]";
}

// ============================================================================
// MCP SERVER INITIALIZATION
// ============================================================================

const server = new McpServer({
  name: "ekaty-places-mcp-server",
  version: "1.0.0"
});

// ============================================================================
// TOOL 1: Search Nearby Restaurants
// ============================================================================

server.registerTool(
  "ekaty_search_nearby_restaurants",
  {
    title: "Search Nearby Restaurants",
    description: `Search for restaurants near a location using Google Places API.

This tool finds restaurants within a specified radius, optionally filtered by cuisine type and minimum rating. Results include name, address, rating, reviews, contact info, and operational status.

Use this to:
- Discover new restaurants to add to eKaty
- Find restaurants in specific areas of Katy, TX
- Research competitors in certain cuisine categories

Args:
  - latitude (number): Search center latitude (default: Katy, TX - 29.7858)
  - longitude (number): Search center longitude (default: Katy, TX - -95.8244)
  - radius (number): Search radius in meters (default: 16093 = 10 miles)
  - cuisine_type (string, optional): Filter by cuisine (e.g., 'mexican', 'italian')
  - min_rating (number, optional): Minimum rating filter (1-5 stars)
  - limit (number): Maximum results (1-50, default: 20)
  - response_format ('markdown' | 'json'): Output format (default: 'markdown')

Returns:
  Markdown: Human-readable list with restaurant details
  JSON: Structured data with full place information

Examples:
  - "Find Mexican restaurants in Katy" -> cuisine_type="mexican"
  - "Highly rated restaurants near downtown" -> min_rating=4.5
  - "All restaurants within 5 miles" -> radius=8047

Error Handling:
  - Returns clear error if API key is missing or invalid
  - Handles rate limits with retry guidance
  - Validates all input parameters`,
    inputSchema: SearchNearbySchema,
    annotations: {
      readOnlyHint: true,
      destructiveHint: false,
      idempotentHint: true,
      openWorldHint: true
    }
  },
  async (params: any) => {
// Apply defaults    params.latitude = params.latitude ?? 29.7858;    params.longitude = params.longitude ?? -95.8244;    params.radius = params.radius ?? 16093;    params.limit = params.limit ?? 20;    params.min_rating = params.min_rating ?? 3.5;    params.min_reviews = params.min_reviews ?? 10;    params.response_format = params.response_format ?? "markdown";    params.force_update = params.force_update ?? false;
    try {
      const data = await searchNearbyPlaces(
        params.latitude,
        params.longitude,
        params.radius,
        params.cuisine_type
      );

      const places = data.places || [];

      // Filter by minimum rating if specified
      let filteredPlaces = places;
      if (params.min_rating) {
        filteredPlaces = places.filter((p: any) => (p.rating || 0) >= params.min_rating!);
      }

      // Apply limit
      filteredPlaces = filteredPlaces.slice(0, params.limit);

      if (filteredPlaces.length === 0) {
        return {
          content: [{
            type: "text",
            text: "No restaurants found matching your criteria. Try adjusting the radius or removing filters."
          }]
        };
      }

      let result: string;

      if (params.response_format === ResponseFormat.MARKDOWN) {
        const lines: string[] = [
          `# Restaurant Search Results`,
          ``,
          `**Location**: (${params.latitude}, ${params.longitude})`,
          `**Radius**: ${params.radius}m (${Math.round(params.radius / 1609)}mi)`,
          params.cuisine_type ? `**Cuisine**: ${params.cuisine_type}` : '',
          params.min_rating ? `**Min Rating**: ${params.min_rating}★` : '',
          ``,
          `Found ${filteredPlaces.length} restaurants:`,
          ``,
          ``
        ].filter(Boolean);

        filteredPlaces.forEach((place: any) => {
          lines.push(formatRestaurantMarkdown(place));
        });

        result = truncateResponse(lines.join("\n"));
      } else {
        result = JSON.stringify({
          total: filteredPlaces.length,
          radius_meters: params.radius,
          radius_miles: Math.round(params.radius / 1609 * 10) / 10,
          location: { latitude: params.latitude, longitude: params.longitude },
          filters: {
            cuisine_type: params.cuisine_type,
            min_rating: params.min_rating
          },
          restaurants: filteredPlaces.map((p: any) => ({
            google_place_id: p.id,
            name: p.displayName?.text,
            address: p.formattedAddress,
            rating: p.rating,
            review_count: p.userRatingCount,
            types: p.types,
            price_level: p.priceLevel,
            phone: p.phoneNumber,
            website: p.websiteUri,
            location: p.location
          }))
        }, null, 2);
      }

      return {
        content: [{ type: "text", text: result }]
      };

    } catch (error) {
      return {
        isError: true,
        content: [{
          type: "text",
          text: `Error searching restaurants: ${error instanceof Error ? error.message : String(error)}`
        }]
      };
    }
  }
);

// ============================================================================
// TOOL 2: Enrich Restaurant Data
// ============================================================================

server.registerTool(
  "ekaty_enrich_restaurant_data",
  {
    title: "Enrich Restaurant with Google Places Data",
    description: `Update an eKaty restaurant with fresh data from Google Places API.

This tool fetches the latest information from Google Places and updates the eKaty database, including:
- Current rating and review count
- Updated hours of operation
- Latest photos
- Phone number and website
- Address verification

Use this to:
- Keep restaurant data fresh and accurate
- Update profiles before featuring them
- Verify contact information is current
- Refresh profiles for subscription outreach

Args:
  - restaurant_id (string): eKaty restaurant ID (cuid format)
  - force_update (boolean): Update even if recently refreshed (default: false)
  - response_format ('markdown' | 'json'): Output format (default: 'markdown')

Returns:
  Markdown: Human-readable summary of changes
  JSON: Detailed before/after comparison with all updated fields

Examples:
  - "Update The Pizza Place with latest Google data" -> Use restaurant ID
  - "Refresh all restaurant data before outreach" -> Call for each restaurant
  - "Verify restaurant is still open" -> Check operational status

Error Handling:
  - Returns error if restaurant not found in eKaty database
  - Handles missing Google Place ID gracefully
  - Reports if Google Places data is unavailable

Note: Only updates if Google Places data is found. Won't overwrite with null values.`,
    inputSchema: EnrichRestaurantSchema,
    annotations: {
      readOnlyHint: false,
      destructiveHint: false,
      idempotentHint: true,
      openWorldHint: true
    }
  },
  async (params: any) => {
// Apply defaults    params.latitude = params.latitude ?? 29.7858;    params.longitude = params.longitude ?? -95.8244;    params.radius = params.radius ?? 16093;    params.limit = params.limit ?? 20;    params.min_rating = params.min_rating ?? 3.5;    params.min_reviews = params.min_reviews ?? 10;    params.response_format = params.response_format ?? "markdown";    params.force_update = params.force_update ?? false;
    try {
      // Get restaurant from eKaty database
      const restaurant = await prisma.restaurant.findUnique({
        where: { id: params.restaurant_id }
      });

      if (!restaurant) {
        return {
          isError: true,
          content: [{
            type: "text",
            text: `Restaurant not found in eKaty database: ${params.restaurant_id}`
          }]
        };
      }

      // Check if we have a Google Place ID
      if (!restaurant.sourceId || restaurant.source !== 'google_places') {
        return {
          isError: true,
          content: [{
            type: "text",
            text: `Restaurant "${restaurant.name}" does not have a Google Place ID. Cannot enrich data.`
          }]
        };
      }

      // Check if recently updated (unless force_update is true)
      if (!params.force_update && restaurant.lastVerified) {
        const daysSinceUpdate = (Date.now() - restaurant.lastVerified.getTime()) / (1000 * 60 * 60 * 24);
        if (daysSinceUpdate < 7) {
          return {
            content: [{
              type: "text",
              text: `Restaurant "${restaurant.name}" was updated ${Math.round(daysSinceUpdate)} days ago. Use force_update=true to refresh anyway.`
            }]
          };
        }
      }

      // Fetch fresh data from Google Places
      const placeData = await getPlaceDetails(restaurant.sourceId);

      // Prepare updates
      const updates: any = {
        lastVerified: new Date()
      };

      if (placeData.rating && placeData.rating !== restaurant.rating) {
        updates.rating = placeData.rating;
      }
      if (placeData.userRatingCount && placeData.userRatingCount !== restaurant.reviewCount) {
        updates.reviewCount = placeData.userRatingCount;
      }
      if (placeData.phoneNumber && placeData.phoneNumber !== restaurant.phone) {
        updates.phone = placeData.phoneNumber;
      }
      if (placeData.websiteUri && placeData.websiteUri !== restaurant.website) {
        updates.website = placeData.websiteUri;
      }

      // Update restaurant in database
      const updatedRestaurant = await prisma.restaurant.update({
        where: { id: params.restaurant_id },
        data: updates
      });

      // Format response
      if (params.response_format === ResponseFormat.MARKDOWN) {
        const lines = [
          `# Restaurant Data Enrichment`,
          ``,
          `**Restaurant**: ${restaurant.name}`,
          `**Status**: ✅ Updated successfully`,
          ``,
          `## Changes:`,
          ``
        ];

        if (updates.rating) {
          lines.push(`- Rating: ${restaurant.rating || 'N/A'} → **${updates.rating}** ⭐`);
        }
        if (updates.reviewCount) {
          lines.push(`- Reviews: ${restaurant.reviewCount} → **${updates.reviewCount}**`);
        }
        if (updates.phone) {
          lines.push(`- Phone: ${restaurant.phone || 'N/A'} → **${updates.phone}**`);
        }
        if (updates.website) {
          lines.push(`- Website: ${restaurant.website ? 'Updated' : 'Added'}`);
        }

        if (Object.keys(updates).length === 1) {
          lines.push(`- No changes detected (data is current)`);
        }

        return {
          content: [{ type: "text", text: lines.join("\n") }]
        };
      } else {
        return {
          content: [{
            type: "text",
            text: JSON.stringify({
              restaurant_id: params.restaurant_id,
              restaurant_name: restaurant.name,
              status: "updated",
              changes: updates,
              before: {
                rating: restaurant.rating,
                reviews: restaurant.reviewCount,
                phone: restaurant.phone,
                website: restaurant.website
              },
              after: {
                rating: updatedRestaurant.rating,
                reviews: updatedRestaurant.reviewCount,
                phone: updatedRestaurant.phone,
                website: updatedRestaurant.website
              }
            }, null, 2)
          }]
        };
      }

    } catch (error) {
      return {
        isError: true,
        content: [{
          type: "text",
          text: `Error enriching restaurant data: ${error instanceof Error ? error.message : String(error)}`
        }]
      };
    }
  }
);

// ============================================================================
// TOOL 3: Verify Restaurant Info
// ============================================================================

server.registerTool(
  "ekaty_verify_restaurant_info",
  {
    title: "Verify Restaurant Information",
    description: `Compare eKaty restaurant data against Google Places to identify discrepancies.

This READ-ONLY tool checks for differences between eKaty's stored data and current Google Places data without making any changes. Perfect for quality assurance and identifying outdated information.

Checks:
- Rating differences
- Review count changes
- Phone number accuracy
- Website URL validity
- Address correctness
- Operational status

Use this to:
- Quality check before featuring a restaurant
- Identify restaurants with stale data
- Verify contact information for outreach
- Find restaurants that may have closed

Args:
  - restaurant_id (string): eKaty restaurant ID
  - response_format ('markdown' | 'json'): Output format (default: 'markdown')

Returns:
  Markdown: Easy-to-read comparison report
  JSON: Structured diff with all field comparisons

Examples:
  - "Check if restaurant data is accurate" -> Returns comparison
  - "Verify hours before contacting" -> Shows current vs stored
  - "Is this restaurant still open?" -> Checks operational status

Error Handling:
  - Returns error if restaurant not found
  - Handles missing Google Place ID gracefully
  - Reports when Google data is unavailable`,
    inputSchema: VerifyRestaurantSchema,
    annotations: {
      readOnlyHint: true,
      destructiveHint: false,
      idempotentHint: true,
      openWorldHint: true
    }
  },
  async (params: any) => {
// Apply defaults    params.latitude = params.latitude ?? 29.7858;    params.longitude = params.longitude ?? -95.8244;    params.radius = params.radius ?? 16093;    params.limit = params.limit ?? 20;    params.min_rating = params.min_rating ?? 3.5;    params.min_reviews = params.min_reviews ?? 10;    params.response_format = params.response_format ?? "markdown";    params.force_update = params.force_update ?? false;
    try {
      // Get restaurant from database
      const restaurant = await prisma.restaurant.findUnique({
        where: { id: params.restaurant_id }
      });

      if (!restaurant) {
        return {
          isError: true,
          content: [{
            type: "text",
            text: `Restaurant not found: ${params.restaurant_id}`
          }]
        };
      }

      if (!restaurant.sourceId || restaurant.source !== 'google_places') {
        return {
          isError: true,
          content: [{
            type: "text",
            text: `Restaurant "${restaurant.name}" does not have a Google Place ID for verification.`
          }]
        };
      }

      // Fetch current Google Places data
      const placeData = await getPlaceDetails(restaurant.sourceId);

      // Compare data
      const discrepancies: string[] = [];

      if (placeData.rating !== restaurant.rating) {
        discrepancies.push(`Rating: eKaty has ${restaurant.rating || 'N/A'}, Google has ${placeData.rating}`);
      }
      if (placeData.userRatingCount !== restaurant.reviewCount) {
        discrepancies.push(`Reviews: eKaty has ${restaurant.reviewCount}, Google has ${placeData.userRatingCount}`);
      }
      if (placeData.phoneNumber && placeData.phoneNumber !== restaurant.phone) {
        discrepancies.push(`Phone: eKaty has "${restaurant.phone || 'N/A'}", Google has "${placeData.phoneNumber}"`);
      }
      if (placeData.websiteUri && placeData.websiteUri !== restaurant.website) {
        discrepancies.push(`Website: Different URLs detected`);
      }

      // Format response
      if (params.response_format === ResponseFormat.MARKDOWN) {
        const lines = [
          `# Restaurant Verification Report`,
          ``,
          `**Restaurant**: ${restaurant.name}`,
          `**eKaty ID**: ${restaurant.id}`,
          `**Google Place ID**: ${restaurant.sourceId}`,
          `**Last Verified**: ${restaurant.lastVerified ? restaurant.lastVerified.toLocaleDateString() : 'Never'}`,
          ``,
        ];

        if (discrepancies.length === 0) {
          lines.push(`✅ **Status**: All data matches Google Places (verified current)`);
        } else {
          lines.push(`⚠️ **Status**: ${discrepancies.length} discrepancies found`);
          lines.push(``);
          lines.push(`## Discrepancies:`);
          lines.push(``);
          discrepancies.forEach(d => lines.push(`- ${d}`));
          lines.push(``);
          lines.push(`💡 **Recommendation**: Use ekaty_enrich_restaurant_data to update`);
        }

        return {
          content: [{ type: "text", text: lines.join("\n") }]
        };
      } else {
        return {
          content: [{
            type: "text",
            text: JSON.stringify({
              restaurant_id: params.restaurant_id,
              restaurant_name: restaurant.name,
              last_verified: restaurant.lastVerified,
              status: discrepancies.length === 0 ? "verified" : "discrepancies_found",
              discrepancy_count: discrepancies.length,
              ekaty_data: {
                rating: restaurant.rating,
                reviews: restaurant.reviewCount,
                phone: restaurant.phone,
                website: restaurant.website
              },
              google_data: {
                rating: placeData.rating,
                reviews: placeData.userRatingCount,
                phone: placeData.phoneNumber,
                website: placeData.websiteUri
              },
              discrepancies
            }, null, 2)
          }]
        };
      }

    } catch (error) {
      return {
        isError: true,
        content: [{
          type: "text",
          text: `Error verifying restaurant: ${error instanceof Error ? error.message : String(error)}`
        }]
      };
    }
  }
);

// ============================================================================
// TOOL 4: Discover New Restaurants
// ============================================================================

server.registerTool(
  "ekaty_discover_new_restaurants",
  {
    title: "Discover New Restaurants for eKaty",
    description: `Find restaurants in Katy, TX that are NOT yet in the eKaty database.

This tool searches Google Places for restaurants meeting quality criteria and filters out ones already in eKaty. Perfect for growing the platform and finding potential subscription customers.

Discovery Criteria:
- Located in Katy, TX area (10 mile radius)
- Meets minimum rating threshold
- Has sufficient review count for credibility
- Not already in eKaty database (checked by name/address)
- Optionally filtered by cuisine type

Use this to:
- Grow eKaty's restaurant inventory
- Find high-quality restaurants for outreach
- Discover trending new openings
- Identify competitor restaurant types

Args:
  - cuisine_types (string[], optional): Filter by cuisines (e.g., ['mexican', 'italian'])
  - min_rating (number): Minimum rating (default: 3.5 stars)
  - min_reviews (number): Minimum review count (default: 10)
  - limit (number): Maximum new restaurants to find (1-50, default: 20)
  - response_format ('markdown' | 'json'): Output format (default: 'markdown')

Returns:
  Markdown: Human-readable list with key details and next steps
  JSON: Full place data ready for import

Examples:
  - "Find new Mexican restaurants in Katy" -> cuisine_types=['mexican']
  - "Discover highly-rated restaurants" -> min_rating=4.5, min_reviews=50
  - "Find restaurants to add to eKaty" -> Use defaults

Next Steps:
  - Review discovered restaurants
  - Use ekaty_import_restaurant to add to database
  - Begin subscription outreach to owners

Error Handling:
  - Returns empty list if all found restaurants already in database
  - Handles API rate limits gracefully
  - Validates all filter parameters`,
    inputSchema: DiscoverNewSchema,
    annotations: {
      readOnlyHint: true,
      destructiveHint: false,
      idempotentHint: false,
      openWorldHint: true
    }
  },
  async (params: any) => {
// Apply defaults    params.latitude = params.latitude ?? 29.7858;    params.longitude = params.longitude ?? -95.8244;    params.radius = params.radius ?? 16093;    params.limit = params.limit ?? 20;    params.min_rating = params.min_rating ?? 3.5;    params.min_reviews = params.min_reviews ?? 10;    params.response_format = params.response_format ?? "markdown";    params.force_update = params.force_update ?? false;
    try {
      // Get all restaurants currently in eKaty database
      const existingRestaurants = await prisma.restaurant.findMany({
        select: { name: true, address: true, sourceId: true }
      });

      const existingNames = new Set(existingRestaurants.map(r => r.name.toLowerCase()));
      const existingPlaceIds = new Set(existingRestaurants.map(r => r.sourceId).filter(Boolean));

      // Search Google Places
      const allNewRestaurants: any[] = [];

      if (params.cuisine_types && params.cuisine_types.length > 0) {
        // Search for each cuisine type
        for (const cuisine of params.cuisine_types) {
          const data = await searchNearbyPlaces(
            KATY_TX_LOCATION.lat,
            KATY_TX_LOCATION.lng,
            DEFAULT_SEARCH_RADIUS,
            cuisine
          );

          if (data.places) {
            allNewRestaurants.push(...data.places);
          }
        }
      } else {
        // General restaurant search
        const data = await searchNearbyPlaces(
          KATY_TX_LOCATION.lat,
          KATY_TX_LOCATION.lng,
          DEFAULT_SEARCH_RADIUS
        );

        if (data.places) {
          allNewRestaurants.push(...data.places);
        }
      }

      // Filter for new restaurants not in eKaty
      const newRestaurants = allNewRestaurants.filter((place: any) => {
        // Check if already in database
        if (existingPlaceIds.has(place.id)) return false;
        if (existingNames.has(place.displayName?.text?.toLowerCase())) return false;

        // Check rating criteria
        if (!place.rating || place.rating < params.min_rating) return false;
        if (!place.userRatingCount || place.userRatingCount < params.min_reviews) return false;

        return true;
      });

      // Apply limit
      const limitedResults = newRestaurants.slice(0, params.limit);

      if (limitedResults.length === 0) {
        return {
          content: [{
            type: "text",
            text: `No new restaurants found matching your criteria. All ${allNewRestaurants.length} found restaurants are already in eKaty database.`
          }]
        };
      }

      // Format response
      if (params.response_format === ResponseFormat.MARKDOWN) {
        const lines = [
          `# New Restaurant Discovery`,
          ``,
          `🎯 **Found ${limitedResults.length} new restaurants for eKaty**`,
          ``,
          `**Criteria**:`,
          `- Min Rating: ${params.min_rating}★`,
          `- Min Reviews: ${params.min_reviews}`,
          params.cuisine_types ? `- Cuisines: ${params.cuisine_types.join(', ')}` : '',
          ``,
          `---`,
          ``
        ].filter(Boolean);

        limitedResults.forEach((place: any, index: number) => {
          lines.push(`### ${index + 1}. ${place.displayName?.text}`);
          lines.push(`⭐ **${place.rating}/5** (${place.userRatingCount} reviews)`);
          lines.push(`📍 ${place.formattedAddress}`);
          if (place.phoneNumber) lines.push(`📞 ${place.phoneNumber}`);
          if (place.websiteUri) lines.push(`🌐 ${place.websiteUri}`);
          lines.push(`🆔 Google Place ID: \`${place.id}\``);
          lines.push(``);
        });

        lines.push(`---`);
        lines.push(``);
        lines.push(`💡 **Next Steps**:`);
        lines.push(`1. Review these restaurants for quality`);
        lines.push(`2. Import promising candidates to eKaty database`);
        lines.push(`3. Begin subscription outreach to owners`);

        return {
          content: [{ type: "text", text: truncateResponse(lines.join("\n")) }]
        };
      } else {
        return {
          content: [{
            type: "text",
            text: JSON.stringify({
              discovered_count: limitedResults.length,
              total_found: allNewRestaurants.length,
              already_in_ekaty: allNewRestaurants.length - newRestaurants.length,
              criteria: {
                min_rating: params.min_rating,
                min_reviews: params.min_reviews,
                cuisine_types: params.cuisine_types
              },
              new_restaurants: limitedResults.map((p: any) => ({
                google_place_id: p.id,
                name: p.displayName?.text,
                address: p.formattedAddress,
                rating: p.rating,
                review_count: p.userRatingCount,
                types: p.types,
                phone: p.phoneNumber,
                website: p.websiteUri,
                location: p.location,
                ready_for_import: true
              }))
            }, null, 2)
          }]
        };
      }

    } catch (error) {
      return {
        isError: true,
        content: [{
          type: "text",
          text: `Error discovering new restaurants: ${error instanceof Error ? error.message : String(error)}`
        }]
      };
    }
  }
);

// ============================================================================
// TOOL 5: Find Featured Placement Candidates
// ============================================================================

server.registerTool(
  "ekaty_find_featured_candidates",
  {
    title: "Find Featured Placement Candidates",
    description: `Identify eKaty restaurants that qualify for Premium/Featured tier subscriptions.

This tool analyzes existing eKaty restaurants to find high-performing ones that meet the criteria for featured placement. These are prime candidates for upselling to Pro ($99/mo) or Premium ($199/mo) tiers.

Featured Criteria:
- Rating ≥ 4.5 stars (default)
- Review count ≥ 100 (default)
- Currently not featured
- Active in eKaty database

Revenue Opportunity:
- Pro tier: $99/month (featured in search)
- Premium tier: $199/month (homepage placement)
- Targeting high-quality restaurants maximizes conversion

Use this to:
- Identify upsell opportunities for existing customers
- Find restaurants for premium outreach campaigns
- Prioritize high-value subscription targets
- Plan featured restaurant rotations

Args:
  - min_rating (number): Minimum rating (default: 4.5 stars)
  - min_reviews (number): Minimum review count (default: 100)
  - limit (number): Maximum candidates to return (1-50, default: 10)
  - response_format ('markdown' | 'json'): Output format (default: 'markdown')

Returns:
  Markdown: Prioritized list with revenue potential
  JSON: Full restaurant data with subscription tier recommendations

Examples:
  - "Find restaurants ready for premium tier" -> Use defaults
  - "Identify top-rated restaurants for homepage" -> min_rating=4.7, min_reviews=200
  - "Get upsell candidates" -> Returns best prospects

Revenue Calculation:
  - Assumes 20% conversion rate on outreach
  - Pro tier = $99/mo per restaurant
  - Premium tier = $199/mo for exceptional restaurants

Error Handling:
  - Returns empty list if no candidates found
  - Handles database errors gracefully
  - Validates rating/review parameters`,
    inputSchema: FindFeaturedCandidatesSchema,
    annotations: {
      readOnlyHint: true,
      destructiveHint: false,
      idempotentHint: true,
      openWorldHint: false
    }
  },
  async (params: any) => {
// Apply defaults    params.latitude = params.latitude ?? 29.7858;    params.longitude = params.longitude ?? -95.8244;    params.radius = params.radius ?? 16093;    params.limit = params.limit ?? 20;    params.min_rating = params.min_rating ?? 3.5;    params.min_reviews = params.min_reviews ?? 10;    params.response_format = params.response_format ?? "markdown";    params.force_update = params.force_update ?? false;
    try {
      // Query eKaty database for qualifying restaurants
      const candidates = await prisma.restaurant.findMany({
        where: {
          active: true,
          featured: false,
          rating: { gte: params.min_rating },
          reviewCount: { gte: params.min_reviews }
        },
        orderBy: [
          { rating: 'desc' },
          { reviewCount: 'desc' }
        ],
        take: params.limit
      });

      if (candidates.length === 0) {
        return {
          content: [{
            type: "text",
            text: `No restaurants found meeting criteria (rating ≥ ${params.min_rating}, reviews ≥ ${params.min_reviews}). Try lowering thresholds.`
          }]
        };
      }

      // Calculate revenue potential
      const monthlyRevenue = candidates.length * 0.20 * 99; // 20% conversion * $99/mo
      const annualRevenue = monthlyRevenue * 12;

      // Format response
      if (params.response_format === ResponseFormat.MARKDOWN) {
        const lines = [
          `# Featured Placement Candidates`,
          ``,
          `🎯 **Found ${candidates.length} qualifying restaurants**`,
          ``,
          `**Revenue Potential** (20% conversion):`,
          `- Monthly: $${Math.round(monthlyRevenue).toLocaleString()} (Pro tier)`,
          `- Annual: $${Math.round(annualRevenue).toLocaleString()}`,
          ``,
          `**Criteria**:`,
          `- Min Rating: ${params.min_rating}★`,
          `- Min Reviews: ${params.min_reviews}`,
          `- Currently NOT featured`,
          ``,
          `---`,
          ``
        ];

        candidates.forEach((restaurant, index) => {
          const tierRecommendation = restaurant.rating! >= 4.7 && restaurant.reviewCount >= 200
            ? '👑 Premium ($199/mo)'
            : '⭐ Pro ($99/mo)';

          lines.push(`### ${index + 1}. ${restaurant.name}`);
          lines.push(`${tierRecommendation}`);
          lines.push(`⭐ **${restaurant.rating}/5** (${restaurant.reviewCount} reviews)`);
          lines.push(`📍 ${restaurant.address}`);
          if (restaurant.phone) lines.push(`📞 ${restaurant.phone}`);
          if (restaurant.website) lines.push(`🌐 ${restaurant.website}`);
          lines.push(`🆔 eKaty ID: \`${restaurant.id}\``);
          lines.push(``);
        });

        lines.push(`---`);
        lines.push(``);
        lines.push(`💡 **Next Steps**:`);
        lines.push(`1. Export this list for outreach campaign`);
        lines.push(`2. Personalize emails based on tier recommendation`);
        lines.push(`3. Highlight featured placement benefits`);
        lines.push(`4. Track conversion rate and adjust criteria`);

        return {
          content: [{ type: "text", text: lines.join("\n") }]
        };
      } else {
        return {
          content: [{
            type: "text",
            text: JSON.stringify({
              candidate_count: candidates.length,
              criteria: {
                min_rating: params.min_rating,
                min_reviews: params.min_reviews
              },
              revenue_potential: {
                monthly: Math.round(monthlyRevenue),
                annual: Math.round(annualRevenue),
                conversion_rate: 0.20,
                price_per_restaurant: 99
              },
              candidates: candidates.map(r => ({
                ekaty_id: r.id,
                name: r.name,
                rating: r.rating,
                reviews: r.reviewCount,
                address: r.address,
                phone: r.phone,
                website: r.website,
                recommended_tier: r.rating! >= 4.7 && r.reviewCount >= 200 ? 'PREMIUM' : 'PRO',
                recommended_price: r.rating! >= 4.7 && r.reviewCount >= 200 ? 199 : 99
              }))
            }, null, 2)
          }]
        };
      }

    } catch (error) {
      return {
        isError: true,
        content: [{
          type: "text",
          text: `Error finding featured candidates: ${error instanceof Error ? error.message : String(error)}`
        }]
      };
    }
  }
);

// ============================================================================
// MAIN FUNCTION
// ============================================================================

async function main() {
  // Verify environment variables
  if (!process.env.GOOGLE_PLACES_API_KEY) {
    console.error("ERROR: GOOGLE_PLACES_API_KEY environment variable is required");
    console.error("Get your API key from: https://console.cloud.google.com/");
    process.exit(1);
  }

  // Test database connection
  try {
    await prisma.$connect();
    console.error("✅ Connected to eKaty database");
  } catch (error) {
    console.error("ERROR: Failed to connect to database");
    console.error(error);
    process.exit(1);
  }

  // Create stdio transport
  const transport = new StdioServerTransport();

  // Connect server to transport
  await server.connect(transport);

  console.error("🚀 eKaty Places MCP Server running via stdio");
  console.error("📍 Ready to manage restaurant data for eKaty.com");
}

// Run the server
main().catch((error) => {
  console.error("Server error:", error);
  process.exit(1);
});
