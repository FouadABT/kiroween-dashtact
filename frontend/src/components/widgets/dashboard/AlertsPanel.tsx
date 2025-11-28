'use client';

import { useState, useMemo } from 'react';
import { WidgetContainer } from '../core/WidgetContainer';
import { EmptyState } from '../layout/EmptyState';
import { SkeletonLoader } from '../layout/SkeletonLoader';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Info, AlertTriangle, AlertCircle, XCircle, X, ExternalLink } from 'lucide-react';
import { useDashboardData } from '@/contexts/DashboardDataContext';
import { useRouter } from 'next/navigation';
import { format } from 'date-fns';

export interface AlertsPanelProps {
  title?: string;
  showDismissed?: boolean;
  data?: Array<{ id: string; title: string; message: string; severity: string; timestamp: string; dismissible?: boolean; actionUrl?: string; actionLabel?: string }>;
  loading?: boolean;
  error?: string;
  permission?: string;
}

function getAlertIcon(severity: string) {
  switch (severity) {
    case 'info': return Info;
    case 'warning': return AlertTriangle;
    case 'error': return AlertCircle;
    case 'critical': return XCircle;
    default: return Info;
  }
}

function getAlertColors(severity: string) {
  switch (severity) {
    case 'info': return { icon: 'text-blue-500', badge: 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200', border: 'border-l-blue-500' };
    case 'warning': return { icon: 'text-yellow-500', badge: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200', border: 'border-l-yellow-500' };
    case 'error': return { icon: 'text-red-500', badge: 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200', border: 'border-l-red-500' };
    case 'critical': return { icon: 'text-red-600', badge: 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200', border: 'border-l-red-600' };
    default: return { icon: 'text-blue-500', badge: 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200', border: 'border-l-blue-500' };
  }
}

export function AlertsPanel({
  title = 'Alerts',
  showDismissed = false,
  data: propData,
  loading: propLoading = false,
  error: propError,
  permission,
}: AlertsPanelProps) {
  const router = useRouter();
  const context = useDashboardData();
  const [useContext] = useState(!propData);
  const [dismissedAlerts, setDismissedAlerts] = useState<Set<string>>(new Set());

  const alerts = propData || (useContext ? context.alerts : []);
  const loading = propLoading || (useContext ? context.loading : false);
  const error = propError || (useContext ? context.error : undefined);

  const visibleAlerts = useMemo(() => {
    return (alerts || []).filter(alert => !dismissedAlerts.has(alert.id));
  }, [alerts, dismissedAlerts]);

  if (loading) {
    return <WidgetContainer title={title} loading><SkeletonLoader variant="card" /></WidgetContainer>;
  }

  if (error) {
    return <WidgetContainer title={title} error={typeof error === 'string' ? error : error?.message}><EmptyState title="Error" /></WidgetContainer>;
  }

  if (visibleAlerts.length === 0) {
    return (
      <WidgetContainer title={title}>
        <EmptyState icon={Info} title="No Alerts" description="You're all caught up!" />
      </WidgetContainer>
    );
  }

  return (
    <WidgetContainer title={title} permission={permission}>
      <div className="space-y-3">
        {visibleAlerts.map((alert) => {
          const Icon = getAlertIcon(alert.severity);
          const colors = getAlertColors(alert.severity);
          return (
            <div key={alert.id} className={`relative flex gap-3 p-4 rounded-lg border-l-4 bg-muted/50 ${colors.border}`}>
              <div className="flex-shrink-0">
                <Icon className={`h-5 w-5 ${colors.icon}`} />
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-start justify-between gap-2 mb-1">
                  <div className="flex items-center gap-2 flex-wrap">
                    <h4 className="text-sm font-semibold">{alert.title}</h4>
                    <Badge className={colors.badge} variant="secondary">{alert.severity}</Badge>
                  </div>
                  {alert.dismissible && (
                    <Button variant="ghost" size="sm" className="h-6 w-6 p-0 hover:bg-muted" onClick={() => setDismissedAlerts(prev => new Set([...prev, alert.id]))} aria-label="Dismiss alert">
                      <X className="h-4 w-4" />
                    </Button>
                  )}
                </div>
                <p className="text-sm text-muted-foreground mb-2">{alert.message}</p>
                <div className="flex items-center justify-between gap-2 flex-wrap">
                  <span className="text-xs text-muted-foreground">{format(new Date(alert.timestamp), 'MMM d, yyyy h:mm a')}</span>
                  {alert.actionUrl && (
                    <Button variant="outline" size="sm" className="h-7 text-xs" onClick={() => router.push(alert.actionUrl!)}>
                      {alert.actionLabel || 'View Details'}
                      <ExternalLink className="ml-1 h-3 w-3" />
                    </Button>
                  )}
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </WidgetContainer>
  );
}
