import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication, ValidationPipe } from '@nestjs/common';
import * as request from 'supertest';
import { AppModule } from '../src/app.module';
import { PrismaService } from '../src/prisma/prisma.service';

describe('Blog Excerpt Preview (e2e)', () => {
  let app: INestApplication;
  let prisma: PrismaService;
  let authToken: string;
  let testUserId: string;

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

    // Create test user with blog:write permission
    const adminRole = await prisma.userRole.findUnique({
      where: { name: 'Admin' },
    });

    const testUser = await prisma.user.create({
      data: {
        email: 'excerpt-test@example.com',
        password: '$2b$10$abcdefghijklmnopqrstuvwxyz123456', // hashed password
        name: 'Excerpt Test User',
        roleId: adminRole.id,
      },
    });

    testUserId = testUser.id;

    // Login to get auth token
    const loginResponse = await request(app.getHttpServer())
      .post('/auth/login')
      .send({
        email: 'excerpt-test@example.com',
        password: 'password123',
      });

    authToken = loginResponse.body.accessToken;
  });

  afterAll(async () => {
    // Cleanup test user
    await prisma.user.delete({ where: { id: testUserId } }).catch(() => {});
    await app.close();
  });

  describe('POST /blog/preview-excerpt', () => {
    it('should generate excerpt from plain text content', () => {
      return request(app.getHttpServer())
        .post('/blog/preview-excerpt')
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          content: 'This is a simple test content for excerpt generation. It should be truncated at the appropriate length.',
        })
        .expect(201)
        .expect((res) => {
          expect(res.body).toHaveProperty('excerpt');
          expect(res.body).toHaveProperty('wordCount');
          expect(res.body).toHaveProperty('characterCount');
          expect(typeof res.body.excerpt).toBe('string');
          expect(res.body.excerpt.length).toBeLessThanOrEqual(200);
        });
    });

    it('should generate excerpt with custom maxLength', () => {
      return request(app.getHttpServer())
        .post('/blog/preview-excerpt')
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          content: 'This is a test content that will be truncated to a custom length.',
          maxLength: 50,
        })
        .expect(201)
        .expect((res) => {
          expect(res.body.excerpt.length).toBeLessThanOrEqual(50);
        });
    });

    it('should strip HTML tags from content', () => {
      return request(app.getHttpServer())
        .post('/blog/preview-excerpt')
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          content: '<p>This is <strong>HTML</strong> content with <em>tags</em>.</p>',
          maxLength: 100,
        })
        .expect(201)
        .expect((res) => {
          expect(res.body.excerpt).not.toContain('<p>');
          expect(res.body.excerpt).not.toContain('<strong>');
          expect(res.body.excerpt).not.toContain('<em>');
          expect(res.body.excerpt).toContain('HTML');
          expect(res.body.excerpt).toContain('tags');
        });
    });

    it('should strip markdown formatting', () => {
      return request(app.getHttpServer())
        .post('/blog/preview-excerpt')
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          content: '# Heading\n\nThis is **bold** and *italic* text with [links](http://example.com).',
          maxLength: 150,
        })
        .expect(201)
        .expect((res) => {
          expect(res.body.excerpt).not.toContain('**');
          expect(res.body.excerpt).not.toContain('*');
          expect(res.body.excerpt).not.toContain('[');
          expect(res.body.excerpt).not.toContain(']');
          expect(res.body.excerpt).toContain('bold');
          expect(res.body.excerpt).toContain('italic');
        });
    });

    it('should handle very long content', () => {
      const longContent = 'Lorem ipsum dolor sit amet. '.repeat(100);
      return request(app.getHttpServer())
        .post('/blog/preview-excerpt')
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          content: longContent,
          maxLength: 200,
        })
        .expect(201)
        .expect((res) => {
          expect(res.body.excerpt.length).toBeLessThanOrEqual(200);
          expect(res.body.characterCount).toBeGreaterThan(200);
        });
    });

    it('should handle short content without truncation', () => {
      return request(app.getHttpServer())
        .post('/blog/preview-excerpt')
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          content: 'Short content.',
          maxLength: 200,
        })
        .expect(201)
        .expect((res) => {
          expect(res.body.excerpt).toBe('Short content.');
          expect(res.body.excerpt.length).toBeLessThan(200);
        });
    });

    it('should fail validation when content is missing', () => {
      return request(app.getHttpServer())
        .post('/blog/preview-excerpt')
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          maxLength: 150,
        })
        .expect(400)
        .expect((res) => {
          expect(res.body.message).toContain('content');
        });
    });

    it('should fail validation when content is empty', () => {
      return request(app.getHttpServer())
        .post('/blog/preview-excerpt')
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          content: '',
          maxLength: 150,
        })
        .expect(400)
        .expect((res) => {
          expect(res.body.message).toContain('content');
        });
    });

    it('should fail validation when maxLength is below minimum (50)', () => {
      return request(app.getHttpServer())
        .post('/blog/preview-excerpt')
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          content: 'Test content',
          maxLength: 30,
        })
        .expect(400)
        .expect((res) => {
          expect(res.body.message).toContain('maxLength');
        });
    });

    it('should fail validation when maxLength is above maximum (500)', () => {
      return request(app.getHttpServer())
        .post('/blog/preview-excerpt')
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          content: 'Test content',
          maxLength: 600,
        })
        .expect(400)
        .expect((res) => {
          expect(res.body.message).toContain('maxLength');
        });
    });

    it('should fail validation when maxLength is not an integer', () => {
      return request(app.getHttpServer())
        .post('/blog/preview-excerpt')
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          content: 'Test content',
          maxLength: 150.5,
        })
        .expect(400);
    });

    it('should require authentication', () => {
      return request(app.getHttpServer())
        .post('/blog/preview-excerpt')
        .send({
          content: 'Test content',
        })
        .expect(401);
    });

    it('should require blog:write permission', async () => {
      // Create user without blog:write permission
      const userRole = await prisma.userRole.findUnique({
        where: { name: 'User' },
      });

      const limitedUser = await prisma.user.create({
        data: {
          email: 'limited-excerpt@example.com',
          password: '$2b$10$abcdefghijklmnopqrstuvwxyz123456',
          name: 'Limited User',
          roleId: userRole.id,
        },
      });

      const loginResponse = await request(app.getHttpServer())
        .post('/auth/login')
        .send({
          email: 'limited-excerpt@example.com',
          password: 'password123',
        });

      const limitedToken = loginResponse.body.accessToken;

      await request(app.getHttpServer())
        .post('/blog/preview-excerpt')
        .set('Authorization', `Bearer ${limitedToken}`)
        .send({
          content: 'Test content',
        })
        .expect(403);

      // Cleanup
      await prisma.user.delete({ where: { id: limitedUser.id } });
    });

    it('should handle content with multiple paragraphs', () => {
      return request(app.getHttpServer())
        .post('/blog/preview-excerpt')
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          content: 'First paragraph.\n\nSecond paragraph.\n\nThird paragraph.',
          maxLength: 100,
        })
        .expect(201)
        .expect((res) => {
          expect(res.body.excerpt).toBeTruthy();
          expect(res.body.excerpt.length).toBeLessThanOrEqual(100);
        });
    });

    it('should handle content with special characters', () => {
      return request(app.getHttpServer())
        .post('/blog/preview-excerpt')
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          content: 'Content with special chars: @#$%^&*()_+-=[]{}|;:,.<>?/~`',
          maxLength: 150,
        })
        .expect(201)
        .expect((res) => {
          expect(res.body.excerpt).toBeTruthy();
        });
    });

    it('should handle content with unicode characters', () => {
      return request(app.getHttpServer())
        .post('/blog/preview-excerpt')
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          content: 'Content with unicode: 你好世界 🌍 café résumé',
          maxLength: 150,
        })
        .expect(201)
        .expect((res) => {
          expect(res.body.excerpt).toBeTruthy();
          expect(res.body.excerpt).toContain('你好世界');
        });
    });

    it('should use default maxLength when not provided', () => {
      return request(app.getHttpServer())
        .post('/blog/preview-excerpt')
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          content: 'A'.repeat(500),
        })
        .expect(201)
        .expect((res) => {
          expect(res.body.excerpt.length).toBeLessThanOrEqual(200); // Default is 200
        });
    });
  });
});
