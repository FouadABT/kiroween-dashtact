# Landing CMS Enhancements - Design Document

## Overview

This design document outlines the architecture and implementation approach for enhancing the existing Landing Page CMS with modern UI/UX, comprehensive header/footer editing, improved settings management, and seamless branding integration. The design maintains backward compatibility while introducing powerful new features.

## Architecture

### System Components

```
┌─────────────────────────────────────────────────────────────┐
│                     Frontend (Next.js 14)                    │
├─────────────────────────────────────────────────────────────┤
│  ┌──────────────────┐  ┌──────────────────┐  ┌────────────┐│
│  │  Visual Editor   │  │  Header/Footer   │  │  Settings  ││
│  │   Components     │  │     Editors      │  │   Panel    ││
│  └──────────────────┘  └──────────────────┘  └────────────┘│
│  ┌──────────────────┐  ┌──────────────────┐  ┌────────────┐│
│  │  Component       │  │  Live Preview    │  │  Branding  ││
│  │   Library        │  │     Panel        │  │   Panel    ││
│  └──────────────────┘  └──────────────────┘  └────────────┘│
├─────────────────────────────────────────────────────────────┤
│                      API Layer (REST)                        │
├─────────────────────────────────────────────────────────────┤
│                    Backend (NestJS)                          │
├─────────────────────────────────────────────────────────────┤
│  ┌──────────────────┐  ┌──────────────────┐  ┌────────────┐│
│  │  Landing Service │  │  Header/Footer   │  │  Branding  ││
│  │                  │  │     Service      │  │   Service  ││
│  └──────────────────┘  └──────────────────┘  └────────────┘│
│  ┌──────────────────┐  ┌──────────────────┐  ┌────────────┐│
│  │  Template        │  │  Analytics       │  │  Cache     ││
│  │   Service        │  │     Service      │  │   Manager  ││
│  └──────────────────┘  └──────────────────┘  └────────────┘│
├─────────────────────────────────────────────────────────────┤
│              Database (PostgreSQL + Prisma)                  │
└─────────────────────────────────────────────────────────────┘
```

### Data Flow

1. **Editor → Preview**: Real-time updates via React state management
2. **Editor → Backend**: Debounced auto-save with optimistic updates
3. **Backend → Cache**: Redis/in-memory cache with 5-minute TTL
4. **Branding → Landing**: Event-driven updates via cache invalidation
5. **Analytics → Dashboard**: Aggregated metrics via background jobs

## Components and Interfaces

### Frontend Components

#### 1. Visual Editor Component

**Location**: `frontend/src/components/landing/VisualEditor.tsx`

**Purpose**: Main editor interface with split-screen layout

**Key Features**:
- Drag-and-drop section reordering using `@dnd-kit/core`
- Real-time preview synchronization
- Responsive breakpoint controls
- Undo/redo functionality

**Props Interface**:
```typescript
interface VisualEditorProps {
  content: LandingPageContent;
  onChange: (content: LandingPageContent) => void;
  onSave: () => Promise<void>;
  isSaving: boolean;
}
```

**State Management**:
- Local state for draft changes
- Debounced auto-save (3 seconds)
- Optimistic UI updates
- History stack for undo/redo

#### 2. Section Editor Components

**Location**: `frontend/src/components/landing/sections/`

**Components**:
- `HeroSectionEditor.tsx` - Hero section with background, CTAs
- `FeaturesSectionEditor.tsx` - Feature cards with icons
- `TestimonialsSectionEditor.tsx` - Customer testimonials
- `CTASectionEditor.tsx` - Call-to-action sections
- `StatsSectionEditor.tsx` - Statistics display
- `ContentSectionEditor.tsx` - Rich content with images

**Common Interface**:
```typescript
interface SectionEditorProps {
  section: LandingPageSection;
  onChange: (section: LandingPageSection) => void;
  onDelete: () => void;
  onDuplicate: () => void;
}
```

#### 3. Header Editor Component

**Location**: `frontend/src/components/landing/HeaderEditor.tsx`

**Features**:
- Logo upload with light/dark variants
- Navigation menu builder with drag-and-drop
- Dropdown and mega menu support
- CTA button configuration
- Sticky header settings
- Mobile menu customization

**Data Structure**:
```typescript
interface HeaderConfig {
  logo: {
    light: string;
    dark: string;
    size: 'sm' | 'md' | 'lg';
    link: string;
  };
  navigation: NavigationItem[];
  ctas: CTAButton[];
  style: {
    background: string;
    sticky: boolean;
    stickyBehavior: 'always' | 'hide-on-scroll' | 'show-on-scroll-up';
    transparent: boolean;
    shadow: boolean;
  };
  mobileMenu: {
    enabled: boolean;
    iconStyle: 'hamburger' | 'dots' | 'menu';
    animation: 'slide' | 'fade' | 'scale';
  };
}
```

