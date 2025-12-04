# Branding & Theme Integration Guide

## Overview

This guide covers the branding integration and theme mode features for the Landing CMS. These features allow landing pages to automatically sync with brand settings and support light/dark theme modes.

## Components

### 1. BrandingPanel

Displays current branding settings with sync and edit capabilities.

**Usage:**

```tsx
import { BrandingPanel } from '@/components/landing/BrandingPanel';

// Full panel
<BrandingPanel 
  onSync={handleSync}
  onEdit={handleEdit}
/>

// Compact panel
<BrandingPanel compact />
```

**Features:**
- Displays brand name, tagline, and description
- Shows light and dark mode logos
- Lists social links
- Sync button to apply branding to landing pages
- Edit button to navigate to branding settings

### 2. LandingThemeProvider

Context provider for theme management on landing pages.

**Usage:**

```tsx
import { LandingThemeProvider } from '@/contexts/LandingThemeContext';

<LandingThemeProvider 
  defaultMode="auto"
  enableToggle={true}
  storageKey="landing-theme-mode"
>
  {children}
</LandingThemeProvider>
```

**Theme Modes:**
- `light` - Always light theme
- `dark` - Always dark theme
- `auto` - Follows system preference
- `toggle` - User can toggle between light/dark

### 3. ThemeToggle

Button component for visitors to toggle between light and dark themes.

**Usage:**

```tsx
import { ThemeToggle } from '@/components/landing/ThemeToggle';

// Icon only
<ThemeToggle />

// With label
<ThemeToggle showLabel size="default" />

// Different variants
<ThemeToggle variant="outline" showLabel />
<ThemeToggle variant="default" showLabel />
```

### 4. ThemePreview

Editor component for previewing themes side-by-side.

**Usage:**

```tsx
import { ThemePreview } from '@/components/landing/ThemePreview';

<ThemePreview showControls>
  <YourLandingSection />
</ThemePreview>
```

**Features:**
- Theme mode selector (light/dark/auto/toggle)
- Single view or side-by-side comparison
- Current theme indicator
- Real-time preview updates

### 5. BulkBrandingUpdate

Dialog component for applying branding to all landing pages.

**Usage:**

```tsx
import { BulkBrandingUpdate } from '@/components/landing/BulkBrandingUpdate';

<BulkBrandingUpdate onComplete={handleComplete} />
```

**Features:**
- Progress indicator
- Preview of what will be updated
- Success/error feedback
- Rollback capability

### 6. ThemeAwareSection

Example section component that adapts to theme mode.

**Usage:**

```tsx
import { ThemeAwareSection } from '@/components/landing/ThemeAwareSection';

<ThemeAwareSection
  title="Your Title"
  description="Your description"
  ctaText="Get Started"
  backgroundImage={{
    light: '/images/hero-light.jpg',
    dark: '/images/hero-dark.jpg',
  }}
  brandColors={{
    light: {
      primary: 'hsl(222.2 47.4% 11.2%)',
      secondary: 'hsl(215.4 16.3% 46.9%)',
    },
    dark: {
      primary: 'hsl(210 40% 98%)',
      secondary: 'hsl(215 20.2% 65.1%)',
    },
  }}
/>
```

## API Methods

### Branding API

```typescript
import { BrandingApi } from '@/lib/api';

// Get branding settings (public)
const branding = await BrandingApi.getBrandSettings();

// Update branding (admin)
await BrandingApi.updateBrandSettings({
  brandName: 'My Brand',
  tagline: 'My Tagline',
});

// Upload logos
await BrandingApi.uploadLogo(file);
await BrandingApi.uploadLogoDark(file);
```

### Landing API

```typescript
import { LandingApi } from '@/lib/api';

// Get theme configuration
const theme = await LandingApi.getThemeConfig();

// Update theme configuration
await LandingApi.updateThemeConfig({
  themeMode: 'auto',
  colors: { /* ... */ },
});

// Sync branding
await LandingApi.syncBranding(brandSettings);

// Apply branding to all pages
const result = await LandingApi.applyBrandingToAll(brandSettings);
```

## Color Utilities

Utilities for color manipulation and dark mode generation.

