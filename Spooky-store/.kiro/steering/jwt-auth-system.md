---
inclusion: fileMatch
fileMatchPattern: '{backend/src/auth/**,backend/src/profile/**,frontend/src/contexts/AuthContext.tsx,backend/prisma/seed-data/auth.seed.ts,frontend/src/components/auth/**}'
---

# JWT Authentication & Permission System

## Overview

This project uses a professional JWT-based authentication system with role-based access control (RBAC) and flexible permission management. The system is production-ready with comprehensive security measures.

## System Architecture

### Stack
- **Backend**: NestJS + Prisma + PostgreSQL
- **Frontend**: Next.js 14 + TypeScript + Tailwind CSS
- **Authentication**: JWT tokens (access + refresh)
- **Authorization**: Role-based permissions

### Key Components

**Backend** (`backend/src/auth/`):
- `auth.service.ts` - Authentication business logic
- `auth.controller.ts` - Auth endpoints (login, register, refresh, logout, profile, password reset)
- `services/password-reset.service.ts` - Password reset token management
- `jwt-auth.guard.ts` - JWT validation guard
- `permissions.guard.ts` - Permission checking guard
- `roles.guard.ts` - Role checking guard

**Frontend** (`frontend/src/`):
- `contexts/AuthContext.tsx` - Global auth state management
- `components/auth/` - Auth guards and components
- `app/forgot-password/` - Password reset request page
- `app/reset-password/` - Password reset confirmation page
- `hooks/` - Auth convenience hooks

## Permission System

### Permission Naming Convention

**Format**: `{resource}:{action}`

**Standard Actions**:
- `read` - View/list resources
- `write` - Create/update resources  
- `delete` - Remove resources
- `admin` - Full administrative access
- `*` - All actions (wildcard)

**Examples**:
```typescript
'users:read'        // View users
'users:write'       // Create/edit users
'users:delete'      // Delete users
'users:*'           // All user operations
'settings:admin'    // Full settings access
'*:*'               // Super admin (all permissions)
```

### Default Roles

**Super Admin**: `*:*` (all permissions)

**Admin**: 
- `users:read`, `users:write`, `users:delete`
- `roles:read`, `roles:write`
- `permissions:read`
- `settings:read`, `settings:write`
- `profile:write`

**Manager**:
- `users:read`, `users:write`
- `roles:read`
- `settings:read`
- `profile:write`

**User**:
- `users:read`
- `settings:read`
- `profile:write`

### Permission Configuration

**Seed Data**: `backend/prisma/seed-data/auth.seed.ts`

Add new permissions:
```typescript
export const DEFAULT_PERMISSIONS = [
  {
    name: 'posts:read',
    resource: 'posts',
    action: 'read',
    description: 'View posts'
  },
  // ... more permissions
];
```

Assign to roles:
```typescript
export const DEFAULT_ROLES = {
  ADMIN: {
    permissions: [
      'users:*',
      'posts:*',
      // ... more permissions
    ],
  },
};
```

## Backend Implementation

### Protecting Endpoints

```typescript
import { Controller, Get, Post, UseGuards } from '@nestjs/common';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { PermissionsGuard } from '../auth/guards/permissions.guard';
import { Permissions } from '../auth/decorators/permissions.decorator';
import { CurrentUser } from '../auth/decorators/current-user.decorator';

@Controller('posts')
@UseGuards(JwtAuthGuard, PermissionsGuard)  // Apply to all routes
export class PostsController {
  
  // Requires authentication + users:read permission
  @Get()
  @Permissions('posts:read')
  async findAll() {
    return this.postsService.findAll();
  }
  
  // Requires authentication + posts:write permission
  @Post()
  @Permissions('posts:write')
  async create(@Body() dto: CreatePostDto, @CurrentUser() user) {
    return this.postsService.create(dto, user.id);
  }
  
  // Requires authentication + posts:delete permission
  @Delete(':id')
  @Permissions('posts:delete')
  async remove(@Param('id') id: string) {
    return this.postsService.remove(id);
  }
  
  // Multiple permissions (user must have ALL)
  @Post(':id/publish')
  @Permissions('posts:write', 'posts:publish')
  async publish(@Param('id') id: string) {
    return this.postsService.publish(id);
  }
}
```

### Public Endpoints

