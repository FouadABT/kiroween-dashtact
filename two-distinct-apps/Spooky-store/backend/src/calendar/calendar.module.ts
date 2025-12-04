import { Module } from '@nestjs/common';
import { CalendarController } from './calendar.controller';
import { CalendarService } from './calendar.service';
import { CalendarRecurrenceService } from './calendar-recurrence.service';
import { CalendarRemindersService } from './calendar-reminders.service';
import { CalendarRemindersCronJob } from './calendar-reminders.cron';
import { RecurringEventsCronJob } from './recurring-events.cron';
import { PrismaModule } from '../prisma/prisma.module';
import { PermissionsModule } from '../permissions/permissions.module';
import { NotificationsModule } from '../notifications/notifications.module';

@Module({
  imports: [
    PrismaModule,
    PermissionsModule,
    NotificationsModule,
  ],
  controllers: [CalendarController],
  providers: [
    CalendarService,
    CalendarRecurrenceService,
    CalendarRemindersService,
    CalendarRemindersCronJob,
    RecurringEventsCronJob,
  ],
  exports: [
    CalendarService,
    CalendarRecurrenceService,
    CalendarRemindersService,
  ],
})
export class CalendarModule {}
