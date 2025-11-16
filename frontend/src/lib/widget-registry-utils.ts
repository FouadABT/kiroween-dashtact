/**
 * Widget Registry Utilities
 * 
 * Helper functions for working with the widget registry.
 * Provides error handling, validation, and convenience methods.
 */

import { ComponentType } from 'react';
import { 
  widgetRegistry, 
  WidgetRegistryEntry,
  getWidgetComponent as getComponent,
  getWidgetsByCategory as getByCategory,
  getWidgetMetadata as getMetadata,
  hasWidget,
  getAllWidgetKeys,
  getWidgetCategories,
  getWidgetsByCategories,
} from './widget-registry';
import { WidgetDefinition, WidgetMetadata } from '@/types/widgets';

// ============================================================================
// Error Classes
// ============================================================================

/**
 * Error thrown when a widget is not found in the registry
 */
export class WidgetNotFoundError extends Error {
  constructor(public widgetKey: string) {
    super(`Widget not found: ${widgetKey}`);
    this.name = 'WidgetNotFoundError';
  }
}

/**
 * Error thrown when a widget fails to load
 */
export class WidgetLoadError extends Error {
  constructor(public widgetKey: string, public cause?: Error) {
    super(`Failed to load widget: ${widgetKey}`);
    this.name = 'WidgetLoadError';
    if (cause) {
      this.stack = `${this.stack}\nCaused by: ${cause.stack}`;
    }
  }
}

// ============================================================================
// Core Registry Functions (with error handling)
// ============================================================================

/**
 * Get widget component by key with error handling
 * @param key - Widget key
 * @returns Component
 * @throws {WidgetNotFoundError} If widget not found
 */
export function getWidgetComponent(key: string): ComponentType<any> {
  const component = getComponent(key);
  
  if (!component) {
    throw new WidgetNotFoundError(key);
  }
  
  return component;
}

/**
 * Get widget component safely (returns null instead of throwing)
 * @param key - Widget key
 * @returns Component or null if not found
 */
export function getWidgetComponentSafe(key: string): ComponentType<any> | null {
  try {
    return getWidgetComponent(key);
  } catch (error) {
    if (error instanceof WidgetNotFoundError) {
      console.warn(`Widget not found: ${key}`);
      return null;
    }
    throw error;
  }
}

/**
 * Get widgets by category
 * @param category - Widget category
 * @returns Array of widget keys
 */
export function getWidgetsByCategory(category: string): string[] {
  return getByCategory(category);
}

/**
 * Get widget metadata
 * @param key - Widget key
 * @returns Widget metadata
 * @throws {WidgetNotFoundError} If widget not found
 */
export function getWidgetMetadata(key: string): Omit<WidgetRegistryEntry, 'component'> {
  const metadata = getMetadata(key);
  
  if (!metadata) {
    throw new WidgetNotFoundError(key);
  }
  
  return metadata;
}

/**
 * Get widget metadata safely (returns null instead of throwing)
 * @param key - Widget key
 * @returns Widget metadata or null if not found
 */
export function getWidgetMetadataSafe(key: string): Omit<WidgetRegistryEntry, 'component'> | null {
  try {
    return getWidgetMetadata(key);
  } catch (error) {
    if (error instanceof WidgetNotFoundError) {
      return null;
    }
    throw error;
  }
}

// ============================================================================
// Widget Validation
// ============================================================================

/**
 * Validate widget key exists in registry
 * @param key - Widget key
 * @returns True if valid
 */
export function isValidWidgetKey(key: string): boolean {
  return hasWidget(key);
}

/**
 * Validate multiple widget keys
 * @param keys - Array of widget keys
 * @returns Object with valid and invalid keys
 */
export function validateWidgetKeys(keys: string[]): {
  valid: string[];
  invalid: string[];
} {
  const valid: string[] = [];
  const invalid: string[] = [];
  
  keys.forEach(key => {
    if (isValidWidgetKey(key)) {
      valid.push(key);
    } else {
      invalid.push(key);
    }
  });
  
  return { valid, invalid };
}

/**
 * Validate widget configuration against schema
 * @param key - Widget key
 * @param config - Widget configuration
 * @returns Validation result
 */
export function validateWidgetConfig(
  key: string,
  config: Record<string, any>
): { valid: boolean; errors: string[] } {
  const metadata = getWidgetMetadataSafe(key);
  
  if (!metadata) {
    return {
      valid: false,
      errors: [`Widget not found: ${key}`],
    };
  }
  
  // Basic validation - check if config is an object
  if (typeof config !== 'object' || config === null) {
    return {
      valid: false,
      errors: ['Configuration must be an object'],
    };
  }
  
  // Additional validation can be added here based on configSchema
  // For now, we just check that it's a valid object
  
  return {
    valid: true,
    errors: [],
  };
}

// ============================================================================
// Widget Discovery
// ============================================================================

/**
 * Search widgets by name, description, or tags
 * @param query - Search query
 * @param definitions - Widget definitions from backend
 * @returns Matching widget definitions
 */
export function searchWidgets(
  query: string,
  definitions: WidgetDefinition[]
): WidgetDefinition[] {
  const lowerQuery = query.toLowerCase();
  
  return definitions.filter(widget => {
    // Search in name
    if (widget.name.toLowerCase().includes(lowerQuery)) {
      return true;
    }
    
    // Search in description
    if (widget.description.toLowerCase().includes(lowerQuery)) {
      return true;
    }
    
    // Search in tags
    if (widget.tags.some(tag => tag.toLowerCase().includes(lowerQuery))) {
      return true;
    }
    
    // Search in use cases
    if (widget.useCases.some(useCase => useCase.toLowerCase().includes(lowerQuery))) {
      return true;
    }
    
    return false;
  });
}

