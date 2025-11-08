# Implementation Plan

- [ ] 1. Extend Prisma schema with authentication models
  - Add Permission model with resource and action fields
  - Add RolePermission junction table for many-to-many relationship
  - Add TokenBlacklist model for revoked tokens
  - Update UserRole model to include rolePermissions relation
  - Create migration and regenerate Prisma client
  - _Requirements: 1.1, 1.4, 3.4, 5.1, 5.2_
  - _Note: Prisma sync hook will automatically update backend DTOs and frontend types_

- [ ] 2. Set up backend authentication infrastructure
- [ ] 2.1 Install and configure JWT dependencies
  - Install @nestjs/jwt, @nestjs/passport, passport-jwt, bcrypt, and types
  - Configure JWT module with secret and expiration settings
  - Set up environment variables for JWT configuration
  - _Requirements: 2.2, 2.3, 8.2_

- [ ] 2.2 Create Auth module structure
  - Generate auth module, controller, and service
  - Create DTOs for register, login, and token refresh
  - Create interfaces for JWT payload and auth responses
  - _Requirements: 1.1, 2.1, 3.1_

- [ ] 2.3 Implement JWT strategy and guards
  - Create JWT strategy extending PassportStrategy
  - Implement JwtAuthGuard with public route support
  - Create @Public() decorator for marking public routes
  - Create @CurrentUser() decorator for injecting user into handlers
  - _Requirements: 4.1, 4.2, 4.3, 12.1, 12.4_

- [ ] 3. Implement core authentication service
- [ ] 3.1 Implement user registration
  - Validate registration data (email uniqueness, password strength)
  - Hash password using bcrypt with 10 salt rounds
  - Create user with default role
  - Return user profile without password
  - _Requirements: 1.1, 1.2, 1.3, 1.4, 1.5, 8.1, 8.2_

- [ ] 3.2 Implement user login
  - Validate credentials against database
  - Compare password using bcrypt
  - Generate access token (15 min expiration)
  - Generate refresh token (7 day expiration)
  - Return tokens and user profile
  - _Requirements: 2.1, 2.2, 2.3, 2.4, 2.5, 8.3, 8.4_

- [ ] 3.3 Implement token refresh mechanism
  - Validate refresh token signature and expiration
  - Check token against blacklist
  - Generate new access token
  - Return new access token
  - _Requirements: 3.1, 3.2, 3.3_

- [ ] 3.4 Implement logout functionality
  - Add refresh token to blacklist
  - Set expiration time for blacklist entry
  - Return success response
  - _Requirements: 3.3, 3.4_

- [ ]* 3.5 Write auth service unit tests
  - Test registration with valid and invalid data
  - Test login with valid and invalid credentials
  - Test token generation and validation
  - Test token refresh flow
  - Test logout and token blacklist
  - _Requirements: All from Requirement 1, 2, 3_

- [ ] 4. Implement permissions system
- [ ] 4.1 Create permissions module and service
  - Generate permissions module, controller, and service
  - Create DTOs for permission creation and assignment
  - Implement CRUD operations for permissions
  - _Requirements: 5.1, 5.2_

- [ ] 4.2 Implement role-permission management
  - Implement assignPermissionToRole method
  - Implement removePermissionFromRole method
  - Implement getRolePermissions method
  - Implement userHasPermission method with role lookup
  - _Requirements: 5.2, 5.3, 5.4, 5.5_

- [ ] 4.3 Create permission guards and decorators
  - Create @Permissions() decorator for specifying required permissions
  - Create @Roles() decorator for specifying required roles
  - Implement PermissionsGuard that checks user permissions
  - Implement RolesGuard that checks user roles
  - _Requirements: 4.4, 4.5, 12.2, 12.3_

- [ ] 4.4 Seed default permissions
  - Update seed.ts with default permissions (users:read, users:write, etc.)
  - Assign permissions to default roles (Admin gets all, User gets read-only)
  - Run seed to populate permissions
  - _Requirements: 5.1, 5.2, 5.5_

- [ ]* 4.5 Write permissions service unit tests
  - Test permission creation
  - Test role-permission assignment
  - Test user permission checking
  - Test role permission retrieval
  - _Requirements: All from Requirement 5_

