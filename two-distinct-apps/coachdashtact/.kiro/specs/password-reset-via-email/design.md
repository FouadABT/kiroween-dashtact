# Design Document

## Overview

The password reset via email feature provides a secure, user-friendly mechanism for users to recover their accounts when they forget their passwords. The system integrates with the existing JWT authentication system and SMTP email service, ensuring that password resets are only available when email is properly configured. The design emphasizes security through token hashing, expiration, single-use enforcement, and session invalidation.

## Architecture

### System Components

```
┌─────────────────┐
│  Login Page     │
│  /login         │
└────────┬────────┘
         │ "Forgot Password?" link
         ▼
┌─────────────────┐
│ Forgot Password │
│ /forgot-password│
└────────┬────────┘
         │ POST /auth/forgot-password
         ▼
┌─────────────────────────────────────────┐
│  Backend: AuthController                │
│  - Validate email configuration         │
│  - Generate secure token                │
│  - Store hashed token in DB             │
│  - Send reset email                     │
└────────┬────────────────────────────────┘
         │ Email with reset link
         ▼
┌─────────────────┐
│  User Email     │
│  Reset Link     │
└────────┬────────┘
         │ Click link with token
         ▼
┌─────────────────┐
│ Reset Password  │
│ /reset-password │
│ ?token=xxx      │
└────────┬────────┘
         │ POST /auth/reset-password
         ▼
┌─────────────────────────────────────────┐
│  Backend: AuthController                │
│  - Validate token                       │
│  - Check expiration                     │
│  - Update password                      │
│  - Invalidate token & sessions          │
└────────┬────────────────────────────────┘
         │ Success
         ▼
┌─────────────────┐
│  Login Page     │
│  /login         │
└─────────────────┘
```

### Technology Stack

- **Backend**: NestJS + Prisma + PostgreSQL
- **Frontend**: Next.js 14 + TypeScript + shadcn/ui
- **Email**: Existing SMTP service (EmailService)
- **Security**: crypto (Node.js), bcrypt, SHA-256
- **Authentication**: Existing JWT system

## Components and Interfaces

### 1. Database Schema

#### PasswordResetToken Model

```prisma
model PasswordResetToken {
  id        String   @id @default(cuid())
  userId    String   @map("user_id")
  token     String   @unique  // SHA-256 hashed token
  expiresAt DateTime @map("expires_at")
  isUsed    Boolean  @default(false) @map("is_used")
  createdAt DateTime @default(now()) @map("created_at")
  
  user      User     @relation(fields: [userId], references: [id], onDelete: Cascade)
  
  @@index([token])
  @@index([expiresAt])
  @@index([userId])
  @@map("password_reset_tokens")
}
```

#### User Model Extension

```prisma
model User {
  // ... existing fields
  passwordResetTokens PasswordResetToken[]
}
```

### 2. Backend Components

#### DTOs (Data Transfer Objects)

**ForgotPasswordDto**
```typescript
export class ForgotPasswordDto {
  @IsEmail()
  @IsNotEmpty()
  email: string;
}
```

**ResetPasswordDto**
```typescript
export class ResetPasswordDto {
  @IsString()
  @IsNotEmpty()
  token: string;

  @IsString()
  @MinLength(8)
  @Matches(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/, {
    message: 'Password must contain uppercase, lowercase, and number'
  })
  newPassword: string;
}
```

**ValidateResetTokenDto**
```typescript
export class ValidateResetTokenDto {
  @IsString()
  @IsNotEmpty()
  token: string;
}
```

#### AuthController Extensions

```typescript
@Controller('auth')
export class AuthController {
  // ... existing methods

  /**
   * Request password reset
   * POST /auth/forgot-password
   */
  @Public()
  @Post('forgot-password')
  @HttpCode(HttpStatus.OK)
  async forgotPassword(
    @Body() dto: ForgotPasswordDto
  ): Promise<{ message: string }>;

  /**
   * Validate reset token
   * POST /auth/validate-reset-token
   */
  @Public()
  @Post('validate-reset-token')
  @HttpCode(HttpStatus.OK)
  async validateResetToken(
    @Body() dto: ValidateResetTokenDto
  ): Promise<{ valid: boolean; message?: string }>;

  /**
   * Reset password with token
   * POST /auth/reset-password
   */
  @Public()
  @Post('reset-password')
  @HttpCode(HttpStatus.OK)
  async resetPassword(
    @Body() dto: ResetPasswordDto
  ): Promise<{ message: string }>;
}
```

