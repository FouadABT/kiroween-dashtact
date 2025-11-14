---
inclusion: fileMatch
fileMatchPattern: ['**/components/widgets/**/*.tsx', '**/components/widgets/**/*.ts']
---

# Widget System Guidelines

## Overview

The Widget System provides 40+ reusable, theme-aware, permission-controlled React components for building dashboard interfaces. All widgets integrate with the JWT authentication system, OKLCH theme system, and follow consistent patterns.

## Architecture

**Stack**: React + TypeScript + shadcn/ui + Radix UI + Tailwind CSS
**Integration**: ThemeContext (OKLCH colors) + AuthContext (permissions)
**Backend**: NestJS file upload endpoints for FileUpload widget

## Widget Categories

### Core Widgets (`frontend/src/components/widgets/core/`)
- **WidgetContainer**: Base wrapper with loading, error, permission, collapsible support
- **StatsCard**: Single metric with icon, value, trend indicator
- **StatsGrid**: Grid of StatsCards with responsive columns
- **DataTable**: Advanced table with search, filter, sort, pagination (@tanstack/react-table)
- **ChartWidget**: Line, bar, pie, area charts (Recharts with theme colors)
- **ActivityFeed**: Timeline of user activities with avatars

### Data Display (`frontend/src/components/widgets/data-display/`)
- **MetricCard**: Metric with comparison and sparkline
- **ProgressWidget**: Progress bars with labels and percentages
- **ListWidget**: Styled list with icons and actions
- **CardGrid**: Responsive grid of cards

### Interactive (`frontend/src/components/widgets/interactive/`)
- **SearchBar**: Debounced search with suggestions dropdown
- **FilterPanel**: Collapsible filters with URL persistence
- **QuickActions**: Action buttons in horizontal/vertical/grid layouts
- **NotificationWidget**: Toast notifications (sonner integration)

### Layout (`frontend/src/components/widgets/layout/`)
- **PageHeader**: Page title, description, breadcrumbs, actions
- **EmptyState**: Empty state with icon, message, action
- **ErrorBoundary**: React error boundary with fallback UI
- **SkeletonLoader**: Loading skeletons (card, table, chart, list variants)

### Forms (`frontend/src/components/widgets/forms/`)
- **FormCard**: Form wrapper with submit/cancel actions
- **FileUpload**: Drag-and-drop file upload with validation (react-dropzone)
- **DateRangePicker**: Date range selector with presets (react-day-picker)
- **MultiSelect**: Multi-option selector with search

### Utility (`frontend/src/components/widgets/utility/`)
- **Badge**: Status badges with variants
- **Avatar**: User avatars with fallback initials
- **Tooltip**: Hover tooltips (Radix UI)
- **Modal**: Dialog modals with actions

### Advanced (`frontend/src/components/widgets/advanced/`)
- **KanbanBoard**: Drag-and-drop board (@dnd-kit)
- **Calendar**: Event calendar with month/week/day views
- **TreeView**: Expandable tree with lazy loading
- **Timeline**: Horizontal/vertical timeline with events

### Specialized (`frontend/src/components/widgets/specialized/`)
- **UserCard**: User profile card with avatar and stats
- **PricingCard**: Pricing tier card with features
- **ComparisonTable**: Feature comparison table
- **MapWidget**: Interactive map (optional)
- **ChatWidget**: Chat interface (optional)

### Integration (`frontend/src/components/widgets/integration/`)
- **ApiWidget**: Generic API data fetcher
- **PermissionWrapper**: Permission-based rendering
- **ThemePreview**: Live theme preview
- **ExportButton**: Data export (CSV, JSON, PDF)
- **BulkActions**: Bulk operation controls

## Common Patterns

### Basic Widget Usage
```typescript
import { StatsCard } from '@/components/widgets';

<StatsCard
  title="Total Users"
  value={1234}
  icon={Users}
  trend={{ value: 12, direction: 'up' }}
  loading={false}
  permission="users:read"
/>
```

### With WidgetContainer
```typescript
import { WidgetContainer } from '@/components/widgets';

<WidgetContainer
  title="Analytics"
  actions={<Button>Refresh</Button>}
  loading={isLoading}
  error={error}
  permission="analytics:read"
  collapsible
>
  {/* Widget content */}
</WidgetContainer>
```

### Theme Integration
All widgets use CSS custom properties from theme system:
```tsx
// Automatic theme adaptation via Tailwind classes
<div className="bg-card text-card-foreground border-border">
  <h3 className="text-foreground">Title</h3>
  <p className="text-muted-foreground">Description</p>
  <button className="bg-primary text-primary-foreground">Action</button>
</div>
```

