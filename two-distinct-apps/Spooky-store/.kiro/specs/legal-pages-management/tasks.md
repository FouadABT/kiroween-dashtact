# Implementation Plan

- [x] 1. Extend database schema for legal pages




  - Add LegalPageType enum with TERMS and PRIVACY values to Prisma schema
  - Add LegalPage model with id, pageType, content, createdAt, updatedAt fields
  - Set pageType as unique constraint to ensure only one entry per type
  - Generate Prisma migration for the new schema
  - Generate Prisma client to include new types
  - _Requirements: 1.3, 3.1, 3.2, 3.3, 5.1, 5.2, 5.3_

- [x] 2. Implement backend API for legal pages management





  - [x] 2.1 Create legal pages module structure


    - Generate NestJS module, controller, and service for legal pages
    - Configure module imports (PrismaModule) and exports
    - _Requirements: 5.4_

  - [x] 2.2 Implement DTOs for legal pages


    - Create UpdateLegalPageDto with content validation
    - Create LegalPageResponseDto for API responses
    - Add validation decorators (IsString, IsNotEmpty)
    - _Requirements: 1.3, 5.4_

  - [x] 2.3 Implement LegalPagesService


    - Implement getLegalPage method to fetch content by page type
    - Implement updateLegalPage method with upsert logic
    - Add error handling for invalid page types and database errors
    - _Requirements: 1.2, 1.3, 5.3_

  - [x] 2.4 Implement LegalPagesController endpoints


    - Create GET /legal-pages/:pageType endpoint (public access)
    - Create PUT /legal-pages/:pageType endpoint (admin only with permissions guard)
    - Add proper HTTP status codes and error responses
    - Apply JwtAuthGuard and PermissionsGuard to PUT endpoint
    - _Requirements: 1.1, 1.3, 2.1, 2.2, 5.4_


  - [x] 2.5 Register legal pages module in app module

    - Import LegalPagesModule in AppModule
    - Verify module is properly registered
    - _Requirements: 5.4_

- [x] 3. Implement frontend UI for legal pages






  - [x] 3.1 Create API client for legal pages

    - Add legalPagesApi with getLegalPage and updateLegalPage methods
    - Create TypeScript interfaces for LegalPage and LegalPageType
    - Add proper error handling and type safety
    - _Requirements: 1.2, 1.3, 2.1, 2.2_


  - [x] 3.2 Create public legal pages

    - Create /terms page that fetches and displays Terms of Service content
    - Create /privacy page that fetches and displays Privacy Policy content
    - Add proper metadata (title, description) for SEO
    - Implement ISR with 1-hour revalidation
    - Add fallback message when content is not available
    - Style content with proper typography and theme variables
    - _Requirements: 2.1, 2.2, 2.3, 2.4_

  - [x] 3.3 Create dashboard legal pages editor


    - Create /dashboard/settings/legal page with tab navigation for Terms and Privacy
    - Integrate existing WYSIWYG editor component for content editing
    - Add save button with loading state and success/error feedback
    - Display last updated timestamp for each page
    - Implement permission check (settings.manage)
    - _Requirements: 1.1, 1.2, 1.3, 1.4, 4.1, 4.2, 4.3, 4.4_


  - [x] 3.4 Add legal pages to dashboard navigation

    - Update dashboard menu seed data to include Legal Pages under Settings
    - Add appropriate icon (Scale or FileText)
    - Set required permission to settings.manage
    - _Requirements: 1.1_

- [ ] 4. Seed default legal page content
  - [ ] 4.1 Create legal pages seed data file
    - Create seed-data/legal-pages.seed.ts with default Terms and Privacy content
    - Include comprehensive default content with standard legal clauses
    - Add proper HTML structure with headings and paragraphs
    - _Requirements: 3.1, 3.2_

  - [ ] 4.2 Integrate seed into main seed script
    - Import and execute legal pages seed in main seed.ts
    - Add idempotency check to prevent duplicate entries
    - Log seed execution status
    - _Requirements: 3.3, 3.4_

  - [ ] 4.3 Run seed and verify content
    - Execute seed script to populate database
    - Verify both Terms and Privacy pages are created
    - Verify content is accessible via API endpoints
    - _Requirements: 3.1, 3.2, 3.3_
