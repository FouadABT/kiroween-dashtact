# Design System & Theming

## Overview

This project implements a professional, database-backed design system with customizable theming. The system provides dynamic color palette management, dark/light mode support, and a flexible typography system with real-time updates.

## System Architecture

### Stack
- **Backend**: NestJS + Prisma + PostgreSQL (Settings API)
- **Frontend**: Next.js 14 + React Context + CSS Custom Properties
- **Color System**: OKLCH color space for perceptual uniformity
- **Typography**: Modular type scale with custom font families

### Key Components

**Backend** (`backend/src/settings/`):
- `settings.service.ts` - Settings business logic
- `settings.controller.ts` - Settings API endpoints
- `dto/` - Data transfer objects with validation
- `interfaces/` - ColorPalette and TypographyConfig interfaces

**Frontend** (`frontend/src/`):
- `contexts/ThemeContext.tsx` - Global theme state management
- `app/dashboard/settings/theme/page.tsx` - Theme customization UI
- `components/settings/` - Theme editor components
- `lib/design-tokens.ts` - Design token utilities

**Database**:
- `Settings` model stores theme configurations per user or globally
- JSON fields for color palettes and typography
- Supports light and dark mode palettes

## Theme System

### Theme Modes

**Three modes available**:
- `light` - Light color palette
- `dark` - Dark color palette
- `system` - Follows OS preference

**Switching themes**:
```typescript
const { setThemeMode } = useTheme();
setThemeMode('dark');  // or 'light' or 'system'
```

### Color Palette Structure

**OKLCH Format**: All colors use OKLCH color space
- Format: `oklch(L C H / A)` or `oklch(L C H)`
- L = Lightness (0-1)
- C = Chroma (0-0.4)
- H = Hue (0-360)
- A = Alpha (0-1, optional)

**Example**: `oklch(0.5 0.2 180)` = Medium cyan

**Semantic Color Tokens** (30+ tokens):
```typescript
// Base colors
background, foreground

// Component colors
card, cardForeground, popover, popoverForeground

// Semantic colors
primary, primaryForeground
secondary, secondaryForeground
muted, mutedForeground
accent, accentForeground
destructive, destructiveForeground

// UI elements
border, input, ring

// Chart colors
chart1, chart2, chart3, chart4, chart5

// Sidebar colors
sidebar, sidebarForeground, sidebarPrimary, etc.

// Border radius
radius
```

### Typography System

**Font Families**:
- `sans` - Sans-serif fonts (default: Geist Sans)
- `serif` - Serif fonts (default: Georgia)
- `mono` - Monospace fonts (default: Geist Mono)

**Type Scale** (10 sizes):
```typescript
xs, sm, base, lg, xl, 2xl, 3xl, 4xl, 5xl, 6xl
```

**Font Weights**:
```typescript
light (300), normal (400), medium (500), 
semibold (600), bold (700), extrabold (800)
```

**Line Heights**:
```typescript
tight (1.25), normal (1.5), relaxed (1.75), loose (2)
```

**Letter Spacing**:
```typescript
tighter, tight, normal, wide, wider
```

## Frontend Implementation

### Using Theme Context

```typescript
import { useTheme } from '@/contexts/ThemeContext';

function MyComponent() {
  const {
    themeMode,           // 'light' | 'dark' | 'system'
    resolvedTheme,       // 'light' | 'dark' (actual theme)
    settings,            // Full settings object
    isLoading,           // Boolean
    setThemeMode,        // (mode) => void
    updateColorPalette,  // (palette, mode) => Promise<void>
    updateTypography,    // (typography) => Promise<void>
    resetToDefaults,     // () => Promise<void>
    refreshSettings,     // () => Promise<void>
  } = useTheme();
  
  return (
    <div>
      <p>Current theme: {resolvedTheme}</p>
      <button onClick={() => setThemeMode('dark')}>
        Switch to Dark
      </button>
    </div>
  );
}
```

### Accessing Design Tokens

