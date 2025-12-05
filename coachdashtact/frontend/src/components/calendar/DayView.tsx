'use client';

import React, { useMemo, useState } from 'react';
import { CalendarEvent } from '@/types/calendar';
import { cn } from '@/lib/utils';
import { ScrollArea } from '@/components/ui/scroll-area';
import { toast } from '@/hooks/use-toast';

interface DayViewProps {
  currentDate: Date;
  events?: CalendarEvent[];
  onEventClick?: (event: CalendarEvent) => void;
  onEventDrop?: (event: CalendarEvent, newStart: Date, newEnd: Date) => void;
  onEventResize?: (event: CalendarEvent, newEnd: Date) => void;
  onTimeSlotClick?: (date: Date) => void;
  workingHoursStart?: string;
  workingHoursEnd?: string;
}

export function DayView({
  currentDate,
  events = [],
  onEventClick,
  onEventDrop,
  onEventResize,
  onTimeSlotClick,
  workingHoursStart = '09:00',
  workingHoursEnd = '17:00',
}: DayViewProps) {
  const [draggedEvent, setDraggedEvent] = useState<CalendarEvent | null>(null);
  const [resizingEvent, setResizingEvent] = useState<CalendarEvent | null>(null);
  const [resizeStartY, setResizeStartY] = useState<number>(0);
  const [resizeStartHeight, setResizeStartHeight] = useState<number>(0);

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

  // Get events for the current day
  const dayEvents = useMemo(() => {
    const dateStr = currentDate.toISOString().split('T')[0];
    return events.filter(event => {
      const eventStart = new Date(event.startTime);
      const eventStartStr = eventStart.toISOString().split('T')[0];
      return eventStartStr === dateStr;
    }).sort((a, b) => 
      new Date(a.startTime).getTime() - new Date(b.startTime).getTime()
    );
  }, [currentDate, events]);

  // Calculate event position and height
  const getEventStyle = (event: CalendarEvent) => {
    const start = new Date(event.startTime);
    const end = new Date(event.endTime);
    
    const startHour = start.getHours();
    const startMinute = start.getMinutes();
    const endHour = end.getHours();
    const endMinute = end.getMinutes();
    
    const top = (startHour + startMinute / 60) * 80; // 80px per hour
    const height = ((endHour + endMinute / 60) - (startHour + startMinute / 60)) * 80;
    
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

  const handleDrop = async (hour: number, e: React.DragEvent) => {
    e.preventDefault();
    if (draggedEvent && onEventDrop) {
      try {
        const start = new Date(draggedEvent.startTime);
        const end = new Date(draggedEvent.endTime);
        const duration = end.getTime() - start.getTime();
        
        const newStart = new Date(currentDate);
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

  const handleTimeSlotClick = (hour: number) => {
    if (onTimeSlotClick) {
      const date = new Date(currentDate);
      date.setHours(hour, 0, 0, 0);
      onTimeSlotClick(date);
    }
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
      const newHeight = Math.max(40, resizeStartHeight + deltaY);
      
      // Update event element height temporarily
      const eventElement = document.querySelector(`[data-event-id="${event.id}"]`) as HTMLElement;
      if (eventElement) {
        eventElement.style.height = `${newHeight}px`;
      }
    };

    const handleResizeEnd = async (endEvent: MouseEvent | TouchEvent) => {
      const currentY = 'touches' in endEvent ? endEvent.changedTouches[0].clientY : endEvent.clientY;
      const deltaY = currentY - clientY;
      const newHeight = Math.max(40, resizeStartHeight + deltaY);
      
      // Calculate new end time based on height change (80px per hour)
      const minutesChange = Math.round((newHeight - resizeStartHeight) / 80 * 60);
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

  // Current time indicator
  const currentTimePosition = useMemo(() => {
    const now = new Date();
    const today = new Date(currentDate);
    today.setHours(0, 0, 0, 0);
    const nowDay = new Date(now);
    nowDay.setHours(0, 0, 0, 0);
    
    if (today.getTime() !== nowDay.getTime()) {
      return null;
    }
    
    const hours = now.getHours();
    const minutes = now.getMinutes();
    return (hours + minutes / 60) * 80; // 80px per hour
  }, [currentDate]);

  return (
    <div className="flex flex-col h-full">
      {/* Day header */}
      <div className="bg-card border-b border-border p-4 sticky top-0 z-10">
        <div className="text-center">
          <div className="text-sm text-muted-foreground">
            {currentDate.toLocaleDateString('en-US', { weekday: 'long' })}
          </div>
          <div className="text-2xl font-bold">
            {currentDate.toLocaleDateString('en-US', { 
              month: 'long', 
              day: 'numeric',
              year: 'numeric' 
            })}
          </div>
          {dayEvents.length > 0 && (
            <div className="text-sm text-muted-foreground mt-1">
              {dayEvents.length} event{dayEvents.length !== 1 ? 's' : ''}
            </div>
          )}
        </div>
      </div>

      {/* Time grid */}
      <ScrollArea className="flex-1">
        <div className="relative">
          <div className="flex">
            {/* Time labels */}
            <div className="w-20 flex-shrink-0 bg-card border-r border-border">
              {hours.map((hour) => (
                <div
                  key={hour}
                  className="h-[80px] border-b border-border px-2 py-1 text-sm text-muted-foreground text-right"
                >
                  {hour === 0 ? '12 AM' : hour < 12 ? `${hour} AM` : hour === 12 ? '12 PM' : `${hour - 12} PM`}
                </div>
              ))}
            </div>

            {/* Day column */}
            <div className="flex-1 relative bg-card">
              {/* Hour slots */}
              {hours.map((hour) => (
                <div
                  key={hour}
                  className={cn(
                    'h-[80px] border-b border-border transition-colors',
                    isWorkingHour(hour) ? 'bg-card' : 'bg-muted/30',
                    'hover:bg-accent cursor-pointer'
                  )}
                  onDragOver={handleDragOver}
                  onDrop={(e) => handleDrop(hour, e)}
                  onClick={() => handleTimeSlotClick(hour)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter' || e.key === ' ') {
                      e.preventDefault();
                      handleTimeSlotClick(hour);
                    }
                  }}
                  tabIndex={0}
                  role="button"
                  aria-label={`${hour}:00 time slot`}
                />
              ))}

              {/* Current time indicator */}
              {currentTimePosition !== null && (
                <div
                  className="absolute left-0 right-0 h-0.5 bg-primary z-20 pointer-events-none"
                  style={{ top: `${currentTimePosition}px` }}
                  aria-hidden="true"
                >
                  <div className="absolute -left-2 -top-2 w-4 h-4 bg-primary rounded-full" />
                </div>
              )}

              {/* Events */}
              {dayEvents.map((event) => {
                const { top, height } = getEventStyle(event);
                return (
                  <div
                    key={event.id}
                    data-event-id={event.id}
                    className="absolute left-2 right-2 group"
                    style={{
                      top: `${top}px`,
                      height: `${Math.max(height, 40)}px`,
                      zIndex: 10,
                    }}
                  >
                    <button
                      draggable
                      onDragStart={(e) => handleDragStart(event, e)}
                      onClick={(e) => handleEventClick(event, e)}
                      className={cn(
                        'w-full h-full rounded-lg px-3 py-2 text-sm font-medium text-foreground',
                        'overflow-hidden cursor-move transition-all border-l-4',
                        'hover:shadow-lg hover:scale-[1.02] focus:outline-none focus:ring-2 focus:ring-primary',
                        'flex flex-col'
                      )}
                      style={{
                        backgroundColor: `${event.color || event.category.color}20`,
                        borderLeftColor: event.color || event.category.color,
                      }}
                      title={event.title}
                      aria-label={`Event: ${event.title} from ${new Date(event.startTime).toLocaleTimeString()} to ${new Date(event.endTime).toLocaleTimeString()}`}
                    >
                      <div className="font-semibold truncate flex items-center gap-1.5">
                        <div 
                          className="w-2 h-2 rounded-full flex-shrink-0"
                          style={{ backgroundColor: event.color || event.category.color }}
                        />
                        {event.title}
                      </div>
                      <div className="text-xs text-muted-foreground mt-1">
                        {new Date(event.startTime).toLocaleTimeString('en-US', { 
                          hour: '2-digit', 
                          minute: '2-digit' 
                        })} - {new Date(event.endTime).toLocaleTimeString('en-US', { 
                          hour: '2-digit', 
                          minute: '2-digit' 
                        })}
                      </div>
                      {height > 60 && event.location && (
                        <div className="text-xs text-muted-foreground mt-1 truncate">
                          📍 {event.location}
                        </div>
                      )}
                    </button>
                    {/* Resize handle */}
                    <div
                      className={cn(
                        'absolute bottom-0 left-0 right-0 h-3 cursor-ns-resize',
                        'opacity-0 group-hover:opacity-100 transition-opacity',
                        'flex items-center justify-center'
                      )}
                      onMouseDown={(e) => handleResizeStart(event, e)}
                      onTouchStart={(e) => handleResizeStart(event, e as any)}
                    >
                      <div className="w-12 h-1 bg-white/50 rounded-full" />
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </ScrollArea>
    </div>
  );
}