```typescript
import {
  generateDarkModeColor,
  generateDarkModePalette,
  getContrastRatio,
  meetsContrastStandard,
  validateAndSuggestContrast,
} from '@/lib/color-utils';

// Generate dark mode color from light color
const darkColor = generateDarkModeColor('hsl(222.2 47.4% 11.2%)');

// Generate complete dark palette
const darkPalette = generateDarkModePalette(lightPalette);

// Check contrast ratio
const ratio = getContrastRatio(foreground, background);
const meetsAA = meetsContrastStandard(foreground, background, 'AA');

// Get suggestions for better contrast
const { ratio, meetsAA, suggestion } = validateAndSuggestContrast(
  foreground,
  background
);
```

## Backend Integration

### Branding Sync

The backend automatically syncs branding settings with landing pages:

```typescript
// Sync branding to current landing page
POST /api/landing/sync-branding
Body: { brandName, logoUrl, logoDarkUrl, socialLinks, ... }

// Apply branding to all landing pages
POST /api/landing/apply-branding-all
Body: { brandName, logoUrl, logoDarkUrl, socialLinks, ... }
```

### Theme Configuration

```typescript
// Get theme configuration
GET /api/landing/theme

// Update theme configuration
PUT /api/landing/theme
Body: { themeMode: 'auto', colors: { ... } }
```

## Best Practices

### 1. Theme-Aware Images

Always provide both light and dark variants for images:

```tsx
<img 
  src={resolvedTheme === 'light' ? lightImage : darkImage}
  alt="Hero"
/>
```

### 2. Brand Colors

Use brand colors from branding settings:

```tsx
const { colors } = useLandingTheme();
const currentColors = resolvedTheme === 'light' ? colors.light : colors.dark;

<Button style={{ backgroundColor: currentColors.primary }}>
  CTA Button
</Button>
```

### 3. Smooth Transitions

Add transitions for theme changes:

```css
.theme-aware-element {
  transition: background-color 0.3s ease, color 0.3s ease;
}
```

### 4. Contrast Validation

Always validate contrast ratios for accessibility:

```typescript
const { meetsAA, suggestion } = validateAndSuggestContrast(
  textColor,
  backgroundColor
);

if (!meetsAA && suggestion) {
  // Use suggested color
  textColor = suggestion;
}
```

### 5. System Preference Detection

Respect user's system preferences:

```tsx
<LandingThemeProvider defaultMode="auto">
  {/* Theme will follow system preference */}
</LandingThemeProvider>
```

## Examples

### Complete Landing Page with Branding & Theme

```tsx
import { LandingThemeProvider } from '@/contexts/LandingThemeContext';
import { BrandingPanel } from '@/components/landing/BrandingPanel';
import { ThemeToggle } from '@/components/landing/ThemeToggle';
import { ThemeAwareSection } from '@/components/landing/ThemeAwareSection';

export default function LandingPage() {
  return (
    <LandingThemeProvider defaultMode="toggle" enableToggle>
      {/* Header with theme toggle */}
      <header className="flex justify-between items-center p-4">
        <BrandingPanel compact />
        <ThemeToggle showLabel />
      </header>

      {/* Theme-aware sections */}
      <ThemeAwareSection
        title="Welcome to Our Platform"
        description="Experience the power of theme-aware design"
        backgroundImage={{
          light: '/hero-light.jpg',
          dark: '/hero-dark.jpg',
        }}
      />

      {/* More sections... */}
    </LandingThemeProvider>
  );
}
```

### Editor with Theme Preview

```tsx
import { ThemePreview } from '@/components/landing/ThemePreview';
import { BulkBrandingUpdate } from '@/components/landing/BulkBrandingUpdate';

export default function LandingEditor() {
  return (
    <div className="grid grid-cols-2 gap-4">
      {/* Editor Panel */}
      <div>
        <BulkBrandingUpdate />
        {/* Editor controls... */}
      </div>

      {/* Preview Panel */}
      <div>
        <ThemePreview showControls>
          <YourLandingPage />
        </ThemePreview>
      </div>
    </div>
  );
}
```

## Troubleshooting

### Theme Not Applying

1. Check that `LandingThemeProvider` wraps your components
2. Verify `useLandingTheme()` is called inside the provider
3. Check browser console for errors

### Branding Not Syncing

1. Verify user has `landing:write` permission
2. Check that branding settings exist
3. Verify API endpoints are accessible

### Colors Not Updating

1. Check CSS variable application
2. Verify color format (HSL expected)
3. Check for CSS specificity issues

### Images Not Switching

1. Verify both light and dark images are provided
2. Check image URLs are correct
3. Verify `resolvedTheme` is being used correctly

## Demo Page

Visit `/admin/branding-theme-demo` to see all features in action.
