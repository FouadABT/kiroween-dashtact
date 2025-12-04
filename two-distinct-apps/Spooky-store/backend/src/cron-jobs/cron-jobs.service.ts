import {
  Injectable,
  Logger,
  NotFoundException,
  BadRequestException,
  OnModuleInit,
} from '@nestjs/common';
import { SchedulerRegistry } from '@nestjs/schedule';
import { CronJob as NestCronJob } from 'cron';
import { PrismaService } from '../prisma/prisma.service';
import { NotificationsService } from '../notifications/notifications.service';
import { ModuleRef } from '@nestjs/core';
import {
  CRON_JOB_METADATA_KEY,
  CRON_JOB_HANDLER_KEY,
  CronJobOptions,
} from './decorators/cron-job.decorator';
import { CronJob, CronLog, CronLogStatus } from '@prisma/client';
import { LogFiltersDto } from './dto/log-filters.dto';

@Injectable()
export class CronJobsService implements OnModuleInit {
  private readonly logger = new Logger(CronJobsService.name);
  private jobHandlers: Map<string, { instance: any; method: string }> =
    new Map();

  constructor(
    private prisma: PrismaService,
    private schedulerRegistry: SchedulerRegistry,
    private notificationsService: NotificationsService,
    private moduleRef: ModuleRef,
  ) {}

  async onModuleInit() {
    // Discover and register jobs on module initialization
    // Use setTimeout to ensure all modules are fully initialized
    setTimeout(() => {
      this.discoverAndRegisterJobs().catch((error) => {
        this.logger.error('Failed to discover cron jobs:', error);
      });
    }, 1000);
  }

  /**
   * Discover all methods decorated with @RegisterCronJob
   */
  async discoverAndRegisterJobs(): Promise<void> {
    this.logger.log('Discovering cron jobs...');

    try {
      // Get all providers from the module
      const modules = this.moduleRef['container'].getModules();

      for (const module of modules.values()) {
        const providers = module.providers;
        if (!providers) continue;

        for (const [, provider] of providers) {
          if (!provider || !provider.instance) continue;

          try {
            const instance = provider.instance;
            const prototype = Object.getPrototypeOf(instance);
            if (!prototype) continue;

            // Get all methods of the instance
            const methodNames = Object.getOwnPropertyNames(prototype).filter(
              (name) => {
                try {
                  return (
                    typeof prototype[name] === 'function' &&
                    name !== 'constructor'
                  );
                } catch {
                  return false;
                }
              },
            );

            for (const methodName of methodNames) {
              try {
                const options = Reflect.getMetadata(
                  CRON_JOB_METADATA_KEY,
                  prototype,
                  methodName,
                );
                const handler = Reflect.getMetadata(
                  CRON_JOB_HANDLER_KEY,
                  prototype,
                  methodName,
                );

                if (options && handler) {
                  await this.registerJob(options, instance, methodName, handler);
                }
              } catch (error) {
                // Skip methods that cause errors during metadata retrieval
                continue;
              }
            }
          } catch (error) {
            // Skip providers that cause errors
            continue;
          }
        }
      }

      this.logger.log(`Discovered ${this.jobHandlers.size} cron jobs`);
    } catch (error) {
      this.logger.error('Error during job discovery:', error);
      throw error;
    }
  }

  /**
   * Register a cron job
   */
  async registerJob(
    options: CronJobOptions,
    instance: any,
    methodName: string,
    handler: string,
  ): Promise<void> {
    try {
      // Validate cron expression
      try {
        new NestCronJob(options.schedule, () => {});
      } catch (error) {
        this.logger.warn(
          `Invalid cron expression for job ${options.name}: ${options.schedule}`,
        );
        return;
      }

      // Store handler reference
      this.jobHandlers.set(handler, { instance, method: methodName });

      // Create or update job in database
      const existingJob = await this.prisma.cronJob.findUnique({
        where: { name: options.name },
      });

      if (existingJob) {
        await this.prisma.cronJob.update({
          where: { name: options.name },
          data: {
            description: options.description,
            schedule: options.schedule,
            handler,
            isLocked: options.isLocked ?? false,
            notifyOnFailure: options.notifyOnFailure ?? true,
          },
        });
      } else {
        await this.prisma.cronJob.create({
          data: {
            name: options.name,
            description: options.description,
            schedule: options.schedule,
            handler,
            isLocked: options.isLocked ?? false,
            notifyOnFailure: options.notifyOnFailure ?? true,
          },
        });
      }

      // Schedule the job
      await this.scheduleJob(options.name);

      this.logger.log(`Registered cron job: ${options.name}`);
    } catch (error) {
      this.logger.error(`Failed to register job ${options.name}:`, error);
    }
  }