/**
 * Filter widgets by category
 * @param category - Category name
 * @param definitions - Widget definitions from backend
 * @returns Filtered widget definitions
 */
export function filterWidgetsByCategory(
  category: string,
  definitions: WidgetDefinition[]
): WidgetDefinition[] {
  return definitions.filter(widget => widget.category === category);
}

/**
 * Filter widgets by tags
 * @param tags - Array of tags
 * @param definitions - Widget definitions from backend
 * @param matchAll - If true, widget must have all tags; if false, any tag
 * @returns Filtered widget definitions
 */
export function filterWidgetsByTags(
  tags: string[],
  definitions: WidgetDefinition[],
  matchAll: boolean = false
): WidgetDefinition[] {
  return definitions.filter(widget => {
    if (matchAll) {
      return tags.every(tag => widget.tags.includes(tag));
    } else {
      return tags.some(tag => widget.tags.includes(tag));
    }
  });
}

/**
 * Get widgets that match user permissions
 * @param definitions - Widget definitions from backend
 * @param userPermissions - User's permissions
 * @returns Filtered widget definitions
 */
export function filterWidgetsByPermissions(
  definitions: WidgetDefinition[],
  userPermissions: string[]
): WidgetDefinition[] {
  return definitions.filter(widget => {
    // If widget has no permission requirements, it's available to all
    if (!widget.dataRequirements?.permissions || widget.dataRequirements.permissions.length === 0) {
      return true;
    }
    
    // Check if user has all required permissions
    return widget.dataRequirements.permissions.every(permission =>
      userPermissions.includes(permission)
    );
  });
}

// ============================================================================
// Widget Organization
// ============================================================================

/**
 * Group widgets by category
 * @param definitions - Widget definitions from backend
 * @returns Object with categories as keys and widget arrays as values
 */
export function groupWidgetsByCategory(
  definitions: WidgetDefinition[]
): Record<string, WidgetDefinition[]> {
  const grouped: Record<string, WidgetDefinition[]> = {};
  
  definitions.forEach(widget => {
    if (!grouped[widget.category]) {
      grouped[widget.category] = [];
    }
    grouped[widget.category].push(widget);
  });
  
  return grouped;
}

/**
 * Sort widgets by name
 * @param definitions - Widget definitions
 * @param ascending - Sort order
 * @returns Sorted widget definitions
 */
export function sortWidgetsByName(
  definitions: WidgetDefinition[],
  ascending: boolean = true
): WidgetDefinition[] {
  return [...definitions].sort((a, b) => {
    const comparison = a.name.localeCompare(b.name);
    return ascending ? comparison : -comparison;
  });
}

/**
 * Sort widgets by popularity (based on usage count - would need backend data)
 * For now, sorts by number of use cases as a proxy
 * @param definitions - Widget definitions
 * @returns Sorted widget definitions
 */
export function sortWidgetsByPopularity(
  definitions: WidgetDefinition[]
): WidgetDefinition[] {
  return [...definitions].sort((a, b) => {
    return b.useCases.length - a.useCases.length;
  });
}

// ============================================================================
// Widget Metadata Conversion
// ============================================================================

/**
 * Convert backend WidgetDefinition to frontend WidgetMetadata
 * @param definition - Widget definition from backend
 * @returns Widget metadata for frontend use
 */
export function toWidgetMetadata(definition: WidgetDefinition): WidgetMetadata {
  return {
    key: definition.key,
    name: definition.name,
    description: definition.description,
    category: definition.category,
    icon: definition.icon,
    defaultGridSpan: definition.defaultGridSpan,
    minGridSpan: definition.minGridSpan,
    maxGridSpan: definition.maxGridSpan,
    tags: definition.tags,
    useCases: definition.useCases,
    examples: definition.examples,
  };
}

/**
 * Convert multiple widget definitions to metadata
 * @param definitions - Widget definitions from backend
 * @returns Array of widget metadata
 */
export function toWidgetMetadataList(definitions: WidgetDefinition[]): WidgetMetadata[] {
  return definitions.map(toWidgetMetadata);
}

// ============================================================================
// Registry Information
// ============================================================================

/**
 * Get all available widget keys from registry
 * @returns Array of widget keys
 */
export function getAvailableWidgetKeys(): string[] {
  return getAllWidgetKeys();
}

/**
 * Get all available categories from registry
 * @returns Array of category names
 */
export function getAvailableCategories(): string[] {
  return getWidgetCategories();
}

/**
 * Get widgets for multiple categories
 * @param categories - Array of category names
 * @returns Array of widget keys
 */
export function getWidgetsForCategories(categories: string[]): string[] {
  return getWidgetsByCategories(categories);
}

/**
 * Get registry statistics
 * @returns Object with registry statistics
 */
export function getRegistryStats(): {
  totalWidgets: number;
  categories: number;
  widgetsByCategory: Record<string, number>;
} {
  const allKeys = getAllWidgetKeys();
  const categories = getWidgetCategories();
  const widgetsByCategory: Record<string, number> = {};
  
  categories.forEach(category => {
    widgetsByCategory[category] = getWidgetsByCategory(category).length;
  });
  
  return {
    totalWidgets: allKeys.length,
    categories: categories.length,
    widgetsByCategory,
  };
}

// ============================================================================
// Export all utilities
// ============================================================================

export {
  // Re-export from widget-registry for convenience
  hasWidget,
  getAllWidgetKeys,
  getWidgetCategories,
  getWidgetsByCategories,
};
