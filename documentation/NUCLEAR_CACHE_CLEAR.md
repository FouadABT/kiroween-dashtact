# Nuclear Cache Clear - Complete Reset

## The Problem

Next.js is serving cached/compiled code from `.next` folder. Simply deleting it isn't enough because the dev server might have files locked or cached in memory.

## Complete Reset Steps

### 1. Stop ALL Processes

```bash
# Stop frontend (Ctrl+C in terminal)
# Stop backend (Ctrl+C in terminal)
```

### 2. Kill Any Remaining Node Processes

```bash
# Find processes on port 3000 and 3001
netstat -ano | findstr :3000
netstat -ano | findstr :3001

# Kill them (replace <PID> with actual process ID)
taskkill /PID <PID> /F
```

### 3. Delete ALL Cache Folders

```bash
cd frontend

# Delete Next.js build
rmdir /s /q .next

# Delete node_modules cache
rmdir /s /q node_modules\.cache

# Delete TypeScript cache
del /f /q tsconfig.tsbuildinfo
```

### 4. Restart Fresh

```bash
# Start backend first
cd backend
npm run start:dev

# Wait for backend to be ready, then start frontend
cd frontend
npm run dev
```

### 5. Clear Browser Completely

1. Close ALL browser tabs
2. Open new browser window
3. Press Ctrl+Shift+Delete
4. Select "Cached images and files"
5. Click "Clear data"
6. Or use Incognito/Private mode

### 6. Test

1. Navigate to `http://localhost:3000/dashboard/pages/new`
2. Should load without errors
3. Create a page
4. Click "Publish"
5. Should redirect to edit page successfully

## Alternative: Use Production Build

Sometimes dev mode caches aggressively. Try production build:

```bash
cd frontend

# Build for production
npm run build

# Run production server
npm start
```

This forces a complete rebuild and might clear stubborn cache issues.

## If Still Failing

The issue might not be cache. Check:

1. **Verify files were actually saved**:
   - Open `frontend/src/app/dashboard/pages/[id]/edit/page.tsx`
   - Should only have `'use client'` and `<PageEditor>`
   - No `PageHeader` import

2. **Check for syntax errors**:
   ```bash
   cd frontend
   npm run build
   ```
   This will show any TypeScript/syntax errors

3. **Check backend is running**:
   - Backend should be on port 3001
   - Test: `http://localhost:3001/pages/admin`
   - Should return JSON (might need auth)

## Current File State

Both page files should look like this:

**new/page.tsx**:
```typescript
'use client';

import { PageEditor } from '@/components/pages/PageEditor';

export default function NewPagePage() {
  return <PageEditor mode="create" />;
}
```

**[id]/edit/page.tsx**:
```typescript
'use client';

import { PageEditor } from '@/components/pages/PageEditor';

export default function EditPagePage({ params }: { params: { id: string } }) {
  return <PageEditor mode="edit" pageId={params.id} />;
}
```

Both are minimal, client components with no extra wrappers.
