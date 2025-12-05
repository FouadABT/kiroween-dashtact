import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication, ValidationPipe } from '@nestjs/common';
import * as request from 'supertest';
import { AppModule } from '../src/app.module';
import { PrismaService } from '../src/prisma/prisma.service';

describe('Blog Tags (e2e)', () => {
  let app: INestApplication;
  let prisma: PrismaService;
  let authToken: string;
  let adminUser: any;
  let testTagId: string;

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
        email: 'blog-tag-admin@test.com',
        name: 'Blog Tag Admin',
        password: '$2b$10$abcdefghijklmnopqrstuvwxyz123456',
        roleId: adminRole.id,
      },
    });

    // Login to get token
    const loginResponse = await request(app.getHttpServer())
      .post('/auth/login')
      .send({
        email: 'blog-tag-admin@test.com',
        password: 'Test123!@#',
      });

    authToken = loginResponse.body.accessToken;
  });

  afterAll(async () => {
    // Cleanup
    if (testTagId) {
      await prisma.blogTag.deleteMany({
        where: { id: testTagId },
      });
    }
    await prisma.user.deleteMany({
      where: { email: 'blog-tag-admin@test.com' },
    });
    await app.close();
  });

  describe('POST /blog/tags', () => {
    it('should create a new tag with all fields', async () => {
      const createDto = {
        name: 'JavaScript',
        slug: 'javascript',
      };

      const response = await request(app.getHttpServer())
        .post('/blog/tags')
        .set('Authorization', `Bearer ${authToken}`)
        .send(createDto)
        .expect(201);

      expect(response.body).toHaveProperty('id');
      expect(response.body.name).toBe(createDto.name);
      expect(response.body.slug).toBe(createDto.slug);
      expect(response.body).toHaveProperty('createdAt');

      testTagId = response.body.id;
    });

    it('should create a tag with auto-generated slug', async () => {
      const createDto = {
        name: 'React Hooks',
      };

      const response = await request(app.getHttpServer())
        .post('/blog/tags')
        .set('Authorization', `Bearer ${authToken}`)
        .send(createDto)
        .expect(201);

      expect(response.body.slug).toBe('react-hooks');

      // Cleanup
      await prisma.blogTag.delete({ where: { id: response.body.id } });
    });

    it('should fail without authentication', async () => {
      const createDto = {
        name: 'Test Tag',
      };

      await request(app.getHttpServer())
        .post('/blog/tags')
        .send(createDto)
        .expect(401);
    });

    it('should fail with invalid data (name too long)', async () => {
      const createDto = {
        name: 'A'.repeat(101),
      };

      await request(app.getHttpServer())
        .post('/blog/tags')
        .set('Authorization', `Bearer ${authToken}`)
        .send(createDto)
        .expect(400);
    });

    it('should fail with empty name', async () => {
      const createDto = {
        name: '',
      };

      await request(app.getHttpServer())
        .post('/blog/tags')
        .set('Authorization', `Bearer ${authToken}`)
        .send(createDto)
        .expect(400);
    });

    it('should fail with duplicate slug', async () => {
      const createDto = {
        name: 'JavaScript Duplicate',
        slug: 'javascript',
      };

      await request(app.getHttpServer())
        .post('/blog/tags')
        .set('Authorization', `Bearer ${authToken}`)
        .send(createDto)
        .expect(409);
    });
  });

  describe('GET /blog/tags', () => {
    it('should return all tags', async () => {
      const response = await request(app.getHttpServer())
        .get('/blog/tags')
        .expect(200);

      expect(Array.isArray(response.body)).toBe(true);
      expect(response.body.length).toBeGreaterThan(0);
      expect(response.body[0]).toHaveProperty('id');
      expect(response.body[0]).toHaveProperty('name');
      expect(response.body[0]).toHaveProperty('slug');
    });

    it('should include post count', async () => {
      const response = await request(app.getHttpServer())
        .get('/blog/tags')
        .expect(200);

      expect(response.body[0]).toHaveProperty('_count');
      expect(response.body[0]._count).toHaveProperty('posts');
    });
  });

  describe('GET /blog/tags/:id', () => {
    it('should return a single tag', async () => {
      const response = await request(app.getHttpServer())
        .get(`/blog/tags/${testTagId}`)
        .expect(200);

      expect(response.body.id).toBe(testTagId);
      expect(response.body.name).toBe('JavaScript');
    });

    it('should return 404 for non-existent tag', async () => {
      await request(app.getHttpServer())
        .get('/blog/tags/non-existent-id')
        .expect(404);
    });
  });

  describe('PATCH /blog/tags/:id', () => {
    it('should update tag name', async () => {
      const updateDto = {
        name: 'JavaScript ES6+',
      };

      const response = await request(app.getHttpServer())
        .patch(`/blog/tags/${testTagId}`)
        .set('Authorization', `Bearer ${authToken}`)
        .send(updateDto)
        .expect(200);

      expect(response.body.name).toBe(updateDto.name);
    });

    it('should fail without authentication', async () => {
      const updateDto = {
        name: 'Updated Name',
      };

      await request(app.getHttpServer())
        .patch(`/blog/tags/${testTagId}`)
        .send(updateDto)
        .expect(401);
    });

    it('should fail with invalid data', async () => {
      const updateDto = {
        name: 'A'.repeat(101),
      };

      await request(app.getHttpServer())
        .patch(`/blog/tags/${testTagId}`)
        .set('Authorization', `Bearer ${authToken}`)
        .send(updateDto)
        .expect(400);
    });
  });

  describe('DELETE /blog/tags/:id', () => {
    it('should delete a tag', async () => {
      const tag = await prisma.blogTag.create({
        data: {
          name: 'To Delete',
          slug: 'to-delete',
        },
      });

      await request(app.getHttpServer())
        .delete(`/blog/tags/${tag.id}`)
        .set('Authorization', `Bearer ${authToken}`)
        .expect(200);

      const deleted = await prisma.blogTag.findUnique({
        where: { id: tag.id },
      });
      expect(deleted).toBeNull();
    });

    it('should fail without authentication', async () => {
      await request(app.getHttpServer())
        .delete(`/blog/tags/${testTagId}`)
        .expect(401);
    });

    it('should return 404 for non-existent tag', async () => {
      await request(app.getHttpServer())
        .delete('/blog/tags/non-existent-id')
        .set('Authorization', `Bearer ${authToken}`)
        .expect(404);
    });
  });
});
