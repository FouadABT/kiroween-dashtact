# Navigation Components

This directory contains navigation-related components for the application.

## Components

### Breadcrumb

A fully accessible breadcrumb navigation component that automatically generates breadcrumbs from the current pathname.

**Features:**
- ✅ Automatic breadcrumb generation from URL path
- ✅ Dynamic label resolution with template strings
- ✅ WCAG AA compliant with proper ARIA labels
- ✅ Semantic HTML (`<nav>`, `<ol>`, `<li>`)
- ✅ Keyboard navigation support with focus indicators
- ✅ Theme-aware styling (light/dark mode)
- ✅ Responsive design
- ✅ Custom separator support
- ✅ Truncation for long breadcrumb trails
- ✅ Hidden breadcrumb items support

**Basic Usage:**
```tsx
import { Breadcrumb } from '@/components/navigation';

export default function Page() {
  return <Breadcrumb />;
}
```

**With Dynamic Values:**
```tsx
import { Breadcrumb } from '@/components/navigation';

export default function UserPage({ params }: { params: { id: string } }) {
  const [user, setUser] = useState(null);
  
  useEffect(() => {
    // Load user data
    fetchUser(params.id).then(setUser);
  }, [params.id]);
  
  return (
    <Breadcrumb 
      dynamicValues={{ 
        userName: user?.name || 'Loading...',
        userId: params.id 
      }}
    />
  );
}
```

**Custom Items:**
```tsx
<Breadcrumb 
  customItems={[
    { label: 'Home', href: '/' },
    { label: 'Products', href: '/products' },
    { label: 'Electronics', href: '/products/electronics' }
  ]}
/>
```

**Without Home Icon:**
```tsx
<Breadcrumb showHome={false} />
```

**Custom Separator:**
```tsx
import { Slash } from 'lucide-react';

<Breadcrumb separator={<Slash className="h-4 w-4" />} />
```

**With Truncation:**
```tsx
<Breadcrumb maxItems={4} />
```

### BreadcrumbCompact

A compact breadcrumb variant that only shows the parent and current page. Ideal for mobile views or tight spaces.

**Usage:**
```tsx
import { BreadcrumbCompact } from '@/components/navigation';

export default function MobilePage() {
  return (
    <div className="md:hidden">
      <BreadcrumbCompact />
    </div>
  );
}
```

## Accessibility

### ARIA Labels
- `aria-label="Breadcrumb"` on the `<nav>` element
- `aria-current="page"` on the current page item
- `aria-label="Home"` on the home icon link

### Keyboard Navigation
- All links are keyboard accessible
- Focus indicators with ring styling
- Proper tab order

### Screen Readers
- Semantic HTML structure (`<nav>`, `<ol>`, `<li>`)
- Separators marked with `aria-hidden="true"`
- Current page clearly identified

### Color Contrast
- Meets WCAG AA standards in both light and dark modes
- Muted foreground for non-current items
- Full foreground for current page

## Styling

The component uses Tailwind CSS with theme-aware classes:

- `text-foreground` - Current page text
- `text-muted-foreground` - Link and separator text
- `hover:text-foreground` - Link hover state
- `focus:ring-2 focus:ring-ring` - Focus indicator

All colors automatically adapt to the current theme (light/dark mode).

## Integration with Metadata System

The Breadcrumb component integrates with the metadata configuration system:

1. **Automatic Labels**: Reads breadcrumb labels from `metadata-config.ts`
2. **Dynamic Resolution**: Supports template strings like `{userName}`
3. **Hidden Items**: Respects `breadcrumb.hidden` flag in metadata
4. **Fallback Formatting**: Auto-formats segment names if no label defined

**Example Metadata Config:**
```typescript
// lib/metadata-config.ts
export const metadataConfig = {
  '/dashboard/users/:id': {
    title: 'User: {userName}',
    breadcrumb: { 
      label: '{userName}', 
      dynamic: true 
    }
  },
  '/dashboard/settings/advanced': {
    title: 'Advanced Settings',
    breadcrumb: { 
      label: 'Advanced',
      hidden: false 
    }
  }
};
```

## Performance

- **Memoized**: Component uses `React.memo` to prevent unnecessary re-renders
- **Computed Once**: Breadcrumbs computed with `useMemo` hook
- **Minimal Re-renders**: Only updates when pathname or dynamic values change

## Examples

### Responsive Breadcrumbs
```tsx
export default function Page() {
  return (
    <>
      {/* Desktop: Full breadcrumbs */}
      <div className="hidden md:block">
        <Breadcrumb />
      </div>
      
      {/* Mobile: Compact breadcrumbs */}
      <div className="md:hidden">
        <BreadcrumbCompact />
      </div>
    </>
  );
}
```

### With Page Header
```tsx
import { Breadcrumb } from '@/components/navigation';

export default function Page() {
  return (
    <div className="space-y-4">
      <Breadcrumb />
      
      <div className="flex items-start justify-between">
        <div>
          <h1 className="text-3xl font-bold">Page Title</h1>
          <p className="text-muted-foreground">Page description</p>
        </div>
        
        <div className="flex gap-2">
          {/* Action buttons */}
        </div>
      </div>
      
      {/* Page content */}
    </div>
  );
}
```

### Conditional Display
```tsx
export default function Page() {
  const pathname = usePathname();
  const showBreadcrumbs = pathname !== '/';
  
  return (
    <>
      {showBreadcrumbs && <Breadcrumb />}
      {/* Page content */}
    </>
  );
}
```

## Testing

The component includes comprehensive test coverage:

```bash
npm test breadcrumb-helpers.test.ts  # Helper functions
npm test Breadcrumb.test.tsx         # Component rendering
```

Test scenarios:
- ✅ Breadcrumb generation from pathname
- ✅ Dynamic label resolution
- ✅ Hidden items filtering
- ✅ Custom items rendering
- ✅ Accessibility attributes
- ✅ Keyboard navigation
- ✅ Theme styling
- ✅ Truncation behavior
