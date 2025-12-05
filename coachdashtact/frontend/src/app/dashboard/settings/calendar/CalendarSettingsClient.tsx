'use client';

import React, { useState, useEffect } from 'react';
import { CalendarApi } from '@/lib/api';
import { toast } from '@/hooks/use-toast';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Input } from '@/components/ui/input';
import { Switch } from '@/components/ui/switch';
import { Skeleton } from '@/components/ui/skeleton';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { CalendarSettings, UpdateCalendarSettingsDto } from '@/types/calendar';
import { CategoryManager } from '@/components/admin/calendar/CategoryManager';
import { CalendarPermissions } from '@/components/admin/calendar/CalendarPermissions';
import { PageHeader } from '@/components/layout/PageHeader';
import { Calendar, Settings, Shield, Save, RotateCcw } from 'lucide-react';

const DAYS_OF_WEEK = [
  { value: 0, label: 'Sunday' },
  { value: 1, label: 'Monday' },
  { value: 2, label: 'Tuesday' },
  { value: 3, label: 'Wednesday' },
  { value: 4, label: 'Thursday' },
  { value: 5, label: 'Friday' },
  { value: 6, label: 'Saturday' },
];

const TIMEZONES = [
  'UTC',
  'America/New_York',
  'America/Chicago',
  'America/Denver',
  'America/Los_Angeles',
  'Europe/London',
  'Europe/Paris',
  'Asia/Tokyo',
  'Asia/Shanghai',
  'Australia/Sydney',
];

const DEFAULT_REMINDERS = [
  { value: 5, label: '5 minutes' },
  { value: 10, label: '10 minutes' },
  { value: 15, label: '15 minutes' },
  { value: 30, label: '30 minutes' },
  { value: 60, label: '1 hour' },
  { value: 1440, label: '1 day' },
];

