import { describe, it, expect } from 'vitest';
import {
  generateSlug,
  validateSlugFormat,
  formatSlugPreview,
} from '../slug-utils';

describe('Slug Utilities', () => {
  describe('generateSlug', () => {
    it('should convert title to lowercase slug', () => {
      expect(generateSlug('Hello World')).toBe('hello-world');
    });

    it('should replace spaces with hyphens', () => {
      expect(generateSlug('My First Post')).toBe('my-first-post');
    });

    it('should remove special characters', () => {
      expect(generateSlug('Hello! World?')).toBe('hello-world');
      expect(generateSlug('Post #1 @ 2024')).toBe('post-1-2024');
    });

    it('should handle multiple spaces', () => {
      expect(generateSlug('Hello    World')).toBe('hello-world');
    });

    it('should remove leading and trailing hyphens', () => {
      expect(generateSlug('-Hello World-')).toBe('hello-world');
    });

    it('should handle consecutive hyphens', () => {
      expect(generateSlug('Hello---World')).toBe('hello-world');
    });

    it('should trim whitespace', () => {
      expect(generateSlug('  Hello World  ')).toBe('hello-world');
    });

    it('should handle empty string', () => {
      expect(generateSlug('')).toBe('');
    });

    it('should handle complex titles', () => {
      expect(generateSlug('The Ultimate Guide to Next.js 14!')).toBe(
        'the-ultimate-guide-to-nextjs-14'
      );
    });

    it('should preserve numbers', () => {
      expect(generateSlug('Post 123')).toBe('post-123');
    });

    it('should handle unicode characters', () => {
      expect(generateSlug('Café & Restaurant')).toBe('caf-restaurant');
    });
  });

  describe('validateSlugFormat', () => {
    it('should validate correct slug format', () => {
      const result = validateSlugFormat('hello-world');
      expect(result.valid).toBe(true);
      expect(result.errors).toHaveLength(0);
    });

    it('should reject empty slug', () => {
      const result = validateSlugFormat('');
      expect(result.valid).toBe(false);
      expect(result.errors).toContain('Slug cannot be empty');
    });

    it('should reject slug shorter than 3 characters', () => {
      const result = validateSlugFormat('ab');
      expect(result.valid).toBe(false);
      expect(result.errors).toContain('Slug must be at least 3 characters long');
    });

    it('should reject slug longer than 200 characters', () => {
      const longSlug = 'a'.repeat(201);
      const result = validateSlugFormat(longSlug);
      expect(result.valid).toBe(false);
      expect(result.errors).toContain('Slug must be less than 200 characters');
    });

    it('should reject uppercase letters', () => {
      const result = validateSlugFormat('Hello-World');
      expect(result.valid).toBe(false);
      expect(result.errors).toContain(
        'Slug can only contain lowercase letters, numbers, and hyphens'
      );
    });

    it('should reject special characters', () => {
      const result = validateSlugFormat('hello_world');
      expect(result.valid).toBe(false);
      expect(result.errors).toContain(
        'Slug can only contain lowercase letters, numbers, and hyphens'
      );
    });

    it('should reject slug starting with hyphen', () => {
      const result = validateSlugFormat('-hello-world');
      expect(result.valid).toBe(false);
      expect(result.errors).toContain('Slug cannot start or end with a hyphen');
    });

    it('should reject slug ending with hyphen', () => {
      const result = validateSlugFormat('hello-world-');
      expect(result.valid).toBe(false);
      expect(result.errors).toContain('Slug cannot start or end with a hyphen');
    });

    it('should reject consecutive hyphens', () => {
      const result = validateSlugFormat('hello--world');
      expect(result.valid).toBe(false);
      expect(result.errors).toContain('Slug cannot contain consecutive hyphens');
    });

    it('should accept slug with numbers', () => {
      const result = validateSlugFormat('post-123');
      expect(result.valid).toBe(true);
      expect(result.errors).toHaveLength(0);
    });

    it('should accept slug with single hyphens', () => {
      const result = validateSlugFormat('my-first-blog-post');
      expect(result.valid).toBe(true);
      expect(result.errors).toHaveLength(0);
    });

    it('should return multiple errors for invalid slug', () => {
      const result = validateSlugFormat('AB');
      expect(result.valid).toBe(false);
      expect(result.errors.length).toBeGreaterThan(1);
    });
  });

  describe('formatSlugPreview', () => {
    it('should format slug as full URL', () => {
      const preview = formatSlugPreview('hello-world');
      expect(preview).toContain('/blog/hello-world');
    });

    it('should handle empty slug', () => {
      const preview = formatSlugPreview('');
      expect(preview).toContain('/blog/');
    });

    it('should handle slug with special characters', () => {
      const preview = formatSlugPreview('post-123');
      expect(preview).toContain('/blog/post-123');
    });
  });
});
