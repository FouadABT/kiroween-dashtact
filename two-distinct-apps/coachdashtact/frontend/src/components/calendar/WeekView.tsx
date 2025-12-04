'use client';

import React, { useMemo, useState } from 'react';
import { CalendarEvent } from '@/types/calendar';
import { cn } from '@/lib/utils';
import { ScrollArea } from '@/components/ui/scroll-area';
import { toast } from '@/hooks/use-toast';

interface WeekViewProps {
  currentDate: Date;
  events?: CalendarEvent[];
  onEventClick?: (event: CalendarEvent) => void;
  onEventDrop?: (event: CalendarEvent, newStart: Date, newEnd: Date) => void;
  onEventResize?: (event: CalendarEvent, newEnd: Date) => void;
  weekStartsOn?: number;
  workingHoursStart?: string;
  workingHoursEnd?: string;
}

export function WeekView({
  currentDate,
  events = [],
  onEventClick,
  onEventDrop,
  onEventResize,
  weekStartsOn = 0,
  workingHoursStart = '09:00',
  workingHoursEnd = '17:00',
}: WeekViewProps) {
  const [draggedEvent, setDraggedEvent] = useState<CalendarEvent | null>(null);
  const [resizingEvent, setResizingEvent] = useState<CalendarEvent | null>(null);
  const [resizeStartY, setResizeStartY] = useState<number>(0);
  const [resizeStartHeight, setResizeStartHeight] = useState<number>(0);

  // Generate week days
  const weekDays = useMemo(() => {
    const days = [];
    const startOfWeek = new Date(currentDate);
    const day = startOfWeek.getDay();
    const diff = (day - weekStartsOn + 7) % 7;
    startOfWeek.setDate(startOfWeek.getDate() - diff);
    startOfWeek.setHours(0, 0, 0, 0);

    for (let i = 0; i < 7; i++) {
      const date = new Date(startOfWeek);
      date.setDate(startOfWeek.getDate() + i);
      days.push(date);
    }

    return days;
  }, [currentDate, weekStartsOn]);

  // Generate hours (24-hour format)
  const hours = useMemo(() => {
    return Array.from({ length: 24 }, (_, i) => i);
  }, []);

  // Check if hour is in working hours
  const isWorkingHour = (hour: number) => {
    const workStart = parseInt(workingHoursStart.split(':')[0]);
    const workEnd = parseInt(workingHoursEnd.split(':')[0]);
    return hour >= workStart && hour < workEnd;
  };

  // Get events for a specific day
  const getEventsForDay = (date: Date) => {
    const dateStr = date.toISOString().split('T')[0];
    return events.filter(event => {
      const eventStart = new Date(event.startTime);
      const eventStartStr = eventStart.toISOString().split('T')[0];
      return eventStartStr === dateStr;
    });
  };

  // Calculate event position and height
  const getEventStyle = (event: CalendarEvent) => {
    const start = new Date(event.startTime);
    const end = new Date(event.endTime);
    
    const startHour = start.getHours();
    const startMinute = start.getMinutes();
    const endHour = end.getHours();
    const endMinute = end.getMinutes();
    
    const top = (startHour + startMinute / 60) * 60; // 60px per hour
    const height = ((endHour + endMinute / 60) - (startHour + startMinute / 60)) * 60;
    
    return { top, height };
  };

  const handleEventClick = (event: CalendarEvent, e: React.MouseEvent) => {
    e.stopPropagation();
    if (onEventClick) {
      onEventClick(event);
    }
  };

  const handleDragStart = (event: CalendarEvent, e: React.DragEvent) => {
    setDraggedEvent(event);
    e.dataTransfer.effectAllowed = 'move';
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'move';
  };

  const handleDrop = async (date: Date, hour: number, e: React.DragEvent) => {
    e.preventDefault();
    if (draggedEvent && onEventDrop) {
      try {
        const start = new Date(draggedEvent.startTime);
        const end = new Date(draggedEvent.endTime);
        const duration = end.getTime() - start.getTime();
        
        const newStart = new Date(date);
        newStart.setHours(hour, 0, 0, 0);
        
        const newEnd = new Date(newStart.getTime() + duration);
        
        await onEventDrop(draggedEvent, newStart, newEnd);
        toast.success('Event rescheduled successfully');
      } catch (error) {
        toast.error(error instanceof Error ? error.message : 'Failed to reschedule event');
      }
    }
    setDraggedEvent(null);
  };

  const handleResizeStart = (event: CalendarEvent, e: React.MouseEvent | React.TouchEvent) => {
    e.stopPropagation();
    setResizingEvent(event);
    
    const clientY = 'touches' in e ? e.touches[0].clientY : e.clientY;
    setResizeStartY(clientY);
    
    const { height } = getEventStyle(event);
    setResizeStartHeight(height);

    const handleResizeMove = (moveEvent: MouseEvent | TouchEvent) => {
      const currentY = 'touches' in moveEvent ? moveEvent.touches[0].clientY : moveEvent.clientY;
      const deltaY = currentY - clientY;
      const newHeight = Math.max(30, resizeStartHeight + deltaY);
      
      // Update event element height temporarily
      const eventElement = document.querySelector(`[data-event-id="${event.id}"]`) as HTMLElement;
      if (eventElement) {
        eventElement.style.height = `${newHeight}px`;
      }
    };

    const handleResizeEnd = async (endEvent: MouseEvent | TouchEvent) => {
      const currentY = 'touches' in endEvent ? endEvent.changedTouches[0].clientY : endEvent.clientY;
      const deltaY = currentY - clientY;
      const newHeight = Math.max(30, resizeStartHeight + deltaY);
      
      // Calculate new end time based on height change
      const minutesChange = Math.round((newHeight - resizeStartHeight) / 60 * 60); // 60px per hour
      const newEnd = new Date(new Date(event.endTime).getTime() + minutesChange * 60000);
      
      if (onEventResize && newEnd > new Date(event.startTime)) {
        try {
          await onEventResize(event, newEnd);
          toast.success('Event duration updated successfully');
        } catch (error) {
          toast.error(error instanceof Error ? error.message : 'Failed to update event duration');
        }
      }
      
      setResizingEvent(null);
      document.removeEventListener('mousemove', handleResizeMove);
      document.removeEventListener('mouseup', handleResizeEnd);
      document.removeEventListener('touchmove', handleResizeMove);
      document.removeEventListener('touchend', handleResizeEnd);
    };

    document.addEventListener('mousemove', handleResizeMove);
    document.addEventListener('mouseup', handleResizeEnd);
    document.addEventListener('touchmove', handleResizeMove);
    document.addEventListener('touchend', handleResizeEnd);
  };

  const today = new Date();
  today.setHours(0, 0, 0, 0);

  return (
    <div className="flex flex-col h-full bg-background">
      {/* Day headers */}
      <div className="grid grid-cols-8 border-b-2 border-border sticky top-0 z-10 bg-background shadow-sm">
        <div className="bg-muted/30 p-3 text-xs font-semibold text-muted-foreground uppercase tracking-wide border-r border-border">
          Time
        </div>
        {weekDays.map((day, index) => {
          const isToday = day.getTime() === today.getTime();
          const isWeekend = day.getDay() === 0 || day.getDay() === 6;
          return (
            <div
              key={index}
              className={cn(
                'p-3 text-center border-r border-border last:border-r-0 transition-colors',
                isToday && 'bg-primary/10',
                !isToday && isWeekend && 'bg-muted/20',
                !isToday && !isWeekend && 'bg-background'
              )}
            >
              <div className="text-xs font-medium text-muted-foreground uppercase tracking-wide">
                {day.toLocaleDateString('en-US', { weekday: 'short' })}
              </div>
              <div
                className={cn(
                  'text-xl font-bold mt-1',
                  isToday ? 'text-primary' : 'text-foreground'
                )}
              >
                {day.getDate()}
              </div>
            </div>
          );
        })}
      </div>

      {/* Time grid */}
      <ScrollArea className="flex-1">
        <div className="relative">
          <div className="grid grid-cols-8">
            {/* Time labels */}
            <div className="bg-muted/20 border-r border-border">
              {hours.map((hour) => (
                <div
                  key={hour}
                  className="h-[60px] border-b border-border px-3 py-2 text-xs font-medium text-muted-foreground"
                >
                  {hour.toString().padStart(2, '0')}:00
                </div>
              ))}
            </div>

            {/* Day columns */}
            {weekDays.map((day, dayIndex) => {
              const dayEvents = getEventsForDay(day);
              const isToday = day.getTime() === today.getTime();
              const isWeekend = day.getDay() === 0 || day.getDay() === 6;
              
              return (
                <div key={dayIndex} className={cn(
                  "relative border-r border-border last:border-r-0",
                  isToday && "bg-primary/5"
                )}>
                  {/* Hour slots */}
                  {hours.map((hour) => (
                    <div
                      key={hour}
                      className={cn(
                        'h-[60px] border-b border-border transition-colors',
                        isWorkingHour(hour) ? 'bg-background' : 'bg-muted/20',
                        isWeekend && 'bg-muted/10',
                        'hover:bg-accent/50 cursor-pointer'
                      )}
                      onDragOver={handleDragOver}
                      onDrop={(e) => handleDrop(day, hour, e)}
                      aria-label={`${day.toLocaleDateString('en-US', { weekday: 'long' })} ${hour}:00`}
                    />
                  ))}

                  {/* Events */}
                  {dayEvents.map((event) => {
                    const { top, height } = getEventStyle(event);
                    const eventColor = event.color || event.category.color;
                    return (
                      <div
                        key={event.id}
                        data-event-id={event.id}
                        className="absolute left-1 right-1 group"
                        style={{
                          top: `${top}px`,
                          height: `${Math.max(height, 30)}px`,
                        }}
                      >
                        <button
                          draggable
                          onDragStart={(e) => handleDragStart(event, e)}
                          onClick={(e) => handleEventClick(event, e)}
                          className={cn(
                            'w-full h-full rounded-md px-2 py-1.5 text-xs font-medium text-foreground',
                            'overflow-hidden cursor-move transition-all duration-200',
                            'hover:scale-[1.02] hover:shadow-md',
                            'focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-1',
                            'flex flex-col border-l-2 shadow-sm'
                          )}
                          style={{
                            backgroundColor: `${eventColor}20`,
                            borderLeftColor: eventColor,
                          }}
                          title={`${event.title}\n${new Date(event.startTime).toLocaleTimeString('en-US', { 
                            hour: '2-digit', 
                            minute: '2-digit' 
                          })} - ${new Date(event.endTime).toLocaleTimeString('en-US', { 
                            hour: '2-digit', 
                            minute: '2-digit' 
                          })}`}
                          aria-label={`Event: ${event.title} from ${new Date(event.startTime).toLocaleTimeString()} to ${new Date(event.endTime).toLocaleTimeString()}`}
                        >
                          <div className="font-semibold truncate flex items-center gap-1">
                            <div 
                              className="w-1.5 h-1.5 rounded-full flex-shrink-0"
                              style={{ backgroundColor: eventColor }}
                            />
                            {event.title}
                          </div>
                          {height > 40 && (
                            <div className="text-[10px] text-muted-foreground mt-0.5">
                              {new Date(event.startTime).toLocaleTimeString('en-US', { 
                                hour: '2-digit', 
                                minute: '2-digit' 
                              })}
                            </div>
                          )}
                        </button>
                        {/* Resize handle */}
                        <div
                          className={cn(
                            'absolute bottom-0 left-0 right-0 h-2 cursor-ns-resize',
                            'opacity-0 group-hover:opacity-100 transition-opacity',
                            'flex items-center justify-center'
                          )}
                          onMouseDown={(e) => handleResizeStart(event, e)}
                          onTouchStart={(e) => handleResizeStart(event, e as any)}
                        >
                          <div className="w-8 h-1 bg-white/50 rounded-full" />
                        </div>
                      </div>
                    );
                  })}
                </div>
              );
            })}
          </div>
        </div>
      </ScrollArea>
    </div>
  );
}
