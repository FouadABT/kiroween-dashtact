import { Module } from '@nestjs/common';
import { DashboardLayoutsService } from './dashboard-layouts.service';
import { DashboardLayoutsController } from './dashboard-layouts.controller';
import { PrismaService } from '../prisma/prisma.service';
import { PermissionsModule } from '../permissions/permissions.module';
import { AuthModule } from '../auth/auth.module';

@Module({
  imports: [PermissionsModule, AuthModule],
  controllers: [DashboardLayoutsController],
  providers: [DashboardLayoutsService, PrismaService],
  exports: [DashboardLayoutsService],
})
export class DashboardLayoutsModule {}
