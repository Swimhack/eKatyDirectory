import * as cron from 'node-cron'
import { PrismaClient } from '@prisma/client'
import { fetchPlaceDetails } from '@/lib/google-places/fetcher'
import { transformGooglePlaceToRestaurant } from '@/lib/google-places/transformer'

const prisma = new PrismaClient()
const ADMIN_API_KEY = process.env.ADMIN_API_KEY || 'your-secret-admin-key'
const APP_URL = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'

// Schedule hourly monitoring (every hour on the hour)
const CRON_SCHEDULE = '0 * * * *'

// Monitoring config
const MONITORING_CONFIG = {
  staleThresholdDays: 7,       // Update restaurants older than 7 days
  batchSize: 50,               // Process 50 restaurants per hour
  maxDailyRequests: 1200,      // Reserve budget (45000/day = ~1875/hour, using only 1200 for safety)
}

let monitoringTask: ReturnType<typeof cron.schedule> | null = null
let lastRunStats = {
  timestamp: new Date().toISOString(),
  checked: 0,
  updated: 0,
  failed: 0,
  status: 'idle'
}

/**
 * Start hourly monitoring cron job
 */
export function startHourlyMonitoring() {
  if (monitoringTask) {
    console.log('⏰ Hourly monitoring cron job is already running')
    return
  }

  console.log('⏰ Starting hourly restaurant monitoring')
  console.log(`📅 Schedule: ${CRON_SCHEDULE} (every hour)`)
  console.log(`📊 Batch size: ${MONITORING_CONFIG.batchSize} restaurants/hour`)

  monitoringTask = cron.schedule(CRON_SCHEDULE, async () => {
    await runHourlyMonitoring()
  })

  console.log('✅ Hourly monitoring started successfully')
}

/**
 * Stop hourly monitoring
 */
export function stopHourlyMonitoring() {
  if (monitoringTask) {
    monitoringTask.stop()
    monitoringTask = null
    console.log('⏹️ Hourly monitoring stopped')
  }
}

/**
 * Get last run statistics
 */
export function getMonitoringStatus() {
  return lastRunStats
}

/**
 * Run hourly monitoring (incremental update)
 */
