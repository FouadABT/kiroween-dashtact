# Implementation Plan - Dynamic Menu Management System

## Overview

This implementation plan creates a database-driven menu management system that allows super administrators to dynamically control dashboard navigation without code changes. The system supports role-based visibility, permission control, feature flags, and flexible page rendering strategies (widget-based or hardcoded).

**Key Features**:
- Database-driven menu configuration
- Super admin-only menu management interface
- Role and permission-based visibility
- Support for widget-based and hardcoded pages
- Feature flag integration
- Hierarchical menu structure with unlimited nesting

**Scope**: 18 tasks
**Estimated Time**: 2-3 weeks
**Risk Level**: MEDIUM (requires careful migration of existing menus)

---

## Phase 1: Database and Backend Foundation

- [x] 1. Database schema and migration







- [x] 1.1 Create DashboardMenu Prisma model

  - Add DashboardMenu model with fields: id, key, label, icon, route, order, parentId, pageType, pageIdentifier, componentPath, isActive, requiredPermissions, requiredRoles, featureFlag, description, badge, createdAt, updatedAt
  - Add PageType enum: WIDGET_BASED, HARDCODED, CUSTOM, EXTERNAL
  - Add self-referential relation for parent-child hierarchy
  - Add indexes on key (unique), isActive, order, parentId
  - _Requirements: 1.1, 1.2, 1.3, 1.4, 1.5, 2.1, 2.2, 2.3, 2.4_


- [x] 1.2 Run database migration

  - Generate migration with `npm run prisma:migrate` in backend
  - Generate Prisma client with `npm run prisma:generate`
  - Verify schema in Prisma Studio
  - _Requirements: 1.1, 1.5_

- [x] 2. Seed existing menu structure





- [x] 2.1 Create menu seed script


  - Create `backend/prisma/seed-data/dashboard-menus.seed.ts`
  - Seed Dashboard menu (WIDGET_BASED, pageIdentifier: main-dashboard)
  - Seed Analytics menu (WIDGET_BASED, pageIdentifier: analytics-dashboard)
  - Seed E-commerce parent menu with children: Products, Orders, Customers, Inventory (all HARDCODED)
  - Seed Pages, Blog, Settings menus (HARDCODED)
  - Assign appropriate permissions and roles to each menu
  - Set order values to maintain current sequence
  - _Requirements: 8.1, 8.2, 8.3, 8.4, 8.5, 8.6, 8.7, 8.8_


- [x] 2.2 Run seed script

  - Execute `npm run prisma:seed` in backend
  - Verify menus in Prisma Studio
  - Test menu hierarchy structure
  - _Requirements: 8.1, 8.8_

- [x] 3. Backend module setup






- [x] 3.1 Create dashboard-menus module structure

  - Create `backend/src/dashboard-menus/` directory
  - Create dashboard-menus.module.ts
  - Create dashboard-menus.service.ts
  - Create dashboard-menus.controller.ts
  - Create menu-filter.service.ts
  - Create dto/ directory
  - Register module in app.module.ts
  - _Requirements: 14.1, 14.2, 14.3, 15.3_

- [x] 3.2 Create DTOs


  - Create CreateMenuDto with validation decorators
  - Create UpdateMenuDto with partial validation
  - Create ReorderMenuDto for bulk reordering
  - Create MenuResponseDto for API responses
  - Create MenuFiltersDto for query parameters
  - _Requirements: 14.3, 14.4, 14.5, 14.6_

- [x] 4. Menu filtering service





- [x] 4.1 Implement filtering logic


  - Implement filterByRole() to check user roles against requiredRoles
  - Implement filterByPermission() to validate user permissions
  - Implement filterByFeatureFlags() to check EcommerceSettings
  - Implement buildHierarchy() to convert flat list to nested structure
  - Implement sortByOrder() to sort menus by order value
  - Handle cascading visibility for parent-child relationships
  - _Requirements: 3.1, 3.2, 3.3, 3.4, 3.5, 4.1, 4.2, 4.3, 4.4, 4.5, 5.1, 5.2, 5.3, 5.4, 5.5_

- [x] 5. CRUD API endpoints






- [x] 5.1 Implement user-facing endpoints


  - Add GET /api/dashboard-menus/user-menus endpoint (filtered for current user)
  - Apply role, permission, and feature flag filtering
  - Return nested hierarchy structure
  - Cache response for performance
  - _Requirements: 14.1, 9.1_

