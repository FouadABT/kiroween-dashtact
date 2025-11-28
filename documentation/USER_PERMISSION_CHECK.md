# User Permission Check - fouad.abt2@gmail.com

## Issue Found

The user `fouad.abt2@gmail.com` was assigned to the old "USER" role (all caps) which had no permissions, including no notification permissions.

## Root Cause

The database has **duplicate roles**:
- **Old roles** (uppercase): USER, ADMIN, MODERATOR - created during initial setup
- **New roles** (proper case): User, Admin, Manager, Super Admin - created by seed script

The initial permission script only added notification permissions to the new roles (User, Admin, Manager), but not to the old roles (USER, ADMIN, MODERATOR).

## Roles in Database

| Role Name    | Type      | Users | Permissions | Has Notifications |
|--------------|-----------|-------|-------------|-------------------|
| User         | System    | 0     | 5           | ✅ Yes            |
| USER         | Non-system| 5     | 1           | ✅ Yes (now)      |
| Admin        | System    | 1     | 17          | ✅ Yes            |
| ADMIN        | Non-system| 1     | 3           | ✅ Yes (now)      |
| Manager      | Non-system| 0     | 7           | ✅ Yes            |
| MODERATOR    | Non-system| 0     | 1           | ✅ Yes (now)      |
| Super Admin  | System    | 0     | 1           | ✅ Yes (*:*)      |

## Solution Applied

Updated the script to add notification permissions to **both** old and new roles:

```javascript
const roles = ['User', 'Manager', 'Admin', 'USER', 'ADMIN', 'MODERATOR'];
const permissions = {
  'User': ['notifications:read'],
  'Manager': ['notifications:read'],
  'Admin': ['notifications:read', 'notifications:write', 'notifications:delete'],
  'USER': ['notifications:read'],
  'ADMIN': ['notifications:read', 'notifications:write', 'notifications:delete'],
  'MODERATOR': ['notifications:read'],
};
```

## Verification

User now has the permission:

```sql
SELECT 
  u.email,
  u.name,
  ur.name as role_name,
  STRING_AGG(p.name, ', ' ORDER BY p.name) as permissions
FROM users u
JOIN user_roles ur ON u.role_id = ur.id
LEFT JOIN role_permissions rp ON ur.id = rp.role_id
LEFT JOIN permissions p ON rp.permission_id = p.id
WHERE u.email = 'fouad.abt2@gmail.com'
GROUP BY u.email, u.name, ur.name;
```

**Result**:
| email                 | name        | role_name | permissions        |
|-----------------------|-------------|-----------|-------------------|
| fouad.abt2@gmail.com  | Fouad fouad | USER      | notifications:read |

✅ **Permission successfully added!**

## Important: Token Refresh Required

**The user MUST log out and log back in** to get a new JWT token with the updated permissions.

### Why?
- Permissions are embedded in the JWT token at login time
- The token is not automatically updated when permissions change in the database
- A new login generates a new token with current permissions

### Steps for User
1. Log out of the application
2. Log back in with the same credentials
3. The notification bell should now work without 403 errors

## Affected Users

All users with the old "USER" role (5 users total) now have `notifications:read` permission. They all need to log out and log back in.

## Recommendation: Role Migration

Consider migrating all users from old roles (USER, ADMIN, MODERATOR) to new roles (User, Admin, Manager) to avoid confusion:

```sql
-- Migrate USER to User
UPDATE users 
SET role_id = (SELECT id FROM user_roles WHERE name = 'User')
WHERE role_id = (SELECT id FROM user_roles WHERE name = 'USER');

-- Migrate ADMIN to Admin
UPDATE users 
SET role_id = (SELECT id FROM user_roles WHERE name = 'Admin')
WHERE role_id = (SELECT id FROM user_roles WHERE name = 'ADMIN');

-- Then delete old roles
DELETE FROM user_roles WHERE name IN ('USER', 'ADMIN', 'MODERATOR');
```

This would ensure all users use the system roles with proper permissions.
