import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

const ADMIN_KEY = process.env.ADMIN_API_KEY || 'ekaty-admin-secret-2025'

export async function GET(request: NextRequest) {
  try {
    // Verify admin key
    const adminKey = request.headers.get('x-admin-key')
    if (adminKey !== ADMIN_KEY) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { searchParams } = new URL(request.url)
    const status = searchParams.get('status')

    // Build where clause
    const where = status ? { status } : {}

    // Fetch monetization leads
    const leads = await prisma.monetizationLead.findMany({
      where,
      orderBy: {
        createdAt: 'desc'
      }
    })

    return NextResponse.json({ leads })
  } catch (error) {
    console.error('Failed to fetch monetization leads:', error)
    return NextResponse.json(
      { error: 'Failed to fetch leads' },
      { status: 500 }
    )
  }
}
