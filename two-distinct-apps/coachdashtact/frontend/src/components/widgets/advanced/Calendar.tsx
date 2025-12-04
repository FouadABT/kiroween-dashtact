'use client';

import React, { useState } from 'react';
import { DayPicker } from 'react-day-picker';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import { PermissionGuard } from '@/components/auth/PermissionGuard';
import { CalendarEvent, BaseWidgetProps } from '../types/widget.types';
import { format, isSameDay } from 'date-fns';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import 'react-day-picker/dist/style.css';

type CalendarView = 'month' | 'week' | 'day';

interface CalendarProps extends BaseWidgetProps {
  events: CalendarEvent[];
  onEventClick?: (event: CalendarEvent) => void;
  onDateClick?: (date: Date) => void;
  defaultView?: CalendarView;
  title?: string;
}

export function Calendar({
  events,
  onEventClick,
  onDateClick,
  defaultView = 'month',
  title = 'Calendar',
  permission,
  className = '',
}: CalendarProps) {
  const [currentDate, setCurrentDate] = useState(new Date());
  const [view, setView] = useState<CalendarView>(defaultView);
  const [selectedDate, setSelectedDate] = useState<Date | undefined>(undefined);

  const getEventsForDate = (date: Date): CalendarEvent[] => {
    return events.filter((event) => {
      if (event.allDay) {
        return isSameDay(event.start, date);
      }
      return (
        isSameDay(event.start, date) ||
        (event.start <= date && event.end >= date)
      );
    });
  };

  const handleDateSelect = (date: Date | undefined) => {
    if (date) {
      setSelectedDate(date);
      onDateClick?.(date);
    }
  };

  const handlePrevious = () => {
    const newDate = new Date(currentDate);
    if (view === 'month') {
      newDate.setMonth(newDate.getMonth() - 1);
    } else if (view === 'week') {
      newDate.setDate(newDate.getDate() - 7);
    } else {
      newDate.setDate(newDate.getDate() - 1);
    }
    setCurrentDate(newDate);
  };

  const handleNext = () => {
    const newDate = new Date(currentDate);
    if (view === 'month') {
      newDate.setMonth(newDate.getMonth() + 1);
    } else if (view === 'week') {
      newDate.setDate(newDate.getDate() + 7);
    } else {
      newDate.setDate(newDate.getDate() + 1);
    }
    setCurrentDate(newDate);
  };

  const handleToday = () => {
    setCurrentDate(new Date());
    setSelectedDate(new Date());
  };

  const renderMonthView = () => {
    const modifiers = {
      hasEvents: (date: Date) => getEventsForDate(date).length > 0,
    };

    const modifiersStyles = {
      hasEvents: {
        fontWeight: 'bold',
        position: 'relative' as const,
      },
    };

    return (
      <div className="calendar-month-view">
        <DayPicker
          mode="single"
          selected={selectedDate}
          onSelect={handleDateSelect}
          month={currentDate}
          onMonthChange={setCurrentDate}
          modifiers={modifiers}
          modifiersStyles={modifiersStyles}
          className="p-3"
          classNames={{
            months: 'flex flex-col sm:flex-row space-y-4 sm:space-x-4 sm:space-y-0',
            month: 'space-y-4',
            caption: 'flex justify-center pt-1 relative items-center',
            caption_label: 'text-sm font-medium',
            nav: 'space-x-1 flex items-center',
            nav_button: 'h-7 w-7 bg-transparent p-0 opacity-50 hover:opacity-100',
            nav_button_previous: 'absolute left-1',
            nav_button_next: 'absolute right-1',
            table: 'w-full border-collapse space-y-1',
            head_row: 'flex',
            head_cell: 'text-muted-foreground rounded-md w-9 font-normal text-[0.8rem]',
            row: 'flex w-full mt-2',
            cell: 'text-center text-sm p-0 relative [&:has([aria-selected])]:bg-accent first:[&:has([aria-selected])]:rounded-l-md last:[&:has([aria-selected])]:rounded-r-md focus-within:relative focus-within:z-20',
            day: 'h-9 w-9 p-0 font-normal aria-selected:opacity-100 hover:bg-accent hover:text-accent-foreground rounded-md',
            day_selected: 'bg-primary text-primary-foreground hover:bg-primary hover:text-primary-foreground focus:bg-primary focus:text-primary-foreground',
            day_today: 'bg-accent text-accent-foreground',
            day_outside: 'text-muted-foreground opacity-50',
            day_disabled: 'text-muted-foreground opacity-50',
            day_hidden: 'invisible',
          }}
        />
      </div>
    );
  };

  const renderWeekView = () => {
    const startOfWeek = new Date(currentDate);
    startOfWeek.setDate(currentDate.getDate() - currentDate.getDay());
    const weekDays = Array.from({ length: 7 }, (_, i) => {
      const day = new Date(startOfWeek);
      day.setDate(startOfWeek.getDate() + i);
      return day;
    });

    return (
      <div className="grid grid-cols-7 gap-2">
        {weekDays.map((day) => {
          const dayEvents = getEventsForDate(day);
          const isToday = isSameDay(day, new Date());
          const isSelected = selectedDate && isSameDay(day, selectedDate);

          return (
            <div
              key={day.toISOString()}
              className={`border rounded-lg p-2 cursor-pointer hover:bg-accent transition-colors ${
                isToday ? 'border-primary' : ''
              } ${isSelected ? 'bg-accent' : ''}`}
              onClick={() => handleDateSelect(day)}
            >
              <div className="text-center mb-2">
                <div className="text-xs text-muted-foreground">
                  {format(day, 'EEE')}
                </div>
                <div className={`text-lg font-semibold ${isToday ? 'text-primary' : ''}`}>
                  {format(day, 'd')}
                </div>
              </div>
              <ScrollArea className="h-32">
                {dayEvents.map((event) => (
                  <div
                    key={event.id}
                    className="text-xs p-1 mb-1 rounded cursor-pointer hover:opacity-80"
                    style={{
                      backgroundColor: event.color || 'hsl(var(--primary))',
                      color: 'hsl(var(--primary-foreground))',
                    }}
                    onClick={(e) => {
                      e.stopPropagation();
                      onEventClick?.(event);
                    }}
                  >
                    {event.title}
                  </div>
                ))}
              </ScrollArea>
            </div>
          );
        })}
      </div>
    );
  };

  const renderDayView = () => {
    const dayEvents = getEventsForDate(currentDate);
    const hours = Array.from({ length: 24 }, (_, i) => i);

    return (
      <div className="space-y-2">
        <div className="text-center mb-4">
          <h3 className="text-lg font-semibold">{format(currentDate, 'EEEE, MMMM d, yyyy')}</h3>
        </div>
        <ScrollArea className="h-96">
          {hours.map((hour) => {
            const hourEvents = dayEvents.filter((event) => {
              if (event.allDay) return hour === 0;
              return event.start.getHours() === hour;
            });

            return (
              <div key={hour} className="flex border-b">
                <div className="w-16 text-xs text-muted-foreground p-2">
                  {format(new Date().setHours(hour, 0), 'h:mm a')}
                </div>
                <div className="flex-1 p-2 min-h-[60px]">
                  {hourEvents.map((event) => (
                    <div
                      key={event.id}
                      className="text-sm p-2 mb-1 rounded cursor-pointer hover:opacity-80"
                      style={{
                        backgroundColor: event.color || 'hsl(var(--primary))',
                        color: 'hsl(var(--primary-foreground))',
                      }}
                      onClick={() => onEventClick?.(event)}
                    >
                      <div className="font-medium">{event.title}</div>
                      {!event.allDay && (
                        <div className="text-xs opacity-90">
                          {format(event.start, 'h:mm a')} - {format(event.end, 'h:mm a')}
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            );
          })}
        </ScrollArea>
      </div>
    );
  };

  const content = (
    <Card className={className}>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="text-lg">{title}</CardTitle>
          <div className="flex items-center gap-2">
            <div className="flex items-center gap-1">
              <Button
                variant={view === 'month' ? 'default' : 'outline'}
                size="sm"
                onClick={() => setView('month')}
              >
                Month
              </Button>
              <Button
                variant={view === 'week' ? 'default' : 'outline'}
                size="sm"
                onClick={() => setView('week')}
              >
                Week
              </Button>
              <Button
                variant={view === 'day' ? 'default' : 'outline'}
                size="sm"
                onClick={() => setView('day')}
              >
                Day
              </Button>
            </div>
          </div>
        </div>
        <div className="flex items-center justify-between mt-2">
          <div className="flex items-center gap-2">
            <Button variant="outline" size="sm" onClick={handlePrevious}>
              <ChevronLeft className="h-4 w-4" />
            </Button>
            <Button variant="outline" size="sm" onClick={handleToday}>
              Today
            </Button>
            <Button variant="outline" size="sm" onClick={handleNext}>
              <ChevronRight className="h-4 w-4" />
            </Button>
          </div>
          <div className="text-sm font-medium">
            {view === 'month' && format(currentDate, 'MMMM yyyy')}
            {view === 'week' && `Week of ${format(currentDate, 'MMM d, yyyy')}`}
            {view === 'day' && format(currentDate, 'MMMM d, yyyy')}
          </div>
        </div>
      </CardHeader>
      <CardContent>
        {view === 'month' && renderMonthView()}
        {view === 'week' && renderWeekView()}
        {view === 'day' && renderDayView()}

        {selectedDate && view === 'month' && (
          <div className="mt-4 border-t pt-4">
            <h4 className="font-medium mb-2">
              Events for {format(selectedDate, 'MMMM d, yyyy')}
            </h4>
            <ScrollArea className="h-32">
              {getEventsForDate(selectedDate).length === 0 ? (
                <p className="text-sm text-muted-foreground">No events</p>
              ) : (
                <div className="space-y-2">
                  {getEventsForDate(selectedDate).map((event) => (
                    <div
                      key={event.id}
                      className="flex items-start gap-2 p-2 rounded hover:bg-accent cursor-pointer"
                      onClick={() => onEventClick?.(event)}
                    >
                      <div
                        className="w-3 h-3 rounded-full mt-1"
                        style={{ backgroundColor: event.color || 'hsl(var(--primary))' }}
                      />
                      <div className="flex-1">
                        <div className="font-medium text-sm">{event.title}</div>
                        {!event.allDay && (
                          <div className="text-xs text-muted-foreground">
                            {format(event.start, 'h:mm a')} - {format(event.end, 'h:mm a')}
                          </div>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </ScrollArea>
          </div>
        )}
      </CardContent>
    </Card>
  );

  if (permission) {
    return (
      <PermissionGuard permission={permission} fallback={null}>
        {content}
      </PermissionGuard>
    );
  }

  return content;
}
