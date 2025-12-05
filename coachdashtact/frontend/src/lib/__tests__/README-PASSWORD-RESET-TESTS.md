# Password Reset API Tests

## Overview
Comprehensive test suite for password reset functionality in the API client.

## Test Coverage

### 1. Forgot Password (`forgotPassword`)
- ✅ Successfully sends password reset email request
- ✅ Handles invalid email errors
- ✅ Handles network errors
- ✅ Validates request payload structure

### 2. Validate Reset Token (`validateResetToken`)
- ✅ Validates valid reset tokens
- ✅ Returns invalid for expired tokens
- ✅ Handles malformed token errors
- ✅ Validates response structure

### 3. Reset Password (`resetPassword`)
- ✅ Successfully resets password with valid token
- ✅ Handles weak password validation errors
- ✅ Handles expired token errors
- ✅ Handles already-used token errors
- ✅ Validates request payload structure

### 4. Email System Check (`isEmailSystemEnabled`)
- ✅ Returns true when email system is enabled
- ✅ Returns false when email system is disabled
- ✅ Returns false when configuration not found (404)
- ✅ Returns false on network errors
- ✅ Handles malformed responses gracefully

### 5. Integration Scenarios
- ✅ Complete password reset flow (request → validate → reset)
- ✅ Email system check before showing forgot password form

## Running Tests

```bash
cd frontend
npm test -- api-password-reset.test.ts
```

## Test Structure

Each test follows this pattern:
1. **Setup**: Mock fetch response
2. **Execute**: Call API method
3. **Verify**: Check fetch was called correctly
4. **Assert**: Validate response matches expected

## Error Handling

All methods properly handle:
- Network errors (fetch failures)
- HTTP errors (4xx, 5xx responses)
- Malformed responses
- Missing data

## Security Considerations

- ✅ No auth token required (public endpoints)
- ✅ Passwords never logged or exposed
- ✅ Tokens validated server-side
- ✅ Rate limiting handled by backend

## Integration with Backend

These tests verify the frontend API client matches the backend endpoints:

| Frontend Method | Backend Endpoint | DTO |
|----------------|------------------|-----|
| `forgotPassword(email)` | `POST /auth/forgot-password` | `ForgotPasswordDto` |
| `validateResetToken(token)` | `POST /auth/validate-reset-token` | `ValidateResetTokenDto` |
| `resetPassword(token, newPassword)` | `POST /auth/reset-password` | `ResetPasswordDto` |
| `isEmailSystemEnabled()` | `GET /email/configuration` | N/A |

## Next Steps

After these tests pass:
1. Test in browser with real backend
2. Verify email delivery (if email system enabled)
3. Test complete user flow
4. Add E2E tests for UI components