  /**
   * Schedule a job with the scheduler
   */
  private async scheduleJob(jobName: string): Promise<void> {
    const job = await this.prisma.cronJob.findUnique({
      where: { name: jobName },
    });

    if (!job || !job.isEnabled) {
      return;
    }

    // Remove existing scheduled job if any
    try {
      this.schedulerRegistry.deleteCronJob(jobName);
    } catch (error) {
      // Job doesn't exist, ignore
    }

    // Create new cron job
    const cronJob = new NestCronJob(job.schedule, async () => {
      await this.executeJob(job.id);
    });

    this.schedulerRegistry.addCronJob(jobName, cronJob);
    cronJob.start();

    // Update next run time
    const nextDate = cronJob.nextDate();
    await this.prisma.cronJob.update({
      where: { id: job.id },
      data: { nextRunAt: nextDate ? nextDate.toJSDate() : null },
    });
  }

  /**
   * Get all cron jobs
   */
  async getAllJobs(): Promise<CronJob[]> {
    return this.prisma.cronJob.findMany({
      orderBy: { name: 'asc' },
    });
  }

  /**
   * Get a single cron job by ID
   */
  async getJobById(id: string): Promise<CronJob> {
    const job = await this.prisma.cronJob.findUnique({
      where: { id },
    });

    if (!job) {
      throw new NotFoundException(`Cron job with ID ${id} not found`);
    }

    return job;
  }

  /**
   * Enable a cron job
   */
  async enableJob(id: string): Promise<CronJob> {
    const job = await this.getJobById(id);

    const updatedJob = await this.prisma.cronJob.update({
      where: { id },
      data: { isEnabled: true },
    });

    await this.scheduleJob(job.name);

    this.logger.log(`Enabled cron job: ${job.name}`);
    return updatedJob;
  }

  /**
   * Disable a cron job
   */
  async disableJob(id: string): Promise<CronJob> {
    const job = await this.getJobById(id);

    const updatedJob = await this.prisma.cronJob.update({
      where: { id },
      data: { isEnabled: false },
    });

    // Remove from scheduler
    try {
      this.schedulerRegistry.deleteCronJob(job.name);
    } catch (error) {
      // Job not scheduled, ignore
    }

    this.logger.log(`Disabled cron job: ${job.name}`);
    return updatedJob;
  }

  /**
   * Update job schedule
   */
  async updateSchedule(id: string, schedule: string): Promise<CronJob> {
    const job = await this.getJobById(id);

    if (job.isLocked) {
      throw new BadRequestException(
        'Cannot update schedule for locked job',
      );
    }

    // Validate cron expression
    try {
      new NestCronJob(schedule, () => {});
    } catch (error) {
      throw new BadRequestException('Invalid cron expression');
    }

    const updatedJob = await this.prisma.cronJob.update({
      where: { id },
      data: { schedule },
    });

    // Reschedule if enabled
    if (job.isEnabled) {
      await this.scheduleJob(job.name);
    }

    this.logger.log(`Updated schedule for job: ${job.name}`);
    return updatedJob;
  }

  /**
   * Trigger a job manually
   */
  async triggerJobManually(id: string): Promise<void> {
    const job = await this.getJobById(id);

    // Check if job is already running
    const runningLog = await this.prisma.cronLog.findFirst({
      where: {
        jobId: id,
        status: CronLogStatus.RUNNING,
      },
    });

    if (runningLog) {
      throw new BadRequestException(
        `Job ${job.name} is already running`,
      );
    }

    this.logger.log(`Manually triggering job: ${job.name}`);
    await this.executeJob(id);
  }

