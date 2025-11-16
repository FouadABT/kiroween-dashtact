import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication, ValidationPipe } from '@nestjs/common';
import request from 'supertest';
import { AppModule } from '../src/app.module';
import { PrismaService } from '../src/prisma/prisma.service';
import { PageType } from '../src/dashboard-menus/dto/create-menu.dto';

describe('DashboardMenus (e2e)', () => {
  let app: INestApplication;
  let prisma: PrismaService;
  let adminToken: string;
  let adminUser: any;
  let regularUserToken: string;
  let testMenuIds: string[] = [];

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

    await setupTestUsers();
  });

  afterAll(async () => {
    await cleanupTestData();
    await app.close();
  });

  async function setupTestUsers() {
    // Use Super Admin role for menu management permissions
    const superAdminRole = await prisma.userRole.findFirst({
      where: { name: 'Super Admin' },
    });

    if (!superAdminRole) {
      throw new Error('Super Admin role not found. Run prisma:seed first.');
    }

    const adminResponse = await request(app.getHttpServer())
      .post('/auth/register')
      .send({
        email: `admin-menu-${Date.now()}@example.com`,
        password: 'Password123',
        name: 'Admin Menu Test',
      });
    adminUser = adminResponse.body.user;

    await prisma.user.update({
      where: { id: adminUser.id },
      data: { roleId: superAdminRole.id },
    });

    const loginResponse = await request(app.getHttpServer())
      .post('/auth/login')
      .send({
        email: adminUser.email,
        password: 'Password123',
      });
    adminToken = loginResponse.body.accessToken;

    const userResponse = await request(app.getHttpServer())
      .post('/auth/register')
      .send({
        email: `user-menu-${Date.now()}@example.com`,
        password: 'Password123',
        name: 'Regular User Menu Test',
      });
    regularUserToken = userResponse.body.accessToken;
  }

  async function cleanupTestData() {
    if (testMenuIds.length > 0) {
      await prisma.dashboardMenu.deleteMany({
        where: { id: { in: testMenuIds } },
      }).catch(() => {});
    }

    if (adminUser) {
      await prisma.user.delete({ where: { id: adminUser.id } }).catch(() => {});
    }
  }

  describe('GET /dashboard-menus/user-menus', () => {
    it('should require authentication', () => {
      return request(app.getHttpServer())
        .get('/dashboard-menus/user-menus')
        .expect(401);
    });

    it('should return user-specific menus', async () => {
      const response = await request(app.getHttpServer())
        .get('/dashboard-menus/user-menus')
        .set('Authorization', `Bearer ${adminToken}`)
        .expect(200);

      expect(Array.isArray(response.body)).toBe(true);
    });
  });

  describe('POST /dashboard-menus', () => {
    it('should require authentication', () => {
      return request(app.getHttpServer())
        .post('/dashboard-menus')
        .send({
          key: 'test-menu',
          label: 'Test Menu',
          icon: 'Home',
          route: '/test',
          order: 1,
          pageType: PageType.WIDGET_BASED,
        })
        .expect(401);
    });

    it('should require menus:create permission', () => {
      return request(app.getHttpServer())
        .post('/dashboard-menus')
        .set('Authorization', `Bearer ${regularUserToken}`)
        .send({
          key: 'test-menu',
          label: 'Test Menu',
          icon: 'Home',
          route: '/test',
          order: 1,
          pageType: PageType.WIDGET_BASED,
        })
        .expect(403);
    });

    it('should create a new menu item', async () => {
      const response = await request(app.getHttpServer())
        .post('/dashboard-menus')
        .set('Authorization', `Bearer ${adminToken}`)
        .send({
          key: `test-menu-${Date.now()}`,
          label: 'Test Menu',
          icon: 'Home',
          route: '/test',
          order: 1,
          pageType: PageType.WIDGET_BASED,
          pageIdentifier: 'test-page',
        })
        .expect(201);

      expect(response.body).toHaveProperty('id');
      expect(response.body.key).toContain('test-menu');
      testMenuIds.push(response.body.id);
    });

    it('should validate required fields', async () => {
      return request(app.getHttpServer())
        .post('/dashboard-menus')
        .set('Authorization', `Bearer ${adminToken}`)
        .send({
          label: 'Test Menu',
          // Missing required fields
        })
        .expect(400);
    });

    it('should prevent duplicate keys', async () => {
      const uniqueKey = `unique-menu-${Date.now()}`;

      const firstResponse = await request(app.getHttpServer())
        .post('/dashboard-menus')
        .set('Authorization', `Bearer ${adminToken}`)
        .send({
          key: uniqueKey,
          label: 'First Menu',
          icon: 'Home',
          route: '/first',
          order: 1,
          pageType: PageType.WIDGET_BASED,
          pageIdentifier: 'first-page',
        })
        .expect(201);

      testMenuIds.push(firstResponse.body.id);

      return request(app.getHttpServer())
        .post('/dashboard-menus')
        .set('Authorization', `Bearer ${adminToken}`)
        .send({
          key: uniqueKey,
          label: 'Second Menu',
          icon: 'Home',
          route: '/second',
          order: 2,
          pageType: PageType.WIDGET_BASED,
          pageIdentifier: 'second-page',
        })
        .expect(409);
    });

    it('should validate WIDGET_BASED requires pageIdentifier', async () => {
      return request(app.getHttpServer())
        .post('/dashboard-menus')
        .set('Authorization', `Bearer ${adminToken}`)
        .send({
          key: `test-widget-${Date.now()}`,
          label: 'Test Widget Menu',
          icon: 'Home',
          route: '/test-widget',
          order: 1,
          pageType: PageType.WIDGET_BASED,
          // Missing pageIdentifier
        })
        .expect(400);
    });

    it('should validate HARDCODED requires componentPath', async () => {
      return request(app.getHttpServer())
        .post('/dashboard-menus')
        .set('Authorization', `Bearer ${adminToken}`)
        .send({
          key: `test-hardcoded-${Date.now()}`,
          label: 'Test Hardcoded Menu',
          icon: 'Home',
          route: '/test-hardcoded',
          order: 1,
          pageType: PageType.HARDCODED,
          // Missing componentPath
        })
        .expect(400);
    });
  });

  describe('PATCH /dashboard-menus/:id', () => {
    let menuId: string;

    beforeAll(async () => {
      const response = await request(app.getHttpServer())
        .post('/dashboard-menus')
        .set('Authorization', `Bearer ${adminToken}`)
        .send({
          key: `update-test-${Date.now()}`,
          label: 'Update Test Menu',
          icon: 'Home',
          route: '/update-test',
          order: 1,
          pageType: PageType.WIDGET_BASED,
          pageIdentifier: 'update-test-page',
        });
      menuId = response.body.id;
      testMenuIds.push(menuId);
    });

    it('should update a menu item', async () => {
      const response = await request(app.getHttpServer())
        .patch(`/dashboard-menus/${menuId}`)
        .set('Authorization', `Bearer ${adminToken}`)
        .send({
          label: 'Updated Label',
        })
        .expect(200);

      expect(response.body.label).toBe('Updated Label');
    });

    it('should prevent self-parent reference', async () => {
      return request(app.getHttpServer())
        .patch(`/dashboard-menus/${menuId}`)
        .set('Authorization', `Bearer ${adminToken}`)
        .send({
          parentId: menuId,
        })
        .expect(400);
    });
  });

  describe('DELETE /dashboard-menus/:id', () => {
    it('should delete a menu item', async () => {
      const createResponse = await request(app.getHttpServer())
        .post('/dashboard-menus')
        .set('Authorization', `Bearer ${adminToken}`)
        .send({
          key: `delete-test-${Date.now()}`,
          label: 'Delete Test Menu',
          icon: 'Home',
          route: '/delete-test',
          order: 1,
          pageType: PageType.WIDGET_BASED,
          pageIdentifier: 'delete-test-page',
        });

      const menuId = createResponse.body.id;

      await request(app.getHttpServer())
        .delete(`/dashboard-menus/${menuId}`)
        .set('Authorization', `Bearer ${adminToken}`)
        .expect(204);
    });

    it('should prevent deletion of menu with children', async () => {
      const parentResponse = await request(app.getHttpServer())
        .post('/dashboard-menus')
        .set('Authorization', `Bearer ${adminToken}`)
        .send({
          key: `parent-${Date.now()}`,
          label: 'Parent Menu',
          icon: 'Home',
          route: '/parent',
          order: 1,
          pageType: PageType.WIDGET_BASED,
          pageIdentifier: 'parent-page',
        });

      const parentId = parentResponse.body.id;
      testMenuIds.push(parentId);

      const childResponse = await request(app.getHttpServer())
        .post('/dashboard-menus')
        .set('Authorization', `Bearer ${adminToken}`)
        .send({
          key: `child-${Date.now()}`,
          label: 'Child Menu',
          icon: 'Home',
          route: '/child',
          order: 1,
          pageType: PageType.WIDGET_BASED,
          pageIdentifier: 'child-page',
          parentId,
        });

      testMenuIds.push(childResponse.body.id);

      return request(app.getHttpServer())
        .delete(`/dashboard-menus/${parentId}`)
        .set('Authorization', `Bearer ${adminToken}`)
        .expect(400);
    });
  });

  describe('PATCH /dashboard-menus/:id/toggle', () => {
    it('should toggle menu active status', async () => {
      const createResponse = await request(app.getHttpServer())
        .post('/dashboard-menus')
        .set('Authorization', `Bearer ${adminToken}`)
        .send({
          key: `toggle-test-${Date.now()}`,
          label: 'Toggle Test Menu',
          icon: 'Home',
          route: '/toggle-test',
          order: 1,
          pageType: PageType.WIDGET_BASED,
          pageIdentifier: 'toggle-test-page',
          isActive: true,
        });

      const menuId = createResponse.body.id;
      testMenuIds.push(menuId);

      const response = await request(app.getHttpServer())
        .patch(`/dashboard-menus/${menuId}/toggle`)
        .set('Authorization', `Bearer ${adminToken}`)
        .expect(200);

      expect(response.body.isActive).toBe(false);
    });
  });
});
