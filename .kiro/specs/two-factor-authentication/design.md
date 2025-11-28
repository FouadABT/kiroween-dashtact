# Design Document

## Overview

This document outlines the technical design for implementing Two-Factor Authentication (2FA) in the dashboard starter kit. The system will use email-based TOTP (Time-based One-Time Password) verification, leveraging the existing SMTP email service. Users can enable/disable 2FA from their profile settings, and the feature is disabled by default for all users.

## Architecture

### High-Level Flow

```
┌─────────────┐
│   User      │
└──────┬──────┘
       │
       ├─────────────────────────────────────────────┐
       │                                             │
       ▼                                             ▼
┌──────────────┐                            ┌──────────────┐
│   Profile    │                            │    Login     │
│   Settings   │                            │     Page     │
└──────┬───────┘                            └──────┬───────┘
       │                                            │
       │ Toggle 2FA                                 │ Submit Credentials
       │                                            │
       ▼                                            ▼
┌──────────────────┐                        ┌──────────────────┐
│  Update User     │                        │  Validate User   │
│  twoFactorEnabled│                        │  Credentials     │
└──────────────────┘                        └──────┬───────────┘
                                                   │
                                                   │ If 2FA Enabled
                                                   │
                                                   ▼
                                            ┌──────────────────┐
                                            │  Generate Code   │
                                            │  Send via Email  │
                                            └──────┬───────────┘
                                                   │
                                                   ▼
                                            ┌──────────────────┐
                                            │  User Enters     │
                                            │  Verification    │
                                            │  Code            │
                                            └──────┬───────────┘
                                                   │
                                                   ▼
                                            ┌──────────────────┐
                                            │  Validate Code   │
                                            │  Issue JWT       │
                                            └──────────────────┘
```

## Components and Interfaces

### 1. Database Schema Extensions

#### TwoFactorCode Model (New)
```prisma
model TwoFactorCode {
  id        String   @id @default(cuid())
  userId    String   @map("user_id")
  code      String   // 6-digit numeric code
  expiresAt DateTime @map("expires_at")
  verified  Boolean  @default(false)
  attempts  Int      @default(0)
  createdAt DateTime @default(now()) @map("created_at")
  user      User     @relation(fields: [userId], references: [id], onDelete: Cascade)

  @@index([userId])
  @@index([code])
  @@index([expiresAt])
  @@map("two_factor_codes")
}
```

#### User Model Updates
The User model already has `twoFactorEnabled` field. We need to add:
- `twoFactorSecret` (optional, for future TOTP app support)
- `twoFactorVerifiedAt` (timestamp of last successful verification)
- Relation to `TwoFactorCode` model

```prisma
model User {
  // ... existing fields ...
  twoFactorEnabled    Boolean          @default(false) @map("two_factor_enabled")
  twoFactorSecret     String?          @map("two_factor_secret") // Encrypted
  twoFactorVerifiedAt DateTime?        @map("two_factor_verified_at")
  twoFactorCodes      TwoFactorCode[]
  // ... rest of fields ...
}
```

### 2. Backend Services

#### TwoFactorService (New)
Location: `backend/src/auth/services/two-factor.service.ts`

**Responsibilities:**
- Generate 6-digit verification codes
- Store codes in database with expiration
- Validate verification codes
- Manage code attempts and rate limiting
- Invalidate old codes

**Key Methods:**
```typescript
class TwoFactorService {
  // Generate and send verification code
  async generateAndSendCode(userId: string, email: string): Promise<void>
  
  // Validate verification code
  async validateCode(userId: string, code: string): Promise<boolean>
  
  // Invalidate all user codes
  async invalidateUserCodes(userId: string): Promise<void>
  
  // Check if user has exceeded attempts
  async checkRateLimit(userId: string): Promise<boolean>
  
  // Generate random 6-digit code
  private generateCode(): string
}
```

#### AuthService Updates
Location: `backend/src/auth/auth.service.ts`

