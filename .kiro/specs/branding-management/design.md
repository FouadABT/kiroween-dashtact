# Design Document

## Overview

The Branding Management System provides a centralized solution for managing organizational branding across the dashboard application. The system consists of backend services for storing and serving brand assets, a database schema for brand configuration, and frontend components for administration and display. The architecture follows a full-stack approach with NestJS backend, Prisma ORM, PostgreSQL database, and Next.js 14 frontend with React context for global state management.

## Architecture

### System Components

```
┌─────────────────────────────────────────────────────────────┐
│                        Frontend Layer                        │
├─────────────────────────────────────────────────────────────┤
│  ┌──────────────────┐  ┌──────────────────┐  ┌────────────┐│
│  │ Settings UI      │  │ Branding Context │  │ Components ││
│  │ - Logo Upload    │  │ - Global State   │  │ - Header   ││
│  │ - Brand Form     │  │ - Cache Layer    │  │ - Footer   ││
│  │ - Preview Panel  │  │ - API Client     │  │ - Login    ││
│  └──────────────────┘  └──────────────────┘  └────────────┘│
└─────────────────────────────────────────────────────────────┘
                              ↕ HTTP/REST
┌─────────────────────────────────────────────────────────────┐
│                        Backend Layer                         │
├─────────────────────────────────────────────────────────────┤
│  ┌──────────────────┐  ┌──────────────────┐  ┌────────────┐│
│  │ Branding Module  │  │ File Upload      │  │ Auth Guard ││
│  │ - Controller     │  │ - Validation     │  │ - Perms    ││
│  │ - Service        │  │ - Storage        │  │ - JWT      ││
│  │ - DTOs           │  │ - URL Generation │  │            ││
│  └──────────────────┘  └──────────────────┘  └────────────┘│
└─────────────────────────────────────────────────────────────┘
                              ↕ Prisma ORM
┌─────────────────────────────────────────────────────────────┐
│                      Database Layer                          │
├─────────────────────────────────────────────────────────────┤
│  ┌──────────────────────────────────────────────────────┐  │
│  │              BrandSettings Table                      │  │
│  │  - id, brandName, tagline, description               │  │
│  │  - logoUrl, logoDarkUrl, faviconUrl                  │  │
│  │  - websiteUrl, supportEmail, socialLinks (JSON)      │  │
│  │  - createdAt, updatedAt                              │  │
│  └──────────────────────────────────────────────────────┘  │
└─────────────────────────────────────────────────────────────┘
                              ↕
┌─────────────────────────────────────────────────────────────┐
│                      File Storage                            │
│              public/uploads/branding/                        │
│  - logos/     - favicons/     - temp/                       │
└─────────────────────────────────────────────────────────────┘
```

### Technology Stack

**Backend:**
- NestJS - REST API framework
- Prisma - ORM for database operations
- PostgreSQL - Relational database
- Multer - File upload middleware
- Sharp - Image processing (favicon generation)

**Frontend:**
- Next.js 14 - React framework with App Router
- React Context API - Global state management
- shadcn/ui - UI component library
- Tailwind CSS - Styling with theme support
- React Hook Form - Form validation

## Components and Interfaces

### Backend Components

#### 1. Database Schema (Prisma)

```prisma
model BrandSettings {
  id            String   @id @default(uuid())
  brandName     String   @default("Dashboard")
  tagline       String?
  description   String?
  logoUrl       String?
  logoDarkUrl   String?
  faviconUrl    String?
  websiteUrl    String?
  supportEmail  String?
  socialLinks   Json?    // { twitter, linkedin, facebook, instagram }
  createdAt     DateTime @default(now())
  updatedAt     DateTime @updatedAt

  @@map("brand_settings")
}
```

**Design Decisions:**
- Single record pattern (enforced by application logic)
- Optional fields allow gradual branding configuration
- JSON field for flexible social media links
- Separate URLs for light/dark mode logos
- All URLs stored as strings (relative or absolute paths)

#### 2. Branding Module Structure

```
backend/src/branding/
├── branding.module.ts          # Module definition
├── branding.controller.ts      # HTTP endpoints
├── branding.service.ts         # Business logic
├── dto/
│   ├── update-brand-settings.dto.ts
│   └── brand-settings-response.dto.ts
└── utils/
    └── file-upload.util.ts     # File handling utilities
```

#### 3. Branding Service Interface

