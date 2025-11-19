'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'

interface Lead {
  id: string
  restaurantId: string
  restaurantName: string
  restaurantSlug: string
  contactEmail: string
  contactName: string | null
  contactPhone: string | null
  tier: string
  source: string
  status: 'new' | 'contacted' | 'interested' | 'converted' | 'lost'
  notes: string | null
  createdAt: string
  updatedAt: string
}

export default function MonetizationLeadsPage() {
  const [leads, setLeads] = useState<Lead[]>([])
  const [filter, setFilter] = useState<'all' | 'new' | 'contacted' | 'interested' | 'converted' | 'lost'>('all')
  const [loading, setLoading] = useState(true)
  const [selectedLead, setSelectedLead] = useState<Lead | null>(null)
  const [notes, setNotes] = useState('')

  useEffect(() => {
    fetchLeads()
  }, [filter])

  const fetchLeads = async () => {
    setLoading(true)
    try {
      const url = filter === 'all'
        ? '/api/admin/monetization/leads'
        : `/api/admin/monetization/leads?status=${filter}`

      const response = await fetch(url, {
        headers: {
          'x-admin-key': process.env.NEXT_PUBLIC_ADMIN_API_KEY || 'ekaty-admin-secret-2025'
        }
      })

      if (!response.ok) {
        throw new Error('Failed to fetch leads')
      }

      const data = await response.json()
      setLeads(data.leads || [])
    } catch (error) {
      console.error('Failed to fetch leads:', error)
      setLeads([])
    } finally {
      setLoading(false)
    }
  }

  const updateLeadStatus = async (leadId: string, newStatus: Lead['status']) => {
    try {
      const response = await fetch(`/api/admin/monetization/leads/${leadId}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          'x-admin-key': process.env.NEXT_PUBLIC_ADMIN_API_KEY || 'ekaty-admin-secret-2025'
        },
        body: JSON.stringify({
          status: newStatus,
          notes
        })
      })

      if (response.ok) {
        alert('Lead updated successfully!')
        setSelectedLead(null)
        setNotes('')
        fetchLeads()
      }
    } catch (error) {
      console.error('Failed to update lead:', error)
      alert('Failed to update lead')
    }
  }

  const getStatusColor = (status: Lead['status']) => {
    const colors = {
      new: 'bg-blue-100 text-blue-800',
      contacted: 'bg-yellow-100 text-yellow-800',
      interested: 'bg-purple-100 text-purple-800',
      converted: 'bg-green-100 text-green-800',
      lost: 'bg-gray-100 text-gray-800'
    }
    return colors[status]
  }

  const getTierBadge = (tier: string) => {
    const colors = {
      owner: 'bg-blue-500 text-white',
      featured: 'bg-purple-500 text-white',
      premium: 'bg-amber-500 text-white'
    }
    return colors[tier as keyof typeof colors] || 'bg-gray-500 text-white'
  }

  const stats = {
    total: leads.length,
    new: leads.filter(l => l.status === 'new').length,
    contacted: leads.filter(l => l.status === 'contacted').length,
    interested: leads.filter(l => l.status === 'interested').length,
    converted: leads.filter(l => l.status === 'converted').length,
    conversionRate: leads.length > 0 ? ((leads.filter(l => l.status === 'converted').length / leads.length) * 100).toFixed(1) : '0'
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Monetization Leads</h1>
              <p className="text-gray-600 mt-1">Track and manage restaurant claim interest</p>
            </div>
            <Link
              href="/admin/dashboard"
              className="text-primary-600 hover:text-primary-700 font-medium"
            >
              ← Back to Dashboard
            </Link>
          </div>
        </div>
      </div>

      {/* Stats */}
      <div className="bg-white border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="grid grid-cols-2 md:grid-cols-6 gap-4">
            <div className="bg-gray-50 rounded-lg p-4">
              <div className="text-2xl font-bold text-gray-900">{stats.total}</div>
              <div className="text-sm text-gray-600">Total Leads</div>
            </div>
            <div className="bg-blue-50 rounded-lg p-4">
              <div className="text-2xl font-bold text-blue-600">{stats.new}</div>
              <div className="text-sm text-blue-700">New</div>
            </div>
            <div className="bg-yellow-50 rounded-lg p-4">
              <div className="text-2xl font-bold text-yellow-600">{stats.contacted}</div>
              <div className="text-sm text-yellow-700">Contacted</div>
            </div>
            <div className="bg-purple-50 rounded-lg p-4">
              <div className="text-2xl font-bold text-purple-600">{stats.interested}</div>
              <div className="text-sm text-purple-700">Interested</div>
            </div>
            <div className="bg-green-50 rounded-lg p-4">
              <div className="text-2xl font-bold text-green-600">{stats.converted}</div>
              <div className="text-sm text-green-700">Converted</div>
            </div>
            <div className="bg-primary-50 rounded-lg p-4">
              <div className="text-2xl font-bold text-primary-600">{stats.conversionRate}%</div>
              <div className="text-sm text-primary-700">Conv. Rate</div>
            </div>
          </div>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-white border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex gap-4 py-4 overflow-x-auto">
            {(['all', 'new', 'contacted', 'interested', 'converted', 'lost'] as const).map((status) => (
              <button
                key={status}
                onClick={() => setFilter(status)}
                className={`px-4 py-2 rounded-lg font-medium transition-colors whitespace-nowrap ${
                  filter === status
                    ? 'bg-primary-600 text-white'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                {status.charAt(0).toUpperCase() + status.slice(1)}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Leads List */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {loading ? (
          <div className="text-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600 mx-auto"></div>
          </div>
        ) : leads.length === 0 ? (
          <div className="text-center py-12">
            <p className="text-gray-600">No {filter !== 'all' ? filter : ''} leads found</p>
            <p className="text-sm text-gray-500 mt-2">
              Leads are generated when users click &quot;Claim This Restaurant&quot; buttons
            </p>
          </div>
        ) : (
          <div className="space-y-4">
            {leads.map((lead) => (
              <div key={lead.id} className="bg-white rounded-lg shadow p-6">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-3">
                      <h3 className="text-xl font-bold text-gray-900">
                        {lead.restaurantName}
                      </h3>
                      <span className={`px-3 py-1 rounded-full text-sm font-medium ${getStatusColor(lead.status)}`}>
                        {lead.status}
                      </span>
                      <span className={`px-3 py-1 rounded-full text-xs font-bold ${getTierBadge(lead.tier)}`}>
                        {lead.tier.toUpperCase()}
                      </span>
                    </div>

                    <div className="grid md:grid-cols-2 gap-4 mb-4">
                      <div>
                        <p className="text-sm text-gray-600 mb-1">Contact Information:</p>
                        <p className="font-medium">{lead.contactName || 'Unknown'}</p>
                        <p className="text-sm text-gray-700">{lead.contactEmail}</p>
                        {lead.contactPhone && (
                          <p className="text-sm text-gray-700">{lead.contactPhone}</p>
                        )}
                      </div>
                      <div>
                        <p className="text-sm text-gray-600 mb-1">Lead Details:</p>
                        <p className="text-sm">Source: <span className="font-medium">{lead.source}</span></p>
                        <p className="text-sm">Created: {new Date(lead.createdAt).toLocaleDateString()}</p>
                        <p className="text-sm">Updated: {new Date(lead.updatedAt).toLocaleDateString()}</p>
                      </div>
                    </div>

                    {lead.notes && (
                      <div className="mb-4">
                        <p className="text-sm text-gray-600 mb-1">Notes:</p>
                        <p className="text-sm bg-gray-50 p-3 rounded">{lead.notes}</p>
                      </div>
                    )}

                    <div className="flex gap-2">
                      <Link
                        href={`/restaurants/${lead.restaurantSlug}`}
                        target="_blank"
                        className="text-sm text-primary-600 hover:underline"
                      >
                        View Restaurant →
                      </Link>
                      <a
                        href={`mailto:${lead.contactEmail}`}
                        className="text-sm text-primary-600 hover:underline"
                      >
                        Send Email →
                      </a>
                    </div>
                  </div>

                  <div className="ml-4">
                    <button
                      onClick={() => {
                        setSelectedLead(lead)
                        setNotes(lead.notes || '')
                      }}
                      className="px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700"
                    >
                      Update Status
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Update Modal */}
      {selectedLead && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg max-w-2xl w-full p-6">
            <h2 className="text-2xl font-bold text-gray-900 mb-4">
              Update Lead: {selectedLead.restaurantName}
            </h2>

            <div className="mb-6">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Status
              </label>
              <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
                {(['new', 'contacted', 'interested', 'converted', 'lost'] as const).map((status) => (
                  <button
                    key={status}
                    onClick={() => updateLeadStatus(selectedLead.id, status)}
                    className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                      selectedLead.status === status
                        ? 'bg-primary-600 text-white'
                        : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                    }`}
                  >
                    {status.charAt(0).toUpperCase() + status.slice(1)}
                  </button>
                ))}
              </div>
            </div>

            <div className="mb-6">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Notes
              </label>
              <textarea
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                rows={4}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500"
                placeholder="Add notes about this lead..."
              />
            </div>

            <div className="flex gap-3">
              <button
                onClick={() => {
                  setSelectedLead(null)
                  setNotes('')
                }}
                className="flex-1 px-6 py-3 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 font-semibold"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