**Via CSS Variables** (recommended):
```tsx
<div className="bg-background text-foreground">
  <h1 className="text-primary">Title</h1>
  <p className="text-muted-foreground">Description</p>
</div>
```

**Via Tailwind Classes**:
```tsx
<button className="bg-primary text-primary-foreground hover:bg-primary/90">
  Click me
</button>
```

**Via JavaScript**:
```typescript
import { getColorValue, getTypographyValue } from '@/lib/design-tokens';

const primaryColor = getColorValue('primary');
const baseFontSize = getTypographyValue('fontSize', 'base');
```

### Creating Theme-Aware Components

```typescript
function ThemedCard({ children }: { children: React.ReactNode }) {
  return (
    <div className="bg-card text-card-foreground border border-border rounded-lg p-4">
      {children}
    </div>
  );
}
```

### Conditional Styling by Theme

```typescript
function MyComponent() {
  const { resolvedTheme } = useTheme();
  
  return (
    <div className={resolvedTheme === 'dark' ? 'opacity-90' : 'opacity-100'}>
      Content
    </div>
  );
}
```

## Backend Implementation

### Settings API Endpoints

```typescript
// Get settings
GET /settings              // Get all settings
GET /settings/global       // Get global settings
GET /settings/user/:userId // Get user-specific settings
GET /settings/:id          // Get by ID

// Create settings
POST /settings
Body: {
  scope: 'global' | 'user',
  userId?: string,
  themeMode: 'light' | 'dark' | 'system',
  lightPalette: ColorPalette,
  darkPalette: ColorPalette,
  typography: TypographyConfig
}

// Update settings
PATCH /settings/:id
Body: {
  themeMode?: 'light' | 'dark' | 'system',
  lightPalette?: Partial<ColorPalette>,
  darkPalette?: Partial<ColorPalette>,
  typography?: Partial<TypographyConfig>
}

// Delete settings (reset to defaults)
DELETE /settings/:id
```

### Settings Service Usage

```typescript
import { SettingsService } from './settings/settings.service';

@Injectable()
export class MyService {
  constructor(private settingsService: SettingsService) {}
  
  async getUserTheme(userId: string) {
    return this.settingsService.findByUserId(userId);
  }
  
  async updateUserTheme(userId: string, palette: Partial<ColorPalette>) {
    const settings = await this.settingsService.findByUserId(userId);
    return this.settingsService.update(settings.id, {
      lightPalette: { ...settings.lightPalette, ...palette }
    });
  }
}
```

## Database Schema

```prisma
model Settings {
  id           String   @id @default(cuid())
  userId       String?  @unique @map("user_id")
  scope        String   @default("global")  // "global" or "user"
  themeMode    String   @default("system") @map("theme_mode")
  activeTheme  String   @default("default") @map("active_theme")
  lightPalette Json     @map("light_palette")
  darkPalette  Json     @map("dark_palette")
  typography   Json
  createdAt    DateTime @default(now()) @map("created_at")
  updatedAt    DateTime @updatedAt @map("updated_at")
  
  @@index([userId])
  @@index([scope])
  @@map("settings")
}
```

## Common Tasks

### Customizing Theme Colors

**Via UI**:
1. Navigate to `/dashboard/settings/theme`
2. Select light or dark palette
3. Click color swatches to open color picker
4. Adjust colors in OKLCH format
5. Preview changes in real-time
6. Click "Save Changes"

**Via Code**:
```typescript
const { updateColorPalette } = useTheme();

await updateColorPalette({
  primary: 'oklch(0.5 0.2 250)',
  primaryForeground: 'oklch(1 0 0)',
}, 'light');
```

### Customizing Typography

**Via UI**:
1. Navigate to `/dashboard/settings/theme`
2. Scroll to Typography section
3. Select font families from dropdowns
4. Adjust type scale sliders
5. Preview changes
6. Click "Save Changes"

**Via Code**:
```typescript
const { updateTypography } = useTheme();

await updateTypography({
  fontFamily: {
    sans: ['Inter', 'system-ui', 'sans-serif']
  },
  fontSize: {
    base: '1.125rem'  // 18px
  }
});
```

