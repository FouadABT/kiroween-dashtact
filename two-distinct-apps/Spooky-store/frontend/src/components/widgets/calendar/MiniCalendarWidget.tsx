'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { ChevronLeft, ChevronRight, Calendar as CalendarIcon } from 'lucide-react';
import { CalendarApi } from '@/lib/api';
import { CalendarEvent } from '@/types/calendar';
import { toast } from '@/hooks/use-toast';
import { useRouter } from 'next/navigation';
import { cn } from '@/lib/utils';

interface MiniCalendarWidgetProps {
  title?: string;
  onDateClick?: (date: Date) => void;
}

export function MiniCalendarWidget({
  title = 'Calendar',
  onDateClick,
}: MiniCalendarWidgetProps) {
  const router = useRouter();
  const [currentDate, setCurrentDate] = useState(new Date());
  const [events, setEvents] = useState<CalendarEvent[]>([]);
  const [loading, setLoading] = useState(true);
  const [eventDates, setEventDates] = useState<Set<string>>(new Set());

  // Get month data
  const year = currentDate.getFullYear();
  const month = currentDate.getMonth();
  const firstDay = new Date(year, month, 1);
  const lastDay = new Date(year, month + 1, 0);
  const daysInMonth = lastDay.getDate();
  const startingDayOfWeek = firstDay.getDay();
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  // Fetch events for current month
  useEffect(() => {
    const fetchEvents = async () => {
      try {
        setLoading(true);
        const startDate = new Date(year, month, 1);
        const endDate = new Date(year, month + 1, 0, 23, 59, 59);
        
        const fetchedEvents = await CalendarApi.getEvents({
          startDate: startDate.toISOString(),
          endDate: endDate.toISOString(),
        });
        
        console.log('📅 MiniCalendar - Fetched events:', fetchedEvents);
        console.log('📅 MiniCalendar - Events count:', fetchedEvents?.length);
        
        const safeEvents = Array.isArray(fetchedEvents) ? fetchedEvents : [];
        setEvents(safeEvents);
        
        // Create set of dates that have events
        const dates = new Set<string>();
        safeEvents.forEach(event => {
          const eventDate = new Date(event.startTime);
          const dateKey = `${eventDate.getFullYear()}-${eventDate.getMonth()}-${eventDate.getDate()}`;
          dates.add(dateKey);
        });
        setEventDates(dates);
      } catch (error) {
        console.error('Failed to fetch calendar events:', error);
        toast.error('Failed to load calendar events');
      } finally {
        setLoading(false);
      }
    };

    fetchEvents();
  }, [year, month]);

  // Navigate months
  const previousMonth = () => {
    setCurrentDate(new Date(year, month - 1, 1));
  };

  const nextMonth = () => {
    setCurrentDate(new Date(year, month + 1, 1));
  };

  const goToToday = () => {
    setCurrentDate(new Date());
  };

  // Handle date click
  const handleDateClick = (day: number) => {
    const clickedDate = new Date(year, month, day);
    if (onDateClick) {
      onDateClick(clickedDate);
    } else {
      // Navigate to full calendar with selected date
      router.push(`/dashboard/calendar?date=${clickedDate.toISOString()}`);
    }
  };

  // Check if date has events
  const hasEvents = (day: number): boolean => {
    const dateKey = `${year}-${month}-${day}`;
    return eventDates.has(dateKey);
  };

  // Check if date is today
  const isToday = (day: number): boolean => {
    const date = new Date(year, month, day);
    date.setHours(0, 0, 0, 0);
    return date.getTime() === today.getTime();
  };

  // Get event count for a day
  const getEventCount = (day: number): number => {
    const dayStart = new Date(year, month, day, 0, 0, 0);
    const dayEnd = new Date(year, month, day, 23, 59, 59);
    
    return events.filter(event => {
      const eventDate = new Date(event.startTime);
      return eventDate >= dayStart && eventDate <= dayEnd;
    }).length;
  };

  // Check if day is busy (3+ events)
  const isBusyDay = (day: number): boolean => {
    return getEventCount(day) >= 3;
  };

  // Generate calendar grid
  const calendarDays: (number | null)[] = [];
  
  // Add empty cells for days before month starts
  for (let i = 0; i < startingDayOfWeek; i++) {
    calendarDays.push(null);
  }
  
  // Add days of month
  for (let day = 1; day <= daysInMonth; day++) {
    calendarDays.push(day);
  }

  const monthNames = [
    'January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December'
  ];

  const dayNames = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

  return (
    <Card className="bg-card text-card-foreground border-border">
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <CardTitle className="text-base font-semibold flex items-center gap-2">
            <CalendarIcon className="h-4 w-4" />
            {title}
          </CardTitle>
          <Button
            variant="ghost"
            size="sm"
            onClick={goToToday}
            className="h-7 text-xs"
          >
            Today
          </Button>
        </div>
      </CardHeader>
      <CardContent className="space-y-3">
        {/* Month Navigation */}
        <div className="flex items-center justify-between">
          <Button
            variant="ghost"
            size="icon"
            onClick={previousMonth}
            className="h-8 w-8"
            aria-label="Previous month"
          >
            <ChevronLeft className="h-4 w-4" />
          </Button>
          <div className="text-sm font-medium">
            {monthNames[month]} {year}
          </div>
          <Button
            variant="ghost"
            size="icon"
            onClick={nextMonth}
            className="h-8 w-8"
            aria-label="Next month"
          >
            <ChevronRight className="h-4 w-4" />
          </Button>
        </div>

        {/* Calendar Grid */}
        <div className="grid grid-cols-7 gap-1">
          {/* Day headers */}
          {dayNames.map(day => (
            <div
              key={day}
              className="text-center text-xs font-medium text-muted-foreground py-1"
            >
              {day}
            </div>
          ))}

          {/* Calendar days */}
          {calendarDays.map((day, index) => {
            if (day === null) {
              return <div key={`empty-${index}`} className="aspect-square" />;
            }

            const today = isToday(day);
            const hasEvent = hasEvents(day);
            const busy = isBusyDay(day);

            return (
              <button
                key={day}
                onClick={() => handleDateClick(day)}
                disabled={loading}
                className={cn(
                  'aspect-square rounded-md text-xs font-medium transition-colors relative',
                  'hover:bg-accent hover:text-accent-foreground',
                  'focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2',
                  'disabled:opacity-50 disabled:cursor-not-allowed',
                  today && 'bg-primary text-primary-foreground hover:bg-primary/90',
                  !today && 'text-foreground',
                  busy && !today && 'bg-muted'
                )}
                aria-label={`${monthNames[month]} ${day}, ${year}${hasEvent ? ', has events' : ''}`}
              >
                {day}
                {hasEvent && (
                  <div className="absolute bottom-0.5 left-1/2 transform -translate-x-1/2 flex gap-0.5">
                    <div className={cn(
                      'h-1 w-1 rounded-full',
                      today ? 'bg-primary-foreground' : 'bg-primary'
                    )} />
                  </div>
                )}
              </button>
            );
          })}
        </div>

        {/* View All Link */}
        <div className="pt-2 border-t border-border">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => router.push('/dashboard/calendar')}
            className="w-full text-xs"
          >
            View Full Calendar
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
