# eKaty Full-Stack Feature Builder

## Purpose
Rapidly build complete vertical slices of functionality for the eKaty restaurant discovery platform by implementing database operations, API endpoints, form handling, and React components with proper authentication integration - following established project patterns and best practices.

## When to Use This Skill
Use this skill when implementing any new user-facing feature that requires:
- Database queries or mutations
- API endpoints (GET/POST/PUT/DELETE)
- Form handling with validation
- Authentication or authorization
- React components with proper loading/error states
- State management and URL parameter binding

**Examples:**
- "Implement the favorites system so users can save restaurants"
- "Build the review submission form with rating and comment"
- "Create the contact form with email delivery and database persistence"
- "Implement user profile dashboard with edit capabilities"
- "Build admin restaurant management CRUD interface"

## Project Context

### Tech Stack
- **Frontend:** Next.js 14 (App Router), React 18, TypeScript
- **Styling:** Tailwind CSS (mobile-first)
- **Backend:** Supabase PostgreSQL + Next.js API Routes
- **Auth:** Supabase Auth (email/password + Google OAuth)
- **Deployment:** Fly.io

### Critical Project Patterns

#### 1. Database Layer (`/lib/supabase/`)
```typescript
// Pattern: Supabase client with proper error handling
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs'
import { Database } from '@/lib/supabase/types'

export async function queryPattern<T>(
  queryBuilder: (client: SupabaseClient<Database>) => Promise<T>
): Promise<{ data: T | null; error: PostgrestError | null }> {
  const supabase = createClientComponentClient<Database>()
  try {
    const result = await queryBuilder(supabase)
    return { data: result, error: null }
  } catch (error) {
    return { data: null, error: error as PostgrestError }
  }
}
```

**Key Files:**
- `lib/supabase/client.ts` - Client-side Supabase client
- `lib/supabase/server.ts` - Server-side Supabase client
- `lib/supabase/types.ts` - Database TypeScript types
- `lib/supabase/restaurants.ts` - Example query patterns

#### 2. API Routes (`/app/api/`)
```typescript
// Pattern: API route with validation and error handling
import { NextRequest, NextResponse } from 'next/server'
import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs'
import { cookies } from 'next/headers'

export async function POST(request: NextRequest) {
  try {
    const supabase = createRouteHandlerClient({ cookies })

    // 1. Validate authentication (if required)
    const { data: { session } } = await supabase.auth.getSession()
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // 2. Parse and validate request body
    const body = await request.json()
    // TODO: Add Zod validation

    // 3. Perform database operation
    const { data, error } = await supabase
      .from('table_name')
      .insert(body)
      .select()

    if (error) throw error

    // 4. Return success response
    return NextResponse.json({ data }, { status: 201 })
  } catch (error) {
    console.error('API Error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
```

**Existing API Routes:**
- `api/restaurants/route.ts` - GET with filters (good reference)
- `api/spinner/route.ts` - POST with validation
- `api/contact/route.ts` - Stub implementation (needs completion)

#### 3. React Components Pattern

**Component Structure:**
```typescript
'use client'

import { useState, useEffect } from 'react'
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs'

export default function FeatureComponent() {
  const [data, setData] = useState<Type[] | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const supabase = createClientComponentClient()

  useEffect(() => {
    async function fetchData() {
      try {
        setLoading(true)
        const { data, error } = await supabase
          .from('table')
          .select('*')

        if (error) throw error
        setData(data)
      } catch (e) {
        setError(e instanceof Error ? e.message : 'Failed to load')
      } finally {
        setLoading(false)
      }
    }
    fetchData()
  }, [])

  if (loading) return <SkeletonLoader />
  if (error) return <ErrorState message={error} />
  if (!data) return <EmptyState />

  return (
    <div>
      {/* Component UI */}
    </div>
  )
}
```

**Component Organization:**
- `/components/home/` - Homepage features
- `/components/discover/` - Search/filter components
- `/components/layout/` - Navigation (Navbar, Footer, BottomNav)
- `/components/ui/placeholders.tsx` - Shared UI components (needs refactoring)

