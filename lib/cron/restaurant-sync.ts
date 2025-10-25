import * as cron from 'node-cron'

const ADMIN_API_KEY = process.env.ADMIN_API_KEY || 'your-secret-admin-key'
const APP_URL = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'

// Schedule daily sync at 3 AM CST (9 AM UTC)
// Runs every day at 3:00 AM
const CRON_SCHEDULE = '0 3 * * *'

let syncTask: ReturnType<typeof cron.schedule> | null = null

export function startDailySync() {
  if (syncTask) {
    console.log('⏰ Daily sync cron job is already running')
    return
  }

  console.log('⏰ Starting daily restaurant sync cron job')
  console.log(`📅 Schedule: ${CRON_SCHEDULE} (3 AM daily)`)

  syncTask = cron.schedule(CRON_SCHEDULE, async () => {
    console.log('🔄 Running scheduled restaurant sync...')
    
    try {
      const response = await fetch(`${APP_URL}/api/admin/sync`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${ADMIN_API_KEY}`,
          'Content-Type': 'application/json'
        }
      })

      if (!response.ok) {
        throw new Error(`Sync failed with status: ${response.status}`)
      }

      const result = await response.json()
      console.log('✅ Scheduled sync completed:', result)
      
    } catch (error) {
      console.error('❌ Scheduled sync failed:', error)
    }
  })

  console.log('✅ Daily sync cron job started successfully')
}

export function stopDailySync() {
  if (syncTask) {
    syncTask.stop()
    syncTask = null
    console.log('⏹️ Daily sync cron job stopped')
  }
}

// Manual sync trigger (for testing or one-off updates)
export async function triggerManualSync() {
  console.log('🔄 Triggering manual restaurant sync...')
  
  try {
    const response = await fetch(`${APP_URL}/api/admin/sync`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${ADMIN_API_KEY}`,
        'Content-Type': 'application/json'
      }
    })

    if (!response.ok) {
      throw new Error(`Sync failed with status: ${response.status}`)
    }

    const result = await response.json()
    console.log('✅ Manual sync completed:', result)
    return result
    
  } catch (error) {
    console.error('❌ Manual sync failed:', error)
    throw error
  }
}

// Get sync status
export async function getSyncStatus() {
  try {
    const response = await fetch(`${APP_URL}/api/admin/sync`, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${ADMIN_API_KEY}`,
        'Content-Type': 'application/json'
      }
    })

    if (!response.ok) {
      throw new Error(`Failed to get sync status: ${response.status}`)
    }

    return await response.json()
    
  } catch (error) {
    console.error('❌ Failed to get sync status:', error)
    throw error
  }
}
