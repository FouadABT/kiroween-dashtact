# User Profile Management System - Design Document

## Overview

The User Profile Management System provides a modern, secure, and user-friendly interface for users to manage their personal information, profile pictures, and account security. The system leverages Next.js 14 App Router for the frontend and NestJS with Prisma for the backend, implementing industry best practices for image optimization, password security, and real-time validation.

### Key Features
- **Profile Viewing & Editing**: View and update personal information (name, email)
- **Avatar Management**: Upload, optimize, and manage profile pictures with WebP conversion
- **Password Management**: Secure password changes with validation and session invalidation
- **Real-Time Validation**: Instant feedback with debounced validation
- **Optimistic Updates**: Immediate UI updates with rollback on failure
- **Responsive Design**: Mobile-first design with adaptive layouts
- **Accessibility**: WCAG 2.1 AA compliant with keyboard and screen reader support
- **Security**: Re-authentication, EXIF stripping, audit logging

## Architecture

### System Components

```
┌─────────────────────────────────────────────────────────────┐
│                        Frontend (Next.js 14)                 │
├─────────────────────────────────────────────────────────────┤
│  ┌──────────────────┐  ┌──────────────────┐                │
│  │  Profile Page    │  │  Settings Page   │                │
│  │  /dashboard/     │  │  /dashboard/     │                │
│  │  profile         │  │  settings/       │                │
│  │                  │  │  security        │                │
│  └────────┬─────────┘  └────────┬─────────┘                │
│           │                     │                           │
│  ┌────────▼─────────────────────▼─────────┐                │
│  │      Profile Context & Hooks            │                │
│  │  - useProfile()                         │                │
│  │  - useProfileUpdate()                   │                │
│  │  - usePasswordChange()                  │                │
│  └────────┬────────────────────────────────┘                │
│           │                                                  │
│  ┌────────▼────────────────────────────────┐                │
│  │      API Client Layer                   │                │
│  │  - profileApi.ts                        │                │
│  │  - Optimistic updates                   │                │
│  │  - Cache management                     │                │
│  └────────┬────────────────────────────────┘                │
└───────────┼──────────────────────────────────────────────────┘
            │ HTTP/REST
┌───────────▼──────────────────────────────────────────────────┐
│                     Backend (NestJS)                         │
├─────────────────────────────────────────────────────────────┤
│  ┌──────────────────┐  ┌──────────────────┐                │
│  │  Profile Module  │  │  Uploads Module  │                │
│  │  - Controller    │  │  - Controller    │                │
│  │  - Service       │  │  - Service       │                │
│  │  - DTOs          │  │  - Image         │                │
│  │  - Validation    │  │    Optimizer     │                │
│  └────────┬─────────┘  └────────┬─────────┘                │
│           │                     │                           │
│  ┌────────▼─────────────────────▼─────────┐                │
│  │         Prisma ORM Layer                │                │
│  └────────┬────────────────────────────────┘                │
└───────────┼──────────────────────────────────────────────────┘
            │
┌───────────▼──────────────────────────────────────────────────┐
│                    PostgreSQL Database                       │
│  - users table (extended with avatarUrl)                    │
│  - token_blacklist table                                    │
│  - audit_logs table                                         │
└─────────────────────────────────────────────────────────────┘
```

### Technology Stack

**Frontend**:
- Next.js 14 (App Router)
- React 18 with TypeScript
- Tailwind CSS + shadcn/ui components
- React Hook Form + Zod validation
- TanStack Query (React Query) for data fetching
- Sharp (via Next.js Image) for client-side preview

**Backend**:
- NestJS 10
- Prisma ORM
- PostgreSQL
- Sharp for image processing
- bcrypt for password hashing
- class-validator for DTO validation
- JWT for authentication

## Components and Interfaces

### Database Schema Extensions

