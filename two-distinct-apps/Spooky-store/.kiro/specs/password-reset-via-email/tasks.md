# Implementation Plan

- [x] 1. Extend database schema for password reset tokens





  - Add PasswordResetToken model to Prisma schema with id, userId, token, expiresAt, isUsed, and createdAt fields
  - Add passwordResetTokens relation to User model
  - Create indexes on token, expiresAt, and userId fields for performance
  - Generate and run Prisma migration to create password_reset_tokens table
  - Verify migration applied successfully and table created in database
  - _Requirements: 10.1, 10.2, 10.3, 10.4, 10.5_

- [x] 2. Implement backend API logic and email template





  - [x] 2.1 Create DTOs for password reset operations

    - Create ForgotPasswordDto with email validation
    - Create ResetPasswordDto with token and newPassword validation
    - Create ValidateResetTokenDto with token validation
    - Add password strength validation rules (min 8 chars, uppercase, lowercase, number)
    - _Requirements: 4.2, 5.2, 7.4_
  

  - [x] 2.2 Create PasswordResetService for token management

    - Implement createResetToken method to generate secure 32-byte random token
    - Implement hashToken method using SHA-256 for secure token storage
    - Implement validateToken method to check token validity, expiration, and usage status
    - Implement markTokenAsUsed method to prevent token reuse
    - Implement invalidateUserTokens method to invalidate all user's previous tokens
    - Implement cleanupExpiredTokens method for periodic cleanup (cron job)
    - _Requirements: 1.1, 1.2, 1.3, 1.4, 1.5, 8.1, 8.2, 8.3, 8.4_
  

  - [x] 2.3 Extend AuthService with password reset methods

    - Implement forgotPassword method to validate email configuration, generate token, and send email
    - Use process.env.FRONTEND_URL to construct reset URL (works for both local and production)
    - Implement validateResetToken method to check if token is valid
    - Implement resetPassword method to validate token, update password, and invalidate sessions
    - Implement invalidateUserSessions method to blacklist all active user tokens
    - Add email configuration check before allowing password reset
    - Add user enumeration prevention with consistent response times
    - _Requirements: 2.1, 2.2, 2.3, 2.4, 2.5, 4.3, 4.4, 4.5, 5.3, 5.4, 5.5, 8.5_
  

  - [x] 2.4 Add password reset endpoints to AuthController

    - Add POST /auth/forgot-password endpoint with ForgotPasswordDto
    - Add POST /auth/validate-reset-token endpoint with ValidateResetTokenDto
    - Add POST /auth/reset-password endpoint with ResetPasswordDto
    - Mark all endpoints as @Public() for unauthenticated access
    - Add proper HTTP status codes and response types
    - _Requirements: 4.1, 4.2, 5.1, 5.2_
  
  - [x] 2.5 Create password reset email template


    - Create password-reset email template in EmailTemplate table or template service
    - Design professional HTML template with gradient header and clear CTA button
    - Include variables: userName, resetUrl, expiresIn, appName, supportEmail
    - Add security notice section with warning about expiration and single-use
    - Create plain text fallback version for email clients without HTML support
    - Add template to email template seeding data
    - _Requirements: 3.1, 3.2, 3.3, 3.4_
  

  - [x] 2.6 Implement error handling and logging

    - Add error handling for email system disabled scenario
    - Add error handling for invalid, expired, and used tokens
    - Add error handling for email send failures
    - Log all password reset attempts with user ID, timestamp, and IP address
    - Log successful password resets for security audit
    - Return user-friendly error messages without exposing system details
    - _Requirements: 2.3, 3.5, 9.2_
  
  - [ ]* 2.7 Write backend unit tests
    - Write unit tests for PasswordResetService methods (token generation, validation, cleanup)
    - Write unit tests for AuthService password reset methods
    - Write unit tests for email configuration validation
    - Write unit tests for token expiration and usage validation
    - Write unit tests for session invalidation logic
    - _Requirements: All backend requirements_
  
  - [ ]* 2.8 Write backend integration tests
    - Write e2e test for POST /auth/forgot-password endpoint
    - Write e2e test for POST /auth/validate-reset-token endpoint
    - Write e2e test for POST /auth/reset-password endpoint
    - Write e2e test for complete password reset flow
    - Write e2e test for error scenarios (expired token, used token, invalid token)
    - _Requirements: All backend requirements_


