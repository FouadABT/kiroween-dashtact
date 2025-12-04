import { Module } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { SetupService } from './setup.service';
import { SetupController } from './setup.controller';

@Module({
  providers: [SetupService, PrismaService],
  controllers: [SetupController],
  exports: [SetupService],
})
export class SetupModule {}
