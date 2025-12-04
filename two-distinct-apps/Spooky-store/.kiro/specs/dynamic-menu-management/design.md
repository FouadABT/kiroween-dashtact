# Design Document

## Overview

The Dynamic Dashboard Menu Management System provides a database-driven approach to managing dashboard navigation. It replaces hardcoded menu structures with a flexible, configurable system that supports role-based visibility, permission control, and multiple page rendering strategies. The system integrates with existing dashboard customization features while maintaining backward compatibility.

## Architecture

### High-Level Architecture

The system follows a three-tier architecture with clear separation between data storage, business logic, and presentation:

**Database Layer**: Prisma schema with DashboardMenu table storing menu configuration
**Backend Layer**: NestJS module with services for menu CRUD operations and permission filtering
**Frontend Layer**: React components for sidebar rendering and super admin management interface

### Integration Points

**Dashboard Layouts**: Links to existing DashboardLayout table via pageIdentifier for widget-based pages
**Widget Registry**: Filters available widgets based on page configuration
**Permission System**: Validates user permissions against menu requirements
**Feature Flags**: Checks EcommerceSettings and other feature flags for visibility
**Routing System**: Dynamically renders pages based on menu configuration

## Components and Interfaces

### Database Schema

**DashboardMenu Table**:
- id: String (UUID primary key)
- key: String (unique identifier like main-dashboard, ecommerce-orders)
- label: String (display name like Dashboard, Orders)
- icon: String (Lucide icon name)
- route: String (URL path like /dashboard, /dashboard/ecommerce/orders)
- order: Int (display order, lower numbers first)
- parentId: String (nullable, references parent menu item)
- pageType: Enum (WIDGET_BASED, HARDCODED, CUSTOM, EXTERNAL)
- pageIdentifier: String (nullable, links to DashboardLayout for widget pages)
- componentPath: String (nullable, file path for hardcoded pages)
- isActive: Boolean (whether menu is visible)
- requiredPermissions: String array (permissions needed to view)
- requiredRoles: String array (roles needed to view)
- featureFlag: String (nullable, feature flag key to check)
- description: String (nullable, tooltip text)
- badge: String (nullable, badge text or count)
- createdAt: DateTime
- updatedAt: DateTime
- children: DashboardMenu array (relation to child items)
- parent: DashboardMenu (relation to parent item)

**PageType Enum**:
- WIDGET_BASED: Renders DashboardGrid with customizable widgets
- HARDCODED: Renders traditional React component
- CUSTOM: Hybrid approach with special logic
- EXTERNAL: Opens external URL

### Backend Module Structure

**DashboardMenusModule**:
- Imports: PrismaModule, PermissionsModule, EcommerceSettingsModule
- Controllers: DashboardMenusController
- Services: DashboardMenusService, MenuFilterService
- Exports: DashboardMenusService

**DashboardMenusService**:
- findUserMenus(userId): Fetches filtered menus for specific user
- findAll(): Fetches all menus for super admin
- create(dto): Creates new menu item
- update(id, dto): Updates existing menu item
- delete(id): Removes menu item
- reorder(items): Updates order values for multiple items
- toggleActive(id): Toggles isActive status

**MenuFilterService**:
- filterByRole(menus, userRoles): Filters menus by role requirements
- filterByPermission(menus, userPermissions): Filters by permission requirements
- filterByFeatureFlags(menus, settings): Filters by feature flag status
- buildHierarchy(flatMenus): Converts flat list to nested structure
- sortByOrder(menus): Sorts menus by order value

### Frontend Components

**Sidebar Component** (Enhanced):
- Fetches user-specific menus from API
- Renders nested menu structure
- Handles expand/collapse for parent items
- Highlights active route
- Displays icons and badges
- Supports keyboard navigation

**MenuManagementPage** (New):
- Super admin only access
- Tree view of all menu items
- Create/Edit/Delete operations
- Drag-and-drop reordering
- Form for menu configuration
- Preview of menu structure
- Validation and error handling

**MenuItemForm** (New):
- Input fields for all menu properties
- Icon picker component
- Page type selector with conditional fields
- Permission multi-select
- Role multi-select
- Feature flag selector
- Parent menu selector
- Validation logic

**DynamicPageRenderer** (New):
- Reads menu configuration for current route
- Renders DashboardGrid for WIDGET_BASED pages
- Renders component for HARDCODED pages
- Handles CUSTOM page logic
- Enforces permission checks
- Shows loading and error states

### API Endpoints

**GET /api/dashboard-menus/user-menus**:
- Returns filtered menus for authenticated user
- Applies role, permission, and feature flag filters
- Returns nested hierarchy
- Public to authenticated users

**GET /api/dashboard-menus**:
- Returns all menu items
- Super admin only
- Includes inactive items
- Returns flat list with parent references

**POST /api/dashboard-menus**:
- Creates new menu item
- Super admin only
- Validates all required fields
- Returns created menu with ID

**PATCH /api/dashboard-menus/:id**:
- Updates existing menu item
- Super admin only
- Partial updates supported
- Validates changes

**DELETE /api/dashboard-menus/:id**:
- Deletes menu item
- Super admin only
- Cascades to children or prevents if children exist
- Returns success status

