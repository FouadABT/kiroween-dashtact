# Implementation Plan - AI-Optimized Dashboard Customization

## Overview

This implementation plan focuses on making the dashboard **maximally discoverable and modifiable by AI agents**. The system provides structured APIs, metadata, and documentation that enable AI agents to understand and extend the dashboard without parsing React code.

**Key Principles**:
- Leverage existing widgets (40+ already built)
- Use existing Pages system for navigation (no duplication)
- Focus on AI discovery and programmatic customization
- Minimal breaking changes to existing systems

**Scope**: 45 tasks organized into 4 phases
**Estimated Time**: 2-3 weeks
**Risk Level**: LOW (no conflicts with existing systems)

---

## Phase 1: Database Foundation & Widget Discovery (Week 1)

- [ ] 1. Add widget metadata tables to database

- [ ] 1.1 Create WidgetDefinition model in Prisma schema
  - Add WidgetDefinition model with fields: id, key, name, description, component, category, icon, defaultGridSpan, minGridSpan, maxGridSpan, configSchema (JSON), dataRequirements (JSON), useCases (String[]), examples (JSON[]), tags (String[]), isActive, isSystemWidget
  - Add indexes: key (unique), category, isActive
  - _Requirements: 1.1, 1.2, 1.5_

- [ ] 1.2 Create DashboardLayout model in Prisma schema
  - Add DashboardLayout model with fields: id, pageId, userId (nullable), scope, name, description, isActive, isDefault
  - Add relationship to User model
  - Add indexes: pageId, userId, scope, isDefault
  - Add unique constraint on [pageId, userId]
  - _Requirements: 2.1, 2.2, 2.5_

- [ ] 1.3 Create WidgetInstance model in Prisma schema
  - Add WidgetInstance model with fields: id, layoutId, widgetKey, position, gridSpan, gridRow, config (JSON), isVisible
  - Add relationship to DashboardLayout
  - Add indexes: layoutId, widgetKey, position
  - _Requirements: 3.1, 3.2_

- [ ] 1.4 Run database migrations
  - Generate migration: `npm run prisma:migrate` in backend
  - Generate Prisma client: `npm run prisma:generate` in backend
  - Verify schema in Prisma Studio
  - _Requirements: 1.5, 2.5, 3.2_

- [ ] 2. Create widget auto-discovery script

- [ ] 2.1 Create widget scanner script
  - Create `backend/scripts/discover-widgets.ts`
  - Scan `frontend/src/components/widgets/` directory recursively
  - Extract component names and file paths
  - Parse JSDoc comments for descriptions and metadata
  - Detect widget categories from directory structure
  - Generate WidgetDefinition records
  - _Requirements: 1.1, 1.4, 16.1, 16.3_

- [ ] 2.2 Add metadata extraction logic
  - Extract @description from JSDoc
  - Extract @category from JSDoc or directory
  - Extract @useCases from JSDoc
  - Extract @example from JSDoc
  - Infer configSchema from TypeScript prop types
  - Detect required permissions from PermissionGuard usage
  - _Requirements: 1.2, 4.1, 4.2, 5.1, 5.2_

- [ ] 2.3 Create seed data from discovered widgets
  - Create `backend/prisma/seed-data/widgets.seed.ts`
  - Run widget scanner to generate definitions
  - Include all 40+ existing widgets
  - Add AI-friendly descriptions and use cases
  - Add searchable tags for each widget
  - Add example configurations
  - _Requirements: 1.1, 1.4, 16.1, 16.3, 30.3_

- [ ] 2.4 Run widget discovery and seed
  - Execute: `npm run discover:widgets` in backend
  - Review generated widget definitions
  - Run: `npm run prisma:seed` to populate database
  - Verify in Prisma Studio
  - _Requirements: 1.1, 1.4_

- [ ] 3. Create backend widgets module

- [ ] 3.1 Create module structure
  - Create `backend/src/widgets/` directory
  - Create widgets.module.ts
  - Create widget-registry.service.ts
  - Create widget-registry.controller.ts
  - Create dto/ directory
  - Create interfaces/ directory
  - Register module in app.module.ts
  - _Requirements: 1.1, 1.3_

