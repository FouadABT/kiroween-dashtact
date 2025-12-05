import { Module } from '@nestjs/common';
import { DashboardMenusService } from './dashboard-menus.service';
import { DashboardMenusController } from './dashboard-menus.controller';
import { MenuFilterService } from './menu-filter.service';
import { PrismaService } from '../prisma/prisma.service';
import { PermissionsModule } from '../permissions/permissions.module';
import { AuthModule } from '../auth/auth.module';
import { EcommerceSettingsModule } from '../ecommerce-settings/ecommerce-settings.module';

@Module({
  imports: [PermissionsModule, AuthModule, EcommerceSettingsModule],
  controllers: [DashboardMenusController],
  providers: [DashboardMenusService, MenuFilterService, PrismaService],
  exports: [DashboardMenusService],
})
export class DashboardMenusModule {}