```typescript
import { Public } from '../auth/decorators/public.decorator';

@Controller('auth')
export class AuthController {
  
  // Public endpoint - no authentication required
  @Public()
  @Post('login')
  async login(@Body() dto: LoginDto) {
    return this.authService.login(dto);
  }
  
  @Public()
  @Post('register')
  async register(@Body() dto: RegisterDto) {
    return this.authService.register(dto);
  }
}
```

### Getting Current User

```typescript
import { CurrentUser } from '../auth/decorators/current-user.decorator';

@Get('profile')
async getProfile(@CurrentUser() user) {
  // user contains: { id, email, roleId, roleName, permissions }
  return this.usersService.findOne(user.id);
}
```

### Role-Based Protection

```typescript
import { Roles } from '../auth/decorators/roles.decorator';
import { RolesGuard } from '../auth/guards/roles.guard';

@Controller('admin')
@UseGuards(JwtAuthGuard, RolesGuard)
export class AdminController {
  
  @Get('dashboard')
  @Roles('Admin', 'Super Admin')
  async dashboard() {
    return this.adminService.getDashboard();
  }
}
```

## Frontend Implementation

### Auth Context Usage

```typescript
import { useAuth } from '@/contexts/AuthContext';

function MyComponent() {
  const { 
    user,                    // Current user object
    isAuthenticated,         // Boolean
    isLoading,              // Boolean
    login,                  // (credentials) => Promise<void>
    logout,                 // () => Promise<void>
    hasPermission,          // (permission: string) => boolean
    hasRole,                // (role: string) => boolean
    hasAnyPermission,       // (permissions: string[]) => boolean
    hasAllPermissions,      // (permissions: string[]) => boolean
  } = useAuth();
  
  // Check permission
  if (hasPermission('posts:write')) {
    // Show edit button
  }
  
  // Check role
  if (hasRole('Admin')) {
    // Show admin panel
  }
}
```

### Route Protection

```typescript
// Protect entire page
import { AuthGuard } from '@/components/auth/AuthGuard';

export default function DashboardPage() {
  return (
    <AuthGuard>
      <div>Protected content</div>
    </AuthGuard>
  );
}

// Protect with permission
import { PermissionGuard } from '@/components/auth/PermissionGuard';

export default function UsersPage() {
  return (
    <PermissionGuard permission="users:read">
      <div>User management</div>
    </PermissionGuard>
  );
}

// Protect with role
import { RoleGuard } from '@/components/auth/RoleGuard';

export default function AdminPage() {
  return (
    <RoleGuard role="Admin">
      <div>Admin panel</div>
    </RoleGuard>
  );
}
```

### Conditional UI Rendering

```typescript
import { PermissionGuard } from '@/components/auth/PermissionGuard';

function UserList() {
  return (
    <div>
      <h1>Users</h1>
      
      {/* Show button only if user has permission */}
      <PermissionGuard permission="users:write" fallback={null}>
        <Button>Add User</Button>
      </PermissionGuard>
      
      {/* Multiple permissions - requires ALL */}
      <PermissionGuard 
        permission={['posts:write', 'posts:publish']}
        requireAll={true}
        fallback={null}
      >
        <Button>Publish</Button>
      </PermissionGuard>
      
      {/* Multiple permissions - requires ANY */}
      <PermissionGuard 
        permission={['users:write', 'users:admin']}
        requireAll={false}
        fallback={null}
      >
        <Button>Edit</Button>
      </PermissionGuard>
    </div>
  );
}
```

### Convenience Hooks

```typescript
import { usePermission } from '@/hooks/usePermission';
import { useRole } from '@/hooks/useRole';
import { useRequireAuth } from '@/hooks/useRequireAuth';
import { useRequirePermission } from '@/hooks/useRequirePermission';

function MyComponent() {
  // Simple permission check
  const canEdit = usePermission('posts:write');
  
  // Simple role check
  const isAdmin = useRole('Admin');
  
  // Require authentication (redirects if not authenticated)
  const { isLoading } = useRequireAuth();
  
  // Require permission (redirects to 403 if missing)
  const { hasAccess } = useRequirePermission('users:write');
  
  if (isLoading) return <Loading />;
  
  return (
    <div>
      {canEdit && <EditButton />}
      {isAdmin && <AdminPanel />}
    </div>
  );
}
```

### Navigation with Permissions

