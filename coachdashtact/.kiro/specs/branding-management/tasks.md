# Implementation Plan

- [x] 1. Backend: Database schema and branding service






  - [x] 1.1 Add BrandSettings model to Prisma schema

    - Create BrandSettings table with fields: id, brandName, tagline, description, logoUrl, logoDarkUrl, faviconUrl, websiteUrl, supportEmail, socialLinks (JSON), createdAt, updatedAt
    - Add unique constraint to ensure single brand settings record
    - _Requirements: 1.4, 2.4, 3.4, 4.5_
  

  - [x] 1.2 Create branding module with service and controller

    - Generate NestJS module: `nest g module branding`
    - Generate service: `nest g service branding`
    - Generate controller: `nest g controller branding`
    - Import PrismaModule and PermissionsModule in branding.module.ts
    - _Requirements: 1.4, 2.4, 3.4_
  

  - [x] 1.3 Implement file upload service for brand assets

    - Create file-upload utility service for handling image uploads
    - Implement validation for file types (PNG, JPG, SVG, WebP for logos; ICO, PNG, SVG for favicons)
    - Implement validation for file sizes (5MB for logos, 1MB for favicons)
    - Store uploaded files in public/uploads/branding directory
    - Generate public URLs for uploaded assets
    - _Requirements: 1.2, 1.3, 3.1, 3.2_
  
  - [x] 1.4 Implement branding service CRUD operations


    - Create getBrandSettings() method to retrieve current settings
    - Create updateBrandSettings() method with validation
    - Create uploadLogo() method with file processing
    - Create uploadFavicon() method with multi-size generation
    - Create resetToDefault() method to restore defaults
    - _Requirements: 1.1, 2.1, 3.3, 7.2, 7.3_
  

  - [x] 1.5 Create DTOs for branding operations

    - Create UpdateBrandSettingsDto with validation decorators
    - Add validators for brandName (1-100 chars), tagline (max 200 chars)
    - Add validators for email format and URL formats
    - Create BrandSettingsResponseDto for API responses
    - _Requirements: 2.2, 2.3, 4.2, 4.3, 4.4_
  

  - [x] 1.6 Implement branding controller endpoints

    - GET /api/branding - Get current brand settings (public endpoint)
    - PUT /api/branding - Update brand settings (admin only)
    - POST /api/branding/logo - Upload logo (admin only)
    - POST /api/branding/logo-dark - Upload dark mode logo (admin only)
    - POST /api/branding/favicon - Upload favicon (admin only)
    - POST /api/branding/reset - Reset to defaults (admin only)
    - Add @Permissions('branding:manage') decorator to admin endpoints
    - _Requirements: 1.1, 1.4, 3.4, 4.5, 7.1_
  

  - [x] 1.7 Run Prisma migration and generate client

    - Run `npm run prisma:migrate` to create migration
    - Run `npm run prisma:generate` to update Prisma client
    - _Requirements: 1.4, 2.4_
  

  - [x] 1.8 Seed default branding data

    - Create seed data in prisma/seed-data/branding.seed.ts
    - Add default brand name, tagline, and placeholder logo URLs
    - Update main seed.ts to include branding seed
    - _Requirements: 6.6, 7.3_