```prisma
model User {
  id                      String                   @id @default(cuid())
  email                   String                   @unique
  name                    String?
  password                String
  avatarUrl               String?                  @map("avatar_url")  // NEW
  bio                     String?                  @db.Text            // NEW
  phone                   String?                                      // NEW
  location                String?                                      // NEW
  website                 String?                                      // NEW
  isActive                Boolean                  @default(true)
  roleId                  String                   @map("role_id")
  createdAt               DateTime                 @default(now()) @map("created_at")
  updatedAt               DateTime                 @updatedAt @map("updated_at")
  authProvider            String                   @default("local") @map("auth_provider")
  emailVerified           Boolean                  @default(false) @map("email_verified")
  twoFactorEnabled        Boolean                  @default(false) @map("two_factor_enabled")
  lastPasswordChange      DateTime?                @map("last_password_change") // NEW
  
  // Relations remain the same
  notificationPreferences NotificationPreference[]
  notifications           Notification[]
  tokenBlacklist          TokenBlacklist[]
  role                    UserRole                 @relation(fields: [roleId], references: [id])
  webhookConfigs          WebhookConfig[]
  blogPosts               BlogPost[]
  
  @@index([roleId])
  @@index([email])
  @@map("users")
}
```


### Backend DTOs

**UpdateProfileDto**:
```typescript
// backend/src/profile/dto/update-profile.dto.ts
import { IsString, IsEmail, IsOptional, MinLength, MaxLength, IsUrl } from 'class-validator';

export class UpdateProfileDto {
  @IsOptional()
  @IsString()
  @MinLength(2)
  @MaxLength(100)
  name?: string;

  @IsOptional()
  @IsEmail()
  email?: string;

  @IsOptional()
  @IsString()
  @MaxLength(500)
  bio?: string;

  @IsOptional()
  @IsString()
  @MaxLength(20)
  phone?: string;

  @IsOptional()
  @IsString()
  @MaxLength(100)
  location?: string;

  @IsOptional()
  @IsUrl()
  @MaxLength(200)
  website?: string;
}
```

**ChangePasswordDto**:
```typescript
// backend/src/profile/dto/change-password.dto.ts
import { IsString, MinLength, Matches } from 'class-validator';

export class ChangePasswordDto {
  @IsString()
  @MinLength(1)
  currentPassword: string;

  @IsString()
  @MinLength(8)
  @Matches(
    /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]/,
    {
      message: 'Password must contain uppercase, lowercase, number, and special character',
    },
  )
  newPassword: string;

  @IsString()
  @MinLength(8)
  confirmPassword: string;
}
```

**ProfileResponseDto**:
```typescript
// backend/src/profile/dto/profile-response.dto.ts
export class ProfileResponseDto {
  id: string;
  email: string;
  name: string | null;
  avatarUrl: string | null;
  bio: string | null;
  phone: string | null;
  location: string | null;
  website: string | null;
  role: {
    id: string;
    name: string;
    description: string | null;
  };
  emailVerified: boolean;
  twoFactorEnabled: boolean;
  createdAt: Date;
  updatedAt: Date;
  lastPasswordChange: Date | null;
}
```

### Frontend Types

**Profile Interface**:
```typescript
// frontend/src/types/profile.ts
export interface UserProfile {
  id: string;
  email: string;
  name: string | null;
  avatarUrl: string | null;
  bio: string | null;
  phone: string | null;
  location: string | null;
  website: string | null;
  role: {
    id: string;
    name: string;
    description: string | null;
  };
  emailVerified: boolean;
  twoFactorEnabled: boolean;
  createdAt: string;
  updatedAt: string;
  lastPasswordChange: string | null;
}

export interface UpdateProfileData {
  name?: string;
  email?: string;
  bio?: string;
  phone?: string;
  location?: string;
  website?: string;
}

export interface ChangePasswordData {
  currentPassword: string;
  newPassword: string;
  confirmPassword: string;
}

export interface AvatarUploadResponse {
  url: string;
  filename: string;
  size: number;
  mimeType: string;
}
```

### API Endpoints

