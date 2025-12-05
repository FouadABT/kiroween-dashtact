import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication, ValidationPipe } from '@nestjs/common';
import * as request from 'supertest';
import { AppModule } from '../src/app.module';
import { PrismaService } from '../src/prisma/prisma.service';

describe('Landing Page - Stats Section (E2E)', () => {
  let app: INestApplication;
  let prisma: PrismaService;
  let authToken: string;

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
        email: `test-stats-${Date.now()}@example.com`,
        password: 'TestPassword123!',
        name: 'Test User',
      });

    authToken = registerRes.body.accessToken;
  });

  afterAll(async () => {
    await app.close();
  });

  describe('Stats Section Data DTO Validation', () => {
    it('should accept stat with all fields including prefix and suffix', async () => {
      const statsSectionData = {
        title: 'Our Statistics',
        layout: 'grid',
        stats: [
          {
            id: 'stat-1',
            value: '1000',
            label: 'Happy Customers',
            icon: 'users',
            prefix: '',
            suffix: '+',
            order: 1,
          },
          {
            id: 'stat-2',
            value: '99',
            label: 'Uptime',
            icon: 'zap',
            prefix: '',
            suffix: '%',
            order: 2,
          },
          {
            id: 'stat-3',
            value: '50',
            label: 'Countries',
            icon: 'globe',
            prefix: '',
            suffix: '',
            order: 3,
          },
        ],
      };

      const response = await request(app.getHttpServer())
        .put('/landing/content')
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          sections: [
            {
              id: 'stats-1',
              type: 'stats',
              enabled: true,
              order: 1,
              data: statsSectionData,
            },
          ],
        });

      expect(response.status).toBe(200);
      expect(response.body.sections[0].data.stats).toEqual(
        expect.arrayContaining([
          expect.objectContaining({
            value: '1000',
            suffix: '+',
          }),
          expect.objectContaining({
            value: '99',
            suffix: '%',
          }),
        ]),
      );
    });

    it('should accept stat with only prefix', async () => {
      const statsSectionData = {
        title: 'Currency Stats',
        layout: 'horizontal',
        stats: [
          {
            id: 'stat-currency',
            value: '1000000',
            label: 'Revenue',
            prefix: '$',
            order: 1,
          },
        ],
      };

      const response = await request(app.getHttpServer())
        .put('/landing/content')
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          sections: [
            {
              id: 'stats-prefix',
              type: 'stats',
              enabled: true,
              order: 1,
              data: statsSectionData,
            },
          ],
        });

      expect(response.status).toBe(200);
      expect(response.body.sections[0].data.stats[0]).toMatchObject({
        prefix: '$',
        value: '1000000',
      });
    });

    it('should accept stat with only suffix', async () => {
      const statsSectionData = {
        title: 'Percentage Stats',
        layout: 'grid',
        stats: [
          {
            id: 'stat-percent',
            value: '95',
            label: 'Success Rate',
            suffix: '%',
            order: 1,
          },
        ],
      };

      const response = await request(app.getHttpServer())
        .put('/landing/content')
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          sections: [
            {
              id: 'stats-suffix',
              type: 'stats',
              enabled: true,
              order: 1,
              data: statsSectionData,
            },
          ],
        });

      expect(response.status).toBe(200);
      expect(response.body.sections[0].data.stats[0]).toMatchObject({
        suffix: '%',
        value: '95',
      });
    });

    it('should accept stat without prefix and suffix (backward compatibility)', async () => {
      const statsSectionData = {
        title: 'Legacy Stats',
        layout: 'grid',
        stats: [
          {
            id: 'stat-legacy',
            value: '500',
            label: 'Projects',
            icon: 'briefcase',
            order: 1,
          },
        ],
      };

      const response = await request(app.getHttpServer())
        .put('/landing/content')
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          sections: [
            {
              id: 'stats-legacy',
              type: 'stats',
              enabled: true,
              order: 1,
              data: statsSectionData,
            },
          ],
        });

      expect(response.status).toBe(200);
      expect(response.body.sections[0].data.stats[0]).toMatchObject({
        value: '500',
        label: 'Projects',
      });
    });

    it('should accept empty prefix and suffix strings', async () => {
      const statsSectionData = {
        title: 'Stats with Empty Affixes',
        layout: 'grid',
        stats: [
          {
            id: 'stat-empty',
            value: '42',
            label: 'Answer',
            prefix: '',
            suffix: '',
            order: 1,
          },
        ],
      };

      const response = await request(app.getHttpServer())
        .put('/landing/content')
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          sections: [
            {
              id: 'stats-empty',
              type: 'stats',
              enabled: true,
              order: 1,
              data: statsSectionData,
            },
          ],
        });

      expect(response.status).toBe(200);
      expect(response.body.sections[0].data.stats[0]).toMatchObject({
        prefix: '',
        suffix: '',
      });
    });

    it('should accept complex prefix and suffix values', async () => {
      const statsSectionData = {
        title: 'Complex Affixes',
        layout: 'grid',
        stats: [
          {
            id: 'stat-complex',
            value: '2.5',
            label: 'Rating',
            prefix: '★ ',
            suffix: ' / 5',
            order: 1,
          },
        ],
      };

      const response = await request(app.getHttpServer())
        .put('/landing/content')
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          sections: [
            {
              id: 'stats-complex',
              type: 'stats',
              enabled: true,
              order: 1,
              data: statsSectionData,
            },
          ],
        });

      expect(response.status).toBe(200);
      expect(response.body.sections[0].data.stats[0]).toMatchObject({
        prefix: '★ ',
        suffix: ' / 5',
        value: '2.5',
      });
    });

    it('should accept minimal stats section', async () => {
      const statsSectionData = {
        layout: 'grid',
        stats: [
          {
            id: 'stat-minimal',
            value: '100',
            label: 'Minimal',
            order: 1,
          },
        ],
      };

      const response = await request(app.getHttpServer())
        .put('/landing/content')
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          sections: [
            {
              id: 'stats-minimal',
              type: 'stats',
              enabled: true,
              order: 1,
              data: statsSectionData,
            },
          ],
        });

      expect(response.status).toBe(200);
      expect(response.body.sections[0].data.stats[0]).toMatchObject({
        value: '100',
        label: 'Minimal',
      });
    });
  });

  describe('Stats Section Data Persistence', () => {
    it('should persist stats with prefix and suffix to database', async () => {
      const statsSectionData = {
        title: 'Persistent Stats',
        layout: 'grid',
        stats: [
          {
            id: 'stat-persist',
            value: '500',
            label: 'Users',
            prefix: '',
            suffix: 'K',
            order: 1,
          },
        ],
      };

      const updateRes = await request(app.getHttpServer())
        .put('/landing/content')
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          sections: [
            {
              id: 'stats-persist',
              type: 'stats',
              enabled: true,
              order: 1,
              data: statsSectionData,
            },
          ],
        });

      expect(updateRes.status).toBe(200);

      // Fetch content and verify persistence
      const getRes = await request(app.getHttpServer())
        .get('/landing/content')
        .set('Authorization', `Bearer ${authToken}`);

      expect(getRes.status).toBe(200);
      const statsSection = getRes.body.sections.find(
        (s: any) => s.id === 'stats-persist',
      );
      expect(statsSection).toBeDefined();
      expect(statsSection.data.stats[0]).toMatchObject({
        value: '500',
        suffix: 'K',
      });
    });

    it('should update stats with new prefix and suffix values', async () => {
      const initialData = {
        layout: 'grid',
        stats: [
          {
            id: 'stat-update',
            value: '100',
            label: 'Initial',
            order: 1,
          },
        ],
      };

      const updateRes1 = await request(app.getHttpServer())
        .put('/landing/content')
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          sections: [
            {
              id: 'stats-update',
              type: 'stats',
              enabled: true,
              order: 1,
              data: initialData,
            },
          ],
        });

      expect(updateRes1.status).toBe(200);

      // Update with prefix and suffix
      const updatedData = {
        layout: 'grid',
        stats: [
          {
            id: 'stat-update',
            value: '100',
            label: 'Updated',
            prefix: '$',
            suffix: 'M',
            order: 1,
          },
        ],
      };

      const updateRes2 = await request(app.getHttpServer())
        .put('/landing/content')
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          sections: [
            {
              id: 'stats-update',
              type: 'stats',
              enabled: true,
              order: 1,
              data: updatedData,
            },
          ],
        });

      expect(updateRes2.status).toBe(200);
      expect(updateRes2.body.sections[0].data.stats[0]).toMatchObject({
        prefix: '$',
        suffix: 'M',
      });
    });
  });

  describe('Backward Compatibility', () => {
    it('should handle legacy stats data without prefix and suffix', async () => {
      const legacyData = {
        title: 'Legacy Statistics',
        layout: 'horizontal',
        stats: [
          {
            id: 'legacy-1',
            value: '1000',
            label: 'Customers',
            icon: 'users',
            order: 1,
          },
          {
            id: 'legacy-2',
            value: '99.9',
            label: 'Uptime',
            icon: 'zap',
            order: 2,
          },
        ],
      };

      const response = await request(app.getHttpServer())
        .put('/landing/content')
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          sections: [
            {
              id: 'stats-legacy',
              type: 'stats',
              enabled: true,
              order: 1,
              data: legacyData,
            },
          ],
        });

      expect(response.status).toBe(200);
      expect(response.body.sections[0].data.stats).toHaveLength(2);
      expect(response.body.sections[0].data.stats[0]).toMatchObject({
        value: '1000',
        label: 'Customers',
      });
    });

    it('should handle mixed stats with and without prefix/suffix', async () => {
      const mixedData = {
        title: 'Mixed Stats',
        layout: 'grid',
        stats: [
          {
            id: 'mixed-1',
            value: '100',
            label: 'With Suffix',
            suffix: '%',
            order: 1,
          },
          {
            id: 'mixed-2',
            value: '500',
            label: 'Without Affixes',
            order: 2,
          },
          {
            id: 'mixed-3',
            value: '1000',
            label: 'With Prefix',
            prefix: '$',
            order: 3,
          },
        ],
      };

      const response = await request(app.getHttpServer())
        .put('/landing/content')
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          sections: [
            {
              id: 'stats-mixed',
              type: 'stats',
              enabled: true,
              order: 1,
              data: mixedData,
            },
          ],
        });

      expect(response.status).toBe(200);
      expect(response.body.sections[0].data.stats).toHaveLength(3);
      expect(response.body.sections[0].data.stats[0].suffix).toBe('%');
      expect(response.body.sections[0].data.stats[1].prefix).toBeUndefined();
      expect(response.body.sections[0].data.stats[2].prefix).toBe('$');
    });
  });
});