- [ ] 3.2 Implement widget registry DTOs
  - Create CreateWidgetDto with class-validator decorators
  - Create UpdateWidgetDto with partial validation
  - Create WidgetFiltersDto for query parameters (category, isActive, tags)
  - Create WidgetResponseDto for API responses
  - Create WidgetSearchDto for search queries
  - _Requirements: 1.2, 4.1, 4.2, 4.3, 16.2_

- [ ] 3.3 Implement widget registry service
  - Implement findAll() with filtering by category, isActive, tags
  - Implement findByKey() with error handling for not found
  - Implement create() with JSON schema validation
  - Implement update() with partial updates
  - Implement remove() (soft delete: set isActive=false)
  - Implement searchByIntent() for natural language search
  - Implement getCategories() to list unique categories
  - Implement filterByPermissions() to check user permissions against dataRequirements
  - Add in-memory caching (5 minute TTL)
  - _Requirements: 1.1, 1.4, 4.3, 5.1, 5.2, 5.3, 14.2, 14.3, 16.2, 26.2_

- [ ] 3.4 Implement widget registry controller
  - Add GET /api/widgets/registry endpoint (returns all active widgets)
  - Add GET /api/widgets/registry/:key endpoint (returns specific widget)
  - Add POST /api/widgets/registry endpoint (admin only, creates widget)
  - Add PATCH /api/widgets/registry/:key endpoint (admin only, updates widget)
  - Add DELETE /api/widgets/registry/:key endpoint (admin only, soft deletes widget)
  - Add GET /api/widgets/registry/categories endpoint (lists categories)
  - Add GET /api/widgets/registry/search?query=:term endpoint (searches by name, description, tags, useCases)
  - Apply JwtAuthGuard to all endpoints
  - Apply PermissionsGuard with widgets:read for GET, widgets:write for POST/PATCH/DELETE
  - Filter results by user permissions
  - _Requirements: 1.3, 14.1, 14.2, 14.3, 16.1, 16.2_

- [ ]* 3.5 Write widget registry tests
  - Write unit tests for widget-registry.service.spec.ts
  - Write controller tests for widget-registry.controller.spec.ts
  - Test permission filtering logic
  - Test search functionality
  - Test schema validation
  - _Requirements: 1.1, 4.3, 5.2, 14.2_



## Phase 2: Dashboard Layout System (Week 2)

- [ ] 4. Create backend layouts module

- [ ] 4.1 Create module structure
  - Create `backend/src/dashboard-layouts/` directory
  - Create dashboard-layouts.module.ts
  - Create dashboard-layouts.service.ts
  - Create dashboard-layouts.controller.ts
  - Create dto/ directory
  - Create templates/ directory for layout templates
  - Register module in app.module.ts
  - _Requirements: 2.1, 2.2, 3.1, 3.2_

- [ ] 4.2 Implement layout DTOs
  - Create CreateLayoutDto with validation
  - Create UpdateLayoutDto with partial validation
  - Create AddWidgetDto with widgetKey and config
  - Create ReorderWidgetsDto with array of { id, position }
  - Create LayoutResponseDto with nested widget instances
  - Create LayoutFiltersDto for query parameters
  - _Requirements: 2.1, 2.2, 3.1, 3.2, 3.3, 3.4, 3.5_

- [ ] 4.3 Implement layouts service
  - Implement findAll() with filtering by userId, scope, pageId
  - Implement findByPageId() with user-specific override logic (user layout > global layout)
  - Implement create() with widget instances
  - Implement update() with optimistic locking
  - Implement remove() with cascade delete of widget instances
  - Implement clone() to duplicate layouts with new name
  - Implement resetToDefault() to restore default layout for page
  - Implement getTemplates() to list pre-built layout templates
  - Implement addWidget() to create widget instance with validation
  - Implement removeWidget() to delete widget instance
  - Implement reorderWidgets() to update positions in bulk
  - Implement validateLayout() to check grid spans don't exceed 12
  - _Requirements: 2.1, 2.2, 2.3, 2.4, 3.1, 3.2, 3.3, 3.4, 3.5, 13.1, 13.2, 13.3, 20.1, 20.2_

