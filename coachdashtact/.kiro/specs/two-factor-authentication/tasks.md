# Implementation Plan

- [x] 1. Database Schema and Models






- [x] 1.1 Extend Prisma schema for 2FA

  - Add `twoFactorSecret` field to User model (String?, nullable, encrypted storage for future TOTP support)
  - Add `twoFactorVerifiedAt` field to User model (DateTime?, nullable, tracks last successful verification)
  - Create `TwoFactorCode` model with fields: id, userId, code, expiresAt, verified, attempts, createdAt
  - Add relation from User to TwoFactorCode (one-to-many)
  - Add indexes on TwoFactorCode: userId, code, expiresAt
  - _Requirements: 1.1, 1.2, 1.3, 1.4, 1.5_


- [x] 1.2 Create and run database migration

  - Generate Prisma migration: `npm run prisma:migrate dev --name add-two-factor-authentication`
  - Verify migration creates TwoFactorCode table
  - Verify migration adds new fields to User table
  - Run `npm run prisma:generate` to update Prisma client
  - _Requirements: 10.1, 10.2_


- [x] 1.3 Create email template for 2FA verification codes

  - Add seed data for `two-factor-verification` email template in `backend/prisma/seed-data/email.seed.ts`
  - Template subject: "Your Verification Code - {{appName}}"
  - Template variables: code, userName, expiresIn, ipAddress, appName
  - HTML body with large, centered 6-digit code display
  - Include security warning not to share code
  - Include IP address for user awareness
  - Text body alternative for email clients
  - Category: SECURITY
  - _Requirements: 8.1, 8.2, 8.3, 8.4, 8.5_

- [x] 1.4 Update seed script to include 2FA email template


  - Import and execute 2FA email template seed in main seed file
  - Verify template is created when running `npm run prisma:seed`
  - _Requirements: 8.1_

- [x] 2. Backend Logic and Frontend Integration






## Phase 1 Complete: Database Schema ✅

The database schema has been successfully updated with two-factor authentication support:
- ✅ User model extended with `twoFactorSecret` and `twoFactorVerifiedAt` fields
- ✅ TwoFactorCode model exists with proper structure and indexes
- ✅ Email template for 2FA verification codes already seeded
- ✅ Frontend TypeScript types created and synced
- ✅ API client methods added for 2FA operations

**Next Steps**: Implement backend services and controllers (Task 2.1 onwards)


- [x] 2.1 Create TwoFactorService in backend

  - Create `backend/src/auth/services/two-factor.service.ts`
  - Implement `generateCode()` method - generates cryptographically secure 6-digit numeric code
  - Implement `generateAndSendCode(userId, email, ipAddress)` method - creates code, stores in DB, sends via email
  - Implement `validateCode(userId, code)` method - validates code, checks expiration, marks as verified
  - Implement `invalidateUserCodes(userId)` method - invalidates all active codes for user
  - Implement `checkRateLimit(userId)` method - enforces 3 attempts per code, 5 failed attempts = 15min lockout
  - Code expiration: 10 minutes from creation
  - Use EmailService to send verification codes
  - _Requirements: 3.1, 3.2, 3.3, 3.4, 4.1, 4.2, 4.3, 9.1, 9.2, 9.3, 9.4_


- [x] 2.2 Update AuthService with 2FA methods

  - Add `enableTwoFactor(userId)` method - sets twoFactorEnabled to true, sends confirmation email
  - Add `disableTwoFactor(userId)` method - sets twoFactorEnabled to false, clears twoFactorSecret, sends confirmation email
  - Modify `login(loginDto, request)` method - check if user has 2FA enabled after credential validation
  - Add `loginWithTwoFactor(email, password, request)` method - validates credentials, generates and sends code if 2FA enabled
  - Add `verifyTwoFactorAndLogin(userId, code, request)` method - validates code, issues JWT tokens on success
  - Return `{ requiresTwoFactor: true, userId }` response when 2FA is required
  - Log all 2FA events using AuditLoggingService
  - _Requirements: 3.5, 4.4, 5.1, 5.2, 5.3, 5.4, 5.5, 2.1, 2.2, 2.3, 2.4, 2.5_


- [x] 2.3 Create DTOs for 2FA operations

  - Create `backend/src/auth/dto/verify-two-factor.dto.ts` with userId and code fields
  - Create `backend/src/auth/dto/resend-two-factor.dto.ts` with userId field
  - Add validation decorators: @IsString, @IsNotEmpty, @Length(6,6), @Matches(/^\d{6}$/)
  - Create TypeScript interface for TwoFactorRequiredResponse
  - _Requirements: 3.5, 4.1_


- [x] 2.4 Add 2FA endpoints to AuthController

  - Modify POST `/auth/login` endpoint to return TwoFactorRequiredResponse when 2FA is required
  - Add POST `/auth/verify-2fa` endpoint - accepts userId and code, returns AuthResponse with JWT tokens
  - Add POST `/auth/resend-2fa` endpoint - accepts userId, generates and sends new code
  - Add proper error handling for invalid codes, expired codes, rate limiting
  - _Requirements: 3.5, 4.4, 4.5, 5.3_


