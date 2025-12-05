/**
 * Widget Type Definitions for Dashboard Customization System
 * 
 * These types match the backend Prisma schema and provide
 * type safety for the frontend widget system.
 */

import { ComponentType } from 'react';

// ============================================================================
// Widget Definition (matches backend WidgetDefinition model)
// ============================================================================

/**
 * Widget definition from the backend registry
 */
export interface WidgetDefinition {
  id: string;
  key: string;
  name: string;
  description: string;
  component: string;
  category: string;
  icon: string;
  defaultGridSpan: number;
  minGridSpan: number;
  maxGridSpan: number;
  configSchema: WidgetConfigSchema;
  dataRequirements: WidgetDataRequirements;
  useCases: string[];
  examples: WidgetExample[];
  tags: string[];
  isActive: boolean;
  isSystemWidget: boolean;
  createdAt: string;
  updatedAt: string;
}

/**
 * Widget configuration schema (JSON Schema format)
 */
export interface WidgetConfigSchema {
  type: 'object';
  properties: Record<string, WidgetConfigProperty>;
  required?: string[];
  additionalProperties?: boolean;
}

/**
 * Widget configuration property definition
 */
export interface WidgetConfigProperty {
  type: 'string' | 'number' | 'boolean' | 'array' | 'object';
  description?: string;
  default?: any;
  enum?: any[];
  items?: WidgetConfigProperty;
  properties?: Record<string, WidgetConfigProperty>;
  minimum?: number;
  maximum?: number;
  minLength?: number;
  maxLength?: number;
}

/**
 * Widget data requirements
 */
export interface WidgetDataRequirements {
  /** API endpoints required by the widget */
  endpoints?: string[];
  /** Permissions required to view/use the widget */
  permissions?: string[];
  /** Auto-refresh interval in milliseconds (0 = no refresh) */
  refreshInterval?: number;
  /** Dependencies on other widgets or services */
  dependencies?: string[];
}

/**
 * Widget usage example
 */
export interface WidgetExample {
  title: string;
  description: string;
  config: Record<string, any>;
  preview?: string;
}

// ============================================================================
// Dashboard Layout (matches backend DashboardLayout model)
// ============================================================================

/**
 * Dashboard layout configuration
 */
export interface DashboardLayout {
  id: string;
  pageId: string;
  userId: string | null;
  scope: 'global' | 'user';
  name: string;
  description: string | null;
  isActive: boolean;
  isDefault: boolean;
  createdAt: string;
  updatedAt: string;
  widgetInstances?: WidgetInstance[];
}

// ============================================================================
// Widget Instance (matches backend WidgetInstance model)
// ============================================================================

/**
 * Widget instance on a dashboard layout
 */
export interface WidgetInstance {
  id: string;
  layoutId: string;
  widgetKey: string;
  position: number;
  gridSpan: number;
  gridRow: number | null;
  config: WidgetConfig;
  isVisible: boolean;
  createdAt: string;
  updatedAt: string;
  widgetDefinition?: WidgetDefinition;
}

// ============================================================================
// Widget Config (Generic type for widget-specific configuration)
// ============================================================================

/**
 * Generic widget configuration type
 * Extend this for specific widget types
 */
export type WidgetConfig<T = Record<string, any>> = T;

/**
 * Common widget configuration properties
 */
export interface BaseWidgetConfig {
  /** Widget title override */
  title?: string;
  /** Widget description override */
  description?: string;
  /** Show/hide widget header */
  showHeader?: boolean;
  /** Enable collapsible functionality */
  collapsible?: boolean;
  /** Default collapsed state */
  defaultCollapsed?: boolean;
  /** Custom CSS classes */
  className?: string;
  /** Permission required to view widget */
  permission?: string;
}

/**
 * Chart widget configuration
 */