- [ ] 4.4 Implement layouts controller
  - Add GET /api/dashboard-layouts endpoint (list layouts for current user)
  - Add GET /api/dashboard-layouts/:pageId endpoint (get layout for specific page)
  - Add POST /api/dashboard-layouts endpoint (create new layout)
  - Add PATCH /api/dashboard-layouts/:id endpoint (update layout)
  - Add DELETE /api/dashboard-layouts/:id endpoint (delete layout)
  - Add POST /api/dashboard-layouts/:id/clone endpoint (clone layout)
  - Add POST /api/dashboard-layouts/reset endpoint (reset to default)
  - Add GET /api/dashboard-layouts/templates endpoint (list templates)
  - Add POST /api/dashboard-layouts/:id/widgets endpoint (add widget)
  - Add DELETE /api/dashboard-layouts/:layoutId/widgets/:widgetId endpoint (remove widget)
  - Add PATCH /api/dashboard-layouts/:id/widgets/reorder endpoint (reorder widgets)
  - Add POST /api/dashboard-layouts/validate endpoint (validate layout configuration)
  - Apply JwtAuthGuard and PermissionsGuard
  - Require layouts:read for GET, layouts:write for POST/PATCH/DELETE
  - _Requirements: 2.1, 2.2, 3.1, 3.2, 3.3, 3.4, 3.5, 13.1, 13.2, 13.3, 13.4, 13.5, 14.1, 14.2, 20.1, 20.2, 20.4, 20.5_

- [ ]* 4.5 Write layouts tests
  - Write unit tests for dashboard-layouts.service.spec.ts
  - Write controller tests for dashboard-layouts.controller.spec.ts
  - Write E2E tests for layout endpoints
  - Test user-specific vs global layout logic
  - Test widget instance management
  - Test validation logic
  - _Requirements: 2.1, 2.2, 2.3, 2.4, 3.1, 3.2, 3.3, 3.4, 3.5_

- [ ] 5. Add permissions to seed data

- [ ] 5.1 Add widget and layout permissions
  - Add to `backend/prisma/seed-data/auth.seed.ts`:
    - widgets:read (View widget registry)
    - widgets:write (Register/modify widgets)
    - layouts:read (View dashboard layouts)
    - layouts:write (Create/modify layouts)
  - Assign widgets:read and layouts:read to all roles (User, Manager, Admin, Super Admin)
  - Assign widgets:write and layouts:write to Admin and Super Admin only
  - _Requirements: 14.1, 14.2, 14.3_

- [ ] 5.2 Run seed script
  - Run `npm run prisma:seed` in backend
  - Verify permissions in Prisma Studio
  - Test permission checks with different user roles
  - _Requirements: 14.1, 14.2, 14.3_

- [ ] 6. Create layout templates

- [ ] 6.1 Define template structure
  - Create `backend/src/dashboard-layouts/templates/` directory
  - Define LayoutTemplate interface
  - Create template JSON files or database records
  - _Requirements: 13.1, 13.2_

- [ ] 6.2 Create default templates
  - Create "Analytics Dashboard" template (revenue-chart, stats-grid, data-table)
  - Create "Management Overview" template (stats-card, activity-feed, quick-actions)
  - Create "Monitoring Console" template (chart-widget, progress-widget, notification-widget)
  - Include AI-friendly descriptions and use cases for each template
  - _Requirements: 13.1, 13.2_

- [ ] 6.3 Seed default dashboard layouts
  - Create default layout for /dashboard/overview page
  - Create default layout for /dashboard/analytics page
  - Create default layout for /dashboard/ecommerce page
  - Set isDefault=true for these layouts
  - _Requirements: 13.1, 13.2, 15.1, 15.2_



## Phase 3: Frontend Widget & Layout System (Week 2-3)

- [ ] 7. Frontend widget registry

