# Hybrid Content Editor Guide

## Overview

The **Hybrid Approach** combines the best of both worlds:
- **Structured sections** (Hero, Features, CTA, etc.) for common use cases
- **Flexible Content section** with HTML/CSS editing for custom layouts

This gives you type-safety and ease-of-use for standard sections, while providing full creative freedom for custom content.

---

## Architecture

```
┌─────────────────────────────────────────────────────┐
│  Structured Sections (Pre-built)                    │
│  ✓ Hero, Features, CTA, Testimonials, Stats        │
│  ✓ Type-safe with TypeScript                       │
│  ✓ Visual editors with form controls               │
│  ✓ Validated with DTOs                             │
└─────────────────────────────────────────────────────┘
                        +
┌─────────────────────────────────────────────────────┐
│  Content Section (Flexible)                         │
│  ✓ Visual HTML editor with formatting toolbar      │
│  ✓ HTML source code editing                        │
│  ✓ Custom CSS support (scoped to section)          │
│  ✓ Live preview                                     │
│  ✓ HTML sanitization on backend                    │
└─────────────────────────────────────────────────────┘
```

---

## Content Section Features

### 1. Visual Editor

**What it does:**
- Rich text editing with formatting toolbar
- Bold, italic, underline, headings, lists, links
- WYSIWYG (What You See Is What You Get)
- Perfect for non-technical users

**How to use:**
1. Click "Add Section" → "Content"
2. Click "Edit" on the content section
3. Use the "Visual" tab
4. Use the formatting toolbar to style your content
5. Click "Save Changes"

**Toolbar buttons:**
- **B** - Bold text
- **I** - Italic text
- **U** - Underline text
- **H2/H3/P** - Headings and paragraphs
- **• List** - Bullet list
- **1. List** - Numbered list
- **Link** - Insert hyperlink

### 2. HTML Source Editor

**What it does:**
- Full HTML control for advanced users
- Syntax highlighting
- Quick insert buttons for common elements
- Perfect for developers and power users

**How to use:**
1. Switch to the "HTML" tab
2. Write or paste your HTML code
3. Use quick insert buttons for common elements
4. Preview your changes
5. Click "Save Changes"

**Quick Insert Buttons:**
- **Heading** - `<h2>Heading</h2>`
- **Paragraph** - `<p>Paragraph text</p>`
- **List** - `<ul><li>Item</li></ul>`
- **Link** - `<a href="#">Link</a>`
- **Image** - `<img src="..." alt="..." />`
- **2 Columns** - Grid layout with 2 columns

**Allowed HTML Tags:**
```html
<!-- Headings -->
<h1>, <h2>, <h3>, <h4>, <h5>, <h6>

<!-- Text formatting -->
<p>, <br>, <hr>, <strong>, <b>, <em>, <i>, <u>, <s>, <mark>, <small>, <sub>, <sup>

<!-- Lists -->
<ul>, <ol>, <li>

<!-- Links and images -->
<a href="...">Link</a>
<img src="..." alt="..." />

<!-- Layout -->
<div>, <span>, <section>, <article>, <header>, <footer>, <main>, <aside>

<!-- Tables -->
<table>, <thead>, <tbody>, <tr>, <th>, <td>

<!-- Other -->
<blockquote>, <pre>, <code>, <figure>, <figcaption>
```

**Security:**
- HTML is sanitized on the backend
- Dangerous tags removed: `<script>`, `<iframe>`, `<object>`, `<embed>`
- Event handlers removed: `onclick`, `onload`, etc.
- JavaScript URLs blocked: `javascript:...`

### 3. Custom CSS Editor

**What it does:**
- Add section-specific CSS styling
- CSS is scoped to prevent conflicts
- Syntax highlighting
- Perfect for custom designs

**How to use:**
1. Switch to the "Custom CSS" tab
2. Write your CSS rules
3. CSS is automatically scoped to this section
4. Preview your changes
5. Click "Save Changes"

**Example:**
```css
.my-heading {
  color: #3b82f6;
  font-size: 2rem;
  font-weight: bold;
  text-align: center;
}

.my-button {
  background: linear-gradient(to right, #3b82f6, #8b5cf6);
  padding: 1rem 2rem;
  border-radius: 0.5rem;
  color: white;
  text-decoration: none;
  display: inline-block;
}

.my-button:hover {
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(59, 130, 246, 0.4);
}
```

**Tips:**
- Use Tailwind classes in your HTML for quick styling
- Custom CSS is scoped to this section only
- Avoid `!important` - use specific selectors instead
- Test responsiveness with different screen sizes

**Security:**
- CSS is sanitized on the backend
- Dangerous patterns removed: `javascript:`, `expression()`, `@import`, etc.

### 4. Live Preview

**What it does:**
- See your changes in real-time
- Toggle on/off with a switch
- Shows exactly how it will look on the page

**How to use:**
1. Toggle "Live Preview" switch
2. Make changes in any tab
3. Preview updates automatically
4. Test different content widths and layouts

