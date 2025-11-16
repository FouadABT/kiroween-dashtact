---
inclusion: always
---

# Coding Standards & Rules

## � CCRITICAL - NO DOCUMENTATION FILES 🚨

### ABSOLUTE RULES - READ THIS FIRST

**NEVER CREATE**:
- ❌ **NO** `.md` files
- ❌ **NO** documentation files
- ❌ **NO** report files
- ❌ **NO** summary files
- ❌ **NO** `*_COMPLETE.md`, `*_REPORT.md`, `*_GUIDE.md`, `*_STATUS.md`, `*_SUMMARY.md`
- ❌ **NO** completion reports
- ❌ **NO** analysis documents
- ❌ **NO** troubleshooting guides (unless explicitly requested)

**ONLY FIX**:
- ✅ **ONLY** fix actual code bugs
- ✅ **ONLY** modify source code files

**ONLY MODIFY**:
- ✅ Source code files (`.ts`, `.tsx`, `.js`, `.jsx`)
- ✅ Configuration files (`.json`, `.yaml`, `.env`)
- ✅ Style files (`.css`, `.scss`)
- ✅ Test files (`.test.ts`, `.spec.ts`)
- ✅ Database files (`.prisma`, `.sql`)

### When User Says "Fix the bug"
- ✅ Fix the code
- ❌ Don't create `BUG_FIX_COMPLETE.md`
- ❌ Don't create `FIX_REPORT.md`
- ❌ Don't create `TROUBLESHOOTING_GUIDE.md`

### When User Says "Add a feature"
- ✅ Add the feature code
- ❌ Don't create `FEATURE_COMPLETE.md`
- ❌ Don't create `IMPLEMENTATION_REPORT.md`
- ❌ Don't create `FEATURE_GUIDE.md`

### Exception
**ONLY create `.md` files when user EXPLICITLY says**:
- "Create documentation for..."
- "Write a guide for..."
- "Make a README for..."

**Focus on CODE, not DOCUMENTATION!**

---

## 🎨 UI Library & Styling

### shadcn/ui Components
**Always use shadcn/ui components** - Never create custom UI from scratch.

**Install components**:
```bash
npx shadcn@latest add [component-name]
```

**Available in** `frontend/src/components/ui/`:
- `button`, `input`, `card`, `dialog`, `dropdown-menu`
- `select`, `checkbox`, `radio-group`, `switch`
- `table`, `tabs`, `toast`, `tooltip`, `popover`
- `sheet`, `alert`, `badge`, `avatar`, `separator`
- `skeleton`, `progress`, `slider`, `calendar`

**Usage**:
```tsx
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Input } from '@/components/ui/input';

<Button variant="default">Click me</Button>
<Card className="p-4">Content</Card>
```

### Theme System
**Always use theme variables** - Never hardcode colors.

**Theme Colors**:
```tsx
// ✅ CORRECT - Use theme variables
className="bg-background text-foreground"
className="bg-card text-card-foreground border-border"
className="bg-primary text-primary-foreground"
className="bg-secondary text-secondary-foreground"
className="bg-muted text-muted-foreground"
className="bg-accent text-accent-foreground"
className="bg-destructive text-destructive-foreground"

// ❌ WRONG - Never hardcode colors
className="bg-white text-black"
className="bg-blue-500 text-white"
style={{ backgroundColor: '#ffffff' }}
```

**Semantic Colors**:
- `background` / `foreground` - Page background
- `card` / `card-foreground` - Card backgrounds
- `popover` / `popover-foreground` - Popover/dropdown backgrounds
- `primary` / `primary-foreground` - Primary actions
- `secondary` / `secondary-foreground` - Secondary actions
- `muted` / `muted-foreground` - Muted/disabled states
- `accent` / `accent-foreground` - Hover/focus states
- `destructive` / `destructive-foreground` - Danger/delete actions
- `border` - Border colors
- `input` - Input borders
- `ring` - Focus rings

### Responsive Design
**Always mobile-first** - Use Tailwind responsive prefixes.

```tsx
// ✅ CORRECT - Mobile-first responsive
className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4"
className="text-sm md:text-base lg:text-lg"
className="p-2 md:p-4 lg:p-6"

// ❌ WRONG - Desktop-only
className="grid grid-cols-3 gap-4"
```

---

## 📐 Component Patterns

### Component Structure
```tsx
'use client'; // Only if needed (client-side state/effects)

import React from 'react';
import { Button } from '@/components/ui/button';

interface MyComponentProps {
  title: string;
  data?: any[];
  onAction?: () => void;
}

export function MyComponent({
  title,
  data = [],
  onAction,
}: MyComponentProps) {
  // State
  const [state, setState] = useState();
  
  // Effects
  useEffect(() => {}, []);
  
  // Handlers
  const handleClick = () => {};
  
  // Render
  return (
    <div className="bg-card text-card-foreground border border-border rounded-lg p-4">
      <h2 className="text-lg font-semibold">{title}</h2>
      {/* Content */}
    </div>
  );
}
```

### Always Provide Defaults
```tsx
// ✅ CORRECT
function MyComponent({
  data = [],
  title = 'Default',
  onAction = () => {},
}: Props) {

// ❌ WRONG
function MyComponent({ data, title, onAction }: Props) {
```

