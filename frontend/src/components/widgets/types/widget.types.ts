/**
 * Widget System Type Definitions
 * 
 * Comprehensive TypeScript interfaces for the widget system.
 * All widgets share common base props and extend with specific functionality.
 */

import { LucideIcon } from 'lucide-react';
import { ReactNode } from 'react';

// ============================================================================
// Base Widget Props
// ============================================================================

/**
 * Base props shared by all widgets
 */
export interface BaseWidgetProps {
  /** Show loading state with skeleton loader */
  loading?: boolean;
  /** Error message to display in error state */
  error?: string;
  /** Permission required to view widget (uses PermissionGuard) */
  permission?: string;
  /** Additional CSS classes */
  className?: string;
}

// ============================================================================
// Stats and Metrics
// ============================================================================

/**
 * Trend data for showing increase/decrease indicators
 */
export interface TrendData {
  /** Percentage value (e.g., 12 for 12%) */
  value: number;
  /** Direction of trend */
  direction: 'up' | 'down';
  /** Optional period label (e.g., "vs last month") */
  period?: string;
}

/**
 * Single statistic item for display
 */
export interface StatItem {
  /** Stat title/label */
  title: string;
  /** Stat value (number or formatted string) */
  value: string | number;
  /** Optional icon from Lucide React */
  icon?: LucideIcon;
  /** Optional trend indicator */
  trend?: TrendData;
  /** Optional color token (primary, secondary, accent, etc.) */
  color?: string;
}

// ============================================================================
// Lists and Grids
// ============================================================================

/**
 * Generic list item for ListWidget and similar components
 */
export interface ListItem {
  /** Unique identifier */
  id: string;
  /** Item title */
  title: string;
  /** Optional description */
  description?: string;
  /** Optional icon */
  icon?: LucideIcon;
  /** Additional metadata */
  metadata?: Record<string, unknown>;
}

// ============================================================================
// Activity and Timeline
// ============================================================================

/**
 * Activity feed item
 */
export interface ActivityItem {
  /** Unique identifier */
  id: string;
  /** Activity type (e.g., "user_created", "post_updated") */
  type: string;
  /** Activity title */
  title: string;
  /** Optional description */
  description?: string;
  /** Activity timestamp */
  timestamp: Date;
  /** User who performed the activity */
  user?: {
    name: string;
    avatar?: string;
  };
  /** Additional metadata */
  metadata?: Record<string, unknown>;
}

// ============================================================================
// Kanban Board
// ============================================================================

/**
 * Kanban board item
 */
export interface KanbanItem {
  /** Unique identifier */
  id: string;
  /** Item title */
  title: string;
  /** Optional description */
  description?: string;
  /** Column ID this item belongs to */
  columnId: string;
  /** Additional metadata */
  metadata?: Record<string, unknown>;
}

/**
 * Kanban board column
 */
export interface KanbanColumn {
  /** Unique identifier */
  id: string;
  /** Column title */
  title: string;
  /** Items in this column */
  items: KanbanItem[];
}

// ============================================================================
// Calendar
// ============================================================================

/**
 * Calendar event
 */
export interface CalendarEvent {
  /** Unique identifier */
  id: string;
  /** Event title */
  title: string;
  /** Event start date/time */
  start: Date;
  /** Event end date/time */
  end: Date;
  /** All-day event flag */
  allDay?: boolean;
  /** Optional color for event display */
  color?: string;
  /** Additional metadata */
  metadata?: Record<string, unknown>;
}

// ============================================================================
// Tree View
// ============================================================================

/**
 * Tree node for hierarchical data
 */
export interface TreeNode {
  /** Unique identifier */
  id: string;
  /** Node label */
  label: string;
  /** Child nodes */
  children?: TreeNode[];
  /** Optional icon */
  icon?: LucideIcon;
  /** Additional metadata */
  metadata?: Record<string, unknown>;
}

// ============================================================================
// Filters
// ============================================================================

/**
 * Filter option for select-type filters
 */
export interface FilterOption {
  /** Display label */
  label: string;
  /** Filter value */
  value: string;
}

/**
 * Filter configuration
 */
export interface FilterConfig {
  /** Unique filter identifier */
  id: string;
  /** Filter label */
  label: string;
  /** Filter input type */
  type: 'text' | 'select' | 'date' | 'range';
  /** Options for select-type filters */
  options?: FilterOption[];
  /** Default value */
  defaultValue?: string | number | Date | [number, number];
}

/**
 * Current filter state (key-value pairs)
 */
export interface FilterState {
  [key: string]: string | number | Date | [number, number] | undefined;
}

// ============================================================================
// Widget Container Props
// ============================================================================

/**
 * Props for WidgetContainer wrapper component
 */
export interface WidgetContainerProps extends BaseWidgetProps {
  /** Widget title */
  title: string;
  /** Optional action buttons/elements in header */
  actions?: ReactNode;
  /** Enable collapsible functionality */
  collapsible?: boolean;
  /** Default collapsed state */
  defaultCollapsed?: boolean;
  /** Widget content */
  children: ReactNode;
}

