import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication, ValidationPipe } from '@nestjs/common';
import * as request from 'supertest';
import { AppModule } from '../src/app.module';
import { PrismaService } from '../src/prisma/prisma.service';

describe('Landing Page - Products Section (E2E)', () => {
  let app: INestApplication;
  let prisma: PrismaService;
  let authToken: string;
  let userId: string;

  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleFixture.createNestApplication();
    app.useGlobalPipes(new ValidationPipe());
    await app.init();

    prisma = moduleFixture.get<PrismaService>(PrismaService);

    // Create test user and get auth token
    const registerRes = await request(app.getHttpServer())
      .post('/auth/register')
      .send({
        email: `test-products-${Date.now()}@example.com`,
        password: 'TestPassword123!',
        name: 'Test User',
      });

    authToken = registerRes.body.accessToken;
    userId = registerRes.body.user.id;
  });

  afterAll(async () => {
    await app.close();
  });

  describe('Products Section Data DTO Validation', () => {
    it('should accept all optional fields', async () => {
      const productsSectionData = {
        title: 'Featured Products',
        subtitle: 'Check out our latest products',
        layout: 'grid',
        columns: 3,
        productCount: 9,
        filterByCategory: 'electronics',
        filterByTag: 'featured',
        showPrice: true,
        showRating: true,
        showStock: true,
        ctaText: 'View Product',
      };

      const response = await request(app.getHttpServer())
        .put('/landing/content')
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          sections: [
            {
              id: 'products-1',
              type: 'products',
              enabled: true,
              order: 1,
              data: productsSectionData,
            },
          ],
        });

      expect(response.status).toBe(200);
      expect(response.body.sections[0].data).toMatchObject(productsSectionData);
    });

    it('should accept minimal products section with only title', async () => {
      const productsSectionData = {
        title: 'Our Products',
      };

      const response = await request(app.getHttpServer())
        .put('/landing/content')
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          sections: [
            {
              id: 'products-2',
              type: 'products',
              enabled: true,
              order: 1,
              data: productsSectionData,
            },
          ],
        });

      expect(response.status).toBe(200);
      expect(response.body.sections[0].data.title).toBe('Our Products');
    });

    it('should accept products section with no data fields', async () => {
      const productsSectionData = {};

      const response = await request(app.getHttpServer())
        .put('/landing/content')
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          sections: [
            {
              id: 'products-3',
              type: 'products',
              enabled: true,
              order: 1,
              data: productsSectionData,
            },
          ],
        });

      expect(response.status).toBe(200);
      expect(response.body.sections[0].data).toEqual({});
    });

    it('should accept partial products section data', async () => {
      const productsSectionData = {
        layout: 'carousel',
        columns: 2,
        showPrice: false,
      };

      const response = await request(app.getHttpServer())
        .put('/landing/content')
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          sections: [
            {
              id: 'products-4',
              type: 'products',
              enabled: true,
              order: 1,
              data: productsSectionData,
            },
          ],
        });

      expect(response.status).toBe(200);
      expect(response.body.sections[0].data).toMatchObject(productsSectionData);
    });

    it('should validate layout enum values', async () => {
      const productsSectionData = {
        layout: 'invalid-layout',
      };

      const response = await request(app.getHttpServer())
        .put('/landing/content')
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          sections: [
            {
              id: 'products-5',
              type: 'products',
              enabled: true,
              order: 1,
              data: productsSectionData,
            },
          ],
        });

      expect(response.status).toBe(400);
    });

    it('should validate columns enum values', async () => {
      const productsSectionData = {
        columns: 5,
      };

      const response = await request(app.getHttpServer())
        .put('/landing/content')
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          sections: [
            {
              id: 'products-6',
              type: 'products',
              enabled: true,
              order: 1,
              data: productsSectionData,
            },
          ],
        });

      expect(response.status).toBe(400);
    });

    it('should validate productCount enum values', async () => {
      const productsSectionData = {
        productCount: 5,
      };

      const response = await request(app.getHttpServer())
        .put('/landing/content')
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          sections: [
            {
              id: 'products-7',
              type: 'products',
              enabled: true,
              order: 1,
              data: productsSectionData,
            },
          ],
        });

      expect(response.status).toBe(400);
    });

    it('should accept boolean values for showPrice, showRating, showStock', async () => {
      const productsSectionData = {
        showPrice: true,
        showRating: false,
        showStock: true,
      };

      const response = await request(app.getHttpServer())
        .put('/landing/content')
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          sections: [
            {
              id: 'products-8',
              type: 'products',
              enabled: true,
              order: 1,
              data: productsSectionData,
            },
          ],
        });

      expect(response.status).toBe(200);
      expect(response.body.sections[0].data).toMatchObject(productsSectionData);
    });

    it('should accept string values for filterByCategory and filterByTag', async () => {
      const productsSectionData = {
        filterByCategory: 'electronics',
        filterByTag: 'bestseller',
      };

      const response = await request(app.getHttpServer())
        .put('/landing/content')
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          sections: [
            {
              id: 'products-9',
              type: 'products',
              enabled: true,
              order: 1,
              data: productsSectionData,
            },
          ],
        });

      expect(response.status).toBe(200);
      expect(response.body.sections[0].data).toMatchObject(productsSectionData);
    });

    it('should accept ctaText as string', async () => {
      const productsSectionData = {
        ctaText: 'Shop Now',
      };

      const response = await request(app.getHttpServer())
        .put('/landing/content')
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          sections: [
            {
              id: 'products-10',
              type: 'products',
              enabled: true,
              order: 1,
              data: productsSectionData,
            },
          ],
        });

      expect(response.status).toBe(200);
      expect(response.body.sections[0].data.ctaText).toBe('Shop Now');
    });
  });

  describe('Products Section Data Persistence', () => {
    it('should persist products section data to database', async () => {
      const productsSectionData = {
        title: 'Persistent Products',
        layout: 'grid',
        columns: 3,
        productCount: 6,
      };

      const updateRes = await request(app.getHttpServer())
        .put('/landing/content')
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          sections: [
            {
              id: 'products-persist',
              type: 'products',
              enabled: true,
              order: 1,
              data: productsSectionData,
            },
          ],
        });

      expect(updateRes.status).toBe(200);

      // Fetch content and verify persistence
      const getRes = await request(app.getHttpServer())
        .get('/landing/content')
        .set('Authorization', `Bearer ${authToken}`);

      expect(getRes.status).toBe(200);
      const productsSection = getRes.body.sections.find(
        (s: any) => s.id === 'products-persist',
      );
      expect(productsSection).toBeDefined();
      expect(productsSection.data).toMatchObject(productsSectionData);
    });

    it('should update products section data', async () => {
      const initialData = {
        title: 'Initial Title',
        layout: 'grid',
      };

      const updateRes1 = await request(app.getHttpServer())
        .put('/landing/content')
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          sections: [
            {
              id: 'products-update',
              type: 'products',
              enabled: true,
              order: 1,
              data: initialData,
            },
          ],
        });

      expect(updateRes1.status).toBe(200);

      // Update the data
      const updatedData = {
        title: 'Updated Title',
        layout: 'carousel',
        columns: 2,
      };

      const updateRes2 = await request(app.getHttpServer())
        .put('/landing/content')
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          sections: [
            {
              id: 'products-update',
              type: 'products',
              enabled: true,
              order: 1,
              data: updatedData,
            },
          ],
        });

      expect(updateRes2.status).toBe(200);
      expect(updateRes2.body.sections[0].data).toMatchObject(updatedData);
    });
  });

  describe('Backward Compatibility', () => {
    it('should handle legacy data with all fields populated', async () => {
      const legacyData = {
        title: 'Legacy Products',
        subtitle: 'Old format',
        layout: 'grid',
        columns: 3,
        productCount: 9,
        filterByCategory: 'all',
        filterByTag: 'all',
        showPrice: true,
        showRating: true,
        showStock: true,
        ctaText: 'Buy Now',
      };

      const response = await request(app.getHttpServer())
        .put('/landing/content')
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          sections: [
            {
              id: 'products-legacy',
              type: 'products',
              enabled: true,
              order: 1,
              data: legacyData,
            },
          ],
        });

      expect(response.status).toBe(200);
      expect(response.body.sections[0].data).toMatchObject(legacyData);
    });
  });
});
