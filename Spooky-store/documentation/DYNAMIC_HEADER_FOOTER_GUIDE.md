# Dynamic Header & Footer Integration Guide

## Overview

The landing page now supports **dynamic header and footer** that can be configured through the CMS settings at `/dashboard/settings/landing-page`. This allows you to customize navigation, logos, CTAs, footer columns, social links, and more without touching code.

---

## ✅ What Was Implemented

### 1. **New Components**

#### `DynamicHeader.tsx`
- Fetches header config from `/landing/header` API
- **Integrates with branding system** for logo and brand name
- **Supports light/dark theme** switching automatically
- Renders logo (light/dark mode support)
- Renders navigation menu items
- Renders CTA buttons
- Mobile menu with animations
- Loading skeleton
- Fallback to static header if config fails
- **Priority system**: CMS config → Branding system → Default fallback

#### `DynamicFooter.tsx`
- Fetches footer config from `/landing/footer` API
- **Integrates with branding system** for brand name, social links, and support email
- **Supports light/dark theme** automatically
- Renders footer columns (links, text, contact)
- Renders social media links (merges CMS + branding)
- Newsletter signup form
- Copyright with template variables (`{year}`, `{brand}`)
- Legal links
- Loading skeleton
- Fallback to static footer if config fails
- **Priority system**: CMS config → Branding system → Default fallback

### 2. **Feature Flag System**

Added `useDynamicHeaderFooter` flag to control which header/footer to use:

```typescript
// frontend/src/config/features.config.ts
landingPage: {
  enabled: true,
  useDynamicHeaderFooter: true, // NEW FLAG
}
```

### 3. **Updated LandingLayout**

The `LandingLayout` component now switches between static and dynamic components:

```tsx
{useDynamic ? <DynamicHeader /> : <PublicNavigation />}
{useDynamic ? <DynamicFooter /> : <Footer />}
```

### 4. **Environment Variables**

Added new environment variable:

```bash
# Enable dynamic header/footer from CMS
NEXT_PUBLIC_USE_DYNAMIC_HEADER_FOOTER=true
```

---

## 🚀 How to Use

### Step 1: Enable the Feature

**Option A: Environment Variable (Recommended)**

Edit `frontend/.env.local`:

```bash
NEXT_PUBLIC_USE_DYNAMIC_HEADER_FOOTER=true
```

**Option B: Direct Config**

Edit `frontend/src/config/features.config.ts`:

```typescript
landingPage: {
  enabled: true,
  useDynamicHeaderFooter: true,
}
```

### Step 2: Configure Header & Footer

1. Navigate to `/dashboard/settings/landing-page`
2. Click the **Header** tab
3. Configure:
   - Logo (light & dark mode)
   - Navigation menu items
   - CTA buttons
   - Mobile menu settings
   - Sticky behavior
4. Click **Save Changes**

5. Click the **Footer** tab
6. Configure:
   - Footer layout
   - Content columns
   - Social media links
   - Newsletter signup
   - Copyright text
   - Legal links
7. Click **Save Changes**

### Step 3: View Your Changes

1. Open the home page: `http://localhost:3000`
2. Your configured header and footer should appear
3. Changes are cached for 5 minutes

---

## 🎨 Features

### Header Features

✅ **Logo Management**
- Upload separate logos for light/dark mode
- **Automatic theme switching** - Logo changes with light/dark mode
- **Branding integration** - Falls back to branding system logos
- Adjustable logo size (small, medium, large)
- Custom logo link
- Brand name display with first letter fallback

✅ **Theme Integration**
- **Fully theme-aware** - Background and text colors adapt to light/dark mode
- Uses design system color tokens
- No hardcoded colors
- Proper contrast in both themes

✅ **Navigation Menu**
- Unlimited menu items
- Internal/external links
- Dropdown menus (UI ready)
- Mega menus (UI ready)
- Drag-and-drop reordering

✅ **CTA Buttons**
- Multiple CTA buttons
- Three styles: primary, secondary, outline
- Custom text and links

✅ **Theme Toggle**
- **Automatic light/dark mode switching**
- Moon/Sun icon toggle button
- Desktop: Icon button in header
- Mobile: Full-width button in mobile menu
- Integrates with theme system
- Persists user preference

✅ **Mobile Menu**
- Hamburger, dots, or text icon
- Slide, fade, or scale animations
- Responsive design
- Includes theme toggle

