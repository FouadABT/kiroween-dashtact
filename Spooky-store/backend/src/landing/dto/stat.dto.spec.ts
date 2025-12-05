import { plainToClass } from 'class-transformer';
import { validate } from 'class-validator';
import { StatDto } from './stat.dto';

describe('StatDto', () => {
  describe('Validation', () => {
    it('should validate a stat with all required fields', async () => {
      const dto = plainToClass(StatDto, {
        value: '1000',
        label: 'Happy Customers',
      });

      const errors = await validate(dto);
      expect(errors).toHaveLength(0);
    });

    it('should validate a stat with all fields including prefix and suffix', async () => {
      const dto = plainToClass(StatDto, {
        value: '1000',
        label: 'Happy Customers',
        icon: 'users',
        prefix: '',
        suffix: '+',
        order: 1,
      });

      const errors = await validate(dto);
      expect(errors).toHaveLength(0);
    });

    it('should validate a stat with only prefix', async () => {
      const dto = plainToClass(StatDto, {
        value: '1000000',
        label: 'Revenue',
        prefix: '$',
      });

      const errors = await validate(dto);
      expect(errors).toHaveLength(0);
    });

    it('should validate a stat with only suffix', async () => {
      const dto = plainToClass(StatDto, {
        value: '95',
        label: 'Success Rate',
        suffix: '%',
      });

      const errors = await validate(dto);
      expect(errors).toHaveLength(0);
    });

    it('should validate a stat with empty prefix and suffix', async () => {
      const dto = plainToClass(StatDto, {
        value: '42',
        label: 'Answer',
        prefix: '',
        suffix: '',
      });

      const errors = await validate(dto);
      expect(errors).toHaveLength(0);
    });

    it('should validate a stat with complex prefix and suffix', async () => {
      const dto = plainToClass(StatDto, {
        value: '2.5',
        label: 'Rating',
        prefix: '★ ',
        suffix: ' / 5',
      });

      const errors = await validate(dto);
      expect(errors).toHaveLength(0);
    });

    it('should fail validation if value is missing', async () => {
      const dto = plainToClass(StatDto, {
        label: 'Missing Value',
      });

      const errors = await validate(dto);
      expect(errors.length).toBeGreaterThan(0);
      expect(errors[0].property).toBe('value');
    });

    it('should fail validation if label is missing', async () => {
      const dto = plainToClass(StatDto, {
        value: '100',
      });

      const errors = await validate(dto);
      expect(errors.length).toBeGreaterThan(0);
      expect(errors[0].property).toBe('label');
    });

    it('should fail validation if value is not a string', async () => {
      const dto = plainToClass(StatDto, {
        value: 1000,
        label: 'Invalid Type',
      });

      const errors = await validate(dto);
      expect(errors.length).toBeGreaterThan(0);
      expect(errors[0].property).toBe('value');
    });

    it('should fail validation if label is not a string', async () => {
      const dto = plainToClass(StatDto, {
        value: '1000',
        label: 123,
      });

      const errors = await validate(dto);
      expect(errors.length).toBeGreaterThan(0);
      expect(errors[0].property).toBe('label');
    });

    it('should fail validation if icon is not a string', async () => {
      const dto = plainToClass(StatDto, {
        value: '1000',
        label: 'Test',
        icon: 123,
      });

      const errors = await validate(dto);
      expect(errors.length).toBeGreaterThan(0);
      expect(errors[0].property).toBe('icon');
    });

    it('should fail validation if prefix is not a string', async () => {
      const dto = plainToClass(StatDto, {
        value: '1000',
        label: 'Test',
        prefix: 123,
      });

      const errors = await validate(dto);
      expect(errors.length).toBeGreaterThan(0);
      expect(errors[0].property).toBe('prefix');
    });

    it('should fail validation if suffix is not a string', async () => {
      const dto = plainToClass(StatDto, {
        value: '1000',
        label: 'Test',
        suffix: 123,
      });

      const errors = await validate(dto);
      expect(errors.length).toBeGreaterThan(0);
      expect(errors[0].property).toBe('suffix');
    });

    it('should fail validation if order is not a number', async () => {
      const dto = plainToClass(StatDto, {
        value: '1000',
        label: 'Test',
        order: 'first',
      });

      const errors = await validate(dto);
      expect(errors.length).toBeGreaterThan(0);
      expect(errors[0].property).toBe('order');
    });
  });

  describe('Optional Fields', () => {
    it('should allow undefined prefix', async () => {
      const dto = plainToClass(StatDto, {
        value: '1000',
        label: 'Test',
        prefix: undefined,
      });

      const errors = await validate(dto);
      expect(errors).toHaveLength(0);
    });

    it('should allow undefined suffix', async () => {
      const dto = plainToClass(StatDto, {
        value: '1000',
        label: 'Test',
        suffix: undefined,
      });

      const errors = await validate(dto);
      expect(errors).toHaveLength(0);
    });

    it('should allow undefined icon', async () => {
      const dto = plainToClass(StatDto, {
        value: '1000',
        label: 'Test',
        icon: undefined,
      });

      const errors = await validate(dto);
      expect(errors).toHaveLength(0);
    });

    it('should allow undefined order', async () => {
      const dto = plainToClass(StatDto, {
        value: '1000',
        label: 'Test',
        order: undefined,
      });

      const errors = await validate(dto);
      expect(errors).toHaveLength(0);
    });
  });

  describe('Backward Compatibility', () => {
    it('should accept legacy stat without prefix and suffix', async () => {
      const dto = plainToClass(StatDto, {
        value: '500',
        label: 'Projects',
        icon: 'briefcase',
        order: 1,
      });

      const errors = await validate(dto);
      expect(errors).toHaveLength(0);
    });

    it('should accept legacy stat with minimal fields', async () => {
      const dto = plainToClass(StatDto, {
        value: '100',
        label: 'Minimal',
      });

      const errors = await validate(dto);
      expect(errors).toHaveLength(0);
    });
  });

  describe('Type Coercion', () => {
    it('should coerce string numbers to string type', async () => {
      const dto = plainToClass(StatDto, {
        value: '1000',
        label: 'Test',
      });

      expect(typeof dto.value).toBe('string');
      expect(dto.value).toBe('1000');
    });

    it('should preserve prefix and suffix as strings', async () => {
      const dto = plainToClass(StatDto, {
        value: '100',
        label: 'Test',
        prefix: '$',
        suffix: '%',
      });

      expect(typeof dto.prefix).toBe('string');
      expect(typeof dto.suffix).toBe('string');
      expect(dto.prefix).toBe('$');
      expect(dto.suffix).toBe('%');
    });
  });
});
