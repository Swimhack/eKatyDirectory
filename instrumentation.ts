export async function register() {
  if (process.env.NEXT_RUNTIME === 'nodejs') {
    // Dynamically import cron only on server-side to avoid webpack bundling issues
    const { initializeCronJobs } = await import('@/lib/cron')
    initializeCronJobs()
  }
}
