import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication, ValidationPipe } from '@nestjs/common';
import * as request from 'supertest';
import { AppModule } from '../src/app.module';
import { PrismaService } from '../src/prisma/prisma.service';

describe('Settings (e2e)', () => {
  let app: INestApplication;
  let prisma: PrismaService;
  let createdSettingsId: string;

  const mockColorPalette = {
    background: 'oklch(100% 0 0)',
    foreground: 'oklch(9.84% 0.002 285.82)',
    card: 'oklch(100% 0 0)',
    cardForeground: 'oklch(9.84% 0.002 285.82)',
    popover: 'oklch(100% 0 0)',
    popoverForeground: 'oklch(9.84% 0.002 285.82)',
    primary: 'oklch(45.62% 0.217 264.05)',
    primaryForeground: 'oklch(100% 0 0)',
    secondary: 'oklch(96.15% 0.002 285.82)',
    secondaryForeground: 'oklch(9.84% 0.002 285.82)',
    muted: 'oklch(96.15% 0.002 285.82)',
    mutedForeground: 'oklch(45.62% 0.009 285.82)',
    accent: 'oklch(96.15% 0.002 285.82)',
    accentForeground: 'oklch(9.84% 0.002 285.82)',
    destructive: 'oklch(57.75% 0.226 27.33)',
    destructiveForeground: 'oklch(100% 0 0)',
    border: 'oklch(91.23% 0.004 285.82)',
    input: 'oklch(91.23% 0.004 285.82)',
    ring: 'oklch(45.62% 0.217 264.05)',
    chart1: 'oklch(63.47% 0.246 27.91)',
    chart2: 'oklch(72.69% 0.169 152.43)',
    chart3: 'oklch(66.77% 0.196 60.62)',
    chart4: 'oklch(72.01% 0.139 231.6)',
    chart5: 'oklch(64.71% 0.292 327.44)',
    sidebar: 'oklch(100% 0 0)',
    sidebarForeground: 'oklch(9.84% 0.002 285.82)',
    sidebarPrimary: 'oklch(45.62% 0.217 264.05)',
    sidebarPrimaryForeground: 'oklch(100% 0 0)',
    sidebarAccent: 'oklch(96.15% 0.002 285.82)',
    sidebarAccentForeground: 'oklch(9.84% 0.002 285.82)',
    sidebarBorder: 'oklch(91.23% 0.004 285.82)',
    sidebarRing: 'oklch(45.62% 0.217 264.05)',
    radius: '0.5rem',
  };

  const mockTypography = {
    fontFamily: {
      sans: ['Inter', 'system-ui', 'sans-serif'],
      serif: ['Georgia', 'serif'],
      mono: ['Fira Code', 'monospace'],
    },
    fontSize: {
      xs: '0.75rem',
      sm: '0.875rem',
      base: '1rem',
      lg: '1.125rem',
      xl: '1.25rem',
      '2xl': '1.5rem',
      '3xl': '1.875rem',
      '4xl': '2.25rem',
      '5xl': '3rem',
      '6xl': '3.75rem',
    },
    fontWeight: {
      light: 300,
      normal: 400,
      medium: 500,
      semibold: 600,
      bold: 700,
      extrabold: 800,
    },
    lineHeight: {
      tight: 1.25,
      normal: 1.5,
      relaxed: 1.75,
      loose: 2,
    },
    letterSpacing: {
      tighter: '-0.05em',
      tight: '-0.025em',
      normal: '0',
      wide: '0.025em',
      wider: '0.05em',
    },
  };

  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleFixture.createNestApplication();
    app.useGlobalPipes(new ValidationPipe({ whitelist: true, transform: true }));
    await app.init();

    prisma = app.get<PrismaService>(PrismaService);
  });

  afterAll(async () => {
    // Clean up test data
    if (createdSettingsId) {
      await prisma.settings.deleteMany({
        where: { id: createdSettingsId },
      });
    }
    await app.close();
  });

  describe('POST /settings', () => {
    it('should create new settings', () => {
      return request(app.getHttpServer())
        .post('/settings')
        .send({
          scope: 'user',
          themeMode: 'dark',
          activeTheme: 'custom',
          lightPalette: mockColorPalette,
          darkPalette: mockColorPalette,
          typography: mockTypography,
        })
        .expect(201)
        .expect((res) => {
          expect(res.body).toHaveProperty('id');
          expect(res.body.scope).toBe('user');
          expect(res.body.themeMode).toBe('dark');
          expect(res.body.activeTheme).toBe('custom');
          expect(res.body.lightPalette).toMatchObject(mockColorPalette);
          expect(res.body.darkPalette).toMatchObject(mockColorPalette);
          expect(res.body.typography).toMatchObject(mockTypography);
          createdSettingsId = res.body.id;
        });
    });

    it('should return 409 if user settings already exist', async () => {
      const userId = 'test-user-duplicate';
      
      // Create first settings
      await prisma.settings.create({
        data: {
          userId,
          scope: 'user',
          themeMode: 'system',
          activeTheme: 'default',
          lightPalette: mockColorPalette,
          darkPalette: mockColorPalette,
          typography: mockTypography,
        },
      });

      // Try to create duplicate
      await request(app.getHttpServer())
        .post('/settings')
        .send({
          userId,
          scope: 'user',
          themeMode: 'dark',
          activeTheme: 'custom',
          lightPalette: mockColorPalette,
          darkPalette: mockColorPalette,
          typography: mockTypography,
        })
        .expect(409);

      // Clean up
      await prisma.settings.deleteMany({ where: { userId } });
    });
  });

  describe('GET /settings', () => {
    it('should return all settings', () => {
      return request(app.getHttpServer())
        .get('/settings')
        .expect(200)
        .expect((res) => {
          expect(Array.isArray(res.body)).toBe(true);
          if (res.body.length > 0) {
            expect(res.body[0]).toHaveProperty('id');
            expect(res.body[0]).toHaveProperty('scope');
            expect(res.body[0]).toHaveProperty('themeMode');
          }
        });
    });
  });

  describe('GET /settings/global', () => {
    it('should return global settings', () => {
      return request(app.getHttpServer())
        .get('/settings/global')
        .expect(200)
        .expect((res) => {
          expect(res.body).toHaveProperty('id');
          expect(res.body.scope).toBe('global');
          expect(res.body.userId).toBeNull();
        });
    });
  });

  describe('GET /settings/:id', () => {
    it('should return settings by ID', async () => {
      if (!createdSettingsId) {
        // Create a settings entry if not exists
        const settings = await prisma.settings.create({
          data: {
            scope: 'user',
            themeMode: 'system',
            activeTheme: 'default',
            lightPalette: mockColorPalette,
            darkPalette: mockColorPalette,
            typography: mockTypography,
          },
        });
        createdSettingsId = settings.id;
      }

      return request(app.getHttpServer())
        .get(`/settings/${createdSettingsId}`)
        .expect(200)
        .expect((res) => {
          expect(res.body.id).toBe(createdSettingsId);
          expect(res.body).toHaveProperty('scope');
          expect(res.body).toHaveProperty('themeMode');
        });
    });

    it('should return 404 for non-existent settings', () => {
      return request(app.getHttpServer())
        .get('/settings/non-existent-id')
        .expect(404);
    });
  });

  describe('PATCH /settings/:id', () => {
    it('should update settings', async () => {
      if (!createdSettingsId) {
        const settings = await prisma.settings.create({
          data: {
            scope: 'user',
            themeMode: 'system',
            activeTheme: 'default',
            lightPalette: mockColorPalette,
            darkPalette: mockColorPalette,
            typography: mockTypography,
          },
        });
        createdSettingsId = settings.id;
      }

      return request(app.getHttpServer())
        .patch(`/settings/${createdSettingsId}`)
        .send({
          themeMode: 'light',
          activeTheme: 'updated',
        })
        .expect(200)
        .expect((res) => {
          expect(res.body.id).toBe(createdSettingsId);
          expect(res.body.themeMode).toBe('light');
          expect(res.body.activeTheme).toBe('updated');
        });
    });

    it('should return 404 for non-existent settings', () => {
      return request(app.getHttpServer())
        .patch('/settings/non-existent-id')
        .send({ themeMode: 'dark' })
        .expect(404);
    });
  });

  describe('DELETE /settings/:id', () => {
    it('should delete settings', async () => {
      // Create a settings entry to delete
      const settings = await prisma.settings.create({
        data: {
          scope: 'user',
          themeMode: 'system',
          activeTheme: 'default',
          lightPalette: mockColorPalette,
          darkPalette: mockColorPalette,
          typography: mockTypography,
        },
      });

      await request(app.getHttpServer())
        .delete(`/settings/${settings.id}`)
        .expect(204);

      // Verify deletion
      const deleted = await prisma.settings.findUnique({
        where: { id: settings.id },
      });
      expect(deleted).toBeNull();
    });

    it('should return 404 for non-existent settings', () => {
      return request(app.getHttpServer())
        .delete('/settings/non-existent-id')
        .expect(404);
    });
  });
});
