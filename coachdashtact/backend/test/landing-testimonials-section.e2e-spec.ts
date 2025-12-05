import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication, ValidationPipe } from '@nestjs/common';
import * as request from 'supertest';
import { AppModule } from '../src/app.module';
import { PrismaService } from '../src/prisma/prisma.service';

describe('Landing Testimonials Section (e2e)', () => {
  let app: INestApplication;
  let prisma: PrismaService;
  let authToken: string;
  let landingContentId: string;

  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleFixture.createNestApplication();
    app.useGlobalPipes(new ValidationPipe());
    await app.init();

    prisma = moduleFixture.get<PrismaService>(PrismaService);

    // Get auth token
    const loginRes = await request(app.getHttpServer())
      .post('/auth/login')
      .send({
        email: 'admin@example.com',
        password: 'Admin@123456',
      });

    authToken = loginRes.body.accessToken;

    // Get or create landing content
    let content = await prisma.landingPageContent.findFirst({
      where: { isActive: true },
    });

    if (!content) {
      content = await prisma.landingPageContent.create({
        data: {
          sections: [],
          settings: {},
          isActive: true,
        },
      });
    }

    landingContentId = content.id;
  });

  afterAll(async () => {
    await app.close();
  });

  describe('Testimonials Section - Optional Fields', () => {
    it('should accept testimonials section with all optional fields', async () => {
      const updateDto = {
        sections: [
          {
            id: 'testimonials-1',
            type: 'testimonials',
            enabled: true,
            order: 1,
            data: {
              // All fields optional - should be valid
            },
          },
        ],
      };

      const res = await request(app.getHttpServer())
        .put('/landing/content')
        .set('Authorization', `Bearer ${authToken}`)
        .send(updateDto);

      expect(res.status).toBe(200);
      expect(res.body.sections[0].type).toBe('testimonials');
    });

    it('should accept testimonials section with only title', async () => {
      const updateDto = {
        sections: [
          {
            id: 'testimonials-2',
            type: 'testimonials',
            enabled: true,
            order: 1,
            data: {
              title: 'Customer Testimonials',
            },
          },
        ],
      };

      const res = await request(app.getHttpServer())
        .put('/landing/content')
        .set('Authorization', `Bearer ${authToken}`)
        .send(updateDto);

      expect(res.status).toBe(200);
      expect(res.body.sections[0].data.title).toBe('Customer Testimonials');
    });

    it('should accept testimonials section with title and subtitle', async () => {
      const updateDto = {
        sections: [
          {
            id: 'testimonials-3',
            type: 'testimonials',
            enabled: true,
            order: 1,
            data: {
              title: 'What Our Customers Say',
              subtitle: 'Real feedback from real users',
            },
          },
        ],
      };

      const res = await request(app.getHttpServer())
        .put('/landing/content')
        .set('Authorization', `Bearer ${authToken}`)
        .send(updateDto);

      expect(res.status).toBe(200);
      expect(res.body.sections[0].data.title).toBe('What Our Customers Say');
      expect(res.body.sections[0].data.subtitle).toBe('Real feedback from real users');
    });

    it('should accept testimonials section with layout', async () => {
      const updateDto = {
        sections: [
          {
            id: 'testimonials-4',
            type: 'testimonials',
            enabled: true,
            order: 1,
            data: {
              layout: 'carousel',
            },
          },
        ],
      };

      const res = await request(app.getHttpServer())
        .put('/landing/content')
        .set('Authorization', `Bearer ${authToken}`)
        .send(updateDto);

      expect(res.status).toBe(200);
      expect(res.body.sections[0].data.layout).toBe('carousel');
    });

    it('should accept testimonials section with testimonials array', async () => {
      const updateDto = {
        sections: [
          {
            id: 'testimonials-5',
            type: 'testimonials',
            enabled: true,
            order: 1,
            data: {
              testimonials: [
                {
                  id: 'testimonial-1',
                  quote: 'Great product!',
                  author: 'John Doe',
                  role: 'CEO',
                  order: 1,
                },
              ],
            },
          },
        ],
      };

      const res = await request(app.getHttpServer())
        .put('/landing/content')
        .set('Authorization', `Bearer ${authToken}`)
        .send(updateDto);

      expect(res.status).toBe(200);
      expect(res.body.sections[0].data.testimonials).toHaveLength(1);
      expect(res.body.sections[0].data.testimonials[0].quote).toBe('Great product!');
    });

    it('should accept testimonials section with all fields populated', async () => {
      const updateDto = {
        sections: [
          {
            id: 'testimonials-6',
            type: 'testimonials',
            enabled: true,
            order: 1,
            data: {
              title: 'Customer Testimonials',
              subtitle: 'Hear from our satisfied users',
              layout: 'grid',
              showRatings: true,
              columns: 3,
              testimonials: [
                {
                  id: 'testimonial-1',
                  quote: 'Excellent service!',
                  author: 'Jane Smith',
                  role: 'Product Manager',
                  company: 'Tech Corp',
                  rating: 5,
                  order: 1,
                },
                {
                  id: 'testimonial-2',
                  quote: 'Highly recommended!',
                  author: 'Bob Johnson',
                  role: 'CTO',
                  company: 'Innovation Inc',
                  rating: 5,
                  order: 2,
                },
              ],
            },
          },
        ],
      };

      const res = await request(app.getHttpServer())
        .put('/landing/content')
        .set('Authorization', `Bearer ${authToken}`)
        .send(updateDto);

      expect(res.status).toBe(200);
      expect(res.body.sections[0].data.title).toBe('Customer Testimonials');
      expect(res.body.sections[0].data.layout).toBe('grid');
      expect(res.body.sections[0].data.testimonials).toHaveLength(2);
      expect(res.body.sections[0].data.showRatings).toBe(true);
      expect(res.body.sections[0].data.columns).toBe(3);
    });

    it('should accept testimonials section with extended fields', async () => {
      const updateDto = {
        sections: [
          {
            id: 'testimonials-7',
            type: 'testimonials',
            enabled: true,
            order: 1,
            data: {
              heading: 'What Our Customers Say',
              subheading: 'Real feedback from real users',
              layout: 'masonry',
              columns: 4,
            },
          },
        ],
      };

      const res = await request(app.getHttpServer())
        .put('/landing/content')
        .set('Authorization', `Bearer ${authToken}`)
        .send(updateDto);

      expect(res.status).toBe(200);
      expect(res.body.sections[0].data.heading).toBe('What Our Customers Say');
      expect(res.body.sections[0].data.subheading).toBe('Real feedback from real users');
      expect(res.body.sections[0].data.columns).toBe(4);
    });

    it('should validate layout enum values', async () => {
      const updateDto = {
        sections: [
          {
            id: 'testimonials-8',
            type: 'testimonials',
            enabled: true,
            order: 1,
            data: {
              layout: 'invalid-layout',
            },
          },
        ],
      };

      const res = await request(app.getHttpServer())
        .put('/landing/content')
        .set('Authorization', `Bearer ${authToken}`)
        .send(updateDto);

      expect(res.status).toBe(400);
      expect(res.body.message).toContain('Validation failed');
    });

    it('should accept empty testimonials array', async () => {
      const updateDto = {
        sections: [
          {
            id: 'testimonials-9',
            type: 'testimonials',
            enabled: true,
            order: 1,
            data: {
              title: 'Testimonials',
              testimonials: [],
            },
          },
        ],
      };

      const res = await request(app.getHttpServer())
        .put('/landing/content')
        .set('Authorization', `Bearer ${authToken}`)
        .send(updateDto);

      expect(res.status).toBe(200);
      expect(res.body.sections[0].data.testimonials).toEqual([]);
    });

    it('should handle mixed optional and required testimonial fields', async () => {
      const updateDto = {
        sections: [
          {
            id: 'testimonials-10',
            type: 'testimonials',
            enabled: true,
            order: 1,
            data: {
              testimonials: [
                {
                  id: 'testimonial-1',
                  quote: 'Amazing product!',
                  author: 'Alice',
                  role: 'Developer',
                  // company, avatar, rating are optional
                  order: 1,
                },
              ],
            },
          },
        ],
      };

      const res = await request(app.getHttpServer())
        .put('/landing/content')
        .set('Authorization', `Bearer ${authToken}`)
        .send(updateDto);

      expect(res.status).toBe(200);
      expect(res.body.sections[0].data.testimonials[0].quote).toBe('Amazing product!');
    });
  });

  describe('Testimonials Section - Backward Compatibility', () => {
    it('should still accept fully populated testimonials section (old format)', async () => {
      const updateDto = {
        sections: [
          {
            id: 'testimonials-old',
            type: 'testimonials',
            enabled: true,
            order: 1,
            data: {
              title: 'Customer Reviews',
              subtitle: 'What people are saying',
              layout: 'grid',
              testimonials: [
                {
                  id: 'testimonial-1',
                  quote: 'Best investment ever!',
                  author: 'Sarah',
                  role: 'Manager',
                  order: 1,
                },
              ],
            },
          },
        ],
      };

      const res = await request(app.getHttpServer())
        .put('/landing/content')
        .set('Authorization', `Bearer ${authToken}`)
        .send(updateDto);

      expect(res.status).toBe(200);
      expect(res.body.sections[0].data.title).toBe('Customer Reviews');
      expect(res.body.sections[0].data.layout).toBe('grid');
    });

    it('should preserve existing testimonials section data on partial update', async () => {
      // First, create a full testimonials section
      const createDto = {
        sections: [
          {
            id: 'testimonials-preserve',
            type: 'testimonials',
            enabled: true,
            order: 1,
            data: {
              title: 'Original Title',
              subtitle: 'Original Subtitle',
              layout: 'carousel',
              testimonials: [
                {
                  id: 'testimonial-1',
                  quote: 'Original quote',
                  author: 'Original Author',
                  role: 'Original Role',
                  order: 1,
                },
              ],
            },
          },
        ],
      };

      let res = await request(app.getHttpServer())
        .put('/landing/content')
        .set('Authorization', `Bearer ${authToken}`)
        .send(createDto);

      expect(res.status).toBe(200);

      // Now update with partial data
      const updateDto = {
        sections: [
          {
            id: 'testimonials-preserve',
            type: 'testimonials',
            enabled: true,
            order: 1,
            data: {
              title: 'Updated Title',
              // Other fields should be preserved or optional
            },
          },
        ],
      };

      res = await request(app.getHttpServer())
        .put('/landing/content')
        .set('Authorization', `Bearer ${authToken}`)
        .send(updateDto);

      expect(res.status).toBe(200);
      expect(res.body.sections[0].data.title).toBe('Updated Title');
    });
  });

  describe('Testimonials Section - Transform Defaults', () => {
    it('should apply default layout when not provided', async () => {
      const updateDto = {
        sections: [
          {
            id: 'testimonials-default-layout',
            type: 'testimonials',
            enabled: true,
            order: 1,
            data: {
              title: 'Testimonials',
            },
          },
        ],
      };

      const res = await request(app.getHttpServer())
        .put('/landing/content')
        .set('Authorization', `Bearer ${authToken}`)
        .send(updateDto);

      expect(res.status).toBe(200);
      expect(res.body.sections[0].data.layout).toBe('grid');
    });

    it('should apply default testimonials array when not provided', async () => {
      const updateDto = {
        sections: [
          {
            id: 'testimonials-default-array',
            type: 'testimonials',
            enabled: true,
            order: 1,
            data: {
              title: 'Testimonials',
            },
          },
        ],
      };

      const res = await request(app.getHttpServer())
        .put('/landing/content')
        .set('Authorization', `Bearer ${authToken}`)
        .send(updateDto);

      expect(res.status).toBe(200);
      expect(res.body.sections[0].data.testimonials).toEqual([]);
    });

    it('should apply default showRatings when not provided', async () => {
      const updateDto = {
        sections: [
          {
            id: 'testimonials-default-ratings',
            type: 'testimonials',
            enabled: true,
            order: 1,
            data: {
              title: 'Testimonials',
            },
          },
        ],
      };

      const res = await request(app.getHttpServer())
        .put('/landing/content')
        .set('Authorization', `Bearer ${authToken}`)
        .send(updateDto);

      expect(res.status).toBe(200);
      expect(res.body.sections[0].data.showRatings).toBe(true);
    });

    it('should apply default columns when not provided', async () => {
      const updateDto = {
        sections: [
          {
            id: 'testimonials-default-columns',
            type: 'testimonials',
            enabled: true,
            order: 1,
            data: {
              title: 'Testimonials',
            },
          },
        ],
      };

      const res = await request(app.getHttpServer())
        .put('/landing/content')
        .set('Authorization', `Bearer ${authToken}`)
        .send(updateDto);

      expect(res.status).toBe(200);
      expect(res.body.sections[0].data.columns).toBe(3);
    });

    it('should apply all defaults when data is empty object', async () => {
      const updateDto = {
        sections: [
          {
            id: 'testimonials-all-defaults',
            type: 'testimonials',
            enabled: true,
            order: 1,
            data: {},
          },
        ],
      };

      const res = await request(app.getHttpServer())
        .put('/landing/content')
        .set('Authorization', `Bearer ${authToken}`)
        .send(updateDto);

      expect(res.status).toBe(200);
      expect(res.body.sections[0].data.layout).toBe('grid');
      expect(res.body.sections[0].data.testimonials).toEqual([]);
      expect(res.body.sections[0].data.showRatings).toBe(true);
      expect(res.body.sections[0].data.columns).toBe(3);
    });

    it('should preserve provided values over defaults', async () => {
      const updateDto = {
        sections: [
          {
            id: 'testimonials-preserve-values',
            type: 'testimonials',
            enabled: true,
            order: 1,
            data: {
              layout: 'carousel',
              columns: 2,
              showRatings: false,
              testimonials: [
                {
                  id: 'testimonial-1',
                  quote: 'Great!',
                  author: 'John',
                  role: 'Developer',
                  order: 1,
                },
              ],
            },
          },
        ],
      };

      const res = await request(app.getHttpServer())
        .put('/landing/content')
        .set('Authorization', `Bearer ${authToken}`)
        .send(updateDto);

      expect(res.status).toBe(200);
      expect(res.body.sections[0].data.layout).toBe('carousel');
      expect(res.body.sections[0].data.columns).toBe(2);
      expect(res.body.sections[0].data.showRatings).toBe(false);
      expect(res.body.sections[0].data.testimonials).toHaveLength(1);
    });
  });

  describe('Testimonials Section - Validation', () => {
    it('should validate testimonial quote is string', async () => {
      const updateDto = {
        sections: [
          {
            id: 'testimonials-validate',
            type: 'testimonials',
            enabled: true,
            order: 1,
            data: {
              testimonials: [
                {
                  id: 'testimonial-1',
                  quote: 123, // Should be string
                  author: 'John',
                  role: 'Developer',
                  order: 1,
                },
              ],
            },
          },
        ],
      };

      const res = await request(app.getHttpServer())
        .put('/landing/content')
        .set('Authorization', `Bearer ${authToken}`)
        .send(updateDto);

      expect(res.status).toBe(400);
    });

    it('should validate testimonial rating is number between 1-5', async () => {
      const updateDto = {
        sections: [
          {
            id: 'testimonials-rating',
            type: 'testimonials',
            enabled: true,
            order: 1,
            data: {
              testimonials: [
                {
                  id: 'testimonial-1',
                  quote: 'Great!',
                  author: 'John',
                  role: 'Developer',
                  rating: 10, // Should be 1-5
                  order: 1,
                },
              ],
            },
          },
        ],
      };

      const res = await request(app.getHttpServer())
        .put('/landing/content')
        .set('Authorization', `Bearer ${authToken}`)
        .send(updateDto);

      expect(res.status).toBe(400);
    });

    it('should validate columns is number', async () => {
      const updateDto = {
        sections: [
          {
            id: 'testimonials-columns',
            type: 'testimonials',
            enabled: true,
            order: 1,
            data: {
              columns: 'three', // Should be number
            },
          },
        ],
      };

      const res = await request(app.getHttpServer())
        .put('/landing/content')
        .set('Authorization', `Bearer ${authToken}`)
        .send(updateDto);

      expect(res.status).toBe(400);
    });
  });
});
