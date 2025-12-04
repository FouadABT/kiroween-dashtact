# Implementation Plan

- [x] 1. Set up project structure and install dependencies





  - Create widget directory structure at `frontend/src/components/widgets/`
  - Install essential packages: recharts, date-fns, react-day-picker, @tanstack/react-virtual, react-dropzone, use-debounce, react-use
  - Install Radix UI components: @radix-ui/react-tabs, @radix-ui/react-tooltip, @radix-ui/react-popover, @radix-ui/react-accordion, @radix-ui/react-collapsible, @radix-ui/react-scroll-area
  - Add shadcn/ui components: badge, button, card, calendar, skeleton, table, tooltip, dialog, form, input, command, collapsible, breadcrumb, scroll-area, popover, toast, avatar, progress, select, checkbox
  - _Requirements: 1.3, 19.1, 19.2, 19.3_

- [x] 2. Create TypeScript type definitions





  - Create `frontend/src/components/widgets/types/widget.types.ts` with all widget interfaces
  - Define BaseWidgetProps, StatItem, TrendData, ListItem, ActivityItem, KanbanColumn, KanbanItem, CalendarEvent, TreeNode, FilterConfig, FilterState
  - Export all types from types file
  - _Requirements: 1.2, 17.1, 17.2, 17.3_

- [x] 3. Implement WidgetContainer base component





  - Create `frontend/src/components/widgets/core/WidgetContainer.tsx`
  - Integrate PermissionGuard for access control
  - Add loading state with SkeletonLoader
  - Add error state with error message display
  - Add collapsible functionality using Radix UI Collapsible
  - Apply theme-aware styling with Tailwind classes (bg-card, text-card-foreground, border-border)
  - _Requirements: 1.5, 3.1, 3.3, 4.1, 4.3, 12.1, 12.2, 12.3, 12.4, 12.5_

- [x] 4. Implement core widgets





- [x] 4.1 Create StatsCard component


  - Create `frontend/src/components/widgets/core/StatsCard.tsx`
  - Implement title, value, icon, trend indicator props
  - Add responsive text sizing (text-2xl mobile, text-3xl desktop)
  - Use Lucide React icons
  - Wrap in WidgetContainer
  - _Requirements: 1.1, 2.1, 2.2, 2.5, 5.2_

- [x] 4.2 Create StatsGrid component


  - Create `frontend/src/components/widgets/core/StatsGrid.tsx`
  - Implement responsive grid layout with configurable columns (2, 3, 4)
  - Map stats array to StatsCard components
  - Add loading state for all cards
  - _Requirements: 1.1, 5.1, 5.2_

- [x] 4.3 Create DataTable component


  - Create `frontend/src/components/widgets/core/DataTable.tsx`
  - Integrate @tanstack/react-table for table logic
  - Add global search filter across all columns
  - Add column sorting with visual indicators
  - Add pagination with page size selector (10, 25, 50, 100)
  - Add row actions column
  - Use shadcn/ui Table component for styling
  - Make responsive with horizontal scroll on mobile
  - _Requirements: 1.1, 7.1, 7.2, 7.3, 7.4, 7.5_

- [x] 4.4 Create ChartWidget component


  - Create `frontend/src/components/widgets/core/ChartWidget.tsx`
  - Support line, bar, pie, area, composed chart types using Recharts
  - Use theme chart colors (chart1-5) for data series
  - Add ResponsiveContainer for automatic sizing
  - Style tooltip and legend with theme colors
  - Lazy load using React.lazy
  - _Requirements: 1.1, 8.1, 8.2, 8.3, 8.4, 8.5_

- [x] 4.5 Create ActivityFeed component


  - Create `frontend/src/components/widgets/core/ActivityFeed.tsx`
  - Display timeline of activity items
  - Show timestamps with date-fns formatting
  - Support grouping by date
  - Add user avatar and name display
  - Limit visible items with "show more" button
  - _Requirements: 1.1_

