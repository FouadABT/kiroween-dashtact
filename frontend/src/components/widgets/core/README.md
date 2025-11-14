# Core Widgets

This directory contains the core widget components that form the foundation of the widget system.

## Status

✅ **Complete** - All core widgets have been implemented.

## Components

### WidgetContainer ✅

The foundational component for the widget system. Provides a consistent wrapper with built-in support for theme integration, permission control, loading states, error handling, and collapsible functionality.

**Features:**
- Theme integration with automatic color adaptation
- Permission-based access control via PermissionGuard
- Loading states with skeleton loader
- Error handling with retry functionality
- Collapsible functionality
- Action buttons in header

**Usage:**
```tsx
import { WidgetContainer } from '@/components/widgets/core';

<WidgetContainer
  title="My Widget"
  loading={isLoading}
  error={error}
  permission="analytics:read"
  collapsible={true}
>
  <p>Widget content</p>
</WidgetContainer>
```

### StatsCard ✅

Single metric display with optional icon, trend indicator, and color variants.

**Features:**
- Responsive text sizing (text-2xl mobile, text-3xl desktop)
- Lucide React icons support
- Trend indicators (up/down with percentage)
- Color variants (primary, secondary, accent, success, warning, etc.)
- Wrapped in WidgetContainer for consistency

**Usage:**
```tsx
import { StatsCard } from '@/components/widgets/core';

<StatsCard
  title="Total Users"
  value={1234}
  icon={Users}
  trend={{ value: 12, direction: 'up', period: 'vs last month' }}
  color="primary"
/>
```

### StatsGrid ✅

Responsive grid layout for displaying multiple StatsCard components.

**Features:**
- Configurable columns (2, 3, or 4)
- Responsive breakpoints (mobile → tablet → desktop)
- Loading state for all cards
- Automatic grid layout with proper spacing

**Usage:**
```tsx
import { StatsGrid } from '@/components/widgets/core';

const stats = [
  { title: "Users", value: 1234, icon: Users, trend: { value: 12, direction: 'up' } },
  { title: "Revenue", value: "$45,678", icon: DollarSign, color: "primary" },
  { title: "Orders", value: 567, icon: ShoppingCart },
];

<StatsGrid stats={stats} columns={3} />
```

### DataTable ✅

Advanced table with search, filter, sort, and pagination using TanStack Table.

**Features:**
- Global search across all columns
- Column sorting with visual indicators
- Pagination with page size selector (10, 25, 50, 100)
- Row actions column
- Responsive with horizontal scroll on mobile
- Uses shadcn/ui Table component for styling
- Empty state handling

**Usage:**
```tsx
import { DataTable } from '@/components/widgets/core';
import { ColumnDef } from '@tanstack/react-table';

interface User {
  id: string;
  name: string;
  email: string;
}

const columns: ColumnDef<User>[] = [
  { accessorKey: "name", header: "Name" },
  { accessorKey: "email", header: "Email" },
];

<DataTable
  data={users}
  columns={columns}
  searchable={true}
  pagination={true}
  actions={(row) => <Button onClick={() => handleEdit(row)}>Edit</Button>}
  onRowClick={(row) => console.log(row)}
/>
```

### ChartWidget ✅

Wrapper for various chart types using Recharts library.

**Features:**
- Multiple chart types: line, bar, pie, area, composed
- Theme chart colors (chart1-5) for data series
- ResponsiveContainer for automatic sizing
- Styled tooltip and legend with theme colors
- Lazy loading support for code splitting
- Configurable grid, legend, and tooltip

**Usage:**
```tsx
import { ChartWidget } from '@/components/widgets/core';

const data = [
  { month: 'Jan', revenue: 4000, expenses: 2400 },
  { month: 'Feb', revenue: 3000, expenses: 1398 },
  { month: 'Mar', revenue: 5000, expenses: 3800 },
];

<ChartWidget
  type="line"
  title="Revenue Trend"
  data={data}
  config={{
    xAxisKey: 'month',
    dataKeys: ['revenue', 'expenses'],
    showLegend: true,
    showTooltip: true,
    showGrid: true,
  }}
  height={300}
/>
```

**Lazy Loading:**
```tsx
import { LazyChartWidget } from '@/components/widgets/core';
import { Suspense } from 'react';

<Suspense fallback={<SkeletonLoader variant="chart" />}>
  <LazyChartWidget type="bar" data={data} config={config} />
</Suspense>
```

### ActivityFeed ✅

Timeline display of activity items with user avatars and timestamps.

**Features:**
- User avatar and name display with fallback initials
- Timestamps with date-fns formatting (relative time)
- Date grouping support (Today, Yesterday, specific dates)
- "Show more" button for limiting visible items
- Metadata display as tags
- ScrollArea for long lists
- Empty state handling

**Usage:**
```tsx
import { ActivityFeed } from '@/components/widgets/core';

const activities = [
  {
    id: '1',
    type: 'user_created',
    title: 'New user registered',
    description: 'John Doe joined the platform',
    timestamp: new Date(),
    user: { name: 'John Doe', avatar: '/avatar.jpg' },
    metadata: { userId: '123' }
  }
];

<ActivityFeed
  title="Recent Activity"
  activities={activities}
  groupByDate={true}
  maxItems={10}
  showMoreButton={true}
/>
```

## Exports

All components are exported from the index file for convenient imports:

```tsx
import {
  WidgetContainer,
  SkeletonLoader,
  StatsCard,
  StatsGrid,
  DataTable,
  ChartWidget,
  LazyChartWidget,
  ActivityFeed,
} from '@/components/widgets/core';
```

## Type Definitions

All components have comprehensive TypeScript types exported:

```tsx
import type {
  WidgetContainerProps,
  StatsCardProps,
  StatsGridProps,
  DataTableProps,
  ChartWidgetProps,
  ActivityFeedProps,
  TrendData,
} from '@/components/widgets/core';
```

## Examples

See `examples.tsx` for comprehensive usage examples of all core widgets, including:
- Basic usage patterns
- Advanced configurations
- Permission-based rendering
- Loading and error states
- Responsive layouts

## Requirements Covered

- ✅ 1.1 - Core widget library with consistent API
- ✅ 2.1, 2.2, 2.5 - Theme integration with OKLCH colors
- ✅ 3.1, 3.3, 3.4 - Permission-based access control
- ✅ 4.1, 4.2, 4.3 - Loading and error states
- ✅ 5.1, 5.2 - Responsive design
- ✅ 7.1-7.5 - DataTable with search, sort, pagination
- ✅ 8.1-8.5 - Chart widgets with multiple types

## Implementation Details

- Built on shadcn/ui components (Card, Table, Avatar, etc.)
- Uses Radix UI primitives (Collapsible, ScrollArea, etc.)
- Integrates with TanStack Table for advanced table features
- Uses Recharts for chart rendering
- Uses date-fns for date formatting
- Fully typed with TypeScript
- Theme-aware via Tailwind CSS utilities
- Accessible with ARIA attributes
- Responsive with mobile-first design

## Next Steps

These core widgets serve as the foundation for the widget system. Next phases include:
- Data display widgets (MetricCard, ProgressWidget, ListWidget, CardGrid)
- Interactive widgets (QuickActions, FilterPanel, SearchBar, NotificationWidget)
- Layout widgets (PageHeader, EmptyState, ErrorBoundary)
- Form widgets (FormCard, FileUpload, DateRangePicker, MultiSelect)
- Advanced widgets (KanbanBoard, Calendar, TreeView, Timeline)
- Specialized widgets (UserCard, PricingCard, ComparisonTable, etc.)