```typescript
// NavigationContext automatically filters menu items by permissions
import { useNavigation } from '@/contexts/NavigationContext';

// In NavigationContext.tsx, define menu items with permissions:
const navigationItems = [
  {
    title: "Dashboard",
    href: "/dashboard",
    icon: Home,
    // No permission - visible to all authenticated users
  },
  {
    title: "Users",
    href: "/dashboard/users",
    icon: Users,
    permission: "users:read",  // Only visible if user has this permission
  },
  {
    title: "Settings",
    href: "/dashboard/settings",
    icon: Settings,
    permission: "settings:read",
  },
];
```

## Database Schema

### Core Auth Tables

```prisma
model User {
  id                String          @id @default(cuid())
  email             String          @unique
  name              String?
  password          String
  roleId            String          @map("role_id")
  role              UserRole        @relation(fields: [roleId], references: [id])
  isActive          Boolean         @default(true)
  emailVerified     Boolean         @default(false) @map("email_verified")
  authProvider      String          @default("local") @map("auth_provider")
  twoFactorEnabled  Boolean         @default(false) @map("two_factor_enabled")
  createdAt         DateTime        @default(now()) @map("created_at")
  updatedAt         DateTime        @updatedAt @map("updated_at")
  
  tokenBlacklist    TokenBlacklist[]
  
  @@map("users")
}

model UserRole {
  id              String           @id @default(cuid())
  name            String           @unique
  description     String?
  isActive        Boolean          @default(true)
  isSystemRole    Boolean          @default(false) @map("is_system_role")
  createdAt       DateTime         @default(now()) @map("created_at")
  updatedAt       DateTime         @updatedAt @map("updated_at")
  
  users           User[]
  rolePermissions RolePermission[]
  
  @@map("user_roles")
}

model Permission {
  id              String           @id @default(cuid())
  name            String           @unique
  description     String?
  resource        String
  action          String
  createdAt       DateTime         @default(now()) @map("created_at")
  updatedAt       DateTime         @updatedAt @map("updated_at")
  
  rolePermissions RolePermission[]
  
  @@map("permissions")
}

model RolePermission {
  id           String     @id @default(cuid())
  roleId       String     @map("role_id")
  permissionId String     @map("permission_id")
  role         UserRole   @relation(fields: [roleId], references: [id], onDelete: Cascade)
  permission   Permission @relation(fields: [permissionId], references: [id], onDelete: Cascade)
  createdAt    DateTime   @default(now()) @map("created_at")
  
  @@unique([roleId, permissionId])
  @@map("role_permissions")
}

model TokenBlacklist {
  id        String   @id @default(cuid())
  token     String   @unique
  userId    String   @map("user_id")
  user      User     @relation(fields: [userId], references: [id], onDelete: Cascade)
  expiresAt DateTime @map("expires_at")
  createdAt DateTime @default(now()) @map("created_at")
  
  @@map("token_blacklist")
}
```

## Common Tasks

### Adding a New Protected Feature

1. **Define Permissions** in `backend/prisma/seed-data/auth.seed.ts`:
```typescript
{
  name: 'posts:read',
  resource: 'posts',
  action: 'read',
  description: 'View posts'
},
{
  name: 'posts:write',
  resource: 'posts',
  action: 'write',
  description: 'Create/edit posts'
},
```

2. **Assign to Roles**:
```typescript
ADMIN: {
  permissions: [
    // ... existing permissions
    'posts:read',
    'posts:write',
  ],
},
```

3. **Reseed Database**:
```bash
cd backend
npm run prisma:seed
```

4. **Protect Backend Endpoints**:
```typescript
@Controller('posts')
@UseGuards(JwtAuthGuard, PermissionsGuard)
export class PostsController {
  @Get()
  @Permissions('posts:read')
  async findAll() { }
}
```

5. **Protect Frontend Pages**:
```typescript
export default function PostsPage() {
  return (
    <PermissionGuard permission="posts:read">
      <PostsList />
    </PermissionGuard>
  );
}
```

6. **Add to Navigation** (if needed):
```typescript
{
  title: "Posts",
  href: "/dashboard/posts",
  icon: FileText,
  permission: "posts:read",
},
```

### Changing User Role/Permissions

**Via Database**:
```sql
-- Get role IDs
SELECT id, name FROM user_roles;

-- Update user role
UPDATE users SET role_id = 'new_role_id' WHERE email = 'user@example.com';
```

