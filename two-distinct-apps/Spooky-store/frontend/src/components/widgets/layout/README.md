# Layout Widgets

Layout widgets provide essential components for page structure, empty states, error handling, and loading states.

## Components

### PageHeader

Displays page title, description, breadcrumbs, and action buttons with responsive layout.

**Features:**
- Page title and description
- Breadcrumb navigation
- Action buttons area
- Responsive design (stacks on mobile)
- Theme-aware styling

**Usage:**
```tsx
import { PageHeader } from '@/components/widgets/layout';
import { Button } from '@/components/ui/button';

<PageHeader
  title="User Management"
  description="Manage users and their permissions"
  breadcrumbs={[
    { label: 'Dashboard', href: '/dashboard' },
    { label: 'Settings', href: '/dashboard/settings' },
    { label: 'Users' }
  ]}
  actions={
    <>
      <Button variant="outline">Export</Button>
      <Button>Add User</Button>
    </>
  }
/>
```

### EmptyState

Displays a centered message when no content is available.

**Features:**
- Optional icon display
- Title and description
- Optional call-to-action button
- Centered layout
- Theme-aware styling

**Usage:**
```tsx
import { EmptyState } from '@/components/widgets/layout';
import { Inbox } from 'lucide-react';

<EmptyState
  icon={Inbox}
  title="No messages"
  description="You don't have any messages yet. Start a conversation to see messages here."
  action={{
    label: "Send a message",
    onClick: () => router.push('/messages/new')
  }}
/>
```

### ErrorBoundary

Catches React errors in the widget tree and displays a fallback UI.

**Features:**
- Catches React errors
- Displays error message
- Retry button to reset error state
- Logs errors to console
- Custom fallback UI support
- Development mode error details

**Usage:**
```tsx
import { ErrorBoundary } from '@/components/widgets/layout';

// Basic usage
<ErrorBoundary>
  <MyWidget />
</ErrorBoundary>

// With custom fallback
<ErrorBoundary fallback={<CustomErrorUI />}>
  <MyWidget />
</ErrorBoundary>

// With error callback
<ErrorBoundary
  onError={(error, errorInfo) => {
    logErrorToService(error, errorInfo);
  }}
>
  <MyWidget />
</ErrorBoundary>
```

### SkeletonLoader

Displays loading placeholders that match the layout of actual widgets.

**Features:**
- Multiple variants: text, card, table, chart
- Configurable count for repeating patterns
- Matches actual widget layouts
- Theme-aware styling
- Smooth animations

**Usage:**
```tsx
import { SkeletonLoader } from '@/components/widgets/layout';

// Text skeleton
<SkeletonLoader variant="text" count={3} />

// Card skeleton
<SkeletonLoader variant="card" count={4} />

// Table skeleton
<SkeletonLoader variant="table" count={5} />

// Chart skeleton
<SkeletonLoader variant="chart" />
```

## Integration with Other Widgets

### Using SkeletonLoader in WidgetContainer

```tsx
import { WidgetContainer } from '@/components/widgets/core';
import { SkeletonLoader } from '@/components/widgets/layout';

<WidgetContainer
  title="User Statistics"
  loading={isLoading}
>
  {isLoading ? (
    <SkeletonLoader variant="chart" />
  ) : (
    <ChartWidget data={data} />
  )}
</WidgetContainer>
```

### Using ErrorBoundary with Widgets

```tsx
import { ErrorBoundary } from '@/components/widgets/layout';
import { DataTable } from '@/components/widgets/core';

<ErrorBoundary>
  <DataTable
    data={users}
    columns={columns}
  />
</ErrorBoundary>
```

### Using EmptyState in Lists

```tsx
import { EmptyState } from '@/components/widgets/layout';
import { ListWidget } from '@/components/widgets/data-display';

{items.length === 0 ? (
  <EmptyState
    icon={FileText}
    title="No items found"
    description="Try adjusting your filters or create a new item"
    action={{
      label: "Create Item",
      onClick: handleCreate
    }}
  />
) : (
  <ListWidget items={items} />
)}
```

## Accessibility

All layout widgets follow WCAG AA accessibility standards:

- **PageHeader**: Proper heading hierarchy, semantic HTML
- **EmptyState**: ARIA labels, keyboard navigation for buttons
- **ErrorBoundary**: Role="alert" for error messages, keyboard accessible retry button
- **SkeletonLoader**: Proper ARIA attributes for loading states

## Theme Integration

All components use theme tokens for consistent styling:

- Background colors: `bg-background`, `bg-card`, `bg-muted`
- Text colors: `text-foreground`, `text-muted-foreground`
- Border colors: `border-border`
- Semantic colors: `text-destructive`, `bg-destructive`

## Responsive Design

Components are fully responsive:

- **PageHeader**: Stacks title/actions on mobile, side-by-side on desktop
- **EmptyState**: Adjusts padding and icon size for mobile
- **ErrorBoundary**: Responsive error message layout
- **SkeletonLoader**: Responsive grid layouts for card variant

## Best Practices

1. **Always wrap widgets in ErrorBoundary** to prevent entire page crashes
2. **Use SkeletonLoader** that matches your actual widget layout
3. **Provide meaningful EmptyState messages** with clear actions
4. **Use PageHeader consistently** across all pages for navigation clarity
5. **Test error states** by throwing errors in development mode

## Examples

See `examples.tsx` in this directory for comprehensive usage examples.
