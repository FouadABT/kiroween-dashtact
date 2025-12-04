import { Module } from '@nestjs/common';
import { MessagingSettingsService } from './messaging-settings.service';
import { MessagingSettingsController } from './messaging-settings.controller';
import { PrismaModule } from '../prisma/prisma.module';
import { PermissionsModule } from '../permissions/permissions.module';
import { AuthModule } from '../auth/auth.module';

@Module({
  imports: [PrismaModule, PermissionsModule, AuthModule],
  providers: [MessagingSettingsService],
  controllers: [MessagingSettingsController],
  exports: [MessagingSettingsService],
})
export class MessagingSettingsModule {}