**Via Script**:
```javascript
// backend/update-user-role.js
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function updateUserRole() {
  const adminRole = await prisma.userRole.findUnique({
    where: { name: 'Admin' }
  });
  
  await prisma.user.update({
    where: { email: 'user@example.com' },
    data: { roleId: adminRole.id }
  });
}
```

**Important**: User must log out and log back in to get new permissions in their JWT token.

### Debugging Permissions

**Backend - Check User Permissions**:
```typescript
const permissions = await this.permissionsService.getUserPermissions(userId);
console.log('User permissions:', permissions);
```

**Frontend - Debug Component**:
```typescript
import { PermissionsDebug } from '@/components/dev/PermissionsDebug';

// Add to any page (development only)
{process.env.NODE_ENV === 'development' && <PermissionsDebug />}
```

**Database Query**:
```sql
-- Check user's permissions
SELECT u.email, ur.name as role_name, p.name as permission_name
FROM users u
JOIN user_roles ur ON u.role_id = ur.id
JOIN role_permissions rp ON ur.id = rp.role_id
JOIN permissions p ON rp.permission_id = p.id
WHERE u.email = 'user@example.com';
```

## Security Best Practices

### Token Management

- **Access Token**: 15 minutes expiration (short-lived)
- **Refresh Token**: 7 days expiration (long-lived)
- **Storage**: Access token in localStorage, refresh token in httpOnly cookies
- **Refresh**: Automatic refresh 2 minutes before expiration

### Password Security

- **Hashing**: bcrypt with 10 salt rounds
- **Requirements**: Min 8 chars, uppercase, lowercase, number
- **Validation**: Frontend + backend validation

### API Security

- **Rate Limiting**: 5 attempts per 15 minutes on auth endpoints
- **Token Blacklist**: Revoked tokens stored until expiration
- **Audit Logging**: All auth events logged with IP and timestamp

### Frontend Security

- **XSS Protection**: React's built-in escaping
- **CSRF Protection**: SameSite cookies
- **Token Exposure**: Never log tokens in production

## Troubleshooting

### "Unauthorized" Error

**Cause**: Invalid or expired token
**Solution**: 
1. Check if token exists in localStorage
2. Try logging out and back in
3. Check backend logs for token validation errors

### "Forbidden" Error

**Cause**: User lacks required permission
**Solution**:
1. Check user's role and permissions in database
2. Verify permission is assigned to role
3. User must log out/in after permission changes

### Permissions Not Working

**Checklist**:
- [ ] Permission exists in database
- [ ] Permission assigned to user's role
- [ ] User logged out and back in (to refresh JWT)
- [ ] Backend guard applied to endpoint
- [ ] Frontend guard applied to component
- [ ] Permission name spelled correctly

### User Can't See Menu Item

**Cause**: Navigation filtering by permission
**Solution**:
1. Check `NavigationContext.tsx` for menu item permission
2. Verify user has the required permission
3. Check `hasPermission()` function in AuthContext

## Configuration

### Backend Config

**File**: `backend/src/config/auth.config.ts`

```typescript
export const authConfig = {
  tokens: {
    accessTokenExpiration: '15m',
    refreshTokenExpiration: '7d',
  },
  security: {
    bcryptRounds: 10,
    rateLimitTTL: 900,
    rateLimitMax: 5,
  },
  defaultRole: 'User',
};
```

### Frontend Config

**File**: `frontend/src/config/auth.config.ts`

```typescript
export const authConfig = {
  api: {
    baseUrl: process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001',
  },
  endpoints: {
    login: '/auth/login',
    register: '/auth/register',
    logout: '/auth/logout',
    refresh: '/auth/refresh',
    profile: '/auth/profile',
  },
  redirects: {
    afterLogin: '/dashboard',
    afterLogout: '/login',
    unauthorized: '/login',
    forbidden: '/403',
  },
};
```

## API Endpoints

### Authentication

- `POST /auth/register` - Register new user (public)
- `POST /auth/login` - Login (public)
- `POST /auth/logout` - Logout (authenticated)
- `POST /auth/refresh` - Refresh access token (public with refresh token)
- `GET /auth/profile` - Get current user profile (authenticated)
- `POST /auth/forgot-password` - Request password reset email (public)
- `POST /auth/validate-reset-token` - Validate reset token (public)
- `POST /auth/reset-password` - Reset password with token (public)

### Users

