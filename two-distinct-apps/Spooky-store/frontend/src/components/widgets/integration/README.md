# Integration Widgets

Helper components for integrating widgets with APIs, permissions, themes, and data operations.

## Components

### ApiWidget

Fetches data from an API endpoint and renders it using a custom render function.

**Features:**
- Automatic data fetching on mount
- Optional auto-refresh with configurable interval
- Loading and error state management
- Permission-based access control
- Manual refresh capability

**Usage:**
```tsx
import { ApiWidget } from '@/components/widgets/integration';

<ApiWidget
  title="User Statistics"
  endpoint="/api/stats/users"
  refreshInterval={30000} // Refresh every 30 seconds
  permission="stats:read"
  render={(data, refresh) => (
    <div>
      <p>Total Users: {data.total}</p>
      <p>Active: {data.active}</p>
      <button onClick={refresh}>Refresh</button>
    </div>
  )}
/>
```

**Props:**
- `title` - Widget title
- `endpoint` - API endpoint to fetch from
- `refreshInterval` - Auto-refresh interval in ms (optional)
- `render` - Function that receives data and refresh callback
- `permission` - Required permission (optional)
- `method` - HTTP method (default: GET)
- `body` - Request body for POST/PUT
- `headers` - Custom headers
- `transform` - Transform response before rendering
- `onSuccess` - Success callback
- `onError` - Error callback

---

### PermissionWrapper

Enhanced permission guard with widget-specific styling.

**Features:**
- Single or multiple permission checks
- Require all or any permissions
- Custom fallback UI
- Widget-styled access denied message
- Theme-aware styling

**Usage:**
```tsx
import { PermissionWrapper } from '@/components/widgets/integration';

// Single permission
<PermissionWrapper permission="users:read">
  <UserList />
</PermissionWrapper>

// Multiple permissions (require all)
<PermissionWrapper 
  permission={['users:read', 'users:write']}
  requireAll={true}
>
  <UserEditor />
</PermissionWrapper>

// Custom fallback
<PermissionWrapper 
  permission="admin:access"
  fallback={<CustomAccessDenied />}
>
  <AdminPanel />
</PermissionWrapper>

// Inline (no fallback UI)
<InlinePermissionWrapper permission="users:delete">
  <DeleteButton />
</InlinePermissionWrapper>
```

**Props:**
- `permission` - Single permission or array
- `requireAll` - Require all permissions (default: true)
- `fallback` - Custom fallback UI
- `showAccessDenied` - Show styled access denied (default: true)
- `accessDeniedMessage` - Custom message
- `children` - Content to render when authorized

---

### ThemePreview

Display components in different theme modes with code snippets.

**Features:**
- Preview component in light and dark themes
- Show multiple variants side-by-side
- Display code snippet for implementation
- Copy code to clipboard
- Theme-aware styling

**Usage:**
```tsx
import { ThemePreview } from '@/components/widgets/integration';

<ThemePreview
  title="Button Component"
  description="Primary button with different states"
  component={<Button>Click me</Button>}
  variants={[
    { 
      label: 'Primary', 
      component: <Button>Primary</Button>,
      code: '<Button>Primary</Button>'
    },
    { 
      label: 'Secondary', 
      component: <Button variant="secondary">Secondary</Button>,
      code: '<Button variant="secondary">Secondary</Button>'
    },
  ]}
  code={`<Button>Click me</Button>`}
/>

// Inline preview
<InlineThemePreview
  component={<Button>Example</Button>}
  code="<Button>Example</Button>"
/>
```

**Props:**
- `title` - Preview title
- `description` - Preview description
- `component` - Main component to preview
- `variants` - Array of component variants
- `code` - Code snippet to display
- `showThemeToggle` - Show theme toggle (default: true)
- `defaultTheme` - Default theme mode (default: light)

---

### ExportButton

Export data in various formats (CSV, JSON, Excel, PDF).

**Features:**
- Multiple export formats
- Permission-based access control
- Loading state during export
- Automatic file download
- Custom filename support

**Usage:**
```tsx
import { ExportButton } from '@/components/widgets/integration';

<ExportButton
  data={users}
  filename="users-export"
  formats={['csv', 'json', 'excel']}
  permission="users:export"
/>

// Custom export handler
<ExportButton
  data={users}
  filename="users"
  formats={['csv', 'pdf']}
  onExport={async (format, data) => {
    // Custom export logic
    await exportToServer(format, data);
  }}
/>

// Icon only
<ExportButton
  data={users}
  formats={['csv']}
  iconOnly
  size="icon"
/>
```

**Props:**
- `data` - Array of data to export
- `filename` - Base filename (without extension)
- `formats` - Available formats (csv, json, excel, pdf)
- `permission` - Required permission
- `onExport` - Custom export handler
- `variant` - Button variant
- `size` - Button size
- `iconOnly` - Show as icon only