✅ **Styling**
- Custom background color
- Sticky header options
- Transparent background
- Drop shadow
- Hide on scroll behaviors

### Footer Features

✅ **Layout Options**
- Single column
- Multi-column (2-4 columns)
- Centered
- Split layout

✅ **Content Columns**
- Navigation links
- Text blocks
- Contact information
- Unlimited columns

✅ **Social Media**
- Facebook, Twitter, Instagram
- LinkedIn, GitHub, YouTube
- **Branding integration** - Automatically uses branding social links if CMS not configured
- Custom URLs
- Icon display
- **Smart merging** - CMS config takes priority over branding

✅ **Newsletter Signup**
- Enable/disable toggle
- Custom title and placeholder
- Custom button text
- Form integration ready

✅ **Legal & Copyright**
- Template variables: `{year}`, `{brand}`
- **Automatic brand name** - Uses branding system brand name
- Legal links (Privacy, Terms, etc.)
- Custom copyright text
- **Support email** - Shows branding support email if no contact column

✅ **Styling**
- Custom background color
- Custom text color
- Top border toggle

---

## 🔗 Branding System Integration

### How It Works

The dynamic header and footer **automatically integrate** with your existing branding system:

**Priority System:**
1. **CMS Configuration** (highest priority)
2. **Branding System** (fallback)
3. **Default Values** (last resort)

### What Gets Synced

#### Header
- **Logo**: Uses branding logos if CMS logos not set
- **Brand Name**: Uses branding brand name for display
- **Theme Support**: Automatically switches logo based on light/dark mode

#### Footer
- **Brand Name**: Used in copyright text (`{brand}` variable)
- **Social Links**: Uses branding social links if CMS not configured
- **Support Email**: Shows branding support email if no contact column
- **Copyright**: Automatically includes brand name

### Configuration Locations

**Branding Settings**: `/dashboard/settings/branding`
- Upload logos (light & dark)
- Set brand name
- Configure social media links
- Set support email

**Landing Page Settings**: `/dashboard/settings/landing-page`
- Override branding with custom header/footer
- Add navigation menus
- Configure CTAs
- Customize layout

### Example Scenarios

#### Scenario 1: Using Branding Only
```
Branding: ✅ Configured
CMS Header: ❌ Empty
CMS Footer: ❌ Empty

Result: Uses branding logos, brand name, and social links
```

#### Scenario 2: CMS Override
```
Branding: ✅ Configured
CMS Header: ✅ Custom logo uploaded
CMS Footer: ✅ Custom social links

Result: Uses CMS configuration, ignores branding
```

#### Scenario 3: Hybrid Approach
```
Branding: ✅ Configured (logo, brand name, social links)
CMS Header: ✅ Custom navigation only
CMS Footer: ❌ Empty

Result: 
- Header: Branding logo + CMS navigation
- Footer: Branding social links + brand name
```

### Theme Integration

**Automatic Theme Switching:**
- Header logo changes with theme (light/dark)
- Footer respects theme colors
- No manual configuration needed

**How to Configure:**
1. Upload light mode logo in branding settings
2. Upload dark mode logo in branding settings
3. System automatically switches based on user's theme preference

**Theme Settings**: `/dashboard/settings/theme`
- Configure light/dark color palettes
- Set default theme mode
- Customize theme colors

### Theme Toggle Button

**Automatic Integration:**
- Theme toggle button automatically appears in header
- Desktop: Icon button (Moon/Sun) next to CTAs
- Mobile: Full-width button in mobile menu
- No configuration needed - works out of the box

**How It Works:**
1. User clicks theme toggle
2. Theme switches between light/dark
3. Logo automatically updates (if different logos configured)
4. All colors update instantly
5. Preference saved to localStorage
6. Persists across page reloads

**Customization:**
- Theme colors: `/dashboard/settings/theme`
- Logo for each theme: `/dashboard/settings/branding`
- Button always uses theme-aware colors

---

## 🔄 Switching Between Static & Dynamic

### Use Dynamic (CMS-Controlled)

```bash
NEXT_PUBLIC_USE_DYNAMIC_HEADER_FOOTER=true
```

**Pros:**
- ✅ No code changes needed
- ✅ Non-technical users can edit
- ✅ Live preview in settings
- ✅ Consistent with CMS content