#### 4. Form Handling Pattern (CRITICAL - Currently Missing!)

**Needed Pattern:**
```typescript
'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'

interface FormData {
  // Define fields
}

export default function FormComponent() {
  const [formData, setFormData] = useState<FormData>({})
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const router = useRouter()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError(null)

    try {
      const response = await fetch('/api/endpoint', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData)
      })

      if (!response.ok) {
        const error = await response.json()
        throw new Error(error.message || 'Failed to submit')
      }

      const result = await response.json()
      // Handle success (redirect, toast, etc.)
      router.push('/success-page')
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Failed to submit')
    } finally {
      setLoading(false)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      {/* Form fields */}
      {error && (
        <div className="text-red-500 text-sm">{error}</div>
      )}
      <button
        type="submit"
        disabled={loading}
        className="w-full bg-primary text-white py-2 px-4 rounded-md disabled:opacity-50"
      >
        {loading ? 'Submitting...' : 'Submit'}
      </button>
    </form>
  )
}
```

#### 5. Authentication Integration (CRITICAL - Currently Missing!)

**Needed Context Pattern:**
```typescript
// lib/auth-context.tsx
'use client'

import { createContext, useContext, useEffect, useState } from 'react'
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs'
import { User } from '@supabase/supabase-js'

interface AuthContextType {
  user: User | null
  loading: boolean
  signIn: (email: string, password: string) => Promise<void>
  signUp: (email: string, password: string) => Promise<void>
  signOut: () => Promise<void>
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [loading, setLoading] = useState(true)
  const supabase = createClientComponentClient()

  useEffect(() => {
    // Get initial session
    supabase.auth.getSession().then(({ data: { session } }) => {
      setUser(session?.user ?? null)
      setLoading(false)
    })

    // Listen for auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null)
    })

    return () => subscription.unsubscribe()
  }, [])

  const signIn = async (email: string, password: string) => {
    const { error } = await supabase.auth.signInWithPassword({ email, password })
    if (error) throw error
  }

  const signUp = async (email: string, password: string) => {
    const { error } = await supabase.auth.signUp({ email, password })
    if (error) throw error
  }

  const signOut = async () => {
    const { error } = await supabase.auth.signOut()
    if (error) throw error
  }

  return (
    <AuthContext.Provider value={{ user, loading, signIn, signUp, signOut }}>
      {children}
    </AuthContext.Provider>
  )
}

export const useAuth = () => {
  const context = useContext(AuthContext)
  if (!context) throw new Error('useAuth must be used within AuthProvider')
  return context
}
```

#### 6. Mobile-First Styling (CRITICAL!)
```css
/* Pattern: Mobile-first responsive design */
.component {
  /* Mobile base styles (320px+) */
  @apply p-4 text-sm;

  /* Tablet (640px+) */
  @apply sm:p-6 sm:text-base;

  /* Desktop (1024px+) */
  @apply lg:p-8 lg:text-lg;
}

/* Touch targets minimum 44px */
.button {
  @apply min-h-[44px] min-w-[44px];
}

/* Safe area support (iPhone notch) */
.bottom-nav {
  @apply pb-safe;
}
```

### Database Schema Reference

**Key Tables:**
```sql
-- users (auto-created via trigger)
CREATE TABLE users (
  id UUID PRIMARY KEY REFERENCES auth.users,
  email TEXT NOT NULL,
  full_name TEXT,
  role TEXT DEFAULT 'user',
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- restaurants
CREATE TABLE restaurants (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  description TEXT,
  address TEXT,
  city TEXT DEFAULT 'Katy',
  categories TEXT[] NOT NULL,
  price_level INTEGER CHECK (price_level BETWEEN 1 AND 4),
  rating NUMERIC(3,2) DEFAULT 0,
  review_count INTEGER DEFAULT 0,
  phone TEXT,
  website TEXT,
  hours JSONB,
  featured BOOLEAN DEFAULT false,
  photo_urls TEXT[],
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- favorites
CREATE TABLE favorites (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  restaurant_id UUID REFERENCES restaurants(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(user_id, restaurant_id)
);

-- reviews
CREATE TABLE reviews (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  restaurant_id UUID REFERENCES restaurants(id) ON DELETE CASCADE,
  rating INTEGER CHECK (rating BETWEEN 1 AND 5),
  comment TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- spins (analytics)
CREATE TABLE spins (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES users(id) ON DELETE SET NULL,
  restaurant_id UUID REFERENCES restaurants(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ DEFAULT NOW()
);
```

