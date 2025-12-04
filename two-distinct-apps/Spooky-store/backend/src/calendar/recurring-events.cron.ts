import { Injectable, Logger } from '@nestjs/common';
import { Cron, CronExpression } from '@nestjs/schedule';
import { CalendarRecurrenceService } from './calendar-recurrence.service';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class RecurringEventsCronJob {
  private readonly logger = new Logger(RecurringEventsCronJob.name);

  constructor(
    private readonly recurrenceService: CalendarRecurrenceService,
    private readonly prisma: PrismaService,
  ) {}

  /**
   * Generate future instances for recurring events
   * Runs daily at midnight to generate instances for the next 90 days
   */
  @Cron(CronExpression.EVERY_DAY_AT_MIDNIGHT, {
    name: 'recurring-events-generation',
  })
  async handleRecurringEventsGeneration() {
    const startTime = Date.now();
    this.logger.log('Starting recurring events generation...');

    try {
      // Find all recurring events that need instance generation
      const recurringEvents = await this.prisma.calendarEvent.findMany({
        where: {
          recurrenceRuleId: {
            not: null,
          },
          status: {
            not: 'CANCELLED',
          },
        },
        include: {
          recurrenceRule: true,
          category: true,
          creator: {
            select: {
              id: true,
              name: true,
              email: true,
              avatarUrl: true,
            },
          },
        },
      });

      this.logger.log(`Found ${recurringEvents.length} recurring events to process`);

      let generatedCount = 0;
      let skippedCount = 0;
      let errorCount = 0;

      // Generate instances for next 90 days
      const now = new Date();
      const endDate = new Date(now);
      endDate.setDate(endDate.getDate() + 90);

      for (const event of recurringEvents) {
        try {
          if (!event.recurrenceRule) {
            skippedCount++;
            continue;
          }

          // Generate instances
          const instances = await this.recurrenceService.generateInstances(
            event.id,
            now,
            endDate,
          );

          // Check which instances already exist
          const existingInstances = await this.prisma.calendarEvent.findMany({
            where: {
              parentEventId: event.id,
              startTime: {
                gte: now,
                lte: endDate,
              },
            },
            select: {
              startTime: true,
            },
          });

          const existingStartTimes = new Set(
            existingInstances.map(i => i.startTime.toISOString()),
          );

          // Filter out instances that already exist
          const newInstances = instances.filter(
            instance => !existingStartTimes.has(instance.startTime.toISOString()),
          );

          // Create new instances
          if (newInstances.length > 0) {
            await this.prisma.calendarEvent.createMany({
              data: newInstances.map(instance => ({
                title: event.title,
                description: event.description,
                startTime: instance.startTime,
                endTime: instance.endTime,
                allDay: event.allDay,
                location: event.location,
                color: event.color,
                categoryId: event.categoryId,
                status: event.status,
                visibility: event.visibility,
                creatorId: event.creatorId,
                parentEventId: event.id,
                metadata: event.metadata || undefined,
              })),
            });

            generatedCount += newInstances.length;
            this.logger.log(
              `Generated ${newInstances.length} instances for event ${event.id} (${event.title})`,
            );
          } else {
            skippedCount++;
          }
        } catch (error) {
          errorCount++;
          this.logger.error(
            `Failed to generate instances for event ${event.id}: ${error.message}`,
          );
        }
      }

      const duration = Date.now() - startTime;

      this.logger.log(
        `Recurring events generation completed in ${duration}ms: ` +
        `${generatedCount} instances generated, ${skippedCount} events skipped, ${errorCount} errors`,
      );
    } catch (error) {
      const duration = Date.now() - startTime;
      this.logger.error(
        `Recurring events generation failed after ${duration}ms: ${error.message}`,
        error.stack,
      );
    }
  }
}
