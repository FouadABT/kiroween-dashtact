'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { PageHeader } from '@/components/layout/PageHeader';
import { EventForm } from '@/components/calendar/EventForm';
import { RecurrenceEditor } from '@/components/calendar/RecurrenceEditor';
import { ReminderEditor } from '@/components/calendar/ReminderEditor';
import { Card } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { CalendarApi } from '@/lib/api';
import { toast } from '@/hooks/use-toast';
import type { EventCategory, CreateEventDto, RecurrenceRule } from '@/types/calendar';
import { Calendar, Repeat, Bell } from 'lucide-react';

export function CreateEventPageClient() {
  const router = useRouter();
  const [categories, setCategories] = useState<EventCategory[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [recurrenceRule, setRecurrenceRule] = useState<Partial<RecurrenceRule> | null>(null);
  const [reminders, setReminders] = useState<number[]>([15]); // Default 15 minutes

  // Load categories
  useEffect(() => {
    loadCategories();
  }, []);

  const loadCategories = async () => {
    try {
      const data = await CalendarApi.getCategories();
      setCategories(data);
    } catch (error) {
      toast.error('Failed to load categories');
      console.error('Failed to load categories:', error);
    }
  };

  const handleCreateEvent = async (data: any) => {
    setIsLoading(true);
    try {
      // Add recurrence rule and reminders if set
      const eventData: CreateEventDto = {
        ...data,
        recurrenceRule: recurrenceRule && recurrenceRule.frequency ? {
          frequency: recurrenceRule.frequency,
          interval: recurrenceRule.interval,
          byDay: recurrenceRule.byDay,
          byMonthDay: recurrenceRule.byMonthDay,
          byMonth: recurrenceRule.byMonth,
          count: recurrenceRule.count,
          until: recurrenceRule.until,
          exceptions: recurrenceRule.exceptions,
        } : undefined,
        reminders: reminders.length > 0 ? reminders : undefined,
      };

      await CalendarApi.createEvent(eventData);
      toast.success('Event created successfully');
      router.push('/dashboard/calendar');
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Failed to create event');
    } finally {
      setIsLoading(false);
    }
  };

  const handleCancel = () => {
    router.push('/dashboard/calendar');
  };

  return (
    <div className="container mx-auto px-4 py-8 max-w-4xl">
      <PageHeader
        title="Create Event"
        description="Create a new calendar event with optional recurrence and reminders"
        breadcrumbProps={{
          customItems: [
            { label: 'Dashboard', href: '/dashboard' },
            { label: 'Calendar', href: '/dashboard/calendar' },
            { label: 'Create Event', href: '/dashboard/calendar/new' },
          ],
        }}
      />

      <Card className="p-6">
        <Tabs defaultValue="details" className="space-y-6">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="details" className="flex items-center gap-2">
              <Calendar className="h-4 w-4" />
              <span className="hidden sm:inline">Event Details</span>
              <span className="sm:hidden">Details</span>
            </TabsTrigger>
            <TabsTrigger value="recurrence" className="flex items-center gap-2">
              <Repeat className="h-4 w-4" />
              <span className="hidden sm:inline">Recurrence</span>
              <span className="sm:hidden">Repeat</span>
            </TabsTrigger>
            <TabsTrigger value="reminders" className="flex items-center gap-2">
              <Bell className="h-4 w-4" />
              <span className="hidden sm:inline">Reminders</span>
              <span className="sm:hidden">Alerts</span>
            </TabsTrigger>
          </TabsList>

          <TabsContent value="details" className="space-y-4">
            <EventForm
              categories={categories}
              onSubmit={handleCreateEvent}
              onCancel={handleCancel}
              isLoading={isLoading}
            />
          </TabsContent>

          <TabsContent value="recurrence" className="space-y-4">
            <RecurrenceEditor
              value={recurrenceRule ?? undefined}
              onChange={setRecurrenceRule}
            />
          </TabsContent>

          <TabsContent value="reminders" className="space-y-4">
            <ReminderEditor
              value={reminders}
              onChange={setReminders}
            />
          </TabsContent>
        </Tabs>
      </Card>
    </div>
  );
}
