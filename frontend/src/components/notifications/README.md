# Notification Components

This directory contains all notification-related UI components for the notification system.

## Components

### NotificationCenter
The main notification component that displays a bell icon with unread count badge and dropdown panel.

**Usage:**
```tsx
import { NotificationCenter } from '@/components/notifications';

<NotificationCenter />
```

**Features:**
- Bell icon with unread count badge
- Dropdown panel with notification list
- Responsive design
- Accessible with ARIA labels

### NotificationList
Displays grouped notifications with loading and empty states.

**Features:**
- Groups notifications by date (Today, Yesterday, This Week, Older)
- Infinite scroll support
- Loading states
- Empty state with friendly message
- Scrollable area for long lists

### NotificationItem
Individual notification display with actions.

**Features:**
- Category-based icons
- Priority-based colors
- Unread indicator
- Mark as read button
- Delete button
- Action buttons from notification
- Relative timestamps
- Click to navigate

### NotificationFilters
Filter controls and bulk actions for notifications.

**Features:**
- Search input
- Category filter dropdown
- Priority filter dropdown
- "Mark All as Read" button
- "Clear All" button with confirmation dialog

### NotificationSoundSettings
Settings component for notification sound preferences.

**Features:**
- Enable/disable sound toggle
- Volume slider
- Test sound button
- Persists settings to localStorage

## Integration

### Add to Dashboard Header

```tsx
import { NotificationCenter } from '@/components/notifications';

export function Header() {
  return (
    <header>
      {/* Other header content */}
      <NotificationCenter />
    </header>
  );
}
```

### Add Sound Settings to Settings Page

```tsx
import { NotificationSoundSettings } from '@/components/notifications';

export default function NotificationSettingsPage() {
  return (
    <div>
      <NotificationSoundSettings />
    </div>
  );
}
```

## Notification Sound

The notification system includes sound support using Web Audio API.

**Features:**
- Plays sound on new notifications
- Respects user preferences
- Volume control
- Enable/disable toggle
- Settings persisted to localStorage

**Sound Settings:**
```typescript
interface NotificationSoundSettings {
  enabled: boolean;
  volume: number; // 0-1
}
```

## Accessibility

All components follow WCAG 2.1 AA standards and provide comprehensive accessibility support:

### Keyboard Navigation
- **Tab**: Navigate between interactive elements
- **Arrow Up/Down**: Navigate through notification list
- **Home/End**: Jump to first/last notification
- **Enter/Space**: Activate focused notification or button
- **Escape**: Close notification dropdown

### Screen Reader Support
- **Announcements**: New notifications are announced automatically
  - Urgent notifications use `aria-live="assertive"`
  - Normal notifications use `aria-live="polite"`
- **Unread Count**: Badge announces unread count changes
- **Semantic HTML**: Proper heading hierarchy and landmark regions
- **Text Alternatives**: All icons have descriptive labels
- **Status Updates**: Read/unread status changes are announced

### ARIA Attributes
- `aria-label`: Descriptive labels for all interactive elements
- `aria-expanded`: Indicates dropdown state
- `aria-haspopup`: Indicates popup/dialog presence
- `aria-describedby`: Links notifications to their content
- `aria-live`: Live regions for dynamic content
- `role="alert"`: Urgent notifications
- `role="status"`: Status updates
- `role="list"` and `role="listitem"`: Proper list semantics

### Focus Management
- **Focus Indicators**: Visible focus rings on all interactive elements
- **Focus Trap**: Dropdown maintains focus within panel
- **Focus Return**: Focus returns to trigger button when closing
- **Skip Links**: Keyboard users can skip to main content

### Visual Accessibility
- **Color Contrast**: All text meets WCAG AA contrast ratios (4.5:1)
- **Priority Indicators**: Visual and semantic indicators for urgency
- **Unread Indicators**: Multiple cues (color, badge, icon)
- **Dark Mode**: Full support with accessible contrast

### Component-Specific Features

#### NotificationCenter
- Bell icon has descriptive `aria-label` with unread count
- Badge announces count to screen readers
- Dropdown has `role="dialog"` and proper labeling

#### NotificationList
- List has `role="list"` with proper semantics
- Group headers provide context
- Loading states are announced
- Empty state has descriptive text

#### NotificationItem
- Each item has comprehensive `aria-label` with full context
- Priority is indicated both visually and semantically
- Action buttons have descriptive labels
- Timestamps are human-readable

#### NotificationAnnouncer
- Hidden component for screen reader announcements
- Announces new notifications with priority context
- Announces unread count changes
- Uses appropriate `aria-live` levels

### Testing Accessibility

Test with:
- **Keyboard Only**: Navigate without mouse
- **Screen Readers**: NVDA, JAWS, VoiceOver
- **Browser Tools**: Chrome DevTools Accessibility Inspector
- **Automated Tools**: axe DevTools, Lighthouse

### Best Practices

1. **Always provide text alternatives** for icons and images
2. **Use semantic HTML** (nav, main, article, etc.)
3. **Maintain focus order** that matches visual order
4. **Announce dynamic changes** with aria-live regions
5. **Test with real assistive technologies**

## Styling

Components use Tailwind CSS and shadcn/ui for consistent styling:

- Dark mode support
- Responsive design
- Theme-aware colors
- Smooth transitions

## Dependencies

- `@/contexts/NotificationContext` - Notification state management
- `@/lib/api` - API client for notifications
- `@/components/ui/*` - shadcn/ui components
- `lucide-react` - Icons
- `date-fns` - Date formatting
- `sonner` - Toast notifications