#### AuthService Extensions

```typescript
@Injectable()
export class AuthService {
  // ... existing methods

  /**
   * Generate and send password reset email
   */
  async forgotPassword(email: string): Promise<void>;

  /**
   * Validate reset token
   */
  async validateResetToken(token: string): Promise<boolean>;

  /**
   * Reset password using token
   */
  async resetPassword(token: string, newPassword: string): Promise<void>;

  /**
   * Generate secure reset token
   */
  private generateResetToken(): string;

  /**
   * Hash token for storage
   */
  private hashToken(token: string): string;

  /**
   * Invalidate all user sessions
   */
  private async invalidateUserSessions(userId: string): Promise<void>;

  /**
   * Invalidate previous reset tokens
   */
  private async invalidatePreviousTokens(userId: string): Promise<void>;
}
```

#### PasswordResetService (New Service)

```typescript
@Injectable()
export class PasswordResetService {
  constructor(
    private prisma: PrismaService,
    private emailService: EmailService,
  ) {}

  /**
   * Create reset token for user
   */
  async createResetToken(userId: string): Promise<string>;

  /**
   * Validate token and return user
   */
  async validateToken(token: string): Promise<User | null>;

  /**
   * Mark token as used
   */
  async markTokenAsUsed(token: string): Promise<void>;

  /**
   * Clean up expired tokens (cron job)
   */
  async cleanupExpiredTokens(): Promise<void>;

  /**
   * Invalidate all tokens for user
   */
  async invalidateUserTokens(userId: string): Promise<void>;
}
```

### 3. Email Template

#### Password Reset Email Template

**Template Name**: `password-reset`

**Subject**: `Reset Your Password - {{appName}}`

**Variables**:
- `userName`: User's display name
- `resetUrl`: Full URL with token
- `expiresIn`: Human-readable expiration time (e.g., "1 hour")
- `appName`: Application name
- `supportEmail`: Support contact email

**HTML Body**:
```html
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Reset Your Password</title>
</head>
<body style="font-family: Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px;">
  <div style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); padding: 30px; text-align: center; border-radius: 10px 10px 0 0;">
    <h1 style="color: white; margin: 0;">Password Reset Request</h1>
  </div>
  
  <div style="background: #f9f9f9; padding: 30px; border-radius: 0 0 10px 10px;">
    <p>Hi {{userName}},</p>
    
    <p>We received a request to reset your password for your {{appName}} account. If you didn't make this request, you can safely ignore this email.</p>
    
    <p>To reset your password, click the button below:</p>
    
    <div style="text-align: center; margin: 30px 0;">
      <a href="{{resetUrl}}" style="background: #667eea; color: white; padding: 14px 30px; text-decoration: none; border-radius: 5px; display: inline-block; font-weight: bold;">Reset Password</a>
    </div>
    
    <p>Or copy and paste this link into your browser:</p>
    <p style="background: white; padding: 10px; border-radius: 5px; word-break: break-all; font-size: 12px;">{{resetUrl}}</p>
    
    <div style="background: #fff3cd; border-left: 4px solid #ffc107; padding: 15px; margin: 20px 0; border-radius: 5px;">
      <p style="margin: 0; font-weight: bold;">⚠️ Security Notice</p>
      <p style="margin: 5px 0 0 0; font-size: 14px;">This link will expire in {{expiresIn}}. For security reasons, it can only be used once.</p>
    </div>
    
    <p style="font-size: 14px; color: #666; margin-top: 30px;">If you didn't request a password reset, please contact our support team immediately at <a href="mailto:{{supportEmail}}">{{supportEmail}}</a></p>
    
    <hr style="border: none; border-top: 1px solid #ddd; margin: 30px 0;">
    
    <p style="font-size: 12px; color: #999; text-align: center;">This is an automated email from {{appName}}. Please do not reply to this email.</p>
  </div>
</body>
</html>
```

