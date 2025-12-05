import { Injectable } from '@nestjs/common';

@Injectable()
export class MenuFilterService {
  /**
   * Filter menus by user roles
   */
  filterByRole(menus: any[], userRoles: string[]): any[] {
    return menus.filter((menu) => {
      // If no roles required, menu is visible to all
      if (!menu.requiredRoles || menu.requiredRoles.length === 0) {
        return true;
      }

      // Check if user has at least one of the required roles
      return menu.requiredRoles.some((role: string) => userRoles.includes(role));
    });
  }

  /**
   * Filter menus by user permissions
   */
  filterByPermission(menus: any[], userPermissions: string[]): any[] {
    return menus.filter((menu) => {
      // If no permissions required, menu is visible to all
      if (!menu.requiredPermissions || menu.requiredPermissions.length === 0) {
        return true;
      }

      // Check for wildcard permission (*:*)
      if (userPermissions.includes('*:*')) {
        return true;
      }

      // Check if user has all required permissions
      return menu.requiredPermissions.every((permission: string) =>
        userPermissions.includes(permission),
      );
    });
  }

  /**
   * Filter menus by feature flags
   */
  filterByFeatureFlags(
    menus: any[],
    settings: {
      trackInventory?: boolean;
      shippingEnabled?: boolean;
      codEnabled?: boolean;
      portalEnabled?: boolean;
    } | null,
  ): any[] {
    return menus.filter((menu) => {
      // If no feature flag, menu is always visible
      if (!menu.featureFlag) {
        return true;
      }

      // If no settings found, hide feature-flagged menus
      if (!settings) {
        return false;
      }

      // Check feature flag status
      switch (menu.featureFlag) {
        case 'ecommerce':
        case 'ecommerce_enabled':
          // Ecommerce is enabled if settings exist
          return true;
        case 'inventory_enabled':
          return settings.trackInventory;
        case 'shipping_enabled':
          return settings.shippingEnabled;
        case 'cod_enabled':
          return settings.codEnabled;
        case 'portal_enabled':
          return settings.portalEnabled;
        case 'blog':
          // Blog is always enabled for now
          return true;
        default:
          // Unknown feature flag, assume enabled
          return true;
      }
    });
  }

  /**
   * Build hierarchical menu structure from flat list
   */
  buildHierarchy(menus: any[]): any[] {
    const menuMap = new Map<string, any>();
    const rootMenus: any[] = [];

    // Create a map of all menus
    menus.forEach((menu) => {
      menuMap.set(menu.id, { ...menu, children: [] });
    });

    // Build hierarchy
    menus.forEach((menu) => {
      const menuWithChildren = menuMap.get(menu.id);

      if (menu.parentId) {
        const parent = menuMap.get(menu.parentId);
        if (parent) {
          parent.children.push(menuWithChildren);
        } else {
          // Parent not found or filtered out, treat as root
          rootMenus.push(menuWithChildren);
        }
      } else {
        // Root level menu
        rootMenus.push(menuWithChildren);
      }
    });

    // Sort children recursively
    const sortChildren = (items: any[]) => {
      items.sort((a, b) => a.order - b.order);
      items.forEach((item) => {
        if (item.children && item.children.length > 0) {
          sortChildren(item.children);
        }
      });
    };

    sortChildren(rootMenus);

    return rootMenus;
  }

  /**
   * Sort menus by order value
   */
  sortByOrder(menus: any[]): any[] {
    return [...menus].sort((a, b) => a.order - b.order);
  }

  /**
   * Cascade visibility rules to child menu items
   * If parent is hidden, all children should be hidden
   */
  cascadeVisibility(menus: any[], visibleMenuIds: Set<string>): any[] {
    const isVisible = (menu: any): boolean => {
      // If menu itself is not visible, return false
      if (!visibleMenuIds.has(menu.id)) {
        return false;
      }

      // If menu has parent, check if parent is visible
      if (menu.parentId) {
        const parent = menus.find((m) => m.id === menu.parentId);
        if (parent && !isVisible(parent)) {
          return false;
        }
      }

      return true;
    };

    return menus.filter((menu) => isVisible(menu));
  }
}
