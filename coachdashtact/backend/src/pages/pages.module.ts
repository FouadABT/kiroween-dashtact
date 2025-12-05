import { Module } from '@nestjs/common';
import { PagesService } from './pages.service';
import { PagesController } from './pages.controller';
import { SlugService } from './slug.service';
import { RedirectService } from './redirect.service';
import { PrismaService } from '../prisma/prisma.service';
import { PermissionsModule } from '../permissions/permissions.module';
import { UploadsModule } from '../uploads/uploads.module';

@Module({
  imports: [PermissionsModule, UploadsModule],
  controllers: [PagesController],
  providers: [PagesService, SlugService, RedirectService, PrismaService],
  exports: [PagesService, SlugService, RedirectService],
})
export class PagesModule {}
