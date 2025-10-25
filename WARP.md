# WARP.md

This file provides guidance to WARP (warp.dev) when working with code in this repository.

## Project Overview

**eKaty** is a Next.js 14 restaurant discovery platform for Katy, Texas, featuring:
- Interactive restaurant search and filtering
- "Grub Roulette" random restaurant selector
- Google Places API integration for real restaurant data
- SQLite database with Prisma ORM
- Deployed on Fly.io with persistent volumes

## Essential Commands

### Development
```bash
npm run dev              # Start Next.js dev server (localhost:3000)
npm run build            # Build production bundle
npm run start            # Start production server (port 8080)
npm run lint             # Run ESLint
```

### Testing
```bash
npm test                 # Run Jest unit tests
npm run test:e2e         # Run end-to-end tests with Puppeteer
```

### Database Operations
```bash
npm run prisma:generate  # Generate Prisma client
npm run prisma:migrate   # Run database migrations (dev)
npm run db:push          # Push schema changes without migration
npm run prisma:studio    # Open Prisma Studio GUI
npm run db:setup         # Full setup: generate + migrate + seed
npm run db:reset         # Reset database (destructive)
```

### Database Seeding
```bash
npm run prisma:seed           # Run default seed script
npm run prisma:seed-google    # Import from Google Places API
npm run import:google         # Import Google Places data (production-ready)
npm run import:test           # Test Google Maps API connection
```

### Deployment (Fly.io)
```bash
fly deploy               # Deploy to Fly.io
fly status               # Check deployment status
fly logs --follow        # View live logs
fly ssh console          # SSH into production container
fly secrets set KEY=val  # Set environment secrets
```

## Architecture

### Tech Stack
- **Framework**: Next.js 14 (App Router, React Server Components)
- **Database**: SQLite with Prisma ORM
- **Styling**: Tailwind CSS
- **Authentication**: Planned (Supabase hooks present)
- **API Integration**: Google Places API via `@googlemaps/google-maps-services-js`
- **Deployment**: Fly.io with Docker, persistent SQLite volume

### Directory Structure

```
app/
  api/           # API routes (restaurants, spin, contact)
  auth/          # Authentication pages (sign in/up)
  categories/    # Category browsing
  contact/       # Contact/advertising form
  discover/      # Main restaurant search page
  restaurants/   # Individual restaurant detail pages
  spinner/       # Grub Roulette feature
  layout.tsx     # Root layout with navigation/footer
  page.tsx       # Homepage

components/      # React components
  ui/           # Reusable UI components

lib/
  prisma.ts                 # Prisma client singleton
  google-places/
    client.ts               # Google Maps client config
    fetcher.ts              # API data fetching
    transformer.ts          # Transform Google data to Prisma schema
    importer.ts             # Batch import orchestration

prisma/
  schema.prisma             # Database schema
  seed-katy.ts              # Static restaurant seed data
  seed-google-places.ts     # Google Places import seed

scripts/
  import-google-places.ts   # CLI tool for Google data import
  test-google-api.ts        # Test API connectivity

public/
  sounds/                   # Audio files for Grub Roulette
  favicon.ico

tests/                      # Jest test files
```

### Database Schema

Key models in Prisma schema:
- **Restaurant**: Core restaurant data with location, categories, hours, pricing
- **User**: User accounts with roles (USER, EDITOR, ADMIN, ADVERTISER)
- **Review**: User reviews with ratings
- **Favorite**: User favorite restaurants
- **Spin**: Grub Roulette history tracking
- **Ad**: Restaurant advertising campaigns
- **AuditLog**: Track data changes
- **ContactSubmission**: Contact form submissions

Price levels: BUDGET, MODERATE, UPSCALE, PREMIUM

### API Routes

- `GET /api/restaurants` - Search restaurants with filters (category, price, location, radius)
- `GET /api/restaurants/[id]` - Get single restaurant details
- `POST /api/spin` - Grub Roulette random selection
- `POST /api/contact` - Submit contact form

Query parameters for `/api/restaurants`:
- `q`: Search query (name, description, categories)
- `category`: Filter by category
- `priceLevel`: BUDGET | MODERATE | UPSCALE | PREMIUM
- `featured`: true/false
- `lat`, `lng`, `radius`: Location-based filtering (miles)
- `limit`, `offset`: Pagination
- `sortBy`: rating | distance | name | reviews

### Google Places Integration

