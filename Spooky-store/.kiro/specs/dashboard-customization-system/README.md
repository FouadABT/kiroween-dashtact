# Dashboard Customization System

## Overview

The Dashboard Customization System is a comprehensive, AI-agent-friendly solution for dynamic dashboard composition and navigation management. It transforms your dashboard from static to fully customizable while maintaining ease of use for both developers and AI agents.

## Key Features

### Widget Layout System
- **Dynamic Dashboard Composition**: Arrange widgets on dashboard pages using a flexible grid system
- **Database-Driven Layouts**: Store widget arrangements per page and user in PostgreSQL
- **Widget Registry**: Central catalog of all available widgets with metadata and configuration schemas
- **Drag-and-Drop Editor**: Visual interface for customizing dashboard layouts
- **Layout Templates**: Pre-built layouts for common use cases (Analytics, Management, Monitoring)
- **Permission-Based Visibility**: Show/hide widgets based on user permissions

### Navigation Management System
- **Database-Driven Menus**: Store sidebar navigation structure in the database
- **Hierarchical Navigation**: Support nested menu items up to 3 levels deep
- **Navigation Groups**: Organize items into collapsible sections
- **Dynamic Badges**: Display notification counts and labels on menu items
- **Visual Editor**: Admin UI for managing navigation structure
- **Permission Filtering**: Automatically hide menu items based on user permissions

## Architecture

### Technology Stack
- **Backend**: NestJS + Prisma + PostgreSQL
- **Frontend**: Next.js 14 + React Context + TypeScript
- **UI Components**: shadcn/ui + Radix UI
- **Drag & Drop**: @dnd-kit
- **Permissions**: JWT-based with existing auth system

### Database Tables
- `WidgetDefinition`: Registry of available widgets
- `DashboardLayout`: Widget arrangements per page/user
- `WidgetInstance`: Individual widget placements
- `NavigationItem`: Menu items with hierarchy
- `NavigationGroup`: Navigation sections
- `NavigationItemGroup`: Many-to-many junction table

## Quick Start

### Prerequisites
- Existing project with JWT authentication system
- PostgreSQL database
- Node.js 18+ and npm

### Installation

1. **Add Database Schema**
   ```bash
   # Add models to backend/prisma/schema.prisma
   # See design.md for complete schema
   ```

2. **Run Migrations**
   ```bash
   cd backend
   npm run prisma:migrate
   npm run prisma:generate
   npm run prisma:seed
   ```

3. **Install Dependencies**
   ```bash
   # Frontend
   cd frontend
   npm install @dnd-kit/core @dnd-kit/sortable @dnd-kit/utilities
   
   # Backend (no additional dependencies needed)
   ```

4. **Start Development**
   ```bash
   # Backend
   cd backend
   npm run start:dev
   
   # Frontend
   cd frontend
   npm run dev
   ```

## Usage

### For Users

**Customize Your Dashboard:**
1. Navigate to any dashboard page
2. Click "Edit Layout" button
3. Drag widgets to reorder
4. Click "Add Widget" to browse available widgets
5. Adjust widget sizes using the grid span control
6. Click "Save" to persist changes

**Reset to Default:**
- Click "Reset Layout" to restore the default configuration

### For Administrators

**Manage Navigation:**
1. Go to Settings > Navigation
2. Drag items to reorder
3. Click "New Item" to add menu items
4. Edit items to change title, icon, permissions
5. Preview changes in real-time

**Register New Widgets:**
1. Create widget component in `frontend/src/components/widgets/`
2. Add entry to `frontend/src/lib/widget-registry.ts`
3. Seed widget definition in database
4. Widget appears in Widget Library

### For Developers

**Add a New Widget:**

1. Create the component:
```typescript
// frontend/src/components/widgets/custom/MyWidget.tsx
export function MyWidget({ title, data }: MyWidgetProps) {
  return (
    <div className="p-4 bg-card rounded-lg">
      <h3>{title}</h3>
      {/* Widget content */}
    </div>
  );
}
```

2. Register in widget registry:
```typescript
// frontend/src/lib/widget-registry.ts
export const widgetRegistry = {
  'my-widget': {
    component: lazy(() => import('@/components/widgets/custom/MyWidget')),
    category: 'custom',
    lazy: true,
  },
  // ... other widgets
};
```

3. Seed widget definition:
```typescript
// backend/prisma/seed-data/widgets.seed.ts
{
  key: 'my-widget',
  name: 'My Widget',
  description: 'Description of what the widget does',
  component: 'MyWidget',
  category: 'custom',
  icon: 'Box',
  defaultGridSpan: 6,
  minGridSpan: 3,
  maxGridSpan: 12,
  configSchema: {
    type: 'object',
    properties: {
      title: { type: 'string', default: 'My Widget' },
      data: { type: 'array' },
    },
  },
  dataRequirements: {
    endpoint: '/api/my-data',
    permissions: ['data:read'],
  },
}
```

**Add a Navigation Item:**

```typescript
// Via API or seed data
{
  key: 'my-page',
  title: 'My Page',
  href: '/dashboard/my-page',
  icon: 'FileText',
  permission: 'pages:read',
  position: 10,
  isEnabled: true,
  isVisible: true,
}
```

## AI Agent Integration

### Discovery Endpoints

**Get System Capabilities:**
```bash
GET /api/capabilities
```
Returns: Available widgets, navigation structure, layout templates, user permissions

