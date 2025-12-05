# Implementation Plan

- [x] 1. Blog Posts Section




  - Add 'blog-posts' to SectionType union in frontend/src/types/landing-page.ts
  - Create BlogPostsSectionData interface with title, subtitle, layout (grid/list/carousel), columns, postCount, filters, display options, and CTA
  - Create backend/src/landing/dto/blog-posts-section-data.dto.ts with validation decorators
  - Add BlogPostsSectionData to section validation in landing.service.ts
  - Create frontend/src/components/landing/sections/BlogPostsSection.tsx that fetches from GET /blog API
  - Implement loading, error, and empty states with skeleton loaders
  - Render blog post cards with featured image, title, excerpt, author, date, categories based on layout
  - Create frontend/src/components/landing/editors/BlogPostsSectionEditor.tsx with form for all configuration options
  - Add category and tag filter selects that fetch from /blog/categories and /blog/tags
  - Integrate into SectionEditor.tsx: add to handleAddSection, renderEditor, dropdown menu, and LandingPage.tsx render switch
  - Write unit tests for component and editor, test API integration with mock data
  - _Requirements: All from requirements.md section 1_

- [x] 2. Custom Pages Section





  - Add 'pages' to SectionType union in frontend/src/types/landing-page.ts
  - Create PagesSectionData interface with title, subtitle, layout (grid/cards/list), columns, pageCount, filterByParent, display options, and CTA
  - Create backend/src/landing/dto/pages-section-data.dto.ts with validation decorators
  - Add PagesSectionData to section validation in landing.service.ts
  - Create frontend/src/components/landing/sections/PagesSection.tsx that fetches from GET /pages?status=PUBLISHED&visibility=PUBLIC API
  - Implement loading, error, and empty states with skeleton loaders
  - Render page cards with optional featured image, title, excerpt, and "Learn More" button linking to /{slug}
  - Create frontend/src/components/landing/editors/PagesSectionEditor.tsx with form for all configuration options
  - Add parent page filter select that fetches from /pages
  - Integrate into SectionEditor.tsx: add to handleAddSection, renderEditor, dropdown menu with Files icon, and LandingPage.tsx render switch
  - Write unit tests for component and editor, test API integration and responsive layouts
  - _Requirements: All from requirements.md section 2_

- [x] 3. Products Section





  - Add 'products' to SectionType union in frontend/src/types/landing-page.ts
  - Create ProductsSectionData interface with title, subtitle, layout (grid/carousel/featured), columns, productCount, filters, display options (price/rating/stock), and CTA
  - Create backend/src/landing/dto/products-section-data.dto.ts with validation decorators
  - Add ProductsSectionData to section validation in landing.service.ts
  - Create frontend/src/components/landing/sections/ProductsSection.tsx that fetches from GET /products or GET /shop API
  - Implement loading, error, and empty states with skeleton loaders
  - Render product cards with image, sale badge, name, price, rating, stock status, and CTA button
  - Support featured layout with large first product and smaller grid for rest
  - Create frontend/src/components/landing/editors/ProductsSectionEditor.tsx with form for all configuration options
  - Add category and tag filter selects that fetch from /products/categories and /products/tags
  - Integrate into SectionEditor.tsx: add to handleAddSection, renderEditor, dropdown menu with ShoppingBag icon, and LandingPage.tsx render switch
  - Integrate with cart system for "Add to Cart" functionality
  - Write unit tests for component and editor, test API integration, cart integration, and accessibility
  - _Requirements: All from requirements.md section 3_
