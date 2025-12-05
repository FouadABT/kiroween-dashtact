# Dashboard Customization System - Usage Guide

## Overview

The Dashboard Customization System is now fully integrated and ready to use! This guide will help you understand how to use and extend the system.

## What Was Fixed

The main `/dashboard` page was using static content instead of the dynamic widget system. I've updated it to use the `DashboardGrid` component which enables the full customization features.

## How It Works

### 1. Page Structure

Each dashboard page that supports customization follows this pattern:

```typescript
"use client";

import { useEffect } from "react";
import { PageHeader } from "@/components/layout/PageHeader";
import { useMetadata } from "@/contexts/MetadataContext";
import { DashboardGrid } from "@/components/dashboard/DashboardGrid";

export default function MyDashboardPage() {
  const { updateMetadata } = useMetadata();

  useEffect(() => {
    updateMetadata({
      title: "My Dashboard",
      description: "Custom dashboard description",
      keywords: ["dashboard", "custom"],
    });
  }, [updateMetadata]);

  return (
    <div className="space-y-6">
      <PageHeader
        title="My Dashboard"
        description="Description with instructions"
      />
      <DashboardGrid pageId="my-unique-page-id" />
    </div>
  );
}
```

### 2. Key Components

**DashboardGrid** (`frontend/src/components/dashboard/DashboardGrid.tsx`):
- Main component that renders the customizable dashboard
- Handles edit mode, drag-and-drop, and widget management
- Props:
  - `pageId`: Unique identifier for the page (e.g., "overview", "analytics")

**WidgetContext** (`frontend/src/contexts/WidgetContext.tsx`):
- Provides global state for widgets and layouts
- Manages edit mode, widget library, and layout operations
- Available hooks:
  - `useWidgets()`: Access widget context
  - `isEditMode`: Boolean indicating if in edit mode
  - `toggleEditMode()`: Toggle edit mode on/off
  - `currentLayout`: Current layout data
  - `refreshCurrentLayout()`: Reload layout from server

**WidgetLibrary** (`frontend/src/components/admin/WidgetLibrary.tsx`):
- Modal that displays available widgets
- Allows users to browse and add widgets to their layout
- Automatically filters widgets by user permissions

## Using the System

### For End Users

1. **Navigate to a Dashboard Page**
   - Go to `/dashboard` or `/dashboard/analytics`

2. **Enter Edit Mode**
   - Click the "Edit Layout" button in the top-right corner
   - The page enters edit mode, showing widget controls

3. **Add Widgets**
   - Click "Add Widget" button
   - Browse widgets by category or search
   - Click a widget to add it to your dashboard

4. **Arrange Widgets**
   - Drag widgets by their drag handle (⋮⋮)
   - Drop them in your desired position
   - Widgets automatically adjust to fit the grid

5. **Configure Widgets**
   - Click the settings icon (⚙️) on a widget
   - Adjust configuration options
   - Changes apply immediately

6. **Remove Widgets**
   - Click the delete icon (🗑️) on a widget
   - Confirm deletion

7. **Save Changes**
   - Click "Save Changes" to persist your layout
   - Or click "Cancel" to discard changes

### For Developers

#### Creating a New Dashboard Page

1. **Create the Page File**

```bash
# Create directory
mkdir -p frontend/src/app/dashboard/my-page

# Create page file
touch frontend/src/app/dashboard/my-page/page.tsx
```

2. **Add Page Content**

```typescript
// frontend/src/app/dashboard/my-page/page.tsx
import { Metadata } from 'next';
import { generatePageMetadata } from '@/lib/metadata-helpers';
import MyPageClient from './MyPageClient';

export const metadata: Metadata = generatePageMetadata('/dashboard/my-page');

export default function MyPage() {
  return <MyPageClient />;
}
```

3. **Create Client Component**

