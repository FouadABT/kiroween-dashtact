import { Test, TestingModule } from '@nestjs/testing';
import { CronJobsService } from './cron-jobs.service';
import { PrismaService } from '../prisma/prisma.service';
import { NotificationsService } from '../notifications/notifications.service';
import { SchedulerRegistry } from '@nestjs/schedule';
import { ModuleRef } from '@nestjs/core';
import { BadRequestException, NotFoundException } from '@nestjs/common';
import { CronLogStatus } from '@prisma/client';

describe('CronJobsService', () => {
  let service: CronJobsService;
  let prisma: PrismaService;
  let notificationsService: NotificationsService;
  let schedulerRegistry: SchedulerRegistry;

  const mockPrismaService = {
    cronJob: {
      findMany: jest.fn(),
      findUnique: jest.fn(),
      findFirst: jest.fn(),
      create: jest.fn(),
      update: jest.fn(),
    },
    cronLog: {
      findFirst: jest.fn(),
      findMany: jest.fn(),
      create: jest.fn(),
      update: jest.fn(),
    },
    userRole: {
      findFirst: jest.fn(),
    },
  };

  const mockNotificationsService = {
    create: jest.fn(),
  };

  const mockSchedulerRegistry = {
    addCronJob: jest.fn(),
    deleteCronJob: jest.fn(),
  };

  const mockModuleRef = {
    container: {
      getModules: jest.fn().mockReturnValue({
        values: jest.fn().mockReturnValue([]),
      }),
    },
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        CronJobsService,
        {
          provide: PrismaService,
          useValue: mockPrismaService,
        },
        {
          provide: NotificationsService,
          useValue: mockNotificationsService,
        },
        {
          provide: SchedulerRegistry,
          useValue: mockSchedulerRegistry,
        },
        {
          provide: ModuleRef,
          useValue: mockModuleRef,
        },
      ],
    }).compile();

    service = module.get<CronJobsService>(CronJobsService);
    prisma = module.get<PrismaService>(PrismaService);
    notificationsService = module.get<NotificationsService>(NotificationsService);
    schedulerRegistry = module.get<SchedulerRegistry>(SchedulerRegistry);

    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('getAllJobs', () => {
    it('should return all cron jobs', async () => {
      const mockJobs = [
        {
          id: '1',
          name: 'test-job',
          schedule: '0 */6 * * *',
          isEnabled: true,
        },
      ];

      mockPrismaService.cronJob.findMany.mockResolvedValue(mockJobs);

      const result = await service.getAllJobs();

      expect(result).toEqual(mockJobs);
      expect(prisma.cronJob.findMany).toHaveBeenCalledWith({
        orderBy: { name: 'asc' },
      });
    });
  });

  describe('getJobById', () => {
    it('should return a job by id', async () => {
      const mockJob = {
        id: '1',
        name: 'test-job',
        schedule: '0 */6 * * *',
        isEnabled: true,
      };

      mockPrismaService.cronJob.findUnique.mockResolvedValue(mockJob);

      const result = await service.getJobById('1');

      expect(result).toEqual(mockJob);
      expect(prisma.cronJob.findUnique).toHaveBeenCalledWith({
        where: { id: '1' },
      });
    });

    it('should throw NotFoundException if job not found', async () => {
      mockPrismaService.cronJob.findUnique.mockResolvedValue(null);

      await expect(service.getJobById('999')).rejects.toThrow(NotFoundException);
    });
  });

  describe('enableJob', () => {
    it('should enable a disabled job', async () => {
      const mockJob = {
        id: '1',
        name: 'test-job',
        schedule: '0 */6 * * *',
        isEnabled: false,
      };

      const updatedJob = { ...mockJob, isEnabled: true };

      mockPrismaService.cronJob.findUnique.mockResolvedValue(mockJob);
      mockPrismaService.cronJob.update.mockResolvedValue(updatedJob);

      const result = await service.enableJob('1');

      expect(result.isEnabled).toBe(true);
      expect(prisma.cronJob.update).toHaveBeenCalledWith({
        where: { id: '1' },
        data: { isEnabled: true },
      });
    });
  });

  describe('disableJob', () => {
    it('should disable an enabled job', async () => {
      const mockJob = {
        id: '1',
        name: 'test-job',
        schedule: '0 */6 * * *',
        isEnabled: true,
      };

      const updatedJob = { ...mockJob, isEnabled: false };

      mockPrismaService.cronJob.findUnique.mockResolvedValue(mockJob);
      mockPrismaService.cronJob.update.mockResolvedValue(updatedJob);

      const result = await service.disableJob('1');

      expect(result.isEnabled).toBe(false);
      expect(prisma.cronJob.update).toHaveBeenCalledWith({
        where: { id: '1' },
        data: { isEnabled: false },
      });
    });
  });

  describe('updateSchedule', () => {
    it('should update job schedule', async () => {
      const mockJob = {
        id: '1',
        name: 'test-job',
        schedule: '0 */6 * * *',
        isEnabled: true,
        isLocked: false,
      };

      const newSchedule = '0 */12 * * *';
      const updatedJob = { ...mockJob, schedule: newSchedule };

      mockPrismaService.cronJob.findUnique.mockResolvedValue(mockJob);
      mockPrismaService.cronJob.update.mockResolvedValue(updatedJob);

      const result = await service.updateSchedule('1', newSchedule);

      expect(result.schedule).toBe(newSchedule);
      expect(prisma.cronJob.update).toHaveBeenCalledWith({
        where: { id: '1' },
        data: { schedule: newSchedule },
      });
    });

    it('should throw BadRequestException for locked jobs', async () => {
      const mockJob = {
        id: '1',
        name: 'test-job',
        schedule: '0 */6 * * *',
        isEnabled: true,
        isLocked: true,
      };

      mockPrismaService.cronJob.findUnique.mockResolvedValue(mockJob);

      await expect(service.updateSchedule('1', '0 */12 * * *')).rejects.toThrow(
        BadRequestException,
      );
    });

    it('should throw BadRequestException for invalid cron expression', async () => {
      const mockJob = {
        id: '1',
        name: 'test-job',
        schedule: '0 */6 * * *',
        isEnabled: true,
        isLocked: false,
      };

      mockPrismaService.cronJob.findUnique.mockResolvedValue(mockJob);

      await expect(service.updateSchedule('1', 'invalid')).rejects.toThrow(
        BadRequestException,
      );
    });
  });

  describe('triggerJobManually', () => {
    it('should trigger a job manually', async () => {
      const mockJob = {
        id: '1',
        name: 'test-job',
        schedule: '0 */6 * * *',
        isEnabled: true,
        handler: 'TestService.testMethod',
      };

      mockPrismaService.cronJob.findUnique.mockResolvedValue(mockJob);
      mockPrismaService.cronLog.findFirst.mockResolvedValue(null);
      mockPrismaService.cronLog.create.mockResolvedValue({
        id: 'log-1',
        jobId: '1',
        status: CronLogStatus.RUNNING,
      });

      // Mock handler not found to avoid execution
      await expect(service.triggerJobManually('1')).resolves.not.toThrow();
    });

    it('should throw BadRequestException if job is already running', async () => {
      const mockJob = {
        id: '1',
        name: 'test-job',
        schedule: '0 */6 * * *',
        isEnabled: true,
      };

      const runningLog = {
        id: 'log-1',
        jobId: '1',
        status: CronLogStatus.RUNNING,
      };

      mockPrismaService.cronJob.findUnique.mockResolvedValue(mockJob);
      mockPrismaService.cronLog.findFirst.mockResolvedValue(runningLog);

      await expect(service.triggerJobManually('1')).rejects.toThrow(
        BadRequestException,
      );
    });
  });

  describe('getJobLogs', () => {
    it('should return job logs', async () => {
      const mockJob = {
        id: '1',
        name: 'test-job',
      };

      const mockLogs = [
        {
          id: 'log-1',
          jobId: '1',
          status: CronLogStatus.SUCCESS,
          startedAt: new Date(),
        },
      ];

      mockPrismaService.cronJob.findUnique.mockResolvedValue(mockJob);
      mockPrismaService.cronLog.findMany.mockResolvedValue(mockLogs);

      const result = await service.getJobLogs('1');

      expect(result).toEqual(mockLogs);
      expect(prisma.cronLog.findMany).toHaveBeenCalled();
    });

    it('should filter logs by status', async () => {
      const mockJob = {
        id: '1',
        name: 'test-job',
      };

      mockPrismaService.cronJob.findUnique.mockResolvedValue(mockJob);
      mockPrismaService.cronLog.findMany.mockResolvedValue([]);

      await service.getJobLogs('1', { status: 'SUCCESS' });

      expect(prisma.cronLog.findMany).toHaveBeenCalledWith(
        expect.objectContaining({
          where: expect.objectContaining({
            jobId: '1',
            status: 'SUCCESS',
          }),
        }),
      );
    });
  });

  describe('getJobStatistics', () => {
    it('should return job statistics', async () => {
      const mockJob = {
        id: '1',
        name: 'test-job',
        successCount: 10,
        failureCount: 2,
        averageDuration: 1500,
        consecutiveFailures: 0,
      };

      mockPrismaService.cronJob.findUnique.mockResolvedValue(mockJob);
      mockPrismaService.cronLog.findFirst
        .mockResolvedValueOnce({ startedAt: new Date() }) // last success
        .mockResolvedValueOnce({ startedAt: new Date() }); // last failure

      const result = await service.getJobStatistics('1');

      expect(result).toHaveProperty('totalExecutions', 12);
      expect(result).toHaveProperty('successRate');
      expect(result).toHaveProperty('averageDuration', 1500);
    });
  });
});