---

## Section Settings

### Layout Options

**Single Column:**
- Full-width content
- Perfect for articles, blog posts, long-form content

**Two Column:**
- Content + Image side-by-side
- Choose image position: Left, Right, Top, Bottom
- Responsive: Stacks on mobile

### Content Width

**Full Width:**
- Edge-to-edge content
- Use for hero-style sections

**Wide:**
- Max width: 1280px
- Good for feature showcases

**Standard:**
- Max width: 1024px (default)
- Perfect for most content

**Narrow:**
- Max width: 768px
- Best for reading-focused content

### Image Position (Two Column Only)

- **Left** - Image on left, content on right
- **Right** - Image on right, content on left
- **Top** - Image above content
- **Bottom** - Image below content

---

## Use Cases

### 1. Simple Text Content
**Use:** Visual Editor
```
Just type and format with the toolbar.
Perfect for announcements, about pages, etc.
```

### 2. Rich HTML Content
**Use:** HTML Editor
```html
<div class="grid grid-cols-3 gap-4">
  <div class="p-4 bg-blue-100 rounded">
    <h3>Feature 1</h3>
    <p>Description</p>
  </div>
  <div class="p-4 bg-green-100 rounded">
    <h3>Feature 2</h3>
    <p>Description</p>
  </div>
  <div class="p-4 bg-purple-100 rounded">
    <h3>Feature 3</h3>
    <p>Description</p>
  </div>
</div>
```

### 3. Custom Styled Section
**Use:** HTML + Custom CSS
```html
<!-- HTML -->
<div class="hero-banner">
  <h1 class="hero-title">Welcome</h1>
  <p class="hero-subtitle">Get started today</p>
  <a href="/signup" class="hero-button">Sign Up</a>
</div>
```

```css
/* Custom CSS */
.hero-banner {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  padding: 4rem 2rem;
  text-align: center;
  border-radius: 1rem;
}

.hero-title {
  font-size: 3rem;
  font-weight: bold;
  color: white;
  margin-bottom: 1rem;
}

.hero-subtitle {
  font-size: 1.5rem;
  color: rgba(255, 255, 255, 0.9);
  margin-bottom: 2rem;
}

.hero-button {
  background: white;
  color: #667eea;
  padding: 1rem 2rem;
  border-radius: 0.5rem;
  text-decoration: none;
  font-weight: 600;
  display: inline-block;
}
```

### 4. Two-Column Layout with Image
**Settings:**
- Layout: Two Column
- Image: `https://example.com/image.jpg`
- Image Position: Left
- Content Width: Standard

**HTML:**
```html
<h2>About Our Company</h2>
<p>We've been serving customers since 2010...</p>
<ul>
  <li>Award-winning service</li>
  <li>24/7 support</li>
  <li>Money-back guarantee</li>
</ul>
```

---

## Best Practices

### 1. Start Simple
- Use Visual Editor for basic content
- Switch to HTML when you need more control
- Add Custom CSS only when necessary

### 2. Use Tailwind Classes
```html
<!-- Instead of custom CSS -->
<div class="grid grid-cols-2 gap-4 p-6 bg-blue-50 rounded-lg">
  <div>Column 1</div>
  <div>Column 2</div>
</div>
```

### 3. Keep CSS Scoped
- CSS is automatically scoped to your section
- Use specific class names to avoid conflicts
- Prefix your classes: `.my-section-title` instead of `.title`

### 4. Test Responsiveness
- Use Tailwind responsive classes: `md:`, `lg:`
- Test on mobile, tablet, desktop
- Use Live Preview to check different sizes

### 5. Optimize Images
- Use appropriate image sizes
- Add `alt` text for accessibility
- Consider using Next.js Image component for optimization

### 6. Semantic HTML
```html
<!-- Good -->
<article>
  <h2>Article Title</h2>
  <p>Content...</p>
</article>

<!-- Avoid -->
<div>
  <div>Article Title</div>
  <div>Content...</div>
</div>
```

---

## Security

### HTML Sanitization

**Backend automatically removes:**
- `<script>` tags
- `<iframe>` tags
- `<object>` and `<embed>` tags
- Event handlers (`onclick`, `onload`, etc.)
- JavaScript URLs (`javascript:...`)
- `<link>` and `<meta>` tags

**Safe to use:**
- All standard HTML tags (headings, paragraphs, lists, etc.)
- Links with `href` attributes
- Images with `src` attributes
- Inline styles (sanitized)
- Class and ID attributes

### CSS Sanitization

**Backend automatically removes:**
- `javascript:` URLs
- `expression()` functions
- `@import` rules
- `-moz-binding` properties
- `behavior` properties

---

## Troubleshooting

### Content not showing?
- Check if section is enabled (eye icon)
- Verify HTML is valid
- Check browser console for errors

### Styles not applying?
- Make sure CSS is in the "Custom CSS" tab
- Check for syntax errors
- Use browser DevTools to inspect elements

