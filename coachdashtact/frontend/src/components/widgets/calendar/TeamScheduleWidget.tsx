'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';

import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { 
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Users, Clock, ChevronLeft, ChevronRight } from 'lucide-react';
import { CalendarApi, UserApi } from '@/lib/api';
import { CalendarEvent } from '@/types/calendar';
import { toast } from '@/hooks/use-toast';
import { useRouter } from 'next/navigation';
import { cn } from '@/lib/utils';
import { 
  format, 
  startOfDay, 
  endOfDay, 
  addDays, 
  startOfWeek, 
  endOfWeek,
  eachDayOfInterval,
  isToday,
} from 'date-fns';

interface User {
  id: string;
  name: string;
  email: string;
  avatarUrl?: string;
}

interface TeamScheduleWidgetProps {
  title?: string;
  defaultUserIds?: string[];
  maxUsers?: number;
}

export function TeamScheduleWidget({
  title = 'Team Schedule',
  defaultUserIds = [],
  maxUsers = 5,
}: TeamScheduleWidgetProps) {
  const router = useRouter();
  const [currentDate, setCurrentDate] = useState(new Date());
  const [events, setEvents] = useState<CalendarEvent[]>([]);
  const [loading, setLoading] = useState(true);

  // Fetch today's team events
  useEffect(() => {
    const fetchEvents = async () => {
      try {
        setLoading(true);
        const startDate = startOfDay(currentDate);
        const endDate = endOfDay(currentDate);
        
        const fetchedEvents = await CalendarApi.getEvents({
          startDate: startDate.toISOString(),
          endDate: endDate.toISOString(),
          statuses: ['SCHEDULED'],
        });
        
        const safeEvents = Array.isArray(fetchedEvents) ? fetchedEvents : [];
        
        // Sort by start time
        const sortedEvents = safeEvents.sort((a, b) => 
          new Date(a.startTime).getTime() - new Date(b.startTime).getTime()
        );
        
        setEvents(sortedEvents);
      } catch (error) {
        console.error('Failed to fetch team events:', error);
        toast.error('Failed to load team schedule');
      } finally {
        setLoading(false);
      }
    };

    fetchEvents();
  }, [currentDate]);

  const navigateDate = (direction: 'prev' | 'next') => {
    setCurrentDate(prev => addDays(prev, direction === 'next' ? 1 : -1));
  };

  const goToToday = () => {
    setCurrentDate(new Date());
  };

  return (
    <Card className="bg-card text-card-foreground border-border">
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <CardTitle className="text-base font-semibold flex items-center gap-2 text-foreground">
            <Users className="h-4 w-4" />
            {title}
          </CardTitle>
          <div className="flex items-center gap-1">
            <Button
              variant="ghost"
              size="icon"
              onClick={() => navigateDate('prev')}
              className="h-7 w-7"
            >
              <ChevronLeft className="h-4 w-4" />
            </Button>
            <Button
              variant="ghost"
              size="sm"
              onClick={goToToday}
              className="h-7 text-xs px-2"
            >
              {isToday(currentDate) ? 'Today' : format(currentDate, 'MMM d')}
            </Button>
            <Button
              variant="ghost"
              size="icon"
              onClick={() => navigateDate('next')}
              className="h-7 w-7"
            >
              <ChevronRight className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        {loading ? (
          <div className="space-y-2">
            {[...Array(3)].map((_, i) => (
              <div key={i} className="animate-pulse flex gap-3 p-3 bg-muted/30 rounded-lg">
                <div className="h-10 w-10 bg-muted rounded-full" />
                <div className="flex-1 space-y-2">
                  <div className="h-4 bg-muted rounded w-3/4" />
                  <div className="h-3 bg-muted rounded w-1/2" />
                </div>
              </div>
            ))}
          </div>
        ) : events.length === 0 ? (
          <div className="text-center py-8 text-muted-foreground">
            <Users className="h-12 w-12 mx-auto mb-3 opacity-50" />
            <p className="text-sm font-medium">No team events {isToday(currentDate) ? 'today' : 'on this day'}</p>
            <p className="text-xs mt-1">Check another date or create an event</p>
          </div>
        ) : (
          <div className="space-y-2">
            {events.map(event => {
              const startTime = new Date(event.startTime);
              const endTime = new Date(event.endTime);
              
              return (
                <button
                  key={event.id}
                  onClick={() => router.push(`/dashboard/calendar?event=${event.id}`)}
                  className={cn(
                    'w-full text-left p-3 rounded-lg border transition-all',
                    'hover:shadow-md hover:scale-[1.01]',
                    'focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2'
                  )}
                  style={{
                    backgroundColor: `${event.category.color}10`,
                    borderLeftWidth: '3px',
                    borderLeftColor: event.category.color,
                    borderColor: `${event.category.color}30`,
                  }}
                >
                  <div className="flex items-start gap-3">
                    {/* Time */}
                    <div className="flex flex-col items-center justify-center min-w-[60px] pt-1">
                      <div className="text-xs font-bold text-foreground">
                        {format(startTime, 'h:mm')}
                      </div>
                      <div className="text-[10px] text-muted-foreground">
                        {format(startTime, 'a')}
                      </div>
                    </div>

                    {/* Event Details */}
                    <div className="flex-1 min-w-0">
                      <div className="font-semibold text-sm text-foreground truncate">
                        {event.title}
                      </div>
                      
                      {/* Organizer */}
                      <div className="flex items-center gap-2 mt-1">
                        <Avatar className="h-5 w-5">
                          <AvatarImage src={event.creator.avatarUrl} />
                          <AvatarFallback className="text-[10px]">
                            {event.creator.name.split(' ').map(n => n[0]).join('').toUpperCase()}
                          </AvatarFallback>
                        </Avatar>
                        <span className="text-xs text-muted-foreground truncate">
                          {event.creator.name}
                        </span>
                      </div>

                      {/* Duration & Attendees */}
                      <div className="flex items-center gap-3 mt-2 text-xs text-muted-foreground">
                        <div className="flex items-center gap-1">
                          <Clock className="h-3 w-3" />
                          <span>
                            {Math.round((endTime.getTime() - startTime.getTime()) / 60000)} min
                          </span>
                        </div>
                        {event.attendees.length > 0 && (
                          <div className="flex items-center gap-1">
                            <Users className="h-3 w-3" />
                            <span>{event.attendees.length} attendee{event.attendees.length !== 1 ? 's' : ''}</span>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                </button>
              );
            })}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