// ============================================================================
// Chart Types
// ============================================================================

/**
 * Chart configuration
 */
export interface ChartConfig {
  /** X-axis data key */
  xAxisKey?: string;
  /** Y-axis data key */
  yAxisKey?: string;
  /** Data keys for series */
  dataKeys: string[];
  /** Custom colors (defaults to theme chart colors) */
  colors?: string[];
  /** Show legend */
  showLegend?: boolean;
  /** Show tooltip */
  showTooltip?: boolean;
  /** Show grid lines */
  showGrid?: boolean;
}

/**
 * Chart widget props
 */
export interface ChartWidgetProps extends BaseWidgetProps {
  /** Chart type */
  type: 'line' | 'bar' | 'pie' | 'area' | 'composed';
  /** Chart data */
  data: Record<string, unknown>[];
  /** Optional title */
  title?: string;
  /** Chart height in pixels */
  height?: number;
  /** Chart configuration */
  config: ChartConfig;
}

// ============================================================================
// Data Table Types
// ============================================================================

/**
 * Column definition for data table
 * Simplified version - use ColumnDef from @tanstack/react-table for full typing
 */
export interface ColumnDef<T = unknown> {
  /** Column accessor key */
  accessorKey?: string;
  /** Column header */
  header: string | ((props: unknown) => ReactNode);
  /** Cell renderer */
  cell?: (props: { row: { original: T } }) => ReactNode;
  /** Enable sorting */
  enableSorting?: boolean;
  /** Enable filtering */
  enableColumnFilter?: boolean;
}

/**
 * Data table props (generic)
 */
export interface DataTableProps<T> extends BaseWidgetProps {
  /** Table data */
  data: T[];
  /** Column definitions (TanStack Table format) */
  columns: ColumnDef<T>[];
  /** Optional row actions renderer */
  actions?: (row: T) => ReactNode;
  /** Enable global search */
  searchable?: boolean;
  /** Enable column filters */
  filterable?: boolean;
  /** Enable pagination */
  pagination?: boolean;
  /** Row click handler */
  onRowClick?: (row: T) => void;
}

// ============================================================================
// Form Widget Types
// ============================================================================

/**
 * File upload props
 */
export interface FileUploadProps extends BaseWidgetProps {
  /** Accepted file types (e.g., "image/*", ".pdf") */
  accept?: string;
  /** Maximum file size in bytes */
  maxSize?: number;
  /** Allow multiple file selection */
  multiple?: boolean;
  /** Upload handler */
  onUpload: (files: File[]) => Promise<void>;
}

/**
 * Date range value
 */
export interface DateRange {
  from: Date;
  to: Date;
}

/**
 * Date range picker props
 */
export interface DateRangePickerProps extends BaseWidgetProps {
  /** Current date range */
  value?: DateRange;
  /** Change handler */
  onChange: (range: DateRange | undefined) => void;
  /** Show preset ranges */
  showPresets?: boolean;
}

/**
 * Multi-select option
 */
export interface MultiSelectOption {
  label: string;
  value: string;
}

/**
 * Multi-select props
 */
export interface MultiSelectProps extends BaseWidgetProps {
  /** Available options */
  options: MultiSelectOption[];
  /** Selected values */
  value: string[];
  /** Change handler */
  onChange: (values: string[]) => void;
  /** Placeholder text */
  placeholder?: string;
  /** Enable search */
  searchable?: boolean;
}

// ============================================================================
// Interactive Widget Types
// ============================================================================

/**
 * Quick action button configuration
 */
export interface QuickAction {
  /** Action label */
  label: string;
  /** Action icon */
  icon?: LucideIcon;
  /** Click handler */
  onClick: () => void;
  /** Optional permission required */
  permission?: string;
  /** Button variant */
  variant?: 'default' | 'outline' | 'ghost' | 'destructive';
}

/**
 * Quick actions props
 */
export interface QuickActionsProps extends BaseWidgetProps {
  /** Action buttons */
  actions: QuickAction[];
  /** Layout orientation */
  layout?: 'horizontal' | 'vertical' | 'grid';
  /** Button size */
  size?: 'sm' | 'md' | 'lg';
}

/**
 * Search bar props
 */
export interface SearchBarProps extends BaseWidgetProps {
  /** Search query */
  value: string;
  /** Change handler */
  onChange: (value: string) => void;
  /** Placeholder text */
  placeholder?: string;
  /** Search suggestions */
  suggestions?: string[];
  /** Debounce delay in ms (default: 300) */
  debounceMs?: number;
}

/**
 * Filter panel props
 */
export interface FilterPanelProps extends BaseWidgetProps {
  /** Filter configurations */
  filters: FilterConfig[];
  /** Current filter state */
  value: FilterState;
  /** Change handler */
  onChange: (state: FilterState) => void;
  /** Enable collapsible */
  collapsible?: boolean;
}

// ============================================================================
// Layout Widget Types
// ============================================================================

/**
 * Page header props
 */
