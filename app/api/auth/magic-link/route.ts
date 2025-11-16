import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { sendMagicLinkEmail } from '@/lib/email'
import crypto from 'crypto'

export async function POST(request: NextRequest) {
  try {
    const { email, name } = await request.json()

    if (!email) {
      return NextResponse.json({ error: 'Email is required' }, { status: 400 })
    }

    // Generate magic link token
    const token = crypto.randomBytes(32).toString('hex')
    const expiresAt = new Date(Date.now() + 15 * 60 * 1000) // 15 minutes

    // Check if user exists
    let user = await prisma.user.findUnique({
      where: { email }
    })

    if (!user) {
      // Create new user
      const passwordHash = crypto.randomBytes(32).toString('hex') // Random hash for magic link users
      user = await prisma.user.create({
        data: {
          email,
          name: name || email.split('@')[0],
          passwordHash,
          role: 'USER'
        }
      })
    }

    // Store magic link token (in production, use a separate tokens table)
    // For now, we'll use metadata field
    await prisma.user.update({
      where: { id: user.id },
      data: {
        metadata: JSON.stringify({
          magicLinkToken: token,
          magicLinkExpires: expiresAt.toISOString()
        })
      }
    })

    // Generate magic link URL
    const magicLinkUrl = `${process.env.NEXT_PUBLIC_APP_URL || 'https://ekaty.fly.dev'}/auth/verify?token=${token}&email=${encodeURIComponent(email)}`

    // Send email using centralized email function
    const emailResult = await sendMagicLinkEmail(email, name || email.split('@')[0], magicLinkUrl)

    if (!emailResult.success) {
      console.error('Failed to send magic link email:', emailResult.error)
      return NextResponse.json(
        { error: 'Failed to send magic link email' },
        { status: 500 }
      )
    }

    console.log('Magic link email sent:', emailResult)

    return NextResponse.json({
      success: true,
      message: 'Magic link sent! Check your email.'
    })
  } catch (error) {
    console.error('Magic link error:', error)
    return NextResponse.json(
      { error: 'Failed to send magic link' },
      { status: 500 }
    )
  }
}
