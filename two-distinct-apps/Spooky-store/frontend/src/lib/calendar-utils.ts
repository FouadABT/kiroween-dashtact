/**
 * Calendar Utility Functions
 * 
 * Provides helper functions for calendar operations including:
 * - Date formatting
 * - Recurrence rule formatting
 * - Event conflict detection
 * - Working hours calculations
 */

import { format, parseISO, isWithinInterval, addMinutes, isSameDay } from 'date-fns';
import type { CalendarEvent, RecurrenceRule } from '@/types/calendar';

/**
 * Format a date for display in the calendar
 */
export function formatEventDate(date: string | Date, formatStr: string = 'PPP'): string {
  const dateObj = typeof date === 'string' ? parseISO(date) : date;
  return format(dateObj, formatStr);
}

/**
 * Format event time range
 */
export function formatEventTimeRange(startTime: string | Date, endTime: string | Date): string {
  const start = typeof startTime === 'string' ? parseISO(startTime) : startTime;
  const end = typeof endTime === 'string' ? parseISO(endTime) : endTime;
  
  if (isSameDay(start, end)) {
    return `${format(start, 'PPP')} • ${format(start, 'p')} - ${format(end, 'p')}`;
  }
  
  return `${format(start, 'PPP p')} - ${format(end, 'PPP p')}`;
}

/**
 * Format time only (HH:mm)
 */
export function formatTime(date: string | Date): string {
  const dateObj = typeof date === 'string' ? parseISO(date) : date;
  return format(dateObj, 'HH:mm');
}

/**
 * Format date only (YYYY-MM-DD)
 */
export function formatDateOnly(date: string | Date): string {
  const dateObj = typeof date === 'string' ? parseISO(date) : date;
  return format(dateObj, 'yyyy-MM-dd');
}

/**
 * Convert recurrence rule to human-readable string
 */
export function formatRecurrenceRule(rule: RecurrenceRule): string {
  if (!rule || !rule.frequency) {
    return 'Does not repeat';
  }

  const parts: string[] = [];
  
  // Frequency
  const interval = rule.interval || 1;
  switch (rule.frequency) {
    case 'DAILY':
      parts.push(interval === 1 ? 'Daily' : `Every ${interval} days`);
      break;
    case 'WEEKLY':
      parts.push(interval === 1 ? 'Weekly' : `Every ${interval} weeks`);
      if (rule.byDay && rule.byDay.length > 0) {
        const dayNames = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
        const days = rule.byDay.map(d => dayNames[d]).join(', ');
        parts.push(`on ${days}`);
      }
      break;
    case 'MONTHLY':
      parts.push(interval === 1 ? 'Monthly' : `Every ${interval} months`);
      if (rule.byMonthDay && rule.byMonthDay.length > 0) {
        const days = rule.byMonthDay.join(', ');
        parts.push(`on day ${days}`);
      }
      break;
    case 'YEARLY':
      parts.push(interval === 1 ? 'Yearly' : `Every ${interval} years`);
      if (rule.byMonth && rule.byMonth.length > 0) {
        const monthNames = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
        const months = rule.byMonth.map(m => monthNames[m - 1]).join(', ');
        parts.push(`in ${months}`);
      }
      break;
  }

  // End condition
  if (rule.count) {
    parts.push(`for ${rule.count} occurrences`);
  } else if (rule.until) {
    const untilDate = typeof rule.until === 'string' ? parseISO(rule.until) : rule.until;
    parts.push(`until ${format(untilDate, 'PPP')}`);
  }

  return parts.join(' ');
}

/**
 * Check if two events have a time conflict
 */
export function hasEventConflict(
  event1: { startTime: string | Date; endTime: string | Date },
  event2: { startTime: string | Date; endTime: string | Date }
): boolean {
  const start1 = typeof event1.startTime === 'string' ? parseISO(event1.startTime) : event1.startTime;
  const end1 = typeof event1.endTime === 'string' ? parseISO(event1.endTime) : event1.endTime;
  const start2 = typeof event2.startTime === 'string' ? parseISO(event2.startTime) : event2.startTime;
  const end2 = typeof event2.endTime === 'string' ? parseISO(event2.endTime) : event2.endTime;

  // Check if event1 starts during event2
  const event1StartsInEvent2 = isWithinInterval(start1, { start: start2, end: end2 });
  
  // Check if event1 ends during event2
  const event1EndsInEvent2 = isWithinInterval(end1, { start: start2, end: end2 });
  
  // Check if event2 starts during event1
  const event2StartsInEvent1 = isWithinInterval(start2, { start: start1, end: end1 });
  
  // Check if event2 ends during event1
  const event2EndsInEvent1 = isWithinInterval(end2, { start: start1, end: end1 });

  return event1StartsInEvent2 || event1EndsInEvent2 || event2StartsInEvent1 || event2EndsInEvent1;
}

/**
 * Find conflicting events in a list
 */
export function findConflictingEvents(
  newEvent: { startTime: string | Date; endTime: string | Date },
  existingEvents: CalendarEvent[]
): CalendarEvent[] {
  return existingEvents.filter(event => hasEventConflict(newEvent, event));
}

/**
 * Check if a time is within working hours
 */
