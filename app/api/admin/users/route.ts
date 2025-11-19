import { NextRequest, NextResponse } from 'next/server'
import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

// GET - List all users
export async function GET(request: NextRequest) {
  try {
    // Verify admin authentication (support both header formats)
    const authHeader = request.headers.get('authorization')
    const xAdminKey = request.headers.get('x-admin-key')
    const adminKey = process.env.ADMIN_API_KEY || 'ekaty-admin-secret-2025'

    const isAuthorized = (authHeader === `Bearer ${adminKey}`) || (xAdminKey === adminKey)

    if (!isAuthorized) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { searchParams } = new URL(request.url)
    const limit = parseInt(searchParams.get('limit') || '100')
    const offset = parseInt(searchParams.get('offset') || '0')
    const roleFilter = searchParams.get('role') // e.g., "ADMIN,EDITOR"

    // Build where clause for role filtering
    const where: any = {}
    if (roleFilter) {
      const roles = roleFilter.split(',')
      where.OR = roles.map(role => ({ role: role.trim() }))
    }

    const [users, total] = await Promise.all([
      prisma.user.findMany({
        where,
        take: limit,
        skip: offset,
        orderBy: { name: 'asc' },
        select: {
          id: true,
          email: true,
          name: true,
          role: true,
          createdAt: true,
          _count: {
            select: {
              reviews: true,
              favorites: true
            }
          }
        }
      }),
      prisma.user.count({ where })
    ])

    return NextResponse.json({
      users,
      pagination: {
        total,
        limit,
        offset,
        hasMore: offset + limit < total
      }
    })

  } catch (error: any) {
    console.error('Failed to fetch users:', error)
    return NextResponse.json(
      { error: 'Failed to fetch users', message: error.message },
      { status: 500 }
    )
  }
}
