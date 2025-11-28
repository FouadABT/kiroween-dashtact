# Performance, Accessibility & Responsive Design Guide

## Overview

This guide covers the comprehensive performance optimization, accessibility features, and responsive design controls implemented for the Landing CMS.

## Performance Optimization

### Image Optimization

**Features:**
- Automatic WebP/AVIF conversion
- Multiple responsive variants
- Blur placeholders
- Lazy loading with intersection observer
- Automatic compression

**Usage:**

```tsx
import { OptimizedImage, ResponsiveImage } from '@/components/landing/OptimizedImage';

// Standard optimized image
<OptimizedImage
  src="/image.jpg"
  alt="Description"
  width={800}
  height={600}
  quality={75}
  lazyLoad={true}
  blurPlaceholder={true}
/>

// Responsive image with art direction
<ResponsiveImage
  src={{
    default: '/image.jpg',
    mobile: '/image-mobile.jpg',
    tablet: '/image-tablet.jpg',
    desktop: '/image-desktop.jpg',
  }}
  alt="Description"
  width={800}
  height={600}
  artDirection={true}
/>
```

### Lazy Loading

**Video Lazy Loading:**

```tsx
import { LazyVideo } from '@/components/landing/OptimizedImage';

<LazyVideo
  src="/video.mp4"
  poster="/poster.jpg"
  controls={true}
  captions={[
    { src: '/captions.vtt', label: 'English', srclang: 'en' }
  ]}
/>
```

### Performance Monitoring

**Track Core Web Vitals:**

```tsx
import { PerformanceMonitor } from '@/components/landing/PerformanceMonitor';

<PerformanceMonitor
  onOptimizationSuggestion={(suggestions) => {
    console.log('Suggestions:', suggestions);
  }}
/>
```

**Metrics Tracked:**
- First Contentful Paint (FCP)
- Largest Contentful Paint (LCP)
- Time to First Byte (TTFB)
- Cumulative Layout Shift (CLS)
- First Input Delay (FID)

### Performance Utilities

```tsx
import {
  measureWebVitals,
  calculatePerformanceScore,
  preloadCriticalResources,
  prefersReducedMotion,
} from '@/lib/performance-utils';

// Measure performance
const metrics = await measureWebVitals();
const score = calculatePerformanceScore(metrics);

// Preload critical resources
preloadCriticalResources([
  '/fonts/inter.woff2',
  '/critical.css',
]);

// Check reduced motion preference
if (prefersReducedMotion()) {
  // Disable animations
}
```

## Accessibility

### Accessibility Checker

**Features:**
- Alt text validation
- Color contrast checking (WCAG AA/AAA)
- Heading hierarchy validation
- ARIA attribute validation
- Form accessibility checks

**Usage:**

```tsx
import { AccessibilityChecker } from '@/components/landing/AccessibilityChecker';

<AccessibilityChecker
  content={{
    images: [
      { src: '/image.jpg', alt: 'Description' }
    ],
    headings: [
      { level: 1, text: 'Main Title' },
      { level: 2, text: 'Subtitle' }
    ],
    forms: [{
      inputs: [
        { id: 'email', label: 'Email', required: true }
      ]
    }]
  }}
  onIssuesFound={(issues) => {
    console.log('Issues:', issues);
  }}
/>
```

### Accessibility Utilities

```tsx
import {
  calculateContrastRatio,
  validateAltText,
  validateHeadingHierarchy,
  announceToScreenReader,
  createFocusTrap,
} from '@/lib/accessibility-utils';

// Check color contrast
const contrast = calculateContrastRatio('#000000', '#ffffff');
console.log('Ratio:', contrast.ratio);
console.log('Passes WCAG AA:', contrast.passes.aa);

// Validate alt text
const issue = validateAltText('img');
if (issue) {
  console.log('Issue:', issue.message);
  console.log('Suggestion:', issue.suggestion);
}

// Announce to screen reader
announceToScreenReader('Form submitted successfully', 'polite');

// Create focus trap for modal
const cleanup = createFocusTrap(modalElement);
// Later: cleanup();
```

