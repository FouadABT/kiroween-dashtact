import 'reflect-metadata';
import { validate } from 'class-validator';
import { plainToInstance } from 'class-transformer';
import { GlobalSettingsDto } from './global-settings.dto';

describe('GlobalSettingsDto', () => {
  describe('Theme Settings', () => {
    it('should validate valid theme settings', async () => {
      const dto = plainToInstance(GlobalSettingsDto, {
        theme: {
          primaryColor: '#3b82f6',
          secondaryColor: '#8b5cf6',
          fontFamily: 'Inter, sans-serif',
          mode: 'light',
          colors: {
            primary: { light: '#3b82f6', dark: '#60a5fa' },
            secondary: { light: '#8b5cf6', dark: '#a78bfa' },
            accent: { light: '#10b981', dark: '#34d399' },
          },
        },
      });

      const errors = await validate(dto);
      expect(errors.length).toBe(0);
    });

    it('should reject invalid theme mode', async () => {
      const dto = plainToInstance(GlobalSettingsDto, {
        theme: {
          mode: 'invalid',
        },
      });

      const errors = await validate(dto);
      expect(errors.length).toBeGreaterThan(0);
      expect(errors[0].property).toBe('theme');
    });

    it('should allow optional theme fields', async () => {
      const dto = plainToInstance(GlobalSettingsDto, {
        theme: {
          primaryColor: '#3b82f6',
        },
      });

      const errors = await validate(dto);
      expect(errors.length).toBe(0);
    });
  });

  describe('Layout Settings', () => {
    it('should validate valid layout settings', async () => {
      const dto = plainToInstance(GlobalSettingsDto, {
        layout: {
          maxWidth: 'container',
          spacing: 'normal',
          containerWidth: 'standard',
          sectionSpacing: 'relaxed',
          contentAlignment: 'center',
        },
      });

      const errors = await validate(dto);
      expect(errors.length).toBe(0);
    });

    it('should reject invalid maxWidth', async () => {
      const dto = plainToInstance(GlobalSettingsDto, {
        layout: {
          maxWidth: 'invalid',
        },
      });

      const errors = await validate(dto);
      expect(errors.length).toBeGreaterThan(0);
    });

    it('should reject invalid spacing', async () => {
      const dto = plainToInstance(GlobalSettingsDto, {
        layout: {
          spacing: 'invalid',
        },
      });

      const errors = await validate(dto);
      expect(errors.length).toBeGreaterThan(0);
    });

    it('should reject invalid contentAlignment', async () => {
      const dto = plainToInstance(GlobalSettingsDto, {
        layout: {
          contentAlignment: 'invalid',
        },
      });

      const errors = await validate(dto);
      expect(errors.length).toBeGreaterThan(0);
    });
  });

  describe('SEO Settings', () => {
    it('should validate valid SEO settings', async () => {
      const dto = plainToInstance(GlobalSettingsDto, {
        seo: {
          title: 'My Landing Page',
          description: 'A great landing page',
          keywords: ['landing', 'page', 'awesome'],
          ogImage: 'https://example.com/og-image.jpg',
          ogTitle: 'My Landing Page - OG',
          ogDescription: 'OG description',
          twitterCard: 'summary_large_image',
          structuredData: true,
        },
      });

      const errors = await validate(dto);
      expect(errors.length).toBe(0);
    });

    it('should transform comma-separated keywords string to array', async () => {
      const dto = plainToInstance(GlobalSettingsDto, {
        seo: {
          title: 'My Landing Page',
          description: 'A great landing page',
          keywords: 'landing, page, awesome',
        },
      });

      const errors = await validate(dto);
      expect(errors.length).toBe(0);
      expect(dto.seo?.keywords).toEqual(['landing', 'page', 'awesome']);
    });

    it('should handle keywords with extra whitespace', async () => {
      const dto = plainToInstance(GlobalSettingsDto, {
        seo: {
          keywords: '  landing  ,  page  ,  awesome  ',
        },
      });

      const errors = await validate(dto);
      expect(errors.length).toBe(0);
      expect(dto.seo?.keywords).toEqual(['landing', 'page', 'awesome']);
    });

    it('should accept keywords as array directly', async () => {
      const dto = plainToInstance(GlobalSettingsDto, {
        seo: {
          keywords: ['landing', 'page', 'awesome'],
        },
      });

      const errors = await validate(dto);
      expect(errors.length).toBe(0);
      expect(dto.seo?.keywords).toEqual(['landing', 'page', 'awesome']);
    });

    it('should handle single keyword string', async () => {
      const dto = plainToInstance(GlobalSettingsDto, {
        seo: {
          keywords: 'landing',
        },
      });

      const errors = await validate(dto);
      expect(errors.length).toBe(0);
      expect(dto.seo?.keywords).toEqual(['landing']);
    });

    it('should reject invalid twitterCard', async () => {
      const dto = plainToInstance(GlobalSettingsDto, {
        seo: {
          twitterCard: 'invalid',
        },
      });

      const errors = await validate(dto);
      expect(errors.length).toBeGreaterThan(0);
    });

    it('should allow optional SEO fields', async () => {
      const dto = plainToInstance(GlobalSettingsDto, {
        seo: {
          title: 'My Landing Page',
        },
      });

      const errors = await validate(dto);
      expect(errors.length).toBe(0);
    });

    it('should allow undefined keywords', async () => {
      const dto = plainToInstance(GlobalSettingsDto, {
        seo: {
          title: 'My Landing Page',
          description: 'A great landing page',
        },
      });

      const errors = await validate(dto);
      expect(errors.length).toBe(0);
      expect(dto.seo?.keywords).toBeUndefined();
    });
  });

  describe('General Settings', () => {
    it('should validate valid general settings', async () => {
      const dto = plainToInstance(GlobalSettingsDto, {
        general: {
          title: 'My Site',
          description: 'Site description',
          favicon: '/favicon.ico',
          language: 'en',
        },
      });

      const errors = await validate(dto);
      expect(errors.length).toBe(0);
    });

    it('should allow optional general fields', async () => {
      const dto = plainToInstance(GlobalSettingsDto, {
        general: {
          title: 'My Site',
        },
      });

      const errors = await validate(dto);
      expect(errors.length).toBe(0);
    });
  });

  describe('Performance Settings', () => {
    it('should validate valid performance settings', async () => {
      const dto = plainToInstance(GlobalSettingsDto, {
        performance: {
          imageOptimization: true,
          lazyLoading: true,
          cacheStrategy: 'aggressive',
        },
      });

      const errors = await validate(dto);
      expect(errors.length).toBe(0);
    });

    it('should reject invalid cacheStrategy', async () => {
      const dto = plainToInstance(GlobalSettingsDto, {
        performance: {
          cacheStrategy: 'invalid',
        },
      });

      const errors = await validate(dto);
      expect(errors.length).toBeGreaterThan(0);
    });

    it('should allow optional performance fields', async () => {
      const dto = plainToInstance(GlobalSettingsDto, {
        performance: {
          imageOptimization: true,
        },
      });

      const errors = await validate(dto);
      expect(errors.length).toBe(0);
    });
  });

  describe('Advanced Settings', () => {
    it('should validate valid advanced settings', async () => {
      const dto = plainToInstance(GlobalSettingsDto, {
        advanced: {
          customCSS: '.custom { color: red; }',
          customJS: 'console.log("test");',
          analyticsId: 'UA-123456-1',
          gtmId: 'GTM-XXXXX',
          thirdPartyScripts: [
            'https://example.com/script1.js',
            'https://example.com/script2.js',
          ],
        },
      });

      const errors = await validate(dto);
      expect(errors.length).toBe(0);
    });

    it('should allow optional advanced fields', async () => {
      const dto = plainToInstance(GlobalSettingsDto, {
        advanced: {
          analyticsId: 'UA-123456-1',
        },
      });

      const errors = await validate(dto);
      expect(errors.length).toBe(0);
    });

    it('should validate thirdPartyScripts as string array', async () => {
      const dto = plainToInstance(GlobalSettingsDto, {
        advanced: {
          thirdPartyScripts: ['https://example.com/script.js'],
        },
      });

      const errors = await validate(dto);
      expect(errors.length).toBe(0);
    });
  });

  describe('Complete Settings', () => {
    it('should validate complete settings object', async () => {
      const dto = plainToInstance(GlobalSettingsDto, {
        theme: {
          primaryColor: '#3b82f6',
          mode: 'light',
        },
        layout: {
          maxWidth: 'container',
          spacing: 'normal',
        },
        seo: {
          title: 'My Landing Page',
          description: 'Description',
        },
        general: {
          title: 'My Site',
          language: 'en',
        },
        performance: {
          imageOptimization: true,
          lazyLoading: true,
        },
        advanced: {
          analyticsId: 'UA-123456-1',
        },
      });

      const errors = await validate(dto);
      expect(errors.length).toBe(0);
    });

    it('should allow empty settings object', async () => {
      const dto = plainToInstance(GlobalSettingsDto, {});

      const errors = await validate(dto);
      expect(errors.length).toBe(0);
    });

    it('should allow partial settings', async () => {
      const dto = plainToInstance(GlobalSettingsDto, {
        theme: {
          primaryColor: '#3b82f6',
        },
        seo: {
          title: 'My Page',
        },
      });

      const errors = await validate(dto);
      expect(errors.length).toBe(0);
    });
  });

  describe('Nested Validation', () => {
    it('should validate nested color pairs', async () => {
      const dto = plainToInstance(GlobalSettingsDto, {
        theme: {
          colors: {
            primary: {
              light: '#3b82f6',
              dark: '#60a5fa',
            },
          },
        },
      });

      const errors = await validate(dto);
      expect(errors.length).toBe(0);
    });

    it('should allow partial color pairs', async () => {
      const dto = plainToInstance(GlobalSettingsDto, {
        theme: {
          colors: {
            primary: {
              light: '#3b82f6',
            },
          },
        },
      });

      const errors = await validate(dto);
      expect(errors.length).toBe(0);
    });
  });
});