### Safety Checks
```tsx
// ✅ CORRECT
const safeData = Array.isArray(data) ? data : [];
if (!user || typeof user !== 'object') return null;

// ❌ WRONG
data.map(item => ...) // Crashes if undefined!
```

---

## 🎯 TypeScript Rules

### Always Type Everything
```tsx
// ✅ CORRECT
interface User {
  id: string;
  name: string;
  email: string;
}

const users: User[] = [];
const handleClick = (user: User): void => {};

// ❌ WRONG
const users = [];
const handleClick = (user) => {};
```

### No `any` Type
```tsx
// ✅ CORRECT
interface ApiResponse<T> {
  data: T;
  error?: string;
}

// ❌ WRONG
const response: any = await fetch();
```

---

## 🔧 Next.js 14 App Router

### File Conventions
- `page.tsx` - Page component
- `layout.tsx` - Layout wrapper
- `loading.tsx` - Loading UI
- `error.tsx` - Error UI
- `not-found.tsx` - 404 UI

### Server vs Client Components
```tsx
// Server Component (default)
export default async function Page() {
  const data = await fetchData();
  return <div>{data}</div>;
}

// Client Component (when needed)
'use client';
export default function Page() {
  const [state, setState] = useState();
  return <div>{state}</div>;
}
```

### Use Client Only When Needed
- ✅ Server: Data fetching, static content
- ✅ Client: State, effects, event handlers, browser APIs

---

## 🗄️ Database (Prisma)

### After Schema Changes
```bash
cd backend
npm run prisma:generate  # Generate client
npm run prisma:migrate   # Create migration
npm run prisma:seed      # Seed data
```

### Never Edit Migrations
- ❌ Don't edit existing migration files
- ✅ Create new migrations for changes

---

## 🎨 Styling Rules

### Tailwind Only
```tsx
// ✅ CORRECT - Tailwind classes
className="flex items-center justify-between p-4 rounded-lg"

// ❌ WRONG - Inline styles
style={{ display: 'flex', padding: '16px' }}

// ❌ WRONG - Custom CSS (unless absolutely necessary)
```

### Class Organization
```tsx
// ✅ CORRECT - Organized by type
className="
  flex items-center justify-between gap-4
  p-4 rounded-lg
  bg-card text-card-foreground border border-border
  hover:bg-accent transition-colors
"
```

---

## ♿ Accessibility

### Always Include
```tsx
// ARIA labels
<button aria-label="Close dialog" onClick={onClose}>
  <X className="h-4 w-4" />
</button>

// Semantic HTML
<nav aria-label="Main navigation">
<main>
<article>

// Keyboard navigation
<div role="button" tabIndex={0} onKeyDown={handleKeyDown}>

// Focus indicators
className="focus:outline-none focus:ring-2 focus:ring-primary"
```

---

## 🚀 Performance

### Memoization
```tsx
// Expensive computations
const result = useMemo(() => {
  return data.map(/* expensive */);
}, [data]);

// Callbacks
const handleClick = useCallback(() => {
  // handler
}, [deps]);

// Components
export const MyComponent = React.memo(function MyComponent(props) {
  // ...
});
```

### Lazy Loading
```tsx
const MyComponent = lazy(() => import('./MyComponent'));

<Suspense fallback={<Loading />}>
  <MyComponent />
</Suspense>
```

---

## 📝 Code Quality

### Clean Code
- ✅ Descriptive names
- ✅ Small functions
- ✅ Single responsibility
- ✅ DRY (Don't Repeat Yourself)
- ✅ Comments for complex logic only

### Error Handling
```tsx
try {
  const result = await fetchData();
  setData(result);
} catch (error) {
  console.error('Failed:', error);
  setError(error instanceof Error ? error.message : 'Unknown error');
}
```

---

## 🔒 Security

### Never Expose Secrets
```tsx
// ✅ CORRECT - Environment variables
const apiUrl = process.env.NEXT_PUBLIC_API_URL;

// ❌ WRONG - Hardcoded
const apiKey = 'sk_live_abc123';
```

### Validate Input
```tsx
// ✅ CORRECT
if (!email || !email.includes('@')) {
  throw new Error('Invalid email');
}

// ❌ WRONG
await saveUser({ email }); // No validation!
```

---

## 📦 Imports

### Order
```tsx
// 1. React
import React, { useState, useEffect } from 'react';

// 2. External libraries
import { useQuery } from '@tanstack/react-query';

// 3. Internal components
import { Button } from '@/components/ui/button';
import { MyComponent } from '@/components/MyComponent';

// 4. Utils/helpers
import { cn } from '@/lib/utils';

// 5. Types
import type { User } from '@/types/user';

// 6. Styles (if any)
import './styles.css';
```

---

## ✅ Quick Checklist

Before committing code:
- [ ] No `.md` documentation files created
- [ ] Used shadcn/ui components
- [ ] Used theme variables (no hardcoded colors)
- [ ] Mobile-responsive (Tailwind breakpoints)
- [ ] TypeScript types defined
- [ ] Default props provided
- [ ] Safety checks added
- [ ] Accessibility attributes included
- [ ] Error handling implemented
- [ ] No console.logs in production code
- [ ] Imports organized
- [ ] Code formatted (Prettier)

---

**Remember**: Focus on CODE, not DOCUMENTATION. Fix bugs, implement features, write tests - but don't create summary files!
