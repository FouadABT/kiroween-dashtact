import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication, ValidationPipe } from '@nestjs/common';
import * as request from 'supertest';
import { LandingController } from '../landing.controller';
import { LandingService } from '../landing.service';
import { FeaturesSectionDataDto } from './features-section-data.dto';

describe('FeaturesSectionDataDto - Controller Integration', () => {
  let app: INestApplication;
  let landingService: LandingService;

  const mockLandingService = {
    updateContent: jest.fn(),
    getContent: jest.fn(),
  };

  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      controllers: [LandingController],
      providers: [
        {
          provide: LandingService,
          useValue: mockLandingService,
        },
      ],
    }).compile();

    app = moduleFixture.createNestApplication();
    app.useGlobalPipes(new ValidationPipe({ transform: true }));
    await app.init();

    landingService = moduleFixture.get<LandingService>(LandingService);
  });

  afterAll(async () => {
    await app.close();
  });

  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('POST /landing/content - Features Section', () => {
    it('should accept features section with all fields', async () => {
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
              ],
              heading: 'Feature Heading',
              subheading: 'Feature Subheading',
              backgroundType: 'gradient',
            },
          },
        ],
      };

      mockLandingService.updateContent.mockResolvedValue({
        id: 'default-landing',
        sections: payload.sections,
      });

      const response = await request(app.getHttpServer())
        .post('/landing/content')
        .send(payload)
        .expect(200);

      expect(response.body.sections[0].data.title).toBe('Our Features');
      expect(response.body.sections[0].data.layout).toBe('grid');
      expect(response.body.sections[0].data.backgroundType).toBe('gradient');
    });

    it('should accept features section with minimal fields', async () => {
      const payload = {
        sections: [
          {
            id: 'features-1',
            type: 'features',
            enabled: true,
            order: 1,
            data: {
              layout: 'grid',
              columns: 3,
            },
          },
        ],
      };

      mockLandingService.updateContent.mockResolvedValue({
        id: 'default-landing',
        sections: payload.sections,
      });

      const response = await request(app.getHttpServer())
        .post('/landing/content')
        .send(payload)
        .expect(200);

      expect(response.body.sections[0].data.layout).toBe('grid');
      expect(response.body.sections[0].data.columns).toBe(3);
    });

    it('should accept features section with no data fields', async () => {
      const payload = {
        sections: [
          {
            id: 'features-1',
            type: 'features',
            enabled: true,
            order: 1,
            data: {},
          },
        ],
      };

      mockLandingService.updateContent.mockResolvedValue({
        id: 'default-landing',
        sections: payload.sections,
      });

      const response = await request(app.getHttpServer())
        .post('/landing/content')
        .send(payload)
        .expect(200);

      expect(response.body.sections[0].data).toEqual({});
    });

    it('should reject invalid layout value', async () => {
      const payload = {
        sections: [
          {
            id: 'features-1',
            type: 'features',
            enabled: true,
            order: 1,
            data: {
              layout: 'invalid-layout',
            },
          },
        ],
      };

      await request(app.getHttpServer())
        .post('/landing/content')
        .send(payload)
        .expect(400);
    });

    it('should reject columns out of range', async () => {
      const payload = {
        sections: [
          {
            id: 'features-1',
            type: 'features',
            enabled: true,
            order: 1,
            data: {
              columns: 5,
            },
          },
        ],
      };

      await request(app.getHttpServer())
        .post('/landing/content')
        .send(payload)
        .expect(400);
    });

    it('should accept all valid layout options', async () => {
      const layouts = ['grid', 'list', 'carousel'];

      for (const layout of layouts) {
        const payload = {
          sections: [
            {
              id: 'features-1',
              type: 'features',
              enabled: true,
              order: 1,
              data: { layout },
            },
          ],
        };

        mockLandingService.updateContent.mockResolvedValue({
          id: 'default-landing',
          sections: payload.sections,
        });

        const response = await request(app.getHttpServer())
          .post('/landing/content')
          .send(payload)
          .expect(200);

        expect(response.body.sections[0].data.layout).toBe(layout);
      }
    });

    it('should accept all valid column values', async () => {
      const columns = [2, 3, 4];

      for (const col of columns) {
        const payload = {
          sections: [
            {
              id: 'features-1',
              type: 'features',
              enabled: true,
              order: 1,
              data: { columns: col },
            },
          ],
        };

        mockLandingService.updateContent.mockResolvedValue({
          id: 'default-landing',
          sections: payload.sections,
        });

        const response = await request(app.getHttpServer())
          .post('/landing/content')
          .send(payload)
          .expect(200);

        expect(response.body.sections[0].data.columns).toBe(col);
      }
    });

    it('should handle features array with multiple items', async () => {
      const payload = {
        sections: [
          {
            id: 'features-1',
            type: 'features',
            enabled: true,
            order: 1,
            data: {
              title: 'Our Features',
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
                  description: 'Work together',
                  order: 3,
                },
              ],
            },
          },
        ],
      };

      mockLandingService.updateContent.mockResolvedValue({
        id: 'default-landing',
        sections: payload.sections,
      });

      const response = await request(app.getHttpServer())
        .post('/landing/content')
        .send(payload)
        .expect(200);

      expect(response.body.sections[0].data.features).toHaveLength(3);
    });

    it('should preserve new backgroundType field', async () => {
      const payload = {
        sections: [
          {
            id: 'features-1',
            type: 'features',
            enabled: true,
            order: 1,
            data: {
              title: 'Features',
              backgroundType: 'gradient',
            },
          },
        ],
      };

      mockLandingService.updateContent.mockResolvedValue({
        id: 'default-landing',
        sections: payload.sections,
      });

      const response = await request(app.getHttpServer())
        .post('/landing/content')
        .send(payload)
        .expect(200);

      expect(response.body.sections[0].data.backgroundType).toBe('gradient');
    });
  });

  describe('PATCH /landing/content - Features Section Update', () => {
    it('should update features section with partial data', async () => {
      const payload = {
        sections: [
          {
            id: 'features-1',
            type: 'features',
            enabled: true,
            order: 1,
            data: {
              title: 'Updated Features',
              backgroundType: 'solid',
            },
          },
        ],
      };

      mockLandingService.updateContent.mockResolvedValue({
        id: 'default-landing',
        sections: payload.sections,
      });

      const response = await request(app.getHttpServer())
        .patch('/landing/content')
        .send(payload)
        .expect(200);

      expect(response.body.sections[0].data.title).toBe('Updated Features');
      expect(response.body.sections[0].data.backgroundType).toBe('solid');
    });

    it('should handle clearing optional fields', async () => {
      const payload = {
        sections: [
          {
            id: 'features-1',
            type: 'features',
            enabled: true,
            order: 1,
            data: {
              title: undefined,
              subtitle: undefined,
              layout: undefined,
            },
          },
        ],
      };

      mockLandingService.updateContent.mockResolvedValue({
        id: 'default-landing',
        sections: payload.sections,
      });

      const response = await request(app.getHttpServer())
        .patch('/landing/content')
        .send(payload)
        .expect(200);

      expect(response.body.sections[0].data).toBeDefined();
    });
  });

  describe('GET /landing/content - Features Section Retrieval', () => {
    it('should retrieve features section with all fields', async () => {
      const mockContent = {
        id: 'default-landing',
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
              ],
              heading: 'Feature Heading',
              subheading: 'Feature Subheading',
              backgroundType: 'gradient',
            },
          },
        ],
      };

      mockLandingService.getContent.mockResolvedValue(mockContent);

      const response = await request(app.getHttpServer())
        .get('/landing/content')
        .expect(200);

      expect(response.body.sections[0].data.title).toBe('Our Features');
      expect(response.body.sections[0].data.backgroundType).toBe('gradient');
    });

    it('should retrieve features section with minimal fields', async () => {
      const mockContent = {
        id: 'default-landing',
        sections: [
          {
            id: 'features-1',
            type: 'features',
            enabled: true,
            order: 1,
            data: {
              layout: 'grid',
              columns: 3,
            },
          },
        ],
      };

      mockLandingService.getContent.mockResolvedValue(mockContent);

      const response = await request(app.getHttpServer())
        .get('/landing/content')
        .expect(200);

      expect(response.body.sections[0].data.layout).toBe('grid');
      expect(response.body.sections[0].data.columns).toBe(3);
    });
  });
});
