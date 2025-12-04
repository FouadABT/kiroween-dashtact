import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication, ValidationPipe } from '@nestjs/common';
import * as request from 'supertest';
import { AppModule } from '../src/app.module';
import { PrismaService } from '../src/prisma/prisma.service';

describe('Landing Page Keywords Sync (E2E)', () => {
  let app: INestApplication;
  let prisma: PrismaService;

  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleFixture.createNestApplication();
    app.useGlobalPipes(new ValidationPipe({ transform: true }));
    await app.init();

    prisma = moduleFixture.get<PrismaService>(PrismaService);
  });

  afterAll(async () => {
    await app.close();
  });

  describe('Keywords Array Validation', () => {
    it('should accept keywords as string array in global settings', async () => {
      const updateDto = {
        seo: {
          title: 'Test Page',
          description: 'Test description',
          keywords: ['dashboard', 'admin', 'management'],
          ogImage: '/og-image.png',
          ogTitle: 'Test OG Title',
          ogDescription: 'Test OG Description',
          twitterCard: 'summary_large_image',
          structuredData: true,
        },
      };

      const response = await request(app.getHttpServer())
        .put('/landing/settings')
        .send(updateDto)
        .expect(200);

      expect(response.body.seo.keywords).toEqual(['dashboard', 'admin', 'management']);
      expect(Array.isArray(response.body.seo.keywords)).toBe(true);
    });

    it('should reject keywords if not an array', async () => {
      const invalidDto = {
        seo: {
          title: 'Test Page',
          description: 'Test description',
          keywords: 'dashboard, admin, management', // String instead of array
          ogImage: '/og-image.png',
        },
      };

      await request(app.getHttpServer())
        .put('/landing/settings')
        .send(invalidDto)
        .expect(400);
    });

    it('should reject keywords array with non-string elements', async () => {
      const invalidDto = {
        seo: {
          title: 'Test Page',
          description: 'Test description',
          keywords: ['dashboard', 123, 'admin'], // Number in array
          ogImage: '/og-image.png',
        },
      };

      await request(app.getHttpServer())
        .put('/landing/settings')
        .send(invalidDto)
        .expect(400);
    });

    it('should accept empty keywords array', async () => {
      const updateDto = {
        seo: {
          title: 'Test Page',
          description: 'Test description',
          keywords: [],
          ogImage: '/og-image.png',
        },
      };

      const response = await request(app.getHttpServer())
        .put('/landing/settings')
        .send(updateDto)
        .expect(200);

      expect(response.body.seo.keywords).toEqual([]);
    });

    it('should persist keywords array to database', async () => {
      const keywords = ['nextjs', 'dashboard', 'typescript'];
      const updateDto = {
        seo: {
          title: 'Persistence Test',
          description: 'Test persistence',
          keywords,
          ogImage: '/og-image.png',
        },
      };

      await request(app.getHttpServer())
        .put('/landing/settings')
        .send(updateDto)
        .expect(200);

      // Verify in database
      const content = await prisma.landingPageContent.findFirst({
        where: { isActive: true },
      });

      expect((content?.settings as any)?.seo?.keywords).toEqual(keywords);
    });

    it('should handle keywords with special characters', async () => {
      const keywords = ['dashboard-app', 'admin_panel', 'user@management'];
      const updateDto = {
        seo: {
          title: 'Special Chars Test',
          description: 'Test special characters',
          keywords,
          ogImage: '/og-image.png',
        },
      };

      const response = await request(app.getHttpServer())
        .put('/landing/settings')
        .send(updateDto)
        .expect(200);

      expect(response.body.seo.keywords).toEqual(keywords);
    });

    it('should handle keywords with unicode characters', async () => {
      const keywords = ['仪表板', 'tableau de bord', 'панель управления'];
      const updateDto = {
        seo: {
          title: 'Unicode Test',
          description: 'Test unicode characters',
          keywords,
          ogImage: '/og-image.png',
        },
      };

      const response = await request(app.getHttpServer())
        .put('/landing/settings')
        .send(updateDto)
        .expect(200);

      expect(response.body.seo.keywords).toEqual(keywords);
    });

    it('should handle large keywords array', async () => {
      const keywords = Array.from({ length: 50 }, (_, i) => `keyword-${i}`);
      const updateDto = {
        seo: {
          title: 'Large Array Test',
          description: 'Test large array',
          keywords,
          ogImage: '/og-image.png',
        },
      };

      const response = await request(app.getHttpServer())
        .put('/landing/settings')
        .send(updateDto)
        .expect(200);

      expect(response.body.seo.keywords).toHaveLength(50);
      expect(response.body.seo.keywords).toEqual(keywords);
    });

    it('should maintain keywords when updating other seo fields', async () => {
      const keywords = ['dashboard', 'admin'];
      const initialDto = {
        seo: {
          title: 'Initial Title',
          description: 'Initial description',
          keywords,
          ogImage: '/og-image.png',
        },
      };

      await request(app.getHttpServer())
        .put('/landing/settings')
        .send(initialDto)
        .expect(200);

      // Update only title
      const updateDto = {
        seo: {
          title: 'Updated Title',
          description: 'Initial description',
          keywords,
          ogImage: '/og-image.png',
        },
      };

      const response = await request(app.getHttpServer())
        .put('/landing/settings')
        .send(updateDto)
        .expect(200);

      expect(response.body.seo.keywords).toEqual(keywords);
      expect(response.body.seo.title).toBe('Updated Title');
    });
  });

  describe('Type Consistency', () => {
    it('should have matching types between DTO and database', async () => {
      const keywords = ['test1', 'test2', 'test3'];
      const updateDto = {
        seo: {
          title: 'Type Test',
          description: 'Type consistency test',
          keywords,
          ogImage: '/og-image.png',
        },
      };

      const apiResponse = await request(app.getHttpServer())
        .put('/landing/settings')
        .send(updateDto)
        .expect(200);

      // Verify API response type
      expect(Array.isArray(apiResponse.body.seo.keywords)).toBe(true);
      expect(apiResponse.body.seo.keywords.every((k: any) => typeof k === 'string')).toBe(true);

      // Verify database type
      const dbContent = await prisma.landingPageContent.findFirst({
        where: { isActive: true },
      });

      const dbKeywords = (dbContent?.settings as any)?.seo?.keywords;
      expect(Array.isArray(dbKeywords)).toBe(true);
      expect(dbKeywords.every((k: any) => typeof k === 'string')).toBe(true);
    });
  });
});
