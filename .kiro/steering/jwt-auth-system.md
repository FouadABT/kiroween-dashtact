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
- `auth.controller.ts` - Auth endpoints (login, register, refresh, logout, profile)
- `jwt-auth.guard.ts` - JWT validation guard
- `permissions.guard.ts` - Permission checking guard
- `roles.guard.ts` - Role checking guard

**Frontend** (`frontend/src/`):
- `contexts/AuthContext.tsx` - Global auth state management
- `components/auth/` - Auth guards and components
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
