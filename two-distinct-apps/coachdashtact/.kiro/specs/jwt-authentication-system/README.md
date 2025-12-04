# JWT Authentication System

A production-ready, full-stack JWT authentication system with role-based access control (RBAC) and flexible permission management for NestJS and Next.js applications.

## 🚀 Features

### Core Authentication
- ✅ **JWT Token Authentication** - Secure access and refresh tokens
- ✅ **User Registration & Login** - Complete authentication flow
- ✅ **Token Refresh Mechanism** - Seamless session management
- ✅ **Secure Password Hashing** - bcrypt with configurable salt rounds
- ✅ **Token Blacklisting** - Revoke tokens before expiration

### Authorization & Permissions
- ✅ **Role-Based Access Control (RBAC)** - Flexible role system
- ✅ **Granular Permissions** - Resource-level access control
- ✅ **Permission Guards** - Backend and frontend protection
- ✅ **Default Roles** - Pre-configured Admin, Manager, and User roles
- ✅ **Custom Permissions** - Easy to add application-specific permissions

### Security Features
- ✅ **Rate Limiting** - Prevent brute force attacks
- ✅ **Audit Logging** - Track authentication events
- ✅ **CORS Protection** - Configurable cross-origin requests
- ✅ **Input Validation** - Comprehensive request validation
- ✅ **Password Requirements** - Configurable complexity rules

### Developer Experience
- ✅ **Configuration Over Code** - Easy customization via config files
- ✅ **TypeScript** - Full type safety across stack
- ✅ **Comprehensive Documentation** - API docs, guides, and examples
- ✅ **Debug Tools** - Development-only auth debug panel
- ✅ **Seeded Data** - Default roles and permissions ready to use
- ✅ **Migration Scripts** - Tools for upgrading existing systems

### Frontend Features
- ✅ **Auth Context** - Global authentication state management
- ✅ **Route Guards** - Protect pages and components
- ✅ **Permission Hooks** - Convenient React hooks for auth checks
- ✅ **Auto Token Refresh** - Automatic token renewal
- ✅ **Login/Signup Pages** - Pre-built authentication UI
- ✅ **Loading States** - Polished user experience

### Extensibility
- 📦 **Email Verification** - Ready to enable
- 📦 **Two-Factor Authentication (2FA)** - Prepared for implementation
- 📦 **OAuth/Social Login** - Google, GitHub support ready
- 📦 **Session Management** - Track and manage user sessions
- 📦 **Password Reset** - Email-based password recovery

---

## 📋 Table of Contents

