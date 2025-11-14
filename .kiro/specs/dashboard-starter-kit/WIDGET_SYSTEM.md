# Dashboard Widget System

## Overview

This document outlines the flexible widget/component system for the dashboard starter kit. All widgets are designed to integrate seamlessly with the existing JWT authentication, permission system, and OKLCH theme system.

---

## Widget Library (40 Components)

### Core Widgets (Essential)

#### 1. **StatsCard**
Single metric display with icon, value, and trend indicator.

**Props:**
- `title: string` - Card title
- `value: string | number` - Main metric value
- `icon?: LucideIcon` - Icon component
- `trend?: { value: number; direction: 'up' | 'down' }` - Trend indicator
- `color?: string` - Accent color (uses theme tokens)
- `permission?: string` - Required permission
- `loading?: boolean` - Loading state

**Use Cases:** KPIs, metrics, counters, dashboard overview

---

#### 2. **StatsGrid**
Multiple stats in responsive grid layout.

**Props:**
- `stats: StatItem[]` - Array of stat objects
- `columns?: 2 | 3 | 4` - Grid columns (responsive)
- `loading?: boolean` - Loading state
- `permission?: string` - Required permission

**Use Cases:** Dashboard overview, metric groups, summary cards

---

#### 3. **DataTable** ✅ *Use shadcn/ui Table*
Advanced table with search, filter, sort, and pagination.

**Props:**
- `data: T[]` - Table data
- `columns: ColumnDef<T>[]` - Column definitions (@tanstack/react-table)
- `actions?: (row: T) => React.ReactNode` - Row actions
- `searchable?: boolean` - Enable search
- `filterable?: boolean` - Enable filters
- `pagination?: boolean` - Enable pagination
- `permission?: string` - Required permission
- `onRowClick?: (row: T) => void` - Row click handler

**Use Cases:** User lists, data management, reports, admin tables

**Note:** Use shadcn/ui Data Table (uses @tanstack/react-table - already installed) - `npx shadcn@latest add table`

---

#### 4. **ChartWidget**
Wrapper for various chart types using Recharts.

**Props:**
- `type: 'line' | 'bar' | 'pie' | 'area' | 'composed'` - Chart type
- `data: any[]` - Chart data
- `title?: string` - Chart title
- `height?: number` - Chart height
- `config: ChartConfig` - Chart configuration
- `permission?: string` - Required permission
- `loading?: boolean` - Loading state

**Use Cases:** Analytics, trends, comparisons, data visualization

---

#### 5. **ActivityFeed**
Timeline of events and actions.

**Props:**
- `items: ActivityItem[]` - Activity items
- `maxItems?: number` - Max items to display
- `showTimestamp?: boolean` - Show timestamps
- `groupByDate?: boolean` - Group by date
- `permission?: string` - Required permission
- `onItemClick?: (item: ActivityItem) => void` - Item click handler

**Use Cases:** Recent activity, audit logs, notifications, user actions

---

#### 6. **WidgetContainer**
Common wrapper providing consistent styling and features.

**Props:**
- `title: string` - Widget title
- `actions?: React.ReactNode` - Header actions
- `loading?: boolean` - Loading state
- `error?: string` - Error message
- `permission?: string` - Required permission
- `collapsible?: boolean` - Can collapse
- `defaultCollapsed?: boolean` - Initial collapsed state
- `children: React.ReactNode` - Widget content

**Use Cases:** Consistent widget styling, loading/error states

---

### Data Display Widgets

#### 7. **MetricCard**
Large number display with label and comparison.

**Props:**
- `value: string | number` - Main value
- `label: string` - Metric label
- `comparison?: { value: number; period: string }` - Comparison data
- `format?: 'number' | 'currency' | 'percentage'` - Value format
- `icon?: LucideIcon` - Icon
- `permission?: string` - Required permission

**Use Cases:** Revenue, user count, growth metrics, KPIs

---

#### 8. **ProgressWidget** ✅ *Use shadcn/ui Progress*
Progress bar or circle with percentage.

**Props:**
- `value: number` - Current value
- `max: number` - Maximum value
- `label: string` - Progress label
- `variant: 'bar' | 'circle'` - Display variant
- `showPercentage?: boolean` - Show percentage
- `color?: string` - Progress color
- `permission?: string` - Required permission

**Use Cases:** Goals, completion rates, quotas, storage usage

