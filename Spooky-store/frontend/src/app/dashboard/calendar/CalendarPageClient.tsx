'use client';

import React, { useState, useEffect } from 'react';
import { CalendarView } from '@/components/calendar/CalendarView';
import { EventForm } from '@/components/calendar/EventForm';
import { RecurrenceEditor } from '@/components/calendar/RecurrenceEditor';
import { ReminderEditor } from '@/components/calendar/ReminderEditor';
import { EventDetailsPanel } from '@/components/calendar/EventDetailsPanel';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Plus, Sparkles } from 'lucide-react';
import { CalendarApi } from '@/lib/api';
import { toast } from '@/hooks/use-toast';
import type { CalendarEvent, EventCategory, CreateEventDto, UpdateEventDto, RecurrenceRule } from '@/types/calendar';

export function CalendarPageClient() {
  const [events, setEvents] = useState<CalendarEvent[]>([]);
  const [categories, setCategories] = useState<EventCategory[]>([]);
  const [selectedEvent, setSelectedEvent] = useState<CalendarEvent | null>(null);
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [isDetailsOpen, setIsDetailsOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [recurrenceRule, setRecurrenceRule] = useState<Partial<RecurrenceRule> | null>(null);
  const [reminders, setReminders] = useState<number[]>([]);
  const [initialCalendarDate, setInitialCalendarDate] = useState<Date>(new Date());

  // Handle URL parameters on mount
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const dateParam = params.get('date');

    if (dateParam) {
      try {
        const parsedDate = new Date(dateParam);
        if (!isNaN(parsedDate.getTime())) {
          setInitialCalendarDate(parsedDate);
        }
      } catch (error) {
        console.error('Invalid date parameter:', error);
      }
    }
  }, []);

  // Load events and categories
  useEffect(() => {
    loadEvents();
    loadCategories();
  }, []);

  // Handle URL parameters (event ID)
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const eventId = params.get('event');

    if (eventId && events.length > 0) {
      // Find and open the event
      const event = events.find(e => e.id === eventId);
      if (event) {
        setSelectedEvent(event);
        setIsDetailsOpen(true);
        // Clear URL parameter after opening
        window.history.replaceState({}, '', '/dashboard/calendar');
      }
    }
  }, [events]);

  const loadEvents = async () => {
    try {
      const data = await CalendarApi.getEvents();
      setEvents(data);
    } catch (error) {
      toast.error('Failed to load events');
      console.error('Failed to load events:', error);
    }
  };

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
      await loadEvents();
      setIsCreateDialogOpen(false);
      setRecurrenceRule(null);
      setReminders([]);
    } catch (error) {
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  const handleUpdateEvent = async (data: any) => {
    if (!selectedEvent) return;

    setIsLoading(true);
    try {
      // Add recurrence rule and reminders if set
      const eventData: UpdateEventDto = {
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

      await CalendarApi.updateEvent(selectedEvent.id, eventData);
      await loadEvents();
      setIsEditDialogOpen(false);
      setSelectedEvent(null);
      setRecurrenceRule(null);
      setReminders([]);
    } catch (error) {
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  const handleDeleteEvent = async (eventId: string) => {
    try {
      await CalendarApi.deleteEvent(eventId);
      await loadEvents();
      setIsDetailsOpen(false);
      setSelectedEvent(null);
      toast.success('Event deleted successfully');
    } catch (error) {
      toast.error('Failed to delete event');
    }
  };

  const handleEventClick = (event: CalendarEvent) => {
    setSelectedEvent(event);
    setIsDetailsOpen(true);
  };

  const handleEventDrop = async (event: CalendarEvent, newStart: Date, newEnd: Date) => {
    try {
      await CalendarApi.updateEvent(event.id, {
        startTime: newStart.toISOString(),
        endTime: newEnd.toISOString(),
      });
      await loadEvents();
    } catch (error) {
      throw error;
    }
  };

  const handleEventResize = async (event: CalendarEvent, newEnd: Date) => {
    try {
      await CalendarApi.updateEvent(event.id, {
        endTime: newEnd.toISOString(),
      });
      await loadEvents();
    } catch (error) {
      throw error;
    }
  };

  const handleEditClick = () => {
    setIsDetailsOpen(false);
    setIsEditDialogOpen(true);
    // Load existing recurrence and reminders
    if (selectedEvent?.recurrenceRule) {
      setRecurrenceRule(selectedEvent.recurrenceRule);
    }
    if (selectedEvent?.reminders) {
      setReminders(selectedEvent.reminders.map(r => r.minutesBefore));
    }
  };

  const handleCreateClick = () => {
    window.location.href = '/dashboard/calendar/new';
  };

  const handleCreateDemoEvent = async () => {
    try {
      const now = new Date();
      const startTime = new Date(now);
      startTime.setHours(now.getHours() + 1, 0, 0, 0);
      const endTime = new Date(startTime);
      endTime.setHours(startTime.getHours() + 1);

      const demoEvent: CreateEventDto = {
        title: 'Demo Meeting',
        description: 'This is a demo event created to test the calendar system. Feel free to edit or delete it!',
        startTime: startTime.toISOString(),
        endTime: endTime.toISOString(),
        allDay: false,
        location: 'Conference Room A',
        categoryId: categories[0]?.id || '',
        visibility: 'PUBLIC',
        color: '#3b82f6',
        reminders: [15, 60],
      };

      await CalendarApi.createEvent(demoEvent);
      await loadEvents();
      toast.success('Demo event created! Check your calendar.');
    } catch (error) {
      toast.error('Failed to create demo event');
      console.error('Failed to create demo event:', error);
    }
  };

  return (
    <div className="h-full flex flex-col space-y-4 p-4 md:p-6">
      {/* Page Header with Quick Actions */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-foreground">Calendar</h1>
          <p className="text-muted-foreground mt-1">
            Manage your events and schedule
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={handleCreateDemoEvent}
            className="gap-2"
          >
            <Sparkles className="h-4 w-4" />
            Demo Event
          </Button>
          <Button
            onClick={handleCreateClick}
            size="sm"
            className="gap-2"
          >
            <Plus className="h-4 w-4" />
            New Event
          </Button>
        </div>
      </div>

      {/* Calendar View */}
      <div className="flex-1 bg-card border border-border rounded-lg overflow-hidden">
        <CalendarView
          initialDate={initialCalendarDate}
          events={events}
          onEventEdit={handleEditClick}
          onEventDelete={(event) => handleDeleteEvent(event.id)}
          onEventDrop={handleEventDrop}
          onCreateDemo={handleCreateDemoEvent}
        />
      </div>

      {/* Edit Event Dialog */}
      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent className="max-w-4xl max-h-[95vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="text-2xl">Edit Event</DialogTitle>
          </DialogHeader>
          <div className="space-y-6 py-4">
            <EventForm
              event={selectedEvent || undefined}
              categories={categories}
              onSubmit={handleUpdateEvent}
              onCancel={() => {
                setIsEditDialogOpen(false);
                setSelectedEvent(null);
                setRecurrenceRule(null);
                setReminders([]);
              }}
              isLoading={isLoading}
            />
            <div className="border-t border-border pt-6">
              <RecurrenceEditor
                value={recurrenceRule || undefined}
                onChange={setRecurrenceRule}
                startDate={selectedEvent ? new Date(selectedEvent.startTime) : undefined}
              />
            </div>
            <div className="border-t border-border pt-6">
              <ReminderEditor
                value={reminders}
                onChange={setReminders}
              />
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Event Details Panel */}
      <EventDetailsPanel
        event={selectedEvent}
        open={isDetailsOpen}
        onClose={() => {
          setIsDetailsOpen(false);
          setSelectedEvent(null);
        }}
        onEdit={selectedEvent ? handleEditClick : undefined}
        onDelete={selectedEvent ? () => handleDeleteEvent(selectedEvent.id) : undefined}
      />
    </div>
  );
}