### Environment Variables
```env
NEXT_PUBLIC_SUPABASE_URL=https://sctzykgcfkhadowyqcrj.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=[anon_key]
SUPABASE_SERVICE_ROLE_KEY=[service_role_key]
```

## Implementation Workflow

When asked to implement a feature, follow these steps:

### Phase 1: Planning & Requirements (5 minutes)
1. **Clarify Requirements**
   - What user action triggers this feature?
   - What data needs to be stored/retrieved?
   - Does this require authentication?
   - What are the success/error states?
   - Mobile-first considerations?

2. **Database Design**
   - Does a table exist or need to be created?
   - What columns are needed?
   - What indexes would optimize queries?
   - RLS policies needed?
   - Any triggers for aggregation?

3. **API Design**
   - What HTTP methods (GET/POST/PUT/DELETE)?
   - What request/response shape?
   - Authentication required?
   - Input validation rules?

4. **Component Design**
   - Client or Server Component?
   - Loading/error/empty states needed?
   - Form handling needed?
   - Mobile vs desktop differences?

### Phase 2: Database Implementation (if needed)
1. **Create Migration Script**
   ```sql
   -- supabase/migrations/00X_feature_name.sql
   CREATE TABLE IF NOT EXISTS table_name (...);

   -- Add RLS policies
   ALTER TABLE table_name ENABLE ROW LEVEL SECURITY;

   CREATE POLICY "Policy name" ON table_name
     FOR SELECT USING (auth.uid() = user_id);

   -- Add indexes
   CREATE INDEX idx_name ON table_name(column);
   ```

2. **Update TypeScript Types**
   ```typescript
   // lib/supabase/types.ts
   export interface TableName {
     id: string
     // Add fields
     created_at: string
   }
   ```

3. **Test Schema**
   - Run migration
   - Verify RLS policies
   - Test queries in Supabase dashboard

### Phase 3: API Route Implementation
1. **Create Route File**
   ```typescript
   // app/api/feature/route.ts
   export async function GET(request: NextRequest) { }
   export async function POST(request: NextRequest) { }
   ```

2. **Implement Handler**
   - Parse request
   - Validate input
   - Check authentication
   - Execute database query
   - Handle errors
   - Return response

3. **Test API**
   - Test with curl or Postman
   - Verify error handling
   - Check response shapes

### Phase 4: React Component Implementation
1. **Create Component File**
   ```typescript
   // components/feature/ComponentName.tsx
   'use client' // or server component

   export default function ComponentName() {
     // State management
     // Data fetching
     // Event handlers
     // Render UI
   }
   ```

2. **Implement States**
   - Loading state with skeleton
   - Error state with message
   - Empty state with CTA
   - Success state with data

3. **Add Form Handling (if applicable)**
   - Form state management
   - Input validation
   - Submit handler
   - API integration
   - Success/error feedback

4. **Style Mobile-First**
   - Base mobile styles
   - Tablet breakpoints (sm:)
   - Desktop breakpoints (lg:)
   - Touch targets (min 44px)

### Phase 5: Integration & Testing
1. **Add to Route/Page**
   ```typescript
   // app/feature/page.tsx
   import ComponentName from '@/components/feature/ComponentName'

   export default function FeaturePage() {
     return <ComponentName />
   }
   ```

2. **Test User Flow**
   - Happy path
   - Error handling
   - Loading states
   - Mobile responsiveness
   - Authentication (if required)

3. **Verify RLS**
   - Users can only access their own data
   - No unauthorized access
   - Proper error messages

