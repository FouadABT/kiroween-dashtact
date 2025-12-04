import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication, ValidationPipe } from '@nestjs/common';
import request from 'supertest';
import { AppModule } from '../src/app.module';
import { PrismaService } from '../src/prisma/prisma.service';
import { LegalPageType } from '@prisma/client';

describe('Legal Pages (e2e)', () => {
  let app: INestApplication;
  let prisma: PrismaService;
  let authToken: string;
  let superAdminUser: any;
  let termsPageId: string;
  let privacyPageId: string;

  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleFixture.createNestApplication();
    app.useGlobalPipes(new ValidationPipe({ whitelist: true, transform: true }));
    await app.init();

    prisma = moduleFixture.get<PrismaService>(PrismaService);

    // Create super admin user for testing
    const superAdminRole = await prisma.userRole.findUnique({
      where: { name: 'Super Admin' },
    });

    superAdminUser = await prisma.user.create({
      data: {
        email: 'superadmin-legal-test@example.com',
        name: 'Super Admin Legal Test',
        password: 'hashedpassword',
        roleId: superAdminRole!.id,
      },
    });

    // Mock auth token (in real app, this would come from login)
    authToken = 'mock-super-admin-token';
  });

  afterAll(async () => {
    // Cleanup
    if (termsPageId) {
      await prisma.legalPage.deleteMany({
        where: { id: termsPageId },
      });
    }
    if (privacyPageId) {
      await prisma.legalPage.deleteMany({
        where: { id: privacyPageId },
      });
    }
    await prisma.user.delete({
      where: { id: superAdminUser.id },
    });
    await app.close();
  });

  describe('/legal-pages (POST)', () => {
    it('should create a terms of service page', () => {
      return request(app.getHttpServer())
        .post('/legal-pages')
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          pageType: LegalPageType.TERMS,
          content: '# Terms of Service\n\nTest terms content',
        })
        .expect(201)
        .expect((res) => {
          expect(res.body).toHaveProperty('id');
          expect(res.body.pageType).toBe(LegalPageType.TERMS);
          expect(res.body.content).toContain('Test terms content');
          termsPageId = res.body.id;
        });
    });

    it('should create a privacy policy page', () => {
      return request(app.getHttpServer())
        .post('/legal-pages')
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          pageType: LegalPageType.PRIVACY,
          content: '# Privacy Policy\n\nTest privacy content',
        })
        .expect(201)
        .expect((res) => {
          expect(res.body).toHaveProperty('id');
          expect(res.body.pageType).toBe(LegalPageType.PRIVACY);
          expect(res.body.content).toContain('Test privacy content');
          privacyPageId = res.body.id;
        });
    });

    it('should reject duplicate page type', () => {
      return request(app.getHttpServer())
        .post('/legal-pages')
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          pageType: LegalPageType.TERMS,
          content: 'Duplicate terms',
        })
        .expect(409);
    });

    it('should reject invalid page type', () => {
      return request(app.getHttpServer())
        .post('/legal-pages')
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          pageType: 'INVALID',
          content: 'Test content',
        })
        .expect(400);
    });

    it('should reject missing content', () => {
      return request(app.getHttpServer())
        .post('/legal-pages')
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          pageType: LegalPageType.TERMS,
        })
        .expect(400);
    });
  });

  describe('/legal-pages (GET)', () => {
    it('should return all legal pages (public)', () => {
      return request(app.getHttpServer())
        .get('/legal-pages')
        .expect(200)
        .expect((res) => {
          expect(Array.isArray(res.body)).toBe(true);
          expect(res.body.length).toBeGreaterThanOrEqual(2);
        });
    });
  });

  describe('/legal-pages/type/:pageType (GET)', () => {
    it('should return terms page by type (public)', () => {
      return request(app.getHttpServer())
        .get(`/legal-pages/type/${LegalPageType.TERMS}`)
        .expect(200)
        .expect((res) => {
          expect(res.body.pageType).toBe(LegalPageType.TERMS);
          expect(res.body.content).toContain('Test terms content');
        });
    });

    it('should return privacy page by type (public)', () => {
      return request(app.getHttpServer())
        .get(`/legal-pages/type/${LegalPageType.PRIVACY}`)
        .expect(200)
        .expect((res) => {
          expect(res.body.pageType).toBe(LegalPageType.PRIVACY);
          expect(res.body.content).toContain('Test privacy content');
        });
    });

    it('should return 404 for non-existent page type', () => {
      return request(app.getHttpServer())
        .get('/legal-pages/type/NONEXISTENT')
        .expect(404);
    });
  });

  describe('/legal-pages/:id (GET)', () => {
    it('should return legal page by ID (public)', async () => {
      return request(app.getHttpServer())
        .get(`/legal-pages/${termsPageId}`)
        .expect(200)
        .expect((res) => {
          expect(res.body.id).toBe(termsPageId);
          expect(res.body.pageType).toBe(LegalPageType.TERMS);
        });
    });

    it('should return 404 for non-existent ID', () => {
      return request(app.getHttpServer())
        .get('/legal-pages/non-existent-id')
        .expect(404);
    });
  });

  describe('/legal-pages/:id (PATCH)', () => {
    it('should update legal page by ID', () => {
      return request(app.getHttpServer())
        .patch(`/legal-pages/${termsPageId}`)
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          content: '# Updated Terms of Service\n\nUpdated content',
        })
        .expect(200)
        .expect((res) => {
          expect(res.body.id).toBe(termsPageId);
          expect(res.body.content).toContain('Updated content');
        });
    });

    it('should return 404 for non-existent ID', () => {
      return request(app.getHttpServer())
        .patch('/legal-pages/non-existent-id')
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          content: 'Updated content',
        })
        .expect(404);
    });
  });

  describe('/legal-pages/type/:pageType (PATCH)', () => {
    it('should update legal page by type', () => {
      return request(app.getHttpServer())
        .patch(`/legal-pages/type/${LegalPageType.PRIVACY}`)
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          content: '# Updated Privacy Policy\n\nUpdated privacy content',
        })
        .expect(200)
        .expect((res) => {
          expect(res.body.pageType).toBe(LegalPageType.PRIVACY);
          expect(res.body.content).toContain('Updated privacy content');
        });
    });

    it('should return 404 for non-existent page type', () => {
      return request(app.getHttpServer())
        .patch('/legal-pages/type/NONEXISTENT')
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          content: 'Updated content',
        })
        .expect(404);
    });
  });

  describe('/legal-pages/:id (DELETE)', () => {
    it('should delete legal page', async () => {
      // Create a temporary page to delete
      const tempPage = await prisma.legalPage.create({
        data: {
          pageType: 'TERMS' as any,
          content: 'Temporary content',
        },
      });

      return request(app.getHttpServer())
        .delete(`/legal-pages/${tempPage.id}`)
        .set('Authorization', `Bearer ${authToken}`)
        .expect(200)
        .expect((res) => {
          expect(res.body.id).toBe(tempPage.id);
        });
    });

    it('should return 404 for non-existent ID', () => {
      return request(app.getHttpServer())
        .delete('/legal-pages/non-existent-id')
        .set('Authorization', `Bearer ${authToken}`)
        .expect(404);
    });
  });
});
