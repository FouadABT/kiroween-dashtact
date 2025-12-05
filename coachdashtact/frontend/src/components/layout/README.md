# Layout Components

Reusable layout components for consistent page structure across the application.

## Components

### PageHeader

A comprehensive page header component that combines breadcrumb navigation, page title, description, and action buttons.

**Features:**
- Breadcrumb navigation integration
- Title and description display
- Actions slot for page-level buttons
- Theme-aware styling
- Responsive design
- Accessibility support

**Basic Usage:**

```tsx
import { PageHeader } from '@/components/layout';

function MyPage() {
  return (
    <div>
      <PageHeader
        title="User Management"
        description="Manage users and permissions"
      />
      {/* Page content */}
    </div>
  );
}
```

**With Actions:**

```tsx
import { PageHeader } from '@/components/layout';
import { Button } from '@/components/ui/button';
import { Plus } from 'lucide-react';

function UsersPage() {
  return (
    <div>
      <PageHeader
        title="Users"
        description="Manage system users"
        actions={
          <>
            <Button variant="outline">
              Export
            </Button>
            <Button>
              <Plus className="h-4 w-4 mr-2" />
              Add User
            </Button>
          </>
        }
      />
      {/* Page content */}
    </div>
  );
}
```

**With Custom Breadcrumbs:**

```tsx
import { PageHeader } from '@/components/layout';

function EditUserPage() {
  return (
    <PageHeader
      title="Edit User"
      description="Update user information"
      breadcrumbProps={{
        customItems: [
          { label: 'Dashboard', href: '/dashboard' },
          { label: 'Users', href: '/dashboard/users' },
          { label: 'John Doe', href: '/dashboard/users/123' },
          { label: 'Edit', href: '/dashboard/users/123/edit' }
        ]
      }}
    />
  );
}
```

**With Dynamic Values:**

```tsx
import { PageHeader } from '@/components/layout';

function UserDetailPage({ userName }: { userName: string }) {
  return (
    <PageHeader
      title={userName}
      description="User profile and settings"
      breadcrumbProps={{
        dynamicValues: {
          userName: userName
        }
      }}
    />
  );
}
```

**Without Breadcrumbs:**

```tsx
import { PageHeader } from '@/components/layout';

function DashboardPage() {
  return (
    <PageHeader
      title="Dashboard"
      description="Welcome back!"
      breadcrumbProps={false}
    />
  );
}
```

**Size Variants:**

```tsx
import { PageHeader } from '@/components/layout';

// Small
<PageHeader
  title="Settings"
  size="sm"
/>

// Default
<PageHeader
  title="Dashboard"
  size="default"
/>

// Large
<PageHeader
  title="Welcome"
  size="lg"
/>
```

**Without Divider:**

```tsx
import { PageHeader } from '@/components/layout';

<PageHeader
  title="My Page"
  showDivider={false}
/>
```

### PageHeaderCompact

A compact variant of PageHeader for mobile or constrained spaces.

```tsx
import { PageHeaderCompact } from '@/components/layout';

function MobilePage() {
  return (
    <PageHeaderCompact
      title="Users"
      description="Manage system users"
      actions={<Button size="sm">Add</Button>}
    />
  );
}
```

### PageHeaderSkeleton

A loading skeleton for PageHeader while data is being fetched.

```tsx
import { PageHeaderSkeleton } from '@/components/layout';

function LoadingPage() {
  return (
    <div>
      <PageHeaderSkeleton
        showBreadcrumb={true}
        showDescription={true}
        showActions={true}
      />
      {/* Loading content */}
    </div>
  );
}
```

## Props

### PageHeaderProps

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `title` | `string` | Required | Page title to display |
| `description` | `string` | - | Optional page description/subtitle |
| `breadcrumbProps` | `BreadcrumbProps \| false` | `{}` | Props for Breadcrumb component or false to hide |
| `actions` | `React.ReactNode` | - | Action buttons or elements |
| `className` | `string` | `''` | Additional CSS classes |
| `showDivider` | `boolean` | `true` | Whether to show divider below header |
| `size` | `'sm' \| 'default' \| 'lg'` | `'default'` | Title size variant |

## Integration with Metadata System

PageHeader works seamlessly with the metadata system:

```tsx
import { PageHeader } from '@/components/layout';
import { useMetadata } from '@/contexts/MetadataContext';
import { useEffect } from 'react';

function UserDetailPage({ userId }: { userId: string }) {
  const { setDynamicValues } = useMetadata();
  const [user, setUser] = useState(null);

  useEffect(() => {
    async function loadUser() {
      const userData = await fetchUser(userId);
      setUser(userData);
      
      // Update breadcrumb labels
      setDynamicValues({
        userName: userData.name,
        userId: userId
      });
    }
    
    loadUser();
  }, [userId, setDynamicValues]);

  if (!user) return <PageHeaderSkeleton />;

  return (
    <PageHeader
      title={user.name}
      description={`User ID: ${userId}`}
      breadcrumbProps={{
        dynamicValues: {
          userName: user.name
        }
      }}
      actions={
        <Button>Edit User</Button>
      }
    />
  );
}
```

## Accessibility

PageHeader follows accessibility best practices:

- **Semantic HTML**: Uses `<h1>` for page title
- **ARIA Labels**: Breadcrumb navigation has proper ARIA labels
- **Keyboard Navigation**: All interactive elements are keyboard accessible
- **Focus Management**: Proper focus indicators on all interactive elements
- **Color Contrast**: Theme-aware colors meet WCAG AA standards
- **Screen Readers**: Descriptive text for all elements

## Responsive Design

PageHeader adapts to different screen sizes:

- **Desktop**: Title and actions side-by-side
- **Tablet**: Title and actions stack with proper spacing
- **Mobile**: Compact layout with truncated text
- **Use PageHeaderCompact**: For mobile-specific layouts

## Theme Support

PageHeader uses theme-aware classes:

- `text-foreground` - Primary text color
- `text-muted-foreground` - Secondary text color
- `border-border` - Border color
- All colors automatically adapt to light/dark mode

## Examples

See the [examples directory](../../examples/page-header-usage.tsx) for more usage examples.

## Related Components

- [Breadcrumb](../navigation/README.md) - Breadcrumb navigation component
- [Button](../ui/button.tsx) - Button component for actions
- [MetadataContext](../../contexts/MetadataContext.tsx) - Metadata management

## Requirements

This component fulfills the following requirements:

- **Requirement 2.1**: Breadcrumb navigation integration
- **Requirement 7.4**: Theme-aware styling with proper color contrast
