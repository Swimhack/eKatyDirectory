import { NextRequest, NextResponse } from 'next/server'
import { requireAdmin } from '@/lib/auth/require-admin'
import { getActivePartnerships } from '@/lib/supabase/admin'
import { formatDateForCSV, formatCurrencyForCSV } from '@/lib/utils/export'

/**
 * GET /api/admin/revenue/export
 * Export revenue report as CSV
 */
export async function GET(request: NextRequest) {
  const authResponse = await requireAdmin(request)
  if (authResponse) return authResponse

  try {
    const { data, error } = await getActivePartnerships()

    if (error) {
      console.error('Error fetching partnerships for export:', error)
      return NextResponse.json(
        { error: 'Failed to fetch partnerships', details: error.message },
        { status: 500 }
      )
    }

    // Transform data for CSV export
    const csvData = (data || []).map((partnership: any) => ({
      'Restaurant Name': partnership.restaurant?.name || 'Unknown',
      Tier: partnership.tier?.name || 'Unknown',
      'Monthly Price': formatCurrencyForCSV(partnership.tier?.monthly_price || 0),
      Status: partnership.status,
      'Start Date': formatDateForCSV(partnership.start_date),
      'Renewal Date': formatDateForCSV(partnership.renewal_date),
      'Billing Cycle': partnership.billing_cycle,
      'Payment Status': partnership.payment_status,
      'Last Payment': formatDateForCSV(partnership.last_payment_date),
    }))

    // Generate CSV content
    const headers = [
      'Restaurant Name',
      'Tier',
      'Monthly Price',
      'Status',
      'Start Date',
      'Renewal Date',
      'Billing Cycle',
      'Payment Status',
      'Last Payment',
    ] as const

    type CSVRow = Record<string, any>

    const escapeCSVValue = (value: any): string => {
      if (value === null || value === undefined) {
        return ''
      }

      const stringValue = String(value)

      // If value contains comma, quote, or newline, wrap in quotes and escape quotes
      if (
        stringValue.includes(',') ||
        stringValue.includes('"') ||
        stringValue.includes('\n')
      ) {
        return `"${stringValue.replace(/"/g, '""')}"`
      }

      return stringValue
    }

    // Generate CSV rows
    const headerRow = headers.join(',')
    const dataRows = csvData.map((row: CSVRow) => {
      return headers.map((header) => escapeCSVValue(row[header])).join(',')
    })

    const csv = [headerRow, ...dataRows].join('\n')

    // Generate filename with current date
    const today = new Date().toISOString().split('T')[0]
    const filename = `revenue-report-${today}.csv`

    return new Response(csv, {
      status: 200,
      headers: {
        'Content-Type': 'text/csv',
        'Content-Disposition': `attachment; filename="${filename}"`,
        'Cache-Control': 'no-cache',
      },
    })
  } catch (error) {
    console.error('Unexpected error in GET /api/admin/revenue/export:', error)
    return NextResponse.json(
      {
        error: 'Internal server error',
        details: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    )
  }
}