- `GET /users` - List users (requires `users:read`)
- `POST /users` - Create user (requires `users:write`)
- `GET /users/:id` - Get user (requires `users:read`)
- `PATCH /users/:id` - Update user (requires `users:write`)
- `DELETE /users/:id` - Delete user (requires `users:delete`)

### Permissions

- `GET /permissions` - List permissions (requires `permissions:read`)
- `POST /permissions` - Create permission (requires `permissions:write`)
- `POST /permissions/assign` - Assign permission to role (requires `permissions:write`)
- `DELETE /permissions/assign` - Remove permission from role (requires `permissions:write`)

## Testing

### Backend Tests

```bash
cd backend
npm test                    # Unit tests
npm run test:e2e           # E2E tests
npm run test:cov           # Coverage
```

### Frontend Tests

```bash
cd frontend
npm test                    # Unit tests
npm run test:watch         # Watch mode
```

### Manual Testing

1. **Register**: Create new user
2. **Login**: Verify token received
3. **Protected Route**: Access protected endpoint
4. **Permission Check**: Try action without permission (should fail)
5. **Token Refresh**: Wait for token to expire, verify auto-refresh
6. **Logout**: Verify token invalidated

## Migration Guide

### From Old Role System

If migrating from an old role-based system:

1. **Backup Database**
2. **Run Migration Script**: `backend/src/scripts/migrate-to-permissions.ts`
3. **Map Old Roles to New Permissions**
4. **Update Code**: Replace role checks with permission checks
5. **Test Thoroughly**

### Adding OAuth (Future)

The system is prepared for OAuth:
- `authProvider` field in User model
- `providerId` field for OAuth user ID
- Enable in config: `features.socialAuth = true`

## Password Reset via Email

### Backend Implementation

```typescript
// Request password reset
await authService.forgotPassword('user@example.com');
// Generates token, stores in DB, sends email

// Validate token
await passwordResetService.validateToken('reset-token');
// Returns true if valid and not expired

// Reset password
await authService.resetPassword('reset-token', 'newPassword123');
// Updates password, invalidates token, clears sessions
```

### Frontend Pages

- `/forgot-password` - Email input form
- `/reset-password?token=xxx` - New password form with token validation

### API Methods

```typescript
// In UserApi class
await UserApi.forgotPassword('user@example.com');
await UserApi.validateResetToken('token');
await UserApi.resetPassword('token', 'newPassword');
```

### Security Features

- Tokens expire in 1 hour
- Single-use tokens (invalidated after use)
- Rate limiting on forgot password endpoint
- All user sessions cleared on password reset
- User enumeration prevention (same response for valid/invalid emails)

### Requirements

- Email system must be configured (SMTP settings in database)
- Password reset template must exist in email templates
- Feature enabled in `authConfig.features.passwordReset`

## Two-Factor Authentication (2FA)

### Overview

Email-based two-factor authentication adds an extra layer of security by requiring users to enter a verification code sent to their email during login.

### Key Components

**Backend** (`backend/src/auth/services/`):
- `two-factor.service.ts` - Code generation, validation, rate limiting
- `two-factor-cleanup.service.ts` - Automated cleanup of expired codes

**Frontend** (`frontend/src/components/auth/`):
- `TwoFactorVerification.tsx` - 6-digit code input component
- `LoginForm.tsx` - Updated to handle 2FA flow

**Database**:
- `TwoFactorCode` model - Stores verification codes with expiration

### Backend Implementation

**Enable/Disable 2FA**:
```typescript
// Enable 2FA for user
await authService.enableTwoFactor(userId);
// Sets twoFactorEnabled = true, sends confirmation email

// Disable 2FA for user
await authService.disableTwoFactor(userId);
// Sets twoFactorEnabled = false, clears secret, sends confirmation email
```

**Login Flow with 2FA**:
```typescript
// 1. User logs in with credentials
const response = await authService.login(loginDto, request);

// 2. If 2FA enabled, returns TwoFactorRequiredResponse
if (response.requiresTwoFactor) {
  // { requiresTwoFactor: true, userId: string, message: string }
  // Frontend shows code input
}

// 3. User enters code from email
await authService.verifyTwoFactorAndLogin(userId, code, request);
// Returns AuthResponse with JWT tokens
```

**Code Generation**:
```typescript
// Generate and send code
await twoFactorService.generateAndSendCode(userId, email, ipAddress);
// Generates 6-digit code, stores in DB, sends via email
// Code expires in 10 minutes
```