**Note:** Use `@radix-ui/react-progress` (already installed) - `npx shadcn@latest add progress`

---

#### 9. **ListWidget** ✅ *Use shadcn/ui Scroll Area*
Simple list with icons and actions.

**Props:**
- `items: ListItem[]` - List items
- `onItemClick?: (item: ListItem) => void` - Item click handler
- `emptyState?: React.ReactNode` - Empty state component
- `maxHeight?: number` - Max height with scroll
- `permission?: string` - Required permission

**Use Cases:** Quick links, recent items, shortcuts, menu lists

**Note:** Install with `npm install @radix-ui/react-scroll-area` then `npx shadcn@latest add scroll-area`

---

#### 10. **CardGrid** ✅ *Use shadcn/ui Card*
Responsive grid of cards.

**Props:**
- `items: T[]` - Grid items
- `columns?: { sm: number; md: number; lg: number }` - Responsive columns
- `renderCard: (item: T) => React.ReactNode` - Card renderer
- `loading?: boolean` - Loading state
- `permission?: string` - Required permission

**Use Cases:** Product catalog, user cards, image galleries

**Note:** Use shadcn/ui Card - `npx shadcn@latest add card`

---

### Interactive Widgets

#### 11. **QuickActions** ✅ *Use shadcn/ui Button*
Button group for common actions.

**Props:**
- `actions: ActionItem[]` - Action buttons
- `layout?: 'horizontal' | 'vertical' | 'grid'` - Layout style
- `permission?: string` - Required permission
- `size?: 'sm' | 'md' | 'lg'` - Button size

**Use Cases:** Create new, export, settings, bulk actions

**Note:** Use shadcn/ui Button - `npx shadcn@latest add button`

---

#### 12. **FilterPanel** ✅ *Use shadcn/ui Collapsible + Form*
Collapsible filter controls.

**Props:**
- `filters: FilterConfig[]` - Filter definitions
- `onFilterChange: (filters: FilterState) => void` - Filter change handler
- `defaultOpen?: boolean` - Initial open state
- `permission?: string` - Required permission

**Use Cases:** Data filtering, search refinement, report filters

**Note:** Install with `npm install @radix-ui/react-collapsible` then `npx shadcn@latest add collapsible`

---

#### 13. **SearchBar** ✅ *Use shadcn/ui Input + Command*
Enhanced search with suggestions.

**Props:**
- `onSearch: (query: string) => void` - Search handler
- `placeholder?: string` - Placeholder text
- `suggestions?: string[]` - Search suggestions
- `debounceMs?: number` - Debounce delay
- `permission?: string` - Required permission

**Use Cases:** Global search, data lookup, command palette

**Note:** Use shadcn/ui Input + Command - `npx shadcn@latest add input command`

---

#### 14. **NotificationWidget** ✅ *Use sonner (already installed)*
Alert and notification display.

**Props:**
- `notifications: Notification[]` - Notification items
- `onDismiss?: (id: string) => void` - Dismiss handler
- `maxVisible?: number` - Max visible notifications
- `position?: 'top' | 'bottom'` - Position
- `permission?: string` - Required permission

**Use Cases:** System alerts, user messages, toast notifications

**Note:** Use `sonner` (already installed) or `npx shadcn@latest add toast` for @radix-ui/react-toast

---

### Layout Components

#### 15. **PageHeader** ✅ *Use shadcn/ui Breadcrumb*
Page title with breadcrumbs and actions.

**Props:**
- `title: string` - Page title
- `breadcrumbs?: Breadcrumb[]` - Breadcrumb items
- `actions?: React.ReactNode` - Header actions
- `description?: string` - Page description
- `permission?: string` - Required permission

**Use Cases:** Page top section, navigation context

**Note:** Use shadcn/ui Breadcrumb - `npx shadcn@latest add breadcrumb`

---

#### 16. **EmptyState**
Placeholder for no data scenarios.

**Props:**
- `icon?: LucideIcon` - Icon
- `title: string` - Empty state title
- `description?: string` - Description text
- `action?: { label: string; onClick: () => void }` - Call to action
- `permission?: string` - Required permission

**Use Cases:** Empty tables, no results, first-time user experience

---

#### 17. **ErrorBoundary**
Error handling wrapper component.

