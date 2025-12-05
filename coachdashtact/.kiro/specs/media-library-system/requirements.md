# Requirements Document

## Introduction

The Media Library System provides comprehensive file management capabilities for the full-stack application. The system tracks all file uploads in a database, implements role-based access control with three visibility levels (PUBLIC, PRIVATE, ROLE_BASED), and provides a complete media management interface. Users can upload, organize, search, filter, and manage files with metadata including tags, descriptions, and usage tracking. The system enforces access control at both the API and file-serving levels, supports soft deletion for recovery, and provides bulk operations for efficient management.

## Glossary

- **Upload_System**: The backend NestJS service responsible for file storage and database record management
- **Media_Library_UI**: The frontend Next.js interface for browsing and managing uploaded files
- **Access_Control_Layer**: The middleware that enforces visibility rules before serving files
- **Upload_Record**: A database entry tracking file metadata, ownership, and access permissions
- **Visibility_Level**: An enum defining who can access a file (PUBLIC, PRIVATE, ROLE_BASED)
- **Soft_Delete**: Marking files as deleted without removing them from storage for potential recovery
- **Usage_Tracking**: Recording where and how many times a file is referenced in the application
- **Bulk_Operation**: An action performed on multiple files simultaneously

## Requirements

### Requirement 1: Database Schema and Core Models

**User Story:** As a system architect, I want a comprehensive database schema for tracking all file uploads, so that every file in the system has proper metadata, ownership, and access control information.

#### Acceptance Criteria

1. WHEN the Prisma schema is updated, THE Upload_System SHALL include a model with fields for unique identifier, generated filename, original filename, MIME type, file size in bytes, public URL, filesystem path, upload type enum with values IMAGE, DOCUMENT, AVATAR, and EDITOR_IMAGE, optional category string, uploaded by user identifier with relation to User model, visibility enum with values PUBLIC, PRIVATE, and ROLE_BASED, array of allowed role identifiers for role-based access, optional usage tracking field, usage count integer defaulting to zero, optional alt text, optional title, optional description, array of tags, optional width integer, optional height integer, created timestamp, updated timestamp, deleted at timestamp, and deleted by user identifier.

2. WHEN the Upload model is defined, THE Upload_System SHALL create indexes on uploaded by user field, type field, visibility field, created at field, and deleted at field.

3. WHEN the User model is updated, THE Upload_System SHALL add a relation field named uploads that references the Upload model with cascade delete behavior.

4. WHEN DTOs are created, THE Upload_System SHALL include data transfer objects for querying uploads with filters, creating uploads with required fields, updating upload metadata, bulk delete operations, and bulk visibility updates.

5. WHEN the uploads module is created, THE Upload_System SHALL include service layer, controller layer, and proper dependency injection configuration.

### Requirement 2: Backend API and Access Control

**User Story:** As a backend developer, I want comprehensive API endpoints with role-based access control, so that users can manage their files while administrators have full system access.

#### Acceptance Criteria

1. WHEN a file is uploaded through any endpoint, THE Upload_System SHALL create a database record with the current user as uploaded by, default visibility set to PRIVATE, and all file metadata captured.

2. WHEN a GET request is made to retrieve uploads, THE Upload_System SHALL filter results based on user permissions where super admins and admins see all files, PUBLIC files are visible to everyone, PRIVATE files are visible only to uploader and admins, and ROLE_BASED files are visible only to users whose role identifier is in the allowed roles array.

3. WHEN a GET request is made for a single upload by identifier, THE Upload_System SHALL verify the requesting user has permission to access the file based on visibility rules and return 403 Forbidden if access is denied.

4. WHEN a PATCH request is made to update upload metadata, THE Upload_System SHALL verify the requesting user is the file owner or an admin and update fields including title, description, alt text, tags, visibility, and allowed roles.

5. WHEN a DELETE request is made for an upload, THE Upload_System SHALL perform a soft delete by setting deleted at timestamp and deleted by user identifier if the requesting user is the file owner or an admin.

6. WHEN a POST request is made for bulk delete, THE Upload_System SHALL verify permissions for each file and perform soft delete on all files the user has permission to delete.

7. WHEN a PATCH request is made for bulk visibility update, THE Upload_System SHALL verify the requesting user owns all specified files or is an admin and update visibility settings for all files.

8. WHEN file serving middleware receives a request, THE Access_Control_Layer SHALL look up the upload record, verify the requesting user has access based on visibility rules, and return 403 Forbidden if access is denied or serve the file if access is granted.

### Requirement 3: Permissions and Role Integration

**User Story:** As a system administrator, I want granular permissions for media library operations, so that I can control which users can view, upload, edit, and delete files.

#### Acceptance Criteria

1. WHEN permissions are seeded, THE Upload_System SHALL create permission entries for media view, media view all, media upload, media delete own, media delete all, media edit own, and media edit all.