**Profile Endpoints**:
```typescript
GET    /profile              // Get current user profile
PATCH  /profile              // Update profile information
POST   /profile/avatar       // Upload profile picture
DELETE /profile/avatar       // Remove profile picture
POST   /profile/password     // Change password
GET    /profile/activity     // Get recent activity log
```

### Frontend Components

**Component Structure**:
```
frontend/src/
├── app/
│   └── dashboard/
│       ├── profile/
│       │   └── page.tsx                    // Main profile page
│       └── settings/
│           └── security/
│               └── page.tsx                // Password change page
├── components/
│   └── profile/
│       ├── ProfileHeader.tsx               // Avatar and basic info
│       ├── ProfileForm.tsx                 // Edit profile form
│       ├── AvatarUpload.tsx                // Avatar upload component
│       ├── AvatarEditor.tsx                // Crop and preview
│       ├── PasswordChangeForm.tsx          // Password change form
│       ├── ProfileSkeleton.tsx             // Loading state
│       └── ProfileActivity.tsx             // Recent activity
├── hooks/
│   ├── useProfile.ts                       // Fetch profile data
│   ├── useProfileUpdate.ts                 // Update profile mutation
│   ├── useAvatarUpload.ts                  // Avatar upload mutation
│   └── usePasswordChange.ts                // Password change mutation
├── lib/
│   └── api/
│       └── profile.ts                      // Profile API client
└── contexts/
    └── ProfileContext.tsx                  // Profile state management
```

## Data Models

### Profile Data Flow

**1. Profile Fetch**:
```
User → Profile Page → useProfile Hook → API Client → Backend
                                                        ↓
                                                    Prisma Query
                                                        ↓
                                                    PostgreSQL
                                                        ↓
Backend → Transform to DTO → API Client → Cache → Display
```

**2. Profile Update (Optimistic)**:
```
User Input → Form Validation → Optimistic Update (UI)
                                        ↓
                                API Request → Backend
                                        ↓
                                Validation → Database Update
                                        ↓
                            Success: Confirm UI / Failure: Rollback
```

**3. Avatar Upload**:
```
File Selection → Client Validation → Preview
                                        ↓
                                Upload to Backend
                                        ↓
                        Sharp Processing (resize, optimize, WebP)
                                        ↓
                        Save to /uploads/avatars/
                                        ↓
                        Update User.avatarUrl
                                        ↓
                        Return URL → Update UI
```

**4. Password Change**:
```
Form Input → Validation → API Request
                                ↓
                        Verify Current Password
                                ↓
                        Hash New Password (bcrypt)
                                ↓
                        Update Database
                                ↓
                        Blacklist All Tokens
                                ↓
                        Send Security Email
                                ↓
                        Logout User → Redirect to Login
```


## Error Handling

### Validation Errors

**Frontend Validation** (Zod Schema):
```typescript
// frontend/src/lib/validation/profile-schema.ts
import { z } from 'zod';

export const profileSchema = z.object({
  name: z.string().min(2, 'Name must be at least 2 characters').max(100).optional(),
  email: z.string().email('Invalid email format').optional(),
  bio: z.string().max(500, 'Bio must be less than 500 characters').optional(),
  phone: z.string().max(20).optional(),
  location: z.string().max(100).optional(),
  website: z.string().url('Invalid URL format').max(200).optional(),
});

export const passwordSchema = z.object({
  currentPassword: z.string().min(1, 'Current password is required'),
  newPassword: z
    .string()
    .min(8, 'Password must be at least 8 characters')
    .regex(
      /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])/,
      'Password must contain uppercase, lowercase, number, and special character'
    ),
  confirmPassword: z.string(),
}).refine((data) => data.newPassword === data.confirmPassword, {
  message: "Passwords don't match",
  path: ['confirmPassword'],
});
```

**Backend Error Responses**:
```typescript
// Standard error format
{
  statusCode: 400 | 401 | 403 | 404 | 409 | 500,
  message: string | string[],
  error: string,
  timestamp: string,
  path: string
}

// Examples:
// Email already exists
{
  statusCode: 409,
  message: 'Email already in use',
  error: 'Conflict'
}

// Invalid current password
{
  statusCode: 401,
  message: 'Current password is incorrect',
  error: 'Unauthorized'
}

// Validation errors
{
  statusCode: 400,
  message: [
    'name must be longer than or equal to 2 characters',
    'email must be an email'
  ],
  error: 'Bad Request'
}
```