Configuration in `lib/google-places/client.ts`:
- API key from `GOOGLE_MAPS_API_KEY` environment variable
- Katy, TX search center: `29.7858, -95.8245`
- 6 search points covering Katy area (Downtown, Cinco Ranch, Seven Lakes, Fulshear, etc.)
- 15km radius per search point

**Rate limits**: 50 requests/sec, 45,000 requests/day (configurable)

### Environment Variables

Required:
- `DATABASE_URL` - SQLite database path (production: `file:/data/ekaty.db`)
- `GOOGLE_MAPS_API_KEY` - For Google Places API (optional, falls back to static data)

Optional:
- `NEXT_PUBLIC_APP_NAME` - App display name
- `NEXT_PUBLIC_APP_URL` - Canonical URL
- `NODE_ENV` - Environment (development/production)

### Production Deployment

**Dockerfile**: Multi-stage build
1. Builder stage: Install deps, generate Prisma, build Next.js
2. Runner stage: Alpine Linux with OpenSSL, non-root user

**Startup sequence** (`start-production.js`):
1. Check if database exists at `/data/ekaty.db`
2. Run Prisma migrations (`prisma migrate deploy`)
3. Seed database (Google Places → fallback to static data)
4. Start Next.js server

**Fly.io configuration** (`fly.toml`):
- Region: Dallas (dfw)
- Volume: `ekaty_data` mounted at `/data`
- Port: 8080 (internal), 80/443 (external)
- Auto-stop/start enabled
- 512MB RAM, 1 shared CPU

### Data Flow

**Restaurant import process**:
1. Scripts use `lib/google-places/client.ts` to configure API access
2. `fetcher.ts` makes nearby search + place details requests
3. `transformer.ts` converts Google format → Prisma schema
4. `importer.ts` orchestrates batch import with deduplication
5. Data persisted to SQLite via Prisma

**Restaurant search**:
1. Frontend queries `/api/restaurants` with filters
2. API route builds Prisma query with where conditions
3. If location provided, calculates Haversine distance
4. Results sorted by rating/distance/name
5. String fields (categories, photos) converted to arrays

## Development Guidelines

### Path Aliases
- Use `@/` for absolute imports from project root
- Example: `import { prisma } from '@/lib/prisma'`

### TypeScript Configuration
- Strict mode enabled
- Module resolution: bundler
- Scripts excluded from compilation (add to tsconfig exclude if needed)

### Prisma Patterns
- Always use the singleton client from `lib/prisma.ts`
- String fields store comma-separated values (categories, photos, cuisineTypes)
- JSON stored as strings (hours, metadata)
- SQLite doesn't support enums - use string validation in code

### Testing
- Unit tests in `tests/` directory
- Use ts-jest preset
- E2E tests use Puppeteer
- Coverage excludes `.next/`, `node_modules/`

### Common Pitfalls
- **Prisma SSL**: Requires OpenSSL in production (already in Dockerfile)
- **Database location**: Production uses `/data/ekaty.db`, dev uses `prisma/dev.db`
- **Google API**: Needs billing enabled even for free tier
- **Rate limiting**: Google Places API has strict limits - use batch import sparingly
- **Migrations**: Use `prisma migrate deploy` in production, not `migrate dev`

## Google Maps Setup

To enable live restaurant data:
1. Create Google Cloud project
2. Enable Places API (New), Maps JavaScript API, Geocoding API
3. Create API key with restrictions
4. Set secret: `fly secrets set GOOGLE_MAPS_API_KEY=your_key`
5. Run import: `npm run import:google`

See `GOOGLE_MAPS_SETUP.md` for detailed instructions.

## Deployment Status

Current production URL: https://ekaty.fly.dev/

See `DEPLOYMENT_STATUS.md` for:
- Current deployment issues and fixes
- Database initialization status
- Google Places integration status
- Debugging commands

## Key Features Implementation

### Grub Roulette (`/spinner`)
- Filters restaurants by user preferences
- Random selection algorithm
- Tracks spin history in `Spin` model
- Audio feedback (spin.mp3, win.mp3)

### Restaurant Discovery (`/discover`)
- Full-text search across name, description, categories
- Category filtering
- Price level filtering
- Location-based radius search
- Sortable results

### Future Enhancements
- User authentication (Supabase integration prepared)
- User reviews and ratings
- Favorites/bookmarks
- Restaurant advertising portal
- Admin dashboard for content management
