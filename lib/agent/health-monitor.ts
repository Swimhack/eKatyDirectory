import { PrismaClient } from '@prisma/client';
import { getApiUsageStats } from '../google-places/fetcher';
import { sendContactNotification } from '../email';

const prisma = new PrismaClient();

export interface HealthStatus {
  healthy: boolean;
  timestamp: string;
  checks: {
    database: DatabaseHealth;
    googleApi: ApiHealth;
    sync: SyncHealth;
  };
}

export interface DatabaseHealth {
  healthy: boolean;
  totalRestaurants: number;
  activeRestaurants: number;
  recentlyUpdated: number;
  percentageUpdated: number;
  lastCheck: string;
  error?: string;
}

export interface ApiHealth {
  healthy: boolean;
  dailyUsed: number;
  dailyLimit: number;
  remainingRequests: number;
  percentageUsed: number;
  resetTime: string;
}

export interface SyncHealth {
  healthy: boolean;
  lastSyncTime?: string;
  hoursSinceSync: number;
  lastSyncStats?: any;
  lastSyncSuccess: boolean;
}

/**
 * Check database health
 */
export async function checkDatabaseHealth(): Promise<DatabaseHealth> {
  try {
    const totalRestaurants = await prisma.restaurant.count();
    const activeRestaurants = await prisma.restaurant.count({
      where: { active: true }
    });
    
    // Check restaurants updated in last 48 hours
    const recentlyUpdated = await prisma.restaurant.count({
      where: {
        lastVerified: {
          gte: new Date(Date.now() - 48 * 60 * 60 * 1000)
        }
      }
    });
    
    const percentageUpdated = totalRestaurants > 0 
      ? (recentlyUpdated / totalRestaurants) * 100 
      : 0;
    
    // Database is healthy if:
    // - Has at least 200 restaurants
    // - At least 90% were updated in last 48 hours
    const healthy = totalRestaurants >= 200 && percentageUpdated >= 90;
    
    return {
      healthy,
      totalRestaurants,
      activeRestaurants,
      recentlyUpdated,
      percentageUpdated: Math.round(percentageUpdated * 100) / 100,
      lastCheck: new Date().toISOString(),
    };
  } catch (error) {
    return {
      healthy: false,
      totalRestaurants: 0,
      activeRestaurants: 0,
      recentlyUpdated: 0,
      percentageUpdated: 0,
      lastCheck: new Date().toISOString(),
      error: error instanceof Error ? error.message : 'Unknown error',
    };
  }
}

/**
 * Check Google API quota health
 */
export async function checkApiHealth(): Promise<ApiHealth> {
  const stats = await getApiUsageStats();

  // API is healthy if less than 90% of quota used
  const healthy = stats.percentUsed < 90;

  return {
    healthy,
    dailyUsed: stats.today,
    dailyLimit: stats.limit,
    remainingRequests: stats.remaining,
    percentageUsed: Math.round(stats.percentUsed * 100) / 100,
    resetTime: new Date().toISOString(), // Next day
  };
}

/**
 * Check sync health
 */
export async function checkSyncHealth(): Promise<SyncHealth> {
  try {
    // Get last sync attempt
    const lastSync = await prisma.auditLog.findFirst({
      where: {
        action: {
          in: ['RESTAURANT_SYNC', 'RESTAURANT_SYNC_FAILED']
        }
      },
      orderBy: { createdAt: 'desc' }
    });
    
    if (!lastSync) {
      return {
        healthy: false,
        hoursSinceSync: 999,
        lastSyncSuccess: false,
      };
    }
    
    const hoursSinceSync = (Date.now() - lastSync.createdAt.getTime()) / (1000 * 60 * 60);
    const lastSyncSuccess = lastSync.action === 'RESTAURANT_SYNC';
    
    // Sync is healthy if:
    // - Last sync was successful
    // - Last sync was less than 26 hours ago (allows for 2 hour buffer)
    const healthy = lastSyncSuccess && hoursSinceSync < 26;
    
    return {
      healthy,
      lastSyncTime: lastSync.createdAt.toISOString(),
      hoursSinceSync: Math.round(hoursSinceSync * 100) / 100,
      lastSyncStats: lastSync.changes ? JSON.parse(lastSync.changes) : null,
      lastSyncSuccess,
    };
  } catch (error) {
    return {
      healthy: false,
      hoursSinceSync: 999,
      lastSyncSuccess: false,
    };
  }
}

/**
 * Perform comprehensive health check
 */
export async function performHealthCheck(): Promise<HealthStatus> {
  const dbHealth = await checkDatabaseHealth();
  const apiHealth = await checkApiHealth();
  const syncHealth = await checkSyncHealth();

  const overallHealthy = dbHealth.healthy && apiHealth.healthy && syncHealth.healthy;
  
  return {
    healthy: overallHealthy,
    timestamp: new Date().toISOString(),
    checks: {
      database: dbHealth,
      googleApi: apiHealth,
      sync: syncHealth,
    },
  };
}

/**
 * Send alert for health issues
 */
export async function sendHealthAlert(
  type: string,
  message: string,
  data?: any
): Promise<void> {
  try {
    // Send email via existing email system
    await sendContactNotification({
      name: 'eKaty Health Monitor',
      email: 'agent@ekaty.com',
      subject: `🚨 ${type}`,
      message: `${message}\n\n${JSON.stringify(data, null, 2)}`,
      type: 'system_alert',
    });
    
    // Log to audit trail
    await prisma.auditLog.create({
      data: {
        action: `ALERT_${type.toUpperCase().replace(/\s/g, '_')}`,
        entity: 'System',
        entityId: 'health-monitor',
        metadata: JSON.stringify({
          message,
          data,
          timestamp: new Date().toISOString(),
        }),
      },
    });
    
    console.log(`🚨 Alert sent: ${type}`);
  } catch (error) {
    console.error('Failed to send health alert:', error);
  }
}

/**
 * Check health and send alerts if needed
 */
export async function monitorHealth(): Promise<HealthStatus> {
  const health = await performHealthCheck();
  
  // Check database health
  if (!health.checks.database.healthy) {
    await sendHealthAlert(
      'Database Health Critical',
      'Database health check failed',
      health.checks.database
    );
  }
  
  // Check API quota
  if (!health.checks.googleApi.healthy) {
    await sendHealthAlert(
      'API Quota Warning',
      'Google API quota is running low',
      health.checks.googleApi
    );
  }
  
  // Check sync status
  if (!health.checks.sync.healthy) {
    await sendHealthAlert(
      'Sync Health Critical',
      health.checks.sync.lastSyncSuccess 
        ? 'No sync in over 26 hours'
        : 'Last sync failed',
      health.checks.sync
    );
  }
  
  return health;
}

/**
 * Get detailed sync history
 */
export async function getSyncHistory(limit: number = 10): Promise<any[]> {
  const syncs = await prisma.auditLog.findMany({
    where: {
      action: {
        in: ['RESTAURANT_SYNC', 'RESTAURANT_SYNC_FAILED']
      }
    },
    orderBy: { createdAt: 'desc' },
    take: limit,
  });
  
  return syncs.map(sync => ({
    timestamp: sync.createdAt.toISOString(),
    action: sync.action,
    success: sync.action === 'RESTAURANT_SYNC',
    stats: sync.changes ? JSON.parse(sync.changes) : null,
  }));
}

/**
 * Close database connection
 */
export async function closeHealthMonitor(): Promise<void> {
  await prisma.$disconnect();
}
