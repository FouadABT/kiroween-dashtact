import { Injectable, Logger } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { NotificationsService } from '../notifications/notifications.service';
import { NotificationPreferencesService } from '../notifications/notification-preferences.service';

@Injectable()
export class CalendarRemindersService {
  private readonly logger = new Logger(CalendarRemindersService.name);

  constructor(
    private readonly prisma: PrismaService,
    private readonly notificationsService: NotificationsService,
    private readonly notificationPreferencesService: NotificationPreferencesService,
  ) {}

  /**
   * Find all pending reminders that should be sent
   * @param windowMinutes - Look ahead window in minutes (default: 10)
   * @returns Array of reminders to process
   */
  async findPendingReminders(windowMinutes: number = 10): Promise<any[]> {
    try {
      const now = new Date();
      const windowEnd = new Date(now.getTime() + windowMinutes * 60 * 1000);

      // Find reminders that:
      // 1. Haven't been sent yet
      // 2. The event hasn't been cancelled
      // 3. The reminder time is within the window
      const reminders = await this.prisma.eventReminder.findMany({
        where: {
          isSent: false,
          event: {
            status: {
              not: 'CANCELLED',
            },
          },
        },
        include: {
          event: {
            include: {
              category: true,
              creator: {
                select: {
                  id: true,
                  name: true,
                  email: true,
                },
              },
            },
          },
          user: {
            select: {
              id: true,
              name: true,
              email: true,
            },
          },
        },
      });

      // Filter reminders that are due within the window
      const dueReminders = reminders.filter(reminder => {
        const reminderTime = new Date(
          reminder.event.startTime.getTime() - reminder.minutesBefore * 60 * 1000,
        );
        return reminderTime >= now && reminderTime <= windowEnd;
      });

      return dueReminders;
    } catch (error) {
      this.logger.error(`Failed to find pending reminders: ${error.message}`);
      throw error;
    }
  }

  /**
   * Process a single reminder by creating a notification
   */
  async processReminder(reminder: any): Promise<boolean> {
    try {
      // Check user's notification preferences
      const preferences = await this.notificationPreferencesService.getPreferences(
        reminder.userId,
      );

      // Find CALENDAR category preference
      const calendarPref = preferences.find(p => p.category === 'CALENDAR' as any);
      
      // Check if calendar reminders are enabled
      if (calendarPref && !calendarPref.enabled) {
        this.logger.log(
          `Skipping reminder ${reminder.id} - calendar notifications disabled for user ${reminder.userId}`,
        );
        return false;
      }

      // Check do-not-disturb settings
      if (calendarPref && calendarPref.dndEnabled) {
        const now = new Date();
        const currentHour = now.getHours();
        const currentMinute = now.getMinutes();
        const currentTime = currentHour * 60 + currentMinute;
        const currentDay = now.getDay();

        // Check if today is in DND days
        if (calendarPref.dndDays && calendarPref.dndDays.length > 0 && !calendarPref.dndDays.includes(currentDay)) {
          // Today is not a DND day, proceed with notification
        } else if (calendarPref.dndStartTime && calendarPref.dndEndTime) {
          const [startHour, startMinute] = calendarPref.dndStartTime.split(':').map(Number);
          const [endHour, endMinute] = calendarPref.dndEndTime.split(':').map(Number);
          const startTime = startHour * 60 + startMinute;
          const endTime = endHour * 60 + endMinute;

          // Check if current time is within DND window
          const isInDndWindow =
            startTime <= endTime
              ? currentTime >= startTime && currentTime <= endTime
              : currentTime >= startTime || currentTime <= endTime;

          if (isInDndWindow) {
            this.logger.log(
              `Skipping reminder ${reminder.id} - user ${reminder.userId} is in do-not-disturb mode`,
            );
            return false;
          }
        }
      }

      // Format reminder message
      const minutesUntil = reminder.minutesBefore;
      const timeText = this.formatTimeUntil(minutesUntil);
      
      const title = `Reminder: ${reminder.event.title}`;
      const message = `Your event "${reminder.event.title}" starts ${timeText}`;

      // Create notification
      await this.notificationsService.create({
        userId: reminder.userId,
        title,
        message,
        category: 'CALENDAR' as any,
        priority: this.getPriorityFromMinutes(minutesUntil),
        channel: 'IN_APP',
        actionUrl: `/calendar?event=${reminder.event.id}`,
        actionLabel: 'View Event',
        metadata: {
          eventId: reminder.event.id,
          eventTitle: reminder.event.title,
          eventStartTime: reminder.event.startTime.toISOString(),
          reminderMinutes: minutesUntil,
        },
      });

      // Mark reminder as sent
      await this.prisma.eventReminder.update({
        where: { id: reminder.id },
        data: {
          isSent: true,
          sentAt: new Date(),
        },
      });

      this.logger.log(
        `Processed reminder ${reminder.id} for event ${reminder.event.id} and user ${reminder.userId}`,
      );

      return true;
    } catch (error) {
      this.logger.error(`Failed to process reminder ${reminder.id}: ${error.message}`);
      return false;
    }
  }

