# Utility Widgets

Small, reusable UI components for common interface elements.

## Components

### Badge

Versatile badge component with variants, sizes, and icon support.

**Features:**
- 5 variants: default, success, warning, error, info
- 3 sizes: sm, md, lg
- Optional icon support
- Theme-aware colors

**Usage:**
```tsx
import { Badge } from '@/components/widgets/utility/Badge';
import { Check, AlertTriangle } from 'lucide-react';

// Basic badge
<Badge>Default</Badge>

// With variant
<Badge variant="success">Active</Badge>
<Badge variant="warning">Pending</Badge>
<Badge variant="error">Failed</Badge>
<Badge variant="info">Info</Badge>

// With size
<Badge size="sm">Small</Badge>
<Badge size="md">Medium</Badge>
<Badge size="lg">Large</Badge>

// With icon
<Badge variant="success" icon={Check}>
  Verified
</Badge>

<Badge variant="warning" icon={AlertTriangle}>
  Warning
</Badge>
```

### Avatar

Flexible avatar component with image support, fallback initials, and status indicators.

**Features:**
- Image with automatic fallback to initials
- 5 sizes: xs, sm, md, lg, xl
- Status indicators: online, offline, away
- Theme-aware styling

**Usage:**
```tsx
import { Avatar } from '@/components/widgets/utility/Avatar';

// With image
<Avatar
  src="/avatar.jpg"
  fallback="JD"
  size="md"
/>

// With fallback initials
<Avatar
  fallback="AB"
  size="lg"
/>

// With status indicator
<Avatar
  src="/avatar.jpg"
  fallback="JD"
  size="md"
  status="online"
/>

<Avatar
  fallback="CD"
  size="sm"
  status="away"
/>

// Different sizes
<Avatar fallback="XS" size="xs" />
<Avatar fallback="SM" size="sm" />
<Avatar fallback="MD" size="md" />
<Avatar fallback="LG" size="lg" />
<Avatar fallback="XL" size="xl" />
```

### Tooltip

Flexible tooltip component with positioning and configurable delay.

**Features:**
- 4 positions: top, bottom, left, right
- Configurable delay
- Theme-aware styling
- Accessible (ARIA attributes)

**Usage:**
```tsx
import { Tooltip } from '@/components/widgets/utility/Tooltip';
import { Info } from 'lucide-react';

// Basic tooltip
<Tooltip content="This is a tooltip">
  <button>Hover me</button>
</Tooltip>

// With positioning
<Tooltip content="Top tooltip" side="top">
  <button>Top</button>
</Tooltip>

<Tooltip content="Bottom tooltip" side="bottom">
  <button>Bottom</button>
</Tooltip>

<Tooltip content="Left tooltip" side="left">
  <button>Left</button>
</Tooltip>

<Tooltip content="Right tooltip" side="right">
  <button>Right</button>
</Tooltip>

// With custom delay
<Tooltip content="Delayed tooltip" delay={500}>
  <button>Slow hover</button>
</Tooltip>

// With icon
<Tooltip content="More information about this feature">
  <Info className="h-4 w-4 text-muted-foreground cursor-help" />
</Tooltip>

// Rich content
<Tooltip
  content={
    <div>
      <p className="font-semibold">Feature Name</p>
      <p className="text-sm">Detailed description here</p>
    </div>
  }
>
  <button>Rich tooltip</button>
</Tooltip>
```

### Modal

Flexible modal dialog component with size variants and permission checks.

**Features:**
- 5 sizes: sm, md, lg, xl, full
- Permission-based access control
- Theme-aware styling
- Accessible (keyboard navigation, focus management)

**Usage:**
```tsx
import { Modal } from '@/components/widgets/utility/Modal';
import { useState } from 'react';

function MyComponent() {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <>
      <button onClick={() => setIsOpen(true)}>
        Open Modal
      </button>

      <Modal
        open={isOpen}
        onClose={() => setIsOpen(false)}
        title="Modal Title"
        size="md"
      >
        <p>Modal content goes here</p>
      </Modal>
    </>
  );
}

// Different sizes
<Modal open={open} onClose={onClose} title="Small" size="sm">
  <p>Small modal content</p>
</Modal>

<Modal open={open} onClose={onClose} title="Medium" size="md">
  <p>Medium modal content</p>
</Modal>

<Modal open={open} onClose={onClose} title="Large" size="lg">
  <p>Large modal content</p>
</Modal>

<Modal open={open} onClose={onClose} title="Extra Large" size="xl">
  <p>Extra large modal content</p>
</Modal>

<Modal open={open} onClose={onClose} title="Full Screen" size="full">
  <p>Full screen modal content</p>
</Modal>

// With permission check
<Modal
  open={open}
  onClose={onClose}
  title="Edit User"
  size="md"
  permission="users:write"
>
  <UserForm />
</Modal>

// Form in modal
<Modal
  open={open}
  onClose={onClose}
  title="Create Post"
  size="lg"
>
  <form onSubmit={handleSubmit}>
    <div className="space-y-4">
      <input type="text" placeholder="Title" />
      <textarea placeholder="Content" />
      <div className="flex justify-end gap-2">
        <button type="button" onClick={onClose}>
          Cancel
        </button>
        <button type="submit">
          Create
        </button>
      </div>
    </div>
  </form>
</Modal>
```

## Theme Integration

All utility widgets automatically adapt to the current theme:

- **Colors**: Use theme color tokens (primary, secondary, destructive, etc.)
- **Typography**: Inherit theme font settings
- **Dark Mode**: Automatically adjust for light/dark themes
- **Borders**: Use theme border radius

## Accessibility

All utility widgets follow WCAG AA accessibility standards:

- **Keyboard Navigation**: Full keyboard support
- **ARIA Attributes**: Proper labels and roles
- **Focus Indicators**: Visible focus states
- **Screen Readers**: Descriptive announcements

## Best Practices

### Badge
- Use semantic variants (success for positive, error for negative)
- Keep text short (1-2 words)
- Use icons to reinforce meaning
- Don't overuse - reserve for important status indicators

### Avatar
- Always provide fallback text (initials)
- Use consistent sizes across your app
- Status indicators should be meaningful (online/offline/away)
- Optimize images for avatar sizes

### Tooltip
- Keep content concise
- Use for supplementary information only
- Don't hide critical information in tooltips
- Test with keyboard navigation

### Modal
- Use appropriate sizes for content
- Always provide a way to close (X button, ESC key, backdrop click)
- Focus management: focus first input on open, return focus on close
- Use for focused tasks, not navigation

## Examples

See `examples.tsx` for comprehensive usage examples.
