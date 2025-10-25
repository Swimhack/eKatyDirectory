import dotenv from 'dotenv'

// Load environment variables
dotenv.config({ path: '.env' })

const ADMIN_API_KEY = process.env.ADMIN_API_KEY || 'ekaty-admin-secret-2025'
const APP_URL = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'

async function syncRestaurants() {
  console.log('🔄 Starting restaurant sync...')
  console.log(`📍 API URL: ${APP_URL}/api/admin/sync`)
  
  try {
    const response = await fetch(`${APP_URL}/api/admin/sync`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${ADMIN_API_KEY}`,
        'Content-Type': 'application/json'
      }
    })

    if (!response.ok) {
      const error = await response.json()
      throw new Error(`Sync failed: ${error.error || response.statusText}`)
    }

    const result = await response.json()
    
    console.log('\n✅ Sync completed successfully!')
    console.log('📊 Results:')
    console.log(`   • Discovered: ${result.stats.discovered} restaurants`)
    console.log(`   • Created: ${result.stats.created} new`)
    console.log(`   • Updated: ${result.stats.updated} existing`)
    console.log(`   • Failed: ${result.stats.failed}`)
    console.log(`   • Duplicates removed: ${result.stats.duplicatesRemoved}`)
    console.log(`\n⏰ Timestamp: ${result.timestamp}`)
    
  } catch (error) {
    console.error('\n❌ Sync failed:', error instanceof Error ? error.message : error)
    process.exit(1)
  }
}

async function getSyncStatus() {
  console.log('📊 Fetching sync status...')
  
  try {
    const response = await fetch(`${APP_URL}/api/admin/sync`, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${ADMIN_API_KEY}`,
        'Content-Type': 'application/json'
      }
    })

    if (!response.ok) {
      throw new Error(`Failed to get status: ${response.statusText}`)
    }

    const result = await response.json()
    
    console.log('\n📊 Current Status:')
    console.log(`   • Total Restaurants: ${result.totalRestaurants}`)
    console.log(`   • Active Restaurants: ${result.activeRestaurants}`)
    console.log('\n📜 Recent Syncs:')
    
    result.recentSyncs.forEach((sync: any, index: number) => {
      console.log(`\n   ${index + 1}. ${sync.action}`)
      console.log(`      Time: ${new Date(sync.timestamp).toLocaleString()}`)
      console.log(`      Details:`, JSON.stringify(sync.details, null, 6))
    })
    
  } catch (error) {
    console.error('\n❌ Failed to get status:', error instanceof Error ? error.message : error)
    process.exit(1)
  }
}

// Parse command line arguments
const command = process.argv[2]

if (command === 'status') {
  getSyncStatus()
} else if (command === 'sync' || !command) {
  syncRestaurants()
} else {
  console.log(`
🍽️  Restaurant Sync CLI

Usage:
  npm run sync-restaurants        - Trigger a manual sync
  npm run sync-restaurants sync   - Trigger a manual sync
  npm run sync-restaurants status - Check sync status and history

Note: Make sure the dev server is running on ${APP_URL}
  `)
}
