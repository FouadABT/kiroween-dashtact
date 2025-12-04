# Authentication Guards

This directory contains NestJS guards for protecting routes with authentication and authorization.

## Available Guards

### 1. JwtAuthGuard

Validates JWT tokens and ensures users are authenticated.

**Usage:**
```typescript
@Controller('protected')
@UseGuards(JwtAuthGuard)
export class ProtectedController {
  @Get()
  getData() {
    return { message: 'Protected data' };
  }
}
```

**Features:**
- Validates JWT token from Authorization header
- Supports `@Public()` decorator to bypass authentication
- Injects user data into request object

### 2. PermissionsGuard

Checks if authenticated users have required permissions.

**Usage:**
```typescript
@Controller('users')
@UseGuards(JwtAuthGuard, PermissionsGuard)
export class UsersController {
  @Get()
  @Permissions('users:read')
  findAll() {
    return { message: 'List users' };
  }

  @Post()
  @Permissions('users:write')
  create() {
    return { message: 'Create user' };
  }

  @Delete(':id')
  @Permissions('users:delete')
  remove() {
    return { message: 'Delete user' };
  }
}
```

**Features:**
- Requires `@Permissions()` decorator to specify required permissions
- User must have ALL specified permissions
- Supports wildcard permissions (`*:*`, `users:*`)
- Throws `ForbiddenException` if permissions are insufficient

**Multiple Permissions:**
```typescript
@Post('export')
@Permissions('data:read', 'data:export')
exportData() {
  // User must have BOTH permissions
}
```

### 3. RolesGuard

Checks if authenticated users have required roles.

**Usage:**
```typescript
@Controller('admin')
@UseGuards(JwtAuthGuard, RolesGuard)
export class AdminController {
  @Get('dashboard')
  @Roles('Admin')
  getDashboard() {
    return { message: 'Admin dashboard' };
  }

  @Get('reports')
  @Roles('Admin', 'Manager')
  getReports() {
    // User must have Admin OR Manager role
  }
}
```

**Features:**
- Requires `@Roles()` decorator to specify required roles
- User must have ONE of the specified roles
- Throws `ForbiddenException` if role is insufficient

## Guard Combinations

### Protect Entire Controller
```typescript
@Controller('posts')
@UseGuards(JwtAuthGuard, PermissionsGuard)
export class PostsController {
  // All routes require authentication
  
  @Get()
  @Permissions('posts:read')
  findAll() {}
  
  @Post()
  @Permissions('posts:write')
  create() {}
}
```

### Mix Protected and Public Routes
```typescript
@Controller('articles')
@UseGuards(JwtAuthGuard, PermissionsGuard)
export class ArticlesController {
  @Get()
  @Public()  // Bypass authentication
  findAllPublic() {}
  
  @Post()
  @Permissions('articles:write')
  create() {}  // Requires authentication and permission
}
```

### Method-Level Guards
```typescript
@Controller('mixed')
export class MixedController {
  @Get('public')
  getPublic() {}  // No guards
  
  @Get('protected')
  @UseGuards(JwtAuthGuard)
  getProtected() {}  // Authentication only
  
  @Get('authorized')
  @UseGuards(JwtAuthGuard, PermissionsGuard)
  @Permissions('special:access')
  getAuthorized() {}  // Authentication + permission
}
```

## Important Notes

### Guard Order
Always apply guards in this order:
1. `JwtAuthGuard` (authentication)
2. `PermissionsGuard` or `RolesGuard` (authorization)

```typescript
// ✅ Correct
@UseGuards(JwtAuthGuard, PermissionsGuard)

// ❌ Wrong - PermissionsGuard needs authenticated user
@UseGuards(PermissionsGuard, JwtAuthGuard)
```

### Permission vs Role Guards
- **PermissionsGuard**: Fine-grained access control (recommended)
  - More flexible
  - Easier to manage
  - Supports wildcards
  
- **RolesGuard**: Coarse-grained access control
  - Simpler for basic scenarios
  - Less flexible
  - Good for admin-only routes

### Global Guards
To apply guards globally, configure in `main.ts`:

```typescript
// Apply JWT guard globally
app.useGlobalGuards(new JwtAuthGuard(reflector));

// Use @Public() decorator to bypass
@Public()
@Get('login')
login() {}
```

## Permission Naming Convention

Follow the `{resource}:{action}` format:

**Standard Actions:**
- `read` - View/list resources
- `write` - Create/update resources
- `delete` - Delete resources
- `admin` - Full administrative access

**Examples:**
```typescript
'users:read'      // View users
'users:write'     // Create/edit users
'users:delete'    // Delete users
'users:*'         // All user operations
'settings:admin'  // Full settings access
'*:*'             // Super admin (all permissions)
```

## Error Handling

Guards throw `ForbiddenException` when access is denied:

```typescript
// 403 Forbidden responses:
{
  "statusCode": 403,
  "message": "Insufficient permissions. Required: users:delete",
  "error": "Forbidden"
}

{
  "statusCode": 403,
  "message": "Insufficient role. Required: Admin or Manager",
  "error": "Forbidden"
}
```

## Testing

See test files for examples:
- `permissions.guard.spec.ts` - PermissionsGuard tests
- `roles.guard.spec.ts` - RolesGuard tests

## Related Files

- **Decorators**: `../decorators/`
  - `@Permissions()` - Specify required permissions
  - `@Roles()` - Specify required roles
  - `@Public()` - Mark routes as public
  - `@CurrentUser()` - Inject authenticated user

- **Examples**: `../examples/protected-routes.example.ts`
  - Comprehensive usage examples
  - Best practices
  - Common patterns

## See Also

- [JWT Strategy](../strategies/jwt.strategy.ts)
- [Auth Service](../auth.service.ts)
- [Permissions Service](../../permissions/permissions.service.ts)
