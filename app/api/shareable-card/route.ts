import { NextRequest, NextResponse } from 'next/server'
import { generatePersonalityCard } from '@/lib/shareable-card'

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { title, description, traits, color } = body

    if (!title || !description || !traits || !color) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      )
    }

    const cardData = {
      title,
      description,
      traits: Array.isArray(traits) ? traits : [traits],
      color
    }

    const cardId = generatePersonalityCard(cardData)
    const baseUrl = process.env.NEXT_PUBLIC_APP_URL || 'https://ekaty.fly.dev'
    const shareUrl = `/share/personality/${cardId}`

    return NextResponse.json({
      success: true,
      cardId,
      shareUrl,
      fullUrl: `${baseUrl}${shareUrl}`
    })
  } catch (error) {
    console.error('Error generating shareable card:', error)
    return NextResponse.json(
      { error: 'Failed to generate shareable card' },
      { status: 500 }
    )
  }
}


