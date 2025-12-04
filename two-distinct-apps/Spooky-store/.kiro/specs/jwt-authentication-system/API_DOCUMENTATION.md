# JWT Authentication System - API Documentation

## Table of Contents
- [Overview](#overview)
- [Authentication](#authentication)
- [Base URL](#base-url)
- [Authentication Endpoints](#authentication-endpoints)
- [Permission Management Endpoints](#permission-management-endpoints)
- [User Management Endpoints](#user-management-endpoints)
- [Error Responses](#error-responses)
- [Rate Limiting](#rate-limiting)

## Overview

This API provides JWT-based authentication with role-based access control (RBAC) and flexible permission management. All endpoints return JSON responses and expect JSON request bodies where applicable.

## Authentication

Most endpoints require authentication via JWT token. Include the token in the Authorization header:

```
Authorization: Bearer <access_token>
```

### Token Types

- **Access Token**: Short-lived token (15 minutes) for API requests
- **Refresh Token**: Long-lived token (7 days) for obtaining new access tokens

## Base URL

```
Development: http://localhost:3001
Production: https://your-api-domain.com
```

---

## Authentication Endpoints

### 1. Register User

Create a new user account.

**Endpoint:** `POST /auth/register`

**Authentication:** Not required (Public)

**Request Body:**
```json
{
  "email": "user@example.com",
  "password": "SecurePass123",
  "name": "John Doe"
}
```

**Request Fields:**
| Field | Type | Required | Description |
|-------|------|----------|-------------|
| email | string | Yes | Valid email address |
| password | string | Yes | Min 8 chars, must contain uppercase, lowercase, and number |
| name | string | No | User's display name |

**Note:** The frontend may validate additional fields like `confirmPassword` and `acceptTerms`, but these should NOT be sent to the backend. Only `email`, `password`, and `name` are accepted.

**Success Response (201 Created):**
```json
{
  "user": {
    "id": "clx1234567890",
    "email": "user@example.com",
    "name": "John Doe",
    "role": {
      "id": "role_id",
      "name": "User",
      "permissions": ["users:read", "profile:write", "settings:read"]
    },
    "createdAt": "2024-01-15T10:30:00.000Z",
    "updatedAt": "2024-01-15T10:30:00.000Z"
  },
  "accessToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "refreshToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "expiresIn": 900
}
```

**Error Responses:**
- `400 Bad Request`: Invalid input data
  ```json
  {
    "statusCode": 400,
    "message": ["email must be a valid email", "password is too weak"],
    "error": "Bad Request"
  }
  ```
- `409 Conflict`: Email already exists
  ```json
  {
    "statusCode": 409,
    "message": "User with this email already exists",
    "error": "Conflict"
  }
  ```

---

### 2. Login

Authenticate user and receive tokens.

**Endpoint:** `POST /auth/login`

**Authentication:** Not required (Public)

**Request Body:**
```json
{
  "email": "user@example.com",
  "password": "SecurePass123",
  "rememberMe": true
}
```

**Request Fields:**
| Field | Type | Required | Description |
|-------|------|----------|-------------|
| email | string | Yes | User's email address |
| password | string | Yes | User's password |
| rememberMe | boolean | No | Extend session duration (future feature) |

**Success Response (200 OK):**
```json
{
  "user": {
    "id": "clx1234567890",
    "email": "user@example.com",
    "name": "John Doe",
    "role": {
      "id": "role_id",
      "name": "Admin",
      "permissions": ["*:*"]
    },
    "createdAt": "2024-01-15T10:30:00.000Z",
    "updatedAt": "2024-01-15T10:30:00.000Z"
  },
  "accessToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "refreshToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "expiresIn": 900
}
```

**Error Responses:**
- `401 Unauthorized`: Invalid credentials
  ```json
  {
    "statusCode": 401,
    "message": "Invalid credentials",
    "error": "Unauthorized"
  }
  ```
- `429 Too Many Requests`: Rate limit exceeded
  ```json
  {
    "statusCode": 429,
    "message": "Too many login attempts. Please try again later.",
    "error": "Too Many Requests"
  }
  ```

---

### 3. Refresh Token

Obtain a new access token using a refresh token.

**Endpoint:** `POST /auth/refresh`

**Authentication:** Not required (Public, but requires valid refresh token)

**Request Body:**
```json
{
  "refreshToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
}
```

**Request Fields:**
| Field | Type | Required | Description |
|-------|------|----------|-------------|
| refreshToken | string | Yes | Valid refresh token from login/register |

**Success Response (200 OK):**
```json
{
  "accessToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "expiresIn": 900
}
```

**Error Responses:**
- `401 Unauthorized`: Invalid or expired refresh token
  ```json
  {
    "statusCode": 401,
    "message": "Invalid refresh token",
    "error": "Unauthorized"
  }
  ```
- `401 Unauthorized`: Token has been revoked
  ```json
  {
    "statusCode": 401,
    "message": "Token has been revoked",
    "error": "Unauthorized"
  }
  ```

---

### 4. Logout

Invalidate refresh token and end session.

**Endpoint:** `POST /auth/logout`

**Authentication:** Required

**Headers:**
```
Authorization: Bearer <access_token>
```

**Request Body:**
```json
{
  "refreshToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
}
```

**Request Fields:**
| Field | Type | Required | Description |
|-------|------|----------|-------------|
| refreshToken | string | Yes | Refresh token to revoke |

**Success Response (200 OK):**
```json
{
  "message": "Logged out successfully"
}
```

**Error Responses:**
- `401 Unauthorized`: Invalid or missing access token
  ```json
  {
    "statusCode": 401,
    "message": "Unauthorized",
    "error": "Unauthorized"
  }
  ```

---

### 5. Get Profile

Retrieve current authenticated user's profile.

**Endpoint:** `GET /auth/profile`

**Authentication:** Required

**Headers:**
```
Authorization: Bearer <access_token>
```

**Success Response (200 OK):**
```json
{
  "id": "clx1234567890",
  "email": "user@example.com",
  "name": "John Doe",
  "role": {
    "id": "role_id",
    "name": "Admin",
    "permissions": [
      "users:read",
      "users:write",
      "users:delete",
      "roles:read",
      "roles:write",
      "permissions:read",
      "settings:read",
      "settings:write",
      "profile:write"
    ]
  },
  "createdAt": "2024-01-15T10:30:00.000Z",
  "updatedAt": "2024-01-15T10:30:00.000Z"
}
```

**Error Responses:**
- `401 Unauthorized`: Invalid or expired token
  ```json
  {
    "statusCode": 401,
    "message": "Unauthorized",
    "error": "Unauthorized"
  }
  ```

---

## Permission Management Endpoints

### 6. Create Permission

Create a new permission.

**Endpoint:** `POST /permissions`

**Authentication:** Required

**Required Permission:** `permissions:write`

**Headers:**
```
Authorization: Bearer <access_token>
```

**Request Body:**
```json
{
  "name": "posts:write",
  "resource": "posts",
  "action": "write",
  "description": "Create and edit posts"
}
```

**Request Fields:**
| Field | Type | Required | Description |
|-------|------|----------|-------------|
| name | string | Yes | Permission identifier (format: resource:action) |
| resource | string | Yes | Resource name (e.g., posts, comments) |
| action | string | Yes | Action name (read, write, delete, admin) |
| description | string | No | Human-readable description |

**Success Response (201 Created):**
```json
{
  "id": "perm_id",
  "name": "posts:write",
  "resource": "posts",
  "action": "write",
  "description": "Create and edit posts",
  "createdAt": "2024-01-15T10:30:00.000Z",
  "updatedAt": "2024-01-15T10:30:00.000Z"
}
```

**Error Responses:**
- `403 Forbidden`: Insufficient permissions
  ```json
  {
    "statusCode": 403,
    "message": "Forbidden resource",
    "error": "Forbidden"
  }
  ```
- `409 Conflict`: Permission already exists
  ```json
  {
    "statusCode": 409,
    "message": "Permission already exists",
    "error": "Conflict"
  }
  ```

---

### 7. List Permissions

Get all permissions or filter by resource.

**Endpoint:** `GET /permissions`

**Authentication:** Required

**Required Permission:** `permissions:read`

**Headers:**
```
Authorization: Bearer <access_token>
```

**Query Parameters:**
| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| resource | string | No | Filter by resource name |

**Example Requests:**
```
GET /permissions
GET /permissions?resource=users
```

**Success Response (200 OK):**
```json
[
  {
    "id": "perm_id_1",
    "name": "users:read",
    "resource": "users",
    "action": "read",
    "description": "View users",
    "createdAt": "2024-01-15T10:30:00.000Z",
    "updatedAt": "2024-01-15T10:30:00.000Z"
  },
  {
    "id": "perm_id_2",
    "name": "users:write",
    "resource": "users",
    "action": "write",
    "description": "Create/edit users",
    "createdAt": "2024-01-15T10:30:00.000Z",
    "updatedAt": "2024-01-15T10:30:00.000Z"
  }
]
```

**Error Responses:**
- `403 Forbidden`: Insufficient permissions

---

### 8. Get Permission by ID

Retrieve a specific permission.

**Endpoint:** `GET /permissions/:id`

**Authentication:** Required

**Required Permission:** `permissions:read`

**Headers:**
```
Authorization: Bearer <access_token>
```

**URL Parameters:**
| Parameter | Type | Description |
|-----------|------|-------------|
| id | string | Permission ID |

**Success Response (200 OK):**
```json
{
  "id": "perm_id",
  "name": "users:write",
  "resource": "users",
  "action": "write",
  "description": "Create/edit users",
  "createdAt": "2024-01-15T10:30:00.000Z",
  "updatedAt": "2024-01-15T10:30:00.000Z"
}
```

**Error Responses:**
- `404 Not Found`: Permission not found
  ```json
  {
    "statusCode": 404,
    "message": "Permission not found",
    "error": "Not Found"
  }
  ```

---

### 9. Update Permission

Update an existing permission.

**Endpoint:** `PATCH /permissions/:id`

**Authentication:** Required

**Required Permission:** `permissions:write`

**Headers:**
```
Authorization: Bearer <access_token>
```

**URL Parameters:**
| Parameter | Type | Description |
|-----------|------|-------------|
| id | string | Permission ID |

**Request Body:**
```json
{
  "description": "Updated description"
}
```

**Success Response (200 OK):**
```json
{
  "id": "perm_id",
  "name": "users:write",
  "resource": "users",
  "action": "write",
  "description": "Updated description",
  "createdAt": "2024-01-15T10:30:00.000Z",
  "updatedAt": "2024-01-15T11:00:00.000Z"
}
```

---

### 10. Delete Permission

Delete a permission.

**Endpoint:** `DELETE /permissions/:id`

**Authentication:** Required

**Required Permission:** `permissions:write`

**Headers:**
```
Authorization: Bearer <access_token>
```

**URL Parameters:**
| Parameter | Type | Description |
|-----------|------|-------------|
| id | string | Permission ID |

**Success Response (200 OK):**
```json
{
  "id": "perm_id",
  "name": "users:write",
  "resource": "users",
  "action": "write",
  "description": "Create/edit users"
}
```

---

### 11. Assign Permission to Role

Assign a permission to a role.

**Endpoint:** `POST /permissions/assign`

**Authentication:** Required

**Required Permission:** `permissions:write`

**Headers:**
```
Authorization: Bearer <access_token>
```

**Request Body:**
```json
{
  "roleId": "role_id",
  "permissionId": "perm_id"
}
```

**Request Fields:**
| Field | Type | Required | Description |
|-------|------|----------|-------------|
| roleId | string | Yes | Role ID |
| permissionId | string | Yes | Permission ID |

**Success Response (200 OK):**
```json
{
  "message": "Permission assigned successfully"
}
```

**Error Responses:**
- `404 Not Found`: Role or permission not found
- `409 Conflict`: Permission already assigned to role

---

### 12. Remove Permission from Role

Remove a permission from a role.

**Endpoint:** `DELETE /permissions/assign`

**Authentication:** Required

**Required Permission:** `permissions:write`

**Headers:**
```
Authorization: Bearer <access_token>
```

**Request Body:**
```json
{
  "roleId": "role_id",
  "permissionId": "perm_id"
}
```

**Success Response (200 OK):**
```json
{
  "message": "Permission removed successfully"
}
```

---

### 13. Get Role Permissions

Get all permissions assigned to a role.

**Endpoint:** `GET /permissions/role/:roleId`

**Authentication:** Required

**Required Permission:** `permissions:read`

**Headers:**
```
Authorization: Bearer <access_token>
```

**URL Parameters:**
| Parameter | Type | Description |
|-----------|------|-------------|
| roleId | string | Role ID |

**Success Response (200 OK):**
```json
[
  {
    "id": "perm_id_1",
    "name": "users:read",
    "resource": "users",
    "action": "read",
    "description": "View users"
  },
  {
    "id": "perm_id_2",
    "name": "users:write",
    "resource": "users",
    "action": "write",
    "description": "Create/edit users"
  }
]
```

---

### 14. Check User Permission

Check if a user has a specific permission.

**Endpoint:** `GET /permissions/user/:userId/check/:permission`

**Authentication:** Required

**Required Permission:** `permissions:read`

**Headers:**
```
Authorization: Bearer <access_token>
```

**URL Parameters:**
| Parameter | Type | Description |
|-----------|------|-------------|
| userId | string | User ID |
| permission | string | Permission name (e.g., users:write) |

**Success Response (200 OK):**
```json
{
  "hasPermission": true
}
```

---

## User Management Endpoints

### 15. List Users

Get all users.

**Endpoint:** `GET /users`

**Authentication:** Required

**Required Permission:** `users:read`

**Headers:**
```
Authorization: Bearer <access_token>
```

**Success Response (200 OK):**
```json
[
  {
    "id": "user_id_1",
    "email": "user1@example.com",
    "name": "User One",
    "role": {
      "id": "role_id",
      "name": "Admin"
    },
    "createdAt": "2024-01-15T10:30:00.000Z",
    "updatedAt": "2024-01-15T10:30:00.000Z"
  }
]
```

**Error Responses:**
- `403 Forbidden`: Insufficient permissions

---

### 16. Create User

Create a new user (admin only).

**Endpoint:** `POST /users`

**Authentication:** Required

**Required Permission:** `users:write`

**Headers:**
```
Authorization: Bearer <access_token>
```

**Request Body:**
```json
{
  "email": "newuser@example.com",
  "name": "New User",
  "password": "SecurePass123",
  "roleId": "role_id"
}
```

**Success Response (201 Created):**
```json
{
  "id": "user_id",
  "email": "newuser@example.com",
  "name": "New User",
  "role": {
    "id": "role_id",
    "name": "User"
  },
  "createdAt": "2024-01-15T10:30:00.000Z",
  "updatedAt": "2024-01-15T10:30:00.000Z"
}
```

---

### 17. Update User

Update user information.

**Endpoint:** `PATCH /users/:id`

**Authentication:** Required

**Required Permission:** `users:write`

**Headers:**
```
Authorization: Bearer <access_token>
```

**Request Body:**
```json
{
  "name": "Updated Name",
  "roleId": "new_role_id"
}
```

**Success Response (200 OK):**
```json
{
  "id": "user_id",
  "email": "user@example.com",
  "name": "Updated Name",
  "role": {
    "id": "new_role_id",
    "name": "Manager"
  },
  "updatedAt": "2024-01-15T11:00:00.000Z"
}
```

---

### 18. Delete User

Delete a user.

**Endpoint:** `DELETE /users/:id`

**Authentication:** Required

**Required Permission:** `users:delete`

**Headers:**
```
Authorization: Bearer <access_token>
```

**Success Response (200 OK):**
```json
{
  "message": "User deleted successfully"
}
```

---

## Error Responses

### Standard Error Format

All error responses follow this format:

```json
{
  "statusCode": 400,
  "message": "Error message or array of validation errors",
  "error": "Error type",
  "timestamp": "2024-01-15T10:30:00.000Z",
  "path": "/api/endpoint"
}
```

### Common HTTP Status Codes

| Code | Description | Common Causes |
|------|-------------|---------------|
| 400 | Bad Request | Invalid input, validation errors |
| 401 | Unauthorized | Missing/invalid token, expired token |
| 403 | Forbidden | Insufficient permissions |
| 404 | Not Found | Resource doesn't exist |
| 409 | Conflict | Duplicate resource (e.g., email exists) |
| 429 | Too Many Requests | Rate limit exceeded |
| 500 | Internal Server Error | Server-side error |

### Authentication Errors

**Missing Token:**
```json
{
  "statusCode": 401,
  "message": "Unauthorized",
  "error": "Unauthorized"
}
```

**Expired Token:**
```json
{
  "statusCode": 401,
  "message": "Token has expired",
  "error": "Unauthorized"
}
```

**Invalid Token:**
```json
{
  "statusCode": 401,
  "message": "Invalid token",
  "error": "Unauthorized"
}
```

### Permission Errors

**Insufficient Permissions:**
```json
{
  "statusCode": 403,
  "message": "Forbidden resource",
  "error": "Forbidden"
}
```

### Validation Errors

**Multiple Validation Errors:**
```json
{
  "statusCode": 400,
  "message": [
    "email must be a valid email",
    "password must be longer than or equal to 8 characters",
    "password must contain uppercase, lowercase, and number"
  ],
  "error": "Bad Request"
}
```

---

## Rate Limiting

### Authentication Endpoints

Rate limiting is applied to authentication endpoints to prevent brute force attacks:

- **Limit:** 5 requests per 15 minutes per IP address
- **Applies to:** `/auth/login`, `/auth/register`

**Rate Limit Headers:**
```
X-RateLimit-Limit: 5
X-RateLimit-Remaining: 3
X-RateLimit-Reset: 1642248600
```

**Rate Limit Exceeded Response (429):**
```json
{
  "statusCode": 429,
  "message": "Too many requests. Please try again later.",
  "error": "Too Many Requests"
}
```

---

## JWT Token Format

### Access Token Payload

```json
{
  "sub": "user_id",
  "email": "user@example.com",
  "roleId": "role_id",
  "roleName": "Admin",
  "permissions": ["users:read", "users:write", "users:delete"],
  "iat": 1642248000,
  "exp": 1642248900
}
```

### Token Fields

| Field | Description |
|-------|-------------|
| sub | User ID (subject) |
| email | User's email address |
| roleId | User's role ID |
| roleName | User's role name |
| permissions | Array of permission strings |
| iat | Issued at (Unix timestamp) |
| exp | Expiration time (Unix timestamp) |

---

## Permission Requirements Summary

### Authentication Endpoints
- `POST /auth/register` - Public
- `POST /auth/login` - Public
- `POST /auth/refresh` - Public (requires valid refresh token)
- `POST /auth/logout` - Authenticated
- `GET /auth/profile` - Authenticated

### Permission Management Endpoints
- `POST /permissions` - `permissions:write`
- `GET /permissions` - `permissions:read`
- `GET /permissions/:id` - `permissions:read`
- `PATCH /permissions/:id` - `permissions:write`
- `DELETE /permissions/:id` - `permissions:write`
- `POST /permissions/assign` - `permissions:write`
- `DELETE /permissions/assign` - `permissions:write`
- `GET /permissions/role/:roleId` - `permissions:read`
- `GET /permissions/user/:userId/check/:permission` - `permissions:read`

### User Management Endpoints
- `GET /users` - `users:read`
- `POST /users` - `users:write`
- `GET /users/:id` - `users:read`
- `PATCH /users/:id` - `users:write`
- `DELETE /users/:id` - `users:delete`

---

## Example Usage

### Complete Authentication Flow

```javascript
// 1. Register
const registerResponse = await fetch('http://localhost:3001/auth/register', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    email: 'user@example.com',
    password: 'SecurePass123',
    name: 'John Doe'
  })
});
const { accessToken, refreshToken } = await registerResponse.json();

// 2. Make authenticated request
const profileResponse = await fetch('http://localhost:3001/auth/profile', {
  headers: { 
    'Authorization': `Bearer ${accessToken}`
  }
});
const profile = await profileResponse.json();

// 3. Refresh token when expired
const refreshResponse = await fetch('http://localhost:3001/auth/refresh', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({ refreshToken })
});
const { accessToken: newAccessToken } = await refreshResponse.json();

// 4. Logout
await fetch('http://localhost:3001/auth/logout', {
  method: 'POST',
  headers: { 
    'Authorization': `Bearer ${newAccessToken}`,
    'Content-Type': 'application/json'
  },
  body: JSON.stringify({ refreshToken })
});
```

---

## Postman Collection

A Postman collection with all endpoints and example requests is available at:
`.kiro/specs/jwt-authentication-system/postman-collection.json`

Import this collection into Postman for easy API testing.