### Error Handling Strategy

**1. Network Errors**:
- Display toast notification: "Network error. Please check your connection."
- Retry button for failed requests
- Offline detection with queue for pending updates

**2. Validation Errors**:
- Real-time field-level validation
- Display errors below each field
- Prevent form submission until valid
- Highlight invalid fields with red border

**3. Server Errors**:
- Display user-friendly error messages
- Log detailed errors to console (development)
- Send error reports to monitoring service (production)
- Provide fallback UI for critical failures

**4. Authentication Errors**:
- Redirect to login page with return URL
- Clear invalid tokens from storage
- Display session expired message

## Testing Strategy

### Backend Tests

**Unit Tests** (`profile.service.spec.ts`):
```typescript
describe('ProfileService', () => {
  describe('updateProfile', () => {
    it('should update user profile successfully');
    it('should throw ConflictException if email already exists');
    it('should validate email format');
    it('should update only provided fields');
  });

  describe('changePassword', () => {
    it('should change password successfully');
    it('should throw UnauthorizedException if current password is wrong');
    it('should hash new password with bcrypt');
    it('should blacklist all user tokens after password change');
    it('should send security notification email');
  });

  describe('uploadAvatar', () => {
    it('should upload and optimize avatar image');
    it('should reject files larger than 5MB');
    it('should reject non-image files');
    it('should convert image to WebP format');
    it('should resize image to 400x400');
    it('should strip EXIF metadata');
    it('should delete old avatar when uploading new one');
  });
});
```

**E2E Tests** (`profile.e2e-spec.ts`):
```typescript
describe('Profile API (e2e)', () => {
  it('GET /profile - should return current user profile');
  it('PATCH /profile - should update profile with valid data');
  it('PATCH /profile - should return 409 if email exists');
  it('POST /profile/avatar - should upload avatar successfully');
  it('DELETE /profile/avatar - should remove avatar');
  it('POST /profile/password - should change password and logout');
  it('POST /profile/password - should reject wrong current password');
});
```

### Frontend Tests

**Component Tests**:
```typescript
describe('ProfileForm', () => {
  it('should render profile form with current data');
  it('should validate fields in real-time');
  it('should show error messages for invalid input');
  it('should submit form with valid data');
  it('should handle API errors gracefully');
  it('should show success message on update');
});

describe('AvatarUpload', () => {
  it('should open file dialog on click');
  it('should support drag and drop');
  it('should validate file type and size');
  it('should show preview before upload');
  it('should display upload progress');
  it('should update avatar on successful upload');
});

describe('PasswordChangeForm', () => {
  it('should validate password requirements');
  it('should check password confirmation match');
  it('should show password strength indicator');
  it('should handle incorrect current password');
  it('should logout user after successful change');
});
```

**Integration Tests**:
```typescript
describe('Profile Management Flow', () => {
  it('should complete full profile update flow');
  it('should handle avatar upload and profile update together');
  it('should change password and re-authenticate');
  it('should handle concurrent profile updates');
});
```

### Accessibility Tests

**Automated Tests** (using jest-axe):
```typescript
describe('Profile Accessibility', () => {
  it('should have no accessibility violations on profile page');
  it('should have proper ARIA labels on form fields');
  it('should announce validation errors to screen readers');
  it('should support keyboard navigation');
  it('should have sufficient color contrast');
});
```

**Manual Testing Checklist**:
- [ ] Keyboard navigation works for all interactive elements
- [ ] Screen reader announces all form labels and errors
- [ ] Focus indicators are visible
- [ ] Form submission can be triggered with Enter key
- [ ] Error messages are associated with form fields
- [ ] Success/error notifications are announced
- [ ] Avatar upload dialog is keyboard accessible

