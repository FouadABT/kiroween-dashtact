import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication } from '@nestjs/common';
import { PrismaService } from '../src/prisma/prisma.service';
import { NotificationDeliveryService } from '../src/notifications/notification-delivery.service';
import { NotificationsModule } from '../src/notifications/notifications.module';
import { PrismaModule } from '../src/prisma/prisma.module';
import {
  NotificationCategory,
  NotificationPriority,
  NotificationChannel,
  DeliveryStatus,
} from '@prisma/client';

describe('NotificationDeliveryService (e2e)', () => {
  let app: INestApplication;
  let prismaService: PrismaService;
  let deliveryService: NotificationDeliveryService;
  let testUserId: string;
  let testNotificationId: string;

  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [NotificationsModule, PrismaModule],
    }).compile();

    app = moduleFixture.createNestApplication();
    await app.init();

    prismaService = app.get<PrismaService>(PrismaService);
    deliveryService = app.get<NotificationDeliveryService>(
      NotificationDeliveryService,
    );

    // Create test user
    const testUser = await prismaService.user.findFirst();
    testUserId = testUser.id;
  });

  afterAll(async () => {
    // Clean up test data
    if (testNotificationId) {
      await prismaService.notificationDeliveryLog.deleteMany({
        where: { notificationId: testNotificationId },
      });
      await prismaService.notification.deleteMany({
        where: { id: testNotificationId },
      });
    }

    await app.close();
  });

  describe('Notification Delivery Flow', () => {
    it('should deliver notification successfully', async () => {
      // Create notification
      const notification = await prismaService.notification.create({
        data: {
          userId: testUserId,
          title: 'Test Delivery',
          message: 'Testing notification delivery',
          category: NotificationCategory.SYSTEM,
          priority: NotificationPriority.NORMAL,
          channel: NotificationChannel.IN_APP,
        },
      });

      testNotificationId = notification.id;

      // Deliver notification
      await deliveryService.deliver(notification);

      // Verify delivery log was created
      const deliveryLogs = await prismaService.notificationDeliveryLog.findMany(
        {
          where: { notificationId: notification.id },
        },
      );

      expect(deliveryLogs).toHaveLength(1);
      expect(deliveryLogs[0].status).toBe(DeliveryStatus.SENT);
      expect(deliveryLogs[0].channel).toBe(NotificationChannel.IN_APP);
      expect(deliveryLogs[0].sentAt).toBeDefined();
    });

    it('should respect user preferences', async () => {
      // Create preference to disable SYSTEM category
      await prismaService.notificationPreference.upsert({
        where: {
          userId_category: {
            userId: testUserId,
            category: NotificationCategory.SYSTEM,
          },
        },
        create: {
          userId: testUserId,
          category: NotificationCategory.SYSTEM,
          enabled: false,
        },
        update: {
          enabled: false,
        },
      });

      // Create notification
      const notification = await prismaService.notification.create({
        data: {
          userId: testUserId,
          title: 'Test Disabled Category',
          message: 'This should not be delivered',
          category: NotificationCategory.SYSTEM,
          priority: NotificationPriority.NORMAL,
          channel: NotificationChannel.IN_APP,
        },
      });

      // Deliver notification
      await deliveryService.deliver(notification);

      // Verify delivery log shows failure
      const deliveryLogs = await prismaService.notificationDeliveryLog.findMany(
        {
          where: { notificationId: notification.id },
        },
      );

      expect(deliveryLogs).toHaveLength(1);
      expect(deliveryLogs[0].status).toBe(DeliveryStatus.FAILED);
      expect(deliveryLogs[0].errorMessage).toContain('disabled');

      // Clean up
      await prismaService.notificationDeliveryLog.deleteMany({
        where: { notificationId: notification.id },
      });
      await prismaService.notification.delete({
        where: { id: notification.id },
      });

      // Re-enable category
      await prismaService.notificationPreference.update({
        where: {
          userId_category: {
            userId: testUserId,
            category: NotificationCategory.SYSTEM,
          },
        },
        data: {
          enabled: true,
        },
      });
    });

    it('should deliver urgent notifications during DND', async () => {
      // Enable DND for user
      await prismaService.notificationPreference.upsert({
        where: {
          userId_category: {
            userId: testUserId,
            category: NotificationCategory.SECURITY,
          },
        },
        create: {
          userId: testUserId,
          category: NotificationCategory.SECURITY,
          enabled: true,
          dndEnabled: true,
          dndStartTime: '00:00',
          dndEndTime: '23:59',
          dndDays: [0, 1, 2, 3, 4, 5, 6],
        },
        update: {
          dndEnabled: true,
          dndStartTime: '00:00',
          dndEndTime: '23:59',
          dndDays: [0, 1, 2, 3, 4, 5, 6],
        },
      });

      // Create urgent notification
      const notification = await prismaService.notification.create({
        data: {
          userId: testUserId,
          title: 'Urgent Security Alert',
          message: 'This should be delivered even during DND',
          category: NotificationCategory.SECURITY,
          priority: NotificationPriority.URGENT,
          channel: NotificationChannel.IN_APP,
        },
      });

      // Deliver notification
      await deliveryService.deliver(notification);

      // Verify delivery log shows success
      const deliveryLogs = await prismaService.notificationDeliveryLog.findMany(
        {
          where: { notificationId: notification.id },
        },
      );

      expect(deliveryLogs).toHaveLength(1);
      expect(deliveryLogs[0].status).toBe(DeliveryStatus.SENT);

      // Clean up
      await prismaService.notificationDeliveryLog.deleteMany({
        where: { notificationId: notification.id },
      });
      await prismaService.notification.delete({
        where: { id: notification.id },
      });

      // Disable DND
      await prismaService.notificationPreference.update({
        where: {
          userId_category: {
            userId: testUserId,
            category: NotificationCategory.SECURITY,
          },
        },
        data: {
          dndEnabled: false,
        },
      });
    });
  });

  describe('Delivery Log Management', () => {
    it('should create and retrieve delivery logs', async () => {
      const notification = await prismaService.notification.create({
        data: {
          userId: testUserId,
          title: 'Test Logs',
          message: 'Testing delivery logs',
          category: NotificationCategory.SYSTEM,
          priority: NotificationPriority.NORMAL,
          channel: NotificationChannel.IN_APP,
        },
      });

      // Create delivery log
      const log = await deliveryService.createDeliveryLog(
        notification.id,
        NotificationChannel.IN_APP,
        DeliveryStatus.SENT,
      );

      expect(log).toBeDefined();
      expect(log.notificationId).toBe(notification.id);
      expect(log.status).toBe(DeliveryStatus.SENT);

      // Retrieve logs
      const logs = await deliveryService.getDeliveryLogs(notification.id);

      expect(logs).toHaveLength(1);
      expect(logs[0].id).toBe(log.id);

      // Clean up
      await prismaService.notificationDeliveryLog.deleteMany({
        where: { notificationId: notification.id },
      });
      await prismaService.notification.delete({
        where: { id: notification.id },
      });
    });

    it('should update delivery log status', async () => {
      const notification = await prismaService.notification.create({
        data: {
          userId: testUserId,
          title: 'Test Update',
          message: 'Testing log updates',
          category: NotificationCategory.SYSTEM,
          priority: NotificationPriority.NORMAL,
          channel: NotificationChannel.IN_APP,
        },
      });

      // Create delivery log
      const log = await deliveryService.createDeliveryLog(
        notification.id,
        NotificationChannel.IN_APP,
        DeliveryStatus.SENT,
      );

      // Update to DELIVERED
      const updatedLog = await deliveryService.updateDeliveryLog(
        log.id,
        DeliveryStatus.DELIVERED,
      );

      expect(updatedLog.status).toBe(DeliveryStatus.DELIVERED);
      expect(updatedLog.deliveredAt).toBeDefined();
      expect(updatedLog.attempts).toBeGreaterThan(log.attempts);

      // Clean up
      await prismaService.notificationDeliveryLog.deleteMany({
        where: { notificationId: notification.id },
      });
      await prismaService.notification.delete({
        where: { id: notification.id },
      });
    });
  });

  describe('Delivery Statistics', () => {
    it('should calculate delivery statistics', async () => {
      // Create multiple notifications with different statuses
      const notification1 = await prismaService.notification.create({
        data: {
          userId: testUserId,
          title: 'Stats Test 1',
          message: 'Testing stats',
          category: NotificationCategory.SYSTEM,
          priority: NotificationPriority.NORMAL,
          channel: NotificationChannel.IN_APP,
        },
      });

      const notification2 = await prismaService.notification.create({
        data: {
          userId: testUserId,
          title: 'Stats Test 2',
          message: 'Testing stats',
          category: NotificationCategory.SYSTEM,
          priority: NotificationPriority.NORMAL,
          channel: NotificationChannel.IN_APP,
        },
      });

      // Create delivery logs
      await deliveryService.createDeliveryLog(
        notification1.id,
        NotificationChannel.IN_APP,
        DeliveryStatus.SENT,
      );

      const log2 = await deliveryService.createDeliveryLog(
        notification2.id,
        NotificationChannel.IN_APP,
        DeliveryStatus.SENT,
      );

      await deliveryService.updateDeliveryLog(
        log2.id,
        DeliveryStatus.DELIVERED,
      );

      // Get stats
      const stats = await deliveryService.getDeliveryStats(testUserId);

      expect(stats.total).toBeGreaterThanOrEqual(2);
      expect(stats.sent).toBeGreaterThanOrEqual(1);
      expect(stats.delivered).toBeGreaterThanOrEqual(1);

      // Clean up
      await prismaService.notificationDeliveryLog.deleteMany({
        where: {
          notificationId: {
            in: [notification1.id, notification2.id],
          },
        },
      });
      await prismaService.notification.deleteMany({
        where: {
          id: {
            in: [notification1.id, notification2.id],
          },
        },
      });
    });
  });
});
