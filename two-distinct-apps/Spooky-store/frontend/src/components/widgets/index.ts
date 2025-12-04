/**
 * Widget System - Main Export
 * 
 * Comprehensive library of 40+ reusable, theme-aware, and permission-controlled UI components
 */

// Core Widgets
export * from './core/WidgetContainer';
export * from './core/StatsCard';
export * from './core/StatsGrid';
export * from './core/DataTable';
export * from './core/ChartWidget';
export * from './core/ActivityFeed';

// Data Display Widgets
export * from './data-display/MetricCard';
export * from './data-display/ProgressWidget';
export * from './data-display/ListWidget';
export * from './data-display/CardGrid';

// Interactive Widgets
export * from './interactive/QuickActions';
export * from './interactive/FilterPanel';
export * from './interactive/SearchBar';
export * from './interactive/NotificationWidget';

// Layout Widgets
export * from './layout/PageHeader';
export * from './layout/EmptyState';
export * from './layout/ErrorBoundary';
export * from './layout/SkeletonLoader';

// Form Widgets
export * from './forms/FormCard';
export * from './forms/DateRangePicker';
export * from './forms/MultiSelect';
export * from './forms/FileUpload';

// Utility Widgets
export * from './utility/Badge';
export * from './utility/Avatar';
export * from './utility/Tooltip';
export * from './utility/Modal';

// Advanced Widgets
export * from './advanced/KanbanBoard';
export * from './advanced/Calendar';
export * from './advanced/TreeView';
export * from './advanced/Timeline';

// Specialized Widgets
export * from './specialized/UserCard';
export * from './specialized/PricingCard';
export * from './specialized/ComparisonTable';
export * from './specialized/MapWidget';
export * from './specialized/ChatWidget';

// Integration Widgets
export * from './integration/ApiWidget';
export * from './integration/PermissionWrapper';
export * from './integration/ThemePreview';
export * from './integration/ExportButton';
export * from './integration/BulkActions';

// Types (export only types, not re-export component types to avoid duplicates)
export type {
  BaseWidgetProps,
  TrendData,
  StatItem,
  ListItem,
  ActivityItem,
  KanbanItem,
  KanbanColumn,
  CalendarEvent,
  TreeNode,
  FilterOption,
  FilterConfig,
  FilterState,
  WidgetContainerProps,
  ChartConfig,
  ColumnDef,
  DateRange,
  MultiSelectOption,
  QuickAction,
  LucideIcon,
  ReactNode,
} from './types/widget.types';