**Text Body** (fallback):
```
Hi {{userName}},

We received a request to reset your password for your {{appName}} account.

To reset your password, visit this link:
{{resetUrl}}

This link will expire in {{expiresIn}} and can only be used once.

If you didn't request a password reset, you can safely ignore this email or contact support at {{supportEmail}}.

---
This is an automated email from {{appName}}.
```

### 4. Frontend Components

#### Page: /forgot-password

**Component**: `ForgotPasswordPage`

**Features**:
- Email input field with validation
- Submit button with loading state
- Success message display
- Error handling
- Link back to login

**State Management**:
```typescript
interface ForgotPasswordState {
  email: string;
  isLoading: boolean;
  isSuccess: boolean;
  error: string | null;
}
```

**UI Components** (shadcn/ui):
- `Card` - Container
- `Input` - Email field
- `Button` - Submit button
- `Alert` - Success/error messages
- `Label` - Form labels

#### Page: /reset-password

**Component**: `ResetPasswordPage`

**Features**:
- Token extraction from URL
- Token validation on mount
- New password input with strength indicator
- Confirm password input
- Password visibility toggle
- Submit button with loading state
- Success message with auto-redirect
- Error handling for invalid/expired tokens

**State Management**:
```typescript
interface ResetPasswordState {
  token: string;
  newPassword: string;
  confirmPassword: string;
  isLoading: boolean;
  isValidating: boolean;
  isTokenValid: boolean;
  isSuccess: boolean;
  error: string | null;
  passwordStrength: 'weak' | 'medium' | 'strong';
}
```

**UI Components** (shadcn/ui):
- `Card` - Container
- `Input` - Password fields
- `Button` - Submit button, toggle visibility
- `Alert` - Success/error messages
- `Progress` - Password strength indicator
- `Label` - Form labels

#### Component: ForgotPasswordLink

**Location**: Login page (`/login`)

**Features**:
- Conditional rendering based on email configuration
- Link to /forgot-password
- Styled to match login page theme

```typescript
interface ForgotPasswordLinkProps {
  className?: string;
}
```

### 5. API Client

#### Frontend API Methods

**File**: `frontend/src/lib/api/auth.ts`

```typescript
export const authApi = {
  // ... existing methods

  /**
   * Request password reset email
   */
  async forgotPassword(email: string): Promise<{ message: string }> {
    const response = await fetch(`${API_URL}/auth/forgot-password`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email }),
    });
    
    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || 'Failed to send reset email');
    }
    
    return response.json();
  },

  /**
   * Validate reset token
   */
  async validateResetToken(token: string): Promise<{ valid: boolean; message?: string }> {
    const response = await fetch(`${API_URL}/auth/validate-reset-token`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ token }),
    });
    
    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || 'Failed to validate token');
    }
    
    return response.json();
  },

  /**
   * Reset password with token
   */
  async resetPassword(token: string, newPassword: string): Promise<{ message: string }> {
    const response = await fetch(`${API_URL}/auth/reset-password`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ token, newPassword }),
    });
    
    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || 'Failed to reset password');
    }
    
    return response.json();
  },

  /**
   * Check if email system is enabled
   */
  async isEmailSystemEnabled(): Promise<boolean> {
    try {
      const response = await fetch(`${API_URL}/email/configuration`);
      if (!response.ok) return false;
      const config = await response.json();
      return config?.isEnabled || false;
    } catch {
      return false;
    }
  },
};
```

## Data Models

### Token Generation Flow

```typescript
// 1. Generate random token (32 bytes = 64 hex characters)
const rawToken = crypto.randomBytes(32).toString('hex');

// 2. Hash token for storage (SHA-256)
const hashedToken = crypto
  .createHash('sha256')
  .update(rawToken)
  .digest('hex');

// 3. Store hashed token in database
await prisma.passwordResetToken.create({
  data: {
    userId: user.id,
    token: hashedToken,
    expiresAt: new Date(Date.now() + 60 * 60 * 1000), // 1 hour
  },
});

// 4. Send raw token in email (never store raw token)
// FRONTEND_URL comes from environment variable
const resetUrl = `${process.env.FRONTEND_URL}/reset-password?token=${rawToken}`;
// Local: http://localhost:3000/reset-password?token=abc123...
// Production: https://yourdomain.com/reset-password?token=abc123...
```

