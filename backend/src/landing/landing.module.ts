import { Module } from '@nestjs/common';
import { LandingService } from './landing.service';
import { LandingController } from './landing.controller';
import { PrismaService } from '../prisma/prisma.service';
import { PermissionsModule } from '../permissions/permissions.module';
import { UploadsModule } from '../uploads/uploads.module';

@Module({
  imports: [PermissionsModule, UploadsModule],
  controllers: [LandingController],
  providers: [LandingService, PrismaService],
  exports: [LandingService],
})
export class LandingModule {}
