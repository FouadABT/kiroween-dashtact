import { ApiProperty } from '@nestjs/swagger';

class SystemInfo {
  @ApiProperty()
  name: string;

  @ApiProperty()
  version: string;

  @ApiProperty()
  description: string;

  @ApiProperty({ type: [String] })
  features: string[];

  @ApiProperty({ type: [String] })
  capabilities: string[];
}

class UserInfo {
  @ApiProperty()
  id: string;

  @ApiProperty()
  email: string;

  @ApiProperty()
  role: string;

  @ApiProperty({ type: [String] })
  permissions: string[];

  @ApiProperty()
  hasWidgetAccess: boolean;

  @ApiProperty()
  hasLayoutAccess: boolean;

  @ApiProperty()
  canCreateWidgets: boolean;

  @ApiProperty()
  canCreateLayouts: boolean;
}

class WidgetSummary {
  @ApiProperty()
  key: string;

  @ApiProperty()
  name: string;

  @ApiProperty()
  description: string;

  @ApiProperty()
  icon: string;

  @ApiProperty({ type: [String] })
  useCases: string[];

  @ApiProperty({ type: [String] })
  tags: string[];
}

class WidgetCategory {
  @ApiProperty()
  name: string;

  @ApiProperty()
  count: number;

  @ApiProperty({ type: [WidgetSummary] })
  widgets: WidgetSummary[];
}

class WidgetGridSpan {
  @ApiProperty()
  default: number;

  @ApiProperty()
  min: number;

  @ApiProperty()
  max: number;
}

class WidgetDetail {
  @ApiProperty()
  key: string;

  @ApiProperty()
  name: string;

  @ApiProperty()
  description: string;

  @ApiProperty()
  category: string;

  @ApiProperty()
  icon: string;

  @ApiProperty()
  gridSpan: WidgetGridSpan;

  @ApiProperty({ type: [String] })
  useCases: string[];

  @ApiProperty({ type: [String] })
  tags: string[];

  @ApiProperty({ type: 'array', items: { type: 'object' } })
  examples: any[];

  @ApiProperty({ type: 'object', additionalProperties: true })
  configSchema: any;

  @ApiProperty({ type: 'object', additionalProperties: true })
  dataRequirements: any;
}

class WidgetsInfo {
  @ApiProperty()
  total: number;

  @ApiProperty()
  available: number;

  @ApiProperty({ type: [WidgetCategory] })
  categories: WidgetCategory[];

  @ApiProperty({ type: 'object', additionalProperties: { type: 'number' } })
  byCategory: Record<string, number>;

  @ApiProperty({ type: [WidgetDetail] })
  list: WidgetDetail[];
}

class LayoutTemplate {
  @ApiProperty()
  key: string;

  @ApiProperty()
  name: string;

  @ApiProperty()
  description: string;

  @ApiProperty()
  category: string;

  @ApiProperty({ type: [String] })
  useCases: string[];

  @ApiProperty()
  widgetCount: number;

  @ApiProperty({ type: [String] })
  widgets: string[];

  @ApiProperty({ required: false })
  preview?: string;
}

class GridBreakpoint {
  @ApiProperty()
  columns: number;

  @ApiProperty()
  minWidth: number;
}

class GridConstraints {
  @ApiProperty()
  minGridSpan: number;

  @ApiProperty()
  maxGridSpan: number;

  @ApiProperty()
  defaultGridSpan: number;
}

class GridSystem {
  @ApiProperty()
  columns: number;

  @ApiProperty()
  breakpoints: {
    mobile: GridBreakpoint;
    tablet: GridBreakpoint;
    desktop: GridBreakpoint;
  };

  @ApiProperty()
  constraints: GridConstraints;
}

class LayoutsInfo {
  @ApiProperty({ type: [LayoutTemplate] })
  templates: LayoutTemplate[];

  @ApiProperty()
  gridSystem: GridSystem;
}

class NavigationInfo {
  @ApiProperty()
  structure: string;

  @ApiProperty()
  maxDepth: number;

  @ApiProperty({ type: [String] })
  features: string[];
}

class ApiEndpoints {
  @ApiProperty({ type: 'object', additionalProperties: { type: 'string' } })
  widgets: Record<string, string>;

  @ApiProperty({ type: 'object', additionalProperties: { type: 'string' } })
  layouts: Record<string, string>;

  @ApiProperty({ type: 'object', additionalProperties: { type: 'string' } })
  capabilities: Record<string, string>;
}

class ApiInfo {
  @ApiProperty()
  baseUrl: string;

  @ApiProperty()
  endpoints: ApiEndpoints;

  @ApiProperty()
  documentation: string;
}

class FeatureFlags {
  @ApiProperty()
  widgetCustomization: boolean;

  @ApiProperty()
  layoutTemplates: boolean;

  @ApiProperty()
  dragAndDrop: boolean;

  @ApiProperty()
  naturalLanguageSearch: boolean;

  @ApiProperty()
  layoutValidation: boolean;

  @ApiProperty()
  permissionFiltering: boolean;

  @ApiProperty()
  realTimeUpdates: boolean;
}

class Metadata {
  @ApiProperty()
  generatedAt: string;

  @ApiProperty()
  cacheExpiry: string;

  @ApiProperty()
  cacheTTL: number;

  @ApiProperty()
  version: string;
}

class CommonPattern {
  @ApiProperty()
  description: string;

  @ApiProperty()
  endpoint: string;

  @ApiProperty({ type: 'object', additionalProperties: true })
  example: any;
}

class Troubleshooting {
  @ApiProperty()
  widgetNotVisible: string;

  @ApiProperty()
  layoutInvalid: string;

  @ApiProperty()
  gridOverflow: string;

  @ApiProperty()
  templateNotFound: string;
}

class AiGuidance {
  @ApiProperty({ type: [String] })
  quickStart: string[];

  @ApiProperty({ type: 'object', additionalProperties: { type: 'object' } })
  commonPatterns: Record<string, CommonPattern>;

  @ApiProperty({ type: [String] })
  bestPractices: string[];

  @ApiProperty()
  troubleshooting: Troubleshooting;
}

export class CapabilitiesResponseDto {
  @ApiProperty()
  system: SystemInfo;

  @ApiProperty()
  user: UserInfo;

  @ApiProperty()
  widgets: WidgetsInfo;

  @ApiProperty()
  layouts: LayoutsInfo;

  @ApiProperty()
  navigation: NavigationInfo;

  @ApiProperty()
  api: ApiInfo;

  @ApiProperty()
  featureFlags: FeatureFlags;

  @ApiProperty()
  metadata: Metadata;

  @ApiProperty()
  aiGuidance: AiGuidance;
}
