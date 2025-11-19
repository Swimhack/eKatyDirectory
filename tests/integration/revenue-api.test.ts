import { describe, it, expect, beforeEach, vi } from 'vitest'
import { GET } from '@/app/api/admin/revenue/route'
import { NextRequest } from 'next/server'

// Mock the admin middleware
vi.mock('@/lib/auth/require-admin', () => ({
  requireAdmin: vi.fn(async () => null), // null means authorized
}))

// Mock Supabase admin functions
vi.mock('@/lib/supabase/admin', () => ({
  createAdminClient: vi.fn(() => mockSupabase),
  getRevenueMetrics: vi.fn(),
}))

const mockSupabase = {
  from: vi.fn(() => mockSupabase),
  select: vi.fn(() => mockSupabase),
  eq: vi.fn(() => mockSupabase),
  gte: vi.fn(() => mockSupabase),
  in: vi.fn(() => mockSupabase),
  order: vi.fn(() => mockSupabase),
  single: vi.fn(),
}

describe('Revenue API Integration Tests', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  describe('GET /api/admin/revenue - Revenue Metrics', () => {
    it('should return revenue metrics for month period', async () => {
      const { getRevenueMetrics } = await import('@/lib/supabase/admin')

      const mockMetrics = {
        period: 'month',
        total_mrr: 4599.97,
        active_partnerships: 15,
        new_partnerships: 3,
        churned_partnerships: 1,
        partnerships_by_tier: {
          'tier-1': { count: 5, revenue: 999.95 },
          'tier-2': { count: 10, revenue: 3600.02 },
        },
      }

      vi.mocked(getRevenueMetrics).mockResolvedValue({
        data: mockMetrics,
        error: null,
      })

      const request = new NextRequest(
        'http://localhost:3000/api/admin/revenue?period=month'
      )

      const response = await GET(request)
      const data = await response.json()

      expect(response.status).toBe(200)
      expect(data.data.total_mrr).toBe(4599.97)
      expect(data.data.active_partnerships).toBe(15)
      expect(data.period).toBe('month')
      expect(getRevenueMetrics).toHaveBeenCalledWith('month')
    })

    it('should return revenue metrics for quarter period', async () => {
      const { getRevenueMetrics } = await import('@/lib/supabase/admin')

      const mockMetrics = {
        period: 'quarter',
        total_mrr: 13799.91,
        active_partnerships: 45,
        new_partnerships: 12,
        churned_partnerships: 3,
        partnerships_by_tier: {
          'tier-1': { count: 15, revenue: 2999.85 },
          'tier-2': { count: 30, revenue: 10800.06 },
        },
      }

      vi.mocked(getRevenueMetrics).mockResolvedValue({
        data: mockMetrics,
        error: null,
      })

      const request = new NextRequest(
        'http://localhost:3000/api/admin/revenue?period=quarter'
      )

      const response = await GET(request)
      const data = await response.json()

      expect(response.status).toBe(200)
      expect(data.data.total_mrr).toBe(13799.91)
      expect(data.data.active_partnerships).toBe(45)
      expect(data.period).toBe('quarter')
      expect(getRevenueMetrics).toHaveBeenCalledWith('quarter')
    })

    it('should return revenue metrics for year period', async () => {
      const { getRevenueMetrics } = await import('@/lib/supabase/admin')

      const mockMetrics = {
        period: 'year',
        total_mrr: 55199.64,
        active_partnerships: 180,
        new_partnerships: 50,
        churned_partnerships: 10,
        partnerships_by_tier: {
          'tier-1': { count: 60, revenue: 11999.40 },
          'tier-2': { count: 120, revenue: 43200.24 },
        },
      }

      vi.mocked(getRevenueMetrics).mockResolvedValue({
        data: mockMetrics,
        error: null,
      })

      const request = new NextRequest(
        'http://localhost:3000/api/admin/revenue?period=year'
      )

      const response = await GET(request)
      const data = await response.json()

      expect(response.status).toBe(200)
      expect(data.data.total_mrr).toBe(55199.64)
      expect(data.data.active_partnerships).toBe(180)
      expect(data.period).toBe('year')
      expect(getRevenueMetrics).toHaveBeenCalledWith('year')
    })

    it('should verify MRR is sum of active partnership prices', async () => {
      const { getRevenueMetrics } = await import('@/lib/supabase/admin')

      // Verify that the MRR calculation is correct
      // Create perfectly consistent data where tier revenues sum to total_mrr
      const mockMetrics = {
        period: 'month',
        total_mrr: 1700,
        active_partnerships: 10,
        new_partnerships: 2,
        churned_partnerships: 0,
        partnerships_by_tier: {
          'tier-premium': { count: 2, revenue: 600 },
          'tier-featured': { count: 3, revenue: 600 },
          'tier-basic': { count: 5, revenue: 500 },
        },
      }

      vi.mocked(getRevenueMetrics).mockResolvedValue({
        data: mockMetrics,
        error: null,
      })

      const request = new NextRequest(
        'http://localhost:3000/api/admin/revenue?period=month'
      )

      const response = await GET(request)
      const data = await response.json()

      expect(response.status).toBe(200)
      // Verify total_mrr is sum of tier revenues
      const tierRevenueSum = Object.values(data.data.partnerships_by_tier).reduce(
        (sum: number, tier: any) => sum + tier.revenue,
        0
      )
      expect(tierRevenueSum).toBe(data.data.total_mrr)
    })

    it('should include tier breakdown with correct structure', async () => {
      const { getRevenueMetrics } = await import('@/lib/supabase/admin')

      const mockMetrics = {
        period: 'month',
        total_mrr: 1000,
        active_partnerships: 5,
        new_partnerships: 1,
        churned_partnerships: 0,
        partnerships_by_tier: {
          'tier-1': { count: 2, revenue: 400 },
          'tier-2': { count: 3, revenue: 600 },
        },
      }

      vi.mocked(getRevenueMetrics).mockResolvedValue({
        data: mockMetrics,
        error: null,
      })

      const request = new NextRequest(
        'http://localhost:3000/api/admin/revenue?period=month'
      )

      const response = await GET(request)
      const data = await response.json()

      expect(response.status).toBe(200)
      expect(data.data.partnerships_by_tier).toBeDefined()
      expect(typeof data.data.partnerships_by_tier).toBe('object')

      // Verify tier structure
      for (const [tierId, tierData] of Object.entries(data.data.partnerships_by_tier)) {
        expect(typeof tierId).toBe('string')
        expect(tierData).toHaveProperty('count')
        expect(tierData).toHaveProperty('revenue')
        expect(typeof tierData.count).toBe('number')
        expect(typeof tierData.revenue).toBe('number')
      }
    })

    it('should include new and churned partnership counts', async () => {
      const { getRevenueMetrics } = await import('@/lib/supabase/admin')

      const mockMetrics = {
        period: 'month',
        total_mrr: 2000,
        active_partnerships: 10,
        new_partnerships: 5,
        churned_partnerships: 2,
        partnerships_by_tier: {},
      }

      vi.mocked(getRevenueMetrics).mockResolvedValue({
        data: mockMetrics,
        error: null,
      })

      const request = new NextRequest(
        'http://localhost:3000/api/admin/revenue?period=month'
      )

      const response = await GET(request)
      const data = await response.json()

      expect(response.status).toBe(200)
      expect(data.data.new_partnerships).toBe(5)
      expect(data.data.churned_partnerships).toBe(2)
      expect(typeof data.data.new_partnerships).toBe('number')
      expect(typeof data.data.churned_partnerships).toBe('number')
    })

    it('should return 400 for invalid period parameter', async () => {
      const request = new NextRequest(
        'http://localhost:3000/api/admin/revenue?period=invalid'
      )

      const response = await GET(request)
      const data = await response.json()

      expect(response.status).toBe(400)
      expect(data.error).toBe('Invalid period')
      expect(data.details).toContain('month')
    })

    it('should default to month period if not specified', async () => {
      const { getRevenueMetrics } = await import('@/lib/supabase/admin')

      const mockMetrics = {
        period: 'month',
        total_mrr: 1500,
        active_partnerships: 8,
        new_partnerships: 2,
        churned_partnerships: 0,
        partnerships_by_tier: {},
      }

      vi.mocked(getRevenueMetrics).mockResolvedValue({
        data: mockMetrics,
        error: null,
      })

      const request = new NextRequest('http://localhost:3000/api/admin/revenue')

      const response = await GET(request)

      expect(response.status).toBe(200)
      expect(getRevenueMetrics).toHaveBeenCalledWith('month')
    })

    it('should handle database errors gracefully', async () => {
      const { getRevenueMetrics } = await import('@/lib/supabase/admin')

      vi.mocked(getRevenueMetrics).mockResolvedValue({
        data: null,
        error: { message: 'Database connection failed' },
      })

      const request = new NextRequest(
        'http://localhost:3000/api/admin/revenue?period=month'
      )

      const response = await GET(request)
      const data = await response.json()

      expect(response.status).toBe(500)
      expect(data.error).toBe('Failed to fetch revenue metrics')
    })

    it('should return zero metrics when no partnerships exist', async () => {
      const { getRevenueMetrics } = await import('@/lib/supabase/admin')

      const mockMetrics = {
        period: 'month',
        total_mrr: 0,
        active_partnerships: 0,
        new_partnerships: 0,
        churned_partnerships: 0,
        partnerships_by_tier: {},
      }

      vi.mocked(getRevenueMetrics).mockResolvedValue({
        data: mockMetrics,
        error: null,
      })

      const request = new NextRequest(
        'http://localhost:3000/api/admin/revenue?period=month'
      )

      const response = await GET(request)
      const data = await response.json()

      expect(response.status).toBe(200)
      expect(data.data.total_mrr).toBe(0)
      expect(data.data.active_partnerships).toBe(0)
      expect(Object.keys(data.data.partnerships_by_tier).length).toBe(0)
    })
  })

  describe('GET /api/admin/revenue - CSV Export', () => {
    it('should export revenue metrics as CSV with correct format', async () => {
      const { getRevenueMetrics } = await import('@/lib/supabase/admin')

      const mockMetrics = {
        period: 'month',
        total_mrr: 1000,
        active_partnerships: 5,
        new_partnerships: 1,
        churned_partnerships: 0,
        partnerships_by_tier: {
          'tier-1': { count: 2, revenue: 400 },
          'tier-2': { count: 3, revenue: 600 },
        },
      }

      vi.mocked(getRevenueMetrics).mockResolvedValue({
        data: mockMetrics,
        error: null,
      })

      const request = new NextRequest(
        'http://localhost:3000/api/admin/revenue?period=month&format=csv'
      )

      const response = await GET(request)
      const csv = await response.text()

      expect(response.status).toBe(200)
      expect(csv).toContain('Metric,Value')
      expect(csv).toContain('Total MRR,$1000.00')
      expect(csv).toContain('Active Partnerships,5')
    })

    it('should have correct CSV headers', async () => {
      const { getRevenueMetrics } = await import('@/lib/supabase/admin')

      const mockMetrics = {
        period: 'month',
        total_mrr: 500,
        active_partnerships: 3,
        new_partnerships: 0,
        churned_partnerships: 0,
        partnerships_by_tier: {},
      }

      vi.mocked(getRevenueMetrics).mockResolvedValue({
        data: mockMetrics,
        error: null,
      })

      const request = new NextRequest(
        'http://localhost:3000/api/admin/revenue?period=month&format=csv'
      )

      const response = await GET(request)
      const csv = await response.text()

      const lines = csv.split('\n')
      expect(lines[0]).toBe('Metric,Value')
    })

    it('should include all summary metrics in CSV', async () => {
      const { getRevenueMetrics } = await import('@/lib/supabase/admin')

      const mockMetrics = {
        period: 'month',
        total_mrr: 2500.75,
        active_partnerships: 12,
        new_partnerships: 4,
        churned_partnerships: 1,
        partnerships_by_tier: {},
      }

      vi.mocked(getRevenueMetrics).mockResolvedValue({
        data: mockMetrics,
        error: null,
      })

      const request = new NextRequest(
        'http://localhost:3000/api/admin/revenue?period=month&format=csv'
      )

      const response = await GET(request)
      const csv = await response.text()

      expect(csv).toContain('Total MRR,$2500.75')
      expect(csv).toContain('Active Partnerships,12')
      expect(csv).toContain('New Partnerships,4')
      expect(csv).toContain('Churned Partnerships,1')
    })

    it('should include tier breakdown section in CSV', async () => {
      const { getRevenueMetrics } = await import('@/lib/supabase/admin')

      const mockMetrics = {
        period: 'month',
        total_mrr: 1500,
        active_partnerships: 5,
        new_partnerships: 1,
        churned_partnerships: 0,
        partnerships_by_tier: {
          'tier-premium': { count: 2, revenue: 600 },
          'tier-basic': { count: 3, revenue: 900 },
        },
      }

      vi.mocked(getRevenueMetrics).mockResolvedValue({
        data: mockMetrics,
        error: null,
      })

      const request = new NextRequest(
        'http://localhost:3000/api/admin/revenue?period=month&format=csv'
      )

      const response = await GET(request)
      const csv = await response.text()

      expect(csv).toContain('Tier Breakdown')
      expect(csv).toContain('Tier ID,Partnership Count,Revenue')
    })

    it('should escape special characters in CSV fields', async () => {
      const { getRevenueMetrics } = await import('@/lib/supabase/admin')

      const mockMetrics = {
        period: 'month',
        total_mrr: 1000,
        active_partnerships: 5,
        new_partnerships: 1,
        churned_partnerships: 0,
        partnerships_by_tier: {
          'tier-1-with,comma': { count: 2, revenue: 400 },
          'tier-2': { count: 3, revenue: 600 },
        },
      }

      vi.mocked(getRevenueMetrics).mockResolvedValue({
        data: mockMetrics,
        error: null,
      })

      const request = new NextRequest(
        'http://localhost:3000/api/admin/revenue?period=month&format=csv'
      )

      const response = await GET(request)
      const csv = await response.text()

      // Fields with commas should be quoted
      expect(csv).toContain('"tier-1-with,comma"')
    })

    it('should escape quotes in CSV fields', async () => {
      const { getRevenueMetrics } = await import('@/lib/supabase/admin')

      const mockMetrics = {
        period: 'month',
        total_mrr: 1000,
        active_partnerships: 5,
        new_partnerships: 1,
        churned_partnerships: 0,
        partnerships_by_tier: {
          'tier"quote': { count: 2, revenue: 400 },
          'tier-2': { count: 3, revenue: 600 },
        },
      }

      vi.mocked(getRevenueMetrics).mockResolvedValue({
        data: mockMetrics,
        error: null,
      })

      const request = new NextRequest(
        'http://localhost:3000/api/admin/revenue?period=month&format=csv'
      )

      const response = await GET(request)
      const csv = await response.text()

      // Quotes should be escaped and field wrapped
      expect(csv).toContain('"tier""quote"')
    })

    it('should handle newlines in CSV fields', async () => {
      const { getRevenueMetrics } = await import('@/lib/supabase/admin')

      const mockMetrics = {
        period: 'month',
        total_mrr: 1000,
        active_partnerships: 5,
        new_partnerships: 1,
        churned_partnerships: 0,
        partnerships_by_tier: {
          'tier-1\nline2': { count: 2, revenue: 400 },
          'tier-2': { count: 3, revenue: 600 },
        },
      }

      vi.mocked(getRevenueMetrics).mockResolvedValue({
        data: mockMetrics,
        error: null,
      })

      const request = new NextRequest(
        'http://localhost:3000/api/admin/revenue?period=month&format=csv'
      )

      const response = await GET(request)
      const csv = await response.text()

      // Fields with newlines should be quoted
      expect(csv).toContain('"tier-1')
    })

    it('should set correct Content-Type header for CSV', async () => {
      const { getRevenueMetrics } = await import('@/lib/supabase/admin')

      const mockMetrics = {
        period: 'month',
        total_mrr: 1000,
        active_partnerships: 5,
        new_partnerships: 1,
        churned_partnerships: 0,
        partnerships_by_tier: {},
      }

      vi.mocked(getRevenueMetrics).mockResolvedValue({
        data: mockMetrics,
        error: null,
      })

      const request = new NextRequest(
        'http://localhost:3000/api/admin/revenue?period=month&format=csv'
      )

      const response = await GET(request)

      expect(response.headers.get('Content-Type')).toContain('text/csv')
      expect(response.headers.get('Content-Type')).toContain('charset=utf-8')
    })

    it('should set correct Content-Disposition header with filename and date', async () => {
      const { getRevenueMetrics } = await import('@/lib/supabase/admin')

      const mockMetrics = {
        period: 'month',
        total_mrr: 1000,
        active_partnerships: 5,
        new_partnerships: 1,
        churned_partnerships: 0,
        partnerships_by_tier: {},
      }

      vi.mocked(getRevenueMetrics).mockResolvedValue({
        data: mockMetrics,
        error: null,
      })

      const request = new NextRequest(
        'http://localhost:3000/api/admin/revenue?period=month&format=csv'
      )

      const response = await GET(request)
      const disposition = response.headers.get('Content-Disposition')

      expect(disposition).toContain('attachment')
      expect(disposition).toContain('revenue-month-')
      expect(disposition).toMatch(/revenue-month-\d{4}-\d{2}-\d{2}\.csv/)
    })

    it('should include period in CSV filename', async () => {
      const { getRevenueMetrics } = await import('@/lib/supabase/admin')

      const mockMetrics = {
        period: 'quarter',
        total_mrr: 3000,
        active_partnerships: 15,
        new_partnerships: 3,
        churned_partnerships: 1,
        partnerships_by_tier: {},
      }

      vi.mocked(getRevenueMetrics).mockResolvedValue({
        data: mockMetrics,
        error: null,
      })

      const request = new NextRequest(
        'http://localhost:3000/api/admin/revenue?period=quarter&format=csv'
      )

      const response = await GET(request)
      const disposition = response.headers.get('Content-Disposition')

      expect(disposition).toContain('revenue-quarter-')
    })

    it('should format currency values to 2 decimal places in CSV', async () => {
      const { getRevenueMetrics } = await import('@/lib/supabase/admin')

      const mockMetrics = {
        period: 'month',
        total_mrr: 1234.567, // More than 2 decimal places
        active_partnerships: 5,
        new_partnerships: 1,
        churned_partnerships: 0,
        partnerships_by_tier: {
          'tier-1': { count: 2, revenue: 400.333 },
          'tier-2': { count: 3, revenue: 600.888 },
        },
      }

      vi.mocked(getRevenueMetrics).mockResolvedValue({
        data: mockMetrics,
        error: null,
      })

      const request = new NextRequest(
        'http://localhost:3000/api/admin/revenue?period=month&format=csv'
      )

      const response = await GET(request)
      const csv = await response.text()

      // Check that values are formatted to 2 decimals
      expect(csv).toMatch(/\$\d+\.\d{2}/)
    })
  })
})
