import { validate } from 'class-validator';
import { plainToInstance } from 'class-transformer';
import { SearchQueryDto } from './search-query.dto';

describe('SearchQueryDto', () => {
  describe('validation', () => {
    it('should validate a valid search query', async () => {
      const dto = plainToInstance(SearchQueryDto, {
        q: 'test query',
        type: 'users',
        page: 1,
        limit: 20,
        sortBy: 'relevance',
      });

      const errors = await validate(dto);
      expect(errors.length).toBe(0);
    });

    it('should validate with minimal required fields', async () => {
      const dto = plainToInstance(SearchQueryDto, {
        q: 'test',
      });

      const errors = await validate(dto);
      expect(errors.length).toBe(0);
      expect(dto.type).toBe('all');
      expect(dto.page).toBe(1);
      expect(dto.limit).toBe(20);
      expect(dto.sortBy).toBe('relevance');
    });

    it('should fail validation when query is missing', async () => {
      const dto = plainToInstance(SearchQueryDto, {});

      const errors = await validate(dto);
      expect(errors.length).toBeGreaterThan(0);
      expect(errors[0].property).toBe('q');
    });

    it('should fail validation when query exceeds max length', async () => {
      const dto = plainToInstance(SearchQueryDto, {
        q: 'a'.repeat(201),
      });

      const errors = await validate(dto);
      expect(errors.length).toBeGreaterThan(0);
      expect(errors[0].constraints).toHaveProperty('maxLength');
    });

    it('should fail validation for invalid entity type', async () => {
      const dto = plainToInstance(SearchQueryDto, {
        q: 'test',
        type: 'invalid',
      });

      const errors = await validate(dto);
      expect(errors.length).toBeGreaterThan(0);
      const typeError = errors.find((e) => e.property === 'type');
      expect(typeError).toBeDefined();
      expect(typeError?.constraints).toHaveProperty('isIn');
    });

    it('should validate all valid entity types', async () => {
      const validTypes = ['all', 'users', 'products', 'posts', 'pages', 'customers', 'orders'];

      for (const type of validTypes) {
        const dto = plainToInstance(SearchQueryDto, {
          q: 'test',
          type,
        });

        const errors = await validate(dto);
        expect(errors.length).toBe(0);
      }
    });

    it('should fail validation when page is less than 1', async () => {
      const dto = plainToInstance(SearchQueryDto, {
        q: 'test',
        page: 0,
      });

      const errors = await validate(dto);
      expect(errors.length).toBeGreaterThan(0);
      const pageError = errors.find((e) => e.property === 'page');
      expect(pageError).toBeDefined();
      expect(pageError?.constraints).toHaveProperty('min');
    });

    it('should fail validation when page is not an integer', async () => {
      const dto = plainToInstance(SearchQueryDto, {
        q: 'test',
        page: 1.5,
      });

      const errors = await validate(dto);
      expect(errors.length).toBeGreaterThan(0);
      const pageError = errors.find((e) => e.property === 'page');
      expect(pageError).toBeDefined();
    });

    it('should fail validation when limit is less than 1', async () => {
      const dto = plainToInstance(SearchQueryDto, {
        q: 'test',
        limit: 0,
      });

      const errors = await validate(dto);
      expect(errors.length).toBeGreaterThan(0);
      const limitError = errors.find((e) => e.property === 'limit');
      expect(limitError).toBeDefined();
      expect(limitError?.constraints).toHaveProperty('min');
    });

    it('should fail validation when limit exceeds 100', async () => {
      const dto = plainToInstance(SearchQueryDto, {
        q: 'test',
        limit: 101,
      });

      const errors = await validate(dto);
      expect(errors.length).toBeGreaterThan(0);
      const limitError = errors.find((e) => e.property === 'limit');
      expect(limitError).toBeDefined();
      expect(limitError?.constraints).toHaveProperty('max');
    });

    it('should validate limit at boundary values', async () => {
      const dto1 = plainToInstance(SearchQueryDto, {
        q: 'test',
        limit: 1,
      });
      const errors1 = await validate(dto1);
      expect(errors1.length).toBe(0);

      const dto2 = plainToInstance(SearchQueryDto, {
        q: 'test',
        limit: 100,
      });
      const errors2 = await validate(dto2);
      expect(errors2.length).toBe(0);
    });

    it('should fail validation for invalid sortBy value', async () => {
      const dto = plainToInstance(SearchQueryDto, {
        q: 'test',
        sortBy: 'invalid',
      });

      const errors = await validate(dto);
      expect(errors.length).toBeGreaterThan(0);
      const sortError = errors.find((e) => e.property === 'sortBy');
      expect(sortError).toBeDefined();
      expect(sortError?.constraints).toHaveProperty('isIn');
    });

    it('should validate all valid sortBy values', async () => {
      const validSortBy = ['relevance', 'date', 'name'];

      for (const sortBy of validSortBy) {
        const dto = plainToInstance(SearchQueryDto, {
          q: 'test',
          sortBy,
        });

        const errors = await validate(dto);
        expect(errors.length).toBe(0);
      }
    });

    it('should transform string numbers to integers', async () => {
      const dto = plainToInstance(SearchQueryDto, {
        q: 'test',
        page: '2',
        limit: '50',
      } as any);

      const errors = await validate(dto);
      expect(errors.length).toBe(0);
      expect(typeof dto.page).toBe('number');
      expect(typeof dto.limit).toBe('number');
      expect(dto.page).toBe(2);
      expect(dto.limit).toBe(50);
    });
  });
});
