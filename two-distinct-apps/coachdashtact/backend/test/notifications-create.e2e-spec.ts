import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication, ValidationPipe } from '@nestjs/common';
import * as request from 'supertest';
import { AppModule } from '../src/app.module';
import { PrismaService } from '../src/prisma/prisma.service';
import { NotificationCategory, NotificationPriority, NotificationChannel } from '@prisma/client';

describe('Notifications Create (e2e)', () => {
  let app: INestApplication;
  let prisma: PrismaService;
  let authToken: string;
  let testUserId: string;
  let adminToken: string;

  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleFixture.createNestApplication();
    app.useGlobalPipes(new ValidationPipe({ whitelist: true, transform: true }));
    await app.init();

    prisma = app.get<PrismaService>(PrismaService);

    // Create test user and get auth token
    const userRole = await prisma.userRole.findUnique({
      where: { name: 'User' },
    });

    const testUser = await prisma.user.create({
      data: {
        email: 'test-notif-create@example.com',
        password: '$2b$10$abcdefghijklmnopqrstuvwxyz', // hashed password
        name: 'Test User',
        roleId: userRole!.id,
      },
    });

    testUserId = testUser.id;

    // Login to get token
    const loginResponse = await request(app.getHttpServer())
      .post('/auth/login')
      .send({
        email: 'test-notif-create@example.com',
        password: 'password123',
      });

    authToken = loginResponse.body.accessToken;

    // Create admin user for write permissions
    const adminRole = await prisma.userRole.findUnique({
      where: { name: 'Admin' },
    });

    const adminUser = await prisma.user.create({
      data: {
        email: 'admin-notif-create@example.com',
        password: '$2b$10$abcdefghijklmnopqrstuvwxyz',
        name: 'Admin User',
        roleId: adminRole!.id,
      },
    });

    const adminLoginResponse = await request(app.getHttpServer())
      .post('/auth/login')
      .send({
        email: 'admin-notif-create@example.com',
        password: 'password123',
      });

    adminToken = adminLoginResponse.body.accessToken;
  });

  afterAll(async () => {
    // Cleanup
    await prisma.notification.deleteMany({
      where: {
        userId: testUserId,
      },
    });

    await prisma.user.deleteMany({
      where: {
        email: {
          in: ['test-notif-create@example.com', 'admin-notif-create@example.com'],
        },
      },
    });

    await app.close();
  });

  describe('POST /notifications', () => {
    it('should create a notification with all fields', async () => {
      const dto = {
        userId: testUserId,
        title: 'Test Notification',
        message: 'This is a test notification',
        category: NotificationCategory.SYSTEM,
        priority: NotificationPriority.HIGH,
        channel: NotificationChannel.IN_APP,
        metadata: { key: 'value' },
        actionUrl: '/dashboard',
        actionLabel: 'View Dashboard',
        imageUrl: 'https://example.com/image.png',
        requiredPermission: 'users:read',
        scheduledFor: new Date('2025-12-31').toISOString(),
      };

      const response = await request(app.getHttpServer())
        .post('/notifications')
        .set('Authorization', `Bearer ${adminToken}`)
        .send(dto)
        .expect(201);

      expect(response.body).toMatchObject({
        userId: testUserId,
        title: dto.title,
        message: dto.message,
        category: dto.category,
        priority: dto.priority,
        channel: dto.channel,
        actionUrl: dto.actionUrl,
        actionLabel: dto.actionLabel,
        imageUrl: dto.imageUrl,
        requiredPermission: dto.requiredPermission,
      });
      expect(response.body.id).toBeDefined();
      expect(response.body.isRead).toBe(false);
      expect(response.body.createdAt).toBeDefined();
    });

    it('should create a notification with minimal required fields', async () => {
      const dto = {
        userId: testUserId,
        title: 'Minimal Notification',
        message: 'This has only required fields',
        category: NotificationCategory.USER_ACTION,
      };

      const response = await request(app.getHttpServer())
        .post('/notifications')
        .set('Authorization', `Bearer ${adminToken}`)
        .send(dto)
        .expect(201);

      expect(response.body).toMatchObject({
        userId: testUserId,
        title: dto.title,
        message: dto.message,
        category: dto.category,
      });
      expect(response.body.priority).toBe(NotificationPriority.NORMAL);
      expect(response.body.channel).toBe(NotificationChannel.IN_APP);
    });

    it('should fail without authentication', async () => {
      const dto = {
        userId: testUserId,
        title: 'Test',
        message: 'Test message',
        category: NotificationCategory.SYSTEM,
      };

      await request(app.getHttpServer())
        .post('/notifications')
        .send(dto)
        .expect(401);
    });

    it('should fail without write permission', async () => {
      const dto = {
        userId: testUserId,
        title: 'Test',
        message: 'Test message',
        category: NotificationCategory.SYSTEM,
      };

      await request(app.getHttpServer())
        .post('/notifications')
        .set('Authorization', `Bearer ${authToken}`)
        .send(dto)
        .expect(403);
    });

    it('should validate required fields', async () => {
      const response = await request(app.getHttpServer())
        .post('/notifications')
        .set('Authorization', `Bearer ${adminToken}`)
        .send({})
        .expect(400);

      expect(response.body.message).toContain('userId');
      expect(response.body.message).toContain('title');
      expect(response.body.message).toContain('message');
      expect(response.body.message).toContain('category');
    });

    it('should validate title max length', async () => {
      const dto = {
        userId: testUserId,
        title: 'a'.repeat(201), // Exceeds 200 char limit
        message: 'Test message',
        category: NotificationCategory.SYSTEM,
      };

      await request(app.getHttpServer())
        .post('/notifications')
        .set('Authorization', `Bearer ${adminToken}`)
        .send(dto)
        .expect(400);
    });

    it('should validate message max length', async () => {
      const dto = {
        userId: testUserId,
        title: 'Test',
        message: 'a'.repeat(2001), // Exceeds 2000 char limit
        category: NotificationCategory.SYSTEM,
      };

      await request(app.getHttpServer())
        .post('/notifications')
        .set('Authorization', `Bearer ${adminToken}`)
        .send(dto)
        .expect(400);
    });

    it('should validate category enum', async () => {
      const dto = {
        userId: testUserId,
        title: 'Test',
        message: 'Test message',
        category: 'INVALID_CATEGORY',
      };

      await request(app.getHttpServer())
        .post('/notifications')
        .set('Authorization', `Bearer ${adminToken}`)
        .send(dto)
        .expect(400);
    });

    it('should validate priority enum', async () => {
      const dto = {
        userId: testUserId,
        title: 'Test',
        message: 'Test message',
        category: NotificationCategory.SYSTEM,
        priority: 'INVALID_PRIORITY',
      };

      await request(app.getHttpServer())
        .post('/notifications')
        .set('Authorization', `Bearer ${adminToken}`)
        .send(dto)
        .expect(400);
    });

    it('should validate permission format', async () => {
      const dto = {
        userId: testUserId,
        title: 'Test',
        message: 'Test message',
        category: NotificationCategory.SYSTEM,
        requiredPermission: 'invalid-format', // Should be resource:action
      };

      const response = await request(app.getHttpServer())
        .post('/notifications')
        .set('Authorization', `Bearer ${adminToken}`)
        .send(dto)
        .expect(400);

      expect(response.body.message).toContain('Permission must be in format resource:action');
    });

    it('should accept valid permission format', async () => {
      const dto = {
        userId: testUserId,
        title: 'Test',
        message: 'Test message',
        category: NotificationCategory.SECURITY,
        requiredPermission: 'admin:read',
      };

      const response = await request(app.getHttpServer())
        .post('/notifications')
        .set('Authorization', `Bearer ${adminToken}`)
        .send(dto)
        .expect(201);

      expect(response.body.requiredPermission).toBe('admin:read');
    });

    it('should create notification with complex metadata', async () => {
      const dto = {
        userId: testUserId,
        title: 'Complex Metadata',
        message: 'Test with complex metadata',
        category: NotificationCategory.CUSTOM,
        metadata: {
          user: { id: '123', name: 'John' },
          action: 'update',
          tags: ['important', 'urgent'],
          nested: { level1: { level2: 'value' } },
        },
      };

      const response = await request(app.getHttpServer())
        .post('/notifications')
        .set('Authorization', `Bearer ${adminToken}`)
        .send(dto)
        .expect(201);

      expect(response.body.metadata).toEqual(dto.metadata);
    });

    it('should create scheduled notification', async () => {
      const scheduledDate = new Date('2025-12-31T10:00:00Z');
      const dto = {
        userId: testUserId,
        title: 'Scheduled',
        message: 'This will be delivered later',
        category: NotificationCategory.WORKFLOW,
        scheduledFor: scheduledDate.toISOString(),
      };

      const response = await request(app.getHttpServer())
        .post('/notifications')
        .set('Authorization', `Bearer ${adminToken}`)
        .send(dto)
        .expect(201);

      expect(new Date(response.body.scheduledFor)).toEqual(scheduledDate);
    });

    it('should create notifications for all categories', async () => {
      const categories = [
        NotificationCategory.SYSTEM,
        NotificationCategory.USER_ACTION,
        NotificationCategory.SECURITY,
        NotificationCategory.BILLING,
        NotificationCategory.CONTENT,
        NotificationCategory.WORKFLOW,
        NotificationCategory.SOCIAL,
        NotificationCategory.CUSTOM,
      ];

      for (const category of categories) {
        const dto = {
          userId: testUserId,
          title: `${category} Notification`,
          message: `Test ${category} notification`,
          category,
        };

        const response = await request(app.getHttpServer())
          .post('/notifications')
          .set('Authorization', `Bearer ${adminToken}`)
          .send(dto)
          .expect(201);

        expect(response.body.category).toBe(category);
      }
    });

    it('should create notifications for all priorities', async () => {
      const priorities = [
        NotificationPriority.LOW,
        NotificationPriority.NORMAL,
        NotificationPriority.HIGH,
        NotificationPriority.URGENT,
      ];

      for (const priority of priorities) {
        const dto = {
          userId: testUserId,
          title: `${priority} Priority`,
          message: `Test ${priority} priority`,
          category: NotificationCategory.SYSTEM,
          priority,
        };

        const response = await request(app.getHttpServer())
          .post('/notifications')
          .set('Authorization', `Bearer ${adminToken}`)
          .send(dto)
          .expect(201);

        expect(response.body.priority).toBe(priority);
      }
    });
  });
});
