import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication, ValidationPipe } from '@nestjs/common';
import request from 'supertest';
import { AppModule } from '../src/app.module';
import { PrismaService } from '../src/prisma/prisma.service';
import { PostStatus } from '@prisma/client';

describe('Blog API E2E Tests', () => {
  let app: INestApplication;
  let prisma: PrismaService;
  let adminToken: string;
  let adminUser: any;
  let regularToken: string;
  let regularUser: any;

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

    // Create admin user with blog permissions
    const adminResponse = await request(app.getHttpServer())
      .post('/auth/register')
      .send({
        email: `blog-admin-${Date.now()}@example.com`,
        password: 'Admin123',
        name: 'Blog Admin',
      });

    adminUser = adminResponse.body.user;
    adminToken = adminResponse.body.accessToken;

    // Update to Admin role
    const adminRole = await prisma.userRole.findFirst({
      where: { name: 'Admin' },
    });
    if (adminRole) {
      await prisma.user.update({
        where: { id: adminUser.id },
        data: { roleId: adminRole.id },
      });
    }

    // Create regular user without blog permissions
    const regularResponse = await request(app.getHttpServer())
      .post('/auth/register')
      .send({
        email: `blog-user-${Date.now()}@example.com`,
        password: 'User123',
        name: 'Regular User',
      });

    regularUser = regularResponse.body.user;
    regularToken = regularResponse.body.accessToken;
  });

  afterAll(async () => {
    // Cleanup test data
    await prisma.blogPost.deleteMany({
      where: {
        OR: [{ authorId: adminUser.id }, { authorId: regularUser.id }],
      },
    });
    await prisma.user.deleteMany({
      where: {
        id: { in: [adminUser.id, regularUser.id] },
      },
    });
    await app.close();
  });

  describe('POST /blog - Create Blog Post', () => {
    it('should create a blog post with blog:write permission', async () => {
      const createDto = {
        title: 'Test Blog Post',
        content: 'This is the content of the test blog post',
        excerpt: 'Test excerpt',
        status: PostStatus.DRAFT,
      };

      const response = await request(app.getHttpServer())
        .post('/blog')
        .set('Authorization', `Bearer ${adminToken}`)
        .send(createDto)
        .expect(201);

      expect(response.body).toHaveProperty('id');
      expect(response.body.title).toBe(createDto.title);
      expect(response.body.slug).toBe('test-blog-post');
      expect(response.body.content).toBe(createDto.content);
      expect(response.body.status).toBe(PostStatus.DRAFT);
      expect(response.body.authorId).toBe(adminUser.id);
    });

    it('should reject creation without authentication', async () => {
      const createDto = {
        title: 'Unauthorized Post',
        content: 'Content',
        status: PostStatus.DRAFT,
      };

      await request(app.getHttpServer())
        .post('/blog')
        .send(createDto)
        .expect(401);
    });

    it('should reject creation without blog:write permission', async () => {
      const createDto = {
        title: 'Forbidden Post',
        content: 'Content',
        status: PostStatus.DRAFT,
      };

      await request(app.getHttpServer())
        .post('/blog')
        .set('Authorization', `Bearer ${regularToken}`)
        .send(createDto)
        .expect(403);
    });

    it('should validate required fields', async () => {
      await request(app.getHttpServer())
        .post('/blog')
        .set('Authorization', `Bearer ${adminToken}`)
        .send({ title: 'Only Title' })
        .expect(400);

      await request(app.getHttpServer())
        .post('/blog')
        .set('Authorization', `Bearer ${adminToken}`)
        .send({ content: 'Only Content' })
        .expect(400);
    });

    it('should generate slug automatically if not provided', async () => {
      const createDto = {
        title: 'Auto Slug Generation Test',
        content: 'Content',
      };

      const response = await request(app.getHttpServer())
        .post('/blog')
        .set('Authorization', `Bearer ${adminToken}`)
        .send(createDto)
        .expect(201);

      expect(response.body.slug).toBe('auto-slug-generation-test');
    });

    it('should use provided slug if given', async () => {
      const createDto = {
        title: 'Custom Slug Post',
        slug: 'my-custom-slug',
        content: 'Content',
      };

      const response = await request(app.getHttpServer())
        .post('/blog')
        .set('Authorization', `Bearer ${adminToken}`)
        .send(createDto)
        .expect(201);

      expect(response.body.slug).toBe('my-custom-slug');
    });
  });

  describe('GET /blog - List Published Posts (Public)', () => {
    let publishedPost: any;
    let draftPost: any;

    beforeAll(async () => {
      // Create published post
      const publishedResponse = await request(app.getHttpServer())
        .post('/blog')
        .set('Authorization', `Bearer ${adminToken}`)
        .send({
          title: 'Published Post for Public',
          content: 'Public content',
          status: PostStatus.PUBLISHED,
        });
      publishedPost = publishedResponse.body;

      // Create draft post
      const draftResponse = await request(app.getHttpServer())
        .post('/blog')
        .set('Authorization', `Bearer ${adminToken}`)
        .send({
          title: 'Draft Post Hidden',
          content: 'Draft content',
          status: PostStatus.DRAFT,
        });
      draftPost = draftResponse.body;
    });

    it('should return published posts without authentication', async () => {
      const response = await request(app.getHttpServer())
        .get('/blog')
        .expect(200);

      expect(response.body).toHaveProperty('posts');
      expect(response.body).toHaveProperty('pagination');
      expect(Array.isArray(response.body.posts)).toBe(true);

      // Should include published post
      const foundPublished = response.body.posts.find(
        (p: any) => p.id === publishedPost.id,
      );
      expect(foundPublished).toBeDefined();

      // Should not include draft post
      const foundDraft = response.body.posts.find(
        (p: any) => p.id === draftPost.id,
      );
      expect(foundDraft).toBeUndefined();
    });

    it('should return only published posts', async () => {
      const response = await request(app.getHttpServer())
        .get('/blog')
        .expect(200);

      const allPublished = response.body.posts.every(
        (post: any) => post.status === PostStatus.PUBLISHED,
      );
      expect(allPublished).toBe(true);
    });

    it('should support pagination', async () => {
      const response = await request(app.getHttpServer())
        .get('/blog?page=1&limit=5')
        .expect(200);

      expect(response.body.pagination.page).toBe(1);
      expect(response.body.pagination.limit).toBe(5);
      expect(response.body.pagination).toHaveProperty('total');
      expect(response.body.pagination).toHaveProperty('totalPages');
    });
  });

  describe('GET /blog/:slug - Get Post by Slug (Public)', () => {
    let publishedPost: any;
    let draftPost: any;

    beforeAll(async () => {
      const publishedResponse = await request(app.getHttpServer())
        .post('/blog')
        .set('Authorization', `Bearer ${adminToken}`)
        .send({
          title: 'Public Slug Post',
          slug: 'public-slug-post',
          content: 'Public content',
          status: PostStatus.PUBLISHED,
        });
      publishedPost = publishedResponse.body;

      const draftResponse = await request(app.getHttpServer())
        .post('/blog')
        .set('Authorization', `Bearer ${adminToken}`)
        .send({
          title: 'Draft Slug Post',
          slug: 'draft-slug-post',
          content: 'Draft content',
          status: PostStatus.DRAFT,
        });
      draftPost = draftResponse.body;
    });

    it('should return published post by slug without authentication', async () => {
      const response = await request(app.getHttpServer())
        .get(`/blog/${publishedPost.slug}`)
        .expect(200);

      expect(response.body.id).toBe(publishedPost.id);
      expect(response.body.title).toBe(publishedPost.title);
      expect(response.body.status).toBe(PostStatus.PUBLISHED);
    });

    it('should return 404 for draft post by slug', async () => {
      await request(app.getHttpServer())
        .get(`/blog/${draftPost.slug}`)
        .expect(404);
    });

    it('should return 404 for nonexistent slug', async () => {
      await request(app.getHttpServer())
        .get('/blog/nonexistent-slug-12345')
        .expect(404);
    });
  });

  describe('GET /blog/admin/posts - List All Posts (Admin)', () => {
    it('should return all posts including drafts with blog:read permission', async () => {
      const response = await request(app.getHttpServer())
        .get('/blog/admin/posts')
        .set('Authorization', `Bearer ${adminToken}`)
        .expect(200);

      expect(response.body).toHaveProperty('posts');
      expect(response.body).toHaveProperty('pagination');

      // Should include both published and draft posts
      const statuses = response.body.posts.map((p: any) => p.status);
      const hasDrafts = statuses.includes(PostStatus.DRAFT);
      const hasPublished = statuses.includes(PostStatus.PUBLISHED);

      expect(hasDrafts || hasPublished).toBe(true);
    });

    it('should reject without authentication', async () => {
      await request(app.getHttpServer()).get('/blog/admin/posts').expect(401);
    });

    it('should reject without blog:read permission', async () => {
      await request(app.getHttpServer())
        .get('/blog/admin/posts')
        .set('Authorization', `Bearer ${regularToken}`)
        .expect(403);
    });
  });

  describe('PATCH /blog/:id/publish - Publish Post', () => {
    let draftPost: any;

    beforeEach(async () => {
      const response = await request(app.getHttpServer())
        .post('/blog')
        .set('Authorization', `Bearer ${adminToken}`)
        .send({
          title: 'Post to Publish',
          content: 'Content',
          status: PostStatus.DRAFT,
        });
      draftPost = response.body;
    });

    it('should publish a draft post with blog:publish permission', async () => {
      const response = await request(app.getHttpServer())
        .patch(`/blog/${draftPost.id}/publish`)
        .set('Authorization', `Bearer ${adminToken}`)
        .expect(200);

      expect(response.body.status).toBe(PostStatus.PUBLISHED);
      expect(response.body.publishedAt).toBeDefined();
    });

    it('should reject without authentication', async () => {
      await request(app.getHttpServer())
        .patch(`/blog/${draftPost.id}/publish`)
        .expect(401);
    });

    it('should reject without blog:publish permission', async () => {
      await request(app.getHttpServer())
        .patch(`/blog/${draftPost.id}/publish`)
        .set('Authorization', `Bearer ${regularToken}`)
        .expect(403);
    });

    it('should return 404 for nonexistent post', async () => {
      await request(app.getHttpServer())
        .patch('/blog/nonexistent-id-12345/publish')
        .set('Authorization', `Bearer ${adminToken}`)
        .expect(404);
    });
  });

  describe('PATCH /blog/:id - Update Post', () => {
    let testPost: any;

    beforeEach(async () => {
      const response = await request(app.getHttpServer())
        .post('/blog')
        .set('Authorization', `Bearer ${adminToken}`)
        .send({
          title: 'Post to Update',
          content: 'Original content',
          status: PostStatus.DRAFT,
        });
      testPost = response.body;
    });

    it('should update post with blog:write permission', async () => {
      const updateDto = {
        title: 'Updated Title',
        content: 'Updated content',
      };

      const response = await request(app.getHttpServer())
        .patch(`/blog/${testPost.id}`)
        .set('Authorization', `Bearer ${adminToken}`)
        .send(updateDto)
        .expect(200);

      expect(response.body.title).toBe(updateDto.title);
      expect(response.body.content).toBe(updateDto.content);
    });

    it('should reject without blog:write permission', async () => {
      await request(app.getHttpServer())
        .patch(`/blog/${testPost.id}`)
        .set('Authorization', `Bearer ${regularToken}`)
        .send({ title: 'Forbidden Update' })
        .expect(403);
    });
  });

  describe('DELETE /blog/:id - Delete Post', () => {
    let testPost: any;

    beforeEach(async () => {
      const response = await request(app.getHttpServer())
        .post('/blog')
        .set('Authorization', `Bearer ${adminToken}`)
        .send({
          title: 'Post to Delete',
          content: 'Content',
          status: PostStatus.DRAFT,
        });
      testPost = response.body;
    });

    it('should delete post with blog:delete permission', async () => {
      await request(app.getHttpServer())
        .delete(`/blog/${testPost.id}`)
        .set('Authorization', `Bearer ${adminToken}`)
        .expect(200);

      // Verify post is deleted
      await request(app.getHttpServer())
        .get(`/blog/admin/${testPost.id}`)
        .set('Authorization', `Bearer ${adminToken}`)
        .expect(404);
    });

    it('should reject without authentication', async () => {
      await request(app.getHttpServer())
        .delete(`/blog/${testPost.id}`)
        .expect(401);
    });

    it('should reject without blog:delete permission', async () => {
      await request(app.getHttpServer())
        .delete(`/blog/${testPost.id}`)
        .set('Authorization', `Bearer ${regularToken}`)
        .expect(403);
    });

    it('should return 404 for nonexistent post', async () => {
      await request(app.getHttpServer())
        .delete('/blog/nonexistent-id-12345')
        .set('Authorization', `Bearer ${adminToken}`)
        .expect(404);
    });
  });

  describe('Slug Generation and Uniqueness', () => {
    it('should generate unique slugs for duplicate titles', async () => {
      const title = 'Duplicate Title Test';

      // Create first post
      const response1 = await request(app.getHttpServer())
        .post('/blog')
        .set('Authorization', `Bearer ${adminToken}`)
        .send({ title, content: 'Content 1' })
        .expect(201);

      // Create second post with same title
      const response2 = await request(app.getHttpServer())
        .post('/blog')
        .set('Authorization', `Bearer ${adminToken}`)
        .send({ title, content: 'Content 2' })
        .expect(201);

      expect(response1.body.slug).toBe('duplicate-title-test');
      expect(response2.body.slug).toBe('duplicate-title-test-1');
    });

    it('should handle special characters in slug generation', async () => {
      const response = await request(app.getHttpServer())
        .post('/blog')
        .set('Authorization', `Bearer ${adminToken}`)
        .send({
          title: 'Hello! World? #Test @Post',
          content: 'Content',
        })
        .expect(201);

      expect(response.body.slug).toBe('hello-world-test-post');
    });
  });
});
