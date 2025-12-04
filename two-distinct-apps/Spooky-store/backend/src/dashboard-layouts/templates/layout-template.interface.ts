/**
 * Layout Template Interface
 * 
 * Defines the structure for pre-built dashboard layout templates.
 * Templates provide starting points for common dashboard configurations.
 */

export interface WidgetTemplateConfig {
  widgetKey: string;
  gridSpan: number;
  gridRow?: number;
  position: number;
  config?: Record<string, any>;
  isVisible?: boolean;
}

export interface LayoutTemplate {
  key: string;
  name: string;
  description: string;
  category?: string;
  useCases?: string[];
  tags?: string[];
  pageId?: string;
  widgets: WidgetTemplateConfig[];
  metadata?: {
    author?: string;
    version?: string;
    createdAt?: string;
    updatedAt?: string;
  };
}

export interface LayoutTemplateResponse {
  templates: LayoutTemplate[];
  total: number;
  categories?: string[];
}
