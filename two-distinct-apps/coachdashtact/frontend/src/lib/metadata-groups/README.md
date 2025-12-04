# Metadata Groups - Bundle Size Optimization

## Overview

This directory contains metadata configuration split into logical groups for lazy loading. This approach reduces the initial bundle size by loading metadata on-demand based on the current route.

## Structure

```
metadata-groups/
├── auth.ts          # Authentication pages (/login, /signup, etc.)
├── dashboard.ts     # Main dashboard pages
├── users.ts         # User management pages
├── settings.ts      # Settings pages
├── widgets.ts       # Widgets pages
├── errors.ts        # Error pages (403, 404, 500)
└── README.md        # This file
```

## Usage

### Standard Import (All Metadata)

```typescript
import { metadataConfig } from '@/lib/metadata-config';

// All metadata loaded immediately
const metadata = metadataConfig['/dashboard/users'];
```

### Lazy Import (On-Demand)

```typescript
import { getMetadataForPathLazy } from '@/lib/metadata-config-lazy';

// Metadata loaded only when needed
const metadata = await getMetadataForPathLazy('/dashboard/users');
```

### Preloading

```typescript
import { preloadMetadataGroups } from '@/lib/metadata-config-lazy';

// Preload likely navigation targets
await preloadMetadataGroups(['dashboard', 'users']);
```

## Benefits

### Bundle Size Reduction

- **Before**: All metadata (~15KB) loaded on initial page load
- **After**: Only relevant metadata (~2-3KB per group) loaded on demand
- **Savings**: ~70-80% reduction in initial metadata bundle size

### Performance Impact

- **Initial Load**: Faster due to smaller bundle
- **Navigation**: Minimal delay (metadata cached after first load)
- **Memory**: Lower memory footprint for unused routes

## When to Use

### Use Lazy Loading When:

- Application has many routes with extensive metadata
- Initial bundle size is a concern
- Users typically navigate to specific sections only
- Metadata is not needed for SSR/SSG

### Use Standard Loading When:

- Application has few routes (<20)
- All metadata is needed for SSR/SSG
- Simplicity is preferred over optimization
- Metadata size is small (<5KB total)

## Adding New Groups

1. Create new file in `metadata-groups/`:

```typescript
// metadata-groups/new-section.ts
import { PageMetadata } from '@/types/metadata';

export const newSectionMetadata: Record<string, PageMetadata> = {
  '/new-section': {
    title: 'New Section',
    description: 'Description',
    breadcrumb: { label: 'New Section' },
  },
};
```

2. Update `metadata-config-lazy.ts`:

```typescript
type RouteGroup = 
  | 'auth'
  | 'dashboard'
  | 'users'
  | 'settings'
  | 'widgets'
  | 'errors'
  | 'new-section'; // Add here

// Add to getRouteGroup function
if (pathname.startsWith('/new-section')) {
  return 'new-section';
}

// Add to loadMetadataGroup switch
case 'new-section':
  metadata = (await import('./metadata-groups/new-section')).newSectionMetadata;
  break;
```

3. Update total groups count in `getLoadedGroupsStats()`.

## Testing

```typescript
import { getLoadedGroupsStats, clearLoadedGroups } from '@/lib/metadata-config-lazy';

// Check what's loaded
console.log(getLoadedGroupsStats());
// { loadedGroups: ['dashboard', 'users'], totalGroups: 6, cacheSize: 2 }

// Clear cache (useful for testing)
clearLoadedGroups();
```

## Migration Guide

### From Standard to Lazy Loading

1. Keep existing `metadata-config.ts` for backward compatibility
2. Import lazy loader where needed:

```typescript
// Before
import { metadataConfig } from '@/lib/metadata-config';
const metadata = metadataConfig[pathname];

// After
import { getMetadataForPathLazy } from '@/lib/metadata-config-lazy';
const metadata = await getMetadataForPathLazy(pathname);
```

3. Update components to handle async metadata loading
4. Add preloading for critical routes

### Gradual Migration

You can use both approaches simultaneously:

```typescript
// Use standard for critical routes
import { metadataConfig } from '@/lib/metadata-config';
const homeMetadata = metadataConfig['/'];

// Use lazy for less critical routes
import { getMetadataForPathLazy } from '@/lib/metadata-config-lazy';
const userMetadata = await getMetadataForPathLazy('/dashboard/users/123');
```

## Performance Monitoring

Track lazy loading performance:

```typescript
import { getLoadedGroupsStats } from '@/lib/metadata-config-lazy';

// Log stats periodically
setInterval(() => {
  const stats = getLoadedGroupsStats();
  console.log('Metadata cache stats:', stats);
}, 60000); // Every minute
```

## Best Practices

1. **Group by Feature**: Keep related routes in the same group
2. **Preload Critical Paths**: Use `preloadMetadataGroups()` for likely navigation
3. **Monitor Bundle Size**: Check bundle analyzer for actual savings
4. **Cache Appropriately**: Loaded groups are cached automatically
5. **Handle Errors**: Lazy loading can fail; always have fallbacks

## Troubleshooting

### Metadata Not Loading

```typescript
// Check if group is loaded
import { getLoadedGroupsStats } from '@/lib/metadata-config-lazy';
console.log(getLoadedGroupsStats());

// Clear cache and retry
import { clearLoadedGroups } from '@/lib/metadata-config-lazy';
clearLoadedGroups();
```

### Import Errors

Ensure all metadata group files export the correct variable name:

```typescript
// ✅ Correct
export const authMetadata: Record<string, PageMetadata> = { ... };

// ❌ Wrong
export const metadata: Record<string, PageMetadata> = { ... };
```

### Bundle Size Not Reducing

1. Check Next.js build output for code splitting
2. Verify dynamic imports are used correctly
3. Run bundle analyzer: `npm run analyze`
4. Ensure tree-shaking is enabled in build config

## Future Enhancements

- [ ] Automatic group detection based on route structure
- [ ] Compression for metadata payloads
- [ ] Service worker caching for metadata
- [ ] Metadata versioning and cache invalidation
- [ ] Analytics for metadata loading patterns