2. WHEN a user attempts to access the media library page, THE Upload_System SHALL verify the user has media view permission.

3. WHEN a user attempts to view all files regardless of ownership, THE Upload_System SHALL verify the user has media view all permission.

4. WHEN a user attempts to upload a file, THE Upload_System SHALL verify the user has media upload permission.

5. WHEN a user attempts to delete their own file, THE Upload_System SHALL verify the user has media delete own permission.

6. WHEN a user attempts to delete any file, THE Upload_System SHALL verify the user has media delete all permission.

7. WHEN a user attempts to edit their own file metadata, THE Upload_System SHALL verify the user has media edit own permission.

8. WHEN a user attempts to edit any file metadata, THE Upload_System SHALL verify the user has media edit all permission.

9. WHEN roles are seeded, THE Upload_System SHALL assign all media permissions to admin role and assign media view and media upload permissions to regular user roles.

### Requirement 4: Frontend Media Library Interface

**User Story:** As a user, I want an intuitive media library interface with filtering, searching, and bulk operations, so that I can efficiently manage my uploaded files.

#### Acceptance Criteria

1. WHEN the media library page loads, THE Media_Library_UI SHALL display a header with title, upload button, and view toggle between grid and list views.

2. WHEN the filter sidebar is displayed, THE Media_Library_UI SHALL show filters for type with options all, images, documents, and avatars, visibility with options all, public, private, and role-based, date range picker, uploaded by filter visible only to admins, and search input for filename, tags, and description.

3. WHEN grid view is selected, THE Media_Library_UI SHALL display file cards with image preview or file type icon, filename truncated with tooltip, file size in human readable format, uploaded date in relative time, visibility badge with color coding, and hover actions for preview, edit, copy URL, and delete.

4. WHEN list view is selected, THE Media_Library_UI SHALL display a table with columns for preview thumbnail, filename, type, size, uploaded by visible to admins, uploaded date, visibility, and actions.

5. WHEN a file is clicked, THE Media_Library_UI SHALL open a preview modal showing large image preview or file icon, all metadata including filename, original name, type, size, dimensions for images, uploaded by user with avatar, uploaded date, visibility status, tags as badges, title, description, usage information, and action buttons for edit metadata, copy URL, download, and delete.

6. WHEN the edit metadata button is clicked, THE Media_Library_UI SHALL open a modal with form fields for title, description, alt text for images, tags input with add and remove, visibility selector, role selector shown only when ROLE_BASED is selected, and save and cancel buttons.

7. WHEN files are uploaded through the media library, THE Media_Library_UI SHALL show upload progress for each file, display success or error messages, and automatically refresh the file list after successful uploads.

8. WHEN bulk selection mode is activated, THE Media_Library_UI SHALL show checkboxes on each file card, select all and deselect all buttons, bulk action bar with options to delete selected or change visibility of selected files, and confirmation dialogs for destructive actions.

9. WHEN sorting is applied, THE Media_Library_UI SHALL allow sorting by date uploaded, file size, filename, and type with ascending and descending order options.

10. WHEN no files exist, THE Media_Library_UI SHALL display an empty state with helpful message and upload button.

### Requirement 5: Advanced Features and Integration

**User Story:** As a system administrator, I want advanced features including usage tracking, storage analytics, orphaned file detection, and soft delete management, so that I can maintain a clean and efficient media library system.

#### Acceptance Criteria

1. WHEN a file is referenced in products, blog posts, user avatars, or other entities, THE Upload_System SHALL update the usedIn field and increment the usage count.

2. WHEN a file preview is displayed, THE Media_Library_UI SHALL show usage information indicating where the file is used.

3. WHEN a user attempts to delete a file with usage count greater than zero, THE Media_Library_UI SHALL display a warning message and require confirmation.

4. WHEN the dashboard menu is rendered, THE Media_Library_UI SHALL display a Media Library menu item with appropriate icon accessible to users with media view permission.

5. WHEN a storage usage widget is displayed, THE Media_Library_UI SHALL show total storage used, storage by file type breakdown, and storage per user for admins.

6. WHEN orphaned file detection runs, THE Upload_System SHALL identify files in filesystem not in database and files in database marked as deleted but still in filesystem.

7. WHEN an admin accesses cleanup functionality, THE Upload_System SHALL provide options to remove orphaned files from filesystem or permanently delete soft-deleted files from database.

8. WHEN files are soft deleted, THE Upload_System SHALL exclude them from normal queries but retain them in database with deleted at timestamp and deleted by user identifier.

9. WHEN an admin accesses the deleted files section, THE Media_Library_UI SHALL display all soft-deleted files with options to restore or permanently delete.

10. WHEN existing uploads in filesystem are migrated, THE Upload_System SHALL create corresponding database records with default values for visibility set to PRIVATE and uploaded by set to system user if original uploader cannot be determined.