**Props:**
- `fallback?: React.ReactNode` - Error fallback UI
- `onError?: (error: Error) => void` - Error handler
- `resetKeys?: any[]` - Keys to trigger reset
- `children: React.ReactNode` - Wrapped content

**Use Cases:** Component error handling, graceful degradation

---

#### 18. **SkeletonLoader** ✅ *Use shadcn/ui Skeleton*
Loading placeholder with animations.

**Props:**
- `variant: 'text' | 'card' | 'table' | 'chart'` - Skeleton type
- `count?: number` - Number of items
- `height?: number` - Height
- `className?: string` - Additional classes

**Use Cases:** Content loading states, perceived performance

**Note:** Use shadcn/ui Skeleton - `npx shadcn@latest add skeleton`

---

### Form Widgets

#### 19. **FormCard** ✅ *Use shadcn/ui Card + Form*
Card wrapper for forms with actions.

**Props:**
- `title: string` - Form title
- `onSubmit: (data: any) => void` - Submit handler
- `loading?: boolean` - Submitting state
- `actions?: React.ReactNode` - Form actions
- `children: React.ReactNode` - Form fields
- `permission?: string` - Required permission

**Use Cases:** Settings forms, data entry, user profiles

**Note:** Use shadcn/ui Card + Form - `npx shadcn@latest add card form`

---

#### 20. **FileUpload**
Drag-and-drop file upload component.

**Props:**
- `accept?: string` - Accepted file types
- `maxSize?: number` - Max file size (bytes)
- `multiple?: boolean` - Allow multiple files
- `onUpload: (files: File[]) => void` - Upload handler
- `permission?: string` - Required permission

**Use Cases:** Image upload, document upload, avatar upload

---

#### 21. **DateRangePicker** ✅ *Use shadcn/ui Date Range Picker*
Date range selector with presets.

**Props:**
- `value: DateRange` - Selected range
- `onChange: (range: DateRange) => void` - Change handler
- `presets?: DatePreset[]` - Quick select presets
- `permission?: string` - Required permission

**Use Cases:** Report filters, date selection, analytics

**Note:** Use shadcn/ui Date Range Picker (uses react-day-picker) - `npx shadcn@latest add calendar popover`

---

#### 22. **MultiSelect** ✅ *Use shadcn/ui Select + Checkbox*
Multi-option selector with search.

**Props:**
- `options: Option[]` - Available options
- `value: string[]` - Selected values
- `onChange: (values: string[]) => void` - Change handler
- `searchable?: boolean` - Enable search
- `permission?: string` - Required permission

**Use Cases:** Tags, categories, filters, user selection

**Note:** Combine `@radix-ui/react-select` + `@radix-ui/react-checkbox` (already installed) - `npx shadcn@latest add select checkbox`

---

### Utility Components

#### 23. **Badge** ✅ *Use shadcn/ui Badge*
Status and label indicator.

**Props:**
- `variant: 'default' | 'success' | 'warning' | 'error' | 'info'` - Style variant
- `size?: 'sm' | 'md' | 'lg'` - Size
- `icon?: LucideIcon` - Icon
- `children: React.ReactNode` - Badge content

**Use Cases:** Status indicators, tags, counts, labels

**Note:** Use shadcn/ui Badge - `npx shadcn@latest add badge`

---

#### 24. **Avatar** ✅ *Use shadcn/ui Avatar*
User avatar with fallback initials.

**Props:**
- `src?: string` - Image URL
- `name: string` - User name (for fallback)
- `size?: 'xs' | 'sm' | 'md' | 'lg' | 'xl'` - Avatar size
- `status?: 'online' | 'offline' | 'away'` - Status indicator

**Use Cases:** User display, profile pictures, comment authors

**Note:** Use `@radix-ui/react-avatar` (already installed) - `npx shadcn@latest add avatar`

---

#### 25. **Tooltip** ✅ *Use shadcn/ui Tooltip*
Hover information display.

**Props:**
- `content: React.ReactNode` - Tooltip content
- `position?: 'top' | 'bottom' | 'left' | 'right'` - Position
- `trigger?: React.ReactNode` - Trigger element
- `delayMs?: number` - Show delay

**Use Cases:** Help text, additional info, icon explanations

**Note:** Install with `npm install @radix-ui/react-tooltip` then `npx shadcn@latest add tooltip`

---

#### 26. **Modal** ✅ *Use shadcn/ui Dialog*
Dialog and modal wrapper.