- [x] 2.5 Create or update ProfileController with 2FA endpoints

  - Create `backend/src/profile/profile.controller.ts` if it doesn't exist
  - Add PUT `/profile/two-factor/enable` endpoint - enables 2FA for authenticated user
  - Add PUT `/profile/two-factor/disable` endpoint - disables 2FA for authenticated user
  - Add GET `/profile/two-factor/status` endpoint - returns { enabled: boolean, verifiedAt?: string }
  - Use @UseGuards(JwtAuthGuard) for authentication
  - Send confirmation emails when 2FA is enabled/disabled
  - _Requirements: 2.1, 2.2, 2.3, 2.4, 2.5_


- [x] 2.6 Create ProfileModule if needed

  - Create `backend/src/profile/profile.module.ts` if it doesn't exist
  - Import PrismaModule, PermissionsModule, EmailModule, AuthModule
  - Register ProfileController and ProfileService
  - Export ProfileService for use in other modules
  - _Requirements: 2.1_


- [x] 2.7 Create frontend API client methods for 2FA

  - Create or update `frontend/src/lib/api/auth.ts`
  - Add `enableTwoFactor()` method - PUT /profile/two-factor/enable
  - Add `disableTwoFactor()` method - PUT /profile/two-factor/disable
  - Add `getTwoFactorStatus()` method - GET /profile/two-factor/status
  - Add `verifyTwoFactorCode(userId, code)` method - POST /auth/verify-2fa
  - Add `resendTwoFactorCode(userId)` method - POST /auth/resend-2fa
  - Add proper error handling and TypeScript types
  - _Requirements: 3.5, 4.4, 5.3, 2.1, 2.2_


- [x] 2.8 Create TypeScript types for 2FA

  - Create or update `frontend/src/types/auth.ts`
  - Add TwoFactorStatus interface: { enabled: boolean; verifiedAt?: string }
  - Add TwoFactorRequiredResponse interface: { requiresTwoFactor: true; userId: string; message: string }
  - Add VerifyTwoFactorRequest interface: { userId: string; code: string }
  - Export all types for use in components
  - _Requirements: 3.5, 4.4_


- [x] 2.9 Create TwoFactorVerification component


  - Create `frontend/src/components/auth/TwoFactorVerification.tsx`
  - Implement 6-digit code input with separate boxes for each digit
  - Add auto-focus on first input
  - Add auto-advance to next input on digit entry
  - Add "Resend Code" button with 60-second cooldown timer
  - Display "Code sent to your email" message
  - Show error messages for invalid/expired codes
  - Show loading state during verification
  - Call verifyTwoFactorCode API on code completion
  - Redirect to dashboard on successful verification
  - Use shadcn/ui components (Card, Input, Button)
  - _Requirements: 7.1, 7.2, 7.3, 7.4, 7.5_

- [x] 2.10 Update Login page to handle 2FA flow


  - Update `frontend/src/app/login/page.tsx`
  - Modify login submission to handle TwoFactorRequiredResponse
  - Show TwoFactorVerification component when 2FA is required
  - Pass userId to TwoFactorVerification component
  - Hide login form when showing 2FA verification
  - Handle successful verification and redirect to dashboard
  - Show error messages for failed verification
  - _Requirements: 5.1, 5.2, 5.3, 5.4, 5.5, 7.1, 7.5_


- [x] 2.11 Create 2FA settings section in profile

  - Create or update `frontend/src/app/dashboard/settings/security/page.tsx`
  - Add "Two-Factor Authentication" section with Card component
  - Display current 2FA status (Enabled/Disabled)
  - Add Switch component to toggle 2FA
  - Show confirmation dialog when toggling 2FA
  - Display success message after enabling/disabling
  - Display error message if operation fails
  - Show description: "Verification codes will be sent to your email"
  - Use shadcn/ui components (Card, Switch, Dialog, Alert)
  - _Requirements: 6.1, 6.2, 6.3, 6.4, 6.5, 6.6_


- [x] 2.12 Add 2FA status to user profile context

  - Update AuthContext or create TwoFactorContext to store 2FA status
  - Fetch 2FA status on user login/profile load
  - Provide twoFactorEnabled boolean to components
  - Update status when user enables/disables 2FA
  - _Requirements: 6.1, 2.1_


- [x] 2.13 Add security notifications for 2FA events

  - Send in-app notification when 2FA is enabled
  - Send in-app notification when 2FA is disabled
  - Send email notification when 2FA is enabled
  - Send email notification when 2FA is disabled
  - Include security warning in notifications
  - Use existing NotificationsService
  - _Requirements: 2.5, 9.5_

- [x] 2.14 Implement rate limiting and security measures

  - Add rate limiting to code generation (3 requests per 10 minutes)
  - Add rate limiting to code verification (3 attempts per code)
  - Add account lockout after 5 failed verification attempts (15 minutes)
  - Log all 2FA events to activity log with IP address
  - Invalidate old codes when generating new ones
  - _Requirements: 9.1, 9.2, 9.3, 9.4, 9.5_

- [x] 2.15 Add cleanup job for expired 2FA codes


  - Create cron job or scheduled task to delete expired codes
  - Run cleanup daily or hourly
  - Delete codes where expiresAt < NOW() and verified = false
  - Log cleanup operations
  - _Requirements: 3.4_
