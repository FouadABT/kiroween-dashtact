# Implementation Plan

- [x] 1. Database Schema, DTOs, and Module Setup




  - Create Prisma migration for Upload model with all fields (id, filename, originalName, mimeType, size, url, path, type enum, category, uploadedById with User relation and cascade delete, visibility enum, allowedRoles array, usedIn JSON, usageCount, altText, title, description, tags array, width, height, createdAt, updatedAt, deletedAt, deletedById)
  - Add indexes on uploadedById, type, visibility, createdAt, and deletedAt fields
  - Add uploads and deletedUploads relations to User model
  - Run `npm run prisma:generate` to generate Prisma client
  - Create `backend/src/uploads/dto/create-upload.dto.ts` with validation decorators for all required and optional fields
  - Create `backend/src/uploads/dto/get-uploads-query.dto.ts` with filters for type, visibility, uploadedBy, date range, search, pagination, and sorting
  - Create `backend/src/uploads/dto/update-upload.dto.ts` with optional fields for title, description, altText, tags, visibility, and allowedRoles
  - Create `backend/src/uploads/dto/bulk-delete.dto.ts` with array of IDs validation
  - Create `backend/src/uploads/dto/bulk-visibility-update.dto.ts` with IDs array, visibility, and optional allowedRoles
  - Create `backend/src/uploads/uploads.module.ts` with service and controller registration
  - Export all DTOs from `backend/src/uploads/dto/index.ts`
  - _Requirements: 1.1, 1.2, 1.3, 1.4, 1.5_

- [x] 2. Backend API Endpoints and Access Control





  - Update `backend/src/uploads/uploads.service.ts` to include create method that saves upload record to database with userId and default PRIVATE visibility
  - Implement findAll method with access control logic (admins see all, PUBLIC visible to all, PRIVATE only to uploader and admins, ROLE_BASED checks user role in allowedRoles array)
  - Implement findOne method with permission check using canAccess helper
  - Implement update method with ownership verification using canEdit helper
  - Implement remove method for soft delete with deletedAt and deletedById
  - Implement bulkDelete method that filters by permissions before deleting
  - Implement bulkUpdateVisibility method that filters by permissions before updating
  - Implement incrementUsage method to track file usage in entities
  - Add helper methods: isAdmin, canAccess, canEdit, canDelete
  - Update `backend/src/uploads/uploads.controller.ts` to add POST endpoint for file upload with database record creation
  - Add GET /uploads endpoint with query filters and pagination
  - Add GET /uploads/:id endpoint with permission check
  - Add PATCH /uploads/:id endpoint for metadata updates
  - Add DELETE /uploads/:id endpoint for soft delete
  - Add POST /uploads/bulk-delete endpoint
  - Add PATCH /uploads/bulk-visibility endpoint
  - Apply JwtAuthGuard and PermissionsGuard to all endpoints
  - Create file serving middleware in `backend/src/uploads/middleware/file-access.middleware.ts` that looks up upload record, checks user permissions based on visibility rules, and returns 403 if access denied
  - Register middleware in uploads module to intercept file serving requests
  - _Requirements: 2.1, 2.2, 2.3, 2.4, 2.5, 2.6, 2.7, 2.8_

- [x] 3. Permissions System Integration





  - Create seed data in `backend/prisma/seed-data/media-permissions.seed.ts` for permissions: media:view, media:view:all, media:upload, media:delete:own, media:delete:all, media:edit:own, media:edit:all
  - Update `backend/prisma/seed.ts` to import and execute media permissions seed
  - Update admin role seed to include all media permissions
  - Update regular user role seed to include media:view and media:upload permissions
  - Run `npm run prisma:seed` to add permissions to database
  - Add RequirePermissions decorator to controller endpoints: media:view for GET endpoints, media:upload for POST upload, media:edit:own or media:edit:all for PATCH endpoints, media:delete:own or media:delete:all for DELETE endpoints
  - Update permissions guard to check media:view:all for viewing all files regardless of ownership
  - Test permission enforcement by attempting operations with different user roles
  - _Requirements: 3.1, 3.2, 3.3, 3.4, 3.5, 3.6, 3.7, 3.8, 3.9_

