# Profile Management API Guide

## Overview

The Profile Management API provides endpoints for users to manage their personal information, profile pictures, and account security.

## Base URL

```
http://localhost:3001/profile
```

## Authentication

All endpoints require JWT authentication. Include the token in the Authorization header:

```
Authorization: Bearer {your_jwt_token}
```

## Endpoints

### 1. Get Profile

Retrieve the current user's profile information.

**Endpoint**: `GET /profile`

**Response**: `200 OK`
```json
{
  "id": "cuid123",
  "email": "user@example.com",
  "name": "John Doe",
  "avatarUrl": "http://localhost:3001/uploads/avatars/user-uuid.webp",
  "bio": "Software developer passionate about clean code",
  "phone": "+1234567890",
  "location": "New York, NY",
  "website": "https://johndoe.com",
  "role": {
    "id": "role123",
    "name": "User",
    "description": "Standard user with basic access"
  },
  "emailVerified": true,
  "twoFactorEnabled": false,
  "createdAt": "2024-01-01T00:00:00.000Z",
  "updatedAt": "2024-01-15T12:30:00.000Z",
  "lastPasswordChange": "2024-01-10T08:00:00.000Z"
}
```

### 2. Update Profile

Update user profile information.

**Endpoint**: `PATCH /profile`

**Request Body**:
```json
{
  "name": "John Smith",
  "bio": "Full-stack developer | Open source enthusiast",
  "phone": "+1987654321",
  "location": "San Francisco, CA",
  "website": "https://johnsmith.dev"
}
```

**Validation Rules**:
- `name`: 2-100 characters (optional)
- `email`: Valid email format (optional)
- `bio`: Max 500 characters (optional)
- `phone`: Max 20 characters (optional)
- `location`: Max 100 characters (optional)
- `website`: Valid URL, max 200 characters (optional)

**Response**: `200 OK` - Returns updated profile (same structure as GET /profile)

**Error Responses**:
- `400 Bad Request` - Validation error
- `409 Conflict` - Email already in use

### 3. Upload Avatar

Upload a profile picture. The image will be automatically optimized.

**Endpoint**: `POST /profile/avatar`

**Rate Limit**: 10 uploads per hour

**Request**: `multipart/form-data`
```
file: [image file]
```

**File Requirements**:
- **Allowed types**: JPEG, PNG, WebP, GIF
- **Max size**: 5MB
- **Output format**: WebP (automatic conversion)
- **Output size**: 400x400 pixels (automatic resize)
- **Quality**: 85%
- **EXIF data**: Automatically stripped

**Response**: `200 OK` - Returns updated profile with new avatarUrl

**Error Responses**:
- `400 Bad Request` - Invalid file type or size
- `429 Too Many Requests` - Rate limit exceeded

**Example with cURL**:
```bash
curl -X POST http://localhost:3001/profile/avatar \
  -H "Authorization: Bearer {token}" \
  -F "file=@/path/to/image.jpg"
```

### 4. Delete Avatar

Remove the current profile picture.

**Endpoint**: `DELETE /profile/avatar`

**Response**: `200 OK` - Returns updated profile with avatarUrl set to null

### 5. Change Password

Change the user's password. This will invalidate all existing sessions.

**Endpoint**: `POST /profile/password`

**Rate Limit**: 3 attempts per 15 minutes

**Request Body**:
```json
{
  "currentPassword": "OldPassword123!",
  "newPassword": "NewPassword456!",
  "confirmPassword": "NewPassword456!"
}
```

**Password Requirements**:
- Minimum 8 characters
- At least one uppercase letter
- At least one lowercase letter
- At least one number
- At least one special character (@$!%*?&)

**Response**: `200 OK`
```json
{
  "message": "Password changed successfully. Please log in again."
}
```

**Error Responses**:
- `400 Bad Request` - Passwords don't match or validation failed
- `401 Unauthorized` - Current password is incorrect
- `429 Too Many Requests` - Rate limit exceeded

**Security Notes**:
- Current password must be verified before change
- New password is hashed with bcrypt (10 rounds)
- All existing tokens should be blacklisted (requires auth service integration)
- Security notification should be sent (requires notification service integration)
- Last password change timestamp is updated

## Error Handling

All endpoints return standard error responses:

```json
{
  "statusCode": 400,
  "message": "Validation error message",
  "error": "Bad Request"
}
```

Common status codes:
- `400` - Bad Request (validation error)
- `401` - Unauthorized (invalid or missing token)
- `404` - Not Found (user not found)
- `409` - Conflict (email already in use)
- `429` - Too Many Requests (rate limit exceeded)
- `500` - Internal Server Error

## Rate Limiting

Sensitive endpoints have rate limiting to prevent abuse:

| Endpoint | Limit | Window |
|----------|-------|--------|
| POST /profile/avatar | 10 requests | 1 hour |
| POST /profile/password | 3 requests | 15 minutes |

When rate limit is exceeded, you'll receive a `429 Too Many Requests` response.

## Image Optimization

Avatar images are automatically optimized:

1. **Auto-rotation**: Based on EXIF orientation data
2. **Resize**: 400x400 pixels (cover fit, centered)
3. **Format**: Converted to WebP
4. **Quality**: 85% (balance between quality and file size)
5. **Metadata**: EXIF data stripped for privacy

**Performance**:
- Original: ~2-5MB (JPEG/PNG)
- Optimized: ~50-150KB (WebP)
- ~95% file size reduction

## Testing with Postman/Thunder Client

### 1. Get Profile
```
GET http://localhost:3001/profile
Headers:
  Authorization: Bearer {your_token}
```

### 2. Update Profile
```
PATCH http://localhost:3001/profile
Headers:
  Authorization: Bearer {your_token}
  Content-Type: application/json
Body (raw JSON):
{
  "name": "Updated Name",
  "bio": "Updated bio"
}
```

### 3. Upload Avatar
```
POST http://localhost:3001/profile/avatar
Headers:
  Authorization: Bearer {your_token}
Body (form-data):
  file: [select image file]
```

### 4. Change Password
```
POST http://localhost:3001/profile/password
Headers:
  Authorization: Bearer {your_token}
  Content-Type: application/json
Body (raw JSON):
{
  "currentPassword": "OldPass123!",
  "newPassword": "NewPass456!",
  "confirmPassword": "NewPass456!"
}
```

## Integration Notes

### Frontend Integration
- Use multipart/form-data for avatar upload
- Implement optimistic updates for better UX
- Cache profile data with 5-minute TTL
- Show loading states during operations
- Handle rate limit errors gracefully

### Security Considerations
- Always verify JWT token on backend
- Never expose password hashes
- Log security events (password changes, failed attempts)
- Implement CSRF protection for state-changing operations
- Use HTTPS in production

### Future Enhancements
- [ ] Physical file deletion for old avatars
- [ ] Token blacklisting integration with auth service
- [ ] Email notifications for security events
- [ ] Profile activity log
- [ ] Two-factor authentication management
- [ ] Email verification flow
- [ ] Account deletion endpoint

## Support

For issues or questions, refer to:
- Main documentation: `TASK_1_BACKEND_PROFILE_SYSTEM_COMPLETE.md`
- Requirements: `.kiro/specs/user-profile-management/requirements.md`
- Design: `.kiro/specs/user-profile-management/design.md`
