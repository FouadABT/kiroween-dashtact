# Breadcrumb Debug Guide

## Logging Added

I've added comprehensive console logging to debug why the breadcrumb is showing the ID instead of the page title.

## Where to Look

### 1. Open Browser Console
1. Navigate to `http://localhost:3000/dashboard/pages/[id]/edit`
2. Open DevTools (F12)
3. Go to Console tab
4. Look for logs prefixed with:
   - `[PageEditor]` - Page loading and dynamic value setting
   - `[MetadataContext]` - Context state updates
   - `[Breadcrumb]` - Breadcrumb component rendering
   - `[generateBreadcrumbs]` - Breadcrumb generation logic
   - `[getMetadataForSegment]` - Metadata lookup

### 2. Expected Log Flow

**When page loads:**
```
[PageEditor] Page loaded: { id: "...", title: "My Page", slug: "..." }
[PageEditor] Setting dynamic values: { pageTitle: "My Page" }
[MetadataContext] setDynamicValues called: { values: { pageTitle: "My Page" }, ... }
[MetadataContext] Dynamic values updated to: { pageTitle: "My Page" }
```

**When breadcrumb renders:**
```
[Breadcrumb] Rendering: {
  pathname: "/dashboard/pages/cmhwpt47u0001iw4s61be3lwd/edit",
  propDynamicValues: undefined,
  contextDynamicValues: { pageTitle: "My Page" },
  finalDynamicValues: { pageTitle: "My Page" },
  hasCustomItems: false
}
```

**When generating breadcrumbs:**
```
[generateBreadcrumbs] Called with: {
  pathname: "/dashboard/pages/cmhwpt47u0001iw4s61be3lwd/edit",
  dynamicValues: { pageTitle: "My Page" }
}

[getMetadataForSegment] Looking for path: /dashboard
[getMetadataForSegment] Found exact match for: /dashboard

[getMetadataForSegment] Looking for path: /dashboard/pages
[getMetadataForSegment] Found exact match for: /dashboard/pages

[getMetadataForSegment] Looking for path: /dashboard/pages/cmhwpt47u0001iw4s61be3lwd
[getMetadataForSegment] Pattern match: /dashboard/pages/:id matches /dashboard/pages/cmhwpt47u0001iw4s61be3lwd
[getMetadataForSegment] Using pattern: /dashboard/pages/:id for path: /dashboard/pages/cmhwpt47u0001iw4s61be3lwd

[generateBreadcrumbs] Segment 2: {
  segment: "cmhwpt47u0001iw4s61be3lwd",
  currentPath: "/dashboard/pages/cmhwpt47u0001iw4s61be3lwd",
  metadata: { label: "{pageTitle}", dynamic: true },
  hasMetadata: true
}

[generateBreadcrumbs] Label before template: {pageTitle}
[generateBreadcrumbs] Template resolved: {
  original: "{pageTitle}",
  resolved: "My Page",
  dynamicValues: { pageTitle: "My Page" }
}

[generateBreadcrumbs] Final breadcrumbs: [
  { label: "Dashboard", href: "/dashboard" },
  { label: "Pages", href: "/dashboard/pages" },
  { label: "My Page", href: "/dashboard/pages/cmhwpt47u0001iw4s61be3lwd" },
  { label: "Edit", href: "/dashboard/pages/cmhwpt47u0001iw4s61be3lwd/edit" }
]
```

## Common Issues to Check

### Issue 1: Dynamic Values Not Set
**Symptom:**
```
[MetadataContext] setDynamicValues called: { values: { pageTitle: "My Page" }, ... }
```
But breadcrumb shows:
```
contextDynamicValues: {}
```

**Cause**: Timing issue - breadcrumb renders before context updates

**Solution**: The context should trigger a re-render. Check if MetadataProvider wraps the app.

### Issue 2: Pattern Not Matching
**Symptom:**
```
[getMetadataForSegment] No metadata found for: /dashboard/pages/cmhwpt47u0001iw4s61be3lwd
```

**Cause**: Missing route in metadata-config.ts

**Solution**: Verify `/dashboard/pages/:id` exists in metadata-config.ts

### Issue 3: Template Not Resolving
**Symptom:**
```
[generateBreadcrumbs] Label before template: {pageTitle}
[generateBreadcrumbs] Template resolved: {
  original: "{pageTitle}",
  resolved: "{pageTitle}",  // ❌ Not resolved!
  dynamicValues: {}  // ❌ Empty!
}
```

**Cause**: Dynamic values not passed to generateBreadcrumbs

**Solution**: Check if Breadcrumb component is reading from context correctly

### Issue 4: Cache Issue
**Symptom:**
```
[generateBreadcrumbs] Returning cached: [...]
```
With old/wrong values

**Cause**: Breadcrumb cache not invalidated

**Solution**: Clear cache or restart dev server

## Debugging Steps

### Step 1: Check Page Loading
Look for:
```
[PageEditor] Page loaded: { ... }
[PageEditor] Setting dynamic values: { ... }
```

**If missing**: Page data not loading. Check API call.

### Step 2: Check Context Update
Look for:
```
[MetadataContext] setDynamicValues called: { ... }
[MetadataContext] Dynamic values updated to: { ... }
```

**If missing**: setDynamicValues not being called. Check PageEditor.

### Step 3: Check Breadcrumb Render
Look for:
```
[Breadcrumb] Rendering: {
  contextDynamicValues: { pageTitle: "..." }
}
```

**If contextDynamicValues is empty**: Context not providing values. Check MetadataProvider.

### Step 4: Check Metadata Lookup
Look for:
```
[getMetadataForSegment] Pattern match: /dashboard/pages/:id matches ...
```

**If no match**: Route not in metadata-config.ts

### Step 5: Check Template Resolution
Look for:
```
[generateBreadcrumbs] Template resolved: {
  original: "{pageTitle}",
  resolved: "My Page"  // ✅ Should be the actual title
}
```

**If not resolved**: Dynamic values not passed correctly.

## Quick Fixes

### Fix 1: Clear Cache
```bash
# In browser console
localStorage.clear()
sessionStorage.clear()
# Then hard refresh: Ctrl+Shift+R
```

### Fix 2: Restart Dev Server
```bash
cd frontend
# Stop server (Ctrl+C)
npm run dev
```

### Fix 3: Check MetadataProvider
Verify in `frontend/src/app/layout.tsx`:
```tsx
<MetadataProvider>
  <body>
    {children}
  </body>
</MetadataProvider>
```

### Fix 4: Verify Route Config
Check `frontend/src/lib/metadata-config.ts`:
```typescript
'/dashboard/pages/:id': {
  title: 'Page: {pageTitle}',
  breadcrumb: { label: '{pageTitle}', dynamic: true },
  // ...
},
```

## What to Report

If the issue persists, copy and paste:

1. **All console logs** starting from page load
2. **The URL** you're visiting
3. **The page ID** from the URL
4. **Expected breadcrumb** vs **Actual breadcrumb**

## Remove Logging Later

Once fixed, remove the console.log statements from:
- `frontend/src/lib/breadcrumb-helpers.ts`
- `frontend/src/components/navigation/Breadcrumb.tsx`
- `frontend/src/components/pages/PageEditor.tsx`
- `frontend/src/contexts/MetadataContext.tsx`

Or keep them for future debugging (they won't affect production if you use proper logging levels).
