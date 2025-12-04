'use client';

import React, { useMemo } from 'react';
import { CalendarEvent } from '@/types/calendar';
import { cn } from '@/lib/utils';

interface MonthViewProps {
  currentDate: Date;
  events?: CalendarEvent[];
  onDateClick?: (date: Date) => void;
  onEventClick?: (event: CalendarEvent) => void;
  weekStartsOn?: number; // 0 = Sunday, 1 = Monday
}

export function MonthView({
  currentDate,
  events = [],
  onDateClick,
  onEventClick,
  weekStartsOn = 0,
}: MonthViewProps) {
  // Generate calendar grid
  const calendarDays = useMemo(() => {
    const year = currentDate.getFullYear();
    const month = currentDate.getMonth();
    
    // First day of the month
    const firstDay = new Date(year, month, 1);
    const firstDayOfWeek = firstDay.getDay();
    
    // Last day of the month
    const lastDay = new Date(year, month + 1, 0);
    const lastDate = lastDay.getDate();
    
    // Calculate offset based on week start
    const offset = (firstDayOfWeek - weekStartsOn + 7) % 7;
    
    // Previous month days
    const prevMonthLastDay = new Date(year, month, 0).getDate();
    const prevMonthDays = Array.from({ length: offset }, (_, i) => {
      const date = prevMonthLastDay - offset + i + 1;
      return {
        date: new Date(year, month - 1, date),
        isCurrentMonth: false,
        isToday: false,
      };
    });
    
    // Current month days
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    const currentMonthDays = Array.from({ length: lastDate }, (_, i) => {
      const date = new Date(year, month, i + 1);
      date.setHours(0, 0, 0, 0);
      return {
        date,
        isCurrentMonth: true,
        isToday: date.getTime() === today.getTime(),
      };
    });
    
    // Next month days to fill the grid
    const totalDays = prevMonthDays.length + currentMonthDays.length;
    const remainingDays = totalDays % 7 === 0 ? 0 : 7 - (totalDays % 7);
    
    const nextMonthDays = Array.from({ length: remainingDays }, (_, i) => ({
      date: new Date(year, month + 1, i + 1),
      isCurrentMonth: false,
      isToday: false,
    }));
    
    return [...prevMonthDays, ...currentMonthDays, ...nextMonthDays];
  }, [currentDate, weekStartsOn]);

  // Get events for a specific date
  const getEventsForDate = (date: Date) => {
    const dateStr = date.toISOString().split('T')[0];
    return events.filter(event => {
      const eventStart = new Date(event.startTime);
      const eventStartStr = eventStart.toISOString().split('T')[0];
      return eventStartStr === dateStr;
    });
  };

  // Week day headers
  const weekDays = useMemo(() => {
    const days = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
    const rotated = [...days.slice(weekStartsOn), ...days.slice(0, weekStartsOn)];
    return rotated;
  }, [weekStartsOn]);

  const handleDateClick = (date: Date, isCurrentMonth: boolean) => {
    if (isCurrentMonth && onDateClick) {
      onDateClick(date);
    }
  };

  const handleEventClick = (event: CalendarEvent, e: React.MouseEvent) => {
    e.stopPropagation();
    if (onEventClick) {
      onEventClick(event);
    }
  };

  return (
    <div className="flex flex-col h-full bg-background">
      {/* Week day headers */}
      <div className="grid grid-cols-7 border-b border-border bg-muted/30">
        {weekDays.map((day, index) => (
          <div
            key={index}
            className="text-center py-3 text-xs font-semibold text-muted-foreground uppercase tracking-wider border-r border-border last:border-r-0"
          >
            <span className="hidden sm:inline">{day}</span>
            <span className="sm:hidden">{day.charAt(0)}</span>
          </div>
        ))}
      </div>

      {/* Calendar grid */}
      <div className="grid grid-cols-7 flex-1 overflow-auto">
        {calendarDays.map((day, index) => {
          const dayEvents = getEventsForDate(day.date);
          const hasEvents = dayEvents.length > 0;
          const isWeekend = day.date.getDay() === 0 || day.date.getDay() === 6;
          
          return (
            <div
              key={index}
              className={cn(
                'min-h-[100px] sm:min-h-[120px] p-2 sm:p-3 cursor-pointer transition-all duration-200',
                'border-r border-b border-border last:border-r-0',
                'hover:bg-accent/50 focus:outline-none focus:ring-2 focus:ring-primary focus:ring-inset',
                'relative group',
                !day.isCurrentMonth && 'bg-muted/20 text-muted-foreground',
                day.isCurrentMonth && 'bg-background',
                day.isToday && 'bg-primary/5 ring-2 ring-primary ring-inset',
                isWeekend && day.isCurrentMonth && 'bg-muted/10'
              )}
              onClick={() => handleDateClick(day.date, day.isCurrentMonth)}
              onKeyDown={(e) => {
                if (e.key === 'Enter' || e.key === ' ') {
                  e.preventDefault();
                  handleDateClick(day.date, day.isCurrentMonth);
                }
              }}
              tabIndex={day.isCurrentMonth ? 0 : -1}
              role="button"
              aria-label={`${day.date.toLocaleDateString('en-US', { 
                month: 'long', 
                day: 'numeric',
                year: 'numeric' 
              })}${hasEvents ? `, ${dayEvents.length} event${dayEvents.length > 1 ? 's' : ''}` : ''}`}
            >
              {/* Date number */}
              <div className="flex items-center justify-between mb-2">
                <span
                  className={cn(
                    'text-sm font-semibold transition-all',
                    day.isToday 
                      ? 'bg-primary text-primary-foreground rounded-full w-7 h-7 flex items-center justify-center shadow-sm' 
                      : 'text-foreground',
                    !day.isCurrentMonth && 'text-muted-foreground opacity-50',
                    day.isCurrentMonth && !day.isToday && 'group-hover:text-primary'
                  )}
                >
                  {day.date.getDate()}
                </span>
                {hasEvents && (
                  <span className="text-xs text-muted-foreground font-medium">
                    {dayEvents.length}
                  </span>
                )}
              </div>

              {/* Events */}
              <div className="space-y-1">
                {dayEvents.slice(0, 3).map((event) => {
                  const eventColor = event.color || event.category.color;
                  return (
                    <button
                      key={event.id}
                      onClick={(e) => handleEventClick(event, e)}
                      className={cn(
                        'w-full text-left px-2 py-1 rounded-md text-xs font-medium truncate',
                        'transition-all duration-200 border text-foreground',
                        'hover:scale-[1.02] hover:shadow-sm',
                        'focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-1'
                      )}
                      style={{
                        backgroundColor: `${eventColor}20`,
                        borderColor: `${eventColor}40`,
                      }}
                      title={event.title}
                      aria-label={`Event: ${event.title}`}
                    >
                      <div className="flex items-center gap-1.5">
                        <div 
                          className="w-1.5 h-1.5 rounded-full flex-shrink-0"
                          style={{ backgroundColor: eventColor }}
                        />
                        <span className="hidden sm:inline truncate">{event.title}</span>
                        <span className="sm:hidden">•</span>
                      </div>
                    </button>
                  );
                })}
                {dayEvents.length > 3 && (
                  <div className="text-xs text-muted-foreground px-2 py-1 font-medium">
                    +{dayEvents.length - 3} more
                  </div>
                )}
              </div>

              {/* Hover indicator */}
              <div className="absolute inset-0 border-2 border-primary opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none rounded-sm" />
            </div>
          );
        })}
      </div>
    </div>
  );
}
