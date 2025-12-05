import { Injectable, Logger } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';

export interface QueueEmailOptions {
  recipient: string;
  subject: string;
  htmlBody?: string;
  textBody?: string;
  templateId?: string;
  templateData?: Record<string, any>;
  priority?: number;
  metadata?: Record<string, any>;
}

@Injectable()
export class EmailQueueService {
  private readonly logger = new Logger(EmailQueueService.name);

  constructor(private prisma: PrismaService) {}

  async addToQueue(options: QueueEmailOptions): Promise<string> {
    const queueItem = await this.prisma.emailQueue.create({
      data: {
        recipient: options.recipient,
        subject: options.subject,
        htmlBody: options.htmlBody,
        textBody: options.textBody,
        templateId: options.templateId,
        templateData: options.templateData,
        priority: options.priority || 5,
        status: 'PENDING',
        nextAttemptAt: new Date(),
        metadata: options.metadata,
      },
    });

    this.logger.log(`Email queued: ${queueItem.id} for ${options.recipient}`);
    return queueItem.id;
  }

  async getPendingEmails(limit: number = 10) {
    const now = new Date();

    return this.prisma.emailQueue.findMany({
      where: {
        status: 'PENDING',
        nextAttemptAt: {
          lte: now,
        },
        attempts: {
          lt: this.prisma.emailQueue.fields.maxAttempts,
        },
      },
      orderBy: [
        { priority: 'asc' }, // Lower number = higher priority
        { createdAt: 'asc' },
      ],
      take: limit,
    });
  }

  async markAsProcessing(id: string) {
    return this.prisma.emailQueue.update({
      where: { id },
      data: {
        status: 'PROCESSING',
        lastAttemptAt: new Date(),
        attempts: {
          increment: 1,
        },
      },
    });
  }

  async markAsSent(id: string) {
    return this.prisma.emailQueue.update({
      where: { id },
      data: {
        status: 'SENT',
      },
    });
  }

  async markAsFailed(id: string, error: string, shouldRetry: boolean) {
    const queueItem = await this.prisma.emailQueue.findUnique({
      where: { id },
    });

    if (!queueItem) {
      return;
    }

    const attempts = queueItem.attempts;
    const maxAttempts = queueItem.maxAttempts;

    if (attempts >= maxAttempts || !shouldRetry) {
      // Permanently failed
      return this.prisma.emailQueue.update({
        where: { id },
        data: {
          status: 'FAILED',
          error,
        },
      });
    } else {
      // Retry with exponential backoff
      const backoffMinutes = Math.pow(2, attempts) * 5; // 5, 10, 20 minutes
      const nextAttemptAt = new Date(Date.now() + backoffMinutes * 60 * 1000);

      return this.prisma.emailQueue.update({
        where: { id },
        data: {
          status: 'PENDING',
          error,
          nextAttemptAt,
        },
      });
    }
  }

  async getQueueStats() {
    const [pending, processing, sent, failed] = await Promise.all([
      this.prisma.emailQueue.count({ where: { status: 'PENDING' } }),
      this.prisma.emailQueue.count({ where: { status: 'PROCESSING' } }),
      this.prisma.emailQueue.count({ where: { status: 'SENT' } }),
      this.prisma.emailQueue.count({ where: { status: 'FAILED' } }),
    ]);

    return {
      pending,
      processing,
      sent,
      failed,
      total: pending + processing + sent + failed,
    };
  }

  async cleanupOldEntries(daysOld: number = 30) {
    const cutoffDate = new Date();
    cutoffDate.setDate(cutoffDate.getDate() - daysOld);

    const result = await this.prisma.emailQueue.deleteMany({
      where: {
        status: {
          in: ['SENT', 'FAILED'],
        },
        createdAt: {
          lt: cutoffDate,
        },
      },
    });

    this.logger.log(`Cleaned up ${result.count} old queue entries`);
    return result.count;
  }
}
