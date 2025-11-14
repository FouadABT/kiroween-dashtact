# Landing Page Quick Start Guide

## Enable the Landing Page

1. **Set Environment Variable**
   ```bash
   # In frontend/.env.local
   NEXT_PUBLIC_ENABLE_LANDING=true
   ```

2. **Restart Development Server**
   ```bash
   cd frontend
   npm run dev
   ```

3. **Visit the Landing Page**
   Open http://localhost:3000

## Quick Customization

### Change Hero Headline
Edit `Hero.tsx`:
```tsx
<h1>
  Your Custom Headline{' '}
  <span className="text-primary">Here</span>
</h1>
```

### Change Hero Description
Edit `Hero.tsx`:
```tsx
<p>
  Your custom description text goes here.
</p>
```

### Add/Remove Features
Edit `Features.tsx`:
```tsx
const features = [
  {
    icon: YourIcon, // Import from lucide-react
    title: 'Your Feature',
    description: 'Your description',
  },
  // Add more features...
];
```

### Change Navigation Logo
Edit `PublicNavigation.tsx`:
```tsx
<Link href="/" className="flex items-center space-x-2">
  <div className="w-8 h-8 bg-primary rounded-lg">
    {/* Your logo here */}
  </div>
  <span className="font-bold text-xl">Your Brand</span>
</Link>
```

### Update Footer
Edit `Footer.tsx`:
```tsx
<p className="text-sm text-muted-foreground">
  Your company description
</p>
```

## SEO Customization

Edit `frontend/src/lib/metadata-config.ts`:
```tsx
'/': {
  title: 'Your Custom Title',
  description: 'Your custom description',
  keywords: ['your', 'keywords'],
  // ... more metadata
}
```

## Disable Landing Page

Set environment variable to false:
```bash
# In frontend/.env.local
NEXT_PUBLIC_ENABLE_LANDING=false
```

This will redirect:
- Authenticated users → `/dashboard`
- Unauthenticated users → `/login`

## Available Icons

All icons from `lucide-react` are available:
```tsx
import { 
  Shield, Palette, Zap, Users, Lock, 
  Smartphone, BarChart3, Settings, Bell, FileText 
} from 'lucide-react';
```

Browse more at: https://lucide.dev/icons/

## Color Customization

The landing page uses theme colors:
- `bg-background` - Background color
- `text-foreground` - Text color
- `bg-primary` - Primary color
- `text-primary-foreground` - Primary text color
- `bg-muted` - Muted background
- `text-muted-foreground` - Muted text

Customize colors in theme settings at `/dashboard/settings/theme`

## Animation Customization

Adjust animation timing in components:
```tsx
<motion.div
  initial={{ opacity: 0, y: 20 }}
  animate={{ opacity: 1, y: 0 }}
  transition={{ 
    duration: 0.5,  // Animation duration
    delay: 0.1      // Delay before animation starts
  }}
>
```

## Responsive Breakpoints

- Mobile: `< 768px`
- Tablet: `768px - 1024px` (use `md:` prefix)
- Desktop: `> 1024px` (use `lg:` prefix)

Example:
```tsx
<div className="text-4xl md:text-5xl lg:text-6xl">
  Responsive Text
</div>
```

## Common Tasks

### Add a New Section
1. Create component in `frontend/src/components/landing/`
2. Import in `LandingPage.tsx`
3. Add between Hero and Features:
```tsx
<LandingLayout>
  <Hero />
  <YourNewSection />
  <Features />
</LandingLayout>
```

### Change CTA Buttons
Edit `Hero.tsx`:
```tsx
<Button size="lg" asChild>
  <Link href="/your-link">
    Your Button Text
  </Link>
</Button>
```

### Add Social Media Links
Edit `Footer.tsx`:
```tsx
<a href="https://your-social-link">
  <YourIcon className="w-5 h-5" />
</a>
```

## Troubleshooting

### Landing Page Not Showing
- Check `NEXT_PUBLIC_ENABLE_LANDING=true` in `.env.local`
- Restart dev server after changing env variables
- Clear browser cache

### Animations Not Working
- Verify `framer-motion` is installed: `npm list framer-motion`
- Check browser console for errors

### Styles Not Applying
- Ensure Tailwind CSS is configured
- Check `globals.css` is imported in `layout.tsx`
- Verify theme provider is wrapping the app

### Mobile Menu Not Working
- Check browser console for JavaScript errors
- Verify `useState` is imported from React
- Ensure component is marked as `'use client'`

## Production Checklist

Before deploying:
- [ ] Customize hero headline and description
- [ ] Update feature list
- [ ] Change navigation logo and branding
- [ ] Update footer information
- [ ] Customize SEO metadata
- [ ] Create production OG image (1200x630 PNG)
- [ ] Test on mobile devices
- [ ] Test social sharing preview
- [ ] Run `npm run build` to check for errors
- [ ] Test with landing enabled and disabled

## Need Help?

See full documentation in `README.md` or check:
- Design document: `.kiro/specs/landing-page-blog-system/design.md`
- Requirements: `.kiro/specs/landing-page-blog-system/requirements.md`
- Configuration guide: `.kiro/specs/landing-page-blog-system/CONFIGURATION_GUIDE.md`
