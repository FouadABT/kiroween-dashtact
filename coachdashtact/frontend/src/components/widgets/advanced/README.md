# Advanced Widgets

Advanced widgets provide sophisticated UI components for complex data visualization and interaction patterns.

## Components

### KanbanBoard

A drag-and-drop Kanban board for task management and workflow visualization.

**Features:**
- Drag-and-drop items between columns
- Sortable items within columns
- Custom item rendering
- Permission-based access control
- Responsive design

**Usage:**
```tsx
import { KanbanBoard } from '@/components/widgets/advanced/KanbanBoard';

const columns = [
  {
    id: 'todo',
    title: 'To Do',
    items: [
      { id: '1', title: 'Task 1', description: 'Description', columnId: 'todo' },
      { id: '2', title: 'Task 2', columnId: 'todo' },
    ],
  },
  {
    id: 'in-progress',
    title: 'In Progress',
    items: [],
  },
  {
    id: 'done',
    title: 'Done',
    items: [],
  },
];

<KanbanBoard
  columns={columns}
  onItemMove={(itemId, fromCol, toCol, index) => {
    console.log(`Moved ${itemId} from ${fromCol} to ${toCol} at index ${index}`);
  }}
  onItemClick={(item) => console.log('Clicked:', item)}
  permission="tasks:write"
/>
```

**Props:**
- `columns`: Array of KanbanColumn objects
- `onItemMove`: Callback when item is moved (itemId, fromColumnId, toColumnId, newIndex)
- `onItemClick`: Callback when item is clicked
- `renderItem`: Custom render function for items
- `maxHeight`: Maximum height of columns (default: '600px')
- `permission`: Optional permission check

### Calendar

A full-featured calendar with multiple views and event management.

**Features:**
- Month, week, and day views
- Event display with custom colors
- Event click handling
- Date selection
- Theme-aware styling
- Responsive design

**Usage:**
```tsx
import { Calendar } from '@/components/widgets/advanced/Calendar';

const events = [
  {
    id: '1',
    title: 'Team Meeting',
    start: new Date(2024, 0, 15, 10, 0),
    end: new Date(2024, 0, 15, 11, 0),
    color: 'hsl(var(--chart-1))',
  },
  {
    id: '2',
    title: 'Project Deadline',
    start: new Date(2024, 0, 20),
    end: new Date(2024, 0, 20),
    allDay: true,
    color: 'hsl(var(--destructive))',
  },
];

<Calendar
  events={events}
  onEventClick={(event) => console.log('Event clicked:', event)}
  onDateClick={(date) => console.log('Date clicked:', date)}
  defaultView="month"
  permission="calendar:read"
/>
```

**Props:**
- `events`: Array of CalendarEvent objects
- `onEventClick`: Callback when event is clicked
- `onDateClick`: Callback when date is clicked
- `defaultView`: Initial view ('month' | 'week' | 'day')
- `title`: Calendar title
- `permission`: Optional permission check

### TreeView

A hierarchical tree view with expand/collapse and lazy loading support.

**Features:**
- Expandable/collapsible nodes
- Lazy loading of children
- Node selection
- Custom icons
- Expand/collapse all
- Keyboard navigation

**Usage:**
```tsx
import { TreeView } from '@/components/widgets/advanced/TreeView';
import { Folder, File } from 'lucide-react';

const data = [
  {
    id: '1',
    label: 'Documents',
    icon: Folder,
    children: [
      { id: '1-1', label: 'Report.pdf', icon: File },
      { id: '1-2', label: 'Presentation.pptx', icon: File },
    ],
  },
  {
    id: '2',
    label: 'Images',
    icon: Folder,
    children: [
      { id: '2-1', label: 'Photo1.jpg', icon: File },
    ],
  },
];

<TreeView
  data={data}
  onNodeClick={(node) => console.log('Node clicked:', node)}
  onNodeExpand={(node) => console.log('Node expanded:', node)}
  defaultExpandedIds={['1']}
  selectedId="1-1"
  permission="files:read"
/>
```