### Token Validation Flow

```typescript
// 1. Receive raw token from user
const rawToken = req.body.token;

// 2. Hash received token
const hashedToken = crypto
  .createHash('sha256')
  .update(rawToken)
  .digest('hex');

// 3. Find token in database
const resetToken = await prisma.passwordResetToken.findUnique({
  where: { token: hashedToken },
  include: { user: true },
});

// 4. Validate token
if (!resetToken) throw new Error('Invalid token');
if (resetToken.isUsed) throw new Error('Token already used');
if (resetToken.expiresAt < new Date()) throw new Error('Token expired');

// 5. Token is valid, proceed with password reset
```

### Password Update Flow

```typescript
// 1. Validate token (as above)
const resetToken = await validateToken(token);

// 2. Hash new password
const hashedPassword = await bcrypt.hash(newPassword, 10);

// 3. Update user password
await prisma.user.update({
  where: { id: resetToken.userId },
  data: {
    password: hashedPassword,
    lastPasswordChange: new Date(),
  },
});

// 4. Mark token as used
await prisma.passwordResetToken.update({
  where: { id: resetToken.id },
  data: { isUsed: true },
});

// 5. Invalidate all user sessions
await prisma.tokenBlacklist.createMany({
  data: userActiveSessions.map(session => ({
    token: session.accessToken,
    userId: resetToken.userId,
    expiresAt: session.expiresAt,
  })),
});

// 6. Invalidate all other reset tokens
await prisma.passwordResetToken.updateMany({
  where: {
    userId: resetToken.userId,
    id: { not: resetToken.id },
    isUsed: false,
  },
  data: { isUsed: true },
});
```

## Error Handling

### Backend Error Responses

```typescript
// Email system disabled
{
  statusCode: 503,
  message: 'Password reset is currently unavailable. Please contact support.',
  error: 'Service Unavailable'
}

// User not found (return success to prevent enumeration)
{
  message: 'If an account exists with that email, a reset link has been sent.'
}

// Invalid token
{
  statusCode: 400,
  message: 'Invalid or expired reset token. Please request a new password reset.',
  error: 'Bad Request'
}

// Token already used
{
  statusCode: 400,
  message: 'This reset link has already been used. Please request a new password reset.',
  error: 'Bad Request'
}

// Token expired
{
  statusCode: 400,
  message: 'This reset link has expired. Please request a new password reset.',
  error: 'Bad Request'
}

// Password validation failed
{
  statusCode: 400,
  message: 'Password must be at least 8 characters and contain uppercase, lowercase, and number',
  error: 'Bad Request'
}

// Email send failed
{
  statusCode: 500,
  message: 'Failed to send reset email. Please try again later.',
  error: 'Internal Server Error'
}
```

### Frontend Error Handling

```typescript
// Display user-friendly error messages
const errorMessages: Record<string, string> = {
  'Email system disabled': 'Password reset is temporarily unavailable. Please try again later or contact support.',
  'Invalid token': 'This reset link is invalid or has expired. Please request a new password reset.',
  'Token expired': 'This reset link has expired. Please request a new password reset.',
  'Token already used': 'This reset link has already been used. Please request a new password reset.',
  'Network error': 'Unable to connect to the server. Please check your internet connection.',
  'Unknown error': 'An unexpected error occurred. Please try again.',
};

// Retry logic for network errors
const retryWithBackoff = async (fn: () => Promise<any>, maxRetries = 3) => {
  for (let i = 0; i < maxRetries; i++) {
    try {
      return await fn();
    } catch (error) {
      if (i === maxRetries - 1) throw error;
      await new Promise(resolve => setTimeout(resolve, 1000 * Math.pow(2, i)));
    }
  }
};
```

## Testing Strategy

### Backend Unit Tests

**File**: `backend/src/auth/auth.service.spec.ts`

