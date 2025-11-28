# Blog Error Handling - Visual Guide

## Error Handling Flow Diagram

```
┌─────────────────────────────────────────────────────────────┐
│                    User Navigates to Blog                    │
└─────────────────────────────────────────────────────────────┘
                            │
                            ▼
                    ┌───────────────┐
                    │ Loading State │
                    │  (Skeleton)   │
                    └───────────────┘
                            │
                ┌───────────┴───────────┐
                │                       │
                ▼                       ▼
        ┌──────────────┐        ┌──────────────┐
        │   Success    │        │    Error     │
        │ Show Content │        │ Show Error   │
        └──────────────┘        └──────────────┘
                                        │
                        ┌───────────────┼───────────────┐
                        │               │               │
                        ▼               ▼               ▼
                ┌──────────────┐ ┌──────────┐ ┌──────────────┐
                │ Not Found    │ │ API Error│ │Runtime Error │
                │   (404)      │ │          │ │  (Boundary)  │
                └──────────────┘ └──────────┘ └──────────────┘
```

## Page-by-Page Error Handling

### 1. Blog Listing Page (`/blog`)

```
┌─────────────────────────────────────────────────────────────┐
│                      /blog Page Flow                         │
└─────────────────────────────────────────────────────────────┘

User visits /blog
       │
       ▼
┌──────────────────┐
│  loading.tsx     │  ← Shows skeleton loaders
│  (Skeleton UI)   │     - Header skeleton
└──────────────────┘     - Filter skeletons
       │                 - 6 blog card skeletons
       │                 - Pagination skeleton
       ▼
┌──────────────────┐
│  Fetch Posts     │
│  from API        │
└──────────────────┘
       │
       ├─── Success ──→ ┌──────────────────┐
       │                │  Show Blog List  │
       │                │  with Posts      │
       │                └──────────────────┘
       │
       └─── Error ────→ ┌──────────────────┐
                        │   error.tsx      │  ← Error boundary
                        │  (Error Page)    │     - Error icon
                        └──────────────────┘     - Error message
                               │                 - Try Again button
                               │                 - Go Home button
                               ▼
                        ┌──────────────────┐
                        │  User Actions    │
                        │  - Try Again     │
                        │  - Go Home       │
                        └──────────────────┘
```

### 2. Blog Post Page (`/blog/[slug]`)

```
┌─────────────────────────────────────────────────────────────┐
│                   /blog/[slug] Page Flow                     │
└─────────────────────────────────────────────────────────────┘

User visits /blog/my-post
       │
       ▼
┌──────────────────┐
│  loading.tsx     │  ← Shows skeleton loaders
│  (Skeleton UI)   │     - Breadcrumb skeleton
└──────────────────┘     - Featured image skeleton
       │                 - Title skeleton
       │                 - Content skeleton
       ▼
┌──────────────────┐
│  Fetch Post      │
│  by Slug         │
└──────────────────┘
       │
       ├─── Success ──→ ┌──────────────────┐
       │                │  Show Blog Post  │
       │                │  with Content    │
       │                └──────────────────┘
       │
       ├─── Not Found → ┌──────────────────┐
       │                │ not-found.tsx    │  ← Custom 404
       │                │ (404 Page)       │     - "Post Not Found"
       │                └──────────────────┘     - Back to Blog
       │                       │                 - Go Home
       │                       ▼
       │                ┌──────────────────┐
       │                │  User Actions    │
       │                │  - Back to Blog  │
       │                │  - Go Home       │
       │                └──────────────────┘
       │
       └─── Error ────→ ┌──────────────────┐
                        │   error.tsx      │  ← Error boundary
                        │  (Error Page)    │     - Error icon
                        └──────────────────┘     - Error message
                               │                 - Try Again button
                               │                 - Back to Blog
                               │                 - Go Home
                               ▼
                        ┌──────────────────┐
                        │  User Actions    │
                        │  - Try Again     │
                        │  - Back to Blog  │
                        │  - Go Home       │
                        └──────────────────┘
```

### 3. Blog Management Page (`/dashboard/blog`)