### Resetting to Defaults

```typescript
const { resetToDefaults } = useTheme();
await resetToDefaults();
```

### Adding New Color Tokens

1. **Update Interface** (`backend/src/settings/interfaces/color-palette.interface.ts`):
```typescript
export interface ColorPalette {
  // ... existing tokens
  customColor: string;
  customColorForeground: string;
}
```

2. **Update Seed Data** (`backend/prisma/seed.ts`):
```typescript
lightPalette: {
  // ... existing colors
  customColor: 'oklch(0.6 0.15 200)',
  customColorForeground: 'oklch(1 0 0)',
}
```

3. **Update CSS** (`frontend/src/app/globals.css`):
```css
:root {
  --custom-color: oklch(0.6 0.15 200);
  --custom-color-foreground: oklch(1 0 0);
}
```

4. **Update Tailwind** (`frontend/tailwind.config.ts`):
```typescript
colors: {
  'custom-color': 'hsl(var(--custom-color))',
  'custom-color-foreground': 'hsl(var(--custom-color-foreground))',
}
```

5. **Reseed Database**:
```bash
cd backend
npm run prisma:seed
```

### Adding New Typography Scales

1. **Update Interface** (`backend/src/settings/interfaces/typography-config.interface.ts`):
```typescript
export interface TypographyConfig {
  fontSize: {
    // ... existing sizes
    '7xl': string;
  };
}
```

2. **Update Seed Data** and follow similar steps as colors

## Accessibility

### Color Contrast Requirements

**WCAG AA Standards**:
- Normal text: 4.5:1 contrast ratio
- Large text (18px+): 3:1 contrast ratio
- UI components: 3:1 contrast ratio

**Validation**:
```typescript
import { checkContrast } from '@/lib/color-contrast';

const ratio = checkContrast(
  'oklch(0.2 0 0)',  // foreground
  'oklch(1 0 0)'     // background
);

if (ratio >= 4.5) {
  console.log('✅ WCAG AA compliant');
}
```

**UI Warnings**:
- Color picker shows contrast ratio
- Warning icon if ratio fails WCAG AA
- Tooltip with accessibility information

### Font Size Requirements

**Minimum Sizes**:
- Body text: 16px (1rem)
- Small text: 14px (0.875rem)
- Minimum allowed: 12px (0.75rem)

**Validation**:
```typescript
import { isAccessibleFontSize } from '@/backend/src/settings/interfaces/typography-config.interface';

if (!isAccessibleFontSize('0.7rem')) {
  throw new Error('Font size below 12px minimum');
}
```

## Performance

### CSS Variable Updates

**How it works**:
- Theme changes update CSS custom properties on `:root`
- No React component re-renders needed
- Browser handles repainting efficiently
- Changes apply instantly (<50ms)

**Optimization**:
```typescript
// Batch multiple updates
const updates = {
  '--primary': 'oklch(0.5 0.2 250)',
  '--secondary': 'oklch(0.6 0.15 200)',
  '--accent': 'oklch(0.7 0.1 150)',
};

Object.entries(updates).forEach(([key, value]) => {
  document.documentElement.style.setProperty(key, value);
});
```

### Caching Strategy

**localStorage Cache**:
```typescript
{
  'theme-settings': {
    data: SettingsResponseDto,
    timestamp: number,
    ttl: 3600000  // 1 hour
  }
}
```

**Cache Invalidation**:
- User saves new settings
- TTL expires (1 hour)
- User logs out
- 409 Conflict response from API

### Debouncing

**Color Picker Changes**:
```typescript
// Debounced by 300ms to prevent excessive API calls
const debouncedUpdate = debounce(updateColorPalette, 300);
```

**Typography Changes**:
```typescript
// Debounced by 300ms
const debouncedUpdate = debounce(updateTypography, 300);
```

## Troubleshooting

### Theme Not Applying

