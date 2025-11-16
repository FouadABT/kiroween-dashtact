import { validate } from 'class-validator';
import { plainToClass } from 'class-transformer';
import { WidgetSearchDto } from './widget-search.dto';

describe('WidgetSearchDto', () => {
  describe('validation', () => {
    it('should validate with required fields only', async () => {
      const dto = plainToClass(WidgetSearchDto, {
        query: 'show revenue over time',
      });

      const errors = await validate(dto);
      expect(errors).toHaveLength(0);
    });

    it('should validate with all fields', async () => {
      const dto = plainToClass(WidgetSearchDto, {
        query: 'display user statistics',
        limit: 5,
        includeScores: true,
        includeSuggestions: true,
        includeExamples: true,
      });

      const errors = await validate(dto);
      expect(errors).toHaveLength(0);
    });

    it('should fail validation when query is missing', async () => {
      const dto = plainToClass(WidgetSearchDto, {
        limit: 10,
      });

      const errors = await validate(dto);
      expect(errors.length).toBeGreaterThan(0);
      expect(errors[0].property).toBe('query');
    });

    it('should fail validation when query is empty', async () => {
      const dto = plainToClass(WidgetSearchDto, {
        query: '',
      });

      const errors = await validate(dto);
      expect(errors.length).toBeGreaterThan(0);
      expect(errors[0].property).toBe('query');
    });

    it('should fail validation when limit is not a number', async () => {
      const dto = plainToClass(WidgetSearchDto, {
        query: 'test',
        limit: 'invalid' as any,
      });

      const errors = await validate(dto);
      expect(errors.length).toBeGreaterThan(0);
      const limitError = errors.find((e) => e.property === 'limit');
      expect(limitError).toBeDefined();
    });

    it('should fail validation when limit is less than 1', async () => {
      const dto = plainToClass(WidgetSearchDto, {
        query: 'test',
        limit: 0,
      });

      const errors = await validate(dto);
      expect(errors.length).toBeGreaterThan(0);
      const limitError = errors.find((e) => e.property === 'limit');
      expect(limitError).toBeDefined();
    });

    it('should transform invalid string to false for includeScores', async () => {
      const dto = plainToClass(WidgetSearchDto, {
        query: 'test',
        includeScores: 'invalid' as any,
      });

      // Transform converts non-"true" strings to false
      expect(dto.includeScores).toBe(false);
      const errors = await validate(dto);
      expect(errors).toHaveLength(0);
    });

    it('should transform invalid string to false for includeSuggestions', async () => {
      const dto = plainToClass(WidgetSearchDto, {
        query: 'test',
        includeSuggestions: 'invalid' as any,
      });

      // Transform converts non-"true" strings to false
      expect(dto.includeSuggestions).toBe(false);
      const errors = await validate(dto);
      expect(errors).toHaveLength(0);
    });

    it('should transform invalid string to false for includeExamples', async () => {
      const dto = plainToClass(WidgetSearchDto, {
        query: 'test',
        includeExamples: 'invalid' as any,
      });

      // Transform converts non-"true" strings to false
      expect(dto.includeExamples).toBe(false);
      const errors = await validate(dto);
      expect(errors).toHaveLength(0);
    });
  });

  describe('transformation', () => {
    it('should transform string "true" to boolean true for includeScores', () => {
      const dto = plainToClass(WidgetSearchDto, {
        query: 'test',
        includeScores: 'true',
      });

      expect(dto.includeScores).toBe(true);
    });

    it('should transform string "false" to boolean false for includeScores', () => {
      const dto = plainToClass(WidgetSearchDto, {
        query: 'test',
        includeScores: 'false',
      });

      expect(dto.includeScores).toBe(false);
    });

    it('should transform string "true" to boolean true for includeSuggestions', () => {
      const dto = plainToClass(WidgetSearchDto, {
        query: 'test',
        includeSuggestions: 'true',
      });

      expect(dto.includeSuggestions).toBe(true);
    });

    it('should transform string "false" to boolean false for includeSuggestions', () => {
      const dto = plainToClass(WidgetSearchDto, {
        query: 'test',
        includeSuggestions: 'false',
      });

      expect(dto.includeSuggestions).toBe(false);
    });

    it('should transform string "true" to boolean true for includeExamples', () => {
      const dto = plainToClass(WidgetSearchDto, {
        query: 'test',
        includeExamples: 'true',
      });

      expect(dto.includeExamples).toBe(true);
    });

    it('should transform string "false" to boolean false for includeExamples', () => {
      const dto = plainToClass(WidgetSearchDto, {
        query: 'test',
        includeExamples: 'false',
      });

      expect(dto.includeExamples).toBe(false);
    });

    it('should keep boolean true as is', () => {
      const dto = plainToClass(WidgetSearchDto, {
        query: 'test',
        includeScores: true,
        includeSuggestions: true,
        includeExamples: true,
      });

      expect(dto.includeScores).toBe(true);
      expect(dto.includeSuggestions).toBe(true);
      expect(dto.includeExamples).toBe(true);
    });

    it('should keep boolean false as is', () => {
      const dto = plainToClass(WidgetSearchDto, {
        query: 'test',
        includeScores: false,
        includeSuggestions: false,
        includeExamples: false,
      });

      expect(dto.includeScores).toBe(false);
      expect(dto.includeSuggestions).toBe(false);
      expect(dto.includeExamples).toBe(false);
    });

    it('should transform number string to number for limit', () => {
      const dto = plainToClass(WidgetSearchDto, {
        query: 'test',
        limit: '15',
      });

      expect(dto.limit).toBe(15);
      expect(typeof dto.limit).toBe('number');
    });
  });

  describe('default values', () => {
    it('should use default values when optional fields are omitted', () => {
      const dto = plainToClass(WidgetSearchDto, {
        query: 'test',
      });

      // Defaults are applied by the service, not the DTO
      expect(dto.limit).toBeUndefined();
      expect(dto.includeScores).toBeUndefined();
      expect(dto.includeSuggestions).toBeUndefined();
      expect(dto.includeExamples).toBeUndefined();
    });
  });

  describe('query parameter scenarios', () => {
    it('should handle natural language queries', async () => {
      const queries = [
        'show revenue over time',
        'display user statistics',
        'manage customer data',
        'create a chart for sales',
        'list all products',
      ];

      for (const query of queries) {
        const dto = plainToClass(WidgetSearchDto, { query });
        const errors = await validate(dto);
        expect(errors).toHaveLength(0);
      }
    });

    it('should handle keyword queries', async () => {
      const queries = [
        'revenue',
        'chart',
        'analytics',
        'users',
        'dashboard',
      ];

      for (const query of queries) {
        const dto = plainToClass(WidgetSearchDto, { query });
        const errors = await validate(dto);
        expect(errors).toHaveLength(0);
      }
    });

    it('should handle queries with special characters', async () => {
      const dto = plainToClass(WidgetSearchDto, {
        query: 'show revenue (last 30 days)',
      });

      const errors = await validate(dto);
      expect(errors).toHaveLength(0);
    });

    it('should handle very long queries', async () => {
      const dto = plainToClass(WidgetSearchDto, {
        query: 'I need a widget that can display revenue trends over time with the ability to filter by product category and show year-over-year comparisons',
      });

      const errors = await validate(dto);
      expect(errors).toHaveLength(0);
    });
  });

  describe('limit parameter scenarios', () => {
    it('should accept valid limit values', async () => {
      const limits = [1, 5, 10, 20, 50, 100];

      for (const limit of limits) {
        const dto = plainToClass(WidgetSearchDto, {
          query: 'test',
          limit,
        });
        const errors = await validate(dto);
        expect(errors).toHaveLength(0);
      }
    });

    it('should reject negative limits', async () => {
      const dto = plainToClass(WidgetSearchDto, {
        query: 'test',
        limit: -1,
      });

      const errors = await validate(dto);
      expect(errors.length).toBeGreaterThan(0);
    });

    it('should reject zero limit', async () => {
      const dto = plainToClass(WidgetSearchDto, {
        query: 'test',
        limit: 0,
      });

      const errors = await validate(dto);
      expect(errors.length).toBeGreaterThan(0);
    });
  });

  describe('combined scenarios', () => {
    it('should handle all parameters together', async () => {
      const dto = plainToClass(WidgetSearchDto, {
        query: 'show revenue chart',
        limit: 5,
        includeScores: true,
        includeSuggestions: true,
        includeExamples: true,
      });

      const errors = await validate(dto);
      expect(errors).toHaveLength(0);
      expect(dto.query).toBe('show revenue chart');
      expect(dto.limit).toBe(5);
      expect(dto.includeScores).toBe(true);
      expect(dto.includeSuggestions).toBe(true);
      expect(dto.includeExamples).toBe(true);
    });

    it('should handle query parameters from URL (all strings)', () => {
      const dto = plainToClass(WidgetSearchDto, {
        query: 'test',
        limit: '10',
        includeScores: 'true',
        includeSuggestions: 'false',
        includeExamples: 'true',
      });

      expect(dto.query).toBe('test');
      expect(dto.limit).toBe(10);
      expect(dto.includeScores).toBe(true);
      expect(dto.includeSuggestions).toBe(false);
      expect(dto.includeExamples).toBe(true);
    });

    it('should handle minimal request', async () => {
      const dto = plainToClass(WidgetSearchDto, {
        query: 'chart',
      });

      const errors = await validate(dto);
      expect(errors).toHaveLength(0);
      expect(dto.query).toBe('chart');
    });

    it('should handle request with only scores enabled', async () => {
      const dto = plainToClass(WidgetSearchDto, {
        query: 'analytics',
        includeScores: true,
        includeSuggestions: false,
        includeExamples: false,
      });

      const errors = await validate(dto);
      expect(errors).toHaveLength(0);
    });

    it('should handle request with only suggestions enabled', async () => {
      const dto = plainToClass(WidgetSearchDto, {
        query: 'dashboard',
        includeScores: false,
        includeSuggestions: true,
        includeExamples: false,
      });

      const errors = await validate(dto);
      expect(errors).toHaveLength(0);
    });

    it('should handle request with only examples enabled', async () => {
      const dto = plainToClass(WidgetSearchDto, {
        query: 'widget',
        includeScores: false,
        includeSuggestions: false,
        includeExamples: true,
      });

      const errors = await validate(dto);
      expect(errors).toHaveLength(0);
    });
  });
});