### Keyboard Navigation

**Built-in Support:**
- Tab navigation for all interactive elements
- Arrow key navigation for lists/menus
- Escape key to close modals
- Enter/Space for buttons
- Focus trap for modals
- Visible focus indicators

**Custom Implementation:**

```tsx
import { handleArrowKeyNavigation } from '@/lib/accessibility-utils';

const handleKeyDown = (e: React.KeyboardEvent) => {
  handleArrowKeyNavigation(
    e,
    itemElements,
    currentIndex,
    (newIndex) => setCurrentIndex(newIndex)
  );
};
```

### ARIA Attributes

**Best Practices:**

```tsx
// Buttons
<button aria-label="Close dialog" onClick={onClose}>
  <X className="h-4 w-4" />
</button>

// Live regions
<div aria-live="polite" aria-atomic="true">
  {statusMessage}
</div>

// Expanded/collapsed states
<button
  aria-expanded={isOpen}
  aria-controls="menu-content"
>
  Menu
</button>

// Form labels
<label htmlFor="email">Email</label>
<input
  id="email"
  type="email"
  aria-required="true"
  aria-invalid={hasError}
  aria-describedby="email-error"
/>
{hasError && (
  <span id="email-error" role="alert">
    {errorMessage}
  </span>
)}
```

## Responsive Design

### Responsive Controls

**Features:**
- Breakpoint system (mobile: 640px, tablet: 768px, desktop: 1024px, wide: 1280px)
- Per-breakpoint style overrides
- Visual breakpoint selector
- Validation for responsive content
- Reset functionality

**Usage:**

```tsx
import { ResponsiveControls } from '@/components/landing/ResponsiveControls';

const [fontSize, setFontSize] = useState<ResponsiveValue<number>>({
  default: 16,
  mobile: 14,
  tablet: 16,
  desktop: 18,
  wide: 20,
});

<ResponsiveControls
  value={fontSize}
  onChange={setFontSize}
  property="fontSize"
  unit="px"
/>
```

### Device Preview

**Preview on Different Devices:**

```tsx
import { DevicePreview } from '@/components/landing/ResponsiveControls';

<DevicePreview device="iPhone 14 Pro" zoom={0.75}>
  <YourContent />
</DevicePreview>
```

**Available Devices:**
- iPhone 14 Pro, iPhone 14 Pro Max
- Samsung Galaxy S23
- iPad Mini, iPad Pro 11", iPad Pro 12.9"
- MacBook Air, MacBook Pro 14", MacBook Pro 16"
- Desktop HD, Desktop 4K

### Responsive Utilities

```tsx
import {
  getCurrentBreakpoint,
  getResponsiveValue,
  generateResponsiveClasses,
  validateResponsiveContent,
  getDeviceType,
  isTouchDevice,
} from '@/lib/responsive-utils';

// Get current breakpoint
const breakpoint = getCurrentBreakpoint(window.innerWidth);

// Get responsive value
const value = getResponsiveValue(
  { default: 16, mobile: 14, desktop: 18 },
  breakpoint
);

// Generate Tailwind classes
const classes = generateResponsiveClasses('text', {
  default: 'base',
  mobile: 'sm',
  desktop: 'lg',
});
// Result: "text-base md:text-sm lg:text-lg"

// Validate responsive content
const issues = validateResponsiveContent({
  fontSize: { default: 16, mobile: 12 }, // Warning: too small
  width: { default: 100, mobile: 30 }, // Error: touch target too small
});

// Device detection
const deviceType = getDeviceType(); // 'mobile' | 'tablet' | 'desktop'
const hasTouch = isTouchDevice();
```

### Responsive Images

