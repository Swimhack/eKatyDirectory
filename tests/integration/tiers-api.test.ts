import { describe, it, expect, beforeEach, vi } from 'vitest'
import { GET, POST } from '@/app/api/admin/tiers/route'
import { GET as GET_DETAIL, PATCH, DELETE } from '@/app/api/admin/tiers/[id]/route'
import { NextRequest } from 'next/server'

// Mock the admin middleware
vi.mock('@/lib/auth/require-admin', () => ({
  requireAdmin: vi.fn(async () => null), // null means authorized
}))

// Mock Supabase admin functions
vi.mock('@/lib/supabase/admin', () => ({
  createAdminClient: vi.fn(() => mockSupabase),
}))

const createMockSupabaseChain = () => ({
  from: vi.fn(function () {
    return this
  }),
  insert: vi.fn(function () {
    return this
  }),
  update: vi.fn(function () {
    return this
  }),
  select: vi.fn(function () {
    return this
  }),
  eq: vi.fn(function () {
    return this
  }),
  order: vi.fn(function () {
    return this
  }),
  single: vi.fn(),
})

let mockSupabase = createMockSupabaseChain()

describe('Tiers API Integration Tests', () => {
  beforeEach(() => {
    mockSupabase = createMockSupabaseChain()
    vi.clearAllMocks()
  })

  describe('POST /api/admin/tiers - Create Tier', () => {
    it('should create a new tier with valid data', async () => {
      const tierData = {
        name: 'Featured',
        slug: 'featured',
        monthly_price: 299.99,
        features: ['Premium listings', 'Analytics', 'Support'],
        display_order: 1,
        is_active: true,
      }

      const mockCreatedTier = {
        id: 'tier-123',
        ...tierData,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      }

      mockSupabase.single.mockResolvedValue({
        data: mockCreatedTier,
        error: null,
      })

      const request = new NextRequest('http://localhost:3000/api/admin/tiers', {
        method: 'POST',
        body: JSON.stringify(tierData),
      })

      const response = await POST(request)
      const data = await response.json()

      expect(response.status).toBe(201)
      expect(data.tier).toBeDefined()
      expect(data.tier.name).toBe('Featured')
      expect(data.tier.slug).toBe('featured')
      expect(data.tier.monthly_price).toBe(299.99)
      expect(data.tier.features).toEqual(['Premium listings', 'Analytics', 'Support'])
      expect(mockSupabase.from).toHaveBeenCalledWith('partnership_tiers')
      expect(mockSupabase.insert).toHaveBeenCalled()
    })

    it('should return 400 for missing required fields', async () => {
      const incompleteData = {
        name: 'Featured',
        // Missing slug, monthly_price, features
      }

      const request = new NextRequest('http://localhost:3000/api/admin/tiers', {
        method: 'POST',
        body: JSON.stringify(incompleteData),
      })

      const response = await POST(request)
      const data = await response.json()

      expect(response.status).toBe(400)
      expect(data.error).toBe('Missing required fields')
    })

    it('should return 400 for invalid monthly_price (zero)', async () => {
      const tierData = {
        name: 'Featured',
        slug: 'featured',
        monthly_price: 0,
        features: ['Premium listings'],
      }

      const request = new NextRequest('http://localhost:3000/api/admin/tiers', {
        method: 'POST',
        body: JSON.stringify(tierData),
      })

      const response = await POST(request)
      const data = await response.json()

      expect(response.status).toBe(400)
      expect(data.error).toBe('Invalid monthly_price')
      expect(data.details).toContain('positive number')
    })

    it('should return 400 for invalid monthly_price (negative)', async () => {
      const tierData = {
        name: 'Featured',
        slug: 'featured',
        monthly_price: -99.99,
        features: ['Premium listings'],
      }

      const request = new NextRequest('http://localhost:3000/api/admin/tiers', {
        method: 'POST',
        body: JSON.stringify(tierData),
      })

      const response = await POST(request)
      const data = await response.json()

      expect(response.status).toBe(400)
      expect(data.error).toBe('Invalid monthly_price')
    })

    it('should return 400 for invalid monthly_price (not a number)', async () => {
      const tierData = {
        name: 'Featured',
        slug: 'featured',
        monthly_price: 'not-a-number',
        features: ['Premium listings'],
      }

      const request = new NextRequest('http://localhost:3000/api/admin/tiers', {
        method: 'POST',
        body: JSON.stringify(tierData),
      })

      const response = await POST(request)
      const data = await response.json()

      expect(response.status).toBe(400)
      expect(data.error).toBe('Invalid monthly_price')
    })

    it('should return 400 for invalid features (not an array)', async () => {
      const tierData = {
        name: 'Featured',
        slug: 'featured',
        monthly_price: 299.99,
        features: 'Premium listings', // Should be array
      }

      const request = new NextRequest('http://localhost:3000/api/admin/tiers', {
        method: 'POST',
        body: JSON.stringify(tierData),
      })

      const response = await POST(request)
      const data = await response.json()

      expect(response.status).toBe(400)
      expect(data.error).toBe('Invalid features')
      expect(data.details).toContain('array')
    })

    it('should handle database errors gracefully', async () => {
      mockSupabase.single.mockResolvedValue({
        data: null,
        error: { message: 'Database connection failed' },
      })

      const tierData = {
        name: 'Featured',
        slug: 'featured',
        monthly_price: 299.99,
        features: ['Premium listings'],
      }

      const request = new NextRequest('http://localhost:3000/api/admin/tiers', {
        method: 'POST',
        body: JSON.stringify(tierData),
      })

      const response = await POST(request)
      const data = await response.json()

      expect(response.status).toBe(500)
      expect(data.error).toBe('Failed to create partnership tier')
    })

    it('should use defaults for optional fields', async () => {
      const tierData = {
        name: 'Basic',
        slug: 'basic',
        monthly_price: 99.99,
        features: ['Basic listing'],
      }

      const mockCreatedTier = {
        id: 'tier-456',
        ...tierData,
        display_order: 0,
        is_active: true,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      }

      mockSupabase.single.mockResolvedValue({
        data: mockCreatedTier,
        error: null,
      })

      const request = new NextRequest('http://localhost:3000/api/admin/tiers', {
        method: 'POST',
        body: JSON.stringify(tierData),
      })

      const response = await POST(request)
      const data = await response.json()

      expect(response.status).toBe(201)
      expect(data.tier.display_order).toBe(0)
      expect(data.tier.is_active).toBe(true)
    })
  })


  describe('GET /api/admin/tiers/[id] - Get Tier Detail', () => {
    it('should get tier by ID', async () => {
      const mockTier = {
        id: 'tier-123',
        name: 'Featured',
        slug: 'featured',
        monthly_price: 299.99,
        features: ['Premium listing', 'Analytics'],
        display_order: 1,
        is_active: true,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      }

      mockSupabase.single.mockResolvedValue({
        data: mockTier,
        error: null,
      })

      const request = new NextRequest(
        'http://localhost:3000/api/admin/tiers/tier-123'
      )

      const response = await GET_DETAIL(request, { params: { id: 'tier-123' } })
      const data = await response.json()

      expect(response.status).toBe(200)
      expect(data.tier.id).toBe('tier-123')
      expect(data.tier.name).toBe('Featured')
      expect(data.tier.monthly_price).toBe(299.99)
    })

    it('should return 404 for non-existent tier', async () => {
      mockSupabase.single.mockResolvedValue({
        data: null,
        error: { code: 'PGRST116', message: 'Not found' },
      })

      const request = new NextRequest(
        'http://localhost:3000/api/admin/tiers/invalid-id'
      )

      const response = await GET_DETAIL(request, {
        params: { id: 'invalid-id' },
      })
      const data = await response.json()

      expect(response.status).toBe(404)
      expect(data.error).toBeDefined()
    })

    it('should handle database errors', async () => {
      mockSupabase.single.mockResolvedValue({
        data: null,
        error: { code: '500', message: 'Database error' },
      })

      const request = new NextRequest(
        'http://localhost:3000/api/admin/tiers/tier-123'
      )

      const response = await GET_DETAIL(request, {
        params: { id: 'tier-123' },
      })
      const data = await response.json()

      expect(response.status).toBe(500)
      expect(data.error).toBe('Failed to fetch partnership tier')
    })
  })

  describe('PATCH /api/admin/tiers/[id] - Update Tier', () => {
    it('should update tier with valid data', async () => {
      const updateData = {
        monthly_price: 399.99,
        features: ['Premium listing', 'Analytics', 'Priority support'],
      }

      const mockUpdatedTier = {
        id: 'tier-123',
        name: 'Featured',
        slug: 'featured',
        ...updateData,
        display_order: 1,
        is_active: true,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      }

      mockSupabase.single.mockResolvedValue({
        data: mockUpdatedTier,
        error: null,
      })

      const request = new NextRequest(
        'http://localhost:3000/api/admin/tiers/tier-123',
        {
          method: 'PATCH',
          body: JSON.stringify(updateData),
        }
      )

      const response = await PATCH(request, { params: { id: 'tier-123' } })
      const data = await response.json()

      expect(response.status).toBe(200)
      expect(data.tier.monthly_price).toBe(399.99)
      expect(data.tier.features).toEqual([
        'Premium listing',
        'Analytics',
        'Priority support',
      ])
      expect(mockSupabase.update).toHaveBeenCalled()
    })

    it('should return 400 for invalid monthly_price', async () => {
      const updateData = {
        monthly_price: -99.99,
      }

      const request = new NextRequest(
        'http://localhost:3000/api/admin/tiers/tier-123',
        {
          method: 'PATCH',
          body: JSON.stringify(updateData),
        }
      )

      const response = await PATCH(request, { params: { id: 'tier-123' } })
      const data = await response.json()

      expect(response.status).toBe(400)
      expect(data.error).toBe('Invalid monthly_price')
    })

    it('should return 400 for invalid features', async () => {
      const updateData = {
        features: 'not-an-array',
      }

      const request = new NextRequest(
        'http://localhost:3000/api/admin/tiers/tier-123',
        {
          method: 'PATCH',
          body: JSON.stringify(updateData),
        }
      )

      const response = await PATCH(request, { params: { id: 'tier-123' } })
      const data = await response.json()

      expect(response.status).toBe(400)
      expect(data.error).toBe('Invalid features')
    })

    it('should return 400 when no fields to update', async () => {
      const updateData = {} // Empty update

      const request = new NextRequest(
        'http://localhost:3000/api/admin/tiers/tier-123',
        {
          method: 'PATCH',
          body: JSON.stringify(updateData),
        }
      )

      const response = await PATCH(request, { params: { id: 'tier-123' } })
      const data = await response.json()

      expect(response.status).toBe(400)
      expect(data.error).toBe('No fields to update')
    })

    it('should return 404 for non-existent tier', async () => {
      mockSupabase.single.mockResolvedValue({
        data: null,
        error: { code: 'PGRST116', message: 'Not found' },
      })

      const request = new NextRequest(
        'http://localhost:3000/api/admin/tiers/invalid-id',
        {
          method: 'PATCH',
          body: JSON.stringify({ name: 'Updated' }),
        }
      )

      const response = await PATCH(request, { params: { id: 'invalid-id' } })
      const data = await response.json()

      expect(response.status).toBe(404)
      expect(data.error).toBeDefined()
    })

    it('should include updated_at timestamp in update', async () => {
      const updateData = { name: 'New Name' }

      mockSupabase.single.mockResolvedValue({
        data: {
          id: 'tier-123',
          name: 'New Name',
          slug: 'featured',
          monthly_price: 299.99,
          features: [],
          display_order: 1,
          is_active: true,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        },
        error: null,
      })

      const request = new NextRequest(
        'http://localhost:3000/api/admin/tiers/tier-123',
        {
          method: 'PATCH',
          body: JSON.stringify(updateData),
        }
      )

      const response = await PATCH(request, { params: { id: 'tier-123' } })

      expect(response.status).toBe(200)
      // Verify update was called with updated_at
      expect(mockSupabase.update).toHaveBeenCalledWith(
        expect.objectContaining({
          updated_at: expect.any(String),
        })
      )
    })
  })

  describe('DELETE /api/admin/tiers/[id] - Soft Delete Tier', () => {
    it('should soft delete tier by setting is_active to false', async () => {
      const mockDeletedTier = {
        id: 'tier-123',
        name: 'Featured',
        slug: 'featured',
        monthly_price: 299.99,
        features: ['Premium listing'],
        display_order: 1,
        is_active: false,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      }

      mockSupabase.single.mockResolvedValue({
        data: mockDeletedTier,
        error: null,
      })

      const request = new NextRequest(
        'http://localhost:3000/api/admin/tiers/tier-123',
        {
          method: 'DELETE',
        }
      )

      const response = await DELETE(request, { params: { id: 'tier-123' } })
      const data = await response.json()

      expect(response.status).toBe(200)
      expect(data.message).toBe('Partnership tier deactivated successfully')
      expect(data.tier.is_active).toBe(false)
      expect(mockSupabase.update).toHaveBeenCalledWith(
        expect.objectContaining({
          is_active: false,
          updated_at: expect.any(String),
        })
      )
    })

    it('should return 404 for non-existent tier', async () => {
      mockSupabase.single.mockResolvedValue({
        data: null,
        error: { code: 'PGRST116', message: 'Not found' },
      })

      const request = new NextRequest(
        'http://localhost:3000/api/admin/tiers/invalid-id',
        {
          method: 'DELETE',
        }
      )

      const response = await DELETE(request, { params: { id: 'invalid-id' } })
      const data = await response.json()

      expect(response.status).toBe(404)
      expect(data.error).toBeDefined()
    })

    it('should handle database errors', async () => {
      mockSupabase.single.mockResolvedValue({
        data: null,
        error: { code: '500', message: 'Database error' },
      })

      const request = new NextRequest(
        'http://localhost:3000/api/admin/tiers/tier-123',
        {
          method: 'DELETE',
        }
      )

      const response = await DELETE(request, { params: { id: 'tier-123' } })
      const data = await response.json()

      expect(response.status).toBe(500)
      expect(data.error).toBe('Failed to delete partnership tier')
    })

    it('should update timestamp on soft delete', async () => {
      mockSupabase.single.mockResolvedValue({
        data: {
          id: 'tier-123',
          name: 'Featured',
          slug: 'featured',
          monthly_price: 299.99,
          features: [],
          display_order: 1,
          is_active: false,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        },
        error: null,
      })

      const request = new NextRequest(
        'http://localhost:3000/api/admin/tiers/tier-123',
        {
          method: 'DELETE',
        }
      )

      const response = await DELETE(request, { params: { id: 'tier-123' } })

      expect(response.status).toBe(200)
      // Verify update was called with both is_active and updated_at
      expect(mockSupabase.update).toHaveBeenCalledWith(
        expect.objectContaining({
          is_active: false,
          updated_at: expect.any(String),
        })
      )
    })
  })
})