### Images not loading?
- Verify image URL is correct and accessible
- Check image file format (jpg, png, gif, svg)
- Ensure HTTPS for secure pages

### Layout broken on mobile?
- Use Tailwind responsive classes
- Test with Live Preview
- Check for fixed widths in CSS

---

## Comparison: When to Use What

| Use Case | Structured Section | Content Section |
|----------|-------------------|-----------------|
| Hero banner with CTA | ✅ Hero Section | ❌ |
| Feature cards grid | ✅ Features Section | ❌ |
| Statistics display | ✅ Stats Section | ❌ |
| Call-to-action | ✅ CTA Section | ❌ |
| Custom HTML layout | ❌ | ✅ Content Section |
| Rich text article | ❌ | ✅ Content Section |
| Custom styled section | ❌ | ✅ Content Section |
| Two-column with image | ❌ | ✅ Content Section |
| Embedded content | ❌ | ✅ Content Section |

---

## Examples

### Example 1: Pricing Table

```html
<div class="max-w-4xl mx-auto">
  <h2 class="text-3xl font-bold text-center mb-8">Choose Your Plan</h2>
  
  <div class="grid grid-cols-1 md:grid-cols-3 gap-6">
    <!-- Basic Plan -->
    <div class="border border-gray-200 rounded-lg p-6 hover:shadow-lg transition">
      <h3 class="text-xl font-bold mb-2">Basic</h3>
      <div class="text-3xl font-bold mb-4">$9<span class="text-sm text-gray-500">/mo</span></div>
      <ul class="space-y-2 mb-6">
        <li>✓ 10 Projects</li>
        <li>✓ 5GB Storage</li>
        <li>✓ Email Support</li>
      </ul>
      <a href="/signup?plan=basic" class="block text-center bg-blue-500 text-white py-2 rounded hover:bg-blue-600">
        Get Started
      </a>
    </div>
    
    <!-- Pro Plan -->
    <div class="border-2 border-blue-500 rounded-lg p-6 hover:shadow-lg transition relative">
      <div class="absolute top-0 right-0 bg-blue-500 text-white px-3 py-1 text-sm rounded-bl">Popular</div>
      <h3 class="text-xl font-bold mb-2">Pro</h3>
      <div class="text-3xl font-bold mb-4">$29<span class="text-sm text-gray-500">/mo</span></div>
      <ul class="space-y-2 mb-6">
        <li>✓ Unlimited Projects</li>
        <li>✓ 50GB Storage</li>
        <li>✓ Priority Support</li>
      </ul>
      <a href="/signup?plan=pro" class="block text-center bg-blue-500 text-white py-2 rounded hover:bg-blue-600">
        Get Started
      </a>
    </div>
    
    <!-- Enterprise Plan -->
    <div class="border border-gray-200 rounded-lg p-6 hover:shadow-lg transition">
      <h3 class="text-xl font-bold mb-2">Enterprise</h3>
      <div class="text-3xl font-bold mb-4">$99<span class="text-sm text-gray-500">/mo</span></div>
      <ul class="space-y-2 mb-6">
        <li>✓ Unlimited Everything</li>
        <li>✓ 500GB Storage</li>
        <li>✓ 24/7 Phone Support</li>
      </ul>
      <a href="/contact" class="block text-center bg-blue-500 text-white py-2 rounded hover:bg-blue-600">
        Contact Sales
      </a>
    </div>
  </div>
</div>
```

### Example 2: FAQ Section

```html
<div class="max-w-3xl mx-auto">
  <h2 class="text-3xl font-bold text-center mb-8">Frequently Asked Questions</h2>
  
  <div class="space-y-4">
    <details class="border border-gray-200 rounded-lg p-4">
      <summary class="font-semibold cursor-pointer">How do I get started?</summary>
      <p class="mt-2 text-gray-600">Simply sign up for an account and follow our onboarding guide.</p>
    </details>
    
    <details class="border border-gray-200 rounded-lg p-4">
      <summary class="font-semibold cursor-pointer">What payment methods do you accept?</summary>
      <p class="mt-2 text-gray-600">We accept all major credit cards, PayPal, and bank transfers.</p>
    </details>
    
    <details class="border border-gray-200 rounded-lg p-4">
      <summary class="font-semibold cursor-pointer">Can I cancel anytime?</summary>
      <p class="mt-2 text-gray-600">Yes, you can cancel your subscription at any time with no penalties.</p>
    </details>
  </div>
</div>
```

---

## Summary

The Hybrid Approach gives you:

✅ **Structured sections** for common use cases (fast, type-safe, easy)
✅ **Flexible content section** for custom layouts (powerful, creative, unlimited)
✅ **Visual editor** for non-technical users
✅ **HTML/CSS editor** for developers
✅ **Live preview** for instant feedback
✅ **Security** with HTML/CSS sanitization
✅ **Responsive** design support
✅ **Best of both worlds**

Start with structured sections for standard content, and use the Content section when you need full creative control!
