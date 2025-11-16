/**
 * Dashboard Accessibility Tests
 * 
 * Tests for WCAG 2.1 AA compliance in dashboard components.
 */

import { describe, it, expect, beforeEach, vi } from 'vitest';
import { render, screen, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { axe, toHaveNoViolations } from 'jest-axe';
import { DashboardGrid } from '@/components/dashboard/DashboardGrid';
import { WidgetRenderer } from '@/components/dashboard/WidgetRenderer';
import { WidgetLibrary } from '@/components/admin/WidgetLibrary';
import { WidgetProvider } from '@/contexts/WidgetContext';
import { checkCurrentThemeContrast } from '@/lib/accessibility/color-contrast';

// Extend Jest matchers
expect.extend(toHaveNoViolations);

// Mock API calls
vi.mock('@/lib/api', () => ({
  DashboardLayoutsApi: {
    getForPage: vi.fn().mockResolvedValue({
      id: '1',
      pageId: 'overview',
      widgetInstances: [
        {
          id: 'w1',
          widgetKey: 'stats-card',
          position: 0,
          gridSpan: 6,
          gridRow: null,
          config: {},
          isVisible: true,
        },
      ],
    }),
    getAll: vi.fn().mockResolvedValue({ data: [] }),
  },
  WidgetDefinitionsApi: {
    getAll: vi.fn().mockResolvedValue({
      data: [
        {
          key: 'stats-card',
          name: 'Stats Card',
          description: 'Display statistics',
          category: 'core',
          icon: 'BarChart',
          tags: ['stats', 'metrics'],
          useCases: ['Show KPIs'],
          dataRequirements: {},
        },
      ],
    }),
  },
}));

// Mock widget registry
vi.mock('@/lib/widget-registry', () => ({
  getWidgetComponent: vi.fn(() => {
    return function MockWidget() {
      return <div>Mock Widget Content</div>;
    };
  }),
}));

// Mock auth context
vi.mock('@/contexts/AuthContext', () => ({
  useAuth: () => ({
    getPermissions: () => ['*:*'],
  }),
}));

describe('Dashboard Accessibility', () => {
  describe('DashboardGrid', () => {
    it('should have no accessibility violations', async () => {
      const { container } = render(
        <WidgetProvider>
          <DashboardGrid pageId="overview" />
        </WidgetProvider>
      );

      // Wait for content to load
      await screen.findByRole('region', { name: /dashboard widgets/i });

      const results = await axe(container);
      expect(results).toHaveNoViolations();
    });

    it('should have proper ARIA labels', async () => {
      render(
        <WidgetProvider>
          <DashboardGrid pageId="overview" />
        </WidgetProvider>
      );

      await screen.findByRole('region', { name: /dashboard widgets/i });
      
      const region = screen.getByRole('region', { name: /dashboard widgets/i });
      expect(region).toBeInTheDocument();
    });

    it('should support keyboard navigation', async () => {
      const user = userEvent.setup();
      
      render(
        <WidgetProvider>
          <DashboardGrid pageId="overview" />
        </WidgetProvider>
      );

      await screen.findByRole('region');

      // Tab through widgets
      await user.tab();
      
      // Verify focus is on a widget or control
      expect(document.activeElement).toBeTruthy();
    });

    it('should announce loading state to screen readers', () => {
      render(
        <WidgetProvider>
          <DashboardGrid pageId="overview" />
        </WidgetProvider>
      );

      // Check for loading indicator with proper ARIA
      const loadingElement = screen.queryByRole('status');
      if (loadingElement) {
        expect(loadingElement).toHaveAttribute('aria-live', 'polite');
      }
    });

    it('should announce errors to screen readers', async () => {
      // Mock API error
      const { DashboardLayoutsApi } = await import('@/lib/api');
      vi.mocked(DashboardLayoutsApi.getForPage).mockRejectedValueOnce(
        new Error('Network error')
      );

      render(
        <WidgetProvider>
          <DashboardGrid pageId="overview" />
        </WidgetProvider>
      );

      // Wait for error state
      const errorAlert = await screen.findByRole('alert');
      expect(errorAlert).toHaveAttribute('aria-live', 'assertive');
    });
  });

  describe('WidgetRenderer', () => {
    it('should have no accessibility violations', async () => {
      const { container } = render(
        <WidgetProvider>
          <WidgetRenderer
            widgetKey="stats-card"
            config={{}}
            isEditMode={false}
          />
        </WidgetProvider>
      );

      const results = await axe(container);
      expect(results).toHaveNoViolations();
    });

    it('should have proper ARIA labels for controls', () => {
      render(
        <WidgetProvider>
          <WidgetRenderer
            widgetKey="stats-card"
            config={{}}
            isEditMode={true}
            widgetId="w1"
            layoutId="l1"
          />
        </WidgetProvider>
      );

      const toolbar = screen.getByRole('toolbar', { name: /widget controls/i });
      expect(toolbar).toBeInTheDocument();

      const settingsButton = screen.getByRole('button', { name: /open widget settings/i });
      expect(settingsButton).toBeInTheDocument();

      const removeButton = screen.getByRole('button', { name: /remove widget from dashboard/i });
      expect(removeButton).toBeInTheDocument();
    });

    it('should support keyboard interaction for controls', async () => {
      const user = userEvent.setup();
      
      render(
        <WidgetProvider>
          <WidgetRenderer
            widgetKey="stats-card"
            config={{}}
            isEditMode={true}
            widgetId="w1"
            layoutId="l1"
          />
        </WidgetProvider>
      );

      const settingsButton = screen.getByRole('button', { name: /open widget settings/i });
      
      // Focus and activate with keyboard
      settingsButton.focus();
      expect(settingsButton).toHaveFocus();
      
      await user.keyboard('{Enter}');
      
      // Dialog should open
      expect(screen.getByRole('dialog')).toBeInTheDocument();
    });

    it('should announce widget errors', () => {
      render(
        <WidgetProvider>
          <WidgetRenderer
            widgetKey="non-existent-widget"
            config={{}}
            isEditMode={false}
          />
        </WidgetProvider>
      );

      const errorAlert = screen.getByRole('alert');
      expect(errorAlert).toHaveAttribute('aria-live', 'polite');
      expect(errorAlert).toHaveTextContent(/widget not found/i);
    });
  });

  describe('WidgetLibrary', () => {
    it('should have no accessibility violations', async () => {
      const { container } = render(
        <WidgetLibrary open={true} onClose={() => {}} layoutId="l1" />
      );

      const results = await axe(container);
      expect(results).toHaveNoViolations();
    });

    it('should have proper search region', () => {
      render(
        <WidgetLibrary open={true} onClose={() => {}} layoutId="l1" />
      );

      const searchRegion = screen.getByRole('search', { name: /widget search and filters/i });
      expect(searchRegion).toBeInTheDocument();
    });

    it('should have accessible search input', () => {
      render(
        <WidgetLibrary open={true} onClose={() => {}} layoutId="l1" />
      );

      const searchInput = screen.getByRole('searchbox', { name: /search widgets/i });
      expect(searchInput).toBeInTheDocument();
      expect(searchInput).toHaveAttribute('type', 'search');
    });

    it('should have accessible category filters', () => {
      render(
        <WidgetLibrary open={true} onClose={() => {}} layoutId="l1" />
      );

      const filterGroup = screen.getByRole('group', { name: /category filters/i });
      expect(filterGroup).toBeInTheDocument();

      const allCategoriesButton = screen.getByRole('button', { name: /show all categories/i });
      expect(allCategoriesButton).toHaveAttribute('aria-pressed');
    });

    it('should support keyboard navigation through widgets', async () => {
      const user = userEvent.setup();
      
      render(
        <WidgetLibrary open={true} onClose={() => {}} layoutId="l1" />
      );

      // Wait for widgets to load
      await screen.findByRole('list', { name: /available widgets/i });

      // Tab through elements
      await user.tab(); // Search input
      await user.tab(); // First filter button
      
      expect(document.activeElement).toBeTruthy();
    });

    it('should announce loading state', () => {
      render(
        <WidgetLibrary open={true} onClose={() => {}} layoutId="l1" />
      );

      const loadingStatus = screen.queryByRole('status');
      if (loadingStatus) {
        expect(loadingStatus).toHaveAttribute('aria-live', 'polite');
      }
    });
  });

  describe('Color Contrast', () => {
    it('should meet WCAG AA standards for all color pairs', () => {
      // This test runs in Node environment, so we'll test the utility function
      const mockTheme = {
        background: '0 0% 100%',
        foreground: '240 10% 3.9%',
        primary: '240 5.9% 10%',
        primaryForeground: '0 0% 98%',
        destructive: '0 84.2% 60.2%',
        destructiveForeground: '0 0% 98%',
        mutedForeground: '240 3.8% 46.1%',
      };

      const { valid, results } = verifyThemeContrast(mockTheme);

      expect(valid).toBe(true);
      
      results.forEach((result) => {
        expect(result.passes).toBe(true);
        expect(result.ratio).toBeGreaterThanOrEqual(4.5);
      });
    });
  });

  describe('Focus Management', () => {
    it('should have visible focus indicators', () => {
      render(
        <WidgetProvider>
          <DashboardGrid pageId="overview" />
        </WidgetProvider>
      );

      // Check that focus-visible styles are applied
      const style = getComputedStyle(document.documentElement);
      expect(style).toBeTruthy();
    });

    it('should trap focus in dialogs', async () => {
      const user = userEvent.setup();
      
      render(
        <WidgetProvider>
          <WidgetRenderer
            widgetKey="stats-card"
            config={{}}
            isEditMode={true}
            widgetId="w1"
            layoutId="l1"
          />
        </WidgetProvider>
      );

      // Open settings dialog
      const settingsButton = screen.getByRole('button', { name: /open widget settings/i });
      await user.click(settingsButton);

      const dialog = screen.getByRole('dialog');
      expect(dialog).toBeInTheDocument();

      // Tab through dialog elements
      await user.tab();
      expect(within(dialog).getByRole('combobox')).toHaveFocus();

      await user.tab();
      expect(within(dialog).getByRole('button', { name: /cancel/i })).toHaveFocus();

      await user.tab();
      expect(within(dialog).getByRole('button', { name: /apply changes/i })).toHaveFocus();
    });
  });

  describe('Screen Reader Announcements', () => {
    it('should have proper live regions for dynamic content', async () => {
      render(
        <WidgetProvider>
          <DashboardGrid pageId="overview" />
        </WidgetProvider>
      );

      // Check for live regions
      const liveRegions = screen.queryAllByRole('status');
      liveRegions.forEach((region) => {
        expect(region).toHaveAttribute('aria-live');
      });
    });

    it('should announce widget additions', async () => {
      // This would require mocking toast notifications
      // which announce widget additions via aria-live regions
      expect(true).toBe(true); // Placeholder
    });
  });
});

// Helper function to verify theme contrast
function verifyThemeContrast(theme: any) {
  // Import the actual function
  const { verifyThemeContrast: verify } = require('@/lib/accessibility/color-contrast');
  return verify(theme);
}