**Code Validation**:
```typescript
// Validate code
const isValid = await twoFactorService.validateCode(userId, code);
// Checks expiration, attempts, rate limits
// Max 3 attempts per code
```

### Frontend Implementation

**Login Flow**:
```typescript
'use client';
import { TwoFactorVerification } from '@/components/auth/TwoFactorVerification';

function LoginForm() {
  const [twoFactorRequired, setTwoFactorRequired] = useState(null);
  
  const handleSubmit = async (credentials) => {
    const response = await UserApi.login(credentials);
    
    // Check if 2FA required
    if (response.requiresTwoFactor) {
      setTwoFactorRequired(response);
      return;
    }
    
    // Normal login flow
    await login(credentials);
  };
  
  // Show 2FA verification if required
  if (twoFactorRequired) {
    return (
      <TwoFactorVerification
        userId={twoFactorRequired.userId}
        onSuccess={handleSuccess}
        onCancel={handleCancel}
      />
    );
  }
  
  return <LoginFormUI />;
}
```

**2FA Settings**:
```typescript
import { ProfileApi } from '@/lib/api';

// Get 2FA status
const status = await ProfileApi.getTwoFactorStatus();
// { enabled: boolean, verifiedAt?: string }

// Enable 2FA
await ProfileApi.enableTwoFactor();

// Disable 2FA
await ProfileApi.disableTwoFactor();
```

**2FA Verification Component**:
```typescript
<TwoFactorVerification
  userId="user-id"
  onSuccess={() => router.push('/dashboard')}
  onCancel={() => setTwoFactorRequired(null)}
/>
```

Features:
- 6-digit code input with auto-advance
- Paste support for codes
- Resend code with 60-second cooldown
- Real-time validation
- Error handling

### API Endpoints

**Authentication**:
- `POST /auth/verify-2fa` - Verify code and complete login
- `POST /auth/resend-2fa` - Resend verification code

**Profile Settings**:
- `GET /profile/two-factor/status` - Get 2FA status
- `POST /profile/two-factor/enable` - Enable 2FA (authenticated)
- `POST /profile/two-factor/disable` - Disable 2FA (authenticated)

### Security Features

**Rate Limiting**:
- 3 code requests per 10 minutes per user
- 3 verification attempts per code
- 5 failed attempts = 15-minute account lockout

**Code Security**:
- Cryptographically secure random generation
- 10-minute expiration
- Single-use codes (invalidated after verification)
- Automatic invalidation when generating new codes

**Audit Logging**:
- All 2FA events logged with IP address
- Enable/disable actions logged
- Failed verification attempts tracked

**Automated Cleanup**:
- Hourly cleanup of expired/verified codes
- Daily cleanup of codes older than 7 days
- Manual cleanup method for testing

### Database Schema

```prisma
model User {
  twoFactorEnabled    Boolean   @default(false) @map("two_factor_enabled")
  twoFactorSecret     String?   @map("two_factor_secret")
  twoFactorVerifiedAt DateTime? @map("two_factor_verified_at")
}

model TwoFactorCode {
  id        String   @id @default(cuid())
  userId    String   @map("user_id")
  code      String
  expiresAt DateTime @map("expires_at")
  verified  Boolean  @default(false)
  attempts  Int      @default(0)
  createdAt DateTime @default(now()) @map("created_at")
  
  user User @relation(fields: [userId], references: [id], onDelete: Cascade)
  
  @@index([userId])
  @@index([code])
  @@map("two_factor_codes")
}
```

### Email Templates

**Required Template**: `two-factor-verification`

Variables:
- `{code}` - 6-digit verification code
- `{userName}` - User's name
- `{expiresIn}` - Expiration time (e.g., "10 minutes")
- `{ipAddress}` - Login IP address
- `{appName}` - Application name

**Additional Templates**:
- `two-factor-enabled` - Confirmation when 2FA is enabled
- `two-factor-disabled` - Confirmation when 2FA is disabled

### Configuration

**Backend** (`backend/src/auth/services/two-factor.service.ts`):
```typescript
private readonly CODE_EXPIRATION_MINUTES = 10;
private readonly MAX_ATTEMPTS_PER_CODE = 3;
private readonly MAX_FAILED_ATTEMPTS = 5;
private readonly LOCKOUT_DURATION_MINUTES = 15;
private readonly MAX_CODE_REQUESTS_PER_WINDOW = 3;
private readonly CODE_REQUEST_WINDOW_MINUTES = 10;
```