- [x] 3. Create frontend routes and UI for password reset

  - [x] 3.1 Add forgot password link to login page
    - Add "Forgot Password?" link below login form
    - Implement conditional rendering based on email system configuration
    - Style link to match login page theme using theme variables
    - Add navigation to /forgot-password route on click
    - Fetch email configuration status on login page mount
    - _Requirements: 2.5, 6.1, 6.2_
  
  - [x] 3.2 Create forgot password page (/forgot-password)
    - Create page component at frontend/src/app/forgot-password/page.tsx
    - Add email input field with validation using shadcn/ui Input component
    - Add submit button with loading state using shadcn/ui Button component
    - Implement form submission calling authApi.forgotPassword
    - Display success message using shadcn/ui Alert component after submission
    - Display error messages for API failures
    - Add "Back to Login" link for easy navigation
    - Implement email format validation before submission
    - _Requirements: 6.3, 6.4, 6.5, 9.1, 9.4_
  
  - [x] 3.3 Create reset password page (/reset-password)
    - Create page component at frontend/src/app/reset-password/page.tsx
    - Extract token from URL query parameters on page load
    - Validate token on mount by calling authApi.validateResetToken
    - Display loading state during token validation
    - Show error message for invalid or expired tokens with link to request new reset
    - Add new password input field with visibility toggle
    - Add confirm password input field with visibility toggle
    - Implement password strength indicator using shadcn/ui Progress component
    - Validate password requirements (min 8 chars, uppercase, lowercase, number)
    - Validate password confirmation matches new password
    - _Requirements: 7.1, 7.2, 7.3, 7.4, 9.2, 9.4_
  
  - [x] 3.4 Implement reset password form submission
    - Call authApi.resetPassword with token and new password on form submit
    - Display loading state during API call
    - Show success message using shadcn/ui Alert component
    - Implement auto-redirect to /login after 3 seconds on success
    - Display error messages for API failures (invalid token, weak password, etc.)
    - Disable submit button while loading or if validation fails
    - _Requirements: 7.5, 9.3, 9.4_
  
  - [x] 3.5 Add API client methods for password reset
    - Add forgotPassword method to frontend/src/lib/api/auth.ts
    - Add validateResetToken method to frontend/src/lib/api/auth.ts
    - Add resetPassword method to frontend/src/lib/api/auth.ts
    - Add isEmailSystemEnabled method to check email configuration
    - Implement proper error handling and type safety for all methods
    - Add retry logic for network errors
    - _Requirements: 4.1, 5.1, 7.1_
  
  - [x] 3.6 Style components with theme variables
    - Use shadcn/ui Card component for page containers
    - Apply theme colors (bg-background, text-foreground, border-border)
    - Ensure mobile-responsive design with Tailwind breakpoints
    - Add proper spacing and padding using Tailwind utilities
    - Implement focus states and accessibility attributes
    - Use consistent button variants (default, destructive for errors)
    - _Requirements: 9.1, 9.2, 9.3, 9.4_
  
  - [x] 3.7 Implement user feedback and error handling

    - Display clear success messages after forgot password submission
    - Display specific error messages for each validation failure
    - Show "Feature unavailable" message when email system is disabled
    - Add loading spinners during API calls
    - Implement toast notifications for important actions (optional)
    - Add countdown timer for auto-redirect after successful reset
    - _Requirements: 9.1, 9.2, 9.3, 9.4, 9.5_
  
  - [ ]* 3.8 Write frontend component tests
    - Write tests for ForgotPasswordPage component (rendering, validation, submission)
    - Write tests for ResetPasswordPage component (token validation, form submission)
    - Write tests for ForgotPasswordLink component (conditional rendering)
    - Write tests for password strength indicator
    - Write tests for error handling scenarios
    - _Requirements: All frontend requirements_
  
  - [ ]* 3.9 Perform manual testing
    - Test complete forgot password flow with valid email
    - Test forgot password with non-existent email (should show success)
    - Test reset password with valid token
    - Test reset password with expired token
    - Test reset password with used token
    - Test reset password with invalid token
    - Test password strength validation
    - Test password confirmation validation
    - Test email system disabled scenario
    - Test mobile responsiveness
    - _Requirements: All requirements_