**Search Widgets:**
```bash
GET /api/widgets/registry/search?query=chart
```
Returns: Widgets matching search term with metadata

**Get Navigation Tree:**
```bash
GET /api/navigation/tree
```
Returns: Complete hierarchical navigation structure

### AI-Friendly Features

- **Declarative Configuration**: AI generates JSON, not React code
- **Schema Validation**: Catch errors before execution
- **Single Source of Truth**: All configuration in database
- **Predictable File Locations**: Consistent project structure
- **Self-Documenting**: Metadata includes descriptions and examples
- **OpenAPI Documentation**: Complete API specs at `/api/docs`

## File Structure

```
backend/src/
├── widgets/
│   ├── widgets.module.ts
│   ├── widget-registry.service.ts
│   ├── widget-registry.controller.ts
│   └── dto/
├── dashboard-layouts/
│   ├── dashboard-layouts.module.ts
│   ├── dashboard-layouts.service.ts
│   ├── dashboard-layouts.controller.ts
│   ├── dto/
│   └── templates/
└── navigation/
    ├── navigation.module.ts
    ├── navigation.service.ts
    ├── navigation-builder.service.ts
    ├── navigation.controller.ts
    └── dto/

frontend/src/
├── lib/
│   └── widget-registry.ts
├── contexts/
│   ├── WidgetContext.tsx
│   └── NavigationContext.tsx (extended)
├── components/
│   ├── dashboard/
│   │   ├── DashboardGrid.tsx
│   │   └── WidgetRenderer.tsx
│   ├── navigation/
│   │   └── DynamicSidebar.tsx
│   └── admin/
│       ├── WidgetLibrary.tsx
│       ├── LayoutEditor.tsx
│       └── NavigationEditor.tsx
└── types/
    ├── widgets.ts
    └── navigation.ts (extended)
```

## API Reference

### Widget Registry
- `GET /api/widgets/registry` - List all widgets
- `GET /api/widgets/registry/:key` - Get specific widget
- `POST /api/widgets/registry` - Register widget (admin)
- `GET /api/widgets/registry/search` - Search widgets

### Dashboard Layouts
- `GET /api/dashboard-layouts` - List layouts
- `GET /api/dashboard-layouts/:pageId` - Get layout for page
- `POST /api/dashboard-layouts` - Create layout
- `PATCH /api/dashboard-layouts/:id` - Update layout
- `POST /api/dashboard-layouts/:id/clone` - Clone layout
- `POST /api/dashboard-layouts/reset` - Reset to default

### Navigation
- `GET /api/navigation/items` - List navigation items
- `GET /api/navigation/tree` - Get hierarchical tree
- `POST /api/navigation/items` - Create item (admin)
- `PATCH /api/navigation/items/:id` - Update item (admin)
- `DELETE /api/navigation/items/:id` - Delete item (admin)

## Permissions

### Required Permissions
- `widgets:read` - View widget registry
- `widgets:write` - Register/modify widgets (admin)
- `layouts:read` - View dashboard layouts
- `layouts:write` - Create/modify layouts
- `navigation:write` - Modify navigation structure (admin)

### Default Assignments
- **User/Manager**: `widgets:read`, `layouts:read`
- **Admin/Super Admin**: All permissions

## Migration

### From Hardcoded Navigation

1. Run migration script:
```bash
cd backend
npm run migrate:navigation
```

2. Verify in database:
```bash
npm run prisma:studio
```

3. Test with frontend - should see same navigation

4. (Optional) Remove hardcoded navigation after verification

### From Static Dashboards

1. Identify existing dashboard pages
2. Create widget definitions for current components
3. Create default layouts matching current structure
4. Seed database with layouts
5. Replace static pages with DashboardGrid component

## Performance

- **Page Load**: <2 seconds on 3G connection
- **Lighthouse Score**: 90+ performance
- **Caching**: 5-minute cache for registry and navigation
- **Lazy Loading**: Heavy components loaded on demand
- **Optimistic Updates**: Immediate UI feedback

## Accessibility

- **WCAG AA Compliant**: All UI elements meet contrast standards
- **Keyboard Navigation**: Full keyboard support
- **Screen Reader**: Proper ARIA labels and announcements
- **Focus Indicators**: Visible in both light and dark themes

## Troubleshooting

### Widgets Not Appearing
- Check widget is registered in `widget-registry.ts`
- Verify widget definition exists in database
- Check user has required permissions
- Look for errors in browser console

### Navigation Not Loading
- Verify navigation items exist in database
- Check NavigationContext is fetching from database
- Verify user has permissions for menu items
- Check for circular references in hierarchy

### Layout Not Saving
- Check user has `layouts:write` permission
- Verify API endpoint is accessible
- Check for validation errors in network tab
- Look for errors in backend logs

## Resources

- **Requirements**: `.kiro/specs/dashboard-customization-system/requirements.md`
- **Design**: `.kiro/specs/dashboard-customization-system/design.md`
- **Tasks**: `.kiro/specs/dashboard-customization-system/tasks.md`
- **Steering Guide**: `.kiro/steering/dashboard-customization-system.md` (to be created)
- **API Docs**: `http://localhost:3001/api/docs` (after implementation)

## Support

For questions or issues:
1. Check the troubleshooting section above
2. Review the design document for architecture details
3. Check the steering guide for common patterns
4. Review API documentation for endpoint details

## License

This system is part of your dashboard application and follows the same license.
