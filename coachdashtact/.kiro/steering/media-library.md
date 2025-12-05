---
inclusion: manual
---

# Media Library System

## Quick Reference

**Stack**: NestJS + Prisma + Next.js 14 + shadcn/ui  
**Route**: `/dashboard/media`  
**Permissions**: `media:view`, `media:upload`, `media:edit:own`, `media:edit:all`, `media:delete:own`, `media:delete:all`

## Key Files

**Backend**:
- `backend/src/uploads/uploads.service.ts` - Core upload logic
- `backend/src/uploads/uploads.controller.ts` - API endpoints
- `backend/src/uploads/middleware/file-access.middleware.ts` - File serving security
- `backend/src/uploads/helpers/usage-tracker.ts` - Track file usage across entities
- `backend/prisma/schema.prisma` - Upload model

**Frontend**:
- `frontend/src/app/dashboard/media/page.tsx` - Main media library page
- `frontend/src/lib/api/media.ts` - API client
- `frontend/src/types/media.ts` - TypeScript types

## Database Model

```prisma
model Upload {
  id            String      @id @default(cuid())
  filename      String      @unique
  originalName  String
  mimeType      String
  size          Int
  url           String
  path          String
  type          UploadType  // IMAGE, DOCUMENT, AVATAR, EDITOR_IMAGE
  visibility    Visibility  // PUBLIC, PRIVATE, INTERNAL
  uploadedById  String
  usageCount    Int         @default(0)
  deletedAt     DateTime?
  deletedById   String?
}
```

## Common Tasks

### Add Upload to Entity
```typescript
// In your service (products, blog, users)
constructor(private usageTracker: UsageTracker) {}

// After saving entity with file
await this.usageTracker.trackUsage(fileId, 'products', productId);

// For avatars, use avatarUrl field (not avatar)
if (updateData.avatarUrl) {
  await this.usageTracker.trackUsage(updateData.avatarUrl, 'avatars', userId);
}
```

### Check File Usage
```typescript
// Service automatically warns if usageCount > 0 on delete
const result = await uploadsService.remove(id, user);
// Returns: { warning?: string }
```

### Query Uploads
```typescript
// With filters
GET /uploads?type=IMAGE&visibility=PUBLIC&page=1&limit=20

// Get deleted files (admin only)
GET /uploads/deleted
```

### File Access Control
- **PUBLIC**: Anyone can access via `/uploads/:filename`
- **PRIVATE**: Only owner or admin
- **INTERNAL**: Only authenticated users

## Integration Pattern

When adding file upload to a feature:

1. **Import UploadsModule** in your module
2. **Inject UsageTracker** in your service
3. **Track usage** when saving file references
4. **Update on change** if file is replaced

Example:
```typescript
// my-feature.module.ts
import { UploadsModule } from '../uploads/uploads.module';

@Module({
  imports: [UploadsModule],
})

// my-feature.service.ts
constructor(private usageTracker: UsageTracker) {}

async create(dto: CreateDto) {
  const entity = await this.prisma.entity.create({ data: dto });
  
  if (dto.imageId) {
    await this.usageTracker.trackUsage(dto.imageId, 'entities', entity.id);
  }
  
  return entity;
}
```

## Utilities

**Detect Orphaned Files**:
```bash
cd backend
npx ts-node src/uploads/scripts/detect-orphaned-files.ts detect
```

**Cleanup Orphaned Files**:
```bash
npx ts-node src/uploads/scripts/detect-orphaned-files.ts cleanup-filesystem --live
```

**Migrate Existing Files**:
```bash
npx ts-node src/uploads/scripts/migrate-existing-uploads.ts ./uploads
```

## API Endpoints

- `POST /uploads` - Upload file(s)
- `POST /uploads/editor-image` - Upload image from rich text editor
- `GET /uploads` - List uploads (filtered, paginated)
- `GET /uploads/:id` - Get upload details
- `PATCH /uploads/:id` - Update upload metadata
- `DELETE /uploads/:id` - Soft delete (warns if in use)
- `POST /uploads/bulk-delete` - Bulk soft delete
- `PATCH /uploads/bulk-visibility` - Bulk visibility update
- `GET /uploads/deleted` - List soft-deleted (admin)
- `POST /uploads/:id/restore` - Restore deleted file (admin)
- `DELETE /uploads/:id/permanent` - Permanent delete (admin)

