import { describe, it, expect, beforeEach, vi } from 'vitest';
import { MenuItem, PageType } from '@/types/menu';

/**
 * Test Suite: Menu Filtering by Features
 * 
 * Tests the filterMenusByFeatures function to ensure that:
 * 1. Menus are correctly filtered based on enabled features
 * 2. All features enabled shows all menus
 * 3. Some features disabled hides corresponding menus
 * 4. Only dashboard enabled shows only dashboard menu
 * 5. Nested menus are filtered recursively
 * 
 * **Feature: feature-flags-system, Property 1: Menu filtering by features**
 * **Validates: Requirements 5.3, 5.6, 6.1, 6.2, 6.3, 6.4, 6.5, 6.6**
 */

// Mock the features config
vi.mock('@/config/features.config', () => ({
  isFeatureEnabled: vi.fn((feature: string) => {
    // This will be overridden in each test
    return true;
  }),
}));

import { isFeatureEnabled } from '@/config/features.config';

/**
 * Helper function to filter menus by features
 * This mirrors the implementation in NavigationContext
 */
function filterMenusByFeatures(menuItems: MenuItem[]): MenuItem[] {
  return menuItems
    .filter((item) => {
      if (!item.featureFlag) {
        return true;
      }
      return isFeatureEnabled(item.featureFlag as any);
    })
    .map((item) => ({
      ...item,
      children: item.children ? filterMenusByFeatures(item.children) : undefined,
    }));
}

/**
 * Create mock menu items for testing
 */
function createMockMenuItems(): MenuItem[] {
  return [
    {
      id: '1',
      key: 'dashboard',
      label: 'Dashboard',
      icon: 'LayoutDashboard',
      route: '/dashboard',
      order: 1,
      pageType: PageType.WIDGET_BASED,
      isActive: true,
      requiredPermissions: [],
      requiredRoles: [],
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      // Dashboard has no feature flag - always shown
    },
    {
      id: '2',
      key: 'blog',
      label: 'Blog',
      icon: 'BookOpen',
      route: '/dashboard/blog',
      order: 2,
      pageType: PageType.WIDGET_BASED,
      isActive: true,
      requiredPermissions: [],
      requiredRoles: [],
      featureFlag: 'blog',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    },
    {
      id: '3',
      key: 'ecommerce',
      label: 'E-Commerce',
      icon: 'ShoppingCart',
      route: '/dashboard/ecommerce',
      order: 3,
      pageType: PageType.WIDGET_BASED,
      isActive: true,
      requiredPermissions: [],
      requiredRoles: [],
      featureFlag: 'ecommerce',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      children: [
        {
          id: '3.1',
          key: 'products',
          label: 'Products',
          icon: 'Package',
          route: '/dashboard/ecommerce/products',
          order: 1,
          parentId: '3',
          pageType: PageType.WIDGET_BASED,
          isActive: true,
          requiredPermissions: [],
          requiredRoles: [],
          featureFlag: 'ecommerce',
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        },
        {
          id: '3.2',
          key: 'orders',
          label: 'Orders',
          icon: 'ClipboardList',
          route: '/dashboard/ecommerce/orders',
          order: 2,
          parentId: '3',
          pageType: PageType.WIDGET_BASED,
          isActive: true,
          requiredPermissions: [],
          requiredRoles: [],
          featureFlag: 'ecommerce',
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        },
      ],
    },
    {
      id: '4',
      key: 'calendar',
      label: 'Calendar',
      icon: 'Calendar',
      route: '/dashboard/calendar',
      order: 4,
      pageType: PageType.WIDGET_BASED,
      isActive: true,
      requiredPermissions: [],
      requiredRoles: [],
      featureFlag: 'calendar',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    },
    {
      id: '5',
      key: 'crm',
      label: 'CRM',
      icon: 'Users',
      route: '/dashboard/crm',
      order: 5,
      pageType: PageType.WIDGET_BASED,
      isActive: true,
      requiredPermissions: [],
      requiredRoles: [],
      featureFlag: 'crm',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    },
    {
      id: '6',
      key: 'notifications',
      label: 'Notifications',
      icon: 'Bell',
      route: '/dashboard/notifications',
      order: 6,
      pageType: PageType.WIDGET_BASED,
      isActive: true,
      requiredPermissions: [],
      requiredRoles: [],
      featureFlag: 'notifications',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    },
  ];
}

