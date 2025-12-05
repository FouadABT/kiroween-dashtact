import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication, ValidationPipe } from '@nestjs/common';
import * as request from 'supertest';
import { AppModule } from '../src/app.module';
import { PrismaService } from '../src/prisma/prisma.service';

describe('Blog Slug Validation (e2e)', () => {
  let app: INestApplication;
  let prisma: PrismaService;
  let authToken: string;
  let testUserId: string;
  let testPostId: string;

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

    // Create test user with blog permissions
    const hashedPassword = '$2b$10$test.hash.for.testing.purposes.only';
    const blogRole = await prisma.userRole.findFirst({
      where: {
        rolePermissions: {
          some: {
            permission: {
              name: 'blog:write',
            },
          },
        },
      },
    });

    const testUser = await prisma.user.create({
      data: {
        email: 'slug-test@example.com',
        name: 'Slug Test User',
        password: hashedPassword,
        roleId: blogRole?.id || (await prisma.userRole.findFirst())?.id || '',
      },
    });

    testUserId = testUser.id;

    // Login to get auth token
    const loginResponse = await request(app.getHttpServer())
      .post('/auth/login')
      .send({
        email: 'slug-test@example.com',
        password: 'Test123!',
      });

    authToken = loginResponse.body.accessToken;

    // Create a test blog post
    const testPost = await prisma.blogPost.create({
      data: {
        title: 'Test Post',
        slug: 'test-post',
        content: 'Test content',
        status: 'DRAFT',
        authorId: testUserId,
      },
    });

    testPostId = testPost.id;
  });

  afterAll(async () => {
    // Cleanup
    await prisma.blogPost.deleteMany({
      where: { authorId: testUserId },
    });
    await prisma.user.delete({
      where: { id: testUserId },
    });

    await app.close();
  });

  describe('GET /blog/validate-slug/:slug', () => {
    it('should return available for unused slug', async () => {
      const response = await request(app.getHttpServer())
        .get('/blog/validate-slug/unique-slug-12345')
        .set('Authorization', `Bearer ${authToken}`)
        .expect(200);

      expect(response.body).toMatchObject({
        available: true,
        slug: 'unique-slug-12345',
        message: 'Slug is available',
      });
    });

    it('should return unavailable for taken slug', async () => {
      const response = await request(app.getHttpServer())
        .get('/blog/validate-slug/test-post')
        .set('Authorization', `Bearer ${authToken}`)
        .expect(200);

      expect(response.body).toMatchObject({
        available: false,
        slug: 'test-post',
      });
      expect(response.body.message).toContain('already in use');
      expect(response.body.existingPost).toBeDefined();
      expect(response.body.existingPost.title).toBe('Test Post');
      expect(response.body.suggestions).toBeDefined();
      expect(Array.isArray(response.body.suggestions)).toBe(true);
    });

    it('should allow slug for excluded post', async () => {
      const response = await request(app.getHttpServer())
        .get(`/blog/validate-slug/test-post?excludeId=${testPostId}`)
        .set('Authorization', `Bearer ${authToken}`)
        .expect(200);

      expect(response.body).toMatchObject({
        available: true,
        slug: 'test-post',
        message: 'Slug is available',
      });
    });

    it('should require authentication', async () => {
      await request(app.getHttpServer())
        .get('/blog/validate-slug/test-slug')
        .expect(401);
    });

    it('should require blog:write permission', async () => {
      // Create user without blog permissions
      const noPermUser = await prisma.user.create({
        data: {
          email: 'no-perm@example.com',
          name: 'No Permission User',
          password: '$2b$10$test.hash',
          roleId: (await prisma.userRole.findFirst({ where: { name: 'User' } }))
            ?.id || '',
        },
      });

      const loginResponse = await request(app.getHttpServer())
        .post('/auth/login')
        .send({
          email: 'no-perm@example.com',
          password: 'Test123!',
        });

      await request(app.getHttpServer())
        .get('/blog/validate-slug/test-slug')
        .set('Authorization', `Bearer ${loginResponse.body.accessToken}`)
        .expect(403);

      // Cleanup
      await prisma.user.delete({ where: { id: noPermUser.id } });
    });

    it('should provide multiple suggestions', async () => {
      // Create posts with sequential slugs
      await prisma.blogPost.create({
        data: {
          title: 'Popular Post 1',
          slug: 'popular-post-1',
          content: 'Content',
          status: 'DRAFT',
          authorId: testUserId,
        },
      });

      const response = await request(app.getHttpServer())
        .get('/blog/validate-slug/test-post')
        .set('Authorization', `Bearer ${authToken}`)
        .expect(200);

      expect(response.body.suggestions).toBeDefined();
      expect(response.body.suggestions.length).toBeGreaterThan(0);
      expect(response.body.suggestions.length).toBeLessThanOrEqual(3);
    });
  });

  describe('POST /blog/generate-slug', () => {
    it('should generate slug from title', async () => {
      const response = await request(app.getHttpServer())
        .post('/blog/generate-slug')
        .set('Authorization', `Bearer ${authToken}`)
        .send({ title: 'My New Blog Post' })
        .expect(201);

      expect(response.body).toMatchObject({
        slug: 'my-new-blog-post',
        isUnique: true,
      });
    });

    it('should generate unique slug for taken title', async () => {
      const response = await request(app.getHttpServer())
        .post('/blog/generate-slug')
        .set('Authorization', `Bearer ${authToken}`)
        .send({ title: 'Test Post' })
        .expect(201);

      expect(response.body.slug).toMatch(/^test-post-\d+$/);
      expect(response.body.isUnique).toBe(false);
    });

    it('should handle special characters in title', async () => {
      const response = await request(app.getHttpServer())
        .post('/blog/generate-slug')
        .set('Authorization', `Bearer ${authToken}`)
        .send({ title: 'Hello! World? #2024' })
        .expect(201);

      expect(response.body.slug).toBe('hello-world-2024');
    });

    it('should allow slug for excluded post', async () => {
      const response = await request(app.getHttpServer())
        .post('/blog/generate-slug')
        .set('Authorization', `Bearer ${authToken}`)
        .send({ title: 'Test Post', excludeId: testPostId })
        .expect(201);

      expect(response.body).toMatchObject({
        slug: 'test-post',
        isUnique: true,
      });
    });

    it('should require authentication', async () => {
      await request(app.getHttpServer())
        .post('/blog/generate-slug')
        .send({ title: 'Test' })
        .expect(401);
    });

    it('should require blog:write permission', async () => {
      const noPermUser = await prisma.user.create({
        data: {
          email: 'no-perm-2@example.com',
          name: 'No Permission User 2',
          password: '$2b$10$test.hash',
          roleId: (await prisma.userRole.findFirst({ where: { name: 'User' } }))
            ?.id || '',
        },
      });

      const loginResponse = await request(app.getHttpServer())
        .post('/auth/login')
        .send({
          email: 'no-perm-2@example.com',
          password: 'Test123!',
        });

      await request(app.getHttpServer())
        .post('/blog/generate-slug')
        .set('Authorization', `Bearer ${loginResponse.body.accessToken}`)
        .send({ title: 'Test' })
        .expect(403);

      await prisma.user.delete({ where: { id: noPermUser.id } });
    });

    it('should validate request body', async () => {
      await request(app.getHttpServer())
        .post('/blog/generate-slug')
        .set('Authorization', `Bearer ${authToken}`)
        .send({})
        .expect(400);
    });
  });

  describe('Slug conflict handling in create/update', () => {
    it('should auto-generate unique slug on create', async () => {
      const response = await request(app.getHttpServer())
        .post('/blog')
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          title: 'Test Post', // Same as existing
          content: 'New content',
          status: 'DRAFT',
        })
        .expect(201);

      expect(response.body.slug).toMatch(/^test-post-\d+$/);
      expect(response.body.slug).not.toBe('test-post');
    });

    it('should reject duplicate slug on update', async () => {
      // Create another post
      const anotherPost = await prisma.blogPost.create({
        data: {
          title: 'Another Post',
          slug: 'another-post',
          content: 'Content',
          status: 'DRAFT',
          authorId: testUserId,
        },
      });

      // Try to update with existing slug
      const response = await request(app.getHttpServer())
        .patch(`/blog/${anotherPost.id}`)
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          slug: 'test-post', // Existing slug
        })
        .expect(409);

      expect(response.body.message).toContain('already in use');
    });

    it('should allow keeping same slug on update', async () => {
      const response = await request(app.getHttpServer())
        .patch(`/blog/${testPostId}`)
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          title: 'Updated Test Post',
          slug: 'test-post', // Same slug
        })
        .expect(200);

      expect(response.body.slug).toBe('test-post');
    });
  });
});
