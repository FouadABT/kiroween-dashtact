# Widget System

A comprehensive library of 40+ reusable, theme-aware, and permission-controlled UI components for building rich dashboard interfaces.

## Overview

The Widget System provides a complete set of React components designed for modern dashboard applications. All widgets integrate seamlessly with:

- **JWT Authentication System** - Component-level access control
- **OKLCH Theme System** - Automatic light/dark mode adaptation
- **TypeScript** - Full type safety with comprehensive interfaces
- **Accessibility** - WCAG AA compliant with keyboard navigation
- **Performance** - Optimized with memoization, virtualization, and lazy loading

## Quick Start

### Installation

All required dependencies are already installed. The widget system uses:

```bash
# Core dependencies
recharts, date-fns, react-day-picker, @tanstack/react-virtual, react-dropzone

# Radix UI components
@radix-ui/react-tabs, @radix-ui/react-tooltip, @radix-ui/react-popover, etc.

# shadcn/ui components
badge, button, card, calendar, skeleton, table, tooltip, dialog, etc.

# Advanced features (optional)
@dnd-kit/core, @dnd-kit/sortable (for Kanban)
```

### Basic Usage

```typescript
import { StatsCard, DataTable, ChartWidget } from '@/components/widgets';

function Dashboard() {
  return (
    <div>
      {/* Simple stat display */}
      <StatsCard
        title="Total Users"
        value={1234}
        icon={Users}
        trend={{ value: 12, direction: 'up' }}
      />

      {/* Data table with search and pagination */}
      <DataTable
        data={users}
        columns={columns}
        searchable
        pagination
      />

      {/* Chart visualization */}
      <ChartWidget
        type="line"
        data={chartData}
        config={{
          xAxisKey: 'date',
          dataKeys: ['revenue', 'expenses'],
        }}
      />
    </div>
  );
}
```

### With Permissions

```typescript
import { StatsCard, PermissionGuard } from '@/components/widgets';

function Dashboard() {
  return (
    <div>
      {/* Visible only to users with analytics:read permission */}
      <StatsCard
        title="Revenue"
        value="$45,678"
        permission="analytics:read"
      />

      {/* Alternative: wrap in PermissionGuard */}
      <PermissionGuard permission="analytics:read">
        <StatsCard title="Revenue" value="$45,678" />
      </PermissionGuard>
    </div>
  );
}
```

### With Loading States

```typescript
import { StatsCard, DataTable } from '@/components/widgets';

function Dashboard() {
  const { data, isLoading } = useQuery('users', fetchUsers);

  return (
    <div>
      {/* Shows skeleton loader while loading */}
      <StatsCard
        title="Total Users"
        value={data?.count || 0}
        loading={isLoading}
      />

      <DataTable
        data={data?.users || []}
        columns={columns}
        loading={isLoading}
      />
    </div>
  );
}
```

## Widget Categories

### Core Widgets

Essential components for dashboards and data visualization.

- **WidgetContainer** - Base wrapper with loading, error, and permission support
- **StatsCard** - Single metric display with icon and trend
- **StatsGrid** - Responsive grid of stat cards
- **DataTable** - Advanced table with search, sort, filter, pagination
- **ChartWidget** - Charts using Recharts (line, bar, pie, area, composed)
- **ActivityFeed** - Timeline of activity items

[View Core Widgets Documentation](./core/README.md)

### Data Display Widgets

Components for displaying data in various formats.

- **MetricCard** - Large value display with comparison
- **ProgressWidget** - Progress bars and circles
- **ListWidget** - Scrollable list with icons
- **CardGrid** - Responsive grid of cards

[View Data Display Documentation](./data-display/README.md)

### Interactive Widgets

Components for user interaction and input.

- **QuickActions** - Action buttons in various layouts
- **FilterPanel** - Collapsible filter controls
- **SearchBar** - Debounced search with suggestions
- **NotificationWidget** - Toast notifications

[View Interactive Widgets Documentation](./interactive/README.md)

### Layout Widgets

Components for page structure and states.

- **PageHeader** - Page title with breadcrumbs and actions
- **EmptyState** - Empty state with icon and CTA
- **ErrorBoundary** - Error catching and display
- **SkeletonLoader** - Loading state placeholders

[View Layout Widgets Documentation](./layout/README.md)

### Form Widgets

Components for forms and data input.

- **FormCard** - Form wrapper with submit/cancel actions
- **DateRangePicker** - Date range selection with presets
- **MultiSelect** - Multi-option selection with search
- **FileUpload** - Drag-and-drop file upload

[View Form Widgets Documentation](./forms/README.md)

### Utility Widgets

Small, reusable UI components.

- **Badge** - Status badges with variants
- **Avatar** - User avatars with fallbacks
- **Tooltip** - Contextual tooltips
- **Modal** - Dialog modals with sizes

