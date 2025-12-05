import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication, ValidationPipe } from '@nestjs/common';
import * as request from 'supertest';
import { AppModule } from '../src/app.module';
import { PrismaService } from '../src/prisma/prisma.service';
import { NotificationCategory, NotificationPriority, NotificationChannel } from '@prisma/client';

describe('NotificationTemplateController (e2e) - Create Operations', () => {
  let app: INestApplication;
  let prisma: PrismaService;
  let authToken: string;
  let adminToken: string;

  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleFixture.createNestApplication();
    app.useGlobalPipes(new ValidationPipe({ whitelist: true, transform: true }));
    await app.init();

    prisma = app.get<PrismaService>(PrismaService);

    // Create test users and get auth tokens
    const adminUser = await prisma.user.create({
      data: {
        email: 'admin-template@test.com',
        password: '$2b$10$abcdefghijklmnopqrstuvwxyz', // hashed password
        name: 'Admin User',
        roleId: 'cldefault_admin',
      },
    });

    const regularUser = await prisma.user.create({
      data: {
        email: 'user-template@test.com',
        password: '$2b$10$abcdefghijklmnopqrstuvwxyz',
        name: 'Regular User',
        roleId: 'cldefault_user',
      },
    });

    // Get auth tokens (simplified - in real tests, use proper login)
    adminToken = 'mock-admin-token';
    authToken = 'mock-user-token';
  });

  afterAll(async () => {
    // Clean up test data
    await prisma.notificationTemplate.deleteMany({
      where: {
        key: {
          startsWith: 'test-',
        },
      },
    });

    await prisma.user.deleteMany({
      where: {
        email: {
          in: ['admin-template@test.com', 'user-template@test.com'],
        },
      },
    });

    await app.close();
  });

  afterEach(async () => {
    // Clean up templates created in tests
    await prisma.notificationTemplate.deleteMany({
      where: {
        key: {
          startsWith: 'test-',
        },
      },
    });
  });

  describe('POST /notifications/templates', () => {
    const validCreateDto = {
      key: 'test-welcome-email',
      name: 'Welcome Email',
      description: 'Sent to new users',
      category: NotificationCategory.USER_ACTION,
      title: 'Welcome {{userName}}!',
      message: 'Hello {{userName}}, welcome to our platform!',
      variables: ['userName'],
      defaultChannels: [NotificationChannel.IN_APP],
      defaultPriority: NotificationPriority.NORMAL,
      isActive: true,
    };

    it('should create a new template with valid data', async () => {
      const response = await request(app.getHttpServer())
        .post('/notifications/templates')
        .set('Authorization', `Bearer ${adminToken}`)
        .send(validCreateDto)
        .expect(201);

      expect(response.body).toMatchObject({
        key: validCreateDto.key,
        name: validCreateDto.name,
        description: validCreateDto.description,
        category: validCreateDto.category,
        title: validCreateDto.title,
        message: validCreateDto.message,
        variables: validCreateDto.variables,
        defaultChannels: validCreateDto.defaultChannels,
        defaultPriority: validCreateDto.defaultPriority,
        isActive: validCreateDto.isActive,
        version: 1,
      });
      expect(response.body.id).toBeDefined();
      expect(response.body.createdAt).toBeDefined();
      expect(response.body.updatedAt).toBeDefined();
    });

    it('should fail with 400 if key is missing', async () => {
      const invalidDto = { ...validCreateDto };
      delete invalidDto.key;

      await request(app.getHttpServer())
        .post('/notifications/templates')
        .set('Authorization', `Bearer ${adminToken}`)
        .send(invalidDto)
        .expect(400);
    });

    it('should fail with 400 if key contains invalid characters', async () => {
      const invalidDto = {
        ...validCreateDto,
        key: 'Invalid Key With Spaces!',
      };

      await request(app.getHttpServer())
        .post('/notifications/templates')
        .set('Authorization', `Bearer ${adminToken}`)
        .send(invalidDto)
        .expect(400);
    });

    it('should fail with 400 if name is missing', async () => {
      const invalidDto = { ...validCreateDto };
      delete invalidDto.name;

      await request(app.getHttpServer())
        .post('/notifications/templates')
        .set('Authorization', `Bearer ${adminToken}`)
        .send(invalidDto)
        .expect(400);
    });

    it('should fail with 400 if category is invalid', async () => {
      const invalidDto = {
        ...validCreateDto,
        category: 'INVALID_CATEGORY',
      };

      await request(app.getHttpServer())
        .post('/notifications/templates')
        .set('Authorization', `Bearer ${adminToken}`)
        .send(invalidDto)
        .expect(400);
    });

    it('should fail with 400 if title is missing', async () => {
      const invalidDto = { ...validCreateDto };
      delete invalidDto.title;

      await request(app.getHttpServer())
        .post('/notifications/templates')
        .set('Authorization', `Bearer ${adminToken}`)
        .send(invalidDto)
        .expect(400);
    });

    it('should fail with 400 if message is missing', async () => {
      const invalidDto = { ...validCreateDto };
      delete invalidDto.message;

      await request(app.getHttpServer())
        .post('/notifications/templates')
        .set('Authorization', `Bearer ${adminToken}`)
        .send(invalidDto)
        .expect(400);
    });

    it('should fail with 400 if template uses undeclared variables', async () => {
      const invalidDto = {
        ...validCreateDto,
        key: 'test-invalid-vars',
        title: 'Welcome {{userName}} from {{companyName}}!',
        variables: ['userName'], // Missing companyName
      };

      await request(app.getHttpServer())
        .post('/notifications/templates')
        .set('Authorization', `Bearer ${adminToken}`)
        .send(invalidDto)
        .expect(400);
    });

    it('should fail with 409 if template key already exists', async () => {
      // Create first template
      await request(app.getHttpServer())
        .post('/notifications/templates')
        .set('Authorization', `Bearer ${adminToken}`)
        .send(validCreateDto)
        .expect(201);

      // Try to create duplicate
      await request(app.getHttpServer())
        .post('/notifications/templates')
        .set('Authorization', `Bearer ${adminToken}`)
        .send(validCreateDto)
        .expect(409);
    });

    it('should create template with minimal required fields', async () => {
      const minimalDto = {
        key: 'test-minimal',
        name: 'Minimal Template',
        category: NotificationCategory.SYSTEM,
        title: 'Simple Title',
        message: 'Simple message',
      };

      const response = await request(app.getHttpServer())
        .post('/notifications/templates')
        .set('Authorization', `Bearer ${adminToken}`)
        .send(minimalDto)
        .expect(201);

      expect(response.body).toMatchObject({
        key: minimalDto.key,
        name: minimalDto.name,
        category: minimalDto.category,
        title: minimalDto.title,
        message: minimalDto.message,
        variables: [],
        defaultChannels: [NotificationChannel.IN_APP],
        defaultPriority: NotificationPriority.NORMAL,
        isActive: true,
        version: 1,
      });
    });

    it('should create template with multiple variables', async () => {
      const multiVarDto = {
        key: 'test-multi-var',
        name: 'Multi Variable Template',
        category: NotificationCategory.BILLING,
        title: 'Order {{orderId}} confirmed',
        message: 'Hi {{customerName}}, your order {{orderId}} for {{amount}} has been confirmed.',
        variables: ['orderId', 'customerName', 'amount'],
        defaultChannels: [NotificationChannel.IN_APP],
        defaultPriority: NotificationPriority.HIGH,
      };

      const response = await request(app.getHttpServer())
        .post('/notifications/templates')
        .set('Authorization', `Bearer ${adminToken}`)
        .send(multiVarDto)
        .expect(201);

      expect(response.body.variables).toEqual(['orderId', 'customerName', 'amount']);
    });

    it('should create inactive template when isActive is false', async () => {
      const inactiveDto = {
        ...validCreateDto,
        key: 'test-inactive',
        isActive: false,
      };

      const response = await request(app.getHttpServer())
        .post('/notifications/templates')
        .set('Authorization', `Bearer ${adminToken}`)
        .send(inactiveDto)
        .expect(201);

      expect(response.body.isActive).toBe(false);
    });

    it('should handle all notification categories', async () => {
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
          ...validCreateDto,
          key: `test-category-${category.toLowerCase()}`,
          category,
        };

        const response = await request(app.getHttpServer())
          .post('/notifications/templates')
          .set('Authorization', `Bearer ${adminToken}`)
          .send(dto)
          .expect(201);

        expect(response.body.category).toBe(category);
      }
    });

    it('should handle all notification priorities', async () => {
      const priorities = [
        NotificationPriority.LOW,
        NotificationPriority.NORMAL,
        NotificationPriority.HIGH,
        NotificationPriority.URGENT,
      ];

      for (const priority of priorities) {
        const dto = {
          ...validCreateDto,
          key: `test-priority-${priority.toLowerCase()}`,
          defaultPriority: priority,
        };

        const response = await request(app.getHttpServer())
          .post('/notifications/templates')
          .set('Authorization', `Bearer ${adminToken}`)
          .send(dto)
          .expect(201);

        expect(response.body.defaultPriority).toBe(priority);
      }
    });

    it('should fail with 403 if user lacks notifications:write permission', async () => {
      await request(app.getHttpServer())
        .post('/notifications/templates')
        .set('Authorization', `Bearer ${authToken}`)
        .send(validCreateDto)
        .expect(403);
    });

    it('should fail with 401 if no auth token provided', async () => {
      await request(app.getHttpServer())
        .post('/notifications/templates')
        .send(validCreateDto)
        .expect(401);
    });

    it('should persist template to database', async () => {
      const response = await request(app.getHttpServer())
        .post('/notifications/templates')
        .set('Authorization', `Bearer ${adminToken}`)
        .send(validCreateDto)
        .expect(201);

      const templateId = response.body.id;

      // Verify in database
      const dbTemplate = await prisma.notificationTemplate.findUnique({
        where: { id: templateId },
      });

      expect(dbTemplate).toBeDefined();
      expect(dbTemplate.key).toBe(validCreateDto.key);
      expect(dbTemplate.name).toBe(validCreateDto.name);
    });

    it('should handle long description', async () => {
      const longDescDto = {
        ...validCreateDto,
        key: 'test-long-desc',
        description: 'A'.repeat(500),
      };

      const response = await request(app.getHttpServer())
        .post('/notifications/templates')
        .set('Authorization', `Bearer ${adminToken}`)
        .send(longDescDto)
        .expect(201);

      expect(response.body.description).toBe(longDescDto.description);
    });

    it('should handle long message', async () => {
      const longMsgDto = {
        ...validCreateDto,
        key: 'test-long-msg',
        message: 'B'.repeat(2000),
      };

      const response = await request(app.getHttpServer())
        .post('/notifications/templates')
        .set('Authorization', `Bearer ${adminToken}`)
        .send(longMsgDto)
        .expect(201);

      expect(response.body.message).toBe(longMsgDto.message);
    });
  });
});
