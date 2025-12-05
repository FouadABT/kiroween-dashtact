# Widget System Specification

## Overview

This specification defines a comprehensive widget library for building rich dashboard interfaces with 40+ reusable React components. The system integrates seamlessly with the existing JWT authentication system and OKLCH theme system.

## Specification Files

- **[requirements.md](./requirements.md)** - 20 detailed requirements with EARS-compliant acceptance criteria
- **[design.md](./design.md)** - Complete architecture, component interfaces, and implementation details
- **[tasks.md](./tasks.md)** - 19 top-level implementation tasks with 100+ sub-tasks

## Key Features

### Widget Categories (40+ Components)

1. **Core Widgets** - StatsCard, StatsGrid, DataTable, ChartWidget, ActivityFeed, WidgetContainer
2. **Data Display** - MetricCard, ProgressWidget, ListWidget, CardGrid
3. **Interactive** - QuickActions, FilterPanel, SearchBar, NotificationWidget
4. **Layout** - PageHeader, EmptyState, ErrorBoundary, SkeletonLoader
5. **Forms** - FormCard, FileUpload, DateRangePicker, MultiSelect
6. **Utility** - Badge, Avatar, Tooltip, Modal
7. **Advanced** - KanbanBoard, Calendar, TreeView, Timeline
8. **Specialized** - UserCard, PricingCard, ComparisonTable, MapWidget, ChatWidget
9. **Integration** - ApiWidget, PermissionWrapper, ThemePreview, ExportButton, BulkActions

### System Integration

**Theme System Integration**:
- Automatic light/dark mode adaptation using OKLCH color tokens
- CSS custom properties for dynamic theming
- No component re-renders on theme changes
- Tailwind CSS utility classes (bg-background, text-foreground, etc.)

**Permission System Integration**:
- Component-level access control via permission prop
- Integrates with existing PermissionGuard component
- Uses JWT permissions from auth system
- Format: `{resource}:{action}` (e.g., "analytics:read")

**Backend Integration**:
- File upload endpoints for FileUpload widget
- NestJS uploads module with multer
- File validation (type, size)
- Secure storage with UUID filenames
- Requires "files:write" permission

### Widget Gallery

- Admin-only page at `/dashboard/widgets`
- Requires "widgets:admin" permission
- Live, interactive examples of all widgets
- Code snippets for each widget
- Organized by category

## Technology Stack

### Frontend
- **Framework**: Next.js 14 + TypeScript
- **UI Library**: shadcn/ui + Radix UI
- **Styling**: Tailwind CSS + OKLCH theme tokens
- **Charts**: Recharts
- **Tables**: @tanstack/react-table
- **Forms**: react-hook-form + zod
- **Drag & Drop**: @dnd-kit (for Kanban)
- **Icons**: Lucide React

### Backend
- **Framework**: NestJS
- **File Upload**: @nestjs/platform-express + multer
- **Validation**: class-validator
- **Storage**: Local filesystem (configurable)

## Implementation Approach

### Phased Rollout (7 Weeks)

1. **Week 1**: Foundation (setup, types, base components)
2. **Week 2**: Core widgets (StatsCard, DataTable, ChartWidget)
3. **Week 3**: Data display & interactive widgets
4. **Week 4**: Layout & form widgets + backend uploads
5. **Week 5**: Utility & advanced widgets
6. **Week 6**: Specialized & integration widgets
7. **Week 7**: Widget gallery + documentation + polish

### Development Workflow

1. Create widget component with TypeScript interface
2. Implement with theme-aware Tailwind classes
3. Add permission support via WidgetContainer
4. Add loading state (SkeletonLoader)
5. Add error handling (ErrorBoundary)
6. Add to widget gallery with example
7. Write tests (optional for MVP)
8. Document with JSDoc comments

## Quick Start

### For Developers

