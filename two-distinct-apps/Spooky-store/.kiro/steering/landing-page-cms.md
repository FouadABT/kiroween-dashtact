---
inclusion: fileMatch
fileMatchPattern: "{backend/src/{landing,pages}/**/*,frontend/src/{app,components}/{dashboard/{settings/landing-page,pages},\\[...slug\\]}/**/*,backend/prisma/schema.prisma}"
---

# Landing Page CMS

## CRITICAL: Module Registration

**ALWAYS import LandingModule and PagesModule in app.module.ts or routes won't exist.**

### ❌ WRONG - Missing Module Imports
```typescript
@Module({
  imports: [
    PrismaModule,
    PermissionsModule,
    // LandingModule missing!
    // PagesModule missing!
  ],
})
export class AppModule {}
```

### ✅ CORRECT - Modules Imported
```typescript
@Module({
  imports: [
    PrismaModule,
    PermissionsModule,
    LandingModule,  // Routes registered
    PagesModule,    // Routes registered
  ],
})
export class AppModule {}
```

---

## CRITICAL: Slug Validation

**ALWAYS validate slugs for uniqueness, format, and system route conflicts.**

### ❌ WRONG - No Slug Validation
```typescript
// Creating page without validation
const page = await prisma.customPage.create({
  data: { title, slug, content },
});
```

### ✅ CORRECT - Full Slug Validation
```typescript
// 1. Auto-generate slug from title
const slug = title.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');

// 2. Check format
if (!/^[a-z0-9-]+$/.test(slug)) {
  throw new BadRequestException('Invalid slug format');
}

// 3. Check system routes
const systemRoutes = ['dashboard', 'login', 'api', 'blog', 'admin'];
if (systemRoutes.includes(slug)) {
  throw new BadRequestException(`Slug "${slug}" conflicts with system route`);
}

// 4. Check uniqueness
const existing = await prisma.customPage.findUnique({ where: { slug } });
if (existing) {
  const suggestedSlug = `${slug}-2`;
  throw new BadRequestException(`Slug "${slug}" is taken. Try "${suggestedSlug}"`);
}

// 5. Create page
const page = await prisma.customPage.create({
  data: { title, slug, content },
});
```

---

## CRITICAL: Slug Change Redirects

**ALWAYS create 301 redirects when changing page slugs.**

### ❌ WRONG - No Redirect Created
```typescript
// Updating slug without redirect
await prisma.customPage.update({
  where: { id },
  data: { slug: newSlug },
});
```

### ✅ CORRECT - Create Redirect
```typescript
// 1. Get existing page
const existingPage = await prisma.customPage.findUnique({ where: { id } });

// 2. Check if slug changed
if (newSlug !== existingPage.slug) {
  // 3. Create redirect from old slug to page
  await prisma.pageRedirect.create({
    data: {
      fromSlug: existingPage.slug,
      toPageId: id,
      redirectType: 301,
    },
  });
}

// 4. Update page
await prisma.customPage.update({
  where: { id },
  data: { slug: newSlug },
});
```

---

## CRITICAL: Section Structure

**Landing page sections MUST follow this exact structure.**

### ❌ WRONG - Invalid Section Structure
```typescript
// Missing required fields
const sections = [
  {
    type: 'hero',
    data: { headline: 'Welcome' },
  },
];
```

### ✅ CORRECT - Complete Section Structure
```typescript
const sections = [
  {
    id: `hero-${Date.now()}`,     // Unique ID
    type: 'hero',                  // Section type
    enabled: true,                 // Visibility toggle
    order: 1,                      // Display order
    data: {                        // Section-specific data
      headline: 'Welcome',
      subheadline: 'Get started',
      primaryCta: {
        text: 'Sign Up',
        link: 'https://example.com/signup',
        linkType: 'url',
      },
      backgroundType: 'gradient',
      textAlignment: 'center',
      height: 'large',
    },
  },
];
```

**Section Types**: `hero`, `features`, `footer`, `cta`, `testimonials`, `stats`, `content`

---

## CRITICAL: CTA Link Resolution

**ALWAYS resolve page links to URLs, not IDs.**

### ❌ WRONG - Using Page ID Directly
```tsx
// Rendering page ID as link
<a href={cta.link}>{cta.text}</a>
```

### ✅ CORRECT - Resolve Page Link
```tsx
// Resolve page link to URL
const resolveLink = async (link: string, linkType: string) => {
  if (linkType === 'page') {
    const page = await PagesApi.getById(link);
    return `/${page.slug}`;
  }
  return link;  // External URL
};

const href = await resolveLink(cta.link, cta.linkType);
<a href={href}>{cta.text}</a>
```

---

## CRITICAL: Public Page Access Control

**ALWAYS check page status and visibility before rendering.**

### ❌ WRONG - No Access Control
```tsx
// Rendering page without checks
const page = await PagesApi.getBySlug(slug);
return <PageContent page={page} />;
```