```typescript
interface BrandingService {
  // Retrieve current brand settings
  getBrandSettings(): Promise<BrandSettings>;
  
  // Update brand settings
  updateBrandSettings(dto: UpdateBrandSettingsDto): Promise<BrandSettings>;
  
  // Upload logo (light mode)
  uploadLogo(file: Express.Multer.File): Promise<{ url: string }>;
  
  // Upload logo (dark mode)
  uploadLogoDark(file: Express.Multer.File): Promise<{ url: string }>;
  
  // Upload and process favicon
  uploadFavicon(file: Express.Multer.File): Promise<{ url: string }>;
  
  // Reset to default branding
  resetToDefault(): Promise<BrandSettings>;
  
  // Validate file type and size
  validateFile(file: Express.Multer.File, options: ValidationOptions): boolean;
  
  // Delete old asset files
  deleteAsset(url: string): Promise<void>;
}
```

#### 4. DTOs (Data Transfer Objects)

```typescript
// Update Brand Settings DTO
class UpdateBrandSettingsDto {
  @IsString()
  @Length(1, 100)
  @IsOptional()
  brandName?: string;

  @IsString()
  @MaxLength(200)
  @IsOptional()
  tagline?: string;

  @IsString()
  @IsOptional()
  description?: string;

  @IsUrl()
  @IsOptional()
  websiteUrl?: string;

  @IsEmail()
  @IsOptional()
  supportEmail?: string;

  @IsObject()
  @IsOptional()
  socialLinks?: {
    twitter?: string;
    linkedin?: string;
    facebook?: string;
    instagram?: string;
  };
}

// Response DTO
class BrandSettingsResponseDto {
  id: string;
  brandName: string;
  tagline?: string;
  description?: string;
  logoUrl?: string;
  logoDarkUrl?: string;
  faviconUrl?: string;
  websiteUrl?: string;
  supportEmail?: string;
  socialLinks?: Record<string, string>;
  createdAt: Date;
  updatedAt: Date;
}
```

#### 5. API Endpoints

```typescript
// Public endpoint - no authentication required
GET /api/branding
Response: BrandSettingsResponseDto

// Admin endpoints - require 'branding:manage' permission
PUT /api/branding
Body: UpdateBrandSettingsDto
Response: BrandSettingsResponseDto

POST /api/branding/logo
Body: multipart/form-data (file)
Response: { url: string }

POST /api/branding/logo-dark
Body: multipart/form-data (file)
Response: { url: string }

POST /api/branding/favicon
Body: multipart/form-data (file)
Response: { url: string }

POST /api/branding/reset
Response: BrandSettingsResponseDto
```

### Frontend Components

#### 1. Component Structure

```
frontend/src/
├── contexts/
│   └── BrandingContext.tsx              # Global branding state
├── hooks/
│   └── useBranding.ts                   # Custom hook for branding
├── lib/api/
│   └── branding.ts                      # API client functions
├── types/
│   └── branding.ts                      # TypeScript interfaces
├── app/
│   ├── layout.tsx                       # Root layout (metadata)
│   ├── login/page.tsx                   # Login page (branding)
│   └── dashboard/
│       └── settings/
│           └── branding/
│               ├── page.tsx             # Main settings page
│               └── components/
│                   ├── LogoUpload.tsx
│                   ├── BrandInfoForm.tsx
│                   ├── FaviconUpload.tsx
│                   ├── BrandingPreview.tsx
│                   └── SocialLinksForm.tsx
└── components/
    ├── layout/
    │   ├── Header.tsx                   # Uses branding context
    │   └── Footer.tsx                   # Uses branding context
    └── ui/                              # shadcn/ui components
```

#### 2. Branding Context

```typescript
interface BrandingContextValue {
  brandSettings: BrandSettings | null;
  loading: boolean;
  error: string | null;
  refreshBranding: () => Promise<void>;
  updateBranding: (data: UpdateBrandSettingsDto) => Promise<void>;
  uploadLogo: (file: File, isDark?: boolean) => Promise<string>;
  uploadFavicon: (file: File) => Promise<string>;
  resetBranding: () => Promise<void>;
}

// Provider wraps entire app
<BrandingProvider>
  <App />
</BrandingProvider>
```

**Design Decisions:**
- Context provides global access to branding state
- Caches settings in localStorage for performance
- Automatic refresh on mount and after updates
- Handles loading and error states centrally

#### 3. Settings Page Layout

