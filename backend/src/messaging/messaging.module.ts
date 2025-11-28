import { Module } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';
import { MessagingController } from './messaging.controller';
import { MessagingService } from './messaging.service';
import { MessagingWebSocketGateway } from './messaging-websocket.gateway';
import { MessagingNotificationService } from './messaging-notification.service';
import { MessagingCleanupService } from './messaging-cleanup.service';
import { PrismaModule } from '../prisma/prisma.module';
import { MessagingSettingsModule } from '../messaging-settings/messaging-settings.module';
import { PermissionsModule } from '../permissions/permissions.module';
import { authConfig } from '../config/auth.config';

@Module({
  imports: [
    PrismaModule,
    MessagingSettingsModule,
    PermissionsModule,
    JwtModule.register({
      secret: authConfig.jwt.secret,
      signOptions: { 
        expiresIn: '15m',
      },
    }),
  ],
  controllers: [MessagingController],
  providers: [
    MessagingService,
    MessagingWebSocketGateway,
    MessagingNotificationService,
    MessagingCleanupService,
  ],
  exports: [MessagingService, MessagingWebSocketGateway],
})
export class MessagingModule {}
