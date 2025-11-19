import { describe, it, expect } from 'vitest'
import {
  replaceTemplateVariables,
  getTemplateVariables,
  validateTemplateVariables,
  getVariableDescription,
  STANDARD_TEMPLATE_VARIABLES,
} from '@/lib/utils/template-variables'

describe('Template Variables Utility', () => {
  describe('replaceTemplateVariables', () => {
    it('should replace all variables with provided values', () => {
      const template = 'Hello {{contact_name}}, welcome to {{restaurant_name}}!'
      const variables = {
        contact_name: 'John',
        restaurant_name: 'Pizza Palace',
      }

      const result = replaceTemplateVariables(template, variables)

      expect(result).toBe('Hello John, welcome to Pizza Palace!')
    })

    it('should handle multiple occurrences of same variable', () => {
      const template = '{{name}} loves {{name}}!'
      const variables = { name: 'Alice' }

      const result = replaceTemplateVariables(template, variables)

      expect(result).toBe('Alice loves Alice!')
    })

    it('should handle missing variables by removing placeholder', () => {
      const template = 'Hello {{contact_name}}, your {{missing_var}} is ready'
      const variables = { contact_name: 'John' }

      const result = replaceTemplateVariables(template, variables)

      expect(result).toBe('Hello John, your  is ready')
    })

    it('should escape HTML characters by default', () => {
      const template = 'Restaurant: {{restaurant_name}}'
      const variables = { restaurant_name: '<script>alert("xss")</script>' }

      const result = replaceTemplateVariables(template, variables)

      expect(result).toContain('&lt;script&gt;')
      expect(result).not.toContain('<script>')
    })

    it('should not escape HTML when escapeHtmlValues is false', () => {
      const template = 'Restaurant: {{restaurant_name}}'
      const variables = { restaurant_name: '<b>Bold Name</b>' }

      const result = replaceTemplateVariables(template, variables, false)

      expect(result).toBe('Restaurant: <b>Bold Name</b>')
    })

    it('should handle numeric values', () => {
      const template = 'Price: ${{tier_price}}/month'
      const variables = { tier_price: 99 }

      const result = replaceTemplateVariables(template, variables)

      expect(result).toBe('Price: $99/month')
    })

    it('should handle empty template', () => {
      const template = ''
      const variables = { name: 'Test' }

      const result = replaceTemplateVariables(template, variables)

      expect(result).toBe('')
    })

    it('should handle template with no variables', () => {
      const template = 'This is a plain text template'
      const variables = { name: 'Test' }

      const result = replaceTemplateVariables(template, variables)

      expect(result).toBe('This is a plain text template')
    })

    it('should handle all standard outreach variables', () => {
      const template =
        'Dear {{contact_name}},\n\n' +
        "We'd love to partner with {{restaurant_name}} in {{city}}.\n" +
        'Your {{cuisine}} restaurant would be perfect for our {{tier_name}} tier at ${{tier_price}}/month.'

      const variables = {
        contact_name: 'Maria Garcia',
        restaurant_name: 'Tacos & More',
        city: 'Katy',
        cuisine: 'Mexican',
        tier_name: 'Featured',
        tier_price: 199,
      }

      const result = replaceTemplateVariables(template, variables)

      expect(result).toContain('Maria Garcia')
      expect(result).toContain('Tacos & More')
      expect(result).toContain('Katy')
      expect(result).toContain('Mexican')
      expect(result).toContain('Featured')
      expect(result).toContain('199')
    })
  })

  describe('getTemplateVariables', () => {
    it('should extract all variables from template', () => {
      const template = 'Hello {{name}}, your {{item}} is ready in {{location}}'

      const variables = getTemplateVariables(template)

      expect(variables).toEqual(['name', 'item', 'location'])
    })

    it('should return empty array for template with no variables', () => {
      const template = 'This is a plain text template'

      const variables = getTemplateVariables(template)

      expect(variables).toEqual([])
    })

    it('should handle duplicate variables', () => {
      const template = '{{name}} loves {{name}}'

      const variables = getTemplateVariables(template)

      expect(variables).toEqual(['name', 'name'])
    })

    it('should handle nested curly braces', () => {
      const template = 'Value: {{data}}'

      const variables = getTemplateVariables(template)

      expect(variables).toEqual(['data'])
    })
  })

  describe('validateTemplateVariables', () => {
    it('should validate when all variables are provided', () => {
      const template = 'Hello {{name}}, you have {{count}} items'
      const variables = { name: 'John', count: 5 }

      const result = validateTemplateVariables(template, variables)

      expect(result.valid).toBe(true)
      expect(result.missingVariables).toEqual([])
    })

    it('should detect missing variables', () => {
      const template = 'Hello {{name}}, you have {{count}} items in {{location}}'
      const variables = { name: 'John' }

      const result = validateTemplateVariables(template, variables)

      expect(result.valid).toBe(false)
      expect(result.missingVariables).toEqual(['count', 'location'])
    })

    it('should detect undefined variable values', () => {
      const template = 'Hello {{name}}'
      const variables = { name: undefined }

      const result = validateTemplateVariables(template, variables)

      expect(result.valid).toBe(false)
      expect(result.missingVariables).toEqual(['name'])
    })

    it('should validate template with no variables', () => {
      const template = 'This is a plain text template'
      const variables = {}

      const result = validateTemplateVariables(template, variables)

      expect(result.valid).toBe(true)
      expect(result.missingVariables).toEqual([])
    })
  })

  describe('getVariableDescription', () => {
    it('should return description for standard variables', () => {
      expect(getVariableDescription('restaurant_name')).toBe(
        "Restaurant's business name"
      )
      expect(getVariableDescription('contact_name')).toBe('Contact person name')
      expect(getVariableDescription('tier_price')).toBe(
        'Monthly partnership price'
      )
    })

    it('should return variable name for unknown variables', () => {
      expect(getVariableDescription('unknown_var')).toBe('unknown_var')
    })
  })

  describe('STANDARD_TEMPLATE_VARIABLES', () => {
    it('should include all standard outreach variables', () => {
      expect(STANDARD_TEMPLATE_VARIABLES).toContain('restaurant_name')
      expect(STANDARD_TEMPLATE_VARIABLES).toContain('contact_name')
      expect(STANDARD_TEMPLATE_VARIABLES).toContain('cuisine')
      expect(STANDARD_TEMPLATE_VARIABLES).toContain('city')
      expect(STANDARD_TEMPLATE_VARIABLES).toContain('tier_name')
      expect(STANDARD_TEMPLATE_VARIABLES).toContain('tier_price')
    })
  })
})
