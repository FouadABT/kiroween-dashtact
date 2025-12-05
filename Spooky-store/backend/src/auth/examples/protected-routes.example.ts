/**
 * Example Controller demonstrating usage of @Permissions() and @Roles() decorators
 * 
 * This file serves as documentation and reference for implementing
 * permission-based and role-based access control in your controllers.
 */

import { Controller, Get, Post, Delete, UseGuards } from '@nestjs/common';
import { JwtAuthGuard } from '../guards/jwt-auth.guard';
import { PermissionsGuard } from '../guards/permissions.guard';
import { RolesGuard } from '../guards/roles.guard';
import { Permissions } from '../decorators/permissions.decorator';
import { Roles } from '../decorators/roles.decorator';
import { Public } from '../decorators/public.decorator';
import { CurrentUser } from '../decorators/current-user.decorator';

/**
 * Example 1: Basic Permission-Based Access Control
 * 
 * Apply guards at the controller level to protect all routes
 */
@Controller('posts')
@UseGuards(JwtAuthGuard, PermissionsGuard)
export class PostsController {
  /**
   * Requires 'posts:read' permission
   * Users with this permission can view posts
   */
  @Get()
  @Permissions('posts:read')
  findAll() {
    return { message: 'List all posts' };
  }

  /**
   * Requires 'posts:write' permission
   * Users with this permission can create posts
   */
  @Post()
  @Permissions('posts:write')
  create() {
    return { message: 'Create a post' };
  }

  /**
   * Requires 'posts:delete' permission
   * Users with this permission can delete posts
   */
  @Delete(':id')
  @Permissions('posts:delete')
  remove() {
    return { message: 'Delete a post' };
  }
}

/**
 * Example 2: Role-Based Access Control
 * 
 * Use @Roles() decorator to restrict access by role
 */
@Controller('admin')
@UseGuards(JwtAuthGuard, RolesGuard)
export class AdminController {
  /**
   * Only users with 'Admin' role can access
   */
  @Get('dashboard')
  @Roles('Admin')
  getDashboard() {
    return { message: 'Admin dashboard' };
  }

  /**
   * Users with either 'Admin' or 'Manager' role can access
   */
  @Get('reports')
  @Roles('Admin', 'Manager')
  getReports() {
    return { message: 'View reports' };
  }
}

/**
 * Example 3: Multiple Permissions
 * 
 * Require multiple permissions for a single route
 * User must have ALL specified permissions
 */
@Controller('sensitive-data')
@UseGuards(JwtAuthGuard, PermissionsGuard)
export class SensitiveDataController {
  /**
   * Requires both 'data:read' AND 'data:export' permissions
   */
  @Get('export')
  @Permissions('data:read', 'data:export')
  exportData() {
    return { message: 'Export sensitive data' };
  }
}

/**
 * Example 4: Combining Guards and Public Routes
 * 
 * Mix protected and public routes in the same controller
 */
@Controller('articles')
@UseGuards(JwtAuthGuard, PermissionsGuard)
export class ArticlesController {
  /**
   * Public route - no authentication required
   * Use @Public() decorator to bypass JWT guard
   */
  @Get()
  @Public()
  findAllPublic() {
    return { message: 'Public articles list' };
  }

  /**
   * Protected route - requires authentication and permission
   */
  @Post()
  @Permissions('articles:write')
  create() {
    return { message: 'Create article (authenticated)' };
  }
}

/**
 * Example 5: Using CurrentUser Decorator
 * 
 * Access the authenticated user in your route handlers
 */
@Controller('profile')
@UseGuards(JwtAuthGuard)
export class ProfileController {
  /**
   * Get current user's profile
   * @CurrentUser() injects the authenticated user
   */
  @Get()
  getProfile(@CurrentUser() user: any) {
    return {
      message: 'User profile',
      user: {
        id: user.id,
        email: user.email,
        role: user.roleName,
      },
    };
  }

  /**
   * Update own profile - requires 'profile:write' permission
   */
  @Post()
  @UseGuards(PermissionsGuard)
  @Permissions('profile:write')
  updateProfile(@CurrentUser() user: any) {
    return {
      message: 'Update profile',
      userId: user.id,
    };
  }
}

/**
 * Example 6: Wildcard Permissions
 * 
 * Users with wildcard permissions automatically have access
 * - '*:*' grants all permissions (super admin)
 * - 'users:*' grants all actions on users resource
 */
@Controller('users')
@UseGuards(JwtAuthGuard, PermissionsGuard)
export class UsersController {
  /**
   * Requires 'users:read' permission
   * Also granted by 'users:*' or '*:*'
   */
  @Get()
  @Permissions('users:read')
  findAll() {
    return { message: 'List users' };
  }

  /**
   * Requires 'users:delete' permission
   * Also granted by 'users:*' or '*:*'
   */
  @Delete(':id')
  @Permissions('users:delete')
  remove() {
    return { message: 'Delete user' };
  }
}

/**
 * Example 7: Method-Level Guards
 * 
 * Apply guards to specific methods instead of the entire controller
 */
@Controller('mixed')
export class MixedController {
  /**
   * Public route - no guards
   */
  @Get('public')
  getPublic() {
    return { message: 'Public endpoint' };
  }

  /**
   * Protected by JWT only
   */
  @Get('authenticated')
  @UseGuards(JwtAuthGuard)
  getAuthenticated() {
    return { message: 'Authenticated endpoint' };
  }

  /**
   * Protected by JWT and requires permission
   */
  @Get('authorized')
  @UseGuards(JwtAuthGuard, PermissionsGuard)
  @Permissions('special:access')
  getAuthorized() {
    return { message: 'Authorized endpoint' };
  }
}

/**
 * USAGE SUMMARY:
 * 
 * 1. @Permissions() Decorator:
 *    - Specify required permissions: @Permissions('resource:action')
 *    - Multiple permissions: @Permissions('perm1', 'perm2')
 *    - User must have ALL specified permissions
 *    - Requires PermissionsGuard to be active
 * 
 * 2. @Roles() Decorator:
 *    - Specify required roles: @Roles('Admin')
 *    - Multiple roles: @Roles('Admin', 'Manager')
 *    - User must have ONE of the specified roles
 *    - Requires RolesGuard to be active
 * 
 * 3. @Public() Decorator:
 *    - Mark routes as public (bypass JWT authentication)
 *    - Use when controller has JwtAuthGuard but specific routes should be public
 * 
 * 4. @CurrentUser() Decorator:
 *    - Inject authenticated user into route handler
 *    - Contains user data from JWT payload
 * 
 * 5. Guard Order Matters:
 *    - Always apply JwtAuthGuard first
 *    - Then apply PermissionsGuard or RolesGuard
 *    - Example: @UseGuards(JwtAuthGuard, PermissionsGuard)
 * 
 * 6. Permission Naming Convention:
 *    - Format: {resource}:{action}
 *    - Examples: 'users:read', 'posts:write', 'settings:admin'
 *    - Wildcards: '*:*' (all), 'users:*' (all user actions)
 */