**Cons:**
- ❌ Requires API call on page load
- ❌ Slight delay (cached after first load)

### Use Static (Hardcoded)

```bash
NEXT_PUBLIC_USE_DYNAMIC_HEADER_FOOTER=false
```

**Pros:**
- ✅ Faster initial load
- ✅ No API dependency
- ✅ Simpler for basic sites

**Cons:**
- ❌ Requires code changes to update
- ❌ Not editable by non-developers

---

## 🛠️ Technical Details

### API Endpoints

**Header Config:**
```
GET  /landing/header        # Public - Get header config
PUT  /landing/header        # Admin - Update header config
```

**Footer Config:**
```
GET  /landing/footer        # Public - Get footer config
PUT  /landing/footer        # Admin - Update footer config
```

### Caching

- **Backend Cache:** 5 minutes (HTTP headers)
- **Browser Cache:** Respects Cache-Control headers
- **Component State:** Cached in React state after first load

### Loading States

Both components show skeleton loaders while fetching:
- Header: Logo and menu placeholders
- Footer: Column placeholders

### Fallback Behavior

If API fails or returns no config:
- Header: Shows default logo and "Dashboard" text
- Footer: Shows copyright only

### Theme Support

- Header: Automatically switches logo based on theme (light/dark)
- Footer: Uses configured colors (respects theme)

---

## 📝 Configuration Examples

### Example 1: Simple Header

```typescript
{
  logoLight: '/logo-light.svg',
  logoDark: '/logo-dark.svg',
  logoSize: 'md',
  logoLink: '/',
  navigation: [
    { label: 'Features', link: '/features', type: 'internal' },
    { label: 'Pricing', link: '/pricing', type: 'internal' },
    { label: 'Blog', link: '/blog', type: 'internal' },
  ],
  ctas: [
    { text: 'Sign In', link: '/login', style: 'secondary' },
    { text: 'Get Started', link: '/signup', style: 'primary' },
  ],
  style: {
    background: '#ffffff',
    sticky: true,
    shadow: true,
  },
  mobileMenu: {
    enabled: true,
    iconStyle: 'hamburger',
    animation: 'slide',
  },
}
```

### Example 2: Multi-Column Footer

```typescript
{
  layout: 'multi-column',
  columns: [
    {
      heading: 'Product',
      type: 'links',
      links: [
        { label: 'Features', link: '/features' },
        { label: 'Pricing', link: '/pricing' },
        { label: 'FAQ', link: '/faq' },
      ],
    },
    {
      heading: 'Company',
      type: 'links',
      links: [
        { label: 'About', link: '/about' },
        { label: 'Blog', link: '/blog' },
        { label: 'Careers', link: '/careers' },
      ],
    },
    {
      heading: 'Contact',
      type: 'contact',
      text: 'Email: support@example.com\nPhone: +1 234 567 890',
    },
  ],
  social: [
    { platform: 'twitter', url: 'https://twitter.com/example' },
    { platform: 'linkedin', url: 'https://linkedin.com/company/example' },
  ],
  newsletter: {
    enabled: true,
    title: 'Subscribe to our newsletter',
    placeholder: 'Enter your email',
    buttonText: 'Subscribe',
  },
  copyright: '© {year} {brand}. All rights reserved.',
  legalLinks: [
    { label: 'Privacy Policy', link: '/privacy' },
    { label: 'Terms of Service', link: '/terms' },
  ],
  style: {
    background: '#1a1a1a',
    textColor: '#ffffff',
    borderTop: true,
  },
}
```

---

## 🐛 Troubleshooting

### Header/Footer Not Showing

**Check:**
1. ✅ Feature flag enabled: `NEXT_PUBLIC_USE_DYNAMIC_HEADER_FOOTER=true`
2. ✅ Landing page enabled: `NEXT_PUBLIC_ENABLE_LANDING=true`
3. ✅ Backend running: `http://localhost:3001`
4. ✅ API endpoints accessible: `/landing/header`, `/landing/footer`

### Still Seeing Old Header/Footer

**Solution:**
1. Clear browser cache
2. Restart Next.js dev server
3. Check browser console for errors
4. Verify environment variable is set

### Configuration Not Saving

**Check:**
1. ✅ Logged in as Super Admin
2. ✅ Permission: `landing:write`
3. ✅ Backend database connected
4. ✅ No console errors in settings page