## Performance Considerations

### Image Optimization

**Backend Processing** (Sharp):
```typescript
// backend/src/uploads/image-optimizer.service.ts
async optimizeAvatar(buffer: Buffer): Promise<Buffer> {
  return sharp(buffer)
    .resize(400, 400, {
      fit: 'cover',
      position: 'center',
    })
    .webp({ quality: 85 })
    .rotate() // Auto-rotate based on EXIF
    .withMetadata(false) // Strip EXIF data
    .toBuffer();
}
```

**Performance Metrics**:
- Original image: ~2-5MB (JPEG/PNG)
- Optimized image: ~50-150KB (WebP)
- Processing time: <500ms
- Reduction: ~95% file size

### Caching Strategy

**Client-Side Cache** (React Query):
```typescript
// frontend/src/hooks/useProfile.ts
export function useProfile() {
  return useQuery({
    queryKey: ['profile'],
    queryFn: fetchProfile,
    staleTime: 5 * 60 * 1000, // 5 minutes
    cacheTime: 10 * 60 * 1000, // 10 minutes
    refetchOnWindowFocus: true,
    refetchOnReconnect: true,
  });
}
```

**Optimistic Updates**:
```typescript
// frontend/src/hooks/useProfileUpdate.ts
export function useProfileUpdate() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: updateProfile,
    onMutate: async (newData) => {
      // Cancel outgoing refetches
      await queryClient.cancelQueries({ queryKey: ['profile'] });
      
      // Snapshot previous value
      const previousProfile = queryClient.getQueryData(['profile']);
      
      // Optimistically update
      queryClient.setQueryData(['profile'], (old) => ({
        ...old,
        ...newData,
      }));
      
      return { previousProfile };
    },
    onError: (err, newData, context) => {
      // Rollback on error
      queryClient.setQueryData(['profile'], context.previousProfile);
    },
    onSettled: () => {
      // Refetch after mutation
      queryClient.invalidateQueries({ queryKey: ['profile'] });
    },
  });
}
```

### Database Optimization

**Indexes**:
```prisma
model User {
  // ... fields
  
  @@index([email])
  @@index([roleId])
  @@index([updatedAt])
}
```

**Query Optimization**:
- Use `select` to fetch only needed fields
- Include role data in single query (avoid N+1)
- Use connection pooling for concurrent requests


## Security Considerations

### Password Security

**Hashing Strategy**:
```typescript
// backend/src/profile/profile.service.ts
import * as bcrypt from 'bcrypt';

async changePassword(userId: string, dto: ChangePasswordDto): Promise<void> {
  // 1. Verify current password
  const user = await this.prisma.user.findUnique({ where: { id: userId } });
  const isValid = await bcrypt.compare(dto.currentPassword, user.password);
  
  if (!isValid) {
    throw new UnauthorizedException('Current password is incorrect');
  }
  
  // 2. Hash new password (10 rounds)
  const hashedPassword = await bcrypt.hash(dto.newPassword, 10);
  
  // 3. Update password and timestamp
  await this.prisma.user.update({
    where: { id: userId },
    data: {
      password: hashedPassword,
      lastPasswordChange: new Date(),
    },
  });
  
  // 4. Blacklist all existing tokens
  await this.authService.revokeAllUserTokens(userId);
  
  // 5. Send security notification
  await this.notificationService.sendPasswordChangeAlert(user.email);
}
```

**Password Requirements**:
- Minimum 8 characters
- At least one uppercase letter
- At least one lowercase letter
- At least one number
- At least one special character (@$!%*?&)
- Cannot be same as current password
- Cannot be common passwords (check against list)

### Image Upload Security

