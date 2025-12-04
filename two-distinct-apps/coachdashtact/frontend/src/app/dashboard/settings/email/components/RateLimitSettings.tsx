'use client';

/**
 * RateLimitSettings Component
 * 
 * Displays and configures email rate limits with:
 * - Hourly/daily usage display
 * - Progress bars
 * - Configuration inputs
 * - Warnings when approaching limits
 */

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Skeleton } from '@/components/ui/skeleton';
import { Loader2, Save, AlertTriangle, Info } from 'lucide-react';
import { emailRateLimitApi } from '@/lib/api/email';
import type { RateLimitConfig, RateLimitUsage } from '@/types/email';
import { toast } from '@/hooks/use-toast';

export function RateLimitSettings() {
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [config, setConfig] = useState<RateLimitConfig | null>(null);
  const [usage, setUsage] = useState<RateLimitUsage | null>(null);

  // Form state
  const [hourlyLimit, setHourlyLimit] = useState('100');
  const [dailyLimit, setDailyLimit] = useState('1000');

  useEffect(() => {
    loadRateLimits();
  }, []);

  const loadRateLimits = async () => {
    try {
      setIsLoading(true);
      // Load configuration and usage
      const [configData, usageData] = await Promise.all([
        emailRateLimitApi.getConfig(),
        emailRateLimitApi.getUsage(),
      ]);

      setConfig(configData);
      setUsage(usageData);
      setHourlyLimit(configData.hourlyLimit.toString());
      setDailyLimit(configData.dailyLimit.toString());
    } catch (error) {
      console.error('Failed to load rate limits:', error);
      toast.error('Failed to load rate limit settings');
    } finally {
      setIsLoading(false);
    }
  };

  const handleSave = async () => {
    const hourly = parseInt(hourlyLimit, 10);
    const daily = parseInt(dailyLimit, 10);

    // Validation
    if (isNaN(hourly) || hourly <= 0) {
      toast.error('Hourly limit must be a positive number');
      return;
    }

    if (isNaN(daily) || daily <= 0) {
      toast.error('Daily limit must be a positive number');
      return;
    }

    if (hourly > daily) {
      toast.error('Hourly limit cannot exceed daily limit');
      return;
    }

    try {
      setIsSaving(true);
      await emailRateLimitApi.updateConfig({
        hourlyLimit: hourly,
        dailyLimit: daily,
      });

      toast.success('Rate limit settings updated successfully');

      await loadRateLimits();
    } catch (error: any) {
      console.error('Failed to save rate limits:', error);
      toast.error(error.message || 'Failed to save rate limit settings');
    } finally {
      setIsSaving(false);
    }
  };

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Rate Limits</CardTitle>
          <CardDescription>Configure email sending rate limits</CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <Skeleton className="h-24 w-full" />
          <Skeleton className="h-24 w-full" />
          <Skeleton className="h-10 w-32" />
        </CardContent>
      </Card>
    );
  }

  if (!config || !usage) {
    return null;
  }

  const hourlyPercentage = (usage.hourlyUsage / config.hourlyLimit) * 100;
  const dailyPercentage = (usage.dailyUsage / config.dailyLimit) * 100;

  const isHourlyWarning = hourlyPercentage >= 80;
  const isDailyWarning = dailyPercentage >= 80;
  const isHourlyDanger = hourlyPercentage >= 95;
  const isDailyDanger = dailyPercentage >= 95;

  return (
    <Card>
      <CardHeader>
        <CardTitle>Rate Limits</CardTitle>
        <CardDescription>
          Configure email sending rate limits to prevent abuse and stay within provider limits
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Warnings */}
        {(isHourlyWarning || isDailyWarning) && (
          <Alert variant={isHourlyDanger || isDailyDanger ? 'destructive' : 'default'}>
            <AlertTriangle className="h-4 w-4" />
            <AlertDescription>
              {isHourlyDanger || isDailyDanger
                ? 'Critical: You are approaching your rate limits. Additional emails will be queued.'
                : 'Warning: You are approaching your rate limits.'}
            </AlertDescription>
          </Alert>
        )}

        {/* Hourly Usage */}
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <Label>Hourly Usage</Label>
            <span className="text-sm text-muted-foreground">
              {usage.hourlyUsage.toLocaleString()} / {config.hourlyLimit.toLocaleString()}
            </span>
          </div>
          <Progress
            value={hourlyPercentage}
            className={
              isHourlyDanger
                ? '[&>div]:bg-destructive'
                : isHourlyWarning
                ? '[&>div]:bg-yellow-500'
                : ''
            }
          />
          <p className="text-xs text-muted-foreground">
            {hourlyPercentage.toFixed(1)}% of hourly limit used
            {usage.hourlyResetAt && (
              <> • Resets {new Date(usage.hourlyResetAt).toLocaleTimeString()}</>
            )}
          </p>
        </div>

        {/* Daily Usage */}
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <Label>Daily Usage</Label>
            <span className="text-sm text-muted-foreground">
              {usage.dailyUsage.toLocaleString()} / {config.dailyLimit.toLocaleString()}
            </span>
          </div>
          <Progress
            value={dailyPercentage}
            className={
              isDailyDanger
                ? '[&>div]:bg-destructive'
                : isDailyWarning
                ? '[&>div]:bg-yellow-500'
                : ''
            }
          />
          <p className="text-xs text-muted-foreground">
            {dailyPercentage.toFixed(1)}% of daily limit used
            {usage.dailyResetAt && (
              <> • Resets {new Date(usage.dailyResetAt).toLocaleDateString()}</>
            )}
          </p>
        </div>

        {/* Configuration */}
        <div className="space-y-4 rounded-lg border bg-muted/50 p-4">
          <div className="flex items-center gap-2">
            <Info className="h-4 w-4 text-muted-foreground" />
            <Label className="text-sm font-medium">Rate Limit Configuration</Label>
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="hourlyLimit">Hourly Limit</Label>
              <Input
                id="hourlyLimit"
                type="number"
                min="1"
                value={hourlyLimit}
                onChange={(e) => setHourlyLimit(e.target.value)}
                disabled={isSaving}
              />
              <p className="text-xs text-muted-foreground">
                Maximum emails per hour
              </p>
            </div>

            <div className="space-y-2">
              <Label htmlFor="dailyLimit">Daily Limit</Label>
              <Input
                id="dailyLimit"
                type="number"
                min="1"
                value={dailyLimit}
                onChange={(e) => setDailyLimit(e.target.value)}
                disabled={isSaving}
              />
              <p className="text-xs text-muted-foreground">
                Maximum emails per day
              </p>
            </div>
          </div>

          <Alert>
            <Info className="h-4 w-4" />
            <AlertDescription>
              When rate limits are reached, additional emails will be queued and sent when the limit
              resets. Hourly limit cannot exceed daily limit.
            </AlertDescription>
          </Alert>

          <Button onClick={handleSave} disabled={isSaving} className="w-full sm:w-auto">
            {isSaving ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Saving...
              </>
            ) : (
              <>
                <Save className="mr-2 h-4 w-4" />
                Save Rate Limits
              </>
            )}
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
