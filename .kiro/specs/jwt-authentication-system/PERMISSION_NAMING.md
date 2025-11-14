# Permission Naming Convention

## Table of Contents
- [Overview](#overview)
- [Standard Format](#standard-format)
- [Standard Resources](#standard-resources)
- [Standard Actions](#standard-actions)
- [Special Permissions](#special-permissions)
- [Examples by Use Case](#examples-by-use-case)
- [Best Practices](#best-practices)
- [Common Patterns](#common-patterns)

---

## Overview

This authentication system uses a consistent, predictable naming convention for permissions. Following this convention ensures clarity, maintainability, and reduces errors when implementing access control.

### Why This Matters

- ✅ **Predictable**: Developers can guess permission names without looking them up
- ✅ **Scalable**: Easy to add new resources and actions
- ✅ **Maintainable**: Clear what each permission controls
- ✅ **Searchable**: Easy to find all permissions for a resource
- ✅ **Consistent**: Same pattern across entire application

---

## Standard Format

### Basic Pattern

```
{resource}:{action}
```

### Components

| Component | Description | Examples |
|-----------|-------------|----------|
| **resource** | The entity or feature being accessed | `users`, `posts`, `settings`, `reports` |
| **action** | The operation being performed | `read`, `write`, `delete`, `admin` |

### Rules

1. **Lowercase only** - All permission names use lowercase
2. **Singular nouns** - Use singular form for resources (exception: some system resources)
3. **Colon separator** - Always use `:` to separate resource and action
4. **No spaces** - Permission names must not contain spaces
5. **Descriptive** - Names should clearly indicate what they control

### Examples

```typescript
'users:read'        // ✅ Correct
'users:write'       // ✅ Correct
'posts:delete'      // ✅ Correct

'Users:Read'        // ❌ Wrong - should be lowercase
'user:read'         // ⚠️  Inconsistent - use plural
'users-read'        // ❌ Wrong - use colon separator
'users read'        // ❌ Wrong - no spaces
```

---

## Standard Resources

### Core System Resources

These resources are included in the default authentication system:

| Resource | Description | Example Permissions |
|----------|-------------|---------------------|
| `users` | User accounts and profiles | `users:read`, `users:write`, `users:delete` |
| `roles` | User roles | `roles:read`, `roles:write`, `roles:delete` |
| `permissions` | Permission definitions | `permissions:read`, `permissions:write` |
| `settings` | Application settings | `settings:read`, `settings:write`, `settings:admin` |
| `profile` | User's own profile | `profile:write` |

### Application-Specific Resources

Add resources specific to your application:

| Resource | Description | Example Permissions |
|----------|-------------|---------------------|
| `posts` | Blog posts or articles | `posts:read`, `posts:write`, `posts:publish` |
| `comments` | User comments | `comments:read`, `comments:write`, `comments:moderate` |
| `products` | E-commerce products | `products:read`, `products:write`, `products:delete` |
| `orders` | Customer orders | `orders:read`, `orders:write`, `orders:fulfill` |
| `reports` | Analytics and reports | `reports:read`, `reports:generate`, `reports:export` |
| `invoices` | Financial invoices | `invoices:read`, `invoices:write`, `invoices:approve` |
| `projects` | Project management | `projects:read`, `projects:write`, `projects:archive` |
| `tasks` | Task management | `tasks:read`, `tasks:write`, `tasks:assign` |
| `files` | File management | `files:read`, `files:write`, `files:delete` |
| `analytics` | Analytics data | `analytics:read`, `analytics:export` |

---

## Standard Actions

### CRUD Actions

The most common actions follow CRUD operations:

| Action | Description | Typical Use |
|--------|-------------|-------------|
| `read` | View or list resources | GET endpoints, viewing pages |
| `write` | Create or update resources | POST/PATCH endpoints, forms |
| `delete` | Remove resources | DELETE endpoints, delete buttons |

### Extended Actions

Additional actions for specific use cases:

| Action | Description | Example |
|--------|-------------|---------|
| `admin` | Full administrative access | `settings:admin` - all settings operations |
| `publish` | Make content public | `posts:publish` - publish draft posts |
| `approve` | Approve pending items | `invoices:approve` - approve invoices |
| `moderate` | Moderate user content | `comments:moderate` - moderate comments |
| `export` | Export data | `reports:export` - export reports |
| `import` | Import data | `products:import` - bulk import products |
| `assign` | Assign to users | `tasks:assign` - assign tasks to team |
| `archive` | Archive old items | `projects:archive` - archive completed projects |
| `restore` | Restore deleted items | `posts:restore` - restore deleted posts |
| `share` | Share with others | `files:share` - share files |
| `download` | Download files | `files:download` - download files |
| `upload` | Upload files | `files:upload` - upload new files |
| `execute` | Run operations | `scripts:execute` - run scripts |
| `configure` | Configure settings | `integrations:configure` - configure integrations |

### Action Hierarchy

Actions can imply other actions:

```
admin > write > read
delete > write > read
```

**Example:**
- `users:admin` implies `users:write` and `users:read`
- `users:delete` implies `users:write` and `users:read`

**Note:** This hierarchy is conceptual. In implementation, you must explicitly check for the required permission or grant multiple permissions to a role.

---

## Special Permissions

### Wildcard Permissions

Use wildcards for broad access:

| Permission | Description | Use Case |
|------------|-------------|----------|
| `*:*` | All permissions on all resources | Super Admin role |
| `{resource}:*` | All actions on a specific resource | `users:*` - full user management |
| `*:{action}` | Specific action on all resources | `*:read` - read-only access to everything |

### Examples

```typescript
// Super Admin - can do everything
'*:*'

// User Admin - can do everything with users
'users:*'

// Read-Only Admin - can read everything
'*:read'

// Content Manager - can do everything with posts and comments
'posts:*'
'comments:*'
```

### Self-Access Permissions

Special permissions for users to manage their own data:

| Permission | Description |
|------------|-------------|
| `profile:write` | Edit own profile (not other users) |
| `profile:delete` | Delete own account |
| `profile:export` | Export own data |

**Implementation Note:** These permissions should be checked along with user ID matching:

```typescript
// Backend example
@Patch('profile')
@Permissions('profile:write')
async updateProfile(@CurrentUser() user, @Body() dto) {
  // User can only update their own profile
  return this.usersService.update(user.id, dto);
}

// vs

@Patch('users/:id')
@Permissions('users:write')
async updateUser(@Param('id') id, @Body() dto) {
  // Admin can update any user
  return this.usersService.update(id, dto);
}
```

---

## Examples by Use Case

### Blog/Content Management System

```typescript
// Content permissions
'posts:read'           // View published posts
'posts:write'          // Create/edit posts
'posts:delete'         // Delete posts
'posts:publish'        // Publish draft posts
'posts:archive'        // Archive old posts

// Comment permissions
'comments:read'        // View comments
'comments:write'       // Post comments
'comments:delete'      // Delete comments
'comments:moderate'    // Moderate/approve comments

// Media permissions
'media:read'           // View media library
'media:upload'         // Upload images/files
'media:delete'         // Delete media files

// Category permissions
'categories:read'      // View categories
'categories:write'     // Create/edit categories
'categories:delete'    // Delete categories
```

**Role Assignment Example:**
```typescript
AUTHOR: {
  permissions: [
    'posts:read',
    'posts:write',
    'posts:publish',    // Can publish own posts
    'media:read',
    'media:upload',
    'comments:read',
    'profile:write',
  ]
}

EDITOR: {
  permissions: [
    'posts:*',          // All post operations
    'comments:*',       // All comment operations
    'media:*',          // All media operations
    'categories:read',
    'categories:write',
    'profile:write',
  ]
}
```

### E-Commerce Platform

```typescript
// Product permissions
'products:read'        // View products
'products:write'       // Create/edit products
'products:delete'      // Delete products
'products:import'      // Bulk import products
'products:export'      // Export product data

// Order permissions
'orders:read'          // View orders
'orders:write'         // Create/edit orders
'orders:fulfill'       // Mark orders as fulfilled
'orders:cancel'        // Cancel orders
'orders:refund'        // Process refunds

// Customer permissions
'customers:read'       // View customers
'customers:write'      // Edit customer info
'customers:delete'     // Delete customers
'customers:export'     // Export customer data

// Inventory permissions
'inventory:read'       // View inventory
'inventory:write'      // Update inventory
'inventory:audit'      // Perform inventory audits

// Pricing permissions
'pricing:read'         // View prices
'pricing:write'        // Update prices
'pricing:approve'      // Approve price changes
```

### Project Management Tool

```typescript
// Project permissions
'projects:read'        // View projects
'projects:write'       // Create/edit projects
'projects:delete'      // Delete projects
'projects:archive'     // Archive completed projects

// Task permissions
'tasks:read'           // View tasks
'tasks:write'          // Create/edit tasks
'tasks:delete'         // Delete tasks
'tasks:assign'         // Assign tasks to team members

// Team permissions
'team:read'            // View team members
'team:write'           // Add/edit team members
'team:delete'          // Remove team members

// Time tracking permissions
'time:read'            // View time entries
'time:write'           // Log time
'time:approve'         // Approve timesheets

// Report permissions
'reports:read'         // View reports
'reports:generate'     // Generate new reports
'reports:export'       // Export report data
```

### Healthcare System

```typescript
// Patient permissions
'patients:read'        // View patient records
'patients:write'       // Create/edit patient records
'patients:delete'      // Delete patient records (rare)
'patients:export'      // Export patient data (HIPAA compliant)

// Appointment permissions
'appointments:read'    // View appointments
'appointments:write'   // Schedule/edit appointments
'appointments:cancel'  // Cancel appointments

// Medical records permissions
'records:read'         // View medical records
'records:write'        // Add to medical records
'records:sign'         // Sign/approve records

// Prescription permissions
'prescriptions:read'   // View prescriptions
'prescriptions:write'  // Create prescriptions
'prescriptions:approve'// Approve prescriptions

// Billing permissions
'billing:read'         // View billing info
'billing:write'        // Create/edit bills
'billing:process'      // Process payments
```

### SaaS Application

```typescript
// Organization permissions
'organizations:read'   // View organization
'organizations:write'  // Edit organization settings
'organizations:admin'  // Full org admin access

// Workspace permissions
'workspaces:read'      // View workspaces
'workspaces:write'     // Create/edit workspaces
'workspaces:delete'    // Delete workspaces

// Integration permissions
'integrations:read'    // View integrations
'integrations:write'   // Configure integrations
'integrations:execute' // Run integrations

// API permissions
'api:read'             // View API keys
'api:write'            // Create/revoke API keys
'api:execute'          // Make API calls

// Billing permissions
'billing:read'         // View billing
'billing:write'        // Update payment methods
'billing:admin'        // Full billing access
```

---

## Best Practices

### 1. Be Specific

```typescript
// ✅ Good - specific and clear
'posts:publish'
'invoices:approve'
'reports:export'

// ❌ Bad - too vague
'posts:manage'
'invoices:handle'
'reports:do'
```

### 2. Use Consistent Naming

```typescript
// ✅ Good - consistent across resources
'posts:read'
'comments:read'
'users:read'

// ❌ Bad - inconsistent
'posts:view'
'comments:read'
'users:list'
```

### 3. Don't Duplicate CRUD

```typescript
// ✅ Good - use standard CRUD
'products:read'
'products:write'
'products:delete'

// ❌ Bad - unnecessary duplication
'products:read'
'products:create'
'products:update'
'products:delete'

// Note: Use 'write' for both create and update
```

### 4. Group Related Permissions

```typescript
// ✅ Good - logical grouping
const CONTENT_PERMISSIONS = [
  'posts:read',
  'posts:write',
  'posts:publish',
  'posts:delete',
];

const MODERATION_PERMISSIONS = [
  'comments:moderate',
  'posts:moderate',
  'users:moderate',
];
```

### 5. Document Custom Actions

```typescript
// ✅ Good - document non-standard actions
export const DEFAULT_PERMISSIONS = [
  { 
    name: 'posts:publish', 
    resource: 'posts', 
    action: 'publish', 
    description: 'Publish draft posts to make them public' // Clear description
  },
  { 
    name: 'invoices:approve', 
    resource: 'invoices', 
    action: 'approve', 
    description: 'Approve invoices for payment processing'
  },
];
```

### 6. Avoid Overly Granular Permissions

```typescript
// ❌ Too granular - hard to manage
'posts:read:own'
'posts:read:team'
'posts:read:all'
'posts:write:title'
'posts:write:content'
'posts:write:tags'

// ✅ Better - use broader permissions with logic
'posts:read'    // Can read posts
'posts:write'   // Can edit posts
// Use additional logic to determine if user can edit specific post
```

### 7. Plan for Growth

```typescript
// ✅ Good - extensible structure
'products:read'
'products:write'
'products:delete'
// Easy to add: 'products:import', 'products:export' later

// ❌ Bad - painted into a corner
'products:all'
// Hard to add granular permissions later
```

---

## Common Patterns

### Pattern 1: Basic CRUD Resource

```typescript
// Standard CRUD permissions for any resource
'{resource}:read'
'{resource}:write'
'{resource}:delete'

// Example: Products
'products:read'
'products:write'
'products:delete'
```

### Pattern 2: Content Workflow

```typescript
// Content that goes through approval workflow
'{resource}:read'
'{resource}:write'
'{resource}:publish'
'{resource}:archive'

// Example: Blog posts
'posts:read'
'posts:write'
'posts:publish'
'posts:archive'
```

### Pattern 3: Financial/Approval Workflow

```typescript
// Items requiring approval
'{resource}:read'
'{resource}:write'
'{resource}:approve'
'{resource}:reject'

// Example: Invoices
'invoices:read'
'invoices:write'
'invoices:approve'
'invoices:reject'
```

### Pattern 4: Data Management

```typescript
// Resources with import/export
'{resource}:read'
'{resource}:write'
'{resource}:import'
'{resource}:export'

// Example: Customers
'customers:read'
'customers:write'
'customers:import'
'customers:export'
```

### Pattern 5: Moderation

```typescript
// User-generated content requiring moderation
'{resource}:read'
'{resource}:write'
'{resource}:moderate'
'{resource}:delete'

// Example: Comments
'comments:read'
'comments:write'
'comments:moderate'
'comments:delete'
```

---

## Quick Reference

### Most Common Permissions

```typescript
// User Management
'users:read'
'users:write'
'users:delete'

// Role Management
'roles:read'
'roles:write'
'roles:delete'

// Permission Management
'permissions:read'
'permissions:write'

// Settings
'settings:read'
'settings:write'
'settings:admin'

// Profile
'profile:write'

// Wildcard
'*:*'              // Super admin
'{resource}:*'     // Resource admin
```

### Permission Checklist

When creating a new permission, ask:

- [ ] Does it follow the `{resource}:{action}` format?
- [ ] Is it lowercase?
- [ ] Is the resource name singular?
- [ ] Is the action name standard (read/write/delete) or well-documented?
- [ ] Does it clearly indicate what it controls?
- [ ] Is it consistent with existing permissions?
- [ ] Have you added it to the seed data?
- [ ] Have you documented it?

---

## Implementation Examples

### Backend - Checking Permissions

```typescript
// Single permission
@Get()
@Permissions('posts:read')
async findAll() { }

// Multiple permissions (requires ALL)
@Post('publish')
@Permissions('posts:write', 'posts:publish')
async publish() { }

// Wildcard permission
@Get('admin')
@Permissions('*:*')
async adminPanel() { }
```

### Frontend - Checking Permissions

```typescript
// Hook
const canEditPosts = usePermission('posts:write');

// Component
<PermissionGuard permission="posts:write">
  <EditButton />
</PermissionGuard>

// Multiple permissions
<PermissionGuard 
  permission={['posts:write', 'posts:publish']}
  requireAll={true}
>
  <PublishButton />
</PermissionGuard>
```

---

## Troubleshooting

### Common Issues

**Issue:** Permission not working
**Check:** 
- Is it spelled correctly?
- Is it assigned to the user's role?
- Did you reseed the database after adding it?

**Issue:** Too many permissions to manage
**Solution:** Use wildcard permissions for admin roles

**Issue:** Permission name conflicts
**Solution:** Use more specific resource names (e.g., `blog-posts` vs `forum-posts`)

**Issue:** Unclear what permission does
**Solution:** Add detailed description in seed data

---

## Summary

### Key Takeaways

1. **Format:** Always use `{resource}:{action}`
2. **Consistency:** Use standard actions (read, write, delete) when possible
3. **Clarity:** Permission names should be self-explanatory
4. **Documentation:** Document custom actions and special permissions
5. **Simplicity:** Don't over-complicate with too many granular permissions

### Next Steps

1. Review your application's resources
2. Define permissions following this convention
3. Add them to `backend/prisma/seed-data/auth.seed.ts`
4. Run `npm run prisma:seed`
5. Implement permission checks in your code
6. Test thoroughly

For more information, see:
- [API Documentation](./API_DOCUMENTATION.md)
- [Customization Guide](./CUSTOMIZATION_GUIDE.md)
- [Main README](./README.md)