**File Validation**:
```typescript
// backend/src/uploads/uploads.service.ts
async validateImageFile(file: Express.Multer.File): Promise<void> {
  // Check file size (5MB max)
  if (file.size > 5 * 1024 * 1024) {
    throw new BadRequestException('File size exceeds 5MB limit');
  }
  
  // Check MIME type
  const allowedTypes = ['image/jpeg', 'image/png', 'image/webp', 'image/gif'];
  if (!allowedTypes.includes(file.mimetype)) {
    throw new BadRequestException('Invalid file type. Only JPEG, PNG, WebP, and GIF allowed');
  }
  
  // Verify file is actually an image (check magic bytes)
  const fileType = await this.getFileType(file.buffer);
  if (!fileType || !allowedTypes.includes(fileType.mime)) {
    throw new BadRequestException('File is not a valid image');
  }
}

// Strip EXIF metadata
async stripMetadata(buffer: Buffer): Promise<Buffer> {
  return sharp(buffer)
    .withMetadata(false) // Remove all metadata
    .toBuffer();
}
```

**File Storage**:
- Store in `/uploads/avatars/{userId}/` directory
- Generate unique filenames with UUID
- Set proper file permissions (read-only)
- Serve through CDN or static file server
- Implement rate limiting on upload endpoint

### Authentication & Authorization

**JWT Token Validation**:
```typescript
// All profile endpoints require authentication
@Controller('profile')
@UseGuards(JwtAuthGuard)
export class ProfileController {
  // User can only access their own profile
  @Get()
  async getProfile(@CurrentUser() user: RequestUser) {
    return this.profileService.getProfile(user.id);
  }
  
  // Require re-authentication for sensitive operations
  @Post('password')
  @UseGuards(RecentAuthGuard) // Requires auth within last 30 minutes
  async changePassword(
    @CurrentUser() user: RequestUser,
    @Body() dto: ChangePasswordDto,
  ) {
    return this.profileService.changePassword(user.id, dto);
  }
}
```

**Rate Limiting**:
```typescript
// Protect against brute force attacks
@Post('password')
@UseGuards(JwtAuthGuard, ThrottlerGuard)
@Throttle(3, 900) // 3 attempts per 15 minutes
async changePassword(...) { }

@Post('avatar')
@UseGuards(JwtAuthGuard, ThrottlerGuard)
@Throttle(10, 3600) // 10 uploads per hour
async uploadAvatar(...) { }
```

### Audit Logging

**Security Events to Log**:
```typescript
// backend/src/profile/profile.service.ts
async logSecurityEvent(event: SecurityEvent): Promise<void> {
  await this.auditLogger.log({
    userId: event.userId,
    action: event.action,
    resource: 'profile',
    ipAddress: event.ipAddress,
    userAgent: event.userAgent,
    timestamp: new Date(),
    metadata: event.metadata,
  });
}

// Events to log:
// - Profile email change
// - Password change
// - Failed password change attempts
// - Avatar upload
// - Profile data access
// - Suspicious activity (multiple failed attempts)
```

## UI/UX Design

### Profile Page Layout

**Desktop Layout** (≥1024px):
```
┌─────────────────────────────────────────────────────────┐
│  Breadcrumb: Dashboard > Profile                        │
├─────────────────────────────────────────────────────────┤
│                                                          │
│  ┌──────────────┐  ┌──────────────────────────────┐   │
│  │              │  │  Personal Information         │   │
│  │   Avatar     │  │  ┌─────────────────────────┐ │   │
│  │   (400x400)  │  │  │ Name: [John Doe      ] │ │   │
│  │              │  │  │ Email: [john@example  ] │ │   │
│  │  [Upload]    │  │  │ Bio: [Software dev... ] │ │   │
│  │  [Remove]    │  │  │ Phone: [+1 234...    ] │ │   │
│  │              │  │  │ Location: [New York  ] │ │   │
│  └──────────────┘  │  │ Website: [https://... ] │ │   │
│                     │  └─────────────────────────┘ │   │
│  Account Info       │                              │   │
│  • Role: Admin      │  [Cancel]  [Save Changes]    │   │
│  • Joined: Jan 2024 │                              │   │
│  • Last updated:    │                              │   │
│    2 hours ago      │                              │   │
│                     └──────────────────────────────┘   │
│                                                          │
│  ┌──────────────────────────────────────────────────┐  │
│  │  Security Settings                                │  │
│  │  ┌────────────────────────────────────────────┐  │  │
│  │  │ Change Password                            │  │  │
│  │  │ Last changed: 30 days ago                  │  │  │
│  │  │ [Change Password] →                        │  │  │
│  │  └────────────────────────────────────────────┘  │  │
│  │  ┌────────────────────────────────────────────┐  │  │
│  │  │ Two-Factor Authentication                  │  │  │
│  │  │ Status: Disabled                           │  │  │
│  │  │ [Enable 2FA] →                             │  │  │
│  │  └────────────────────────────────────────────┘  │  │
│  └──────────────────────────────────────────────────┘  │
└─────────────────────────────────────────────────────────┘
```

