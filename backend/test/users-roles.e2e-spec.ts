import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication, ValidationPipe } from '@nestjs/common';
import * as request from 'supertest';
import { AppModule } from './../src/app.module';
import { PrismaService } from '../src/prisma/prisma.service';

describe('Users Roles API (e2e)', () => {
  let app: INestApplication;
  let prisma: PrismaService;
  let createdUserId: string;
  let userRoleId: string;
  let adminRoleId: string;

  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleFixture.createNestApplication();
    app.useGlobalPipes(new ValidationPipe());
    await app.init();

    prisma = app.get<PrismaService>(PrismaService);

    // Get role IDs for testing
    const userRole = await prisma.userRole.findUnique({
      where: { name: 'USER' },
    });
    const adminRole = await prisma.userRole.findUnique({
      where: { name: 'ADMIN' },
    });

    userRoleId = userRole?.id || 'cldefault_user';
    adminRoleId = adminRole?.id || 'cldefault_admin';
  });

  afterAll(async () => {
    // Clean up test user if created
    if (createdUserId) {
      await prisma.user.delete({ where: { id: createdUserId } }).catch(() => {});
    }
    await app.close();
  });

  describe('GET /users/roles', () => {
    it('should return all available roles', () => {
      return request(app.getHttpServer())
        .get('/users/roles')
        .expect(200)
        .expect((res) => {
          expect(res.body.statusCode).toBe(200);
          expect(res.body.message).toBe('Roles retrieved successfully');
          expect(Array.isArray(res.body.data)).toBe(true);
          expect(res.body.data.length).toBeGreaterThan(0);

          // Check role structure
          const role = res.body.data[0];
          expect(role).toHaveProperty('id');
          expect(role).toHaveProperty('name');
          expect(role).toHaveProperty('description');
          expect(role).toHaveProperty('isActive');
          expect(role).toHaveProperty('createdAt');
          expect(role).toHaveProperty('updatedAt');
        });
    });

    it('should return roles in alphabetical order', () => {
      return request(app.getHttpServer())
        .get('/users/roles')
        .expect(200)
        .expect((res) => {
          const roles = res.body.data;
          const roleNames = roles.map((r: any) => r.name);
          const sortedNames = [...roleNames].sort();
          expect(roleNames).toEqual(sortedNames);
        });
    });

    it('should only return active roles', () => {
      return request(app.getHttpServer())
        .get('/users/roles')
        .expect(200)
        .expect((res) => {
          const roles = res.body.data;
          const allActive = roles.every((r: any) => r.isActive === true);
          expect(allActive).toBe(true);
        });
    });
  });

  describe('POST /users - with roleId', () => {
    it('should create user with specified roleId', () => {
      const createDto = {
        email: `test-${Date.now()}@example.com`,
        name: 'Test User',
        password: 'password123',
        roleId: userRoleId,
      };

      return request(app.getHttpServer())
        .post('/users')
        .send(createDto)
        .expect(201)
        .expect((res) => {
          expect(res.body.statusCode).toBe(201);
          expect(res.body.data).toHaveProperty('id');
          expect(res.body.data).toHaveProperty('role');
          expect(res.body.data.role.name).toBe('USER');
          expect(res.body.data.roleId).toBe(userRoleId);
          expect(res.body.data).not.toHaveProperty('password');

          createdUserId = res.body.data.id;
        });
    });

    it('should create user with default role if roleId not provided', () => {
      const createDto = {
        email: `test-default-${Date.now()}@example.com`,
        name: 'Test User Default',
        password: 'password123',
      };

      return request(app.getHttpServer())
        .post('/users')
        .send(createDto)
        .expect(201)
        .expect((res) => {
          expect(res.body.data.role.name).toBe('USER');
          
          // Clean up
          const userId = res.body.data.id;
          prisma.user.delete({ where: { id: userId } }).catch(() => {});
        });
    });

    it('should reject invalid roleId', () => {
      const createDto = {
        email: `test-invalid-${Date.now()}@example.com`,
        name: 'Test User',
        password: 'password123',
        roleId: 'invalid_role_id',
      };

      return request(app.getHttpServer())
        .post('/users')
        .send(createDto)
        .expect(400);
    });
  });

  describe('GET /users - with role filtering', () => {
    it('should filter users by roleId', () => {
      return request(app.getHttpServer())
        .get(`/users?roleId=${userRoleId}`)
        .expect(200)
        .expect((res) => {
          expect(res.body.data.users).toBeDefined();
          const users = res.body.data.users;
          
          if (users.length > 0) {
            users.forEach((user: any) => {
              expect(user.roleId).toBe(userRoleId);
              expect(user.role).toBeDefined();
              expect(user.role.name).toBe('USER');
            });
          }
        });
    });

    it('should filter users by roleName', () => {
      return request(app.getHttpServer())
        .get('/users?roleName=ADMIN')
        .expect(200)
        .expect((res) => {
          const users = res.body.data.users;
          
          if (users.length > 0) {
            users.forEach((user: any) => {
              expect(user.role.name).toBe('ADMIN');
            });
          }
        });
    });

    it('should include role object in user response', () => {
      return request(app.getHttpServer())
        .get('/users')
        .expect(200)
        .expect((res) => {
          const users = res.body.data.users;
          
          if (users.length > 0) {
            const user = users[0];
            expect(user).toHaveProperty('role');
            expect(user.role).toHaveProperty('id');
            expect(user.role).toHaveProperty('name');
            expect(user.role).toHaveProperty('description');
            expect(user).not.toHaveProperty('password');
          }
        });
    });
  });

  describe('GET /users/:id - with role data', () => {
    it('should return user with role object', async () => {
      if (!createdUserId) {
        // Create a test user first
        const createDto = {
          email: `test-get-${Date.now()}@example.com`,
          name: 'Test User',
          password: 'password123',
          roleId: userRoleId,
        };

        const createRes = await request(app.getHttpServer())
          .post('/users')
          .send(createDto);

        createdUserId = createRes.body.data.id;
      }

      return request(app.getHttpServer())
        .get(`/users/${createdUserId}`)
        .expect(200)
        .expect((res) => {
          expect(res.body.data).toHaveProperty('role');
          expect(res.body.data.role).toHaveProperty('name');
          expect(res.body.data.role).toHaveProperty('description');
          expect(res.body.data).not.toHaveProperty('password');
        });
    });
  });

  describe('PATCH /users/:id - with roleId update', () => {
    it('should update user role', async () => {
      if (!createdUserId) {
        // Create a test user first
        const createDto = {
          email: `test-update-${Date.now()}@example.com`,
          name: 'Test User',
          password: 'password123',
          roleId: userRoleId,
        };

        const createRes = await request(app.getHttpServer())
          .post('/users')
          .send(createDto);

        createdUserId = createRes.body.data.id;
      }

      const updateDto = {
        roleId: adminRoleId,
      };

      return request(app.getHttpServer())
        .patch(`/users/${createdUserId}`)
        .send(updateDto)
        .expect(200)
        .expect((res) => {
          expect(res.body.data.roleId).toBe(adminRoleId);
          expect(res.body.data.role.name).toBe('ADMIN');
        });
    });

    it('should reject invalid roleId on update', async () => {
      if (!createdUserId) {
        return;
      }

      const updateDto = {
        roleId: 'invalid_role_id',
      };

      return request(app.getHttpServer())
        .patch(`/users/${createdUserId}`)
        .send(updateDto)
        .expect(400);
    });
  });

  describe('Role data integrity', () => {
    it('should maintain role relationship after user updates', async () => {
      if (!createdUserId) {
        return;
      }

      // Update user name
      await request(app.getHttpServer())
        .patch(`/users/${createdUserId}`)
        .send({ name: 'Updated Name' })
        .expect(200);

      // Verify role is still intact
      return request(app.getHttpServer())
        .get(`/users/${createdUserId}`)
        .expect(200)
        .expect((res) => {
          expect(res.body.data.role).toBeDefined();
          expect(res.body.data.role).toHaveProperty('name');
        });
    });
  });
});
