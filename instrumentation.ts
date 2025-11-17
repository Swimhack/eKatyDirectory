import { initializeCronJobs } from '@/lib/cron'

export function register() {
  if (process.env.NEXT_RUNTIME === 'nodejs') {
    initializeCronJobs()
  }
}
