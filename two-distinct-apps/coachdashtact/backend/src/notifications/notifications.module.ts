import { Module, forwardRef } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';
import { NotificationsController } from './notifications.controller';
import { NotificationsService } from './notifications.service';
import { NotificationTemplateController } from './notification-template.controller';
import { NotificationTemplateService } from './notification-template.service';
import { NotificationPreferencesController } from './notification-preferences.controller';
import { NotificationPreferencesService } from './notification-preferences.service';
import { NotificationDeliveryService } from './notification-delivery.service';
import { NotificationWebSocketGateway } from './notification-websocket.gateway';
import { NotificationActionsController } from './notification-actions.controller';
import { NotificationActionsService } from './notification-actions.service';
import { NotificationAnalyticsController } from './notification-analytics.controller';
import { NotificationAnalyticsService } from './notification-analytics.service';
import { NotificationCacheService } from './notification-cache.service';
import { PrismaService } from '../prisma/prisma.service';
import { PermissionsModule } from '../permissions/permissions.module';
import { authConfig } from '../config/auth.config';

@Module({
  imports: [
    JwtModule.register({
      secret: authConfig.jwt.secret,
      signOptions: {
        expiresIn: authConfig.tokens.accessTokenExpiration,
      },
    } as any),
    forwardRef(() => PermissionsModule),
  ],
  controllers: [
    // IMPORTANT: Order matters! More specific routes must come before parameterized routes
    // NotificationPreferencesController handles /notifications/preferences/*
    // NotificationsController has /notifications/:id which would catch "preferences" as an ID
    NotificationPreferencesController,
    NotificationTemplateController,
    NotificationActionsController,
    NotificationAnalyticsController,
    NotificationsController, // Must be last due to :id route
  ],
  providers: [
    PrismaService,
    NotificationsService,
    NotificationTemplateService,
    NotificationPreferencesService,
    NotificationDeliveryService,
    NotificationWebSocketGateway,
    NotificationActionsService,
    NotificationAnalyticsService,
    NotificationCacheService,
  ],
  exports: [
    NotificationsService,
    NotificationTemplateService,
    NotificationPreferencesService,
    NotificationDeliveryService,
    NotificationWebSocketGateway,
    NotificationActionsService,
    NotificationAnalyticsService,
    NotificationCacheService,
  ],
})
export class NotificationsModule {}
