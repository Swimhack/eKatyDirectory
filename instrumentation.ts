export async function register() {
  // Only run cron jobs on the server and in production
  if (process.env.NEXT_RUNTIME === 'nodejs') {
    const { startDailySync } = await import('./lib/cron/restaurant-sync')
    
    // Start the daily sync cron job
    console.log('🚀 Initializing cron jobs...')
    startDailySync()
    console.log('✅ Cron jobs initialized')
  }
}
