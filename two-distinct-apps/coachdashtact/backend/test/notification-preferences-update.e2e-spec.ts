import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication, ValidationPipe } from '@nestjs/common';
import * as request from 'supertest';
import { AppModule } from '../src/app.module';
import { PrismaService } from '../src/prisma/prisma.service';

describe('Notification Preferences Update (e2e)', () => {
  let app: INestApplication;
  let prisma: PrismaService;
  let authToken: string;
  let userId: string;

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

    // Create test user and get auth token
    const testUser = await prisma.user.create({
      data: {
        email: 'preference-test@example.com',
        name: 'Preference Test User',
        password: '$2b$10$abcdefghijklmnopqrstuvwxyz', // Hashed password
        roleId: (await prisma.userRole.findUnique({ where: { name: 'User' } }))
          .id,
      },
    });

    userId = testUser.id;

    // Login to get token
    const loginResponse = await request(app.getHttpServer())
      .post('/auth/login')
      .send({
        email: 'preference-test@example.com',
        password: 'password123',
      });

    authToken = loginResponse.body.accessToken;
  });

  afterAll(async () => {
    // Cleanup
    await prisma.notificationPreference.deleteMany({
      where: { userId },
    });
    await prisma.user.delete({ where: { id: userId } });
    await app.close();
  });

  describe('PATCH /notifications/preferences/:category', () => {
    it('should update preference enabled flag', async () => {
      const response = await request(app.getHttpServer())
        .patch('/notifications/preferences/SYSTEM')
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          enabled: false,
        })
        .expect(200);

      expect(response.body.enabled).toBe(false);
      expect(response.body.category).toBe('SYSTEM');
    });

    it('should update DND settings', async () => {
      const response = await request(app.getHttpServer())
        .patch('/notifications/preferences/SYSTEM')
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          dndEnabled: true,
          dndStartTime: '22:00',
          dndEndTime: '08:00',
          dndDays: [0, 6],
        })
        .expect(200);

      expect(response.body.dndEnabled).toBe(true);
      expect(response.body.dndStartTime).toBe('22:00');
      expect(response.body.dndEndTime).toBe('08:00');
      expect(response.body.dndDays).toEqual([0, 6]);
    });

    it('should handle partial updates', async () => {
      const response = await request(app.getHttpServer())
        .patch('/notifications/preferences/SECURITY')
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          dndStartTime: '23:00',
        })
        .expect(200);

      expect(response.body.dndStartTime).toBe('23:00');
    });

    it('should validate time format', async () => {
      await request(app.getHttpServer())
        .patch('/notifications/preferences/SYSTEM')
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          dndStartTime: '25:00', // Invalid hour
        })
        .expect(400);
    });

    it('should validate time format with invalid minutes', async () => {
      await request(app.getHttpServer())
        .patch('/notifications/preferences/SYSTEM')
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          dndStartTime: '22:60', // Invalid minutes
        })
        .expect(400);
    });

    it('should validate day values', async () => {
      await request(app.getHttpServer())
        .patch('/notifications/preferences/SYSTEM')
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          dndDays: [0, 7], // 7 is invalid
        })
        .expect(400);
    });

    it('should require authentication', async () => {
      await request(app.getHttpServer())
        .patch('/notifications/preferences/SYSTEM')
        .send({
          enabled: false,
        })
        .expect(401);
    });

    it('should create preference if not exists', async () => {
      // Delete existing preference
      await prisma.notificationPreference.deleteMany({
        where: {
          userId,
          category: 'CUSTOM',
        },
      });

      const response = await request(app.getHttpServer())
        .patch('/notifications/preferences/CUSTOM')
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          enabled: true,
          dndEnabled: false,
        })
        .expect(200);

      expect(response.body.category).toBe('CUSTOM');
      expect(response.body.enabled).toBe(true);
    });
  });

  describe('PATCH /notifications/preferences/dnd/settings', () => {
    it('should set DND settings for all categories', async () => {
      const response = await request(app.getHttpServer())
        .patch('/notifications/preferences/dnd/settings')
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          enabled: true,
          startTime: '22:00',
          endTime: '08:00',
          days: [0, 1, 2, 3, 4, 5, 6],
        })
        .expect(200);

      expect(response.body.message).toBe(
        'Do Not Disturb settings updated successfully',
      );

      // Verify all preferences were updated
      const preferences = await prisma.notificationPreference.findMany({
        where: { userId },
      });

      preferences.forEach((pref) => {
        expect(pref.dndEnabled).toBe(true);
        expect(pref.dndStartTime).toBe('22:00');
        expect(pref.dndEndTime).toBe('08:00');
        expect(pref.dndDays).toEqual([0, 1, 2, 3, 4, 5, 6]);
      });
    });

    it('should validate required fields', async () => {
      await request(app.getHttpServer())
        .patch('/notifications/preferences/dnd/settings')
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          enabled: true,
          // Missing startTime, endTime, days
        })
        .expect(400);
    });

    it('should validate time format in DND settings', async () => {
      await request(app.getHttpServer())
        .patch('/notifications/preferences/dnd/settings')
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          enabled: true,
          startTime: 'invalid',
          endTime: '08:00',
          days: [0, 6],
        })
        .expect(400);
    });

    it('should validate day array in DND settings', async () => {
      await request(app.getHttpServer())
        .patch('/notifications/preferences/dnd/settings')
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          enabled: true,
          startTime: '22:00',
          endTime: '08:00',
          days: 'invalid', // Should be array
        })
        .expect(400);
    });

    it('should require authentication', async () => {
      await request(app.getHttpServer())
        .patch('/notifications/preferences/dnd/settings')
        .send({
          enabled: true,
          startTime: '22:00',
          endTime: '08:00',
          days: [0, 6],
        })
        .expect(401);
    });
  });

  describe('GET /notifications/preferences/:category', () => {
    it('should get preference with updated DND settings', async () => {
      // First update the preference
      await request(app.getHttpServer())
        .patch('/notifications/preferences/SYSTEM')
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          dndEnabled: true,
          dndStartTime: '22:00',
          dndEndTime: '08:00',
          dndDays: [0, 6],
        });

      // Then retrieve it
      const response = await request(app.getHttpServer())
        .get('/notifications/preferences/SYSTEM')
        .set('Authorization', `Bearer ${authToken}`)
        .expect(200);

      expect(response.body.dndEnabled).toBe(true);
      expect(response.body.dndStartTime).toBe('22:00');
      expect(response.body.dndEndTime).toBe('08:00');
      expect(response.body.dndDays).toEqual([0, 6]);
    });
  });

  describe('GET /notifications/preferences', () => {
    it('should get all preferences with DND settings', async () => {
      const response = await request(app.getHttpServer())
        .get('/notifications/preferences')
        .set('Authorization', `Bearer ${authToken}`)
        .expect(200);

      expect(Array.isArray(response.body)).toBe(true);
      expect(response.body.length).toBeGreaterThan(0);

      // Check that each preference has DND fields
      response.body.forEach((pref: any) => {
        expect(pref).toHaveProperty('dndEnabled');
        expect(pref).toHaveProperty('dndStartTime');
        expect(pref).toHaveProperty('dndEndTime');
        expect(pref).toHaveProperty('dndDays');
      });
    });
  });

  describe('POST /notifications/preferences/reset', () => {
    it('should reset preferences to defaults', async () => {
      // First modify preferences
      await request(app.getHttpServer())
        .patch('/notifications/preferences/SYSTEM')
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          enabled: false,
          dndEnabled: true,
        });

      // Then reset
      const response = await request(app.getHttpServer())
        .post('/notifications/preferences/reset')
        .set('Authorization', `Bearer ${authToken}`)
        .expect(200);

      expect(Array.isArray(response.body)).toBe(true);

      // Verify defaults
      const systemPref = response.body.find(
        (p: any) => p.category === 'SYSTEM',
      );
      expect(systemPref.enabled).toBe(true);
      expect(systemPref.dndEnabled).toBe(false);
      expect(systemPref.dndDays).toEqual([]);
    });
  });
});
