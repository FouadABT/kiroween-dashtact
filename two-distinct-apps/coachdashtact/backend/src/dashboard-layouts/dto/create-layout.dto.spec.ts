import { validate } from 'class-validator';
import { plainToClass } from 'class-transformer';
import { CreateLayoutDto } from './create-layout.dto';

describe('CreateLayoutDto', () => {
  describe('Validation', () => {
    it('should pass validation with all required fields', async () => {
      const dto = plainToClass(CreateLayoutDto, {
        pageId: 'overview',
        name: 'My Custom Layout',
      });

      const errors = await validate(dto);
      expect(errors.length).toBe(0);
    });

    it('should pass validation with all fields', async () => {
      const dto = plainToClass(CreateLayoutDto, {
        pageId: 'analytics',
        userId: 'user-123',
        scope: 'user',
        name: 'Analytics Dashboard',
        description: 'Custom analytics layout',
        isActive: true,
        isDefault: false,
      });

      const errors = await validate(dto);
      expect(errors.length).toBe(0);
    });

    it('should fail validation when pageId is missing', async () => {
      const dto = plainToClass(CreateLayoutDto, {
        name: 'My Layout',
      });

      const errors = await validate(dto);
      expect(errors.length).toBeGreaterThan(0);
      expect(errors[0].property).toBe('pageId');
    });

    it('should fail validation when pageId is empty', async () => {
      const dto = plainToClass(CreateLayoutDto, {
        pageId: '',
        name: 'My Layout',
      });

      const errors = await validate(dto);
      expect(errors.length).toBeGreaterThan(0);
      expect(errors[0].property).toBe('pageId');
    });

    it('should fail validation when pageId exceeds max length', async () => {
      const dto = plainToClass(CreateLayoutDto, {
        pageId: 'a'.repeat(101),
        name: 'My Layout',
      });

      const errors = await validate(dto);
      expect(errors.length).toBeGreaterThan(0);
      expect(errors[0].property).toBe('pageId');
    });

    it('should fail validation when name is missing', async () => {
      const dto = plainToClass(CreateLayoutDto, {
        pageId: 'overview',
      });

      const errors = await validate(dto);
      expect(errors.length).toBeGreaterThan(0);
      expect(errors[0].property).toBe('name');
    });

    it('should fail validation when name is empty', async () => {
      const dto = plainToClass(CreateLayoutDto, {
        pageId: 'overview',
        name: '',
      });

      const errors = await validate(dto);
      expect(errors.length).toBeGreaterThan(0);
      expect(errors[0].property).toBe('name');
    });

    it('should fail validation when name exceeds max length', async () => {
      const dto = plainToClass(CreateLayoutDto, {
        pageId: 'overview',
        name: 'a'.repeat(201),
      });

      const errors = await validate(dto);
      expect(errors.length).toBeGreaterThan(0);
      expect(errors[0].property).toBe('name');
    });

    it('should fail validation when description exceeds max length', async () => {
      const dto = plainToClass(CreateLayoutDto, {
        pageId: 'overview',
        name: 'My Layout',
        description: 'a'.repeat(501),
      });

      const errors = await validate(dto);
      expect(errors.length).toBeGreaterThan(0);
      expect(errors[0].property).toBe('description');
    });

    it('should fail validation when scope is invalid', async () => {
      const dto = plainToClass(CreateLayoutDto, {
        pageId: 'overview',
        name: 'My Layout',
        scope: 'invalid',
      });

      const errors = await validate(dto);
      expect(errors.length).toBeGreaterThan(0);
      expect(errors[0].property).toBe('scope');
    });

    it('should pass validation with scope "global"', async () => {
      const dto = plainToClass(CreateLayoutDto, {
        pageId: 'overview',
        name: 'My Layout',
        scope: 'global',
      });

      const errors = await validate(dto);
      expect(errors.length).toBe(0);
    });

    it('should pass validation with scope "user"', async () => {
      const dto = plainToClass(CreateLayoutDto, {
        pageId: 'overview',
        name: 'My Layout',
        scope: 'user',
      });

      const errors = await validate(dto);
      expect(errors.length).toBe(0);
    });

    it('should fail validation when isActive is not boolean', async () => {
      const dto = plainToClass(CreateLayoutDto, {
        pageId: 'overview',
        name: 'My Layout',
        isActive: 'true' as any,
      });

      const errors = await validate(dto);
      expect(errors.length).toBeGreaterThan(0);
      expect(errors[0].property).toBe('isActive');
    });

    it('should fail validation when isDefault is not boolean', async () => {
      const dto = plainToClass(CreateLayoutDto, {
        pageId: 'overview',
        name: 'My Layout',
        isDefault: 'false' as any,
      });

      const errors = await validate(dto);
      expect(errors.length).toBeGreaterThan(0);
      expect(errors[0].property).toBe('isDefault');
    });

    it('should apply default values correctly', async () => {
      const dto = plainToClass(CreateLayoutDto, {
        pageId: 'overview',
        name: 'My Layout',
      });

      expect(dto.scope).toBe('global');
      expect(dto.isActive).toBe(true);
      expect(dto.isDefault).toBe(false);
    });

    it('should allow optional userId', async () => {
      const dto = plainToClass(CreateLayoutDto, {
        pageId: 'overview',
        name: 'My Layout',
        userId: 'user-123',
      });

      const errors = await validate(dto);
      expect(errors.length).toBe(0);
      expect(dto.userId).toBe('user-123');
    });

    it('should allow optional description', async () => {
      const dto = plainToClass(CreateLayoutDto, {
        pageId: 'overview',
        name: 'My Layout',
        description: 'A custom layout for overview page',
      });

      const errors = await validate(dto);
      expect(errors.length).toBe(0);
      expect(dto.description).toBe('A custom layout for overview page');
    });
  });

  describe('Edge Cases', () => {
    it('should handle pageId at max length', async () => {
      const dto = plainToClass(CreateLayoutDto, {
        pageId: 'a'.repeat(100),
        name: 'My Layout',
      });

      const errors = await validate(dto);
      expect(errors.length).toBe(0);
    });

    it('should handle name at max length', async () => {
      const dto = plainToClass(CreateLayoutDto, {
        pageId: 'overview',
        name: 'a'.repeat(200),
      });

      const errors = await validate(dto);
      expect(errors.length).toBe(0);
    });

    it('should handle description at max length', async () => {
      const dto = plainToClass(CreateLayoutDto, {
        pageId: 'overview',
        name: 'My Layout',
        description: 'a'.repeat(500),
      });

      const errors = await validate(dto);
      expect(errors.length).toBe(0);
    });

    it('should handle special characters in pageId', async () => {
      const dto = plainToClass(CreateLayoutDto, {
        pageId: 'page-id_123',
        name: 'My Layout',
      });

      const errors = await validate(dto);
      expect(errors.length).toBe(0);
    });

    it('should handle special characters in name', async () => {
      const dto = plainToClass(CreateLayoutDto, {
        pageId: 'overview',
        name: 'My Layout (Custom) - v2.0',
      });

      const errors = await validate(dto);
      expect(errors.length).toBe(0);
    });

    it('should handle unicode characters in name', async () => {
      const dto = plainToClass(CreateLayoutDto, {
        pageId: 'overview',
        name: 'My Layout 中文 العربية',
      });

      const errors = await validate(dto);
      expect(errors.length).toBe(0);
    });
  });

  describe('Type Safety', () => {
    it('should have correct TypeScript types', () => {
      const dto: CreateLayoutDto = {
        pageId: 'overview',
        name: 'My Layout',
        userId: 'user-123',
        scope: 'user',
        description: 'Description',
        isActive: true,
        isDefault: false,
      };

      expect(typeof dto.pageId).toBe('string');
      expect(typeof dto.name).toBe('string');
      expect(typeof dto.userId).toBe('string');
      expect(typeof dto.scope).toBe('string');
      expect(typeof dto.description).toBe('string');
      expect(typeof dto.isActive).toBe('boolean');
      expect(typeof dto.isDefault).toBe('boolean');
    });
  });
});