export function CalendarSettingsClient() {
  const [settings, setSettings] = useState<CalendarSettings | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [hasChanges, setHasChanges] = useState(false);

  // Form state
  const [defaultView, setDefaultView] = useState<'month' | 'week' | 'day' | 'agenda'>('month');
  const [weekStartsOn, setWeekStartsOn] = useState(0);
  const [workingHoursStart, setWorkingHoursStart] = useState('09:00');
  const [workingHoursEnd, setWorkingHoursEnd] = useState('17:00');
  const [workingDays, setWorkingDays] = useState<number[]>([1, 2, 3, 4, 5]);
  const [timeZone, setTimeZone] = useState('UTC');
  const [defaultReminders, setDefaultReminders] = useState<number[]>([15]);
  const [showWeekNumbers, setShowWeekNumbers] = useState(false);

  useEffect(() => {
    loadSettings();
  }, []);

  const loadSettings = async () => {
    try {
      setIsLoading(true);
      const data = await CalendarApi.getSettings();
      setSettings(data);
      
      // Populate form
      setDefaultView(data.defaultView);
      setWeekStartsOn(data.weekStartsOn);
      setWorkingHoursStart(data.workingHoursStart);
      setWorkingHoursEnd(data.workingHoursEnd);
      setWorkingDays(data.workingDays);
      setTimeZone(data.timeZone);
      setDefaultReminders(data.defaultReminders);
      setShowWeekNumbers(data.showWeekNumbers);
    } catch (error) {
      console.error('Failed to load calendar settings:', error);
      toast.error('Failed to load calendar settings');
    } finally {
      setIsLoading(false);
    }
  };

  const handleSave = async () => {
    try {
      setIsSaving(true);
      
      const updateData: UpdateCalendarSettingsDto = {
        defaultView,
        weekStartsOn,
        workingHoursStart,
        workingHoursEnd,
        workingDays,
        timeZone,
        defaultReminders,
        showWeekNumbers,
      };

      await CalendarApi.updateSettings(updateData);
      toast.success('Calendar settings saved successfully');
      setHasChanges(false);
      await loadSettings();
    } catch (error) {
      console.error('Failed to save calendar settings:', error);
      toast.error('Failed to save calendar settings');
    } finally {
      setIsSaving(false);
    }
  };

  const handleReset = () => {
    if (settings) {
      setDefaultView(settings.defaultView);
      setWeekStartsOn(settings.weekStartsOn);
      setWorkingHoursStart(settings.workingHoursStart);
      setWorkingHoursEnd(settings.workingHoursEnd);
      setWorkingDays(settings.workingDays);
      setTimeZone(settings.timeZone);
      setDefaultReminders(settings.defaultReminders);
      setShowWeekNumbers(settings.showWeekNumbers);
      setHasChanges(false);
    }
  };

  const toggleWorkingDay = (day: number) => {
    setWorkingDays(prev => {
      if (prev.includes(day)) {
        return prev.filter(d => d !== day);
      } else {
        return [...prev, day].sort();
      }
    });
    setHasChanges(true);
  };

  const toggleDefaultReminder = (minutes: number) => {
    setDefaultReminders(prev => {
      if (prev.includes(minutes)) {
        return prev.filter(m => m !== minutes);
      } else {
        return [...prev, minutes].sort((a, b) => a - b);
      }
    });
    setHasChanges(true);
  };

  if (isLoading) {
    return (
      <div className="container mx-auto px-4 py-8 max-w-7xl">
        <Skeleton className="h-10 w-64 mb-4" />
        <Skeleton className="h-6 w-96 mb-8" />
        <div className="space-y-4">
          <Skeleton className="h-64 w-full" />
          <Skeleton className="h-64 w-full" />
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8 max-w-7xl">
      <PageHeader
        title="Calendar Settings"
        description="Configure calendar preferences, manage categories, and control permissions"
        breadcrumbProps={{
          customItems: [
            { label: 'Dashboard', href: '/dashboard' },
            { label: 'Settings', href: '/dashboard/settings' },
            { label: 'Calendar', href: '/dashboard/settings/calendar' },
          ],
        }}
        actions={
          <Button
            onClick={() => window.location.href = '/dashboard/calendar'}
            variant="outline"
            size="sm"
            className="gap-2"
          >
            <Calendar className="h-4 w-4" />
            View Calendar
          </Button>
        }
      />

      {/* Tabs */}
      <Tabs defaultValue="general" className="space-y-6">
        <TabsList className="grid w-full grid-cols-1 sm:grid-cols-3 gap-2">
          <TabsTrigger value="general" className="flex items-center gap-2">
            <Settings className="h-4 w-4" />
            <span className="hidden sm:inline">General Settings</span>
            <span className="sm:hidden">General</span>
          </TabsTrigger>
          <TabsTrigger value="categories" className="flex items-center gap-2">
            <Calendar className="h-4 w-4" />
            <span className="hidden sm:inline">Event Categories</span>
            <span className="sm:hidden">Categories</span>
          </TabsTrigger>
          <TabsTrigger value="permissions" className="flex items-center gap-2">
            <Shield className="h-4 w-4" />
            <span className="hidden sm:inline">Permissions</span>
            <span className="sm:hidden">Permissions</span>
          </TabsTrigger>
        </TabsList>

        {/* General Settings Tab */}
        <TabsContent value="general" className="space-y-6">
          <Card className="p-6">
            <h2 className="text-2xl font-semibold mb-4">Default Preferences</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Default View */}
              <div className="space-y-2">
                <Label htmlFor="defaultView">Default View</Label>
                <Select
                  value={defaultView}
                  onValueChange={(value: any) => {
                    setDefaultView(value);
                    setHasChanges(true);
                  }}
                >
                  <SelectTrigger id="defaultView">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="month">Month</SelectItem>
                    <SelectItem value="week">Week</SelectItem>
                    <SelectItem value="day">Day</SelectItem>
                    <SelectItem value="agenda">Agenda</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {/* Week Starts On */}
              <div className="space-y-2">
                <Label htmlFor="weekStartsOn">Week Starts On</Label>
                <Select
                  value={weekStartsOn.toString()}
                  onValueChange={(value) => {
                    setWeekStartsOn(parseInt(value));
                    setHasChanges(true);
                  }}
                >
                  <SelectTrigger id="weekStartsOn">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {DAYS_OF_WEEK.map(day => (
                      <SelectItem key={day.value} value={day.value.toString()}>
                        {day.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {/* Time Zone */}
              <div className="space-y-2 md:col-span-2">
                <Label htmlFor="timeZone">Time Zone</Label>
                <Select
                  value={timeZone}
                  onValueChange={(value) => {
                    setTimeZone(value);
                    setHasChanges(true);
                  }}
                >
                  <SelectTrigger id="timeZone">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {TIMEZONES.map(tz => (
                      <SelectItem key={tz} value={tz}>
                        {tz}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {/* Show Week Numbers */}
              <div className="flex items-center justify-between md:col-span-2">
                <Label htmlFor="showWeekNumbers" className="cursor-pointer">
                  Show Week Numbers
                </Label>
                <Switch
                  id="showWeekNumbers"
                  checked={showWeekNumbers}
                  onCheckedChange={(checked) => {
                    setShowWeekNumbers(checked);
                    setHasChanges(true);
                  }}
                />
              </div>
            </div>
          </Card>

          <Card className="p-6">
            <h2 className="text-2xl font-semibold mb-4">Working Hours</h2>
            <div className="space-y-6">
              {/* Working Hours */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="workingHoursStart">Start Time</Label>
                  <Input
                    id="workingHoursStart"
                    type="time"
                    value={workingHoursStart}
                    onChange={(e) => {
                      setWorkingHoursStart(e.target.value);
                      setHasChanges(true);
                    }}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="workingHoursEnd">End Time</Label>
                  <Input
                    id="workingHoursEnd"
                    type="time"
                    value={workingHoursEnd}
                    onChange={(e) => {
                      setWorkingHoursEnd(e.target.value);
                      setHasChanges(true);
                    }}
                  />
                </div>
              </div>

              {/* Working Days */}
              <div className="space-y-2">
                <Label>Working Days</Label>
                <div className="grid grid-cols-2 sm:grid-cols-4 md:grid-cols-7 gap-2">
                  {DAYS_OF_WEEK.map(day => (
                    <Button
                      key={day.value}
                      type="button"
                      variant={workingDays.includes(day.value) ? 'default' : 'outline'}
                      size="sm"
                      onClick={() => toggleWorkingDay(day.value)}
                      className="w-full"
                    >
                      {day.label.substring(0, 3)}
                    </Button>
                  ))}
                </div>
              </div>
            </div>
          </Card>

          <Card className="p-6">
            <h2 className="text-2xl font-semibold mb-4">Default Reminders</h2>
            <div className="space-y-2">
              <Label>Select default reminder times for new events</Label>
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                {DEFAULT_REMINDERS.map(reminder => (
                  <Button
                    key={reminder.value}
                    type="button"
                    variant={defaultReminders.includes(reminder.value) ? 'default' : 'outline'}
                    size="sm"
                    onClick={() => toggleDefaultReminder(reminder.value)}
                    className="w-full"
                  >
                    {reminder.label}
                  </Button>
                ))}
              </div>
            </div>
          </Card>

          {/* Action Buttons */}
          <div className="flex flex-col sm:flex-row gap-3 justify-end">
            <Button
              variant="outline"
              onClick={handleReset}
              disabled={!hasChanges || isSaving}
              className="w-full sm:w-auto"
            >
              <RotateCcw className="h-4 w-4 mr-2" />
              Reset
            </Button>
            <Button
              onClick={handleSave}
              disabled={!hasChanges || isSaving}
              className="w-full sm:w-auto"
            >
              <Save className="h-4 w-4 mr-2" />
              {isSaving ? 'Saving...' : 'Save Changes'}
            </Button>
          </div>
        </TabsContent>

        {/* Categories Tab */}
        <TabsContent value="categories">
          <CategoryManager />
        </TabsContent>

        {/* Permissions Tab */}
        <TabsContent value="permissions">
          <CalendarPermissions />
        </TabsContent>
      </Tabs>
    </div>
  );
}