**New Methods:**
```typescript
// Enable 2FA for user
async enableTwoFactor(userId: string): Promise<void>

// Disable 2FA for user
async disableTwoFactor(userId: string): Promise<void>

// Login with 2FA verification
async loginWithTwoFactor(email: string, password: string): Promise<{ requiresTwoFactor: boolean; userId?: string }>

// Verify 2FA code and complete login
async verifyTwoFactorAndLogin(userId: string, code: string): Promise<AuthResponse>
```

#### EmailService Integration
Use existing `EmailService` to send verification codes.

**New Email Template:**
- Template slug: `two-factor-verification`
- Variables: `code`, `userName`, `expiresIn`, `ipAddress`

### 3. Backend Controllers

#### AuthController Updates
Location: `backend/src/auth/auth.controller.ts`

**New Endpoints:**
```typescript
// POST /auth/login - Modified to handle 2FA
@Post('login')
async login(@Body() loginDto: LoginDto): Promise<AuthResponse | TwoFactorRequiredResponse>

// POST /auth/verify-2fa - Verify 2FA code
@Post('verify-2fa')
async verifyTwoFactor(@Body() dto: VerifyTwoFactorDto): Promise<AuthResponse>

// POST /auth/resend-2fa - Resend verification code
@Post('resend-2fa')
async resendTwoFactorCode(@Body() dto: ResendTwoFactorDto): Promise<void>
```

#### ProfileController (New or Update Existing)
Location: `backend/src/profile/profile.controller.ts`

**New Endpoints:**
```typescript
// PUT /profile/two-factor/enable - Enable 2FA
@Put('two-factor/enable')
@UseGuards(JwtAuthGuard)
async enableTwoFactor(@Request() req): Promise<void>

// PUT /profile/two-factor/disable - Disable 2FA
@Put('two-factor/disable')
@UseGuards(JwtAuthGuard)
async disableTwoFactor(@Request() req): Promise<void>

// GET /profile/two-factor/status - Get 2FA status
@Get('two-factor/status')
@UseGuards(JwtAuthGuard)
async getTwoFactorStatus(@Request() req): Promise<{ enabled: boolean }>
```

### 4. DTOs (Data Transfer Objects)

#### VerifyTwoFactorDto
```typescript
export class VerifyTwoFactorDto {
  @IsString()
  @IsNotEmpty()
  userId: string;

  @IsString()
  @Length(6, 6)
  @Matches(/^\d{6}$/)
  code: string;
}
```

#### ResendTwoFactorDto
```typescript
export class ResendTwoFactorDto {
  @IsString()
  @IsNotEmpty()
  userId: string;
}
```

#### TwoFactorRequiredResponse
```typescript
export interface TwoFactorRequiredResponse {
  requiresTwoFactor: true;
  userId: string;
  message: string;
}
```

### 5. Frontend Components

#### Profile Settings Component
Location: `frontend/src/app/dashboard/settings/security/page.tsx`

**Features:**
- Toggle switch for 2FA
- Current status display
- Confirmation dialog on toggle
- Success/error messages

**UI Structure:**
```tsx
<Card>
  <CardHeader>
    <CardTitle>Two-Factor Authentication</CardTitle>
    <CardDescription>
      Add an extra layer of security to your account
    </CardDescription>
  </CardHeader>
  <CardContent>
    <div className="flex items-center justify-between">
      <div>
        <p>Status: {twoFactorEnabled ? 'Enabled' : 'Disabled'}</p>
        <p className="text-sm text-muted-foreground">
          Verification codes will be sent to your email
        </p>
      </div>
      <Switch
        checked={twoFactorEnabled}
        onCheckedChange={handleToggle}
      />
    </div>
  </CardContent>
</Card>
```

#### Login Flow Components

**TwoFactorVerification Component**
Location: `frontend/src/components/auth/TwoFactorVerification.tsx`

**Features:**
- 6-digit code input (styled as separate boxes)
- Auto-focus and auto-advance
- Resend code button (with 60s cooldown)
- Error messages
- Loading states

