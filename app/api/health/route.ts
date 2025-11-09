import { NextResponse } from 'next/server'
import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

export async function GET() {
  try {
    const checks = {
      database: false,
      sync: false,
      timestamp: new Date().toISOString(),
      details: {} as any
    }

    // Check database connectivity
    try {
      const restaurantCount = await prisma.restaurant.count()
      const activeCount = await prisma.restaurant.count({ where: { active: true } })

      checks.database = true
      checks.details.database = {
        total: restaurantCount,
        active: activeCount,
        status: 'connected'
      }
    } catch (dbError) {
      checks.details.database = {
        status: 'failed',
        error: dbError instanceof Error ? dbError.message : 'Unknown error'
      }
    }

    // Check last sync status
    try {
      const lastSync = await prisma.auditLog.findFirst({
        where: {
          action: {
            in: ['RESTAURANT_SYNC', 'RESTAURANT_SYNC_FAILED']
          }
        },
        orderBy: {
          createdAt: 'desc'
        }
      })

      if (lastSync) {
        const syncAge = Date.now() - lastSync.createdAt.getTime()
        const hoursAgo = syncAge / (1000 * 60 * 60)
        const isStale = hoursAgo > 48 // Older than 2 days is stale

        checks.sync = lastSync.action === 'RESTAURANT_SYNC' && !isStale
        checks.details.sync = {
          lastSync: lastSync.createdAt,
          status: lastSync.action === 'RESTAURANT_SYNC' ? 'success' : 'failed',
          hoursAgo: Math.round(hoursAgo),
          isStale,
          stats: lastSync.changes ? JSON.parse(lastSync.changes) : null
        }
      } else {
        checks.details.sync = {
          status: 'no_sync_history'
        }
      }
    } catch (syncError) {
      checks.details.sync = {
        status: 'failed',
        error: syncError instanceof Error ? syncError.message : 'Unknown error'
      }
    }

    const healthy = checks.database && checks.sync

    return NextResponse.json({
      healthy,
      checks
    }, {
      status: healthy ? 200 : 503
    })

  } catch (error) {
    return NextResponse.json({
      healthy: false,
      error: error instanceof Error ? error.message : 'Unknown error',
      timestamp: new Date().toISOString()
    }, {
      status: 503
    })
  } finally {
    await prisma.$disconnect()
  }
}
