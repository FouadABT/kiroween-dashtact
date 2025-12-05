# Section Editors and Properties Panel Guide

## Overview

The Landing CMS includes comprehensive section editors with a common properties panel for advanced customization. Each section type has its own specialized editor, and all sections share common design, layout, animation, and advanced properties.

## Section Editors

### 1. Hero Section Editor

**Location**: `frontend/src/components/landing/editors/HeroSectionEditor.tsx`

**Features**:
- Headline and subheadline text
- Primary and secondary CTA buttons
- Background options:
  - Solid color
  - Gradient (with start/end colors and angle)
  - Image upload
  - Video (MP4, WebM, YouTube, Vimeo)
- Text alignment (left, center, right)
- Section height (small, medium, large, full screen)

**Usage**:
```tsx
import { HeroSectionEditor } from '@/components/landing/editors';

<HeroSectionEditor
  data={heroData}
  onChange={(data) => handleChange(data)}
/>
```

### 2. Features Section Editor

**Location**: `frontend/src/components/landing/editors/FeaturesSectionEditor.tsx`

**Features**:
- Section title and subtitle
- Add/remove/reorder feature cards
- Icon picker for each feature
- Layout options (grid, list, carousel)
- Column count selector (2, 3, 4 columns)
- Drag-and-drop reordering

**Usage**:
```tsx
import { FeaturesSectionEditor } from '@/components/landing/editors';

<FeaturesSectionEditor
  data={featuresData}
  onChange={(data) => handleChange(data)}
/>
```

### 3. Testimonials Section Editor

**Location**: `frontend/src/components/landing/editors/TestimonialsSectionEditor.tsx`

**Features**:
- Section title and subtitle
- Add/remove testimonials
- Avatar upload for each testimonial
- Star rating (1-5 stars)
- Layout options (grid, carousel, masonry)
- Show/hide ratings toggle
- Author, role, and company fields

**Usage**:
```tsx
import { TestimonialsSectionEditor } from '@/components/landing/editors';

<TestimonialsSectionEditor
  data={testimonialsData}
  onChange={(data) => handleChange(data)}
/>
```

### 4. CTA Section Editor

**Location**: `frontend/src/components/landing/editors/CtaSectionEditor.tsx`

**Features**:
- Title and description
- Primary and secondary CTA buttons
- Background color customization
- Text color customization
- Alignment options (left, center, right)

**Usage**:
```tsx
import { CtaSectionEditor } from '@/components/landing/editors';

<CtaSectionEditor
  data={ctaData}
  onChange={(data) => handleChange(data)}
/>
```

### 5. Stats Section Editor

**Location**: `frontend/src/components/landing/editors/StatsSectionEditor.tsx`

**Features**:
- Optional section title
- Add/remove stat items
- Value and label for each stat
- Optional icon for each stat
- Layout options (horizontal, grid)
- Number formatting support

**Usage**:
```tsx
import { StatsSectionEditor } from '@/components/landing/editors';

<StatsSectionEditor
  data={statsData}
  onChange={(data) => handleChange(data)}
/>
```

### 6. Content Section Editor

**Location**: `frontend/src/components/landing/editors/ContentSectionEditor.tsx`

**Features**:
- Optional section title
- Rich text content area
- Layout options (single column, two column)
- Image upload
- Image position (left, right, top, bottom)
- Content width controls (full, wide, standard, narrow)

**Usage**:
```tsx
import { ContentSectionEditor } from '@/components/landing/editors';

<ContentSectionEditor
  data={contentData}
  onChange={(data) => handleChange(data)}
/>
```

## Common Properties Panel

**Location**: `frontend/src/components/landing/SectionPropertiesPanel.tsx`

The properties panel provides advanced customization options for all section types through four tabs:

### Design Tab

Controls visual appearance:
- **Background Color**: Color picker with hex input
- **Background Image**: URL input for background images
- **Background Video**: URL input for video backgrounds
- **Border**: CSS border string (e.g., "1px solid #e5e7eb")
- **Shadow**: Predefined shadow sizes (none, sm, md, lg, xl)
- **Overlay Color**: Color picker for background overlays
- **Overlay Opacity**: Slider (0-100%)

### Layout Tab

Controls spacing and positioning:
- **Padding**: CSS padding value (e.g., "2rem" or "32px")
- **Margin**: CSS margin value (e.g., "1rem 0")
- **Container Width**: Predefined widths (full, wide, standard, narrow)
- **Content Alignment**: Horizontal alignment (left, center, right)

### Animation Tab

Controls entrance animations:
- **Entrance Animation**: Animation type (none, fade, slide, zoom, bounce)
- **Animation Duration**: Slider (100-2000ms)
- **Animation Delay**: Slider (0-2000ms)

### Advanced Tab

Advanced customization options:
- **Anchor ID**: HTML ID for navigation links
- **Custom CSS**: Custom CSS code for the section
- **Visibility Conditions**: (Coming soon) Device-specific visibility, authentication-based, custom rules