```typescript
describe('AuthService - Password Reset', () => {
  describe('forgotPassword', () => {
    it('should generate token and send email for valid user');
    it('should return success even if user does not exist');
    it('should throw error if email system is disabled');
    it('should invalidate previous tokens when generating new one');
    it('should handle email send failures gracefully');
  });

  describe('validateResetToken', () => {
    it('should return true for valid token');
    it('should return false for invalid token');
    it('should return false for expired token');
    it('should return false for used token');
  });

  describe('resetPassword', () => {
    it('should update password with valid token');
    it('should hash password correctly');
    it('should mark token as used after reset');
    it('should invalidate all user sessions');
    it('should update lastPasswordChange timestamp');
    it('should throw error for invalid token');
  });
});
```

### Backend Integration Tests

**File**: `backend/test/auth-password-reset.e2e-spec.ts`

```typescript
describe('Password Reset (e2e)', () => {
  it('POST /auth/forgot-password - should send reset email');
  it('POST /auth/forgot-password - should handle non-existent user');
  it('POST /auth/validate-reset-token - should validate token');
  it('POST /auth/reset-password - should reset password');
  it('POST /auth/reset-password - should reject expired token');
  it('POST /auth/reset-password - should reject used token');
  it('Full flow - should complete password reset successfully');
});
```

### Frontend Component Tests

**File**: `frontend/src/app/forgot-password/page.test.tsx`

```typescript
describe('ForgotPasswordPage', () => {
  it('should render email input field');
  it('should validate email format');
  it('should call API on form submit');
  it('should display success message after submission');
  it('should display error message on API failure');
  it('should disable submit button while loading');
});
```

**File**: `frontend/src/app/reset-password/page.test.tsx`

```typescript
describe('ResetPasswordPage', () => {
  it('should extract token from URL');
  it('should validate token on mount');
  it('should display error for invalid token');
  it('should render password input fields');
  it('should validate password strength');
  it('should validate password confirmation match');
  it('should call API on form submit');
  it('should redirect to login after successful reset');
});
```

### Manual Testing Checklist

1. **Email Configuration**
   - [ ] Verify forgot password link hidden when email disabled
   - [ ] Verify forgot password link visible when email enabled
   - [ ] Verify error message when requesting reset with email disabled

2. **Forgot Password Flow**
   - [ ] Submit valid email address
   - [ ] Verify email received with reset link
   - [ ] Submit non-existent email (should show success)
   - [ ] Verify consistent response time for existing/non-existing users

3. **Reset Password Flow**
   - [ ] Click reset link from email
   - [ ] Verify token validation on page load
   - [ ] Enter new password meeting requirements
   - [ ] Verify password strength indicator
   - [ ] Submit form and verify success
   - [ ] Verify redirect to login page

4. **Token Security**
   - [ ] Verify token expires after 1 hour
   - [ ] Verify token can only be used once
   - [ ] Verify old tokens invalidated when new one requested
   - [ ] Verify sessions invalidated after password reset

5. **Error Scenarios**
   - [ ] Use expired token
   - [ ] Use already-used token
   - [ ] Use invalid token
   - [ ] Submit weak password
   - [ ] Submit mismatched passwords

## Security Considerations

### Token Security

1. **Cryptographically Secure Generation**: Use `crypto.randomBytes(32)` for token generation
2. **Token Hashing**: Store only SHA-256 hashed tokens in database
3. **Single Use**: Mark tokens as used after successful reset
4. **Time Limitation**: Tokens expire after 1 hour
5. **Token Invalidation**: Invalidate all previous tokens when new one is requested

### User Enumeration Prevention

1. **Consistent Responses**: Return same success message whether user exists or not
2. **Consistent Timing**: Use constant-time comparison and add artificial delay if needed
3. **No User Existence Disclosure**: Never reveal if email exists in system

### Session Management

1. **Session Invalidation**: Invalidate all active sessions after password reset
2. **Token Blacklist**: Add all active access tokens to blacklist
3. **Force Re-login**: Require user to log in with new password

### Rate Limiting