**Lazy Loading:**
```tsx
<TreeView
  data={rootNodes}
  onLoadChildren={async (node) => {
    const response = await fetch(`/api/files/${node.id}/children`);
    return response.json();
  }}
/>
```

**Props:**
- `data`: Array of TreeNode objects
- `onNodeClick`: Callback when node is clicked
- `onNodeExpand`: Callback when node is expanded
- `onNodeCollapse`: Callback when node is collapsed
- `onLoadChildren`: Async function to load children (for lazy loading)
- `defaultExpandedIds`: Array of initially expanded node IDs
- `selectedId`: ID of selected node
- `title`: Tree view title
- `maxHeight`: Maximum height (default: '400px')
- `permission`: Optional permission check

### Timeline

A timeline component for displaying chronological events.

**Features:**
- Vertical and horizontal orientations
- Event grouping by date
- User avatars
- Event metadata display
- Interactive events
- Responsive design

**Usage:**
```tsx
import { Timeline } from '@/components/widgets/advanced/Timeline';

const items = [
  {
    id: '1',
    type: 'update',
    title: 'Project Updated',
    description: 'Added new features to the dashboard',
    timestamp: new Date(2024, 0, 15, 14, 30),
    user: {
      name: 'John Doe',
      avatar: '/avatars/john.jpg',
    },
    metadata: {
      status: 'completed',
      priority: 'high',
    },
  },
  {
    id: '2',
    type: 'comment',
    title: 'New Comment',
    description: 'Great work on the new design!',
    timestamp: new Date(2024, 0, 14, 10, 15),
    user: {
      name: 'Jane Smith',
    },
  },
];

<Timeline
  items={items}
  orientation="vertical"
  onItemClick={(item) => console.log('Item clicked:', item)}
  showTime={true}
  groupByDate={true}
  permission="activity:read"
/>
```

**Props:**
- `items`: Array of ActivityItem objects
- `orientation`: 'vertical' | 'horizontal' (default: 'vertical')
- `onItemClick`: Callback when item is clicked
- `title`: Timeline title
- `maxHeight`: Maximum height for vertical timeline (default: '600px')
- `showTime`: Show time in timestamps (default: true)
- `groupByDate`: Group items by date (default: false)
- `permission`: Optional permission check

## Type Definitions

All advanced widgets use types from `../types/widget.types.ts`:

```typescript
interface KanbanColumn {
  id: string;
  title: string;
  items: KanbanItem[];
}

interface KanbanItem {
  id: string;
  title: string;
  description?: string;
  columnId: string;
  metadata?: Record<string, any>;
}

interface CalendarEvent {
  id: string;
  title: string;
  start: Date;
  end: Date;
  allDay?: boolean;
  color?: string;
  metadata?: Record<string, any>;
}

interface TreeNode {
  id: string;
  label: string;
  children?: TreeNode[];
  icon?: LucideIcon;
  metadata?: Record<string, any>;
}

interface ActivityItem {
  id: string;
  type: string;
  title: string;
  description?: string;
  timestamp: Date;
  user?: {
    name: string;
    avatar?: string;
  };
  metadata?: Record<string, any>;
}
```

## Theme Integration

All advanced widgets automatically adapt to the current theme:
- Use theme color tokens (primary, secondary, accent, etc.)
- Support light and dark modes
- Apply consistent spacing and typography
- Use theme border radius

## Accessibility

All advanced widgets include:
- Proper ARIA labels and roles
- Keyboard navigation support
- Focus indicators
- Screen reader announcements
- Color contrast compliance

## Performance

Advanced widgets are optimized for performance:
- Lazy loading support (TreeView)
- Virtualization for large datasets
- Memoized components
- Efficient drag-and-drop (KanbanBoard)
- Debounced interactions

## Dependencies

Advanced widgets require:
- `@dnd-kit/core`, `@dnd-kit/sortable`, `@dnd-kit/utilities` (KanbanBoard)
- `react-day-picker` (Calendar)
- `date-fns` (Calendar, Timeline)
- `lucide-react` (Icons)
- shadcn/ui components (Card, Button, Badge, ScrollArea)
