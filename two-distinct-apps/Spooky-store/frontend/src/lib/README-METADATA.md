# Page Metadata System - Core Infrastructure

## Overview

This directory contains the core infrastructure for the Page Metadata and Breadcrumb Navigation System.

## Files Created

### 1. Type Definitions (`/types/metadata.ts`)

Comprehensive TypeScript interfaces for:
- **PageMetadata**: Complete page metadata configuration
- **OpenGraphMetadata**: Social media sharing metadata
- **TwitterMetadata**: Twitter Card configuration
- **RobotsMetadata**: Search engine directives
- **BreadcrumbConfig**: Breadcrumb configuration per route
- **BreadcrumbItem**: Navigation breadcrumb items
- **MetadataContextValue**: Client-side context interface

### 2. Metadata Configuration (`/lib/metadata-config.ts`)

Centralized configuration including:
- **defaultMetadata**: Fallback metadata for all pages
- **metadataConfig**: Route-specific metadata definitions
- **getMetadataForPath()**: Retrieve metadata for any route
- **resolveMetadataTemplate()**: Replace dynamic placeholders

## Features

### Extensible Schema
The `PageMetadata` interface uses `[key: string]: unknown` to allow custom fields beyond standard SEO tags.

### Dynamic Values
Template strings with `{placeholder}` syntax support dynamic content:
```typescript
title: 'User: {userName}'
breadcrumb: { label: '{userName}', dynamic: true }
```

### Route Patterns
Supports both exact matches and dynamic route patterns:
- Exact: `/dashboard/users`
- Dynamic: `/dashboard/users/:id`

### Default Fallback
All routes inherit from `defaultMetadata` and can override specific fields.

## Configured Routes

### Authentication
- `/login` - Login page (noindex)
- `/signup` - Sign up page (noindex)
- `/forgot-password` - Password reset (noindex)

### Dashboard
- `/dashboard` - Main dashboard
- `/dashboard/analytics` - Analytics page
- `/dashboard/data` - Data management
- `/dashboard/settings` - Settings
- `/dashboard/settings/theme` - Theme customization

### User Management
- `/dashboard/users` - User list
- `/dashboard/users/:id` - User details (dynamic)
- `/dashboard/users/:id/edit` - Edit user (dynamic)

### Other Pages
- `/dashboard/permissions` - Permissions management
- `/dashboard/widgets` - Widget gallery
- `/dashboard/design-system` - Design system showcase
- Error pages: `/403`, `/404`, `/500`

## Usage Example

```typescript
import { getMetadataForPath, resolveMetadataTemplate } from '@/lib/metadata-config';

// Get metadata for a route
const metadata = getMetadataForPath('/dashboard/users');

// Resolve dynamic values
const resolved = resolveMetadataTemplate(metadata, {
  userName: 'John Doe',
  userId: '123'
});

console.log(resolved.title); // "User: John Doe"
```

## Requirements Satisfied

- ✅ **Requirement 1.1**: Configuration object for all routes
- ✅ **Requirement 1.5**: Default fallback metadata
- ✅ **Requirement 5.3**: TypeScript interfaces for type safety

## Next Steps

The following components will be built on this infrastructure:
1. Metadata helper functions (Task 2)
2. Breadcrumb system (Task 3)
3. MetadataContext for client updates (Task 4)
4. PageHeader component (Task 5)
5. Next.js integration (Task 6)
