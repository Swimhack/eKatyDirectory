/**
 * Generate CSV from array of objects
 * @param data Array of data objects
 * @param headers Array of column headers (object keys)
 * @returns CSV string
 */
export function generateCSV(
  data: Array<Record<string, any>>,
  headers: string[]
): string {
  if (data.length === 0) {
    return headers.join(',') + '\n'
  }

  // Escape CSV values
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

  // Generate header row
  const headerRow = headers.map(escapeCSVValue).join(',')

  // Generate data rows
  const dataRows = data.map((row) => {
    return headers.map((header) => escapeCSVValue(row[header])).join(',')
  })

  return [headerRow, ...dataRows].join('\n')
}

/**
 * Generate CSV file response for download
 * @param data Array of data objects
 * @param headers Array of column headers
 * @param filename Filename for download
 * @returns Response object with CSV file
 */
export function generateCSVResponse(
  data: Array<Record<string, any>>,
  headers: string[],
  filename: string
): Response {
  const csv = generateCSV(data, headers)

  return new Response(csv, {
    status: 200,
    headers: {
      'Content-Type': 'text/csv',
      'Content-Disposition': `attachment; filename="${filename}"`,
      'Cache-Control': 'no-cache',
    },
  })
}

/**
 * Format date for CSV export
 * @param date Date string or Date object
 * @returns Formatted date string (YYYY-MM-DD)
 */
export function formatDateForCSV(date: string | Date | null): string {
  if (!date) return ''

  const dateObj = typeof date === 'string' ? new Date(date) : date

  if (isNaN(dateObj.getTime())) return ''

  return dateObj.toISOString().split('T')[0]
}

/**
 * Format currency for CSV export
 * @param amount Numeric amount
 * @param currency Currency code (default: USD)
 * @returns Formatted currency string
 */
export function formatCurrencyForCSV(
  amount: number | null,
  currency: string = 'USD'
): string {
  if (amount === null || amount === undefined) return ''

  return `${currency} ${amount.toFixed(2)}`
}

/**
 * Flatten nested object for CSV export
 * @param obj Nested object
 * @param prefix Prefix for nested keys
 * @returns Flattened object
 */
export function flattenObject(
  obj: Record<string, any>,
  prefix: string = ''
): Record<string, any> {
  const flattened: Record<string, any> = {}

  Object.keys(obj).forEach((key) => {
    const value = obj[key]
    const newKey = prefix ? `${prefix}.${key}` : key

    if (value && typeof value === 'object' && !Array.isArray(value)) {
      Object.assign(flattened, flattenObject(value, newKey))
    } else if (Array.isArray(value)) {
      flattened[newKey] = value.join('; ')
    } else {
      flattened[newKey] = value
    }
  })

  return flattened
}
