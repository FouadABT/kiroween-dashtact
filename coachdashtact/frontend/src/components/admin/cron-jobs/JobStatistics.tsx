'use client';

import { CronJob, JobStatistics as JobStatsType } from '@/types/cron-job';
import { CheckCircle2, XCircle, Clock, TrendingUp } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';

interface JobStatisticsProps {
  job: CronJob;
  statistics: JobStatsType;
}

export function JobStatistics({ job, statistics }: JobStatisticsProps) {
  const formatDuration = (ms?: number) => {
    if (!ms) return 'N/A';
    if (ms < 1000) return `${ms}ms`;
    if (ms < 60000) return `${(ms / 1000).toFixed(1)}s`;
    return `${(ms / 60000).toFixed(1)}m`;
  };

  const formatTime = (dateString?: string) => {
    if (!dateString) return 'Never';
    try {
      return formatDistanceToNow(new Date(dateString), { addSuffix: true });
    } catch {
      return 'Invalid date';
    }
  };

  const stats = [
    {
      label: 'Total Executions',
      value: statistics.totalExecutions.toString(),
      icon: Clock,
      color: 'text-blue-600',
    },
    {
      label: 'Success Rate',
      value: `${statistics.successRate.toFixed(1)}%`,
      icon: TrendingUp,
      color: statistics.successRate >= 90 ? 'text-green-600' : 'text-yellow-600',
    },
    {
      label: 'Successful',
      value: job.successCount.toString(),
      icon: CheckCircle2,
      color: 'text-green-600',
    },
    {
      label: 'Failed',
      value: job.failureCount.toString(),
      icon: XCircle,
      color: 'text-red-600',
    },
  ];

  return (
    <div>
      <h3 className="text-sm font-semibold mb-3">Statistics</h3>
      <div className="grid grid-cols-2 gap-3">
        {stats.map((stat) => {
          const Icon = stat.icon;
          return (
            <div
              key={stat.label}
              className="bg-muted/50 rounded-lg p-3 flex items-start gap-2"
            >
              <Icon className={`h-4 w-4 mt-0.5 ${stat.color}`} />
              <div>
                <div className="text-xs text-muted-foreground">{stat.label}</div>
                <div className="text-lg font-semibold">{stat.value}</div>
              </div>
            </div>
          );
        })}
      </div>

      <div className="mt-3 space-y-2 text-sm">
        <div className="flex justify-between">
          <span className="text-muted-foreground">Avg Duration:</span>
          <span className="font-medium">{formatDuration(statistics.averageDuration)}</span>
        </div>
        <div className="flex justify-between">
          <span className="text-muted-foreground">Last Success:</span>
          <span className="font-medium">{formatTime(statistics.lastSuccess)}</span>
        </div>
        <div className="flex justify-between">
          <span className="text-muted-foreground">Last Failure:</span>
          <span className="font-medium">{formatTime(statistics.lastFailure)}</span>
        </div>
        <div className="flex justify-between">
          <span className="text-muted-foreground">Uptime:</span>
          <span className="font-medium">{statistics.uptime.toFixed(1)}%</span>
        </div>
      </div>
    </div>
  );
}
