import 'reflect-metadata';
import { validate } from 'class-validator';
import { plainToInstance } from 'class-transformer';
import { HeroSectionDataDto } from './hero-section-data.dto';
import { CtaButtonDto } from './cta-button.dto';

describe('HeroSectionDataDto', () => {
  describe('Valid Data', () => {
    it('should validate a complete hero section with all fields', async () => {
      const dto = plainToInstance(HeroSectionDataDto, {
        headline: 'Welcome to Our Platform',
        subheadline: 'Build amazing things',
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
        backgroundImage: 'https://example.com/bg.jpg',
        backgroundVideo: 'https://example.com/video.mp4',
        backgroundType: 'gradient',
        backgroundColor: '#ffffff',
        gradientStart: '#ff0000',
        gradientEnd: '#0000ff',
        gradientAngle: '45deg',
        textAlignment: 'center',
        height: 'large',
        features: ['Fast', 'Secure', 'Reliable'],
        trustBadges: ['badge1.png', 'badge2.png'],
        showTrustBadges: true,
      });

      const errors = await validate(dto);
      expect(errors.length).toBe(0);
    });

    it('should validate with only required fields', async () => {
      const dto = plainToInstance(HeroSectionDataDto, {
        headline: 'Welcome',
        subheadline: 'Get started',
        primaryCta: {
          text: 'Sign Up',
          link: '/signup',
          linkType: 'url',
        },
        backgroundType: 'solid',
        textAlignment: 'left',
        height: 'medium',
      });

      const errors = await validate(dto);
      expect(errors.length).toBe(0);
    });

    it('should validate with image background type', async () => {
      const dto = plainToInstance(HeroSectionDataDto, {
        headline: 'Hero Title',
        subheadline: 'Hero subtitle',
        primaryCta: {
          text: 'CTA',
          link: '/action',
          linkType: 'url',
        },
        backgroundType: 'image',
        backgroundImage: 'https://example.com/hero.jpg',
        textAlignment: 'center',
        height: 'full',
      });

      const errors = await validate(dto);
      expect(errors.length).toBe(0);
    });

    it('should validate with video background type', async () => {
      const dto = plainToInstance(HeroSectionDataDto, {
        headline: 'Video Hero',
        subheadline: 'With video background',
        primaryCta: {
          text: 'Watch',
          link: '/video',
          linkType: 'url',
        },
        backgroundType: 'video',
        backgroundVideo: 'https://example.com/hero.mp4',
        textAlignment: 'right',
        height: 'extra-large',
      });

      const errors = await validate(dto);
      expect(errors.length).toBe(0);
    });

    it('should validate with gradient background', async () => {
      const dto = plainToInstance(HeroSectionDataDto, {
        headline: 'Gradient Hero',
        subheadline: 'Beautiful gradients',
        primaryCta: {
          text: 'Explore',
          link: '/explore',
          linkType: 'url',
        },
        backgroundType: 'gradient',
        gradientStart: '#667eea',
        gradientEnd: '#764ba2',
        gradientAngle: '135deg',
        textAlignment: 'center',
        height: 'large',
      });

      const errors = await validate(dto);
      expect(errors.length).toBe(0);
    });

    it('should validate with page link type', async () => {
      const dto = plainToInstance(HeroSectionDataDto, {
        headline: 'Internal Link',
        subheadline: 'Link to page',
        primaryCta: {
          text: 'Go to Page',
          link: 'page-id-123',
          linkType: 'page',
        },
        backgroundType: 'solid',
        textAlignment: 'center',
        height: 'medium',
      });

      const errors = await validate(dto);
      expect(errors.length).toBe(0);
    });
  });

  describe('Invalid Data', () => {
    it('should fail validation when headline is missing', async () => {
      const dto = plainToInstance(HeroSectionDataDto, {
        subheadline: 'Subtitle',
        primaryCta: {
          text: 'CTA',
          link: '/link',
          linkType: 'url',
        },
        backgroundType: 'solid',
        textAlignment: 'center',
        height: 'medium',
      });

      const errors = await validate(dto);
      expect(errors.length).toBeGreaterThan(0);
      expect(errors[0].property).toBe('headline');
    });

    it('should fail validation when headline is empty', async () => {
      const dto = plainToInstance(HeroSectionDataDto, {
        headline: '',
        subheadline: 'Subtitle',
        primaryCta: {
          text: 'CTA',
          link: '/link',
          linkType: 'url',
        },
        backgroundType: 'solid',
        textAlignment: 'center',
        height: 'medium',
      });

      const errors = await validate(dto);
      expect(errors.length).toBeGreaterThan(0);
      expect(errors[0].property).toBe('headline');
    });

    it('should fail validation when subheadline is missing', async () => {
      const dto = plainToInstance(HeroSectionDataDto, {
        headline: 'Title',
        primaryCta: {
          text: 'CTA',
          link: '/link',
          linkType: 'url',
        },
        backgroundType: 'solid',
        textAlignment: 'center',
        height: 'medium',
      });

      const errors = await validate(dto);
      expect(errors.length).toBeGreaterThan(0);
      expect(errors[0].property).toBe('subheadline');
    });

    it('should fail validation when primaryCta is missing', async () => {
      const dto = plainToInstance(HeroSectionDataDto, {
        headline: 'Title',
        subheadline: 'Subtitle',
        backgroundType: 'solid',
        textAlignment: 'center',
        height: 'medium',
      });

      const errors = await validate(dto);
      expect(errors.length).toBeGreaterThan(0);
      const ctaError = errors.find(e => e.property === 'primaryCta');
      expect(ctaError).toBeDefined();
    });

    it('should fail validation with invalid backgroundType', async () => {
      const dto = plainToInstance(HeroSectionDataDto, {
        headline: 'Title',
        subheadline: 'Subtitle',
        primaryCta: {
          text: 'CTA',
          link: '/link',
          linkType: 'url',
        },
        backgroundType: 'invalid-type',
        textAlignment: 'center',
        height: 'medium',
      });

      const errors = await validate(dto);
      expect(errors.length).toBeGreaterThan(0);
      const bgError = errors.find(e => e.property === 'backgroundType');
      expect(bgError).toBeDefined();
    });

    it('should fail validation with invalid textAlignment', async () => {
      const dto = plainToInstance(HeroSectionDataDto, {
        headline: 'Title',
        subheadline: 'Subtitle',
        primaryCta: {
          text: 'CTA',
          link: '/link',
          linkType: 'url',
        },
        backgroundType: 'solid',
        textAlignment: 'invalid-alignment',
        height: 'medium',
      });

      const errors = await validate(dto);
      expect(errors.length).toBeGreaterThan(0);
      const alignError = errors.find(e => e.property === 'textAlignment');
      expect(alignError).toBeDefined();
    });

    it('should fail validation with invalid height', async () => {
      const dto = plainToInstance(HeroSectionDataDto, {
        headline: 'Title',
        subheadline: 'Subtitle',
        primaryCta: {
          text: 'CTA',
          link: '/link',
          linkType: 'url',
        },
        backgroundType: 'solid',
        textAlignment: 'center',
        height: 'invalid-height',
      });

      const errors = await validate(dto);
      expect(errors.length).toBeGreaterThan(0);
      const heightError = errors.find(e => e.property === 'height');
      expect(heightError).toBeDefined();
    });

    it('should fail validation with invalid CTA button', async () => {
      const dto = plainToInstance(HeroSectionDataDto, {
        headline: 'Title',
        subheadline: 'Subtitle',
        primaryCta: {
          text: '',
          link: '/link',
          linkType: 'url',
        },
        backgroundType: 'solid',
        textAlignment: 'center',
        height: 'medium',
      });

      const errors = await validate(dto);
      expect(errors.length).toBeGreaterThan(0);
    });
  });

  describe('Optional Fields', () => {
    it('should allow missing secondaryCta', async () => {
      const dto = plainToInstance(HeroSectionDataDto, {
        headline: 'Title',
        subheadline: 'Subtitle',
        primaryCta: {
          text: 'CTA',
          link: '/link',
          linkType: 'url',
        },
        backgroundType: 'solid',
        textAlignment: 'center',
        height: 'medium',
      });

      const errors = await validate(dto);
      expect(errors.length).toBe(0);
    });

    it('should allow missing background images/videos', async () => {
      const dto = plainToInstance(HeroSectionDataDto, {
        headline: 'Title',
        subheadline: 'Subtitle',
        primaryCta: {
          text: 'CTA',
          link: '/link',
          linkType: 'url',
        },
        backgroundType: 'solid',
        textAlignment: 'center',
        height: 'medium',
      });

      const errors = await validate(dto);
      expect(errors.length).toBe(0);
    });

    it('should allow missing gradient properties', async () => {
      const dto = plainToInstance(HeroSectionDataDto, {
        headline: 'Title',
        subheadline: 'Subtitle',
        primaryCta: {
          text: 'CTA',
          link: '/link',
          linkType: 'url',
        },
        backgroundType: 'solid',
        textAlignment: 'center',
        height: 'medium',
      });

      const errors = await validate(dto);
      expect(errors.length).toBe(0);
    });

    it('should allow missing features array', async () => {
      const dto = plainToInstance(HeroSectionDataDto, {
        headline: 'Title',
        subheadline: 'Subtitle',
        primaryCta: {
          text: 'CTA',
          link: '/link',
          linkType: 'url',
        },
        backgroundType: 'solid',
        textAlignment: 'center',
        height: 'medium',
      });

      const errors = await validate(dto);
      expect(errors.length).toBe(0);
    });

    it('should allow missing trust badges', async () => {
      const dto = plainToInstance(HeroSectionDataDto, {
        headline: 'Title',
        subheadline: 'Subtitle',
        primaryCta: {
          text: 'CTA',
          link: '/link',
          linkType: 'url',
        },
        backgroundType: 'solid',
        textAlignment: 'center',
        height: 'medium',
      });

      const errors = await validate(dto);
      expect(errors.length).toBe(0);
    });
  });

  describe('Edge Cases', () => {
    it('should handle very long headline', async () => {
      const longHeadline = 'A'.repeat(500);
      const dto = plainToInstance(HeroSectionDataDto, {
        headline: longHeadline,
        subheadline: 'Subtitle',
        primaryCta: {
          text: 'CTA',
          link: '/link',
          linkType: 'url',
        },
        backgroundType: 'solid',
        textAlignment: 'center',
        height: 'medium',
      });

      const errors = await validate(dto);
      expect(errors.length).toBe(0);
    });

    it('should handle special characters in text', async () => {
      const dto = plainToInstance(HeroSectionDataDto, {
        headline: 'Welcome! 🎉 <script>alert("test")</script>',
        subheadline: 'Special & characters © ® ™',
        primaryCta: {
          text: 'Click → Here',
          link: '/link',
          linkType: 'url',
        },
        backgroundType: 'solid',
        textAlignment: 'center',
        height: 'medium',
      });

      const errors = await validate(dto);
      expect(errors.length).toBe(0);
    });

    it('should handle empty arrays for optional fields', async () => {
      const dto = plainToInstance(HeroSectionDataDto, {
        headline: 'Title',
        subheadline: 'Subtitle',
        primaryCta: {
          text: 'CTA',
          link: '/link',
          linkType: 'url',
        },
        backgroundType: 'solid',
        textAlignment: 'center',
        height: 'medium',
        features: [],
        trustBadges: [],
      });

      const errors = await validate(dto);
      expect(errors.length).toBe(0);
    });

    it('should handle all height options', async () => {
      const heights = ['small', 'medium', 'large', 'extra-large', 'full'];
      
      for (const height of heights) {
        const dto = plainToInstance(HeroSectionDataDto, {
          headline: 'Title',
          subheadline: 'Subtitle',
          primaryCta: {
            text: 'CTA',
            link: '/link',
            linkType: 'url',
          },
          backgroundType: 'solid',
          textAlignment: 'center',
          height,
        });

        const errors = await validate(dto);
        expect(errors.length).toBe(0);
      }
    });

    it('should handle all text alignment options', async () => {
      const alignments = ['left', 'center', 'right'];
      
      for (const alignment of alignments) {
        const dto = plainToInstance(HeroSectionDataDto, {
          headline: 'Title',
          subheadline: 'Subtitle',
          primaryCta: {
            text: 'CTA',
            link: '/link',
            linkType: 'url',
          },
          backgroundType: 'solid',
          textAlignment: alignment,
          height: 'medium',
        });

        const errors = await validate(dto);
        expect(errors.length).toBe(0);
      }
    });

    it('should handle all background types', async () => {
      const backgroundTypes = ['image', 'gradient', 'solid', 'video'];
      
      for (const bgType of backgroundTypes) {
        const dto = plainToInstance(HeroSectionDataDto, {
          headline: 'Title',
          subheadline: 'Subtitle',
          primaryCta: {
            text: 'CTA',
            link: '/link',
            linkType: 'url',
          },
          backgroundType: bgType,
          textAlignment: 'center',
          height: 'medium',
        });

        const errors = await validate(dto);
        expect(errors.length).toBe(0);
      }
    });
  });
});