- [ ] 7.1 Create widget registry file
  - Create `frontend/src/lib/widget-registry.ts`
  - Map widget keys to React component references
  - Support lazy loading with React.lazy
  - Organize by category for UI grouping
  - Include default props and prop type definitions
  - _Requirements: 17.1, 17.2, 17.3, 17.4, 17.5_

- [ ] 7.2 Create widget type definitions
  - Create `frontend/src/types/widgets.ts`
  - Define WidgetDefinition interface matching backend
  - Define DashboardLayout interface matching backend
  - Define WidgetInstance interface matching backend
  - Define WidgetConfig generic type
  - _Requirements: 17.1, 17.2, 17.3, 17.4, 17.5_

- [ ] 7.3 Create widget registry utilities
  - Implement getWidgetComponent(key) function
  - Implement getWidgetsByCategory(category) function
  - Implement getWidgetMetadata(key) function
  - Add error handling for missing widgets
  - _Requirements: 17.1, 17.2, 18.1, 18.2_

- [ ] 8. Frontend layout management

- [ ] 8.1 Create WidgetContext for state management
  - Create `frontend/src/contexts/WidgetContext.tsx`
  - Add state: layouts, currentLayout, isLoading, isEditMode
  - Add methods: fetchLayouts, updateLayout, addWidget, removeWidget, reorderWidgets, toggleEditMode
  - Implement API calls to backend endpoints
  - Add optimistic updates for better UX
  - _Requirements: 23.1, 23.2, 23.3, 23.4, 23.5_

- [ ] 8.2 Create useWidgets hook
  - Export useWidgets() hook from WidgetContext
  - Add error handling for context not found
  - Add TypeScript types for return value
  - _Requirements: 23.1, 23.4_

- [ ] 8.3 Add WidgetProvider to app layout
  - Wrap application in WidgetProvider in `frontend/src/app/layout.tsx`
  - Place after AuthProvider and ThemeProvider
  - Ensure context is available to all dashboard pages
  - _Requirements: 23.3_

- [ ] 9. Frontend dashboard components

- [ ] 9.1 Create DashboardGrid component
  - Create `frontend/src/components/dashboard/DashboardGrid.tsx`
  - Accept pageId prop and fetch layout from WidgetContext
  - Render widgets in CSS Grid layout (12-column system)
  - Support responsive breakpoints (1 col mobile, 2 col tablet, 12 col desktop)
  - Map gridSpan to Tailwind col-span classes
  - _Requirements: 19.1, 19.2, 19.3_

- [ ] 9.2 Create WidgetRenderer component
  - Create `frontend/src/components/dashboard/WidgetRenderer.tsx`
  - Accept widgetKey, config, isEditMode, onRemove props
  - Look up component in widget registry
  - Render component with config as props
  - Handle loading states with Suspense and SkeletonLoader
  - Wrap in ErrorBoundary for error handling
  - Show error message if widget not found
  - _Requirements: 18.1, 18.2, 18.3, 18.4, 18.5, 28.1, 28.2_

- [ ] 9.3 Add drag and drop support to DashboardGrid
  - Install @dnd-kit/core, @dnd-kit/sortable, @dnd-kit/utilities
  - Wrap grid in DndContext with drag handlers
  - Use SortableContext for widget list
  - Implement handleDragEnd to reorder widgets
  - Only enable drag and drop when isEditMode is true
  - _Requirements: 10.2, 10.3, 19.4_

- [ ] 10. Layout editor UI

- [ ] 10.1 Add edit mode toggle
  - Add "Edit Layout" button to dashboard page header
  - Toggle isEditMode in WidgetContext on click
  - Show "Save" and "Cancel" buttons when in edit mode
  - Apply permission check (layouts:write required)
  - _Requirements: 10.1, 10.2, 14.2, 14.5_

- [ ] 10.2 Create Widget Library modal
  - Create `frontend/src/components/admin/WidgetLibrary.tsx`
  - Fetch widgets from GET /api/widgets/registry
  - Display widgets organized by category with search
  - Show widget descriptions, icons, and configuration options
  - Filter by user permissions automatically
  - Click to add widget to current layout
  - _Requirements: 11.1, 11.2, 11.3, 11.4, 11.5, 14.3_

