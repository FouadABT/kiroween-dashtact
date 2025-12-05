'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Calendar, Clock, MapPin, ExternalLink } from 'lucide-react';
import { CalendarApi } from '@/lib/api';
import { CalendarEvent } from '@/types/calendar';
import { toast } from '@/hooks/use-toast';
import { useRouter } from 'next/navigation';
import { cn } from '@/lib/utils';
import { format, formatDistanceToNow, isToday, isTomorrow, isPast } from 'date-fns';

interface UpcomingEventsWidgetProps {
  title?: string;
  limit?: number;
  showOnlyMyEvents?: boolean;
}

export function UpcomingEventsWidget({
  title = 'Upcoming Events',
  limit = 10,
  showOnlyMyEvents = false,
}: UpcomingEventsWidgetProps) {
  const router = useRouter();
  const [events, setEvents] = useState<CalendarEvent[]>([]);
  const [loading, setLoading] = useState(true);
  const [filterMyEvents, setFilterMyEvents] = useState(showOnlyMyEvents);

  useEffect(() => {
    const fetchEvents = async () => {
      try {
        setLoading(true);
        const now = new Date();
        const futureDate = new Date();
        futureDate.setDate(futureDate.getDate() + 30); // Next 30 days
        
        console.log('📅 UpcomingEvents - Fetching from:', now.toISOString(), 'to:', futureDate.toISOString());
        
        const fetchedEvents = await CalendarApi.getEvents({
          startDate: now.toISOString(),
          endDate: futureDate.toISOString(),
        });
        
        console.log('📅 UpcomingEvents - Raw response:', fetchedEvents);
        console.log('📅 UpcomingEvents - Events count:', fetchedEvents?.length);
        
        const safeEvents = Array.isArray(fetchedEvents) ? fetchedEvents : [];
        
        // Filter only future events and sort by start time
        const upcomingEvents = safeEvents
          .filter(event => new Date(event.startTime) >= now)
          .sort((a, b) => new Date(a.startTime).getTime() - new Date(b.startTime).getTime())
          .slice(0, limit);
        
        console.log('📅 UpcomingEvents - Filtered upcoming:', upcomingEvents.length);
        setEvents(upcomingEvents);
      } catch (error) {
        console.error('Failed to fetch upcoming events:', error);
        toast.error('Failed to load upcoming events');
      } finally {
        setLoading(false);
      }
    };

    fetchEvents();
  }, [limit, filterMyEvents]);

  const formatEventTime = (event: CalendarEvent): string => {
    const startDate = new Date(event.startTime);
    
    if (event.allDay) {
      if (isToday(startDate)) {
        return 'Today (All day)';
      } else if (isTomorrow(startDate)) {
        return 'Tomorrow (All day)';
      } else {
        return `${format(startDate, 'MMM d')} (All day)`;
      }
    }
    
    if (isToday(startDate)) {
      return `Today at ${format(startDate, 'h:mm a')}`;
    } else if (isTomorrow(startDate)) {
      return `Tomorrow at ${format(startDate, 'h:mm a')}`;
    } else {
      return format(startDate, 'MMM d, h:mm a');
    }
  };

  const getTimeUntil = (event: CalendarEvent): string => {
    const startDate = new Date(event.startTime);
    return formatDistanceToNow(startDate, { addSuffix: true });
  };

  const handleEventClick = (eventId: string) => {
    router.push(`/dashboard/calendar?event=${eventId}`);
  };

  const handleViewAll = () => {
    router.push('/dashboard/calendar');
  };

  if (loading) {
    return (
      <Card className="bg-card text-card-foreground border-border">
        <CardHeader>
          <CardTitle className="text-base font-semibold flex items-center gap-2">
            <Calendar className="h-4 w-4" />
            {title}
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {[...Array(3)].map((_, i) => (
              <div key={i} className="animate-pulse">
                <div className="h-4 bg-muted rounded w-3/4 mb-2" />
                <div className="h-3 bg-muted rounded w-1/2" />
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="bg-card text-card-foreground border-border">
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <CardTitle className="text-base font-semibold flex items-center gap-2">
            <Calendar className="h-4 w-4" />
            {title}
          </CardTitle>
          {showOnlyMyEvents && (
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setFilterMyEvents(!filterMyEvents)}
              className="h-7 text-xs"
            >
              {filterMyEvents ? 'All Events' : 'My Events'}
            </Button>
          )}
        </div>
      </CardHeader>
      <CardContent>
        {events.length === 0 ? (
          <div className="text-center py-8 text-muted-foreground">
            <Calendar className="h-12 w-12 mx-auto mb-3 opacity-50" />
            <p className="text-sm">No upcoming events</p>
            <Button
              variant="link"
              size="sm"
              onClick={() => router.push('/dashboard/calendar/new')}
              className="mt-2"
            >
              Create an event
            </Button>
          </div>
        ) : (
          <div className="space-y-3">
            {events.map((event) => {
              const startDate = new Date(event.startTime);
              const past = isPast(startDate);
              
              return (
                <button
                  key={event.id}
                  onClick={() => handleEventClick(event.id)}
                  className={cn(
                    'w-full text-left p-3 rounded-lg border border-border',
                    'hover:bg-accent hover:border-accent-foreground/20 transition-colors',
                    'focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2',
                    past && 'opacity-60'
                  )}
                >
                  <div className="flex items-start gap-3">
                    {/* Category color indicator */}
                    <div
                      className="w-1 h-full rounded-full flex-shrink-0 mt-1"
                      style={{ backgroundColor: event.category.color }}
                    />
                    
                    <div className="flex-1 min-w-0 space-y-1">
                      {/* Event title */}
                      <div className="font-medium text-sm truncate">
                        {event.title}
                      </div>
                      
                      {/* Event time */}
                      <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
                        <Clock className="h-3 w-3 flex-shrink-0" />
                        <span>{formatEventTime(event)}</span>
                        <span className="text-xs">•</span>
                        <span className="text-xs">{getTimeUntil(event)}</span>
                      </div>
                      
                      {/* Location if present */}
                      {event.location && (
                        <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
                          <MapPin className="h-3 w-3 flex-shrink-0" />
                          <span className="truncate">{event.location}</span>
                        </div>
                      )}
                      
                      {/* Category badge */}
                      <div className="flex items-center gap-2 pt-1">
                        <Badge
                          variant="secondary"
                          className="text-xs"
                          style={{
                            backgroundColor: `${event.category.color}20`,
                            color: event.category.color,
                            borderColor: event.category.color,
                          }}
                        >
                          {event.category.name}
                        </Badge>
                        
                        {event.attendees.length > 0 && (
                          <span className="text-xs text-muted-foreground">
                            {event.attendees.length} attendee{event.attendees.length !== 1 ? 's' : ''}
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                </button>
              );
            })}
          </div>
        )}
        
        {/* View All Link */}
        {events.length > 0 && (
          <div className="pt-3 mt-3 border-t border-border">
            <Button
              variant="ghost"
              size="sm"
              onClick={handleViewAll}
              className="w-full text-xs flex items-center justify-center gap-1"
            >
              View All Events
              <ExternalLink className="h-3 w-3" />
            </Button>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