- [x] 4. Frontend Media Library Interface





  - Create `frontend/src/types/media.ts` with TypeScript interfaces for Upload, UploadType enum, Visibility enum, GetUploadsQuery, GetUploadsResponse, and UpdateUploadDto
  - Create `frontend/src/lib/api/media.ts` with API client functions: getUploads, getUpload, uploadFile, updateUpload, deleteUpload, bulkDelete, bulkUpdateVisibility
  - Create `frontend/src/app/dashboard/media/page.tsx` as main media library page with state management for view mode, filters, selected files, and pagination
  - Create `frontend/src/app/dashboard/media/components/MediaLibraryHeader.tsx` with title, upload button, and grid/list view toggle
  - Create `frontend/src/app/dashboard/media/components/MediaFilters.tsx` with filters for type (all, images, documents, avatars), visibility (all, public, private, role-based), date range picker, uploaded by filter (admin only), search input, and sorting options
  - Create `frontend/src/app/dashboard/media/components/MediaGrid.tsx` to display files in grid layout with responsive columns
  - Create `frontend/src/app/dashboard/media/components/MediaList.tsx` to display files in table layout with columns for preview, filename, type, size, uploaded by, date, visibility, and actions
  - Create `frontend/src/app/dashboard/media/components/MediaCard.tsx` for individual file display with image preview or icon, filename with tooltip, file size, date, visibility badge, and hover actions
  - Create `frontend/src/app/dashboard/media/components/MediaPreviewModal.tsx` with large preview, all metadata display, usage information, and action buttons (edit, copy URL, download, delete)
  - Create `frontend/src/app/dashboard/media/components/MediaEditModal.tsx` with form for title, description, alt text, tags input, visibility selector, role selector (shown when ROLE_BASED), and save/cancel buttons
  - Create `frontend/src/app/dashboard/media/components/MediaUploadArea.tsx` with drag-drop support, file browser, upload progress indicators, and success/error messages
  - Create `frontend/src/app/dashboard/media/components/BulkActionBar.tsx` with checkboxes, select all/deselect all, bulk delete, bulk visibility update, and confirmation dialogs
  - Create `frontend/src/app/dashboard/media/components/index.ts` to export all components
  - Use shadcn/ui components: Card, Button, Dialog, Select, Input, Badge, Tabs, DropdownMenu, Checkbox, Progress, Separator
  - Implement loading states with skeleton loaders
  - Implement empty states with helpful messages
  - Add toast notifications for success and error messages
  - Ensure mobile responsive design with collapsible filters and single-column grid on small screens
  - _Requirements: 4.1, 4.2, 4.3, 4.4, 4.5, 4.6, 4.7, 4.8, 4.9, 4.10_

- [x] 5. Advanced Features and System Integration





  - Create usage tracking helper in `backend/src/uploads/helpers/usage-tracker.ts` that calls uploadsService.incrementUsage when files are referenced
  - Update products service to call usage tracker when product images are saved
  - Update blog service to call usage tracker when blog post images are saved
  - Update users service to call usage tracker when user avatar is updated
  - Add usage count check in uploads service remove method to warn if file is in use
  - Create dashboard menu item in `backend/prisma/seed-data/dashboard-menus.seed.ts` for Media Library with icon, route /dashboard/media, and permission media:view
  - Create storage usage widget component in `frontend/src/components/dashboard/StorageUsageWidget.tsx` showing total storage, breakdown by type, and per-user stats for admins
  - Add storage usage widget to dashboard page
  - Create orphaned files detection script in `backend/src/uploads/scripts/detect-orphaned-files.ts` that compares filesystem with database records
  - Create cleanup functionality in uploads service for admins to remove orphaned files
  - Add admin section in media library for viewing soft-deleted files with restore and permanent delete options
  - Create migration script in `backend/src/uploads/scripts/migrate-existing-uploads.ts` to scan filesystem and create database records for existing files with default visibility PRIVATE
  - Update metadata config in `frontend/src/lib/metadata-config.ts` to add Media Library page metadata
  - _Requirements: 5.1, 5.2, 5.3, 5.4, 5.5, 5.6, 5.7, 5.8, 5.9, 5.10_