- [x] 5. Implement data display widgets





- [x] 5.1 Create MetricCard component


  - Create `frontend/src/components/widgets/data-display/MetricCard.tsx`
  - Display large value with label
  - Add comparison data (previous period)
  - Support number, currency, percentage formatting
  - Add icon support
  - _Requirements: 1.1_

- [x] 5.2 Create ProgressWidget component


  - Create `frontend/src/components/widgets/data-display/ProgressWidget.tsx`
  - Support bar and circle variants
  - Use shadcn/ui Progress component
  - Calculate and display percentage
  - Apply theme color for progress bar
  - _Requirements: 1.1_

- [x] 5.3 Create ListWidget component


  - Create `frontend/src/components/widgets/data-display/ListWidget.tsx`
  - Display list of items with icons
  - Add click handlers for items
  - Use shadcn/ui Scroll Area for scrolling
  - Show empty state when no items
  - _Requirements: 1.1_

- [x] 5.4 Create CardGrid component


  - Create `frontend/src/components/widgets/data-display/CardGrid.tsx`
  - Implement responsive grid with configurable columns
  - Accept render function for custom card content
  - Use shadcn/ui Card for items
  - Add loading state with skeleton cards
  - _Requirements: 1.1, 5.1, 5.2_

- [x] 6. Implement interactive widgets





- [x] 6.1 Create QuickActions component


  - Create `frontend/src/components/widgets/interactive/QuickActions.tsx`
  - Support horizontal, vertical, grid layouts
  - Use shadcn/ui Button component
  - Add configurable button sizes
  - Apply permission checks to individual actions
  - _Requirements: 1.1, 14.4_

- [x] 6.2 Create FilterPanel component


  - Create `frontend/src/components/widgets/interactive/FilterPanel.tsx`
  - Make collapsible using Radix UI Collapsible
  - Support text, select, date, range filter types
  - Persist filter state in URL query parameters
  - Emit filter changes to parent
  - _Requirements: 1.1, 14.3_

- [x] 6.3 Create SearchBar component


  - Create `frontend/src/components/widgets/interactive/SearchBar.tsx`
  - Debounce input by 300ms using use-debounce
  - Show search suggestions in dropdown
  - Use shadcn/ui Input and Command components
  - Add clear button
  - _Requirements: 1.1, 14.1, 14.2_

- [x] 6.4 Create NotificationWidget component


  - Create `frontend/src/components/widgets/interactive/NotificationWidget.tsx`
  - Integrate with sonner for toast notifications
  - Display notification list with dismiss buttons
  - Limit visible notifications
  - Support top/bottom positioning
  - _Requirements: 1.1, 14.5_
-

- [x] 7. Implement layout widgets





- [x] 7.1 Create PageHeader component

  - Create `frontend/src/components/widgets/layout/PageHeader.tsx`
  - Display page title and description
  - Add breadcrumbs using shadcn/ui Breadcrumb
  - Add action buttons area
  - Make responsive (stack on mobile)
  - _Requirements: 1.1_


- [x] 7.2 Create EmptyState component

  - Create `frontend/src/components/widgets/layout/EmptyState.tsx`
  - Display icon, title, description
  - Add optional call-to-action button
  - Center content vertically and horizontally
  - Apply theme styling
  - _Requirements: 1.1_


- [x] 7.3 Create ErrorBoundary component

  - Create `frontend/src/components/widgets/layout/ErrorBoundary.tsx`
  - Catch React errors in widget tree
  - Display error message with retry button
  - Log errors to console
  - Support custom fallback UI
  - _Requirements: 1.1, 4.4_



- [x] 7.4 Create SkeletonLoader component
  - Create `frontend/src/components/widgets/layout/SkeletonLoader.tsx`
  - Support text, card, table, chart variants
  - Use shadcn/ui Skeleton component
  - Match layout of actual widget
  - Add configurable count for multiple items
  - _Requirements: 1.1, 4.1, 4.2_

