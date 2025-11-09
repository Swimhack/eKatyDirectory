import { NextResponse } from 'next/server'
import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

// Verify admin authentication
function verifyAdminAuth(request: Request): boolean {
  const authHeader = request.headers.get('authorization')
  const apiKey = process.env.ADMIN_API_KEY || 'your-secret-admin-key'
  return authHeader === `Bearer ${apiKey}`
}

// POST: Lock/unlock specific fields from Google updates
export async function POST(
  request: Request,
  { params }: { params: { id: string } }
) {
  if (!verifyAdminAuth(request)) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  try {
    const body = await request.json()
    const { field, locked } = body

    if (!field || typeof locked !== 'boolean') {
      return NextResponse.json(
        { error: 'Missing field or locked parameter' },
        { status: 400 }
      )
    }

    // Get current restaurant
    const restaurant = await prisma.restaurant.findUnique({
      where: { id: params.id }
    })

    if (!restaurant) {
      return NextResponse.json(
        { error: 'Restaurant not found' },
        { status: 404 }
      )
    }

    // Parse existing overrides
    const overrides = restaurant.adminOverrides
      ? JSON.parse(restaurant.adminOverrides)
      : {}

    // Update the override
    if (locked) {
      overrides[field] = true
    } else {
      delete overrides[field]
    }

    // Save back
    const updated = await prisma.restaurant.update({
      where: { id: params.id },
      data: {
        adminOverrides: JSON.stringify(overrides)
      }
    })

    return NextResponse.json({
      success: true,
      restaurant: updated,
      overrides
    })

  } catch (error) {
    console.error('Error updating field override:', error)
    return NextResponse.json(
      { error: 'Failed to update override' },
      { status: 500 }
    )
  } finally {
    await prisma.$disconnect()
  }
}

// GET: View current field locks
export async function GET(
  request: Request,
  { params }: { params: { id: string } }
) {
  if (!verifyAdminAuth(request)) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  try {
    const restaurant = await prisma.restaurant.findUnique({
      where: { id: params.id },
      select: { id: true, name: true, adminOverrides: true }
    })

    if (!restaurant) {
      return NextResponse.json(
        { error: 'Restaurant not found' },
        { status: 404 }
      )
    }

    const overrides = restaurant.adminOverrides
      ? JSON.parse(restaurant.adminOverrides)
      : {}

    return NextResponse.json({
      restaurant: {
        id: restaurant.id,
        name: restaurant.name
      },
      lockedFields: Object.keys(overrides).filter(key => overrides[key])
    })

  } catch (error) {
    console.error('Error fetching overrides:', error)
    return NextResponse.json(
      { error: 'Failed to fetch overrides' },
      { status: 500 }
    )
  } finally {
    await prisma.$disconnect()
  }
}
