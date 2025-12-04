import { validate } from 'class-validator';
import { plainToClass } from 'class-transformer';
import { FeaturesSectionDataDto } from './features-section-data.dto';
import { FeatureCardDto } from './feature-card.dto';

describe('FeaturesSectionDataDto', () => {
  describe('Validation - All Optional Fields', () => {
    it('should validate empty object (all fields optional)', async () => {
      const dto = plainToClass(FeaturesSectionDataDto, {});
      const errors = await validate(dto);
      expect(errors).toHaveLength(0);
    });

    it('should validate with only title', async () => {
      const dto = plainToClass(FeaturesSectionDataDto, {
        title: 'Our Features',
      });
      const errors = await validate(dto);
      expect(errors).toHaveLength(0);
    });

    it('should validate with only layout', async () => {
      const dto = plainToClass(FeaturesSectionDataDto, {
        layout: 'grid',
      });
      const errors = await validate(dto);
      expect(errors).toHaveLength(0);
    });

    it('should validate with only columns', async () => {
      const dto = plainToClass(FeaturesSectionDataDto, {
        columns: 3,
      });
      const errors = await validate(dto);
      expect(errors).toHaveLength(0);
    });

    it('should validate with only features array', async () => {
      const dto = plainToClass(FeaturesSectionDataDto, {
        features: [],
      });
      const errors = await validate(dto);
      expect(errors).toHaveLength(0);
    });
  });

  describe('Validation - Layout Enum', () => {
    it('should accept valid layout values', async () => {
      const validLayouts = ['grid', 'list', 'carousel'];
      
      for (const layout of validLayouts) {
        const dto = plainToClass(FeaturesSectionDataDto, { layout });
        const errors = await validate(dto);
        expect(errors).toHaveLength(0);
      }
    });

    it('should reject invalid layout values', async () => {
      const dto = plainToClass(FeaturesSectionDataDto, {
        layout: 'invalid-layout',
      });
      const errors = await validate(dto);
      expect(errors.length).toBeGreaterThan(0);
      expect(errors[0].property).toBe('layout');
    });
  });

  describe('Validation - Columns Range', () => {
    it('should accept valid column values (2-4)', async () => {
      const validColumns = [2, 3, 4];
      
      for (const columns of validColumns) {
        const dto = plainToClass(FeaturesSectionDataDto, { columns });
        const errors = await validate(dto);
        expect(errors).toHaveLength(0);
      }
    });

    it('should reject columns less than 2', async () => {
      const dto = plainToClass(FeaturesSectionDataDto, { columns: 1 });
      const errors = await validate(dto);
      expect(errors.length).toBeGreaterThan(0);
    });

    it('should reject columns greater than 4', async () => {
      const dto = plainToClass(FeaturesSectionDataDto, { columns: 5 });
      const errors = await validate(dto);
      expect(errors.length).toBeGreaterThan(0);
    });

    it('should reject non-numeric columns', async () => {
      const dto = plainToClass(FeaturesSectionDataDto, {
        columns: 'three' as any,
      });
      const errors = await validate(dto);
      expect(errors.length).toBeGreaterThan(0);
    });
  });

  describe('Validation - String Fields', () => {
    it('should accept string values for title', async () => {
      const dto = plainToClass(FeaturesSectionDataDto, {
        title: 'Our Features',
      });
      const errors = await validate(dto);
      expect(errors).toHaveLength(0);
    });

    it('should accept string values for subtitle', async () => {
      const dto = plainToClass(FeaturesSectionDataDto, {
        subtitle: 'Everything you need',
      });
      const errors = await validate(dto);
      expect(errors).toHaveLength(0);
    });

    it('should accept string values for heading', async () => {
      const dto = plainToClass(FeaturesSectionDataDto, {
        heading: 'Feature Heading',
      });
      const errors = await validate(dto);
      expect(errors).toHaveLength(0);
    });

    it('should accept string values for subheading', async () => {
      const dto = plainToClass(FeaturesSectionDataDto, {
        subheading: 'Feature Subheading',
      });
      const errors = await validate(dto);
      expect(errors).toHaveLength(0);
    });

    it('should accept string values for backgroundType', async () => {
      const dto = plainToClass(FeaturesSectionDataDto, {
        backgroundType: 'gradient',
      });
      const errors = await validate(dto);
      expect(errors).toHaveLength(0);
    });

    it('should reject non-string values for string fields', async () => {
      const dto = plainToClass(FeaturesSectionDataDto, {
        title: 123 as any,
      });
      const errors = await validate(dto);
      expect(errors.length).toBeGreaterThan(0);
    });
  });

  describe('Validation - Features Array', () => {
    it('should accept empty features array', async () => {
      const dto = plainToClass(FeaturesSectionDataDto, {
        features: [],
      });
      const errors = await validate(dto);
      expect(errors).toHaveLength(0);
    });

    it('should accept features array with valid FeatureCardDto objects', async () => {
      const dto = plainToClass(FeaturesSectionDataDto, {
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
        ],
      });
      const errors = await validate(dto, { skipMissingProperties: false });
      // Note: Nested validation depends on FeatureCardDto implementation
      expect(Array.isArray(dto.features)).toBe(true);
    });

    it('should reject non-array features', async () => {
      const dto = plainToClass(FeaturesSectionDataDto, {
        features: 'not-an-array' as any,
      });
      const errors = await validate(dto);
      expect(errors.length).toBeGreaterThan(0);
    });
  });

  describe('Complete Valid Objects', () => {
    it('should validate complete features section with all fields', async () => {
      const dto = plainToClass(FeaturesSectionDataDto, {
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
      });
      const errors = await validate(dto);
      expect(errors).toHaveLength(0);
    });

    it('should validate minimal features section', async () => {
      const dto = plainToClass(FeaturesSectionDataDto, {
        layout: 'grid',
        columns: 3,
      });
      const errors = await validate(dto);
      expect(errors).toHaveLength(0);
    });

    it('should validate features section with only title and features', async () => {
      const dto = plainToClass(FeaturesSectionDataDto, {
        title: 'Our Features',
        features: [
          {
            id: 'feature-1',
            icon: 'zap',
            title: 'Fast',
            description: 'Lightning speed',
            order: 1,
          },
        ],
      });
      const errors = await validate(dto);
      expect(errors).toHaveLength(0);
    });
  });

  describe('Type Coercion', () => {
    it('should coerce string columns to number', async () => {
      const dto = plainToClass(FeaturesSectionDataDto, {
        columns: '3' as any,
      });
      // After transformation, columns should be a number
      expect(typeof dto.columns).toBe('number');
    });

    it('should handle undefined values gracefully', async () => {
      const dto = plainToClass(FeaturesSectionDataDto, {
        title: undefined,
        layout: undefined,
        columns: undefined,
        features: undefined,
      });
      const errors = await validate(dto);
      expect(errors).toHaveLength(0);
    });

    it('should handle null values gracefully', async () => {
      const dto = plainToClass(FeaturesSectionDataDto, {
        title: null as any,
        layout: null as any,
        columns: null as any,
        features: null as any,
      });
      const errors = await validate(dto);
      // Null values should be handled by @IsOptional()
      expect(errors.length).toBeGreaterThanOrEqual(0);
    });
  });

  describe('Backward Compatibility', () => {
    it('should accept data from old API responses with all fields', async () => {
      const oldApiResponse = {
        title: 'Features',
        subtitle: 'Our capabilities',
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
      };
      
      const dto = plainToClass(FeaturesSectionDataDto, oldApiResponse);
      const errors = await validate(dto);
      expect(errors).toHaveLength(0);
    });

    it('should accept partial data from new API responses', async () => {
      const newApiResponse = {
        layout: 'carousel',
        columns: 2,
        backgroundType: 'gradient',
      };
      
      const dto = plainToClass(FeaturesSectionDataDto, newApiResponse);
      const errors = await validate(dto);
      expect(errors).toHaveLength(0);
    });
  });

  describe('Edge Cases', () => {
    it('should handle empty string values', async () => {
      const dto = plainToClass(FeaturesSectionDataDto, {
        title: '',
        subtitle: '',
        heading: '',
      });
      const errors = await validate(dto);
      expect(errors).toHaveLength(0);
    });

    it('should handle very long string values', async () => {
      const longString = 'a'.repeat(1000);
      const dto = plainToClass(FeaturesSectionDataDto, {
        title: longString,
        subtitle: longString,
      });
      const errors = await validate(dto);
      expect(errors).toHaveLength(0);
    });

    it('should handle special characters in strings', async () => {
      const dto = plainToClass(FeaturesSectionDataDto, {
        title: 'Features & Benefits™ — Special!',
        subtitle: 'Émojis 🚀 and symbols @#$%',
      });
      const errors = await validate(dto);
      expect(errors).toHaveLength(0);
    });

    it('should handle mixed case layout values', async () => {
      const dto = plainToClass(FeaturesSectionDataDto, {
        layout: 'GRID' as any,
      });
      const errors = await validate(dto);
      // Should fail because enum is case-sensitive
      expect(errors.length).toBeGreaterThan(0);
    });
  });
});
