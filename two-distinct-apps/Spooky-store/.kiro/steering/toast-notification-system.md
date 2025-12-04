# Toast Notification System

## CRITICAL: We Use Sonner, NOT shadcn/ui Toast Hook

### ❌ NEVER DO THIS
```tsx
// WRONG - This doesn't exist in our system!
import { useToast } from '@/hooks/use-toast';
const { toast } = useToast();
```

### ✅ ALWAYS DO THIS
```tsx
// CORRECT - Import toast directly
import { toast } from '@/hooks/use-toast';

// Usage
toast.success('Operation successful');
toast.error('Something went wrong');
toast.info('Information message');
toast.warning('Warning message');
```

## Implementation Details

Our toast system is built on **Sonner** (not shadcn/ui's toast hook).

**Location**: `frontend/src/hooks/use-toast.ts`

**Exports**:
- `toast` object with methods: `success`, `error`, `info`, `warning`
- **Does NOT export** `useToast` hook

**Provider**: `<Toaster />` from Sonner is already configured in the root layout.

## Usage Examples

### Success Message
```tsx
import { toast } from '@/hooks/use-toast';

const handleSave = async () => {
  try {
    await saveData();
    toast.success('Data saved successfully');
  } catch (error) {
    toast.error('Failed to save data');
  }
};
```

### Error Handling
```tsx
import { toast } from '@/hooks/use-toast';

try {
  await apiCall();
  toast.success('Request completed');
} catch (error) {
  toast.error(error instanceof Error ? error.message : 'Unknown error');
}
```

### Info & Warning
```tsx
import { toast } from '@/hooks/use-toast';

toast.info('Processing your request...');
toast.warning('This action cannot be undone');
```

## Common Mistakes to Avoid

### ❌ Mistake 1: Using useToast Hook
```tsx
// WRONG
import { useToast } from '@/hooks/use-toast';
const { toast } = useToast();
```

### ❌ Mistake 2: Importing from Wrong Path
```tsx
// WRONG
import { toast } from 'sonner';
import { useToast } from '@/components/ui/use-toast';
```

### ❌ Mistake 3: Trying to Use shadcn/ui Toast
```tsx
// WRONG - We don't use shadcn/ui toast
import { useToast } from '@/components/ui/use-toast';
```

## Quick Reference

**Import Statement**:
```tsx
import { toast } from '@/hooks/use-toast';
```

**Available Methods**:
- `toast.success(message: string)`
- `toast.error(message: string)`
- `toast.info(message: string)`
- `toast.warning(message: string)`

**No Hook Required**: Just import and use directly.

## Integration with Design System

This toast system is part of our design system and:
- ✅ Automatically respects dark/light theme
- ✅ Uses consistent styling across the app
- ✅ Positioned correctly (bottom-right by default)
- ✅ Accessible with ARIA attributes
- ✅ Mobile-responsive

## Troubleshooting

### Build Error: "Export useToast doesn't exist"
**Solution**: Change `import { useToast }` to `import { toast }`

### Toast Not Showing
**Check**:
1. `<Toaster />` is in root layout
2. Using correct import: `import { toast } from '@/hooks/use-toast'`
3. Calling toast methods correctly: `toast.success('message')`

## Remember

🎯 **One Rule**: Import `toast` directly, never `useToast`.

```tsx
// ✅ CORRECT
import { toast } from '@/hooks/use-toast';
toast.success('Done!');
```