**PATCH /api/dashboard-menus/reorder**:
- Updates order values for multiple items
- Super admin only
- Accepts array of id and order pairs
- Returns updated items

**PATCH /api/dashboard-menus/:id/toggle**:
- Toggles isActive status
- Super admin only
- Returns updated menu item

## Data Models

### DTOs

**CreateMenuDto**:
- key: string (required, unique)
- label: string (required)
- icon: string (required)
- route: string (required)
- order: number (required)
- parentId: string (optional)
- pageType: PageType enum (required)
- pageIdentifier: string (conditional)
- componentPath: string (conditional)
- isActive: boolean (default true)
- requiredPermissions: string array (optional)
- requiredRoles: string array (optional)
- featureFlag: string (optional)
- description: string (optional)
- badge: string (optional)

**UpdateMenuDto**:
- All fields from CreateMenuDto but optional
- Partial updates supported

**ReorderMenuDto**:
- items: array of objects with id and order

**MenuResponseDto**:
- All fields from database
- children: nested MenuResponseDto array
- Excludes sensitive internal fields

### Frontend Types

**MenuItem**:
- Matches MenuResponseDto structure
- Used for sidebar rendering
- Includes computed properties like isActive route match

**MenuFormData**:
- Form state for menu creation/editing
- Includes validation state
- Matches CreateMenuDto structure

**PageConfig**:
- Extracted from menu item for page rendering
- pageType, pageIdentifier, componentPath
- Used by DynamicPageRenderer

## Error Handling

### Backend Errors

**Validation Errors**:
- Invalid page type and identifier combinations
- Missing required fields
- Duplicate keys
- Invalid parent references
- Returns 400 Bad Request with details

**Authorization Errors**:
- Non-super admin attempting write operations
- Returns 403 Forbidden

**Not Found Errors**:
- Menu item ID not found
- Parent ID not found
- Returns 404 Not Found

**Database Errors**:
- Constraint violations
- Connection issues
- Returns 500 Internal Server Error

### Frontend Error Handling

**API Errors**:
- Display toast notifications
- Show inline form errors
- Maintain form state on error
- Provide retry options

**Permission Errors**:
- Redirect to dashboard
- Show access denied message
- Log security events

**Loading States**:
- Skeleton loaders for menus
- Loading spinners for operations
- Optimistic updates where safe

## Testing Strategy

### Backend Tests

**Unit Tests**:
- DashboardMenusService CRUD operations
- MenuFilterService filtering logic
- Permission validation
- Feature flag checking
- Hierarchy building

**Integration Tests**:
- API endpoint responses
- Database operations
- Permission enforcement
- Role-based filtering

**E2E Tests**:
- Complete menu management workflow
- User menu fetching with different roles
- Page rendering based on menu config
- Permission boundary testing

### Frontend Tests

**Component Tests**:
- Sidebar rendering with various menu structures
- MenuManagementPage CRUD operations
- MenuItemForm validation
- DynamicPageRenderer page type handling

**Integration Tests**:
- Menu fetching and rendering flow
- Create/edit/delete workflows
- Drag-and-drop reordering
- Permission-based visibility

**Accessibility Tests**:
- Keyboard navigation
- Screen reader support
- Focus management
- ARIA attributes

## Migration Strategy

### Phase 1: Database Setup
- Create DashboardMenu table via Prisma migration
- Add PageType enum
- Create indexes for performance

### Phase 2: Seed Existing Menus
- Create seed script to populate current menu structure
- Map existing routes to menu items
- Assign appropriate page types
- Set permissions based on current guards
- Maintain current ordering

### Phase 3: Backend Implementation
- Implement DashboardMenusModule
- Create service layer
- Build API endpoints
- Add permission guards
- Write tests

### Phase 4: Frontend Integration
- Enhance Sidebar component
- Create DynamicPageRenderer
- Update routing configuration
- Test with existing pages

### Phase 5: Admin Interface
- Build MenuManagementPage
- Create MenuItemForm
- Implement drag-and-drop
- Add validation

### Phase 6: Widget Integration
- Link widget availability to pages
- Filter widget library by page
- Update widget registry

### Phase 7: Testing and Rollout
- Comprehensive testing
- Performance optimization
- Documentation
- Gradual rollout to users

## Performance Considerations

### Caching Strategy
- Cache user menu structure in frontend
- Invalidate on permission changes
- Cache menu hierarchy on backend
- Use Redis for distributed caching

### Database Optimization
- Index on userId, isActive, order
- Eager load children for hierarchy
- Limit nesting depth to prevent deep recursion
- Use database views for common queries

### Frontend Optimization
- Memoize menu rendering
- Lazy load menu management interface
- Virtualize long menu lists
- Debounce reorder operations

## Security Considerations

### Authorization
- All write operations require super admin role
- Read operations validate user authentication
- Permission checks on both frontend and backend
- Audit log for menu changes

### Input Validation
- Sanitize all string inputs
- Validate enum values
- Check route format
- Prevent XSS in labels and descriptions
- Validate icon names against allowed list

### Data Protection
- No sensitive data in menu configuration
- Encrypt feature flag values if needed
- Rate limit API endpoints
- Prevent menu enumeration attacks
