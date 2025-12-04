import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication, ValidationPipe } from '@nestjs/common';
import request from 'supertest';
import { AppModule } from '../src/app.module';
import { PrismaClient } from '@prisma/client';

describe('ActivityLog (e2e)', () => {
  let app: INestApplication;
  let prisma: PrismaClient;
  let authToken: string;
  let userId: string;
  let createdLogId: string;

  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleFixture.createNestApplication();
    app.useGlobalPipes(new ValidationPipe({ transform: true }));
    await app.init();

    prisma = new PrismaClient();

    // Login to get auth token
    const loginResponse = await request(app.getHttpServer())
      .post('/auth/login')
      .send({
        email: 'fouad.abt@gmail.com',
        password: 'Password123!',
      });

    authToken = loginResponse.body.accessToken;
    userId = loginResponse.body.user.id;
  });

  afterAll(async () => {
    // Clean up test data
    if (createdLogId) {
      await prisma.activityLog.deleteMany({
        where: {
          action: {
            in: ['TEST_ACTION', 'TEST_CREATE', 'TEST_UPDATE', 'TEST_DELETE'],
          },
        },
      });
    }
    await prisma.$disconnect();
    await app.close();
  });

  describe('/activity-logs (POST)', () => {
    it('should create an activity log with all fields', async () => {
      const response = await request(app.getHttpServer())
        .post('/activity-logs')
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          action: 'TEST_ACTION',
          userId,
          actorName: 'Test User',
          entityType: 'Test',
          entityId: 'test123',
          metadata: { key: 'value', count: 42 },
        })
        .expect(201);

      expect(response.body).toHaveProperty('id');
      expect(response.body.action).toBe('TEST_ACTION');
      expect(response.body.userId).toBe(userId);
      expect(response.body.actorName).toBe('Test User');
      expect(response.body.entityType).toBe('Test');
      expect(response.body.entityId).toBe('test123');
      expect(response.body.metadata).toEqual({ key: 'value', count: 42 });
      expect(response.body).toHaveProperty('ipAddress');
      expect(response.body).toHaveProperty('userAgent');
      expect(response.body).toHaveProperty('createdAt');

      createdLogId = response.body.id;
    });

    it('should create an activity log with only required fields', async () => {
      const response = await request(app.getHttpServer())
        .post('/activity-logs')
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          action: 'TEST_CREATE',
        })
        .expect(201);

      expect(response.body).toHaveProperty('id');
      expect(response.body.action).toBe('TEST_CREATE');
    });

    it('should create a system activity log without userId', async () => {
      const response = await request(app.getHttpServer())
        .post('/activity-logs')
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          action: 'SYSTEM_EVENT',
          actorName: 'System',
        })
        .expect(201);

      expect(response.body.userId).toBeNull();
      expect(response.body.actorName).toBe('System');
    });

    it('should extract IP address and user agent from request', async () => {
      const response = await request(app.getHttpServer())
        .post('/activity-logs')
        .set('Authorization', `Bearer ${authToken}`)
        .set('User-Agent', 'Test-Agent/1.0')
        .send({
          action: 'TEST_UPDATE',
          userId,
        })
        .expect(201);

      expect(response.body.userAgent).toBe('Test-Agent/1.0');
      expect(response.body.ipAddress).toBeDefined();
    });

    it('should require authentication', () => {
      return request(app.getHttpServer())
        .post('/activity-logs')
        .send({
          action: 'TEST_ACTION',
        })
        .expect(401);
    });

    it('should validate required action field', () => {
      return request(app.getHttpServer())
        .post('/activity-logs')
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          userId,
        })
        .expect(400);
    });

    it('should validate action max length', () => {
      return request(app.getHttpServer())
        .post('/activity-logs')
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          action: 'A'.repeat(201),
        })
        .expect(400);
    });

    it('should validate metadata is an object', () => {
      return request(app.getHttpServer())
        .post('/activity-logs')
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          action: 'TEST_ACTION',
          metadata: 'not an object',
        })
        .expect(400);
    });
  });

  describe('/activity-logs (GET)', () => {
    beforeAll(async () => {
      // Create test data for filtering
      await request(app.getHttpServer())
        .post('/activity-logs')
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          action: 'TEST_DELETE',
          userId,
          entityType: 'Product',
          entityId: 'prod123',
        });
    });

    it('should return paginated activity logs', async () => {
      const response = await request(app.getHttpServer())
        .get('/activity-logs')
        .set('Authorization', `Bearer ${authToken}`)
        .expect(200);

      expect(response.body).toHaveProperty('data');
      expect(response.body).toHaveProperty('total');
      expect(response.body).toHaveProperty('page');
      expect(response.body).toHaveProperty('limit');
      expect(response.body).toHaveProperty('totalPages');
      expect(Array.isArray(response.body.data)).toBe(true);
      expect(response.body.page).toBe(1);
      expect(response.body.limit).toBe(50);
    });

    it('should filter by userId', async () => {
      const response = await request(app.getHttpServer())
        .get(`/activity-logs?userId=${userId}`)
        .set('Authorization', `Bearer ${authToken}`)
        .expect(200);

      expect(response.body.data.length).toBeGreaterThan(0);
      response.body.data.forEach((log: any) => {
        if (log.userId !== null) {
          expect(log.userId).toBe(userId);
        }
      });
    });

    it('should filter by action', async () => {
      const response = await request(app.getHttpServer())
        .get('/activity-logs?action=TEST_DELETE')
        .set('Authorization', `Bearer ${authToken}`)
        .expect(200);

      response.body.data.forEach((log: any) => {
        expect(log.action).toBe('TEST_DELETE');
      });
    });

    it('should filter by entityType', async () => {
      const response = await request(app.getHttpServer())
        .get('/activity-logs?entityType=Product')
        .set('Authorization', `Bearer ${authToken}`)
        .expect(200);

      response.body.data.forEach((log: any) => {
        expect(log.entityType).toBe('Product');
      });
    });

    it('should filter by entityId', async () => {
      const response = await request(app.getHttpServer())
        .get('/activity-logs?entityId=prod123')
        .set('Authorization', `Bearer ${authToken}`)
        .expect(200);

      response.body.data.forEach((log: any) => {
        expect(log.entityId).toBe('prod123');
      });
    });

    it('should support pagination', async () => {
      const response = await request(app.getHttpServer())
        .get('/activity-logs?page=1&limit=5')
        .set('Authorization', `Bearer ${authToken}`)
        .expect(200);

      expect(response.body.page).toBe(1);
      expect(response.body.limit).toBe(5);
      expect(response.body.data.length).toBeLessThanOrEqual(5);
    });

    it('should support ascending sort order', async () => {
      const response = await request(app.getHttpServer())
        .get('/activity-logs?sortOrder=asc&limit=10')
        .set('Authorization', `Bearer ${authToken}`)
        .expect(200);

      if (response.body.data.length > 1) {
        const firstDate = new Date(response.body.data[0].createdAt);
        const lastDate = new Date(
          response.body.data[response.body.data.length - 1].createdAt,
        );
        expect(firstDate.getTime()).toBeLessThanOrEqual(lastDate.getTime());
      }
    });

    it('should support descending sort order (default)', async () => {
      const response = await request(app.getHttpServer())
        .get('/activity-logs?limit=10')
        .set('Authorization', `Bearer ${authToken}`)
        .expect(200);

      if (response.body.data.length > 1) {
        const firstDate = new Date(response.body.data[0].createdAt);
        const lastDate = new Date(
          response.body.data[response.body.data.length - 1].createdAt,
        );
        expect(firstDate.getTime()).toBeGreaterThanOrEqual(lastDate.getTime());
      }
    });

    it('should filter by date range', async () => {
      const today = new Date();
      const yesterday = new Date(today);
      yesterday.setDate(yesterday.getDate() - 1);

      const response = await request(app.getHttpServer())
        .get(
          `/activity-logs?startDate=${yesterday.toISOString()}&endDate=${today.toISOString()}`,
        )
        .set('Authorization', `Bearer ${authToken}`)
        .expect(200);

      response.body.data.forEach((log: any) => {
        const logDate = new Date(log.createdAt);
        expect(logDate.getTime()).toBeGreaterThanOrEqual(yesterday.getTime());
        expect(logDate.getTime()).toBeLessThanOrEqual(today.getTime());
      });
    });

    it('should combine multiple filters', async () => {
      const response = await request(app.getHttpServer())
        .get(
          `/activity-logs?userId=${userId}&action=TEST_DELETE&entityType=Product`,
        )
        .set('Authorization', `Bearer ${authToken}`)
        .expect(200);

      response.body.data.forEach((log: any) => {
        expect(log.userId).toBe(userId);
        expect(log.action).toBe('TEST_DELETE');
        expect(log.entityType).toBe('Product');
      });
    });

    it('should require authentication', () => {
      return request(app.getHttpServer()).get('/activity-logs').expect(401);
    });

    it('should validate page is positive', () => {
      return request(app.getHttpServer())
        .get('/activity-logs?page=0')
        .set('Authorization', `Bearer ${authToken}`)
        .expect(400);
    });

    it('should validate limit does not exceed max', () => {
      return request(app.getHttpServer())
        .get('/activity-logs?limit=101')
        .set('Authorization', `Bearer ${authToken}`)
        .expect(400);
    });

    it('should validate sortOrder is valid', () => {
      return request(app.getHttpServer())
        .get('/activity-logs?sortOrder=invalid')
        .set('Authorization', `Bearer ${authToken}`)
        .expect(400);
    });
  });

  describe('/activity-logs/:id (GET)', () => {
    it('should return a single activity log by id', async () => {
      const response = await request(app.getHttpServer())
        .get(`/activity-logs/${createdLogId}`)
        .set('Authorization', `Bearer ${authToken}`)
        .expect(200);

      expect(response.body.id).toBe(createdLogId);
      expect(response.body).toHaveProperty('action');
      expect(response.body).toHaveProperty('createdAt');
    });

    it('should return 404 for non-existent log', () => {
      return request(app.getHttpServer())
        .get('/activity-logs/non-existent-id')
        .set('Authorization', `Bearer ${authToken}`)
        .expect(404);
    });

    it('should require authentication', () => {
      return request(app.getHttpServer())
        .get(`/activity-logs/${createdLogId}`)
        .expect(401);
    });
  });

  describe('Complete Activity Logging Workflow', () => {
    it('should log product creation and retrieve it', async () => {
      // Step 1: Create activity log for product creation
      const createResponse = await request(app.getHttpServer())
        .post('/activity-logs')
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          action: 'PRODUCT_CREATED',
          userId,
          entityType: 'Product',
          entityId: 'workflow-prod-123',
          metadata: {
            productName: 'Test Product',
            sku: 'TEST-SKU-001',
            price: 99.99,
          },
        })
        .expect(201);

      const logId = createResponse.body.id;

      // Step 2: Retrieve the created log
      const getResponse = await request(app.getHttpServer())
        .get(`/activity-logs/${logId}`)
        .set('Authorization', `Bearer ${authToken}`)
        .expect(200);

      expect(getResponse.body.action).toBe('PRODUCT_CREATED');
      expect(getResponse.body.entityType).toBe('Product');
      expect(getResponse.body.entityId).toBe('workflow-prod-123');
      expect(getResponse.body.metadata.productName).toBe('Test Product');

      // Step 3: Query logs for this product
      const queryResponse = await request(app.getHttpServer())
        .get('/activity-logs?entityType=Product&entityId=workflow-prod-123')
        .set('Authorization', `Bearer ${authToken}`)
        .expect(200);

      expect(queryResponse.body.data.length).toBeGreaterThan(0);
      expect(queryResponse.body.data[0].entityId).toBe('workflow-prod-123');
    });

    it('should log product update with changes', async () => {
      const response = await request(app.getHttpServer())
        .post('/activity-logs')
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          action: 'PRODUCT_UPDATED',
          userId,
          entityType: 'Product',
          entityId: 'workflow-prod-123',
          metadata: {
            changes: {
              price: { old: 99.99, new: 89.99 },
              name: { old: 'Test Product', new: 'Updated Product' },
            },
            fieldsChanged: ['price', 'name'],
          },
        })
        .expect(201);

      expect(response.body.metadata.changes.price.old).toBe(99.99);
      expect(response.body.metadata.changes.price.new).toBe(89.99);
    });

    it('should retrieve all activities for a user', async () => {
      const response = await request(app.getHttpServer())
        .get(`/activity-logs?userId=${userId}`)
        .set('Authorization', `Bearer ${authToken}`)
        .expect(200);

      expect(response.body.data.length).toBeGreaterThan(0);
      expect(response.body.total).toBeGreaterThan(0);
    });
  });
});
