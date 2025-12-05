# Working with Prisma Sync Agent Hook

## Overview

Your Prisma Sync Agent hook will **automatically** handle many tasks when you modify the schema. This document explains how to work efficiently with the hook to avoid conflicts and duplication.

## What the Hook Does Automatically

When you edit `backend/prisma/schema.prisma`, the hook will:

✅ **Generate Prisma migration** (with descriptive name)
✅ **Regenerate Prisma client** (`npm run prisma:generate`)
✅ **Update seed file** (`backend/prisma/seed.ts`)
✅ **Create frontend TypeScript types** (`frontend/src/types/*.ts`)
✅ **Create/update backend DTOs** (`backend/src/[module]/dto/*.dto.ts`)
✅ **Generate comprehensive tests**:
   - Service unit tests (`*.service.spec.ts`)
   - Controller tests (`*.controller.spec.ts`)
   - E2E tests (`*.e2e-spec.ts`)
✅ **Verify type consistency** between frontend and backend
✅ **Check compilation** in both projects

## Recommended Workflow for Task 1.1

### Step 1: Add Settings Model to Schema

Edit `backend/prisma/schema.prisma` and add:

```prisma
model Settings {
  id                String   @id @default(cuid())
  userId            String?  @unique @map("user_id")
  scope             String   @default("global")
  
  themeMode         String   @default("system") @map("theme_mode")
  activeTheme       String   @default("default") @map("active_theme")
  
  lightPalette      Json     @map("light_palette")
  darkPalette       Json     @map("dark_palette")
  typography        Json
  
  createdAt         DateTime @default(now()) @map("created_at")
  updatedAt         DateTime @updatedAt @map("updated_at")
  
  @@map("settings")
}
```

### Step 2: Save and Wait for Hook

- **Save the file** - The Prisma Sync Agent hook will trigger automatically
- **Wait for completion** - The agent will run through all 5 phases
- **Review the report** - The agent provides a comprehensive summary

### Step 3: Review Auto-Generated Files

The hook will create/update these files:

**Backend:**
- `backend/prisma/migrations/[timestamp]_add_settings_model/migration.sql`
- `backend/src/settings/dto/create-settings.dto.ts`
- `backend/src/settings/dto/update-settings.dto.ts`
- `backend/src/settings/dto/settings-response.dto.ts`
- `backend/src/settings/settings.service.spec.ts`
- `backend/src/settings/settings.controller.spec.ts`
- `backend/test/settings.e2e-spec.ts`
- `backend/prisma/seed.ts` (updated)

**Frontend:**
- `frontend/src/types/settings.ts`

### Step 4: Enhance Generated Files (Task 1.2)

The auto-generated files are a great starting point, but you'll need to enhance them:

**DTOs - Add Design System Validation:**
```typescript
// The hook creates basic DTOs, you add specialized validation
import { IsOKLCHColor, HasSufficientContrast } from '../validators';

export class CreateSettingsDto {
  // ... basic fields from hook
  
  @IsOKLCHColor() // Add custom validator
  @HasSufficientContrast('background') // Add contrast validation
  lightPalette: ColorPalette;
}
```

**Types - Add Design System Interfaces:**
```typescript
// The hook creates basic Settings type, you add detailed interfaces
export interface ColorPalette {
  background: string;
  foreground: string;
  primary: string;
  // ... all semantic colors with JSDoc comments
}

export interface TypographyConfig {
  fontFamily: {
    sans: string[];
    serif: string[];
    mono: string[];
  };
  // ... complete typography configuration
}
```

**Tests - Add Design System Scenarios:**
```typescript
// The hook creates CRUD tests, you add specialized tests
describe('SettingsService', () => {
  // Hook-generated tests
  it('should create settings', ...);
  it('should update settings', ...);
  
  // Your design-system-specific tests
  it('should validate OKLCH color format', ...);
  it('should reject colors with insufficient contrast', ...);
  it('should validate minimum font sizes', ...);
});
```

## What You Still Need to Do Manually

Even with the hook, you'll need to:

1. **Create Settings Module/Service/Controller** (Task 3.1, 4.1)
   - The hook creates DTOs and tests, but not the actual NestJS module structure
   - Run: `nest g module settings`
   - Run: `nest g service settings`
   - Run: `nest g controller settings`

2. **Implement Business Logic** (Tasks 3.2-3.7)
   - Color validation utilities (OKLCH format, contrast ratios)
   - Typography validation utilities
   - Settings retrieval with fallback logic
   - Update/merge logic for partial updates

3. **Create Frontend Components** (Tasks 6-9)
   - ThemeProvider and context
   - Settings UI components
   - Color pickers and typography controls
   - Live preview

4. **Implement API Integration** (Task 6.4)
   - API client methods in `frontend/src/lib/api.ts`
   - Error handling
   - Caching strategy

5. **Add Specialized Validation** (Tasks 2.1, 3.6, 3.7)
   - Custom validators for OKLCH colors
   - Contrast ratio checking
   - Accessibility compliance validation

## Benefits of This Approach

✅ **No Conflicts** - Hook handles schema sync, you handle business logic
✅ **Faster Development** - Basic structure auto-generated
✅ **Type Safety** - Frontend/backend types always in sync
✅ **Test Coverage** - Basic tests auto-generated, you add specialized tests
✅ **Consistency** - Hook ensures all models follow same patterns

## Troubleshooting

**If the hook doesn't trigger:**
- Check that it's enabled in `.kiro/hooks/prisma-sync-agent.kiro.hook`
- Verify you saved the `schema.prisma` file
- Check the Kiro hooks panel for any errors

**If generated files don't match design:**
- That's expected! The hook creates basic structure
- Follow Task 1.2 to enhance the generated files
- Add design-system-specific validation and interfaces

**If you need to regenerate:**
- You can manually run: `node .kiro/scripts/verify-prisma-sync.js`
- Or edit the schema file again to trigger the hook

## Summary

**Let the hook do the heavy lifting:**
- Schema migrations ✅
- Type generation ✅
- Basic DTOs ✅
- Basic tests ✅

**You focus on the design system specifics:**
- Color validation logic
- Typography system
- Theme switching
- Settings UI
- Accessibility features

This division of labor makes development much faster and prevents conflicts!
