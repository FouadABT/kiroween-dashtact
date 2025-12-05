# Permissions Management UI

This directory contains the admin permission management interface for the JWT authentication system.

## Pages

### 1. Permissions List (`/dashboard/permissions`)

**Purpose**: View all system permissions in a searchable and filterable table.

**Required Permission**: `permissions:read`

**Features**:
- Display all permissions with resource, action, and description
- Search permissions by name, resource, action, or description
- Filter permissions by resource type
- Color-coded action badges (read, write, delete, admin)
- Responsive table layout

**Usage**:
```tsx
// Access via navigation or direct URL
// Automatically protected by PermissionGuard
<Link href="/dashboard/permissions">View Permissions</Link>
```

### 2. Role Permissions Editor (`/dashboard/permissions/roles`)

**Purpose**: Manage permissions assigned to each role with real-time updates.

**Required Permission**: `permissions:write`

**Features**:
- Select role from dropdown
- View all permissions grouped by resource
- Toggle permissions on/off with checkboxes
- Real-time change tracking (shows pending changes)
- Batch save/discard changes
- Search permissions within the editor
- Visual indicators for pending changes
- Success/error feedback

**Usage**:
```tsx
// Access via navigation or direct URL
// Automatically protected by PermissionGuard
<Link href="/dashboard/permissions/roles">Edit Role Permissions</Link>
```

## Permission Requirements

| Page | Required Permission | Description |
|------|-------------------|-------------|
| Permissions List | `permissions:read` | View all permissions |
| Role Permissions Editor | `permissions:write` | Assign/remove permissions from roles |

## API Integration

Both pages use the `PermissionApi` class from `@/lib/api`:

```typescript
// Get all permissions
const permissions = await PermissionApi.getAll();

// Get permissions for a specific role
const rolePermissions = await PermissionApi.getRolePermissions(roleId);

// Assign permission to role
await PermissionApi.assignToRole(roleId, permissionId);

// Remove permission from role
await PermissionApi.removeFromRole(roleId, permissionId);
```

## Navigation

The permissions pages are automatically added to the sidebar navigation when the user has the required permissions. The navigation is managed by `NavigationContext`:

```typescript
{
  title: "Permissions",
  href: "/dashboard/permissions",
  icon: Shield,
  permission: "permissions:read",
}
```

## Components Used

### UI Components
- `Card`, `CardHeader`, `CardTitle`, `CardDescription`, `CardContent` - Layout
- `Table`, `TableHeader`, `TableBody`, `TableRow`, `TableCell` - Data display
- `Input` - Search functionality
- `Select` - Role and resource filtering
- `Button` - Actions
- `Badge` - Status indicators
- `Checkbox` - Permission toggles
- `Alert` - Success/error messages

### Auth Components
- `PermissionGuard` - Route protection based on permissions

### Icons (lucide-react)
- `Shield` - Permissions icon
- `Users` - Roles icon
- `Search` - Search functionality
- `Filter` - Filter functionality
- `Save` - Save action
- `AlertCircle` - Error indicator
- `CheckCircle2` - Success indicator

## State Management

### Permissions List Page
```typescript
const [permissions, setPermissions] = useState<Permission[]>([]);
const [loading, setLoading] = useState(true);
const [error, setError] = useState<string | null>(null);
const [searchQuery, setSearchQuery] = useState('');
const [resourceFilter, setResourceFilter] = useState<string>('all');
```

### Role Permissions Editor
```typescript
const [roles, setRoles] = useState<UserRole[]>([]);
const [permissions, setPermissions] = useState<Permission[]>([]);
const [selectedRoleId, setSelectedRoleId] = useState<string>('');
const [rolePermissions, setRolePermissions] = useState<Permission[]>([]);
const [pendingChanges, setPendingChanges] = useState<Set<string>>(new Set());
const [loading, setLoading] = useState(true);
const [saving, setSaving] = useState(false);
const [error, setError] = useState<string | null>(null);
const [success, setSuccess] = useState<string | null>(null);
```

## Optimistic Updates

The Role Permissions Editor uses optimistic updates for better UX:

1. When a permission is toggled, the UI updates immediately
2. Changes are tracked in `pendingChanges` state
3. Visual indicators show which permissions have unsaved changes
4. On save, all changes are batched and sent to the API
5. If save fails, the UI reverts to the server state

## Error Handling

Both pages implement comprehensive error handling:

```typescript
try {
  // API call
} catch (err) {
  setError(err instanceof Error ? err.message : 'Failed to load data');
} finally {
  setLoading(false);
}
```

Errors are displayed using the Alert component with appropriate styling.

## Responsive Design

Both pages are fully responsive:
- Mobile: Stacked layout, simplified table views
- Tablet: Partial table columns visible
- Desktop: Full table with all columns

## Accessibility

- Semantic HTML structure
- ARIA labels for interactive elements
- Keyboard navigation support
- Screen reader friendly
- Color contrast compliance
- Loading states with spinners
- Error messages with icons

## Future Enhancements

Potential improvements for these pages:

1. **Bulk Operations**: Select multiple permissions to assign/remove at once
2. **Permission Templates**: Save common permission sets as templates
3. **Audit Log**: View history of permission changes
4. **Permission Dependencies**: Show which permissions depend on others
5. **Role Comparison**: Compare permissions across multiple roles
6. **Export/Import**: Export role permissions as JSON for backup/migration
7. **Permission Testing**: Test if a user/role has specific permissions
8. **Visual Permission Tree**: Hierarchical view of permissions by resource

## Testing

To test these pages:

1. Ensure you have a user with `permissions:read` or `permissions:write` permission
2. Navigate to `/dashboard/permissions` or `/dashboard/permissions/roles`
3. Test search and filter functionality
4. Test permission assignment/removal (requires `permissions:write`)
5. Verify error handling by disconnecting from the backend
6. Test responsive behavior on different screen sizes

## Related Files

- Backend: `backend/src/permissions/permissions.controller.ts`
- Backend: `backend/src/permissions/permissions.service.ts`
- Types: `frontend/src/types/permission.ts`
- API: `frontend/src/lib/api.ts` (PermissionApi class)
- Navigation: `frontend/src/contexts/NavigationContext.tsx`
