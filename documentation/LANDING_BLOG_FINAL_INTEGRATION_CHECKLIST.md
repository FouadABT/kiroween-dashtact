# Landing Page & Blog System - Final Integration Testing Checklist

## Overview
This document provides a comprehensive checklist for manually testing the landing page and blog system integration. Use this to verify all requirements are met before marking task 17 as complete.

**Requirements Covered**: 1.1, 1.2, 1.3, 1.4, 1.5, 2.5, 3.5, 4.5, 7.1, 7.2, 7.3, 7.4, 7.5

---

## 1. Feature Flag Toggling (Requirements 1.1, 1.2, 1.3, 1.4, 1.5)

### Landing Page Feature Flag

**Test 1.1: Landing Page Enabled**
- [ ] Set `NEXT_PUBLIC_ENABLE_LANDING=true` in `frontend/.env.local`
- [ ] Restart frontend dev server
- [ ] Navigate to `http://localhost:3000/`
- [ ] ✅ Landing page should display with hero, features, and footer
- [ ] ✅ Navigation should show "Get Started" and "Sign In" buttons

**Test 1.2: Landing Page Disabled**
- [ ] Set `NEXT_PUBLIC_ENABLE_LANDING=false` in `frontend/.env.local`
- [ ] Restart frontend dev server
- [ ] Navigate to `http://localhost:3000/`
- [ ] ✅ Should redirect to `/dashboard` (if authenticated) or `/login` (if not)
- [ ] ✅ No landing page content should be visible

### Blog Feature Flag

**Test 1.3: Blog Enabled**
- [ ] Set `NEXT_PUBLIC_ENABLE_BLOG=true` in `frontend/.env.local`
- [ ] Restart frontend dev server
- [ ] Navigate to `http://localhost:3000/blog`
- [ ] ✅ Blog listing page should display
- [ ] ✅ Dashboard navigation should show "Blog" menu item (if user has `blog:read`)

**Test 1.4: Blog Disabled**
- [ ] Set `NEXT_PUBLIC_ENABLE_BLOG=false` in `frontend/.env.local`
- [ ] Restart frontend dev server
- [ ] Navigate to `http://localhost:3000/blog`
- [ ] ✅ Should redirect to 404 page
- [ ] ✅ Dashboard navigation should NOT show "Blog" menu item

**Test 1.5: Independent Feature Control**
- [ ] Test all four combinations:
  - [ ] Landing=true, Blog=true → Both features work
  - [ ] Landing=true, Blog=false → Only landing page works
  - [ ] Landing=false, Blog=true → Only blog works
  - [ ] Landing=false, Blog=false → Neither feature works

---

## 2. SEO Metadata on All Pages (Requirements 2.5, 3.5, 7.1, 7.2, 7.3, 7.4, 7.5)

### Landing Page Metadata

**Test 2.1: Landing Page SEO**
- [ ] Navigate to `http://localhost:3000/`
- [ ] View page source (Ctrl+U)
- [ ] ✅ Verify `<title>` tag contains site name
- [ ] ✅ Verify `<meta name="description">` exists
- [ ] ✅ Verify `<meta name="keywords">` exists
- [ ] ✅ Verify Open Graph tags (`og:title`, `og:description`, `og:image`)
- [ ] ✅ Verify Twitter Card tags (`twitter:card`, `twitter:title`)
- [ ] ✅ Verify `<meta name="robots" content="index, follow">`
- [ ] ✅ Verify canonical URL is present

### Blog Listing Page Metadata

**Test 2.2: Blog Listing SEO**
- [ ] Navigate to `http://localhost:3000/blog`
- [ ] View page source
- [ ] ✅ Verify `<title>` contains "Blog"
- [ ] ✅ Verify meta description
- [ ] ✅ Verify breadcrumb navigation displays: Home > Blog
- [ ] ✅ Verify Open Graph tags
- [ ] ✅ Verify robots meta allows indexing