**Frontend** (`frontend/src/components/auth/TwoFactorVerification.tsx`):
```typescript
const RESEND_COOLDOWN_SECONDS = 60;
const CODE_LENGTH = 6;
```

### User Experience

**Login Flow**:
1. User enters email and password
2. If 2FA enabled, login form is replaced with code input
3. User receives email with 6-digit code
4. User enters code (auto-advances between digits)
5. On success, user is logged in and redirected
6. On failure, error shown and code cleared

**Settings Flow**:
1. User navigates to Security Settings
2. Toggle switch to enable/disable 2FA
3. Confirmation dialog appears
4. On confirm, 2FA status updated
5. Confirmation email sent
6. In-app notification shown

### Testing

**Manual Testing**:
```bash
# 1. Enable 2FA for a user
# 2. Log out
# 3. Log in with credentials
# 4. Verify code input appears
# 5. Check email for code
# 6. Enter code
# 7. Verify successful login
```

**Test Rate Limiting**:
```bash
# 1. Request code 3 times quickly
# 2. Verify 4th request is blocked
# 3. Wait 10 minutes
# 4. Verify can request again
```

**Test Code Expiration**:
```bash
# 1. Request code
# 2. Wait 11 minutes
# 3. Try to verify code
# 4. Verify "expired" error
```

### Troubleshooting

**Code Not Received**:
- Check email system is enabled
- Verify email template exists
- Check email logs for delivery status
- Verify user's email address is correct

**"Too Many Attempts" Error**:
- User exceeded rate limits
- Wait for lockout period to expire (15 minutes)
- Or manually clear failed attempts in database

**Code Always Invalid**:
- Check code hasn't expired (10 minutes)
- Verify code matches exactly (6 digits)
- Check attempts counter hasn't exceeded limit
- Verify code exists in database

**2FA Not Working After Enable**:
- User must log out and log back in
- Check `twoFactorEnabled` field in database
- Verify email system is configured
- Check 2FA template exists

### Requirements

- Email system must be configured and enabled
- Email template `two-factor-verification` must exist
- ScheduleModule must be imported (for cleanup jobs)
- User must have valid email address

### Best Practices

**Security**:
- Always use HTTPS in production
- Never log verification codes
- Implement rate limiting on all endpoints
- Monitor failed verification attempts
- Send security notifications for 2FA changes

**User Experience**:
- Clear error messages
- Show code expiration time
- Provide resend option with cooldown
- Auto-advance between input fields
- Support paste for codes

**Monitoring**:
- Track 2FA adoption rate
- Monitor failed verification attempts
- Alert on unusual patterns
- Log all 2FA events for audit

### Migration

**Enabling 2FA for Existing Users**:
```sql
-- Enable 2FA for specific user
UPDATE users 
SET two_factor_enabled = true 
WHERE email = 'user@example.com';

-- Enable 2FA for all admins
UPDATE users 
SET two_factor_enabled = true 
WHERE role_id IN (
  SELECT id FROM user_roles WHERE name IN ('Admin', 'Super Admin')
);
```

**Bulk Operations**:
```typescript
// Enable 2FA for all users in a role
const adminRole = await prisma.userRole.findUnique({
  where: { name: 'Admin' },
  include: { users: true }
});

for (const user of adminRole.users) {
  await authService.enableTwoFactor(user.id);
}
```

## Resources

- **Spec Files**: `.kiro/specs/jwt-authentication-system/`
- **API Docs**: `.kiro/specs/jwt-authentication-system/API_DOCUMENTATION.md`
- **Permission Naming**: `.kiro/specs/jwt-authentication-system/PERMISSION_NAMING.md`
- **Seed Data**: `backend/prisma/seed-data/auth.seed.ts`

## Quick Reference

### Permission Check (Backend)
```typescript
@Permissions('resource:action')
```

### Permission Check (Frontend)
```typescript
<PermissionGuard permission="resource:action">
```

### Get Current User (Backend)
```typescript
@CurrentUser() user
```

### Get Current User (Frontend)
```typescript
const { user } = useAuth();
```

### Check Permission (Frontend)
```typescript
const { hasPermission } = useAuth();
if (hasPermission('resource:action')) { }
```