- [x] 8. Implement form widgets





- [x] 8.1 Create FormCard component


  - Create `frontend/src/components/widgets/forms/FormCard.tsx`
  - Wrap form in shadcn/ui Card
  - Add title and description
  - Add submit/cancel action buttons
  - Show loading state during submission
  - Integrate with react-hook-form
  - _Requirements: 1.1, 13.1_

- [x] 8.2 Create DateRangePicker component


  - Create `frontend/src/components/widgets/forms/DateRangePicker.tsx`
  - Use react-day-picker for date selection
  - Add preset ranges (today, last 7 days, last 30 days, etc.)
  - Use shadcn/ui Calendar and Popover
  - Format dates with date-fns
  - _Requirements: 1.1, 13.2_

- [x] 8.3 Create MultiSelect component


  - Create `frontend/src/components/widgets/forms/MultiSelect.tsx`
  - Support searchable multi-option selection
  - Use shadcn/ui Select and Checkbox
  - Show selected count badge
  - Add "select all" / "clear all" options
  - _Requirements: 1.1, 13.3_

- [x] 8.4 Create FileUpload component


  - Create `frontend/src/components/widgets/forms/FileUpload.tsx`
  - Use react-dropzone for drag-and-drop
  - Validate file types using accept prop
  - Validate file size using maxSize prop
  - Show upload progress
  - Display file list with remove buttons
  - Call backend POST /api/uploads endpoint
  - _Requirements: 1.1, 9.1, 9.2, 9.3, 9.4, 9.5, 13.4_

- [x] 9. Implement utility widgets






- [x] 9.1 Add Badge component

  - Use shadcn/ui Badge component
  - Support default, success, warning, error, info variants
  - Add size variants (sm, md, lg)
  - Add icon support
  - _Requirements: 1.1_


- [x] 9.2 Add Avatar component

  - Use shadcn/ui Avatar component
  - Show image with fallback to initials
  - Support size variants (xs, sm, md, lg, xl)
  - Add status indicator (online, offline, away)
  - _Requirements: 1.1_


- [x] 9.3 Add Tooltip component

  - Use shadcn/ui Tooltip component
  - Support top, bottom, left, right positioning
  - Add configurable delay
  - Apply theme styling
  - _Requirements: 1.1_


- [x] 9.4 Add Modal component

  - Use shadcn/ui Dialog component
  - Support size variants (sm, md, lg, xl, full)
  - Add title and close button
  - Handle open/close state
  - Apply permission checks
  - _Requirements: 1.1_

- [x] 10. Implement advanced widgets





- [x] 10.1 Create KanbanBoard component


  - Create `frontend/src/components/widgets/advanced/KanbanBoard.tsx`
  - Install @dnd-kit/core, @dnd-kit/sortable, @dnd-kit/utilities
  - Implement drag-and-drop between columns
  - Display columns with items
  - Emit move events to parent
  - Add permission checks
  - _Requirements: 1.1, 15.1, 19.4_

- [x] 10.2 Create Calendar component


  - Create `frontend/src/components/widgets/advanced/Calendar.tsx`
  - Use react-day-picker for calendar display
  - Support month, week, day views
  - Display events on calendar
  - Handle event click
  - Apply theme colors to events
  - _Requirements: 1.1, 15.2_

- [x] 10.3 Create TreeView component


  - Create `frontend/src/components/widgets/advanced/TreeView.tsx`
  - Display hierarchical data
  - Support expand/collapse nodes
  - Add selection handling
  - Support lazy loading of children
  - Add icons for nodes
  - _Requirements: 1.1, 15.3_

- [x] 10.4 Create Timeline component


  - Create `frontend/src/components/widgets/advanced/Timeline.tsx`
  - Support horizontal and vertical orientations
  - Display events with timestamps
  - Add interactive event handling
  - Apply theme styling
  - _Requirements: 1.1, 15.4_

