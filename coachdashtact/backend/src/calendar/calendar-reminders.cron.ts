import { Injectable, Logger } from '@nestjs/common';
import { Cron, CronExpression } from '@nestjs/schedule';
import { CalendarRemindersService } from './calendar-reminders.service';

@Injectable()
export class CalendarRemindersCronJob {
  private readonly logger = new Logger(CalendarRemindersCronJob.name);

  constructor(
    private readonly remindersService: CalendarRemindersService,
  ) {}

  /**
   * Process pending calendar reminders every 5 minutes
   * Looks ahead 10 minutes to find reminders that need to be sent
   */
  @Cron(CronExpression.EVERY_5_MINUTES, {
    name: 'calendar-reminders',
  })
  async handleReminderProcessing() {
    const startTime = Date.now();
    this.logger.log('Starting calendar reminders processing...');

    try {
      const result = await this.remindersService.processPendingReminders();
      
      const duration = Date.now() - startTime;
      
      this.logger.log(
        `Calendar reminders processing completed in ${duration}ms: ` +
        `${result.processed} processed, ${result.failed} failed/skipped`,
      );
    } catch (error) {
      const duration = Date.now() - startTime;
      this.logger.error(
        `Calendar reminders processing failed after ${duration}ms: ${error.message}`,
        error.stack,
      );
    }
  }
}