```tsx
import { generateResponsiveSrcSet, generateSizesAttribute } from '@/lib/responsive-utils';

// Generate srcset
const srcset = generateResponsiveSrcSet('/image.jpg', {
  mobile: '/image-640.jpg',
  tablet: '/image-768.jpg',
  desktop: '/image-1024.jpg',
});

// Generate sizes attribute
const sizes = generateSizesAttribute({
  mobile: '100vw',
  tablet: '50vw',
  desktop: '33vw',
});

<img src="/image.jpg" srcSet={srcset} sizes={sizes} alt="Responsive" />
```

## Best Practices

### Performance

1. **Images:**
   - Always use `OptimizedImage` component
   - Enable lazy loading for below-the-fold images
   - Use blur placeholders for better UX
   - Provide appropriate width/height to prevent layout shift

2. **Code:**
   - Use code splitting for large components
   - Defer non-critical JavaScript
   - Inline critical CSS
   - Preload critical resources

3. **Fonts:**
   - Use `font-display: swap`
   - Preload critical fonts
   - Consider system font fallbacks

### Accessibility

1. **Images:**
   - Always provide descriptive alt text
   - Keep alt text concise (under 125 characters)
   - Don't use phrases like "image of" or "picture of"

2. **Colors:**
   - Maintain WCAG AA contrast ratio (4.5:1 for normal text)
   - Use the contrast checker tool
   - Don't rely on color alone to convey information

3. **Headings:**
   - Use proper heading hierarchy (h1 → h2 → h3)
   - Don't skip heading levels
   - One h1 per page

4. **Forms:**
   - Associate labels with inputs
   - Provide clear error messages
   - Indicate required fields
   - Use appropriate input types

5. **Keyboard:**
   - Ensure all interactive elements are keyboard accessible
   - Provide visible focus indicators
   - Implement focus traps for modals
   - Support arrow key navigation where appropriate

### Responsive Design

1. **Breakpoints:**
   - Use mobile-first approach
   - Test on actual devices when possible
   - Consider touch target sizes (minimum 44x44px)

2. **Content:**
   - Ensure content is readable on all breakpoints
   - Avoid horizontal scrolling
   - Stack columns appropriately on mobile
   - Hide non-essential content on small screens

3. **Images:**
   - Use responsive images with srcset
   - Consider art direction for different layouts
   - Optimize for different screen densities

## Testing

### Performance Testing

```bash
# Run Lighthouse
npm run lighthouse

# Check Core Web Vitals
# Use PerformanceMonitor component in development
```

### Accessibility Testing

```bash
# Run automated accessibility tests
npm run test:a11y

# Use AccessibilityChecker component in development
# Test with keyboard navigation
# Test with screen reader (NVDA, JAWS, VoiceOver)
```

### Responsive Testing

```bash
# Test on different devices
# Use DevicePreview component
# Check browser DevTools responsive mode
# Test on actual devices
```

## Demo Page

Visit `/admin/performance-accessibility-demo` to see all features in action:

- Performance monitoring with Core Web Vitals
- Accessibility checker with contrast tool
- Responsive controls with device preview
- Optimized image examples

## Troubleshooting

### Performance Issues

**Problem:** Images loading slowly
**Solution:** Ensure lazy loading is enabled and images are optimized

**Problem:** Low performance score
**Solution:** Check PerformanceMonitor suggestions and optimize accordingly

### Accessibility Issues

**Problem:** Low contrast ratio
**Solution:** Use the contrast checker tool to find compliant colors

**Problem:** Missing alt text warnings
**Solution:** Add descriptive alt text to all images

### Responsive Issues

**Problem:** Content not adapting to screen size
**Solution:** Use ResponsiveControls to set breakpoint-specific values

**Problem:** Touch targets too small on mobile
**Solution:** Ensure minimum 44x44px size for interactive elements

## Resources

- [Web Vitals](https://web.dev/vitals/)
- [WCAG 2.1 Guidelines](https://www.w3.org/WAI/WCAG21/quickref/)
- [Responsive Design Best Practices](https://web.dev/responsive-web-design-basics/)
- [Next.js Image Optimization](https://nextjs.org/docs/basic-features/image-optimization)