#### 4. Footer Editor Component

**Location**: `frontend/src/components/landing/FooterEditor.tsx`

**Features**:
- Multi-column layout builder
- Navigation link groups
- Social media icons
- Newsletter signup integration
- Copyright text with auto-year
- Legal links quick access

**Data Structure**:
```typescript
interface FooterConfig {
  layout: 'single' | 'multi-column' | 'centered' | 'split';
  columns: FooterColumn[];
  social: SocialLink[];
  newsletter: {
    enabled: boolean;
    title: string;
    placeholder: string;
    buttonText: string;
  };
  copyright: string;
  legalLinks: LegalLink[];
  style: {
    background: string;
    textColor: string;
    borderTop: boolean;
  };
}
```

#### 5. Component Library Modal

**Location**: `frontend/src/components/landing/ComponentLibrary.tsx`

**Features**:
- Categorized template browser
- Search and filter functionality
- Template preview thumbnails
- Custom template management
- Template import/export

**Template Structure**:
```typescript
interface SectionTemplate {
  id: string;
  name: string;
  description: string;
  category: string;
  thumbnail: string;
  section: LandingPageSection;
  isCustom: boolean;
  createdAt: Date;
}
```

#### 6. Settings Panel Component

**Location**: `frontend/src/components/landing/SettingsPanel.tsx`

**Features**:
- Tabbed interface for categories
- Visual controls (color pickers, sliders)
- Contextual help tooltips
- Reset functionality
- Before/after preview

**Settings Structure**:
```typescript
interface LandingSettings {
  general: {
    title: string;
    description: string;
    favicon: string;
    language: string;
  };
  seo: {
    ogTitle: string;
    ogDescription: string;
    ogImage: string;
    twitterCard: 'summary' | 'summary_large_image';
    structuredData: boolean;
  };
  theme: {
    mode: 'light' | 'dark' | 'auto' | 'toggle';
    colors: {
      primary: { light: string; dark: string };
      secondary: { light: string; dark: string };
      accent: { light: string; dark: string };
    };
  };
  layout: {
    containerWidth: 'full' | 'wide' | 'standard' | 'narrow';
    sectionSpacing: 'compact' | 'normal' | 'relaxed';
    contentAlignment: 'left' | 'center' | 'right';
  };
  performance: {
    imageOptimization: boolean;
    lazyLoading: boolean;
    cacheStrategy: 'aggressive' | 'normal' | 'minimal';
  };
}
```

#### 7. Branding Panel Component

**Location**: `frontend/src/components/landing/BrandingPanel.tsx`

**Features**:
- Display current branding settings
- Quick edit access to branding management
- Sync button to apply branding changes
- Brand color application to theme

**Integration**:
- Fetches branding settings from `/api/branding`
- Listens for branding update events
- Triggers landing page cache invalidation
- Updates preview in real-time

### Backend Services

#### 1. Header/Footer Service

**Location**: `backend/src/landing/header-footer.service.ts`

**Responsibilities**:
- Store and retrieve header/footer configurations
- Validate navigation structure
- Integrate with branding service
- Cache header/footer data

**Key Methods**:
```typescript
class HeaderFooterService {
  async getHeaderConfig(): Promise<HeaderConfig>;
  async updateHeaderConfig(dto: UpdateHeaderDto): Promise<HeaderConfig>;
  async getFooterConfig(): Promise<FooterConfig>;
  async updateFooterConfig(dto: UpdateFooterDto): Promise<FooterConfig>;
  async syncWithBranding(): Promise<void>;
}
```

#### 2. Template Service

**Location**: `backend/src/landing/template.service.ts`

**Responsibilities**:
- Manage section templates
- Provide default templates
- Handle custom template CRUD
- Template import/export

**Key Methods**:
```typescript
class TemplateService {
  async getTemplates(category?: string): Promise<SectionTemplate[]>;
  async getTemplateById(id: string): Promise<SectionTemplate>;
  async createCustomTemplate(dto: CreateTemplateDto): Promise<SectionTemplate>;
  async updateCustomTemplate(id: string, dto: UpdateTemplateDto): Promise<SectionTemplate>;
  async deleteCustomTemplate(id: string): Promise<void>;
  async exportTemplate(id: string): Promise<string>;
  async importTemplate(data: string): Promise<SectionTemplate>;
}
```

#### 3. Analytics Service

**Location**: `backend/src/landing/analytics.service.ts`

