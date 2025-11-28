import { Test, TestingModule } from '@nestjs/testing';
import { CronJobsController } from './cron-jobs.controller';
import { CronJobsService } from './cron-jobs.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { PermissionsGuard } from '../auth/guards/permissions.guard';

describe('CronJobsController', () => {
  let controller: CronJobsController;
  let service: CronJobsService;

  const mockCronJobsService = {
    getAllJobs: jest.fn(),
    getJobById: jest.fn(),
    getJobLogs: jest.fn(),
    getJobStatistics: jest.fn(),
    enableJob: jest.fn(),
    disableJob: jest.fn(),
    triggerJobManually: jest.fn(),
    updateSchedule: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [CronJobsController],
      providers: [
        {
          provide: CronJobsService,
          useValue: mockCronJobsService,
        },
      ],
    })
      .overrideGuard(JwtAuthGuard)
      .useValue({ canActivate: jest.fn(() => true) })
      .overrideGuard(PermissionsGuard)
      .useValue({ canActivate: jest.fn(() => true) })
      .compile();

    controller = module.get<CronJobsController>(CronJobsController);
    service = module.get<CronJobsService>(CronJobsService);

    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  describe('getAllJobs', () => {
    it('should return all jobs', async () => {
      const mockJobs = [
        {
          id: '1',
          name: 'test-job',
          schedule: '0 */6 * * *',
          isEnabled: true,
        },
      ];

      mockCronJobsService.getAllJobs.mockResolvedValue(mockJobs);

      const result = await controller.getAllJobs();

      expect(result).toEqual(mockJobs);
      expect(service.getAllJobs).toHaveBeenCalled();
    });
  });

  describe('getJob', () => {
    it('should return a single job', async () => {
      const mockJob = {
        id: '1',
        name: 'test-job',
        schedule: '0 */6 * * *',
        isEnabled: true,
      };

      mockCronJobsService.getJobById.mockResolvedValue(mockJob);

      const result = await controller.getJob('1');

      expect(result).toEqual(mockJob);
      expect(service.getJobById).toHaveBeenCalledWith('1');
    });
  });

  describe('getJobLogs', () => {
    it('should return job logs', async () => {
      const mockLogs = [
        {
          id: 'log-1',
          jobId: '1',
          status: 'SUCCESS',
          startedAt: new Date(),
        },
      ];

      mockCronJobsService.getJobLogs.mockResolvedValue(mockLogs);

      const result = await controller.getJobLogs('1', {});

      expect(result).toEqual(mockLogs);
      expect(service.getJobLogs).toHaveBeenCalledWith('1', {});
    });
  });

  describe('getJobStatistics', () => {
    it('should return job statistics', async () => {
      const mockStats = {
        totalExecutions: 12,
        successRate: 83.33,
        averageDuration: 1500,
      };

      mockCronJobsService.getJobStatistics.mockResolvedValue(mockStats);

      const result = await controller.getJobStatistics('1');

      expect(result).toEqual(mockStats);
      expect(service.getJobStatistics).toHaveBeenCalledWith('1');
    });
  });

  describe('enableJob', () => {
    it('should enable a job', async () => {
      const mockJob = {
        id: '1',
        name: 'test-job',
        isEnabled: true,
      };

      mockCronJobsService.enableJob.mockResolvedValue(mockJob);

      const result = await controller.enableJob('1');

      expect(result).toEqual(mockJob);
      expect(service.enableJob).toHaveBeenCalledWith('1');
    });
  });

  describe('disableJob', () => {
    it('should disable a job', async () => {
      const mockJob = {
        id: '1',
        name: 'test-job',
        isEnabled: false,
      };

      mockCronJobsService.disableJob.mockResolvedValue(mockJob);

      const result = await controller.disableJob('1');

      expect(result).toEqual(mockJob);
      expect(service.disableJob).toHaveBeenCalledWith('1');
    });
  });

  describe('triggerJob', () => {
    it('should trigger a job manually', async () => {
      mockCronJobsService.triggerJobManually.mockResolvedValue(undefined);

      const result = await controller.triggerJob('1');

      expect(result).toEqual({ message: 'Job triggered successfully' });
      expect(service.triggerJobManually).toHaveBeenCalledWith('1');
    });
  });

  describe('updateSchedule', () => {
    it('should update job schedule', async () => {
      const mockJob = {
        id: '1',
        name: 'test-job',
        schedule: '0 */12 * * *',
      };

      mockCronJobsService.updateSchedule.mockResolvedValue(mockJob);

      const result = await controller.updateSchedule('1', {
        schedule: '0 */12 * * *',
      });

      expect(result).toEqual(mockJob);
      expect(service.updateSchedule).toHaveBeenCalledWith('1', '0 */12 * * *');
    });
  });
});
