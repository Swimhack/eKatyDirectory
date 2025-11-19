import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { getCurrentUser } from '@/lib/auth'

export async function POST(request: NextRequest) {
  try {
    const user = await getCurrentUser()
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Update all restaurants to remove featured status
    const result = await prisma.restaurant.updateMany({
      where: { featured: true },
      data: { featured: false }
    })

    // Log the action
    await prisma.auditLog.create({
      data: {
        entity: 'Restaurant',
        entityId: 'bulk',
        action: 'UPDATE',
        userId: user.id,
        changes: JSON.stringify({ 
          action: 'unfeature_all',
          count: result.count 
        }),
        metadata: JSON.stringify({ userEmail: user.email })
      }
    })

    return NextResponse.json({
      success: true,
      count: result.count,
      message: `Successfully removed featured status from ${result.count} restaurant(s)`
    })
  } catch (error) {
    console.error('Error unfeaturing restaurants:', error)
    return NextResponse.json(
      { error: 'Failed to unfeature restaurants' },
      { status: 500 }
    )
  }
}




