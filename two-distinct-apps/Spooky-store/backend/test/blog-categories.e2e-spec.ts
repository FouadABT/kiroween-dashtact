import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication, ValidationPipe } from '@nestjs/common';
import * as request from 'supertest';
import { AppModule } from '../src/app.module';
import { PrismaService } from '../src/prisma/prisma.service';

describe('Blog Categories (e2e)', () => {
  let app: INestApplication;
  let prisma: PrismaService;
  let authToken: string;
  let adminUser: any;
  let testCategoryId: string;

  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleFixture.createNestApplication();
    app.useGlobalPipes(new ValidationPipe({ whitelist: true, transform: true }));
    await app.init();

    prisma = app.get<PrismaService>(PrismaService);

    // Create admin user with blog permissions
    const adminRole = await prisma.userRole.findUnique({
      where: { name: 'Admin' },
    });

    adminUser = await prisma.user.create({
      data: {
        email: 'blog-category-admin@test.com',
        name: 'Blog Category Admin',
        password: '$2b$10$abcdefghijklmnopqrstuvwxyz123456', // hashed password
        roleId: adminRole.id,
      },
    });

    // Login to get token
    const loginResponse = await request(app.getHttpServer())
      .post('/auth/login')
      .send({
        email: 'blog-category-admin@test.com',
        password: 'Test123!@#',
      });

    authToken = loginResponse.body.accessToken;
  });

  afterAll(async () => {
    // Cleanup
    if (testCategoryId) {
      await prisma.blogCategory.deleteMany({
        where: { id: testCategoryId },
      });
    }
    await prisma.user.deleteMany({
      where: { email: 'blog-category-admin@test.com' },
    });
    await app.close();
  });

  describe('POST /blog/categories', () => {
    it('should create a new category with all fields', async () => {
      const createDto = {
        name: 'Technology',
        slug: 'technology',
        description: 'Articles about technology and innovation',
      };

      const response = await request(app.getHttpServer())
        .post('/blog/categories')
        .set('Authorization', `Bearer ${authToken}`)
        .send(createDto)
        .expect(201);

      expect(response.body).toHaveProperty('id');
      expect(response.body.name).toBe(createDto.name);
      expect(response.body.slug).toBe(createDto.slug);
      expect(response.body.description).toBe(createDto.description);
      expect(response.body).toHaveProperty('createdAt');

      testCategoryId = response.body.id;
    });

    it('should create a category with auto-generated slug', async () => {
      const createDto = {
        name: 'Web Development',
        description: 'Web development tutorials',
      };

      const response = await request(app.getHttpServer())
        .post('/blog/categories')
        .set('Authorization', `Bearer ${authToken}`)
        .send(createDto)
        .expect(201);

      expect(response.body.slug).toBe('web-development');

      // Cleanup
      await prisma.blogCategory.delete({ where: { id: response.body.id } });
    });

    it('should fail without authentication', async () => {
      const createDto = {
        name: 'Test Category',
      };

      await request(app.getHttpServer())
        .post('/blog/categories')
        .send(createDto)
        .expect(401);
    });

    it('should fail with invalid data (name too long)', async () => {
      const createDto = {
        name: 'A'.repeat(101), // Exceeds 100 char limit
      };

      await request(app.getHttpServer())
        .post('/blog/categories')
        .set('Authorization', `Bearer ${authToken}`)
        .send(createDto)
        .expect(400);
    });

    it('should fail with empty name', async () => {
      const createDto = {
        name: '',
      };

      await request(app.getHttpServer())
        .post('/blog/categories')
        .set('Authorization', `Bearer ${authToken}`)
        .send(createDto)
        .expect(400);
    });

    it('should fail with duplicate slug', async () => {
      const createDto = {
        name: 'Technology Duplicate',
        slug: 'technology', // Already exists
      };

      await request(app.getHttpServer())
        .post('/blog/categories')
        .set('Authorization', `Bearer ${authToken}`)
        .send(createDto)
        .expect(409);
    });
  });

  describe('GET /blog/categories', () => {
    it('should return all categories', async () => {
      const response = await request(app.getHttpServer())
        .get('/blog/categories')
        .expect(200);

      expect(Array.isArray(response.body)).toBe(true);
      expect(response.body.length).toBeGreaterThan(0);
      expect(response.body[0]).toHaveProperty('id');
      expect(response.body[0]).toHaveProperty('name');
      expect(response.body[0]).toHaveProperty('slug');
    });

    it('should include post count', async () => {
      const response = await request(app.getHttpServer())
        .get('/blog/categories')
        .expect(200);

      expect(response.body[0]).toHaveProperty('_count');
      expect(response.body[0]._count).toHaveProperty('posts');
    });
  });

  describe('GET /blog/categories/:id', () => {
    it('should return a single category', async () => {
      const response = await request(app.getHttpServer())
        .get(`/blog/categories/${testCategoryId}`)
        .expect(200);

      expect(response.body.id).toBe(testCategoryId);
      expect(response.body.name).toBe('Technology');
    });

    it('should return 404 for non-existent category', async () => {
      await request(app.getHttpServer())
        .get('/blog/categories/non-existent-id')
        .expect(404);
    });
  });

  describe('PATCH /blog/categories/:id', () => {
    it('should update category name', async () => {
      const updateDto = {
        name: 'Technology & Innovation',
      };

      const response = await request(app.getHttpServer())
        .patch(`/blog/categories/${testCategoryId}`)
        .set('Authorization', `Bearer ${authToken}`)
        .send(updateDto)
        .expect(200);

      expect(response.body.name).toBe(updateDto.name);
    });

    it('should update category description', async () => {
      const updateDto = {
        description: 'Updated description about technology',
      };

      const response = await request(app.getHttpServer())
        .patch(`/blog/categories/${testCategoryId}`)
        .set('Authorization', `Bearer ${authToken}`)
        .send(updateDto)
        .expect(200);

      expect(response.body.description).toBe(updateDto.description);
    });

    it('should fail without authentication', async () => {
      const updateDto = {
        name: 'Updated Name',
      };

      await request(app.getHttpServer())
        .patch(`/blog/categories/${testCategoryId}`)
        .send(updateDto)
        .expect(401);
    });

    it('should fail with invalid data', async () => {
      const updateDto = {
        name: 'A'.repeat(101),
      };

      await request(app.getHttpServer())
        .patch(`/blog/categories/${testCategoryId}`)
        .set('Authorization', `Bearer ${authToken}`)
        .send(updateDto)
        .expect(400);
    });
  });

  describe('DELETE /blog/categories/:id', () => {
    it('should delete a category', async () => {
      // Create a category to delete
      const category = await prisma.blogCategory.create({
        data: {
          name: 'To Delete',
          slug: 'to-delete',
        },
      });

      await request(app.getHttpServer())
        .delete(`/blog/categories/${category.id}`)
        .set('Authorization', `Bearer ${authToken}`)
        .expect(200);

      // Verify deletion
      const deleted = await prisma.blogCategory.findUnique({
        where: { id: category.id },
      });
      expect(deleted).toBeNull();
    });

    it('should fail to delete category with posts', async () => {
      // This test assumes the category has posts
      // Implementation depends on your business logic
    });

    it('should fail without authentication', async () => {
      await request(app.getHttpServer())
        .delete(`/blog/categories/${testCategoryId}`)
        .expect(401);
    });

    it('should return 404 for non-existent category', async () => {
      await request(app.getHttpServer())
        .delete('/blog/categories/non-existent-id')
        .set('Authorization', `Bearer ${authToken}`)
        .expect(404);
    });
  });
});
