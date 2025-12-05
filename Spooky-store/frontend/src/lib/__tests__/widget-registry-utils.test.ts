/**
 * Widget Registry Utilities Tests
 * 
 * Tests for widget registry utility functions
 */

import { describe, it, expect } from 'vitest';
import {
  WidgetNotFoundError,
  isValidWidgetKey,
  validateWidgetKeys,
  getAvailableWidgetKeys,
  getAvailableCategories,
  getRegistryStats,
} from '../widget-registry-utils';
import type { WidgetDefinition } from '@/types/widgets';

describe('Widget Registry Utilities', () => {
  describe('WidgetNotFoundError', () => {
    it('should create error with widget key', () => {
      const error = new WidgetNotFoundError('test-widget');
      expect(error.message).toBe('Widget not found: test-widget');
      expect(error.widgetKey).toBe('test-widget');
      expect(error.name).toBe('WidgetNotFoundError');
    });
  });

  describe('isValidWidgetKey', () => {
    it('should return true for valid widget keys', () => {
      expect(isValidWidgetKey('stats-card')).toBe(true);
      expect(isValidWidgetKey('chart-widget')).toBe(true);
    });

    it('should return false for invalid widget keys', () => {
      expect(isValidWidgetKey('invalid-widget')).toBe(false);
      expect(isValidWidgetKey('')).toBe(false);
    });
  });

  describe('validateWidgetKeys', () => {
    it('should separate valid and invalid keys', () => {
      const result = validateWidgetKeys([
        'stats-card',
        'invalid-widget',
        'chart-widget',
        'another-invalid',
      ]);

      expect(result.valid).toContain('stats-card');
      expect(result.valid).toContain('chart-widget');
      expect(result.invalid).toContain('invalid-widget');
      expect(result.invalid).toContain('another-invalid');
    });

    it('should handle empty array', () => {
      const result = validateWidgetKeys([]);
      expect(result.valid).toEqual([]);
      expect(result.invalid).toEqual([]);
    });

    it('should handle all valid keys', () => {
      const result = validateWidgetKeys(['stats-card', 'chart-widget']);
      expect(result.valid.length).toBe(2);
      expect(result.invalid.length).toBe(0);
    });

    it('should handle all invalid keys', () => {
      const result = validateWidgetKeys(['invalid-1', 'invalid-2']);
      expect(result.valid.length).toBe(0);
      expect(result.invalid.length).toBe(2);
    });
  });

  describe('getAvailableWidgetKeys', () => {
    it('should return array of widget keys', () => {
      const keys = getAvailableWidgetKeys();
      expect(Array.isArray(keys)).toBe(true);
      expect(keys.length).toBeGreaterThan(0);
    });
  });

  describe('getAvailableCategories', () => {
    it('should return array of categories', () => {
      const categories = getAvailableCategories();
      expect(Array.isArray(categories)).toBe(true);
      expect(categories.length).toBeGreaterThan(0);
    });
  });

  describe('getRegistryStats', () => {
    it('should return registry statistics', () => {
      const stats = getRegistryStats();
      
      expect(stats).toHaveProperty('totalWidgets');
      expect(stats).toHaveProperty('categories');
      expect(stats).toHaveProperty('widgetsByCategory');
      
      expect(typeof stats.totalWidgets).toBe('number');
      expect(typeof stats.categories).toBe('number');
      expect(typeof stats.widgetsByCategory).toBe('object');
    });

    it('should have correct total widgets count', () => {
      const stats = getRegistryStats();
      const keys = getAvailableWidgetKeys();
      expect(stats.totalWidgets).toBe(keys.length);
    });

    it('should have correct categories count', () => {
      const stats = getRegistryStats();
      const categories = getAvailableCategories();
      expect(stats.categories).toBe(categories.length);
    });
  });
});
