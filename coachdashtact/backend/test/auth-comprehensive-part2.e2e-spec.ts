import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication, ValidationPipe } from '@nestjs/common';
import request from 'supertest';
import { AppModule } from '../src/app.module';
import { PrismaService } from '../src/prisma/prisma.service';

describe('Comprehensive Authentication E2E Tests - Part 2', () => {
  let app: INestApplication;
  let prisma: PrismaService;

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
  });

  afterAll(async () => {
    await app.close();
  });

  describe('Permission-Based Feature Access', () => {
    let superAdminUser: any;
    let superAdminToken: string;
    let adminUser: any;
    let adminToken: string;
    let managerUser: any;
    let managerToken: string;
    let regularUser: any;
    let regularToken: string;

    beforeAll(async () => {
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

      // Create Super Admin
      const superAdminResponse = await request(app.getHttpServer())
        .post('/auth/register')
        .send({
          email: `superadmin-perm-${Date.now()}@example.com`,
          password: 'SuperAdmin123',
          name: 'Super Admin',
        });
      superAdminUser = superAdminResponse.body.user;
      await prisma.user.update({
        where: { id: superAdminUser.id },
        data: { roleId: superAdminRole!.id },
      });

      // Create Admin
      const adminResponse = await request(app.getHttpServer())
        .post('/auth/register')
        .send({
          email: `admin-perm-${Date.now()}@example.com`,
          password: 'Admin123',
          name: 'Admin',
        });
      adminUser = adminResponse.body.user;
      await prisma.user.update({
        where: { id: adminUser.id },
        data: { roleId: adminRole!.id },
      });

      // Create Manager
      const managerResponse = await request(app.getHttpServer())
        .post('/auth/register')
        .send({
          email: `manager-perm-${Date.now()}@example.com`,
          password: 'Manager123',
          name: 'Manager',
        });
      managerUser = managerResponse.body.user;
      await prisma.user.update({
        where: { id: managerUser.id },
        data: { roleId: managerRole!.id },
      });

      // Create Regular User
      const regularResponse = await request(app.getHttpServer())
        .post('/auth/register')
        .send({
          email: `regular-perm-${Date.now()}@example.com`,
          password: 'Regular123',
          name: 'Regular User',
        });
      regularUser = regularResponse.body.user;

      // Get fresh tokens with updated roles
      const superAdminLogin = await request(app.getHttpServer())
        .post('/auth/login')
        .send({
          email: superAdminUser.email,
          password: 'SuperAdmin123',
        });
      superAdminToken = superAdminLogin.body.accessToken;

      const adminLogin = await request(app.getHttpServer())
        .post('/auth/login')
        .send({
          email: adminUser.email,
          password: 'Admin123',
        });
      adminToken = adminLogin.body.accessToken;

      const managerLogin = await request(app.getHttpServer())
        .post('/auth/login')
        .send({
          email: managerUser.email,
          password: 'Manager123',
        });
      managerToken = managerLogin.body.accessToken;

      regularToken = regularResponse.body.accessToken;
    });

    afterAll(async () => {
      await prisma.user
        .delete({ where: { id: superAdminUser.id } })
        .catch(() => {});
      await prisma.user.delete({ where: { id: adminUser.id } }).catch(() => {});
      await prisma.user.delete({ where: { id: managerUser.id } }).catch(() => {});
      await prisma.user.delete({ where: { id: regularUser.id } }).catch(() => {});
    });

    describe('User Management Permissions', () => {
      it('should allow users:read permission to view users', async () => {
        // All roles have users:read
        await request(app.getHttpServer())
          .get('/users')
          .set('Authorization', `Bearer ${superAdminToken}`)
          .expect(200);

        await request(app.getHttpServer())
          .get('/users')
          .set('Authorization', `Bearer ${adminToken}`)
          .expect(200);

        await request(app.getHttpServer())
          .get('/users')
          .set('Authorization', `Bearer ${managerToken}`)
          .expect(200);

        await request(app.getHttpServer())
          .get('/users')
          .set('Authorization', `Bearer ${regularToken}`)
          .expect(200);
      });

      it('should require users:write permission to create users', async () => {
        const newUserData = {
          email: `new-user-${Date.now()}@example.com`,
          password: 'NewUser123',
          name: 'New User',
        };

        // Super Admin, Admin, and Manager have users:write
        const superAdminCreate = await request(app.getHttpServer())
          .post('/users')
          .set('Authorization', `Bearer ${superAdminToken}`)
          .send(newUserData)
          .expect(201);

        await prisma.user.delete({ where: { id: superAdminCreate.body.data.id } });

        const adminCreate = await request(app.getHttpServer())
          .post('/users')
          .set('Authorization', `Bearer ${adminToken}`)
          .send({ ...newUserData, email: `admin-${newUserData.email}` })
          .expect(201);

        await prisma.user.delete({ where: { id: adminCreate.body.data.id } });

        const managerCreate = await request(app.getHttpServer())
          .post('/users')
          .set('Authorization', `Bearer ${managerToken}`)
          .send({ ...newUserData, email: `manager-${newUserData.email}` })
          .expect(201);

        await prisma.user.delete({ where: { id: managerCreate.body.data.id } });

        // Regular user lacks users:write
        await request(app.getHttpServer())
          .post('/users')
          .set('Authorization', `Bearer ${regularToken}`)
          .send({ ...newUserData, email: `regular-${newUserData.email}` })
          .expect(403);
      });

      it('should require users:write permission to update users', async () => {
        const updateData = { name: 'Updated Name' };

        // Super Admin and Admin have users:write
        await request(app.getHttpServer())
          .patch(`/users/${regularUser.id}`)
          .set('Authorization', `Bearer ${superAdminToken}`)
          .send(updateData)
          .expect(200);

        await request(app.getHttpServer())
          .patch(`/users/${regularUser.id}`)
          .set('Authorization', `Bearer ${adminToken}`)
          .send(updateData)
          .expect(200);

        // Manager has users:write
        await request(app.getHttpServer())
          .patch(`/users/${regularUser.id}`)
          .set('Authorization', `Bearer ${managerToken}`)
          .send(updateData)
          .expect(200);

        // Regular user lacks users:write
        await request(app.getHttpServer())
          .patch(`/users/${adminUser.id}`)
          .set('Authorization', `Bearer ${regularToken}`)
          .send(updateData)
          .expect(403);
      });

      it('should require users:delete permission to delete users', async () => {
        // Create test users to delete
        const userToDelete1 = await prisma.user.create({
          data: {
            email: `delete1-${Date.now()}@example.com`,
            password: 'hashed',
            name: 'Delete Test 1',
            roleId: (await prisma.userRole.findFirst({ where: { name: 'USER' } }))!
              .id,
          },
        });

        const userToDelete2 = await prisma.user.create({
          data: {
            email: `delete2-${Date.now()}@example.com`,
            password: 'hashed',
            name: 'Delete Test 2',
            roleId: (await prisma.userRole.findFirst({ where: { name: 'USER' } }))!
              .id,
          },
        });

        // Super Admin and Admin have users:delete
        await request(app.getHttpServer())
          .delete(`/users/${userToDelete1.id}`)
          .set('Authorization', `Bearer ${superAdminToken}`)
          .expect(204);

        await request(app.getHttpServer())
          .delete(`/users/${userToDelete2.id}`)
          .set('Authorization', `Bearer ${adminToken}`)
          .expect(204);

        // Create another user for Manager test
        const userToDelete3 = await prisma.user.create({
          data: {
            email: `delete3-${Date.now()}@example.com`,
            password: 'hashed',
            name: 'Delete Test 3',
            roleId: (await prisma.userRole.findFirst({ where: { name: 'USER' } }))!
              .id,
          },
        });

        // Manager lacks users:delete
        await request(app.getHttpServer())
          .delete(`/users/${userToDelete3.id}`)
          .set('Authorization', `Bearer ${managerToken}`)
          .expect(403);

        // Regular user lacks users:delete
        await request(app.getHttpServer())
          .delete(`/users/${userToDelete3.id}`)
          .set('Authorization', `Bearer ${regularToken}`)
          .expect(403);

        // Cleanup
        await prisma.user.delete({ where: { id: userToDelete3.id } }).catch(() => {});
      });
    });

    describe('Settings Management Permissions', () => {
      let testSettings: any;

      beforeAll(async () => {
        testSettings = await prisma.settings.create({
          data: {
            userId: regularUser.id,
            scope: 'user',
            activeTheme: 'light',
            lightPalette: {},
            darkPalette: {},
            typography: {},
          },
        });
      });

      afterAll(async () => {
        await prisma.settings.delete({ where: { id: testSettings.id } }).catch(() => {});
      });

      it('should allow users to access their own settings', async () => {
        await request(app.getHttpServer())
          .get(`/settings/user/${regularUser.id}`)
          .set('Authorization', `Bearer ${regularToken}`)
          .expect(200);
      });

      it('should prevent users from accessing other users settings', async () => {
        await request(app.getHttpServer())
          .get(`/settings/user/${adminUser.id}`)
          .set('Authorization', `Bearer ${regularToken}`)
          .expect(403);
      });

      it('should require settings:admin permission to access all settings', async () => {
        // Super Admin and Admin have settings:admin
        await request(app.getHttpServer())
          .get('/settings')
          .set('Authorization', `Bearer ${superAdminToken}`)
          .expect(200);

        await request(app.getHttpServer())
          .get('/settings')
          .set('Authorization', `Bearer ${adminToken}`)
          .expect(200);

        // Manager and Regular user lack settings:admin
        await request(app.getHttpServer())
          .get('/settings')
          .set('Authorization', `Bearer ${managerToken}`)
          .expect(403);

        await request(app.getHttpServer())
          .get('/settings')
          .set('Authorization', `Bearer ${regularToken}`)
          .expect(403);
      });

      it('should allow users to update their own settings', async () => {
        await request(app.getHttpServer())
          .patch(`/settings/${testSettings.id}`)
          .set('Authorization', `Bearer ${regularToken}`)
          .send({ activeTheme: 'dark' })
          .expect(200);
      });

      it('should prevent users from updating other users settings', async () => {
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
          .set('Authorization', `Bearer ${regularToken}`)
          .send({ activeTheme: 'dark' })
          .expect(403);

        await prisma.settings.delete({ where: { id: adminSettings.id } });
      });
    });

    describe('Permission Management Permissions', () => {
      it('should require permissions:read to view permissions', async () => {
        // Super Admin and Admin have permissions:read
        await request(app.getHttpServer())
          .get('/permissions')
          .set('Authorization', `Bearer ${superAdminToken}`)
          .expect(200);

        await request(app.getHttpServer())
          .get('/permissions')
          .set('Authorization', `Bearer ${adminToken}`)
          .expect(200);

        // Manager and Regular user lack permissions:read
        await request(app.getHttpServer())
          .get('/permissions')
          .set('Authorization', `Bearer ${managerToken}`)
          .expect(403);

        await request(app.getHttpServer())
          .get('/permissions')
          .set('Authorization', `Bearer ${regularToken}`)
          .expect(403);
      });
    });
  });

  describe('Role-Based Access Control', () => {
    let superAdminUser: any;
    let superAdminToken: string;
    let adminUser: any;
    let adminToken: string;
    let managerUser: any;
    let managerToken: string;
    let regularUser: any;
    let regularToken: string;

    beforeAll(async () => {
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

      // Create users
      const superAdminResponse = await request(app.getHttpServer())
        .post('/auth/register')
        .send({
          email: `superadmin-rbac-${Date.now()}@example.com`,
          password: 'SuperAdmin123',
          name: 'Super Admin RBAC',
        });
      superAdminUser = superAdminResponse.body.user;
      await prisma.user.update({
        where: { id: superAdminUser.id },
        data: { roleId: superAdminRole!.id },
      });

      const adminResponse = await request(app.getHttpServer())
        .post('/auth/register')
        .send({
          email: `admin-rbac-${Date.now()}@example.com`,
          password: 'Admin123',
          name: 'Admin RBAC',
        });
      adminUser = adminResponse.body.user;
      await prisma.user.update({
        where: { id: adminUser.id },
        data: { roleId: adminRole!.id },
      });

      const managerResponse = await request(app.getHttpServer())
        .post('/auth/register')
        .send({
          email: `manager-rbac-${Date.now()}@example.com`,
          password: 'Manager123',
          name: 'Manager RBAC',
        });
      managerUser = managerResponse.body.user;
      await prisma.user.update({
        where: { id: managerUser.id },
        data: { roleId: managerRole!.id },
      });

      const regularResponse = await request(app.getHttpServer())
        .post('/auth/register')
        .send({
          email: `regular-rbac-${Date.now()}@example.com`,
          password: 'Regular123',
          name: 'Regular RBAC',
        });
      regularUser = regularResponse.body.user;

      // Get fresh tokens
      const superAdminLogin = await request(app.getHttpServer())
        .post('/auth/login')
        .send({
          email: superAdminUser.email,
          password: 'SuperAdmin123',
        });
      superAdminToken = superAdminLogin.body.accessToken;

      const adminLogin = await request(app.getHttpServer())
        .post('/auth/login')
        .send({
          email: adminUser.email,
          password: 'Admin123',
        });
      adminToken = adminLogin.body.accessToken;

      const managerLogin = await request(app.getHttpServer())
        .post('/auth/login')
        .send({
          email: managerUser.email,
          password: 'Manager123',
        });
      managerToken = managerLogin.body.accessToken;

      regularToken = regularResponse.body.accessToken;
    });

    afterAll(async () => {
      await prisma.user
        .delete({ where: { id: superAdminUser.id } })
        .catch(() => {});
      await prisma.user.delete({ where: { id: adminUser.id } }).catch(() => {});
      await prisma.user.delete({ where: { id: managerUser.id } }).catch(() => {});
      await prisma.user.delete({ where: { id: regularUser.id } }).catch(() => {});
    });

    it('should grant Super Admin access to all features', async () => {
      // Test various endpoints
      await request(app.getHttpServer())
        .get('/users')
        .set('Authorization', `Bearer ${superAdminToken}`)
        .expect(200);

      await request(app.getHttpServer())
        .get('/settings')
        .set('Authorization', `Bearer ${superAdminToken}`)
        .expect(200);

      await request(app.getHttpServer())
        .get('/permissions')
        .set('Authorization', `Bearer ${superAdminToken}`)
        .expect(200);

      // Create user
      const createResponse = await request(app.getHttpServer())
        .post('/users')
        .set('Authorization', `Bearer ${superAdminToken}`)
        .send({
          email: `superadmin-create-${Date.now()}@example.com`,
          password: 'Test123',
          name: 'Test',
        })
        .expect(201);

      // Delete user
      await request(app.getHttpServer())
        .delete(`/users/${createResponse.body.data.id}`)
        .set('Authorization', `Bearer ${superAdminToken}`)
        .expect(204);
    });

    it('should grant Admin appropriate access', async () => {
      // Admin can access most features
      await request(app.getHttpServer())
        .get('/users')
        .set('Authorization', `Bearer ${adminToken}`)
        .expect(200);

      await request(app.getHttpServer())
        .get('/settings')
        .set('Authorization', `Bearer ${adminToken}`)
        .expect(200);

      await request(app.getHttpServer())
        .get('/permissions')
        .set('Authorization', `Bearer ${adminToken}`)
        .expect(200);

      // Admin can create and delete users
      const createResponse = await request(app.getHttpServer())
        .post('/users')
        .set('Authorization', `Bearer ${adminToken}`)
        .send({
          email: `admin-create-${Date.now()}@example.com`,
          password: 'Test123',
          name: 'Test',
        })
        .expect(201);

      await request(app.getHttpServer())
        .delete(`/users/${createResponse.body.data.id}`)
        .set('Authorization', `Bearer ${adminToken}`)
        .expect(204);
    });

    it('should grant Manager limited access', async () => {
      // Manager can read users
      await request(app.getHttpServer())
        .get('/users')
        .set('Authorization', `Bearer ${managerToken}`)
        .expect(200);

      // Manager can create users
      const createResponse = await request(app.getHttpServer())
        .post('/users')
        .set('Authorization', `Bearer ${managerToken}`)
        .send({
          email: `manager-create-${Date.now()}@example.com`,
          password: 'Test123',
          name: 'Test',
        })
        .expect(201);

      // Manager cannot delete users
      await request(app.getHttpServer())
        .delete(`/users/${createResponse.body.data.id}`)
        .set('Authorization', `Bearer ${managerToken}`)
        .expect(403);

      // Manager cannot access all settings
      await request(app.getHttpServer())
        .get('/settings')
        .set('Authorization', `Bearer ${managerToken}`)
        .expect(403);

      // Manager cannot access permissions
      await request(app.getHttpServer())
        .get('/permissions')
        .set('Authorization', `Bearer ${managerToken}`)
        .expect(403);

      // Cleanup
      await prisma.user
        .delete({ where: { id: createResponse.body.data.id } })
        .catch(() => {});
    });

    it('should grant Regular User minimal access', async () => {
      // Regular user can read users
      await request(app.getHttpServer())
        .get('/users')
        .set('Authorization', `Bearer ${regularToken}`)
        .expect(200);

      // Regular user cannot create users
      await request(app.getHttpServer())
        .post('/users')
        .set('Authorization', `Bearer ${regularToken}`)
        .send({
          email: `regular-create-${Date.now()}@example.com`,
          password: 'Test123',
          name: 'Test',
        })
        .expect(403);

      // Regular user cannot access all settings
      await request(app.getHttpServer())
        .get('/settings')
        .set('Authorization', `Bearer ${regularToken}`)
        .expect(403);

      // Regular user cannot access permissions
      await request(app.getHttpServer())
        .get('/permissions')
        .set('Authorization', `Bearer ${regularToken}`)
        .expect(403);
    });
  });