### Phase 6: Documentation
1. **Code Comments**
   - Complex logic explained
   - API contracts documented
   - TypeScript types comprehensive

2. **Update README (if major feature)**
   - Feature description
   - Usage instructions
   - Environment variables

## Key Implementation Rules

### DO:
✅ Follow mobile-first responsive design
✅ Implement proper loading/error/empty states
✅ Use TypeScript types for all data
✅ Add RLS policies for all user data
✅ Validate inputs on both client and server
✅ Handle authentication in API routes
✅ Use Supabase client helpers (createClientComponentClient, createRouteHandlerClient)
✅ Follow existing component patterns
✅ Test on mobile viewport
✅ Use semantic HTML and proper ARIA labels
✅ Minimize touch target sizes (44px)

### DON'T:
❌ Skip authentication checks in API routes
❌ Forget RLS policies on database tables
❌ Use `any` type in TypeScript
❌ Create new patterns when existing ones work
❌ Skip loading/error states
❌ Hard-code values that should be env variables
❌ Ignore mobile viewport
❌ Use desktop-first CSS patterns
❌ Create placeholder components that don't work
❌ Skip input validation
❌ Forget to handle errors gracefully

## Common Feature Patterns

### Pattern: User Favorites System
```typescript
// API: POST /api/favorites
// Body: { restaurant_id: string }
// Auth: Required

// API: DELETE /api/favorites
// Body: { restaurant_id: string }
// Auth: Required

// API: GET /api/users/[id]/favorites
// Auth: Required (must match user_id)

// Component: FavoriteButton
// - Heart icon (filled if favorited)
// - Click to toggle favorite
// - Optimistic UI update
// - Error handling with rollback
```

### Pattern: Review Submission
```typescript
// API: POST /api/reviews
// Body: { restaurant_id: string, rating: number, comment: string }
// Auth: Required

// Component: ReviewForm
// - Star rating input (1-5)
// - Textarea for comment
// - Character limit (500)
// - Submit with loading state
// - Success: Show review in list
// - Error: Show error message
```

### Pattern: User Dashboard
```typescript
// Page: /dashboard
// Auth: Required (redirect if not logged in)

// Sections:
// - User profile card
// - Favorite restaurants grid
// - Recent reviews list
// - Spin history
// - Settings link
```

### Pattern: Search Filters with URL State
```typescript
// Component: SearchFilters
// - Checkboxes for categories
// - Price level slider
// - Rating filter
// - Sync with URL params (?category=mexican&price=2)
// - Update results on filter change
// - Clear filters button
```

## Critical Issues to Address

### 1. Authentication System (BLOCKING)
**Status:** Supabase Auth configured but no frontend implementation
**Blocks:** Reviews, favorites, user dashboard, admin features
**Files Affected:**
- `app/auth/page.tsx` - Placeholder forms
- `components/ui/placeholders.tsx` - AuthForms component
**Implementation Needed:**
- AuthContext/AuthProvider
- Sign up form with validation
- Sign in form with validation
- Password reset flow
- Google OAuth callback
- Protected route HOC/middleware

### 2. Form Handling Library (HIGH PRIORITY)
**Status:** All forms are placeholders with no submit handlers
**Impact:** 15+ forms need implementation
**Recommendation:** React Hook Form + Zod validation
**Forms Needed:**
- Auth forms (signup, signin, reset)
- Review submission
- Contact form
- Business inquiry form
- User profile edit
- Admin restaurant CRUD

### 3. Placeholder Component Refactoring
**Status:** Single 425-line file mixing stubs with real components
**Issue:** Hard to maintain, mixing concerns
**File:** `components/ui/placeholders.tsx`
**Action Needed:**
- Extract working components to proper files
- Remove stub components as features are implemented
- Create proper component library structure

### 4. Search Filters Non-Functional
**Status:** SearchFilters component renders but doesn't work
**File:** `components/discover/SearchFilters.tsx`
**Issue:** Checkboxes don't update state or URL
**Implementation Needed:**
- State management for selections
- URL parameter binding (useSearchParams)
- Filter application trigger
- Clear filters function

