import { describe, it, expect } from 'vitest'
import {
  generateCSV,
  formatDateForCSV,
  formatCurrencyForCSV,
  flattenObject,
} from '@/lib/utils/export'

describe('CSV Export Utility', () => {
  describe('generateCSV', () => {
    it('should generate CSV with headers only when data is empty', () => {
      const headers = ['name', 'email', 'age']
      const data: any[] = []

      const csv = generateCSV(data, headers)

      expect(csv).toBe('name,email,age\n')
    })

    it('should generate CSV with valid data', () => {
      const headers = ['name', 'email', 'age']
      const data = [
        { name: 'John Doe', email: 'john@example.com', age: 30 },
        { name: 'Jane Smith', email: 'jane@example.com', age: 25 },
      ]

      const csv = generateCSV(data, headers)

      expect(csv).toBe(
        'name,email,age\n' +
          'John Doe,john@example.com,30\n' +
          'Jane Smith,jane@example.com,25'
      )
    })

    it('should handle null and undefined values', () => {
      const headers = ['name', 'email', 'age']
      const data = [
        { name: 'John Doe', email: null, age: undefined },
      ]

      const csv = generateCSV(data, headers)

      expect(csv).toBe('name,email,age\nJohn Doe,,')
    })

    it('should escape values with commas', () => {
      const headers = ['name', 'address']
      const data = [
        { name: 'John Doe', address: '123 Main St, Apt 4' },
      ]

      const csv = generateCSV(data, headers)

      expect(csv).toBe('name,address\nJohn Doe,"123 Main St, Apt 4"')
    })

    it('should escape values with quotes', () => {
      const headers = ['name', 'note']
      const data = [
        { name: 'John "Johnny" Doe', note: 'Said "hello"' },
      ]

      const csv = generateCSV(data, headers)

      expect(csv).toBe('name,note\n"John ""Johnny"" Doe","Said ""hello"""')
    })

    it('should escape values with newlines', () => {
      const headers = ['name', 'description']
      const data = [
        { name: 'John Doe', description: 'Line 1\nLine 2' },
      ]

      const csv = generateCSV(data, headers)

      expect(csv).toBe('name,description\nJohn Doe,"Line 1\nLine 2"')
    })

    it('should handle special characters correctly', () => {
      const headers = ['name', 'notes']
      const data = [
        { name: 'José García', notes: 'Café "Résumé" €100' },
      ]

      const csv = generateCSV(data, headers)

      expect(csv).toContain('José García')
      expect(csv).toContain('"Café ""Résumé"" €100"')
    })

    it('should handle missing fields gracefully', () => {
      const headers = ['name', 'email', 'age']
      const data = [
        { name: 'John Doe', email: 'john@example.com' }, // age missing
        { name: 'Jane Smith', age: 25 }, // email missing
      ]

      const csv = generateCSV(data, headers)

      expect(csv).toBe(
        'name,email,age\n' +
          'John Doe,john@example.com,\n' +
          'Jane Smith,,25'
      )
    })
  })

  describe('formatDateForCSV', () => {
    it('should format valid date string', () => {
      const date = '2025-01-18T10:30:00Z'
      const formatted = formatDateForCSV(date)

      expect(formatted).toBe('2025-01-18')
    })

    it('should format Date object', () => {
      const date = new Date('2025-01-18T10:30:00Z')
      const formatted = formatDateForCSV(date)

      expect(formatted).toBe('2025-01-18')
    })

    it('should return empty string for null', () => {
      const formatted = formatDateForCSV(null)

      expect(formatted).toBe('')
    })

    it('should return empty string for invalid date', () => {
      const formatted = formatDateForCSV('invalid-date')

      expect(formatted).toBe('')
    })
  })

  describe('formatCurrencyForCSV', () => {
    it('should format currency with default USD', () => {
      const formatted = formatCurrencyForCSV(99.99)

      expect(formatted).toBe('USD 99.99')
    })

    it('should format currency with custom currency code', () => {
      const formatted = formatCurrencyForCSV(49.00, 'EUR')

      expect(formatted).toBe('EUR 49.00')
    })

    it('should return empty string for null', () => {
      const formatted = formatCurrencyForCSV(null)

      expect(formatted).toBe('')
    })

    it('should format zero correctly', () => {
      const formatted = formatCurrencyForCSV(0)

      expect(formatted).toBe('USD 0.00')
    })

    it('should handle decimal precision', () => {
      const formatted = formatCurrencyForCSV(99.999)

      expect(formatted).toBe('USD 100.00')
    })
  })

  describe('flattenObject', () => {
    it('should flatten nested object', () => {
      const obj = {
        name: 'John',
        address: {
          street: '123 Main St',
          city: 'Katy',
        },
      }

      const flattened = flattenObject(obj)

      expect(flattened).toEqual({
        name: 'John',
        'address.street': '123 Main St',
        'address.city': 'Katy',
      })
    })

    it('should handle arrays by joining', () => {
      const obj = {
        name: 'John',
        tags: ['admin', 'user', 'moderator'],
      }

      const flattened = flattenObject(obj)

      expect(flattened).toEqual({
        name: 'John',
        tags: 'admin; user; moderator',
      })
    })

    it('should handle deeply nested objects', () => {
      const obj = {
        user: {
          profile: {
            name: 'John',
            settings: {
              theme: 'dark',
            },
          },
        },
      }

      const flattened = flattenObject(obj)

      expect(flattened).toEqual({
        'user.profile.name': 'John',
        'user.profile.settings.theme': 'dark',
      })
    })

    it('should handle mixed nested structures', () => {
      const obj = {
        name: 'John',
        tags: ['admin', 'user'],
        metadata: {
          created: '2025-01-18',
          permissions: ['read', 'write'],
        },
      }

      const flattened = flattenObject(obj)

      expect(flattened).toEqual({
        name: 'John',
        tags: 'admin; user',
        'metadata.created': '2025-01-18',
        'metadata.permissions': 'read; write',
      })
    })
  })
})