### Blog Post Page Metadata

**Test 2.3: Blog Post SEO**
- [ ] Navigate to a published blog post (e.g., `/blog/test-post`)
- [ ] View page source
- [ ] ✅ Verify `<title>` contains post title
- [ ] ✅ Verify meta description contains post excerpt
- [ ] ✅ Verify breadcrumb: Home > Blog > Post Title
- [ ] ✅ Verify Open Graph type is "article"
- [ ] ✅ Verify og:image shows featured image
- [ ] ✅ Verify structured data (JSON-LD) for Article schema
- [ ] ✅ Check for author, datePublished, dateModified in structured data

### Blog Management Page Metadata

**Test 2.4: Dashboard Blog Metadata**
- [ ] Navigate to `/dashboard/blog`
- [ ] View page source
- [ ] ✅ Verify `<title>` contains "Blog Management"
- [ ] ✅ Verify `<meta name="robots" content="noindex, nofollow">`
- [ ] ✅ Verify no canonical URL (private page)

### Sitemap Integration

**Test 2.5: Sitemap Includes Blog Posts**
- [ ] Navigate to `http://localhost:3000/sitemap.xml`
- [ ] ✅ Verify sitemap XML is valid
- [ ] ✅ Verify `/blog` is included
- [ ] ✅ Verify published blog post URLs are included (e.g., `/blog/test-post`)
- [ ] ✅ Verify draft posts are NOT included
- [ ] ✅ Verify lastmod dates are present
- [ ] ✅ Verify changefreq and priority are set

---

## 3. Blog CRUD Operations End-to-End (Requirements 4.2, 4.3, 4.4, 6.3, 6.4)

### Create Blog Post

**Test 3.1: Create Draft Post**
- [ ] Login as admin user
- [ ] Navigate to `/dashboard/blog`
- [ ] Click "Create Post" button
- [ ] Fill in:
  - Title: "Test Integration Post"
  - Excerpt: "This is a test excerpt"
  - Content: "This is test content with **markdown**"
- [ ] ✅ Slug should auto-generate: "test-integration-post"
- [ ] Click "Save Draft"
- [ ] ✅ Post should be created with status "DRAFT"
- [ ] ✅ Should redirect to blog management page
- [ ] ✅ New post should appear in the list

**Test 3.2: Create Post with Featured Image**
- [ ] Create new post
- [ ] Upload featured image
- [ ] ✅ Image preview should display
- [ ] Save post
- [ ] ✅ Featured image URL should be saved

**Test 3.3: Create Post with Categories and Tags**
- [ ] Create new post
- [ ] Select category (or create new one)
- [ ] Add tags (or create new ones)
- [ ] Save post
- [ ] ✅ Categories and tags should be associated with post

### Read Blog Posts

**Test 3.4: View Draft Posts (Admin)**
- [ ] Navigate to `/dashboard/blog`
- [ ] ✅ Should see all posts including drafts
- [ ] ✅ Draft posts should have "Draft" badge

**Test 3.5: View Published Posts (Public)**
- [ ] Navigate to `/blog` (logged out)
- [ ] ✅ Should only see published posts
- [ ] ✅ Draft posts should NOT be visible

**Test 3.6: View Single Post**
- [ ] Click on a published post
- [ ] ✅ Should navigate to `/blog/[slug]`
- [ ] ✅ Should display full post content
- [ ] ✅ Should show author, date, categories, tags
- [ ] ✅ Featured image should display

### Update Blog Post

**Test 3.7: Edit Existing Post**
- [ ] Navigate to `/dashboard/blog`
- [ ] Click "Edit" on a post
- [ ] Modify title, content, excerpt
- [ ] Click "Update Post"
- [ ] ✅ Changes should be saved
- [ ] ✅ Should redirect to blog management
- [ ] ✅ Updated post should reflect changes

