import { describe, it, expect, vi, beforeEach } from 'vitest'
import { NextRequest } from 'next/server'
import { requireAdmin } from '@/lib/auth/require-admin'

// Mock next/headers
vi.mock('next/headers', () => ({
  cookies: vi.fn(() => ({
    get: vi.fn(),
    set: vi.fn(),
  })),
}))

// Mock Supabase client
const mockSupabase = {
  auth: {
    getSession: vi.fn(),
  },
  from: vi.fn(() => ({
    select: vi.fn(() => ({
      eq: vi.fn(() => ({
        single: vi.fn(),
      })),
    })),
  })),
}

vi.mock('@supabase/auth-helpers-nextjs', () => ({
  createRouteHandlerClient: vi.fn(() => mockSupabase),
}))

describe('requireAdmin middleware', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('should return 401 when no session exists', async () => {
    mockSupabase.auth.getSession.mockResolvedValue({
      data: { session: null },
      error: null,
    })

    const request = new NextRequest('http://localhost:3000/api/admin/test')
    const response = await requireAdmin(request)

    expect(response).toBeTruthy()
    expect(response?.status).toBe(401)
    const body = await response?.json()
    expect(body).toEqual({ error: 'Unauthorized' })
  })

  it('should return 401 when session error occurs', async () => {
    mockSupabase.auth.getSession.mockResolvedValue({
      data: { session: null },
      error: new Error('Session error'),
    })

    const request = new NextRequest('http://localhost:3000/api/admin/test')
    const response = await requireAdmin(request)

    expect(response).toBeTruthy()
    expect(response?.status).toBe(401)
  })

  it('should return 403 when user is not admin', async () => {
    mockSupabase.auth.getSession.mockResolvedValue({
      data: {
        session: {
          user: { id: 'user-123', email: 'user@example.com' },
        },
      },
      error: null,
    })

    const mockSelect = vi.fn(() => ({
      eq: vi.fn(() => ({
        single: vi.fn().mockResolvedValue({
          data: { role: 'user' },
          error: null,
        }),
      })),
    }))

    mockSupabase.from.mockReturnValue({
      select: mockSelect,
    })

    const request = new NextRequest('http://localhost:3000/api/admin/test')
    const response = await requireAdmin(request)

    expect(response).toBeTruthy()
    expect(response?.status).toBe(403)
    const body = await response?.json()
    expect(body).toEqual({ error: 'Forbidden - admin access required' })
  })

  it('should return null (success) when user is admin', async () => {
    mockSupabase.auth.getSession.mockResolvedValue({
      data: {
        session: {
          user: { id: 'admin-123', email: 'admin@example.com' },
        },
      },
      error: null,
    })

    const mockSelect = vi.fn(() => ({
      eq: vi.fn(() => ({
        single: vi.fn().mockResolvedValue({
          data: { role: 'admin' },
          error: null,
        }),
      })),
    }))

    mockSupabase.from.mockReturnValue({
      select: mockSelect,
    })

    const request = new NextRequest('http://localhost:3000/api/admin/test')
    const response = await requireAdmin(request)

    expect(response).toBeNull()
  })

  it('should return 500 when user query fails', async () => {
    mockSupabase.auth.getSession.mockResolvedValue({
      data: {
        session: {
          user: { id: 'user-123', email: 'user@example.com' },
        },
      },
      error: null,
    })

    const mockSelect = vi.fn(() => ({
      eq: vi.fn(() => ({
        single: vi.fn().mockResolvedValue({
          data: null,
          error: new Error('Database error'),
        }),
      })),
    }))

    mockSupabase.from.mockReturnValue({
      select: mockSelect,
    })

    const request = new NextRequest('http://localhost:3000/api/admin/test')
    const response = await requireAdmin(request)

    expect(response).toBeTruthy()
    expect(response?.status).toBe(500)
  })
})