### Logo Not Displaying

**Check:**
1. ✅ Logo URL is valid
2. ✅ Image is accessible (CORS)
3. ✅ Both light and dark logos uploaded
4. ✅ Logo size is set correctly

---

## 🎯 Next Steps

### Recommended Enhancements

1. **Dropdown Menus**: Implement dropdown functionality for navigation
2. **Mega Menus**: Add mega menu support with rich content
3. **Newsletter Integration**: Connect newsletter form to email service
4. **Analytics**: Track header/footer interactions
5. **A/B Testing**: Test different header/footer configurations
6. **Localization**: Add multi-language support

### Optional Features

- **Search Bar**: Add search to header
- **User Menu**: Show user profile in header when logged in
- **Breadcrumbs**: Add breadcrumb navigation
- **Back to Top**: Add scroll-to-top button in footer
- **Live Chat**: Integrate chat widget in footer

---

## 📚 Related Files

**Components:**
- `frontend/src/components/landing/DynamicHeader.tsx`
- `frontend/src/components/landing/DynamicFooter.tsx`
- `frontend/src/components/landing/LandingLayout.tsx`
- `frontend/src/components/landing/PublicNavigation.tsx` (static fallback)
- `frontend/src/components/landing/Footer.tsx` (static fallback)

**Configuration:**
- `frontend/src/config/features.config.ts`
- `frontend/.env.local`
- `frontend/.env.example`

**API:**
- `frontend/src/lib/api.ts` (LandingApi class)
- `backend/src/landing/landing.controller.ts`
- `backend/src/landing/header-footer.service.ts`

**Types:**
- `frontend/src/types/landing-cms.ts`
- `backend/src/landing/dto/header-config.dto.ts`
- `backend/src/landing/dto/footer-config.dto.ts`

**Settings UI:**
- `frontend/src/components/settings/LandingPageSettingsClient.tsx`
- `frontend/src/components/landing/HeaderEditor.tsx`
- `frontend/src/components/landing/FooterEditor.tsx`

---

## ✨ Summary

You now have a fully functional dynamic header and footer system that:

✅ **Connects to Landing Page Settings** - Edit via CMS
✅ **Integrates with Branding System** - Automatic logo and brand name
✅ **Supports Light/Dark Mode** - Automatic theme switching
✅ **Theme Toggle Button** - Built-in light/dark mode switcher
✅ **Smart Priority System** - CMS → Branding → Defaults
✅ **Social Links Merging** - Combines CMS and branding social links
✅ **Loading States** - Skeleton loaders while fetching
✅ **Fallback Support** - Graceful degradation if API fails
✅ **Feature Flag Control** - Easy on/off toggle
✅ **Backward Compatible** - Static components still available
✅ **Mobile Responsive** - Full mobile menu with theme toggle
✅ **Accessibility** - ARIA labels and keyboard navigation

### Quick Start

**1. Enable the Feature:**
```bash
# frontend/.env.local
NEXT_PUBLIC_USE_DYNAMIC_HEADER_FOOTER=true
```

**2. Configure Branding (Optional but Recommended):**
- Visit `/dashboard/settings/branding`
- Upload logos (light & dark mode)
- Set brand name
- Add social media links
- Set support email

**3. Customize Header/Footer (Optional):**
- Visit `/dashboard/settings/landing-page`
- Click **Header** tab to customize navigation
- Click **Footer** tab to customize footer
- Changes override branding settings

**4. Configure Theme (Optional):**
- Visit `/dashboard/settings/theme`
- Customize light/dark color palettes
- Set default theme mode

**5. View Your Landing Page:**
- Open `http://localhost:3000`
- Click theme toggle to switch modes
- Logo and colors update automatically

### What You Get

**Without Any Configuration:**
- Default logo with brand initial
- "Dashboard" brand name
- Theme toggle button
- Basic footer with copyright

**With Branding Configured:**
- Your custom logos (auto-switches with theme)
- Your brand name
- Your social media links
- Your support email
- Theme toggle button

**With CMS Configured:**
- Custom navigation menu
- Custom CTA buttons
- Custom footer columns
- Custom newsletter form
- Everything from branding as fallback
- Theme toggle button

Enjoy your new dynamic landing page with full theme support! 🎉
