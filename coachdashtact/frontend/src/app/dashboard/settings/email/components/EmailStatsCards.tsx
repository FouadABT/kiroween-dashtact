'use client';

/**
 * EmailStatsCards Component
 * 
 * Displays email statistics with:
 * - Total sent, failed, queued counts
 * - Sent today/week/month
 * - Failure rate percentage
 * - Loading skeletons
 */

import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import {
  Mail,
  CheckCircle2,
  XCircle,
  Clock,
  TrendingUp,
  Calendar,
  AlertTriangle,
} from 'lucide-react';
import { emailLogsApi } from '@/lib/api/email';
import type { EmailStats } from '@/types/email';
import { toast } from '@/hooks/use-toast';

export function EmailStatsCards() {
  const [stats, setStats] = useState<EmailStats | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    loadStats();
  }, []);

  const loadStats = async () => {
    try {
      setIsLoading(true);
      const data = await emailLogsApi.getStats();
      setStats(data);
    } catch (error) {
      console.error('Failed to load stats:', error);
      toast.error('Failed to load email statistics');
    } finally {
      setIsLoading(false);
    }
  };

  if (isLoading) {
    return (
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {[...Array(8)].map((_, i) => (
          <Card key={i}>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <Skeleton className="h-4 w-24" />
              <Skeleton className="h-4 w-4 rounded-full" />
            </CardHeader>
            <CardContent>
              <Skeleton className="h-8 w-16" />
              <Skeleton className="mt-2 h-3 w-32" />
            </CardContent>
          </Card>
        ))}
      </div>
    );
  }

  if (!stats) {
    return null;
  }

  const statCards = [
    {
      title: 'Total Sent',
      value: stats.totalSent.toLocaleString(),
      description: 'All time',
      icon: Mail,
      color: 'text-blue-600',
      bgColor: 'bg-blue-100 dark:bg-blue-900/20',
    },
    {
      title: 'Total Failed',
      value: stats.totalFailed.toLocaleString(),
      description: 'All time',
      icon: XCircle,
      color: 'text-red-600',
      bgColor: 'bg-red-100 dark:bg-red-900/20',
    },
    {
      title: 'Queued',
      value: stats.queuedCount.toLocaleString(),
      description: 'Pending delivery',
      icon: Clock,
      color: 'text-yellow-600',
      bgColor: 'bg-yellow-100 dark:bg-yellow-900/20',
    },
    {
      title: 'Failure Rate',
      value: `${stats.failureRate.toFixed(1)}%`,
      description: 'Overall',
      icon: AlertTriangle,
      color: stats.failureRate > 5 ? 'text-red-600' : 'text-green-600',
      bgColor:
        stats.failureRate > 5
          ? 'bg-red-100 dark:bg-red-900/20'
          : 'bg-green-100 dark:bg-green-900/20',
    },
    {
      title: 'Sent Today',
      value: stats.sentToday.toLocaleString(),
      description: 'Last 24 hours',
      icon: CheckCircle2,
      color: 'text-green-600',
      bgColor: 'bg-green-100 dark:bg-green-900/20',
    },
    {
      title: 'Sent This Week',
      value: stats.sentThisWeek.toLocaleString(),
      description: 'Last 7 days',
      icon: TrendingUp,
      color: 'text-purple-600',
      bgColor: 'bg-purple-100 dark:bg-purple-900/20',
    },
    {
      title: 'Sent This Month',
      value: stats.sentThisMonth.toLocaleString(),
      description: 'Last 30 days',
      icon: Calendar,
      color: 'text-indigo-600',
      bgColor: 'bg-indigo-100 dark:bg-indigo-900/20',
    },
    {
      title: 'Success Rate',
      value: `${(100 - stats.failureRate).toFixed(1)}%`,
      description: 'Overall',
      icon: CheckCircle2,
      color: 'text-green-600',
      bgColor: 'bg-green-100 dark:bg-green-900/20',
    },
  ];

  return (
    <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
      {statCards.map((stat) => {
        const Icon = stat.icon;
        return (
          <Card key={stat.title}>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">{stat.title}</CardTitle>
              <div className={`rounded-full p-2 ${stat.bgColor}`}>
                <Icon className={`h-4 w-4 ${stat.color}`} />
              </div>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stat.value}</div>
              <p className="text-xs text-muted-foreground">{stat.description}</p>
            </CardContent>
          </Card>
        );
      })}
    </div>
  );
}
