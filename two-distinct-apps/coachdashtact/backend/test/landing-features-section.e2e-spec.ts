import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication, ValidationPipe } from '@nestjs/common';
import * as request from 'supertest';
import { AppModule } from '../src/app.module';
import { PrismaService } from '../src/prisma/prisma.service';

describe('Landing Features Section E2E Tests', () => {
  let app: INestApplication;
  let prisma: PrismaService;
  let authToken: string;

  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleFixture.createNestApplication();
    app.useGlobalPipes(new ValidationPipe({ transform: true }));
    await app.init();

    prisma = moduleFixture.get<PrismaService>(PrismaService);

    // Get auth token for protected endpoints
    const loginResponse = await request(app.getHttpServer())
      .post('/auth/login')
      .send({
        email: 'admin@example.com',
        password: 'password123',
      });

    authToken = loginResponse.body.accessToken;
  });

  afterAll(async () => {
    await app.close();
  });

  describe('Features Section - Create and Update', () => {
    it('should create landing content with features section (all fields)', async () => {
      const payload = {
        sections: [
          {
            id: 'features-1',
            type: 'features',
            enabled: true,
            order: 1,
            data: {
              title: 'Our Features',
              subtitle: 'Everything you need',
              layout: 'grid',
              columns: 3,
              features: [
                {
                  id: 'feature-1',
                  icon: 'zap',
                  title: 'Fast',
                  description: 'Lightning speed',
                  order: 1,
                },
                {
                  id: 'feature-2',
                  icon: 'shield',
                  title: 'Secure',
                  description: 'Bank-level security',
                  order: 2,
                },
                {
                  id: 'feature-3',
                  icon: 'users',
                  title: 'Collaborative',
                  description: 'Work together seamlessly',
                  order: 3,
                },
              ],
              heading: 'Feature Heading',
              subheading: 'Feature Subheading',
              backgroundType: 'gradient',
            },
          },
        ],
      };

      const response = await request(app.getHttpServer())
        .post('/landing/content')
        .set('Authorization', `Bearer ${authToken}`)
        .send(payload)
        .expect(200);

      expect(response.body.sections).toHaveLength(1);
      expect(response.body.sections[0].type).toBe('features');
      expect(response.body.sections[0].data.title).toBe('Our Features');
      expect(response.body.sections[0].data.layout).toBe('grid');
      expect(response.body.sections[0].data.columns).toBe(3);
      expect(response.body.sections[0].data.features).toHaveLength(3);
      expect(response.body.sections[0].data.backgroundType).toBe('gradient');
    });

    it('should create landing content with features section (minimal fields)', async () => {
      const payload = {
        sections: [
          {
            id: 'features-2',
            type: 'features',
            enabled: true,
            order: 1,
            data: {
              layout: 'list',
              columns: 2,
            },
          },
        ],
      };

      const response = await request(app.getHttpServer())
        .post('/landing/content')
        .set('Authorization', `Bearer ${authToken}`)
        .send(payload)
        .expect(200);

      expect(response.body.sections[0].data.layout).toBe('list');
      expect(response.body.sections[0].data.columns).toBe(2);
      expect(response.body.sections[0].data.title).toBeUndefined();
    });

    it('should create landing content with empty features section', async () => {
      const payload = {
        sections: [
          {
            id: 'features-3',
            type: 'features',
            enabled: true,
            order: 1,
            data: {},
          },
        ],
      };

      const response = await request(app.getHttpServer())
        .post('/landing/content')
        .set('Authorization', `Bearer ${authToken}`)
        .send(payload)
        .expect(200);

      expect(response.body.sections[0].data).toEqual({});
    });

    it('should update features section with new backgroundType field', async () => {
      // First create
      const createPayload = {
        sections: [
          {
            id: 'features-4',
            type: 'features',
            enabled: true,
            order: 1,
            data: {
              title: 'Original Features',
              layout: 'grid',
              columns: 3,
            },
          },
        ],
      };

      await request(app.getHttpServer())
        .post('/landing/content')
        .set('Authorization', `Bearer ${authToken}`)
        .send(createPayload)
        .expect(200);

      // Then update with backgroundType
      const updatePayload = {
        sections: [
          {
            id: 'features-4',
            type: 'features',
            enabled: true,
            order: 1,
            data: {
              title: 'Updated Features',
              layout: 'grid',
              columns: 3,
              backgroundType: 'gradient',
            },
          },
        ],
      };

      const response = await request(app.getHttpServer())
        .patch('/landing/content')
        .set('Authorization', `Bearer ${authToken}`)
        .send(updatePayload)
        .expect(200);

      expect(response.body.sections[0].data.backgroundType).toBe('gradient');
    });
  });

  describe('Features Section - Layout Validation', () => {
    it('should accept grid layout', async () => {
      const payload = {
        sections: [
          {
            id: 'features-grid',
            type: 'features',
            enabled: true,
            order: 1,
            data: { layout: 'grid' },
          },
        ],
      };

      const response = await request(app.getHttpServer())
        .post('/landing/content')
        .set('Authorization', `Bearer ${authToken}`)
        .send(payload)
        .expect(200);

      expect(response.body.sections[0].data.layout).toBe('grid');
    });

    it('should accept list layout', async () => {
      const payload = {
        sections: [
          {
            id: 'features-list',
            type: 'features',
            enabled: true,
            order: 1,
            data: { layout: 'list' },
          },
        ],
      };

      const response = await request(app.getHttpServer())
        .post('/landing/content')
        .set('Authorization', `Bearer ${authToken}`)
        .send(payload)
        .expect(200);

      expect(response.body.sections[0].data.layout).toBe('list');
    });

    it('should accept carousel layout', async () => {
      const payload = {
        sections: [
          {
            id: 'features-carousel',
            type: 'features',
            enabled: true,
            order: 1,
            data: { layout: 'carousel' },
          },
        ],
      };

      const response = await request(app.getHttpServer())
        .post('/landing/content')
        .set('Authorization', `Bearer ${authToken}`)
        .send(payload)
        .expect(200);

      expect(response.body.sections[0].data.layout).toBe('carousel');
    });

    it('should reject invalid layout', async () => {
      const payload = {
        sections: [
          {
            id: 'features-invalid',
            type: 'features',
            enabled: true,
            order: 1,
            data: { layout: 'invalid-layout' },
          },
        ],
      };

      await request(app.getHttpServer())
        .post('/landing/content')
        .set('Authorization', `Bearer ${authToken}`)
        .send(payload)
        .expect(400);
    });
  });

  describe('Features Section - Columns Validation', () => {
    it('should accept 2 columns', async () => {
      const payload = {
        sections: [
          {
            id: 'features-col2',
            type: 'features',
            enabled: true,
            order: 1,
            data: { columns: 2 },
          },
        ],
      };

      const response = await request(app.getHttpServer())
        .post('/landing/content')
        .set('Authorization', `Bearer ${authToken}`)
        .send(payload)
        .expect(200);

      expect(response.body.sections[0].data.columns).toBe(2);
    });

    it('should accept 3 columns', async () => {
      const payload = {
        sections: [
          {
            id: 'features-col3',
            type: 'features',
            enabled: true,
            order: 1,
            data: { columns: 3 },
          },
        ],
      };

      const response = await request(app.getHttpServer())
        .post('/landing/content')
        .set('Authorization', `Bearer ${authToken}`)
        .send(payload)
        .expect(200);

      expect(response.body.sections[0].data.columns).toBe(3);
    });

    it('should accept 4 columns', async () => {
      const payload = {
        sections: [
          {
            id: 'features-col4',
            type: 'features',
            enabled: true,
            order: 1,
            data: { columns: 4 },
          },
        ],
      };

      const response = await request(app.getHttpServer())
        .post('/landing/content')
        .set('Authorization', `Bearer ${authToken}`)
        .send(payload)
        .expect(200);

      expect(response.body.sections[0].data.columns).toBe(4);
    });

    it('should reject 1 column (below minimum)', async () => {
      const payload = {
        sections: [
          {
            id: 'features-col1',
            type: 'features',
            enabled: true,
            order: 1,
            data: { columns: 1 },
          },
        ],
      };

      await request(app.getHttpServer())
        .post('/landing/content')
        .set('Authorization', `Bearer ${authToken}`)
        .send(payload)
        .expect(400);
    });

    it('should reject 5 columns (above maximum)', async () => {
      const payload = {
        sections: [
          {
            id: 'features-col5',
            type: 'features',
            enabled: true,
            order: 1,
            data: { columns: 5 },
          },
        ],
      };

      await request(app.getHttpServer())
        .post('/landing/content')
        .set('Authorization', `Bearer ${authToken}`)
        .send(payload)
        .expect(400);
    });
  });

  describe('Features Section - Backward Compatibility', () => {
    it('should handle old API responses with all required fields', async () => {
      const payload = {
        sections: [
          {
            id: 'features-old',
            type: 'features',
            enabled: true,
            order: 1,
            data: {
              title: 'Old Features',
              subtitle: 'Old Subtitle',
              layout: 'grid',
              columns: 3,
              features: [
                {
                  id: 'f1',
                  icon: 'star',
                  title: 'Feature 1',
                  description: 'Description 1',
                  order: 1,
                },
              ],
            },
          },
        ],
      };

      const response = await request(app.getHttpServer())
        .post('/landing/content')
        .set('Authorization', `Bearer ${authToken}`)
        .send(payload)
        .expect(200);

      expect(response.body.sections[0].data.title).toBe('Old Features');
      expect(response.body.sections[0].data.features).toHaveLength(1);
    });

    it('should handle new API responses with extended fields', async () => {
      const payload = {
        sections: [
          {
            id: 'features-new',
            type: 'features',
            enabled: true,
            order: 1,
            data: {
              title: 'New Features',
              layout: 'grid',
              columns: 3,
              heading: 'New Heading',
              subheading: 'New Subheading',
              backgroundType: 'gradient',
            },
          },
        ],
      };

      const response = await request(app.getHttpServer())
        .post('/landing/content')
        .set('Authorization', `Bearer ${authToken}`)
        .send(payload)
        .expect(200);

      expect(response.body.sections[0].data.heading).toBe('New Heading');
      expect(response.body.sections[0].data.backgroundType).toBe('gradient');
    });
  });

  describe('Features Section - Retrieval', () => {
    it('should retrieve features section with all fields intact', async () => {
      const createPayload = {
        sections: [
          {
            id: 'features-retrieve',
            type: 'features',
            enabled: true,
            order: 1,
            data: {
              title: 'Retrieve Features',
              subtitle: 'Test Subtitle',
              layout: 'grid',
              columns: 3,
              features: [
                {
                  id: 'f1',
                  icon: 'zap',
                  title: 'Fast',
                  description: 'Lightning speed',
                  order: 1,
                },
              ],
              heading: 'Test Heading',
              subheading: 'Test Subheading',
              backgroundType: 'gradient',
            },
          },
        ],
      };

      await request(app.getHttpServer())
        .post('/landing/content')
        .set('Authorization', `Bearer ${authToken}`)
        .send(createPayload)
        .expect(200);

      const response = await request(app.getHttpServer())
        .get('/landing/content')
        .set('Authorization', `Bearer ${authToken}`)
        .expect(200);

      const featuresSection = response.body.sections.find(
        (s: any) => s.id === 'features-retrieve'
      );

      expect(featuresSection).toBeDefined();
      expect(featuresSection.data.title).toBe('Retrieve Features');
      expect(featuresSection.data.backgroundType).toBe('gradient');
    });
  });

  describe('Features Section - Type Consistency', () => {
    it('should maintain type consistency for layout field', async () => {
      const payload = {
        sections: [
          {
            id: 'features-type-layout',
            type: 'features',
            enabled: true,
            order: 1,
            data: { layout: 'grid' },
          },
        ],
      };

      const response = await request(app.getHttpServer())
        .post('/landing/content')
        .set('Authorization', `Bearer ${authToken}`)
        .send(payload)
        .expect(200);

      expect(typeof response.body.sections[0].data.layout).toBe('string');
      expect(['grid', 'list', 'carousel']).toContain(
        response.body.sections[0].data.layout
      );
    });

    it('should maintain type consistency for columns field', async () => {
      const payload = {
        sections: [
          {
            id: 'features-type-columns',
            type: 'features',
            enabled: true,
            order: 1,
            data: { columns: 3 },
          },
        ],
      };

      const response = await request(app.getHttpServer())
        .post('/landing/content')
        .set('Authorization', `Bearer ${authToken}`)
        .send(payload)
        .expect(200);

      expect(typeof response.body.sections[0].data.columns).toBe('number');
      expect([2, 3, 4]).toContain(response.body.sections[0].data.columns);
    });

    it('should maintain type consistency for features array', async () => {
      const payload = {
        sections: [
          {
            id: 'features-type-array',
            type: 'features',
            enabled: true,
            order: 1,
            data: {
              features: [
                {
                  id: 'f1',
                  icon: 'zap',
                  title: 'Fast',
                  description: 'Speed',
                  order: 1,
                },
              ],
            },
          },
        ],
      };

      const response = await request(app.getHttpServer())
        .post('/landing/content')
        .set('Authorization', `Bearer ${authToken}`)
        .send(payload)
        .expect(200);

      expect(Array.isArray(response.body.sections[0].data.features)).toBe(true);
      expect(response.body.sections[0].data.features[0]).toHaveProperty('id');
      expect(response.body.sections[0].data.features[0]).toHaveProperty('title');
    });
  });
});
