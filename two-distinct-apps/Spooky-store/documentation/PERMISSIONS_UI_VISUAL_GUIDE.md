# Permissions Management UI - Visual Guide

## Overview
This guide provides a visual walkthrough of the newly implemented permission management interface.

## 1. Navigation Integration

### Sidebar Navigation
The "Permissions" menu item appears in the sidebar for users with `permissions:read` permission:

```
Dashboard
├── Dashboard (Home icon)
├── Analytics (BarChart3 icon)
├── Data (Table icon)
├── Users (Users icon)
├── Permissions (Shield icon) ← NEW
└── Settings (Settings icon)
```

**Visibility Rules**:
- Shown only if user has `permissions:read` permission
- Automatically hidden for users without permission
- Works in both desktop and mobile sidebars

---

## 2. Permissions List Page

**URL**: `/dashboard/permissions`  
**Required Permission**: `permissions:read`

### Page Layout

```
┌─────────────────────────────────────────────────────────────┐
│  🛡️ Permissions                                              │
│  View and manage system permissions                          │
└─────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────┐
│  Filter Permissions                                          │
│  Search and filter permissions by resource and action        │
│                                                              │
│  [🔍 Search permissions...]  [🔽 All Resources]  [Clear]    │
│                                                              │
│  Showing 14 of 14 permissions                                │
└─────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────┐
│  Permission Name    │ Resource  │ Action  │ Description      │
├─────────────────────┼───────────┼─────────┼──────────────────┤
│  users:read         │ users     │ read    │ View users       │
│  users:write        │ users     │ write   │ Create/edit...   │
│  users:delete       │ users     │ delete  │ Delete users     │
│  permissions:read   │ permissions│ read   │ View permissions │
│  permissions:write  │ permissions│ write  │ Assign perms...  │
│  settings:read      │ settings  │ read    │ View settings    │
│  settings:write     │ settings  │ write   │ Modify settings  │
│  *:*                │ *         │ *       │ All permissions  │
└─────────────────────┴───────────┴─────────┴──────────────────┘
```

### Features

**Search Bar**:
- Real-time filtering
- Searches across: name, resource, action, description
- Icon: 🔍 (Search)

**Resource Filter**:
- Dropdown with all unique resources
- Options: "All Resources", "users", "permissions", "settings", etc.
- Icon: 🔽 (Filter)

**Clear Filters Button**:
- Appears when filters are active
- Resets search and resource filter

**Action Badges**:
- `read` → Gray/Secondary badge
- `write` → Blue/Default badge
- `delete` → Red/Destructive badge
- `admin` / `*` → Outlined badge

**Responsive Behavior**:
- Mobile: Hides "Description" and "Created" columns
- Tablet: Shows most columns
- Desktop: Shows all columns

---

## 3. Role Permissions Editor

**URL**: `/dashboard/permissions/roles`  
**Required Permission**: `permissions:write`

### Page Layout

```
┌─────────────────────────────────────────────────────────────┐
│  👥 Role Permissions                                         │
│  Manage permissions assigned to each role                    │
└─────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────┐
│  Select Role                                                 │
│  Choose a role to view and edit its permissions              │
│                                                              │
│  [🔽 Admin ⚙️ System]                                        │
│                                                              │
│  Administrative access to most features                      │
└─────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────┐
│  [🔍 Search permissions...]  [Discard] [💾 Save Changes (3)] │
│                                                              │
│  8 of 14 permissions assigned • 3 unsaved changes            │
└─────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────┐
│  🛡️ users                                                    │
│  3 permissions                                               │
│                                                              │
│  ☑️ users:read          [read]                               │
│     View users                                               │
│                                                              │
│  ☑️ users:write         [write] [Pending]                    │
│     Create/edit users                                        │
│                                                              │
│  ☐ users:delete         [delete]                             │
│     Delete users                                             │
└─────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────┐
│  🛡️ permissions                                              │
│  2 permissions                                               │
│                                                              │
│  ☑️ permissions:read    [read]                               │
│     View permissions                                         │
│                                                              │
│  ☐ permissions:write    [write] [Pending]                    │
│     Assign permissions                                       │
└─────────────────────────────────────────────────────────────┘
```

### Features

**Role Selector**:
- Dropdown showing all roles
- System roles marked with "System" badge
- Shows role description below selector

**Permission Groups**:
- Permissions grouped by resource
- Each group shows resource name and count
- Collapsible card layout

**Permission Items**:
- Checkbox for toggle
- Permission name in monospace font
- Action badge (color-coded)
- Description text
- "Pending" badge for unsaved changes

**Visual States**:

1. **Normal State**:
   ```
   ☑️ users:read [read]
      View users
   ```

2. **Pending Change State** (orange border):
   ```
   ┌─────────────────────────────────────┐
   │ ☑️ users:write [write] [Pending]    │
   │    Create/edit users                │
   └─────────────────────────────────────┘
   ```

3. **Unchecked State**:
   ```
   ☐ users:delete [delete]
      Delete users
   ```

**Action Buttons**:
- **Discard**: Revert all pending changes
- **Save Changes (N)**: Save all changes, shows count
- Both disabled when no pending changes
- Save button shows "Saving..." during API calls

**Status Messages**:

Success (green):
```
┌─────────────────────────────────────────────────────────────┐
│ ✅ Successfully updated permissions for Admin                │
└─────────────────────────────────────────────────────────────┘
```

