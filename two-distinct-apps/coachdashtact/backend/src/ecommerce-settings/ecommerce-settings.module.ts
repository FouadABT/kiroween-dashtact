import { Module } from '@nestjs/common';
import { EcommerceSettingsService } from './ecommerce-settings.service';
import { EcommerceSettingsController } from './ecommerce-settings.controller';
import { PrismaModule } from '../prisma/prisma.module';
import { PermissionsModule } from '../permissions/permissions.module';
import { AuthModule } from '../auth/auth.module';

@Module({
  imports: [PrismaModule, PermissionsModule, AuthModule],
  providers: [EcommerceSettingsService],
  controllers: [EcommerceSettingsController],
  exports: [EcommerceSettingsService],
})
export class EcommerceSettingsModule {}