**Props:**
- `open: boolean` - Open state
- `onClose: () => void` - Close handler
- `title?: string` - Modal title
- `size?: 'sm' | 'md' | 'lg' | 'xl' | 'full'` - Modal size
- `children: React.ReactNode` - Modal content
- `permission?: string` - Required permission

**Use Cases:** Forms, confirmations, details view, image preview

**Note:** Use `@radix-ui/react-dialog` (already installed) - `npx shadcn@latest add dialog`

---

### Advanced Widgets

#### 27. **KanbanBoard**
Drag-and-drop column board.

**Props:**
- `columns: KanbanColumn[]` - Board columns
- `items: KanbanItem[]` - Board items
- `onMove: (item: KanbanItem, toColumn: string) => void` - Move handler
- `permission?: string` - Required permission

**Use Cases:** Task management, workflows, project boards

---

#### 28. **Calendar** ✅ *Use shadcn/ui Calendar*
Event calendar view.

**Props:**
- `events: CalendarEvent[]` - Calendar events
- `view?: 'month' | 'week' | 'day'` - Calendar view
- `onEventClick?: (event: CalendarEvent) => void` - Event click handler
- `permission?: string` - Required permission

**Use Cases:** Scheduling, appointments, event management

**Note:** Use shadcn/ui Calendar (uses react-day-picker) - `npx shadcn@latest add calendar`

---

#### 29. **TreeView**
Hierarchical data display.

**Props:**
- `data: TreeNode[]` - Tree data
- `expandable?: boolean` - Allow expand/collapse
- `onSelect?: (node: TreeNode) => void` - Selection handler
- `permission?: string` - Required permission

**Use Cases:** File browser, org chart, categories, navigation

---

#### 30. **Timeline**
Horizontal or vertical timeline.

**Props:**
- `events: TimelineEvent[]` - Timeline events
- `orientation?: 'horizontal' | 'vertical'` - Layout
- `interactive?: boolean` - Allow interaction
- `permission?: string` - Required permission

**Use Cases:** Project timeline, history, milestones

---

### Specialized Widgets

#### 31. **UserCard**
User profile display card.

**Props:**
- `user: User` - User data
- `actions?: React.ReactNode` - Card actions
- `showDetails?: boolean` - Show additional details
- `permission?: string` - Required permission

**Use Cases:** User directory, team members, contact cards

---

#### 32. **PricingCard**
Pricing tier display.

**Props:**
- `plan: PricingPlan` - Plan details
- `price: number` - Plan price
- `features: string[]` - Feature list
- `highlighted?: boolean` - Highlight card
- `onSelect?: () => void` - Select handler
- `permission?: string` - Required permission

**Use Cases:** Subscription plans, packages, pricing pages

---

#### 33. **ComparisonTable**
Feature comparison grid.

**Props:**
- `items: ComparisonItem[]` - Items to compare
- `features: Feature[]` - Features to compare
- `highlightColumn?: number` - Highlighted column
- `permission?: string` - Required permission

**Use Cases:** Plan comparison, product comparison, feature matrix

---

#### 34. **MapWidget**
Location and map display.

**Props:**
- `markers: MapMarker[]` - Map markers
- `center: { lat: number; lng: number }` - Map center
- `zoom?: number` - Zoom level
- `permission?: string` - Required permission

**Use Cases:** Store locator, user locations, delivery tracking

---

#### 35. **ChatWidget**
Message and chat interface.

**Props:**
- `messages: Message[]` - Chat messages
- `onSend: (message: string) => void` - Send handler
- `user: User` - Current user
- `permission?: string` - Required permission

**Use Cases:** Support chat, messaging, comments

---

### Integration Helpers

#### 36. **ApiWidget**
Auto-fetch data wrapper.

**Props:**
- `endpoint: string` - API endpoint
- `render: (data: any) => React.ReactNode` - Render function
- `permission?: string` - Required permission
- `refreshInterval?: number` - Auto-refresh interval

**Use Cases:** Quick API integration, real-time data

---

#### 37. **PermissionWrapper**
Permission-based rendering.

**Props:**
- `permission: string | string[]` - Required permission(s)
- `fallback?: React.ReactNode` - Fallback UI
- `requireAll?: boolean` - Require all permissions
- `children: React.ReactNode` - Protected content

**Use Cases:** Conditional display, feature flags

---

#### 38. **ThemePreview**
Component theme preview.