- [ ] 5. Implement auth controller endpoints
- [ ] 5.1 Create registration endpoint
  - POST /auth/register endpoint
  - Validate RegisterDto
  - Call auth service register method
  - Return 201 with user and tokens
  - Handle duplicate email errors
  - _Requirements: 1.1, 1.2, 1.5_

- [ ] 5.2 Create login endpoint
  - POST /auth/login endpoint
  - Validate LoginDto
  - Call auth service login method
  - Return 200 with user and tokens
  - Handle invalid credentials errors
  - _Requirements: 2.1, 2.4, 2.5_

- [ ] 5.3 Create token refresh endpoint
  - POST /auth/refresh endpoint
  - Extract refresh token from cookie or body
  - Call auth service refresh method
  - Return new access token
  - Handle invalid token errors
  - _Requirements: 3.1, 3.2, 3.3_

- [ ] 5.4 Create logout endpoint
  - POST /auth/logout endpoint (protected)
  - Extract user from JWT
  - Call auth service logout method
  - Clear refresh token cookie
  - Return success message
  - _Requirements: 3.3, 3.4_

- [ ] 5.5 Create profile endpoint
  - GET /auth/profile endpoint (protected)
  - Extract user from JWT using @CurrentUser()
  - Return user profile with role and permissions
  - _Requirements: 4.3, 5.3_

- [ ]* 5.6 Write auth controller unit tests
  - Test all endpoints with valid data
  - Test error handling for invalid data
  - Test authentication guards
  - Test response formats
  - _Requirements: All from Requirements 1, 2, 3_

- [ ] 6. Implement security features
- [ ] 6.1 Add rate limiting to auth endpoints
  - Install @nestjs/throttler
  - Configure throttler module (5 requests per 15 minutes)
  - Apply throttler guard to auth controller
  - _Requirements: 10.2, 10.5_

- [ ] 6.2 Implement token blacklist cleanup
  - Create scheduled task to remove expired blacklist entries
  - Run cleanup daily
  - _Requirements: 3.4_

- [ ] 6.3 Add audit logging
  - Create logging service for auth events
  - Log registration attempts
  - Log login attempts (success and failure)
  - Log logout events
  - Log permission denials
  - Include timestamp, user ID, IP address, and action
  - _Requirements: 10.1, 10.3, 10.5_

- [ ]* 6.4 Write security feature tests
  - Test rate limiting behavior
  - Test blacklist cleanup
  - Test audit logging
  - _Requirements: All from Requirement 10_

- [ ] 7. Update existing endpoints with auth guards
- [ ] 7.1 Protect user management endpoints
  - Apply JwtAuthGuard to users controller
  - Add @Permissions() decorator to CRUD operations
  - Require 'users:read' for GET endpoints
  - Require 'users:write' for POST/PATCH endpoints
  - Require 'users:delete' for DELETE endpoints
  - _Requirements: 4.1, 4.2, 4.4, 4.5_

- [ ] 7.2 Protect settings endpoints
  - Apply JwtAuthGuard to settings controller
  - Add @Permissions() decorator for settings operations
  - Allow users to manage their own settings
  - Require 'settings:admin' for global settings
  - _Requirements: 4.1, 4.2, 4.4, 4.5_

- [ ]* 7.3 Write E2E tests for protected endpoints
  - Test authenticated access to protected endpoints
  - Test unauthenticated access returns 401
  - Test insufficient permissions returns 403
  - Test role-based access control
  - _Requirements: All from Requirement 4_

- [ ] 8. Create frontend authentication types
  - Create auth.ts with AuthResponse, TokenPair, LoginCredentials interfaces
  - Create permission.ts with Permission and RolePermission interfaces
  - Update user.ts with permission-related fields
  - _Requirements: 2.5, 5.3, 11.3_
  - _Note: Prisma sync hook will ensure these match backend models_

- [ ] 9. Implement frontend Auth Context
- [ ] 9.1 Create AuthContext with state management
  - Create AuthContext with user, isAuthenticated, isLoading state
  - Implement AuthProvider component
  - Create useAuth hook for consuming context
  - _Requirements: 11.1, 11.2, 11.3_

- [ ] 9.2 Implement authentication methods
  - Implement login method that calls API and stores tokens
  - Implement register method that calls API and stores tokens
  - Implement logout method that clears tokens and state
  - Implement refreshToken method for token renewal
  - _Requirements: 2.1, 2.5, 3.1, 9.2, 9.3_

