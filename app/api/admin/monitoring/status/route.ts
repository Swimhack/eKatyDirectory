import { NextRequest, NextResponse } from 'next/server'
import { PrismaClient } from '@prisma/client'
import { getMonitoringStatus } from '@/lib/cron/hourly-monitoring'

const prisma = new PrismaClient()

// Verify API key from request
function verifyAdminAuth(request: Request): boolean {
  const authHeader = request.headers.get('authorization')
  const apiKey = process.env.ADMIN_API_KEY || 'your-secret-admin-key'

  return authHeader === `Bearer ${apiKey}`
}

/**
 * GET /api/admin/monitoring/status
 * Returns monitoring system status and recent activity
 */
export async function GET(request: NextRequest) {
  // Verify admin authentication
  if (!verifyAdminAuth(request)) {
    return NextResponse.json(
      { error: 'Unauthorized' },
      { status: 401 }
    )
  }

  try {
    // Get current monitoring status
    const monitoringStatus = getMonitoringStatus()

    // Get recent monitoring logs (last 24 hours)
    const oneDayAgo = new Date()
    oneDayAgo.setDate(oneDayAgo.getDate() - 1)

    const recentActivity = await prisma.auditLog.findMany({
      where: {
        action: {
          in: ['HOURLY_MONITORING', 'MONITORING_FAILED', 'MONITORING_QUOTA_WARNING', 'MONITORING_HIGH_FAILURE']
        },
        createdAt: {
          gte: oneDayAgo
        }
      },
      orderBy: {
        createdAt: 'desc'
      },
      take: 24 // Last 24 runs
    })

    // Parse activity data
    const activitySummary = recentActivity.map(log => ({
      timestamp: log.createdAt,
      action: log.action,
      details: log.changes ? JSON.parse(log.changes) : null
    }))

    // Calculate statistics
    const successfulRuns = recentActivity.filter(log => log.action === 'HOURLY_MONITORING')
    const totalChecked = successfulRuns.reduce((sum, log) => {
      const data = log.changes ? JSON.parse(log.changes) : {}
      return sum + (data.checked || 0)
    }, 0)
    const totalUpdated = successfulRuns.reduce((sum, log) => {
      const data = log.changes ? JSON.parse(log.changes) : {}
      return sum + (data.updated || 0)
    }, 0)
    const totalFailed = successfulRuns.reduce((sum, log) => {
      const data = log.changes ? JSON.parse(log.changes) : {}
      return sum + (data.failed || 0)
    }, 0)

    // Get stale restaurant count
    const cutoffDate = new Date()
    cutoffDate.setDate(cutoffDate.getDate() - 7)

    const staleCount = await prisma.restaurant.count({
      where: {
        source: 'google_places',
        active: true,
        OR: [
          { lastVerified: { lt: cutoffDate } },
          { lastVerified: null }
        ]
      }
    })

    // Get API usage today
    const today = new Date().toISOString().split('T')[0]
    const usage = await prisma.apiUsage.findUnique({
      where: { date: today }
    })

    const dailyLimit = parseInt(process.env.GOOGLE_PLACES_DAILY_LIMIT || '45000')

    return NextResponse.json({
      monitoring: {
        status: monitoringStatus.status,
        lastRun: monitoringStatus.timestamp,
        lastRunStats: {
          checked: monitoringStatus.checked,
          updated: monitoringStatus.updated,
          failed: monitoringStatus.failed
        }
      },
      statistics: {
        last24Hours: {
          runs: successfulRuns.length,
          checked: totalChecked,
          updated: totalUpdated,
          failed: totalFailed,
          successRate: totalChecked > 0 ? ((totalChecked - totalFailed) / totalChecked * 100).toFixed(1) + '%' : 'N/A'
        },
        staleRestaurants: staleCount,
        apiUsage: {
          today: usage?.requestCount || 0,
          limit: dailyLimit,
          remaining: Math.max(0, dailyLimit - (usage?.requestCount || 0)),
          percentUsed: ((usage?.requestCount || 0) / dailyLimit * 100).toFixed(1) + '%'
        }
      },
      recentActivity: activitySummary,
      health: {
        isRunning: monitoringStatus.status !== 'failed',
        hasQuota: (usage?.requestCount || 0) < dailyLimit * 0.9, // Alert if >90% used
        needsAttention: staleCount > 100 || totalFailed > totalChecked * 0.1
      }
    })

  } catch (error) {
    console.error('Error fetching monitoring status:', error)
    return NextResponse.json(
      {
        error: 'Failed to fetch monitoring status',
        message: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    )
  } finally {
    await prisma.$disconnect()
  }
}

/**
 * POST /api/admin/monitoring/status
 * Trigger manual monitoring run
 */
export async function POST(request: NextRequest) {
  // Verify admin authentication
  if (!verifyAdminAuth(request)) {
    return NextResponse.json(
      { error: 'Unauthorized' },
      { status: 401 }
    )
  }

  try {
    // Trigger manual run (import dynamically to avoid circular deps)
    const { triggerManualMonitoring } = await import('@/lib/cron/hourly-monitoring')

    // Run in background (don't await)
    triggerManualMonitoring().catch(error => {
      console.error('Manual monitoring failed:', error)
    })

    return NextResponse.json({
      success: true,
      message: 'Manual monitoring triggered'
    })

  } catch (error) {
    console.error('Error triggering manual monitoring:', error)
    return NextResponse.json(
      {
        error: 'Failed to trigger monitoring',
        message: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    )
  } finally {
    await prisma.$disconnect()
  }
}
