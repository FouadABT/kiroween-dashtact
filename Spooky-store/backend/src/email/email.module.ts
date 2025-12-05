import { Module } from '@nestjs/common';
import { ScheduleModule } from '@nestjs/schedule';
import { EmailController } from './email.controller';
import { EmailService } from './email.service';
import { EmailEncryptionService } from './services/email-encryption.service';
import { SmtpService } from './services/smtp.service';
import { EmailQueueService } from './services/email-queue.service';
import { EmailTemplateService } from './services/email-template.service';
import { EmailQueueProcessor } from './processors/email-queue.processor';
import { SuperAdminGuard } from './guards/super-admin.guard';
import { PrismaModule } from '../prisma/prisma.module';

@Module({
  imports: [PrismaModule, ScheduleModule.forRoot()],
  controllers: [EmailController],
  providers: [
    EmailService,
    EmailEncryptionService,
    SmtpService,
    EmailQueueService,
    EmailTemplateService,
    EmailQueueProcessor,
    SuperAdminGuard,
  ],
  exports: [EmailService, EmailTemplateService],
})
export class EmailModule {}