**Responsibilities**:
- Track page views and interactions
- Record CTA click-through rates
- Generate analytics reports
- Provide A/B testing support

**Key Methods**:
```typescript
class AnalyticsService {
  async trackPageView(pageId: string, metadata: ViewMetadata): Promise<void>;
  async trackCTAClick(ctaId: string, metadata: ClickMetadata): Promise<void>;
  async getPageAnalytics(pageId: string, dateRange: DateRange): Promise<PageAnalytics>;
  async getSectionEngagement(pageId: string): Promise<SectionEngagement[]>;
  async createABTest(config: ABTestConfig): Promise<ABTest>;
  async getABTestResults(testId: string): Promise<ABTestResults>;
}
```

#### 4. Enhanced Landing Service

**Location**: `backend/src/landing/landing.service.ts` (enhanced)

**New Methods**:
```typescript
class LandingService {
  // Existing methods remain unchanged
  
  // New methods for enhancements
  async getHeaderConfig(): Promise<HeaderConfig>;
  async updateHeaderConfig(dto: UpdateHeaderDto): Promise<HeaderConfig>;
  async getFooterConfig(): Promise<FooterConfig>;
  async updateFooterConfig(dto: UpdateFooterDto): Promise<FooterConfig>;
  async syncBranding(): Promise<void>;
  async getThemeConfig(): Promise<ThemeConfig>;
  async updateThemeConfig(dto: UpdateThemeDto): Promise<ThemeConfig>;
}
```

## Data Models

### Database Schema Extensions

#### 1. Header Configuration Table

```prisma
model HeaderConfig {
  id              String   @id @default(cuid())
  logoLight       String?
  logoDark        String?
  logoSize        String   @default("md")
  logoLink        String   @default("/")
  navigation      Json     // NavigationItem[]
  ctas            Json     // CTAButton[]
  style           Json     // HeaderStyle
  mobileMenu      Json     // MobileMenuConfig
  createdAt       DateTime @default(now())
  updatedAt       DateTime @updatedAt
  
  @@map("header_configs")
}
```

#### 2. Footer Configuration Table

```prisma
model FooterConfig {
  id              String   @id @default(cuid())
  layout          String   @default("multi-column")
  columns         Json     // FooterColumn[]
  social          Json     // SocialLink[]
  newsletter      Json     // NewsletterConfig
  copyright       String
  legalLinks      Json     // LegalLink[]
  style           Json     // FooterStyle
  createdAt       DateTime @default(now())
  updatedAt       DateTime @updatedAt
  
  @@map("footer_configs")
}
```

#### 3. Section Templates Table

```prisma
model SectionTemplate {
  id              String   @id @default(cuid())
  name            String
  description     String?
  category        String
  thumbnail       String?
  section         Json     // LandingPageSection
  isCustom        Boolean  @default(false)
  isPublic        Boolean  @default(true)
  userId          String?
  user            User?    @relation(fields: [userId], references: [id], onDelete: Cascade)
  createdAt       DateTime @default(now())
  updatedAt       DateTime @updatedAt
  
  @@index([category])
  @@index([userId])
  @@map("section_templates")
}
```

#### 4. Landing Analytics Table

```prisma
model LandingAnalytics {
  id              String   @id @default(cuid())
  pageId          String
  eventType       String   // 'view', 'cta_click', 'section_view'
  eventData       Json
  sessionId       String
  userId          String?
  deviceType      String
  browser         String
  referrer        String?
  timestamp       DateTime @default(now())
  
  @@index([pageId, timestamp])
  @@index([eventType])
  @@map("landing_analytics")
}
```

#### 5. Enhanced Landing Page Content

```prisma
model LandingPageContent {
  // Existing fields remain unchanged
  id              String   @id @default(cuid())
  sections        Json
  settings        Json
  isActive        Boolean  @default(true)
  createdAt       DateTime @default(now())
  updatedAt       DateTime @updatedAt
  
  // New fields for enhancements
  headerConfigId  String?
  headerConfig    HeaderConfig? @relation(fields: [headerConfigId], references: [id])
  footerConfigId  String?
  footerConfig    FooterConfig? @relation(fields: [footerConfigId], references: [id])
  themeMode       String   @default("auto") // 'light', 'dark', 'auto', 'toggle'
  
  @@map("landing_page_contents")
}
```

## API Endpoints

### New Endpoints

#### Header Configuration
- `GET /api/landing/header` - Get header configuration
- `PUT /api/landing/header` - Update header configuration
- `POST /api/landing/header/sync-branding` - Sync with branding settings

