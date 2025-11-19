import { describe, it, expect, vi, beforeEach } from 'vitest'
import { checkRateLimit, checkEmailRateLimit, RATE_LIMITS } from '@/lib/utils/rate-limiter'

// Mock next/headers
vi.mock('next/headers', () => ({
  cookies: vi.fn(() => ({
    get: vi.fn(),
    set: vi.fn(),
  })),
}))

// Mock Supabase client
const mockSupabase = {
  from: vi.fn(),
}

// Helper to create a complete mock chain
const createMockChain = (count: number | null, error: any = null) => ({
  select: vi.fn(() => ({
    gte: vi.fn(() => ({
      in: vi.fn().mockResolvedValue({ count, error }),
    })),
  })),
})

vi.mock('@supabase/auth-helpers-nextjs', () => ({
  createRouteHandlerClient: vi.fn(() => mockSupabase),
}))

describe('Rate Limiter', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  describe('checkRateLimit', () => {
    it('should allow requests within limit', async () => {
      mockSupabase.from.mockReturnValue(createMockChain(25))

      const result = await checkRateLimit('user-123', 50, 3600)

      expect(result.allowed).toBe(true)
      expect(result.current).toBe(25)
      expect(result.remaining).toBe(25)
    })

    it('should deny requests when limit exceeded', async () => {
      mockSupabase.from.mockReturnValue(createMockChain(55))

      const result = await checkRateLimit('user-123', 50, 3600)

      expect(result.allowed).toBe(false)
      expect(result.current).toBe(55)
      expect(result.remaining).toBe(0)
    })

    it('should allow requests when exactly at limit', async () => {
      mockSupabase.from.mockReturnValue(createMockChain(49))

      const result = await checkRateLimit('user-123', 50, 3600)

      expect(result.allowed).toBe(true)
      expect(result.current).toBe(49)
      expect(result.remaining).toBe(1)
    })

    it('should fail open on database error', async () => {
      mockSupabase.from.mockReturnValue(createMockChain(null, new Error('Database error')))

      const result = await checkRateLimit('user-123', 50, 3600)

      // Should allow on error (fail open)
      expect(result.allowed).toBe(true)
      expect(result.current).toBe(0)
    })

    it('should include resetAt timestamp', async () => {
      mockSupabase.from.mockReturnValue(createMockChain(10))

      const beforeTime = Date.now()
      const result = await checkRateLimit('user-123', 50, 3600)
      const afterTime = Date.now()

      expect(result.resetAt).toBeInstanceOf(Date)
      expect(result.resetAt.getTime()).toBeGreaterThan(beforeTime)
      expect(result.resetAt.getTime()).toBeLessThan(afterTime + 3600 * 1000 + 1000)
    })
  })

  describe('checkEmailRateLimit', () => {
    it('should allow when both hourly and daily limits pass', async () => {
      mockSupabase.from
        .mockReturnValueOnce(createMockChain(25)) // Hourly
        .mockReturnValueOnce(createMockChain(100)) // Daily

      const result = await checkEmailRateLimit('user-123')

      expect(result.allowed).toBe(true)
      expect(result.hourly.allowed).toBe(true)
      expect(result.daily.allowed).toBe(true)
      expect(result.message).toBeUndefined()
    })

    it('should deny when hourly limit exceeded', async () => {
      mockSupabase.from
        .mockReturnValueOnce(createMockChain(55)) // Hourly exceeded
        .mockReturnValueOnce(createMockChain(100)) // Daily OK

      const result = await checkEmailRateLimit('user-123')

      expect(result.allowed).toBe(false)
      expect(result.hourly.allowed).toBe(false)
      expect(result.daily.allowed).toBe(true)
      expect(result.message).toContain('Hourly rate limit exceeded')
      expect(result.message).toContain(`55/${RATE_LIMITS.EMAIL_HOURLY}`)
    })

    it('should deny when daily limit exceeded', async () => {
      mockSupabase.from
        .mockReturnValueOnce(createMockChain(25)) // Hourly OK
        .mockReturnValueOnce(createMockChain(210)) // Daily exceeded

      const result = await checkEmailRateLimit('user-123')

      expect(result.allowed).toBe(false)
      expect(result.hourly.allowed).toBe(true)
      expect(result.daily.allowed).toBe(false)
      expect(result.message).toContain('Daily rate limit exceeded')
      expect(result.message).toContain(`210/${RATE_LIMITS.EMAIL_DAILY}`)
    })
  })
})
