# JWT Authentication System - Customization Guide

## Table of Contents
- [Overview](#overview)
- [Quick Start Customization](#quick-start-customization)
- [Configuration Files](#configuration-files)
- [Adding New Roles and Permissions](#adding-new-roles-and-permissions)
- [Protecting Endpoints](#protecting-endpoints)
- [Enabling Optional Features](#enabling-optional-features)
- [Common Customization Scenarios](#common-customization-scenarios)
- [Advanced Customization](#advanced-customization)

---

## Overview

This authentication system is designed as a **template** that you can customize for your specific application needs. The system follows a "configuration over code" philosophy, making it easy to adapt without modifying core authentication logic.

### What You Can Customize

- ✅ Token expiration times
- ✅ Password requirements
- ✅ Roles and permissions
- ✅ Rate limiting settings
- ✅ Default user role
- ✅ UI redirects and behavior
- ✅ Optional features (email verification, 2FA, OAuth)

---

## Quick Start Customization

### Step 1: Configure Authentication Settings

#### Backend Configuration

Edit `backend/src/config/auth.config.ts`:

```typescript
export const authConfig = {
  // Customize token expiration
  tokens: {
    accessTokenExpiration: '30m',  // Change from 15m to 30m
    refreshTokenExpiration: '30d', // Change from 7d to 30d
    resetTokenExpiration: '2h',    // Password reset token
  },
  
  // Customize password requirements
  password: {
    minLength: 10,              // Increase minimum length
    requireUppercase: true,
    requireLowercase: true,
    requireNumbers: true,
    requireSpecialChars: true,  // Enable special character requirement
  },
  
  // Customize security settings
  security: {
    bcryptRounds: 12,           // Increase for more security (slower)
    rateLimitTTL: 600,          // 10 minutes
    rateLimitMax: 3,            // 3 attempts
    enableAuditLogging: true,
  },
  
  // Change default role for new users
  defaultRole: 'BASIC_USER',    // Instead of 'USER'
  
  // Permission naming convention
  permissionFormat: '{resource}:{action}',
};
```

#### Frontend Configuration

Edit `frontend/src/config/auth.config.ts`:

```typescript
export const authConfig = {
  // Customize API endpoints (if you change routes)
  endpoints: {
    login: '/api/auth/login',
    register: '/api/auth/register',
    logout: '/api/auth/logout',
    refresh: '/api/auth/refresh',
    profile: '/api/auth/profile',
  },
  
  // Customize redirects
  redirects: {
    afterLogin: '/app/home',        // Change from /dashboard
    afterLogout: '/welcome',        // Change from /login
    unauthorized: '/auth/login',
    forbidden: '/access-denied',
  },
  
  // Customize token refresh
  tokenRefresh: {
    enabled: true,
    refreshBeforeExpiry: 300,       // 5 minutes before expiry
  },
  
  // Customize UI features
  ui: {
    showPasswordStrength: true,
    showRememberMe: false,          // Disable remember me checkbox
    enableDebugPanel: process.env.NODE_ENV === 'development',
  },
};
```

### Step 2: Update Environment Variables

#### Backend `.env`

```env
# JWT Configuration
JWT_SECRET=your-super-secret-key-change-this-in-production
JWT_ACCESS_EXPIRATION=30m
JWT_REFRESH_EXPIRATION=30d

# Security
BCRYPT_ROUNDS=12
RATE_LIMIT_TTL=600
RATE_LIMIT_MAX=3

# Database
DATABASE_URL="postgresql://user:password@localhost:5432/myapp"

# Server
PORT=3001
NODE_ENV=development
```

#### Frontend `.env.local`

```env
# API Configuration
NEXT_PUBLIC_API_URL=http://localhost:3001
NEXT_PUBLIC_APP_URL=http://localhost:3000

# Environment
NODE_ENV=development
```

---

## Configuration Files

### Backend Configuration Files

| File | Purpose | What to Customize |
|------|---------|-------------------|
| `backend/src/config/auth.config.ts` | Authentication settings | Token expiration, password rules, security |
| `backend/.env` | Environment variables | Secrets, database URL, ports |
| `backend/prisma/seed-data/auth.seed.ts` | Default roles & permissions | Roles, permissions, system roles |

### Frontend Configuration Files

| File | Purpose | What to Customize |
|------|---------|-------------------|
| `frontend/src/config/auth.config.ts` | Frontend auth settings | Redirects, UI features, endpoints |
| `frontend/.env.local` | Environment variables | API URL, app URL |
| `frontend/src/app/login/page.tsx` | Login page | UI, branding, layout |
| `frontend/src/app/signup/page.tsx` | Signup page | UI, branding, layout |

---

## Adding New Roles and Permissions

### Scenario: Add a "Content Editor" Role

#### Step 1: Define Permissions

Edit `backend/prisma/seed-data/auth.seed.ts`:

```typescript
export const DEFAULT_PERMISSIONS = [
  // ... existing permissions
  
  // Add new permissions for content management
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
  { 
    name: 'posts:delete', 
    resource: 'posts', 
    action: 'delete', 
    description: 'Delete posts' 
  },
  { 
    name: 'posts:publish', 
    resource: 'posts', 
    action: 'publish', 
    description: 'Publish posts' 
  },
];
```

#### Step 2: Define Role

Add to `DEFAULT_ROLES` in the same file:

```typescript
export const DEFAULT_ROLES = {
  // ... existing roles
  
  CONTENT_EDITOR: {
    name: 'Content Editor',
    description: 'Can create, edit, and publish content',
    permissions: [
      'posts:read',
      'posts:write',
      'posts:publish',
      'users:read',      // Can view users
      'profile:write',   // Can edit own profile
      'settings:read',   // Can view settings
    ],
    isSystemRole: false, // Can be modified/deleted
  },
};
```

#### Step 3: Reseed Database

```bash
cd backend
npm run prisma:seed
```

#### Step 4: Use in Your Application

**Backend - Protect Endpoint:**
```typescript
// backend/src/posts/posts.controller.ts
import { Permissions } from '../auth/decorators/permissions.decorator';

@Controller('posts')
@UseGuards(JwtAuthGuard, PermissionsGuard)
export class PostsController {
  
  @Get()
  @Permissions('posts:read')
  async findAll() {
    // Only users with posts:read permission can access
    return this.postsService.findAll();
  }
  
  @Post()
  @Permissions('posts:write')
  async create(@Body() createPostDto: CreatePostDto) {
    // Only users with posts:write permission can access
    return this.postsService.create(createPostDto);
  }
  
  @Post(':id/publish')
  @Permissions('posts:publish')
  async publish(@Param('id') id: string) {
    // Only users with posts:publish permission can access
    return this.postsService.publish(id);
  }
}
```

**Frontend - Protect UI:**
```typescript
// frontend/src/app/posts/page.tsx
import { PermissionGuard } from '@/components/auth/PermissionGuard';
import { usePermission } from '@/hooks/usePermission';

export default function PostsPage() {
  const canCreatePost = usePermission('posts:write');
  const canPublish = usePermission('posts:publish');
  
  return (
    <div>
      <h1>Posts</h1>
      
      {/* Show create button only if user has permission */}
      {canCreatePost && (
        <button>Create New Post</button>
      )}
      
      {/* Wrap entire section in permission guard */}
      <PermissionGuard permission="posts:read">
        <PostsList />
      </PermissionGuard>
      
      {/* Conditional publish button */}
      {canPublish && (
        <button>Publish</button>
      )}
    </div>
  );
}
```

---

## Protecting Endpoints

### Backend Protection

#### Method 1: Using @Permissions Decorator (Recommended)

```typescript
import { Controller, Get, Post, UseGuards } from '@nestjs/common';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { PermissionsGuard } from '../auth/guards/permissions.guard';
import { Permissions } from '../auth/decorators/permissions.decorator';

@Controller('resources')
@UseGuards(JwtAuthGuard, PermissionsGuard) // Apply to entire controller
export class ResourcesController {
  
  @Get()
  @Permissions('resources:read')
  findAll() {
    // Requires resources:read permission
  }
  
  @Post()
  @Permissions('resources:write')
  create() {
    // Requires resources:write permission
  }
  
  @Delete(':id')
  @Permissions('resources:delete')
  remove() {
    // Requires resources:delete permission
  }
}
```

#### Method 2: Using @Roles Decorator

```typescript
import { Roles } from '../auth/decorators/roles.decorator';
import { RolesGuard } from '../auth/guards/roles.guard';

@Controller('admin')
@UseGuards(JwtAuthGuard, RolesGuard)
export class AdminController {
  
  @Get('dashboard')
  @Roles('Admin', 'Super Admin')
  getDashboard() {
    // Only Admin or Super Admin can access
  }
}
```

#### Method 3: Multiple Permissions

```typescript
@Post('publish')
@Permissions('posts:write', 'posts:publish')
publishPost() {
  // Requires BOTH permissions
}
```

#### Method 4: Public Endpoints

```typescript
import { Public } from '../auth/decorators/public.decorator';

@Controller('public')
@UseGuards(JwtAuthGuard) // Applied to controller
export class PublicController {
  
  @Get('info')
  @Public() // This endpoint is public
  getInfo() {
    // No authentication required
  }
}
```

### Frontend Protection

#### Method 1: Route Protection with AuthGuard

```typescript
// frontend/src/app/dashboard/layout.tsx
import { AuthGuard } from '@/components/auth/AuthGuard';

export default function DashboardLayout({ children }) {
  return (
    <AuthGuard redirectTo="/login">
      {children}
    </AuthGuard>
  );
}
```

#### Method 2: Permission-Based Protection

```typescript
// frontend/src/app/admin/page.tsx
import { PermissionGuard } from '@/components/auth/PermissionGuard';

export default function AdminPage() {
  return (
    <PermissionGuard 
      permission="admin:access"
      fallback={<AccessDenied />}
    >
      <AdminDashboard />
    </PermissionGuard>
  );
}
```

#### Method 3: Role-Based Protection

```typescript
// frontend/src/app/management/page.tsx
import { RoleGuard } from '@/components/auth/RoleGuard';

export default function ManagementPage() {
  return (
    <RoleGuard 
      role={['Admin', 'Manager']}
      fallback={<AccessDenied />}
    >
      <ManagementDashboard />
    </RoleGuard>
  );
}
```

#### Method 4: Conditional Rendering with Hooks

```typescript
import { usePermission } from '@/hooks/usePermission';
import { useRole } from '@/hooks/useRole';

export default function MyComponent() {
  const canEdit = usePermission('posts:write');
  const isAdmin = useRole('Admin');
  
  return (
    <div>
      {canEdit && <EditButton />}
      {isAdmin && <AdminPanel />}
    </div>
  );
}
```

#### Method 5: Multiple Permissions

```typescript
import { PermissionGuard } from '@/components/auth/PermissionGuard';

<PermissionGuard 
  permission={['posts:write', 'posts:publish']}
  requireAll={true}  // Requires ALL permissions
>
  <PublishButton />
</PermissionGuard>

<PermissionGuard 
  permission={['posts:write', 'posts:publish']}
  requireAll={false}  // Requires ANY permission
>
  <EditButton />
</PermissionGuard>
```

---

## Enabling Optional Features

### Email Verification

#### Step 1: Enable in Configuration

```typescript
// backend/src/config/auth.config.ts
features: {
  emailVerification: true,
}
```

#### Step 2: Set Up Email Service

```typescript
// backend/src/email/email.service.ts
import { Injectable } from '@nestjs/common';
import * as nodemailer from 'nodemailer';

@Injectable()
export class EmailService {
  private transporter;
  
  constructor() {
    this.transporter = nodemailer.createTransport({
      host: process.env.SMTP_HOST,
      port: process.env.SMTP_PORT,
      auth: {
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASS,
      },
    });
  }
  
  async sendVerificationEmail(email: string, token: string) {
    const verificationUrl = `${process.env.APP_URL}/verify-email?token=${token}`;
    
    await this.transporter.sendMail({
      from: process.env.EMAIL_FROM,
      to: email,
      subject: 'Verify your email',
      html: `
        <h1>Email Verification</h1>
        <p>Click the link below to verify your email:</p>
        <a href="${verificationUrl}">Verify Email</a>
      `,
    });
  }
}
```

#### Step 3: Update Auth Service

```typescript
// backend/src/auth/auth.service.ts
async register(dto: RegisterDto): Promise<AuthResponse> {
  // ... existing registration logic
  
  if (authConfig.features.emailVerification) {
    const verificationToken = this.generateVerificationToken();
    await this.prisma.user.update({
      where: { id: user.id },
      data: { 
        verificationToken,
        verificationTokenExpiry: new Date(Date.now() + 24 * 60 * 60 * 1000),
      },
    });
    
    await this.emailService.sendVerificationEmail(user.email, verificationToken);
  }
  
  return authResponse;
}

async verifyEmail(token: string): Promise<void> {
  const user = await this.prisma.user.findFirst({
    where: {
      verificationToken: token,
      verificationTokenExpiry: { gt: new Date() },
    },
  });
  
  if (!user) {
    throw new BadRequestException('Invalid or expired verification token');
  }
  
  await this.prisma.user.update({
    where: { id: user.id },
    data: {
      emailVerified: true,
      verificationToken: null,
      verificationTokenExpiry: null,
    },
  });
}
```

#### Step 4: Add Frontend Verification Page

```typescript
// frontend/src/app/verify-email/page.tsx
'use client';

import { useEffect, useState } from 'use';
import { useSearchParams } from 'next/navigation';

export default function VerifyEmailPage() {
  const searchParams = useSearchParams();
  const token = searchParams.get('token');
  const [status, setStatus] = useState<'loading' | 'success' | 'error'>('loading');
  
  useEffect(() => {
    if (token) {
      fetch(`${process.env.NEXT_PUBLIC_API_URL}/auth/verify-email`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ token }),
      })
        .then(() => setStatus('success'))
        .catch(() => setStatus('error'));
    }
  }, [token]);
  
  return (
    <div>
      {status === 'loading' && <p>Verifying your email...</p>}
      {status === 'success' && <p>Email verified! You can now log in.</p>}
      {status === 'error' && <p>Verification failed. Token may be invalid or expired.</p>}
    </div>
  );
}
```

### Two-Factor Authentication (2FA)

#### Step 1: Install Dependencies

```bash
cd backend
npm install speakeasy qrcode
npm install -D @types/speakeasy @types/qrcode
```

#### Step 2: Enable in Configuration

```typescript
// backend/src/config/auth.config.ts
features: {
  twoFactorAuth: true,
}
```

#### Step 3: Add 2FA Methods to Auth Service

```typescript
import * as speakeasy from 'speakeasy';
import * as QRCode from 'qrcode';

async enableTwoFactor(userId: string): Promise<{ secret: string; qrCode: string }> {
  const secret = speakeasy.generateSecret({
    name: `MyApp (${user.email})`,
  });
  
  await this.prisma.user.update({
    where: { id: userId },
    data: { twoFactorSecret: secret.base32 },
  });
  
  const qrCode = await QRCode.toDataURL(secret.otpauth_url);
  
  return { secret: secret.base32, qrCode };
}

async verifyTwoFactor(userId: string, token: string): Promise<boolean> {
  const user = await this.prisma.user.findUnique({ where: { id: userId } });
  
  return speakeasy.totp.verify({
    secret: user.twoFactorSecret,
    encoding: 'base32',
    token,
  });
}
```

### OAuth/Social Authentication

#### Step 1: Install Passport Strategies

```bash
cd backend
npm install @nestjs/passport passport-google-oauth20 passport-github2
npm install -D @types/passport-google-oauth20 @types/passport-github2
```

#### Step 2: Enable in Configuration

```typescript
// backend/src/config/auth.config.ts
features: {
  socialAuth: true,
},

oauth: {
  google: {
    clientId: process.env.GOOGLE_CLIENT_ID,
    clientSecret: process.env.GOOGLE_CLIENT_SECRET,
    callbackURL: process.env.GOOGLE_CALLBACK_URL,
  },
  github: {
    clientId: process.env.GITHUB_CLIENT_ID,
    clientSecret: process.env.GITHUB_CLIENT_SECRET,
    callbackURL: process.env.GITHUB_CALLBACK_URL,
  },
}
```

#### Step 3: Create OAuth Strategies

```typescript
// backend/src/auth/strategies/google.strategy.ts
import { Injectable } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { Strategy, VerifyCallback } from 'passport-google-oauth20';
import { authConfig } from '../../config/auth.config';

@Injectable()
export class GoogleStrategy extends PassportStrategy(Strategy, 'google') {
  constructor() {
    super({
      clientID: authConfig.oauth.google.clientId,
      clientSecret: authConfig.oauth.google.clientSecret,
      callbackURL: authConfig.oauth.google.callbackURL,
      scope: ['email', 'profile'],
    });
  }
  
  async validate(
    accessToken: string,
    refreshToken: string,
    profile: any,
    done: VerifyCallback,
  ): Promise<any> {
    const { emails, displayName, id } = profile;
    
    const user = {
      email: emails[0].value,
      name: displayName,
      providerId: id,
      provider: 'google',
    };
    
    done(null, user);
  }
}
```

#### Step 4: Add OAuth Routes

```typescript
// backend/src/auth/auth.controller.ts
@Get('google')
@UseGuards(AuthGuard('google'))
async googleAuth() {
  // Initiates Google OAuth flow
}

@Get('google/callback')
@UseGuards(AuthGuard('google'))
async googleAuthCallback(@Req() req) {
  // Handle Google OAuth callback
  return this.authService.oauthLogin(req.user);
}
```

---

## Common Customization Scenarios

### Scenario 1: Change Token Expiration

**Use Case:** You want longer sessions for your internal tool.

**Solution:**
```typescript
// backend/src/config/auth.config.ts
tokens: {
  accessTokenExpiration: '2h',   // 2 hours instead of 15 minutes
  refreshTokenExpiration: '90d', // 90 days instead of 7 days
}
```

### Scenario 2: Stricter Password Requirements

**Use Case:** Your app handles sensitive data and needs stronger passwords.

**Solution:**
```typescript
// backend/src/config/auth.config.ts
password: {
  minLength: 12,
  requireUppercase: true,
  requireLowercase: true,
  requireNumbers: true,
  requireSpecialChars: true,  // Enable special characters
}
```

Update validation in DTO:
```typescript
// backend/src/auth/dto/register.dto.ts
@Matches(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]/, {
  message: 'Password must contain uppercase, lowercase, number, and special character'
})
password: string;
```

### Scenario 3: Custom User Roles for Your Business

**Use Case:** You're building a school management system.

**Solution:**
```typescript
// backend/prisma/seed-data/auth.seed.ts
export const DEFAULT_ROLES = {
  PRINCIPAL: {
    name: 'Principal',
    description: 'School principal with full access',
    permissions: ['*:*'],
    isSystemRole: true,
  },
  TEACHER: {
    name: 'Teacher',
    description: 'Can manage classes and students',
    permissions: [
      'classes:read', 'classes:write',
      'students:read', 'students:write',
      'grades:read', 'grades:write',
      'profile:write',
    ],
    isSystemRole: false,
  },
  STUDENT: {
    name: 'Student',
    description: 'Can view own information',
    permissions: [
      'classes:read',
      'grades:read',
      'profile:write',
    ],
    isSystemRole: false,
  },
  PARENT: {
    name: 'Parent',
    description: 'Can view child information',
    permissions: [
      'students:read',
      'grades:read',
      'profile:write',
    ],
    isSystemRole: false,
  },
};
```

### Scenario 4: Disable Rate Limiting for Development

**Use Case:** Rate limiting is annoying during development.

**Solution:**
```typescript
// backend/src/config/auth.config.ts
security: {
  rateLimitTTL: process.env.NODE_ENV === 'production' ? 900 : 0,
  rateLimitMax: process.env.NODE_ENV === 'production' ? 5 : 1000,
}
```

### Scenario 5: Custom Login Redirect Based on Role

**Use Case:** Different roles should land on different pages after login.

**Solution:**
```typescript
// frontend/src/contexts/AuthContext.tsx
const login = async (credentials: LoginCredentials) => {
  const response = await api.post('/auth/login', credentials);
  const { user, accessToken, refreshToken } = response;
  
  setUser(user);
  localStorage.setItem('accessToken', accessToken);
  
  // Custom redirect based on role
  const redirectMap = {
    'Admin': '/admin/dashboard',
    'Manager': '/management/overview',
    'User': '/app/home',
  };
  
  const redirectPath = redirectMap[user.role.name] || '/dashboard';
  router.push(redirectPath);
};
```

### Scenario 6: Add Custom Fields to User Profile

**Use Case:** You need to store additional user information.

**Solution:**

1. Update Prisma schema:
```prisma
model User {
  // ... existing fields
  phoneNumber String?
  department  String?
  jobTitle    String?
}
```

2. Run migration:
```bash
cd backend
npx prisma migrate dev --name add_user_fields
```

3. Update DTOs:
```typescript
// backend/src/auth/dto/register.dto.ts
export class RegisterDto {
  // ... existing fields
  
  @IsString()
  @IsOptional()
  phoneNumber?: string;
  
  @IsString()
  @IsOptional()
  department?: string;
}
```

4. Update frontend types:
```typescript
// frontend/src/types/auth.ts
export interface UserProfile {
  // ... existing fields
  phoneNumber?: string;
  department?: string;
  jobTitle?: string;
}
```

---

## Advanced Customization

### Custom Permission Logic

**Use Case:** You need resource-level permissions (e.g., "edit own posts only").

**Solution:**

1. Create custom guard:
```typescript
// backend/src/auth/guards/resource-owner.guard.ts
@Injectable()
export class ResourceOwnerGuard implements CanActivate {
  constructor(private prisma: PrismaClient) {}
  
  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest();
    const user = request.user;
    const resourceId = request.params.id;
    
    // Check if user owns the resource
    const resource = await this.prisma.post.findUnique({
      where: { id: resourceId },
    });
    
    return resource.authorId === user.id;
  }
}
```

2. Use in controller:
```typescript
@Patch(':id')
@UseGuards(JwtAuthGuard, ResourceOwnerGuard)
async update(@Param('id') id: string, @Body() dto: UpdatePostDto) {
  // Only the owner can update
}
```

### Custom Token Claims

**Use Case:** You need additional data in JWT tokens.

**Solution:**
```typescript
// backend/src/auth/auth.service.ts
async generateTokens(user: User): Promise<TokenPair> {
  const payload = {
    sub: user.id,
    email: user.email,
    roleId: user.roleId,
    roleName: user.role.name,
    permissions: await this.getPermissions(user.id),
    // Add custom claims
    department: user.department,
    organizationId: user.organizationId,
  };
  
  // ... generate tokens
}
```

### Multi-Tenancy Support

**Use Case:** Your app serves multiple organizations.

**Solution:**

1. Add tenant field to user:
```prisma
model User {
  // ... existing fields
  tenantId String
  tenant   Tenant @relation(fields: [tenantId], references: [id])
}

model Tenant {
  id    String @id @default(cuid())
  name  String
  users User[]
}
```

2. Create tenant guard:
```typescript
@Injectable()
export class TenantGuard implements CanActivate {
  canActivate(context: ExecutionContext): boolean {
    const request = context.switchToHttp().getRequest();
    const user = request.user;
    const tenantId = request.headers['x-tenant-id'];
    
    return user.tenantId === tenantId;
  }
}
```

---

## Best Practices

### Security Best Practices

1. **Always use HTTPS in production**
2. **Change JWT_SECRET to a strong random value**
3. **Enable rate limiting in production**
4. **Use environment variables for secrets**
5. **Implement account lockout after failed attempts**
6. **Enable audit logging**
7. **Regularly rotate JWT secrets**
8. **Use httpOnly cookies for refresh tokens**

### Development Best Practices

1. **Test permission changes thoroughly**
2. **Document custom permissions**
3. **Use the debug panel during development**
4. **Keep frontend and backend types in sync**
5. **Run migrations before seeding**
6. **Use meaningful permission names**
7. **Follow the resource:action naming convention**

### Deployment Checklist

- [ ] Update JWT_SECRET in production
- [ ] Configure CORS for production domains
- [ ] Enable HTTPS
- [ ] Set appropriate token expiration times
- [ ] Configure rate limiting
- [ ] Set up audit logging
- [ ] Test all permission scenarios
- [ ] Document custom roles and permissions
- [ ] Set up monitoring for failed auth attempts
- [ ] Configure backup strategy for user data

---

## Getting Help

### Documentation

- [API Documentation](./API_DOCUMENTATION.md)
- [Permission Naming Convention](./PERMISSION_NAMING.md)
- [Environment Variables](./ENVIRONMENT_VARIABLES.md)
- [Main README](./README.md)

### Common Issues

**Issue:** Permissions not working after adding new ones
**Solution:** Run `npm run prisma:seed` to reseed the database

**Issue:** Frontend types don't match backend
**Solution:** Regenerate Prisma client with `npm run prisma:generate`

**Issue:** Token refresh not working
**Solution:** Check that refresh token is being stored and sent correctly

**Issue:** Rate limiting too strict during development
**Solution:** Adjust `rateLimitMax` in auth.config.ts or disable for development

---

## Next Steps

After customizing your authentication system:

1. **Test thoroughly** - Test all authentication flows
2. **Update documentation** - Document your custom roles and permissions
3. **Configure production** - Set up production environment variables
4. **Deploy** - Follow the deployment checklist
5. **Monitor** - Set up monitoring for authentication events

For more advanced features, see the [Design Document](./design.md) for information about enabling email verification, 2FA, and OAuth.