[View Utility Widgets Documentation](./utility/README.md)

### Advanced Widgets

Complex, feature-rich components.

- **KanbanBoard** - Drag-and-drop kanban board
- **Calendar** - Calendar with events
- **TreeView** - Hierarchical tree structure
- **Timeline** - Event timeline (horizontal/vertical)

[View Advanced Widgets Documentation](./advanced/README.md)

### Specialized Widgets

Domain-specific components.

- **UserCard** - User profile card
- **PricingCard** - Pricing plan display
- **ComparisonTable** - Feature comparison grid
- **MapWidget** - Map with markers (placeholder)
- **ChatWidget** - Chat interface

[View Specialized Widgets Documentation](./specialized/README.md)

### Integration Widgets

Components for API and system integration.

- **ApiWidget** - Fetch and display API data
- **PermissionWrapper** - Permission-based rendering
- **ThemePreview** - Theme variant preview
- **ExportButton** - Data export (CSV, PDF, Excel, JSON)
- **BulkActions** - Bulk action controls

[View Integration Widgets Documentation](./integration/README.md)

## Common Patterns

### Permission-Based Rendering

```typescript
// Method 1: Widget-level permission
<StatsCard
  title="Admin Stats"
  value={123}
  permission="admin:read"
/>

// Method 2: PermissionGuard wrapper
<PermissionGuard permission="admin:read">
  <StatsCard title="Admin Stats" value={123} />
</PermissionGuard>

// Method 3: Multiple permissions (requires ALL)
<PermissionGuard 
  permission={['posts:write', 'posts:publish']}
  requireAll={true}
>
  <Button>Publish</Button>
</PermissionGuard>

// Method 4: Multiple permissions (requires ANY)
<PermissionGuard 
  permission={['users:write', 'users:admin']}
  requireAll={false}
>
  <Button>Edit</Button>
</PermissionGuard>
```

### Loading and Error States

```typescript
// Loading state
<DataTable
  data={data}
  columns={columns}
  loading={isLoading}
/>

// Error state
<WidgetContainer
  title="User Stats"
  error={error?.message}
>
  <StatsGrid stats={stats} />
</WidgetContainer>

// Error boundary
<ErrorBoundary fallback={<CustomError />}>
  <ComplexWidget />
</ErrorBoundary>
```

### Theme-Aware Styling

```typescript
// Widgets automatically use theme colors
<div className="bg-card text-card-foreground border-border">
  <h3 className="text-primary">Title</h3>
  <p className="text-muted-foreground">Description</p>
</div>

// Chart colors from theme
<ChartWidget
  type="line"
  data={data}
  config={{
    colors: ['chart1', 'chart2', 'chart3'], // Uses theme chart colors
  }}
/>
```

### Responsive Design

```typescript
// Responsive grid
<StatsGrid
  stats={stats}
  columns={3} // 1 on mobile, 2 on tablet, 3 on desktop
/>

// Responsive card grid
<CardGrid
  items={items}
  columns={4} // Automatically responsive
  renderCard={(item) => <Card {...item} />}
/>
```

### Data Fetching with ApiWidget

```typescript
<ApiWidget
  endpoint="/api/stats"
  refreshInterval={30000} // Auto-refresh every 30s
  permission="analytics:read"
  render={(data) => (
    <StatsGrid stats={data.stats} />
  )}
/>
```

## TypeScript Types

All widgets are fully typed. Import types from the main export:

```typescript
import type {
  BaseWidgetProps,
  StatItem,
  TrendData,
  ListItem,
  ActivityItem,
  KanbanColumn,
  KanbanItem,
  CalendarEvent,
  TreeNode,
  FilterConfig,
  FilterState,
} from '@/components/widgets';
```

### Common Interfaces

```typescript
// Base props for all widgets
interface BaseWidgetProps {
  loading?: boolean;
  error?: string;
  permission?: string;
  className?: string;
}

// Stat item
interface StatItem {
  title: string;
  value: string | number;
  icon?: LucideIcon;
  trend?: TrendData;
  color?: string;
}

// Trend data
interface TrendData {
  value: number;
  direction: 'up' | 'down';
  period?: string;
}
```

## Performance Optimization

### Memoization

```typescript
import { memo } from 'react';

// Widgets are memoized to prevent unnecessary re-renders
const MemoizedStatsCard = memo(StatsCard);
```

### Lazy Loading

```typescript
import { lazy, Suspense } from 'react';

// Heavy components are lazy loaded
const ChartWidget = lazy(() => import('@/components/widgets/ChartWidget'));

<Suspense fallback={<SkeletonLoader variant="chart" />}>
  <ChartWidget type="line" data={data} />
</Suspense>
```

### Virtualization