- [ ] 9.3 Implement permission checking utilities
  - Implement hasPermission method
  - Implement hasRole method
  - Implement hasAnyPermission method
  - Implement hasAllPermissions method
  - _Requirements: 5.3, 7.2, 11.4, 11.5_

- [ ] 9.4 Add automatic token refresh
  - Set up interval to check token expiration
  - Automatically refresh token 2 minutes before expiration
  - Handle refresh failures with logout
  - _Requirements: 3.1, 3.2, 6.5, 11.5_

- [ ] 9.5 Add token storage and retrieval
  - Store access token in localStorage
  - Store refresh token in httpOnly cookie (via API)
  - Restore auth state on app load
  - Clear tokens on logout
  - _Requirements: 9.1, 9.2, 9.3, 9.4_

- [ ]* 9.6 Write Auth Context unit tests
  - Test login updates state correctly
  - Test logout clears state
  - Test permission checking functions
  - Test token refresh logic
  - _Requirements: All from Requirement 11_

- [ ] 10. Update API client with authentication
- [ ] 10.1 Add token management to API client
  - Add setAccessToken method
  - Add getAccessToken method
  - Add clearTokens method
  - Automatically include Authorization header in requests
  - _Requirements: 4.1, 4.2_

- [ ] 10.2 Implement automatic token refresh in API client
  - Detect 401 responses
  - Attempt token refresh
  - Retry original request with new token
  - Redirect to login if refresh fails
  - _Requirements: 3.1, 3.2, 6.5_

- [ ] 10.3 Add error handling for auth errors
  - Create AuthError class
  - Handle 401 Unauthorized errors
  - Handle 403 Forbidden errors
  - Handle rate limit errors
  - _Requirements: 10.4_

- [ ]* 10.4 Write API client unit tests
  - Test token injection in requests
  - Test automatic token refresh
  - Test error handling
  - _Requirements: All from Requirement 4_

- [ ] 11. Create frontend route guards
- [ ] 11.1 Create AuthGuard component
  - Check authentication status
  - Redirect to login if not authenticated
  - Show loading state while checking
  - Store intended destination for post-login redirect
  - _Requirements: 6.1, 6.2_

- [ ] 11.2 Create PermissionGuard component
  - Check user permissions
  - Support single or multiple permissions
  - Support requireAll or requireAny logic
  - Show access denied fallback if insufficient permissions
  - _Requirements: 6.3, 6.4, 7.2, 7.3_

- [ ] 11.3 Create RoleGuard component
  - Check user role
  - Support single or multiple roles
  - Show access denied fallback if insufficient role
  - _Requirements: 6.3, 6.4, 7.2_

- [ ]* 11.4 Write guard component tests
  - Test AuthGuard redirects unauthenticated users
  - Test PermissionGuard shows/hides content
  - Test RoleGuard shows/hides content
  - _Requirements: All from Requirements 6, 7_

- [ ] 12. Create login page
- [ ] 12.1 Create login form component
  - Email and password inputs with validation
  - "Remember me" checkbox
  - Submit button with loading state
  - Error message display
  - Link to registration page
  - Link to password reset (placeholder)
  - _Requirements: 2.1, 2.4_

- [ ] 12.2 Implement login page logic
  - Handle form submission
  - Call auth context login method
  - Redirect to dashboard or intended page on success
  - Display error messages on failure
  - _Requirements: 2.1, 2.5, 6.2_

- [ ] 12.3 Style login page
  - Use shadcn/ui components for consistent design
  - Responsive layout for mobile and desktop
  - Accessible form labels and error messages
  - _Requirements: 2.1_

- [ ]* 12.4 Write login page tests
  - Test form validation
  - Test successful login flow
  - Test error handling
  - _Requirements: All from Requirement 2_

- [ ] 13. Create signup page
- [ ] 13.1 Create registration form component
  - Email, name, password, and confirm password inputs
  - Password strength indicator
  - Form validation (email format, password requirements)
  - Submit button with loading state
  - Error message display
  - Link to login page
  - _Requirements: 1.1, 1.2, 8.1_

