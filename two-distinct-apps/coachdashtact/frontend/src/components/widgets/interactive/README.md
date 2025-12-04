# Interactive Widgets

Interactive widgets provide user input and action components for building dynamic interfaces.

## Components

### QuickActions

A flexible action button container supporting multiple layouts and permission-based visibility.

**Features:**
- Horizontal, vertical, and grid layouts
- Configurable button sizes and variants
- Permission-based action visibility
- Icon support

**Usage:**
```tsx
import { QuickActions } from '@/components/widgets/interactive';
import { Plus, Edit, Trash } from 'lucide-react';

const actions = [
  {
    id: 'create',
    label: 'Create New',
    icon: Plus,
    onClick: () => console.log('Create'),
    variant: 'default',
    permission: 'posts:write',
  },
  {
    id: 'edit',
    label: 'Edit',
    icon: Edit,
    onClick: () => console.log('Edit'),
    variant: 'secondary',
  },
  {
    id: 'delete',
    label: 'Delete',
    icon: Trash,
    onClick: () => console.log('Delete'),
    variant: 'destructive',
    permission: 'posts:delete',
  },
];

<QuickActions
  actions={actions}
  layout="horizontal"
/>

// Grid layout with 3 columns
<QuickActions
  actions={actions}
  layout="grid"
  columns={3}
/>

// Vertical layout
<QuickActions
  actions={actions}
  layout="vertical"
/>
```

### FilterPanel

A collapsible filter panel with URL query parameter persistence.

**Features:**
- Text, select, date, and range filter types
- Collapsible interface
- URL query parameter persistence
- Clear individual or all filters
- Real-time filter state updates

**Usage:**
```tsx
import { FilterPanel } from '@/components/widgets/interactive';

const filters = [
  {
    id: 'search',
    label: 'Search',
    type: 'text',
    defaultValue: '',
  },
  {
    id: 'status',
    label: 'Status',
    type: 'select',
    options: [
      { label: 'Active', value: 'active' },
      { label: 'Inactive', value: 'inactive' },
    ],
  },
  {
    id: 'date',
    label: 'Date',
    type: 'date',
  },
  {
    id: 'price',
    label: 'Price Range',
    type: 'range',
  },
];

<FilterPanel
  filters={filters}
  defaultOpen={true}
  onFilterChange={(filters) => console.log('Filters:', filters)}
/>
```

### SearchBar

A search input with debouncing and optional suggestions dropdown.

**Features:**
- 300ms debounce (configurable)
- Search suggestions dropdown
- Clear button
- Keyboard navigation
- Filtered suggestions

**Usage:**
```tsx
import { SearchBar } from '@/components/widgets/interactive';

// Simple search bar
<SearchBar
  placeholder="Search users..."
  onSearch={(query) => console.log('Search:', query)}
/>

// With suggestions
const suggestions = [
  { id: '1', label: 'John Doe', value: 'john' },
  { id: '2', label: 'Jane Smith', value: 'jane' },
  { id: '3', label: 'Bob Johnson', value: 'bob' },
];

<SearchBar
  placeholder="Search users..."
  onSearch={(query) => console.log('Search:', query)}
  suggestions={suggestions}
  showSuggestions={true}
  debounceMs={300}
/>
```

### NotificationWidget

A notification list with toast integration and dismissal functionality.

**Features:**
- Success, error, warning, and info types
- Toast notifications via sonner
- Dismiss individual or all notifications
- Timestamp formatting
- Scrollable list
- Top/bottom positioning
- Limited visible notifications

**Usage:**
```tsx
import { NotificationWidget } from '@/components/widgets/interactive';

const notifications = [
  {
    id: '1',
    title: 'Success',
    message: 'Your changes have been saved',
    type: 'success',
    timestamp: new Date(),
    read: false,
  },
  {
    id: '2',
    title: 'Warning',
    message: 'Your session will expire soon',
    type: 'warning',
    timestamp: new Date(Date.now() - 300000), // 5 minutes ago
    read: false,
  },
  {
    id: '3',
    title: 'Error',
    message: 'Failed to upload file',
    type: 'error',
    timestamp: new Date(Date.now() - 600000), // 10 minutes ago
    read: true,
  },
];

<NotificationWidget
  notifications={notifications}
  maxVisible={5}
  position="top"
  onDismiss={(id) => console.log('Dismissed:', id)}
  onDismissAll={() => console.log('Dismissed all')}
  onNotificationClick={(notification) => console.log('Clicked:', notification)}
/>
```

## Common Patterns

### Permission-Based Actions

```tsx
const actions = [
  {
    id: 'view',
    label: 'View',
    onClick: handleView,
    // No permission - visible to all
  },
  {
    id: 'edit',
    label: 'Edit',
    onClick: handleEdit,
    permission: 'posts:write', // Only visible with permission
  },
  {
    id: 'delete',
    label: 'Delete',
    onClick: handleDelete,
    permission: 'posts:delete', // Only visible with permission
  },
];

<QuickActions actions={actions} layout="horizontal" />
```

### Filter with Search

```tsx
const [searchQuery, setSearchQuery] = useState('');
const [filters, setFilters] = useState({});

<div className="space-y-4">
  <SearchBar
    placeholder="Search..."
    onSearch={setSearchQuery}
  />
  
  <FilterPanel
    filters={filterConfig}
    onFilterChange={setFilters}
  />
</div>
```

### Notification Management

```tsx
const [notifications, setNotifications] = useState([]);

const handleDismiss = (id: string) => {
  setNotifications(prev => prev.filter(n => n.id !== id));
};

const handleDismissAll = () => {
  setNotifications([]);
};

<NotificationWidget
  notifications={notifications}
  onDismiss={handleDismiss}
  onDismissAll={handleDismissAll}
/>
```

## Accessibility

All interactive widgets include:
- Proper ARIA labels and roles
- Keyboard navigation support
- Focus indicators
- Screen reader announcements
- Color contrast compliance

## Theme Integration

All widgets automatically adapt to light/dark themes using CSS custom properties from the theme system.

## Performance

- SearchBar uses debouncing to reduce API calls
- FilterPanel updates URL without page reload
- NotificationWidget limits visible items
- All components use React.memo where appropriate