```
┌─────────────────────────────────────────────────────────┐
│  Branding Settings                                      │
├─────────────────────────────────────────────────────────┤
│  ┌─────────────────────┐  ┌─────────────────────────┐  │
│  │  Configuration      │  │  Live Preview           │  │
│  │                     │  │                         │  │
│  │  [Logo Upload]      │  │  ┌───────────────────┐  │  │
│  │  Light: [Browse]    │  │  │ Header Preview    │  │  │
│  │  Dark:  [Browse]    │  │  │ [Logo] Brand Name │  │  │
│  │                     │  │  └───────────────────┘  │  │
│  │  [Brand Info]       │  │                         │  │
│  │  Name:    [____]    │  │  ┌───────────────────┐  │  │
│  │  Tagline: [____]    │  │  │ Login Preview     │  │  │
│  │  Desc:    [____]    │  │  │ [Logo]            │  │  │
│  │                     │  │  │ Brand Name        │  │  │
│  │  [Favicon Upload]   │  │  │ Tagline           │  │  │
│  │  [Browse]           │  │  └───────────────────┘  │  │
│  │                     │  │                         │  │
│  │  [Contact Info]     │  │  ┌───────────────────┐  │  │
│  │  Website: [____]    │  │  │ Browser Tab       │  │  │
│  │  Email:   [____]    │  │  │ [Favicon] Title   │  │  │
│  │                     │  │  └───────────────────┘  │  │
│  │  [Social Links]     │  │                         │  │
│  │  Twitter:  [____]   │  │                         │  │
│  │  LinkedIn: [____]   │  │                         │  │
│  │                     │  │                         │  │
│  │  [Save] [Reset]     │  │                         │  │
│  └─────────────────────┘  └─────────────────────────┘  │
└─────────────────────────────────────────────────────────┘
```

#### 4. TypeScript Interfaces

```typescript
// Brand Settings
interface BrandSettings {
  id: string;
  brandName: string;
  tagline?: string;
  description?: string;
  logoUrl?: string;
  logoDarkUrl?: string;
  faviconUrl?: string;
  websiteUrl?: string;
  supportEmail?: string;
  socialLinks?: {
    twitter?: string;
    linkedin?: string;
    facebook?: string;
    instagram?: string;
  };
  createdAt: string;
  updatedAt: string;
}

// Update DTO
interface UpdateBrandSettingsDto {
  brandName?: string;
  tagline?: string;
  description?: string;
  websiteUrl?: string;
  supportEmail?: string;
  socialLinks?: Record<string, string>;
}

// API Client
interface BrandingAPI {
  getBrandSettings(): Promise<BrandSettings>;
  updateBrandSettings(data: UpdateBrandSettingsDto): Promise<BrandSettings>;
  uploadLogo(file: File, isDark?: boolean): Promise<{ url: string }>;
  uploadFavicon(file: File): Promise<{ url: string }>;
  resetBranding(): Promise<BrandSettings>;
}
```

## Data Models

### BrandSettings Entity

**Fields:**
- `id` (UUID) - Primary key
- `brandName` (String, 1-100 chars) - Organization name
- `tagline` (String, max 200 chars) - Short description
- `description` (Text) - Detailed description
- `logoUrl` (String) - Light mode logo path
- `logoDarkUrl` (String) - Dark mode logo path
- `faviconUrl` (String) - Favicon path
- `websiteUrl` (URL) - Organization website
- `supportEmail` (Email) - Support contact
- `socialLinks` (JSON) - Social media URLs
- `createdAt` (DateTime) - Creation timestamp
- `updatedAt` (DateTime) - Last update timestamp

**Constraints:**
- Only one record should exist (enforced by application)
- All fields except id, createdAt, updatedAt are optional
- Default values provided for essential fields

**Relationships:**
- None (standalone configuration table)

### File Storage Structure

```
public/uploads/branding/
├── logos/
│   ├── logo-light-{timestamp}.{ext}
│   └── logo-dark-{timestamp}.{ext}
├── favicons/
│   ├── favicon-16x16-{timestamp}.png
│   ├── favicon-32x32-{timestamp}.png
│   ├── favicon-180x180-{timestamp}.png
│   └── favicon-{timestamp}.ico
└── temp/
    └── {temporary uploads}
```

**File Naming Convention:**
- Timestamp-based names prevent caching issues
- Extension preserved from original upload
- Old files deleted when new ones uploaded

## Error Handling

### Backend Error Scenarios

