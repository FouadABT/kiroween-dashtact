import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication, ValidationPipe } from '@nestjs/common';
import * as request from 'supertest';
import { AppModule } from '../src/app.module';
import { PrismaService } from '../src/prisma/prisma.service';

describe('Blog Create (e2e)', () => {
  let app: INestApplication;
  let prisma: PrismaService;
  let authToken: string;
  let userId: string;

  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleFixture.createNestApplication();
    app.useGlobalPipes(new ValidationPipe({ whitelist: true }));
    await app.init();

    prisma = app.get<PrismaService>(PrismaService);

    // Create test user and get auth token
    const registerResponse = await request(app.getHttpServer())
      .post('/auth/register')
      .send({
        email: 'blogtest@example.com',
        password: 'Test1234!',
        name: 'Blog Test User',
      });

    authToken = registerResponse.body.accessToken;
    userId = registerResponse.body.user.id;

    // Give user blog permissions
    const adminRole = await prisma.userRole.findUnique({
      where: { name: 'Admin' },
    });

    if (adminRole) {
      await prisma.user.update({
        where: { id: userId },
        data: { roleId: adminRole.id },
      });
    }
  });

  afterAll(async () => {
    // Clean up test data
    await prisma.blogPost.deleteMany({
      where: { authorId: userId },
    });
    await prisma.user.deleteMany({
      where: { email: 'blogtest@example.com' },
    });
    await app.close();
  });

  describe('POST /blog', () => {
    it('should create a blog post with auto-generated slug', async () => {
      const response = await request(app.getHttpServer())
        .post('/blog')
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          title: 'My First Blog Post',
          content: 'This is the content of my first blog post.',
          excerpt: 'A short excerpt',
          status: 'DRAFT',
        })
        .expect(201);

      expect(response.body).toHaveProperty('id');
      expect(response.body.title).toBe('My First Blog Post');
      expect(response.body.slug).toBe('my-first-blog-post');
      expect(response.body.content).toBe('This is the content of my first blog post.');
      expect(response.body.status).toBe('DRAFT');
    });

    it('should create a blog post with custom slug', async () => {
      const response = await request(app.getHttpServer())
        .post('/blog')
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          title: 'Another Blog Post',
          slug: 'custom-slug-here',
          content: 'Content with custom slug.',
          status: 'DRAFT',
        })
        .expect(201);

      expect(response.body.slug).toBe('custom-slug-here');
      expect(response.body.title).toBe('Another Blog Post');
    });

    it('should ensure slug uniqueness by appending number', async () => {
      // Create first post
      await request(app.getHttpServer())
        .post('/blog')
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          title: 'Duplicate Title',
          content: 'First post',
          status: 'DRAFT',
        })
        .expect(201);

      // Create second post with same title
      const response = await request(app.getHttpServer())
        .post('/blog')
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          title: 'Duplicate Title',
          content: 'Second post',
          status: 'DRAFT',
        })
        .expect(201);

      expect(response.body.slug).toBe('duplicate-title-1');
    });

    it('should validate slug max length (200 chars)', async () => {
      const longSlug = 'a'.repeat(201);

      await request(app.getHttpServer())
        .post('/blog')
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          title: 'Test Post',
          slug: longSlug,
          content: 'Content',
          status: 'DRAFT',
        })
        .expect(400);
    });

    it('should accept slug with exactly 200 chars', async () => {
      const maxSlug = 'a'.repeat(200);

      const response = await request(app.getHttpServer())
        .post('/blog')
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          title: 'Test Post',
          slug: maxSlug,
          content: 'Content',
          status: 'DRAFT',
        })
        .expect(201);

      expect(response.body.slug).toBe(maxSlug);
    });

    it('should handle special characters in custom slug', async () => {
      const response = await request(app.getHttpServer())
        .post('/blog')
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          title: 'Test Post',
          slug: 'my-custom-slug-123',
          content: 'Content',
          status: 'DRAFT',
        })
        .expect(201);

      expect(response.body.slug).toBe('my-custom-slug-123');
    });

    it('should require authentication', async () => {
      await request(app.getHttpServer())
        .post('/blog')
        .send({
          title: 'Unauthorized Post',
          content: 'Content',
        })
        .expect(401);
    });

    it('should require blog:write permission', async () => {
      // Create user without blog permissions
      const userResponse = await request(app.getHttpServer())
        .post('/auth/register')
        .send({
          email: 'noperm@example.com',
          password: 'Test1234!',
          name: 'No Permission User',
        });

      const userToken = userResponse.body.accessToken;

      await request(app.getHttpServer())
        .post('/blog')
        .set('Authorization', `Bearer ${userToken}`)
        .send({
          title: 'Forbidden Post',
          content: 'Content',
        })
        .expect(403);

      // Clean up
      await prisma.user.deleteMany({
        where: { email: 'noperm@example.com' },
      });
    });

    it('should validate required fields', async () => {
      // Missing title
      await request(app.getHttpServer())
        .post('/blog')
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          content: 'Content without title',
        })
        .expect(400);

      // Missing content
      await request(app.getHttpServer())
        .post('/blog')
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          title: 'Title without content',
        })
        .expect(400);
    });

    it('should create post with all optional fields', async () => {
      const response = await request(app.getHttpServer())
        .post('/blog')
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          title: 'Complete Post',
          slug: 'complete-post',
          excerpt: 'This is an excerpt',
          content: 'Full content here',
          featuredImage: '/images/featured.jpg',
          status: 'PUBLISHED',
          metaTitle: 'SEO Title',
          metaDescription: 'SEO Description',
        })
        .expect(201);

      expect(response.body.slug).toBe('complete-post');
      expect(response.body.excerpt).toBe('This is an excerpt');
      expect(response.body.featuredImage).toBe('/images/featured.jpg');
      expect(response.body.status).toBe('PUBLISHED');
      expect(response.body.metaTitle).toBe('SEO Title');
      expect(response.body.metaDescription).toBe('SEO Description');
      expect(response.body.publishedAt).toBeTruthy();
    });
  });
});
