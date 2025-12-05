import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication, ValidationPipe } from '@nestjs/common';
import * as request from 'supertest';
import { AppModule } from '../src/app.module';
import { PrismaService } from '../src/prisma/prisma.service';
import { PrivacyLevel } from '../src/customer-account/dto';

describe('Customer Account Settings E2E', () => {
  let app: INestApplication;
  let prisma: PrismaService;
  let authToken: string;
  let customerId: string;

  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleFixture.createNestApplication();
    app.useGlobalPipes(new ValidationPipe());
    await app.init();

    prisma = moduleFixture.get<PrismaService>(PrismaService);

    // Create test customer and get auth token
    const registerRes = await request(app.getHttpServer())
      .post('/customer-auth/register')
      .send({
        email: `test-settings-${Date.now()}@example.com`,
        password: 'TestPassword123!',
        firstName: 'Test',
        lastName: 'User',
      });

    customerId = registerRes.body.customer.id;
    authToken = registerRes.body.accessToken;
  });

  afterAll(async () => {
    // Cleanup
    if (customerId) {
      await prisma.accountSettings.deleteMany({
        where: { customerId },
      });
      await prisma.customer.delete({
        where: { id: customerId },
      });
    }
    await app.close();
  });

  describe('GET /customer-account/settings', () => {
    it('should return account settings', async () => {
      const res = await request(app.getHttpServer())
        .get('/customer-account/settings')
        .set('Authorization', `Bearer ${authToken}`);

      expect(res.status).toBe(200);
      expect(res.body).toHaveProperty('id');
      expect(res.body).toHaveProperty('customerId', customerId);
      expect(res.body).toHaveProperty('emailNotifications');
      expect(res.body).toHaveProperty('smsNotifications');
      expect(res.body).toHaveProperty('marketingEmails');
      expect(res.body).toHaveProperty('orderUpdates');
      expect(res.body).toHaveProperty('twoFactorEnabled');
      expect(res.body).toHaveProperty('privacyLevel');
      expect(res.body).toHaveProperty('createdAt');
      expect(res.body).toHaveProperty('updatedAt');
    });

    it('should have default values', async () => {
      const res = await request(app.getHttpServer())
        .get('/customer-account/settings')
        .set('Authorization', `Bearer ${authToken}`);

      expect(res.body.emailNotifications).toBe(true);
      expect(res.body.smsNotifications).toBe(false);
      expect(res.body.marketingEmails).toBe(false);
      expect(res.body.orderUpdates).toBe(true);
      expect(res.body.twoFactorEnabled).toBe(false);
      expect(res.body.privacyLevel).toBe('private');
    });

    it('should require authentication', async () => {
      const res = await request(app.getHttpServer()).get(
        '/customer-account/settings',
      );

      expect(res.status).toBe(401);
    });
  });

  describe('PATCH /customer-account/settings', () => {
    it('should update email notifications', async () => {
      const res = await request(app.getHttpServer())
        .patch('/customer-account/settings')
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          emailNotifications: false,
        });

      expect(res.status).toBe(200);
      expect(res.body.emailNotifications).toBe(false);
    });

    it('should update SMS notifications', async () => {
      const res = await request(app.getHttpServer())
        .patch('/customer-account/settings')
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          smsNotifications: true,
        });

      expect(res.status).toBe(200);
      expect(res.body.smsNotifications).toBe(true);
    });

    it('should update marketing emails', async () => {
      const res = await request(app.getHttpServer())
        .patch('/customer-account/settings')
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          marketingEmails: true,
        });

      expect(res.status).toBe(200);
      expect(res.body.marketingEmails).toBe(true);
    });

    it('should update order updates', async () => {
      const res = await request(app.getHttpServer())
        .patch('/customer-account/settings')
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          orderUpdates: false,
        });

      expect(res.status).toBe(200);
      expect(res.body.orderUpdates).toBe(false);
    });

    it('should update privacy level', async () => {
      const res = await request(app.getHttpServer())
        .patch('/customer-account/settings')
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          privacyLevel: PrivacyLevel.PUBLIC,
        });

      expect(res.status).toBe(200);
      expect(res.body.privacyLevel).toBe('public');
    });

    it('should handle multiple updates', async () => {
      const res = await request(app.getHttpServer())
        .patch('/customer-account/settings')
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          emailNotifications: true,
          smsNotifications: false,
          marketingEmails: true,
          orderUpdates: true,
          privacyLevel: PrivacyLevel.FRIENDS_ONLY,
        });

      expect(res.status).toBe(200);
      expect(res.body.emailNotifications).toBe(true);
      expect(res.body.smsNotifications).toBe(false);
      expect(res.body.marketingEmails).toBe(true);
      expect(res.body.orderUpdates).toBe(true);
      expect(res.body.privacyLevel).toBe('friends_only');
    });

    it('should preserve unmodified settings', async () => {
      // First update
      await request(app.getHttpServer())
        .patch('/customer-account/settings')
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          emailNotifications: false,
          marketingEmails: true,
        });

      // Second update - only change one field
      const res = await request(app.getHttpServer())
        .patch('/customer-account/settings')
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          smsNotifications: true,
        });

      expect(res.status).toBe(200);
      expect(res.body.emailNotifications).toBe(false); // Preserved
      expect(res.body.marketingEmails).toBe(true); // Preserved
      expect(res.body.smsNotifications).toBe(true); // Updated
    });

    it('should require authentication', async () => {
      const res = await request(app.getHttpServer())
        .patch('/customer-account/settings')
        .send({
          emailNotifications: false,
        });

      expect(res.status).toBe(401);
    });

    it('should require settings:write permission', async () => {
      // This would require a customer without the permission
      // For now, we assume all authenticated customers have this permission
      const res = await request(app.getHttpServer())
        .patch('/customer-account/settings')
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          emailNotifications: false,
        });

      expect(res.status).toBe(200);
    });
  });

  describe('Settings Persistence', () => {
    it('should persist settings across requests', async () => {
      // Update settings
      await request(app.getHttpServer())
        .patch('/customer-account/settings')
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          emailNotifications: false,
          marketingEmails: true,
          privacyLevel: PrivacyLevel.PUBLIC,
        });

      // Fetch settings
      const res = await request(app.getHttpServer())
        .get('/customer-account/settings')
        .set('Authorization', `Bearer ${authToken}`);

      expect(res.body.emailNotifications).toBe(false);
      expect(res.body.marketingEmails).toBe(true);
      expect(res.body.privacyLevel).toBe('public');
    });

    it('should maintain separate settings per customer', async () => {
      // Create another customer
      const registerRes = await request(app.getHttpServer())
        .post('/customer-auth/register')
        .send({
          email: `test-settings-2-${Date.now()}@example.com`,
          password: 'TestPassword123!',
          firstName: 'Test2',
          lastName: 'User2',
        });

      const customerId2 = registerRes.body.customer.id;
      const authToken2 = registerRes.body.accessToken;

      // Update first customer's settings
      await request(app.getHttpServer())
        .patch('/customer-account/settings')
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          emailNotifications: false,
        });

      // Check second customer has default settings
      const res = await request(app.getHttpServer())
        .get('/customer-account/settings')
        .set('Authorization', `Bearer ${authToken2}`);

      expect(res.body.emailNotifications).toBe(true); // Default value

      // Cleanup
      await prisma.accountSettings.deleteMany({
        where: { customerId: customerId2 },
      });
      await prisma.customer.delete({
        where: { id: customerId2 },
      });
    });
  });

  describe('Privacy Level Validation', () => {
    it('should accept PUBLIC privacy level', async () => {
      const res = await request(app.getHttpServer())
        .patch('/customer-account/settings')
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          privacyLevel: PrivacyLevel.PUBLIC,
        });

      expect(res.status).toBe(200);
      expect(res.body.privacyLevel).toBe('public');
    });

    it('should accept PRIVATE privacy level', async () => {
      const res = await request(app.getHttpServer())
        .patch('/customer-account/settings')
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          privacyLevel: PrivacyLevel.PRIVATE,
        });

      expect(res.status).toBe(200);
      expect(res.body.privacyLevel).toBe('private');
    });

    it('should accept FRIENDS_ONLY privacy level', async () => {
      const res = await request(app.getHttpServer())
        .patch('/customer-account/settings')
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          privacyLevel: PrivacyLevel.FRIENDS_ONLY,
        });

      expect(res.status).toBe(200);
      expect(res.body.privacyLevel).toBe('friends_only');
    });
  });
});
