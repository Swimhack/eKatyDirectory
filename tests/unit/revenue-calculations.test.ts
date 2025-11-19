import { describe, it, expect } from 'vitest'
import {
  calculateMRR,
  aggregateByTier,
  calculateRevenueTrend,
  validatePartnershipData,
  getPartnershipStats,
  Partnership,
  TierBreakdown,
} from '@/lib/utils/revenue-calculations'

describe('Revenue Calculations Unit Tests', () => {
  describe('calculateMRR', () => {
    it('should calculate correct MRR with multiple partnerships', () => {
      const partnerships: Partnership[] = [
        {
          id: 'p1',
          tier_id: 'tier-1',
          status: 'active',
          created_at: '2025-01-01',
          updated_at: '2025-01-01',
          tier: { id: 'tier-1', monthly_price: 299.99, name: 'Premium' },
        },
        {
          id: 'p2',
          tier_id: 'tier-2',
          status: 'active',
          created_at: '2025-01-01',
          updated_at: '2025-01-01',
          tier: { id: 'tier-2', monthly_price: 199.99, name: 'Featured' },
        },
        {
          id: 'p3',
          tier_id: 'tier-3',
          status: 'active',
          created_at: '2025-01-01',
          updated_at: '2025-01-01',
          tier: { id: 'tier-3', monthly_price: 99.99, name: 'Basic' },
        },
      ]

      const mrr = calculateMRR(partnerships)

      expect(mrr).toBeCloseTo(599.97, 2)
    })

    it('should return 0 for empty partnerships array', () => {
      const partnerships: Partnership[] = []

      const mrr = calculateMRR(partnerships)

      expect(mrr).toBe(0)
    })

    it('should return 0 for null partnerships', () => {
      const mrr = calculateMRR(null as any)

      expect(mrr).toBe(0)
    })

    it('should handle partnerships with different tier prices', () => {
      const partnerships: Partnership[] = [
        {
          id: 'p1',
          tier_id: 'tier-1',
          status: 'active',
          created_at: '2025-01-01',
          updated_at: '2025-01-01',
          tier: { id: 'tier-1', monthly_price: 500, name: 'Enterprise' },
        },
        {
          id: 'p2',
          tier_id: 'tier-2',
          status: 'active',
          created_at: '2025-01-01',
          updated_at: '2025-01-01',
          tier: { id: 'tier-2', monthly_price: 100.5, name: 'Starter' },
        },
      ]

      const mrr = calculateMRR(partnerships)

      expect(mrr).toBeCloseTo(600.5, 2)
    })

    it('should ignore partnerships without tier information', () => {
      const partnerships: Partnership[] = [
        {
          id: 'p1',
          tier_id: 'tier-1',
          status: 'active',
          created_at: '2025-01-01',
          updated_at: '2025-01-01',
          tier: { id: 'tier-1', monthly_price: 200, name: 'Featured' },
        },
        {
          id: 'p2',
          tier_id: 'tier-2',
          status: 'active',
          created_at: '2025-01-01',
          updated_at: '2025-01-01',
          tier: undefined,
        },
      ]

      const mrr = calculateMRR(partnerships)

      expect(mrr).toBeCloseTo(200, 2)
    })

    it('should ignore negative prices (treat as 0)', () => {
      const partnerships: Partnership[] = [
        {
          id: 'p1',
          tier_id: 'tier-1',
          status: 'active',
          created_at: '2025-01-01',
          updated_at: '2025-01-01',
          tier: { id: 'tier-1', monthly_price: 300, name: 'Premium' },
        },
        {
          id: 'p2',
          tier_id: 'tier-2',
          status: 'active',
          created_at: '2025-01-01',
          updated_at: '2025-01-01',
          tier: { id: 'tier-2', monthly_price: -50, name: 'Discount' },
        },
      ]

      const mrr = calculateMRR(partnerships)

      expect(mrr).toBeCloseTo(300, 2)
    })

    it('should handle large number of partnerships', () => {
      const partnerships: Partnership[] = Array.from({ length: 100 }, (_, i) => ({
        id: `p${i}`,
        tier_id: `tier-${i % 3}`,
        status: 'active',
        created_at: '2025-01-01',
        updated_at: '2025-01-01',
        tier: { id: `tier-${i % 3}`, monthly_price: 199.99, name: 'Featured' },
      }))

      const mrr = calculateMRR(partnerships)

      expect(mrr).toBeCloseTo(19999, 2)
    })

    it('should handle zero tier prices', () => {
      const partnerships: Partnership[] = [
        {
          id: 'p1',
          tier_id: 'tier-1',
          status: 'active',
          created_at: '2025-01-01',
          updated_at: '2025-01-01',
          tier: { id: 'tier-1', monthly_price: 0, name: 'Free' },
        },
      ]

      const mrr = calculateMRR(partnerships)

      expect(mrr).toBe(0)
    })
  })

  describe('aggregateByTier', () => {
    it('should group partnerships by tier with correct counts and revenue', () => {
      const partnerships: Partnership[] = [
        {
          id: 'p1',
          tier_id: 'tier-1',
          status: 'active',
          created_at: '2025-01-01',
          updated_at: '2025-01-01',
          tier: { id: 'tier-1', monthly_price: 299.99, name: 'Premium' },
        },
        {
          id: 'p2',
          tier_id: 'tier-1',
          status: 'active',
          created_at: '2025-01-01',
          updated_at: '2025-01-01',
          tier: { id: 'tier-1', monthly_price: 299.99, name: 'Premium' },
        },
        {
          id: 'p3',
          tier_id: 'tier-2',
          status: 'active',
          created_at: '2025-01-01',
          updated_at: '2025-01-01',
          tier: { id: 'tier-2', monthly_price: 199.99, name: 'Featured' },
        },
      ]

      const aggregated = aggregateByTier(partnerships)

      expect(aggregated['tier-1'].count).toBe(2)
      expect(aggregated['tier-1'].revenue).toBeCloseTo(599.98, 2)
      expect(aggregated['tier-2'].count).toBe(1)
      expect(aggregated['tier-2'].revenue).toBeCloseTo(199.99, 2)
    })

    it('should return empty object for empty partnerships', () => {
      const partnerships: Partnership[] = []

      const aggregated = aggregateByTier(partnerships)

      expect(aggregated).toEqual({})
    })

    it('should return empty object for null partnerships', () => {
      const aggregated = aggregateByTier(null as any)

      expect(aggregated).toEqual({})
    })

    it('should handle partnerships without tier information', () => {
      const partnerships: Partnership[] = [
        {
          id: 'p1',
          tier_id: 'tier-1',
          status: 'active',
          created_at: '2025-01-01',
          updated_at: '2025-01-01',
          tier: { id: 'tier-1', monthly_price: 200, name: 'Featured' },
        },
        {
          id: 'p2',
          tier_id: 'tier-2',
          status: 'active',
          created_at: '2025-01-01',
          updated_at: '2025-01-01',
          tier: undefined,
        },
      ]

      const aggregated = aggregateByTier(partnerships)

      expect(aggregated['tier-1'].count).toBe(1)
      expect(aggregated['tier-1'].revenue).toBeCloseTo(200, 2)
      expect(aggregated['tier-2'].count).toBe(1)
      expect(aggregated['tier-2'].revenue).toBe(0)
    })

    it('should handle negative prices (treat as 0)', () => {
      const partnerships: Partnership[] = [
        {
          id: 'p1',
          tier_id: 'tier-1',
          status: 'active',
          created_at: '2025-01-01',
          updated_at: '2025-01-01',
          tier: { id: 'tier-1', monthly_price: 100, name: 'Basic' },
        },
        {
          id: 'p2',
          tier_id: 'tier-1',
          status: 'active',
          created_at: '2025-01-01',
          updated_at: '2025-01-01',
          tier: { id: 'tier-1', monthly_price: -50, name: 'Discount' },
        },
      ]

      const aggregated = aggregateByTier(partnerships)

      expect(aggregated['tier-1'].count).toBe(2)
      expect(aggregated['tier-1'].revenue).toBeCloseTo(100, 2)
    })

    it('should correctly aggregate multiple tiers', () => {
      const partnerships: Partnership[] = [
        {
          id: 'p1',
          tier_id: 'tier-premium',
          status: 'active',
          created_at: '2025-01-01',
          updated_at: '2025-01-01',
          tier: { id: 'tier-premium', monthly_price: 500, name: 'Premium' },
        },
        {
          id: 'p2',
          tier_id: 'tier-premium',
          status: 'active',
          created_at: '2025-01-01',
          updated_at: '2025-01-01',
          tier: { id: 'tier-premium', monthly_price: 500, name: 'Premium' },
        },
        {
          id: 'p3',
          tier_id: 'tier-featured',
          status: 'active',
          created_at: '2025-01-01',
          updated_at: '2025-01-01',
          tier: { id: 'tier-featured', monthly_price: 300, name: 'Featured' },
        },
        {
          id: 'p4',
          tier_id: 'tier-basic',
          status: 'active',
          created_at: '2025-01-01',
          updated_at: '2025-01-01',
          tier: { id: 'tier-basic', monthly_price: 100, name: 'Basic' },
        },
      ]

      const aggregated = aggregateByTier(partnerships)

      expect(Object.keys(aggregated).length).toBe(3)
      expect(aggregated['tier-premium'].count).toBe(2)
      expect(aggregated['tier-premium'].revenue).toBeCloseTo(1000, 2)
      expect(aggregated['tier-featured'].count).toBe(1)
      expect(aggregated['tier-featured'].revenue).toBeCloseTo(300, 2)
      expect(aggregated['tier-basic'].count).toBe(1)
      expect(aggregated['tier-basic'].revenue).toBeCloseTo(100, 2)
    })
  })

  describe('calculateRevenueTrend', () => {
    it('should return 6 months of trend data', () => {
      const partnerships: Partnership[] = [
        {
          id: 'p1',
          tier_id: 'tier-1',
          status: 'active',
          created_at: '2024-06-01',
          updated_at: '2025-11-18',
          tier: { id: 'tier-1', monthly_price: 100, name: 'Basic' },
        },
      ]

      const trend = calculateRevenueTrend(partnerships)

      expect(trend.length).toBe(6)
    })

    it('should order trend data from oldest to newest', () => {
      const partnerships: Partnership[] = [
        {
          id: 'p1',
          tier_id: 'tier-1',
          status: 'active',
          created_at: '2024-01-01',
          updated_at: '2025-11-18',
          tier: { id: 'tier-1', monthly_price: 100, name: 'Basic' },
        },
      ]

      const trend = calculateRevenueTrend(partnerships)

      // Verify dates are in ascending order
      for (let i = 1; i < trend.length; i++) {
        expect(trend[i].date >= trend[i - 1].date).toBe(true)
      }
    })

    it('should include correct structure in trend data points', () => {
      const partnerships: Partnership[] = [
        {
          id: 'p1',
          tier_id: 'tier-1',
          status: 'active',
          created_at: '2024-06-01',
          updated_at: '2025-11-18',
          tier: { id: 'tier-1', monthly_price: 200, name: 'Featured' },
        },
      ]

      const trend = calculateRevenueTrend(partnerships)

      trend.forEach((point) => {
        expect(point).toHaveProperty('date')
        expect(point).toHaveProperty('mrr')
        expect(point).toHaveProperty('active_partnerships')
        expect(typeof point.date).toBe('string')
        expect(typeof point.mrr).toBe('number')
        expect(typeof point.active_partnerships).toBe('number')
      })
    })

    it('should calculate MRR correctly for each month', () => {
      const partnerships: Partnership[] = [
        {
          id: 'p1',
          tier_id: 'tier-1',
          status: 'active',
          created_at: '2025-06-01',
          updated_at: '2025-11-18',
          tier: { id: 'tier-1', monthly_price: 300, name: 'Premium' },
        },
        {
          id: 'p2',
          tier_id: 'tier-2',
          status: 'active',
          created_at: '2025-09-01',
          updated_at: '2025-11-18',
          tier: { id: 'tier-2', monthly_price: 150, name: 'Featured' },
        },
      ]

      const trend = calculateRevenueTrend(partnerships)

      // First months should have only p1
      expect(trend[0].mrr).toBeCloseTo(300, 2)
      // Later months should have both
      expect(trend[3].mrr).toBeCloseTo(450, 2)
    })

    it('should handle empty partnerships', () => {
      const partnerships: Partnership[] = []

      const trend = calculateRevenueTrend(partnerships)

      expect(trend.length).toBe(6)
      trend.forEach((point) => {
        expect(point.mrr).toBe(0)
        expect(point.active_partnerships).toBe(0)
      })
    })

    it('should handle churned partnerships', () => {
      const partnerships: Partnership[] = [
        {
          id: 'p1',
          tier_id: 'tier-1',
          status: 'canceled',
          created_at: '2025-06-01',
          updated_at: '2025-09-01', // Churned in September
          tier: { id: 'tier-1', monthly_price: 200, name: 'Featured' },
        },
      ]

      const trend = calculateRevenueTrend(partnerships)

      // First month should have partnership
      expect(trend[0].mrr).toBeCloseTo(200, 2)
      // After churn date should have zero
      expect(trend[4].mrr).toBeLessThanOrEqual(0)
    })
  })

  describe('validatePartnershipData', () => {
    it('should return valid partnerships', () => {
      const partnerships: Partnership[] = [
        {
          id: 'p1',
          tier_id: 'tier-1',
          status: 'active',
          created_at: '2025-01-01',
          updated_at: '2025-01-01',
          tier: { id: 'tier-1', monthly_price: 100, name: 'Basic' },
        },
      ]

      const validated = validatePartnershipData(partnerships)

      expect(validated.length).toBe(1)
    })

    it('should filter out partnerships with missing id', () => {
      const partnerships: Partnership[] = [
        {
          id: 'p1',
          tier_id: 'tier-1',
          status: 'active',
          created_at: '2025-01-01',
          updated_at: '2025-01-01',
          tier: { id: 'tier-1', monthly_price: 100, name: 'Basic' },
        },
        {
          id: '',
          tier_id: 'tier-2',
          status: 'active',
          created_at: '2025-01-01',
          updated_at: '2025-01-01',
          tier: { id: 'tier-2', monthly_price: 200, name: 'Featured' },
        },
      ]

      const validated = validatePartnershipData(partnerships)

      expect(validated.length).toBe(1)
    })

    it('should filter out partnerships with missing tier_id', () => {
      const partnerships: Partnership[] = [
        {
          id: 'p1',
          tier_id: 'tier-1',
          status: 'active',
          created_at: '2025-01-01',
          updated_at: '2025-01-01',
          tier: { id: 'tier-1', monthly_price: 100, name: 'Basic' },
        },
        {
          id: 'p2',
          tier_id: '',
          status: 'active',
          created_at: '2025-01-01',
          updated_at: '2025-01-01',
        },
      ]

      const validated = validatePartnershipData(partnerships)

      expect(validated.length).toBe(1)
    })

    it('should filter out partnerships with missing status', () => {
      const partnerships: Partnership[] = [
        {
          id: 'p1',
          tier_id: 'tier-1',
          status: 'active',
          created_at: '2025-01-01',
          updated_at: '2025-01-01',
        },
        {
          id: 'p2',
          tier_id: 'tier-2',
          status: '',
          created_at: '2025-01-01',
          updated_at: '2025-01-01',
        },
      ]

      const validated = validatePartnershipData(partnerships)

      expect(validated.length).toBe(1)
    })

    it('should filter out partnerships with invalid tier price type', () => {
      const partnerships = [
        {
          id: 'p1',
          tier_id: 'tier-1',
          status: 'active',
          created_at: '2025-01-01',
          updated_at: '2025-01-01',
          tier: { id: 'tier-1', monthly_price: 100, name: 'Basic' },
        },
        {
          id: 'p2',
          tier_id: 'tier-2',
          status: 'active',
          created_at: '2025-01-01',
          updated_at: '2025-01-01',
          tier: { id: 'tier-2', monthly_price: 'invalid', name: 'Featured' },
        },
      ] as any

      const validated = validatePartnershipData(partnerships)

      expect(validated.length).toBe(1)
    })

    it('should filter out partnerships with negative tier price', () => {
      const partnerships: Partnership[] = [
        {
          id: 'p1',
          tier_id: 'tier-1',
          status: 'active',
          created_at: '2025-01-01',
          updated_at: '2025-01-01',
          tier: { id: 'tier-1', monthly_price: 100, name: 'Basic' },
        },
        {
          id: 'p2',
          tier_id: 'tier-2',
          status: 'active',
          created_at: '2025-01-01',
          updated_at: '2025-01-01',
          tier: { id: 'tier-2', monthly_price: -50, name: 'Invalid' },
        },
      ]

      const validated = validatePartnershipData(partnerships)

      expect(validated.length).toBe(1)
    })

    it('should handle null partnerships input', () => {
      const validated = validatePartnershipData(null as any)

      expect(validated).toEqual([])
    })

    it('should handle non-array input', () => {
      const validated = validatePartnershipData('not-an-array' as any)

      expect(validated).toEqual([])
    })

    it('should allow zero tier price', () => {
      const partnerships: Partnership[] = [
        {
          id: 'p1',
          tier_id: 'tier-1',
          status: 'active',
          created_at: '2025-01-01',
          updated_at: '2025-01-01',
          tier: { id: 'tier-1', monthly_price: 0, name: 'Free' },
        },
      ]

      const validated = validatePartnershipData(partnerships)

      expect(validated.length).toBe(1)
    })
  })

  describe('getPartnershipStats', () => {
    it('should count new partnerships in period', () => {
      const startDate = new Date('2025-11-01')
      const endDate = new Date('2025-11-30')

      const partnerships: Partnership[] = [
        {
          id: 'p1',
          tier_id: 'tier-1',
          status: 'active',
          created_at: '2025-11-15',
          updated_at: '2025-11-15',
          tier: { id: 'tier-1', monthly_price: 100, name: 'Basic' },
        },
        {
          id: 'p2',
          tier_id: 'tier-2',
          status: 'active',
          created_at: '2025-10-15',
          updated_at: '2025-11-15',
        },
      ]

      const stats = getPartnershipStats(partnerships, startDate, endDate)

      expect(stats.newCount).toBe(1)
    })

    it('should count churned partnerships in period', () => {
      const startDate = new Date('2025-11-01')
      const endDate = new Date('2025-11-30')

      const partnerships: Partnership[] = [
        {
          id: 'p1',
          tier_id: 'tier-1',
          status: 'canceled',
          created_at: '2025-09-01',
          updated_at: '2025-11-15',
          tier: { id: 'tier-1', monthly_price: 100, name: 'Basic' },
        },
        {
          id: 'p2',
          tier_id: 'tier-2',
          status: 'expired',
          created_at: '2025-10-01',
          updated_at: '2025-11-20',
        },
      ]

      const stats = getPartnershipStats(partnerships, startDate, endDate)

      expect(stats.churnedCount).toBe(2)
    })

    it('should not count active partnerships as churned', () => {
      const startDate = new Date('2025-11-01')
      const endDate = new Date('2025-11-30')

      const partnerships: Partnership[] = [
        {
          id: 'p1',
          tier_id: 'tier-1',
          status: 'active',
          created_at: '2025-09-01',
          updated_at: '2025-11-15',
          tier: { id: 'tier-1', monthly_price: 100, name: 'Basic' },
        },
      ]

      const stats = getPartnershipStats(partnerships, startDate, endDate)

      expect(stats.churnedCount).toBe(0)
    })

    it('should handle empty partnerships', () => {
      const startDate = new Date('2025-11-01')
      const endDate = new Date('2025-11-30')
      const partnerships: Partnership[] = []

      const stats = getPartnershipStats(partnerships, startDate, endDate)

      expect(stats.newCount).toBe(0)
      expect(stats.churnedCount).toBe(0)
    })

    it('should return both stats in single object', () => {
      const startDate = new Date('2025-11-01')
      const endDate = new Date('2025-11-30')

      const partnerships: Partnership[] = [
        {
          id: 'p1',
          tier_id: 'tier-1',
          status: 'active',
          created_at: '2025-11-10',
          updated_at: '2025-11-10',
          tier: { id: 'tier-1', monthly_price: 100, name: 'Basic' },
        },
        {
          id: 'p2',
          tier_id: 'tier-2',
          status: 'canceled',
          created_at: '2025-09-01',
          updated_at: '2025-11-20',
        },
      ]

      const stats = getPartnershipStats(partnerships, startDate, endDate)

      expect(stats).toHaveProperty('newCount')
      expect(stats).toHaveProperty('churnedCount')
      expect(stats.newCount).toBe(1)
      expect(stats.churnedCount).toBe(1)
    })

    it('should handle partnerships outside of period', () => {
      const startDate = new Date('2025-11-01')
      const endDate = new Date('2025-11-30')

      const partnerships: Partnership[] = [
        {
          id: 'p1',
          tier_id: 'tier-1',
          status: 'active',
          created_at: '2025-10-15',
          updated_at: '2025-10-15',
        },
        {
          id: 'p2',
          tier_id: 'tier-2',
          status: 'canceled',
          created_at: '2025-09-01',
          updated_at: '2025-10-15',
        },
      ]

      const stats = getPartnershipStats(partnerships, startDate, endDate)

      expect(stats.newCount).toBe(0)
      expect(stats.churnedCount).toBe(0)
    })

    it('should handle null partnerships', () => {
      const startDate = new Date('2025-11-01')
      const endDate = new Date('2025-11-30')

      const stats = getPartnershipStats(null as any, startDate, endDate)

      expect(stats.newCount).toBe(0)
      expect(stats.churnedCount).toBe(0)
    })
  })
})
