import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication, ValidationPipe } from '@nestjs/common';
import * as request from 'supertest';
import { AppModule } from '../src/app.module';
import { PrismaClient } from '../generated/prisma';

describe('Auth Registration (e2e)', () => {
  let app: INestApplication;
  let prisma: PrismaClient;

  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleFixture.createNestApplication();
    
    // Apply global validation pipe (same as main.ts)
    app.useGlobalPipes(
      new ValidationPipe({
        whitelist: true,
        forbidNonWhitelisted: true,
        transform: true,
      }),
    );

    await app.init();

    prisma = app.get<PrismaClient>(PrismaClient);
  });

  afterAll(async () => {
    await app.close();
  });

  beforeEach(async () => {
    // Clean up test users before each test
    await prisma.user.deleteMany({
      where: {
        email: {
          contains: 'test-register',
        },
      },
    });
  });

  describe('POST /auth/register', () => {
    const validRegistrationData = {
      email: 'test-register@example.com',
      password: 'Password123',
      name: 'Test User',
    };

    it('should register a new user successfully', () => {
      return request(app.getHttpServer())
        .post('/auth/register')
        .send(validRegistrationData)
        .expect(201)
        .expect((res) => {
          expect(res.body).toHaveProperty('user');
          expect(res.body).toHaveProperty('accessToken');
          expect(res.body).toHaveProperty('refreshToken');
          expect(res.body).toHaveProperty('expiresIn');
          expect(res.body.user.email).toBe(validRegistrationData.email);
          expect(res.body.user.name).toBe(validRegistrationData.name);
          expect(res.body.user).not.toHaveProperty('password');
        });
    });

    it('should register user without name', () => {
      const dataWithoutName = {
        email: 'test-register-no-name@example.com',
        password: 'Password123',
      };

      return request(app.getHttpServer())
        .post('/auth/register')
        .send(dataWithoutName)
        .expect(201)
        .expect((res) => {
          expect(res.body.user.email).toBe(dataWithoutName.email);
          expect(res.body.user.name).toBeNull();
        });
    });

    it('should return 409 if email already exists', async () => {
      // First registration
      await request(app.getHttpServer())
        .post('/auth/register')
        .send(validRegistrationData)
        .expect(201);

      // Second registration with same email
      return request(app.getHttpServer())
        .post('/auth/register')
        .send(validRegistrationData)
        .expect(409)
        .expect((res) => {
          expect(res.body.message).toContain('Email already in use');
        });
    });

    it('should validate email format', () => {
      const invalidEmailData = {
        email: 'invalid-email',
        password: 'Password123',
        name: 'Test User',
      };

      return request(app.getHttpServer())
        .post('/auth/register')
        .send(invalidEmailData)
        .expect(400)
        .expect((res) => {
          expect(res.body.message).toContain('email');
        });
    });

    it('should validate password minimum length', () => {
      const shortPasswordData = {
        email: 'test-register-short@example.com',
        password: 'Pass1',
        name: 'Test User',
      };

      return request(app.getHttpServer())
        .post('/auth/register')
        .send(shortPasswordData)
        .expect(400)
        .expect((res) => {
          expect(res.body.message).toContain('Password must be at least');
        });
    });

    it('should validate password complexity', () => {
      const weakPasswordData = {
        email: 'test-register-weak@example.com',
        password: 'password',
        name: 'Test User',
      };

      return request(app.getHttpServer())
        .post('/auth/register')
        .send(weakPasswordData)
        .expect(400)
        .expect((res) => {
          expect(res.body.message).toContain('Password must contain');
        });
    });

    it('should require email field', () => {
      const noEmailData = {
        password: 'Password123',
        name: 'Test User',
      };

      return request(app.getHttpServer())
        .post('/auth/register')
        .send(noEmailData)
        .expect(400);
    });

    it('should require password field', () => {
      const noPasswordData = {
        email: 'test-register-no-pass@example.com',
        name: 'Test User',
      };

      return request(app.getHttpServer())
        .post('/auth/register')
        .send(noPasswordData)
        .expect(400);
    });

    it('should assign default USER role', async () => {
      const response = await request(app.getHttpServer())
        .post('/auth/register')
        .send({
          email: 'test-register-role@example.com',
          password: 'Password123',
          name: 'Test User',
        })
        .expect(201);

      expect(response.body.user.role.name).toBe('USER');
    });

    it('should hash password before storing', async () => {
      const registrationData = {
        email: 'test-register-hash@example.com',
        password: 'Password123',
        name: 'Test User',
      };

      await request(app.getHttpServer())
        .post('/auth/register')
        .send(registrationData)
        .expect(201);

      // Verify password is hashed in database
      const user = await prisma.user.findUnique({
        where: { email: registrationData.email },
      });

      expect(user).toBeDefined();
      expect(user!.password).not.toBe(registrationData.password);
      expect(user!.password).toMatch(/^\$2[aby]\$/); // bcrypt hash pattern
    });

    it('should return valid JWT tokens', async () => {
      const response = await request(app.getHttpServer())
        .post('/auth/register')
        .send({
          email: 'test-register-jwt@example.com',
          password: 'Password123',
          name: 'Test User',
        })
        .expect(201);

      expect(response.body.accessToken).toBeDefined();
      expect(response.body.refreshToken).toBeDefined();
      expect(typeof response.body.accessToken).toBe('string');
      expect(typeof response.body.refreshToken).toBe('string');
      expect(response.body.accessToken.split('.')).toHaveLength(3); // JWT format
      expect(response.body.refreshToken.split('.')).toHaveLength(3);
    });

    it('should include role information in response', async () => {
      const response = await request(app.getHttpServer())
        .post('/auth/register')
        .send({
          email: 'test-register-role-info@example.com',
          password: 'Password123',
          name: 'Test User',
        })
        .expect(201);

      expect(response.body.user.role).toHaveProperty('id');
      expect(response.body.user.role).toHaveProperty('name');
      expect(response.body.user.role).toHaveProperty('description');
    });

    it('should include permissions in response', async () => {
      const response = await request(app.getHttpServer())
        .post('/auth/register')
        .send({
          email: 'test-register-permissions@example.com',
          password: 'Password123',
          name: 'Test User',
        })
        .expect(201);

      expect(response.body.user.permissions).toBeDefined();
      expect(Array.isArray(response.body.user.permissions)).toBe(true);
    });

    it('should create user with correct default values', async () => {
      const registrationData = {
        email: 'test-register-defaults@example.com',
        password: 'Password123',
        name: 'Test User',
      };

      await request(app.getHttpServer())
        .post('/auth/register')
        .send(registrationData)
        .expect(201);

      const user = await prisma.user.findUnique({
        where: { email: registrationData.email },
      });

      expect(user).toBeDefined();
      expect(user!.isActive).toBe(true);
      expect(user!.emailVerified).toBe(false);
      expect(user!.authProvider).toBe('local');
      expect(user!.twoFactorEnabled).toBe(false);
    });

    it('should reject extra fields not in DTO', () => {
      const dataWithExtraFields = {
        email: 'test-register-extra@example.com',
        password: 'Password123',
        name: 'Test User',
        isAdmin: true, // Extra field
        role: 'ADMIN', // Extra field
      };

      return request(app.getHttpServer())
        .post('/auth/register')
        .send(dataWithExtraFields)
        .expect(400);
    });

    it('should handle concurrent registrations with different emails', async () => {
      const registrations = [
        {
          email: 'test-register-concurrent1@example.com',
          password: 'Password123',
          name: 'User 1',
        },
        {
          email: 'test-register-concurrent2@example.com',
          password: 'Password123',
          name: 'User 2',
        },
        {
          email: 'test-register-concurrent3@example.com',
          password: 'Password123',
          name: 'User 3',
        },
      ];

      const promises = registrations.map((data) =>
        request(app.getHttpServer()).post('/auth/register').send(data),
      );

      const results = await Promise.all(promises);

      results.forEach((result) => {
        expect(result.status).toBe(201);
        expect(result.body).toHaveProperty('accessToken');
      });
    });
  });
});
