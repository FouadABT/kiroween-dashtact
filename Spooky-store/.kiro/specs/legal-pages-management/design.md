# Design Document

## Overview

The Legal Pages Management feature enables administrators to manage Terms of Service and Privacy Policy content through a dashboard interface. The system uses a database-backed approach with a WYSIWYG editor for content management and public-facing pages for visitors.

## Architecture

### System Components

```
┌─────────────────────────────────────────────────────────────┐
│                        Frontend Layer                        │
├─────────────────────────────────────────────────────────────┤
│  Public Pages          │  Dashboard Settings                │
│  - /terms              │  - Legal Pages Editor              │
│  - /privacy            │  - WYSIWYG Editor Integration      │
│                        │  - Preview Mode                     │
└────────────┬───────────┴──────────────┬─────────────────────┘
             │                          │
             │      API Requests        │
             │                          │
┌────────────▼──────────────────────────▼─────────────────────┐
│                        Backend Layer                         │
├─────────────────────────────────────────────────────────────┤
│  Legal Pages Module                                          │
│  - LegalPagesController (GET, PUT endpoints)                │
│  - LegalPagesService (Business logic)                       │
│  - LegalPageDto (Data validation)                           │
└────────────┬────────────────────────────────────────────────┘
             │
             │      Prisma ORM
             │
┌────────────▼────────────────────────────────────────────────┐
│                      Database Layer                          │
├─────────────────────────────────────────────────────────────┤
│  LegalPage Table                                             │
│  - id (UUID, Primary Key)                                    │
│  - pageType (Enum: TERMS, PRIVACY)                          │
│  - content (Text, HTML content)                              │
│  - createdAt (DateTime)                                      │
│  - updatedAt (DateTime)                                      │
└─────────────────────────────────────────────────────────────┘
```

## Components and Interfaces

### Database Schema

**LegalPage Model** (Prisma Schema)
```prisma
enum LegalPageType {
  TERMS
  PRIVACY
}

model LegalPage {
  id        String         @id @default(uuid())
  pageType  LegalPageType  @unique
  content   String         @db.Text
  createdAt DateTime       @default(now())
  updatedAt DateTime       @updatedAt

  @@map("legal_pages")
}
```

### Backend Components

**LegalPagesModule** (`backend/src/legal-pages/legal-pages.module.ts`)
- Imports: PrismaModule
- Providers: LegalPagesService
- Controllers: LegalPagesController
- Exports: LegalPagesService

**LegalPagesController** (`backend/src/legal-pages/legal-pages.controller.ts`)
```typescript
@Controller('legal-pages')
export class LegalPagesController {
  // GET /legal-pages/:pageType - Get legal page content (public)
  @Get(':pageType')
  async getLegalPage(@Param('pageType') pageType: string)
  
  // PUT /legal-pages/:pageType - Update legal page content (admin only)
  @Put(':pageType')
  @UseGuards(JwtAuthGuard, PermissionsGuard)
  @RequirePermissions('settings.manage')
  async updateLegalPage(
    @Param('pageType') pageType: string,
    @Body() updateDto: UpdateLegalPageDto
  )
}
```

**LegalPagesService** (`backend/src/legal-pages/legal-pages.service.ts`)
```typescript
@Injectable()
export class LegalPagesService {
  constructor(private prisma: PrismaClient) {}
  
  async getLegalPage(pageType: LegalPageType): Promise<LegalPage | null>
  async updateLegalPage(pageType: LegalPageType, content: string): Promise<LegalPage>
  async seedDefaultContent(): Promise<void>
}
```

**DTOs** (`backend/src/legal-pages/dto/`)
```typescript
// update-legal-page.dto.ts
export class UpdateLegalPageDto {
  @IsString()
  @IsNotEmpty()
  content: string;
}

// legal-page-response.dto.ts
export class LegalPageResponseDto {
  id: string;
  pageType: string;
  content: string;
  updatedAt: Date;
}
```

### Frontend Components

**Public Pages**
- `frontend/src/app/terms/page.tsx` - Terms of Service public page
- `frontend/src/app/privacy/page.tsx` - Privacy Policy public page

**Dashboard Settings**
- `frontend/src/app/dashboard/settings/legal/page.tsx` - Legal pages management page
- `frontend/src/app/dashboard/settings/legal/components/LegalPageEditor.tsx` - Editor component with tabs for Terms/Privacy
- `frontend/src/app/dashboard/settings/legal/components/LegalPagePreview.tsx` - Preview component

**API Client** (`frontend/src/lib/api/legal-pages.ts`)
```typescript
export const legalPagesApi = {
  getLegalPage: async (pageType: 'terms' | 'privacy'): Promise<LegalPage> => {},
  updateLegalPage: async (pageType: 'terms' | 'privacy', content: string): Promise<LegalPage> => {},
};
```

**Types** (`frontend/src/types/legal-pages.ts`)
```typescript
export type LegalPageType = 'TERMS' | 'PRIVACY';

export interface LegalPage {
  id: string;
  pageType: LegalPageType;
  content: string;
  createdAt: string;
  updatedAt: string;
}
```

