# Requirements Document

## Introduction

This document outlines the requirements for implementing Two-Factor Authentication (2FA) in the dashboard starter kit. The 2FA system will provide an additional layer of security by requiring users to verify their identity using a time-based one-time password (TOTP) sent via email. Users can enable or disable 2FA from their profile settings, and by default, 2FA is disabled for all users.

## Glossary

- **2FA System**: The Two-Factor Authentication system that manages user 2FA settings and verification
- **TOTP**: Time-based One-Time Password - a temporary code valid for a limited time
- **Verification Code**: A 6-digit numeric code sent via email for authentication
- **Email Service**: The existing SMTP email service integrated in the dashboard
- **User Profile**: The user settings page where 2FA can be enabled/disabled
- **Login Flow**: The authentication process including 2FA verification when enabled

## Requirements

### Requirement 1: 2FA Database Schema

**User Story:** As a system administrator, I want the database to store 2FA settings for each user, so that the system can track which users have 2FA enabled and manage their verification status.

#### Acceptance Criteria

1. THE 2FA System SHALL store a boolean field `twoFactorEnabled` in the User model with a default value of false
2. THE 2FA System SHALL store a `twoFactorSecret` field in the User model for storing encrypted TOTP secrets
3. THE 2FA System SHALL store a `twoFactorVerifiedAt` timestamp field in the User model to track when 2FA was last verified
4. THE 2FA System SHALL create a `TwoFactorCode` model with fields for userId, code, expiresAt, verified, and createdAt
5. THE 2FA System SHALL establish a one-to-many relationship between User and TwoFactorCode models

### Requirement 2: Enable/Disable 2FA in Profile

**User Story:** As a user, I want to enable or disable 2FA from my profile settings, so that I can control my account security preferences.

#### Acceptance Criteria

1. WHEN a user navigates to their profile settings, THE 2FA System SHALL display a toggle control for enabling/disabling 2FA
2. WHEN a user enables 2FA, THE 2FA System SHALL update the user's `twoFactorEnabled` field to true
3. WHEN a user disables 2FA, THE 2FA System SHALL update the user's `twoFactorEnabled` field to false and clear the `twoFactorSecret`
4. THE 2FA System SHALL require the user to be authenticated to modify 2FA settings
5. WHEN 2FA settings are changed, THE 2FA System SHALL send a confirmation email to the user

### Requirement 3: 2FA Verification Code Generation

**User Story:** As a user with 2FA enabled, I want to receive a verification code via email during login, so that I can complete the two-factor authentication process.

#### Acceptance Criteria

1. WHEN a user with 2FA enabled submits valid credentials, THE 2FA System SHALL generate a 6-digit numeric verification code
2. THE 2FA System SHALL store the verification code in the TwoFactorCode table with an expiration time of 10 minutes
3. THE 2FA System SHALL send the verification code to the user's registered email address using the Email Service
4. THE 2FA System SHALL invalidate any previous unused verification codes for the same user
5. THE 2FA System SHALL return a response indicating that 2FA verification is required without issuing JWT tokens

### Requirement 4: 2FA Verification Code Validation

**User Story:** As a user with 2FA enabled, I want to enter my verification code to complete login, so that I can access my account securely.

#### Acceptance Criteria

1. WHEN a user submits a verification code, THE 2FA System SHALL validate that the code matches an active code in the database
2. THE 2FA System SHALL verify that the verification code has not expired (within 10 minutes of creation)
3. THE 2FA System SHALL verify that the verification code has not been previously used
4. WHEN a valid verification code is submitted, THE 2FA System SHALL mark the code as verified and issue JWT tokens
5. WHEN an invalid or expired code is submitted, THE 2FA System SHALL return an error message and allow retry up to 3 attempts

### Requirement 5: Login Flow Integration

**User Story:** As a user, I want the login process to automatically handle 2FA verification when enabled, so that I have a seamless authentication experience.

#### Acceptance Criteria

1. WHEN a user with 2FA disabled logs in successfully, THE 2FA System SHALL issue JWT tokens immediately
2. WHEN a user with 2FA enabled logs in successfully, THE 2FA System SHALL return a response requiring 2FA verification
3. THE 2FA System SHALL provide a separate endpoint for submitting 2FA verification codes
4. WHEN 2FA verification succeeds, THE 2FA System SHALL issue JWT tokens with the same structure as standard login
5. THE 2FA System SHALL log all 2FA verification attempts for security auditing

### Requirement 6: Frontend 2FA Profile Settings

**User Story:** As a user, I want a user-friendly interface in my profile to manage 2FA settings, so that I can easily enable or disable this security feature.

#### Acceptance Criteria

1. THE 2FA System SHALL display a 2FA settings section in the user profile page
2. THE 2FA System SHALL show the current 2FA status (enabled/disabled) with a toggle switch
3. WHEN a user toggles 2FA, THE 2FA System SHALL display a confirmation dialog explaining the implications
4. THE 2FA System SHALL show a success message when 2FA settings are updated
5. THE 2FA System SHALL display an error message if the update fails

### Requirement 7: Frontend 2FA Login Flow

**User Story:** As a user with 2FA enabled, I want a clear interface to enter my verification code during login, so that I can complete authentication without confusion.

#### Acceptance Criteria

1. WHEN login credentials are valid and 2FA is required, THE 2FA System SHALL display a verification code input screen
2. THE 2FA System SHALL provide a 6-digit input field for entering the verification code
3. THE 2FA System SHALL display a message indicating that a code was sent to the user's email
4. THE 2FA System SHALL provide a "Resend Code" button that becomes available after 60 seconds
5. WHEN verification succeeds, THE 2FA System SHALL redirect the user to the dashboard

### Requirement 8: Email Template for 2FA Codes

**User Story:** As a user, I want to receive a professional and clear email with my 2FA verification code, so that I can easily identify and use the code.

#### Acceptance Criteria

1. THE 2FA System SHALL use the existing Email Service to send verification codes
2. THE 2FA System SHALL include the 6-digit code prominently in the email body
3. THE 2FA System SHALL include the expiration time (10 minutes) in the email
4. THE 2FA System SHALL include a warning not to share the code with anyone
5. THE 2FA System SHALL use a branded email template consistent with other system emails

### Requirement 9: Security and Rate Limiting

**User Story:** As a system administrator, I want 2FA verification to be protected against brute force attacks, so that user accounts remain secure.

#### Acceptance Criteria

1. THE 2FA System SHALL limit verification code requests to 3 attempts per 10-minute period per user
2. THE 2FA System SHALL lock the account for 15 minutes after 5 failed verification attempts
3. THE 2FA System SHALL invalidate verification codes after 3 failed attempts
4. THE 2FA System SHALL log all failed verification attempts with IP address and timestamp
5. THE 2FA System SHALL send an email alert to the user when suspicious activity is detected

### Requirement 10: Default State and Migration

**User Story:** As a system administrator, I want all existing users to have 2FA disabled by default, so that the feature rollout does not disrupt current users.

#### Acceptance Criteria

1. THE 2FA System SHALL set `twoFactorEnabled` to false for all existing users during migration
2. THE 2FA System SHALL set `twoFactorEnabled` to false for all newly registered users
3. THE 2FA System SHALL allow users to opt-in to 2FA at their convenience
4. THE 2FA System SHALL maintain backward compatibility with existing authentication flows
5. THE 2FA System SHALL not require code changes to existing login endpoints for users without 2FA enabled