```typescript
// Import widgets
import { StatsCard, DataTable, ChartWidget } from '@/components/widgets';

// Use with theme integration (automatic)
<StatsCard
  title="Total Users"
  value={1234}
  icon={Users}
  trend={{ value: 12, direction: 'up' }}
/>

// Use with permission control
<DataTable
  data={users}
  columns={columns}
  permission="users:read"
  searchable
  pagination
/>

// Use with loading state
<ChartWidget
  type="line"
  data={chartData}
  loading={isLoading}
/>
```

### For Administrators

1. Navigate to `/dashboard/widgets` (requires "widgets:admin" permission)
2. Browse widget categories
3. View live examples
4. Copy code snippets
5. Integrate into your pages

## File Structure

```
frontend/src/components/widgets/
├── core/           # Essential widgets (StatsCard, DataTable, etc.)
├── data-display/   # Metrics, progress, lists, grids
├── interactive/    # Search, filters, actions, notifications
├── layout/         # Headers, empty states, errors, skeletons
├── forms/          # Form cards, file upload, date pickers
├── utility/        # Badges, avatars, tooltips, modals
├── advanced/       # Kanban, calendar, tree, timeline
├── specialized/    # User cards, pricing, comparison, maps, chat
├── integration/    # API widgets, permissions, theme preview, export
├── types/          # TypeScript type definitions
├── README.md       # Widget documentation
└── index.ts        # Central exports

backend/src/uploads/
├── uploads.module.ts
├── uploads.controller.ts
├── uploads.service.ts
├── dto/
└── interfaces/
```

## Dependencies

### Essential Packages
```bash
npm install recharts date-fns react-day-picker @tanstack/react-virtual react-dropzone use-debounce react-use
```

### Radix UI Components
```bash
npm install @radix-ui/react-tabs @radix-ui/react-tooltip @radix-ui/react-popover @radix-ui/react-accordion @radix-ui/react-collapsible @radix-ui/react-scroll-area
```

### shadcn/ui Components
```bash
npx shadcn@latest add badge button card calendar skeleton table tooltip dialog form input command collapsible breadcrumb scroll-area popover toast avatar progress select checkbox
```

### Optional (Advanced Features)
```bash
npm install @dnd-kit/core @dnd-kit/sortable @dnd-kit/utilities
```

## Performance

- **Lazy Loading**: Heavy components (charts, Kanban) loaded on demand
- **Memoization**: Widgets memoized to prevent unnecessary re-renders
- **Virtualization**: Large lists use @tanstack/react-virtual
- **Debouncing**: Search and filter inputs debounced by 300ms
- **Target**: Lighthouse performance score 90+ on widget gallery

## Accessibility

- **WCAG AA Compliance**: Color contrast ratios meet standards
- **Keyboard Navigation**: Full keyboard support (Tab, Enter, Space, Arrows)
- **Screen Readers**: Proper ARIA labels and announcements
- **Focus Indicators**: Visible in both light and dark themes

## Security

- **File Upload**: Type and size validation, UUID filenames
- **Permissions**: Backend validates permissions, never trust frontend
- **XSS Prevention**: React's built-in escaping + DOMPurify for HTML
- **Storage**: Files stored outside web root, served via controller

## Testing

- **Unit Tests**: Component logic and rendering (optional for MVP)
- **Integration Tests**: Permission checks and theme integration (optional for MVP)
- **E2E Tests**: Widget gallery and file uploads (optional for MVP)
- **Manual Testing**: Theme switching, responsive behavior, accessibility

## Next Steps

1. Review and approve this specification
2. Begin implementation with Task 1 (setup and dependencies)
3. Follow the phased rollout plan
4. Test each widget as it's completed
5. Deploy widget gallery for team review

## Resources

- **Theme System**: `.kiro/steering/design-system-theming.md`
- **Auth System**: `.kiro/steering/jwt-auth-system.md`
- **shadcn/ui**: https://ui.shadcn.com/
- **Recharts**: https://recharts.org/
- **TanStack Table**: https://tanstack.com/table/
- **Radix UI**: https://www.radix-ui.com/

## Support

For questions or issues during implementation:
1. Check the design document for detailed specifications
2. Review existing theme and auth system documentation
3. Refer to shadcn/ui and Radix UI documentation
4. Test widgets in the widget gallery as you build them
