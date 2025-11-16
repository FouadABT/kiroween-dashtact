/**
 * Menu Management Types
 * 
 * TypeScript types for the dynamic menu management system.
 * These types match the backend DTOs to ensure type safety across the stack.
 */

/**
 * Page rendering type enum
 * Determines how a menu item's page should be rendered
 */
export enum PageType {
  WIDGET_BASED = 'WIDGET_BASED',
  HARDCODED = 'HARDCODED',
  CUSTOM = 'CUSTOM',
  EXTERNAL = 'EXTERNAL',
}

/**
 * Menu item interface
 * Represents a single menu item with all its configuration
 */
export interface MenuItem {
  id: string;
  key: string;
  label: string;
  icon: string;
  route: string;
  order: number;
  parentId?: string;
  pageType: PageType;
  pageIdentifier?: string;
  componentPath?: string;
  isActive: boolean;
  requiredPermissions: string[];
  requiredRoles: string[];
  featureFlag?: string;
  description?: string;
  badge?: string;
  availableWidgets?: string[];
  createdAt: string;
  updatedAt: string;
  children?: MenuItem[];
}

/**
 * Menu form data type
 * Used for creating and editing menu items in forms
 */
export interface MenuFormData {
  key: string;
  label: string;
  icon: string;
  route: string;
  order: number;
  parentId?: string;
  pageType: PageType;
  pageIdentifier?: string;
  componentPath?: string;
  isActive?: boolean;
  requiredPermissions?: string[];
  requiredRoles?: string[];
  featureFlag?: string;
  description?: string;
  badge?: string;
  availableWidgets?: string[];
}

/**
 * Page configuration type
 * Extracted from menu item for page rendering
 */
export interface PageConfig {
  pageType: PageType;
  pageIdentifier?: string;
  componentPath?: string;
  requiredPermissions: string[];
  requiredRoles: string[];
}

/**
 * Reorder menu item type
 * Used for bulk reordering operations
 */
export interface ReorderMenuItem {
  id: string;
  order: number;
}

/**
 * Menu filters type
 * Used for filtering menu items in the admin interface
 */
export interface MenuFilters {
  search?: string;
  pageType?: PageType;
  isActive?: boolean;
  parentId?: string;
}

/**
 * Menu API response type
 * Generic wrapper for API responses
 */
export interface MenuApiResponse<T> {
  data: T;
  message?: string;
  error?: string;
}

/**
 * Create menu DTO
 * Used when creating a new menu item
 */
export type CreateMenuDto = MenuFormData;

/**
 * Update menu DTO
 * Used when updating an existing menu item (all fields optional)
 */
export type UpdateMenuDto = Partial<MenuFormData>;