export interface PageHeaderProps extends BaseWidgetProps {
  /** Page title */
  title: string;
  /** Optional description */
  description?: string;
  /** Breadcrumb items */
  breadcrumbs?: Array<{ label: string; href?: string }>;
  /** Action buttons */
  actions?: ReactNode;
}

/**
 * Empty state props
 */
export interface EmptyStateProps extends BaseWidgetProps {
  /** Icon to display */
  icon?: LucideIcon;
  /** Title text */
  title: string;
  /** Description text */
  description?: string;
  /** Optional call-to-action button */
  action?: {
    label: string;
    onClick: () => void;
  };
}

/**
 * Skeleton loader props
 */
export interface SkeletonLoaderProps {
  /** Skeleton variant */
  variant: 'text' | 'card' | 'table' | 'chart';
  /** Number of skeleton items */
  count?: number;
  /** Additional CSS classes */
  className?: string;
}

// ============================================================================
// Utility Widget Types
// ============================================================================

/**
 * Badge props
 */
export interface BadgeProps {
  /** Badge content */
  children: ReactNode;
  /** Badge variant */
  variant?: 'default' | 'success' | 'warning' | 'error' | 'info';
  /** Badge size */
  size?: 'sm' | 'md' | 'lg';
  /** Optional icon */
  icon?: LucideIcon;
  /** Additional CSS classes */
  className?: string;
}

/**
 * Avatar props
 */
export interface AvatarProps {
  /** Image source URL */
  src?: string;
  /** Fallback text (initials) */
  fallback: string;
  /** Avatar size */
  size?: 'xs' | 'sm' | 'md' | 'lg' | 'xl';
  /** Status indicator */
  status?: 'online' | 'offline' | 'away';
  /** Additional CSS classes */
  className?: string;
}

/**
 * Modal props
 */
export interface ModalProps {
  /** Modal open state */
  open: boolean;
  /** Close handler */
  onClose: () => void;
  /** Modal title */
  title: string;
  /** Modal content */
  children: ReactNode;
  /** Modal size */
  size?: 'sm' | 'md' | 'lg' | 'xl' | 'full';
  /** Optional permission required */
  permission?: string;
  /** Additional CSS classes */
  className?: string;
}

// ============================================================================
// Integration Widget Types
// ============================================================================

/**
 * API widget props
 */
export interface ApiWidgetProps<T> extends BaseWidgetProps {
  /** API endpoint URL */
  endpoint: string;
  /** Auto-refresh interval in ms (0 = disabled) */
  refreshInterval?: number;
  /** Render function receiving fetched data */
  render: (data: T) => ReactNode;
}

/**
 * Permission wrapper props
 */
export interface PermissionWrapperProps {
  /** Required permission(s) */
  permission: string | string[];
  /** Require all permissions (default: false) */
  requireAll?: boolean;
  /** Fallback content when permission denied */
  fallback?: ReactNode;
  /** Content to protect */
  children: ReactNode;
}

/**
 * Export button props
 */
export interface ExportButtonProps extends BaseWidgetProps {
  /** Data to export */
  data: Record<string, unknown>[];
  /** Export format */
  format: 'csv' | 'pdf' | 'excel' | 'json';
  /** Filename (without extension) */
  filename: string;
  /** Button label */
  label?: string;
}

/**
 * Bulk action configuration
 */
export interface BulkAction {
  /** Action label */
  label: string;
  /** Action icon */
  icon?: LucideIcon;
  /** Action handler receiving selected IDs */
  onClick: (selectedIds: string[]) => void;
  /** Optional permission required */
  permission?: string;
  /** Action variant */
  variant?: 'default' | 'outline' | 'ghost' | 'destructive';
}

/**
 * Bulk actions props
 */
export interface BulkActionsProps extends BaseWidgetProps {
  /** Selected item IDs */
  selectedIds: string[];
  /** Available bulk actions */
  actions: BulkAction[];
}

// ============================================================================
// Specialized Widget Types
// ============================================================================

/**
 * User card props
 */
export interface UserCardProps extends BaseWidgetProps {
  /** User data */
  user: {
    id: string;
    name: string;
    email: string;
    avatar?: string;
    role?: string;
    [key: string]: unknown;
  };
  /** Optional action buttons */
  actions?: ReactNode;
}

/**
 * Pricing card props
 */
export interface PricingCardProps extends BaseWidgetProps {
  /** Plan name */
  name: string;
  /** Plan price */
  price: string | number;
  /** Billing period */
  period?: string;
  /** Plan features */
  features: string[];
  /** Highlight as featured plan */
  featured?: boolean;
  /** Select button handler */
  onSelect?: () => void;
}

/**
 * Comparison table props
 */
export interface ComparisonTableProps extends BaseWidgetProps {
  /** Column headers */
  columns: string[];
  /** Feature rows */
  features: Array<{
    name: string;
    values: (boolean | string)[];
  }>;
  /** Highlighted column index */
  highlightColumn?: number;
}

// ============================================================================
// Export all types
// ============================================================================

export type {
  // Re-export for convenience
  LucideIcon,
  ReactNode,
};
