import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication, ValidationPipe } from '@nestjs/common';
import * as request from 'supertest';
import { AppModule } from '../src/app.module';
import { PrismaService } from '../src/prisma/prisma.service';

describe('Users JWT Authentication Fields (e2e)', () => {
  let app: INestApplication;
  let prisma: PrismaService;
  let createdUserId: string;
  let roleId: string;

  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleFixture.createNestApplication();
    app.useGlobalPipes(new ValidationPipe({ whitelist: true, transform: true }));
    await app.init();

    prisma = app.get<PrismaService>(PrismaService);

    // Get or create a test role
    const role = await prisma.userRole.findFirst({
      where: { name: 'USER' },
    });
    roleId = role?.id || 'cldefault_user';
  });

  afterAll(async () => {
    // Clean up test user if created
    if (createdUserId) {
      await prisma.user.delete({ where: { id: createdUserId } }).catch(() => {});
    }
    await app.close();
  });

  describe('POST /users - Create with JWT Auth Fields', () => {
    it('should create user with default JWT auth values', async () => {
      const response = await request(app.getHttpServer())
        .post('/users')
        .send({
          email: `test-jwt-${Date.now()}@example.com`,
          password: 'password123',
          name: 'JWT Test User',
        })
        .expect(201);

      createdUserId = response.body.id;

      expect(response.body).toHaveProperty('id');
      expect(response.body.emailVerified).toBe(false);
      expect(response.body.authProvider).toBe('local');
      expect(response.body.twoFactorEnabled).toBe(false);
      expect(response.body).not.toHaveProperty('password');
    });

    it('should create user with emailVerified true', async () => {
      const response = await request(app.getHttpServer())
        .post('/users')
        .send({
          email: `verified-${Date.now()}@example.com`,
          password: 'password123',
          emailVerified: true,
        })
        .expect(201);

      const userId = response.body.id;

      expect(response.body.emailVerified).toBe(true);

      // Cleanup
      await prisma.user.delete({ where: { id: userId } }).catch(() => {});
    });

    it('should create user with OAuth provider', async () => {
      const response = await request(app.getHttpServer())
        .post('/users')
        .send({
          email: `google-${Date.now()}@example.com`,
          password: 'password123',
          authProvider: 'google',
          emailVerified: true,
        })
        .expect(201);

      const userId = response.body.id;

      expect(response.body.authProvider).toBe('google');
      expect(response.body.emailVerified).toBe(true);

      // Cleanup
      await prisma.user.delete({ where: { id: userId } }).catch(() => {});
    });

    it('should create user with 2FA enabled', async () => {
      const response = await request(app.getHttpServer())
        .post('/users')
        .send({
          email: `2fa-${Date.now()}@example.com`,
          password: 'password123',
          twoFactorEnabled: true,
        })
        .expect(201);

      const userId = response.body.id;

      expect(response.body.twoFactorEnabled).toBe(true);

      // Cleanup
      await prisma.user.delete({ where: { id: userId } }).catch(() => {});
    });

    it('should reject invalid authProvider', async () => {
      await request(app.getHttpServer())
        .post('/users')
        .send({
          email: `invalid-${Date.now()}@example.com`,
          password: 'password123',
          authProvider: 'invalid-provider',
        })
        .expect(400);
    });

    it('should create user with all JWT auth fields', async () => {
      const response = await request(app.getHttpServer())
        .post('/users')
        .send({
          email: `full-${Date.now()}@example.com`,
          password: 'password123',
          name: 'Full JWT User',
          emailVerified: true,
          authProvider: 'github',
          twoFactorEnabled: true,
        })
        .expect(201);

      const userId = response.body.id;

      expect(response.body.emailVerified).toBe(true);
      expect(response.body.authProvider).toBe('github');
      expect(response.body.twoFactorEnabled).toBe(true);

      // Cleanup
      await prisma.user.delete({ where: { id: userId } }).catch(() => {});
    });
  });

  describe('PATCH /users/:id - Update JWT Auth Fields', () => {
    let testUserId: string;

    beforeEach(async () => {
      // Create a test user
      const user = await prisma.user.create({
        data: {
          email: `update-test-${Date.now()}@example.com`,
          password: 'hashed_password',
          roleId,
          emailVerified: false,
          authProvider: 'local',
          twoFactorEnabled: false,
        },
      });
      testUserId = user.id;
    });

    afterEach(async () => {
      // Cleanup
      await prisma.user.delete({ where: { id: testUserId } }).catch(() => {});
    });

    it('should update emailVerified status', async () => {
      const response = await request(app.getHttpServer())
        .patch(`/users/${testUserId}`)
        .send({ emailVerified: true })
        .expect(200);

      expect(response.body.emailVerified).toBe(true);
    });

    it('should update authProvider', async () => {
      const response = await request(app.getHttpServer())
        .patch(`/users/${testUserId}`)
        .send({ authProvider: 'github' })
        .expect(200);

      expect(response.body.authProvider).toBe('github');
    });

    it('should enable two-factor authentication', async () => {
      const response = await request(app.getHttpServer())
        .patch(`/users/${testUserId}`)
        .send({ twoFactorEnabled: true })
        .expect(200);

      expect(response.body.twoFactorEnabled).toBe(true);
    });

    it('should disable two-factor authentication', async () => {
      // First enable it
      await prisma.user.update({
        where: { id: testUserId },
        data: { twoFactorEnabled: true },
      });

      const response = await request(app.getHttpServer())
        .patch(`/users/${testUserId}`)
        .send({ twoFactorEnabled: false })
        .expect(200);

      expect(response.body.twoFactorEnabled).toBe(false);
    });

    it('should update multiple JWT auth fields', async () => {
      const response = await request(app.getHttpServer())
        .patch(`/users/${testUserId}`)
        .send({
          emailVerified: true,
          authProvider: 'google',
          twoFactorEnabled: true,
        })
        .expect(200);

      expect(response.body.emailVerified).toBe(true);
      expect(response.body.authProvider).toBe('google');
      expect(response.body.twoFactorEnabled).toBe(true);
    });

    it('should reject invalid authProvider on update', async () => {
      await request(app.getHttpServer())
        .patch(`/users/${testUserId}`)
        .send({ authProvider: 'invalid-provider' })
        .expect(400);
    });
  });

  describe('GET /users - List with JWT Auth Fields', () => {
    let testUserIds: string[] = [];

    beforeAll(async () => {
      // Create test users with different JWT auth configurations
      const users = await Promise.all([
        prisma.user.create({
          data: {
            email: `list-test-1-${Date.now()}@example.com`,
            password: 'hashed',
            roleId,
            emailVerified: true,
            authProvider: 'local',
            twoFactorEnabled: false,
          },
        }),
        prisma.user.create({
          data: {
            email: `list-test-2-${Date.now()}@example.com`,
            password: 'hashed',
            roleId,
            emailVerified: false,
            authProvider: 'google',
            twoFactorEnabled: true,
          },
        }),
      ]);
      testUserIds = users.map((u) => u.id);
    });

    afterAll(async () => {
      // Cleanup
      await Promise.all(
        testUserIds.map((id) => prisma.user.delete({ where: { id } }).catch(() => {})),
      );
    });

    it('should return users with JWT auth fields', async () => {
      const response = await request(app.getHttpServer()).get('/users').expect(200);

      expect(response.body.users).toBeInstanceOf(Array);
      expect(response.body.users.length).toBeGreaterThan(0);

      const user = response.body.users[0];
      expect(user).toHaveProperty('emailVerified');
      expect(user).toHaveProperty('authProvider');
      expect(user).toHaveProperty('twoFactorEnabled');
      expect(user).not.toHaveProperty('password');
    });
  });

  describe('GET /users/:id - Get with JWT Auth Fields', () => {
    let testUserId: string;

    beforeAll(async () => {
      const user = await prisma.user.create({
        data: {
          email: `get-test-${Date.now()}@example.com`,
          password: 'hashed',
          roleId,
          emailVerified: true,
          authProvider: 'github',
          twoFactorEnabled: true,
        },
      });
      testUserId = user.id;
    });

    afterAll(async () => {
      await prisma.user.delete({ where: { id: testUserId } }).catch(() => {});
    });

    it('should return user with JWT auth fields', async () => {
      const response = await request(app.getHttpServer())
        .get(`/users/${testUserId}`)
        .expect(200);

      expect(response.body.id).toBe(testUserId);
      expect(response.body.emailVerified).toBe(true);
      expect(response.body.authProvider).toBe('github');
      expect(response.body.twoFactorEnabled).toBe(true);
      expect(response.body).not.toHaveProperty('password');
    });
  });

  describe('Data Persistence - JWT Auth Fields', () => {
    it('should persist JWT auth fields across updates', async () => {
      // Create user
      const createResponse = await request(app.getHttpServer())
        .post('/users')
        .send({
          email: `persist-${Date.now()}@example.com`,
          password: 'password123',
          emailVerified: false,
          authProvider: 'local',
          twoFactorEnabled: false,
        })
        .expect(201);

      const userId = createResponse.body.id;

      // Update emailVerified
      await request(app.getHttpServer())
        .patch(`/users/${userId}`)
        .send({ emailVerified: true })
        .expect(200);

      // Update authProvider
      await request(app.getHttpServer())
        .patch(`/users/${userId}`)
        .send({ authProvider: 'google' })
        .expect(200);

      // Update twoFactorEnabled
      await request(app.getHttpServer())
        .patch(`/users/${userId}`)
        .send({ twoFactorEnabled: true })
        .expect(200);

      // Verify all fields persisted
      const finalResponse = await request(app.getHttpServer())
        .get(`/users/${userId}`)
        .expect(200);

      expect(finalResponse.body.emailVerified).toBe(true);
      expect(finalResponse.body.authProvider).toBe('google');
      expect(finalResponse.body.twoFactorEnabled).toBe(true);

      // Cleanup
      await prisma.user.delete({ where: { id: userId } }).catch(() => {});
    });
  });
});