- [ ] 10.3 Add widget management controls
  - Show remove button on each widget in edit mode
  - Add grid span adjustment dropdown (1-12 columns)
  - Confirm removal with dialog
  - Update widget instance via WidgetContext methods
  - Apply changes immediately with optimistic updates
  - _Requirements: 10.4, 10.5, 28.3_

- [ ] 10.4 Implement save and cancel actions
  - Implement save button to persist changes
  - Implement cancel button to revert changes
  - Show loading state during save
  - Show success/error toast notifications
  - Exit edit mode after save
  - _Requirements: 10.5, 28.1, 28.2, 28.3_



## Phase 4: AI Discovery Layer & Documentation (Week 3-4)

- [ ] 11. AI discovery endpoints

- [ ] 11.1 Create master capabilities endpoint
  - Add GET /api/capabilities endpoint
  - Return: available widgets, current user permissions, feature flags, system metadata
  - Include widget categories, layout templates, navigation structure
  - Add comprehensive descriptions for AI understanding
  - Cache response for 5 minutes
  - _Requirements: 16.1, 16.3_

- [ ] 11.2 Enhance widget search with intent matching
  - Extend GET /api/widgets/registry/search endpoint
  - Support natural language queries ("show revenue over time")
  - Match against widget descriptions, tags, and use cases
  - Return relevance scores and usage suggestions
  - Include configuration examples in response
  - _Requirements: 16.2, 16.3_

- [ ] 11.3 Add layout validation and suggestions
  - Create POST /api/dashboard-layouts/validate endpoint
  - Validate widget configurations against schemas
  - Suggest complementary widgets ("revenue-chart works well with date-picker")
  - Check for layout conflicts (grid span exceeding 12 columns)
  - Return warnings and optimization suggestions
  - _Requirements: 20.4, 28.4_

- [ ] 11.4 Add OpenAPI documentation
  - Install @nestjs/swagger
  - Add Swagger decorators to all controllers
  - Generate OpenAPI spec
  - Serve Swagger UI at /api/docs
  - Include request/response examples
  - _Requirements: 16.4, 30.2_

- [ ] 12. Performance optimization

- [ ] 12.1 Implement lazy loading
  - Lazy load widget components with React.lazy
  - Lazy load heavy dependencies (charts, drag-drop)
  - Add Suspense boundaries with loading states
  - _Requirements: 26.1_

- [ ] 12.2 Add caching layer
  - Cache widget registry for 5 minutes
  - Cache layout data for 1 minute
  - Implement cache invalidation on updates
  - _Requirements: 26.2_

- [ ] 12.3 Optimize rendering
  - Memoize DashboardGrid component
  - Memoize WidgetRenderer component
  - Use React.memo for expensive components
  - _Requirements: 26.3_

- [ ] 13. Error handling and accessibility

- [ ] 13.1 Add error handling
  - Display user-friendly error messages for all failure scenarios
  - Add "Retry" button for failed API calls
  - Implement error boundaries
  - Show fallback UI on errors
  - _Requirements: 28.1, 28.2, 28.5_

- [ ] 13.2 Add accessibility features
  - Support Tab navigation through all controls
  - Add ARIA labels to all interactive elements
  - Add screen reader announcements for dynamic updates
  - Verify color contrast in both themes
  - _Requirements: 27.1, 27.2, 27.3, 27.4_

- [ ] 14. Comprehensive documentation

- [ ] 14.1 Create comprehensive steering guide
  - Create `.kiro/steering/dashboard-customization-system.md`
  - Document all 40+ widgets with descriptions and use cases
  - Include "How to add new widgets" guide
  - Document layout creation patterns
  - Add troubleshooting section
  - Include API examples for common tasks
  - _Requirements: 30.1, 30.3, 30.4_

