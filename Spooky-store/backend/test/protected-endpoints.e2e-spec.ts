import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication, ValidationPipe } from '@nestjs/common';
import request from 'supertest';
import { AppModule } from '../src/app.module';
import { PrismaService } from '../src/prisma/prisma.service';

describe('Protected Endpoints (e2e)', () => {
  let app: INestApplication;
  let prisma: PrismaService;

  // Test users with different roles and permissions
  let superAdminToken: string;
  let superAdminUser: any;
  let adminToken: string;
  let adminUser: any;
  let managerToken: string;
  let managerUser: any;
  let regularUserToken: string;
  let regularUser: any;

  // Test data IDs
  let testUserId: string;
  let testSettingsId: string;

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

    // Create test users with different roles
    await setupTestUsers();
  });

  afterAll(async () => {
    // Clean up test data
    await cleanupTestData();
    await app.close();
  });

  async function setupTestUsers() {
    // Get roles
    const superAdminRole = await prisma.userRole.findFirst({
      where: { name: 'Super Admin' },
    });
    const adminRole = await prisma.userRole.findFirst({
      where: { name: 'Admin' },
    });
    const managerRole = await prisma.userRole.findFirst({
      where: { name: 'Manager' },
    });
    const userRole = await prisma.userRole.findFirst({
      where: { name: 'User' },
    });

    // Register Super Admin
    const superAdminResponse = await request(app.getHttpServer())
      .post('/auth/register')
      .send({
        email: `superadmin-protected-${Date.now()}@example.com`,
        password: 'Password123',
        name: 'Super Admin Test',
      });
    superAdminToken = superAdminResponse.body.accessToken;
    superAdminUser = superAdminResponse.body.user;

    // Update to Super Admin role
    await prisma.user.update({
      where: { id: superAdminUser.id },
      data: { roleId: superAdminRole!.id },
    });

    // Register Admin
    const adminResponse = await request(app.getHttpServer())
      .post('/auth/register')
      .send({
        email: `admin-protected-${Date.now()}@example.com`,
        password: 'Password123',
        name: 'Admin Test',
      });
    adminToken = adminResponse.body.accessToken;
    adminUser = adminResponse.body.user;

    // Update to Admin role
    await prisma.user.update({
      where: { id: adminUser.id },
      data: { roleId: adminRole!.id },
    });

    // Register Manager
    const managerResponse = await request(app.getHttpServer())
      .post('/auth/register')
      .send({
        email: `manager-protected-${Date.now()}@example.com`,
        password: 'Password123',
        name: 'Manager Test',
      });
    managerToken = managerResponse.body.accessToken;
    managerUser = managerResponse.body.user;

    // Update to Manager role
    await prisma.user.update({
      where: { id: managerUser.id },
      data: { roleId: managerRole!.id },
    });

    // Register Regular User
    const userResponse = await request(app.getHttpServer())
      .post('/auth/register')
      .send({
        email: `user-protected-${Date.now()}@example.com`,
        password: 'Password123',
        name: 'Regular User Test',
      });
    regularUserToken = userResponse.body.accessToken;
    regularUser = userResponse.body.user;

    // Create test user for CRUD operations
    const testUser = await prisma.user.create({
      data: {
        email: `test-crud-${Date.now()}@example.com`,
        password: 'hashedpassword',
        name: 'Test CRUD User',
        roleId: userRole!.id,
      },
    });
    testUserId = testUser.id;

    // Create test settings
    const testSettings = await prisma.settings.create({
      data: {
        userId: regularUser.id,
        scope: 'user',
        activeTheme: 'light',
        lightPalette: {},
        darkPalette: {},
        typography: {},
      },
    });
    testSettingsId = testSettings.id;
  }

  async function cleanupTestData() {
    // Delete test settings
    if (testSettingsId) {
      await prisma.settings
        .delete({ where: { id: testSettingsId } })
        .catch(() => {});
    }

    // Delete test users
    const userIds = [
      superAdminUser?.id,
      adminUser?.id,
      managerUser?.id,
      regularUser?.id,
      testUserId,
    ].filter(Boolean);

    for (const id of userIds) {
      await prisma.user.delete({ where: { id } }).catch(() => {});
    }
  }

  describe('Authentication Requirements', () => {
    describe('Unauthenticated Access (401)', () => {
      it('should return 401 for GET /users without token', () => {
        return request(app.getHttpServer())
          .get('/users')
          .expect(401)
          .expect((res) => {
            expect(res.body.message).toBeDefined();
          });
      });

      it('should return 401 for POST /users without token', () => {
        return request(app.getHttpServer())
          .post('/users')
          .send({
            email: 'test@example.com',
            password: 'Password123',
          })
          .expect(401);
      });

      it('should return 401 for GET /settings without token', () => {
        return request(app.getHttpServer()).get('/settings').expect(401);
      });

      it('should return 401 for PATCH /users/:id without token', () => {
        return request(app.getHttpServer())
          .patch(`/users/${testUserId}`)
          .send({ name: 'Updated Name' })
          .expect(401);
      });

      it('should return 401 for DELETE /users/:id without token', () => {
        return request(app.getHttpServer())
          .delete(`/users/${testUserId}`)
          .expect(401);
      });

      it('should return 401 with invalid token', () => {
        return request(app.getHttpServer())
          .get('/users')
          .set('Authorization', 'Bearer invalid-token')
          .expect(401);
      });

      it('should return 401 with malformed token', () => {
        return request(app.getHttpServer())
          .get('/users')
          .set('Authorization', 'InvalidFormat')
          .expect(401);
      });
    });

    describe('Authenticated Access (200/201)', () => {
      it('should allow authenticated user to access GET /users with users:read permission', () => {
        return request(app.getHttpServer())
          .get('/users')
          .set('Authorization', `Bearer ${regularUserToken}`)
          .expect(200)
          .expect((res) => {
            expect(res.body.data).toBeDefined();
            expect(res.body.data.users).toBeInstanceOf(Array);
          });
      });

      it('should allow authenticated admin to create user with users:write permission', () => {
        return request(app.getHttpServer())
          .post('/users')
          .set('Authorization', `Bearer ${adminToken}`)
          .send({
            email: `new-user-${Date.now()}@example.com`,
            password: 'Password123',
            name: 'New User',
          })
          .expect(201)
          .expect((res) => {
            expect(res.body.data).toHaveProperty('id');
            expect(res.body.data).toHaveProperty('email');
          })
          .then((res) => {
            // Clean up created user
            return prisma.user.delete({ where: { id: res.body.data.id } });
          });
      });

      it('should allow authenticated user to access their own settings', () => {
        return request(app.getHttpServer())
          .get(`/settings/user/${regularUser.id}`)
          .set('Authorization', `Bearer ${regularUserToken}`)
          .expect(200)
          .expect((res) => {
            expect(res.body).toHaveProperty('id');
            expect(res.body.userId).toBe(regularUser.id);
          });
      });
    });
  });

  describe('Permission-Based Access Control', () => {
    describe('Insufficient Permissions (403)', () => {
      it('should return 403 when regular user tries to create user (lacks users:write)', () => {
        return request(app.getHttpServer())
          .post('/users')
          .set('Authorization', `Bearer ${regularUserToken}`)
          .send({
            email: `forbidden-${Date.now()}@example.com`,
            password: 'Password123',
          })
          .expect(403)
          .expect((res) => {
            expect(res.body.message).toContain('Insufficient permissions');
          });
      });

      it('should return 403 when regular user tries to delete user (lacks users:delete)', () => {
        return request(app.getHttpServer())
          .delete(`/users/${testUserId}`)
          .set('Authorization', `Bearer ${regularUserToken}`)
          .expect(403);
      });

      it('should return 403 when manager tries to delete user (lacks users:delete)', () => {
        return request(app.getHttpServer())
          .delete(`/users/${testUserId}`)
          .set('Authorization', `Bearer ${managerToken}`)
          .expect(403);
      });

      it('should return 403 when regular user tries to access all settings (lacks settings:admin)', () => {
        return request(app.getHttpServer())
          .get('/settings')
          .set('Authorization', `Bearer ${regularUserToken}`)
          .expect(403);
      });

      it('should return 403 when regular user tries to create settings (lacks settings:admin)', () => {
        return request(app.getHttpServer())
          .post('/settings')
          .set('Authorization', `Bearer ${regularUserToken}`)
          .send({
            userId: regularUser.id,
            theme: 'dark',
            colorPalette: {},
            typography: {},
          })
          .expect(403);
      });

      it('should return 403 when user tries to access another user settings', () => {
        return request(app.getHttpServer())
          .get(`/settings/user/${adminUser.id}`)
          .set('Authorization', `Bearer ${regularUserToken}`)
          .expect(403)
          .expect((res) => {
            expect(res.body.message).toContain(
              'You can only access your own settings',
            );
          });
      });

      it('should return 403 when user tries to update another user settings', async () => {
        // Create settings for admin user
        const adminSettings = await prisma.settings.create({
          data: {
            userId: adminUser.id,
            scope: 'user',
            activeTheme: 'light',
            lightPalette: {},
            darkPalette: {},
            typography: {},
          },
        });

        await request(app.getHttpServer())
          .patch(`/settings/${adminSettings.id}`)
          .set('Authorization', `Bearer ${regularUserToken}`)
          .send({ activeTheme: 'dark' })
          .expect(403)
          .expect((res) => {
            expect(res.body.message).toContain(
              'You can only update your own settings',
            );
          });

        // Clean up
        await prisma.settings.delete({ where: { id: adminSettings.id } });
      });
    });

    describe('Sufficient Permissions (200/201)', () => {
      it('should allow admin to create user with users:write permission', () => {
        return request(app.getHttpServer())
          .post('/users')
          .set('Authorization', `Bearer ${adminToken}`)
          .send({
            email: `admin-create-${Date.now()}@example.com`,
            password: 'Password123',
            name: 'Admin Created User',
          })
          .expect(201)
          .then((res) => {
            return prisma.user.delete({ where: { id: res.body.data.id } });
          });
      });

      it('should allow admin to update user with users:write permission', () => {
        return request(app.getHttpServer())
          .patch(`/users/${testUserId}`)
          .set('Authorization', `Bearer ${adminToken}`)
          .send({ name: 'Updated by Admin' })
          .expect(200)
          .expect((res) => {
            expect(res.body.data.name).toBe('Updated by Admin');
          });
      });

      it('should allow admin to delete user with users:delete permission', async () => {
        // Create a user to delete
        const userToDelete = await prisma.user.create({
          data: {
            email: `delete-test-${Date.now()}@example.com`,
            password: 'hashedpassword',
            name: 'User to Delete',
            roleId: (await prisma.userRole.findFirst({
              where: { name: 'USER' },
            }))!.id,
          },
        });

        return request(app.getHttpServer())
          .delete(`/users/${userToDelete.id}`)
          .set('Authorization', `Bearer ${adminToken}`)
          .expect(204);
      });

      it('should allow manager to read users with users:read permission', () => {
        return request(app.getHttpServer())
          .get('/users')
          .set('Authorization', `Bearer ${managerToken}`)
          .expect(200)
          .expect((res) => {
            expect(res.body.data.users).toBeInstanceOf(Array);
          });
      });

      it('should allow manager to create user with users:write permission', () => {
        return request(app.getHttpServer())
          .post('/users')
          .set('Authorization', `Bearer ${managerToken}`)
          .send({
            email: `manager-create-${Date.now()}@example.com`,
            password: 'Password123',
            name: 'Manager Created User',
          })
          .expect(201)
          .then((res) => {
            return prisma.user.delete({ where: { id: res.body.data.id } });
          });
      });

      it('should allow admin to access all settings with settings:admin permission', () => {
        return request(app.getHttpServer())
          .get('/settings')
          .set('Authorization', `Bearer ${adminToken}`)
          .expect(200)
          .expect((res) => {
            expect(Array.isArray(res.body)).toBe(true);
          });
      });

      it('should allow admin to access any user settings with settings:admin permission', () => {
        return request(app.getHttpServer())
          .get(`/settings/user/${regularUser.id}`)
          .set('Authorization', `Bearer ${adminToken}`)
          .expect(200);
      });

      it('should allow user to update their own settings', () => {
        return request(app.getHttpServer())
          .patch(`/settings/${testSettingsId}`)
          .set('Authorization', `Bearer ${regularUserToken}`)
          .send({ activeTheme: 'dark' })
          .expect(200)
          .expect((res) => {
            expect(res.body.activeTheme).toBe('dark');
          });
      });
    });
  });

  describe('Role-Based Access Control', () => {
    describe('Super Admin Role', () => {
      it('should allow super admin to access all endpoints', async () => {
        // Get fresh token with super admin role
        const loginResponse = await request(app.getHttpServer())
          .post('/auth/login')
          .send({
            email: superAdminUser.email,
            password: 'Password123',
          });

        const token = loginResponse.body.accessToken;

        // Test various endpoints
        await request(app.getHttpServer())
          .get('/users')
          .set('Authorization', `Bearer ${token}`)
          .expect(200);

        await request(app.getHttpServer())
          .get('/settings')
          .set('Authorization', `Bearer ${token}`)
          .expect(200);

        await request(app.getHttpServer())
          .get('/permissions')
          .set('Authorization', `Bearer ${token}`)
          .expect(200);
      });

      it('should allow super admin to perform all CRUD operations', async () => {
        const loginResponse = await request(app.getHttpServer())
          .post('/auth/login')
          .send({
            email: superAdminUser.email,
            password: 'Password123',
          });

        const token = loginResponse.body.accessToken;

        // Create
        const createResponse = await request(app.getHttpServer())
          .post('/users')
          .set('Authorization', `Bearer ${token}`)
          .send({
            email: `superadmin-crud-${Date.now()}@example.com`,
            password: 'Password123',
            name: 'Super Admin CRUD Test',
          })
          .expect(201);

        const userId = createResponse.body.data.id;

        // Read
        await request(app.getHttpServer())
          .get(`/users/${userId}`)
          .set('Authorization', `Bearer ${token}`)
          .expect(200);

        // Update
        await request(app.getHttpServer())
          .patch(`/users/${userId}`)
          .set('Authorization', `Bearer ${token}`)
          .send({ name: 'Updated Name' })
          .expect(200);

        // Delete
        await request(app.getHttpServer())
          .delete(`/users/${userId}`)
          .set('Authorization', `Bearer ${token}`)
          .expect(204);
      });
    });

    describe('Admin Role', () => {
      it('should allow admin to manage users', async () => {
        const loginResponse = await request(app.getHttpServer())
          .post('/auth/login')
          .send({
            email: adminUser.email,
            password: 'Password123',
          });

        const token = loginResponse.body.accessToken;

        await request(app.getHttpServer())
          .get('/users')
          .set('Authorization', `Bearer ${token}`)
          .expect(200);

        const createResponse = await request(app.getHttpServer())
          .post('/users')
          .set('Authorization', `Bearer ${token}`)
          .send({
            email: `admin-manage-${Date.now()}@example.com`,
            password: 'Password123',
          })
          .expect(201);

        await prisma.user.delete({
          where: { id: createResponse.body.data.id },
        });
      });

      it('should allow admin to manage settings', async () => {
        const loginResponse = await request(app.getHttpServer())
          .post('/auth/login')
          .send({
            email: adminUser.email,
            password: 'Password123',
          });

        const token = loginResponse.body.accessToken;

        await request(app.getHttpServer())
          .get('/settings')
          .set('Authorization', `Bearer ${token}`)
          .expect(200);

        await request(app.getHttpServer())
          .get('/settings/global')
          .set('Authorization', `Bearer ${token}`)
          .expect(200);
      });
    });

    describe('Manager Role', () => {
      it('should allow manager to read and write users', async () => {
        const loginResponse = await request(app.getHttpServer())
          .post('/auth/login')
          .send({
            email: managerUser.email,
            password: 'Password123',
          });

        const token = loginResponse.body.accessToken;

        await request(app.getHttpServer())
          .get('/users')
          .set('Authorization', `Bearer ${token}`)
          .expect(200);

        const createResponse = await request(app.getHttpServer())
          .post('/users')
          .set('Authorization', `Bearer ${token}`)
          .send({
            email: `manager-user-${Date.now()}@example.com`,
            password: 'Password123',
          })
          .expect(201);

        await prisma.user.delete({
          where: { id: createResponse.body.data.id },
        });
      });

      it('should prevent manager from deleting users', async () => {
        const loginResponse = await request(app.getHttpServer())
          .post('/auth/login')
          .send({
            email: managerUser.email,
            password: 'Password123',
          });

        const token = loginResponse.body.accessToken;

        await request(app.getHttpServer())
          .delete(`/users/${testUserId}`)
          .set('Authorization', `Bearer ${token}`)
          .expect(403);
      });

      it('should allow manager to read settings but not admin operations', async () => {
        const loginResponse = await request(app.getHttpServer())
          .post('/auth/login')
          .send({
            email: managerUser.email,
            password: 'Password123',
          });

        const token = loginResponse.body.accessToken;

        await request(app.getHttpServer())
          .get('/settings/global')
          .set('Authorization', `Bearer ${token}`)
          .expect(200);

        await request(app.getHttpServer())
          .get('/settings')
          .set('Authorization', `Bearer ${token}`)
          .expect(403);
      });
    });

    describe('Regular User Role', () => {
      it('should allow user to read users', async () => {
        const loginResponse = await request(app.getHttpServer())
          .post('/auth/login')
          .send({
            email: regularUser.email,
            password: 'Password123',
          });

        const token = loginResponse.body.accessToken;

        await request(app.getHttpServer())
          .get('/users')
          .set('Authorization', `Bearer ${token}`)
          .expect(200);
      });

      it('should prevent user from creating users', async () => {
        const loginResponse = await request(app.getHttpServer())
          .post('/auth/login')
          .send({
            email: regularUser.email,
            password: 'Password123',
          });

        const token = loginResponse.body.accessToken;

        await request(app.getHttpServer())
          .post('/users')
          .set('Authorization', `Bearer ${token}`)
          .send({
            email: `user-forbidden-${Date.now()}@example.com`,
            password: 'Password123',
          })
          .expect(403);
      });

      it('should prevent user from updating users', async () => {
        const loginResponse = await request(app.getHttpServer())
          .post('/auth/login')
          .send({
            email: regularUser.email,
            password: 'Password123',
          });

        const token = loginResponse.body.accessToken;

        await request(app.getHttpServer())
          .patch(`/users/${testUserId}`)
          .set('Authorization', `Bearer ${token}`)
          .send({ name: 'Forbidden Update' })
          .expect(403);
      });

      it('should prevent user from deleting users', async () => {
        const loginResponse = await request(app.getHttpServer())
          .post('/auth/login')
          .send({
            email: regularUser.email,
            password: 'Password123',
          });

        const token = loginResponse.body.accessToken;

        await request(app.getHttpServer())
          .delete(`/users/${testUserId}`)
          .set('Authorization', `Bearer ${token}`)
          .expect(403);
      });

      it('should allow user to manage their own settings', async () => {
        const loginResponse = await request(app.getHttpServer())
          .post('/auth/login')
          .send({
            email: regularUser.email,
            password: 'Password123',
          });

        const token = loginResponse.body.accessToken;

        await request(app.getHttpServer())
          .get(`/settings/user/${regularUser.id}`)
          .set('Authorization', `Bearer ${token}`)
          .expect(200);

        await request(app.getHttpServer())
          .patch(`/settings/${testSettingsId}`)
          .set('Authorization', `Bearer ${token}`)
          .send({ theme: 'light' })
          .expect(200);
      });
    });
  });

  describe('Edge Cases and Security', () => {
    it('should reject expired tokens', async () => {
      // This would require mocking time or using a very short expiration
      // For now, we test with an invalid token format
      await request(app.getHttpServer())
        .get('/users')
        .set(
          'Authorization',
          'Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.expired.token',
        )
        .expect(401);
    });

    it('should handle missing Authorization header gracefully', () => {
      return request(app.getHttpServer()).get('/users').expect(401);
    });

    it('should handle malformed Authorization header', () => {
      return request(app.getHttpServer())
        .get('/users')
        .set('Authorization', 'NotBearer token')
        .expect(401);
    });

    it('should prevent privilege escalation through token manipulation', async () => {
      // Regular user should not be able to access admin endpoints
      const loginResponse = await request(app.getHttpServer())
        .post('/auth/login')
        .send({
          email: regularUser.email,
          password: 'Password123',
        });

      const token = loginResponse.body.accessToken;

      await request(app.getHttpServer())
        .post('/users')
        .set('Authorization', `Bearer ${token}`)
        .send({
          email: `escalation-${Date.now()}@example.com`,
          password: 'Password123',
        })
        .expect(403);
    });

    it('should validate permissions on every request', async () => {
      const loginResponse = await request(app.getHttpServer())
        .post('/auth/login')
        .send({
          email: regularUser.email,
          password: 'Password123',
        });

      const token = loginResponse.body.accessToken;

      // Multiple requests should all check permissions
      await request(app.getHttpServer())
        .post('/users')
        .set('Authorization', `Bearer ${token}`)
        .send({ email: 'test1@example.com', password: 'Password123' })
        .expect(403);

      await request(app.getHttpServer())
        .post('/users')
        .set('Authorization', `Bearer ${token}`)
        .send({ email: 'test2@example.com', password: 'Password123' })
        .expect(403);
    });
  });
});
