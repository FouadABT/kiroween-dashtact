import { Module } from '@nestjs/common';
import { InventoryService } from './inventory.service';
import { InventoryController } from './inventory.controller';
import { PrismaService } from '../prisma/prisma.service';
import { NotificationsModule } from '../notifications/notifications.module';
import { PermissionsModule } from '../permissions/permissions.module';
import { AuthModule } from '../auth/auth.module';

@Module({
  imports: [NotificationsModule, PermissionsModule, AuthModule],
  providers: [InventoryService, PrismaService],
  controllers: [InventoryController],
  exports: [InventoryService],
})
export class InventoryModule {}
