# Edit Layout Button Troubleshooting Guide

## Issue
The "Edit Layout" button is not appearing on the dashboard even after upgrading to Super Admin role.

## Root Cause
Your JWT token contains permissions that were set when you logged in. When your role was upgraded from Admin to Super Admin, your JWT token still contains the old permissions. The JWT token needs to be refreshed by logging out and logging back in.

## Solution Steps

### 1. Clear Browser Storage (Important!)
Before logging out, clear your browser's localStorage and sessionStorage:

**Option A: Using Browser DevTools**
1. Open DevTools (F12)
2. Go to Application tab
3. Under Storage → Local Storage → select your domain
4. Right-click and "Clear"
5. Under Storage → Session Storage → select your domain
6. Right-click and "Clear"
7. Under Cookies → select your domain
8. Right-click and "Clear all"

**Option B: Using Console**
```javascript
// Run this in browser console
localStorage.clear();
sessionStorage.clear();
```

### 2. Log Out Completely
1. Click your profile menu
2. Click "Logout"
3. Wait for redirect to login page

### 3. Close All Browser Tabs
Close all tabs with your application to ensure no cached state remains.

### 4. Log Back In
1. Open a new browser tab
2. Navigate to your application
3. Log in with your credentials (fouad.abt@gmail.com)

### 5. Verify Permissions
After logging in, open browser console and check:
```javascript
// Check your permissions
const token = localStorage.getItem('accessToken');
if (token) {
  const payload = JSON.parse(atob(token.split('.')[1]));
  console.log('Permissions:', payload.permissions);
  console.log('Role:', payload.roleName);
}
```

You should see:
- Role: "Super Admin"
- Permissions: ["*:*"] (wildcard permission)

### 6. Check Edit Layout Button
Navigate to `/dashboard` and you should now see the "Edit Layout" button in the page header.

## How It Works

### Permission System
- **Super Admin** has the `*:*` wildcard permission
- The `hasPermission()` function checks for:
  1. Exact permission match (e.g., `layouts:write`)
  2. Wildcard resource permission (e.g., `layouts:*`)
  3. Super admin wildcard (e.g., `*:*`)

### JWT Token Structure
```json
{
  "sub": "user-id",
  "email": "fouad.abt@gmail.com",
  "roleId": "role-id",
  "roleName": "Super Admin",
  "permissions": ["*:*"],
  "iat": 1234567890,
  "exp": 1234567890
}
```

### Edit Layout Button Logic
```typescript
// In frontend/src/app/dashboard/page.tsx
const { hasPermission } = useAuth();
const canEditLayout = hasPermission("layouts:write");

// Button only shows if canEditLayout is true
{canEditLayout && <Button>Edit Layout</Button>}
```

## Verification Checklist

- [ ] Role upgraded to Super Admin in database
- [ ] Logged out completely
- [ ] Cleared browser storage (localStorage, sessionStorage, cookies)
- [ ] Closed all browser tabs
- [ ] Logged back in
- [ ] Verified JWT token contains `*:*` permission
- [ ] Edit Layout button now visible

## Database Verification

To verify your role in the database:

```sql
SELECT 
  u.email,
  u.name,
  ur.name as role_name,
  ur.description
FROM users u
JOIN user_roles ur ON u.role_id = ur.id
WHERE u.email = 'fouad.abt@gmail.com';
```

Expected result:
- role_name: "Super Admin"
- description: "Full system access with all permissions. Cannot be deleted."

## Scripts Available

### Upgrade User to Super Admin
```bash
cd backend
node scripts/upgrade-to-super-admin.js fouad.abt@gmail.com
```

### Verify Dashboard Permissions
```bash
cd backend
npx ts-node scripts/verify-dashboard-permissions.ts
```

## Still Not Working?

If the button still doesn't appear after following all steps:

### 1. Check Browser Console for Errors
Look for any JavaScript errors that might prevent the button from rendering.

### 2. Verify WidgetProvider is Wrapping the App
The dashboard page needs to be wrapped in `WidgetProvider`:

```typescript
// Should be in frontend/src/app/layout.tsx or similar
<WidgetProvider>
  <YourApp />
</WidgetProvider>
```

### 3. Check if useWidgets Hook is Working
Add temporary logging to the dashboard page:

```typescript
const { isEditMode, toggleEditMode } = useWidgets();
console.log('useWidgets:', { isEditMode, toggleEditMode });
```

### 4. Hard Refresh the Page
- Windows/Linux: Ctrl + Shift + R
- Mac: Cmd + Shift + R

### 5. Try Incognito/Private Window
Open the application in an incognito/private browser window to rule out caching issues.

## Contact Support

If none of these steps work, provide the following information:
1. Browser console errors (if any)
2. Network tab showing the `/auth/profile` response
3. JWT token payload (from localStorage)
4. Database query result showing your role

## Summary

The Edit Layout button requires the `layouts:write` permission. Super Admin has the `*:*` wildcard permission which grants all permissions. However, permissions are stored in the JWT token, so you must log out and log back in after a role change for the new permissions to take effect.