- [ ] 14.2 Document widget development process
  - Create guide for adding new widget types
  - Document widget metadata requirements
  - Include JSDoc comment standards
  - Provide component template and examples
  - Document testing requirements
  - _Requirements: 30.3, 30.4_

- [ ] 14.3 Create API documentation
  - Document all endpoints with examples
  - Include request/response schemas
  - Document authentication requirements
  - Add error response documentation
  - _Requirements: 30.2_

- [ ] 14.4 Create user guide
  - Document how to customize dashboard
  - Document how to use layout editor
  - Include screenshots and examples
  - Add FAQ section
  - _Requirements: 30.3, 30.4_

- [ ] 15. Testing and validation

- [ ]* 15.1 Write backend tests
  - Unit tests for widget-registry.service.ts
  - Unit tests for dashboard-layouts.service.ts
  - E2E tests for widget and layout endpoints
  - Test permission filtering and validation
  - _Requirements: All backend requirements_

- [ ]* 15.2 Write frontend tests
  - Component tests for DashboardGrid and WidgetRenderer
  - Integration tests for WidgetContext
  - Test drag and drop functionality
  - Test layout editor UI components
  - _Requirements: All frontend requirements_

- [ ] 15.3 Integration testing
  - Test complete workflow: discover widgets → create layout → edit layout
  - Test with different user roles and permissions
  - Verify responsive behavior on mobile/tablet/desktop
  - Test theme integration (light/dark mode)
  - _Requirements: All requirements_

- [ ] 16. Final integration and deployment

- [ ] 16.1 Create demo layouts
  - Create sample layouts for different use cases
  - Seed demo data for testing and showcasing
  - Create layouts for: analytics, ecommerce, content management
  - Include variety of widget types and configurations
  - _Requirements: 13.1, 13.2, 15.1, 15.2_

- [ ] 16.2 Final documentation review
  - Review all steering guides for accuracy
  - Update API documentation with final endpoints
  - Create changelog for system updates
  - Document deployment and configuration steps
  - _Requirements: 30.1, 30.2, 30.3, 30.4, 30.5_

- [ ] 16.3 Production readiness check
  - Run Lighthouse audit on dashboard pages
  - Verify all permissions are properly enforced
  - Test error scenarios and recovery
  - Verify accessibility compliance
  - Check performance metrics (<2s load time)
  - _Requirements: 26.4, 26.5, 27.1, 27.2, 27.3, 27.4, 28.1, 28.2_

---

## Success Metrics for AI Agents

### Discoverability
- ✅ AI can understand full system in <5 minutes by reading steering guide
- ✅ AI can discover all widgets via GET /api/capabilities in 1 API call
- ✅ AI can search widgets by intent ("show revenue trends")
- ✅ AI never needs to parse React component code

### Extensibility
- ✅ AI can add new widget in <10 minutes using documented process
- ✅ AI can create custom layout in <5 minutes using declarative API
- ✅ AI can modify existing layouts programmatically
- ✅ System validates AI-generated configurations automatically

### Maintainability
- ✅ Widget auto-discovery keeps registry up-to-date
- ✅ Self-documenting widgets via JSDoc metadata
- ✅ Comprehensive API documentation with examples
- ✅ Clear error messages and validation feedback

## Key Benefits of This Approach

1. **68% Fewer Tasks**: 45 tasks vs 140 in original spec
2. **No Breaking Changes**: Keeps existing navigation and sidebar
3. **Leverages Existing Work**: Uses 40+ widgets already built
4. **AI-First Design**: Optimized for AI agent discoverability
5. **Declarative Configuration**: AI generates JSON, not React code
6. **Self-Documenting**: Widgets include metadata for AI understanding
7. **Production Ready**: Includes testing, performance, and accessibility

## Implementation Notes

- **Start with Phase 1**: Database and widget discovery provide immediate AI value
- **Phase 2 is Core Value**: Layout system enables the main customization feature
- **Phase 3 is User Experience**: Frontend components make it usable
- **Phase 4 is AI Magic**: Discovery layer makes system truly AI-friendly

**Ready to begin implementation!** 🚀
