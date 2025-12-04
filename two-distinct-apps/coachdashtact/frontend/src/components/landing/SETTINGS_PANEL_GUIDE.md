# Settings Panel Component Guide

## Overview

The `SettingsPanel` component provides a comprehensive, tabbed interface for configuring all aspects of a landing page, including general settings, SEO, theme, layout, performance, and advanced options.

## Features

### 1. General Settings Tab
- **Page Title**: Browser tab and search result title
- **Meta Description**: SEO description with character counter (160 chars)
- **Favicon**: Icon upload with URL input
- **Language**: Multi-language selector (8 languages supported)

### 2. SEO Settings Tab
Organized with accordions for better UX:

#### Open Graph (Facebook, LinkedIn)
- OG Title
- OG Description
- OG Image URL with upload button
- Image size recommendation (1200x630px)

#### Twitter Card
- Card type selector (Summary / Summary Large Image)

#### Advanced SEO
- Structured Data toggle (JSON-LD)

### 3. Theme Settings Tab
Complete theme customization:

#### Theme Mode
- Light Only
- Dark Only
- Auto (System Preference)
- User Toggle

#### Light Mode Colors
- Primary Color
- Secondary Color
- Accent Color

#### Dark Mode Colors
- Separate color pickers for dark mode variants

#### Color Palette Suggestions
6 pre-built palettes:
- Ocean Blue
- Forest Green
- Sunset Orange
- Royal Purple
- Rose Pink
- Slate Gray

Each palette can be applied with one click.

### 4. Layout Settings Tab
- **Container Width**: Full / Wide (1400px) / Standard (1200px) / Narrow (960px)
- **Section Spacing**: Compact (2rem) / Normal (4rem) / Relaxed (6rem)
- **Content Alignment**: Left / Center / Right

### 5. Performance Settings Tab
- **Image Optimization**: Auto-compress and optimize images
- **Lazy Loading**: Load content as it enters viewport
- **Cache Strategy**: Aggressive (1 hour) / Normal (5 min) / Minimal (1 min)

### 6. Advanced Settings Tab
Organized with accordions:

#### Custom CSS
- Syntax-highlighted textarea
- Apply custom styles to landing page

#### Custom JavaScript
- Syntax-highlighted textarea
- Warning about potential functionality impact

#### Analytics Integration
- Google Analytics ID (G-XXXXXXXXXX)
- Google Tag Manager ID (GTM-XXXXXXX)

#### Third-Party Scripts
- Multiple script URLs (one per line)
- External script loading

## Usage

```tsx
import { SettingsPanel } from '@/components/landing/SettingsPanel';
import type { LandingSettings } from '@/types/landing-cms';

function MyComponent() {
  const [settings, setSettings] = useState<LandingSettings>(defaultSettings);
  const [isSaving, setIsSaving] = useState(false);

  const handleSave = async () => {
    setIsSaving(true);
    try {
      await api.saveSettings(settings);
      toast.success('Settings saved');
    } catch (error) {
      toast.error('Failed to save');
    } finally {
      setIsSaving(false);
    }
  };

  const handleReset = () => {
    setSettings(defaultSettings);
  };

  return (
    <SettingsPanel
      settings={settings}
      onChange={setSettings}
      onSave={handleSave}
      onReset={handleReset}
      isSaving={isSaving}
    />
  );
}
```

## Props

| Prop | Type | Description |
|------|------|-------------|
| `settings` | `LandingSettings` | Current settings object |
| `onChange` | `(settings: LandingSettings) => void` | Called when settings change |
| `onSave` | `() => Promise<void>` | Called when save button clicked |
| `onReset` | `() => void` | Called when reset button clicked |
| `isSaving` | `boolean` | Optional. Shows saving state |

## Settings Structure

```typescript
interface LandingSettings {
  general: {
    title: string;
    description: string;
    favicon: string;
    language: string;
  };
  seo: {
    ogTitle: string;
    ogDescription: string;
    ogImage: string;
    twitterCard: 'summary' | 'summary_large_image';
    structuredData: boolean;
  };
  theme: {
    mode: 'light' | 'dark' | 'auto' | 'toggle';
    colors: {
      primary: { light: string; dark: string };
      secondary: { light: string; dark: string };
      accent: { light: string; dark: string };
    };
  };
  layout: {
    containerWidth: 'full' | 'wide' | 'standard' | 'narrow';
    sectionSpacing: 'compact' | 'normal' | 'relaxed';
    contentAlignment: 'left' | 'center' | 'right';
  };
  performance: {
    imageOptimization: boolean;
    lazyLoading: boolean;
    cacheStrategy: 'aggressive' | 'normal' | 'minimal';
  };
  advanced?: {
    customCSS?: string;
    customJS?: string;
    analyticsId?: string;
    gtmId?: string;
    thirdPartyScripts?: string[];
  };
}
```

## Helper Components

### HelpTooltip
Displays contextual help with a question mark icon:

```tsx
<Label>
  Page Title
  <HelpTooltip content="The title that appears in browser tabs" />
</Label>
```

### ColorPicker
Color input with both visual picker and hex input:

```tsx
<ColorPicker
  label="Primary Color"
  value="#0ea5e9"
  onChange={(color) => updateSettings('theme.colors.primary.light', color)}
/>
```

## Features

### Contextual Help
Every setting includes a help tooltip explaining its purpose and usage.

### Before/After Preview
Toggle button to show/hide preview of changes before saving.

### Save/Reset Actions
- **Save**: Persists all changes with loading state
- **Reset**: Reverts to default settings with confirmation

### Nested Settings Updates
The `updateSettings` function supports dot notation for nested updates:

```tsx
updateSettings('theme.colors.primary.light', '#0ea5e9');
updateSettings('general.title', 'New Title');
```

### Toast Notifications
- Success message on save
- Info message on reset
- Error message on save failure

## Accessibility

- All inputs have associated labels
- Help tooltips provide additional context
- Keyboard navigation supported
- Focus indicators on all interactive elements
- ARIA attributes for screen readers

## Responsive Design

- Mobile-friendly tabbed interface
- Scrollable content areas
- Sticky header with actions
- Responsive button layout

## Demo Page

View the component in action:
```
/admin/settings-panel-demo
```

## Integration with Visual Editor

The SettingsPanel can be integrated into the Visual Editor as a sidebar panel or modal:

```tsx
<VisualEditor>
  <EditorSidebar>
    <SettingsPanel {...props} />
  </EditorSidebar>
</VisualEditor>
```

## Best Practices

1. **Validation**: Validate settings before saving
2. **Debouncing**: Consider debouncing onChange for performance
3. **Persistence**: Save settings to backend API
4. **Defaults**: Provide sensible default values
5. **Preview**: Show live preview of changes when possible
6. **Confirmation**: Confirm destructive actions (reset)

## Future Enhancements

- [ ] Real-time preview of theme changes
- [ ] Import/export settings as JSON
- [ ] Settings presets/templates
- [ ] Validation error display
- [ ] Undo/redo for settings changes
- [ ] Settings search/filter
- [ ] Keyboard shortcuts
- [ ] Settings comparison view