- [x] 11. Implement specialized widgets

- [x] 11.1 Create UserCard component
  - Create `frontend/src/components/widgets/specialized/UserCard.tsx`
  - Display user avatar, name, email
  - Show additional user details
  - Add action buttons
  - Apply permission checks
  - _Requirements: 1.1_

- [x] 11.2 Create PricingCard component
  - Create `frontend/src/components/widgets/specialized/PricingCard.tsx`
  - Display plan name and price
  - List features with checkmarks
  - Add highlight variant for featured plan
  - Add select button
  - _Requirements: 1.1_


- [x] 11.3 Create ComparisonTable component
  - Create `frontend/src/components/widgets/specialized/ComparisonTable.tsx`
  - Display feature comparison grid
  - Highlight specific column
  - Use checkmarks/crosses for features
  - Make responsive (horizontal scroll on mobile)
  - _Requirements: 1.1_

- [x] 11.4 Create MapWidget component
  - Create `frontend/src/components/widgets/specialized/MapWidget.tsx`
  - Display map with markers (placeholder for now - can integrate react-leaflet later)
  - Support center and zoom props
  - Add marker click handling
  - _Requirements: 1.1_

- [x] 11.5 Create ChatWidget component

  - Create `frontend/src/components/widgets/specialized/ChatWidget.tsx`
  - Display message list with avatars
  - Add message input with send button
  - Show typing indicator
  - Auto-scroll to latest message
  - _Requirements: 1.1_

- [x] 12. Implement integration helpers




- [x] 12.1 Create ApiWidget component


  - Create `frontend/src/components/widgets/integration/ApiWidget.tsx`
  - Fetch data from endpoint on mount
  - Support auto-refresh with interval
  - Pass data to render function
  - Show loading and error states
  - Apply permission checks
  - _Requirements: 1.1_

- [x] 12.2 Create PermissionWrapper component


  - Create `frontend/src/components/widgets/integration/PermissionWrapper.tsx`
  - Wrap existing PermissionGuard with widget-specific styling
  - Support single and multiple permissions
  - Support requireAll flag
  - Add custom fallback UI
  - _Requirements: 1.1_

- [x] 12.3 Create ThemePreview component


  - Create `frontend/src/components/widgets/integration/ThemePreview.tsx`
  - Display component in different theme modes
  - Show variant examples
  - Add code snippet display
  - _Requirements: 1.1_

- [x] 12.4 Create ExportButton component


  - Create `frontend/src/components/widgets/integration/ExportButton.tsx`
  - Support CSV, PDF, Excel, JSON formats
  - Generate file from data prop
  - Trigger download
  - Apply permission checks
  - _Requirements: 1.1_

- [x] 12.5 Create BulkActions component


  - Create `frontend/src/components/widgets/integration/BulkActions.tsx`
  - Display action buttons for selected items
  - Show selected count
  - Emit action events with selected IDs
  - Apply permission checks to actions
  - _Requirements: 1.1_

- [x] 13. Create widget exports and documentation









  - Create `frontend/src/components/widgets/index.ts` exporting all widgets
  - Create `frontend/src/components/widgets/README.md` with overview and quick start
  - Add JSDoc comments to all widget components
  - Create `frontend/src/examples/widget-usage.tsx` with usage examples
  - _Requirements: 1.3, 1.4, 18.1, 18.2, 18.3, 18.4_

- [x] 14. Implement backend file upload module





- [x] 14.1 Create uploads module structure


  - Create `backend/src/uploads/uploads.module.ts`
  - Create `backend/src/uploads/uploads.controller.ts`
  - Create `backend/src/uploads/uploads.service.ts`
  - Create `backend/src/uploads/dto/upload-file.dto.ts`
  - Create `backend/src/uploads/dto/upload-response.dto.ts`
  - Create `backend/src/uploads/interfaces/upload-config.interface.ts`
  - _Requirements: 10.1, 20.1_

