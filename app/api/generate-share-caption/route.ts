import { NextRequest, NextResponse } from 'next/server'
import Anthropic from '@anthropic-ai/sdk'

const anthropic = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY,
})

export async function POST(request: NextRequest) {
  try {
    const { restaurantName, cuisine, vibe } = await request.json()

    const prompt = `Generate a fun, engaging social media caption for sharing a restaurant discovery.

Restaurant: ${restaurantName}
Cuisine: ${cuisine}
Vibe: ${vibe}

Requirements:
- Keep it under 150 characters
- Make it witty and shareable
- Include relevant emojis
- Sound authentic and excited
- Don't use hashtags
- Make people want to click the link

Just return the caption text, nothing else.`

    const message = await anthropic.messages.create({
      model: 'claude-3-5-sonnet-20241022',
      max_tokens: 200,
      messages: [{
        role: 'user',
        content: prompt
      }]
    })

    const caption = message.content[0].type === 'text'
      ? message.content[0].text.trim()
      : `Just discovered ${restaurantName} on eKaty! ${vibe} vibes all day 🍴✨`

    return NextResponse.json({ caption })
  } catch (error) {
    console.error('Caption generation error:', error)
    const { restaurantName, vibe } = await request.json()
    return NextResponse.json({
      caption: `Just discovered ${restaurantName} on eKaty! ${vibe} vibes all day 🍴✨`
    })
  }
}
