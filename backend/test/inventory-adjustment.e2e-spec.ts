import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication, ValidationPipe } from '@nestjs/common';
import request from 'supertest';
import { AppModule } from '../src/app.module';
import { PrismaService } from '../src/prisma/prisma.service';

describe('Inventory Adjustment (e2e)', () => {
  let app: INestApplication;
  let prisma: PrismaService;
  let adminToken: string;
  let adminUser: any;
  let testProductId: string;
  let testVariantId: string;
  let testInventoryId: string;

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

    await setupTestData();
  });

  afterAll(async () => {
    await cleanupTestData();
    await app.close();
  });

  async function setupTestData() {
    // Get Admin role
    const adminRole = await prisma.userRole.findFirst({
      where: { name: 'Admin' },
    });

    // Register Admin user
    const adminResponse = await request(app.getHttpServer())
      .post('/auth/register')
      .send({
        email: `admin-inv-${Date.now()}@example.com`,
        password: 'Password123',
        name: 'Admin Inventory Test',
      });

    adminToken = adminResponse.body.accessToken;
    adminUser = adminResponse.body.user;

    // Update to Admin role
    await prisma.user.update({
      where: { id: adminUser.id },
      data: { roleId: adminRole!.id },
    });

    // Create test product
    const product = await prisma.product.create({
      data: {
        name: 'Test Product for Adjustment',
        slug: `test-product-adj-${Date.now()}`,
        basePrice: 99.99,
        status: 'PUBLISHED',
      },
    });
    testProductId = product.id;

    // Create test variant
    const variant = await prisma.productVariant.create({
      data: {
        productId: testProductId,
        name: 'Test Variant',
        sku: `TEST-ADJ-${Date.now()}`,
        attributes: { size: 'M', color: 'Blue' },
      },
    });
    testVariantId = variant.id;

    // Create inventory
    const inventory = await prisma.inventory.create({
      data: {
        productVariantId: testVariantId,
        quantity: 100,
        reserved: 10,
        available: 90,
      },
    });
    testInventoryId = inventory.id;
  }

  async function cleanupTestData() {
    if (testInventoryId) {
      await prisma.inventory.delete({ where: { id: testInventoryId } }).catch(() => {});
    }
    if (testVariantId) {
      await prisma.productVariant.delete({ where: { id: testVariantId } }).catch(() => {});
    }
    if (testProductId) {
      await prisma.product.delete({ where: { id: testProductId } }).catch(() => {});
    }
    if (adminUser) {
      await prisma.user.delete({ where: { id: adminUser.id } }).catch(() => {});
    }
  }

  describe('POST /inventory/adjust', () => {
    it('should adjust inventory quantity upward', async () => {
      const response = await request(app.getHttpServer())
        .post('/inventory/adjust')
        .set('Authorization', `Bearer ${adminToken}`)
        .send({
          productVariantId: testVariantId,
          quantityChange: 50,
          reason: 'Restock',
          notes: 'New shipment arrived',
        })
        .expect(201);

      expect(response.body.quantity).toBe(150);
      expect(response.body.available).toBe(140);
    });

    it('should adjust inventory quantity downward', async () => {
      const response = await request(app.getHttpServer())
        .post('/inventory/adjust')
        .set('Authorization', `Bearer ${adminToken}`)
        .send({
          productVariantId: testVariantId,
          quantityChange: -20,
          reason: 'Damaged goods',
        })
        .expect(201);

      expect(response.body.quantity).toBeLessThan(150);
    });

    it('should require authentication', async () => {
      await request(app.getHttpServer())
        .post('/inventory/adjust')
        .send({
          productVariantId: testVariantId,
          quantityChange: 10,
          reason: 'Test',
        })
        .expect(401);
    });

    it('should validate required fields', async () => {
      await request(app.getHttpServer())
        .post('/inventory/adjust')
        .set('Authorization', `Bearer ${adminToken}`)
        .send({
          productVariantId: testVariantId,
          // Missing quantityChange and reason
        })
        .expect(400);
    });
  });

  describe('GET /inventory/:id/history', () => {
    it('should return adjustment history', async () => {
      const response = await request(app.getHttpServer())
        .get(`/inventory/${testInventoryId}/history`)
        .set('Authorization', `Bearer ${adminToken}`)
        .expect(200);

      expect(Array.isArray(response.body)).toBe(true);
      expect(response.body.length).toBeGreaterThan(0);
    });
  });
});
