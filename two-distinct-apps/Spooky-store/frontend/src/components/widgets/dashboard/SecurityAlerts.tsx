'use client';

import { useState, useMemo } from 'react';
import { WidgetContainer } from '../core/WidgetContainer';
import { EmptyState } from '../layout/EmptyState';
import { SkeletonLoader } from '../layout/SkeletonLoader';
import { Badge } from '@/components/ui/badge';
import { useDashboardData } from '@/contexts/DashboardDataContext';
import { Shield, AlertTriangle, XCircle, Info } from 'lucide-react';

export interface SecurityAlertsProps {
  title?: string;
  limit?: number;
  data?: Array<{ id: string; type: string; message: string; severity: string; timestamp: string }>;
  loading?: boolean;
  error?: string;
  permission?: string;
}

function getSeverityIcon(severity: string) {
  switch (severity) {
    case 'critical': return XCircle;
    case 'high': return AlertTriangle;
    case 'medium': return Info;
    default: return Shield;
  }
}

function getSeverityColor(severity: string) {
  switch (severity) {
    case 'critical': return { icon: 'text-red-600 dark:text-red-400', bg: 'bg-red-50 dark:bg-red-900/20', border: 'border-red-200 dark:border-red-800' };
    case 'high': return { icon: 'text-orange-600 dark:text-orange-400', bg: 'bg-orange-50 dark:bg-orange-900/20', border: 'border-orange-200 dark:border-orange-800' };
    case 'medium': return { icon: 'text-yellow-600 dark:text-yellow-400', bg: 'bg-yellow-50 dark:bg-yellow-900/20', border: 'border-yellow-200 dark:border-yellow-800' };
    default: return { icon: 'text-blue-600 dark:text-blue-400', bg: 'bg-blue-50 dark:bg-blue-900/20', border: 'border-blue-200 dark:border-blue-800' };
  }
}

function formatRelativeTime(timestamp: string): string {
  const date = new Date(timestamp);
  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
  const diffMins = Math.floor(diffMs / 60000);
  if (diffMins < 1) return 'Just now';
  if (diffMins < 60) return `${diffMins}m ago`;
  const diffHours = Math.floor(diffMins / 60);
  if (diffHours < 24) return `${diffHours}h ago`;
  const diffDays = Math.floor(diffHours / 24);
  return `${diffDays}d ago`;
}

export function SecurityAlerts({
  title = 'Security Alerts',
  limit = 5,
  data: propData,
  loading: propLoading = false,
  error: propError,
  permission = 'system:*',
}: SecurityAlertsProps) {
  const context = useDashboardData();
  const [useContext] = useState(!propData);

  const alerts = useMemo(() => {
    if (propData) return propData.slice(0, limit);
    if (!useContext || !context.recentActivity) return [];
    return context.recentActivity
      .filter(activity => activity.metadata?.type === 'security')
      .slice(0, limit)
      .map(activity => ({
        id: activity.id,
        type: activity.metadata?.type || 'security',
        message: activity.description,
        severity: activity.metadata?.severity || 'medium',
        timestamp: activity.timestamp,
      }));
  }, [propData, useContext, context.recentActivity, limit]);

  const loading = propLoading || (useContext ? context.loading : false);
  const error = propError || (useContext ? context.error : undefined);

  if (loading) {
    return <WidgetContainer title={title} loading><SkeletonLoader variant="card" /></WidgetContainer>;
  }

  if (error) {
    return <WidgetContainer title={title} error={typeof error === 'string' ? error : error?.message}><EmptyState title="Error" /></WidgetContainer>;
  }

  if (alerts.length === 0) {
    return (
      <WidgetContainer title={title}>
        <EmptyState icon={Shield} title="All Clear" description="No security alerts" />
      </WidgetContainer>
    );
  }

  return (
    <WidgetContainer title={title} permission={permission}>
      <div className="space-y-3">
        {alerts.map((alert) => {
          const Icon = getSeverityIcon(alert.severity);
          const colors = getSeverityColor(alert.severity);
          return (
            <div key={alert.id} className={`flex items-start gap-3 p-3 rounded-lg border ${colors.bg} ${colors.border}`}>
              <Icon className={`h-5 w-5 ${colors.icon} flex-shrink-0 mt-0.5`} />
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-1">
                  <Badge variant="outline" className="text-xs">{alert.severity}</Badge>
                  <span className="text-xs text-muted-foreground">{formatRelativeTime(alert.timestamp)}</span>
                </div>
                <p className="text-sm font-medium text-foreground">{alert.message}</p>
              </div>
            </div>
          );
        })}
      </div>
    </WidgetContainer>
  );
}
