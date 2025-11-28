import { Injectable, Logger } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { RecurrenceFreq } from '@prisma/client';

export interface RecurrenceInstance {
  startTime: Date;
  endTime: Date;
}

@Injectable()
export class CalendarRecurrenceService {
  private readonly logger = new Logger(CalendarRecurrenceService.name);

  constructor(private readonly prisma: PrismaService) {}

  /**
   * Generate recurring event instances based on recurrence rule
   * @param eventId - The parent event ID
   * @param startDate - Start date for generation window
   * @param endDate - End date for generation window
   * @returns Array of generated instance dates
   */
  async generateInstances(
    eventId: string,
    startDate: Date,
    endDate: Date,
  ): Promise<RecurrenceInstance[]> {
    try {
      // Fetch the parent event with recurrence rule
      const event = await this.prisma.calendarEvent.findUnique({
        where: { id: eventId },
        include: {
          recurrenceRule: true,
        },
      });

      if (!event || !event.recurrenceRule) {
        return [];
      }

      const rule = event.recurrenceRule;
      const instances: RecurrenceInstance[] = [];
      const eventDuration = event.endTime.getTime() - event.startTime.getTime();

      let currentDate = new Date(event.startTime);
      let occurrenceCount = 0;

      // Generate instances until we reach the end date or count limit
      while (currentDate <= endDate) {
        // Check if we've reached the count limit
        if (rule.count && occurrenceCount >= rule.count) {
          break;
        }

        // Check if we've reached the until date
        if (rule.until && currentDate > rule.until) {
          break;
        }

        // Check if this date is in the generation window
        if (currentDate >= startDate) {
          // Check if this date is not in exceptions
          const isException = rule.exceptions.some(
            exception => this.isSameDay(exception, currentDate),
          );

          if (!isException && this.matchesRecurrencePattern(currentDate, event.startTime, rule)) {
            const instanceStart = new Date(currentDate);
            const instanceEnd = new Date(currentDate.getTime() + eventDuration);

            instances.push({
              startTime: instanceStart,
              endTime: instanceEnd,
            });

            occurrenceCount++;
          }
        }

        // Move to next potential occurrence
        currentDate = this.getNextOccurrence(currentDate, rule);

        // Safety check to prevent infinite loops
        if (occurrenceCount > 1000) {
          this.logger.warn(`Recurrence generation exceeded 1000 instances for event ${eventId}`);
          break;
        }
      }

      return instances;
    } catch (error) {
      this.logger.error(`Failed to generate recurrence instances: ${error.message}`);
      throw error;
    }
  }

  /**
   * Check if a date matches the recurrence pattern
   */
  private matchesRecurrencePattern(
    date: Date,
    startDate: Date,
    rule: any,
  ): boolean {
    switch (rule.frequency) {
      case RecurrenceFreq.DAILY:
        return this.matchesDailyPattern(date, startDate, rule);
      
      case RecurrenceFreq.WEEKLY:
        return this.matchesWeeklyPattern(date, startDate, rule);
      
      case RecurrenceFreq.MONTHLY:
        return this.matchesMonthlyPattern(date, startDate, rule);
      
      case RecurrenceFreq.YEARLY:
        return this.matchesYearlyPattern(date, startDate, rule);
      
      default:
        return false;
    }
  }

  /**
   * Check if date matches daily recurrence pattern
   */
  private matchesDailyPattern(date: Date, startDate: Date, rule: any): boolean {
    const daysDiff = Math.floor(
      (date.getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24),
    );
    return daysDiff % rule.interval === 0;
  }

  /**
   * Check if date matches weekly recurrence pattern
   */
  private matchesWeeklyPattern(date: Date, startDate: Date, rule: any): boolean {
    // Check if the day of week matches
    if (rule.byDay && rule.byDay.length > 0) {
      const dayOfWeek = date.getDay(); // 0 = Sunday, 6 = Saturday
      if (!rule.byDay.includes(dayOfWeek)) {
        return false;
      }
    }

    // Check if the week interval matches
    const weeksDiff = Math.floor(
      (date.getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24 * 7),
    );
    return weeksDiff % rule.interval === 0;
  }