- [x] 5.2 Implement admin endpoints


  - Add GET /api/dashboard-menus endpoint (super admin only, all menus)
  - Add POST /api/dashboard-menus endpoint (super admin only, create menu)
  - Add PATCH /api/dashboard-menus/:id endpoint (super admin only, update menu)
  - Add DELETE /api/dashboard-menus/:id endpoint (super admin only, delete menu)
  - Add PATCH /api/dashboard-menus/reorder endpoint (super admin only, bulk reorder)
  - Add PATCH /api/dashboard-menus/:id/toggle endpoint (super admin only, toggle isActive)
  - Apply JwtAuthGuard and super admin role guard to all admin endpoints
  - Add proper error handling and validation
  - _Requirements: 14.2, 14.3, 14.4, 14.5, 14.6, 14.7, 7.3, 7.4, 7.5, 7.6, 13.2, 13.3_

- [x] 6. Permission integration





- [x] 6.1 Add menu management permissions


  - Add to `backend/prisma/seed-data/auth.seed.ts`:
    - menus:view (View menu management interface)
    - menus:create (Create new menus)
    - menus:update (Edit existing menus)
    - menus:delete (Delete menus)
  - Assign all menu permissions to Super Admin role only
  - _Requirements: 4.4, 4.5, 7.1, 14.7_

- [x] 6.2 Create permission migration script


  - Create `backend/scripts/grant-menu-permissions.ts`
  - Grant menu management permissions to existing super admins
  - Verify permission assignments
  - _Requirements: 7.1, 14.7_

- [x] 6.3 Run permission seed


  - Execute `npm run prisma:seed` in backend
  - Run migration script for existing super admins
  - Verify permissions in Prisma Studio
  - _Requirements: 7.1, 14.7_

## Phase 2: Frontend Integration

- [x] 7. Frontend types and API client







- [x] 7.1 Create TypeScript types

  - Create `frontend/src/types/menu.ts`
  - Define MenuItem interface matching MenuResponseDto
  - Define MenuFormData type for form state
  - Define PageConfig type for page rendering
  - Define PageType enum matching backend
  - _Requirements: 15.1, 15.2, 15.5, 15.6_


- [x] 7.2 Create API client methods

  - Add menu API methods to `frontend/src/lib/api.ts`
  - Add getUserMenus() method
  - Add getAllMenus() method (super admin only)
  - Add createMenu() method
  - Add updateMenu() method
  - Add deleteMenu() method
  - Add reorderMenus() method
  - Add toggleMenuActive() method
  - _Requirements: 15.1, 15.2_

- [x] 8. Enhanced Sidebar component





- [x] 8.1 Update Sidebar to use dynamic menus


  - Modify `frontend/src/components/dashboard/Sidebar.tsx`
  - Fetch menus from GET /api/dashboard-menus/user-menus
  - Replace hardcoded menu structure with API data
  - Implement nested menu rendering with expand/collapse
  - Add active route highlighting based on current path
  - Display icons using Lucide icon names from config
  - Render badges when configured
  - Add loading skeleton while fetching
  - Handle empty menu state gracefully
  - _Requirements: 9.1, 9.2, 9.3, 9.4, 9.5, 9.6, 6.1, 6.2, 6.3, 6.4, 12.4, 12.5_

- [x] 9. Dynamic page renderer





- [x] 9.1 Create DynamicPageRenderer component


  - Create `frontend/src/components/dashboard/DynamicPageRenderer.tsx`
  - Fetch menu config for current route from API
  - Render DashboardGrid with pageIdentifier for WIDGET_BASED pages
  - Render component from componentPath for HARDCODED pages
  - Support CUSTOM page type with hybrid logic
  - Enforce permission checks before rendering
  - Show loading state while fetching config
  - Display error state for unauthorized or missing pages
  - _Requirements: 10.1, 10.2, 10.3, 10.4, 10.5, 2.5, 2.6_

## Phase 3: Menu Management Interface

- [x] 10. Menu management page


- [x] 10.1 Create MenuManagementPage component








  - Create `frontend/src/app/dashboard/settings/menus/page.tsx`
  - Add super admin role guard
  - Fetch all menus from API
  - Display menus in hierarchical tree view
  - Show menu metadata (type, permissions, status, order)
  - Add create new menu button
  - Add edit button for each menu item
  - Add delete button with confirmation dialog
  - Add toggle active/inactive button
  - Implement search and filter functionality
  - _Requirements: 7.1, 7.2, 7.3, 7.4, 7.5, 7.6, 7.8, 13.3_