export interface ChartWidgetConfig extends BaseWidgetConfig {
  type: 'line' | 'bar' | 'pie' | 'area' | 'composed';
  height?: number;
  xAxisKey?: string;
  yAxisKey?: string;
  dataKeys: string[];
  colors?: string[];
  showLegend?: boolean;
  showTooltip?: boolean;
  showGrid?: boolean;
  dataSource?: string;
}

/**
 * Stats card widget configuration
 */
export interface StatsCardConfig extends BaseWidgetConfig {
  title: string;
  value: string | number;
  icon?: string;
  color?: string;
  trend?: {
    value: number;
    direction: 'up' | 'down';
    period?: string;
  };
  dataSource?: string;
}

/**
 * Data table widget configuration
 */
export interface DataTableConfig extends BaseWidgetConfig {
  columns: Array<{
    key: string;
    header: string;
    sortable?: boolean;
    filterable?: boolean;
  }>;
  searchable?: boolean;
  filterable?: boolean;
  pagination?: boolean;
  pageSize?: number;
  dataSource?: string;
}

/**
 * List widget configuration
 */
export interface ListWidgetConfig extends BaseWidgetConfig {
  itemTemplate?: 'default' | 'compact' | 'detailed';
  showIcons?: boolean;
  showMetadata?: boolean;
  maxItems?: number;
  dataSource?: string;
}

/**
 * Quick actions widget configuration
 */
export interface QuickActionsConfig extends BaseWidgetConfig {
  actions: Array<{
    label: string;
    icon?: string;
    onClick: string;
    permission?: string;
    variant?: 'default' | 'outline' | 'ghost' | 'destructive';
  }>;
  layout?: 'horizontal' | 'vertical' | 'grid';
  size?: 'sm' | 'md' | 'lg';
}

// ============================================================================
// Frontend-specific types
// ============================================================================

/**
 * Widget component props (passed to rendered widgets)
 */
export interface WidgetComponentProps<T = any> {
  /** Widget configuration */
  config: WidgetConfig<T>;
  /** Edit mode flag */
  isEditMode?: boolean;
  /** Loading state */
  loading?: boolean;
  /** Error message */
  error?: string;
  /** Remove widget callback */
  onRemove?: () => void;
  /** Update config callback */
  onConfigChange?: (config: WidgetConfig<T>) => void;
}

/**
 * Widget registry entry (frontend)
 */
export interface WidgetRegistryEntry {
  component: ComponentType<any>;
  defaultProps?: Record<string, any>;
  propTypes?: Record<string, any>;
  category: string;
  lazy?: boolean;
}

/**
 * Widget metadata for UI display
 */
export interface WidgetMetadata {
  key: string;
  name: string;
  description: string;
  category: string;
  icon: string;
  defaultGridSpan: number;
  minGridSpan: number;
  maxGridSpan: number;
  tags: string[];
  useCases: string[];
  examples: WidgetExample[];
}

// ============================================================================
// DTOs for API requests
// ============================================================================

/**
 * Create widget definition DTO
 */
export interface CreateWidgetDefinitionDto {
  key: string;
  name: string;
  description: string;
  component: string;
  category: string;
  icon: string;
  defaultGridSpan?: number;
  minGridSpan?: number;
  maxGridSpan?: number;
  configSchema: WidgetConfigSchema;
  dataRequirements: WidgetDataRequirements;
  useCases?: string[];
  examples?: WidgetExample[];
  tags?: string[];
  isActive?: boolean;
  isSystemWidget?: boolean;
}

/**
 * Update widget definition DTO
 */
export interface UpdateWidgetDefinitionDto extends Partial<CreateWidgetDefinitionDto> {}

/**
 * Create dashboard layout DTO
 */
export interface CreateDashboardLayoutDto {
  pageId: string;
  userId?: string | null;
  scope?: 'global' | 'user';
  name: string;
  description?: string | null;
  isActive?: boolean;
  isDefault?: boolean;
}

/**
 * Update dashboard layout DTO
 */