  /**
   * Process all pending reminders
   * @returns Object with success and failure counts
   */
  async processPendingReminders(): Promise<{ processed: number; failed: number }> {
    try {
      const reminders = await this.findPendingReminders();
      
      this.logger.log(`Found ${reminders.length} pending reminders to process`);

      let processed = 0;
      let failed = 0;

      for (const reminder of reminders) {
        const success = await this.processReminder(reminder);
        if (success) {
          processed++;
        } else {
          failed++;
        }
      }

      this.logger.log(
        `Reminder processing complete: ${processed} processed, ${failed} failed/skipped`,
      );

      return { processed, failed };
    } catch (error) {
      this.logger.error(`Failed to process pending reminders: ${error.message}`);
      throw error;
    }
  }

  /**
   * Cancel all reminders for an event
   */
  async cancelEventReminders(eventId: string): Promise<number> {
    try {
      // Mark all unsent reminders as sent to prevent them from being processed
      const result = await this.prisma.eventReminder.updateMany({
        where: {
          eventId,
          isSent: false,
        },
        data: {
          isSent: true,
          sentAt: new Date(),
        },
      });

      this.logger.log(`Cancelled ${result.count} reminders for event ${eventId}`);

      return result.count;
    } catch (error) {
      this.logger.error(`Failed to cancel event reminders: ${error.message}`);
      throw error;
    }
  }

  /**
   * Create reminder notifications for event changes
   */
  async notifyEventUpdate(eventId: string, changeType: 'updated' | 'cancelled'): Promise<void> {
    try {
      const event = await this.prisma.calendarEvent.findUnique({
        where: { id: eventId },
        include: {
          attendees: {
            include: {
              user: {
                select: {
                  id: true,
                  name: true,
                  email: true,
                },
              },
            },
          },
          creator: {
            select: {
              id: true,
              name: true,
            },
          },
        },
      });

      if (!event) {
        return;
      }

      // Notify all attendees (except the creator who made the change)
      const attendeesToNotify = event.attendees.filter(
        attendee => attendee.userId !== event.creatorId,
      );

      for (const attendee of attendeesToNotify) {
        if (!attendee.user) continue;

        let title: string;
        let message: string;
        let priority: 'LOW' | 'NORMAL' | 'HIGH' = 'NORMAL';

        if (changeType === 'cancelled') {
          title = `Event Cancelled: ${event.title}`;
          message = `The event "${event.title}" has been cancelled by ${event.creator.name}`;
          priority = 'HIGH';
        } else {
          title = `Event Updated: ${event.title}`;
          message = `The event "${event.title}" has been updated by ${event.creator.name}`;
        }

        await this.notificationsService.create({
          userId: attendee.userId!,
          title,
          message,
          category: 'CALENDAR' as any,
          priority,
          channel: 'IN_APP',
          actionUrl: changeType === 'cancelled' ? '/calendar' : `/calendar?event=${eventId}`,
          actionLabel: changeType === 'cancelled' ? 'View Calendar' : 'View Event',
          metadata: {
            eventId: event.id,
            eventTitle: event.title,
            changeType,
          },
        });
      }

      this.logger.log(
        `Sent ${changeType} notifications to ${attendeesToNotify.length} attendees for event ${eventId}`,
      );
    } catch (error) {
      this.logger.error(`Failed to notify event update: ${error.message}`);
      throw error;
    }
  }

  /**
   * Notify user when added to an event
   */
  async notifyAttendeeAdded(eventId: string, userId: string): Promise<void> {
    try {
      const event = await this.prisma.calendarEvent.findUnique({
        where: { id: eventId },
        include: {
          creator: {
            select: {
              id: true,
              name: true,
            },
          },
        },
      });

      if (!event) {
        return;
      }

      const title = `Event Invitation: ${event.title}`;
      const message = `You've been invited to "${event.title}" by ${event.creator.name}`;

      await this.notificationsService.create({
        userId,
        title,
        message,
        category: 'CALENDAR' as any,
        priority: 'NORMAL',
        channel: 'IN_APP',
        actionUrl: `/calendar?event=${eventId}`,
        actionLabel: 'View Event',
        metadata: {
          eventId: event.id,
          eventTitle: event.title,
          invitedBy: event.creator.name,
        },
      });

      this.logger.log(`Sent invitation notification to user ${userId} for event ${eventId}`);
    } catch (error) {
      this.logger.error(`Failed to notify attendee added: ${error.message}`);
      throw error;
    }
  }

  /**
   * Format time until event in human-readable format
   */
  private formatTimeUntil(minutes: number): string {
    if (minutes < 60) {
      return `in ${minutes} minute${minutes !== 1 ? 's' : ''}`;
    } else if (minutes < 1440) {
      const hours = Math.floor(minutes / 60);
      return `in ${hours} hour${hours !== 1 ? 's' : ''}`;
    } else {
      const days = Math.floor(minutes / 1440);
      return `in ${days} day${days !== 1 ? 's' : ''}`;
    }
  }

  /**
   * Get notification priority based on minutes until event
   */
  private getPriorityFromMinutes(minutes: number): 'LOW' | 'NORMAL' | 'HIGH' {
    if (minutes <= 15) {
      return 'HIGH';
    } else if (minutes <= 60) {
      return 'NORMAL';
    } else {
      return 'LOW';
    }
  }
}
