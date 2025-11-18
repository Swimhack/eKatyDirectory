import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs'
import { cookies } from 'next/headers'

/**
 * Rate limiting configuration
 */
export const RATE_LIMITS = {
  EMAIL_HOURLY: 50, // 50 emails per hour
  EMAIL_DAILY: 200, // 200 emails per day
}

/**
 * Check rate limit using sliding window algorithm
 * @param userId Admin user ID (or campaign ID for campaign-specific limits)
 * @param limit Maximum number of operations
 * @param windowSeconds Time window in seconds
 * @returns Rate limit status
 */
export async function checkRateLimit(
  userId: string,
  limit: number,
  windowSeconds: number
): Promise<{
  allowed: boolean
  remaining: number
  resetAt: Date
  current: number
}> {
  const supabase = createRouteHandlerClient({ cookies })
  const now = new Date()
  const windowStart = new Date(now.getTime() - windowSeconds * 1000)

  // Count emails sent within the time window
  const { count, error } = await supabase
    .from('outreach_emails')
    .select('id', { count: 'exact', head: true })
    .gte('sent_at', windowStart.toISOString())
    .in(
      'campaign_id',
      supabase
        .from('outreach_campaigns')
        .select('id')
        .eq('created_by', userId)
    )

  if (error) {
    console.error('Rate limit check error:', error)
    // Fail open - allow the request but log the error
    return {
      allowed: true,
      remaining: limit,
      resetAt: new Date(now.getTime() + windowSeconds * 1000),
      current: 0,
    }
  }

  const currentCount = count || 0
  const remaining = Math.max(0, limit - currentCount)
  const allowed = currentCount < limit

  return {
    allowed,
    remaining,
    resetAt: new Date(now.getTime() + windowSeconds * 1000),
    current: currentCount,
  }
}

/**
 * Check email sending rate limits (both hourly and daily)
 * @param userId Admin user ID
 * @returns Combined rate limit status
 */
export async function checkEmailRateLimit(userId: string): Promise<{
  allowed: boolean
  hourly: {
    allowed: boolean
    remaining: number
    resetAt: Date
    current: number
  }
  daily: {
    allowed: boolean
    remaining: number
    resetAt: Date
    current: number
  }
  message?: string
}> {
  // Check hourly limit (50 emails per hour)
  const hourly = await checkRateLimit(userId, RATE_LIMITS.EMAIL_HOURLY, 3600)

  // Check daily limit (200 emails per day)
  const daily = await checkRateLimit(userId, RATE_LIMITS.EMAIL_DAILY, 86400)

  const allowed = hourly.allowed && daily.allowed

  let message: string | undefined
  if (!allowed) {
    if (!hourly.allowed) {
      message = `Hourly rate limit exceeded. ${hourly.current}/${RATE_LIMITS.EMAIL_HOURLY} emails sent in the last hour. Please wait until ${hourly.resetAt.toLocaleTimeString()}.`
    } else if (!daily.allowed) {
      message = `Daily rate limit exceeded. ${daily.current}/${RATE_LIMITS.EMAIL_DAILY} emails sent in the last 24 hours. Please wait until ${daily.resetAt.toLocaleTimeString()}.`
    }
  }

  return {
    allowed,
    hourly,
    daily,
    message,
  }
}

/**
 * Calculate estimated send time considering rate limits
 * @param userId Admin user ID
 * @param emailCount Number of emails to send
 * @returns Estimated completion time
 */
export async function estimateSendTime(
  userId: string,
  emailCount: number
): Promise<{
  estimatedCompletionAt: Date
  canSendNow: number
  mustWaitUntil: Date | null
}> {
  const rateLimitStatus = await checkEmailRateLimit(userId)

  if (rateLimitStatus.allowed) {
    // Can send all emails now (respecting hourly limit)
    const canSendNow = Math.min(
      emailCount,
      rateLimitStatus.hourly.remaining
    )
    const estimatedSeconds = emailCount * 2 // ~2 seconds per email
    const estimatedCompletionAt = new Date(Date.now() + estimatedSeconds * 1000)

    return {
      estimatedCompletionAt,
      canSendNow,
      mustWaitUntil: null,
    }
  }

  // Rate limit exceeded - must wait
  const mustWaitUntil = rateLimitStatus.hourly.allowed
    ? rateLimitStatus.daily.resetAt
    : rateLimitStatus.hourly.resetAt

  return {
    estimatedCompletionAt: mustWaitUntil,
    canSendNow: 0,
    mustWaitUntil,
  }
}