export async function runHourlyMonitoring() {
  console.log('🔄 Running hourly restaurant monitoring...')

  const startTime = Date.now()
  lastRunStats.status = 'running'
  lastRunStats.timestamp = new Date().toISOString()

  try {
    // Step 1: Find stale restaurants (oldest first)
    const cutoffDate = new Date()
    cutoffDate.setDate(cutoffDate.getDate() - MONITORING_CONFIG.staleThresholdDays)

    const staleRestaurants = await prisma.restaurant.findMany({
      where: {
        source: 'google_places',
        active: true,
        OR: [
          { lastVerified: { lt: cutoffDate } },
          { lastVerified: null }
        ],
        sourceId: { not: null }
      },
      take: MONITORING_CONFIG.batchSize,
      orderBy: { lastVerified: 'asc' },
      select: {
        id: true,
        name: true,
        sourceId: true,
        lastVerified: true,
        adminOverrides: true
      }
    })

    console.log(`📍 Found ${staleRestaurants.length} restaurants needing verification`)

    if (staleRestaurants.length === 0) {
      console.log('✅ All restaurants are up to date!')
      lastRunStats.status = 'idle'
      lastRunStats.checked = 0
      lastRunStats.updated = 0
      lastRunStats.failed = 0
      return
    }

    // Step 2: Check API usage
    const today = new Date().toISOString().split('T')[0]
    const usage = await prisma.apiUsage.findUnique({
      where: { date: today }
    })

    const currentUsage = usage?.requestCount || 0
    const dailyLimit = parseInt(process.env.GOOGLE_PLACES_DAILY_LIMIT || '45000')
    const remaining = dailyLimit - currentUsage

    if (remaining < staleRestaurants.length) {
      console.log(`⚠️  Insufficient API quota (${remaining} remaining, need ${staleRestaurants.length})`)
      lastRunStats.status = 'quota_exceeded'

      // Log alert
      await prisma.auditLog.create({
        data: {
          action: 'MONITORING_QUOTA_WARNING',
          entity: 'System',
          entityId: 'monitoring',
          changes: JSON.stringify({
            currentUsage,
            remaining,
            needed: staleRestaurants.length
          }),
          userId: null
        }
      })

      return
    }

    console.log(`✅ API quota available: ${remaining} requests remaining`)

    // Step 3: Update restaurants incrementally
    let checked = 0
    let updated = 0
    let failed = 0

    for (const restaurant of staleRestaurants) {
      try {
        console.log(`Checking: ${restaurant.name}...`)

        // Fetch fresh data from Google Places
        const googleData = await fetchPlaceDetails(restaurant.sourceId!)

        if (!googleData) {
          console.log(`⚠️  No data returned for ${restaurant.name}`)
          failed++
          continue
        }

        // Check if permanently closed
        if (googleData.business_status === 'CLOSED_PERMANENTLY') {
          await prisma.restaurant.update({
            where: { id: restaurant.id },
            data: {
              active: false,
              lastVerified: new Date(),
              metadata: JSON.stringify({
                closedAt: new Date().toISOString(),
                reason: 'Permanently closed per Google Places'
              })
            }
          })
          console.log(`🚫 Marked as permanently closed: ${restaurant.name}`)
          updated++
          checked++
          continue
        }

        // Transform Google data
        const updatedData = transformGooglePlaceToRestaurant({
          place_id: restaurant.sourceId,
          details: googleData
        })

        // Parse admin overrides (locked fields)
        const overrides = restaurant.adminOverrides
          ? JSON.parse(restaurant.adminOverrides)
          : {}

        // Only update fields NOT locked by admin
        const safeUpdate = Object.keys(updatedData).reduce((acc, key) => {
          if (!overrides[key]) {
            acc[key] = updatedData[key]
          }
          return acc
        }, {} as any)

        // Update restaurant
        await prisma.restaurant.update({
          where: { id: restaurant.id },
          data: {
            ...safeUpdate,
            lastVerified: new Date(),
            updatedAt: new Date()
          }
        })

        console.log(`✅ Updated: ${restaurant.name}`)
        updated++
        checked++

        // Small delay between requests (100ms)
        await new Promise(resolve => setTimeout(resolve, 100))

      } catch (error) {
        console.error(`❌ Failed to update ${restaurant.name}:`, error)
        failed++
        checked++
      }
    }

    // Step 4: Log monitoring event
    await prisma.auditLog.create({
      data: {
        action: 'HOURLY_MONITORING',
        entity: 'Restaurant',
        entityId: 'system',
        changes: JSON.stringify({
          checked,
          updated,
          failed,
          duration: Date.now() - startTime,
          batchSize: MONITORING_CONFIG.batchSize,
          remainingQuota: remaining - checked
        }),
        userId: null
      }
    })

    // Update stats
    lastRunStats = {
      timestamp: new Date().toISOString(),
      checked,
      updated,
      failed,
      status: 'completed'
    }

    const duration = ((Date.now() - startTime) / 1000).toFixed(1)
    console.log(`✅ Hourly monitoring completed in ${duration}s`)
    console.log(`   Checked: ${checked}, Updated: ${updated}, Failed: ${failed}`)

    // Alert if failure rate is high
    if (failed > checked * 0.1) {
      console.log(`⚠️  High failure rate: ${failed}/${checked}`)

      await prisma.auditLog.create({
        data: {
          action: 'MONITORING_HIGH_FAILURE',
          entity: 'System',
          entityId: 'monitoring',
          changes: JSON.stringify({
            checked,
            updated,
            failed,
            failureRate: `${((failed/checked)*100).toFixed(1)}%`
          }),
          userId: null
        }
      })
    }

  } catch (error) {
    console.error('❌ Hourly monitoring failed:', error)

    lastRunStats.status = 'failed'

    // Log error
    await prisma.auditLog.create({
      data: {
        action: 'MONITORING_FAILED',
        entity: 'System',
        entityId: 'monitoring',
        changes: JSON.stringify({
          error: error instanceof Error ? error.message : 'Unknown error',
          timestamp: new Date().toISOString()
        }),
        userId: null
      }
    })

  } finally {
    await prisma.$disconnect()
  }
}

/**
 * Trigger manual monitoring run (for testing)
 */
export async function triggerManualMonitoring() {
  console.log('🔄 Triggering manual monitoring...')
  await runHourlyMonitoring()
}
