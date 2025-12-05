import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication, ValidationPipe } from '@nestjs/common';
import request from 'supertest';
import { AppModule } from '../src/app.module';
import { PrismaService } from '../src/prisma/prisma.service';

describe('Comprehensive Authentication E2E Tests', () => {
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

  describe('Complete Registration Flow', () => {
    const testEmail = `complete-reg-${Date.now()}@example.com`;
    const testPassword = 'CompleteReg123';
    const testName = 'Complete Registration User';

    it('should complete full registration flow with all validations', async () => {
      // Step 1: Register new user
      const registerResponse = await request(app.getHttpServer())
        .post('/auth/register')
        .send({
          email: testEmail,
          password: testPassword,
          name: testName,
        })
        .expect(201);

      // Verify response structure
      expect(registerResponse.body).toHaveProperty('user');
      expect(registerResponse.body).toHaveProperty('accessToken');
      expect(registerResponse.body).toHaveProperty('refreshToken');
      expect(registerResponse.body).toHaveProperty('expiresIn');

      // Verify user data
      expect(registerResponse.body.user.email).toBe(testEmail);
      expect(registerResponse.body.user.name).toBe(testName);
      expect(registerResponse.body.user).not.toHaveProperty('password');
      expect(registerResponse.body.user.role).toBeDefined();
      expect(registerResponse.body.user.role.name).toBe('USER');
      expect(registerResponse.body.user.permissions).toBeDefined();
      expect(Array.isArray(registerResponse.body.user.permissions)).toBe(true);

      // Verify tokens are valid JWT format
      expect(registerResponse.body.accessToken.split('.')).toHaveLength(3);
      expect(registerResponse.body.refreshToken.split('.')).toHaveLength(3);

      // Step 2: Verify user can access protected endpoint with token
      const accessToken = registerResponse.body.accessToken;
      const profileResponse = await request(app.getHttpServer())
        .get('/auth/profile')
        .set('Authorization', `Bearer ${accessToken}`)
        .expect(200);

      expect(profileResponse.body.email).toBe(testEmail);
      expect(profileResponse.body.name).toBe(testName);

      // Step 3: Verify user exists in database with correct defaults
      const dbUser = await prisma.user.findUnique({
        where: { email: testEmail },
        include: { role: true },
      });

      expect(dbUser).toBeDefined();
      expect(dbUser!.email).toBe(testEmail);
      expect(dbUser!.name).toBe(testName);
      expect(dbUser!.isActive).toBe(true);
      expect(dbUser!.emailVerified).toBe(false);
      expect(dbUser!.authProvider).toBe('local');
      expect(dbUser!.twoFactorEnabled).toBe(false);
      expect(dbUser!.password).not.toBe(testPassword); // Password should be hashed
      expect(dbUser!.password).toMatch(/^\$2[aby]\$/); // bcrypt hash pattern
      expect(dbUser!.role.name).toBe('USER');

      // Cleanup
      await prisma.user.delete({ where: { id: dbUser!.id } });
    });

    it('should prevent duplicate registration', async () => {
      const duplicateEmail = `duplicate-${Date.now()}@example.com`;

      // First registration
      await request(app.getHttpServer())
        .post('/auth/register')
        .send({
          email: duplicateEmail,
          password: testPassword,
          name: 'First User',
        })
        .expect(201);

      // Second registration with same email
      await request(app.getHttpServer())
        .post('/auth/register')
        .send({
          email: duplicateEmail,
          password: testPassword,
          name: 'Second User',
        })
        .expect(409);

      // Cleanup
      await prisma.user.deleteMany({ where: { email: duplicateEmail } });
    });

    it('should validate password requirements during registration', async () => {
      const weakPasswords = [
        { password: 'short', reason: 'too short' },
        { password: 'alllowercase', reason: 'no uppercase' },
        { password: 'ALLUPPERCASE', reason: 'no lowercase' },
        { password: 'NoNumbers', reason: 'no numbers' },
      ];

      for (const { password, reason } of weakPasswords) {
        const response = await request(app.getHttpServer())
          .post('/auth/register')
          .send({
            email: `weak-${Date.now()}-${reason}@example.com`,
            password,
            name: 'Test User',
          })
          .expect(400);

        expect(response.body.message).toBeDefined();
      }
    });
  });

  describe('Complete Login Flow', () => {
    let testUser: any;
    const loginEmail = `login-flow-${Date.now()}@example.com`;
    const loginPassword = 'LoginFlow123';

    beforeAll(async () => {
      // Create test user
      const response = await request(app.getHttpServer())
        .post('/auth/register')
        .send({
          email: loginEmail,
          password: loginPassword,
          name: 'Login Flow User',
        });
      testUser = response.body.user;
    });

    afterAll(async () => {
      await prisma.user.delete({ where: { id: testUser.id } }).catch(() => {});
    });

    it('should complete full login flow with valid credentials', async () => {
      // Step 1: Login with valid credentials
      const loginResponse = await request(app.getHttpServer())
        .post('/auth/login')
        .send({
          email: loginEmail,
          password: loginPassword,
        })
        .expect(200);

      // Verify response structure
      expect(loginResponse.body).toHaveProperty('user');
      expect(loginResponse.body).toHaveProperty('accessToken');
      expect(loginResponse.body).toHaveProperty('refreshToken');
      expect(loginResponse.body).toHaveProperty('expiresIn');

      // Verify user data
      expect(loginResponse.body.user.email).toBe(loginEmail);
      expect(loginResponse.body.user).not.toHaveProperty('password');
      expect(loginResponse.body.user.role).toBeDefined();
      expect(loginResponse.body.user.permissions).toBeDefined();

      // Step 2: Use access token to access protected endpoint
      const accessToken = loginResponse.body.accessToken;
      const profileResponse = await request(app.getHttpServer())
        .get('/auth/profile')
        .set('Authorization', `Bearer ${accessToken}`)
        .expect(200);

      expect(profileResponse.body.email).toBe(loginEmail);

      // Step 3: Verify token contains correct user information
      const usersResponse = await request(app.getHttpServer())
        .get('/users')
        .set('Authorization', `Bearer ${accessToken}`)
        .expect(200);

      expect(usersResponse.body.data).toBeDefined();
    });

    it('should reject login with invalid email', async () => {
      await request(app.getHttpServer())
        .post('/auth/login')
        .send({
          email: 'nonexistent@example.com',
          password: loginPassword,
        })
        .expect(401);
    });

    it('should reject login with invalid password', async () => {
      await request(app.getHttpServer())
        .post('/auth/login')
        .send({
          email: loginEmail,
          password: 'WrongPassword123',
        })
        .expect(401);
    });

    it('should not reveal which credential is incorrect', async () => {
      const wrongEmailResponse = await request(app.getHttpServer())
        .post('/auth/login')
        .send({
          email: 'wrong@example.com',
          password: loginPassword,
        })
        .expect(401);

      const wrongPasswordResponse = await request(app.getHttpServer())
        .post('/auth/login')
        .send({
          email: loginEmail,
          password: 'WrongPassword123',
        })
        .expect(401);

      // Both should return same generic error message
      expect(wrongEmailResponse.body.message).toBe(
        wrongPasswordResponse.body.message,
      );
    });

    it('should validate email format during login', async () => {
      await request(app.getHttpServer())
        .post('/auth/login')
        .send({
          email: 'invalid-email-format',
          password: loginPassword,
        })
        .expect(400);
    });

    it('should require both email and password', async () => {
      await request(app.getHttpServer())
        .post('/auth/login')
        .send({ email: loginEmail })
        .expect(400);

      await request(app.getHttpServer())
        .post('/auth/login')
        .send({ password: loginPassword })
        .expect(400);
    });
  });

  describe('Token Refresh During Session', () => {
    let testUser: any;
    let accessToken: string;
    let refreshToken: string;
    const refreshEmail = `refresh-${Date.now()}@example.com`;

    beforeAll(async () => {
      const response = await request(app.getHttpServer())
        .post('/auth/register')
        .send({
          email: refreshEmail,
          password: 'RefreshTest123',
          name: 'Refresh Test User',
        });

      testUser = response.body.user;
      accessToken = response.body.accessToken;
      refreshToken = response.body.refreshToken;
    });

    afterAll(async () => {
      await prisma.user.delete({ where: { id: testUser.id } }).catch(() => {});
      await prisma.tokenBlacklist
        .deleteMany({ where: { userId: testUser.id } })
        .catch(() => {});
    });

    it('should refresh access token with valid refresh token', async () => {
      // Step 1: Use refresh token to get new access token
      const refreshResponse = await request(app.getHttpServer())
        .post('/auth/refresh')
        .send({ refreshToken })
        .expect(200);

      expect(refreshResponse.body).toHaveProperty('accessToken');
      expect(refreshResponse.body).toHaveProperty('expiresIn');
      expect(refreshResponse.body.accessToken).not.toBe(accessToken);

      // Step 2: Verify new access token works
      const newAccessToken = refreshResponse.body.accessToken;
      const profileResponse = await request(app.getHttpServer())
        .get('/auth/profile')
        .set('Authorization', `Bearer ${newAccessToken}`)
        .expect(200);

      expect(profileResponse.body.email).toBe(refreshEmail);

      // Step 3: Verify old access token still works (until it expires)
      const oldTokenResponse = await request(app.getHttpServer())
        .get('/auth/profile')
        .set('Authorization', `Bearer ${accessToken}`)
        .expect(200);

      expect(oldTokenResponse.body.email).toBe(refreshEmail);
    });

    it('should reject invalid refresh token', async () => {
      await request(app.getHttpServer())
        .post('/auth/refresh')
        .send({ refreshToken: 'invalid.refresh.token' })
        .expect(401);
    });

    it('should reject malformed refresh token', async () => {
      await request(app.getHttpServer())
        .post('/auth/refresh')
        .send({ refreshToken: 'malformed-token' })
        .expect(401);
    });

    it('should reject missing refresh token', async () => {
      await request(app.getHttpServer())
        .post('/auth/refresh')
        .send({})
        .expect(400);
    });

    it('should reject blacklisted refresh token', async () => {
      // Create a new user and tokens for this test
      const blacklistEmail = `blacklist-${Date.now()}@example.com`;
      const registerResponse = await request(app.getHttpServer())
        .post('/auth/register')
        .send({
          email: blacklistEmail,
          password: 'Blacklist123',
          name: 'Blacklist Test',
        });

      const testRefreshToken = registerResponse.body.refreshToken;
      const testAccessToken = registerResponse.body.accessToken;

      // Logout to blacklist the token
      await request(app.getHttpServer())
        .post('/auth/logout')
        .set('Authorization', `Bearer ${testAccessToken}`)
        .send({ refreshToken: testRefreshToken })
        .expect(200);

      // Try to use blacklisted refresh token
      await request(app.getHttpServer())
        .post('/auth/refresh')
        .send({ refreshToken: testRefreshToken })
        .expect(401);

      // Cleanup
      await prisma.user
        .deleteMany({ where: { email: blacklistEmail } })
        .catch(() => {});
    });
  });

  describe('Logout Flow', () => {
    let testUser: any;
    let accessToken: string;
    let refreshToken: string;
    const logoutEmail = `logout-${Date.now()}@example.com`;

    beforeEach(async () => {
      const response = await request(app.getHttpServer())
        .post('/auth/register')
        .send({
          email: `${logoutEmail}-${Date.now()}`,
          password: 'LogoutTest123',
          name: 'Logout Test User',
        });

      testUser = response.body.user;
      accessToken = response.body.accessToken;
      refreshToken = response.body.refreshToken;
    });

    afterEach(async () => {
      await prisma.user.delete({ where: { id: testUser.id } }).catch(() => {});
      await prisma.tokenBlacklist
        .deleteMany({ where: { userId: testUser.id } })
        .catch(() => {});
    });

    it('should complete full logout flow', async () => {
      // Step 1: Verify user is authenticated
      await request(app.getHttpServer())
        .get('/auth/profile')
        .set('Authorization', `Bearer ${accessToken}`)
        .expect(200);

      // Step 2: Logout
      const logoutResponse = await request(app.getHttpServer())
        .post('/auth/logout')
        .set('Authorization', `Bearer ${accessToken}`)
        .send({ refreshToken })
        .expect(200);

      expect(logoutResponse.body.message).toBeDefined();

      // Step 3: Verify refresh token is blacklisted
      const blacklistedToken = await prisma.tokenBlacklist.findUnique({
        where: { token: refreshToken },
      });

      expect(blacklistedToken).not.toBeNull();
      expect(blacklistedToken!.userId).toBe(testUser.id);

      // Step 4: Verify refresh token no longer works
      await request(app.getHttpServer())
        .post('/auth/refresh')
        .send({ refreshToken })
        .expect(401);

      // Step 5: Verify access token still works (until expiration)
      // This is expected behavior - access tokens are stateless
      await request(app.getHttpServer())
        .get('/auth/profile')
        .set('Authorization', `Bearer ${accessToken}`)
        .expect(200);
    });

    it('should require authentication for logout', async () => {
      await request(app.getHttpServer())
        .post('/auth/logout')
        .send({ refreshToken })
        .expect(401);
    });

    it('should require refresh token in logout request', async () => {
      await request(app.getHttpServer())
        .post('/auth/logout')
        .set('Authorization', `Bearer ${accessToken}`)
        .send({})
        .expect(400);
    });
  });

  describe('Protected Route Access', () => {
    let adminUser: any;
    let adminToken: string;
    let regularUser: any;
    let regularToken: string;

    beforeAll(async () => {
      // Create regular user
      const regularResponse = await request(app.getHttpServer())
        .post('/auth/register')
        .send({
          email: `regular-protected-${Date.now()}@example.com`,
          password: 'Regular123',
          name: 'Regular User',
        });

      regularUser = regularResponse.body.user;
      regularToken = regularResponse.body.accessToken;

      // Create admin user
      const adminResponse = await request(app.getHttpServer())
        .post('/auth/register')
        .send({
          email: `admin-protected-${Date.now()}@example.com`,
          password: 'Admin123',
          name: 'Admin User',
        });

      adminUser = adminResponse.body.user;
      adminToken = adminResponse.body.accessToken;

      // Update to Admin role
      const adminRole = await prisma.userRole.findFirst({
        where: { name: 'Admin' },
      });
      await prisma.user.update({
        where: { id: adminUser.id },
        data: { roleId: adminRole!.id },
      });
    });

    afterAll(async () => {
      await prisma.user
        .delete({ where: { id: regularUser.id } })
        .catch(() => {});
      await prisma.user.delete({ where: { id: adminUser.id } }).catch(() => {});
    });

    it('should allow authenticated users to access protected routes', async () => {
      await request(app.getHttpServer())
        .get('/auth/profile')
        .set('Authorization', `Bearer ${regularToken}`)
        .expect(200);

      await request(app.getHttpServer())
        .get('/users')
        .set('Authorization', `Bearer ${regularToken}`)
        .expect(200);
    });

    it('should deny unauthenticated access to protected routes', async () => {
      await request(app.getHttpServer()).get('/auth/profile').expect(401);

      await request(app.getHttpServer()).get('/users').expect(401);

      await request(app.getHttpServer()).get('/settings').expect(401);
    });

    it('should reject invalid tokens', async () => {
      await request(app.getHttpServer())
        .get('/auth/profile')
        .set('Authorization', 'Bearer invalid.token.here')
        .expect(401);
    });

    it('should reject expired tokens', async () => {
      // Use a clearly invalid/expired token format
      const expiredToken =
        'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiIxMjM0NTY3ODkwIiwibmFtZSI6IkpvaG4gRG9lIiwiaWF0IjoxNTE2MjM5MDIyLCJleHAiOjF9.invalid';

      await request(app.getHttpServer())
        .get('/auth/profile')
        .set('Authorization', `Bearer ${expiredToken}`)
        .expect(401);
    });
  });
});