- [x] 14.2 Implement upload configuration

  - Define UPLOAD_CONFIGS for image and document types
  - Set max file sizes (5MB images, 10MB documents)
  - Define allowed MIME types whitelist
  - Set upload directories (uploads/images, uploads/documents)
  - _Requirements: 10.3, 10.4, 20.3, 20.4_

- [x] 14.3 Implement uploads controller

  - Add POST /uploads endpoint
  - Use FileInterceptor from @nestjs/platform-express
  - Apply JwtAuthGuard and PermissionsGuard
  - Require "files:write" permission
  - Accept file and UploadFileDto
  - Return UploadResponseDto
  - _Requirements: 10.2, 10.5, 20.2_

- [x] 14.4 Implement uploads service

  - Validate file type against whitelist
  - Validate file size against limits
  - Generate unique filename using UUID
  - Create upload directory if not exists
  - Save file to disk
  - Return file metadata and URL
  - _Requirements: 10.3, 10.4, 20.3, 20.4, 20.5_

- [x] 14.5 Add file upload permission to seed data


  - Add "files:write" permission to `backend/prisma/seed-data/auth.seed.ts`
  - Assign to Admin and Super Admin roles
  - Run `npm run prisma:seed` to update database
  - _Requirements: 10.5_

- [ ] 15. Create widget gallery page




- [x] 15.1 Create gallery page route


  - Create `frontend/src/app/dashboard/widgets/page.tsx`
  - Wrap in PermissionGuard with "widgets:admin" permission
  - Add page title and description
  - _Requirements: 11.1, 11.2_

- [x] 15.2 Add widgets:admin permission to seed data


  - Add "widgets:admin" permission to `backend/prisma/seed-data/auth.seed.ts`
  - Assign to Admin and Super Admin roles
  - Run `npm run prisma:seed` to update database
  - _Requirements: 11.2_

- [x] 15.3 Implement gallery layout


  - Organize widgets by category with section headers
  - Display widget name and description
  - Show live, interactive example for each widget
  - Add code snippet with syntax highlighting
  - Make responsive (single column on mobile, two columns on desktop)
  - _Requirements: 11.3, 11.4, 11.5_

- [x] 15.4 Add gallery to navigation


  - Add "Widgets" menu item to NavigationContext
  - Set permission to "widgets:admin"
  - Use appropriate icon (Grid3x3 or LayoutGrid)
  - _Requirements: 11.2_

- [ ] 16. Add performance optimizations
  - Memoize widgets with React.memo where appropriate
  - Lazy load ChartWidget, KanbanBoard, and other heavy components
  - Implement virtualization for large lists using @tanstack/react-virtual
  - Debounce search and filter inputs by 300ms
  - _Requirements: 16.1, 16.2, 16.3, 16.4_

- [ ] 17. Add accessibility features
  - Add ARIA labels, roles, and attributes to all interactive elements
  - Ensure keyboard navigation works (Tab, Enter, Space, Arrow keys)
  - Add focus indicators visible in both themes
  - Use useScreenReaderAnnouncement for dynamic content changes
  - Test with screen reader (NVDA or JAWS)
  - _Requirements: 6.1, 6.2, 6.3, 6.4_

- [ ]* 18. Write widget tests
  - Write unit tests for core widgets (StatsCard, DataTable, ChartWidget)
  - Write integration tests for permission checks
  - Write tests for theme integration
  - Write tests for loading and error states
  - Write E2E tests for widget gallery page
  - Write backend tests for uploads module
  - _Requirements: 17.5_

- [ ] 19. Final integration and polish
  - Verify all widgets work with light and dark themes
  - Test all widgets with different permission levels
  - Test responsive behavior on mobile, tablet, desktop
  - Run Lighthouse audit on widget gallery page (target: 90+ performance score)
  - Fix any TypeScript errors
  - Update documentation with any changes
  - _Requirements: 2.1, 5.5, 16.5, 17.5_