- [x] 11. Menu item form





- [x] 11.1 Create MenuItemForm component


  - Create `frontend/src/components/admin/MenuItemForm.tsx`
  - Add input fields: key, label, icon, route, description, badge, order
  - Implement icon picker with Lucide icon preview
  - Add page type selector (WIDGET_BASED, HARDCODED, CUSTOM, EXTERNAL)
  - Show pageIdentifier field conditionally for WIDGET_BASED
  - Show componentPath field conditionally for HARDCODED
  - Add permission multi-select with existing permissions
  - Add role multi-select with available roles
  - Add feature flag selector
  - Add parent menu selector for nested items
  - Implement client-side validation
  - Show validation errors inline
  - _Requirements: 7.3, 7.4, 7.8, 2.5, 2.6, 12.1, 12.2_

- [x] 12. Drag-and-drop reordering





- [x] 12.1 Implement drag-and-drop


  - Install @dnd-kit/core, @dnd-kit/sortable, @dnd-kit/utilities
  - Add drag-and-drop to MenuManagementPage
  - Support reordering within same level
  - Support moving items between parent menus
  - Update order values on drop
  - Call reorder API endpoint
  - Show optimistic UI updates
  - Handle reorder errors gracefully
  - _Requirements: 6.5, 7.7_


- [x] 13. Widget availability configuration







- [x] 13.1 Add widget filtering by page


  - Add availableWidgets field to DashboardMenu schema (optional)
  - Update widget registry to filter by pageIdentifier
  - Modify WidgetLibrary component to show only available widgets
  - Add widget selector in MenuItemForm for WIDGET_BASED pages
  - Default to all widgets if no restrictions configured
  - Validate widget availability when adding to layouts
  - _Requirements: 11.1, 11.2, 11.3, 11.4, 11.5_

## Phase 4: Testing and Documentation

- [x] 14. Backend testing










- [x]* 14.1 Write service tests

  - Unit tests for dashboard-menus.service.ts
  - Unit tests for menu-filter.service.ts
  - Test CRUD operations
  - Test permission enforcement
  - Test role-based filtering
  - Test feature flag integration
  - Test hierarchy building
  - Test error handling
  - _Requirements: All backend requirements_


- [x]* 14.2 Write API tests

  - Integration tests for all endpoints
  - Test super admin guards
  - Test permission validation
  - Test menu filtering logic
  - Test cascade delete behavior
  - _Requirements: All backend requirements_


- [x]* 15. Frontend testing






- [x]* 15.1 Write component tests


  - Test enhanced Sidebar component
  - Test MenuManagementPage component
  - Test MenuItemForm component
  - Test DynamicPageRenderer component
  - Test drag-and-drop reordering
  - Test form validation
  - Test API integration
  - Test permission-based visibility
  - _Requirements: All frontend requirements_

- [x]* 15.2 Write accessibility tests


  - Test keyboard navigation
  - Test screen reader support
  - Test focus management
  - Test ARIA attributes
  - _Requirements: All frontend requirements_

- [ ] 16. Integration testing

- [x] 16.1 Test complete workflows




  - Test menu creation workflow
  - Test menu editing and deletion
  - Test user menu fetching with different roles
  - Test page rendering for all page types
  - Test permission boundary enforcement
  - Test feature flag toggling effects
  - Test nested menu expand/collapse
  - Test reordering persistence
  - _Requirements: 15.1, 15.2, 15.3, 15.4, 15.5, 15.6_

- [ ] 17. Documentation

- [ ] 17.1 Create system documentation
  - Document menu management architecture in design.md
  - Create super admin user guide
  - Document API endpoints with examples
  - Add inline code comments
  - Update existing documentation references
  - _Requirements: All requirements_

- [ ] 17.2 Create migration guide
  - Document migration from hardcoded to dynamic menus
  - Provide rollback instructions
  - Document permission requirements
  - Add troubleshooting section
  - _Requirements: All requirements_

- [ ] 18. Deployment and rollout

- [ ] 18.1 Prepare for production
  - Review all code changes
  - Run full test suite
  - Verify database migrations
  - Test with production-like data
  - Create deployment checklist
  - _Requirements: All requirements_

- [ ] 18.2 Execute rollout
  - Deploy database migrations
  - Deploy backend changes
  - Deploy frontend changes
  - Monitor for errors
  - Verify menu functionality
  - Collect feedback from super admins
  - _Requirements: All requirements_
