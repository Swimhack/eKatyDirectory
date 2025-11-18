# eKaty Places MCP Server

An Model Context Protocol (MCP) server that integrates Google Places API with eKaty's restaurant database to enable powerful restaurant discovery, data enrichment, and subscription management workflows.

## Overview

This MCP server helps eKaty maintain fresh, accurate restaurant data and discover revenue opportunities by providing AI-powered tools for:

- **Discovery**: Find new restaurants in Katy, TX not yet in the database
- **Enrichment**: Update existing restaurants with latest Google Places data
- **Verification**: Compare eKaty data against Google to identify discrepancies
- **Revenue**: Identify high-quality restaurants for premium tier subscriptions

## Features

### 5 Powerful Tools

1. **`ekaty_search_nearby_restaurants`** - Search Google Places for restaurants
2. **`ekaty_enrich_restaurant_data`** - Update eKaty restaurant with fresh Google data
3. **`ekaty_verify_restaurant_info`** - Compare eKaty vs Google Places data (read-only)
4. **`ekaty_discover_new_restaurants`** - Find restaurants NOT in eKaty database
5. **`ekaty_find_featured_candidates`** - Identify premium subscription prospects

### Key Benefits

- **Automated Data Freshness**: Keep restaurant ratings, reviews, hours current
- **Revenue Growth**: Discover new restaurants and identify upsell opportunities
- **Quality Assurance**: Verify data accuracy before featuring or outreach
- **Workflow Optimization**: Complete tasks in single tool calls, not multiple API requests

## Installation

```bash
cd mcp-server
npm install
npm run build
```

## Configuration

### Environment Variables

Create a `.env` file:

```bash
# Google Places API Key (required)
GOOGLE_PLACES_API_KEY="your_api_key_here"

# Database connection (uses parent project's Prisma setup)
DATABASE_URL="file:../prisma/dev.db"
```

### Get Google Places API Key

1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Create a new project or select existing
3. Enable "Places API (New)"
4. Create API key in Credentials
5. Restrict API key to Places API for security

## Usage

### Running the Server

```bash
# Development mode with auto-reload
npm run dev

# Production mode
npm start
```

### Claude Desktop Configuration

Add to your Claude Desktop config:

```json
{
  "mcpServers": {
    "ekaty-places": {
      "command": "node",
      "args": [
        "c:\\STRICKLAND\\Strickland Technology Marketing\\ekaty.com-2025\\mcp-server\\dist\\index.js"
      ],
      "env": {
        "GOOGLE_PLACES_API_KEY": "your_api_key_here",
        "DATABASE_URL": "file:../prisma/dev.db"
      }
    }
  }
}
```

## Tool Examples

### 1. Discover New Restaurants

Find high-quality Mexican restaurants not yet in eKaty:

```
Use ekaty_discover_new_restaurants with:
- cuisine_types: ["mexican"]
- min_rating: 4.0
- min_reviews: 50
```

Response shows:
- Google Place IDs ready for import
- Names, ratings, reviews, contact info
- Revenue potential calculation

### 2. Enrich Restaurant Data

Update "The Pizza Place" with latest Google data:

```
Use ekaty_enrich_restaurant_data with:
- restaurant_id: "clx123abc..."
- force_update: true
```

Updates:
- Rating and review count
- Phone number and website
- Hours of operation
- Photos from Google

### 3. Find Premium Subscription Candidates

Identify restaurants qualifying for Pro/Premium tiers:

```
Use ekaty_find_featured_candidates with:
- min_rating: 4.5
- min_reviews: 100
- limit: 10
```

Returns:
- Tier recommendation (Pro $99 or Premium $199)
- Revenue potential projections
- Prioritized list by rating/reviews

### 4. Verify Data Quality

Check if restaurant data is still accurate:

```
Use ekaty_verify_restaurant_info with:
- restaurant_id: "clx123abc..."
```

