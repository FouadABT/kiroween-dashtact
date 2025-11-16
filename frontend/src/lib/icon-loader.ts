/**
 * Dynamic Icon Loader
 * 
 * Utility for dynamically loading Lucide icons by name.
 * This allows menu items to specify icon names as strings in the database.
 * 
 * NOTE: We use explicit imports instead of dynamic lookup to avoid
 * tree-shaking issues in production builds.
 */

import {
  Home,
  BarChart3,
  ShoppingCart,
  Package,
  ShoppingBag,
  Users,
  Warehouse,
  FileEdit,
  FileText,
  Settings,
  Menu,
  Bell,
  Circle,
  type LucideIcon,
} from 'lucide-react';

/**
 * Icon registry mapping icon names to components
 * Add new icons here as needed
 */
const iconRegistry: Record<string, LucideIcon> = {
  Home,
  BarChart3,
  ShoppingCart,
  Package,
  ShoppingBag,
  Users,
  Warehouse,
  FileEdit,
  FileText,
  Settings,
  Menu,
  Bell,
  Circle,
};

/**
 * Get a Lucide icon component by name
 * @param iconName Name of the Lucide icon (e.g., 'Home', 'Settings')
 * @returns Icon component or fallback icon if not found
 */
export function getIconByName(iconName: string): LucideIcon {
  const icon = iconRegistry[iconName];
  
  if (icon) {
    return icon;
  }

  // Fallback to Circle icon if not found
  console.warn(`❌ [icon-loader] Icon "${iconName}" not found in registry, using fallback Circle`);
  return Circle;
}

/**
 * Check if an icon name is valid
 * @param iconName Name to check
 * @returns true if icon exists in registry
 */
export function isValidIconName(iconName: string): boolean {
  return iconName in iconRegistry;
}

/**
 * Get all available icon names
 * @returns Array of all registered icon names
 */
export function getAllIconNames(): string[] {
  return Object.keys(iconRegistry);
}