```
┌─────────────────────────────────────────────────────────────┐
│                 /dashboard/blog Page Flow                    │
└─────────────────────────────────────────────────────────────┘

User visits /dashboard/blog
       │
       ▼
┌──────────────────┐
│  loading.tsx     │  ← Shows skeleton loaders
│  (Skeleton UI)   │     - Header skeleton
└──────────────────┘     - Filter skeletons
       │                 - Table skeleton (5 rows)
       │                 - Pagination skeleton
       ▼
┌──────────────────┐
│  Fetch Posts     │
│  (All Status)    │
└──────────────────┘
       │
       ├─── Success ──→ ┌──────────────────┐
       │                │  Show Post List  │
       │                │  with Actions    │
       │                └──────────────────┘
       │
       └─── Error ────→ ┌──────────────────┐
                        │   error.tsx      │  ← Error boundary
                        │  (Error Page)    │     - Error icon
                        └──────────────────┘     - Error message
                               │                 - Try Again button
                               │                 - Back to Dashboard
                               ▼
                        ┌──────────────────┐
                        │  User Actions    │
                        │  - Try Again     │
                        │  - Dashboard     │
                        └──────────────────┘
```

### 4. Blog Editor Page (`/dashboard/blog/[id]/edit`)

```
┌─────────────────────────────────────────────────────────────┐
│            /dashboard/blog/[id]/edit Page Flow               │
└─────────────────────────────────────────────────────────────┘

User visits /dashboard/blog/123/edit
       │
       ▼
┌──────────────────┐
│  loading.tsx     │  ← Shows skeleton loaders
│  (Skeleton UI)   │     - Header skeleton
└──────────────────┘     - Form field skeletons
       │                 - Editor skeleton
       │                 - Button skeletons
       ▼
┌──────────────────┐
│  Fetch Post      │
│  by ID           │
└──────────────────┘
       │
       ├─── Success ──→ ┌──────────────────┐
       │                │  Show Editor     │
       │                │  with Post Data  │
       │                └──────────────────┘
       │
       └─── Error ────→ ┌──────────────────┐
                        │   error.tsx      │  ← Error boundary
                        │  (Error Page)    │     - Error icon
                        └──────────────────┘     - Error message
                               │                 - Try Again button
                               │                 - Back to Management
                               ▼
                        ┌──────────────────┐
                        │  User Actions    │
                        │  - Try Again     │
                        │  - Back to Mgmt  │
                        └──────────────────┘
```

## Error State Components

### Error Boundary Layout

```
┌─────────────────────────────────────────────────────────────┐
│                                                               │
│                    ┌─────────────────┐                       │
│                    │                 │                       │
│                    │   Error Icon    │  ← Destructive color  │
│                    │   (AlertCircle) │     with background   │
│                    │                 │                       │
│                    └─────────────────┘                       │
│                                                               │
│                  Error Title (Large)                         │
│                                                               │
│              Error Description (Muted)                       │
│                                                               │
│         ┌─────────────────────────────────┐                 │
│         │                                 │                 │
│         │   Error Message (Monospace)    │  ← Error details │
│         │   Error ID: abc123             │                 │
│         │                                 │                 │
│         └─────────────────────────────────┘                 │
│                                                               │
│         ┌──────────────┐  ┌──────────────┐                 │
│         │  Try Again   │  │ Navigation   │  ← Action buttons│
│         └──────────────┘  └──────────────┘                 │
│                                                               │
│              Help Text (Small, Muted)                        │
│                                                               │
└─────────────────────────────────────────────────────────────┘
```

### Not Found Page Layout

```
┌─────────────────────────────────────────────────────────────┐
│                                                               │
│                    ┌─────────────────┐                       │
│                    │                 │                       │
│                    │  Question Icon  │  ← Muted color        │
│                    │ (FileQuestion)  │     with background   │
│                    │                 │                       │
│                    └─────────────────┘                       │
│                                                               │
│                  Post Not Found (Large)                      │
│                                                               │
│         The blog post you're looking for                     │
│              doesn't exist or has been removed.              │
│                                                               │
│         This could be because the post was deleted,          │
│         the URL is incorrect, or the post hasn't             │
│                  been published yet.                         │
│                                                               │
│         ┌──────────────┐  ┌──────────────┐                 │
│         │ Back to Blog │  │   Go Home    │  ← Navigation    │
│         └──────────────┘  └──────────────┘                 │
│                                                               │
│         If you believe this is an error, please              │
│         contact support or try searching for                 │
│              the content you're looking for.                 │
│                                                               │
└─────────────────────────────────────────────────────────────┘
```

### Loading State Layout (Blog List)