**Test 3.8: Change Post Status**
- [ ] Edit a draft post
- [ ] Click "Publish" button
- [ ] ✅ Status should change to "PUBLISHED"
- [ ] ✅ publishedAt timestamp should be set
- [ ] Navigate to public blog
- [ ] ✅ Post should now be visible

### Delete Blog Post

**Test 3.9: Delete Post**
- [ ] Navigate to `/dashboard/blog`
- [ ] Click "Delete" on a post
- [ ] ✅ Confirmation dialog should appear
- [ ] Confirm deletion
- [ ] ✅ Post should be removed from list
- [ ] ✅ Post should not be accessible via URL

### Publish/Unpublish

**Test 3.10: Publish Post**
- [ ] Create or select a draft post
- [ ] Click "Publish" button
- [ ] ✅ Status changes to "PUBLISHED"
- [ ] ✅ Post appears on public blog

**Test 3.11: Unpublish Post**
- [ ] Select a published post
- [ ] Click "Unpublish" button
- [ ] ✅ Status changes to "DRAFT"
- [ ] ✅ Post disappears from public blog

---

## 4. Permission-Based Access Control (Requirements 4.5)

### Blog Read Permission

**Test 4.1: User Without blog:read**
- [ ] Login as user without `blog:read` permission
- [ ] ✅ "Blog" menu item should NOT appear in dashboard navigation
- [ ] Navigate to `/dashboard/blog` directly
- [ ] ✅ Should redirect to 403 Forbidden page

**Test 4.2: User With blog:read**
- [ ] Login as user with `blog:read` permission
- [ ] ✅ "Blog" menu item should appear in dashboard navigation
- [ ] Navigate to `/dashboard/blog`
- [ ] ✅ Should display blog management page
- [ ] ✅ Should see list of posts

### Blog Write Permission

**Test 4.3: User Without blog:write**
- [ ] Login as user with only `blog:read`
- [ ] Navigate to `/dashboard/blog`
- [ ] ✅ "Create Post" button should be disabled or hidden
- [ ] Try to access `/dashboard/blog/new` directly
- [ ] ✅ Should show 403 Forbidden

**Test 4.4: User With blog:write**
- [ ] Login as user with `blog:write` permission
- [ ] ✅ "Create Post" button should be visible
- [ ] ✅ Should be able to create and edit posts

### Blog Delete Permission

**Test 4.5: User Without blog:delete**
- [ ] Login as user with `blog:read` and `blog:write`
- [ ] Navigate to `/dashboard/blog`
- [ ] ✅ "Delete" button should be disabled or hidden

**Test 4.6: User With blog:delete**
- [ ] Login as admin with `blog:delete` permission
- [ ] ✅ "Delete" button should be visible and functional

### Blog Publish Permission

**Test 4.7: User Without blog:publish**
- [ ] Login as user with `blog:write` but not `blog:publish`
- [ ] Edit a post
- [ ] ✅ "Publish" button should be disabled or hidden
- [ ] ✅ Can only save as draft

**Test 4.8: User With blog:publish**
- [ ] Login as admin with `blog:publish` permission
- [ ] ✅ "Publish" button should be visible
- [ ] ✅ Should be able to publish and unpublish posts

### Public Access

**Test 4.9: Public Blog Access**
- [ ] Logout (or use incognito mode)
- [ ] Navigate to `/blog`
- [ ] ✅ Should display published posts without authentication
- [ ] Navigate to `/blog/[slug]`
- [ ] ✅ Should display post content without authentication

---

## 5. Responsive Design on All Devices (Requirements 2.4, 3.4)

### Mobile (320px - 767px)

**Test 5.1: Landing Page Mobile**
- [ ] Open DevTools, set viewport to 375x667 (iPhone SE)
- [ ] Navigate to landing page
- [ ] ✅ Hero section should stack vertically
- [ ] ✅ CTA buttons should be full-width or stacked
- [ ] ✅ Features should display in single column
- [ ] ✅ Navigation should collapse to hamburger menu
- [ ] ✅ Footer should stack vertically

