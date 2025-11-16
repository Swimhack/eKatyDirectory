// Utility functions for shareable cards

export interface PersonalityCardData {
  title: string
  description: string
  traits: string[]
  color: string
}

export function generatePersonalityCard(data: PersonalityCardData): string {
  // Encode to base64 and make URL-safe
  const json = JSON.stringify(data)
  const base64 = Buffer.from(json).toString('base64')
  // Replace URL-unsafe characters
  return base64.replace(/\+/g, '-').replace(/\//g, '_').replace(/=/g, '')
}

export function decodePersonalityCard(cardId: string): PersonalityCardData | null {
  try {
    // Restore URL-safe base64 to standard base64
    let base64 = cardId.replace(/-/g, '+').replace(/_/g, '/')
    // Add padding if needed
    while (base64.length % 4 !== 0) {
      base64 += '='
    }
    
    const decoded = Buffer.from(base64, 'base64').toString('utf-8')
    return JSON.parse(decoded)
  } catch (error) {
    console.error('Error decoding card:', error)
    return null
  }
}