export interface UpdateDashboardLayoutDto extends Partial<CreateDashboardLayoutDto> {}

/**
 * Create widget instance DTO
 */
export interface CreateWidgetInstanceDto {
  layoutId: string;
  widgetKey: string;
  position: number;
  gridSpan?: number;
  gridRow?: number | null;
  config: WidgetConfig;
  isVisible?: boolean;
}

/**
 * Update widget instance DTO
 */
export interface UpdateWidgetInstanceDto extends Partial<Omit<CreateWidgetInstanceDto, 'layoutId' | 'widgetKey'>> {}

/**
 * Reorder widget instances DTO
 */
export interface ReorderWidgetInstancesDto {
  updates: Array<{
    id: string;
    position: number;
    gridRow?: number | null;
  }>;
}

// ============================================================================
// Query and filter types
// ============================================================================

/**
 * Widget definition query filters
 */
export interface WidgetDefinitionFilters {
  category?: string;
  isActive?: boolean;
  search?: string;
  tags?: string[];
}

/**
 * Widget search DTO (natural language search)
 */
export interface WidgetSearchDto {
  /** Search query (natural language or keywords) */
  query: string;
  /** Maximum number of results */
  limit?: number;
  /** Include relevance scores in response */
  includeScores?: boolean;
  /** Include usage suggestions for each widget */
  includeSuggestions?: boolean;
  /** Include configuration examples in response */
  includeExamples?: boolean;
}

/**
 * Widget search result with scoring
 */
export interface WidgetSearchResult {
  widget: WidgetDefinition;
  score: number;
  relevance: number;
  matchDetails: string[];
  suggestions?: string[];
  examples?: WidgetExample[];
}

/**
 * Dashboard layout query filters
 */
export interface DashboardLayoutFilters {
  pageId?: string;
  userId?: string;
  scope?: 'global' | 'user';
  isActive?: boolean;
  isDefault?: boolean;
}

/**
 * Widget instance query filters
 */
export interface WidgetInstanceFilters {
  layoutId?: string;
  widgetKey?: string;
  isVisible?: boolean;
}

// ============================================================================
// API response types
// ============================================================================

/**
 * Paginated widget definitions response
 */
export interface WidgetDefinitionsResponse {
  data: WidgetDefinition[];
  total: number;
  page?: number;
  limit?: number;
}

/**
 * Paginated dashboard layouts response
 */
export interface DashboardLayoutsResponse {
  data: DashboardLayout[];
  total: number;
  page?: number;
  limit?: number;
}

/**
 * Paginated widget instances response
 */
export interface WidgetInstancesResponse {
  data: WidgetInstance[];
  total: number;
  page?: number;
  limit?: number;
}

/**
 * Widget categories response
 */
export interface WidgetCategoriesResponse {
  categories: string[];
}

/**
 * Layout templates response
 */
export interface LayoutTemplatesResponse {
  templates: LayoutTemplate[];
}

// ============================================================================
// Layout template types
// ============================================================================

/**
 * Layout template definition
 */
export interface LayoutTemplate {
  id: string;
  name: string;
  description: string;
  category: string;
  preview?: string;
  widgets: Array<{
    widgetKey: string;
    position: number;
    gridSpan: number;
    gridRow?: number | null;
    config: WidgetConfig;
  }>;
}

// ============================================================================
// System capabilities (for AI discovery)
// ============================================================================

/**
 * System capabilities response
 */
export interface SystemCapabilities {
  widgets: WidgetDefinition[];
  layoutTemplates: LayoutTemplate[];
  permissions: string[];
  categories: string[];
  version: string;
}

// ============================================================================
// Validation and error types
// ============================================================================

/**
 * Widget validation error
 */
export interface WidgetValidationError {
  field: string;
  message: string;
  code: string;
}

/**
 * Layout validation result
 */
export interface LayoutValidationResult {
  valid: boolean;
  errors: WidgetValidationError[];
  warnings: string[];
}
