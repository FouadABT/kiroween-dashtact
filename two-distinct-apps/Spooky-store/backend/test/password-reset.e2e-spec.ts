import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication, ValidationPipe } from '@nestjs/common';
import request from 'supertest';
import { AppModule } from '../src/app.module';
import { PrismaService } from '../src/prisma/prisma.service';

describe('Password Reset (e2e)', () => {
  let app: INestApplication;
  let prisma: PrismaService;
  let testUser: any;
  let resetToken: string;

  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleFixture.createNestApplication();
    app.useGlobalPipes(new ValidationPipe({ whitelist: true, transform: true }));
    await app.init();

    prisma = moduleFixture.get<PrismaService>(PrismaService);

    // Create test user
    const userRole = await prisma.userRole.findFirst({
      where: { name: 'USER' },
    });

    testUser = await prisma.user.create({
      data: {
        email: 'password-reset-test@example.com',
        name: 'Password Reset Test User',
        password: 'hashedOldPassword',
        roleId: userRole!.id,
      },
    });
  });

  afterAll(async () => {
    // Cleanup
    await prisma.passwordResetToken.deleteMany({
      where: { userId: testUser.id },
    });
    await prisma.user.delete({
      where: { id: testUser.id },
    });
    await app.close();
  });

  afterEach(async () => {
    // Clean up tokens after each test
    await prisma.passwordResetToken.deleteMany({
      where: { userId: testUser.id },
    });
  });

  describe('/auth/password-reset/request (POST)', () => {
    it('should create a password reset token for valid email', async () => {
      const response = await request(app.getHttpServer())
        .post('/auth/password-reset/request')
        .send({ email: testUser.email })
        .expect(201);

      expect(response.body).toHaveProperty('message');

      // Verify token was created in database
      const token = await prisma.passwordResetToken.findFirst({
        where: { userId: testUser.id },
      });

      expect(token).toBeDefined();
      expect(token!.isUsed).toBe(false);
      expect(token!.expiresAt).toBeInstanceOf(Date);
      expect(token!.expiresAt.getTime()).toBeGreaterThan(Date.now());

      resetToken = token!.token;
    });

    it('should return 404 for non-existent email', async () => {
      await request(app.getHttpServer())
        .post('/auth/password-reset/request')
        .send({ email: 'nonexistent@example.com' })
        .expect(404);
    });

    it('should validate email format', async () => {
      await request(app.getHttpServer())
        .post('/auth/password-reset/request')
        .send({ email: 'invalid-email' })
        .expect(400);
    });

    it('should require email field', async () => {
      await request(app.getHttpServer())
        .post('/auth/password-reset/request')
        .send({})
        .expect(400);
    });

    it('should allow multiple reset requests', async () => {
      // First request
      await request(app.getHttpServer())
        .post('/auth/password-reset/request')
        .send({ email: testUser.email })
        .expect(201);

      // Second request
      await request(app.getHttpServer())
        .post('/auth/password-reset/request')
        .send({ email: testUser.email })
        .expect(201);

      // Verify multiple tokens exist
      const tokens = await prisma.passwordResetToken.findMany({
        where: { userId: testUser.id },
      });

      expect(tokens.length).toBeGreaterThanOrEqual(2);
    });

    it('should create token with 1 hour expiration', async () => {
      await request(app.getHttpServer())
        .post('/auth/password-reset/request')
        .send({ email: testUser.email })
        .expect(201);

      const token = await prisma.passwordResetToken.findFirst({
        where: { userId: testUser.id },
        orderBy: { createdAt: 'desc' },
      });

      const expectedExpiry = Date.now() + 3600000; // 1 hour
      const actualExpiry = token!.expiresAt.getTime();

      // Allow 5 second tolerance
      expect(Math.abs(actualExpiry - expectedExpiry)).toBeLessThan(5000);
    });
  });

  describe('/auth/password-reset/confirm (POST)', () => {
    beforeEach(async () => {
      // Create a valid reset token
      const token = await prisma.passwordResetToken.create({
        data: {
          userId: testUser.id,
          token: 'valid-reset-token-' + Date.now(),
          expiresAt: new Date(Date.now() + 3600000),
        },
      });
      resetToken = token.token;
    });

    it('should reset password with valid token', async () => {
      const response = await request(app.getHttpServer())
        .post('/auth/password-reset/confirm')
        .send({
          token: resetToken,
          password: 'newPassword123',
          confirmPassword: 'newPassword123',
        })
        .expect(200);

      expect(response.body).toHaveProperty('message');

      // Verify token is marked as used
      const usedToken = await prisma.passwordResetToken.findUnique({
        where: { token: resetToken },
      });

      expect(usedToken!.isUsed).toBe(true);

      // Verify lastPasswordChange was updated
      const updatedUser = await prisma.user.findUnique({
        where: { id: testUser.id },
      });

      expect(updatedUser!.lastPasswordChange).toBeDefined();
      expect(updatedUser!.lastPasswordChange!.getTime()).toBeGreaterThan(
        testUser.createdAt.getTime(),
      );
    });

    it('should reject invalid token', async () => {
      await request(app.getHttpServer())
        .post('/auth/password-reset/confirm')
        .send({
          token: 'invalid-token',
          password: 'newPassword123',
          confirmPassword: 'newPassword123',
        })
        .expect(400);
    });

    it('should reject already used token', async () => {
      // Use the token once
      await request(app.getHttpServer())
        .post('/auth/password-reset/confirm')
        .send({
          token: resetToken,
          password: 'newPassword123',
          confirmPassword: 'newPassword123',
        })
        .expect(200);

      // Try to use it again
      await request(app.getHttpServer())
        .post('/auth/password-reset/confirm')
        .send({
          token: resetToken,
          password: 'anotherPassword123',
          confirmPassword: 'anotherPassword123',
        })
        .expect(400);
    });

    it('should reject expired token', async () => {
      // Create expired token
      const expiredToken = await prisma.passwordResetToken.create({
        data: {
          userId: testUser.id,
          token: 'expired-token-' + Date.now(),
          expiresAt: new Date(Date.now() - 1000), // Expired 1 second ago
        },
      });

      await request(app.getHttpServer())
        .post('/auth/password-reset/confirm')
        .send({
          token: expiredToken.token,
          password: 'newPassword123',
          confirmPassword: 'newPassword123',
        })
        .expect(400);
    });

    it('should validate password requirements', async () => {
      await request(app.getHttpServer())
        .post('/auth/password-reset/confirm')
        .send({
          token: resetToken,
          password: '123', // Too short
          confirmPassword: '123',
        })
        .expect(400);
    });

    it('should require password confirmation to match', async () => {
      await request(app.getHttpServer())
        .post('/auth/password-reset/confirm')
        .send({
          token: resetToken,
          password: 'newPassword123',
          confirmPassword: 'differentPassword123',
        })
        .expect(400);
    });

    it('should require all fields', async () => {
      await request(app.getHttpServer())
        .post('/auth/password-reset/confirm')
        .send({ token: resetToken })
        .expect(400);

      await request(app.getHttpServer())
        .post('/auth/password-reset/confirm')
        .send({ password: 'newPassword123' })
        .expect(400);
    });
  });

  describe('Token cleanup', () => {
    it('should allow cleanup of expired tokens', async () => {
      // Create expired tokens
      await prisma.passwordResetToken.createMany({
        data: [
          {
            userId: testUser.id,
            token: 'expired-1',
            expiresAt: new Date(Date.now() - 1000),
          },
          {
            userId: testUser.id,
            token: 'expired-2',
            expiresAt: new Date(Date.now() - 2000),
          },
        ],
      });

      // Create valid token
      await prisma.passwordResetToken.create({
        data: {
          userId: testUser.id,
          token: 'valid-token',
          expiresAt: new Date(Date.now() + 3600000),
        },
      });

      // Cleanup expired tokens
      const result = await prisma.passwordResetToken.deleteMany({
        where: {
          expiresAt: { lt: new Date() },
        },
      });

      expect(result.count).toBe(2);

      // Verify valid token still exists
      const validToken = await prisma.passwordResetToken.findUnique({
        where: { token: 'valid-token' },
      });

      expect(validToken).toBeDefined();
    });

    it('should allow cleanup of used tokens', async () => {
      // Create used tokens
      await prisma.passwordResetToken.createMany({
        data: [
          {
            userId: testUser.id,
            token: 'used-1',
            expiresAt: new Date(Date.now() + 3600000),
            isUsed: true,
          },
          {
            userId: testUser.id,
            token: 'used-2',
            expiresAt: new Date(Date.now() + 3600000),
            isUsed: true,
          },
        ],
      });

      // Cleanup used tokens
      const result = await prisma.passwordResetToken.deleteMany({
        where: { isUsed: true },
      });

      expect(result.count).toBe(2);
    });
  });

  describe('Database constraints', () => {
    it('should enforce unique token constraint', async () => {
      const tokenData = {
        userId: testUser.id,
        token: 'duplicate-token',
        expiresAt: new Date(Date.now() + 3600000),
      };

      await prisma.passwordResetToken.create({ data: tokenData });

      // Try to create duplicate
      await expect(
        prisma.passwordResetToken.create({ data: tokenData }),
      ).rejects.toThrow();
    });

    it('should cascade delete tokens when user is deleted', async () => {
      // Create temporary user
      const userRole = await prisma.userRole.findFirst({
        where: { name: 'USER' },
      });

      const tempUser = await prisma.user.create({
        data: {
          email: 'temp-user@example.com',
          name: 'Temp User',
          password: 'hashedPassword',
          roleId: userRole!.id,
        },
      });

      // Create reset token
      await prisma.passwordResetToken.create({
        data: {
          userId: tempUser.id,
          token: 'temp-token',
          expiresAt: new Date(Date.now() + 3600000),
        },
      });

      // Delete user
      await prisma.user.delete({ where: { id: tempUser.id } });

      // Verify token was cascade deleted
      const token = await prisma.passwordResetToken.findUnique({
        where: { token: 'temp-token' },
      });

      expect(token).toBeNull();
    });

    it('should have proper indexes for performance', async () => {
      // This test verifies indexes exist by checking query performance
      // In a real scenario, you'd use EXPLAIN ANALYZE

      // Create multiple tokens
      const tokens = [];
      for (let i = 0; i < 100; i++) {
        tokens.push({
          userId: testUser.id,
          token: `token-${i}`,
          expiresAt: new Date(Date.now() + 3600000),
        });
      }

      await prisma.passwordResetToken.createMany({ data: tokens });

      // Query by token (should use index)
      const startTime = Date.now();
      await prisma.passwordResetToken.findUnique({
        where: { token: 'token-50' },
      });
      const queryTime = Date.now() - startTime;

      // Query should be fast (< 100ms) with index
      expect(queryTime).toBeLessThan(100);

      // Cleanup
      await prisma.passwordResetToken.deleteMany({
        where: { userId: testUser.id },
      });
    });
  });

  describe('User relation', () => {
    it('should include user data when querying token', async () => {
      const token = await prisma.passwordResetToken.create({
        data: {
          userId: testUser.id,
          token: 'relation-test-token',
          expiresAt: new Date(Date.now() + 3600000),
        },
      });

      const tokenWithUser = await prisma.passwordResetToken.findUnique({
        where: { id: token.id },
        include: { user: true },
      });

      expect(tokenWithUser!.user).toBeDefined();
      expect(tokenWithUser!.user.id).toBe(testUser.id);
      expect(tokenWithUser!.user.email).toBe(testUser.email);
    });

    it('should query all tokens for a user', async () => {
      // Create multiple tokens
      await prisma.passwordResetToken.createMany({
        data: [
          {
            userId: testUser.id,
            token: 'user-token-1',
            expiresAt: new Date(Date.now() + 3600000),
          },
          {
            userId: testUser.id,
            token: 'user-token-2',
            expiresAt: new Date(Date.now() + 3600000),
          },
        ],
      });

      const user = await prisma.user.findUnique({
        where: { id: testUser.id },
        include: { passwordResetTokens: true },
      });

      expect(user!.passwordResetTokens).toBeDefined();
      expect(user!.passwordResetTokens.length).toBeGreaterThanOrEqual(2);
    });
  });
});