  /**
   * Check if date matches monthly recurrence pattern
   */
  private matchesMonthlyPattern(date: Date, startDate: Date, rule: any): boolean {
    // Check if the day of month matches
    if (rule.byMonthDay && rule.byMonthDay.length > 0) {
      const dayOfMonth = date.getDate();
      if (!rule.byMonthDay.includes(dayOfMonth)) {
        return false;
      }
    }

    // Check if the month interval matches
    const monthsDiff =
      (date.getFullYear() - startDate.getFullYear()) * 12 +
      (date.getMonth() - startDate.getMonth());
    return monthsDiff % rule.interval === 0;
  }

  /**
   * Check if date matches yearly recurrence pattern
   */
  private matchesYearlyPattern(date: Date, startDate: Date, rule: any): boolean {
    // Check if the month matches
    if (rule.byMonth && rule.byMonth.length > 0) {
      const month = date.getMonth() + 1; // 1-12
      if (!rule.byMonth.includes(month)) {
        return false;
      }
    }

    // Check if the day of month matches
    if (rule.byMonthDay && rule.byMonthDay.length > 0) {
      const dayOfMonth = date.getDate();
      if (!rule.byMonthDay.includes(dayOfMonth)) {
        return false;
      }
    }

    // Check if the year interval matches
    const yearsDiff = date.getFullYear() - startDate.getFullYear();
    return yearsDiff % rule.interval === 0;
  }

  /**
   * Get the next potential occurrence date based on frequency
   */
  private getNextOccurrence(currentDate: Date, rule: any): Date {
    const next = new Date(currentDate);

    switch (rule.frequency) {
      case RecurrenceFreq.DAILY:
        next.setDate(next.getDate() + rule.interval);
        break;

      case RecurrenceFreq.WEEKLY:
        next.setDate(next.getDate() + 1); // Check each day for weekly patterns
        break;

      case RecurrenceFreq.MONTHLY:
        next.setDate(next.getDate() + 1); // Check each day for monthly patterns
        break;

      case RecurrenceFreq.YEARLY:
        next.setDate(next.getDate() + 1); // Check each day for yearly patterns
        break;
    }

    return next;
  }

  /**
   * Check if two dates are on the same day
   */
  private isSameDay(date1: Date, date2: Date): boolean {
    return (
      date1.getFullYear() === date2.getFullYear() &&
      date1.getMonth() === date2.getMonth() &&
      date1.getDate() === date2.getDate()
    );
  }

