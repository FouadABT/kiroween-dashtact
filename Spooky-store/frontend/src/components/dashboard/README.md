# Dashboard Components

This directory contains the core dashboard components for the widget-based customization system.

## Components

### DashboardGrid

The main grid component that renders widgets in a responsive 12-column layout.

**Features:**
- Responsive breakpoints (1 col mobile, 2 col tablet, 12 col desktop)
- Drag and drop support (when in edit mode)
- Automatic widget fetching based on pageId
- Empty state handling
- Loading states

**Usage:**
```tsx
import { DashboardGrid } from '@/components/dashboard';

<DashboardGrid pageId="overview" />
```

### WidgetRenderer

Dynamically renders widgets from the registry with error handling and loading states.

**Features:**
- Component lookup by widget key
- Configuration passing as props
- Suspense for lazy loading
- ErrorBoundary for error handling
- Edit mode controls (drag handle, remove button)
- Widget not found error display

**Usage:**
```tsx
import { WidgetRenderer } from '@/components/dashboard';

<WidgetRenderer
  widgetKey="stats-card"
  config={{ title: "Users", value: 1234 }}
  isEditMode={false}
  widgetId="widget-123"
  layoutId="layout-456"
/>
```

### SortableWidgetWrapper

Wraps widgets to make them sortable with drag and drop functionality.

**Features:**
- Drag and drop integration
- Smooth transitions
- Visual feedback during drag
- Keyboard accessibility
- Can be disabled

**Usage:**
```tsx
import { SortableWidgetWrapper } from '@/components/dashboard';

<SortableWidgetWrapper id="widget-1" disabled={!isEditMode}>
  <WidgetRenderer {...props} />
</SortableWidgetWrapper>
```

## Implementation Details

### Drag and Drop

The drag and drop functionality uses `@dnd-kit` libraries:
- `@dnd-kit/core` - Core drag and drop functionality
- `@dnd-kit/sortable` - Sortable list functionality
- `@dnd-kit/utilities` - Utility functions

**How it works:**
1. `DashboardGrid` wraps widgets in `DndContext`
2. `SortableContext` manages the sortable list
3. Each widget is wrapped in `SortableWidgetWrapper`
4. Drag events trigger `handleDragEnd` which reorders widgets
5. `reorderWidgets` from `WidgetContext` updates the backend

### Grid System

The grid uses Tailwind CSS classes for responsive layout:
- Mobile: `grid-cols-1` (1 column)
- Tablet: `md:grid-cols-2` (2 columns)
- Desktop: `lg:grid-cols-12` (12 columns)

Widget spans are mapped to Tailwind classes:
- `gridSpan: 6` → `lg:col-span-6`
- `gridSpan: 12` → `lg:col-span-12`
- etc.

### Error Handling

Multiple layers of error handling:
1. **Widget not found**: Shows error message with widget key
2. **ErrorBoundary**: Catches React errors in widget components
3. **Suspense**: Handles loading states for lazy-loaded components
4. **API errors**: Handled by WidgetContext with error state

### Performance Optimization

- **Memoization**: Components are memoized with `React.memo`
- **Lazy loading**: Widgets are lazy-loaded with `React.lazy`
- **Optimistic updates**: UI updates immediately, then syncs with backend
- **Sorted widgets**: Memoized to prevent unnecessary re-renders

## Requirements Satisfied

This implementation satisfies the following requirements from the design document:

- **Requirement 19.1**: DashboardGrid provides CSS Grid layout
- **Requirement 19.2**: Supports 12-column grid with configurable spans
- **Requirement 19.3**: Responsive breakpoints (mobile, tablet, desktop)
- **Requirement 19.4**: Drag and drop reordering in edit mode
- **Requirement 18.1**: WidgetRenderer looks up components in registry
- **Requirement 18.2**: Passes configuration as props
- **Requirement 18.3**: Handles loading states with Suspense
- **Requirement 18.4**: Wraps in ErrorBoundary
- **Requirement 18.5**: Shows error for missing widgets
- **Requirement 28.1**: User-friendly error messages
- **Requirement 28.2**: Retry functionality (via ErrorBoundary)
- **Requirement 10.2**: Drag handles in edit mode
- **Requirement 10.3**: Drag and drop functionality

## Next Steps

To use these components in a page:

1. Ensure `WidgetProvider` wraps your app (in `layout.tsx`)
2. Import and use `DashboardGrid` in your page
3. Toggle edit mode with `useWidgets().toggleEditMode()`
4. Add widget management UI (Add Widget button, etc.)

Example page:
```tsx
'use client';

import { DashboardGrid } from '@/components/dashboard';
import { useWidgets } from '@/contexts/WidgetContext';
import { Button } from '@/components/ui/button';

export default function DashboardPage() {
  const { isEditMode, toggleEditMode } = useWidgets();
  
  return (
    <div>
      <div className="mb-4 flex justify-between">
        <h1>Dashboard</h1>
        <Button onClick={toggleEditMode}>
          {isEditMode ? 'Save' : 'Edit Layout'}
        </Button>
      </div>
      
      <DashboardGrid pageId="overview" />
    </div>
  );
}
```