- [ ] 13.2 Implement signup page logic
  - Handle form submission
  - Validate password match
  - Call auth context register method
  - Redirect to dashboard on success
  - Display error messages on failure
  - _Requirements: 1.1, 1.5_

- [ ] 13.3 Style signup page
  - Use shadcn/ui components for consistent design
  - Responsive layout for mobile and desktop
  - Accessible form labels and error messages
  - _Requirements: 1.1_

- [ ]* 13.4 Write signup page tests
  - Test form validation
  - Test password strength validation
  - Test successful registration flow
  - Test error handling
  - _Requirements: All from Requirement 1_

- [ ] 14. Protect dashboard routes
- [ ] 14.1 Wrap dashboard layout with AuthGuard
  - Apply AuthGuard to dashboard layout component
  - Ensure all dashboard routes require authentication
  - _Requirements: 6.1, 6.2_

- [ ] 14.2 Add permission-based navigation
  - Update Sidebar component to check permissions
  - Hide menu items user doesn't have permission for
  - Use PermissionGuard for conditional rendering
  - _Requirements: 7.1, 7.2, 7.5_

- [ ] 14.3 Add permission checks to user management
  - Wrap user list with PermissionGuard (users:read)
  - Wrap user creation with PermissionGuard (users:write)
  - Wrap user editing with PermissionGuard (users:write)
  - Wrap user deletion with PermissionGuard (users:delete)
  - _Requirements: 7.2, 7.3, 7.4_

- [ ] 14.4 Update Header with user profile
  - Display current user name and role
  - Add logout button
  - Show user avatar (placeholder or initials)
  - _Requirements: 11.3_

- [ ]* 14.5 Write dashboard protection tests
  - Test unauthenticated access redirects
  - Test permission-based navigation
  - Test permission-based feature access
  - _Requirements: All from Requirements 6, 7_

- [ ] 15. Create access denied page
  - Create 403 access denied page component
  - Display friendly message about insufficient permissions
  - Show required permissions or role
  - Provide link back to dashboard
  - _Requirements: 6.4, 7.4_

- [ ] 16. Add loading and error states
- [ ] 16.1 Create loading components
  - Create AuthLoadingSpinner for auth operations
  - Create PageLoadingState for route transitions
  - _Requirements: 6.1, 11.2_

- [ ] 16.2 Create error components
  - Create AuthErrorMessage component
  - Create AccessDeniedMessage component
  - Style with appropriate icons and colors
  - _Requirements: 6.4, 10.4_

- [ ] 17. Update app layout with AuthProvider
  - Wrap root layout with AuthProvider
  - Ensure AuthContext is available to all pages
  - Handle initial auth state loading
  - _Requirements: 11.1, 11.2_

- [ ] 18. Create admin permission management UI (optional)
- [ ] 18.1 Create permissions list page
  - Display all permissions in a table
  - Show resource, action, and description
  - Add search and filter functionality
  - Require 'permissions:read' permission
  - _Requirements: 5.1, 5.2_

- [ ] 18.2 Create role permissions editor
  - Display role with assigned permissions
  - Allow adding/removing permissions from role
  - Show permission changes in real-time
  - Require 'permissions:write' permission
  - _Requirements: 5.2, 5.3, 5.5_

- [ ]* 18.3 Write permission management tests
  - Test permissions list display
  - Test role permission assignment
  - Test permission checks on UI
  - _Requirements: All from Requirement 5_

- [ ]* 19. Write comprehensive E2E tests
  - Test complete registration flow
  - Test complete login flow
  - Test token refresh during session
  - Test logout flow
  - Test protected route access
  - Test permission-based feature access
  - Test role-based access control
  - Test error scenarios (invalid credentials, expired tokens)
  - _Requirements: All requirements_

- [ ] 20. Documentation and final integration
- [ ] 20.1 Update API documentation
  - Document all auth endpoints
  - Include request/response examples
  - Document authentication headers
  - Document error responses
  - _Requirements: All requirements_

- [ ] 20.2 Create authentication guide
  - Document how to protect new endpoints
  - Document how to add new permissions
  - Document how to use guards in frontend
  - Provide code examples
  - _Requirements: 12.1, 12.2, 12.3, 12.5_

- [ ] 20.3 Update environment variable documentation
  - Document all required environment variables
  - Provide example .env files
  - Document production security considerations
  - _Requirements: All requirements_