## Frontend Components

**Upload Area**: `<MediaUploadArea onUploadComplete={callback} />`  
**Media List**: `<MediaList files={files} onSelect={callback} />`  
**Media Card**: `<MediaCard file={file} onEdit={callback} />`  
**Filters**: `<MediaFilters onFilterChange={callback} />`  
**Preview Modal**: `<MediaPreviewModal file={file} onClose={callback} />`  
**Edit Modal**: `<MediaEditModal file={file} onSave={callback} />`

## Storage Widget

Add to dashboard:
```typescript
import { StorageUsageWidget } from '@/components/dashboard/StorageUsageWidget';

<StorageUsageWidget />
```

Shows total storage, breakdown by type, and per-user stats.

## Permissions

- `media:view` - View media library
- `media:upload` - Upload files
- `media:edit:own` - Edit own uploads
- `media:edit:all` - Edit any upload
- `media:delete:own` - Delete own uploads
- `media:delete:all` - Delete any upload (includes restore/permanent delete)

## Rules

1. **Always track usage** when referencing files in entities
2. **Check usageCount** before deleting to prevent broken references
3. **Use visibility levels** appropriately (PUBLIC for public assets, PRIVATE for user files)
4. **Soft delete first** - allows recovery
5. **Admin cleanup** - use scripts to maintain filesystem/database sync

## File Types & Visibility

### Upload Types
- `IMAGE` - General images (default: PRIVATE)
- `DOCUMENT` - PDFs, docs, etc. (default: PRIVATE)
- `AVATAR` - User profile pictures (default: PRIVATE)
- `EDITOR_IMAGE` - Images in blog/page content (default: PUBLIC)

### Visibility Levels
- `PUBLIC` - Anyone can access (blog/page images, public assets)
- `PRIVATE` - Only uploader and admins (default for most uploads)
- `INTERNAL` - Only authenticated users
- `ROLE_BASED` - Specific roles only (with allowedRoles array)

### Default Visibility by Type
- **Editor images** (`EDITOR_IMAGE`): PUBLIC - so blog/page readers can see them
- **Featured images** (pages/blog): PUBLIC - visible to all visitors
- **Avatars**: PRIVATE - only visible to authenticated users
- **General uploads**: PRIVATE - only uploader and admins

## Migrating from Old Upload System

If you have controllers using old upload methods:

**Old way**:
```typescript
const uploadResult = await this.uploadsService.uploadFile(file, { type: 'image' });
const uploadResult = await this.uploadsService.uploadAvatar(file, userId);
```

**New way**:
```typescript
const baseUrl = process.env.APP_URL || 'http://localhost:3001';

const upload = await this.uploadsService.create(
  {
    filename: file.filename,
    originalName: file.originalname,
    mimeType: file.mimetype,
    size: file.size,
    url: `${baseUrl}/files/${file.filename}`, // Full URL - note /files/ not /uploads/
    path: file.path,
    type: 'IMAGE', // or 'AVATAR', 'DOCUMENT', 'EDITOR_IMAGE'
  },
  user.id,
);
// Use: upload.url, upload.filename, upload.mimeType
```

## Important Notes

**Static File Serving**: Files are served via `/files/:filename` (not `/uploads/`)  
**API Endpoints**: All API routes use `/uploads` prefix (e.g., `POST /uploads`, `GET /uploads`)  
**No Middleware**: File access middleware was removed to prevent API endpoint conflicts  
**Access Control**: Handled by visibility settings (PUBLIC/PRIVATE/INTERNAL) and controller permissions  
**Base URL**: Set `APP_URL` in `.env` (e.g., `http://localhost:3001` for dev, `https://yourdomain.com` for production)

## Troubleshooting

**500 error on upload**: Type validation - backend determines type from MIME, not client input  
**404 on upload endpoints**: Middleware was blocking API routes - now removed  
**File not accessible**: Check visibility and user permissions  
**Upload fails**: Check file size (10MB limit) and MIME type  
**Orphaned files**: Run detection script to identify and clean up  
**Usage count wrong**: Manually update or re-track usage  
**Old uploadFile/uploadAvatar errors**: Update to use `create()` method (see migration above)