1. **Request Limiting**: Limit forgot password requests to 5 per hour per IP
2. **Email Limiting**: Limit reset emails to 3 per hour per email address
3. **Token Validation**: Limit token validation attempts to 10 per hour per IP

### Email Security

1. **HTTPS Links**: Always use HTTPS for reset URLs
2. **No Sensitive Data**: Never include passwords or sensitive data in emails
3. **Clear Expiration**: Clearly state token expiration time
4. **Security Notice**: Include warning about phishing attempts

## Performance Optimizations

### Database Indexes

```prisma
@@index([token])        // Fast token lookup
@@index([expiresAt])    // Efficient cleanup queries
@@index([userId])       // Fast user token queries
```

### Cleanup Job

```typescript
// Cron job to clean up expired tokens (runs daily)
@Cron('0 0 * * *') // Midnight every day
async cleanupExpiredTokens() {
  await this.prisma.passwordResetToken.deleteMany({
    where: {
      OR: [
        { expiresAt: { lt: new Date() } },
        { isUsed: true, createdAt: { lt: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000) } }
      ]
    }
  });
}
```

### Email Queue

- Use existing email queue system for async email sending
- Prevents blocking API responses
- Handles retries automatically

## Configuration

### Environment Variables

**Backend** (`.env` for local development):
```env
# Frontend URL for reset links (LOCAL)
FRONTEND_URL=http://localhost:3000

# Token expiration (in milliseconds)
PASSWORD_RESET_TOKEN_EXPIRY=3600000  # 1 hour

# Rate limiting
PASSWORD_RESET_RATE_LIMIT_PER_HOUR=5
PASSWORD_RESET_EMAIL_LIMIT_PER_HOUR=3

# App name for emails
APP_NAME=My App

# Support email
SUPPORT_EMAIL=support@example.com
```

**Backend** (`.env.production` for production):
```env
# Frontend URL for reset links (PRODUCTION)
FRONTEND_URL=https://yourdomain.com

# Token expiration (in milliseconds)
PASSWORD_RESET_TOKEN_EXPIRY=3600000  # 1 hour

# Rate limiting
PASSWORD_RESET_RATE_LIMIT_PER_HOUR=5
PASSWORD_RESET_EMAIL_LIMIT_PER_HOUR=3

# App name for emails
APP_NAME=My App

# Support email
SUPPORT_EMAIL=support@yourdomain.com
```

**Frontend** (`.env.local`):
```env
# API URL
NEXT_PUBLIC_API_URL=http://localhost:3001

# App name for emails
NEXT_PUBLIC_APP_NAME=My App

# Support email
NEXT_PUBLIC_SUPPORT_EMAIL=support@example.com
```

**How it works:**
- The backend reads `FRONTEND_URL` from environment variables
- In development: `FRONTEND_URL=http://localhost:3000`
- In production: `FRONTEND_URL=https://yourdomain.com`
- The reset URL is constructed as: `${process.env.FRONTEND_URL}/reset-password?token=${rawToken}`
- This ensures the correct URL is used automatically based on the environment

## Migration Strategy

### Database Migration

```bash
# Generate migration
cd backend
npx prisma migrate dev --name add_password_reset_tokens

# Apply migration
npx prisma migrate deploy
```

### Deployment Steps

1. **Backend Deployment**
   - Deploy new backend code with password reset endpoints
   - Run database migration
   - Verify email system is configured
   - Test forgot password endpoint

2. **Frontend Deployment**
   - Deploy new frontend code with forgot/reset password pages
   - Verify forgot password link appears on login page
   - Test complete password reset flow

3. **Rollback Plan**
   - Keep previous backend version available
   - Database migration is additive (safe to rollback)
   - Frontend can be rolled back independently

## Future Enhancements

1. **Multi-Factor Authentication**: Require 2FA code for password reset if enabled
2. **Password History**: Prevent reuse of last N passwords
3. **Account Lockout**: Lock account after multiple failed reset attempts
4. **SMS Reset**: Alternative reset method via SMS
5. **Security Questions**: Additional verification step
6. **Audit Logging**: Log all password reset attempts
7. **Admin Notifications**: Notify admins of suspicious reset activity
8. **Geolocation Check**: Warn users if reset requested from unusual location
