'use client';

import React, { useState, useEffect } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Eye,
  Users,
  Clock,
  TrendingDown,
  Download,
  Calendar,
  MousePointerClick,
  Monitor,
  Smartphone,
  Tablet,
} from 'lucide-react';
import { toast } from '@/hooks/use-toast';

interface PageAnalytics {
  pageId: string;
  totalViews: number;
  uniqueVisitors: number;
  avgTimeOnPage: number;
  bounceRate: number;
  dateRange?: {
    start?: string;
    end?: string;
  };
}

interface SectionEngagement {
  sectionId: string;
  views: number;
  avgTimeSpent: number;
  avgScrollDepth: number;
}

interface CTAAnalytics {
  ctaId: string;
  ctaText?: string;
  clicks: number;
  ctr: number;
}

interface TrafficSource {
  source: string;
  visits: number;
  percentage: number;
}

interface DeviceAnalytics {
  deviceBreakdown: Array<{
    device: string;
    visits: number;
    percentage: number;
  }>;
  browserBreakdown: Array<{
    browser: string;
    visits: number;
    percentage: number;
  }>;
}

interface AnalyticsDashboardProps {
  pageId: string;
}

export function AnalyticsDashboard({ pageId }: AnalyticsDashboardProps) {
  const [dateRange, setDateRange] = useState<string>('7d');
  const [pageAnalytics, setPageAnalytics] = useState<PageAnalytics | null>(
    null,
  );
  const [sectionEngagement, setSectionEngagement] = useState<
    SectionEngagement[]
  >([]);
  const [ctaAnalytics, setCTAAnalytics] = useState<CTAAnalytics[]>([]);
  const [trafficSources, setTrafficSources] = useState<TrafficSource[]>([]);
  const [deviceAnalytics, setDeviceAnalytics] =
    useState<DeviceAnalytics | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadAnalytics();
  }, [pageId, dateRange]);

  const getDateRangeParams = () => {
    const now = new Date();
    let startDate: Date;

    switch (dateRange) {
      case '24h':
        startDate = new Date(now.getTime() - 24 * 60 * 60 * 1000);
        break;
      case '7d':
        startDate = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
        break;
      case '30d':
        startDate = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
        break;
      case '90d':
        startDate = new Date(now.getTime() - 90 * 24 * 60 * 60 * 1000);
        break;
      default:
        startDate = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
    }

    return {
      startDate: startDate.toISOString(),
      endDate: now.toISOString(),
    };
  };

  const loadAnalytics = async () => {
    try {
      setLoading(true);
      const params = getDateRangeParams();
      const queryString = new URLSearchParams(params).toString();

      // Load all analytics data in parallel
      const [page, sections, cta, traffic, devices] = await Promise.all([
        fetch(`/api/landing/analytics/${pageId}?${queryString}`).then((r) =>
          r.json(),
        ),
        fetch(`/api/landing/analytics/${pageId}/sections?${queryString}`).then(
          (r) => r.json(),
        ),
        fetch(`/api/landing/analytics/${pageId}/cta?${queryString}`).then((r) =>
          r.json(),
        ),
        fetch(
          `/api/landing/analytics/${pageId}/traffic-sources?${queryString}`,
        ).then((r) => r.json()),
        fetch(`/api/landing/analytics/${pageId}/devices?${queryString}`).then(
          (r) => r.json(),
        ),
      ]);

      setPageAnalytics(page);
      setSectionEngagement(sections);
      setCTAAnalytics(cta);
      setTrafficSources(traffic);
      setDeviceAnalytics(devices);
    } catch (error) {
      console.error('Failed to load analytics:', error);
      toast.error('Failed to load analytics data');
    } finally {
      setLoading(false);
    }
  };

  const handleExport = async () => {
    try {
      const params = getDateRangeParams();
      const queryString = new URLSearchParams(params).toString();
      const response = await fetch(
        `/api/landing/analytics/${pageId}/export?${queryString}`,
      );

      if (!response.ok) throw new Error('Export failed');

      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `analytics-${pageId}-${Date.now()}.csv`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);

      toast.success('Analytics exported successfully');
    } catch (error) {
      console.error('Export failed:', error);
      toast.error('Failed to export analytics');
    }
  };

  const formatTime = (seconds: number) => {
    if (seconds < 60) return `${seconds}s`;
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    return `${minutes}m ${remainingSeconds}s`;
  };

  if (loading) {
    return (
      <div className="space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {[1, 2, 3, 4].map((i) => (
            <Card key={i} className="p-6">
              <div className="h-20 bg-muted animate-pulse rounded" />
            </Card>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold">Analytics Dashboard</h2>
          <p className="text-sm text-muted-foreground">
            Track performance and visitor behavior
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Select value={dateRange} onValueChange={setDateRange}>
            <SelectTrigger className="w-[180px]">
              <Calendar className="h-4 w-4 mr-2" />
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="24h">Last 24 hours</SelectItem>
              <SelectItem value="7d">Last 7 days</SelectItem>
              <SelectItem value="30d">Last 30 days</SelectItem>
              <SelectItem value="90d">Last 90 days</SelectItem>
            </SelectContent>
          </Select>
          <Button onClick={handleExport} variant="outline">
            <Download className="h-4 w-4 mr-2" />
            Export CSV
          </Button>
        </div>
      </div>

      {/* Key Metrics */}
      {pageAnalytics && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <Card className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Total Views</p>
                <p className="text-3xl font-bold mt-2">
                  {pageAnalytics.totalViews.toLocaleString()}
                </p>
              </div>
              <Eye className="h-8 w-8 text-primary" />
            </div>
          </Card>

          <Card className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">
                  Unique Visitors
                </p>
                <p className="text-3xl font-bold mt-2">
                  {pageAnalytics.uniqueVisitors.toLocaleString()}
                </p>
              </div>
              <Users className="h-8 w-8 text-primary" />
            </div>
          </Card>

          <Card className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Avg. Time</p>
                <p className="text-3xl font-bold mt-2">
                  {formatTime(pageAnalytics.avgTimeOnPage)}
                </p>
              </div>
              <Clock className="h-8 w-8 text-primary" />
            </div>
          </Card>

          <Card className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Bounce Rate</p>
                <p className="text-3xl font-bold mt-2">
                  {pageAnalytics.bounceRate}%
                </p>
              </div>
              <TrendingDown className="h-8 w-8 text-destructive" />
            </div>
          </Card>
        </div>
      )}

      {/* Section Engagement */}
      {sectionEngagement.length > 0 && (
        <Card className="p-6">
          <h3 className="text-lg font-semibold mb-4">Section Engagement</h3>
          <div className="space-y-4">
            {sectionEngagement.map((section) => (
              <div
                key={section.sectionId}
                className="flex items-center justify-between p-4 bg-muted rounded-lg"
              >
                <div className="flex-1">
                  <p className="font-medium">{section.sectionId}</p>
                  <p className="text-sm text-muted-foreground">
                    {section.views} views • {formatTime(section.avgTimeSpent)}{' '}
                    avg. time
                  </p>
                </div>
                <div className="text-right">
                  <p className="text-sm font-medium">
                    {section.avgScrollDepth}%
                  </p>
                  <p className="text-xs text-muted-foreground">scroll depth</p>
                </div>
              </div>
            ))}
          </div>
        </Card>
      )}

      {/* CTA Performance */}
      {ctaAnalytics.length > 0 && (
        <Card className="p-6">
          <h3 className="text-lg font-semibold mb-4">CTA Performance</h3>
          <div className="space-y-4">
            {ctaAnalytics.map((cta) => (
              <div
                key={cta.ctaId}
                className="flex items-center justify-between p-4 bg-muted rounded-lg"
              >
                <div className="flex items-center gap-3">
                  <MousePointerClick className="h-5 w-5 text-primary" />
                  <div>
                    <p className="font-medium">{cta.ctaText || cta.ctaId}</p>
                    <p className="text-sm text-muted-foreground">
                      {cta.clicks} clicks
                    </p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="text-lg font-bold text-primary">{cta.ctr}%</p>
                  <p className="text-xs text-muted-foreground">CTR</p>
                </div>
              </div>
            ))}
          </div>
        </Card>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Traffic Sources */}
        {trafficSources.length > 0 && (
          <Card className="p-6">
            <h3 className="text-lg font-semibold mb-4">Traffic Sources</h3>
            <div className="space-y-3">
              {trafficSources.map((source) => (
                <div key={source.source} className="space-y-1">
                  <div className="flex items-center justify-between text-sm">
                    <span className="font-medium">{source.source}</span>
                    <span className="text-muted-foreground">
                      {source.visits} visits ({source.percentage}%)
                    </span>
                  </div>
                  <div className="h-2 bg-muted rounded-full overflow-hidden">
                    <div
                      className="h-full bg-primary"
                      style={{ width: `${source.percentage}%` }}
                    />
                  </div>
                </div>
              ))}
            </div>
          </Card>
        )}

        {/* Device Analytics */}
        {deviceAnalytics && (
          <Card className="p-6">
            <h3 className="text-lg font-semibold mb-4">Device Breakdown</h3>
            <div className="space-y-4">
              {deviceAnalytics.deviceBreakdown.map((device) => (
                <div
                  key={device.device}
                  className="flex items-center justify-between"
                >
                  <div className="flex items-center gap-3">
                    {device.device === 'mobile' && (
                      <Smartphone className="h-5 w-5 text-primary" />
                    )}
                    {device.device === 'tablet' && (
                      <Tablet className="h-5 w-5 text-primary" />
                    )}
                    {device.device === 'desktop' && (
                      <Monitor className="h-5 w-5 text-primary" />
                    )}
                    <span className="font-medium capitalize">
                      {device.device}
                    </span>
                  </div>
                  <div className="text-right">
                    <p className="font-medium">{device.percentage}%</p>
                    <p className="text-xs text-muted-foreground">
                      {device.visits} visits
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </Card>
        )}
      </div>
    </div>
  );
}
