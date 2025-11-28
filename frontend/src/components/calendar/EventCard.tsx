'use client';

import React from 'react';
import { CalendarEvent } from '@/types/calendar';
import { cn } from '@/lib/utils';
import { Badge } from '@/components/ui/badge';
import { Card } from '@/components/ui/card';
import { Clock, MapPin, Users, Repeat } from 'lucide-react';

interface EventCardProps {
  event: CalendarEvent;
  onClick?: () => void;
  className?: string;
  compact?: boolean;
}

export function EventCard({
  event,
  onClick,
  className,
  compact = false,
}: EventCardProps) {
  const formatTimeRange = () => {
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

  const formatDate = () => {
    const date = new Date(event.startTime);
    return date.toLocaleDateString('en-US', {
      weekday: 'short',
      month: 'short',
      day: 'numeric',
    });
  };

  return (
    <Card
      className={cn(
        'p-4 cursor-pointer transition-all hover:shadow-md',
        'border-l-4 bg-card',
        className
      )}
      style={{ borderLeftColor: event.color || event.category.color }}
      onClick={onClick}
      role="button"
      tabIndex={0}
      onKeyDown={(e) => {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault();
          onClick?.();
        }
      }}
      aria-label={`Event: ${event.title}`}
    >
      <div className="space-y-2">
        {/* Header */}
        <div className="flex items-start justify-between gap-2">
          <div className="flex-1 min-w-0">
            <h3 className={cn(
              'font-semibold truncate',
              compact ? 'text-sm' : 'text-base'
            )}>
              {event.title}
            </h3>
            {!compact && (
              <p className="text-xs text-muted-foreground mt-1">
                {formatDate()}
              </p>
            )}
          </div>
          <Badge
            variant={
              event.status === 'COMPLETED' ? 'default' :
              event.status === 'CANCELLED' ? 'destructive' :
              'secondary'
            }
            className="flex-shrink-0 text-xs"
          >
            {event.status}
          </Badge>
        </div>

        {/* Time */}
        <div className="flex items-center gap-2 text-sm text-muted-foreground">
          <Clock className="h-4 w-4 flex-shrink-0" />
          <span>{formatTimeRange()}</span>
        </div>

        {/* Location */}
        {event.location && !compact && (
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <MapPin className="h-4 w-4 flex-shrink-0" />
            <span className="truncate">{event.location}</span>
          </div>
        )}

        {/* Attendees */}
        {event.attendees.length > 0 && !compact && (
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <Users className="h-4 w-4 flex-shrink-0" />
            <span>
              {event.attendees.length} attendee{event.attendees.length !== 1 ? 's' : ''}
            </span>
          </div>
        )}

        {/* Footer */}
        <div className="flex items-center gap-2 pt-2">
          <Badge
            variant="outline"
            className="text-xs"
            style={{
              borderColor: event.category.color,
              color: event.category.color,
            }}
          >
            {event.category.name}
          </Badge>
          {event.recurrenceRule && (
            <Badge variant="outline" className="text-xs flex items-center gap-1">
              <Repeat className="h-3 w-3" />
              Recurring
            </Badge>
          )}
        </div>
      </div>
    </Card>
  );
}
