import '@testing-library/jest-dom'
import { vi } from 'vitest'

// Mock Supabase client
vi.mock('@/lib/supabase/client', () => ({
  createClient: vi.fn(() => ({
    from: vi.fn(),
    auth: {
      getSession: vi.fn(),
      getUser: vi.fn(),
    },
  })),
}))

// Mock email client
vi.mock('@/lib/email/client', () => ({
  sendEmail: vi.fn(() => ({ id: 'test-email-id' })),
}))