  /**
   * Execute a cron job
   */
  async executeJob(jobId: string): Promise<void> {
    const job = await this.getJobById(jobId);

    // Create execution log
    const log = await this.prisma.cronLog.create({
      data: {
        jobId,
        status: CronLogStatus.RUNNING,
      },
    });

    const startTime = Date.now();

    try {
      // Get handler
      const handlerInfo = this.jobHandlers.get(job.handler);
      if (!handlerInfo) {
        throw new Error(`Handler not found: ${job.handler}`);
      }

      // Execute the job
      await handlerInfo.instance[handlerInfo.method]();

      const duration = Date.now() - startTime;

      // Update log as success
      await this.prisma.cronLog.update({
        where: { id: log.id },
        data: {
          status: CronLogStatus.SUCCESS,
          completedAt: new Date(),
          duration,
        },
      });

      // Update job statistics
      await this.handleJobSuccess(jobId, duration);

      this.logger.log(`Job ${job.name} completed successfully in ${duration}ms`);
    } catch (error) {
      const duration = Date.now() - startTime;

      // Update log as failed
      await this.prisma.cronLog.update({
        where: { id: log.id },
        data: {
          status: CronLogStatus.FAILED,
          completedAt: new Date(),
          duration,
          error: error.message,
          stackTrace: error.stack,
        },
      });

      // Update job statistics and handle failure
      await this.handleJobFailure(jobId, error);

      this.logger.error(`Job ${job.name} failed:`, error);
    }
  }

  /**
   * Handle successful job execution
   */
  private async handleJobSuccess(jobId: string, duration: number): Promise<void> {
    const job = await this.getJobById(jobId);

    // Calculate new average duration
    const totalDuration =
      (job.averageDuration || 0) * job.successCount + duration;
    const newAverageDuration = totalDuration / (job.successCount + 1);

    await this.prisma.cronJob.update({
      where: { id: jobId },
      data: {
        lastRunAt: new Date(),
        successCount: { increment: 1 },
        consecutiveFailures: 0,
        averageDuration: newAverageDuration,
      },
    });

    // Send recovery notification if previously failing
    if (job.consecutiveFailures > 0 && job.notifyOnFailure) {
      await this.sendRecoveryNotification(job);
    }
  }

  /**
   * Handle failed job execution
   */
  private async handleJobFailure(jobId: string, error: Error): Promise<void> {
    const job = await this.getJobById(jobId);

    const newConsecutiveFailures = job.consecutiveFailures + 1;

    await this.prisma.cronJob.update({
      where: { id: jobId },
      data: {
        lastRunAt: new Date(),
        failureCount: { increment: 1 },
        consecutiveFailures: newConsecutiveFailures,
      },
    });

    // Send failure notification
    if (job.notifyOnFailure) {
      await this.sendFailureNotification(job, error, newConsecutiveFailures);
    }

    // Auto-disable after 3 consecutive failures
    if (newConsecutiveFailures >= 3) {
      await this.disableJob(jobId);
      await this.sendAutoDisableNotification(job);
    }
  }

  /**
   * Send failure notification to super admins
   */
  private async sendFailureNotification(
    job: CronJob,
    error: Error,
    consecutiveFailures: number,
  ): Promise<void> {
    try {
      // Get all super admin users
      const superAdminRole = await this.prisma.userRole.findFirst({
        where: { name: 'Super Admin' },
        include: { users: true },
      });

      if (!superAdminRole) return;

      for (const user of superAdminRole.users) {
        await this.notificationsService.create({
          userId: user.id,
          title: `Cron Job Failed: ${job.name}`,
          message: `The cron job "${job.name}" has failed. ${consecutiveFailures > 1 ? `This is failure #${consecutiveFailures}.` : ''}\n\nError: ${error.message}`,
          category: 'SYSTEM',
          priority: consecutiveFailures >= 2 ? 'HIGH' : 'NORMAL',
          metadata: {
            jobId: job.id,
            jobName: job.name,
            error: error.message,
            consecutiveFailures,
          },
        });
      }
    } catch (error) {
      this.logger.error('Failed to send failure notification:', error);
    }
  }

