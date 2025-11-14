# Landing Page Components

This directory contains all components for the public-facing landing page.

## Components

### LandingPage
Main landing page component that combines all sections.

**Usage:**
```tsx
import { LandingPage } from '@/components/landing/LandingPage';

export default function Home() {
  return <LandingPage />;
}
```

### LandingLayout
Layout wrapper that provides navigation and footer structure.

**Props:**
- `children: ReactNode` - Content to render between navigation and footer

### PublicNavigation
Navigation bar with logo and authentication links.

**Features:**
- Fixed positioning at top
- Mobile responsive with hamburger menu
- Links to login and signup pages

### Footer
Footer component with links and social media icons.

**Features:**
- Multi-column layout (responsive)
- Company information
- Social media links
- Copyright notice

### Hero
Hero section with headline, description, and CTA buttons.

**Features:**
- Animated with Framer Motion
- Responsive typography
- Gradient background
- Feature highlights

### Features
Grid of feature cards showcasing application capabilities.

**Features:**
- 10 pre-configured features
- Responsive grid layout (1/2/3 columns)
- Animated on scroll
- Hover effects

### FeatureCard
Individual feature card component.

**Props:**
- `icon: LucideIcon` - Icon component from lucide-react
- `title: string` - Feature title
- `description: string` - Feature description
- `index: number` - Card index for staggered animations

## Customization

### Changing Hero Content
Edit `Hero.tsx`:
```tsx
<h1>Your Custom Headline</h1>
<p>Your custom description</p>
```

### Adding/Removing Features
Edit the `features` array in `Features.tsx`:
```tsx
const features = [
  {
    icon: YourIcon,
    title: 'Your Feature',
    description: 'Your description',
  },
  // ... more features
];
```

### Customizing Navigation
Edit `PublicNavigation.tsx` to add/remove links or change branding.

### Customizing Footer
Edit `Footer.tsx` to modify footer sections, links, or social media icons.

## SEO Integration

The landing page is integrated with the metadata system:

- **Title**: "Dashboard Starter Kit - Build Amazing Dashboards Faster"
- **Description**: Comprehensive description for search engines
- **Keywords**: dashboard, starter kit, nextjs, react, etc.
- **Open Graph**: Custom OG image at `/og-landing.svg`
- **Twitter Card**: summary_large_image format
- **Robots**: Indexed and followed by search engines

Metadata is configured in `frontend/src/lib/metadata-config.ts`.

## Feature Flag

The landing page is controlled by the `NEXT_PUBLIC_ENABLE_LANDING` environment variable:

```env
# Enable landing page
NEXT_PUBLIC_ENABLE_LANDING=true

# Disable landing page (redirects to /dashboard or /login)
NEXT_PUBLIC_ENABLE_LANDING=false
```

## Animations

All animations use Framer Motion:

- **Hero**: Fade in with staggered delays
- **Features**: Scroll-triggered animations
- **Feature Cards**: Staggered entrance animations
- **Hover Effects**: Smooth transitions on interactive elements

## Responsive Design

All components are fully responsive:

- **Mobile**: Single column layout, hamburger menu
- **Tablet**: 2-column feature grid
- **Desktop**: 3-column feature grid, full navigation

## Accessibility

- Semantic HTML structure
- ARIA labels on interactive elements
- Keyboard navigation support
- Focus indicators
- Screen reader friendly

## Dependencies

- `framer-motion` - Animations
- `lucide-react` - Icons
- `@/components/ui/button` - Button component
- Next.js Link component for navigation
