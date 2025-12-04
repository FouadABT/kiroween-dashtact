import { Module } from '@nestjs/common';
import { PrismaModule } from '../prisma/prisma.module';
import { PermissionsModule } from '../permissions/permissions.module';
import { CoachAvailabilityController } from './coach-availability.controller';
import { CoachAvailabilityService } from './coach-availability.service';

@Module({
  imports: [PrismaModule, PermissionsModule],
  controllers: [CoachAvailabilityController],
  providers: [CoachAvailabilityService],
  exports: [CoachAvailabilityService],
})
export class CoachAvailabilityModule {}
