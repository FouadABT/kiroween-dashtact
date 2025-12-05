/**
 * Widget Types
 * Synced with backend/src/widgets/dto/create-widget.dto.ts
 * and backend/prisma/migrations/20251114205905_add_dashboard_customization_tables/migration.sql
 */

export interface Widget {
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
  configSchema: Record<string, any>;
  dataRequirements: WidgetDataRequirements;
  useCases?: string[];
  examples?: WidgetExample[];
  tags?: string[];
  isActive: boolean;
  isSystemWidget: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface WidgetDataRequirements {
  endpoint?: string;
  permissions?: string[];
  refreshInterval?: number;
  [key: string]: any;
}

export interface WidgetExample {
  name: string;
  config: Record<string, any>;
  [key: string]: any;
}

export interface CreateWidgetDto {
  key: string;
  name: string;
  description: string;
  component: string;
  category: string;
  icon: string;
  defaultGridSpan?: number;
  minGridSpan?: number;
  maxGridSpan?: number;
  configSchema: Record<string, any>;
  dataRequirements: WidgetDataRequirements;
  useCases?: string[];
  examples?: WidgetExample[];
  tags?: string[];
  isActive?: boolean;
  isSystemWidget?: boolean;
}

export interface UpdateWidgetDto extends Partial<CreateWidgetDto> {}

export interface WidgetFiltersDto {
  category?: string;
  isActive?: boolean;
  tags?: string[];
  search?: string;
}

export interface WidgetSearchDto {
  query: string;
  limit?: number;
  includeScores?: boolean;
}

export interface WidgetSearchResult {
  widget: Widget;
  score: number;
}

export interface WidgetCategory {
  name: string;
  count: number;
}

// Widget categories enum for type safety
export enum WidgetCategoryEnum {
  ANALYTICS = 'analytics',
  ECOMMERCE = 'ecommerce',
  USERS = 'users',
  CONTENT = 'content',
  SYSTEM = 'system',
  CORE = 'core',
  DATA_DISPLAY = 'data-display',
  LAYOUT = 'layout',
}

// API Response types
export interface WidgetsListResponse {
  data: Widget[];
  total: number;
}

export interface WidgetResponse {
  data: Widget;
}

export interface CategoriesResponse {
  data: string[];
}
