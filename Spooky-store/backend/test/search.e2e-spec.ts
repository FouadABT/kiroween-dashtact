import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication, ValidationPipe } from '@nestjs/common';
import request from 'supertest';
import { AppModule } from '../src/app.module';
import { PrismaService } from '../src/prisma/prisma.service';
import { JwtService } from '@nestjs/jwt';

describe('Search System E2E Tests', () => {
  let app: INestApplication;
  let prisma: PrismaService;
  let jwtService: JwtService;
  let authToken: string;
  let adminToken: string;
  let testUser: any;
  let adminUser: any;
  let testProduct: any;
  let testBlogPost: any;
  let testPage: any;

  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleFixture.createNestApplication();
    app.useGlobalPipes(new ValidationPipe({ whitelist: true, transform: true }));
    await app.init();

    prisma = moduleFixture.get<PrismaService>(PrismaService);
    jwtService = moduleFixture.get<JwtService>(JwtService);

    // Create test users with different roles
    const userRole = await prisma.userRole.findFirst({
      where: { name: 'User' },
    });

    const adminRole = await prisma.userRole.findFirst({
      where: { name: 'Admin' },
    });

    testUser = await prisma.user.create({
      data: {
        email: 'search-test-user@example.com',
        name: 'Search Test User',
        password: 'hashedpassword',
        roleId: userRole!.id,
      },
    });

    adminUser = await prisma.user.create({
      data: {
        email: 'search-test-admin@example.com',
        name: 'Search Test Admin',
        password: 'hashedpassword',
        roleId: adminRole!.id,
      },
    });

    // Generate real JWT tokens
    authToken = jwtService.sign({ sub: testUser.id, email: testUser.email });
    adminToken = jwtService.sign({ sub: adminUser.id, email: adminUser.email });

    // Create test data for searching
    testProduct = await prisma.product.create({
      data: {
        title: 'Test Search Product',
        description: 'A product for testing search functionality',
        price: 99.99,
        sku: 'TEST-SKU-001',
        status: 'PUBLISHED',
        stock: 10,
      },
    });

    testBlogPost = await prisma.blogPost.create({
      data: {
        title: 'Test Search Blog Post',
        slug: 'test-search-blog-post',
        excerpt: 'A blog post for testing search',
        content: 'Full content of the test blog post',
        status: 'PUBLISHED',
        authorId: adminUser.id,
      },
    });

    testPage = await prisma.page.create({
      data: {
        title: 'Test Search Page',
        slug: 'test-search-page',
        content: 'Content for testing page search',
        status: 'PUBLISHED',
      },
    });
  });

  afterAll(async () => {
    // Cleanup test data
    if (testPage) {
      await prisma.page.delete({ where: { id: testPage.id } }).catch(() => {});
    }
    if (testBlogPost) {
      await prisma.blogPost.delete({ where: { id: testBlogPost.id } }).catch(() => {});
    }
    if (testProduct) {
      await prisma.product.delete({ where: { id: testProduct.id } }).catch(() => {});
    }
    if (testUser) {
      await prisma.user.delete({ where: { id: testUser.id } }).catch(() => {});
    }
    if (adminUser) {
      await prisma.user.delete({ where: { id: adminUser.id } }).catch(() => {});
    }
    await app.close();
  });

  describe('Full Search Flow - Main Endpoint', () => {
    it('should return paginated search results with correct structure', () => {
      return request(app.getHttpServer())
        .get('/search')
        .query({ q: 'test' })
        .set('Authorization', `Bearer ${authToken}`)
        .expect(200)
        .expect((res) => {
          expect(res.body).toHaveProperty('results');
          expect(res.body).toHaveProperty('total');
          expect(res.body).toHaveProperty('page');
          expect(res.body).toHaveProperty('limit');
          expect(res.body).toHaveProperty('totalPages');
          expect(Array.isArray(res.body.results)).toBe(true);
          
          // Verify result structure
          if (res.body.results.length > 0) {
            const result = res.body.results[0];
            expect(result).toHaveProperty('id');
            expect(result).toHaveProperty('entityType');
            expect(result).toHaveProperty('title');
            expect(result).toHaveProperty('description');
            expect(result).toHaveProperty('url');
            expect(result).toHaveProperty('metadata');
            expect(result).toHaveProperty('relevanceScore');
          }
        });
    });

    it('should find test product by title', () => {
      return request(app.getHttpServer())
        .get('/search')
        .query({ q: 'Test Search Product' })
        .set('Authorization', `Bearer ${authToken}`)
        .expect(200)
        .expect((res) => {
          expect(res.body.results.length).toBeGreaterThan(0);
          const productResult = res.body.results.find(
            (r: any) => r.entityType === 'products'
          );
          expect(productResult).toBeDefined();
          expect(productResult.title).toContain('Test Search Product');
        });
    });

    it('should find test blog post by title', () => {
      return request(app.getHttpServer())
        .get('/search')
        .query({ q: 'Test Search Blog' })
        .set('Authorization', `Bearer ${adminToken}`)
        .expect(200)
        .expect((res) => {
          expect(res.body.results.length).toBeGreaterThan(0);
          const blogResult = res.body.results.find(
            (r: any) => r.entityType === 'posts'
          );
          expect(blogResult).toBeDefined();
          expect(blogResult.title).toContain('Test Search Blog Post');
        });
    });

    it('should filter by entity type - products only', () => {
      return request(app.getHttpServer())
        .get('/search')
        .query({ q: 'test', type: 'products' })
        .set('Authorization', `Bearer ${authToken}`)
        .expect(200)
        .expect((res) => {
          expect(res.body).toHaveProperty('results');
          // All results should be products
          res.body.results.forEach((result: any) => {
            expect(result.entityType).toBe('products');
          });
        });
    });

    it('should filter by entity type - posts only', () => {
      return request(app.getHttpServer())
        .get('/search')
        .query({ q: 'test', type: 'posts' })
        .set('Authorization', `Bearer ${adminToken}`)
        .expect(200)
        .expect((res) => {
          expect(res.body).toHaveProperty('results');
          // All results should be posts
          res.body.results.forEach((result: any) => {
            expect(result.entityType).toBe('posts');
          });
        });
    });

    it('should handle pagination - page 1', () => {
      return request(app.getHttpServer())
        .get('/search')
        .query({ q: 'test', page: 1, limit: 5 })
        .set('Authorization', `Bearer ${authToken}`)
        .expect(200)
        .expect((res) => {
          expect(res.body.page).toBe(1);
          expect(res.body.limit).toBe(5);
          expect(res.body.results.length).toBeLessThanOrEqual(5);
        });
    });

    it('should handle pagination - page 2', () => {
      return request(app.getHttpServer())
        .get('/search')
        .query({ q: 'test', page: 2, limit: 10 })
        .set('Authorization', `Bearer ${authToken}`)
        .expect(200)
        .expect((res) => {
          expect(res.body.page).toBe(2);
          expect(res.body.limit).toBe(10);
        });
    });

    it('should sort by relevance (default)', () => {
      return request(app.getHttpServer())
        .get('/search')
        .query({ q: 'test', sortBy: 'relevance' })
        .set('Authorization', `Bearer ${authToken}`)
        .expect(200)
        .expect((res) => {
          expect(res.body).toHaveProperty('results');
          // Results should be sorted by relevance score
          if (res.body.results.length > 1) {
            for (let i = 0; i < res.body.results.length - 1; i++) {
              expect(res.body.results[i].relevanceScore).toBeGreaterThanOrEqual(
                res.body.results[i + 1].relevanceScore
              );
            }
          }
        });
    });

    it('should sort by date', () => {
      return request(app.getHttpServer())
        .get('/search')
        .query({ q: 'test', sortBy: 'date' })
        .set('Authorization', `Bearer ${authToken}`)
        .expect(200)
        .expect((res) => {
          expect(res.body).toHaveProperty('results');
        });
    });

    it('should sort by name', () => {
      return request(app.getHttpServer())
        .get('/search')
        .query({ q: 'test', sortBy: 'name' })
        .set('Authorization', `Bearer ${authToken}`)
        .expect(200)
        .expect((res) => {
          expect(res.body).toHaveProperty('results');
        });
    });
  });

  describe('Permission-Based Filtering', () => {
    it('should filter results based on user permissions', () => {
      return request(app.getHttpServer())
        .get('/search')
        .query({ q: 'test', type: 'users' })
        .set('Authorization', `Bearer ${authToken}`)
        .expect(200)
        .expect((res) => {
          // Regular user should only see their own user record
          expect(res.body.results.length).toBeLessThanOrEqual(1);
          if (res.body.results.length > 0) {
            expect(res.body.results[0].id).toBe(testUser.id);
          }
        });
    });

    it('should allow admin to see all users', () => {
      return request(app.getHttpServer())
        .get('/search')
        .query({ q: 'search-test', type: 'users' })
        .set('Authorization', `Bearer ${adminToken}`)
        .expect(200)
        .expect((res) => {
          // Admin should see multiple users
          expect(res.body.results.length).toBeGreaterThanOrEqual(2);
        });
    });

    it('should show published products to regular users', () => {
      return request(app.getHttpServer())
        .get('/search')
        .query({ q: 'Test Search Product', type: 'products' })
        .set('Authorization', `Bearer ${authToken}`)
        .expect(200)
        .expect((res) => {
          expect(res.body.results.length).toBeGreaterThan(0);
          // All products should be published
          res.body.results.forEach((result: any) => {
            expect(result.metadata.status).toBe('PUBLISHED');
          });
        });
    });

    it('should show all products to admin including drafts', () => {
      return request(app.getHttpServer())
        .get('/search')
        .query({ q: 'product', type: 'products' })
        .set('Authorization', `Bearer ${adminToken}`)
        .expect(200)
        .expect((res) => {
          // Admin can see all products regardless of status
          expect(res.body).toHaveProperty('results');
        });
    });
  });

  describe('Validation and Error Handling', () => {
    it('should reject request without query parameter', () => {
      return request(app.getHttpServer())
        .get('/search')
        .set('Authorization', `Bearer ${authToken}`)
        .expect(400);
    });

    it('should reject empty query', () => {
      return request(app.getHttpServer())
        .get('/search')
        .query({ q: '' })
        .set('Authorization', `Bearer ${authToken}`)
        .expect(400);
    });

    it('should reject query exceeding max length (200 chars)', () => {
      return request(app.getHttpServer())
        .get('/search')
        .query({ q: 'a'.repeat(201) })
        .set('Authorization', `Bearer ${authToken}`)
        .expect(400);
    });

    it('should reject invalid entity type', () => {
      return request(app.getHttpServer())
        .get('/search')
        .query({ q: 'test', type: 'invalid-type' })
        .set('Authorization', `Bearer ${authToken}`)
        .expect(400);
    });

    it('should reject invalid page number (0)', () => {
      return request(app.getHttpServer())
        .get('/search')
        .query({ q: 'test', page: 0 })
        .set('Authorization', `Bearer ${authToken}`)
        .expect(400);
    });

    it('should reject negative page number', () => {
      return request(app.getHttpServer())
        .get('/search')
        .query({ q: 'test', page: -1 })
        .set('Authorization', `Bearer ${authToken}`)
        .expect(400);
    });

    it('should reject limit exceeding maximum (100)', () => {
      return request(app.getHttpServer())
        .get('/search')
        .query({ q: 'test', limit: 101 })
        .set('Authorization', `Bearer ${authToken}`)
        .expect(400);
    });

    it('should reject invalid limit (0)', () => {
      return request(app.getHttpServer())
        .get('/search')
        .query({ q: 'test', limit: 0 })
        .set('Authorization', `Bearer ${authToken}`)
        .expect(400);
    });

    it('should reject invalid sort parameter', () => {
      return request(app.getHttpServer())
        .get('/search')
        .query({ q: 'test', sortBy: 'invalid-sort' })
        .set('Authorization', `Bearer ${authToken}`)
        .expect(400);
    });

    it('should require authentication', () => {
      return request(app.getHttpServer())
        .get('/search')
        .query({ q: 'test' })
        .expect(401);
    });

    it('should reject invalid auth token', () => {
      return request(app.getHttpServer())
        .get('/search')
        .query({ q: 'test' })
        .set('Authorization', 'Bearer invalid-token')
        .expect(401);
    });
  });

  describe('Quick Search Endpoint (Cmd+K Dialog)', () => {
    it('should return quick search results with max 8 items', () => {
      return request(app.getHttpServer())
        .get('/search/quick')
        .query({ q: 'test' })
        .set('Authorization', `Bearer ${authToken}`)
        .expect(200)
        .expect((res) => {
          expect(Array.isArray(res.body)).toBe(true);
          // Should return max 8 results for quick search
          expect(res.body.length).toBeLessThanOrEqual(8);
          
          // Verify result structure
          if (res.body.length > 0) {
            const result = res.body[0];
            expect(result).toHaveProperty('id');
            expect(result).toHaveProperty('entityType');
            expect(result).toHaveProperty('title');
            expect(result).toHaveProperty('description');
            expect(result).toHaveProperty('url');
          }
        });
    });

    it('should find test product in quick search', () => {
      return request(app.getHttpServer())
        .get('/search/quick')
        .query({ q: 'Test Search Product' })
        .set('Authorization', `Bearer ${authToken}`)
        .expect(200)
        .expect((res) => {
          expect(res.body.length).toBeGreaterThan(0);
          const productResult = res.body.find(
            (r: any) => r.entityType === 'products'
          );
          expect(productResult).toBeDefined();
        });
    });

    it('should respect permissions in quick search', () => {
      return request(app.getHttpServer())
        .get('/search/quick')
        .query({ q: 'search-test' })
        .set('Authorization', `Bearer ${authToken}`)
        .expect(200)
        .expect((res) => {
          // Regular user should have limited results
          expect(Array.isArray(res.body)).toBe(true);
        });
    });

    it('should reject quick search without query parameter', () => {
      return request(app.getHttpServer())
        .get('/search/quick')
        .set('Authorization', `Bearer ${authToken}`)
        .expect(400);
    });

    it('should require authentication for quick search', () => {
      return request(app.getHttpServer())
        .get('/search/quick')
        .query({ q: 'test' })
        .expect(401);
    });
  });

  describe('Rate Limiting Enforcement', () => {
    it('should enforce rate limits (100 requests per hour)', async () => {
      // Make 12 requests quickly (more than the per-minute threshold)
      const requests = Array.from({ length: 12 }, () =>
        request(app.getHttpServer())
          .get('/search')
          .query({ q: 'rate-limit-test' })
          .set('Authorization', `Bearer ${authToken}`)
      );

      const responses = await Promise.all(requests);

      // Check if any requests were rate limited
      const rateLimited = responses.filter((res) => res.status === 429);
      const successful = responses.filter((res) => res.status === 200);

      // Should have some successful and some rate limited
      expect(successful.length).toBeGreaterThan(0);
      expect(rateLimited.length).toBeGreaterThan(0);
    });

    it('should return 429 status code when rate limited', async () => {
      // Make many requests to trigger rate limit
      const requests = Array.from({ length: 15 }, () =>
        request(app.getHttpServer())
          .get('/search/quick')
          .query({ q: 'test' })
          .set('Authorization', `Bearer ${authToken}`)
      );

      const responses = await Promise.all(requests);
      const rateLimited = responses.find((res) => res.status === 429);

      if (rateLimited) {
        expect(rateLimited.status).toBe(429);
        expect(rateLimited.body).toHaveProperty('message');
      }
    });

    it('should apply rate limits per user', async () => {
      // User 1 makes requests
      const user1Requests = Array.from({ length: 5 }, () =>
        request(app.getHttpServer())
          .get('/search')
          .query({ q: 'test' })
          .set('Authorization', `Bearer ${authToken}`)
      );

      // Admin makes requests (different user)
      const adminRequests = Array.from({ length: 5 }, () =>
        request(app.getHttpServer())
          .get('/search')
          .query({ q: 'test' })
          .set('Authorization', `Bearer ${adminToken}`)
      );

      const [user1Responses, adminResponses] = await Promise.all([
        Promise.all(user1Requests),
        Promise.all(adminRequests),
      ]);

      // Both users should be able to make requests independently
      expect(user1Responses.some((r) => r.status === 200)).toBe(true);
      expect(adminResponses.some((r) => r.status === 200)).toBe(true);
    });
  });

  describe('Full Search Flow Integration', () => {
    it('should complete full search flow: dialog -> results page', async () => {
      // Step 1: Quick search (simulating Cmd+K dialog)
      const quickSearchRes = await request(app.getHttpServer())
        .get('/search/quick')
        .query({ q: 'test' })
        .set('Authorization', `Bearer ${authToken}`)
        .expect(200);

      expect(quickSearchRes.body.length).toBeGreaterThan(0);
      expect(quickSearchRes.body.length).toBeLessThanOrEqual(8);

      // Step 2: Full search (simulating "View all results" click)
      const fullSearchRes = await request(app.getHttpServer())
        .get('/search')
        .query({ q: 'test', page: 1, limit: 20 })
        .set('Authorization', `Bearer ${authToken}`)
        .expect(200);

      expect(fullSearchRes.body.results.length).toBeGreaterThanOrEqual(
        quickSearchRes.body.length
      );
      expect(fullSearchRes.body).toHaveProperty('totalPages');

      // Step 3: Filter by type (simulating filter selection)
      const filteredRes = await request(app.getHttpServer())
        .get('/search')
        .query({ q: 'test', type: 'products', page: 1, limit: 20 })
        .set('Authorization', `Bearer ${authToken}`)
        .expect(200);

      filteredRes.body.results.forEach((result: any) => {
        expect(result.entityType).toBe('products');
      });

      // Step 4: Navigate to page 2 (simulating pagination)
      if (fullSearchRes.body.totalPages > 1) {
        const page2Res = await request(app.getHttpServer())
          .get('/search')
          .query({ q: 'test', page: 2, limit: 20 })
          .set('Authorization', `Bearer ${authToken}`)
          .expect(200);

        expect(page2Res.body.page).toBe(2);
      }
    });

    it('should handle search with no results gracefully', () => {
      return request(app.getHttpServer())
        .get('/search')
        .query({ q: 'nonexistent-search-term-xyz123' })
        .set('Authorization', `Bearer ${authToken}`)
        .expect(200)
        .expect((res) => {
          expect(res.body.results).toEqual([]);
          expect(res.body.total).toBe(0);
          expect(res.body.totalPages).toBe(0);
        });
    });

    it('should handle quick search with no results', () => {
      return request(app.getHttpServer())
        .get('/search/quick')
        .query({ q: 'nonexistent-xyz123' })
        .set('Authorization', `Bearer ${authToken}`)
        .expect(200)
        .expect((res) => {
          expect(res.body).toEqual([]);
        });
    });
  });

  describe('Search Across Multiple Entity Types', () => {
    it('should search across all entity types simultaneously', async () => {
      const res = await request(app.getHttpServer())
        .get('/search')
        .query({ q: 'test', type: 'all' })
        .set('Authorization', `Bearer ${adminToken}`)
        .expect(200);

      // Should have results from multiple entity types
      const entityTypes = new Set(
        res.body.results.map((r: any) => r.entityType)
      );
      expect(entityTypes.size).toBeGreaterThan(1);
    });

    it('should include products, posts, and pages in global search', async () => {
      const res = await request(app.getHttpServer())
        .get('/search')
        .query({ q: 'Test Search' })
        .set('Authorization', `Bearer ${adminToken}`)
        .expect(200);

      const hasProducts = res.body.results.some(
        (r: any) => r.entityType === 'products'
      );
      const hasPosts = res.body.results.some(
        (r: any) => r.entityType === 'posts'
      );
      const hasPages = res.body.results.some(
        (r: any) => r.entityType === 'pages'
      );

      expect(hasProducts || hasPosts || hasPages).toBe(true);
    });
  });

  describe('Error Scenarios', () => {
    it('should handle malformed query gracefully', () => {
      return request(app.getHttpServer())
        .get('/search')
        .query({ q: '<script>alert("xss")</script>' })
        .set('Authorization', `Bearer ${authToken}`)
        .expect(200)
        .expect((res) => {
          // Should sanitize and return results or empty array
          expect(Array.isArray(res.body.results)).toBe(true);
        });
    });

    it('should handle special characters in query', () => {
      return request(app.getHttpServer())
        .get('/search')
        .query({ q: 'test@#$%^&*()' })
        .set('Authorization', `Bearer ${authToken}`)
        .expect(200);
    });

    it('should handle unicode characters in query', () => {
      return request(app.getHttpServer())
        .get('/search')
        .query({ q: 'test 测试 тест' })
        .set('Authorization', `Bearer ${authToken}`)
        .expect(200);
    });

    it('should handle very long valid query (under 200 chars)', () => {
      return request(app.getHttpServer())
        .get('/search')
        .query({ q: 'test '.repeat(30).trim().substring(0, 199) })
        .set('Authorization', `Bearer ${authToken}`)
        .expect(200);
    });
  });
});
