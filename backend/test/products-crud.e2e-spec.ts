import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication, ValidationPipe } from '@nestjs/common';
import request from 'supertest';
import { AppModule } from '../src/app.module';
import { PrismaService } from '../src/prisma/prisma.service';
import { ProductStatus } from '@prisma/client';

describe('Products CRUD (e2e)', () => {
  let app: INestApplication;
  let prisma: PrismaService;

  // Test users
  let adminToken: string;
  let adminUser: any;
  let regularUserToken: string;
  let regularUser: any;

  // Test data
  let testProductIds: string[] = [];
  let testCategoryIds: string[] = [];
  let testTagIds: string[] = [];

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

    await setupTestUsers();
    await setupTestData();
  });

  afterAll(async () => {
    await cleanupTestData();
    await app.close();
  });

  async function setupTestUsers() {
    const adminRole = await prisma.userRole.findFirst({
      where: { name: 'Admin' },
    });

    // Register Admin
    const adminResponse = await request(app.getHttpServer())
      .post('/auth/register')
      .send({
        email: `admin-products-${Date.now()}@example.com`,
        password: 'Password123',
        name: 'Admin Products Test',
      });
    adminToken = adminResponse.body.accessToken;
    adminUser = adminResponse.body.user;

    await prisma.user.update({
      where: { id: adminUser.id },
      data: { roleId: adminRole!.id },
    });

    // Register Regular User
    const userResponse = await request(app.getHttpServer())
      .post('/auth/register')
      .send({
        email: `user-products-${Date.now()}@example.com`,
        password: 'Password123',
        name: 'Regular User Products Test',
      });
    regularUserToken = userResponse.body.accessToken;
    regularUser = userResponse.body.user;
  }

  async function setupTestData() {
    // Create test category
    const category = await prisma.productCategory.create({
      data: {
        name: 'Test Category',
        slug: `test-category-${Date.now()}`,
        isVisible: true,
      },
    });
    testCategoryIds.push(category.id);

    // Create test tag
    const tag = await prisma.productTag.create({
      data: {
        name: 'Test Tag',
        slug: `test-tag-${Date.now()}`,
      },
    });
    testTagIds.push(tag.id);
  }

  async function cleanupTestData() {
    // Delete test products
    if (testProductIds.length > 0) {
      await prisma.product
        .deleteMany({
          where: { id: { in: testProductIds } },
        })
        .catch(() => {});
    }

    // Delete test categories
    if (testCategoryIds.length > 0) {
      await prisma.productCategory
        .deleteMany({
          where: { id: { in: testCategoryIds } },
        })
        .catch(() => {});
    }

    // Delete test tags
    if (testTagIds.length > 0) {
      await prisma.productTag
        .deleteMany({
          where: { id: { in: testTagIds } },
        })
        .catch(() => {});
    }

    // Delete test users
    const userIds = [adminUser?.id, regularUser?.id].filter(Boolean);
    for (const id of userIds) {
      await prisma.user.delete({ where: { id } }).catch(() => {});
    }
  }

  async function getAdminToken(): Promise<string> {
    const loginResponse = await request(app.getHttpServer())
      .post('/auth/login')
      .send({
        email: adminUser.email,
        password: 'Password123',
      });
    return loginResponse.body.accessToken;
  }

  describe('POST /products (Create Product)', () => {
    it('should require authentication', () => {
      return request(app.getHttpServer())
        .post('/products')
        .send({
          name: 'Test Product',
          slug: 'test-product',
          basePrice: 99.99,
        })
        .expect(401);
    });

    it('should require products:write permission', () => {
      return request(app.getHttpServer())
        .post('/products')
        .set('Authorization', `Bearer ${regularUserToken}`)
        .send({
          name: 'Test Product',
          slug: 'test-product',
          basePrice: 99.99,
        })
        .expect(403);
    });

    it('should create a product with minimal fields', async () => {
      const token = await getAdminToken();

      const response = await request(app.getHttpServer())
        .post('/products')
        .set('Authorization', `Bearer ${token}`)
        .send({
          name: 'Minimal Product',
          slug: `minimal-product-${Date.now()}`,
          basePrice: 49.99,
        })
        .expect(201);

      expect(response.body).toHaveProperty('id');
      expect(response.body.name).toBe('Minimal Product');
      expect(response.body.basePrice).toBe(49.99);
      testProductIds.push(response.body.id);
    });

    it('should create a product with all fields', async () => {
      const token = await getAdminToken();

      const response = await request(app.getHttpServer())
        .post('/products')
        .set('Authorization', `Bearer ${token}`)
        .send({
          name: 'Full Product',
          slug: `full-product-${Date.now()}`,
          description: 'Full description',
          shortDescription: 'Short description',
          basePrice: 99.99,
          compareAtPrice: 129.99,
          cost: 50.00,
          sku: `FULL-${Date.now()}`,
          barcode: '123456789',
          featuredImage: '/images/full.jpg',
          images: ['/images/full1.jpg', '/images/full2.jpg'],
          status: ProductStatus.DRAFT,
          isVisible: true,
          isFeatured: false,
          metaTitle: 'Full Product Meta',
          metaDescription: 'Meta description',
          categoryIds: [testCategoryIds[0]],
          tagIds: [testTagIds[0]],
        })
        .expect(201);

      expect(response.body).toHaveProperty('id');
      expect(response.body.name).toBe('Full Product');
      expect(response.body.categories).toHaveLength(1);
      expect(response.body.tags).toHaveLength(1);
      testProductIds.push(response.body.id);
    });

    it('should validate required fields', async () => {
      const token = await getAdminToken();

      await request(app.getHttpServer())
        .post('/products')
        .set('Authorization', `Bearer ${token}`)
        .send({
          name: 'Test',
          // Missing slug and basePrice
        })
        .expect(400);
    });

    it('should validate price is non-negative', async () => {
      const token = await getAdminToken();

      await request(app.getHttpServer())
        .post('/products')
        .set('Authorization', `Bearer ${token}`)
        .send({
          name: 'Invalid Price Product',
          slug: 'invalid-price',
          basePrice: -10,
        })
        .expect(400);
    });

    it('should prevent duplicate slugs', async () => {
      const token = await getAdminToken();
      const slug = `duplicate-slug-${Date.now()}`;

      // Create first product
      const firstResponse = await request(app.getHttpServer())
        .post('/products')
        .set('Authorization', `Bearer ${token}`)
        .send({
          name: 'First Product',
          slug,
          basePrice: 99.99,
        })
        .expect(201);

      testProductIds.push(firstResponse.body.id);

      // Try to create second product with same slug
      await request(app.getHttpServer())
        .post('/products')
        .set('Authorization', `Bearer ${token}`)
        .send({
          name: 'Second Product',
          slug,
          basePrice: 99.99,
        })
        .expect(409);
    });

    it('should prevent duplicate SKUs', async () => {
      const token = await getAdminToken();
      const sku = `DUP-SKU-${Date.now()}`;

      // Create first product
      const firstResponse = await request(app.getHttpServer())
        .post('/products')
        .set('Authorization', `Bearer ${token}`)
        .send({
          name: 'First SKU Product',
          slug: `first-sku-${Date.now()}`,
          basePrice: 99.99,
          sku,
        })
        .expect(201);

      testProductIds.push(firstResponse.body.id);

      // Try to create second product with same SKU
      await request(app.getHttpServer())
        .post('/products')
        .set('Authorization', `Bearer ${token}`)
        .send({
          name: 'Second SKU Product',
          slug: `second-sku-${Date.now()}`,
          basePrice: 99.99,
          sku,
        })
        .expect(409);
    });
  });

  describe('GET /products (List Products)', () => {
    it('should allow public access', async () => {
      await request(app.getHttpServer()).get('/products').expect(200);
    });

    it('should return paginated products', async () => {
      const response = await request(app.getHttpServer())
        .get('/products')
        .expect(200);

      expect(response.body).toHaveProperty('products');
      expect(response.body).toHaveProperty('total');
      expect(response.body).toHaveProperty('page');
      expect(response.body).toHaveProperty('limit');
      expect(response.body).toHaveProperty('totalPages');
      expect(Array.isArray(response.body.products)).toBe(true);
    });

    it('should filter by status', async () => {
      const response = await request(app.getHttpServer())
        .get('/products?status=PUBLISHED')
        .expect(200);

      response.body.products.forEach((product: any) => {
        expect(product.status).toBe('PUBLISHED');
      });
    });

    it('should filter by visibility', async () => {
      const response = await request(app.getHttpServer())
        .get('/products?isVisible=true')
        .expect(200);

      response.body.products.forEach((product: any) => {
        expect(product.isVisible).toBe(true);
      });
    });

    it('should search products', async () => {
      const token = await getAdminToken();

      // Create a searchable product
      const createResponse = await request(app.getHttpServer())
        .post('/products')
        .set('Authorization', `Bearer ${token}`)
        .send({
          name: 'Searchable Unique Product',
          slug: `searchable-${Date.now()}`,
          basePrice: 99.99,
        });

      testProductIds.push(createResponse.body.id);

      // Search for it
      const searchResponse = await request(app.getHttpServer())
        .get('/products?search=Searchable Unique')
        .expect(200);

      expect(searchResponse.body.products.length).toBeGreaterThan(0);
      expect(
        searchResponse.body.products.some(
          (p: any) => p.name === 'Searchable Unique Product',
        ),
      ).toBe(true);
    });
  });

  describe('GET /products/:id (Get Product)', () => {
    it('should return a product by ID', async () => {
      const token = await getAdminToken();

      // Create a product
      const createResponse = await request(app.getHttpServer())
        .post('/products')
        .set('Authorization', `Bearer ${token}`)
        .send({
          name: 'Get Test Product',
          slug: `get-test-${Date.now()}`,
          basePrice: 99.99,
        });

      testProductIds.push(createResponse.body.id);

      // Get the product
      const response = await request(app.getHttpServer())
        .get(`/products/${createResponse.body.id}`)
        .expect(200);

      expect(response.body.id).toBe(createResponse.body.id);
      expect(response.body.name).toBe('Get Test Product');
    });

    it('should return 404 for non-existent product', async () => {
      await request(app.getHttpServer())
        .get('/products/nonexistent-id')
        .expect(404);
    });
  });

  describe('GET /products/slug/:slug (Get Product by Slug)', () => {
    it('should return a product by slug', async () => {
      const token = await getAdminToken();
      const slug = `slug-test-${Date.now()}`;

      // Create a product
      const createResponse = await request(app.getHttpServer())
        .post('/products')
        .set('Authorization', `Bearer ${token}`)
        .send({
          name: 'Slug Test Product',
          slug,
          basePrice: 99.99,
        });

      testProductIds.push(createResponse.body.id);

      // Get by slug
      const response = await request(app.getHttpServer())
        .get(`/products/slug/${slug}`)
        .expect(200);

      expect(response.body.slug).toBe(slug);
      expect(response.body.name).toBe('Slug Test Product');
    });

    it('should return 404 for non-existent slug', async () => {
      await request(app.getHttpServer())
        .get('/products/slug/nonexistent-slug')
        .expect(404);
    });
  });

  describe('PATCH /products/:id (Update Product)', () => {
    it('should require authentication', async () => {
      await request(app.getHttpServer())
        .patch('/products/some-id')
        .send({ name: 'Updated' })
        .expect(401);
    });

    it('should require products:write permission', async () => {
      await request(app.getHttpServer())
        .patch('/products/some-id')
        .set('Authorization', `Bearer ${regularUserToken}`)
        .send({ name: 'Updated' })
        .expect(403);
    });

    it('should update a product', async () => {
      const token = await getAdminToken();

      // Create a product
      const createResponse = await request(app.getHttpServer())
        .post('/products')
        .set('Authorization', `Bearer ${token}`)
        .send({
          name: 'Update Test Product',
          slug: `update-test-${Date.now()}`,
          basePrice: 99.99,
        });

      testProductIds.push(createResponse.body.id);

      // Update it
      const updateResponse = await request(app.getHttpServer())
        .patch(`/products/${createResponse.body.id}`)
        .set('Authorization', `Bearer ${token}`)
        .send({
          name: 'Updated Product Name',
          basePrice: 149.99,
        })
        .expect(200);

      expect(updateResponse.body.name).toBe('Updated Product Name');
      expect(updateResponse.body.basePrice).toBe(149.99);
    });
  });

  describe('DELETE /products/:id (Delete Product)', () => {
    it('should require authentication', async () => {
      await request(app.getHttpServer())
        .delete('/products/some-id')
        .expect(401);
    });

    it('should require products:delete permission', async () => {
      await request(app.getHttpServer())
        .delete('/products/some-id')
        .set('Authorization', `Bearer ${regularUserToken}`)
        .expect(403);
    });

    it('should delete a product', async () => {
      const token = await getAdminToken();

      // Create a product
      const createResponse = await request(app.getHttpServer())
        .post('/products')
        .set('Authorization', `Bearer ${token}`)
        .send({
          name: 'Delete Test Product',
          slug: `delete-test-${Date.now()}`,
          basePrice: 99.99,
        });

      const productId = createResponse.body.id;

      // Delete it
      await request(app.getHttpServer())
        .delete(`/products/${productId}`)
        .set('Authorization', `Bearer ${token}`)
        .expect(200);

      // Verify it's deleted
      await request(app.getHttpServer())
        .get(`/products/${productId}`)
        .expect(404);
    });
  });

  describe('PATCH /products/:id/publish (Publish Product)', () => {
    it('should publish a draft product', async () => {
      const token = await getAdminToken();

      // Create a draft product
      const createResponse = await request(app.getHttpServer())
        .post('/products')
        .set('Authorization', `Bearer ${token}`)
        .send({
          name: 'Publish Test Product',
          slug: `publish-test-${Date.now()}`,
          basePrice: 99.99,
          status: ProductStatus.DRAFT,
        });

      testProductIds.push(createResponse.body.id);

      // Publish it
      const publishResponse = await request(app.getHttpServer())
        .patch(`/products/${createResponse.body.id}/publish`)
        .set('Authorization', `Bearer ${token}`)
        .expect(200);

      expect(publishResponse.body.status).toBe('PUBLISHED');
      expect(publishResponse.body.publishedAt).toBeDefined();
    });
  });

  describe('PATCH /products/:id/unpublish (Unpublish Product)', () => {
    it('should unpublish a published product', async () => {
      const token = await getAdminToken();

      // Create and publish a product
      const createResponse = await request(app.getHttpServer())
        .post('/products')
        .set('Authorization', `Bearer ${token}`)
        .send({
          name: 'Unpublish Test Product',
          slug: `unpublish-test-${Date.now()}`,
          basePrice: 99.99,
          status: ProductStatus.PUBLISHED,
        });

      testProductIds.push(createResponse.body.id);

      // Unpublish it
      const unpublishResponse = await request(app.getHttpServer())
        .patch(`/products/${createResponse.body.id}/unpublish`)
        .set('Authorization', `Bearer ${token}`)
        .expect(200);

      expect(unpublishResponse.body.status).toBe('DRAFT');
    });
  });
});
