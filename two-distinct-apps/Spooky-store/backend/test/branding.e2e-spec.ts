import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication, ValidationPipe } from '@nestjs/common';
import request from 'supertest';
import { AppModule } from '../src/app.module';
import { PrismaService } from '../src/prisma/prisma.service';

describe('Branding System (e2e)', () => {
  let app: INestApplication;
  let prisma: PrismaService;
  let authToken: string;
  let adminUser: any;
  let brandSettingsId: string;

  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleFixture.createNestApplication();
    app.useGlobalPipes(new ValidationPipe({ whitelist: true, transform: true }));
    await app.init();

    prisma = moduleFixture.get<PrismaService>(PrismaService);

    // Create admin user for testing
    const adminRole = await prisma.userRole.findUnique({
      where: { name: 'Super Admin' },
    });

    adminUser = await prisma.user.create({
      data: {
        email: 'admin-branding-test@example.com',
        name: 'Admin Branding Test',
        password: 'hashedpassword',
        roleId: adminRole!.id,
      },
    });

    // Mock auth token (in real app, this would come from login)
    authToken = 'mock-admin-token';
  });

  afterAll(async () => {
    // Cleanup
    if (brandSettingsId) {
      await prisma.brandSettings.deleteMany({
        where: { id: brandSettingsId },
      });
    }
    await prisma.user.delete({
      where: { id: adminUser.id },
    });
    await app.close();
  });

  describe('/branding (GET)', () => {
    it('should get brand settings (public endpoint)', () => {
      return request(app.getHttpServer())
        .get('/branding')
        .expect(200)
        .expect((res) => {
          expect(res.body).toHaveProperty('id');
          expect(res.body).toHaveProperty('brandName');
          expect(res.body).toHaveProperty('createdAt');
          expect(res.body).toHaveProperty('updatedAt');
          brandSettingsId = res.body.id;
        });
    });

    it('should return default settings if none exist', async () => {
      // Delete all settings first
      await prisma.brandSettings.deleteMany();

      return request(app.getHttpServer())
        .get('/branding')
        .expect(200)
        .expect((res) => {
          expect(res.body.brandName).toBe('Dashboard');
          brandSettingsId = res.body.id;
        });
    });
  });

  describe('/branding (PUT)', () => {
    it('should update brand settings', () => {
      return request(app.getHttpServer())
        .put('/branding')
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          brandName: 'Test Dashboard',
          tagline: 'Test Tagline',
          description: 'Test Description',
        })
        .expect(200)
        .expect((res) => {
          expect(res.body.brandName).toBe('Test Dashboard');
          expect(res.body.tagline).toBe('Test Tagline');
          expect(res.body.description).toBe('Test Description');
        });
    });

    it('should update only provided fields', () => {
      return request(app.getHttpServer())
        .put('/branding')
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          brandName: 'Updated Dashboard',
        })
        .expect(200)
        .expect((res) => {
          expect(res.body.brandName).toBe('Updated Dashboard');
          // Other fields should remain unchanged
          expect(res.body).toHaveProperty('tagline');
        });
    });

    it('should validate brand name length', () => {
      return request(app.getHttpServer())
        .put('/branding')
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          brandName: '', // Empty string
        })
        .expect(400);
    });

    it('should validate email format', () => {
      return request(app.getHttpServer())
        .put('/branding')
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          supportEmail: 'invalid-email',
        })
        .expect(400);
    });

    it('should validate URL format', () => {
      return request(app.getHttpServer())
        .put('/branding')
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          websiteUrl: 'not-a-url',
        })
        .expect(400);
    });

    it('should update social links', () => {
      return request(app.getHttpServer())
        .put('/branding')
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          socialLinks: {
            twitter: 'https://twitter.com/test',
            linkedin: 'https://linkedin.com/company/test',
          },
        })
        .expect(200)
        .expect((res) => {
          expect(res.body.socialLinks).toHaveProperty('twitter');
          expect(res.body.socialLinks).toHaveProperty('linkedin');
        });
    });
  });

  describe('/branding/reset (POST)', () => {
    it('should reset to default branding', async () => {
      // First update settings
      await request(app.getHttpServer())
        .put('/branding')
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          brandName: 'Custom Dashboard',
          tagline: 'Custom Tagline',
        });

      // Then reset
      return request(app.getHttpServer())
        .post('/branding/reset')
        .set('Authorization', `Bearer ${authToken}`)
        .expect(200)
        .expect((res) => {
          expect(res.body.brandName).toBe('Dashboard');
          expect(res.body.tagline).toBeNull();
          expect(res.body.description).toBeNull();
          expect(res.body.logoUrl).toBeNull();
        });
    });
  });

  describe('Data Persistence', () => {
    it('should persist brand settings across requests', async () => {
      // Update settings
      await request(app.getHttpServer())
        .put('/branding')
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          brandName: 'Persistent Dashboard',
          tagline: 'Persistent Tagline',
        });

      // Verify persistence
      return request(app.getHttpServer())
        .get('/branding')
        .expect(200)
        .expect((res) => {
          expect(res.body.brandName).toBe('Persistent Dashboard');
          expect(res.body.tagline).toBe('Persistent Tagline');
        });
    });

    it('should handle JSON social links correctly', async () => {
      const socialLinks = {
        twitter: 'https://twitter.com/test',
        linkedin: 'https://linkedin.com/company/test',
        facebook: 'https://facebook.com/test',
      };

      await request(app.getHttpServer())
        .put('/branding')
        .set('Authorization', `Bearer ${authToken}`)
        .send({ socialLinks });

      return request(app.getHttpServer())
        .get('/branding')
        .expect(200)
        .expect((res) => {
          expect(res.body.socialLinks).toEqual(socialLinks);
        });
    });
  });

  describe('Type Safety', () => {
    it('should return all required fields', () => {
      return request(app.getHttpServer())
        .get('/branding')
        .expect(200)
        .expect((res) => {
          expect(res.body).toHaveProperty('id');
          expect(res.body).toHaveProperty('brandName');
          expect(res.body).toHaveProperty('createdAt');
          expect(res.body).toHaveProperty('updatedAt');
        });
    });

    it('should handle optional fields correctly', () => {
      return request(app.getHttpServer())
        .get('/branding')
        .expect(200)
        .expect((res) => {
          // Optional fields should exist but may be null
          expect('tagline' in res.body).toBe(true);
          expect('description' in res.body).toBe(true);
          expect('logoUrl' in res.body).toBe(true);
          expect('logoDarkUrl' in res.body).toBe(true);
          expect('faviconUrl' in res.body).toBe(true);
          expect('websiteUrl' in res.body).toBe(true);
          expect('supportEmail' in res.body).toBe(true);
          expect('socialLinks' in res.body).toBe(true);
        });
    });
  });
});
