import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export const dynamic = 'force-dynamic'

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { email, name, phone, source = 'website', referralCode } = body

    if (!email || !name) {
      return NextResponse.json(
        { error: 'Email and name are required' },
        { status: 400 }
      )
    }

    // Get IP address for duplicate prevention
    const ipAddress = request.headers.get('x-forwarded-for') ||
                     request.headers.get('x-real-ip') ||
                     'unknown'

    // Check if this email or IP has already entered
    const existingEntry = await prisma.launchGiveawayEntry.findFirst({
      where: {
        OR: [
          { email: email.toLowerCase() },
          { ipAddress }
        ]
      }
    })

    if (existingEntry) {
      return NextResponse.json(
        { error: 'You have already entered the giveaway', alreadyEntered: true },
        { status: 400 }
      )
    }

    // Create giveaway entry
    const entry = await prisma.launchGiveawayEntry.create({
      data: {
        email: email.toLowerCase(),
        name,
        phone: phone || null,
        source,
        referralCode: referralCode || null,
        ipAddress,
        metadata: JSON.stringify({
          userAgent: request.headers.get('user-agent'),
          timestamp: new Date().toISOString()
        })
      }
    })

    // Update daily metrics
    const today = new Date().toISOString().split('T')[0]
    await prisma.launchMetric.upsert({
      where: { date: today },
      create: {
        date: today,
        giveawayEntries: 1
      },
      update: {
        giveawayEntries: {
          increment: 1
        }
      }
    })

    return NextResponse.json({
      success: true,
      message: 'Successfully entered the giveaway!',
      entry: {
        id: entry.id,
        email: entry.email,
        name: entry.name
      }
    })
  } catch (error) {
    console.error('Giveaway entry error:', error)
    return NextResponse.json(
      { error: 'Failed to process giveaway entry' },
      { status: 500 }
    )
  }
}

export async function GET(request: NextRequest) {
  try {
    const url = new URL(request.url)
    const email = url.searchParams.get('email')

    if (!email) {
      return NextResponse.json(
        { error: 'Email parameter required' },
        { status: 400 }
      )
    }

    const entry = await prisma.launchGiveawayEntry.findFirst({
      where: { email: email.toLowerCase() }
    })

    return NextResponse.json({
      entered: !!entry,
      winner: entry?.winner || false
    })
  } catch (error) {
    console.error('Giveaway check error:', error)
    return NextResponse.json(
      { error: 'Failed to check giveaway status' },
      { status: 500 }
    )
  }
}
