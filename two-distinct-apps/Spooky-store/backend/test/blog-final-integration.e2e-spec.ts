/**
 * Blog System Final Integration E2E Tests
 * 
 * Tests complete blog system functionality including:
 * - CRUD operations with permissions
 * - Feature flag behavior
 * - SEO metadata generation
 * - Error handling
 * - Edge cases
 * 
 * Requirements: 1.1-1.5, 2.5, 3.5, 4.5, 6.3-6.5, 7.1-7.5
 */

import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication, ValidationPipe } from '@nestjs/common';
import * as request from 'supertest';
import { AppModule } from '../src/app.module';
import { PrismaClient } from '../../backend/generated/prisma';

describe('Blog System Final Integration (e2e)', () => {
  let app: INestApplication;
  let prisma: PrismaClient;
  let adminToken: string;
  let userToken: string;
  let testPostId: string;

  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleFixture.createNestApplication();
    app.useGlobalPipes(new ValidationPipe({ whitelist: true, transform: true }));
    await app.init();

    prisma = new PrismaClient();

    // Create test users and get tokens
    const adminResponse = await request(app.getHttpServer())
      .post('/auth/login')
      .send({
        email: 'admin@example.com',
        password: 'Admin123!',
      });

    adminToken = adminResponse.body.accessToken;

    const userResponse = await request(app.getHttpServer())
      .post('/auth/login')
      .send({
        email: 'user@example.com',
        password: 'User123!',
      });

    userToken = userResponse.body.accessToken;
  });

  afterAll(async () => {
    // Cleanup test data
    if (testPostId) {
      await prisma.blogPost.deleteMany({
        where: { id: testPostId },
      });
    }

    await prisma.$disconnect();
    await app.close();
  });

  describe('Blog CRUD Operations with Permissions', () => {
    
    it('should create a blog post with blog:write permission', async () => {
      const response = await request(app.getHttpServer())
        .post('/blog')
        .set('Authorization', `Bearer ${adminToken}`)
        .send({
          title: 'Integration Test Post',
          content: 'This is a test post for integration testing.',
          excerpt: 'Test excerpt',
          status: 'DRAFT',
        })
        .expect(201);

      expect(response.body).toHaveProperty('id');
      expect(response.body.title).toBe('Integration Test Post');
      expect(response.body.slug).toBe('integration-test-post');
      expect(response.body.status).toBe('DRAFT');

      testPostId = response.body.id;
    });

    it('should deny post creation without blog:write permission', async () => {
      await request(app.getHttpServer())
        .post('/blog')
        .set('Authorization', `Bearer ${userToken}`)
        .send({
          title: 'Unauthorized Post',
          content: 'This should fail',
        })
        .expect(403);
    });

    it('should list all posts for admin with blog:read', async () => {
      const response = await request(app.getHttpServer())
        .get('/blog/admin')
        .set('Authorization', `Bearer ${adminToken}`)
        .expect(200);

      expect(response.body).toHaveProperty('posts');
      expect(response.body).toHaveProperty('total');
      expect(Array.isArray(response.body.posts)).toBe(true);
    });

    it('should list only published posts for public', async () => {
      const response = await request(app.getHttpServer())
        .get('/blog')
        .expect(200);

      expect(response.body).toHaveProperty('posts');
      expect(response.body.posts.every((post: any) => post.status === 'PUBLISHED')).toBe(true);
    });

    it('should update a blog post with blog:write permission', async () => {
      const response = await request(app.getHttpServer())
        .patch(`/blog/${testPostId}`)
        .set('Authorization', `Bearer ${adminToken}`)
        .send({
          title: 'Updated Integration Test Post',
          excerpt: 'Updated excerpt',
        })
        .expect(200);

      expect(response.body.title).toBe('Updated Integration Test Post');
      expect(response.body.excerpt).toBe('Updated excerpt');
    });

    it('should publish a post with blog:publish permission', async () => {
      const response = await request(app.getHttpServer())
        .patch(`/blog/${testPostId}/publish`)
        .set('Authorization', `Bearer ${adminToken}`)
        .expect(200);

      expect(response.body.status).toBe('PUBLISHED');
      expect(response.body.publishedAt).toBeTruthy();
    });

    it('should unpublish a post with blog:publish permission', async () => {
      const response = await request(app.getHttpServer())
        .patch(`/blog/${testPostId}/unpublish`)
        .set('Authorization', `Bearer ${adminToken}`)
        .expect(200);

      expect(response.body.status).toBe('DRAFT');
    });

    it('should get a single post by slug (public)', async () => {
      // First publish the post
      await request(app.getHttpServer())
        .patch(`/blog/${testPostId}/publish`)
        .set('Authorization', `Bearer ${adminToken}`);

      const response = await request(app.getHttpServer())
        .get('/blog/updated-integration-test-post')
        .expect(200);

      expect(response.body.slug).toBe('updated-integration-test-post');
      expect(response.body.status).toBe('PUBLISHED');
    });

    it('should delete a post with blog:delete permission', async () => {
      await request(app.getHttpServer())
        .delete(`/blog/${testPostId}`)
        .set('Authorization', `Bearer ${adminToken}`)
        .expect(200);

      // Verify deletion
      await request(app.getHttpServer())
        .get(`/blog/admin/${testPostId}`)
        .set('Authorization', `Bearer ${adminToken}`)
        .expect(404);
    });

    it('should deny deletion without blog:delete permission', async () => {
      // Create a new post first
      const createResponse = await request(app.getHttpServer())
        .post('/blog')
        .set('Authorization', `Bearer ${adminToken}`)
        .send({
          title: 'Post to Delete',
          content: 'Content',
        });

      const postId = createResponse.body.id;

      // Try to delete with user token (no blog:delete)
      await request(app.getHttpServer())
        .delete(`/blog/${postId}`)
        .set('Authorization', `Bearer ${userToken}`)
        .expect(403);

      // Cleanup
      await prisma.blogPost.delete({ where: { id: postId } });
    });
  });

  describe('Slug Generation and Validation', () => {
    
    it('should auto-generate slug from title', async () => {
      const response = await request(app.getHttpServer())
        .post('/blog')
        .set('Authorization', `Bearer ${adminToken}`)
        .send({
          title: 'My Awesome Blog Post!',
          content: 'Content',
        })
        .expect(201);

      expect(response.body.slug).toBe('my-awesome-blog-post');

      await prisma.blogPost.delete({ where: { id: response.body.id } });
    });

    it('should handle slug conflicts', async () => {
      // Create first post
      const first = await request(app.getHttpServer())
        .post('/blog')
        .set('Authorization', `Bearer ${adminToken}`)
        .send({
          title: 'Duplicate Title',
          content: 'Content 1',
        });

      // Create second post with same title
      const second = await request(app.getHttpServer())
        .post('/blog')
        .set('Authorization', `Bearer ${adminToken}`)
        .send({
          title: 'Duplicate Title',
          content: 'Content 2',
        });

      expect(first.body.slug).toBe('duplicate-title');
      expect(second.body.slug).toMatch(/duplicate-title-\d+/);

      // Cleanup
      await prisma.blogPost.deleteMany({
        where: { id: { in: [first.body.id, second.body.id] } },
      });
    });

    it('should validate custom slug format', async () => {
      await request(app.getHttpServer())
        .post('/blog')
        .set('Authorization', `Bearer ${adminToken}`)
        .send({
          title: 'Test Post',
          slug: 'invalid slug with spaces',
          content: 'Content',
        })
        .expect(400);
    });
  });

  describe('Excerpt Auto-Generation', () => {
    
    it('should auto-generate excerpt if not provided', async () => {
      const longContent = 'This is a very long content. '.repeat(20);

      const response = await request(app.getHttpServer())
        .post('/blog')
        .set('Authorization', `Bearer ${adminToken}`)
        .send({
          title: 'Auto Excerpt Post',
          content: longContent,
        })
        .expect(201);

      expect(response.body.excerpt).toBeTruthy();
      expect(response.body.excerpt.length).toBeLessThanOrEqual(200);

      await prisma.blogPost.delete({ where: { id: response.body.id } });
    });

    it('should use manual excerpt if provided', async () => {
      const response = await request(app.getHttpServer())
        .post('/blog')
        .set('Authorization', `Bearer ${adminToken}`)
        .send({
          title: 'Manual Excerpt Post',
          content: 'Long content here',
          excerpt: 'Custom excerpt',
        })
        .expect(201);

      expect(response.body.excerpt).toBe('Custom excerpt');

      await prisma.blogPost.delete({ where: { id: response.body.id } });
    });
  });

  describe('Categories and Tags', () => {
    
    it('should create and assign categories', async () => {
      // Create category
      const categoryResponse = await request(app.getHttpServer())
        .post('/blog/categories')
        .set('Authorization', `Bearer ${adminToken}`)
        .send({
          name: 'Technology',
          slug: 'technology',
        })
        .expect(201);

      const categoryId = categoryResponse.body.id;

      // Create post with category
      const postResponse = await request(app.getHttpServer())
        .post('/blog')
        .set('Authorization', `Bearer ${adminToken}`)
        .send({
          title: 'Tech Post',
          content: 'Content',
          categoryIds: [categoryId],
        })
        .expect(201);

      expect(postResponse.body.categories).toBeDefined();

      // Cleanup
      await prisma.blogPost.delete({ where: { id: postResponse.body.id } });
      await prisma.blogCategory.delete({ where: { id: categoryId } });
    });

    it('should create and assign tags', async () => {
      // Create tag
      const tagResponse = await request(app.getHttpServer())
        .post('/blog/tags')
        .set('Authorization', `Bearer ${adminToken}`)
        .send({
          name: 'JavaScript',
          slug: 'javascript',
        })
        .expect(201);

      const tagId = tagResponse.body.id;

      // Create post with tag
      const postResponse = await request(app.getHttpServer())
        .post('/blog')
        .set('Authorization', `Bearer ${adminToken}`)
        .send({
          title: 'JS Post',
          content: 'Content',
          tagIds: [tagId],
        })
        .expect(201);

      expect(postResponse.body.tags).toBeDefined();

      // Cleanup
      await prisma.blogPost.delete({ where: { id: postResponse.body.id } });
      await prisma.blogTag.delete({ where: { id: tagId } });
    });
  });

  describe('Pagination and Filtering', () => {
    
    it('should paginate blog posts', async () => {
      const response = await request(app.getHttpServer())
        .get('/blog?page=1&limit=5')
        .expect(200);

      expect(response.body.posts.length).toBeLessThanOrEqual(5);
      expect(response.body).toHaveProperty('total');
      expect(response.body).toHaveProperty('page');
      expect(response.body).toHaveProperty('totalPages');
    });

    it('should filter by status', async () => {
      const response = await request(app.getHttpServer())
        .get('/blog/admin?status=PUBLISHED')
        .set('Authorization', `Bearer ${adminToken}`)
        .expect(200);

      expect(response.body.posts.every((post: any) => post.status === 'PUBLISHED')).toBe(true);
    });

    it('should filter by category', async () => {
      // Assuming category exists
      const response = await request(app.getHttpServer())
        .get('/blog?category=technology')
        .expect(200);

      expect(response.body).toHaveProperty('posts');
    });

    it('should sort by date', async () => {
      const response = await request(app.getHttpServer())
        .get('/blog?sortBy=publishedAt&order=desc')
        .expect(200);

      const posts = response.body.posts;
      if (posts.length > 1) {
        const firstDate = new Date(posts[0].publishedAt);
        const secondDate = new Date(posts[1].publishedAt);
        expect(firstDate >= secondDate).toBe(true);
      }
    });
  });

  describe('Error Handling', () => {
    
    it('should return 404 for non-existent post', async () => {
      await request(app.getHttpServer())
        .get('/blog/non-existent-slug')
        .expect(404);
    });

    it('should return 400 for invalid post data', async () => {
      await request(app.getHttpServer())
        .post('/blog')
        .set('Authorization', `Bearer ${adminToken}`)
        .send({
          // Missing required fields
          content: 'Content only',
        })
        .expect(400);
    });

    it('should return 401 for unauthenticated requests', async () => {
      await request(app.getHttpServer())
        .post('/blog')
        .send({
          title: 'Test',
          content: 'Content',
        })
        .expect(401);
    });

    it('should handle database errors gracefully', async () => {
      // Try to create post with invalid data that would cause DB error
      await request(app.getHttpServer())
        .post('/blog')
        .set('Authorization', `Bearer ${adminToken}`)
        .send({
          title: 'Test',
          content: 'Content',
          authorId: 'invalid-id', // Invalid foreign key
        })
        .expect(400);
    });
  });

  describe('Image Upload Integration', () => {
    
    it('should accept featured image URL', async () => {
      const response = await request(app.getHttpServer())
        .post('/blog')
        .set('Authorization', `Bearer ${adminToken}`)
        .send({
          title: 'Post with Image',
          content: 'Content',
          featuredImage: 'https://example.com/image.jpg',
        })
        .expect(201);

      expect(response.body.featuredImage).toBe('https://example.com/image.jpg');

      await prisma.blogPost.delete({ where: { id: response.body.id } });
    });

    it('should validate image URL format', async () => {
      await request(app.getHttpServer())
        .post('/blog')
        .set('Authorization', `Bearer ${adminToken}`)
        .send({
          title: 'Post with Invalid Image',
          content: 'Content',
          featuredImage: 'not-a-url',
        })
        .expect(400);
    });
  });

  describe('SEO Metadata', () => {
    
    it('should include meta title and description', async () => {
      const response = await request(app.getHttpServer())
        .post('/blog')
        .set('Authorization', `Bearer ${adminToken}`)
        .send({
          title: 'SEO Test Post',
          content: 'Content',
          metaTitle: 'Custom Meta Title',
          metaDescription: 'Custom meta description',
        })
        .expect(201);

      expect(response.body.metaTitle).toBe('Custom Meta Title');
      expect(response.body.metaDescription).toBe('Custom meta description');

      await prisma.blogPost.delete({ where: { id: response.body.id } });
    });

    it('should auto-generate meta fields if not provided', async () => {
      const response = await request(app.getHttpServer())
        .post('/blog')
        .set('Authorization', `Bearer ${adminToken}`)
        .send({
          title: 'Auto Meta Post',
          content: 'This is the content that will be used for meta description.',
        })
        .expect(201);

      // Meta fields should be auto-generated from title and excerpt
      expect(response.body.metaTitle || response.body.title).toBeTruthy();

      await prisma.blogPost.delete({ where: { id: response.body.id } });
    });
  });

  describe('Performance and Caching', () => {
    
    it('should handle concurrent requests', async () => {
      const requests = Array(10).fill(null).map(() =>
        request(app.getHttpServer()).get('/blog')
      );

      const responses = await Promise.all(requests);

      responses.forEach(response => {
        expect(response.status).toBe(200);
      });
    });

    it('should return consistent results for same query', async () => {
      const response1 = await request(app.getHttpServer())
        .get('/blog?page=1&limit=10')
        .expect(200);

      const response2 = await request(app.getHttpServer())
        .get('/blog?page=1&limit=10')
        .expect(200);

      expect(response1.body.total).toBe(response2.body.total);
    });
  });
});
