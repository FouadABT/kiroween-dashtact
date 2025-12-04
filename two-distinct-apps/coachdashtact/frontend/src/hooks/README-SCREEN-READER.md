# Screen Reader Announcements

## Overview

The `useScreenReaderAnnouncement` hook provides accessible announcements for screen readers using ARIA live regions. This ensures that dynamic changes in the theme system are communicated to users who rely on assistive technologies.

## Implementation

### Hook: `useScreenReaderAnnouncement`

Located at: `frontend/src/hooks/useScreenReaderAnnouncement.ts`

The hook creates and manages a global ARIA live region that announces messages to screen readers without disrupting the user's current focus.

**Features:**
- Creates a single live region on first use
- Supports two priority levels: `polite` (default) and `assertive`
- Automatically clears announcements after 3 seconds
- Uses `sr-only` class to hide the live region visually

**Usage:**
```typescript
import { useScreenReaderAnnouncement } from '@/hooks/useScreenReaderAnnouncement';

function MyComponent() {
  const { announce } = useScreenReaderAnnouncement();
  
  const handleAction = () => {
    // Polite announcement (default)
    announce('Settings saved successfully');
    
    // Assertive announcement (for errors)
    announce('Failed to save settings', 'assertive');
  };
}
```

## Integration Points

### 1. Theme Mode Changes (ThemeContext)

When users switch between light, dark, or system themes, the change is announced:
- "Theme changed to light mode"
- "Theme changed to dark mode"
- "Theme changed to system (light)" or "Theme changed to system (dark)"

### 2. Settings Save/Reset (ThemeActions)

When users save or reset theme settings:
- Success: "Theme settings saved successfully" (polite)
- Error: "Failed to save theme settings" (assertive)
- Reset: "Theme settings reset to default values" (polite)

### 3. ARIA Labels on Controls

All theme controls include descriptive ARIA labels:

**ThemeModeSelector:**
- Radio group with `aria-label="Theme mode selection"`
- Each option has `aria-label` and `aria-describedby`
- Active state announced with `role="status"`

**ColorPaletteEditor:**
- Tab list with `aria-label="Color palette mode selection"`
- Each color input has `aria-label` and `aria-describedby`
- Contrast indicators have `role="status"`

**TypographyEditor:**
- All sections have `aria-expanded` and `aria-controls`
- Font families have `role="textbox"` with `aria-readonly="true"`
- Font scales use `role="list"` and `role="listitem"`
- All values have descriptive `aria-label` attributes

**ThemeActions:**
- Button group with `aria-label="Theme settings actions"`
- Each button has descriptive `aria-label`
- Loading states use `aria-busy` attribute

## Accessibility Compliance

This implementation follows WCAG 2.1 guidelines:
- **1.3.1 Info and Relationships**: Semantic structure with proper ARIA roles
- **4.1.2 Name, Role, Value**: All controls have accessible names
- **4.1.3 Status Messages**: Dynamic changes announced via live regions

## Testing

To test screen reader announcements:

1. **With NVDA (Windows):**
   - Enable NVDA
   - Navigate to theme settings
   - Change theme mode and listen for announcements
   - Save settings and verify success message

2. **With JAWS (Windows):**
   - Enable JAWS
   - Use keyboard navigation to access controls
   - Verify all labels are read correctly

3. **With VoiceOver (macOS):**
   - Enable VoiceOver (Cmd+F5)
   - Navigate theme settings with VO keys
   - Verify announcements are spoken

## Browser Support

The implementation uses standard ARIA attributes supported by all modern browsers:
- Chrome/Edge: Full support
- Firefox: Full support
- Safari: Full support

## Future Enhancements

Potential improvements for future iterations:
- Configurable announcement duration
- Multiple live regions for different priority levels
- Announcement history/log for debugging
- User preference for announcement verbosity