  /**
   * Send recovery notification to super admins
   */
  private async sendRecoveryNotification(job: CronJob): Promise<void> {
    try {
      const superAdminRole = await this.prisma.userRole.findFirst({
        where: { name: 'Super Admin' },
        include: { users: true },
      });

      if (!superAdminRole) return;

      for (const user of superAdminRole.users) {
        await this.notificationsService.create({
          userId: user.id,
          title: `Cron Job Recovered: ${job.name}`,
          message: `The cron job "${job.name}" has recovered and is now running successfully.`,
          category: 'SYSTEM',
          priority: 'NORMAL',
          metadata: {
            jobId: job.id,
            jobName: job.name,
          },
        });
      }
    } catch (error) {
      this.logger.error('Failed to send recovery notification:', error);
    }
  }

  /**
   * Send auto-disable notification to super admins
   */
  private async sendAutoDisableNotification(job: CronJob): Promise<void> {
    try {
      const superAdminRole = await this.prisma.userRole.findFirst({
        where: { name: 'Super Admin' },
        include: { users: true },
      });

      if (!superAdminRole) return;

      for (const user of superAdminRole.users) {
        await this.notificationsService.create({
          userId: user.id,
          title: `Cron Job Auto-Disabled: ${job.name}`,
          message: `The cron job "${job.name}" has been automatically disabled after 3 consecutive failures. Please investigate and re-enable manually.`,
          category: 'SYSTEM',
          priority: 'URGENT',
          metadata: {
            jobId: job.id,
            jobName: job.name,
          },
        });
      }
    } catch (error) {
      this.logger.error('Failed to send auto-disable notification:', error);
    }
  }

  /**
   * Get job execution logs
   */
  async getJobLogs(
    jobId: string,
    filters?: LogFiltersDto,
  ): Promise<CronLog[]> {
    await this.getJobById(jobId); // Verify job exists

    const where: any = { jobId };

    if (filters?.status) {
      where.status = filters.status;
    }

    if (filters?.startDate || filters?.endDate) {
      where.startedAt = {};
      if (filters.startDate) {
        where.startedAt.gte = new Date(filters.startDate);
      }
      if (filters.endDate) {
        where.startedAt.lte = new Date(filters.endDate);
      }
    }

    return this.prisma.cronLog.findMany({
      where,
      orderBy: { startedAt: 'desc' },
      take: filters?.limit || 50,
    });
  }

  /**
   * Get job statistics
   */
  async getJobStatistics(jobId: string): Promise<any> {
    const job = await this.getJobById(jobId);

    const totalExecutions = job.successCount + job.failureCount;
    const successRate =
      totalExecutions > 0 ? (job.successCount / totalExecutions) * 100 : 0;

    const lastSuccess = await this.prisma.cronLog.findFirst({
      where: { jobId, status: CronLogStatus.SUCCESS },
      orderBy: { startedAt: 'desc' },
    });

    const lastFailure = await this.prisma.cronLog.findFirst({
      where: { jobId, status: CronLogStatus.FAILED },
      orderBy: { startedAt: 'desc' },
    });

    return {
      totalExecutions,
      successCount: job.successCount,
      failureCount: job.failureCount,
      successRate: Math.round(successRate * 100) / 100,
      averageDuration: job.averageDuration,
      lastSuccess: lastSuccess?.startedAt,
      lastFailure: lastFailure?.startedAt,
      consecutiveFailures: job.consecutiveFailures,
      uptime: successRate,
    };
  }

  /**
   * Validate a cron expression and return next execution times
   */
  async validateSchedule(schedule: string): Promise<{
    valid: boolean;
    error?: string;
    nextExecutions?: string[];
  }> {
    try {
      const cronJob = new NestCronJob(schedule, () => {});
      
      // Get next 5 execution times
      const nextExecutions: string[] = [];
      let nextDate = cronJob.nextDate();
      
      for (let i = 0; i < 5; i++) {
        if (nextDate) {
          nextExecutions.push(nextDate.toJSDate().toISOString());
          nextDate = cronJob.nextDate();
        }
      }

      return {
        valid: true,
        nextExecutions,
      };
    } catch (error) {
      return {
        valid: false,
        error: error instanceof Error ? error.message : 'Invalid cron expression',
      };
    }
  }
}
