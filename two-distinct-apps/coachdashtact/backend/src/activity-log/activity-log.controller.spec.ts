import { Test, TestingModule } from '@nestjs/testing';
import { NotFoundException } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { ActivityLogController } from './activity-log.controller';
import { ActivityLogService } from './activity-log.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { PermissionsGuard } from '../auth/guards/permissions.guard';
import { PermissionsService } from '../permissions/permissions.service';
import { AuditLoggingService } from '../auth/services/audit-logging.service';
import type { Request } from 'express';

describe('ActivityLogController', () => {
  let controller: ActivityLogController;
  let service: ActivityLogService;

  const mockActivityLogService = {
    logActivity: jest.fn(),
    findAll: jest.fn(),
    findOne: jest.fn(),
  };

  const mockPermissionsService = {
    userHasAllPermissions: jest.fn().mockResolvedValue(true),
  };

  const mockAuditLoggingService = {
    logPermissionDenied: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [ActivityLogController],
      providers: [
        {
          provide: ActivityLogService,
          useValue: mockActivityLogService,
        },
      ],
    })
      .overrideProvider(PermissionsService)
      .useValue(mockPermissionsService)
      .overrideProvider(AuditLoggingService)
      .useValue(mockAuditLoggingService)
      .compile();

    controller = module.get<ActivityLogController>(ActivityLogController);
    service = module.get<ActivityLogService>(ActivityLogService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  describe('create', () => {
    const mockRequest = {
      ip: '192.168.1.1',
      headers: { 'user-agent': 'Mozilla/5.0' },
    } as unknown as Request;

    it('should create an activity log', async () => {
      const dto = {
        action: 'USER_LOGIN',
        userId: 'user123',
      };

      const mockLog = {
        id: 'log123',
        action: 'USER_LOGIN',
        userId: 'user123',
        actorName: 'John Doe',
        entityType: null,
        entityId: null,
        metadata: null,
        ipAddress: '192.168.1.1',
        userAgent: 'Mozilla/5.0',
        createdAt: new Date(),
      };

      mockActivityLogService.logActivity.mockResolvedValue(mockLog);

      const result = await controller.create(dto, mockRequest);

      expect(result).toEqual(mockLog);
      expect(mockActivityLogService.logActivity).toHaveBeenCalledWith(
        dto,
        mockRequest,
      );
    });

    it('should handle activity log creation with metadata', async () => {
      const dto = {
        action: 'PRODUCT_CREATED',
        userId: 'user123',
        entityType: 'Product',
        entityId: 'prod123',
        metadata: { name: 'Test Product', price: 99.99 },
      };

      const mockLog = {
        id: 'log123',
        ...dto,
        actorName: 'John Doe',
        ipAddress: '192.168.1.1',
        userAgent: 'Mozilla/5.0',
        createdAt: new Date(),
      };

      mockActivityLogService.logActivity.mockResolvedValue(mockLog);

      const result = await controller.create(dto, mockRequest);

      expect(result).toEqual(mockLog);
      expect(mockActivityLogService.logActivity).toHaveBeenCalledWith(
        dto,
        mockRequest,
      );
    });

    it('should handle system events without userId', async () => {
      const dto = {
        action: 'SYSTEM_STARTUP',
      };

      const mockLog = {
        id: 'log123',
        action: 'SYSTEM_STARTUP',
        userId: null,
        actorName: 'System',
        entityType: null,
        entityId: null,
        metadata: null,
        ipAddress: null,
        userAgent: null,
        createdAt: new Date(),
      };

      mockActivityLogService.logActivity.mockResolvedValue(mockLog);

      const result = await controller.create(dto, mockRequest);

      expect(result).toEqual(mockLog);
    });
  });

  describe('findAll', () => {
    it('should return paginated logs with default parameters', async () => {
      const mockResponse = {
        data: [],
        total: 0,
        page: 1,
        limit: 50,
        totalPages: 0,
      };

      mockActivityLogService.findAll.mockResolvedValue(mockResponse);

      const result = await controller.findAll({});

      expect(result).toEqual(mockResponse);
      expect(mockActivityLogService.findAll).toHaveBeenCalledWith({});
    });

    it('should return paginated logs with custom parameters', async () => {
      const mockLogs = [
        {
          id: 'log1',
          action: 'USER_LOGIN',
          userId: 'user123',
          actorName: 'John Doe',
          entityType: 'User',
          entityId: 'user123',
          metadata: null,
          ipAddress: '192.168.1.1',
          userAgent: 'Mozilla/5.0',
          createdAt: new Date(),
        },
      ];

      const mockResponse = {
        data: mockLogs,
        total: 1,
        page: 1,
        limit: 10,
        totalPages: 1,
      };

      mockActivityLogService.findAll.mockResolvedValue(mockResponse);

      const query = { page: 1, limit: 10 };
      const result = await controller.findAll(query);

      expect(result).toEqual(mockResponse);
      expect(mockActivityLogService.findAll).toHaveBeenCalledWith(query);
    });

    it('should filter logs by userId', async () => {
      const mockResponse = {
        data: [],
        total: 0,
        page: 1,
        limit: 50,
        totalPages: 0,
      };

      mockActivityLogService.findAll.mockResolvedValue(mockResponse);

      const query = { userId: 'user123' };
      await controller.findAll(query);

      expect(mockActivityLogService.findAll).toHaveBeenCalledWith(query);
    });

    it('should filter logs by action', async () => {
      const mockResponse = {
        data: [],
        total: 0,
        page: 1,
        limit: 50,
        totalPages: 0,
      };

      mockActivityLogService.findAll.mockResolvedValue(mockResponse);

      const query = { action: 'USER_LOGIN' };
      await controller.findAll(query);

      expect(mockActivityLogService.findAll).toHaveBeenCalledWith(query);
    });

    it('should filter logs by entity type and id', async () => {
      const mockResponse = {
        data: [],
        total: 0,
        page: 1,
        limit: 50,
        totalPages: 0,
      };

      mockActivityLogService.findAll.mockResolvedValue(mockResponse);

      const query = { entityType: 'Product', entityId: 'prod123' };
      await controller.findAll(query);

      expect(mockActivityLogService.findAll).toHaveBeenCalledWith(query);
    });

    it('should filter logs by date range', async () => {
      const mockResponse = {
        data: [],
        total: 0,
        page: 1,
        limit: 50,
        totalPages: 0,
      };

      mockActivityLogService.findAll.mockResolvedValue(mockResponse);

      const query = {
        startDate: '2024-01-01',
        endDate: '2024-12-31',
      };
      await controller.findAll(query);

      expect(mockActivityLogService.findAll).toHaveBeenCalledWith(query);
    });
  });

  describe('findOne', () => {
    it('should return a single activity log by id', async () => {
      const mockLog = {
        id: 'log123',
        action: 'USER_LOGIN',
        userId: 'user123',
        actorName: 'John Doe',
        entityType: 'User',
        entityId: 'user123',
        metadata: null,
        ipAddress: '192.168.1.1',
        userAgent: 'Mozilla/5.0',
        createdAt: new Date(),
      };

      mockActivityLogService.findOne.mockResolvedValue(mockLog);

      const result = await controller.findOne('log123');

      expect(result).toEqual(mockLog);
      expect(mockActivityLogService.findOne).toHaveBeenCalledWith('log123');
    });

    it('should throw NotFoundException if log not found', async () => {
      mockActivityLogService.findOne.mockResolvedValue(null);

      await expect(controller.findOne('nonexistent')).rejects.toThrow(
        NotFoundException,
      );
      await expect(controller.findOne('nonexistent')).rejects.toThrow(
        'Activity log with ID nonexistent not found',
      );
    });
  });
});
