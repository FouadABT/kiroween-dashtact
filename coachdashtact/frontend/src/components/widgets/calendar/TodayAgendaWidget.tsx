'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Calendar, Clock, MapPin, Plus, Users } from 'lucide-react';
import { CalendarApi } from '@/lib/api';
import { CalendarEvent } from '@/types/calendar';
import { toast } from '@/hooks/use-toast';
import { useRouter } from 'next/navigation';
import { cn } from '@/lib/utils';
import { format, isWithinInterval, startOfDay, endOfDay } from 'date-fns';

interface TodayAgendaWidgetProps {
  title?: string;
}

export function TodayAgendaWidget({
  title = "Today's Agenda",
}: TodayAgendaWidgetProps) {
  const router = useRouter();
  const [events, setEvents] = useState<CalendarEvent[]>([]);
  const [loading, setLoading] = useState(true);
  const [currentTime, setCurrentTime] = useState(new Date());

  // Update current time every minute
  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentTime(new Date());
    }, 60000); // Update every minute

    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    const fetchTodayEvents = async () => {
      try {
        setLoading(true);
        const today = new Date();
        const startDate = startOfDay(today);
        const endDate = endOfDay(today);
        
        const fetchedEvents = await CalendarApi.getEvents({
          startDate: startDate.toISOString(),
          endDate: endDate.toISOString(),
          statuses: ['SCHEDULED'],
        });
        
        console.log('📅 TodayAgenda - Fetched events:', fetchedEvents);
        console.log('📅 TodayAgenda - Events count:', fetchedEvents?.length);
        
        const safeEvents = Array.isArray(fetchedEvents) ? fetchedEvents : [];
        
        // Sort by start time
        const sortedEvents = safeEvents.sort((a, b) => 
          new Date(a.startTime).getTime() - new Date(b.startTime).getTime()
        );
        
        setEvents(sortedEvents);
      } catch (error) {
        console.error('Failed to fetch today events:', error);
        toast.error('Failed to load today\'s events');
      } finally {
        setLoading(false);
      }
    };

    fetchTodayEvents();
  }, []);

  const handleAddEvent = () => {
    router.push('/dashboard/calendar/new');
  };

  const handleEventClick = (eventId: string) => {
    router.push(`/dashboard/calendar?event=${eventId}`);
  };

  // Generate hourly time slots (6 AM to 11 PM)
  const generateTimeSlots = () => {
    const slots: { hour: number; label: string; events: CalendarEvent[] }[] = [];
    
    for (let hour = 6; hour <= 23; hour++) {
      const slotStart = new Date();
      slotStart.setHours(hour, 0, 0, 0);
      const slotEnd = new Date();
      slotEnd.setHours(hour, 59, 59, 999);
      
      const slotEvents = events.filter(event => {
        if (event.allDay) return false; // Handle all-day events separately
        
        const eventStart = new Date(event.startTime);
        const eventEnd = new Date(event.endTime);
        
        // Check if event overlaps with this time slot
        return (
          (eventStart >= slotStart && eventStart <= slotEnd) ||
          (eventEnd >= slotStart && eventEnd <= slotEnd) ||
          (eventStart <= slotStart && eventEnd >= slotEnd)
        );
      });
      
      slots.push({
        hour,
        label: format(slotStart, 'h a'),
        events: slotEvents,
      });
    }
    
    return slots;
  };

  const isCurrentHour = (hour: number): boolean => {
    return currentTime.getHours() === hour;
  };

  const allDayEvents = events.filter(e => e.allDay);
  const timeSlots = generateTimeSlots();

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
          <div className="space-y-2">
            {[...Array(5)].map((_, i) => (
              <div key={i} className="animate-pulse flex gap-3">
                <div className="h-4 w-16 bg-muted rounded" />
                <div className="flex-1 h-12 bg-muted rounded" />
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
          <Button
            variant="ghost"
            size="sm"
            onClick={handleAddEvent}
            className="h-7 text-xs"
          >
            <Plus className="h-3 w-3 mr-1" />
            Add Event
          </Button>
        </div>
        <div className="text-xs text-muted-foreground">
          {format(new Date(), 'EEEE, MMMM d, yyyy')}
        </div>
      </CardHeader>
      <CardContent>
        {events.length === 0 ? (
          <div className="text-center py-8 text-muted-foreground">
            <Calendar className="h-12 w-12 mx-auto mb-3 opacity-50" />
            <p className="text-sm mb-2">No events today</p>
            <Button
              variant="outline"
              size="sm"
              onClick={handleAddEvent}
              className="mt-2"
            >
              <Plus className="h-3 w-3 mr-1" />
              Create Event
            </Button>
          </div>
        ) : (
          <div className="space-y-4">
            {/* All-day events */}
            {allDayEvents.length > 0 && (
              <div className="pb-3 border-b border-border">
                <div className="text-xs font-medium text-muted-foreground mb-2">
                  All Day
                </div>
                <div className="space-y-2">
                  {allDayEvents.map(event => (
                    <button
                      key={event.id}
                      onClick={() => handleEventClick(event.id)}
                      className={cn(
                        'w-full text-left p-2 rounded-md border',
                        'hover:bg-accent transition-colors',
                        'focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2'
                      )}
                      style={{
                        borderColor: event.category.color,
                        backgroundColor: `${event.category.color}10`,
                      }}
                    >
                      <div className="flex items-center gap-2">
                        <div
                          className="w-1 h-8 rounded-full"
                          style={{ backgroundColor: event.category.color }}
                        />
                        <div className="flex-1 min-w-0">
                          <div className="font-medium text-sm truncate">
                            {event.title}
                          </div>
                          {event.location && (
                            <div className="flex items-center gap-1 text-xs text-muted-foreground mt-0.5">
                              <MapPin className="h-3 w-3" />
                              <span className="truncate">{event.location}</span>
                            </div>
                          )}
                        </div>
                      </div>
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Hourly timeline */}
            <div className="space-y-1 max-h-96 overflow-y-auto">
              {timeSlots.map(slot => {
                const isCurrent = isCurrentHour(slot.hour);
                const hasEvents = slot.events.length > 0;
                
                return (
                  <div
                    key={slot.hour}
                    className={cn(
                      'flex gap-3 py-1',
                      isCurrent && 'bg-accent/50 -mx-2 px-2 rounded-md'
                    )}
                  >
                    {/* Time label */}
                    <div className={cn(
                      'text-xs font-medium w-16 flex-shrink-0 pt-1',
                      isCurrent ? 'text-primary' : 'text-muted-foreground'
                    )}>
                      {slot.label}
                      {isCurrent && (
                        <div className="flex items-center gap-1 mt-0.5">
                          <div className="h-1.5 w-1.5 rounded-full bg-primary animate-pulse" />
                          <span className="text-[10px]">Now</span>
                        </div>
                      )}
                    </div>

                    {/* Events in this slot */}
                    <div className="flex-1 min-w-0 space-y-1">
                      {hasEvents ? (
                        slot.events.map(event => {
                          const startTime = new Date(event.startTime);
                          const endTime = new Date(event.endTime);
                          
                          return (
                            <button
                              key={event.id}
                              onClick={() => handleEventClick(event.id)}
                              className={cn(
                                'w-full text-left p-2 rounded-md border',
                                'hover:bg-accent transition-colors',
                                'focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2'
                              )}
                              style={{
                                borderColor: event.category.color,
                                backgroundColor: `${event.category.color}10`,
                              }}
                            >
                              <div className="flex items-start gap-2">
                                <div
                                  className="w-1 h-full rounded-full flex-shrink-0 mt-1"
                                  style={{ backgroundColor: event.category.color }}
                                />
                                <div className="flex-1 min-w-0">
                                  <div className="font-medium text-sm truncate">
                                    {event.title}
                                  </div>
                                  <div className="flex items-center gap-2 text-xs text-muted-foreground mt-0.5">
                                    <div className="flex items-center gap-1">
                                      <Clock className="h-3 w-3" />
                                      <span>
                                        {format(startTime, 'h:mm a')} - {format(endTime, 'h:mm a')}
                                      </span>
                                    </div>
                                    {event.attendees.length > 0 && (
                                      <>
                                        <span>•</span>
                                        <div className="flex items-center gap-1">
                                          <Users className="h-3 w-3" />
                                          <span>{event.attendees.length}</span>
                                        </div>
                                      </>
                                    )}
                                  </div>
                                  {event.location && (
                                    <div className="flex items-center gap-1 text-xs text-muted-foreground mt-0.5">
                                      <MapPin className="h-3 w-3" />
                                      <span className="truncate">{event.location}</span>
                                    </div>
                                  )}
                                </div>
                              </div>
                            </button>
                          );
                        })
                      ) : (
                        <div className="h-8" /> // Empty space for hours without events
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