  /**
   * Create recurring event instances in the database
   * @param eventId - The parent event ID
   * @param startDate - Start date for generation window
   * @param endDate - End date for generation window
   */
  async createRecurringInstances(
    eventId: string,
    startDate: Date,
    endDate: Date,
  ): Promise<number> {
    try {
      // Generate instance dates
      const instances = await this.generateInstances(eventId, startDate, endDate);

      if (instances.length === 0) {
        return 0;
      }

      // Fetch parent event details
      const parentEvent = await this.prisma.calendarEvent.findUnique({
        where: { id: eventId },
        include: {
          attendees: true,
          reminders: true,
        },
      });

      if (!parentEvent) {
        throw new Error(`Parent event ${eventId} not found`);
      }

      // Check which instances already exist
      const existingInstances = await this.prisma.calendarEvent.findMany({
        where: {
          parentEventId: eventId,
          startTime: {
            in: instances.map(i => i.startTime),
          },
        },
        select: { startTime: true },
      });

      const existingStartTimes = new Set(
        existingInstances.map(i => i.startTime.toISOString()),
      );

      // Filter out existing instances
      const newInstances = instances.filter(
        i => !existingStartTimes.has(i.startTime.toISOString()),
      );

      if (newInstances.length === 0) {
        return 0;
      }

      // Create new instances
      let createdCount = 0;
      for (const instance of newInstances) {
        const createdInstance = await this.prisma.calendarEvent.create({
          data: {
            title: parentEvent.title,
            description: parentEvent.description,
            startTime: instance.startTime,
            endTime: instance.endTime,
            allDay: parentEvent.allDay,
            location: parentEvent.location,
            color: parentEvent.color,
            categoryId: parentEvent.categoryId,
            status: parentEvent.status,
            visibility: parentEvent.visibility,
            creatorId: parentEvent.creatorId,
            parentEventId: eventId,
            metadata: parentEvent.metadata || undefined,
          },
        });

        // Copy attendees
        if (parentEvent.attendees.length > 0) {
          await this.prisma.eventAttendee.createMany({
            data: parentEvent.attendees.map(attendee => ({
              eventId: createdInstance.id,
              userId: attendee.userId,
              teamId: attendee.teamId,
              responseStatus: 'PENDING',
              isOrganizer: attendee.isOrganizer,
            })),
          });
        }

        // Copy reminders
        if (parentEvent.reminders.length > 0) {
          await this.prisma.eventReminder.createMany({
            data: parentEvent.reminders.map(reminder => ({
              eventId: createdInstance.id,
              userId: reminder.userId,
              minutesBefore: reminder.minutesBefore,
            })),
          });
        }

        createdCount++;
      }

      this.logger.log(
        `Created ${createdCount} recurring instances for event ${eventId}`,
      );

      return createdCount;
    } catch (error) {
      this.logger.error(`Failed to create recurring instances: ${error.message}`);
      throw error;
    }
  }

  /**
   * Get human-readable description of recurrence rule
   */
  getRecurrenceDescription(rule: any): string {
    if (!rule) {
      return 'Does not repeat';
    }

    const interval = rule.interval || 1;
    let description = '';

    switch (rule.frequency) {
      case RecurrenceFreq.DAILY:
        description = interval === 1 ? 'Daily' : `Every ${interval} days`;
        break;

      case RecurrenceFreq.WEEKLY:
        if (interval === 1) {
          description = 'Weekly';
        } else {
          description = `Every ${interval} weeks`;
        }
        if (rule.byDay && rule.byDay.length > 0) {
          const days = rule.byDay.map(d => this.getDayName(d)).join(', ');
          description += ` on ${days}`;
        }
        break;

      case RecurrenceFreq.MONTHLY:
        if (interval === 1) {
          description = 'Monthly';
        } else {
          description = `Every ${interval} months`;
        }
        if (rule.byMonthDay && rule.byMonthDay.length > 0) {
          description += ` on day ${rule.byMonthDay.join(', ')}`;
        }
        break;

      case RecurrenceFreq.YEARLY:
        if (interval === 1) {
          description = 'Yearly';
        } else {
          description = `Every ${interval} years`;
        }
        if (rule.byMonth && rule.byMonth.length > 0) {
          const months = rule.byMonth.map(m => this.getMonthName(m)).join(', ');
          description += ` in ${months}`;
        }
        break;
    }

    // Add end condition
    if (rule.count) {
      description += `, ${rule.count} times`;
    } else if (rule.until) {
      const untilDate = new Date(rule.until);
      description += `, until ${untilDate.toLocaleDateString()}`;
    }

    return description;
  }

  /**
   * Get day name from day number (0 = Sunday)
   */
  private getDayName(day: number): string {
    const days = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
    return days[day] || '';
  }

  /**
   * Get month name from month number (1 = January)
   */
  private getMonthName(month: number): string {
    const months = [
      'January', 'February', 'March', 'April', 'May', 'June',
      'July', 'August', 'September', 'October', 'November', 'December',
    ];
    return months[month - 1] || '';
  }
}