**UI Structure:**
```tsx
<Card>
  <CardHeader>
    <CardTitle>Enter Verification Code</CardTitle>
    <CardDescription>
      We've sent a 6-digit code to your email
    </CardDescription>
  </CardHeader>
  <CardContent>
    <div className="flex gap-2 justify-center">
      {[0, 1, 2, 3, 4, 5].map((index) => (
        <Input
          key={index}
          type="text"
          maxLength={1}
          className="w-12 h-12 text-center text-2xl"
          value={code[index] || ''}
          onChange={(e) => handleCodeChange(index, e.target.value)}
        />
      ))}
    </div>
    <Button
      variant="link"
      disabled={resendCooldown > 0}
      onClick={handleResend}
    >
      {resendCooldown > 0 ? `Resend in ${resendCooldown}s` : 'Resend Code'}
    </Button>
  </CardContent>
</Card>
```

**Login Page Updates**
Location: `frontend/src/app/login/page.tsx`

**Flow:**
1. User submits credentials
2. If 2FA required, show `TwoFactorVerification` component
3. User enters code
4. On success, redirect to dashboard
5. On failure, show error and allow retry

### 6. API Client

#### API Methods
Location: `frontend/src/lib/api/auth.ts`

```typescript
// Enable 2FA
export async function enableTwoFactor(): Promise<void>

// Disable 2FA
export async function disableTwoFactor(): Promise<void>

// Get 2FA status
export async function getTwoFactorStatus(): Promise<{ enabled: boolean }>

// Verify 2FA code
export async function verifyTwoFactorCode(userId: string, code: string): Promise<AuthResponse>

// Resend 2FA code
export async function resendTwoFactorCode(userId: string): Promise<void>
```

### 7. TypeScript Types

Location: `frontend/src/types/auth.ts`

```typescript
export interface TwoFactorStatus {
  enabled: boolean;
  verifiedAt?: string;
}

export interface TwoFactorRequiredResponse {
  requiresTwoFactor: true;
  userId: string;
  message: string;
}

export interface VerifyTwoFactorRequest {
  userId: string;
  code: string;
}
```

## Data Models

### TwoFactorCode
```typescript
{
  id: string;
  userId: string;
  code: string;          // 6-digit numeric code
  expiresAt: Date;       // 10 minutes from creation
  verified: boolean;     // false until verified
  attempts: number;      // Track failed attempts
  createdAt: Date;
}
```

### User (Extended)
```typescript
{
  // ... existing fields ...
  twoFactorEnabled: boolean;
  twoFactorSecret?: string;      // For future TOTP app support
  twoFactorVerifiedAt?: Date;    // Last successful verification
}
```

## Error Handling

### Backend Error Responses

```typescript
// Invalid code
{
  statusCode: 400,
  message: 'Invalid verification code',
  error: 'Bad Request'
}

// Expired code
{
  statusCode: 400,
  message: 'Verification code has expired. Please request a new one.',
  error: 'Bad Request'
}

// Too many attempts
{
  statusCode: 429,
  message: 'Too many failed attempts. Please try again in 15 minutes.',
  error: 'Too Many Requests'
}

// Email system disabled
{
  statusCode: 503,
  message: '2FA is currently unavailable. Please contact support.',
  error: 'Service Unavailable'
}
```

### Frontend Error Handling

```typescript
try {
  await verifyTwoFactorCode(userId, code);
  // Success - redirect to dashboard
} catch (error) {
  if (error.response?.status === 400) {
    setError('Invalid or expired code. Please try again.');
  } else if (error.response?.status === 429) {
    setError('Too many attempts. Please try again later.');
  } else {
    setError('An error occurred. Please try again.');
  }
}
```

## Testing Strategy

### Backend Tests

#### Unit Tests
- `TwoFactorService.generateCode()` - Generates valid 6-digit codes
- `TwoFactorService.validateCode()` - Validates codes correctly
- `TwoFactorService.checkRateLimit()` - Enforces rate limits
- `AuthService.enableTwoFactor()` - Updates user correctly
- `AuthService.verifyTwoFactorAndLogin()` - Issues JWT on success

#### Integration Tests
- Login flow with 2FA enabled
- Login flow with 2FA disabled
- Enable/disable 2FA from profile
- Code expiration handling
- Rate limiting enforcement
- Email sending integration

### Frontend Tests

#### Component Tests
- `TwoFactorVerification` - Renders correctly
- Code input - Auto-advance works
- Resend button - Cooldown works
- Error messages - Display correctly

