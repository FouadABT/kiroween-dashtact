import { validate } from 'class-validator';
import { plainToInstance } from 'class-transformer';
import { StorefrontQueryDto, SortBy } from './storefront-query.dto';

describe('StorefrontQueryDto', () => {
  describe('Validation', () => {
    it('should accept valid query with all fields', async () => {
      const dto = plainToInstance(StorefrontQueryDto, {
        search: 'laptop',
        categorySlug: 'electronics',
        tagSlug: 'featured',
        minPrice: 100,
        maxPrice: 1000,
        isFeatured: true,
        sortBy: SortBy.PRICE_ASC,
        page: 1,
        limit: 24,
      });

      const errors = await validate(dto);
      expect(errors.length).toBe(0);
    });

    it('should accept empty query (all fields optional)', async () => {
      const dto = plainToInstance(StorefrontQueryDto, {});

      const errors = await validate(dto);
      expect(errors.length).toBe(0);
    });

    it('should accept query with only search', async () => {
      const dto = plainToInstance(StorefrontQueryDto, {
        search: 'laptop',
      });

      const errors = await validate(dto);
      expect(errors.length).toBe(0);
    });

    it('should accept query with only category filter', async () => {
      const dto = plainToInstance(StorefrontQueryDto, {
        categorySlug: 'electronics',
      });

      const errors = await validate(dto);
      expect(errors.length).toBe(0);
    });

    it('should accept query with price range', async () => {
      const dto = plainToInstance(StorefrontQueryDto, {
        minPrice: 100,
        maxPrice: 500,
      });

      const errors = await validate(dto);
      expect(errors.length).toBe(0);
    });

    it('should accept query with only minPrice', async () => {
      const dto = plainToInstance(StorefrontQueryDto, {
        minPrice: 100,
      });

      const errors = await validate(dto);
      expect(errors.length).toBe(0);
    });

    it('should accept query with only maxPrice', async () => {
      const dto = plainToInstance(StorefrontQueryDto, {
        maxPrice: 1000,
      });

      const errors = await validate(dto);
      expect(errors.length).toBe(0);
    });

    it('should accept isFeatured filter', async () => {
      const dto = plainToInstance(StorefrontQueryDto, {
        isFeatured: true,
      });

      const errors = await validate(dto);
      expect(errors.length).toBe(0);
    });

    it('should accept all sort options', async () => {
      const sortOptions = [
        SortBy.PRICE_ASC,
        SortBy.PRICE_DESC,
        SortBy.NAME_ASC,
        SortBy.NAME_DESC,
        SortBy.NEWEST,
        SortBy.OLDEST,
      ];

      for (const sortBy of sortOptions) {
        const dto = plainToInstance(StorefrontQueryDto, { sortBy });
        const errors = await validate(dto);
        expect(errors.length).toBe(0);
      }
    });

    it('should use default values for page and limit', () => {
      const dto = plainToInstance(StorefrontQueryDto, {});
      expect(dto.page).toBe(1);
      expect(dto.limit).toBe(24);
    });
  });

  describe('Type Transformation', () => {
    it('should transform string numbers to numbers', async () => {
      const dto = plainToInstance(StorefrontQueryDto, {
        minPrice: '100',
        maxPrice: '1000',
        page: '2',
        limit: '50',
      });

      expect(typeof dto.minPrice).toBe('number');
      expect(typeof dto.maxPrice).toBe('number');
      expect(typeof dto.page).toBe('number');
      expect(typeof dto.limit).toBe('number');
      expect(dto.minPrice).toBe(100);
      expect(dto.maxPrice).toBe(1000);
      expect(dto.page).toBe(2);
      expect(dto.limit).toBe(50);
    });

    it('should transform string boolean to boolean', async () => {
      const dto = plainToInstance(StorefrontQueryDto, {
        isFeatured: 'true',
      });

      expect(typeof dto.isFeatured).toBe('boolean');
      expect(dto.isFeatured).toBe(true);
    });
  });

  describe('Validation Errors', () => {
    it('should reject negative minPrice', async () => {
      const dto = plainToInstance(StorefrontQueryDto, {
        minPrice: -10,
      });

      const errors = await validate(dto);
      expect(errors.length).toBeGreaterThan(0);
      expect(errors[0].property).toBe('minPrice');
    });

    it('should reject negative maxPrice', async () => {
      const dto = plainToInstance(StorefrontQueryDto, {
        maxPrice: -100,
      });

      const errors = await validate(dto);
      expect(errors.length).toBeGreaterThan(0);
      expect(errors[0].property).toBe('maxPrice');
    });

    it('should reject page less than 1', async () => {
      const dto = plainToInstance(StorefrontQueryDto, {
        page: 0,
      });

      const errors = await validate(dto);
      expect(errors.length).toBeGreaterThan(0);
      expect(errors[0].property).toBe('page');
    });

    it('should reject limit less than 1', async () => {
      const dto = plainToInstance(StorefrontQueryDto, {
        limit: 0,
      });

      const errors = await validate(dto);
      expect(errors.length).toBeGreaterThan(0);
      expect(errors[0].property).toBe('limit');
    });

    it('should reject limit greater than 100', async () => {
      const dto = plainToInstance(StorefrontQueryDto, {
        limit: 101,
      });

      const errors = await validate(dto);
      expect(errors.length).toBeGreaterThan(0);
      expect(errors[0].property).toBe('limit');
    });

    it('should reject invalid sortBy value', async () => {
      const dto = plainToInstance(StorefrontQueryDto, {
        sortBy: 'invalid_sort' as any,
      });

      const errors = await validate(dto);
      expect(errors.length).toBeGreaterThan(0);
      expect(errors[0].property).toBe('sortBy');
    });

    it('should reject non-string search', async () => {
      const dto = plainToInstance(StorefrontQueryDto, {
        search: 123 as any,
      });

      const errors = await validate(dto);
      expect(errors.length).toBeGreaterThan(0);
      expect(errors[0].property).toBe('search');
    });

    it('should reject non-string categorySlug', async () => {
      const dto = plainToInstance(StorefrontQueryDto, {
        categorySlug: 123 as any,
      });

      const errors = await validate(dto);
      expect(errors.length).toBeGreaterThan(0);
      expect(errors[0].property).toBe('categorySlug');
    });

    it('should reject non-string tagSlug', async () => {
      const dto = plainToInstance(StorefrontQueryDto, {
        tagSlug: 123 as any,
      });

      const errors = await validate(dto);
      expect(errors.length).toBeGreaterThan(0);
      expect(errors[0].property).toBe('tagSlug');
    });

    it('should reject non-boolean isFeatured', async () => {
      const dto = plainToInstance(StorefrontQueryDto, {
        isFeatured: 'not-a-boolean' as any,
      });

      const errors = await validate(dto);
      expect(errors.length).toBeGreaterThan(0);
      expect(errors[0].property).toBe('isFeatured');
    });
  });

  describe('Edge Cases', () => {
    it('should handle zero prices', async () => {
      const dto = plainToInstance(StorefrontQueryDto, {
        minPrice: 0,
        maxPrice: 0,
      });

      const errors = await validate(dto);
      expect(errors.length).toBe(0);
    });

    it('should handle very large prices', async () => {
      const dto = plainToInstance(StorefrontQueryDto, {
        minPrice: 999999,
        maxPrice: 9999999,
      });

      const errors = await validate(dto);
      expect(errors.length).toBe(0);
    });

    it('should handle maximum limit of 100', async () => {
      const dto = plainToInstance(StorefrontQueryDto, {
        limit: 100,
      });

      const errors = await validate(dto);
      expect(errors.length).toBe(0);
    });

    it('should handle empty strings', async () => {
      const dto = plainToInstance(StorefrontQueryDto, {
        search: '',
        categorySlug: '',
        tagSlug: '',
      });

      const errors = await validate(dto);
      expect(errors.length).toBe(0);
    });

    it('should handle special characters in search', async () => {
      const dto = plainToInstance(StorefrontQueryDto, {
        search: 'laptop & desktop (2024)',
      });

      const errors = await validate(dto);
      expect(errors.length).toBe(0);
    });

    it('should handle slugs with hyphens', async () => {
      const dto = plainToInstance(StorefrontQueryDto, {
        categorySlug: 'home-and-garden',
        tagSlug: 'best-seller',
      });

      const errors = await validate(dto);
      expect(errors.length).toBe(0);
    });
  });

  describe('SortBy Enum', () => {
    it('should have correct enum values', () => {
      expect(SortBy.PRICE_ASC).toBe('price_asc');
      expect(SortBy.PRICE_DESC).toBe('price_desc');
      expect(SortBy.NAME_ASC).toBe('name_asc');
      expect(SortBy.NAME_DESC).toBe('name_desc');
      expect(SortBy.NEWEST).toBe('newest');
      expect(SortBy.OLDEST).toBe('oldest');
    });

    it('should have all expected sort options', () => {
      const sortOptions = Object.values(SortBy);
      expect(sortOptions).toContain('price_asc');
      expect(sortOptions).toContain('price_desc');
      expect(sortOptions).toContain('name_asc');
      expect(sortOptions).toContain('name_desc');
      expect(sortOptions).toContain('newest');
      expect(sortOptions).toContain('oldest');
      expect(sortOptions.length).toBe(6);
    });
  });

  describe('Real-World Scenarios', () => {
    it('should handle typical product search query', async () => {
      const dto = plainToInstance(StorefrontQueryDto, {
        search: 'wireless headphones',
        minPrice: 50,
        maxPrice: 200,
        sortBy: SortBy.PRICE_ASC,
        page: 1,
        limit: 24,
      });

      const errors = await validate(dto);
      expect(errors.length).toBe(0);
    });

    it('should handle category browsing query', async () => {
      const dto = plainToInstance(StorefrontQueryDto, {
        categorySlug: 'electronics',
        sortBy: SortBy.NEWEST,
        page: 1,
        limit: 24,
      });

      const errors = await validate(dto);
      expect(errors.length).toBe(0);
    });

    it('should handle featured products query', async () => {
      const dto = plainToInstance(StorefrontQueryDto, {
        isFeatured: true,
        sortBy: SortBy.PRICE_DESC,
        limit: 12,
      });

      const errors = await validate(dto);
      expect(errors.length).toBe(0);
    });

    it('should handle tag filtering query', async () => {
      const dto = plainToInstance(StorefrontQueryDto, {
        tagSlug: 'sale',
        sortBy: SortBy.PRICE_ASC,
        page: 1,
      });

      const errors = await validate(dto);
      expect(errors.length).toBe(0);
    });

    it('should handle price range filtering', async () => {
      const dto = plainToInstance(StorefrontQueryDto, {
        categorySlug: 'laptops',
        minPrice: 500,
        maxPrice: 1500,
        sortBy: SortBy.PRICE_ASC,
      });

      const errors = await validate(dto);
      expect(errors.length).toBe(0);
    });

    it('should handle pagination query', async () => {
      const dto = plainToInstance(StorefrontQueryDto, {
        categorySlug: 'clothing',
        page: 3,
        limit: 48,
      });

      const errors = await validate(dto);
      expect(errors.length).toBe(0);
    });
  });
});
