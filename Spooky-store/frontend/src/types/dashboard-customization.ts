/**
 * Dashboard Customization System Types
 * Synced with backend/prisma/schema.prisma
 */

// Widget Definition Types
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
  configSchema: Record<string, any>;
  dataRequirements: Record<string, any>;
  useCases: string[];
  examples: any[];
  tags: string[];
  isActive: boolean;
  isSystemWidget: boolean;
  createdAt: string;
  updatedAt: string;
}

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
  configSchema: Record<string, any>;
  dataRequirements: Record<string, any>;
  useCases?: string[];
  examples?: any[];
  tags?: string[];
  isActive?: boolean;
  isSystemWidget?: boolean;
}

export interface UpdateWidgetDefinitionDto extends Partial<CreateWidgetDefinitionDto> {}

// Dashboard Layout Types
export interface DashboardLayout {
  id: string;
  pageId: string;
  userId: string | null;
  scope: string;
  name: string;
  description: string | null;
  isActive: boolean;
  isDefault: boolean;
  createdAt: string;
  updatedAt: string;
  widgetInstances?: WidgetInstance[];
}

export interface CreateDashboardLayoutDto {
  pageId: string;
  userId?: string | null;
  scope?: string;
  name: string;
  description?: string | null;
  isActive?: boolean;
  isDefault?: boolean;
}

export interface UpdateDashboardLayoutDto extends Partial<CreateDashboardLayoutDto> {}

// Widget Instance Types
export interface WidgetInstance {
  id: string;
  layoutId: string;
  widgetKey: string;
  position: number;
  gridSpan: number;
  gridRow: number | null;
  config: Record<string, any>;
  isVisible: boolean;
  createdAt: string;
  updatedAt: string;
  widgetDefinition?: WidgetDefinition;
}

export interface CreateWidgetInstanceDto {
  layoutId: string;
  widgetKey: string;
  position: number;
  gridSpan?: number;
  gridRow?: number | null;
  config: Record<string, any>;
  isVisible?: boolean;
}

export interface UpdateWidgetInstanceDto {
  position?: number;
  gridSpan?: number;
  gridRow?: number | null;
  config?: Record<string, any>;
  isVisible?: boolean;
}

// Query and Response Types
export interface WidgetDefinitionQueryDto {
  category?: string;
  isActive?: boolean;
  search?: string;
  tags?: string[];
}

export interface DashboardLayoutQueryDto {
  pageId?: string;
  userId?: string;
  scope?: string;
  isActive?: boolean;
  isDefault?: boolean;
}

export interface WidgetInstanceQueryDto {
  layoutId?: string;
  widgetKey?: string;
  isVisible?: boolean;
}

// Reorder Types
export interface ReorderWidgetInstancesDto {
  updates: Array<{
    id: string;
    position: number;
    gridRow?: number | null;
  }>;
}

// Template Types
export interface LayoutTemplate {
  id: string;
  name: string;
  description: string;
  category: string;
  widgets: Array<{
    widgetKey: string;
    position: number;
    gridSpan: number;
    gridRow?: number | null;
    config: Record<string, any>;
  }>;
}

// API Response Types
export interface WidgetDefinitionsResponse {
  data: WidgetDefinition[];
  total: number;
}

export interface DashboardLayoutsResponse {
  data: DashboardLayout[];
  total: number;
}

export interface WidgetInstancesResponse {
  data: WidgetInstance[];
  total: number;
}

// Widget Registry Types (Frontend)
export interface WidgetComponent {
  component: React.ComponentType<any>;
  defaultProps?: Record<string, any>;
  propTypes?: Record<string, any>;
}

export interface WidgetRegistry {
  [key: string]: WidgetComponent;
}

// Widget Context Types
export interface WidgetContextValue {
  layouts: DashboardLayout[];
  currentLayout: DashboardLayout | null;
  isLoading: boolean;
  isEditMode: boolean;
  fetchLayouts: (pageId: string) => Promise<void>;
  updateLayout: (id: string, data: UpdateDashboardLayoutDto) => Promise<void>;
  addWidget: (layoutId: string, widget: CreateWidgetInstanceDto) => Promise<void>;
  removeWidget: (layoutId: string, widgetId: string) => Promise<void>;
  reorderWidgets: (layoutId: string, updates: ReorderWidgetInstancesDto) => Promise<void>;
  toggleEditMode: () => void;
}

// Capabilities Response (for AI Discovery)
export interface SystemCapabilities {
  widgets: WidgetDefinition[];
  layoutTemplates: LayoutTemplate[];
  permissions: string[];
  version: string;
}