**Mobile Layout** (<768px):
```
┌──────────────────────────┐
│  ← Profile               │
├──────────────────────────┤
│                          │
│      ┌──────────┐        │
│      │  Avatar  │        │
│      │ (200x200)│        │
│      └──────────┘        │
│    [Upload] [Remove]     │
│                          │
│  John Doe                │
│  john@example.com        │
│  Admin • Joined Jan 2024 │
│                          │
├──────────────────────────┤
│  Personal Information    │
│  ┌────────────────────┐  │
│  │ Name              │  │
│  │ [John Doe       ] │  │
│  └────────────────────┘  │
│  ┌────────────────────┐  │
│  │ Email             │  │
│  │ [john@example   ] │  │
│  └────────────────────┘  │
│  ┌────────────────────┐  │
│  │ Bio               │  │
│  │ [Software dev...] │  │
│  └────────────────────┘  │
│  ... more fields ...     │
│                          │
│  [Save Changes]          │
│                          │
├──────────────────────────┤
│  Security                │
│  ┌────────────────────┐  │
│  │ Change Password  → │  │
│  └────────────────────┘  │
│  ┌────────────────────┐  │
│  │ Enable 2FA       → │  │
│  └────────────────────┘  │
└──────────────────────────┘
```

### Avatar Upload Flow

**Step 1: Click Avatar**
```
┌─────────────────────────┐
│                         │
│    ┌─────────────┐      │
│    │             │      │
│    │   Avatar    │      │
│    │   Image     │      │
│    │             │      │
│    └─────────────┘      │
│                         │
│   [📷 Upload Photo]     │
│   [🗑️  Remove Photo]     │
│                         │
└─────────────────────────┘
```

**Step 2: Upload Dialog**
```
┌─────────────────────────────────────┐
│  Upload Profile Picture         [×] │
├─────────────────────────────────────┤
│                                     │
│  ┌───────────────────────────────┐  │
│  │                               │  │
│  │   📁 Drag & drop image here   │  │
│  │        or click to browse     │  │
│  │                               │  │
│  │   Supported: JPEG, PNG, WebP  │  │
│  │   Max size: 5MB               │  │
│  │                               │  │
│  └───────────────────────────────┘  │
│                                     │
│  [Cancel]              [Upload]     │
└─────────────────────────────────────┘
```

**Step 3: Preview & Crop**
```
┌─────────────────────────────────────┐
│  Adjust Your Photo              [×] │
├─────────────────────────────────────┤
│                                     │
│  ┌───────────────────────────────┐  │
│  │   ┌─────────────────────┐     │  │
│  │   │                     │     │  │
│  │   │   Cropping Area     │     │  │
│  │   │   (Drag to adjust)  │     │  │
│  │   │                     │     │  │
│  │   └─────────────────────┘     │  │
│  └───────────────────────────────┘  │
│                                     │
│  Zoom: [━━━━━○━━━━] 100%           │
│  Rotate: [↶ 90°] [↷ 90°]          │
│                                     │
│  [Cancel]              [Apply]      │
└─────────────────────────────────────┘
```

