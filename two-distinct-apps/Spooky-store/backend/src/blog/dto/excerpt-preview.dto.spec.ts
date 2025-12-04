import { validate } from 'class-validator';
import { ExcerptPreviewDto } from './excerpt-preview.dto';

describe('ExcerptPreviewDto', () => {
  describe('validation', () => {
    it('should pass validation with valid content', async () => {
      const dto = new ExcerptPreviewDto();
      dto.content = 'This is a test content for excerpt generation.';

      const errors = await validate(dto);
      expect(errors.length).toBe(0);
    });

    it('should pass validation with valid content and maxLength', async () => {
      const dto = new ExcerptPreviewDto();
      dto.content = 'This is a test content for excerpt generation.';
      dto.maxLength = 150;

      const errors = await validate(dto);
      expect(errors.length).toBe(0);
    });

    it('should fail validation when content is empty', async () => {
      const dto = new ExcerptPreviewDto();
      dto.content = '';

      const errors = await validate(dto);
      expect(errors.length).toBeGreaterThan(0);
      expect(errors[0].property).toBe('content');
      expect(errors[0].constraints).toHaveProperty('isNotEmpty');
    });

    it('should fail validation when content is missing', async () => {
      const dto = new ExcerptPreviewDto();

      const errors = await validate(dto);
      expect(errors.length).toBeGreaterThan(0);
      expect(errors[0].property).toBe('content');
    });

    it('should fail validation when content is not a string', async () => {
      const dto = new ExcerptPreviewDto();
      (dto as any).content = 123;

      const errors = await validate(dto);
      expect(errors.length).toBeGreaterThan(0);
      expect(errors[0].property).toBe('content');
      expect(errors[0].constraints).toHaveProperty('isString');
    });

    it('should fail validation when maxLength is below minimum (50)', async () => {
      const dto = new ExcerptPreviewDto();
      dto.content = 'Test content';
      dto.maxLength = 30;

      const errors = await validate(dto);
      expect(errors.length).toBeGreaterThan(0);
      expect(errors[0].property).toBe('maxLength');
      expect(errors[0].constraints).toHaveProperty('min');
    });

    it('should fail validation when maxLength is above maximum (500)', async () => {
      const dto = new ExcerptPreviewDto();
      dto.content = 'Test content';
      dto.maxLength = 600;

      const errors = await validate(dto);
      expect(errors.length).toBeGreaterThan(0);
      expect(errors[0].property).toBe('maxLength');
      expect(errors[0].constraints).toHaveProperty('max');
    });

    it('should fail validation when maxLength is not an integer', async () => {
      const dto = new ExcerptPreviewDto();
      dto.content = 'Test content';
      (dto as any).maxLength = 150.5;

      const errors = await validate(dto);
      expect(errors.length).toBeGreaterThan(0);
      expect(errors[0].property).toBe('maxLength');
      expect(errors[0].constraints).toHaveProperty('isInt');
    });

    it('should pass validation when maxLength is at minimum boundary (50)', async () => {
      const dto = new ExcerptPreviewDto();
      dto.content = 'Test content';
      dto.maxLength = 50;

      const errors = await validate(dto);
      expect(errors.length).toBe(0);
    });

    it('should pass validation when maxLength is at maximum boundary (500)', async () => {
      const dto = new ExcerptPreviewDto();
      dto.content = 'Test content';
      dto.maxLength = 500;

      const errors = await validate(dto);
      expect(errors.length).toBe(0);
    });

    it('should pass validation when maxLength is omitted (optional)', async () => {
      const dto = new ExcerptPreviewDto();
      dto.content = 'Test content';
      // maxLength is optional, so omitting it should be valid

      const errors = await validate(dto);
      expect(errors.length).toBe(0);
    });

    it('should handle long content strings', async () => {
      const dto = new ExcerptPreviewDto();
      dto.content = 'A'.repeat(5000); // Very long content
      dto.maxLength = 200;

      const errors = await validate(dto);
      expect(errors.length).toBe(0);
    });

    it('should handle content with special characters', async () => {
      const dto = new ExcerptPreviewDto();
      dto.content = 'Content with special chars: @#$%^&*()_+-=[]{}|;:,.<>?/~`';
      dto.maxLength = 150;

      const errors = await validate(dto);
      expect(errors.length).toBe(0);
    });

    it('should handle content with HTML tags', async () => {
      const dto = new ExcerptPreviewDto();
      dto.content = '<p>This is <strong>HTML</strong> content</p>';
      dto.maxLength = 150;

      const errors = await validate(dto);
      expect(errors.length).toBe(0);
    });

    it('should handle content with markdown', async () => {
      const dto = new ExcerptPreviewDto();
      dto.content = '# Heading\n\nThis is **bold** and *italic* text.';
      dto.maxLength = 150;

      const errors = await validate(dto);
      expect(errors.length).toBe(0);
    });
  });
});