```typescript
// File validation errors
class FileValidationException extends BadRequestException {
  constructor(message: string) {
    super({
      statusCode: 400,
      message: message,
      error: 'File Validation Error'
    });
  }
}

// Common error cases:
- Invalid file type (not PNG, JPG, SVG, WebP, ICO)
- File size exceeds limit (5MB for logos, 1MB for favicon)
- Missing required fields in DTO
- Invalid URL format
- Invalid email format
- Database connection errors
- File system write errors
```

### Frontend Error Handling

```typescript
// API error handling
try {
  await updateBrandSettings(data);
  toast.success('Branding updated successfully');
} catch (error) {
  if (error.response?.status === 400) {
    toast.error(error.response.data.message);
  } else if (error.response?.status === 403) {
    toast.error('Permission denied');
  } else {
    toast.error('Failed to update branding');
  }
}

// File upload error handling
const handleFileUpload = async (file: File) => {
  // Client-side validation
  if (!['image/png', 'image/jpeg', 'image/svg+xml'].includes(file.type)) {
    setError('Invalid file type');
    return;
  }
  
  if (file.size > 5 * 1024 * 1024) {
    setError('File size exceeds 5MB');
    return;
  }
  
  try {
    const result = await uploadLogo(file);
    setLogoUrl(result.url);
  } catch (error) {
    setError('Upload failed');
  }
};
```

### Error States

- **Loading State**: Show skeleton loaders
- **Empty State**: Display default branding with setup prompt
- **Error State**: Show error message with retry option
- **Validation Error**: Inline field errors with clear messages

## Testing Strategy

### Backend Testing

**Unit Tests:**
```typescript
describe('BrandingService', () => {
  it('should get brand settings', async () => {
    const settings = await service.getBrandSettings();
    expect(settings).toBeDefined();
    expect(settings.brandName).toBe('Dashboard');
  });

  it('should validate file type', () => {
    const validFile = { mimetype: 'image/png' };
    expect(service.validateFile(validFile)).toBe(true);
    
    const invalidFile = { mimetype: 'application/pdf' };
    expect(service.validateFile(invalidFile)).toBe(false);
  });

  it('should update brand settings', async () => {
    const dto = { brandName: 'New Brand' };
    const result = await service.updateBrandSettings(dto);
    expect(result.brandName).toBe('New Brand');
  });
});
```

**E2E Tests:**
```typescript
describe('Branding API (e2e)', () => {
  it('GET /api/branding should return settings', () => {
    return request(app.getHttpServer())
      .get('/api/branding')
      .expect(200)
      .expect((res) => {
        expect(res.body).toHaveProperty('brandName');
      });
  });

  it('PUT /api/branding should require authentication', () => {
    return request(app.getHttpServer())
      .put('/api/branding')
      .send({ brandName: 'Test' })
      .expect(401);
  });

  it('POST /api/branding/logo should upload file', () => {
    return request(app.getHttpServer())
      .post('/api/branding/logo')
      .set('Authorization', `Bearer ${adminToken}`)
      .attach('file', 'test/fixtures/logo.png')
      .expect(201)
      .expect((res) => {
        expect(res.body).toHaveProperty('url');
      });
  });
});
```

### Frontend Testing

**Component Tests:**
```typescript
describe('LogoUpload', () => {
  it('should render upload button', () => {
    render(<LogoUpload />);
    expect(screen.getByText('Upload Logo')).toBeInTheDocument();
  });

  it('should validate file type', async () => {
    const { getByLabelText } = render(<LogoUpload />);
    const file = new File([''], 'test.pdf', { type: 'application/pdf' });
    
    const input = getByLabelText('Upload Logo');
    await userEvent.upload(input, file);
    
    expect(screen.getByText('Invalid file type')).toBeInTheDocument();
  });

  it('should show preview after upload', async () => {
    const { getByLabelText } = render(<LogoUpload />);
    const file = new File([''], 'logo.png', { type: 'image/png' });
    
    const input = getByLabelText('Upload Logo');
    await userEvent.upload(input, file);
    
    await waitFor(() => {
      expect(screen.getByAltText('Logo preview')).toBeInTheDocument();
    });
  });
});
```

**Integration Tests:**
```typescript
describe('Branding Context', () => {
  it('should fetch branding on mount', async () => {
    const { result } = renderHook(() => useBranding(), {
      wrapper: BrandingProvider
    });
    
    await waitFor(() => {
      expect(result.current.loading).toBe(false);
      expect(result.current.brandSettings).toBeDefined();
    });
  });

  it('should update branding', async () => {
    const { result } = renderHook(() => useBranding(), {
      wrapper: BrandingProvider
    });
    
    await act(async () => {
      await result.current.updateBranding({ brandName: 'New Brand' });
    });
    
    expect(result.current.brandSettings?.brandName).toBe('New Brand');
  });
});
```

