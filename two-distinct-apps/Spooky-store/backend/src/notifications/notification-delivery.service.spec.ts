import { Test, TestingModule } from '@nestjs/testing';
import { NotificationDeliveryService } from './notification-delivery.service';
import { PrismaService } from '../prisma/prisma.service';
import { NotificationsService } from './notifications.service';
import { NotificationPreferencesService } from './notification-preferences.service';
import {
  Notification,
  NotificationChannel,
  DeliveryStatus,
  NotificationCategory,
  NotificationPriority,
} from '@prisma/client';

describe('NotificationDeliveryService', () => {
  let service: NotificationDeliveryService;
  let prismaService: PrismaService;
  let notificationsService: NotificationsService;
  let preferencesService: NotificationPreferencesService;

  const mockNotification: Notification = {
    id: 'notif-1',
    userId: 'user-1',
    title: 'Test Notification',
    message: 'Test message',
    category: NotificationCategory.SYSTEM,
    priority: NotificationPriority.NORMAL,
    metadata: null,
    actionUrl: null,
    actionLabel: null,
    imageUrl: null,
    channel: NotificationChannel.IN_APP,
    isRead: false,
    readAt: null,
    deletedAt: null,
    requiredPermission: null,
    createdAt: new Date(),
    updatedAt: new Date(),
    scheduledFor: null,
  };

  const mockDeliveryLog = {
    id: 'log-1',
    notificationId: 'notif-1',
    channel: NotificationChannel.IN_APP,
    status: DeliveryStatus.SENT,
    attempts: 1,
    externalId: null,
    errorMessage: null,
    errorCode: null,
    sentAt: new Date(),
    deliveredAt: null,
    failedAt: null,
    openedAt: null,
    clickedAt: null,
    createdAt: new Date(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        NotificationDeliveryService,
        {
          provide: PrismaService,
          useValue: {
            notificationDeliveryLog: {
              create: jest.fn(),
              update: jest.fn(),
              findMany: jest.fn(),
            },
            notification: {
              findMany: jest.fn(),
            },
          },
        },
        {
          provide: NotificationsService,
          useValue: {
            create: jest.fn(),
            findAll: jest.fn(),
          },
        },
        {
          provide: NotificationPreferencesService,
          useValue: {
            getPreference: jest.fn(),
            isInDNDPeriod: jest.fn(),
          },
        },
      ],
    }).compile();

    service = module.get<NotificationDeliveryService>(
      NotificationDeliveryService,
    );
    prismaService = module.get<PrismaService>(PrismaService);
    notificationsService = module.get<NotificationsService>(
      NotificationsService,
    );
    preferencesService = module.get<NotificationPreferencesService>(
      NotificationPreferencesService,
    );
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('deliver', () => {
    it('should deliver notification when preferences allow', async () => {
      jest.spyOn(preferencesService, 'getPreference').mockResolvedValue({
        id: 'pref-1',
        userId: 'user-1',
        category: NotificationCategory.SYSTEM,
        enabled: true,
        dndEnabled: false,
        dndStartTime: null,
        dndEndTime: null,
        dndDays: [],
        createdAt: new Date(),
        updatedAt: new Date(),
      });

      jest.spyOn(preferencesService, 'isInDNDPeriod').mockResolvedValue(false);

      jest
        .spyOn(prismaService.notificationDeliveryLog, 'create')
        .mockResolvedValue(mockDeliveryLog);

      await service.deliver(mockNotification);

      expect(preferencesService.getPreference).toHaveBeenCalledWith(
        'user-1',
        NotificationCategory.SYSTEM,
      );
      expect(preferencesService.isInDNDPeriod).toHaveBeenCalledWith('user-1');
      expect(prismaService.notificationDeliveryLog.create).toHaveBeenCalled();
    });

    it('should not deliver when category is disabled', async () => {
      jest.spyOn(preferencesService, 'getPreference').mockResolvedValue({
        id: 'pref-1',
        userId: 'user-1',
        category: NotificationCategory.SYSTEM,
        enabled: false,
        dndEnabled: false,
        dndStartTime: null,
        dndEndTime: null,
        dndDays: [],
        createdAt: new Date(),
        updatedAt: new Date(),
      });

      jest
        .spyOn(prismaService.notificationDeliveryLog, 'create')
        .mockResolvedValue({
          ...mockDeliveryLog,
          status: DeliveryStatus.FAILED,
          errorMessage: 'Category disabled in user preferences',
        });

      await service.deliver(mockNotification);

      expect(prismaService.notificationDeliveryLog.create).toHaveBeenCalledWith(
        expect.objectContaining({
          data: expect.objectContaining({
            status: DeliveryStatus.FAILED,
            errorMessage: 'Category disabled in user preferences',
          }),
        }),
      );
    });

    it('should not deliver non-urgent notifications during DND', async () => {
      jest.spyOn(preferencesService, 'getPreference').mockResolvedValue({
        id: 'pref-1',
        userId: 'user-1',
        category: NotificationCategory.SYSTEM,
        enabled: true,
        dndEnabled: true,
        dndStartTime: '22:00',
        dndEndTime: '08:00',
        dndDays: [0, 1, 2, 3, 4, 5, 6],
        createdAt: new Date(),
        updatedAt: new Date(),
      });

      jest.spyOn(preferencesService, 'isInDNDPeriod').mockResolvedValue(true);

      jest
        .spyOn(prismaService.notificationDeliveryLog, 'create')
        .mockResolvedValue({
          ...mockDeliveryLog,
          status: DeliveryStatus.FAILED,
          errorMessage: 'User in Do Not Disturb mode',
        });

      await service.deliver(mockNotification);

      expect(prismaService.notificationDeliveryLog.create).toHaveBeenCalledWith(
        expect.objectContaining({
          data: expect.objectContaining({
            status: DeliveryStatus.FAILED,
            errorMessage: 'User in Do Not Disturb mode',
          }),
        }),
      );
    });

    it('should deliver urgent notifications during DND', async () => {
      const urgentNotification = {
        ...mockNotification,
        priority: NotificationPriority.URGENT,
      };

      jest.spyOn(preferencesService, 'getPreference').mockResolvedValue({
        id: 'pref-1',
        userId: 'user-1',
        category: NotificationCategory.SYSTEM,
        enabled: true,
        dndEnabled: true,
        dndStartTime: '22:00',
        dndEndTime: '08:00',
        dndDays: [0, 1, 2, 3, 4, 5, 6],
        createdAt: new Date(),
        updatedAt: new Date(),
      });

      jest.spyOn(preferencesService, 'isInDNDPeriod').mockResolvedValue(true);

      jest
        .spyOn(prismaService.notificationDeliveryLog, 'create')
        .mockResolvedValue(mockDeliveryLog);

      await service.deliver(urgentNotification);

      expect(prismaService.notificationDeliveryLog.create).toHaveBeenCalledWith(
        expect.objectContaining({
          data: expect.objectContaining({
            status: DeliveryStatus.SENT,
          }),
        }),
      );
    });
  });

  describe('deliverInApp', () => {
    it('should create delivery log for in-app notification', async () => {
      jest
        .spyOn(prismaService.notificationDeliveryLog, 'create')
        .mockResolvedValue(mockDeliveryLog);

      await service.deliverInApp(mockNotification);

      expect(prismaService.notificationDeliveryLog.create).toHaveBeenCalledWith(
        expect.objectContaining({
          data: expect.objectContaining({
            notificationId: 'notif-1',
            channel: NotificationChannel.IN_APP,
            status: DeliveryStatus.SENT,
          }),
        }),
      );
    });
  });

  describe('checkPreferences', () => {
    it('should return enabled status from preferences', async () => {
      jest.spyOn(preferencesService, 'getPreference').mockResolvedValue({
        id: 'pref-1',
        userId: 'user-1',
        category: NotificationCategory.SYSTEM,
        enabled: true,
        dndEnabled: false,
        dndStartTime: null,
        dndEndTime: null,
        dndDays: [],
        createdAt: new Date(),
        updatedAt: new Date(),
      });

      const result = await service.checkPreferences(
        'user-1',
        NotificationCategory.SYSTEM,
      );

      expect(result.enabled).toBe(true);
    });

    it('should default to enabled if preference not found', async () => {
      jest.spyOn(preferencesService, 'getPreference').mockResolvedValue(null);

      const result = await service.checkPreferences(
        'user-1',
        NotificationCategory.SYSTEM,
      );

      expect(result.enabled).toBe(true);
    });

    it('should default to enabled on error', async () => {
      jest
        .spyOn(preferencesService, 'getPreference')
        .mockRejectedValue(new Error('Database error'));

      const result = await service.checkPreferences(
        'user-1',
        NotificationCategory.SYSTEM,
      );

      expect(result.enabled).toBe(true);
    });
  });

  describe('checkDND', () => {
    it('should return DND status', async () => {
      jest.spyOn(preferencesService, 'isInDNDPeriod').mockResolvedValue(true);

      const result = await service.checkDND('user-1');

      expect(result).toBe(true);
    });

    it('should default to false on error', async () => {
      jest
        .spyOn(preferencesService, 'isInDNDPeriod')
        .mockRejectedValue(new Error('Database error'));

      const result = await service.checkDND('user-1');

      expect(result).toBe(false);
    });
  });

  describe('createDeliveryLog', () => {
    it('should create delivery log with SENT status', async () => {
      jest
        .spyOn(prismaService.notificationDeliveryLog, 'create')
        .mockResolvedValue(mockDeliveryLog);

      const result = await service.createDeliveryLog(
        'notif-1',
        NotificationChannel.IN_APP,
        DeliveryStatus.SENT,
      );

      expect(result).toEqual(mockDeliveryLog);
      expect(prismaService.notificationDeliveryLog.create).toHaveBeenCalledWith(
        expect.objectContaining({
          data: expect.objectContaining({
            notificationId: 'notif-1',
            channel: NotificationChannel.IN_APP,
            status: DeliveryStatus.SENT,
            sentAt: expect.any(Date),
          }),
        }),
      );
    });

    it('should create delivery log with FAILED status and error message', async () => {
      const failedLog = {
        ...mockDeliveryLog,
        status: DeliveryStatus.FAILED,
        errorMessage: 'Delivery failed',
        failedAt: new Date(),
      };

      jest
        .spyOn(prismaService.notificationDeliveryLog, 'create')
        .mockResolvedValue(failedLog);

      const result = await service.createDeliveryLog(
        'notif-1',
        NotificationChannel.IN_APP,
        DeliveryStatus.FAILED,
        'Delivery failed',
      );

      expect(result.status).toBe(DeliveryStatus.FAILED);
      expect(result.errorMessage).toBe('Delivery failed');
    });
  });

  describe('updateDeliveryLog', () => {
    it('should update delivery log status', async () => {
      const updatedLog = {
        ...mockDeliveryLog,
        status: DeliveryStatus.DELIVERED,
        deliveredAt: new Date(),
        attempts: 2,
      };

      jest
        .spyOn(prismaService.notificationDeliveryLog, 'update')
        .mockResolvedValue(updatedLog);

      const result = await service.updateDeliveryLog(
        'log-1',
        DeliveryStatus.DELIVERED,
      );

      expect(result.status).toBe(DeliveryStatus.DELIVERED);
      expect(prismaService.notificationDeliveryLog.update).toHaveBeenCalledWith(
        expect.objectContaining({
          where: { id: 'log-1' },
          data: expect.objectContaining({
            status: DeliveryStatus.DELIVERED,
            deliveredAt: expect.any(Date),
          }),
        }),
      );
    });
  });

  describe('getDeliveryLogs', () => {
    it('should return delivery logs for notification', async () => {
      const logs = [mockDeliveryLog];

      jest
        .spyOn(prismaService.notificationDeliveryLog, 'findMany')
        .mockResolvedValue(logs);

      const result = await service.getDeliveryLogs('notif-1');

      expect(result).toEqual(logs);
      expect(
        prismaService.notificationDeliveryLog.findMany,
      ).toHaveBeenCalledWith({
        where: { notificationId: 'notif-1' },
        orderBy: { createdAt: 'desc' },
      });
    });
  });

  describe('getDeliveryStats', () => {
    it('should return delivery statistics', async () => {
      const notifications = [
        {
          ...mockNotification,
          deliveryLogs: [
            { ...mockDeliveryLog, status: DeliveryStatus.SENT },
            { ...mockDeliveryLog, status: DeliveryStatus.DELIVERED },
          ],
        },
        {
          ...mockNotification,
          id: 'notif-2',
          deliveryLogs: [
            { ...mockDeliveryLog, status: DeliveryStatus.FAILED },
          ],
        },
      ];

      jest
        .spyOn(prismaService.notification, 'findMany')
        .mockResolvedValue(notifications as any);

      const result = await service.getDeliveryStats('user-1');

      expect(result).toEqual({
        total: 2,
        sent: 1,
        delivered: 1,
        failed: 1,
        opened: 0,
        clicked: 0,
      });
    });
  });
});