### 5. Contact Form Stub
**Status:** API logs to console, no email/persistence
**File:** `app/api/contact/route.ts`
**Implementation Needed:**
- Email delivery (Resend, SendGrid, or SMTP)
- Database persistence (create inquiries table)
- Admin notification
- User confirmation email

## Testing Strategy

### Unit Tests (Needed)
```typescript
// lib/__tests__/restaurants.test.ts
import { getRestaurants } from '@/lib/supabase/restaurants'

describe('getRestaurants', () => {
  it('should return restaurants with filters', async () => {
    const result = await getRestaurants({ category: 'Mexican' })
    expect(result.data).toBeDefined()
    expect(result.data?.every(r => r.categories.includes('Mexican'))).toBe(true)
  })
})
```

### Integration Tests (Needed)
```typescript
// app/api/favorites/__tests__/route.test.ts
describe('POST /api/favorites', () => {
  it('should require authentication', async () => {
    const response = await fetch('/api/favorites', {
      method: 'POST',
      body: JSON.stringify({ restaurant_id: 'test-id' })
    })
    expect(response.status).toBe(401)
  })
})
```

### E2E Tests (Partially Available)
- Puppeteer scripts exist for deployment verification
- Need user flow tests (signup → search → favorite → review)

## Success Criteria

A feature is **complete** when:
1. ✅ Database schema created with RLS policies
2. ✅ API routes implemented with auth checks
3. ✅ React components with loading/error/empty states
4. ✅ Form validation (client + server)
5. ✅ Mobile-responsive (tested on mobile viewport)
6. ✅ TypeScript types defined and used
7. ✅ Error handling comprehensive
8. ✅ Accessibility (keyboard nav, ARIA labels)
9. ✅ User flow tested end-to-end
10. ✅ Code follows existing patterns

## Example: Implementing Favorites Feature

### Step 1: Verify Database Schema
```sql
-- Already exists in schema
SELECT * FROM favorites; -- Verify table exists
```

### Step 2: Create API Routes
```typescript
// app/api/favorites/route.ts
import { NextRequest, NextResponse } from 'next/server'
import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs'
import { cookies } from 'next/headers'

export async function POST(request: NextRequest) {
  try {
    const supabase = createRouteHandlerClient({ cookies })
    const { data: { session } } = await supabase.auth.getSession()

    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { restaurant_id } = await request.json()

    if (!restaurant_id) {
      return NextResponse.json(
        { error: 'restaurant_id required' },
        { status: 400 }
      )
    }

    const { data, error } = await supabase
      .from('favorites')
      .insert({
        user_id: session.user.id,
        restaurant_id
      })
      .select()
      .single()

    if (error) throw error

    return NextResponse.json({ data }, { status: 201 })
  } catch (error) {
    return NextResponse.json(
      { error: 'Failed to add favorite' },
      { status: 500 }
    )
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const supabase = createRouteHandlerClient({ cookies })
    const { data: { session } } = await supabase.auth.getSession()

    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { restaurant_id } = await request.json()

    const { error } = await supabase
      .from('favorites')
      .delete()
      .eq('user_id', session.user.id)
      .eq('restaurant_id', restaurant_id)

    if (error) throw error

    return NextResponse.json({ success: true }, { status: 200 })
  } catch (error) {
    return NextResponse.json(
      { error: 'Failed to remove favorite' },
      { status: 500 }
    )
  }
}
```

