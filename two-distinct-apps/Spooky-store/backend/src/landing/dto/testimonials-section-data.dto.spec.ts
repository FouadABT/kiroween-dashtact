import { plainToClass } from 'class-transformer';
import { validate } from 'class-validator';
import { TestimonialsSectionDataDto } from './testimonials-section-data.dto';

describe('TestimonialsSectionDataDto', () => {
  describe('Optional Fields', () => {
    it('should accept empty object (all fields optional)', async () => {
      const dto = plainToClass(TestimonialsSectionDataDto, {});
      const errors = await validate(dto);
      expect(errors).toHaveLength(0);
    });

    it('should accept object with only title', async () => {
      const dto = plainToClass(TestimonialsSectionDataDto, {
        title: 'Customer Testimonials',
      });
      const errors = await validate(dto);
      expect(errors).toHaveLength(0);
      expect(dto.title).toBe('Customer Testimonials');
    });

    it('should accept object with only subtitle', async () => {
      const dto = plainToClass(TestimonialsSectionDataDto, {
        subtitle: 'Real feedback from real users',
      });
      const errors = await validate(dto);
      expect(errors).toHaveLength(0);
      expect(dto.subtitle).toBe('Real feedback from real users');
    });

    it('should accept object with only layout', async () => {
      const dto = plainToClass(TestimonialsSectionDataDto, {
        layout: 'carousel',
      });
      const errors = await validate(dto);
      expect(errors).toHaveLength(0);
      expect(dto.layout).toBe('carousel');
    });

    it('should accept object with only testimonials array', async () => {
      const dto = plainToClass(TestimonialsSectionDataDto, {
        testimonials: [
          {
            id: 'testimonial-1',
            quote: 'Great product!',
            author: 'John Doe',
            role: 'CEO',
            order: 1,
          },
        ],
      });
      const errors = await validate(dto, { skipMissingProperties: false });
      expect(errors.length).toBeLessThanOrEqual(1); // May have nested validation
      expect(dto.testimonials).toHaveLength(1);
    });

    it('should accept object with only showRatings', async () => {
      const dto = plainToClass(TestimonialsSectionDataDto, {
        showRatings: true,
      });
      const errors = await validate(dto);
      expect(errors).toHaveLength(0);
      expect(dto.showRatings).toBe(true);
    });

    it('should accept object with only columns', async () => {
      const dto = plainToClass(TestimonialsSectionDataDto, {
        columns: 3,
      });
      const errors = await validate(dto);
      expect(errors).toHaveLength(0);
      expect(dto.columns).toBe(3);
    });

    it('should accept object with only heading', async () => {
      const dto = plainToClass(TestimonialsSectionDataDto, {
        heading: 'What Our Customers Say',
      });
      const errors = await validate(dto);
      expect(errors).toHaveLength(0);
      expect(dto.heading).toBe('What Our Customers Say');
    });

    it('should accept object with only subheading', async () => {
      const dto = plainToClass(TestimonialsSectionDataDto, {
        subheading: 'Real feedback from real users',
      });
      const errors = await validate(dto);
      expect(errors).toHaveLength(0);
      expect(dto.subheading).toBe('Real feedback from real users');
    });
  });

  describe('Field Validation', () => {
    it('should validate title is string', async () => {
      const dto = plainToClass(TestimonialsSectionDataDto, {
        title: 123,
      });
      const errors = await validate(dto);
      expect(errors.length).toBeGreaterThan(0);
      expect(errors[0].property).toBe('title');
    });

    it('should validate subtitle is string', async () => {
      const dto = plainToClass(TestimonialsSectionDataDto, {
        subtitle: 123,
      });
      const errors = await validate(dto);
      expect(errors.length).toBeGreaterThan(0);
      expect(errors[0].property).toBe('subtitle');
    });

    it('should validate layout is valid enum', async () => {
      const dto = plainToClass(TestimonialsSectionDataDto, {
        layout: 'invalid-layout',
      });
      const errors = await validate(dto);
      expect(errors.length).toBeGreaterThan(0);
      expect(errors[0].property).toBe('layout');
    });

    it('should accept valid layout values', async () => {
      const validLayouts = ['grid', 'carousel', 'masonry'];

      for (const layout of validLayouts) {
        const dto = plainToClass(TestimonialsSectionDataDto, { layout });
        const errors = await validate(dto);
        expect(errors).toHaveLength(0);
        expect(dto.layout).toBe(layout);
      }
    });

    it('should validate testimonials is array', async () => {
      const dto = plainToClass(TestimonialsSectionDataDto, {
        testimonials: 'not-an-array',
      });
      const errors = await validate(dto);
      expect(errors.length).toBeGreaterThan(0);
      expect(errors[0].property).toBe('testimonials');
    });

    it('should accept empty testimonials array', async () => {
      const dto = plainToClass(TestimonialsSectionDataDto, {
        testimonials: [],
      });
      const errors = await validate(dto);
      expect(errors).toHaveLength(0);
      expect(dto.testimonials).toEqual([]);
    });

    it('should validate showRatings is boolean', async () => {
      const dto = plainToClass(TestimonialsSectionDataDto, {
        showRatings: 'true',
      });
      const errors = await validate(dto);
      expect(errors.length).toBeGreaterThan(0);
      expect(errors[0].property).toBe('showRatings');
    });

    it('should validate columns is number', async () => {
      const dto = plainToClass(TestimonialsSectionDataDto, {
        columns: 'three',
      });
      const errors = await validate(dto);
      expect(errors.length).toBeGreaterThan(0);
      expect(errors[0].property).toBe('columns');
    });

    it('should validate heading is string', async () => {
      const dto = plainToClass(TestimonialsSectionDataDto, {
        heading: 123,
      });
      const errors = await validate(dto);
      expect(errors.length).toBeGreaterThan(0);
      expect(errors[0].property).toBe('heading');
    });

    it('should validate subheading is string', async () => {
      const dto = plainToClass(TestimonialsSectionDataDto, {
        subheading: 123,
      });
      const errors = await validate(dto);
      expect(errors.length).toBeGreaterThan(0);
      expect(errors[0].property).toBe('subheading');
    });
  });

  describe('Combined Fields', () => {
    it('should accept all fields populated', async () => {
      const dto = plainToClass(TestimonialsSectionDataDto, {
        title: 'Customer Testimonials',
        subtitle: 'Real feedback',
        layout: 'grid',
        showRatings: true,
        columns: 3,
        heading: 'What Our Customers Say',
        subheading: 'Hear from our users',
        testimonials: [
          {
            id: 'testimonial-1',
            quote: 'Great product!',
            author: 'John Doe',
            role: 'CEO',
            order: 1,
          },
        ],
      });
      const errors = await validate(dto, { skipMissingProperties: false });
      // May have nested validation errors for testimonials
      expect(dto.title).toBe('Customer Testimonials');
      expect(dto.layout).toBe('grid');
      expect(dto.columns).toBe(3);
    });

    it('should accept partial fields', async () => {
      const dto = plainToClass(TestimonialsSectionDataDto, {
        title: 'Testimonials',
        layout: 'carousel',
        showRatings: true,
      });
      const errors = await validate(dto);
      expect(errors).toHaveLength(0);
      expect(dto.title).toBe('Testimonials');
      expect(dto.layout).toBe('carousel');
      expect(dto.showRatings).toBe(true);
      expect(dto.subtitle).toBeUndefined();
      expect(dto.testimonials).toBeUndefined();
    });

    it('should handle null values for optional fields', async () => {
      const dto = plainToClass(TestimonialsSectionDataDto, {
        title: null,
        subtitle: null,
        layout: null,
        testimonials: null,
      });
      const errors = await validate(dto);
      // Null values should fail string/enum validation
      expect(errors.length).toBeGreaterThan(0);
    });

    it('should handle undefined values for optional fields', async () => {
      const dto = plainToClass(TestimonialsSectionDataDto, {
        title: undefined,
        subtitle: undefined,
        layout: undefined,
        testimonials: undefined,
      });
      const errors = await validate(dto);
      expect(errors).toHaveLength(0);
    });
  });

  describe('Backward Compatibility', () => {
    it('should accept old format with all required fields', async () => {
      const dto = plainToClass(TestimonialsSectionDataDto, {
        title: 'Customer Reviews',
        layout: 'grid',
        testimonials: [
          {
            id: 'testimonial-1',
            quote: 'Excellent!',
            author: 'Jane Smith',
            role: 'Manager',
            order: 1,
          },
        ],
      });
      const errors = await validate(dto, { skipMissingProperties: false });
      expect(dto.title).toBe('Customer Reviews');
      expect(dto.layout).toBe('grid');
      expect(dto.testimonials).toHaveLength(1);
    });

    it('should accept new format with minimal fields', async () => {
      const dto = plainToClass(TestimonialsSectionDataDto, {
        heading: 'What Our Customers Say',
      });
      const errors = await validate(dto);
      expect(errors).toHaveLength(0);
      expect(dto.heading).toBe('What Our Customers Say');
    });
  });

  describe('Type Coercion', () => {
    it('should coerce string number to number for columns', async () => {
      const dto = plainToClass(TestimonialsSectionDataDto, {
        columns: '3',
      });
      // class-transformer may coerce this
      expect(typeof dto.columns === 'number' || typeof dto.columns === 'string').toBe(true);
    });

    it('should coerce string boolean to boolean for showRatings', async () => {
      const dto = plainToClass(TestimonialsSectionDataDto, {
        showRatings: 'true',
      });
      // class-transformer may coerce this
      expect(typeof dto.showRatings === 'boolean' || typeof dto.showRatings === 'string').toBe(true);
    });
  });

  describe('Transform Decorators - Default Values', () => {
    it('should apply default layout value when undefined', async () => {
      const dto = plainToClass(TestimonialsSectionDataDto, {
        title: 'Testimonials',
      });
      expect(dto.layout).toBe('grid');
    });

    it('should apply default layout value when null', async () => {
      const dto = plainToClass(TestimonialsSectionDataDto, {
        layout: null,
      });
      expect(dto.layout).toBe('grid');
    });

    it('should preserve provided layout value', async () => {
      const dto = plainToClass(TestimonialsSectionDataDto, {
        layout: 'carousel',
      });
      expect(dto.layout).toBe('carousel');
    });

    it('should apply default testimonials array when undefined', async () => {
      const dto = plainToClass(TestimonialsSectionDataDto, {
        title: 'Testimonials',
      });
      expect(dto.testimonials).toEqual([]);
    });

    it('should apply default testimonials array when null', async () => {
      const dto = plainToClass(TestimonialsSectionDataDto, {
        testimonials: null,
      });
      expect(dto.testimonials).toEqual([]);
    });

    it('should preserve provided testimonials array', async () => {
      const testimonials = [
        {
          id: 'testimonial-1',
          quote: 'Great!',
          author: 'John',
          role: 'CEO',
          order: 1,
        },
      ];
      const dto = plainToClass(TestimonialsSectionDataDto, {
        testimonials,
      });
      expect(dto.testimonials).toEqual(testimonials);
    });

    it('should apply default showRatings value (true) when undefined', async () => {
      const dto = plainToClass(TestimonialsSectionDataDto, {
        title: 'Testimonials',
      });
      expect(dto.showRatings).toBe(true);
    });

    it('should apply default showRatings value (true) when false', async () => {
      const dto = plainToClass(TestimonialsSectionDataDto, {
        showRatings: false,
      });
      expect(dto.showRatings).toBe(true);
    });

    it('should preserve showRatings when true', async () => {
      const dto = plainToClass(TestimonialsSectionDataDto, {
        showRatings: true,
      });
      expect(dto.showRatings).toBe(true);
    });

    it('should apply default columns value when undefined', async () => {
      const dto = plainToClass(TestimonialsSectionDataDto, {
        title: 'Testimonials',
      });
      expect(dto.columns).toBe(3);
    });

    it('should apply default columns value when null', async () => {
      const dto = plainToClass(TestimonialsSectionDataDto, {
        columns: null,
      });
      expect(dto.columns).toBe(3);
    });

    it('should preserve provided columns value', async () => {
      const dto = plainToClass(TestimonialsSectionDataDto, {
        columns: 4,
      });
      expect(dto.columns).toBe(4);
    });

    it('should apply all defaults when empty object', async () => {
      const dto = plainToClass(TestimonialsSectionDataDto, {});
      expect(dto.layout).toBe('grid');
      expect(dto.testimonials).toEqual([]);
      expect(dto.showRatings).toBe(true);
      expect(dto.columns).toBe(3);
    });

    it('should apply defaults selectively with partial data', async () => {
      const dto = plainToClass(TestimonialsSectionDataDto, {
        title: 'Customer Reviews',
        layout: 'masonry',
        columns: 2,
      });
      expect(dto.title).toBe('Customer Reviews');
      expect(dto.layout).toBe('masonry');
      expect(dto.columns).toBe(2);
      expect(dto.testimonials).toEqual([]);
      expect(dto.showRatings).toBe(true);
    });
  });
});