```typescript
// frontend/src/app/dashboard/my-page/MyPageClient.tsx
"use client";

import { useEffect } from "react";
import { PageHeader } from "@/components/layout/PageHeader";
import { useMetadata } from "@/contexts/MetadataContext";
import { DashboardGrid } from "@/components/dashboard/DashboardGrid";

export default function MyPageClient() {
  const { updateMetadata } = useMetadata();

  useEffect(() => {
    updateMetadata({
      title: "My Custom Page",
      description: "Description of my custom page",
      keywords: ["custom", "page", "dashboard"],
    });
  }, [updateMetadata]);

  return (
    <div className="space-y-6">
      <PageHeader
        title="My Custom Page"
        description="Customize this page with widgets"
      />
      <DashboardGrid pageId="my-custom-page" />
    </div>
  );
}
```

4. **Add to Metadata Config** (optional but recommended)

```typescript
// frontend/src/lib/metadata-config.ts
export const metadataConfig: Record<string, PageMetadata> = {
  // ... existing routes
  
  '/dashboard/my-page': {
    title: 'My Custom Page',
    description: 'Description for SEO',
    keywords: ['custom', 'page'],
    breadcrumb: { label: 'My Page' },
  },
};
```

5. **Add to Navigation** (if needed)

```typescript
// Update navigation in your navigation context or config
{
  title: "My Page",
  href: "/dashboard/my-page",
  icon: MyIcon,
  permission: "my-page:read", // Optional
}
```

#### Creating a Default Layout

To create a default layout for your new page:

1. **Add to Seed Data**

```typescript
// backend/prisma/seed-data/dashboard-layouts.seed.ts
export const defaultLayouts = [
  // ... existing layouts
  
  {
    pageId: 'my-custom-page',
    scope: 'global',
    name: 'Default My Page Layout',
    description: 'Default layout for my custom page',
    isDefault: true,
    widgetInstances: [
      {
        widgetKey: 'stats-grid',
        position: 0,
        gridSpan: 12,
        config: {
          stats: [
            { title: 'Metric 1', value: 0, icon: 'TrendingUp' },
            { title: 'Metric 2', value: 0, icon: 'Users' },
          ],
          columns: 2,
        },
      },
      {
        widgetKey: 'chart-widget',
        position: 1,
        gridSpan: 8,
        config: {
          type: 'line',
          title: 'Trend Chart',
          data: [],
        },
      },
    ],
  },
];
```

2. **Reseed Database**

```bash
cd backend
npm run prisma:seed
```

## Available Widgets

The system comes with 40+ pre-built widgets across 9 categories:

### Core Widgets
- `stats-card`: Single metric display
- `stats-grid`: Multiple metrics in a grid
- `chart-widget`: Various chart types (line, bar, pie, area)
- `data-table`: Advanced table with sorting/filtering
- `activity-feed`: Timeline of activities
- `widget-container`: Flexible container for custom content

### Data Display Widgets
- `metric-card`: Large metric with comparison
- `progress-widget`: Progress bars and circles
- `list-widget`: Scrollable list of items
- `card-grid`: Responsive grid of cards

### Interactive Widgets
- `quick-actions`: Action buttons
- `search-bar`: Search input with debouncing
- `filter-panel`: Advanced filtering
- `notification-widget`: Notification center

### Form Widgets
- `form-card`: Form container
- `date-range-picker`: Date range selection
- `multi-select`: Multi-select dropdown
- `file-upload`: File upload with drag-and-drop

### Layout Widgets
- `page-header`: Page header with breadcrumbs
- `empty-state`: Empty state placeholder
- `skeleton-loader`: Loading skeletons
- `error-boundary`: Error handling

### Advanced Widgets
- `calendar`: Event calendar
- `kanban-board`: Kanban board for tasks
- `timeline`: Vertical timeline
- `tree-view`: Hierarchical tree structure

### Utility Widgets
- `avatar`: User avatar
- `badge`: Status badges
- `modal`: Modal dialogs
- `tooltip`: Tooltips