### Test Coverage Goals

- Backend: 80%+ code coverage
- Frontend: 70%+ code coverage
- Critical paths: 100% coverage
  - File upload and validation
  - Brand settings CRUD operations
  - Permission checks
  - Error handling

## Performance Considerations

### Backend Optimization

1. **File Storage:**
   - Store files on disk (not database)
   - Serve static files through CDN in production
   - Implement file size limits
   - Clean up old files on update

2. **Database:**
   - Single record pattern (no queries needed)
   - Index on id field (primary key)
   - Cache settings in memory (optional)

3. **API Response:**
   - Return only necessary fields
   - Compress responses with gzip
   - Set appropriate cache headers for public endpoint

### Frontend Optimization

1. **Context Caching:**
   - Cache settings in localStorage
   - Refresh on mount and after updates
   - Reduce API calls

2. **Image Loading:**
   - Use Next.js Image component for optimization
   - Lazy load preview images
   - Implement progressive image loading

3. **Form Performance:**
   - Debounce preview updates
   - Validate on blur, not on change
   - Use React.memo for preview components

4. **Bundle Size:**
   - Code split settings page
   - Lazy load file upload components
   - Tree-shake unused UI components

### Performance Targets

- Initial page load: < 2 seconds
- Settings page load: < 1 second
- File upload: < 3 seconds for 5MB file
- Brand settings API: < 100ms response time
- Logo display: < 1 second (cached)

## Security Considerations

### Authentication & Authorization

- All admin endpoints require JWT authentication
- Permission check: `branding:manage` for modifications
- Public read endpoint for displaying branding
- Audit logging for all branding changes

### File Upload Security

```typescript
// File validation
const ALLOWED_LOGO_TYPES = ['image/png', 'image/jpeg', 'image/svg+xml', 'image/webp'];
const ALLOWED_FAVICON_TYPES = ['image/x-icon', 'image/png', 'image/svg+xml'];
const MAX_LOGO_SIZE = 5 * 1024 * 1024; // 5MB
const MAX_FAVICON_SIZE = 1 * 1024 * 1024; // 1MB

// Sanitize filenames
const sanitizeFilename = (filename: string): string => {
  return filename.replace(/[^a-zA-Z0-9.-]/g, '_');
};

// Prevent path traversal
const validatePath = (path: string): boolean => {
  return !path.includes('..') && !path.includes('~');
};
```

### Input Validation

- Validate all URLs (prevent XSS)
- Sanitize email addresses
- Validate JSON structure for social links
- Escape user input in preview
- Use parameterized queries (Prisma handles this)

### Rate Limiting

- Limit file uploads: 10 per hour per user
- Limit settings updates: 20 per hour per user
- Implement exponential backoff on failures

## Deployment Considerations

### Environment Variables

```env
# Backend
DATABASE_URL="postgresql://..."
UPLOAD_DIR="public/uploads/branding"
MAX_LOGO_SIZE=5242880
MAX_FAVICON_SIZE=1048576

# Frontend
NEXT_PUBLIC_API_URL="https://api.example.com"
NEXT_PUBLIC_CDN_URL="https://cdn.example.com"
```

### File Storage in Production

**Option 1: Local Storage (Simple)**
- Store in `public/uploads/branding/`
- Serve through Next.js static files
- Backup with regular file system backups

**Option 2: Cloud Storage (Scalable)**
- Use AWS S3, Google Cloud Storage, or Azure Blob
- Update file upload service to use cloud SDK
- Serve through CDN for better performance
- Implement signed URLs for security

### Database Migration

```bash
# Create migration
cd backend
npm run prisma:migrate dev --name add_brand_settings

# Apply in production
npm run prisma:migrate deploy
```

### Deployment Checklist

- [ ] Run database migrations
- [ ] Seed default branding data
- [ ] Configure file upload directory permissions
- [ ] Set up CDN for static assets (optional)
- [ ] Configure CORS for file uploads
- [ ] Test file upload in production environment
- [ ] Verify permission system integration
- [ ] Test branding display across all pages
- [ ] Monitor API performance
- [ ] Set up error tracking (Sentry, etc.)