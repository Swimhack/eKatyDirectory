/**
 * Manual Cron Job Starter
 * Run this script to start cron jobs in development:
 * npx tsx scripts/start-cron-jobs.ts
 */

import { startAllCronJobs } from '@/lib/cron'

console.log('\n🔧 Development Cron Job Runner\n')

startAllCronJobs()

// Keep the process running
console.log('\n⏰ Cron jobs are running. Press Ctrl+C to stop.\n')

process.on('SIGINT', () => {
  console.log('\n\n👋 Shutting down cron jobs...')
  process.exit(0)
})

// Keep alive
setInterval(() => {}, 1000)