### Permission Control
```typescript
// Widget-level permission
<DataTable
  data={users}
  columns={columns}
  permission="users:read"
/>

// Component-level permission
import { PermissionGuard } from '@/components/auth/PermissionGuard';

<PermissionGuard permission="users:write" fallback={null}>
  <Button>Add User</Button>
</PermissionGuard>
```

## Key Props

### BaseWidgetProps (all widgets inherit)
```typescript
interface BaseWidgetProps {
  loading?: boolean;        // Show skeleton loader
  error?: string;           // Show error state
  permission?: string;      // Required permission
  className?: string;       // Additional CSS classes
}
```

### WidgetContainer Props
```typescript
interface WidgetContainerProps extends BaseWidgetProps {
  title: string;
  actions?: React.ReactNode;
  collapsible?: boolean;
  defaultCollapsed?: boolean;
  children: React.ReactNode;
}
```

## File Upload Backend

### Endpoints
- `POST /api/uploads` - Upload file (requires `files:write` permission)

### Configuration
```typescript
// backend/src/uploads/interfaces/upload-config.interface.ts
UPLOAD_CONFIGS = {
  image: {
    maxFileSize: 5 * 1024 * 1024,  // 5MB
    allowedMimeTypes: ['image/jpeg', 'image/png', 'image/gif', 'image/webp'],
    uploadDir: 'uploads/images',
  },
  document: {
    maxFileSize: 10 * 1024 * 1024,  // 10MB
    allowedMimeTypes: ['application/pdf', 'application/msword', ...],
    uploadDir: 'uploads/documents',
  },
}
```

### Usage
```typescript
import { FileUpload } from '@/components/widgets';

<FileUpload
  accept="image/*"
  maxSize={5 * 1024 * 1024}
  multiple={false}
  onUpload={async (files) => {
    const formData = new FormData();
    formData.append('file', files[0]);
    formData.append('type', 'image');
    
    const response = await fetch('/api/uploads', {
      method: 'POST',
      body: formData,
    });
    
    const result = await response.json();
    console.log('Uploaded:', result.url);
  }}
  permission="files:write"
/>
```

## Performance

- **Memoization**: Use `React.memo` for stable props
- **Lazy Loading**: Heavy widgets (charts, maps) use `React.lazy`
- **Virtualization**: Large lists use `@tanstack/react-virtual`
- **Debouncing**: Search/filter debounced by 300ms

## Accessibility

- **ARIA**: Proper labels, roles, attributes on all interactive elements
- **Keyboard**: Full keyboard navigation (Tab, Enter, Space, Arrows, Escape)
- **Contrast**: WCAG AA compliance (4.5:1 for text, 3:1 for UI)
- **Focus**: Visible focus indicators in all themes
- **Screen Readers**: Announcements for dynamic content

## Type Safety

All widgets have comprehensive TypeScript types:
```typescript
// Import types
import type { 
  StatsCardProps, 
  DataTableProps, 
  ChartWidgetProps,
  ActivityItem,
  FilterConfig,
  KanbanColumn,
} from '@/components/widgets/types/widget.types';
```

## Quick Reference

### Import Widgets
```typescript
import {
  // Core
  WidgetContainer, StatsCard, StatsGrid, DataTable, ChartWidget, ActivityFeed,
  // Data Display
  MetricCard, ProgressWidget, ListWidget, CardGrid,
  // Interactive
  SearchBar, FilterPanel, QuickActions, NotificationWidget,
  // Layout
  PageHeader, EmptyState, ErrorBoundary, SkeletonLoader,
  // Forms
  FormCard, FileUpload, DateRangePicker, MultiSelect,
  // Utility
  Badge, Avatar, Tooltip, Modal,
  // Advanced
  KanbanBoard, Calendar, TreeView, Timeline,
  // Specialized
  UserCard, PricingCard, ComparisonTable,
  // Integration
  ApiWidget, PermissionWrapper, ThemePreview, ExportButton, BulkActions,
} from '@/components/widgets';
```

### Theme Colors
```typescript
// Use Tailwind classes that reference CSS variables
bg-background, bg-card, bg-primary, bg-secondary, bg-accent, bg-muted
text-foreground, text-card-foreground, text-primary-foreground
border-border, ring-ring
fill-chart-1, fill-chart-2, fill-chart-3, fill-chart-4, fill-chart-5
```

### Common Tasks

**Add new widget**:
1. Create component in appropriate category folder
2. Add TypeScript interface in `types/widget.types.ts`
3. Export from category `index.ts` and main `index.ts`
4. Add example in category `examples.tsx`
5. Document in category `README.md`

**Add permission to widget**:
```typescript
<Widget permission="resource:action" />
```

**Add loading state**:
```typescript
<Widget loading={isLoading} />
```

**Add error handling**:
```typescript
<Widget error={error?.message} />
```

**Make collapsible**:
```typescript
<WidgetContainer collapsible defaultCollapsed={false}>
```