### ✅ CORRECT - Full Access Control
```tsx
// 1. Fetch page
let page = await PagesApi.getBySlug(slug);

// 2. Check for redirect
if (!page) {
  const redirect = await RedirectService.resolveRedirect(slug);
  if (redirect) {
    return redirect(`/${redirect.slug}`);
  }
  return notFound();
}

// 3. Check if draft (unless authenticated with permissions)
if (page.status === 'DRAFT' && !hasPermission('pages:read')) {
  return notFound();
}

// 4. Check if private (redirect to login unless authenticated)
if (page.visibility === 'PRIVATE' && !isAuthenticated) {
  return redirect('/login');
}

// 5. Render page
return <PageContent page={page} />;
```

---

## CRITICAL: Circular Parent References

**ALWAYS prevent circular parent-child relationships.**

### ❌ WRONG - No Circular Check
```typescript
// Setting parent without validation
await prisma.customPage.update({
  where: { id },
  data: { parentPageId },
});
```

### ✅ CORRECT - Prevent Circular References
```typescript
// 1. Check if setting self as parent
if (parentPageId === id) {
  throw new BadRequestException('Page cannot be its own parent');
}

// 2. Check if setting child as parent
const childPages = await prisma.customPage.findMany({
  where: { parentPageId: id },
});
if (childPages.some(child => child.id === parentPageId)) {
  throw new BadRequestException('Cannot set child page as parent');
}

// 3. Update page
await prisma.customPage.update({
  where: { id },
  data: { parentPageId },
});
```

---

## Common Mistakes

### Mistake 1: Forgetting Cache Invalidation
```typescript
// ❌ WRONG
async updateContent(dto: UpdateLandingContentDto) {
  return this.prisma.landingPageContent.update({ ... });
}

// ✅ CORRECT
@CacheEvict()
async updateContent(dto: UpdateLandingContentDto) {
  return this.prisma.landingPageContent.update({ ... });
}
```

### Mistake 2: Not Handling Child Pages on Delete
```typescript
// ❌ WRONG
async delete(id: string) {
  await this.prisma.customPage.delete({ where: { id } });
}

// ✅ CORRECT
async delete(id: string) {
  // Check for child pages
  const childPages = await this.prisma.customPage.findMany({
    where: { parentPageId: id },
  });
  
  if (childPages.length > 0) {
    throw new BadRequestException(
      'Cannot delete page with child pages. Reassign or delete child pages first.'
    );
  }
  
  await this.prisma.customPage.delete({ where: { id } });
}
```

### Mistake 3: Missing Permissions on Endpoints
```typescript
// ❌ WRONG
@Patch(':id')
async update(@Param('id') id: string, @Body() dto: UpdatePageDto) {
  return this.pagesService.update(id, dto);
}

// ✅ CORRECT
@Patch(':id')
@UseGuards(JwtAuthGuard, PermissionsGuard)
@Permissions('pages:write')
async update(@Param('id') id: string, @Body() dto: UpdatePageDto) {
  return this.pagesService.update(id, dto);
}
```

### Mistake 4: Not Sorting Sections by Order
```typescript
// ❌ WRONG
{sections.map(section => <Section key={section.id} {...section} />)}

// ✅ CORRECT
{sections
  .filter(s => s.enabled)
  .sort((a, b) => a.order - b.order)
  .map(section => <Section key={section.id} {...section} />)}
```

---

## Quick Reference

### Permissions
- `landing:read` - View landing page editor
- `landing:write` - Edit landing page content
- `pages:read` - View pages dashboard
- `pages:write` - Create/edit pages
- `pages:delete` - Delete pages
- `pages:publish` - Publish/unpublish pages

### Slug Pattern
```typescript
/^[a-z0-9-]+$/  // Lowercase, alphanumeric, hyphens only
```

### System Routes to Avoid
```typescript
['dashboard', 'login', 'api', 'blog', 'admin', 'auth', 'profile', 'settings']
```

### Page Status
- `DRAFT` - Not publicly accessible
- `PUBLISHED` - Publicly accessible
- `ARCHIVED` - Hidden from lists

### Page Visibility
- `PUBLIC` - Accessible to everyone
- `PRIVATE` - Requires authentication

### Section Types
- `hero` - Hero section with CTA buttons
- `features` - Feature cards grid
- `footer` - Footer with nav/social links
- `cta` - Call-to-action section
- `testimonials` - Customer testimonials
- `stats` - Statistics display
- `content` - Rich content with image

---

## Remember

1. **Module Registration**: Import `LandingModule` and `PagesModule` in `app.module.ts`
2. **Slug Validation**: Check uniqueness, format, and system route conflicts
3. **Redirects**: Create 301 redirects on slug changes
4. **Access Control**: Check status and visibility before rendering
5. **Circular References**: Prevent parent-child loops
6. **Cache Invalidation**: Clear cache on updates
7. **Child Pages**: Handle child pages on delete
8. **Permissions**: Apply guards to all admin endpoints
9. **Section Order**: Sort sections by order field
10. **Link Resolution**: Resolve page links to URLs
