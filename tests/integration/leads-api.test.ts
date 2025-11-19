import { describe, it, expect, beforeEach, vi } from 'vitest'
import { GET, POST } from '@/app/api/admin/leads/route'
import { GET as GET_DETAIL, PATCH } from '@/app/api/admin/leads/[id]/route'
import { NextRequest } from 'next/server'

// Mock the admin middleware
vi.mock('@/lib/auth/require-admin', () => ({
  requireAdmin: vi.fn(async () => null), // null means authorized
}))

// Mock Supabase admin functions
vi.mock('@/lib/supabase/admin', () => ({
  createAdminClient: vi.fn(() => mockSupabase),
  getRestaurantLeads: vi.fn(),
  getLeadDetails: vi.fn(),
}))

const mockSupabase = {
  from: vi.fn(() => mockSupabase),
  insert: vi.fn(() => mockSupabase),
  update: vi.fn(() => mockSupabase),
  select: vi.fn(() => mockSupabase),
  eq: vi.fn(() => mockSupabase),
  single: vi.fn(),
}

describe('Leads API Integration Tests', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  describe('POST /api/admin/leads - Create Lead', () => {
    it('should create a new lead with valid data', async () => {
      const leadData = {
        business_name: 'Tacos & More',
        contact_name: 'Maria Garcia',
        email: 'maria@tacosandmore.com',
        phone: '281-555-0100',
        address: '123 Main St',
        city: 'Katy',
        cuisine_type: 'Mexican',
        status: 'new',
        source: 'website',
      }

      const mockCreatedLead = { id: 'lead-123', ...leadData, created_at: new Date().toISOString() }

      mockSupabase.single.mockResolvedValue({
        data: mockCreatedLead,
        error: null,
      })

      const request = new NextRequest('http://localhost:3000/api/admin/leads', {
        method: 'POST',
        body: JSON.stringify(leadData),
      })

      const response = await POST(request)
      const data = await response.json()

      expect(response.status).toBe(201)
      expect(data.lead).toBeDefined()
      expect(data.lead.business_name).toBe('Tacos & More')
      expect(data.lead.email).toBe('maria@tacosandmore.com')
      expect(mockSupabase.from).toHaveBeenCalledWith('restaurant_leads')
      expect(mockSupabase.insert).toHaveBeenCalled()
    })

    it('should return 400 for missing required fields', async () => {
      const incompleteData = {
        business_name: 'Tacos & More',
        // Missing contact_name, email, city
      }

      const request = new NextRequest('http://localhost:3000/api/admin/leads', {
        method: 'POST',
        body: JSON.stringify(incompleteData),
      })

      const response = await POST(request)
      const data = await response.json()

      expect(response.status).toBe(400)
      expect(data.error).toBe('Missing required fields')
    })

    it('should handle database errors gracefully', async () => {
      mockSupabase.single.mockResolvedValue({
        data: null,
        error: { message: 'Database connection failed' },
      })

      const leadData = {
        business_name: 'Tacos & More',
        contact_name: 'Maria Garcia',
        email: 'maria@tacosandmore.com',
        city: 'Katy',
      }

      const request = new NextRequest('http://localhost:3000/api/admin/leads', {
        method: 'POST',
        body: JSON.stringify(leadData),
      })

      const response = await POST(request)
      const data = await response.json()

      expect(response.status).toBe(500)
      expect(data.error).toBe('Failed to create restaurant lead')
    })
  })

  describe('GET /api/admin/leads - List Leads', () => {
    it('should list leads with filters', async () => {
      const { getRestaurantLeads } = await import('@/lib/supabase/admin')

      const mockLeads = [
        {
          id: 'lead-1',
          business_name: 'Tacos & More',
          contact_name: 'Maria Garcia',
          email: 'maria@tacosandmore.com',
          status: 'new',
          city: 'Katy',
        },
        {
          id: 'lead-2',
          business_name: 'Pizza Palace',
          contact_name: 'John Smith',
          email: 'john@pizzapalace.com',
          status: 'contacted',
          city: 'Katy',
        },
      ]

      vi.mocked(getRestaurantLeads).mockResolvedValue({
        data: mockLeads,
        error: null,
        count: 2,
      })

      const request = new NextRequest(
        'http://localhost:3000/api/admin/leads?status=new&limit=10'
      )

      const response = await GET(request)
      const data = await response.json()

      expect(response.status).toBe(200)
      expect(data.leads).toHaveLength(2)
      expect(data.total).toBe(2)
      expect(getRestaurantLeads).toHaveBeenCalledWith({
        status: 'new',
        assigned_to: undefined,
        limit: 10,
        offset: undefined,
      })
    })

    it('should handle empty results', async () => {
      const { getRestaurantLeads } = await import('@/lib/supabase/admin')

      vi.mocked(getRestaurantLeads).mockResolvedValue({
        data: [],
        error: null,
        count: 0,
      })

      const request = new NextRequest('http://localhost:3000/api/admin/leads')

      const response = await GET(request)
      const data = await response.json()

      expect(response.status).toBe(200)
      expect(data.leads).toHaveLength(0)
      expect(data.total).toBe(0)
    })
  })

  describe('GET /api/admin/leads/[id] - Get Lead Detail', () => {
    it('should get lead details with email history', async () => {
      const { getLeadDetails } = await import('@/lib/supabase/admin')

      const mockLead = {
        id: 'lead-123',
        business_name: 'Tacos & More',
        contact_name: 'Maria Garcia',
        email: 'maria@tacosandmore.com',
        status: 'contacted',
      }

      const mockEmails = [
        {
          id: 'email-1',
          subject: 'Partnership Opportunity',
          sent_at: new Date().toISOString(),
          opened_at: null,
        },
      ]

      vi.mocked(getLeadDetails).mockResolvedValue({
        lead: mockLead,
        emails: mockEmails,
        error: null,
      })

      const request = new NextRequest(
        'http://localhost:3000/api/admin/leads/lead-123'
      )

      const response = await GET_DETAIL(request, { params: { id: 'lead-123' } })
      const data = await response.json()

      expect(response.status).toBe(200)
      expect(data.lead.id).toBe('lead-123')
      expect(data.emails).toHaveLength(1)
    })

    it('should return 404 for non-existent lead', async () => {
      const { getLeadDetails } = await import('@/lib/supabase/admin')

      vi.mocked(getLeadDetails).mockResolvedValue({
        lead: null,
        emails: [],
        error: null,
      })

      const request = new NextRequest(
        'http://localhost:3000/api/admin/leads/invalid-id'
      )

      const response = await GET_DETAIL(request, {
        params: { id: 'invalid-id' },
      })
      const data = await response.json()

      expect(response.status).toBe(404)
      expect(data.error).toBe('Lead not found')
    })
  })

  describe('PATCH /api/admin/leads/[id] - Update Lead', () => {
    it('should update lead status', async () => {
      const updateData = {
        status: 'interested',
        notes: 'Very interested in Featured tier',
      }

      const mockUpdatedLead = {
        id: 'lead-123',
        business_name: 'Tacos & More',
        status: 'interested',
        notes: 'Very interested in Featured tier',
      }

      mockSupabase.single.mockResolvedValue({
        data: mockUpdatedLead,
        error: null,
      })

      const request = new NextRequest(
        'http://localhost:3000/api/admin/leads/lead-123',
        {
          method: 'PATCH',
          body: JSON.stringify(updateData),
        }
      )

      const response = await PATCH(request, { params: { id: 'lead-123' } })
      const data = await response.json()

      expect(response.status).toBe(200)
      expect(data.lead.status).toBe('interested')
      expect(data.lead.notes).toBe('Very interested in Featured tier')
      expect(mockSupabase.from).toHaveBeenCalledWith('restaurant_leads')
      expect(mockSupabase.update).toHaveBeenCalled()
      expect(mockSupabase.eq).toHaveBeenCalledWith('id', 'lead-123')
    })

    it('should return 404 for non-existent lead', async () => {
      mockSupabase.single.mockResolvedValue({
        data: null,
        error: null,
      })

      const request = new NextRequest(
        'http://localhost:3000/api/admin/leads/invalid-id',
        {
          method: 'PATCH',
          body: JSON.stringify({ status: 'contacted' }),
        }
      )

      const response = await PATCH(request, { params: { id: 'invalid-id' } })
      const data = await response.json()

      expect(response.status).toBe(404)
      expect(data.error).toBe('Lead not found')
    })
  })
})