```
┌─────────────────────────────────────────────────────────────┐
│  Header                                                       │
│  ┌─────────────────────────────────────────────────────┐   │
│  │ ████████ (Title skeleton)                           │   │
│  │ ████████████ (Description skeleton)                 │   │
│  └─────────────────────────────────────────────────────┘   │
│                                                               │
│  Filters                                                      │
│  ┌──────────┐ ┌──────────┐                                 │
│  │ ████████ │ │ ████████ │  ← Filter skeletons             │
│  └──────────┘ └──────────┘                                 │
│                                                               │
│  Blog Cards Grid                                              │
│  ┌──────────┐ ┌──────────┐ ┌──────────┐                   │
│  │ ████████ │ │ ████████ │ │ ████████ │                   │
│  │ ████████ │ │ ████████ │ │ ████████ │  ← Card skeletons │
│  │ ████████ │ │ ████████ │ │ ████████ │                   │
│  │ ████     │ │ ████     │ │ ████     │                   │
│  └──────────┘ └──────────┘ └──────────┘                   │
│  ┌──────────┐ ┌──────────┐ ┌──────────┐                   │
│  │ ████████ │ │ ████████ │ │ ████████ │                   │
│  │ ████████ │ │ ████████ │ │ ████████ │                   │
│  │ ████████ │ │ ████████ │ │ ████████ │                   │
│  │ ████     │ │ ████     │ │ ████     │                   │
│  └──────────┘ └──────────┘ └──────────┘                   │
│                                                               │
│  Pagination                                                   │
│  ┌───┐ ┌───┐ ┌───┐  ← Pagination skeletons                │
│  │ █ │ │ █ │ │ █ │                                         │
│  └───┘ └───┘ └───┘                                         │
└─────────────────────────────────────────────────────────────┘
```

## User Experience Flow

### Scenario 1: Successful Blog Post Load

```
1. User clicks blog post link
   ↓
2. Loading state appears (skeleton)
   - User sees structure of page
   - No jarring blank screen
   ↓
3. Content loads and replaces skeleton
   - Smooth transition
   - No layout shift
   ↓
4. User reads blog post
```

### Scenario 2: Blog Post Not Found

```
1. User navigates to /blog/invalid-slug
   ↓
2. Loading state appears briefly
   ↓
3. API returns 404
   ↓
4. Not found page appears
   - Clear "Post Not Found" message
   - Explanation of possible reasons
   - Navigation options
   ↓
5. User clicks "Back to Blog"
   ↓
6. Returns to blog listing
```

### Scenario 3: API Error

```
1. User visits /blog
   ↓
2. Loading state appears
   ↓
3. API request fails (network error, server down)
   ↓
4. Error boundary catches error
   ↓
5. Error page appears
   - Clear error message
   - Error details
   - "Try Again" button
   ↓
6. User clicks "Try Again"
   ↓
7. Page reloads and retries
```

### Scenario 4: Runtime Error

```
1. User viewing blog post
   ↓
2. JavaScript error occurs (component crash)
   ↓
3. Error boundary catches error
   ↓
4. Error page appears
   - Error logged to console
   - User sees friendly message
   - Recovery options available
   ↓
5. User clicks "Try Again"
   ↓
6. Component re-renders
```

## Color Coding

### Error States
- **Icon Background**: `bg-destructive/10` (light red)
- **Icon Color**: `text-destructive` (red)
- **Error Message**: `text-muted-foreground` (gray)

### Not Found States
- **Icon Background**: `bg-muted` (light gray)
- **Icon Color**: `text-muted-foreground` (gray)
- **Message**: `text-muted-foreground` (gray)

### Loading States
- **Skeleton**: `bg-muted` (light gray)
- **Animation**: Subtle pulse effect

## Responsive Behavior

### Mobile (< 640px)
- Single column layout
- Stacked buttons
- Full-width components
- Larger touch targets

### Tablet (640px - 1024px)
- 2-column grid for blog cards
- Side-by-side buttons
- Optimized spacing

### Desktop (> 1024px)
- 3-column grid for blog cards
- Horizontal button layout
- Maximum width constraints
- Optimal reading width

## Accessibility Features

### Keyboard Navigation
- All buttons are keyboard accessible
- Tab order is logical
- Focus indicators are visible
- Enter/Space activate buttons

### Screen Readers
- Semantic HTML structure
- Descriptive error messages
- ARIA labels where needed
- Proper heading hierarchy

### Visual
- High contrast error colors
- Clear visual hierarchy
- Readable font sizes
- Sufficient spacing

## Performance

### Loading States
- Lightweight skeleton components
- No heavy animations
- Minimal re-renders
- Fast initial paint

### Error Handling
- Errors logged to console only
- No blocking operations
- Efficient error recovery
- Minimal memory usage

## Summary

The blog error handling system provides:

✅ **Complete Coverage**: All pages have error handling
✅ **Consistent UX**: Same patterns across all pages
✅ **User-Friendly**: Clear messages and recovery options
✅ **Accessible**: Works for all users
✅ **Performant**: Fast and efficient
✅ **Developer-Friendly**: Well-documented and maintainable

Every error scenario is handled gracefully, ensuring users always have a path forward.