**Test 5.2: Blog Listing Mobile**
- [ ] Set viewport to mobile
- [ ] Navigate to `/blog`
- [ ] ✅ Blog cards should display in single column
- [ ] ✅ Images should scale properly
- [ ] ✅ Pagination should be touch-friendly
- [ ] ✅ No horizontal scrolling

**Test 5.3: Blog Post Mobile**
- [ ] View a blog post on mobile
- [ ] ✅ Content should be readable without zooming
- [ ] ✅ Images should not overflow
- [ ] ✅ Code blocks should scroll horizontally if needed
- [ ] ✅ Font size should be at least 16px

### Tablet (768px - 1023px)

**Test 5.4: Landing Page Tablet**
- [ ] Set viewport to 768x1024 (iPad)
- [ ] ✅ Features should display in 2 columns
- [ ] ✅ Hero section should be well-proportioned
- [ ] ✅ Navigation should show full menu

**Test 5.5: Blog Listing Tablet**
- [ ] View blog listing on tablet
- [ ] ✅ Blog cards should display in 2 columns
- [ ] ✅ Layout should use available space efficiently

### Desktop (1024px+)

**Test 5.6: Landing Page Desktop**
- [ ] Set viewport to 1920x1080
- [ ] ✅ Features should display in 3 columns
- [ ] ✅ Hero section should be centered with max-width
- [ ] ✅ Content should not stretch too wide

**Test 5.7: Blog Listing Desktop**
- [ ] View blog listing on desktop
- [ ] ✅ Blog cards should display in 3 columns
- [ ] ✅ Sidebar (if present) should display alongside content

### Touch Interactions

**Test 5.8: Touch-Friendly Elements**
- [ ] Test on actual mobile device or touch simulator
- [ ] ✅ Buttons should be at least 44x44px
- [ ] ✅ Links should have adequate spacing
- [ ] ✅ Swipe gestures should work (if implemented)

---

## 6. Accessibility Compliance (Requirements 2.4, 3.4)

### Keyboard Navigation

**Test 6.1: Tab Navigation**
- [ ] Navigate landing page using only Tab key
- [ ] ✅ All interactive elements should be reachable
- [ ] ✅ Focus indicators should be visible
- [ ] ✅ Tab order should be logical

**Test 6.2: Blog Navigation**
- [ ] Navigate blog listing using keyboard
- [ ] ✅ Can navigate between posts
- [ ] ✅ Can activate links with Enter
- [ ] ✅ Can use pagination with keyboard

### Screen Reader Support

**Test 6.3: ARIA Labels**
- [ ] Inspect elements with DevTools
- [ ] ✅ Images have alt text
- [ ] ✅ Buttons have aria-label or visible text
- [ ] ✅ Navigation has aria-label="Main navigation"
- [ ] ✅ Breadcrumbs have aria-label="Breadcrumb"

**Test 6.4: Semantic HTML**
- [ ] View page source
- [ ] ✅ Uses `<nav>` for navigation
- [ ] ✅ Uses `<main>` for main content
- [ ] ✅ Uses `<article>` for blog posts
- [ ] ✅ Uses `<section>` for content sections
- [ ] ✅ Uses `<footer>` for footer

**Test 6.5: Heading Hierarchy**
- [ ] Check heading structure
- [ ] ✅ Only one `<h1>` per page
- [ ] ✅ Headings follow logical order (h1 → h2 → h3)
- [ ] ✅ No skipped heading levels

### Color Contrast

**Test 6.6: Contrast Ratios**
- [ ] Use browser DevTools or WAVE tool
- [ ] ✅ Text has at least 4.5:1 contrast ratio
- [ ] ✅ Large text (18px+) has at least 3:1 ratio
- [ ] ✅ UI components have at least 3:1 ratio
- [ ] ✅ Links are distinguishable from regular text