Shows:
- Side-by-side comparison
- Discrepancies highlighted
- Recommendation to enrich if needed

### 5. Search Nearby Restaurants

Find all Italian restaurants within 5 miles:

```
Use ekaty_search_nearby_restaurants with:
- cuisine_type: "italian"
- radius: 8047  # 5 miles in meters
- min_rating: 4.0
```

Returns:
- Google Places results
- Full restaurant details
- Ready for import to eKaty

## Architecture

### Technology Stack

- **TypeScript** - Type-safe implementation
- **MCP SDK** - Model Context Protocol integration
- **Zod** - Runtime input validation
- **Prisma** - Database ORM (shared with main app)
- **Axios** - Google Places API requests

### Design Principles

1. **Workflow-Focused**: Tools complete entire tasks, not just API wrappers
2. **Context-Optimized**: Response formats designed for LLM efficiency
3. **Error-Guided**: Clear messages suggest corrective actions
4. **Idempotent**: Safe to retry operations
5. **Read-Heavy**: Most tools are read-only for safety

### Code Organization

```
src/
├── index.ts           # Main server with all 5 tools
├── (future)
│   ├── tools/         # Individual tool implementations
│   ├── services/      # Google Places API client
│   ├── schemas/       # Zod validation schemas
│   └── utils/         # Shared formatting utilities
```

## Revenue Impact

### New Restaurant Discovery

- **Target**: 249 restaurants in outreach segments
- **Tool**: `ekaty_discover_new_restaurants`
- **Action**: Find high-quality restaurants not yet in eKaty
- **Revenue**: 20% conversion × $82 avg tier = $4,100/month potential

### Premium Upsells

- **Target**: Existing restaurants with ≥4.5★ rating, ≥100 reviews
- **Tool**: `ekaty_find_featured_candidates`
- **Action**: Identify Pro ($99) and Premium ($199) prospects
- **Revenue**: 10-20 conversions = $1,000-$4,000/month incremental

### Data Quality

- **Target**: All 300+ eKaty restaurants
- **Tool**: `ekaty_enrich_restaurant_data` + `ekaty_verify_restaurant_info`
- **Action**: Keep profiles fresh for better user experience
- **Impact**: Higher engagement → more subscriptions

## Development

### Build

```bash
npm run build
```

### Type Checking

```bash
tsc --noEmit
```

### Testing

```bash
# Verify build works
npm run build

# Test server starts
timeout 5s npm start
```

## Roadmap

### Phase 2 Tools (Planned)

- `ekaty_batch_refresh_restaurants` - Update multiple restaurants at once
- `ekaty_import_restaurant` - Add new restaurant to eKaty from Google Place ID
- `ekaty_analyze_competition` - Compare restaurant metrics
- `ekaty_detect_trending` - Find rapidly growing restaurants
- `ekaty_sync_photos` - Update restaurant photos from Google

### Phase 3 Features (Future)

- **Resources**: Expose restaurant data via MCP resources
- **Prompts**: Pre-built prompts for common workflows
- **Notifications**: Alert when restaurant data changes
- **Batch Operations**: Process hundreds of restaurants efficiently

## Troubleshooting

### "GOOGLE_PLACES_API_KEY is required"

Set environment variable:
```bash
export GOOGLE_PLACES_API_KEY="your_key_here"
```

### "Failed to connect to database"

Ensure Prisma is configured in parent project:
```bash
cd ..
npx prisma generate
```

### "Rate limit exceeded"

Google Places API has quotas. Solutions:
- Wait before retrying
- Reduce batch sizes
- Check quota in Google Cloud Console

### Tool Calls Hanging

MCP servers run as long-lived processes. For testing:
- Use Claude Desktop (proper MCP client)
- Or run in background: `npm start &`

## License

MIT - See parent project license

## Support

For issues or questions:
- GitHub Issues: ekaty.com repository
- Email: james@ekaty.com
