import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication, ValidationPipe } from '@nestjs/common';
import request from 'supertest';
import { AppModule } from '../src/app.module';
import { PrismaService } from '../src/prisma/prisma.service';

describe('Landing Analytics (e2e)', () => {
  let app: INestApplication;
  let prisma: PrismaService;
  let adminToken: string;
  let adminUser: any;
  let testPageId: string;

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

    // Create admin user
    adminUser = await prisma.user.create({
      data: {
        email: 'analytics-admin@test.com',
        name: 'Analytics Admin',
        password: 'hashedpassword',
        role: 'ADMIN',
      },
    });

    // Login to get token
    const loginResponse = await request(app.getHttpServer())
      .post('/auth/login')
      .send({
        email: 'analytics-admin@test.com',
        password: 'hashedpassword',
      });

    adminToken = loginResponse.body.accessToken;

    // Create test landing page
    const landingContent = await prisma.landingPageContent.create({
      data: {
        sections: [],
        settings: {},
        isActive: true,
      },
    });

    testPageId = landingContent.id;
  });

  afterAll(async () => {
    // Cleanup
    await prisma.landingAnalytics.deleteMany({});
    await prisma.landingPageContent.deleteMany({});
    await prisma.user.deleteMany({
      where: { email: 'analytics-admin@test.com' },
    });
    await app.close();
  });

  describe('POST /landing/analytics/track', () => {
    it('should track a page view event (public endpoint)', async () => {
      const response = await request(app.getHttpServer())
        .post('/landing/analytics/track')
        .send({
          pageId: testPageId,
          eventType: 'view',
          sessionId: 'session-1',
          deviceType: 'desktop',
          browser: 'Chrome',
          referrer: 'https://google.com',
        })
        .expect(201);

      expect(response.body).toEqual({ success: true });

      // Verify event was stored
      const events = await prisma.landingAnalytics.findMany({
        where: { pageId: testPageId, eventType: 'view' },
      });

      expect(events.length).toBeGreaterThan(0);
      expect(events[0].sessionId).toBe('session-1');
    });

    it('should track a CTA click event', async () => {
      const response = await request(app.getHttpServer())
        .post('/landing/analytics/track')
        .send({
          pageId: testPageId,
          eventType: 'cta_click',
          sessionId: 'session-2',
          deviceType: 'mobile',
          browser: 'Safari',
          eventData: {
            ctaId: 'cta-1',
            ctaText: 'Get Started',
            ctaPosition: 'hero',
          },
        })
        .expect(201);

      expect(response.body).toEqual({ success: true });
    });

    it('should track a section view event', async () => {
      const response = await request(app.getHttpServer())
        .post('/landing/analytics/track')
        .send({
          pageId: testPageId,
          eventType: 'section_view',
          sessionId: 'session-3',
          deviceType: 'tablet',
          browser: 'Firefox',
          eventData: {
            sectionId: 'section-1',
            timeSpent: 45,
            scrollDepth: 80,
          },
        })
        .expect(201);

      expect(response.body).toEqual({ success: true });
    });

    it('should reject invalid event type', async () => {
      await request(app.getHttpServer())
        .post('/landing/analytics/track')
        .send({
          pageId: testPageId,
          eventType: 'invalid_type',
          sessionId: 'session-4',
          deviceType: 'desktop',
          browser: 'Chrome',
        })
        .expect(400);
    });
  });

  describe('GET /landing/analytics/:pageId', () => {
    beforeAll(async () => {
      // Create some test analytics data
      await prisma.landingAnalytics.createMany({
        data: [
          {
            pageId: testPageId,
            eventType: 'view',
            sessionId: 'session-test-1',
            deviceType: 'desktop',
            browser: 'Chrome',
            eventData: {},
          },
          {
            pageId: testPageId,
            eventType: 'view',
            sessionId: 'session-test-2',
            deviceType: 'mobile',
            browser: 'Safari',
            eventData: {},
          },
          {
            pageId: testPageId,
            eventType: 'section_view',
            sessionId: 'session-test-1',
            deviceType: 'desktop',
            browser: 'Chrome',
            eventData: { sectionId: 'section-1', timeSpent: 30 },
          },
        ],
      });
    });

    it('should return page analytics', async () => {
      const response = await request(app.getHttpServer())
        .get(`/landing/analytics/${testPageId}`)
        .set('Authorization', `Bearer ${adminToken}`)
        .expect(200);

      expect(response.body).toHaveProperty('pageId', testPageId);
      expect(response.body).toHaveProperty('totalViews');
      expect(response.body).toHaveProperty('uniqueVisitors');
      expect(response.body).toHaveProperty('avgTimeOnPage');
      expect(response.body).toHaveProperty('bounceRate');
      expect(response.body.totalViews).toBeGreaterThan(0);
    });

    it('should filter by date range', async () => {
      const startDate = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString();
      const endDate = new Date().toISOString();

      const response = await request(app.getHttpServer())
        .get(`/landing/analytics/${testPageId}`)
        .query({ startDate, endDate })
        .set('Authorization', `Bearer ${adminToken}`)
        .expect(200);

      expect(response.body.dateRange).toBeDefined();
    });

    it('should require authentication', async () => {
      await request(app.getHttpServer())
        .get(`/landing/analytics/${testPageId}`)
        .expect(401);
    });
  });

  describe('GET /landing/analytics/:pageId/sections', () => {
    it('should return section engagement metrics', async () => {
      const response = await request(app.getHttpServer())
        .get(`/landing/analytics/${testPageId}/sections`)
        .set('Authorization', `Bearer ${adminToken}`)
        .expect(200);

      expect(Array.isArray(response.body)).toBe(true);
      if (response.body.length > 0) {
        expect(response.body[0]).toHaveProperty('sectionId');
        expect(response.body[0]).toHaveProperty('views');
        expect(response.body[0]).toHaveProperty('avgTimeSpent');
        expect(response.body[0]).toHaveProperty('avgScrollDepth');
      }
    });
  });

  describe('GET /landing/analytics/:pageId/cta', () => {
    it('should return CTA performance metrics', async () => {
      const response = await request(app.getHttpServer())
        .get(`/landing/analytics/${testPageId}/cta`)
        .set('Authorization', `Bearer ${adminToken}`)
        .expect(200);

      expect(Array.isArray(response.body)).toBe(true);
    });
  });

  describe('GET /landing/analytics/:pageId/traffic-sources', () => {
    it('should return traffic source breakdown', async () => {
      const response = await request(app.getHttpServer())
        .get(`/landing/analytics/${testPageId}/traffic-sources`)
        .set('Authorization', `Bearer ${adminToken}`)
        .expect(200);

      expect(Array.isArray(response.body)).toBe(true);
      if (response.body.length > 0) {
        expect(response.body[0]).toHaveProperty('source');
        expect(response.body[0]).toHaveProperty('visits');
        expect(response.body[0]).toHaveProperty('percentage');
      }
    });
  });

  describe('GET /landing/analytics/:pageId/devices', () => {
    it('should return device analytics', async () => {
      const response = await request(app.getHttpServer())
        .get(`/landing/analytics/${testPageId}/devices`)
        .set('Authorization', `Bearer ${adminToken}`)
        .expect(200);

      expect(response.body).toHaveProperty('deviceBreakdown');
      expect(response.body).toHaveProperty('browserBreakdown');
      expect(Array.isArray(response.body.deviceBreakdown)).toBe(true);
      expect(Array.isArray(response.body.browserBreakdown)).toBe(true);
    });
  });

  describe('GET /landing/analytics/:pageId/export', () => {
    it('should export analytics as CSV', async () => {
      const response = await request(app.getHttpServer())
        .get(`/landing/analytics/${testPageId}/export`)
        .set('Authorization', `Bearer ${adminToken}`)
        .expect(200);

      expect(response.headers['content-type']).toContain('text/csv');
      expect(response.headers['content-disposition']).toContain('attachment');
      expect(response.text).toContain('Timestamp');
      expect(response.text).toContain('Event Type');
    });
  });
});
