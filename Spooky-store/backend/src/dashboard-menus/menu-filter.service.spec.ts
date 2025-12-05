import { Test, TestingModule } from '@nestjs/testing';
import { MenuFilterService } from './menu-filter.service';

describe('MenuFilterService', () => {
  let service: MenuFilterService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [MenuFilterService],
    }).compile();

    service = module.get<MenuFilterService>(MenuFilterService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('filterByRole', () => {
    it('should return all menus when no roles required', () => {
      const menus = [
        { id: '1', label: 'Menu 1', requiredRoles: [] },
        { id: '2', label: 'Menu 2', requiredRoles: null },
        { id: '3', label: 'Menu 3' },
      ];

      const result = service.filterByRole(menus, ['User']);

      expect(result).toHaveLength(3);
    });

    it('should filter menus by user roles', () => {
      const menus = [
        { id: '1', label: 'Admin Menu', requiredRoles: ['Admin'] },
        { id: '2', label: 'User Menu', requiredRoles: ['User'] },
        { id: '3', label: 'Public Menu', requiredRoles: [] },
      ];

      const result = service.filterByRole(menus, ['User']);

      expect(result).toHaveLength(2);
      expect(result.find((m) => m.id === '1')).toBeUndefined();
      expect(result.find((m) => m.id === '2')).toBeDefined();
      expect(result.find((m) => m.id === '3')).toBeDefined();
    });

    it('should include menu if user has any of the required roles', () => {
      const menus = [
        { id: '1', label: 'Menu', requiredRoles: ['Admin', 'Manager'] },
      ];

      const result = service.filterByRole(menus, ['Manager', 'User']);

      expect(result).toHaveLength(1);
    });

    it('should exclude menu if user has none of the required roles', () => {
      const menus = [
        { id: '1', label: 'Menu', requiredRoles: ['Admin', 'Manager'] },
      ];

      const result = service.filterByRole(menus, ['User']);

      expect(result).toHaveLength(0);
    });
  });

  describe('filterByPermission', () => {
    it('should return all menus when no permissions required', () => {
      const menus = [
        { id: '1', label: 'Menu 1', requiredPermissions: [] },
        { id: '2', label: 'Menu 2', requiredPermissions: null },
        { id: '3', label: 'Menu 3' },
      ];

      const result = service.filterByPermission(menus, ['read']);

      expect(result).toHaveLength(3);
    });

    it('should filter menus by user permissions', () => {
      const menus = [
        { id: '1', label: 'Admin Menu', requiredPermissions: ['admin:write'] },
        { id: '2', label: 'Read Menu', requiredPermissions: ['read'] },
        { id: '3', label: 'Public Menu', requiredPermissions: [] },
      ];

      const result = service.filterByPermission(menus, ['read']);

      expect(result).toHaveLength(2);
      expect(result.find((m) => m.id === '1')).toBeUndefined();
      expect(result.find((m) => m.id === '2')).toBeDefined();
      expect(result.find((m) => m.id === '3')).toBeDefined();
    });

    it('should require all permissions to be present', () => {
      const menus = [
        {
          id: '1',
          label: 'Menu',
          requiredPermissions: ['read', 'write', 'delete'],
        },
      ];

      const resultPartial = service.filterByPermission(menus, ['read', 'write']);
      expect(resultPartial).toHaveLength(0);

      const resultFull = service.filterByPermission(menus, [
        'read',
        'write',
        'delete',
      ]);
      expect(resultFull).toHaveLength(1);
    });
  });

  describe('filterByFeatureFlags', () => {
    it('should return all menus when no feature flag specified', () => {
      const menus = [
        { id: '1', label: 'Menu 1', featureFlag: null },
        { id: '2', label: 'Menu 2' },
      ];

      const result = service.filterByFeatureFlags(menus, null);

      expect(result).toHaveLength(2);
    });

    it('should hide feature-flagged menus when settings are null', () => {
      const menus = [
        { id: '1', label: 'Ecommerce Menu', featureFlag: 'ecommerce_enabled' },
        { id: '2', label: 'Public Menu', featureFlag: null },
      ];

      const result = service.filterByFeatureFlags(menus, null);

      expect(result).toHaveLength(1);
      expect(result[0].id).toBe('2');
    });

    it('should show ecommerce menu when settings exist', () => {
      const menus = [
        { id: '1', label: 'Ecommerce Menu', featureFlag: 'ecommerce_enabled' },
      ];

      const result = service.filterByFeatureFlags(menus, {
        trackInventory: false,
        shippingEnabled: false,
        codEnabled: false,
        portalEnabled: false,
      });

      expect(result).toHaveLength(1);
    });

    it('should filter by inventory feature flag', () => {
      const menus = [
        { id: '1', label: 'Inventory Menu', featureFlag: 'inventory_enabled' },
      ];

      const resultDisabled = service.filterByFeatureFlags(menus, {
        trackInventory: false,
      });
      expect(resultDisabled).toHaveLength(0);

      const resultEnabled = service.filterByFeatureFlags(menus, {
        trackInventory: true,
      });
      expect(resultEnabled).toHaveLength(1);
    });

    it('should filter by shipping feature flag', () => {
      const menus = [
        { id: '1', label: 'Shipping Menu', featureFlag: 'shipping_enabled' },
      ];

      const resultDisabled = service.filterByFeatureFlags(menus, {
        shippingEnabled: false,
      });
      expect(resultDisabled).toHaveLength(0);

      const resultEnabled = service.filterByFeatureFlags(menus, {
        shippingEnabled: true,
      });
      expect(resultEnabled).toHaveLength(1);
    });

    it('should filter by COD feature flag', () => {
      const menus = [
        { id: '1', label: 'COD Menu', featureFlag: 'cod_enabled' },
      ];

      const resultDisabled = service.filterByFeatureFlags(menus, {
        codEnabled: false,
      });
      expect(resultDisabled).toHaveLength(0);

      const resultEnabled = service.filterByFeatureFlags(menus, {
        codEnabled: true,
      });
      expect(resultEnabled).toHaveLength(1);
    });

    it('should filter by portal feature flag', () => {
      const menus = [
        { id: '1', label: 'Portal Menu', featureFlag: 'portal_enabled' },
      ];

      const resultDisabled = service.filterByFeatureFlags(menus, {
        portalEnabled: false,
      });
      expect(resultDisabled).toHaveLength(0);

      const resultEnabled = service.filterByFeatureFlags(menus, {
        portalEnabled: true,
      });
      expect(resultEnabled).toHaveLength(1);
    });

    it('should hide menus with unknown feature flags', () => {
      const menus = [
        { id: '1', label: 'Unknown Menu', featureFlag: 'unknown_flag' },
      ];

      const result = service.filterByFeatureFlags(menus, {
        trackInventory: true,
      });

      expect(result).toHaveLength(0);
    });
  });

  describe('buildHierarchy', () => {
    it('should build hierarchy from flat list', () => {
      const menus = [
        { id: '1', label: 'Parent', parentId: null, order: 1 },
        { id: '2', label: 'Child 1', parentId: '1', order: 1 },
        { id: '3', label: 'Child 2', parentId: '1', order: 2 },
      ];

      const result = service.buildHierarchy(menus);

      expect(result).toHaveLength(1);
      expect(result[0].id).toBe('1');
      expect(result[0].children).toHaveLength(2);
      expect(result[0].children[0].id).toBe('2');
      expect(result[0].children[1].id).toBe('3');
    });

    it('should handle multiple root menus', () => {
      const menus = [
        { id: '1', label: 'Root 1', parentId: null, order: 1 },
        { id: '2', label: 'Root 2', parentId: null, order: 2 },
      ];

      const result = service.buildHierarchy(menus);

      expect(result).toHaveLength(2);
      expect(result[0].id).toBe('1');
      expect(result[1].id).toBe('2');
    });

    it('should handle nested hierarchies', () => {
      const menus = [
        { id: '1', label: 'Level 1', parentId: null, order: 1 },
        { id: '2', label: 'Level 2', parentId: '1', order: 1 },
        { id: '3', label: 'Level 3', parentId: '2', order: 1 },
      ];

      const result = service.buildHierarchy(menus);

      expect(result).toHaveLength(1);
      expect(result[0].children).toHaveLength(1);
      expect(result[0].children[0].children).toHaveLength(1);
      expect(result[0].children[0].children[0].id).toBe('3');
    });

    it('should sort children by order', () => {
      const menus = [
        { id: '1', label: 'Parent', parentId: null, order: 1 },
        { id: '2', label: 'Child 3', parentId: '1', order: 3 },
        { id: '3', label: 'Child 1', parentId: '1', order: 1 },
        { id: '4', label: 'Child 2', parentId: '1', order: 2 },
      ];

      const result = service.buildHierarchy(menus);

      expect(result[0].children[0].id).toBe('3');
      expect(result[0].children[1].id).toBe('4');
      expect(result[0].children[2].id).toBe('2');
    });

    it('should treat orphaned children as root when parent is missing', () => {
      const menus = [
        { id: '1', label: 'Orphan', parentId: 'non-existent', order: 1 },
        { id: '2', label: 'Root', parentId: null, order: 2 },
      ];

      const result = service.buildHierarchy(menus);

      expect(result).toHaveLength(2);
      expect(result.find((m) => m.id === '1')).toBeDefined();
    });

    it('should handle empty array', () => {
      const result = service.buildHierarchy([]);

      expect(result).toHaveLength(0);
    });
  });

  describe('sortByOrder', () => {
    it('should sort menus by order value', () => {
      const menus = [
        { id: '1', label: 'Third', order: 3 },
        { id: '2', label: 'First', order: 1 },
        { id: '3', label: 'Second', order: 2 },
      ];

      const result = service.sortByOrder(menus);

      expect(result[0].id).toBe('2');
      expect(result[1].id).toBe('3');
      expect(result[2].id).toBe('1');
    });

    it('should not mutate original array', () => {
      const menus = [
        { id: '1', label: 'Third', order: 3 },
        { id: '2', label: 'First', order: 1 },
      ];

      const result = service.sortByOrder(menus);

      expect(menus[0].id).toBe('1');
      expect(result[0].id).toBe('2');
    });

    it('should handle empty array', () => {
      const result = service.sortByOrder([]);

      expect(result).toHaveLength(0);
    });
  });

  describe('cascadeVisibility', () => {
    it('should hide children when parent is hidden', () => {
      const menus = [
        { id: '1', label: 'Parent', parentId: null },
        { id: '2', label: 'Child', parentId: '1' },
      ];

      const visibleIds = new Set(['2']); // Only child is visible

      const result = service.cascadeVisibility(menus, visibleIds);

      expect(result).toHaveLength(0);
    });

    it('should show children when parent is visible', () => {
      const menus = [
        { id: '1', label: 'Parent', parentId: null },
        { id: '2', label: 'Child', parentId: '1' },
      ];

      const visibleIds = new Set(['1', '2']);

      const result = service.cascadeVisibility(menus, visibleIds);

      expect(result).toHaveLength(2);
    });

    it('should handle nested hierarchies', () => {
      const menus = [
        { id: '1', label: 'Level 1', parentId: null },
        { id: '2', label: 'Level 2', parentId: '1' },
        { id: '3', label: 'Level 3', parentId: '2' },
      ];

      const visibleIds = new Set(['1', '3']); // Missing level 2

      const result = service.cascadeVisibility(menus, visibleIds);

      expect(result).toHaveLength(1);
      expect(result[0].id).toBe('1');
    });

    it('should show root menus without parents', () => {
      const menus = [
        { id: '1', label: 'Root 1', parentId: null },
        { id: '2', label: 'Root 2', parentId: null },
      ];

      const visibleIds = new Set(['1', '2']);

      const result = service.cascadeVisibility(menus, visibleIds);

      expect(result).toHaveLength(2);
    });
  });
});
