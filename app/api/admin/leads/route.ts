import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

const ADMIN_KEY = process.env.ADMIN_API_KEY || 'ekaty-admin-secret-2025'

export const dynamic = 'force-dynamic'

/**
 * GET /api/admin/leads
 * List monetization leads with optional filters
 * Migrated from Supabase to Prisma
 */
export async function GET(request: NextRequest) {
  try {
    // Verify admin key
    const adminKey = request.headers.get('x-admin-key')
    if (adminKey !== ADMIN_KEY) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { searchParams } = new URL(request.url)
    const status = searchParams.get('status')
    const source = searchParams.get('source')
    const assigned_to = searchParams.get('assigned_to')
    const limit = searchParams.get('limit') ? parseInt(searchParams.get('limit')!) : undefined
    const offset = searchParams.get('offset') ? parseInt(searchParams.get('offset')!) : undefined

    // Build where clause
    const where: any = {}
    if (status) where.status = status
    if (source) where.source = source
    if (assigned_to) where.assignedToId = assigned_to

    // Fetch leads
    const [leads, count] = await Promise.all([
      prisma.monetizationLead.findMany({
        where,
        include: {
          assignedTo: {
            select: {
              id: true,
              name: true,
              email: true,
              role: true
            }
          }
        },
        orderBy: {
          createdAt: 'desc'
        },
        take: limit,
        skip: offset
      }),
      prisma.monetizationLead.count({ where })
    ])

    return NextResponse.json({
      leads,
      total: count
    })
  } catch (error) {
    console.error('Failed to fetch monetization leads:', error)
    return NextResponse.json(
      { error: 'Failed to fetch leads' },
      { status: 500 }
    )
  }
}

/**
 * POST /api/admin/leads
 * Create a new monetization lead
 * Migrated from Supabase to Prisma
 */
export async function POST(request: NextRequest) {
  try {
    // Verify admin key
    const adminKey = request.headers.get('x-admin-key')
    if (adminKey !== ADMIN_KEY) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await request.json()
    const {
      business_name,
      contact_name,
      email,
      phone,
      tier = 'owner',
      source = 'manual',
      status = 'new',
      assigned_to,
      notes,
    } = body

    // Validation
    if (!business_name || !contact_name || !email) {
      return NextResponse.json(
        {
          error: 'Missing required fields',
          details: 'business_name, contact_name, and email are required',
        },
        { status: 400 }
      )
    }

    // Create slug from business name
    const slug = business_name.toLowerCase().replace(/[^a-z0-9]+/g, '-')

    const lead = await prisma.monetizationLead.create({
      data: {
        restaurantId: 'unknown',
        restaurantName: business_name,
        restaurantSlug: slug,
        contactEmail: email,
        contactName: contact_name,
        contactPhone: phone,
        tier,
        source,
        status,
        assignedToId: assigned_to || null,
        notes,
      },
      include: {
        assignedTo: {
          select: {
            id: true,
            name: true,
            email: true,
            role: true
          }
        }
      }
    })

    return NextResponse.json({ lead }, { status: 201 })
  } catch (error) {
    console.error('Failed to create monetization lead:', error)
    return NextResponse.json(
      { error: 'Failed to create lead' },
      { status: 500 }
    )
  }
}