describe('Menu Filtering by Features', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('All features enabled', () => {
    it('should show all menus when all features are enabled', () => {
      // Setup: Mock all features as enabled
      vi.mocked(isFeatureEnabled).mockReturnValue(true);

      const mockMenus = createMockMenuItems();
      const filtered = filterMenusByFeatures(mockMenus);

      // Verify: All 6 menus should be present
      expect(filtered).toHaveLength(6);
      expect(filtered.map((m) => m.key)).toEqual([
        'dashboard',
        'blog',
        'ecommerce',
        'calendar',
        'crm',
        'notifications',
      ]);
    });

    it('should include nested children when parent feature is enabled', () => {
      // Setup: Mock all features as enabled
      vi.mocked(isFeatureEnabled).mockReturnValue(true);

      const mockMenus = createMockMenuItems();
      const filtered = filterMenusByFeatures(mockMenus);

      // Verify: E-commerce menu should have 2 children
      const ecommerce = filtered.find((m) => m.key === 'ecommerce');
      expect(ecommerce?.children).toHaveLength(2);
      expect(ecommerce?.children?.map((c) => c.key)).toEqual(['products', 'orders']);
    });
  });

  describe('Some features disabled', () => {
    it('should hide blog menu when blog feature is disabled', () => {
      // Setup: Mock only blog as disabled
      vi.mocked(isFeatureEnabled).mockImplementation((feature) => feature !== 'blog');

      const mockMenus = createMockMenuItems();
      const filtered = filterMenusByFeatures(mockMenus);

      // Verify: Blog menu should not be present
      expect(filtered.map((m) => m.key)).not.toContain('blog');
      expect(filtered).toHaveLength(5);
    });

    it('should hide ecommerce menu and its children when ecommerce feature is disabled', () => {
      // Setup: Mock only ecommerce as disabled
      vi.mocked(isFeatureEnabled).mockImplementation((feature) => feature !== 'ecommerce');

      const mockMenus = createMockMenuItems();
      const filtered = filterMenusByFeatures(mockMenus);

      // Verify: E-commerce menu should not be present
      expect(filtered.map((m) => m.key)).not.toContain('ecommerce');
      expect(filtered).toHaveLength(5);
    });

    it('should hide calendar menu when calendar feature is disabled', () => {
      // Setup: Mock only calendar as disabled
      vi.mocked(isFeatureEnabled).mockImplementation((feature) => feature !== 'calendar');

      const mockMenus = createMockMenuItems();
      const filtered = filterMenusByFeatures(mockMenus);

      // Verify: Calendar menu should not be present
      expect(filtered.map((m) => m.key)).not.toContain('calendar');
      expect(filtered).toHaveLength(5);
    });

    it('should hide crm menu when crm feature is disabled', () => {
      // Setup: Mock only crm as disabled
      vi.mocked(isFeatureEnabled).mockImplementation((feature) => feature !== 'crm');

      const mockMenus = createMockMenuItems();
      const filtered = filterMenusByFeatures(mockMenus);

      // Verify: CRM menu should not be present
      expect(filtered.map((m) => m.key)).not.toContain('crm');
      expect(filtered).toHaveLength(5);
    });

    it('should hide notifications menu when notifications feature is disabled', () => {
      // Setup: Mock only notifications as disabled
      vi.mocked(isFeatureEnabled).mockImplementation((feature) => feature !== 'notifications');

      const mockMenus = createMockMenuItems();
      const filtered = filterMenusByFeatures(mockMenus);

      // Verify: Notifications menu should not be present
      expect(filtered.map((m) => m.key)).not.toContain('notifications');
      expect(filtered).toHaveLength(5);
    });

    it('should handle multiple disabled features', () => {
      // Setup: Mock blog, ecommerce, and crm as disabled
      vi.mocked(isFeatureEnabled).mockImplementation(
        (feature) => !['blog', 'ecommerce', 'crm'].includes(feature)
      );

      const mockMenus = createMockMenuItems();
      const filtered = filterMenusByFeatures(mockMenus);

      // Verify: Only dashboard, calendar, and notifications should be present
      expect(filtered.map((m) => m.key)).toEqual(['dashboard', 'calendar', 'notifications']);
      expect(filtered).toHaveLength(3);
    });
  });

  describe('Only dashboard enabled', () => {
    it('should show only dashboard menu when all other features are disabled', () => {
      // Setup: Mock only dashboard as enabled (no feature flag)
      vi.mocked(isFeatureEnabled).mockReturnValue(false);

      const mockMenus = createMockMenuItems();
      const filtered = filterMenusByFeatures(mockMenus);

      // Verify: Only dashboard should be present
      expect(filtered).toHaveLength(1);
      expect(filtered[0].key).toBe('dashboard');
    });

    it('should not include any children when all features are disabled', () => {
      // Setup: Mock all features as disabled
      vi.mocked(isFeatureEnabled).mockReturnValue(false);

      const mockMenus = createMockMenuItems();
      const filtered = filterMenusByFeatures(mockMenus);

      // Verify: Dashboard should have no children
      expect(filtered[0].children).toBeUndefined();
    });
  });

  describe('Nested menu filtering', () => {
    it('should recursively filter nested children', () => {
      // Setup: Mock only ecommerce as enabled
      vi.mocked(isFeatureEnabled).mockImplementation((feature) => feature === 'ecommerce');

      const mockMenus = createMockMenuItems();
      const filtered = filterMenusByFeatures(mockMenus);

      // Verify: Dashboard (no feature flag) and ecommerce should be present
      // Dashboard is always shown because it has no feature flag
      expect(filtered).toHaveLength(2);
      const ecommerce = filtered.find((m) => m.key === 'ecommerce');
      expect(ecommerce).toBeDefined();
      expect(ecommerce?.children).toHaveLength(2);
    });

    it('should preserve menu structure when filtering', () => {
      // Setup: Mock all features as enabled
      vi.mocked(isFeatureEnabled).mockReturnValue(true);

      const mockMenus = createMockMenuItems();
      const filtered = filterMenusByFeatures(mockMenus);

      // Verify: E-commerce menu structure is preserved
      const ecommerce = filtered.find((m) => m.key === 'ecommerce');
      expect(ecommerce?.children?.[0].parentId).toBe('3');
      expect(ecommerce?.children?.[1].parentId).toBe('3');
    });
  });

  describe('Menus without feature flags', () => {
    it('should always show menus without feature flags', () => {
      // Setup: Mock all features as disabled
      vi.mocked(isFeatureEnabled).mockReturnValue(false);

      const mockMenus = createMockMenuItems();
      const filtered = filterMenusByFeatures(mockMenus);

      // Verify: Dashboard (no feature flag) should still be present
      expect(filtered).toHaveLength(1);
      expect(filtered[0].key).toBe('dashboard');
    });

    it('should show menus without feature flags even when all features are disabled', () => {
      // Setup: Create menus with and without feature flags
      const menus: MenuItem[] = [
        {
          id: '1',
          key: 'dashboard',
          label: 'Dashboard',
          icon: 'LayoutDashboard',
          route: '/dashboard',
          order: 1,
          pageType: PageType.WIDGET_BASED,
          isActive: true,
          requiredPermissions: [],
          requiredRoles: [],
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
          // No feature flag
        },
        {
          id: '2',
          key: 'settings',
          label: 'Settings',
          icon: 'Settings',
          route: '/dashboard/settings',
          order: 2,
          pageType: PageType.WIDGET_BASED,
          isActive: true,
          requiredPermissions: [],
          requiredRoles: [],
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
          // No feature flag
        },
        {
          id: '3',
          key: 'blog',
          label: 'Blog',
          icon: 'BookOpen',
          route: '/dashboard/blog',
          order: 3,
          pageType: PageType.WIDGET_BASED,
          isActive: true,
          requiredPermissions: [],
          requiredRoles: [],
          featureFlag: 'blog',
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        },
      ];

      // Mock all features as disabled
      vi.mocked(isFeatureEnabled).mockReturnValue(false);

      const filtered = filterMenusByFeatures(menus);

      // Verify: Dashboard and Settings should be present, but not Blog
      expect(filtered.map((m) => m.key)).toEqual(['dashboard', 'settings']);
      expect(filtered).toHaveLength(2);
    });
  });

  describe('Edge cases', () => {
    it('should handle empty menu list', () => {
      // Setup: Empty menu list
      const mockMenus: MenuItem[] = [];

      // Mock all features as enabled
      vi.mocked(isFeatureEnabled).mockReturnValue(true);

      const filtered = filterMenusByFeatures(mockMenus);

      // Verify: Should return empty array
      expect(filtered).toHaveLength(0);
    });

    it('should handle menus with undefined children', () => {
      // Setup: Menu without children property
      const menus: MenuItem[] = [
        {
          id: '1',
          key: 'dashboard',
          label: 'Dashboard',
          icon: 'LayoutDashboard',
          route: '/dashboard',
          order: 1,
          pageType: PageType.WIDGET_BASED,
          isActive: true,
          requiredPermissions: [],
          requiredRoles: [],
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
          children: undefined,
        },
      ];

      // Mock all features as enabled
      vi.mocked(isFeatureEnabled).mockReturnValue(true);

      const filtered = filterMenusByFeatures(menus);

      // Verify: Should handle undefined children gracefully
      expect(filtered).toHaveLength(1);
      expect(filtered[0].children).toBeUndefined();
    });

    it('should handle deeply nested menus', () => {
      // Setup: Create deeply nested menu structure
      const menus: MenuItem[] = [
        {
          id: '1',
          key: 'ecommerce',
          label: 'E-Commerce',
          icon: 'ShoppingCart',
          route: '/dashboard/ecommerce',
          order: 1,
          pageType: PageType.WIDGET_BASED,
          isActive: true,
          requiredPermissions: [],
          requiredRoles: [],
          featureFlag: 'ecommerce',
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
          children: [
            {
              id: '1.1',
              key: 'products',
              label: 'Products',
              icon: 'Package',
              route: '/dashboard/ecommerce/products',
              order: 1,
              parentId: '1',
              pageType: PageType.WIDGET_BASED,
              isActive: true,
              requiredPermissions: [],
              requiredRoles: [],
              featureFlag: 'ecommerce',
              createdAt: new Date().toISOString(),
              updatedAt: new Date().toISOString(),
              children: [
                {
                  id: '1.1.1',
                  key: 'categories',
                  label: 'Categories',
                  icon: 'Folder',
                  route: '/dashboard/ecommerce/products/categories',
                  order: 1,
                  parentId: '1.1',
                  pageType: PageType.WIDGET_BASED,
                  isActive: true,
                  requiredPermissions: [],
                  requiredRoles: [],
                  featureFlag: 'ecommerce',
                  createdAt: new Date().toISOString(),
                  updatedAt: new Date().toISOString(),
                },
              ],
            },
          ],
        },
      ];

      // Mock ecommerce as enabled
      vi.mocked(isFeatureEnabled).mockImplementation((feature) => feature === 'ecommerce');

      const filtered = filterMenusByFeatures(menus);

      // Verify: All nested levels should be preserved
      expect(filtered).toHaveLength(1);
      expect(filtered[0].children).toHaveLength(1);
      expect(filtered[0].children?.[0].children).toHaveLength(1);
      expect(filtered[0].children?.[0].children?.[0].key).toBe('categories');
    });
  });
});