#### E2E Tests
- Complete login flow with 2FA
- Enable 2FA from profile
- Disable 2FA from profile
- Resend code functionality
- Invalid code handling

## Security Considerations

### Code Generation
- Use cryptographically secure random number generator
- 6-digit numeric codes (000000-999999)
- Each code is unique and single-use

### Code Storage
- Store hashed codes in database (optional, for extra security)
- Include expiration timestamp (10 minutes)
- Invalidate all previous codes when new one is generated

### Rate Limiting
- Maximum 3 verification attempts per code
- Maximum 5 failed attempts before 15-minute lockout
- Maximum 3 code generation requests per 10 minutes

### Email Security
- Include IP address in email for user awareness
- Warn users not to share codes
- Include expiration time in email
- Send security alert when 2FA is enabled/disabled

### Session Management
- Invalidate all existing sessions when 2FA is enabled
- Require re-authentication when disabling 2FA
- Log all 2FA-related events for audit trail

## Performance Considerations

### Database Queries
- Index on `userId` and `expiresAt` for fast lookups
- Clean up expired codes periodically (cron job)
- Use database transactions for code validation

### Email Delivery
- Use existing email queue system
- Don't block login flow waiting for email
- Provide feedback if email fails to send

### Frontend Performance
- Lazy load `TwoFactorVerification` component
- Debounce code input to prevent excessive API calls
- Cache 2FA status in auth context

## Migration Strategy

### Database Migration
```sql
-- Add new fields to User table
ALTER TABLE users ADD COLUMN two_factor_secret VARCHAR(255);
ALTER TABLE users ADD COLUMN two_factor_verified_at TIMESTAMP;

-- Create TwoFactorCode table
CREATE TABLE two_factor_codes (
  id VARCHAR(255) PRIMARY KEY,
  user_id VARCHAR(255) NOT NULL,
  code VARCHAR(6) NOT NULL,
  expires_at TIMESTAMP NOT NULL,
  verified BOOLEAN DEFAULT FALSE,
  attempts INT DEFAULT 0,
  created_at TIMESTAMP DEFAULT NOW(),
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

CREATE INDEX idx_two_factor_codes_user_id ON two_factor_codes(user_id);
CREATE INDEX idx_two_factor_codes_expires_at ON two_factor_codes(expires_at);
```

### Email Template Seeding
```typescript
await prisma.emailTemplate.create({
  data: {
    slug: 'two-factor-verification',
    name: 'Two-Factor Verification Code',
    subject: 'Your Verification Code - {{appName}}',
    htmlBody: `
      <h1>Your Verification Code</h1>
      <p>Hi {{userName}},</p>
      <p>Your verification code is:</p>
      <h2 style="font-size: 32px; letter-spacing: 8px;">{{code}}</h2>
      <p>This code will expire in {{expiresIn}}.</p>
      <p><strong>Do not share this code with anyone.</strong></p>
      <p>If you didn't request this code, please contact support immediately.</p>
      <p>Login attempt from IP: {{ipAddress}}</p>
    `,
    textBody: `
      Your verification code is: {{code}}
      This code will expire in {{expiresIn}}.
      Do not share this code with anyone.
      Login attempt from IP: {{ipAddress}}
    `,
    category: 'SECURITY',
    variables: ['code', 'userName', 'expiresIn', 'ipAddress', 'appName'],
  },
});
```

## Deployment Checklist

- [ ] Run database migration
- [ ] Seed email template
- [ ] Verify email system is configured
- [ ] Test 2FA flow in staging
- [ ] Update API documentation
- [ ] Notify users about new feature
- [ ] Monitor error logs for issues
- [ ] Set up alerts for high failure rates

## Future Enhancements

1. **TOTP App Support** - Add support for authenticator apps (Google Authenticator, Authy)
2. **Backup Codes** - Generate one-time backup codes for account recovery
3. **SMS Verification** - Add SMS as alternative to email
4. **Remember Device** - Option to skip 2FA on trusted devices for 30 days
5. **Biometric Authentication** - WebAuthn/FIDO2 support
6. **Admin Override** - Allow admins to disable 2FA for users if needed