### Forms Accessibility

**Test 6.7: Blog Editor Form**
- [ ] Navigate to blog editor
- [ ] ✅ All form fields have labels
- [ ] ✅ Required fields are marked
- [ ] ✅ Error messages are associated with fields
- [ ] ✅ Form can be submitted with keyboard

---

## 7. Error Handling and Edge Cases (Requirements 3.1, 3.2, 3.3)

### 404 Errors

**Test 7.1: Blog Post Not Found**
- [ ] Navigate to `/blog/nonexistent-post`
- [ ] ✅ Should display 404 page
- [ ] ✅ Should show "Post Not Found" message
- [ ] ✅ Should provide link back to blog listing

**Test 7.2: Blog Disabled 404**
- [ ] Disable blog feature flag
- [ ] Navigate to `/blog`
- [ ] ✅ Should redirect to 404

### API Errors

**Test 7.3: Network Error**
- [ ] Stop backend server
- [ ] Try to load blog listing
- [ ] ✅ Should show error message
- [ ] ✅ Should not crash the page
- [ ] ✅ Should provide retry option

**Test 7.4: Server Error**
- [ ] Simulate 500 error from backend
- [ ] ✅ Should display error boundary
- [ ] ✅ Should show user-friendly message

### Validation Errors

**Test 7.5: Empty Title**
- [ ] Try to create post with empty title
- [ ] ✅ Should show validation error
- [ ] ✅ Should not submit form

**Test 7.6: Invalid Slug**
- [ ] Try to use invalid slug (spaces, special chars)
- [ ] ✅ Should show validation error
- [ ] ✅ Should suggest valid format

**Test 7.7: Duplicate Slug**
- [ ] Try to create post with existing slug
- [ ] ✅ Should show error or auto-generate unique slug

### Empty States

**Test 7.8: No Blog Posts**
- [ ] Delete all blog posts
- [ ] Navigate to `/blog`
- [ ] ✅ Should show "No posts yet" message
- [ ] ✅ Should not show empty list

**Test 7.9: No Search Results**
- [ ] Search for non-existent term
- [ ] ✅ Should show "No results found" message

### Pagination Edge Cases

**Test 7.10: Invalid Page Number**
- [ ] Navigate to `/blog?page=0`
- [ ] ✅ Should redirect to page 1 or show error
- [ ] Navigate to `/blog?page=999`
- [ ] ✅ Should redirect to last valid page or show error

**Test 7.11: Last Page**
- [ ] Navigate to last page of blog posts
- [ ] ✅ "Next" button should be disabled
- [ ] ✅ Should show correct page number

### Image Upload Errors

**Test 7.12: File Too Large**
- [ ] Try to upload image > 5MB
- [ ] ✅ Should show error message
- [ ] ✅ Should not crash uploader

**Test 7.13: Invalid File Type**
- [ ] Try to upload non-image file
- [ ] ✅ Should show error message
- [ ] ✅ Should only accept image formats

### Markdown Rendering

**Test 7.14: Invalid Markdown**
- [ ] Create post with malformed markdown
- [ ] ✅ Should render safely without crashing
- [ ] ✅ Should not execute scripts (XSS protection)

**Test 7.15: Code Blocks**
- [ ] Create post with code blocks
- [ ] ✅ Should render with syntax highlighting
- [ ] ✅ Should be scrollable if too wide

---

## 8. Performance Testing

### Page Load Times

**Test 8.1: Landing Page Load**
- [ ] Open DevTools Network tab
- [ ] Navigate to landing page
- [ ] ✅ Page should load in < 3 seconds
- [ ] ✅ First Contentful Paint < 1.5s

**Test 8.2: Blog Listing Load**
- [ ] Navigate to blog listing
- [ ] ✅ Should load in < 3 seconds
- [ ] ✅ Images should lazy load

**Test 8.3: Blog Post Load**
- [ ] Navigate to blog post
- [ ] ✅ Should load in < 2 seconds
- [ ] ✅ Featured image should be optimized

