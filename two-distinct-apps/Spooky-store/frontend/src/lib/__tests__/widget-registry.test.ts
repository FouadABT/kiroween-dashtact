/**
 * Widget Registry Tests
 * 
 * Tests for widget registry functionality
 */

import { describe, it, expect } from 'vitest';
import {
  getWidgetCategories,
  getAllWidgetKeys,
  getWidgetsByCategory,
  hasWidget,
  getWidgetsByCategories,
} from '../widget-registry';

describe('Widget Registry', () => {
  describe('getWidgetCategories', () => {
    it('should return an array of categories', () => {
      const categories = getWidgetCategories();
      expect(Array.isArray(categories)).toBe(true);
      expect(categories.length).toBeGreaterThan(0);
    });

    it('should include expected categories', () => {
      const categories = getWidgetCategories();
      expect(categories).toContain('core');
      expect(categories).toContain('data-display');
      expect(categories).toContain('interactive');
    });
  });

  describe('getAllWidgetKeys', () => {
    it('should return an array of widget keys', () => {
      const keys = getAllWidgetKeys();
      expect(Array.isArray(keys)).toBe(true);
      expect(keys.length).toBeGreaterThan(0);
    });

    it('should include expected widget keys', () => {
      const keys = getAllWidgetKeys();
      expect(keys).toContain('stats-card');
      expect(keys).toContain('chart-widget');
      expect(keys).toContain('data-table');
    });
  });

  describe('getWidgetsByCategory', () => {
    it('should return widgets for a specific category', () => {
      const coreWidgets = getWidgetsByCategory('core');
      expect(Array.isArray(coreWidgets)).toBe(true);
      expect(coreWidgets.length).toBeGreaterThan(0);
    });

    it('should return empty array for non-existent category', () => {
      const widgets = getWidgetsByCategory('non-existent');
      expect(widgets).toEqual([]);
    });

    it('should return correct widgets for core category', () => {
      const coreWidgets = getWidgetsByCategory('core');
      expect(coreWidgets).toContain('stats-card');
      expect(coreWidgets).toContain('chart-widget');
    });
  });

  describe('hasWidget', () => {
    it('should return true for existing widgets', () => {
      expect(hasWidget('stats-card')).toBe(true);
      expect(hasWidget('chart-widget')).toBe(true);
      expect(hasWidget('data-table')).toBe(true);
    });

    it('should return false for non-existent widgets', () => {
      expect(hasWidget('non-existent-widget')).toBe(false);
      expect(hasWidget('')).toBe(false);
    });
  });

  describe('getWidgetsByCategories', () => {
    it('should return widgets for multiple categories', () => {
      const widgets = getWidgetsByCategories(['core', 'data-display']);
      expect(Array.isArray(widgets)).toBe(true);
      expect(widgets.length).toBeGreaterThan(0);
    });

    it('should include widgets from all specified categories', () => {
      const widgets = getWidgetsByCategories(['core', 'interactive']);
      expect(widgets).toContain('stats-card'); // core
      expect(widgets).toContain('quick-actions'); // interactive
    });

    it('should return empty array for empty categories array', () => {
      const widgets = getWidgetsByCategories([]);
      expect(widgets).toEqual([]);
    });
  });
});
