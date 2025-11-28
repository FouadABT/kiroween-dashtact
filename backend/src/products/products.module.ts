import { Module } from '@nestjs/common';
import { ProductsService } from './products.service';
import { ProductsController } from './products.controller';
import { PrismaService } from '../prisma/prisma.service';
import { PermissionsModule } from '../permissions/permissions.module';
import { AuthModule } from '../auth/auth.module';
import { ActivityLogModule } from '../activity-log/activity-log.module';
import { UploadsModule } from '../uploads/uploads.module';

@Module({
  imports: [PermissionsModule, AuthModule, ActivityLogModule, UploadsModule],
  providers: [ProductsService, PrismaService],
  controllers: [ProductsController],
  exports: [ProductsService],
})
export class ProductsModule {}
