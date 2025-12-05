'use client';

import { useState } from 'react';
import { WidgetContainer } from '../core/WidgetContainer';
import { EmptyState } from '../layout/EmptyState';
import { SkeletonLoader } from '../layout/SkeletonLoader';
import { Badge } from '@/components/ui/badge';
import { useDashboardData } from '@/contexts/DashboardDataContext';
import { Mail, Send, CheckCircle, XCircle, TrendingUp } from 'lucide-react';

export interface EmailDeliveryStatsProps {
  title?: string;
  period?: string;
  data?: {
    emailsSent?: number;
    emailsDelivered?: number;
    emailsFailed?: number;
    deliveryRate?: number;
  };
  loading?: boolean;
  error?: string;
  permission?: string;
}

export function EmailDeliveryStats({
  title = 'Email Delivery',
  period = '24h',
  data: propData,
  loading: propLoading = false,
  error: propError,
  permission = 'system:*',
}: EmailDeliveryStatsProps) {
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

  if (!data || data.emailsSent === undefined) {
    return (
      <WidgetContainer title={title}>
        <EmptyState icon={Mail} title="No Data" description="Email delivery stats not available" />
      </WidgetContainer>
    );
  }

  const emailsSent = data.emailsSent ?? 0;
  const emailsDelivered = data.emailsDelivered ?? 0;
  const emailsFailed = data.emailsFailed ?? 0;
  const deliveryRate = data.deliveryRate ?? 0;

  return (
    <WidgetContainer title={title} permission={permission}>
      <div className="space-y-4">
        <div className="grid grid-cols-2 gap-4">
          <div className="p-3 rounded-lg bg-muted/50">
            <div className="flex items-center gap-2 mb-2">
              <Send className="h-4 w-4 text-blue-600 dark:text-blue-400" />
              <span className="text-xs text-muted-foreground">Sent</span>
            </div>
            <p className="text-2xl font-bold text-foreground">{emailsSent.toLocaleString()}</p>
          </div>
          <div className="p-3 rounded-lg bg-muted/50">
            <div className="flex items-center gap-2 mb-2">
              <CheckCircle className="h-4 w-4 text-green-600 dark:text-green-400" />
              <span className="text-xs text-muted-foreground">Delivered</span>
            </div>
            <p className="text-2xl font-bold text-foreground">{emailsDelivered.toLocaleString()}</p>
          </div>
        </div>

        <div className="p-4 rounded-lg bg-muted/50 border border-border">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm font-medium">Delivery Rate</span>
            <Badge variant={deliveryRate >= 95 ? 'default' : 'secondary'}>{deliveryRate >= 95 ? 'Excellent' : 'Good'}</Badge>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-3xl font-bold text-primary">{deliveryRate.toFixed(1)}%</span>
            <TrendingUp className="h-5 w-5 text-green-600 dark:text-green-400" />
          </div>
        </div>

        {emailsFailed > 0 && (
          <div className="flex items-center justify-between p-3 rounded-lg bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800">
            <div className="flex items-center gap-2">
              <XCircle className="h-4 w-4 text-red-600 dark:text-red-400" />
              <span className="text-sm font-medium text-red-600 dark:text-red-400">Failed</span>
            </div>
            <span className="text-lg font-bold text-red-600 dark:text-red-400">{emailsFailed}</span>
          </div>
        )}
      </div>
    </WidgetContainer>
  );
}
