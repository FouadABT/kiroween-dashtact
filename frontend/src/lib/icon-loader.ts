/**
 * Dynamic Icon Loader
 * 
 * Utility for dynamically loading Lucide icons by name.
 * This allows menu items to specify icon names as strings in the database.
 */

import { icons, type LucideIcon } from 'lucide-react';

/**
 * Get a Lucide icon component by name
 * @param iconName Name of the Lucide icon (e.g., 'Home', 'Settings')
 * @returns Icon component or fallback icon if not found
 */
export function getIconByName(iconName: string): LucideIcon {
  // Try to get the icon from lucide-react icons object
  const icon = icons[iconName as keyof typeof icons];
  
  if (icon) {
    return icon;
  }

  // Fallback to Circle icon if not found
  console.warn(`[icon-loader] Icon "${iconName}" not found, using fallback Circle`);
  return icons.Circle;
}

/**
 * Check if an icon name is valid
 * @param iconName Name to check
 * @returns true if icon exists in lucide-react
 */
export function isValidIconName(iconName: string): boolean {
  return iconName in icons;
}

/**
 * Get all available icon names
 * @returns Array of all available icon names from lucide-react
 */
export function getAllIconNames(): string[] {
  return Object.keys(icons);
}
