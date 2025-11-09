import { PrismaClient } from '@prisma/client'
import { GOOGLE_CONFIG } from './client'

const prisma = new PrismaClient()

/**
 * Check and increment API usage counter (database-backed)
 */
export async function checkAndIncrementUsage(): Promise<void> {
  const today = new Date().toISOString().split('T')[0] // YYYY-MM-DD

  try {
    // Get today's usage
    let usage = await prisma.apiUsage.findUnique({
      where: { date: today }
    })

    if (!usage) {
      // Create today's record
      usage = await prisma.apiUsage.create({
        data: {
          date: today,
          requestCount: 0
        }
      })
    }

    // Check if we've hit the limit
    if (usage.requestCount >= GOOGLE_CONFIG.dailyLimit) {
      throw new Error(
        `Daily Google API limit reached (${usage.requestCount}/${GOOGLE_CONFIG.dailyLimit}). Try again tomorrow.`
      )
    }

    // Increment the counter
    await prisma.apiUsage.update({
      where: { date: today },
      data: {
        requestCount: usage.requestCount + 1
      }
    })

  } catch (error) {
    // If it's our limit error, rethrow it
    if (error instanceof Error && error.message.includes('Daily Google API limit')) {
      throw error
    }
    // Log other errors but don't block (graceful degradation)
    console.error('Rate limiter error:', error)
  } finally {
    await prisma.$disconnect()
  }
}

/**
 * Get current usage stats
 */
export async function getUsageStats(): Promise<{
  today: number
  limit: number
  remaining: number
  percentUsed: number
}> {
  const today = new Date().toISOString().split('T')[0]

  try {
    const usage = await prisma.apiUsage.findUnique({
      where: { date: today }
    })

    const count = usage?.requestCount || 0
    const limit = GOOGLE_CONFIG.dailyLimit
    const remaining = Math.max(0, limit - count)
    const percentUsed = (count / limit) * 100

    return {
      today: count,
      limit,
      remaining,
      percentUsed
    }
  } finally {
    await prisma.$disconnect()
  }
}

/**
 * Clean up old usage records (keep last 30 days)
 */
export async function cleanupOldUsage(): Promise<number> {
  const thirtyDaysAgo = new Date()
  thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30)
  const cutoffDate = thirtyDaysAgo.toISOString().split('T')[0]

  try {
    const result = await prisma.apiUsage.deleteMany({
      where: {
        date: {
          lt: cutoffDate
        }
      }
    })

    return result.count
  } finally {
    await prisma.$disconnect()
  }
}