**Step 4: Uploading**
```
┌─────────────────────────────────────┐
│  Uploading...                   [×] │
├─────────────────────────────────────┤
│                                     │
│  ┌───────────────────────────────┐  │
│  │  ████████████░░░░░░░░░░░░░░   │  │
│  │  Uploading... 65%              │  │
│  └───────────────────────────────┘  │
│                                     │
│  Optimizing image...                │
│                                     │
└─────────────────────────────────────┘
```

### Password Change Flow

```
┌─────────────────────────────────────┐
│  Change Password                [×] │
├─────────────────────────────────────┤
│                                     │
│  Current Password                   │
│  ┌───────────────────────────────┐  │
│  │ [••••••••••••]          [👁️]  │  │
│  └───────────────────────────────┘  │
│                                     │
│  New Password                       │
│  ┌───────────────────────────────┐  │
│  │ [••••••••••••]          [👁️]  │  │
│  └───────────────────────────────┘  │
│  Password strength: ████░░ Strong   │
│                                     │
│  Confirm New Password               │
│  ┌───────────────────────────────┐  │
│  │ [••••••••••••]          [👁️]  │  │
│  └───────────────────────────────┘  │
│  ✓ Passwords match                  │
│                                     │
│  Requirements:                      │
│  ✓ At least 8 characters            │
│  ✓ Uppercase letter                 │
│  ✓ Lowercase letter                 │
│  ✓ Number                           │
│  ✓ Special character                │
│                                     │
│  [Cancel]      [Change Password]    │
└─────────────────────────────────────┘
```

### Loading States

**Skeleton Loader**:
```
┌─────────────────────────────────────┐
│  ┌──────────┐  ┌──────────────────┐ │
│  │          │  │ ▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓ │ │
│  │  ▓▓▓▓▓   │  │ ▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓ │ │
│  │  ▓▓▓▓▓   │  │                  │ │
│  │          │  │ ▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓ │ │
│  └──────────┘  │ ▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓ │ │
│                └──────────────────┘ │
└─────────────────────────────────────┘
```

### Success/Error States

**Success Toast**:
```
┌─────────────────────────────────┐
│ ✓ Profile updated successfully  │
└─────────────────────────────────┘
```

**Error Toast**:
```
┌─────────────────────────────────┐
│ ✗ Email already in use          │
└─────────────────────────────────┘
```

**Inline Error**:
```
Email
┌───────────────────────────────┐
│ john@example.com            ✗ │
└───────────────────────────────┘
⚠️ Email already in use
```

## Implementation Notes

### Phase 1: Backend Setup
1. Extend User model with new fields (avatarUrl, bio, phone, location, website, lastPasswordChange)
2. Create migration and run `prisma migrate dev`
3. Create ProfileModule with controller and service
4. Implement profile endpoints (GET, PATCH)
5. Add validation DTOs
6. Write unit tests for ProfileService

### Phase 2: Avatar Upload
1. Extend UploadsModule for avatar handling
2. Implement image optimization with Sharp
3. Add avatar upload endpoint (POST /profile/avatar)
4. Add avatar delete endpoint (DELETE /profile/avatar)
5. Implement EXIF stripping and WebP conversion
6. Write tests for image processing

### Phase 3: Password Management
1. Create ChangePasswordDto with validation
2. Implement password change endpoint
3. Add token blacklisting logic
4. Integrate with notification system for security alerts
5. Write tests for password change flow

### Phase 4: Frontend Components
1. Create ProfilePage with layout
2. Build ProfileForm with React Hook Form + Zod
3. Implement AvatarUpload component with preview
4. Create PasswordChangeForm
5. Add loading and error states
6. Implement responsive design

### Phase 5: State Management
1. Set up React Query for profile data
2. Implement optimistic updates
3. Add caching strategy
4. Create custom hooks (useProfile, useProfileUpdate, etc.)
5. Add error handling and retry logic

### Phase 6: Testing & Polish
1. Write component tests
2. Add E2E tests
3. Perform accessibility audit
4. Test on multiple devices and browsers
5. Optimize performance
6. Add analytics tracking

### Phase 7: Documentation
1. Update API documentation
2. Create user guide for profile management
3. Document security considerations
4. Add troubleshooting guide