**Supported Formats:**
- `csv` - Comma-separated values
- `json` - JSON format
- `excel` - Excel spreadsheet (requires xlsx library)
- `pdf` - PDF document (requires jsPDF library)

---

### BulkActions

Display action buttons for selected items.

**Features:**
- Show selected item count
- Multiple action buttons with permissions
- Loading state during action execution
- Clear selection button
- Dropdown menu for additional actions

**Usage:**
```tsx
import { BulkActions } from '@/components/widgets/integration';
import { Trash, Download, Mail } from 'lucide-react';

<BulkActions
  selectedIds={selectedUserIds}
  onClearSelection={() => setSelectedUserIds([])}
  actions={[
    {
      label: 'Delete',
      icon: <Trash className="w-4 h-4" />,
      onClick: async (ids) => {
        await deleteUsers(ids);
      },
      permission: 'users:delete',
      variant: 'destructive',
      requireConfirm: true,
      confirmMessage: 'Are you sure you want to delete these users?',
    },
    {
      label: 'Export',
      icon: <Download className="w-4 h-4" />,
      onClick: (ids) => exportUsers(ids),
      permission: 'users:export',
    },
    {
      label: 'Send Email',
      icon: <Mail className="w-4 h-4" />,
      onClick: (ids) => sendEmail(ids),
      permission: 'users:email',
      inDropdown: true, // Show in dropdown menu
    },
  ]}
/>

// Compact version
<CompactBulkActions
  selectedIds={selectedIds}
  onClearSelection={() => setSelectedIds([])}
  actions={actions}
/>
```

**Props:**
- `selectedIds` - Array of selected item IDs
- `onClearSelection` - Callback to clear selection
- `actions` - Array of bulk actions
- `showCount` - Show selected count (default: true)
- `countLabel` - Custom count label
- `position` - Position of actions bar (top, bottom, sticky)

**Action Props:**
- `label` - Action label
- `icon` - Action icon
- `onClick` - Handler receiving selected IDs
- `permission` - Required permission
- `variant` - Button variant
- `inDropdown` - Show in dropdown menu
- `requireConfirm` - Confirm before executing
- `confirmMessage` - Confirmation message

---

## Integration Patterns

### API + Permissions

```tsx
<ApiWidget
  title="Protected Data"
  endpoint="/api/sensitive-data"
  permission="data:read"
  render={(data) => <DataDisplay data={data} />}
/>
```

### Export with Permissions

```tsx
<PermissionWrapper permission="data:export">
  <ExportButton
    data={tableData}
    formats={['csv', 'json']}
  />
</PermissionWrapper>
```

### Bulk Actions with Permissions

```tsx
<BulkActions
  selectedIds={selectedIds}
  onClearSelection={clearSelection}
  actions={[
    {
      label: 'Delete',
      onClick: handleDelete,
      permission: 'items:delete',
      requireConfirm: true,
    },
  ]}
/>
```

### Theme Documentation

```tsx
<ThemePreview
  title="Custom Component"
  description="Shows how component adapts to themes"
  variants={[
    { label: 'Default', component: <MyComponent /> },
    { label: 'Variant', component: <MyComponent variant="alt" /> },
  ]}
  code={`<MyComponent />`}
/>
```

---

## Best Practices

1. **API Widget**
   - Use reasonable refresh intervals (30s+)
   - Handle errors gracefully
   - Show loading states
   - Implement proper cleanup

2. **Permission Wrapper**
   - Always check permissions on backend too
   - Provide meaningful fallback messages
   - Use inline wrapper for small UI elements

3. **Export Button**
   - Validate data before export
   - Use appropriate formats for data type
   - Consider file size limits
   - Implement server-side export for large datasets

4. **Bulk Actions**
   - Confirm destructive actions
   - Show clear feedback during execution
   - Handle partial failures gracefully
   - Clear selection after successful action

5. **Theme Preview**
   - Test components in both themes
   - Provide accurate code snippets
   - Show common variants
   - Include usage instructions

---

## Theme Integration

All integration widgets use theme-aware styling:

```tsx
// Automatically adapts to current theme
<PermissionWrapper permission="users:read">
  <div className="bg-card text-card-foreground">
    Content adapts to theme
  </div>
</PermissionWrapper>
```

---

## Accessibility

- All components support keyboard navigation
- ARIA labels for screen readers
- Focus indicators visible in both themes
- Loading states announced to screen readers
- Error messages accessible

---

## Performance

- ApiWidget debounces rapid refreshes
- ExportButton handles large datasets efficiently
- BulkActions optimizes for many selected items
- ThemePreview lazy loads preview content
- All components use React.memo where appropriate
