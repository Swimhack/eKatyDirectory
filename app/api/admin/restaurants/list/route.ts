import { NextResponse } from 'next/server'
import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

// Verify admin authentication
function verifyAdminAuth(request: Request): boolean {
  const authHeader = request.headers.get('authorization')
  const apiKey = process.env.ADMIN_API_KEY || 'your-secret-admin-key'
  return authHeader === `Bearer ${apiKey}`
}

export async function GET(request: Request) {
  if (!verifyAdminAuth(request)) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  try {
    const restaurants = await prisma.restaurant.findMany({
      select: {
        id: true,
        name: true,
        slug: true,
        phone: true,
        website: true,
        address: true,
        city: true,
        active: true,
        source: true,
        adminOverrides: true,
        lastVerified: true,
        updatedAt: true
      },
      orderBy: {
        name: 'asc'
      }
    })

    return NextResponse.json({
      restaurants,
      total: restaurants.length,
      active: restaurants.filter(r => r.active).length
    })

  } catch (error) {
    console.error('Error fetching restaurants:', error)
    return NextResponse.json(
      { error: 'Failed to fetch restaurants' },
      { status: 500 }
    )
  } finally {
    await prisma.$disconnect()
  }
}