### Integration Widgets
- `api-widget`: Generic API data display
- `permission-wrapper`: Permission-based rendering
- `export-button`: Data export
- `bulk-actions`: Bulk operations
- `theme-preview`: Theme customization preview

### Specialized Widgets
- `user-card`: User profile card
- `pricing-card`: Pricing plan card
- `comparison-table`: Feature comparison
- `chat-widget`: Chat interface
- `map-widget`: Interactive map

## Examples

### Example 1: Simple Dashboard

```typescript
// frontend/src/app/dashboard/simple/page.tsx
"use client";

import { DashboardGrid } from "@/components/dashboard/DashboardGrid";
import { PageHeader } from "@/components/layout/PageHeader";

export default function SimpleDashboard() {
  return (
    <div className="space-y-6">
      <PageHeader title="Simple Dashboard" />
      <DashboardGrid pageId="simple" />
    </div>
  );
}
```

### Example 2: Analytics Dashboard (Already Created)

Located at `/dashboard/analytics`:
- Uses `DashboardGrid` with `pageId="analytics"`
- Includes proper metadata and breadcrumbs
- Ready for widget customization

### Example 3: Main Dashboard (Updated)

Located at `/dashboard`:
- Now uses `DashboardGrid` with `pageId="overview"`
- Replaced static content with dynamic widget system
- Users can fully customize their main dashboard

## Testing the System

1. **Start the Backend**
```bash
cd backend
npm run start:dev
```

2. **Start the Frontend**
```bash
cd frontend
npm run dev
```

3. **Navigate to Dashboard**
- Go to `http://localhost:3000/dashboard`
- You should see the "Edit Layout" button

4. **Test Edit Mode**
- Click "Edit Layout"
- Click "Add Widget"
- Browse and add widgets
- Drag to rearrange
- Click "Save Changes"

5. **Test Analytics Page**
- Go to `http://localhost:3000/dashboard/analytics`
- Repeat the same customization steps
- Each page has its own independent layout

## Permissions

The system respects user permissions:

- **layouts:read**: View dashboard layouts
- **layouts:write**: Edit and save layouts
- **widgets:read**: View available widgets
- **widgets:write**: Create custom widgets (admin only)

Users without `layouts:write` permission won't see the "Edit Layout" button.

## Troubleshooting

### Widget Library is Empty
- Check that backend is running
- Verify widgets are seeded in database
- Check user has `widgets:read` permission
- Check browser console for API errors

### Changes Not Saving
- Verify user has `layouts:write` permission
- Check backend logs for errors
- Ensure database connection is working
- Try refreshing the page

### Widgets Not Rendering
- Check widget is registered in `frontend/src/lib/widget-registry.ts`
- Verify widget component exists
- Check browser console for import errors
- Ensure widget configuration is valid

### Drag and Drop Not Working
- Ensure you're in edit mode
- Check that DnD Kit is installed
- Try a different browser
- Check for JavaScript errors

## Next Steps

1. **Add More Pages**: Create additional dashboard pages using the pattern above
2. **Create Custom Widgets**: Follow the widget development guide to create custom widgets
3. **Customize Default Layouts**: Modify seed data to change default layouts
4. **Add Permissions**: Create page-specific permissions for access control
5. **Integrate Data**: Connect widgets to your backend APIs for real data

## Resources

- **Complete Guide**: `.kiro/steering/dashboard-customization-system.md`
- **API Documentation**: `.kiro/steering/dashboard-api-documentation.md`
- **Widget Development**: `.kiro/steering/widget-development-guide.md`
- **User Guide**: `.kiro/steering/dashboard-user-guide.md`

## Summary

The Dashboard Customization System is now fully functional! You can:

✅ Customize the main dashboard at `/dashboard`
✅ Use the analytics dashboard at `/dashboard/analytics`
✅ Create new customizable pages easily
✅ Add, remove, and arrange widgets
✅ Save personalized layouts
✅ Access 40+ pre-built widgets

The system is production-ready and follows all best practices for performance, accessibility, and security.