## Data Models

### LegalPage Entity

| Field | Type | Constraints | Description |
|-------|------|-------------|-------------|
| id | UUID | Primary Key | Unique identifier |
| pageType | Enum | Unique, Not Null | Type of legal page (TERMS, PRIVACY) |
| content | Text | Not Null | HTML content of the page |
| createdAt | DateTime | Default: now() | Creation timestamp |
| updatedAt | DateTime | Auto-update | Last modification timestamp |

### Default Content Structure

**Terms of Service Template:**
```html
<h1>Terms of Service</h1>
<p>Last updated: [DATE]</p>

<h2>1. Acceptance of Terms</h2>
<p>By accessing and using this service, you accept and agree to be bound by the terms...</p>

<h2>2. Use License</h2>
<p>Permission is granted to temporarily access the materials...</p>

<h2>3. Disclaimer</h2>
<p>The materials on this website are provided on an 'as is' basis...</p>

<h2>4. Limitations</h2>
<p>In no event shall the company or its suppliers be liable...</p>

<h2>5. Contact Information</h2>
<p>For questions about these Terms, please contact us...</p>
```

**Privacy Policy Template:**
```html
<h1>Privacy Policy</h1>
<p>Last updated: [DATE]</p>

<h2>1. Information We Collect</h2>
<p>We collect information that you provide directly to us...</p>

<h2>2. How We Use Your Information</h2>
<p>We use the information we collect to provide, maintain, and improve our services...</p>

<h2>3. Information Sharing</h2>
<p>We do not share your personal information with third parties...</p>

<h2>4. Data Security</h2>
<p>We implement appropriate security measures to protect your information...</p>

<h2>5. Your Rights</h2>
<p>You have the right to access, update, or delete your personal information...</p>

<h2>6. Contact Us</h2>
<p>If you have questions about this Privacy Policy, please contact us...</p>
```

## Error Handling

### Backend Error Scenarios

1. **Invalid Page Type**
   - Status: 400 Bad Request
   - Message: "Invalid page type. Must be 'TERMS' or 'PRIVACY'"

2. **Page Not Found**
   - Status: 404 Not Found
   - Message: "Legal page not found"

3. **Unauthorized Access**
   - Status: 401 Unauthorized
   - Message: "Authentication required"

4. **Insufficient Permissions**
   - Status: 403 Forbidden
   - Message: "Insufficient permissions to update legal pages"

5. **Database Error**
   - Status: 500 Internal Server Error
   - Message: "Failed to update legal page"
   - Log: Full error details

### Frontend Error Handling

1. **Failed to Load Content**
   - Display: Error message with retry button
   - Fallback: Show default "Content unavailable" message

2. **Failed to Save Content**
   - Display: Toast notification with error
   - Action: Keep editor open with unsaved changes

3. **Network Error**
   - Display: "Connection error. Please check your internet connection."
   - Action: Retry button

## Testing Strategy

### Backend Tests

**Unit Tests** (`backend/src/legal-pages/legal-pages.service.spec.ts`)
- Test getLegalPage with valid page type
- Test getLegalPage with invalid page type
- Test updateLegalPage with valid data
- Test updateLegalPage with invalid data
- Test seedDefaultContent creates both pages

**E2E Tests** (`backend/test/legal-pages.e2e-spec.ts`)
- Test GET /legal-pages/TERMS returns content
- Test GET /legal-pages/PRIVACY returns content
- Test PUT /legal-pages/TERMS requires authentication
- Test PUT /legal-pages/TERMS requires permissions
- Test PUT /legal-pages/TERMS updates content successfully

### Frontend Tests

**Component Tests**
- Test LegalPageEditor loads existing content
- Test LegalPageEditor saves changes
- Test LegalPageEditor switches between Terms and Privacy
- Test LegalPagePreview renders HTML correctly
- Test public pages display content

**Integration Tests**
- Test full flow: load → edit → save → verify on public page
- Test permission-based access to editor
- Test error handling for failed saves

## Implementation Notes

### Reusing Existing WYSIWYG Editor

The system will leverage the existing TipTap editor used in the Pages module:
- Import from `frontend/src/components/editor/` (if exists) or similar location
- Configure for legal content (simpler toolbar, no image uploads needed)
- Maintain consistent styling with other dashboard editors

### Dashboard Navigation

Add legal pages management to Settings section:
- Update `backend/prisma/seed-data/dashboard-menus.seed.ts`
- Add menu item under Settings group
- Route: `/dashboard/settings/legal`
- Icon: Scale or FileText
- Permission: `settings.manage`

### SEO Considerations

Public legal pages should include:
- Proper meta tags (title, description)
- Structured data for legal documents
- Last updated date prominently displayed
- Canonical URLs

### Performance

- Cache legal page content on frontend (revalidate every 1 hour)
- Use Next.js ISR (Incremental Static Regeneration) for public pages
- Implement optimistic updates in dashboard editor