**Props:**
- `component: React.ComponentType` - Component to preview
- `variants?: string[]` - Component variants
- `showCode?: boolean` - Show code example

**Use Cases:** Style testing, documentation, design system

---

#### 39. **ExportButton**
Data export functionality.

**Props:**
- `data: any[]` - Data to export
- `format: 'csv' | 'pdf' | 'excel' | 'json'` - Export format
- `filename?: string` - Export filename
- `permission?: string` - Required permission

**Use Cases:** Report export, data download, backup

---

#### 40. **BulkActions**
Multi-select batch operations.

**Props:**
- `selected: string[]` - Selected item IDs
- `actions: BulkAction[]` - Available actions
- `onAction: (action: string, ids: string[]) => void` - Action handler
- `permission?: string` - Required permission

**Use Cases:** Batch operations, mass updates, bulk delete

---

## Required Packages

### Already Installed ✅
- `@radix-ui/react-avatar` - Avatar component
- `@radix-ui/react-checkbox` - Checkbox component
- `@radix-ui/react-dialog` - Modal/Dialog component
- `@radix-ui/react-dropdown-menu` - Dropdown menus
- `@radix-ui/react-label` - Form labels
- `@radix-ui/react-progress` - Progress bars
- `@radix-ui/react-select` - Select dropdowns
- `@radix-ui/react-separator` - Separators
- `@radix-ui/react-slider` - Sliders
- `@radix-ui/react-switch` - Toggle switches
- `@tanstack/react-table` - Data tables
- `framer-motion` - Animations
- `lucide-react` - Icons
- `sonner` - Toast notifications
- `react-hook-form` + `zod` - Form handling

### Essential (Install First)

```bash
cd frontend

# Core widget dependencies
npm install recharts date-fns react-day-picker @tanstack/react-virtual react-dropzone

# Additional Radix UI components (not yet installed)
npm install @radix-ui/react-tabs @radix-ui/react-tooltip @radix-ui/react-popover @radix-ui/react-accordion @radix-ui/react-collapsible @radix-ui/react-scroll-area @radix-ui/react-toggle @radix-ui/react-context-menu @radix-ui/react-hover-card @radix-ui/react-menubar @radix-ui/react-navigation-menu @radix-ui/react-radio-group @radix-ui/react-toast @radix-ui/react-toggle-group @radix-ui/react-toolbar

# Utilities
npm install react-intersection-observer use-debounce react-use
```

### shadcn/ui Components to Add

```bash
# Install commonly needed shadcn components
npx shadcn@latest add badge
npx shadcn@latest add button
npx shadcn@latest add card
npx shadcn@latest add calendar
npx shadcn@latest add skeleton
npx shadcn@latest add table
npx shadcn@latest add tooltip
npx shadcn@latest add dialog
npx shadcn@latest add form
npx shadcn@latest add input
npx shadcn@latest add command
npx shadcn@latest add collapsible
npx shadcn@latest add breadcrumb
npx shadcn@latest add scroll-area
npx shadcn@latest add popover
npx shadcn@latest add toast
npx shadcn@latest add avatar
npx shadcn@latest add progress
npx shadcn@latest add select
npx shadcn@latest add checkbox
```

### Optional (Based on Needs)

```bash
# Drag & Drop (for Kanban, reorderable lists)
npm install @dnd-kit/core @dnd-kit/sortable @dnd-kit/utilities

# Advanced Charts
npm install @nivo/core @nivo/bar @nivo/line @nivo/pie

# Rich Text Editor
npm install @tiptap/react @tiptap/starter-kit

# Code Display
npm install react-syntax-highlighter
npm install @types/react-syntax-highlighter -D

# Maps
npm install react-leaflet leaflet
npm install @types/leaflet -D

# Export Functionality
npm install xlsx jspdf jspdf-autotable

# Dashboard Components (Alternative to building from scratch)
npm install @tremor/react
```

### Backend (Optional)

```bash
cd backend

# File Uploads
npm install @nestjs/platform-express multer
npm install @types/multer -D

# Caching
npm install @nestjs/cache-manager cache-manager

# WebSockets (Real-time widgets)
npm install @nestjs/websockets @nestjs/platform-socket.io socket.io
```

---

## Package Compatibility

All recommended packages are compatible with:

