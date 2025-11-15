import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

// GET - List suggestions (with filters)
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const status = searchParams.get('status') || 'pending'
    const type = searchParams.get('type')
    const restaurantId = searchParams.get('restaurantId')
    const limit = parseInt(searchParams.get('limit') || '50')

    const where: any = {}
    
    if (status !== 'all') {
      where.status = status
    }
    
    if (type) {
      where.type = type
    }
    
    if (restaurantId) {
      where.restaurantId = restaurantId
    }

    const suggestions = await prisma.suggestion.findMany({
      where,
      orderBy: [
        { priority: 'desc' },
        { createdAt: 'desc' }
      ],
      take: limit,
    })

    const stats = await prisma.suggestion.groupBy({
      by: ['status'],
      _count: true,
    })

    return NextResponse.json({
      suggestions,
      stats: stats.reduce((acc, s) => ({ ...acc, [s.status]: s._count }), {}),
      total: suggestions.length
    })
  } catch (error) {
    console.error('Error fetching suggestions:', error)
    return NextResponse.json(
      { error: 'Failed to fetch suggestions' },
      { status: 500 }
    )
  }
}

// POST - Create new suggestion
export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const {
      type,
      restaurantId,
      restaurantName,
      field,
      currentValue,
      suggestedValue,
      reason,
      submittedBy,
      submitterName,
      metadata
    } = body

    // Validation
    if (!type || !suggestedValue) {
      return NextResponse.json(
        { error: 'Type and suggested value are required' },
        { status: 400 }
      )
    }

    // Get IP and user agent for spam prevention
    const ipAddress = request.headers.get('x-forwarded-for') || 
                     request.headers.get('x-real-ip') || 
                     'unknown'
    const userAgent = request.headers.get('user-agent') || 'unknown'

    // Check for duplicates (same suggestion within 24 hours)
    const oneDayAgo = new Date(Date.now() - 24 * 60 * 60 * 1000)
    const duplicate = await prisma.suggestion.findFirst({
      where: {
        type,
        restaurantId: restaurantId || null,
        field: field || null,
        suggestedValue,
        createdAt: { gte: oneDayAgo },
        status: { in: ['pending', 'approved'] }
      }
    })

    if (duplicate) {
      // Increment votes on existing suggestion
      await prisma.suggestion.update({
        where: { id: duplicate.id },
        data: { votes: { increment: 1 } }
      })

      return NextResponse.json({
        success: true,
        message: 'Your suggestion matches an existing one. We\'ve added your vote!',
        suggestionId: duplicate.id,
        duplicate: true
      })
    }

    // Calculate priority based on type
    let priority = 'normal'
    if (type === 'correction' && field === 'hours') priority = 'high'
    if (type === 'new_restaurant') priority = 'high'
    if (type === 'translation') priority = 'low'

    // Create suggestion
    const suggestion = await prisma.suggestion.create({
      data: {
        type,
        restaurantId,
        restaurantName,
        field,
        currentValue,
        suggestedValue,
        reason,
        submittedBy,
        submitterName,
        priority,
        metadata: metadata ? JSON.stringify(metadata) : null,
        ipAddress,
        userAgent,
        votes: 1
      }
    })

    return NextResponse.json({
      success: true,
      message: 'Thank you for your suggestion! We\'ll review it soon.',
      suggestionId: suggestion.id
    })
  } catch (error) {
    console.error('Error creating suggestion:', error)
    return NextResponse.json(
      { error: 'Failed to create suggestion' },
      { status: 500 }
    )
  }
}
