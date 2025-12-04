'use client';

import React, { useMemo, useState, useEffect } from 'react';
import { CalendarEvent } from '@/types/calendar';
import { cn } from '@/lib/utils';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import { Badge } from '@/components/ui/badge';
import { Calendar, Clock, MapPin, Users, Loader2 } from 'lucide-react';

interface AgendaViewProps {
  currentDate: Date;
  events?: CalendarEvent[];
  onEventClick?: (event: CalendarEvent) => void;
  onLoadMore?: () => void;
  hasMore?: boolean;
  isLoading?: boolean;
}

export function AgendaView({
  currentDate,
  events = [],
  onEventClick,
  onLoadMore,
  hasMore = false,
  isLoading = false,
}: AgendaViewProps) {
  const [visibleEvents, setVisibleEvents] = useState(20);

  // Group events by date
  const groupedEvents = useMemo(() => {
    const groups = new Map<string, CalendarEvent[]>();
    
    // Sort events by start time
    const sortedEvents = [...events].sort((a, b) => 
      new Date(a.startTime).getTime() - new Date(b.startTime).getTime()
    );

    sortedEvents.forEach(event => {
      const date = new Date(event.startTime);
      const dateKey = date.toISOString().split('T')[0];
      
      if (!groups.has(dateKey)) {
        groups.set(dateKey, []);
      }
      groups.get(dateKey)!.push(event);
    });

    return Array.from(groups.entries()).map(([dateKey, events]) => ({
      date: new Date(dateKey),
      events,
    }));
  }, [events]);

  const handleEventClick = (event: CalendarEvent) => {
    if (onEventClick) {
      onEventClick(event);
    }
  };

  const handleLoadMore = () => {
    if (onLoadMore) {
      onLoadMore();
    } else {
      setVisibleEvents(prev => prev + 20);
    }
  };

  // Check if date is today
  const isToday = (date: Date) => {
    const today = new Date();
    return date.toDateString() === today.toDateString();
  };

  // Check if date is in the past
  const isPast = (date: Date) => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const compareDate = new Date(date);
    compareDate.setHours(0, 0, 0, 0);
    return compareDate < today;
  };

  // Format date for display
  const formatDate = (date: Date) => {
    if (isToday(date)) {
      return 'Today';
    }
    
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    if (date.toDateString() === tomorrow.toDateString()) {
      return 'Tomorrow';
    }

    const yesterday = new Date();
    yesterday.setDate(yesterday.getDate() - 1);
    if (date.toDateString() === yesterday.toDateString()) {
      return 'Yesterday';
    }

    return date.toLocaleDateString('en-US', { 
      weekday: 'long',
      month: 'long',
      day: 'numeric',
      year: date.getFullYear() !== new Date().getFullYear() ? 'numeric' : undefined,
    });
  };

  // Format time range
  const formatTimeRange = (event: CalendarEvent) => {
    if (event.allDay) {
      return 'All day';
    }

    const start = new Date(event.startTime);
    const end = new Date(event.endTime);

    return `${start.toLocaleTimeString('en-US', { 
      hour: 'numeric',
      minute: '2-digit',
    })} - ${end.toLocaleTimeString('en-US', { 
      hour: 'numeric',
      minute: '2-digit',
    })}`;
  };

  const visibleGroups = onLoadMore ? groupedEvents : groupedEvents.slice(0, Math.ceil(visibleEvents / 5));
  const showLoadMore = onLoadMore ? hasMore : visibleGroups.length < groupedEvents.length;

  return (
    <div className="flex flex-col h-full">
      <ScrollArea className="flex-1">
        <div className="p-4 space-y-6">
          {groupedEvents.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-12 text-center">
              <Calendar className="h-12 w-12 text-muted-foreground mb-4" />
              <h3 className="text-lg font-semibold mb-2">No events scheduled</h3>
              <p className="text-sm text-muted-foreground">
                Your calendar is clear. Time to plan something!
              </p>
            </div>
          ) : (
            visibleGroups.map(({ date, events: dayEvents }) => (
              <div key={date.toISOString()} className="space-y-3">
                {/* Date header */}
                <div className="sticky top-0 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 z-10 pb-2">
                  <div className="flex items-center gap-3">
                    <div>
                      <h3 className={cn(
                        'text-lg font-semibold',
                        isToday(date) && 'text-primary'
                      )}>
                        {formatDate(date)}
                      </h3>
                      <p className="text-sm text-muted-foreground">
                        {date.toLocaleDateString('en-US', { 
                          month: 'long',
                          day: 'numeric',
                          year: 'numeric',
                        })}
                      </p>
                    </div>
                    <Badge variant={isToday(date) ? 'default' : 'secondary'}>
                      {dayEvents.length} event{dayEvents.length !== 1 ? 's' : ''}
                    </Badge>
                  </div>
                  <Separator className="mt-2" />
                </div>

                {/* Events list */}
                <div className="space-y-2">
                  {dayEvents.map((event) => (
                    <button
                      key={event.id}
                      onClick={() => handleEventClick(event)}
                      className={cn(
                        'w-full text-left p-4 rounded-lg border transition-all',
                        'hover:shadow-md hover:scale-[1.01] focus:outline-none focus:ring-2 focus:ring-primary',
                        'bg-card border-border',
                        isPast(date) && event.status !== 'COMPLETED' && 'opacity-60'
                      )}
                      aria-label={`Event: ${event.title}`}
                    >
                      <div className="flex items-start gap-3">
                        {/* Color indicator */}
                        <div
                          className="w-1 h-full rounded-full flex-shrink-0 mt-1"
                          style={{ backgroundColor: event.color || event.category.color }}
                          aria-hidden="true"
                        />

                        {/* Event details */}
                        <div className="flex-1 min-w-0 space-y-2">
                          {/* Title and status */}
                          <div className="flex items-start justify-between gap-2">
                            <h4 className="font-semibold text-base truncate">
                              {event.title}
                            </h4>
                            <Badge 
                              variant={
                                event.status === 'COMPLETED' ? 'default' :
                                event.status === 'CANCELLED' ? 'destructive' :
                                'secondary'
                              }
                              className="flex-shrink-0"
                            >
                              {event.status}
                            </Badge>
                          </div>

                          {/* Time */}
                          <div className="flex items-center gap-2 text-sm text-muted-foreground">
                            <Clock className="h-4 w-4 flex-shrink-0" />
                            <span>{formatTimeRange(event)}</span>
                          </div>

                          {/* Location */}
                          {event.location && (
                            <div className="flex items-center gap-2 text-sm text-muted-foreground">
                              <MapPin className="h-4 w-4 flex-shrink-0" />
                              <span className="truncate">{event.location}</span>
                            </div>
                          )}

                          {/* Attendees */}
                          {event.attendees.length > 0 && (
                            <div className="flex items-center gap-2 text-sm text-muted-foreground">
                              <Users className="h-4 w-4 flex-shrink-0" />
                              <span>
                                {event.attendees.length} attendee{event.attendees.length !== 1 ? 's' : ''}
                              </span>
                            </div>
                          )}

                          {/* Description preview */}
                          {event.description && (
                            <p className="text-sm text-muted-foreground line-clamp-2">
                              {event.description}
                            </p>
                          )}

                          {/* Category */}
                          <div className="flex items-center gap-2">
                            <Badge 
                              variant="secondary"
                              className="text-xs"
                            >
                              <div 
                                className="w-2 h-2 rounded-full mr-1.5"
                                style={{ backgroundColor: event.category.color }}
                              />
                              {event.category.name}
                            </Badge>
                            {event.recurrenceRule && (
                              <Badge variant="outline" className="text-xs">
                                Recurring
                              </Badge>
                            )}
                          </div>
                        </div>
                      </div>
                    </button>
                  ))}
                </div>
              </div>
            ))
          )}

          {/* Load more button */}
          {showLoadMore && (
            <div className="flex justify-center pt-4">
              <Button
                variant="outline"
                onClick={handleLoadMore}
                disabled={isLoading}
                aria-label="Load more events"
              >
                {isLoading ? (
                  <>
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    Loading...
                  </>
                ) : (
                  'Load more events'
                )}
              </Button>
            </div>
          )}
        </div>
      </ScrollArea>
    </div>
  );
}