export function isWithinWorkingHours(
  time: Date,
  workingHoursStart: string = '09:00',
  workingHoursEnd: string = '17:00'
): boolean {
  const hour = time.getHours();
  const minute = time.getMinutes();
  const timeInMinutes = hour * 60 + minute;

  const [startHour, startMinute] = workingHoursStart.split(':').map(Number);
  const startInMinutes = startHour * 60 + startMinute;

  const [endHour, endMinute] = workingHoursEnd.split(':').map(Number);
  const endInMinutes = endHour * 60 + endMinute;

  return timeInMinutes >= startInMinutes && timeInMinutes < endInMinutes;
}

/**
 * Check if a day is a working day
 */
export function isWorkingDay(date: Date, workingDays: number[] = [1, 2, 3, 4, 5]): boolean {
  const dayOfWeek = date.getDay(); // 0 = Sunday, 6 = Saturday
  return workingDays.includes(dayOfWeek);
}

/**
 * Calculate event duration in minutes
 */
export function getEventDuration(startTime: string | Date, endTime: string | Date): number {
  const start = typeof startTime === 'string' ? parseISO(startTime) : startTime;
  const end = typeof endTime === 'string' ? parseISO(endTime) : endTime;
  return Math.round((end.getTime() - start.getTime()) / (1000 * 60));
}

/**
 * Format duration in human-readable format
 */
export function formatDuration(minutes: number): string {
  if (minutes < 60) {
    return `${minutes} min`;
  }
  
  const hours = Math.floor(minutes / 60);
  const remainingMinutes = minutes % 60;
  
  if (remainingMinutes === 0) {
    return `${hours} hr`;
  }
  
  return `${hours} hr ${remainingMinutes} min`;
}

/**
 * Get reminder time as a Date object
 */
export function getReminderTime(eventStartTime: string | Date, minutesBefore: number): Date {
  const startTime = typeof eventStartTime === 'string' ? parseISO(eventStartTime) : eventStartTime;
  return addMinutes(startTime, -minutesBefore);
}

/**
 * Format reminder time for display
 */
export function formatReminderTime(minutesBefore: number): string {
  if (minutesBefore < 60) {
    return `${minutesBefore} minutes before`;
  }
  
  const hours = Math.floor(minutesBefore / 60);
  const remainingMinutes = minutesBefore % 60;
  
  if (remainingMinutes === 0) {
    if (hours === 24) {
      return '1 day before';
    }
    if (hours === 48) {
      return '2 days before';
    }
    if (hours === 168) {
      return '1 week before';
    }
    return `${hours} hours before`;
  }
  
  return `${hours} hours ${remainingMinutes} minutes before`;
}

/**
 * Get event color with fallback
 */
export function getEventColor(event: CalendarEvent): string {
  return event.color || event.category?.color || '#3b82f6';
}

/**
 * Check if event is all-day
 */
export function isAllDayEvent(event: CalendarEvent): boolean {
  return event.allDay || false;
}

/**
 * Check if event is in the past
 */
export function isEventInPast(event: CalendarEvent): boolean {
  const endTime = typeof event.endTime === 'string' ? parseISO(event.endTime) : event.endTime;
  return endTime < new Date();
}

/**
 * Check if event is happening now
 */
export function isEventHappeningNow(event: CalendarEvent): boolean {
  const now = new Date();
  const startTime = typeof event.startTime === 'string' ? parseISO(event.startTime) : event.startTime;
  const endTime = typeof event.endTime === 'string' ? parseISO(event.endTime) : event.endTime;
  return isWithinInterval(now, { start: startTime, end: endTime });
}

/**
 * Sort events by start time
 */
export function sortEventsByStartTime(events: CalendarEvent[]): CalendarEvent[] {
  return [...events].sort((a, b) => {
    const aStart = typeof a.startTime === 'string' ? parseISO(a.startTime) : a.startTime;
    const bStart = typeof b.startTime === 'string' ? parseISO(b.startTime) : b.startTime;
    return aStart.getTime() - bStart.getTime();
  });
}

/**
 * Group events by date
 */
export function groupEventsByDate(events: CalendarEvent[]): Map<string, CalendarEvent[]> {
  const grouped = new Map<string, CalendarEvent[]>();
  
  events.forEach(event => {
    const dateKey = formatDateOnly(event.startTime);
    if (!grouped.has(dateKey)) {
      grouped.set(dateKey, []);
    }
    grouped.get(dateKey)!.push(event);
  });
  
  return grouped;
}

/**
 * Filter events by date range
 */
export function filterEventsByDateRange(
  events: CalendarEvent[],
  startDate: Date,
  endDate: Date
): CalendarEvent[] {
  return events.filter(event => {
    const eventStart = typeof event.startTime === 'string' ? parseISO(event.startTime) : event.startTime;
    const eventEnd = typeof event.endTime === 'string' ? parseISO(event.endTime) : event.endTime;
    
    // Event overlaps with date range if:
    // - Event starts within range, OR
    // - Event ends within range, OR
    // - Event spans the entire range
    return (
      isWithinInterval(eventStart, { start: startDate, end: endDate }) ||
      isWithinInterval(eventEnd, { start: startDate, end: endDate }) ||
      (eventStart <= startDate && eventEnd >= endDate)
    );
  });
}
