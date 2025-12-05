import { Module } from '@nestjs/common';
import { WidgetRegistryController } from './widget-registry.controller';
import { WidgetRegistryService } from './widget-registry.service';
import { PrismaService } from '../prisma/prisma.service';
import { PermissionsModule } from '../permissions/permissions.module';
import { AuthModule } from '../auth/auth.module';

@Module({
  imports: [PermissionsModule, AuthModule],
  controllers: [WidgetRegistryController],
  providers: [WidgetRegistryService, PrismaService],
  exports: [WidgetRegistryService],
})
export class WidgetsModule {}