Error (red):
```
┌─────────────────────────────────────────────────────────────┐
│ ⚠️ Failed to save changes: Network error                     │
└─────────────────────────────────────────────────────────────┘
```

---

## 4. User Flow Examples

### Example 1: Viewing Permissions

1. User logs in with `permissions:read` permission
2. Sees "Permissions" in sidebar
3. Clicks "Permissions"
4. Views list of all system permissions
5. Uses search to find specific permissions
6. Filters by resource type

### Example 2: Editing Role Permissions

1. User logs in with `permissions:write` permission
2. Navigates to `/dashboard/permissions/roles`
3. Selects "Manager" role from dropdown
4. Sees current permissions for Manager role
5. Checks "users:write" to add permission
6. Unchecks "users:delete" to remove permission
7. Sees "2 unsaved changes" in save button
8. Clicks "Save Changes (2)"
9. Sees success message
10. Changes are persisted

### Example 3: Searching and Filtering

**Permissions List**:
1. Types "users" in search box
2. Sees only permissions containing "users"
3. Selects "users" from resource filter
4. Sees only user-related permissions
5. Clicks "Clear Filters" to reset

**Role Editor**:
1. Selects role
2. Types "write" in search
3. Sees only permissions with "write" action
4. Can still toggle filtered permissions

---

## 5. Permission Badge Colors

Visual reference for action badge colors:

| Action | Color | Variant | Example |
|--------|-------|---------|---------|
| read | Gray | secondary | `[read]` |
| write | Blue | default | `[write]` |
| delete | Red | destructive | `[delete]` |
| admin | Outlined | outline | `[admin]` |
| * | Outlined | outline | `[*]` |

---

## 6. Responsive Breakpoints

### Mobile (< 640px)
- Permissions List: 2 columns (Name, Action)
- Role Editor: Full-width cards, stacked buttons
- Sidebar: Overlay with backdrop

### Tablet (640px - 1024px)
- Permissions List: 4 columns (Name, Resource, Action, Description)
- Role Editor: 2-column layout for buttons
- Sidebar: Overlay with backdrop

### Desktop (> 1024px)
- Permissions List: All 5 columns
- Role Editor: Full layout with side-by-side buttons
- Sidebar: Fixed position, collapsible

---

## 7. Loading States

### Permissions List
```
┌─────────────────────────────────────────────────────────────┐
│                                                              │
│                    ⟳ (spinning)                              │
│                                                              │
└─────────────────────────────────────────────────────────────┘
```

### Role Editor
```
┌─────────────────────────────────────────────────────────────┐
│  Select Role                                                 │
│                                                              │
│  ⟳ (spinning)                                                │
└─────────────────────────────────────────────────────────────┘
```

---

## 8. Empty States

### No Permissions Found
```
┌─────────────────────────────────────────────────────────────┐
│                                                              │
│                    🛡️ (large icon)                           │
│                                                              │
│              No permissions match your filters               │
│                                                              │
└─────────────────────────────────────────────────────────────┘
```

### No Search Results
```
┌─────────────────────────────────────────────────────────────┐
│                                                              │
│                    🛡️ (large icon)                           │
│                                                              │
│           No permissions match your search                   │
│                                                              │
└─────────────────────────────────────────────────────────────┘
```

---

## 9. Error States

### Load Error
```
┌─────────────────────────────────────────────────────────────┐
│                                                              │
│  ⚠️ Failed to load permissions                               │
│                                                              │
│                    [Retry]                                   │
│                                                              │
└─────────────────────────────────────────────────────────────┘
```

### Save Error
```
┌─────────────────────────────────────────────────────────────┐
│ ⚠️ Failed to save changes: Network error                     │
└─────────────────────────────────────────────────────────────┘
```

---

## 10. Accessibility Features

### Keyboard Navigation
- Tab through all interactive elements
- Enter/Space to toggle checkboxes
- Escape to close dropdowns
- Arrow keys in dropdowns

### Screen Reader Support
- Semantic HTML structure
- ARIA labels on icons
- Role attributes on lists
- Status announcements for changes

### Visual Accessibility
- High contrast colors
- Clear focus indicators
- Sufficient text size
- Color-blind friendly badges

---

## 11. Icon Reference

| Icon | Name | Usage |
|------|------|-------|
| 🛡️ | Shield | Permissions, security |
| 👥 | Users | Roles, user management |
| 🔍 | Search | Search functionality |
| 🔽 | Filter | Filtering options |
| 💾 | Save | Save action |
| ⚠️ | AlertCircle | Errors |
| ✅ | CheckCircle2 | Success |
| ⟳ | Spinner | Loading |

---

## 12. Color Scheme

### Light Mode
- Background: White
- Text: Dark gray
- Borders: Light gray
- Primary: Blue
- Success: Green
- Error: Red
- Warning: Orange

### Dark Mode
- Background: Dark gray
- Text: Light gray
- Borders: Medium gray
- Primary: Light blue
- Success: Light green
- Error: Light red
- Warning: Light orange

---

## Summary

The permissions management UI provides:
- ✅ Clean, professional interface
- ✅ Intuitive navigation
- ✅ Real-time feedback
- ✅ Responsive design
- ✅ Comprehensive error handling
- ✅ Accessibility compliance
- ✅ Consistent with existing dashboard design
- ✅ Production-ready implementation
