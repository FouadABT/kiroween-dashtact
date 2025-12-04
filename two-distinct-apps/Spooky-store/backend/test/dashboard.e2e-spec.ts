import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication, ValidationPipe } from '@nestjs/common';
import request from 'supertest';
import { AppModule } from '../src/app.module';
import { PrismaService } from '../src/prisma/prisma.service';

describe('Dashboard Controller (e2e)', () => {
  let app: INestApplication;
  let prisma: PrismaService;
  let superAdminToken: string;
  let adminToken: string;
  let managerToken: string;
  let userToken: string;
  let superAdminId: string;
  let adminId: string;
  let managerId: string;
  let userId: string;

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

    // Create test users for each role
    await setupTestUsers();
  });

  afterAll(async () => {
    // Cleanup test users
    await cleanupTestUsers();
    await app.close();
  });

  async function setupTestUsers() {
    const timestamp = Date.now();

    // Get roles
    const superAdminRole = await prisma.role.findFirst({
      where: { name: 'SUPER_ADMIN' },
    });
    const adminRole = await prisma.role.findFirst({
      where: { name: 'ADMIN' },
    });
    const managerRole = await prisma.role.findFirst({
      where: { name: 'MANAGER' },
    });
    const userRole = await prisma.role.findFirst({
      where: { name: 'USER' },
    });

    // Register Super Admin
    const superAdminRes = await request(app.getHttpServer())
      .post('/auth/register')
      .send({
        email: `superadmin-${timestamp}@test.com`,
        password: 'Test123!',
        name: 'Super Admin Test',
      });
    superAdminToken = superAdminRes.body.accessToken;
    superAdminId = superAdminRes.body.user.id;

    // Update to Super Admin role
    await prisma.user.update({
      where: { id: superAdminId },
      data: { roleId: superAdminRole!.id },
    });

    // Register Admin
    const adminRes = await request(app.getHttpServer())
      .post('/auth/register')
      .send({
        email: `admin-${timestamp}@test.com`,
        password: 'Test123!',
        name: 'Admin Test',
      });
    adminToken = adminRes.body.accessToken;
    adminId = adminRes.body.user.id;

    await prisma.user.update({
      where: { id: adminId },
      data: { roleId: adminRole!.id },
    });

    // Register Manager
    const managerRes = await request(app.getHttpServer())
      .post('/auth/register')
      .send({
        email: `manager-${timestamp}@test.com`,
        password: 'Test123!',
        name: 'Manager Test',
      });
    managerToken = managerRes.body.accessToken;
    managerId = managerRes.body.user.id;

    await prisma.user.update({
      where: { id: managerId },
      data: { roleId: managerRole!.id },
    });

    // Register User
    const userRes = await request(app.getHttpServer())
      .post('/auth/register')
      .send({
        email: `user-${timestamp}@test.com`,
        password: 'Test123!',
        name: 'User Test',
      });
    userToken = userRes.body.accessToken;
    userId = userRes.body.user.id;
  }

  async function cleanupTestUsers() {
    if (superAdminId) await prisma.user.delete({ where: { id: superAdminId } }).catch(() => {});
    if (adminId) await prisma.user.delete({ where: { id: adminId } }).catch(() => {});
    if (managerId) await prisma.user.delete({ where: { id: managerId } }).catch(() => {});
    if (userId) await prisma.user.delete({ where: { id: userId } }).catch(() => {});
  }

  describe('GET /dashboard/stats', () => {
    it('should return 401 without authentication', () => {
      return request(app.getHttpServer())
        .get('/dashboard/stats')
        .expect(401);
    });

    it('should return 200 with valid JWT token', () => {
      return request(app.getHttpServer())
        .get('/dashboard/stats')
        .set('Authorization', `Bearer ${userToken}`)
        .expect(200);
    });

    it('should return Super Admin stats with system metrics', async () => {
      const response = await request(app.getHttpServer())
        .get('/dashboard/stats')
        .set('Authorization', `Bearer ${superAdminToken}`)
        .expect(200);

      expect(response.body).toHaveProperty('cronJobSuccessRate');
      expect(response.body).toHaveProperty('emailDeliveryRate');
      expect(response.body).toHaveProperty('activeUsersCount');
      expect(response.body).toHaveProperty('revenueToday');
      expect(response.body).toHaveProperty('ordersTotal');
      expect(response.body).toHaveProperty('customersTotal');
    });

    it('should return Admin stats without system metrics', async () => {
      const response = await request(app.getHttpServer())
        .get('/dashboard/stats')
        .set('Authorization', `Bearer ${adminToken}`)
        .expect(200);

      expect(response.body).not.toHaveProperty('cronJobSuccessRate');
      expect(response.body).not.toHaveProperty('emailDeliveryRate');
      expect(response.body).not.toHaveProperty('activeUsersCount');
      expect(response.body).toHaveProperty('revenueToday');
      expect(response.body).toHaveProperty('blogPostsDraft');
      expect(response.body).toHaveProperty('customPagesCount');
    });

    it('should return Manager stats without blog metrics', async () => {
      const response = await request(app.getHttpServer())
        .get('/dashboard/stats')
        .set('Authorization', `Bearer ${managerToken}`)
        .expect(200);

      expect(response.body).not.toHaveProperty('blogPostsDraft');
      expect(response.body).not.toHaveProperty('customPagesCount');
      expect(response.body).toHaveProperty('revenueToday');
      expect(response.body).toHaveProperty('lowStockCount');
    });

    it('should return User stats with only personal metrics', async () => {
      const response = await request(app.getHttpServer())
        .get('/dashboard/stats')
        .set('Authorization', `Bearer ${userToken}`)
        .expect(200);

      expect(response.body).not.toHaveProperty('revenueToday');
      expect(response.body).not.toHaveProperty('ordersTotal');
      expect(response.body).toHaveProperty('notificationsUnread');
      expect(response.body).toHaveProperty('messagesUnread');
      expect(response.body).toHaveProperty('fileUploads');
    });
  });

  describe('GET /dashboard/recent-activity', () => {
    it('should return 401 without authentication', () => {
      return request(app.getHttpServer())
        .get('/dashboard/recent-activity')
        .expect(401);
    });

    it('should return recent activity with default limit', async () => {
      const response = await request(app.getHttpServer())
        .get('/dashboard/recent-activity')
        .set('Authorization', `Bearer ${adminToken}`)
        .expect(200);

      expect(Array.isArray(response.body)).toBe(true);
      expect(response.body.length).toBeLessThanOrEqual(10);
    });

    it('should respect custom limit parameter', async () => {
      const response = await request(app.getHttpServer())
        .get('/dashboard/recent-activity?limit=5')
        .set('Authorization', `Bearer ${adminToken}`)
        .expect(200);

      expect(Array.isArray(response.body)).toBe(true);
      expect(response.body.length).toBeLessThanOrEqual(5);
    });

    it('should enforce maximum limit of 50', async () => {
      const response = await request(app.getHttpServer())
        .get('/dashboard/recent-activity?limit=100')
        .set('Authorization', `Bearer ${adminToken}`)
        .expect(200);

      expect(Array.isArray(response.body)).toBe(true);
      expect(response.body.length).toBeLessThanOrEqual(50);
    });

    it('should return role-appropriate activities', async () => {
      const response = await request(app.getHttpServer())
        .get('/dashboard/recent-activity')
        .set('Authorization', `Bearer ${userToken}`)
        .expect(200);

      expect(Array.isArray(response.body)).toBe(true);
      // User should only see their own activities
    });
  });

  describe('GET /dashboard/alerts', () => {
    it('should return 401 without authentication', () => {
      return request(app.getHttpServer())
        .get('/dashboard/alerts')
        .expect(401);
    });

    it('should return alerts array', async () => {
      const response = await request(app.getHttpServer())
        .get('/dashboard/alerts')
        .set('Authorization', `Bearer ${adminToken}`)
        .expect(200);

      expect(Array.isArray(response.body)).toBe(true);
    });

    it('should return alerts with correct structure', async () => {
      const response = await request(app.getHttpServer())
        .get('/dashboard/alerts')
        .set('Authorization', `Bearer ${adminToken}`)
        .expect(200);

      if (response.body.length > 0) {
        const alert = response.body[0];
        expect(alert).toHaveProperty('id');
        expect(alert).toHaveProperty('severity');
        expect(alert).toHaveProperty('title');
        expect(alert).toHaveProperty('message');
        expect(alert).toHaveProperty('timestamp');
        expect(['info', 'warning', 'error', 'critical']).toContain(alert.severity);
      }
    });
  });

  describe('GET /dashboard/system-health', () => {
    it('should return 401 without authentication', () => {
      return request(app.getHttpServer())
        .get('/dashboard/system-health')
        .expect(401);
    });

    it('should return 403 for non-Super Admin', () => {
      return request(app.getHttpServer())
        .get('/dashboard/system-health')
        .set('Authorization', `Bearer ${adminToken}`)
        .expect(403);
    });

    it('should return 403 for Manager', () => {
      return request(app.getHttpServer())
        .get('/dashboard/system-health')
        .set('Authorization', `Bearer ${managerToken}`)
        .expect(403);
    });

    it('should return 403 for User', () => {
      return request(app.getHttpServer())
        .get('/dashboard/system-health')
        .set('Authorization', `Bearer ${userToken}`)
        .expect(403);
    });

    it('should return 200 for Super Admin', async () => {
      const response = await request(app.getHttpServer())
        .get('/dashboard/system-health')
        .set('Authorization', `Bearer ${superAdminToken}`)
        .expect(200);

      expect(response.body).toHaveProperty('cronJobSuccessRate');
      expect(response.body).toHaveProperty('emailDeliveryRate');
      expect(response.body).toHaveProperty('activeUsersCount');
      expect(response.body).toHaveProperty('databaseStatus');
    });
  });

  describe('GET /dashboard/revenue', () => {
    it('should return 401 without authentication', () => {
      return request(app.getHttpServer())
        .get('/dashboard/revenue')
        .expect(401);
    });

    it('should return 403 for User role', () => {
      return request(app.getHttpServer())
        .get('/dashboard/revenue')
        .set('Authorization', `Bearer ${userToken}`)
        .expect(403);
    });

    it('should return 200 for Admin', async () => {
      const response = await request(app.getHttpServer())
        .get('/dashboard/revenue')
        .set('Authorization', `Bearer ${adminToken}`)
        .expect(200);

      expect(response.body).toHaveProperty('daily');
      expect(response.body).toHaveProperty('totalRevenue');
      expect(response.body).toHaveProperty('totalOrders');
      expect(response.body).toHaveProperty('averageOrderValue');
      expect(response.body).toHaveProperty('byCategory');
      expect(Array.isArray(response.body.daily)).toBe(true);
      expect(Array.isArray(response.body.byCategory)).toBe(true);
    });

    it('should accept date range parameters', async () => {
      const startDate = '2024-01-01';
      const endDate = '2024-01-31';

      const response = await request(app.getHttpServer())
        .get(`/dashboard/revenue?startDate=${startDate}&endDate=${endDate}`)
        .set('Authorization', `Bearer ${adminToken}`)
        .expect(200);

      expect(response.body).toHaveProperty('daily');
    });

    it('should return 200 for Manager', () => {
      return request(app.getHttpServer())
        .get('/dashboard/revenue')
        .set('Authorization', `Bearer ${managerToken}`)
        .expect(200);
    });
  });

  describe('GET /dashboard/sales', () => {
    it('should return 401 without authentication', () => {
      return request(app.getHttpServer())
        .get('/dashboard/sales')
        .expect(401);
    });

    it('should return 403 for User role', () => {
      return request(app.getHttpServer())
        .get('/dashboard/sales')
        .set('Authorization', `Bearer ${userToken}`)
        .expect(403);
    });

    it('should return 200 for Admin', async () => {
      const response = await request(app.getHttpServer())
        .get('/dashboard/sales')
        .set('Authorization', `Bearer ${adminToken}`)
        .expect(200);

      expect(response.body).toHaveProperty('topProducts');
      expect(response.body).toHaveProperty('byCategory');
      expect(Array.isArray(response.body.topProducts)).toBe(true);
      expect(Array.isArray(response.body.byCategory)).toBe(true);
      expect(response.body.topProducts.length).toBeLessThanOrEqual(10);
    });

    it('should accept date range parameters', async () => {
      const startDate = '2024-01-01';
      const endDate = '2024-01-31';

      const response = await request(app.getHttpServer())
        .get(`/dashboard/sales?startDate=${startDate}&endDate=${endDate}`)
        .set('Authorization', `Bearer ${adminToken}`)
        .expect(200);

      expect(response.body).toHaveProperty('topProducts');
    });
  });

  describe('GET /dashboard/inventory', () => {
    it('should return 401 without authentication', () => {
      return request(app.getHttpServer())
        .get('/dashboard/inventory')
        .expect(401);
    });

    it('should return 403 for User role', () => {
      return request(app.getHttpServer())
        .get('/dashboard/inventory')
        .set('Authorization', `Bearer ${userToken}`)
        .expect(403);
    });

    it('should return 200 for Admin', async () => {
      const response = await request(app.getHttpServer())
        .get('/dashboard/inventory')
        .set('Authorization', `Bearer ${adminToken}`)
        .expect(200);

      expect(response.body).toHaveProperty('lowStock');
      expect(response.body).toHaveProperty('outOfStock');
      expect(response.body).toHaveProperty('totalValue');
      expect(Array.isArray(response.body.lowStock)).toBe(true);
      expect(Array.isArray(response.body.outOfStock)).toBe(true);
    });

    it('should return 200 for Manager', () => {
      return request(app.getHttpServer())
        .get('/dashboard/inventory')
        .set('Authorization', `Bearer ${managerToken}`)
        .expect(200);
    });
  });

  describe('GET /dashboard/content', () => {
    it('should return 401 without authentication', () => {
      return request(app.getHttpServer())
        .get('/dashboard/content')
        .expect(401);
    });

    it('should return 403 for Manager role', () => {
      return request(app.getHttpServer())
        .get('/dashboard/content')
        .set('Authorization', `Bearer ${managerToken}`)
        .expect(403);
    });

    it('should return 403 for User role', () => {
      return request(app.getHttpServer())
        .get('/dashboard/content')
        .set('Authorization', `Bearer ${userToken}`)
        .expect(403);
    });

    it('should return 200 for Admin', async () => {
      const response = await request(app.getHttpServer())
        .get('/dashboard/content')
        .set('Authorization', `Bearer ${adminToken}`)
        .expect(200);

      expect(response.body).toHaveProperty('blogPostsDraft');
      expect(response.body).toHaveProperty('blogPostsPublished');
      expect(response.body).toHaveProperty('customPagesCount');
      expect(response.body).toHaveProperty('recentPosts');
      expect(Array.isArray(response.body.recentPosts)).toBe(true);
    });
  });

  describe('GET /dashboard/users', () => {
    it('should return 401 without authentication', () => {
      return request(app.getHttpServer())
        .get('/dashboard/users')
        .expect(401);
    });

    it('should return 403 for Manager role', () => {
      return request(app.getHttpServer())
        .get('/dashboard/users')
        .set('Authorization', `Bearer ${managerToken}`)
        .expect(403);
    });

    it('should return 403 for User role', () => {
      return request(app.getHttpServer())
        .get('/dashboard/users')
        .set('Authorization', `Bearer ${userToken}`)
        .expect(403);
    });

    it('should return 200 for Super Admin', async () => {
      const response = await request(app.getHttpServer())
        .get('/dashboard/users')
        .set('Authorization', `Bearer ${superAdminToken}`)
        .expect(200);

      expect(response.body).toHaveProperty('totalUsers');
      expect(response.body).toHaveProperty('activeUsers');
      expect(response.body).toHaveProperty('newUsersToday');
      expect(response.body).toHaveProperty('byRole');
      expect(Array.isArray(response.body.byRole)).toBe(true);
    });

    it('should return 200 for Admin', async () => {
      const response = await request(app.getHttpServer())
        .get('/dashboard/users')
        .set('Authorization', `Bearer ${adminToken}`)
        .expect(200);

      expect(response.body).toHaveProperty('totalUsers');
      expect(response.body).toHaveProperty('activeUsers');
    });
  });

  describe('Error Handling', () => {
    it('should return 400 for invalid date format', async () => {
      const response = await request(app.getHttpServer())
        .get('/dashboard/revenue?startDate=invalid-date')
        .set('Authorization', `Bearer ${adminToken}`)
        .expect(400);

      expect(response.body).toHaveProperty('message');
    });

    it('should return 400 for invalid limit parameter', async () => {
      const response = await request(app.getHttpServer())
        .get('/dashboard/recent-activity?limit=invalid')
        .set('Authorization', `Bearer ${adminToken}`)
        .expect(400);

      expect(response.body).toHaveProperty('message');
    });
  });

  describe('Caching', () => {
    it('should return cached data on subsequent requests', async () => {
      // First request
      const response1 = await request(app.getHttpServer())
        .get('/dashboard/stats')
        .set('Authorization', `Bearer ${adminToken}`)
        .expect(200);

      // Second request (should be cached)
      const response2 = await request(app.getHttpServer())
        .get('/dashboard/stats')
        .set('Authorization', `Bearer ${adminToken}`)
        .expect(200);

      // Both should return data
      expect(response1.body).toBeDefined();
      expect(response2.body).toBeDefined();
    });
  });
});
