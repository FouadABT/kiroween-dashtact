import { Module } from '@nestjs/common';
import { LegalPagesController } from './legal-pages.controller';
import { LegalPagesService } from './legal-pages.service';
import { PrismaModule } from '../prisma/prisma.module';
import { PermissionsModule } from '../permissions/permissions.module';

@Module({
  imports: [PrismaModule, PermissionsModule],
  controllers: [LegalPagesController],
  providers: [LegalPagesService],
  exports: [LegalPagesService],
})
export class LegalPagesModule {}
