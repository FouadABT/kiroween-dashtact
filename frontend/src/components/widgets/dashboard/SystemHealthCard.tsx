'use client';

import { useState } from 'react';
import { WidgetContainer } from '../core/WidgetContainer';
import { EmptyState } from '../layout/EmptyState';
import { SkeletonLoader } from '../layout/SkeletonLoader';
import { Badge } from '@/components/ui/badge';
import { useDashboardData } from '@/contexts/DashboardDataContext';
import { Activity, Mail, Clock, TrendingUp, TrendingDown } from 'lucide-react';

export interface SystemHealthCardProps {
  title?: string;
  refreshInterval?: number;
  data?: {
    cronJobSuccessRate?: number;
    emailDeliveryRate?: number;
    systemUptime?: number;
  };
  loading?: boolean;
  error?: string;
  permission?: string;
}

function formatUptime(seconds: number): string {
  const days = Math.floor(seconds / 86400);
  const hours = Math.floor((seconds % 86400) / 3600);
  const minutes = Math.floor((seconds % 3600) / 60);
  if (days > 0) return `${days}d ${hours}h`;
  if (hours > 0) return `${hours}h ${minutes}m`;
  return `${minutes}m`;
}

function getStatusColor(percentage: number): string {
  if (percentage >= 95) return 'text-green-600 dark:text-green-400';
  if (percentage >= 80) return 'text-yellow-600 dark:text-yellow-400';
  return 'text-red-600 dark:text-red-400';
}

function getBadgeVariant(percentage: number): 'default' | 'secondary' | 'destructive' {
  if (percentage >= 95) return 'default';
  if (percentage >= 80) return 'secondary';
  return 'destructive';
}

export function SystemHealthCard({
  title = 'System Health',
  refreshInterval = 60,
  data: propData,
  loading: propLoading = false,
  error: propError,
  permission = 'system:*',
}: SystemHealthCardProps) {
  const context = useDashboardData();
  const [useContext] = useState(!propData);

  const data = propData || (useContext ? context.stats : undefined);
  const loading = propLoading || (useContext ? context.loading : false);
  const error = propError || (useContext ? context.error : undefined);

  if (loading) {
    return <WidgetContainer title={title} loading><SkeletonLoader variant="card" /></WidgetContainer>;
  }

  if (error) {
    return <WidgetContainer title={title} error={typeof error === 'string' ? error : error?.message}><EmptyState title="Error" /></WidgetContainer>;
  }

  if (!data || data.cronJobSuccessRate === undefined) {
    return (
      <WidgetContainer title={title}>
        <EmptyState icon={Activity} title="No Data" description="System health metrics not available" />
      </WidgetContainer>
    );
  }

  const cronJobSuccessRate = data.cronJobSuccessRate ?? 0;
  const emailDeliveryRate = data.emailDeliveryRate ?? 0;
  const systemUptime = data.systemUptime ?? 0;

  return (
    <WidgetContainer title={title} permission={permission}>
      <div className="space-y-4">
        <div className="flex items-center justify-between p-3 rounded-lg bg-muted/50">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-lg bg-background">
              <Activity className="h-5 w-5 text-primary" />
            </div>
            <div>
              <p className="text-sm font-medium">Cron Jobs</p>
              <p className="text-xs text-muted-foreground">Success Rate</p>
            </div>
          </div>
          <div className="text-right">
            <div className="flex items-center gap-2">
              <span className={`text-2xl font-bold ${getStatusColor(cronJobSuccessRate)}`}>{cronJobSuccessRate.toFixed(1)}%</span>
              {cronJobSuccessRate >= 95 ? <TrendingUp className="h-4 w-4 text-green-600 dark:text-green-400" /> : <TrendingDown className="h-4 w-4 text-red-600 dark:text-red-400" />}
            </div>
            <Badge variant={getBadgeVariant(cronJobSuccessRate)} className="mt-1">{cronJobSuccessRate >= 95 ? 'Healthy' : cronJobSuccessRate >= 80 ? 'Warning' : 'Critical'}</Badge>
          </div>
        </div>

        <div className="flex items-center justify-between p-3 rounded-lg bg-muted/50">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-lg bg-background">
              <Mail className="h-5 w-5 text-primary" />
            </div>
            <div>
              <p className="text-sm font-medium">Email Delivery</p>
              <p className="text-xs text-muted-foreground">Delivery Rate</p>
            </div>
          </div>
          <div className="text-right">
            <div className="flex items-center gap-2">
              <span className={`text-2xl font-bold ${getStatusColor(emailDeliveryRate)}`}>{emailDeliveryRate.toFixed(1)}%</span>
              {emailDeliveryRate >= 95 ? <TrendingUp className="h-4 w-4 text-green-600 dark:text-green-400" /> : <TrendingDown className="h-4 w-4 text-red-600 dark:text-red-400" />}
            </div>
            <Badge variant={getBadgeVariant(emailDeliveryRate)} className="mt-1">{emailDeliveryRate >= 95 ? 'Healthy' : emailDeliveryRate >= 80 ? 'Warning' : 'Critical'}</Badge>
          </div>
        </div>

        <div className="flex items-center justify-between p-3 rounded-lg bg-muted/50">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-lg bg-background">
              <Clock className="h-5 w-5 text-primary" />
            </div>
            <div>
              <p className="text-sm font-medium">System Uptime</p>
              <p className="text-xs text-muted-foreground">Current Session</p>
            </div>
          </div>
          <div className="text-right">
            <span className="text-2xl font-bold text-foreground">{formatUptime(systemUptime)}</span>
            <Badge variant="default" className="mt-1 ml-2">Running</Badge>
          </div>
        </div>
      </div>
    </WidgetContainer>
  );
}