**Checklist**:
- [ ] ThemeProvider wraps application in layout.tsx
- [ ] Settings loaded successfully (check Network tab)
- [ ] CSS variables defined in globals.css
- [ ] No CSS specificity conflicts
- [ ] Browser cache cleared

**Debug**:
```typescript
const { settings, isLoading } = useTheme();
console.log('Settings:', settings);
console.log('Loading:', isLoading);
```

### Colors Not Updating

**Cause**: CSS variable not applied
**Solution**:
1. Check browser DevTools → Elements → :root styles
2. Verify CSS variable name matches Tailwind config
3. Check for typos in color token names

### Typography Not Changing

**Cause**: Font family not loaded
**Solution**:
1. Verify font is imported in layout.tsx
2. Check font-family CSS variable is set
3. Ensure font files are accessible

### Settings Not Persisting

**Cause**: API call failing or cache issue
**Solution**:
1. Check Network tab for API errors
2. Verify backend is running on port 3001
3. Clear localStorage: `localStorage.removeItem('theme-settings')`
4. Check database for settings record

### OKLCH Color Format Errors

**Valid Format**: `oklch(L C H)` or `oklch(L C H / A)`
- L: 0-1 (lightness)
- C: 0-0.4 (chroma)
- H: 0-360 (hue)
- A: 0-1 (alpha, optional)

**Examples**:
```typescript
'oklch(0.5 0.2 180)'      // ✅ Valid
'oklch(0.5 0.2 180 / 0.8)' // ✅ Valid with alpha
'oklch(50% 0.2 180)'      // ❌ Invalid (use 0-1, not %)
'rgb(255 0 0)'            // ❌ Invalid (not OKLCH)
```

## Configuration

### Backend Config

**File**: `backend/src/settings/settings.service.ts`

Default values defined in service methods.

### Frontend Config

**File**: `frontend/src/contexts/ThemeContext.tsx`

```typescript
const STORAGE_KEY = 'theme-mode';
const CACHE_KEY = 'theme-settings';
const CACHE_TTL = 3600000; // 1 hour
```

## Testing

### Backend Tests

```bash
cd backend
npm test settings.service.spec.ts    # Unit tests
npm test settings.controller.spec.ts # Controller tests
npm run test:e2e settings.e2e-spec.ts # E2E tests
```

### Frontend Tests

```bash
cd frontend
npm test theme-switching.test.tsx     # Theme switching
npm test settings-save-load.test.tsx  # Settings persistence
npm test color-palette.test.tsx       # Color customization
npm test typography.test.tsx          # Typography customization
```

### Manual Testing

1. **Theme Toggle**: Switch between light/dark/system modes
2. **Color Change**: Modify a color and verify UI updates
3. **Typography Change**: Change font family and verify application-wide update
4. **Persistence**: Reload page and verify settings persist
5. **Reset**: Click reset and verify defaults restored

## Resources

- **Spec Files**: `.kiro/specs/design-system-theming/`
- **Requirements**: `.kiro/specs/design-system-theming/requirements.md`
- **Design Doc**: `.kiro/specs/design-system-theming/design.md`
- **Tasks**: `.kiro/specs/design-system-theming/tasks.md`
- **Seed Data**: `backend/prisma/seed.ts`

## Quick Reference

### Get Current Theme
```typescript
const { resolvedTheme } = useTheme();
```

### Switch Theme
```typescript
const { setThemeMode } = useTheme();
setThemeMode('dark');
```

### Update Colors
```typescript
const { updateColorPalette } = useTheme();
await updateColorPalette({ primary: 'oklch(0.5 0.2 250)' }, 'light');
```

### Update Typography
```typescript
const { updateTypography } = useTheme();
await updateTypography({ fontSize: { base: '1.125rem' } });
```

### Reset to Defaults
```typescript
const { resetToDefaults } = useTheme();
await resetToDefaults();
```

### Access Design Tokens
```typescript
// Via CSS classes
<div className="bg-primary text-primary-foreground">

// Via JavaScript
import { getColorValue } from '@/lib/design-tokens';
const color = getColorValue('primary');
```