### Step 3: Create FavoriteButton Component
```typescript
// components/restaurants/FavoriteButton.tsx
'use client'

import { useState, useEffect } from 'react'
import { useAuth } from '@/lib/auth-context'
import { Heart } from 'lucide-react'

interface FavoriteButtonProps {
  restaurantId: string
  initialFavorited?: boolean
}

export default function FavoriteButton({
  restaurantId,
  initialFavorited = false
}: FavoriteButtonProps) {
  const { user } = useAuth()
  const [favorited, setFavorited] = useState(initialFavorited)
  const [loading, setLoading] = useState(false)

  const toggleFavorite = async () => {
    if (!user) {
      // Redirect to login
      window.location.href = '/auth?redirect=/restaurant/' + restaurantId
      return
    }

    setLoading(true)
    const method = favorited ? 'DELETE' : 'POST'

    try {
      const response = await fetch('/api/favorites', {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ restaurant_id: restaurantId })
      })

      if (!response.ok) throw new Error('Failed to update favorite')

      setFavorited(!favorited)
    } catch (error) {
      console.error('Failed to toggle favorite:', error)
      // Show toast notification
    } finally {
      setLoading(false)
    }
  }

  return (
    <button
      onClick={toggleFavorite}
      disabled={loading}
      className="min-h-[44px] min-w-[44px] flex items-center justify-center rounded-full bg-white shadow-md disabled:opacity-50"
      aria-label={favorited ? 'Remove from favorites' : 'Add to favorites'}
    >
      <Heart
        className={`w-6 h-6 ${
          favorited ? 'fill-red-500 text-red-500' : 'text-gray-400'
        }`}
      />
    </button>
  )
}
```

### Step 4: Create User Favorites Page
```typescript
// app/favorites/page.tsx
import { createServerComponentClient } from '@supabase/auth-helpers-nextjs'
import { cookies } from 'next/headers'
import { redirect } from 'next/navigation'
import RestaurantGrid from '@/components/discover/RestaurantGrid'

export default async function FavoritesPage() {
  const supabase = createServerComponentClient({ cookies })

  const { data: { session } } = await supabase.auth.getSession()

  if (!session) {
    redirect('/auth?redirect=/favorites')
  }

  const { data: favorites } = await supabase
    .from('favorites')
    .select(`
      restaurant:restaurants (*)
    `)
    .eq('user_id', session.user.id)
    .order('created_at', { ascending: false })

  const restaurants = favorites?.map(f => f.restaurant) ?? []

  if (restaurants.length === 0) {
    return (
      <div className="container mx-auto px-4 py-8">
        <h1 className="text-2xl font-bold mb-4">My Favorites</h1>
        <p className="text-gray-500">
          You haven't saved any favorites yet. Start exploring restaurants!
        </p>
      </div>
    )
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-2xl font-bold mb-4">
        My Favorites ({restaurants.length})
      </h1>
      <RestaurantGrid restaurants={restaurants} />
    </div>
  )
}
```

### Step 5: Update RestaurantCard
```typescript
// components/discover/RestaurantCard.tsx (add FavoriteButton)
import FavoriteButton from '@/components/restaurants/FavoriteButton'

export default function RestaurantCard({ restaurant }) {
  return (
    <div className="relative">
      <div className="absolute top-2 right-2 z-10">
        <FavoriteButton restaurantId={restaurant.id} />
      </div>
      {/* Rest of card */}
    </div>
  )
}
```

## Resources

### Documentation Links
- [Supabase Auth Helpers](https://supabase.com/docs/guides/auth/auth-helpers/nextjs)
- [Next.js App Router](https://nextjs.org/docs/app)
- [Tailwind CSS](https://tailwindcss.com/docs)
- [React Hook Form](https://react-hook-form.com/)
- [Zod Validation](https://zod.dev/)

### Project Files to Reference
- `lib/supabase/restaurants.ts` - Query patterns
- `app/api/restaurants/route.ts` - API route example
- `components/discover/RestaurantGrid.tsx` - Component patterns
- `app/layout.tsx` - Root layout with providers

### Supabase Dashboard
- URL: https://sctzykgcfkhadowyqcrj.supabase.co
- Use for: Schema inspection, RLS testing, query testing

---

## Notes
- **Mobile-first is non-negotiable** - all UI must work on 320px screens first
- **Authentication is blocking** - implement auth context before user features
- **RLS policies are required** - never bypass with service role key in client
- **Follow existing patterns** - consistency is more important than perfection
- **Test on real devices** - iOS Safari and Android Chrome have different behaviors

This skill enables rapid, consistent implementation of full-stack features following eKaty's established architecture and design patterns.