- [x] 2. Frontend: Branding settings UI and API integration




  - [x] 2.1 Create TypeScript types for branding


    - Create frontend/src/types/branding.ts
    - Define BrandSettings interface matching backend DTOs
    - Define UpdateBrandSettingsDto interface
    - Define FileUploadResponse interface
    - _Requirements: 1.4, 2.4, 4.5_
  

  - [x] 2.2 Create branding API client

    - Create frontend/src/lib/api/branding.ts
    - Implement getBrandSettings() function
    - Implement updateBrandSettings() function
    - Implement uploadLogo() function with FormData
    - Implement uploadFavicon() function with FormData
    - Implement resetBranding() function
    - _Requirements: 1.4, 2.4, 3.4, 7.1_
  
  - [x] 2.3 Create branding settings page


    - Create frontend/src/app/dashboard/settings/branding/page.tsx
    - Add page to settings navigation menu
    - Implement layout with tabs or sections for different settings
    - Add permission check for 'branding:manage'
    - _Requirements: 1.1, 2.1, 3.1, 4.1_
  
  - [x] 2.4 Create logo upload component



    - Create frontend/src/app/dashboard/settings/branding/components/LogoUpload.tsx
    - Implement drag-and-drop file upload using shadcn/ui
    - Show current logo preview with dimensions
    - Add separate uploads for light and dark mode logos
    - Display file validation errors (type, size)
    - Show upload progress indicator
    - _Requirements: 1.1, 1.2, 1.3, 1.5, 1.6_
  
  - [x] 2.5 Create brand information form component


    - Create frontend/src/app/dashboard/settings/branding/components/BrandInfoForm.tsx
    - Add input fields for brand name, tagline, description
    - Add input fields for website URL, support email
    - Add input fields for social media links (Twitter, LinkedIn, Facebook, Instagram)
    - Implement client-side validation matching backend rules
    - Use shadcn/ui Form components with react-hook-form
    - _Requirements: 2.1, 2.2, 2.3, 4.1, 4.2, 4.3, 4.4_
  
  - [x] 2.6 Create favicon upload component



    - Create frontend/src/app/dashboard/settings/branding/components/FaviconUpload.tsx
    - Implement file upload for favicon
    - Show current favicon preview
    - Display supported formats and size limits
    - Show validation errors
    - _Requirements: 3.1, 3.2, 3.6_
  
  - [x] 2.7 Create branding preview component



    - Create frontend/src/app/dashboard/settings/branding/components/BrandingPreview.tsx
    - Show live preview of navigation header with logo
    - Show preview of login page with branding
    - Show preview of browser tab with favicon and title
    - Display tooltips with asset information on hover
    - Update preview in real-time as settings change
    - _Requirements: 5.1, 5.2, 5.3_
  
  - [x] 2.8 Implement save and reset functionality



    - Add "Save Changes" button that calls updateBrandSettings API
    - Add "Reset to Default" button with confirmation dialog
    - Implement "Cancel" button to revert unsaved changes
    - Show success/error toast notifications
    - Refresh preview after successful save
    - _Requirements: 5.4, 5.5, 7.1, 7.4_
  
  - [x] 2.9 Add branding settings to dashboard menu


    - Update prisma/seed-data/dashboard-menus.seed.ts
    - Add "Branding" menu item under Settings section
    - Set required permission to 'branding:manage'
    - Set icon and display order
    - _Requirements: 1.1, 2.1_

- [x] 3. Frontend: Site-wide branding application




  - [x] 3.1 Create branding context provider

    - Create frontend/src/contexts/BrandingContext.tsx
    - Fetch brand settings on app initialization
    - Provide brand settings to all components via context
    - Implement loading and error states
    - Cache brand settings in localStorage for faster loads
    - _Requirements: 6.1, 6.5_
  
  - [x] 3.2 Update root layout to use branding context


    - Wrap app in BrandingProvider in frontend/src/app/layout.tsx
    - Update page metadata to use brand name in title
    - Update favicon links in HTML head to use custom favicon
    - _Requirements: 2.5, 3.5, 6.3_
  
  - [x] 3.3 Update navigation header to display logo


    - Modify navigation component to use logo from branding context
    - Display light mode logo by default
    - Display dark mode logo when dark theme is active
    - Add fallback to default logo if custom logo not set
    - Ensure logo loads within 1 second
    - _Requirements: 1.5, 1.6, 6.1, 6.5_
  

  - [x] 3.4 Update login page with branding

    - Modify frontend/src/app/login/page.tsx (or auth pages)
    - Display logo at top of login form
    - Display brand name as heading
    - Display tagline below brand name
    - Use brand colors if configured
    - _Requirements: 2.5, 2.6, 6.2_
  
  - [x] 3.5 Update footer with brand information



    - Modify footer component to display brand name
    - Display tagline in footer
    - Display support email with mailto link
    - Display social media links with icons
    - Add fallback content if branding not configured
    - _Requirements: 2.6, 4.6, 6.4_
  

  - [x] 3.6 Create useBranding custom hook

    - Create frontend/src/hooks/useBranding.ts
    - Export hook to access brand settings from context
    - Provide helper functions for common branding operations
    - Handle loading and error states
    - _Requirements: 6.1, 6.2, 6.3, 6.4_
  
  - [x] 3.7 Update metadata configuration utility


    - Modify frontend/src/lib/metadata-config.ts
    - Use brand name in page titles across the app
    - Use brand description in meta tags
    - Use brand favicon in all metadata
    - Ensure SEO-friendly metadata structure
    - _Requirements: 2.5, 6.3_
  


  - [x] 3.8 Implement default branding fallbacks
    - Create default logo assets in public/images/branding/
    - Define default brand name, tagline in constants
    - Ensure all components gracefully handle missing branding
    - Display placeholder branding when custom branding not set
    - _Requirements: 6.6_