```typescript
// Large lists use virtualization
<DataTable
  data={largeDataset} // 10,000+ rows
  columns={columns}
  pagination // Automatically handles large datasets
/>
```

### Debouncing

```typescript
// Search and filter inputs are debounced
<SearchBar
  onSearch={handleSearch} // Debounced by 300ms
  placeholder="Search..."
/>
```

## Accessibility

All widgets follow WCAG AA standards:

- **Keyboard Navigation** - Tab, Enter, Space, Arrow keys
- **ARIA Attributes** - Proper labels, roles, and live regions
- **Color Contrast** - 4.5:1 for text, 3:1 for UI components
- **Focus Indicators** - Visible in both light and dark themes
- **Screen Reader Support** - Announcements for dynamic content

```typescript
// Example: Accessible interactive list
<ListWidget
  items={items}
  onItemClick={handleClick}
  // Automatically includes:
  // - role="list" and role="listitem"
  // - tabIndex for keyboard navigation
  // - onKeyDown handlers for Enter/Space
  // - focus indicators
/>
```

## Testing

### Unit Tests

```typescript
import { render, screen } from '@testing-library/react';
import { StatsCard } from '@/components/widgets';

test('renders stat card with value', () => {
  render(<StatsCard title="Users" value={100} />);
  expect(screen.getByText('Users')).toBeInTheDocument();
  expect(screen.getByText('100')).toBeInTheDocument();
});
```

### Integration Tests

```typescript
test('hides widget when user lacks permission', () => {
  const { container } = render(
    <StatsCard
      title="Admin Stats"
      value={100}
      permission="admin:read"
    />
  );
  // Assuming user doesn't have permission
  expect(container.firstChild).toBeNull();
});
```

## Examples

See comprehensive usage examples in:

- **Category Examples** - Each category folder has an `examples.tsx` file
- **Usage Examples** - `frontend/src/examples/widget-usage.tsx`
- **Widget Gallery** - `/dashboard/widgets` (requires `widgets:admin` permission)

## API Reference

### WidgetContainer

Base wrapper component for all widgets.

```typescript
interface WidgetContainerProps {
  title: string;
  actions?: React.ReactNode;
  loading?: boolean;
  error?: string;
  permission?: string;
  collapsible?: boolean;
  defaultCollapsed?: boolean;
  children: React.ReactNode;
  className?: string;
}
```

### StatsCard

Single metric display with icon and trend.

```typescript
interface StatsCardProps {
  title: string;
  value: string | number;
  icon?: LucideIcon;
  trend?: {
    value: number;
    direction: 'up' | 'down';
  };
  color?: string;
  permission?: string;
  loading?: boolean;
  className?: string;
}
```

### DataTable

Advanced table with search, sort, filter, pagination.

```typescript
interface DataTableProps<T> {
  data: T[];
  columns: ColumnDef<T>[];
  actions?: (row: T) => React.ReactNode;
  searchable?: boolean;
  filterable?: boolean;
  pagination?: boolean;
  permission?: string;
  onRowClick?: (row: T) => void;
  loading?: boolean;
  className?: string;
}
```

For complete API documentation, see individual widget files with JSDoc comments.

## Troubleshooting

### Widget Not Rendering

**Checklist**:
- [ ] Widget imported correctly
- [ ] Required props provided
- [ ] User has required permission (if specified)
- [ ] No TypeScript errors
- [ ] Theme provider wraps application

### Permission Not Working

**Cause**: User lacks permission or permission not in JWT token

**Solution**:
1. Check user's role and permissions in database
2. Verify permission assigned to role
3. User must log out/in after permission changes
4. Check `hasPermission()` in AuthContext

### Theme Not Applying

**Cause**: CSS variables not defined or theme provider missing

**Solution**:
1. Verify ThemeProvider wraps application in layout.tsx
2. Check CSS variables in globals.css
3. Clear browser cache

### Performance Issues

**Cause**: Large datasets or unnecessary re-renders

**Solution**:
1. Use pagination for large datasets
2. Memoize components with stable props
3. Lazy load heavy components
4. Enable virtualization for long lists

## Contributing

When adding new widgets:

1. Create component in appropriate category folder
2. Add TypeScript interface in `types/widget.types.ts`
3. Export from category `index.ts`
4. Export from main `index.ts`
5. Add JSDoc comments
6. Create usage example in category `examples.tsx`
7. Update category README.md
8. Add to widget gallery page

## Resources

- **Spec Files**: `.kiro/specs/widget-system/`
- **Requirements**: `.kiro/specs/widget-system/requirements.md`
- **Design Doc**: `.kiro/specs/widget-system/design.md`
- **Tasks**: `.kiro/specs/widget-system/tasks.md`
- **Widget Gallery**: `/dashboard/widgets` (admin only)

## License

Part of the full-stack dashboard application.