#### Footer Configuration
- `GET /api/landing/footer` - Get footer configuration
- `PUT /api/landing/footer` - Update footer configuration
- `POST /api/landing/footer/sync-branding` - Sync with branding settings

#### Templates
- `GET /api/landing/templates` - List all templates (with category filter)
- `GET /api/landing/templates/:id` - Get template by ID
- `POST /api/landing/templates` - Create custom template
- `PUT /api/landing/templates/:id` - Update custom template
- `DELETE /api/landing/templates/:id` - Delete custom template
- `POST /api/landing/templates/:id/export` - Export template
- `POST /api/landing/templates/import` - Import template

#### Theme Configuration
- `GET /api/landing/theme` - Get theme configuration
- `PUT /api/landing/theme` - Update theme configuration

#### Analytics
- `POST /api/landing/analytics/track` - Track event
- `GET /api/landing/analytics/:pageId` - Get page analytics
- `GET /api/landing/analytics/:pageId/sections` - Get section engagement
- `POST /api/landing/analytics/ab-test` - Create A/B test
- `GET /api/landing/analytics/ab-test/:testId` - Get A/B test results

### Enhanced Endpoints

#### Landing Content
- `PATCH /api/landing` - Enhanced to support header/footer references
- `POST /api/landing/sync-branding` - New endpoint to sync all branding

## Error Handling

### Validation Errors
- Invalid header navigation structure
- Missing required footer fields
- Invalid theme color formats
- Template import validation failures

### Business Logic Errors
- Circular navigation references
- Branding sync conflicts
- Template quota exceeded
- Analytics tracking failures

### Error Response Format
```typescript
interface ErrorResponse {
  statusCode: number;
  message: string;
  error: string;
  details?: Record<string, any>;
  timestamp: string;
}
```

## Testing Strategy

### Unit Tests
- Component rendering tests
- Service method tests
- Validation logic tests
- Utility function tests

### Integration Tests
- API endpoint tests
- Database operation tests
- Cache invalidation tests
- Branding sync tests

### E2E Tests
- Complete editor workflow
- Header/footer customization
- Template management
- Analytics tracking
- Theme mode switching

### Performance Tests
- Page load time benchmarks
- Editor responsiveness
- Cache hit rates
- Database query optimization

## Security Considerations

### Authentication & Authorization
- All admin endpoints require JWT authentication
- Permission checks for landing:write, landing:read
- Template ownership validation
- Analytics data access control

### Input Validation
- Sanitize HTML content to prevent XSS
- Validate image URLs and file uploads
- Limit template size and complexity
- Rate limiting on analytics endpoints

### Data Protection
- Encrypt sensitive configuration data
- Secure file upload handling
- CORS configuration for API access
- CSP headers for landing pages

## Performance Optimization

### Caching Strategy
- Header/footer configs cached for 10 minutes
- Template library cached for 30 minutes
- Landing page content cached for 5 minutes
- Analytics aggregated hourly

### Database Optimization
- Indexes on frequently queried fields
- Pagination for template lists
- Aggregated analytics queries
- Connection pooling

### Frontend Optimization
- Code splitting for editor components
- Lazy loading for component library
- Image optimization with next/image
- Debounced auto-save

### CDN Integration
- Static assets served via CDN
- Image transformations at edge
- Cache-Control headers
- Stale-while-revalidate strategy

## Deployment Considerations

### Migration Strategy
1. Add new database tables (header, footer, templates, analytics)
2. Create default header/footer configurations
3. Seed default section templates
4. Update existing landing page content references
5. Deploy backend services
6. Deploy frontend components
7. Run data migration scripts
8. Verify branding integration

### Rollback Plan
- Database migration rollback scripts
- Feature flags for new components
- Backward compatibility maintained
- Gradual rollout strategy

### Monitoring
- Error tracking with Sentry
- Performance monitoring with New Relic
- Analytics dashboard for usage metrics
- Cache hit rate monitoring

## Future Enhancements

### Phase 2 Features
- Multi-language support
- Advanced A/B testing with AI recommendations
- Video section templates
- Interactive elements (calculators, quizzes)
- Form builder integration
- E-commerce product sections

### Phase 3 Features
- AI-powered content suggestions
- Automated accessibility fixes
- Performance optimization recommendations
- SEO score and suggestions
- Collaborative editing
- Version history and rollback

## Conclusion

This design provides a comprehensive architecture for enhancing the Landing CMS with modern UI/UX, header/footer editing, improved settings, and branding integration. The design maintains backward compatibility while introducing powerful new features that make the CMS more intuitive, extensible, and performant.

The modular architecture allows for incremental implementation, with each component independently testable and deployable. The integration with existing systems (branding, authentication, caching) ensures consistency across the platform.