## Integrated Editor Component

**Location**: `frontend/src/components/landing/SectionEditorWithProperties.tsx`

Combines section-specific editor with properties panel in a tabbed interface.

**Usage**:
```tsx
import { SectionEditorWithProperties } from '@/components/landing';

<SectionEditorWithProperties
  section={section}
  onChange={(updatedSection) => handleSectionChange(updatedSection)}
/>
```

**Features**:
- Two tabs: Content and Properties
- Content tab shows section-specific editor
- Properties tab shows common properties panel
- Automatically handles all section types
- Unified interface for all customization

## Data Structures

### Section Structure

```typescript
interface LandingPageSection {
  id: string;
  type: 'hero' | 'features' | 'testimonials' | 'cta' | 'stats' | 'content';
  content: any; // Section-specific data
  design?: SectionDesign;
  layout?: SectionLayout;
  animation?: SectionAnimation;
  advanced?: SectionAdvanced;
  visible: boolean;
  order: number;
}
```

### Design Properties

```typescript
interface SectionDesign {
  background?: string;
  backgroundImage?: string;
  backgroundVideo?: string;
  border?: string;
  shadow?: string;
  overlay?: string;
  overlayOpacity?: number;
}
```

### Layout Properties

```typescript
interface SectionLayout {
  padding?: string;
  margin?: string;
  containerWidth?: 'full' | 'wide' | 'standard' | 'narrow';
  contentAlignment?: 'left' | 'center' | 'right';
}
```

### Animation Properties

```typescript
interface SectionAnimation {
  entrance?: 'fade' | 'slide' | 'zoom' | 'bounce' | 'none';
  timing?: number;
  delay?: number;
}
```

### Advanced Properties

```typescript
interface SectionAdvanced {
  customCss?: string;
  anchorId?: string;
  visibilityConditions?: any;
}
```

## Demo Component

**Location**: `frontend/src/components/landing/SectionEditorDemo.tsx`

A comprehensive demo showing all section editors with sample data.

**Features**:
- Dropdown to switch between section types
- Live editing with all editors
- JSON preview of current section data
- Save button to test data persistence

**Usage**:
```tsx
import { SectionEditorDemo } from '@/components/landing/SectionEditorDemo';

// In your page
<SectionEditorDemo />
```

## Best Practices

### 1. Section Content

- Always provide default values for optional fields
- Validate required fields before saving
- Use descriptive placeholder text
- Provide helpful tooltips for complex options

### 2. Properties Panel

- Use properties panel for visual customization
- Keep section-specific content in the content editor
- Test animations on different devices
- Validate custom CSS before applying

### 3. Performance

- Lazy load images and videos
- Optimize background images
- Use appropriate animation timing
- Test on mobile devices

### 4. Accessibility

- Provide alt text for images
- Ensure sufficient color contrast
- Support keyboard navigation
- Test with screen readers

## Integration with Visual Editor

The section editors integrate seamlessly with the Visual Editor:

```tsx
import { VisualEditor } from '@/components/landing/VisualEditor';
import { SectionEditorWithProperties } from '@/components/landing/SectionEditorWithProperties';

// In your landing page editor
<VisualEditor
  initialSections={sections}
  onSave={handleSave}
  autoSaveEnabled={true}
/>

// When editing a specific section
<SectionEditorWithProperties
  section={selectedSection}
  onChange={handleSectionChange}
/>
```

## Future Enhancements

### Planned Features

1. **Rich Text Editor**: Replace textarea with WYSIWYG editor (TipTap or similar)
2. **Advanced Icon Picker**: More icon libraries and custom icon upload
3. **Video Background Controls**: Autoplay, mute, loop options
4. **Gradient Editor**: Visual gradient builder with multiple color stops
5. **Responsive Overrides**: Different settings per breakpoint
6. **Visibility Conditions**: Device-specific, authentication-based visibility
7. **A/B Testing**: Built-in A/B testing for sections
8. **Template Library**: Save and reuse section configurations

### Contributing

When adding new section types:

1. Create editor in `frontend/src/components/landing/editors/`
2. Add type to `LandingPageSection` interface
3. Update `SectionEditorWithProperties` switch statement
4. Add sample data to `SectionEditorDemo`
5. Update this documentation

## Troubleshooting

### Common Issues

**Issue**: Section not rendering
- Check that section type is valid
- Verify all required fields are present
- Check console for errors

**Issue**: Properties not applying
- Ensure onChange handlers are connected
- Verify data structure matches interfaces
- Check for TypeScript errors

**Issue**: Animation not working
- Verify animation timing is reasonable
- Check that entrance animation is not 'none'
- Test on different browsers

## Support

For issues or questions:
- Check the demo component for examples
- Review type definitions in `frontend/src/types/`
- Consult the main README for general guidance
