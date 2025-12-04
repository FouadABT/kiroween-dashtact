import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication, ValidationPipe } from '@nestjs/common';
import request from 'supertest';
import { AppModule } from '../src/app.module';
import { PrismaService } from '../src/prisma/prisma.service';
import { OrderStatus } from '@prisma/client';

describe('E-commerce Workflow (e2e)', () => {
  let app: INestApplication;
  let prisma: PrismaService;
  let adminToken: string;
  let adminUser: any;

  // Test data IDs
  let customerId: string;
  let productId: string;
  let variantId: string;
  let orderId: string;

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
    await setupTestUser();
  });

  afterAll(async () => {
    await cleanupTestData();
    await app.close();
  });

  async function setupTestUser() {
    const adminRole = await prisma.userRole.findFirst({
      where: { name: 'Admin' },
    });

    const response = await request(app.getHttpServer())
      .post('/auth/register')
      .send({
        email: `ecommerce-admin-${Date.now()}@example.com`,
        password: 'Password123',
        name: 'E-commerce Admin',
      });

    adminToken = response.body.accessToken;
    adminUser = response.body.user;

    await prisma.user.update({
      where: { id: adminUser.id },
      data: { roleId: adminRole!.id },
    });
  }

  async function cleanupTestData() {
    if (orderId) {
      await prisma.order.delete({ where: { id: orderId } }).catch(() => {});
    }
    if (variantId) {
      await prisma.inventory
        .delete({ where: { productVariantId: variantId } })
        .catch(() => {});
      await prisma.productVariant
        .delete({ where: { id: variantId } })
        .catch(() => {});
    }
    if (productId) {
      await prisma.product.delete({ where: { id: productId } }).catch(() => {});
    }
    if (customerId) {
      await prisma.customer
        .delete({ where: { id: customerId } })
        .catch(() => {});
    }
    if (adminUser) {
      await prisma.user.delete({ where: { id: adminUser.id } }).catch(() => {});
    }
  }

  describe('Complete Order Flow', () => {
    it('should create customer → product → place order → update status', async () => {
      // Step 1: Create customer
      const customerResponse = await request(app.getHttpServer())
        .post('/customers')
        .set('Authorization', `Bearer ${adminToken}`)
        .send({
          email: `customer-${Date.now()}@example.com`,
          firstName: 'Test',
          lastName: 'Customer',
          shippingAddress: {
            street: '123 Main St',
            city: 'New York',
            state: 'NY',
            postalCode: '10001',
            country: 'USA',
          },
          billingAddress: {
            street: '123 Main St',
            city: 'New York',
            state: 'NY',
            postalCode: '10001',
            country: 'USA',
          },
        })
        .expect(201);

      customerId = customerResponse.body.id;
      expect(customerResponse.body.email).toContain('customer-');

      // Step 2: Create product
      const productResponse = await request(app.getHttpServer())
        .post('/products')
        .set('Authorization', `Bearer ${adminToken}`)
        .send({
          name: `E2E Test Product ${Date.now()}`,
          slug: `e2e-test-product-${Date.now()}`,
          basePrice: 99.99,
          status: 'PUBLISHED',
          isVisible: true,
        })
        .expect(201);

      productId = productResponse.body.id;
      expect(productResponse.body.name).toContain('E2E Test Product');

      // Step 3: Add variant to product
      const variantResponse = await request(app.getHttpServer())
        .post(`/products/${productId}/variants`)
        .set('Authorization', `Bearer ${adminToken}`)
        .send({
          name: 'Large',
          sku: `E2E-LG-${Date.now()}`,
          price: 109.99,
          attributes: { size: 'Large' },
        })
        .expect(201);

      variantId = variantResponse.body.id;

      // Step 4: Add inventory for variant
      await request(app.getHttpServer())
        .post('/inventory/adjust')
        .set('Authorization', `Bearer ${adminToken}`)
        .send({
          productVariantId: variantId,
          quantityChange: 100,
          reason: 'Initial stock',
        })
        .expect(201);

      // Step 5: Place order
      const orderResponse = await request(app.getHttpServer())
        .post('/orders')
        .set('Authorization', `Bearer ${adminToken}`)
        .send({
          customerId,
          items: [
            {
              productId,
              productVariantId: variantId,
              quantity: 2,
            },
          ],
          shippingAddress: {
            street: '123 Main St',
            city: 'New York',
            state: 'NY',
            postalCode: '10001',
            country: 'USA',
          },
          billingAddress: {
            street: '123 Main St',
            city: 'New York',
            state: 'NY',
            postalCode: '10001',
            country: 'USA',
          },
          customerEmail: customerResponse.body.email,
          customerName: 'Test Customer',
        })
        .expect(201);

      orderId = orderResponse.body.id;
      expect(orderResponse.body.status).toBe(OrderStatus.PENDING);
      expect(orderResponse.body.items).toHaveLength(1);

      // Step 6: Update order status to PROCESSING
      await request(app.getHttpServer())
        .patch(`/orders/${orderId}/status`)
        .set('Authorization', `Bearer ${adminToken}`)
        .send({
          status: OrderStatus.PROCESSING,
          notes: 'Order is being processed',
        })
        .expect(200);

      // Step 7: Verify order status updated
      const updatedOrder = await request(app.getHttpServer())
        .get(`/orders/${orderId}`)
        .set('Authorization', `Bearer ${adminToken}`)
        .expect(200);

      expect(updatedOrder.body.status).toBe(OrderStatus.PROCESSING);
    });
  });

  describe('Inventory Reservation and Release Flow', () => {
    it('should reserve inventory on order → release on cancellation', async () => {
      // Create test data
      const customer = await prisma.customer.create({
        data: {
          email: `inv-test-${Date.now()}@example.com`,
          firstName: 'Inventory',
          lastName: 'Test',
        },
      });

      const product = await prisma.product.create({
        data: {
          name: `Inventory Test Product ${Date.now()}`,
          slug: `inv-test-${Date.now()}`,
          basePrice: 50.0,
          status: 'PUBLISHED',
        },
      });

      const variant = await prisma.productVariant.create({
        data: {
          productId: product.id,
          name: 'Medium',
          sku: `INV-MD-${Date.now()}`,
          price: 55.0,
        },
      });

      // Add inventory
      await request(app.getHttpServer())
        .post('/inventory/adjust')
        .set('Authorization', `Bearer ${adminToken}`)
        .send({
          productVariantId: variant.id,
          quantityChange: 50,
          reason: 'Test stock',
        })
        .expect(201);

      // Check initial inventory
      const initialInv = await request(app.getHttpServer())
        .get(`/inventory/variant/${variant.id}`)
        .set('Authorization', `Bearer ${adminToken}`)
        .expect(200);

      expect(initialInv.body.available).toBe(50);
      expect(initialInv.body.reserved).toBe(0);

      // Place order (reserves inventory)
      const orderResponse = await request(app.getHttpServer())
        .post('/orders')
        .set('Authorization', `Bearer ${adminToken}`)
        .send({
          customerId: customer.id,
          items: [{ productId: product.id, productVariantId: variant.id, quantity: 10 }],
          shippingAddress: { street: '1 St', city: 'NY', state: 'NY', postalCode: '10001', country: 'USA' },
          billingAddress: { street: '1 St', city: 'NY', state: 'NY', postalCode: '10001', country: 'USA' },
          customerEmail: customer.email,
          customerName: 'Inventory Test',
        })
        .expect(201);

      // Check inventory after order (should be reserved)
      const reservedInv = await request(app.getHttpServer())
        .get(`/inventory/variant/${variant.id}`)
        .set('Authorization', `Bearer ${adminToken}`)
        .expect(200);

      expect(reservedInv.body.available).toBe(40);
      expect(reservedInv.body.reserved).toBe(10);

      // Cancel order (releases inventory)
      await request(app.getHttpServer())
        .patch(`/orders/${orderResponse.body.id}/status`)
        .set('Authorization', `Bearer ${adminToken}`)
        .send({
          status: OrderStatus.CANCELLED,
          notes: 'Test cancellation',
        })
        .expect(200);

      // Check inventory after cancellation (should be released)
      const releasedInv = await request(app.getHttpServer())
        .get(`/inventory/variant/${variant.id}`)
        .set('Authorization', `Bearer ${adminToken}`)
        .expect(200);

      expect(releasedInv.body.available).toBe(50);
      expect(releasedInv.body.reserved).toBe(0);

      // Cleanup
      await prisma.order.delete({ where: { id: orderResponse.body.id } });
      await prisma.inventory.delete({ where: { productVariantId: variant.id } });
      await prisma.productVariant.delete({ where: { id: variant.id } });
      await prisma.product.delete({ where: { id: product.id } });
      await prisma.customer.delete({ where: { id: customer.id } });
    });
  });

  describe('Customer Portal Access', () => {
    it('should generate portal token and access orders', async () => {
      // Create customer
      const customer = await prisma.customer.create({
        data: {
          email: `portal-test-${Date.now()}@example.com`,
          firstName: 'Portal',
          lastName: 'Test',
        },
      });

      // Generate portal token
      const tokenResponse = await request(app.getHttpServer())
        .post(`/customers/${customer.id}/portal-token`)
        .set('Authorization', `Bearer ${adminToken}`)
        .expect(201);

      expect(tokenResponse.body.portalToken).toBeDefined();
      const portalToken = tokenResponse.body.portalToken;

      // Access portal with token (no auth required)
      const portalResponse = await request(app.getHttpServer())
        .get(`/customers/portal/${portalToken}`)
        .expect(200);

      expect(portalResponse.body.email).toBe(customer.email);

      // Cleanup
      await prisma.customer.delete({ where: { id: customer.id } });
    });
  });
});