### Caching

**Test 8.4: ISR (Incremental Static Regeneration)**
- [ ] Navigate to blog post
- [ ] Note load time
- [ ] Refresh page
- [ ] ✅ Second load should be faster (cached)

**Test 8.5: API Response Caching**
- [ ] Load blog listing
- [ ] Check Network tab
- [ ] Refresh page within 5 minutes
- [ ] ✅ Should use cached response

---

## 9. Integration Testing

### Full Workflow Test

**Test 9.1: Complete Blog Post Lifecycle**
1. [ ] Login as admin
2. [ ] Create draft post with title, content, image
3. [ ] ✅ Verify slug auto-generated
4. [ ] ✅ Verify excerpt auto-generated
5. [ ] Save draft
6. [ ] ✅ Verify post appears in dashboard
7. [ ] Edit post, add categories and tags
8. [ ] Publish post
9. [ ] ✅ Verify post appears on public blog
10. [ ] ✅ Verify SEO metadata is correct
11. [ ] ✅ Verify post is in sitemap
12. [ ] View post as public user
13. [ ] ✅ Verify all content displays correctly
14. [ ] Unpublish post
15. [ ] ✅ Verify post disappears from public blog
16. [ ] Delete post
17. [ ] ✅ Verify post is completely removed

### Cross-Feature Integration

**Test 9.2: Landing Page to Blog**
- [ ] Navigate to landing page
- [ ] Click "Blog" link (if present)
- [ ] ✅ Should navigate to blog listing
- [ ] ✅ Navigation should be seamless

**Test 9.3: Blog to Dashboard**
- [ ] View blog post as admin
- [ ] ✅ Should see "Edit" button
- [ ] Click "Edit"
- [ ] ✅ Should navigate to dashboard editor

---

## 10. Browser Compatibility

**Test 10.1: Chrome**
- [ ] Test all features in Chrome
- [ ] ✅ All features work correctly

**Test 10.2: Firefox**
- [ ] Test all features in Firefox
- [ ] ✅ All features work correctly

**Test 10.3: Safari**
- [ ] Test all features in Safari
- [ ] ✅ All features work correctly

**Test 10.4: Edge**
- [ ] Test all features in Edge
- [ ] ✅ All features work correctly

---

## Summary

### Test Results

- **Total Tests**: ~100+
- **Passed**: ___
- **Failed**: ___
- **Skipped**: ___

### Critical Issues Found

1. ___
2. ___
3. ___

### Non-Critical Issues Found

1. ___
2. ___
3. ___

### Recommendations

1. ___
2. ___
3. ___

### Sign-Off

- [ ] All critical tests passed
- [ ] All requirements verified
- [ ] Documentation updated
- [ ] Ready for production

**Tested By**: _______________
**Date**: _______________
**Signature**: _______________

---

## Quick Test Commands

### Frontend Tests
```bash
cd frontend
npm test landing-blog-final-integration.test.tsx
```

### Backend Tests
```bash
cd backend
npm run test:e2e blog-final-integration.e2e-spec.ts
```

### Accessibility Audit
```bash
cd frontend
npm run lighthouse -- --only-categories=accessibility
```

### SEO Audit
```bash
cd frontend
npm run lighthouse -- --only-categories=seo
```

### Performance Audit
```bash
cd frontend
npm run lighthouse -- --only-categories=performance
```

---

## Additional Resources

- **Requirements**: `.kiro/specs/landing-page-blog-system/requirements.md`
- **Design Doc**: `.kiro/specs/landing-page-blog-system/design.md`
- **Configuration Guide**: `.kiro/specs/landing-page-blog-system/CONFIGURATION_GUIDE.md`
- **API Reference**: `.kiro/specs/landing-page-blog-system/API_REFERENCE.md`
- **Steering Guide**: `.kiro/steering/landing-blog-system.md`
