import { Module, forwardRef } from '@nestjs/common';
import { ActivityLogController } from './activity-log.controller';
import { ActivityLogService } from './activity-log.service';
import { PrismaService } from '../prisma/prisma.service';
import { PermissionsModule } from '../permissions/permissions.module';
import { AuthModule } from '../auth/auth.module';
import { ActivityLoggingInterceptor } from './interceptors/activity-logging.interceptor';

@Module({
  imports: [PermissionsModule, forwardRef(() => AuthModule)],
  controllers: [ActivityLogController],
  providers: [ActivityLogService, PrismaService, ActivityLoggingInterceptor],
  exports: [ActivityLogService, ActivityLoggingInterceptor],
})
export class ActivityLogModule {}
