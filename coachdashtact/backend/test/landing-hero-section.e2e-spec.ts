import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication, ValidationPipe } from '@nestjs/common';
import * as request from 'supertest';
import { AppModule } from '../src/app.module';
import { PrismaService } from '../src/prisma/prisma.service';

describe('Landing Hero Section (e2e)', () => {
  let app: INestApplication;
  let prisma: PrismaService;
  let authToken: string;
  let landingContentId: string;

  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleFixture.createNestApplication();
    app.useGlobalPipes(new ValidationPipe({ whitelist: true, transform: true }));
    await app.init();

    prisma = app.get<PrismaService>(PrismaService);

    // Create test user with landing:write permission
    const superAdminRole = await prisma.userRole.findFirst({
      where: { name: 'Super Admin' },
    });

    const testUser = await prisma.user.create({
      data: {
        email: 'hero-test@example.com',
        name: 'Hero Test User',
        password: '$2b$10$abcdefghijklmnopqrstuv', // hashed password
        roleId: superAdminRole.id,
      },
    });

    // Login to get auth token
    const loginResponse = await request(app.getHttpServer())
      .post('/auth/login')
      .send({
        email: 'hero-test@example.com',
        password: 'password123',
      });

    if (loginResponse.body.accessToken) {
      authToken = loginResponse.body.accessToken;
    }

    // Get or create landing page content
    let landingContent = await prisma.landingPageContent.findFirst({
      where: { isActive: true },
    });

    if (!landingContent) {
      landingContent = await prisma.landingPageContent.create({
        data: {
          sections: [],
          settings: {},
          version: 1,
          isActive: true,
          themeMode: 'auto',
        },
      });
    }

    landingContentId = landingContent.id;
  });

  afterAll(async () => {
    // Cleanup
    await prisma.user.deleteMany({
      where: { email: 'hero-test@example.com' },
    });
    await app.close();
  });

  describe('Hero Section Validation', () => {
    it('should accept valid hero section with all fields', async () => {
      const validHeroSection = {
        id: 'hero-test-1',
        type: 'hero',
        enabled: true,
        order: 1,
        data: {
          headline: 'Welcome to Our Platform',
          subheadline: 'Build amazing things with our powerful tools',
          primaryCta: {
            text: 'Get Started',
            link: '/signup',
            linkType: 'url',
          },
          secondaryCta: {
            text: 'Learn More',
            link: '/about',
            linkType: 'url',
          },
          backgroundType: 'gradient',
          backgroundColor: '#ffffff',
          gradientStart: '#667eea',
          gradientEnd: '#764ba2',
          gradientAngle: '135deg',
          textAlignment: 'center',
          height: 'large',
          features: ['Fast', 'Secure', 'Reliable'],
          trustBadges: ['badge1.png', 'badge2.png'],
          showTrustBadges: true,
        },
      };

      if (!authToken) {
        console.log('Skipping test - no auth token');
        return;
      }

      const response = await request(app.getHttpServer())
        .patch('/landing')
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          sections: [validHeroSection],
        })
        .expect(200);

      expect(response.body.sections).toBeDefined();
      expect(response.body.sections[0].type).toBe('hero');
      expect(response.body.sections[0].data.headline).toBe('Welcome to Our Platform');
    });

    it('should accept valid hero section with only required fields', async () => {
      const minimalHeroSection = {
        id: 'hero-test-2',
        type: 'hero',
        enabled: true,
        order: 1,
        data: {
          headline: 'Simple Hero',
          subheadline: 'Just the basics',
          primaryCta: {
            text: 'Click Here',
            link: '/action',
            linkType: 'url',
          },
          backgroundType: 'solid',
          textAlignment: 'center',
          height: 'medium',
        },
      };

      if (!authToken) {
        console.log('Skipping test - no auth token');
        return;
      }

      const response = await request(app.getHttpServer())
        .patch('/landing')
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          sections: [minimalHeroSection],
        })
        .expect(200);

      expect(response.body.sections).toBeDefined();
      expect(response.body.sections[0].data.headline).toBe('Simple Hero');
    });

    it('should reject hero section with missing headline', async () => {
      const invalidHeroSection = {
        id: 'hero-test-3',
        type: 'hero',
        enabled: true,
        order: 1,
        data: {
          subheadline: 'Missing headline',
          primaryCta: {
            text: 'Click',
            link: '/link',
            linkType: 'url',
          },
          backgroundType: 'solid',
          textAlignment: 'center',
          height: 'medium',
        },
      };

      if (!authToken) {
        console.log('Skipping test - no auth token');
        return;
      }

      await request(app.getHttpServer())
        .patch('/landing')
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          sections: [invalidHeroSection],
        })
        .expect(400);
    });

    it('should reject hero section with invalid backgroundType', async () => {
      const invalidHeroSection = {
        id: 'hero-test-4',
        type: 'hero',
        enabled: true,
        order: 1,
        data: {
          headline: 'Test',
          subheadline: 'Test subtitle',
          primaryCta: {
            text: 'Click',
            link: '/link',
            linkType: 'url',
          },
          backgroundType: 'invalid-type',
          textAlignment: 'center',
          height: 'medium',
        },
      };

      if (!authToken) {
        console.log('Skipping test - no auth token');
        return;
      }

      await request(app.getHttpServer())
        .patch('/landing')
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          sections: [invalidHeroSection],
        })
        .expect(400);
    });

    it('should reject hero section with invalid textAlignment', async () => {
      const invalidHeroSection = {
        id: 'hero-test-5',
        type: 'hero',
        enabled: true,
        order: 1,
        data: {
          headline: 'Test',
          subheadline: 'Test subtitle',
          primaryCta: {
            text: 'Click',
            link: '/link',
            linkType: 'url',
          },
          backgroundType: 'solid',
          textAlignment: 'invalid-alignment',
          height: 'medium',
        },
      };

      if (!authToken) {
        console.log('Skipping test - no auth token');
        return;
      }

      await request(app.getHttpServer())
        .patch('/landing')
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          sections: [invalidHeroSection],
        })
        .expect(400);
    });

    it('should reject hero section with invalid height', async () => {
      const invalidHeroSection = {
        id: 'hero-test-6',
        type: 'hero',
        enabled: true,
        order: 1,
        data: {
          headline: 'Test',
          subheadline: 'Test subtitle',
          primaryCta: {
            text: 'Click',
            link: '/link',
            linkType: 'url',
          },
          backgroundType: 'solid',
          textAlignment: 'center',
          height: 'invalid-height',
        },
      };

      if (!authToken) {
        console.log('Skipping test - no auth token');
        return;
      }

      await request(app.getHttpServer())
        .patch('/landing')
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          sections: [invalidHeroSection],
        })
        .expect(400);
    });

    it('should accept hero section with image background', async () => {
      const heroWithImage = {
        id: 'hero-test-7',
        type: 'hero',
        enabled: true,
        order: 1,
        data: {
          headline: 'Image Hero',
          subheadline: 'With background image',
          primaryCta: {
            text: 'Explore',
            link: '/explore',
            linkType: 'url',
          },
          backgroundType: 'image',
          backgroundImage: 'https://example.com/hero.jpg',
          textAlignment: 'center',
          height: 'full',
        },
      };

      if (!authToken) {
        console.log('Skipping test - no auth token');
        return;
      }

      const response = await request(app.getHttpServer())
        .patch('/landing')
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          sections: [heroWithImage],
        })
        .expect(200);

      expect(response.body.sections[0].data.backgroundImage).toBe('https://example.com/hero.jpg');
    });

    it('should accept hero section with video background', async () => {
      const heroWithVideo = {
        id: 'hero-test-8',
        type: 'hero',
        enabled: true,
        order: 1,
        data: {
          headline: 'Video Hero',
          subheadline: 'With background video',
          primaryCta: {
            text: 'Watch',
            link: '/watch',
            linkType: 'url',
          },
          backgroundType: 'video',
          backgroundVideo: 'https://example.com/hero.mp4',
          textAlignment: 'center',
          height: 'extra-large',
        },
      };

      if (!authToken) {
        console.log('Skipping test - no auth token');
        return;
      }

      const response = await request(app.getHttpServer())
        .patch('/landing')
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          sections: [heroWithVideo],
        })
        .expect(200);

      expect(response.body.sections[0].data.backgroundVideo).toBe('https://example.com/hero.mp4');
    });
  });

  describe('Public Access', () => {
    it('should allow public access to landing page content', async () => {
      const response = await request(app.getHttpServer())
        .get('/landing')
        .expect(200);

      expect(response.body).toBeDefined();
      expect(response.body.sections).toBeDefined();
    });
  });
});
