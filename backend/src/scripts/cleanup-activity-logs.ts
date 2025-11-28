#!/usr/bin/env ts-node

/**
 * Activity Log Cleanup Script
 * 
 * Removes old activity logs based on retention policy.
 * Run this as a cron job or scheduled task.
 * 
 * Usage:
 *   npm run cleanup:logs
 *   npm run cleanup:logs -- --dry-run
 *   npm run cleanup:logs -- --category=routine
 */

import { PrismaClient } from '@prisma/client';
import { activityLogConfig, getLogCategory } from '../config/activity-log.config';

const prisma = new PrismaClient();

interface CleanupStats {
  critical: number;
  important: number;
  routine: number;
  total: number;
}

async function cleanupActivityLogs(dryRun = false, category?: string): Promise<CleanupStats> {
  const stats: CleanupStats = {
    critical: 0,
    important: 0,
    routine: 0,
    total: 0,
  };

  const now = new Date();

  // Calculate cutoff dates
  const cutoffDates = {
    critical: new Date(now.getTime() - activityLogConfig.retention.critical * 24 * 60 * 60 * 1000),
    important: new Date(now.getTime() - activityLogConfig.retention.important * 24 * 60 * 60 * 1000),
    routine: new Date(now.getTime() - activityLogConfig.retention.routine * 24 * 60 * 60 * 1000),
  };

  console.log('🧹 Activity Log Cleanup');
  console.log('======================');
  console.log(`Mode: ${dryRun ? 'DRY RUN' : 'LIVE'}`);
  console.log(`Category filter: ${category || 'all'}`);
  console.log('');
  console.log('Retention Policy:');
  console.log(`  Critical: ${activityLogConfig.retention.critical} days (before ${cutoffDates.critical.toISOString()})`);
  console.log(`  Important: ${activityLogConfig.retention.important} days (before ${cutoffDates.important.toISOString()})`);
  console.log(`  Routine: ${activityLogConfig.retention.routine} days (before ${cutoffDates.routine.toISOString()})`);
  console.log('');

  // Get all logs to categorize
  const allLogs = await prisma.activityLog.findMany({
    select: {
      id: true,
      action: true,
      createdAt: true,
    },
    orderBy: {
      createdAt: 'asc',
    },
  });

  console.log(`📊 Total logs in database: ${allLogs.length}`);
  console.log('');

  // Categorize and identify logs to delete
  const logsToDelete: string[] = [];

  for (const log of allLogs) {
    const logCategory = getLogCategory(log.action);
    const cutoffDate = cutoffDates[logCategory];

    // Skip if category filter is set and doesn't match
    if (category && category !== logCategory) {
      continue;
    }

    if (log.createdAt < cutoffDate) {
      logsToDelete.push(log.id);
      stats[logCategory]++;
      stats.total++;
    }
  }

  console.log('📋 Logs to delete:');
  console.log(`  Critical: ${stats.critical}`);
  console.log(`  Important: ${stats.important}`);
  console.log(`  Routine: ${stats.routine}`);
  console.log(`  Total: ${stats.total}`);
  console.log('');

  if (stats.total === 0) {
    console.log('✅ No logs to delete');
    return stats;
  }

  if (dryRun) {
    console.log('🔍 DRY RUN - No logs were deleted');
    return stats;
  }

  // Delete logs in batches
  const batchSize = 1000;
  let deleted = 0;

  for (let i = 0; i < logsToDelete.length; i += batchSize) {
    const batch = logsToDelete.slice(i, i + batchSize);
    
    await prisma.activityLog.deleteMany({
      where: {
        id: {
          in: batch,
        },
      },
    });

    deleted += batch.length;
    console.log(`🗑️  Deleted ${deleted}/${logsToDelete.length} logs...`);
  }

  console.log('');
  console.log(`✅ Cleanup complete! Deleted ${stats.total} logs`);

  return stats;
}

// Parse command line arguments
const args = process.argv.slice(2);
const dryRun = args.includes('--dry-run');
const categoryArg = args.find(arg => arg.startsWith('--category='));
const category = categoryArg ? categoryArg.split('=')[1] as 'critical' | 'important' | 'routine' : undefined;

// Run cleanup
cleanupActivityLogs(dryRun, category)
  .then(() => {
    process.exit(0);
  })
  .catch((error) => {
    console.error('❌ Cleanup failed:', error);
    process.exit(1);
  })
  .finally(() => {
    prisma.$disconnect();
  });
