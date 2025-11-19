import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

const ADMIN_KEY = process.env.ADMIN_API_KEY || 'ekaty-admin-secret-2025'

export const dynamic = 'force-dynamic'

export async function PATCH(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    // Verify admin key
    const adminKey = request.headers.get('x-admin-key')
    if (adminKey !== ADMIN_KEY) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { id } = params
    const body = await request.json()
    const { status, notes } = body

    // Update the lead
    const updatedLead = await prisma.monetizationLead.update({
      where: { id },
      data: {
        status,
        notes,
        updatedAt: new Date()
      }
    })

    return NextResponse.json({
      success: true,
      lead: updatedLead
    })
  } catch (error) {
    console.error('Failed to update monetization lead:', error)
    return NextResponse.json(
      { error: 'Failed to update lead' },
      { status: 500 }
    )
  }
}
