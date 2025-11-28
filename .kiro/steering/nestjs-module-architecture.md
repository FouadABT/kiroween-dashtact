---
inclusion: always
---

# NestJS Module Architecture & Dependency Injection

## Critical Rule: Module Imports for Guards

**ALWAYS import required modules when using guards in your controllers.**

### Common Guards and Their Required Modules

When using guards in any NestJS module, you MUST import the modules that provide the services those guards depend on:

```typescript
// ❌ WRONG - Missing PermissionsModule import
@Module({
  imports: [PrismaModule],
  controllers: [MyController], // Uses @Permissions() decorator
  providers: [MyService],
})
export class MyModule {}

// ✅ CORRECT - Includes PermissionsModule
@Module({
  imports: [
    PrismaModule,
    PermissionsModule, // Required for PermissionsGuard
  ],
  controllers: [MyController],
  providers: [MyService],
})
export class MyModule {}
```

### Guard Dependencies Reference

| Guard | Required Module | Provides |
|-------|----------------|----------|
| `JwtAuthGuard` | `JwtModule` | JWT validation |
| `PermissionsGuard` | `PermissionsModule` | `PermissionsService`, `AuditLoggingService` |
| `RolesGuard` | `UsersModule` | `UsersService` |

### Standard Module Import Pattern

Every new feature module should follow this pattern:

```typescript
import { Module } from '@nestjs/common';
import { PrismaModule } from '../prisma/prisma.module';
import { PermissionsModule } from '../permissions/permissions.module';
import { MyController } from './my.controller';
import { MyService } from './my.service';

@Module({
  imports: [
    PrismaModule,           // Always needed for database access
    PermissionsModule,      // Needed if using @Permissions() decorator
    // Add other required modules here
  ],
  controllers: [MyController],
  providers: [MyService],
  exports: [MyService],     // Export if other modules need this service
})
export class MyModule {}
```

### Troubleshooting Dependency Errors

If you see this error:
```
Nest can't resolve dependencies of the PermissionsGuard (Reflector, ?, AuditLoggingService)
```

**Solution**: Add `PermissionsModule` to your module's imports array.

### Module Import Checklist

When creating a new feature module, verify:

- [ ] `PrismaModule` imported (if accessing database)
- [ ] `PermissionsModule` imported (if using `@Permissions()` decorator)
- [ ] `JwtModule` imported (if using WebSocket with JWT auth)
- [ ] Any other service modules your feature depends on
- [ ] Services are exported if other modules need them

### Example: Complete Feature Module

```typescript
import { Module } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';
import { PrismaModule } from '../prisma/prisma.module';
import { PermissionsModule } from '../permissions/permissions.module';
import { NotificationsModule } from '../notifications/notifications.module';
import { MyController } from './my.controller';
import { MyService } from './my.service';
import { MyGateway } from './my.gateway';
import { authConfig } from '../config/auth.config';

@Module({
  imports: [
    PrismaModule,              // Database access
    PermissionsModule,         // Permission guards
    NotificationsModule,       // External service dependency
    JwtModule.register({       // WebSocket JWT auth
      secret: authConfig.jwt.secret,
      signOptions: { expiresIn: '15m' },
    }),
  ],
  controllers: [MyController],
  providers: [MyService, MyGateway],
  exports: [MyService, MyGateway],
})
export class MyModule {}
```

## Key Principles

1. **Explicit Dependencies**: Always declare module dependencies in imports
2. **Guard Requirements**: Guards need their service providers available
3. **Export Services**: Export services that other modules will use
4. **Circular Dependencies**: Avoid circular imports between modules
5. **Test Modules**: In tests, mock or override guards to avoid dependency issues

## Quick Reference

**Most common imports for feature modules:**
```typescript
imports: [
  PrismaModule,           // Database
  PermissionsModule,      // @Permissions() decorator
  JwtModule.register({}), // WebSocket auth
]
```

**Remember**: If your controller uses a decorator that requires a guard, that guard's dependencies must be available through module imports.
