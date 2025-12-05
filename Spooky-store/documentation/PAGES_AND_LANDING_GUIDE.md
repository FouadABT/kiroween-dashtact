# Pages & Landing Page Customization Guide

## Issue Fixed ✅

**Problem:** API error when accessing `/dashboard/pages`
```
GET http://localhost:3001/pages/admin?status=PUBLISHED&limit=100 400 (Bad Request)
Error: limit must not be greater than 50
```

**Solution:** Updated `frontend/src/components/pages/PageFilters.tsx` to use `limit: 50` instead of `limit: 100` to match backend validation.

## How to Customize Landing Page (Home Page)

### Access the Landing Page Editor

1. **Navigate to:** `http://localhost:3000/dashboard/settings/landing-page`
2. **Permission Required:** `landing:write`

### What You Can Customize

The landing page editor allows you to customize all sections of your home page:

#### 1. **Hero Section**
- Headline
- Subheadline  
- Primary CTA button (text + link)
- Secondary CTA button (text + link)
- Background image

#### 2. **Features Section**
- Add/remove/reorder feature cards
- Each card has:
  - Icon (from icon picker)
  - Title
  - Description

#### 3. **Stats Section**
- Add/remove stat items
- Each stat has:
  - Value (number)
  - Label
  - Icon (optional)

#### 4. **Testimonials Section**
- Add/remove testimonials
- Each testimonial has:
  - Quote
  - Author name
  - Author role
  - Author avatar image

#### 5. **CTA Section**
- Headline
- Description
- Primary button (text + link)
- Secondary button (text + link)

#### 6. **Footer Section**
- Company name
- Company description
- Navigation links (add/remove/edit)
- Social media links (add/remove/edit)
- Copyright text

#### 7. **Global Settings**
- Site title
- Site description
- Primary color
- Secondary color
- Font family

### How to Save Changes

1. Make your edits in any section
2. Click **"Save Changes"** button at the top
3. Changes are saved to the database
4. The public landing page at `http://localhost:3000/` updates immediately

### Linking to Custom Pages

When configuring CTA buttons, you can:
- Enter a custom URL (e.g., `/about`, `/contact`)
- Select from existing custom pages using the page selector dropdown

## How to Manage Custom Pages

### Access the Pages Dashboard

1. **Navigate to:** `http://localhost:3000/dashboard/pages`
2. **Permission Required:** `pages:read`

### Create a New Page

1. Click **"Create Page"** button
2. Fill in page details:
   - **Title:** Page name (e.g., "About Us")
   - **Slug:** URL path (auto-generated from title, e.g., "about-us")
   - **Content:** Page content (Markdown or rich text)
   - **Featured Image:** Upload an image
   - **SEO Metadata:** Meta title, description, keywords
   - **Status:** Draft or Published
   - **Visibility:** Public or Private
   - **Show in Navigation:** Add to footer menu
   - **Parent Page:** Create nested pages (optional)

3. Click **"Save"** or **"Publish"**

### Page URLs

Pages are accessible at:
- Top-level: `http://localhost:3000/{slug}`
- Nested: `http://localhost:3000/{parent-slug}/{child-slug}`

Examples:
- `/about` - About page
- `/company/team` - Team page under Company
- `/products/pricing` - Pricing page under Products

### Page Features

#### Status
- **Draft:** Not publicly accessible, only visible to admins
- **Published:** Publicly accessible at the page URL

#### Visibility
- **Public:** Anyone can view
- **Private:** Requires authentication

#### Navigation Integration
- Enable "Show in Navigation" to add page to footer menu
- Pages appear in hierarchical order
- Drag and drop to reorder pages

#### SEO
- Custom meta title, description, keywords
- Automatic sitemap generation
- Breadcrumb navigation
- Open Graph tags for social sharing

#### URL Management
- Automatic slug generation from title
- Slug uniqueness validation
- 301 redirects when slug changes
- Prevents conflicts with system routes

### Bulk Actions

Select multiple pages and:
- **Publish:** Make pages public
- **Unpublish:** Revert to draft
- **Delete:** Remove pages

### Page Hierarchy

Create nested pages:
1. Edit a page
2. Select a **Parent Page** from dropdown
3. Save
4. Page URL becomes `/{parent-slug}/{page-slug}`

Example hierarchy:
```
Company (parent)
├── About (/company/about)
├── Team (/company/team)
└── Careers (/company/careers)

Products (parent)
├── Features (/products/features)
└── Pricing (/products/pricing)
```

## Testing Your Changes

### Test Landing Page
1. Make changes at `/dashboard/settings/landing-page`
2. Click "Save Changes"
3. Visit `http://localhost:3000/` to see updates
4. Check all sections render correctly

### Test Custom Pages
1. Create a page at `/dashboard/pages`
2. Set status to "Published"
3. Visit `http://localhost:3000/{your-slug}`
4. Verify content, SEO metadata, and breadcrumbs

### Test Navigation
1. Enable "Show in Navigation" on a page
2. Visit `http://localhost:3000/`
3. Scroll to footer
4. Verify page appears in navigation menu

## Permissions

### Landing Page
- **View:** `landing:read`
- **Edit:** `landing:write`

### Custom Pages
- **View List:** `pages:read`
- **Create/Edit:** `pages:write`
- **Delete:** `pages:delete`
- **Publish/Unpublish:** `pages:publish`

### Default Role Access
- **Super Admin:** All permissions
- **Admin:** All permissions
- **Manager:** Read and write (no delete)
- **User:** Read only

## Quick Links

- **Landing Page Editor:** http://localhost:3000/dashboard/settings/landing-page
- **Pages Dashboard:** http://localhost:3000/dashboard/pages
- **Create New Page:** http://localhost:3000/dashboard/pages/new
- **Public Landing Page:** http://localhost:3000/

## Troubleshooting

### Landing Page Not Updating
- Check browser cache (hard refresh: Ctrl+Shift+R)
- Verify changes saved successfully
- Check backend logs for errors

### Page Not Accessible
- Verify status is "Published"
- Check slug is correct
- Ensure no typos in URL
- Check visibility settings

### Page Not in Navigation
- Enable "Show in Navigation" checkbox
- Save the page
- Refresh the public site
- Check footer navigation

### Slug Conflicts
- Slugs must be unique
- Cannot use system routes (/dashboard, /login, etc.)
- System suggests available alternatives
- Change slug and try again

## Next Steps

1. ✅ Fix the limit validation error (DONE)
2. 🎨 Customize your landing page at `/dashboard/settings/landing-page`
3. 📄 Create custom pages at `/dashboard/pages`
4. 🔗 Link pages together using parent-child relationships
5. 🧭 Enable navigation integration for important pages
6. 🚀 Test everything on the public site

Enjoy building your content! 🎉
