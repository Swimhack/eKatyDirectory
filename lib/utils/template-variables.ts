/**
 * Template variable replacement utility
 * Replaces template variables like {{restaurant_name}} with actual values
 */

export interface TemplateVariables {
  restaurant_name?: string
  contact_name?: string
  cuisine?: string
  city?: string
  tier_name?: string
  tier_price?: string | number
  [key: string]: string | number | undefined
}

/**
 * HTML escape function to prevent XSS attacks
 */
function escapeHtml(text: string): string {
  const map: { [key: string]: string } = {
    '&': '&amp;',
    '<': '&lt;',
    '>': '&gt;',
    '"': '&quot;',
    "'": '&#039;',
  }
  return text.replace(/[&<>"']/g, (m) => map[m])
}

/**
 * Replace template variables in a string
 * @param template - Template string containing variables like {{variable_name}}
 * @param variables - Object with variable values
 * @param escapeHtmlValues - Whether to HTML escape the values (default: true)
 * @returns String with variables replaced
 */
export function replaceTemplateVariables(
  template: string,
  variables: TemplateVariables,
  escapeHtmlValues = true
): string {
  let result = template

  // Replace each variable
  Object.keys(variables).forEach((key) => {
    const value = variables[key]
    const placeholder = `{{${key}}}`

    if (value !== undefined && value !== null) {
      const stringValue = String(value)
      const replacementValue = escapeHtmlValues
        ? escapeHtml(stringValue)
        : stringValue
      result = result.replace(new RegExp(placeholder, 'g'), replacementValue)
    }
  })

  // Remove any remaining unreplaced variables
  result = result.replace(/\{\{[^}]+\}\}/g, '')

  return result
}

/**
 * Get all template variables used in a template
 * @param template - Template string
 * @returns Array of variable names
 */
export function getTemplateVariables(template: string): string[] {
  const matches = template.match(/\{\{([^}]+)\}\}/g)
  if (!matches) return []

  return matches.map((match) => match.replace(/\{\{|\}\}/g, ''))
}

/**
 * Validate that all required variables are provided
 * @param template - Template string
 * @param variables - Object with variable values
 * @returns Object with validation result and missing variables
 */
export function validateTemplateVariables(
  template: string,
  variables: TemplateVariables
): { valid: boolean; missingVariables: string[] } {
  const templateVars = getTemplateVariables(template)
  const providedVars = Object.keys(variables)

  const missingVariables = templateVars.filter(
    (v) => !providedVars.includes(v) || variables[v] === undefined
  )

  return {
    valid: missingVariables.length === 0,
    missingVariables,
  }
}

/**
 * Standard template variables for outreach emails
 */
export const STANDARD_TEMPLATE_VARIABLES = [
  'restaurant_name',
  'contact_name',
  'cuisine',
  'city',
  'tier_name',
  'tier_price',
]

/**
 * Get a user-friendly description of a template variable
 */
export function getVariableDescription(variableName: string): string {
  const descriptions: { [key: string]: string } = {
    restaurant_name: "Restaurant's business name",
    contact_name: 'Contact person name',
    cuisine: 'Type of cuisine (e.g., Mexican, Italian)',
    city: 'City location',
    tier_name: 'Partnership tier name (e.g., Basic, Premium)',
    tier_price: 'Monthly partnership price',
  }

  return descriptions[variableName] || variableName
}
