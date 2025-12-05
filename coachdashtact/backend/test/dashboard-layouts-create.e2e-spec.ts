import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication, ValidationPipe } from '@nestjs/common';
import request from 'supertest';
import { AppModule } from '../src/app.module';
import { PrismaService } from '../src/prisma/prisma.service';

describe('Dashboard Layouts - Create Operations (e2e)', () => {
  let app: INestApplication;
  let prisma: PrismaService;
  let adminToken: string;
  let adminUser: any;
  let testLayoutIds: string[] = [];

  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleFixture.createNestApplication();
    app.useGlobalPipes(
      new ValidationPipe({
        whitelist: true,
        forbidNonWhitelisted: true,
        transform: true,
      }),
    );
    await app.init();

    prisma = app.get<PrismaService>(PrismaService);

    // Setup test user
    await setupTestUser();
  });

  afterAll(async () => {
    // Cleanup test data
    await cleanupTestData();
    await app.close();
  });

  async function setupTestUser() {
    // Get Admin role
    const adminRole = await prisma.userRole.findFirst({
      where: { name: 'Admin' },
    });

    // Register admin user
    const adminResponse = await request(app.getHttpServer())
      .post('/auth/register')
      .send({
        email: `admin-layouts-${Date.now()}@example.com`,
        password: 'Password123',
        name: 'Admin Layouts Test',
      });

    adminToken = adminResponse.body.accessToken;
    adminUser = adminResponse.body.user;

    // Update to Admin role
    await prisma.user.update({
      where: { id: adminUser.id },
      data: { roleId: adminRole!.id },
    });

    // Get fresh token with admin permissions
    const loginResponse = await request(app.getHttpServer())
      .post('/auth/login')
      .send({
        email: adminUser.email,
        password: 'Password123',
      });

    adminToken = loginResponse.body.accessToken;
  }

  async function cleanupTestData() {
    // Delete test layouts
    if (testLayoutIds.length > 0) {
      await prisma.dashboardLayout.deleteMany({
        where: { id: { in: testLayoutIds } },
      }).catch(() => {});
    }

    // Delete test user
    if (adminUser?.id) {
      await prisma.user.delete({ where: { id: adminUser.id } }).catch(() => {});
    }
  }

  describe('POST /dashboard-layouts', () => {
    it('should require authentication', () => {
      return request(app.getHttpServer())
        .post('/dashboard-layouts')
        .send({
          pageId: 'overview',
          name: 'My Layout',
        })
        .expect(401);
    });

    it('should require layouts:write permission', async () => {
      // Register regular user without permissions
      const userResponse = await request(app.getHttpServer())
        .post('/auth/register')
        .send({
          email: `user-layouts-${Date.now()}@example.com`,
          password: 'Password123',
          name: 'Regular User',
        });

      const userToken = userResponse.body.accessToken;

      const response = await request(app.getHttpServer())
        .post('/dashboard-layouts')
        .set('Authorization', `Bearer ${userToken}`)
        .send({
          pageId: 'overview',
          name: 'My Layout',
        })
        .expect(403);

      expect(response.body.message).toContain('Insufficient permissions');

      // Cleanup
      await prisma.user.delete({ where: { id: userResponse.body.user.id } }).catch(() => {});
    });

    it('should create a global layout successfully', async () => {
      const response = await request(app.getHttpServer())
        .post('/dashboard-layouts')
        .set('Authorization', `Bearer ${adminToken}`)
        .send({
          pageId: 'overview',
          name: 'Global Overview Layout',
          scope: 'global',
          isActive: true,
          isDefault: false,
        })
        .expect(201);

      expect(response.body).toHaveProperty('id');
      expect(response.body.pageId).toBe('overview');
      expect(response.body.name).toBe('Global Overview Layout');
      expect(response.body.scope).toBe('global');
      expect(response.body.userId).toBeNull();
      expect(response.body.isActive).toBe(true);
      expect(response.body.isDefault).toBe(false);
      expect(response.body).toHaveProperty('createdAt');
      expect(response.body).toHaveProperty('updatedAt');
      expect(response.body.widgetInstances).toEqual([]);

      testLayoutIds.push(response.body.id);
    });

    it('should create a user-specific layout successfully', async () => {
      const response = await request(app.getHttpServer())
        .post('/dashboard-layouts')
        .set('Authorization', `Bearer ${adminToken}`)
        .send({
          pageId: 'analytics',
          name: 'My Analytics Layout',
          scope: 'user',
          isActive: true,
          isDefault: false,
        })
        .expect(201);

      expect(response.body).toHaveProperty('id');
      expect(response.body.pageId).toBe('analytics');
      expect(response.body.name).toBe('My Analytics Layout');
      expect(response.body.scope).toBe('user');
      expect(response.body.userId).toBe(adminUser.id);
      expect(response.body.isActive).toBe(true);
      expect(response.body.isDefault).toBe(false);

      testLayoutIds.push(response.body.id);
    });

    it('should create layout with description', async () => {
      const response = await request(app.getHttpServer())
        .post('/dashboard-layouts')
        .set('Authorization', `Bearer ${adminToken}`)
        .send({
          pageId: 'dashboard',
          name: 'Dashboard Layout',
          description: 'A custom dashboard layout with KPIs',
          scope: 'global',
          isActive: true,
          isDefault: false,
        })
        .expect(201);

      expect(response.body.description).toBe('A custom dashboard layout with KPIs');

      testLayoutIds.push(response.body.id);
    });

    it('should validate required fields', async () => {
      const response = await request(app.getHttpServer())
        .post('/dashboard-layouts')
        .set('Authorization', `Bearer ${adminToken}`)
        .send({
          // Missing pageId and name
          scope: 'global',
        })
        .expect(400);

      expect(response.body.message).toBeDefined();
    });

    it('should validate pageId is not empty', async () => {
      const response = await request(app.getHttpServer())
        .post('/dashboard-layouts')
        .set('Authorization', `Bearer ${adminToken}`)
        .send({
          pageId: '',
          name: 'My Layout',
        })
        .expect(400);

      expect(response.body.message).toBeDefined();
    });

    it('should validate name is not empty', async () => {
      const response = await request(app.getHttpServer())
        .post('/dashboard-layouts')
        .set('Authorization', `Bearer ${adminToken}`)
        .send({
          pageId: 'overview',
          name: '',
        })
        .expect(400);

      expect(response.body.message).toBeDefined();
    });

    it('should validate pageId max length', async () => {
      const response = await request(app.getHttpServer())
        .post('/dashboard-layouts')
        .set('Authorization', `Bearer ${adminToken}`)
        .send({
          pageId: 'a'.repeat(101),
          name: 'My Layout',
        })
        .expect(400);

      expect(response.body.message).toBeDefined();
    });

    it('should validate name max length', async () => {
      const response = await request(app.getHttpServer())
        .post('/dashboard-layouts')
        .set('Authorization', `Bearer ${adminToken}`)
        .send({
          pageId: 'overview',
          name: 'a'.repeat(201),
        })
        .expect(400);

      expect(response.body.message).toBeDefined();
    });

    it('should validate description max length', async () => {
      const response = await request(app.getHttpServer())
        .post('/dashboard-layouts')
        .set('Authorization', `Bearer ${adminToken}`)
        .send({
          pageId: 'overview',
          name: 'My Layout',
          description: 'a'.repeat(501),
        })
        .expect(400);

      expect(response.body.message).toBeDefined();
    });

    it('should validate scope enum', async () => {
      const response = await request(app.getHttpServer())
        .post('/dashboard-layouts')
        .set('Authorization', `Bearer ${adminToken}`)
        .send({
          pageId: 'overview',
          name: 'My Layout',
          scope: 'invalid',
        })
        .expect(400);

      expect(response.body.message).toBeDefined();
    });

    it('should accept scope "global"', async () => {
      const response = await request(app.getHttpServer())
        .post('/dashboard-layouts')
        .set('Authorization', `Bearer ${adminToken}`)
        .send({
          pageId: 'test-global',
          name: 'Global Test Layout',
          scope: 'global',
        })
        .expect(201);

      expect(response.body.scope).toBe('global');

      testLayoutIds.push(response.body.id);
    });

    it('should accept scope "user"', async () => {
      const response = await request(app.getHttpServer())
        .post('/dashboard-layouts')
        .set('Authorization', `Bearer ${adminToken}`)
        .send({
          pageId: 'test-user',
          name: 'User Test Layout',
          scope: 'user',
        })
        .expect(201);

      expect(response.body.scope).toBe('user');

      testLayoutIds.push(response.body.id);
    });

    it('should handle inactive layouts', async () => {
      const response = await request(app.getHttpServer())
        .post('/dashboard-layouts')
        .set('Authorization', `Bearer ${adminToken}`)
        .send({
          pageId: 'inactive-test',
          name: 'Inactive Layout',
          isActive: false,
        })
        .expect(201);

      expect(response.body.isActive).toBe(false);

      testLayoutIds.push(response.body.id);
    });

    it('should handle default layouts', async () => {
      const response = await request(app.getHttpServer())
        .post('/dashboard-layouts')
        .set('Authorization', `Bearer ${adminToken}`)
        .send({
          pageId: 'default-test',
          name: 'Default Layout',
          isDefault: true,
        })
        .expect(201);

      expect(response.body.isDefault).toBe(true);

      testLayoutIds.push(response.body.id);
    });

    it('should create layout with all optional fields', async () => {
      const response = await request(app.getHttpServer())
        .post('/dashboard-layouts')
        .set('Authorization', `Bearer ${adminToken}`)
        .send({
          pageId: 'full-test',
          name: 'Full Layout',
          description: 'A layout with all fields',
          scope: 'user',
          isActive: true,
          isDefault: false,
        })
        .expect(201);

      expect(response.body.pageId).toBe('full-test');
      expect(response.body.name).toBe('Full Layout');
      expect(response.body.description).toBe('A layout with all fields');
      expect(response.body.scope).toBe('user');
      expect(response.body.isActive).toBe(true);
      expect(response.body.isDefault).toBe(false);

      testLayoutIds.push(response.body.id);
    });

    it('should handle special characters in name', async () => {
      const response = await request(app.getHttpServer())
        .post('/dashboard-layouts')
        .set('Authorization', `Bearer ${adminToken}`)
        .send({
          pageId: 'special-chars',
          name: 'My Layout (Custom) - v2.0',
        })
        .expect(201);

      expect(response.body.name).toBe('My Layout (Custom) - v2.0');

      testLayoutIds.push(response.body.id);
    });

    it('should handle unicode characters in name', async () => {
      const response = await request(app.getHttpServer())
        .post('/dashboard-layouts')
        .set('Authorization', `Bearer ${adminToken}`)
        .send({
          pageId: 'unicode-test',
          name: 'My Layout 中文 العربية',
        })
        .expect(201);

      expect(response.body.name).toBe('My Layout 中文 العربية');

      testLayoutIds.push(response.body.id);
    });

    it('should return empty widgetInstances array', async () => {
      const response = await request(app.getHttpServer())
        .post('/dashboard-layouts')
        .set('Authorization', `Bearer ${adminToken}`)
        .send({
          pageId: 'widgets-test',
          name: 'Widgets Test Layout',
        })
        .expect(201);

      expect(response.body.widgetInstances).toEqual([]);

      testLayoutIds.push(response.body.id);
    });

    it('should set timestamps on creation', async () => {
      const beforeCreate = new Date();

      const response = await request(app.getHttpServer())
        .post('/dashboard-layouts')
        .set('Authorization', `Bearer ${adminToken}`)
        .send({
          pageId: 'timestamp-test',
          name: 'Timestamp Test Layout',
        })
        .expect(201);

      const afterCreate = new Date();

      expect(response.body.createdAt).toBeDefined();
      expect(response.body.updatedAt).toBeDefined();

      const createdAt = new Date(response.body.createdAt);
      const updatedAt = new Date(response.body.updatedAt);

      expect(createdAt.getTime()).toBeGreaterThanOrEqual(beforeCreate.getTime());
      expect(createdAt.getTime()).toBeLessThanOrEqual(afterCreate.getTime());
      expect(updatedAt.getTime()).toBeGreaterThanOrEqual(beforeCreate.getTime());
      expect(updatedAt.getTime()).toBeLessThanOrEqual(afterCreate.getTime());

      testLayoutIds.push(response.body.id);
    });

    it('should persist layout to database', async () => {
      const response = await request(app.getHttpServer())
        .post('/dashboard-layouts')
        .set('Authorization', `Bearer ${adminToken}`)
        .send({
          pageId: 'persist-test',
          name: 'Persist Test Layout',
        })
        .expect(201);

      testLayoutIds.push(response.body.id);

      // Verify in database
      const layout = await prisma.dashboardLayout.findUnique({
        where: { id: response.body.id },
      });

      expect(layout).toBeDefined();
      expect(layout?.pageId).toBe('persist-test');
      expect(layout?.name).toBe('Persist Test Layout');
    });
  });
});