- ✅ **OKLCH Theme System** - Works with CSS custom properties
- ✅ **Tailwind CSS** - Integrates seamlessly
- ✅ **Radix UI** - Consistent design language
- ✅ **TypeScript** - Full type safety
- ✅ **Next.js 14** - App Router compatible
- ✅ **Permission System** - Easy integration
- ✅ **Framer Motion** - Animation support

---

## Widget Features

All widgets include:

- **TypeScript Types** - Full type definitions
- **Permission Integration** - Built-in permission checks
- **Theme Support** - Respects OKLCH theme system
- **Loading States** - Skeleton loaders
- **Error States** - Error boundaries and messages
- **Accessibility** - ARIA labels and keyboard navigation
- **Responsive Design** - Mobile-first approach
- **Usage Examples** - Code examples and documentation

---

## File Structure

```
frontend/src/components/widgets/
├── core/
│   ├── StatsCard.tsx
│   ├── StatsGrid.tsx
│   ├── DataTable.tsx
│   ├── ChartWidget.tsx
│   ├── ActivityFeed.tsx
│   └── WidgetContainer.tsx
├── data-display/
│   ├── MetricCard.tsx
│   ├── ProgressWidget.tsx
│   ├── ListWidget.tsx
│   └── CardGrid.tsx
├── interactive/
│   ├── QuickActions.tsx
│   ├── FilterPanel.tsx
│   ├── SearchBar.tsx
│   └── NotificationWidget.tsx
├── layout/
│   ├── PageHeader.tsx
│   ├── EmptyState.tsx
│   ├── ErrorBoundary.tsx
│   └── SkeletonLoader.tsx
├── forms/
│   ├── FormCard.tsx
│   ├── FileUpload.tsx
│   ├── DateRangePicker.tsx
│   └── MultiSelect.tsx
├── utility/
│   ├── Badge.tsx
│   ├── Avatar.tsx
│   ├── Tooltip.tsx
│   └── Modal.tsx
├── advanced/
│   ├── KanbanBoard.tsx
│   ├── Calendar.tsx
│   ├── TreeView.tsx
│   └── Timeline.tsx
├── specialized/
│   ├── UserCard.tsx
│   ├── PricingCard.tsx
│   ├── ComparisonTable.tsx
│   ├── MapWidget.tsx
│   └── ChatWidget.tsx
├── integration/
│   ├── ApiWidget.tsx
│   ├── PermissionWrapper.tsx
│   ├── ThemePreview.tsx
│   ├── ExportButton.tsx
│   └── BulkActions.tsx
├── types/
│   └── widget.types.ts
└── index.ts
```

---

## Usage Example

```typescript
import { StatsCard, DataTable, ChartWidget } from '@/components/widgets';
import { PermissionGuard } from '@/components/auth';

export default function DashboardPage() {
  return (
    <div className="space-y-6">
      {/* Stats Overview */}
      <PermissionGuard permission="analytics:read">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <StatsCard
            title="Total Users"
            value={1234}
            icon={Users}
            trend={{ value: 12, direction: 'up' }}
          />
          <StatsCard
            title="Revenue"
            value="$45,678"
            icon={DollarSign}
            trend={{ value: 8, direction: 'up' }}
          />
          <StatsCard
            title="Active Sessions"
            value={89}
            icon={Activity}
          />
        </div>
      </PermissionGuard>

      {/* Chart */}
      <PermissionGuard permission="analytics:read">
        <ChartWidget
          type="line"
          title="User Growth"
          data={chartData}
          height={300}
        />
      </PermissionGuard>

      {/* Data Table */}
      <PermissionGuard permission="users:read">
        <DataTable
          data={users}
          columns={userColumns}
          searchable
          pagination
        />
      </PermissionGuard>
    </div>
  );
}
```

---

## Next Steps

1. **Install Essential Packages** - Run the npm install commands above
2. **Create Widget Types** - Define TypeScript interfaces
3. **Build Core Widgets** - Start with StatsCard, DataTable, ChartWidget
4. **Add Examples** - Create usage examples for each widget
5. **Document** - Add Storybook or documentation site
6. **Test** - Write unit tests for each widget

---

## Resources

- **Recharts Docs**: https://recharts.org/
- **Radix UI Docs**: https://www.radix-ui.com/
- **TanStack Table**: https://tanstack.com/table/
- **date-fns**: https://date-fns.org/
- **dnd-kit**: https://dndkit.com/
