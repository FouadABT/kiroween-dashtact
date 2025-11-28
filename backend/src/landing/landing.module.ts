import { Module } from '@nestjs/common';
import { LandingService } from './landing.service';
import { HeaderFooterService } from './header-footer.service';
import { TemplateService } from './template.service';
import { AnalyticsService } from './analytics.service';
import { HtmlSanitizerService } from './html-sanitizer.service';
import { LandingController } from './landing.controller';
import { AnalyticsController } from './analytics.controller';
import { PrismaService } from '../prisma/prisma.service';
import { PermissionsModule } from '../permissions/permissions.module';
import { UploadsModule } from '../uploads/uploads.module';

@Module({
  imports: [PermissionsModule, UploadsModule],
  controllers: [LandingController, AnalyticsController],
  providers: [
    LandingService,
    HeaderFooterService,
    TemplateService,
    AnalyticsService,
    HtmlSanitizerService,
    PrismaService,
  ],
  exports: [LandingService, HeaderFooterService, TemplateService, AnalyticsService],
})
export class LandingModule {}