- [Quick Start](#quick-start)
- [Architecture](#architecture)
- [Configuration](#configuration)
- [Usage Examples](#usage-examples)
- [API Reference](#api-reference)
- [Customization](#customization)
- [Security](#security)
- [Troubleshooting](#troubleshooting)
- [Documentation](#documentation)

---

## 🏁 Quick Start

### Prerequisites

- Node.js 18+ and npm
- PostgreSQL database
- NestJS backend (already set up)
- Next.js frontend (already set up)

### 1. Set Up Environment Variables

**Backend** (`backend/.env`):
```env
DATABASE_URL="postgresql://postgres:postgres@localhost:5432/myapp_dev?schema=public"
JWT_SECRET="change-this-to-a-secure-random-string"
JWT_ACCESS_EXPIRATION="15m"
JWT_REFRESH_EXPIRATION="7d"
PORT=3001
NODE_ENV=development
```

**Frontend** (`frontend/.env.local`):
```env
NEXT_PUBLIC_API_URL=http://localhost:3001
NEXT_PUBLIC_APP_URL=http://localhost:3000
NODE_ENV=development
```

### 2. Run Database Migrations

```bash
cd backend
npm run prisma:migrate
npm run prisma:generate
```

### 3. Seed Default Roles and Permissions

```bash
cd backend
npm run prisma:seed
```

This creates:
- **Super Admin** role with full access (`*:*`)
- **Admin** role with comprehensive permissions
- **Manager** role with limited permissions
- **User** role with basic access
- All standard permissions (users, roles, permissions, settings)

### 4. Start the Servers

**Backend:**
```bash
cd backend
npm run start:dev
```

**Frontend:**
```bash
cd frontend
npm run dev
```

### 5. Test the System

1. Navigate to `http://localhost:3000/signup`
2. Create a new account
3. You'll be automatically logged in and redirected to the dashboard
4. Try accessing different features based on your role

**Default Test Users** (if seeded):
- Admin: `admin@example.com` / `Admin123!`
- User: `user@example.com` / `User123!`

---

## 🏗️ Architecture

### System Overview

```
┌─────────────────────────────────────────────────────────────┐
│                    Frontend (Next.js)                        │
│  ┌────────────┐  ┌────────────┐  ┌────────────┐           │
│  │ Auth       │  │ Route      │  │ Permission │           │
│  │ Context    │  │ Guards     │  │ Components │           │
│  └─────┬──────┘  └─────┬──────┘  └─────┬──────┘           │
│        │                │                │                   │
│        └────────────────┴────────────────┘                   │
│                         │                                    │
│                  ┌──────▼──────┐                            │
│                  │ API Client  │                            │
│                  └──────┬──────┘                            │
└─────────────────────────┼────────────────────────────────────┘
                          │ HTTP + JWT
┌─────────────────────────▼────────────────────────────────────┐
│                    Backend (NestJS)                          │
│  ┌────────────┐  ┌────────────┐  ┌────────────┐           │
│  │ Auth       │  │ JWT        │  │ Guards &   │           │
│  │ Module     │  │ Strategy   │  │ Decorators │           │
│  └─────┬──────┘  └─────┬──────┘  └─────┬──────┘           │
│        │                │                │                   │
│        └────────────────┴────────────────┘                   │
│                         │                                    │
│                  ┌──────▼──────┐                            │
│                  │   Prisma    │                            │
│                  └──────┬──────┘                            │
└─────────────────────────┼────────────────────────────────────┘
                          │
                   ┌──────▼──────┐
                   │ PostgreSQL  │
                   └─────────────┘
```

### Key Components

#### Backend
- **Auth Module** - Registration, login, token management
- **Permissions Module** - Permission and role management
- **JWT Strategy** - Token validation
- **Guards** - JwtAuthGuard, PermissionsGuard, RolesGuard
- **Decorators** - @Public(), @Permissions(), @Roles(), @CurrentUser()

#### Frontend
- **AuthContext** - Global authentication state
- **Route Guards** - AuthGuard, PermissionGuard, RoleGuard
- **Hooks** - useAuth, usePermission, useRole, useRequireAuth
- **Pages** - Login, Signup, Access Denied
- **Components** - Auth forms, loading states, error messages

---

## ⚙️ Configuration

### Backend Configuration

Edit `backend/src/config/auth.config.ts`:

```typescript
export const authConfig = {
  // Token settings
  tokens: {
    accessTokenExpiration: '15m',
    refreshTokenExpiration: '7d',
  },
  
  // Password requirements
  password: {
    minLength: 8,
    requireUppercase: true,
    requireLowercase: true,
    requireNumbers: true,
    requireSpecialChars: false,
  },
  
  // Security settings
  security: {
    bcryptRounds: 10,
    rateLimitTTL: 900,
    rateLimitMax: 5,
    enableAuditLogging: true,
  },
  
  // Default role for new users
  defaultRole: 'USER',
};
```

### Frontend Configuration

Edit `frontend/src/config/auth.config.ts`:

```typescript
export const authConfig = {
  // Redirect paths
  redirects: {
    afterLogin: '/dashboard',
    afterLogout: '/login',
    unauthorized: '/login',
    forbidden: '/403',
  },
  
  // Token refresh
  tokenRefresh: {
    enabled: true,
    refreshBeforeExpiry: 120, // seconds
  },
  
  // UI features
  ui: {
    showPasswordStrength: true,
    showRememberMe: true,
    enableDebugPanel: process.env.NODE_ENV === 'development',
  },
};
```

See [Environment Variables Documentation](./ENVIRONMENT_VARIABLES.md) for all configuration options.

---

## 💡 Usage Examples

### Backend - Protecting Endpoints

#### Basic Protection

```typescript
import { Controller, Get, Post, UseGuards } from '@nestjs/common';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { PermissionsGuard } from '../auth/guards/permissions.guard';
import { Permissions } from '../auth/decorators/permissions.decorator';
import { CurrentUser } from '../auth/decorators/current-user.decorator';

@Controller('posts')
@UseGuards(JwtAuthGuard, PermissionsGuard)
export class PostsController {
  
  // Requires authentication only
  @Get()
  @Permissions('posts:read')
  async findAll() {
    return this.postsService.findAll();
  }
  
  // Requires specific permission
  @Post()
  @Permissions('posts:write')
  async create(@Body() dto: CreatePostDto) {
    return this.postsService.create(dto);
  }
  
  // Access current user
  @Get('my-posts')
  async getMyPosts(@CurrentUser() user) {
    return this.postsService.findByUser(user.id);
  }
}
```

#### Public Endpoints

```typescript
import { Public } from '../auth/decorators/public.decorator';

@Controller('public')
@UseGuards(JwtAuthGuard) // Applied to controller
export class PublicController {
  
  @Get('info')
  @Public() // This endpoint is public
  getInfo() {
    return { message: 'Public information' };
  }
}
```

#### Role-Based Protection

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

### Frontend - Protecting Routes and Components

#### Route Protection

```typescript
// app/dashboard/layout.tsx
import { AuthGuard } from '@/components/auth/AuthGuard';

export default function DashboardLayout({ children }) {
  return (
    <AuthGuard redirectTo="/login">
      {children}
    </AuthGuard>
  );
}
```

#### Permission-Based UI

```typescript
// app/posts/page.tsx
import { PermissionGuard } from '@/components/auth/PermissionGuard';
import { usePermission } from '@/hooks/usePermission';

export default function PostsPage() {
  const canCreatePost = usePermission('posts:write');
  const canPublish = usePermission('posts:publish');
  
  return (
    <div>
      <h1>Posts</h1>
      
      {/* Conditional rendering */}
      {canCreatePost && (
        <button>Create New Post</button>
      )}
      
      {/* Component guard */}
      <PermissionGuard permission="posts:read">
        <PostsList />
      </PermissionGuard>
      
      {/* Multiple permissions */}
      <PermissionGuard 
        permission={['posts:write', 'posts:publish']}
        requireAll={true}
      >
        <PublishButton />
      </PermissionGuard>
    </div>
  );
}
```

#### Using Auth Context

```typescript
'use client';

import { useAuth } from '@/contexts/AuthContext';

export default function ProfilePage() {
  const { user, logout, hasPermission } = useAuth();
  
  const handleLogout = async () => {
    await logout();
  };
  
  return (
    <div>
      <h1>Welcome, {user?.name}</h1>
      <p>Role: {user?.role.name}</p>
      
      {hasPermission('users:write') && (
        <p>You can manage users</p>
      )}
      
      <button onClick={handleLogout}>Logout</button>
    </div>
  );
}
```

#### Convenience Hooks

```typescript
import { useRequireAuth } from '@/hooks/useRequireAuth';
import { useRequirePermission } from '@/hooks/useRequirePermission';

export default function AdminPage() {
  // Redirects to login if not authenticated
  const { isLoading } = useRequireAuth();
  
  // Redirects to 403 if missing permission
  const { hasAccess } = useRequirePermission('admin:access');
  
  if (isLoading) return <Loading />;
  
  return <AdminDashboard />;
}
```

---

## 📚 API Reference

### Authentication Endpoints

| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| POST | `/auth/register` | Public | Register new user |
| POST | `/auth/login` | Public | Login user |
| POST | `/auth/refresh` | Public | Refresh access token |
| POST | `/auth/logout` | Required | Logout user |
| GET | `/auth/profile` | Required | Get current user profile |

### Permission Endpoints

| Method | Endpoint | Permission | Description |
|--------|----------|------------|-------------|
| GET | `/permissions` | `permissions:read` | List all permissions |
| POST | `/permissions` | `permissions:write` | Create permission |
| GET | `/permissions/:id` | `permissions:read` | Get permission |
| PATCH | `/permissions/:id` | `permissions:write` | Update permission |
| DELETE | `/permissions/:id` | `permissions:write` | Delete permission |
| POST | `/permissions/assign` | `permissions:write` | Assign permission to role |
| DELETE | `/permissions/assign` | `permissions:write` | Remove permission from role |
| GET | `/permissions/role/:roleId` | `permissions:read` | Get role permissions |

See [API Documentation](./API_DOCUMENTATION.md) for complete API reference with request/response examples.

---

## 🎨 Customization

### Adding New Roles and Permissions

1. **Define permissions** in `backend/prisma/seed-data/auth.seed.ts`:

```typescript
export const DEFAULT_PERMISSIONS = [
  // ... existing permissions
  { 
    name: 'posts:write', 
    resource: 'posts', 
    action: 'write', 
    description: 'Create/edit posts' 
  },
];
```

2. **Define role** in the same file:

```typescript
export const DEFAULT_ROLES = {
  // ... existing roles
  CONTENT_EDITOR: {
    name: 'Content Editor',
    description: 'Can manage content',
    permissions: ['posts:read', 'posts:write', 'posts:publish'],
    isSystemRole: false,
  },
};
```

3. **Reseed database**:

```bash
cd backend
npm run prisma:seed
```

4. **Use in your application**:

```typescript
// Backend
@Post()
@Permissions('posts:write')
async createPost() { }

// Frontend
<PermissionGuard permission="posts:write">
  <CreatePostButton />
</PermissionGuard>
```

### Customizing Token Expiration

```typescript
// backend/src/config/auth.config.ts
tokens: {
  accessTokenExpiration: '30m',  // 30 minutes
  refreshTokenExpiration: '30d', // 30 days
}
```

### Customizing Password Requirements

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

See [Customization Guide](./CUSTOMIZATION_GUIDE.md) for detailed customization instructions.

---

## 🔒 Security

### Best Practices

1. **Change JWT_SECRET** - Use a strong, random secret in production
2. **Use HTTPS** - Always use HTTPS in production
3. **Enable Rate Limiting** - Protect against brute force attacks
4. **Audit Logging** - Monitor authentication events
5. **Strong Passwords** - Enforce password complexity requirements
6. **Token Expiration** - Use short-lived access tokens
7. **Secure Storage** - Store refresh tokens in httpOnly cookies

### Production Checklist

- [ ] Generate secure JWT_SECRET (64+ characters)
- [ ] Enable HTTPS for all communications
- [ ] Configure CORS for production domains
- [ ] Set NODE_ENV=production
- [ ] Increase bcrypt rounds to 12
- [ ] Enable rate limiting (3 attempts per 15 minutes)
- [ ] Enable audit logging
- [ ] Set up monitoring for failed auth attempts
- [ ] Configure database backups
- [ ] Test all authentication flows

### Security Features

- **bcrypt Password Hashing** - Secure password storage
- **JWT Token Signing** - Cryptographically signed tokens
- **Token Blacklisting** - Revoke compromised tokens
- **Rate Limiting** - Prevent brute force attacks
- **CORS Protection** - Control cross-origin requests
- **Input Validation** - Prevent injection attacks
- **Audit Logging** - Track security events

---

## 🐛 Troubleshooting

### Common Issues

#### "Unauthorized" Error

**Cause:** Missing or invalid token

**Solution:**
- Check if user is logged in
- Verify token is being sent in Authorization header
- Check if token has expired
- Try refreshing the token

#### "Forbidden" Error

**Cause:** Insufficient permissions

**Solution:**
- Check user's role and permissions
- Verify required permission is assigned to role
- Reseed database if permissions were recently added

#### CORS Error

**Cause:** Frontend URL not in CORS_ORIGINS

**Solution:**
```env
# backend/.env
CORS_ORIGINS="http://localhost:3000,http://localhost:3001"
```

#### Rate Limit Exceeded

**Cause:** Too many login attempts

**Solution:**
- Wait 15 minutes
- Or adjust rate limit settings in development:
```typescript
security: {
  rateLimitMax: 100, // More lenient for development
}
```

#### Database Connection Error

**Cause:** Incorrect DATABASE_URL

**Solution:**
- Verify PostgreSQL is running
- Check DATABASE_URL format
- Test connection: `npm run prisma:studio`

### Debug Tools

**Auth Debug Panel** (Development only):

The debug panel shows:
- Current user and role
- Permissions
- Token expiration
- Permission tester

Enable in `frontend/src/config/auth.config.ts`:
```typescript
ui: {
  enableDebugPanel: true,
}
```

### Getting Help

1. Check [API Documentation](./API_DOCUMENTATION.md)
2. Review [Customization Guide](./CUSTOMIZATION_GUIDE.md)
3. Check [Environment Variables](./ENVIRONMENT_VARIABLES.md)
4. Review error logs in backend console
5. Use the Auth Debug Panel in development

---

## 📖 Documentation

### Complete Documentation

- **[API Documentation](./API_DOCUMENTATION.md)** - Complete API reference with examples
- **[Customization Guide](./CUSTOMIZATION_GUIDE.md)** - How to customize the system
- **[Permission Naming Convention](./PERMISSION_NAMING.md)** - Permission naming standards
- **[Environment Variables](./ENVIRONMENT_VARIABLES.md)** - Configuration reference
- **[Design Document](./design.md)** - System architecture and design decisions
- **[Requirements](./requirements.md)** - System requirements and specifications

### Quick Links

- [Adding New Permissions](./CUSTOMIZATION_GUIDE.md#adding-new-roles-and-permissions)
- [Protecting Endpoints](./CUSTOMIZATION_GUIDE.md#protecting-endpoints)
- [Enabling Optional Features](./CUSTOMIZATION_GUIDE.md#enabling-optional-features)
- [Production Deployment](./ENVIRONMENT_VARIABLES.md#production-security-considerations)
- [Common Customization Scenarios](./CUSTOMIZATION_GUIDE.md#common-customization-scenarios)

---

## 🚀 What's Next?

### Immediate Next Steps

1. **Customize for Your App**
   - Add your application-specific permissions
   - Define custom roles
   - Customize UI branding

2. **Protect Your Endpoints**
   - Add `@Permissions()` decorators to controllers
   - Wrap frontend components with guards
   - Test permission checks

3. **Configure for Production**
   - Generate secure JWT_SECRET
   - Set up HTTPS
   - Configure environment variables
   - Enable monitoring

### Optional Features to Enable

- **Email Verification** - Verify user emails on registration
- **Two-Factor Authentication** - Add extra security layer
- **OAuth/Social Login** - Google, GitHub authentication
- **Password Reset** - Email-based password recovery
- **Session Management** - View and revoke active sessions

See [Customization Guide](./CUSTOMIZATION_GUIDE.md#enabling-optional-features) for implementation details.

---

## 📝 License

This authentication system is part of your application template and can be used and modified as needed for your project.

---

## 🤝 Contributing

This is a template system designed to be customized for your specific needs. Feel free to:

- Modify any configuration
- Add new features
- Extend functionality
- Adapt to your use case

---

## 📞 Support

For issues and questions:

1. Check the [Troubleshooting](#troubleshooting) section
2. Review the [Documentation](#documentation)
3. Check error logs in the console
4. Use the Auth Debug Panel in development

---

## ✨ Features Summary

### ✅ Implemented
- JWT authentication with refresh tokens
- Role-based access control (RBAC)
- Granular permissions system
- Frontend and backend guards
- Default roles and permissions
- Rate limiting and security features
- Audit logging
- Debug tools
- Comprehensive documentation

### 📦 Ready to Enable
- Email verification
- Two-factor authentication (2FA)
- OAuth/Social login (Google, GitHub)
- Session management
- Password reset via email

### 🔮 Future Enhancements
- Fine-grained resource-level permissions
- Permission inheritance
- Audit log viewer
- Anomaly detection
- Compliance reporting
- Passwordless authentication
- Multi-tenancy support

---

**Built with ❤️ for developers who need production-ready authentication**

Get started now: [Quick Start](#quick-start)
