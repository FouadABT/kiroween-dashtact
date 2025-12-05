# Menu Management & Dashboard Customization Guide

## Quick Access Guide

### 1. Menu Management (Add/Remove/Update Menus)

**Location**: Dashboard → Settings → Menu Management

**Direct URL**: `http://localhost:3000/dashboard/settings/menus`

**Requirements**:
- Role: Super Admin
- Permission: `menus:view`

**What You Can Do**:
- ✅ Create new menu items
- ✅ Edit existing menus
- ✅ Delete menus
- ✅ Reorder menus (drag & drop)
- ✅ Create nested menu structures
- ✅ Toggle menu active/inactive
- ✅ Set permissions and roles for menus
- ✅ Configure page types (Widget-based, Hardcoded, Custom, External)

### 2. Dashboard Customization (Edit Layout)

**Available on**:
- Main Dashboard: `/dashboard`
- Analytics Dashboard: `/dashboard/analytics`

**How to Access**:
1. Navigate to Dashboard or Analytics page
2. Look for "Edit Layout" button in the top right
3. Click to enter edit mode

**What You Can Do**:
- ✅ Add widgets from the widget library
- ✅ Remove widgets
- ✅ Resize widgets
- ✅ Drag & drop to rearrange
- ✅ Save custom layouts

---

## Current Dashboard Pages

### Widget-Based Pages (Customizable)
These pages support the "Edit Layout" button:

1. **Main Dashboard** (`/dashboard`)
   - Page ID: `main-dashboard`
   - ✅ Edit Layout Available
   - Default widgets: Stats, Activity Feed, Recent Orders

2. **Analytics Dashboard** (`/dashboard/analytics`)
   - Page ID: `analytics-dashboard`
   - ✅ Edit Layout Available
   - Default widgets: Charts, Metrics, Performance data

### Hardcoded Pages (Not Customizable)
These pages have fixed layouts:

- E-commerce pages (Products, Orders, Customers, Inventory)
- Pages management
- Blog
- Settings

---

## How to Use Menu Management

### Access Menu Management

1. **Login** as Super Admin (fouad.abt@gmail.com)
2. **Navigate** to Dashboard
3. **Click** on "Settings" in the sidebar
4. **Click** on "Menu Management" (new submenu item)

### Create a New Menu Item

1. Click "Create New Menu" button
2. Fill in the form:
   - **Label**: Display name (e.g., "Reports")
   - **Key**: Unique identifier (e.g., "reports")
   - **Icon**: Icon name from Lucide icons (e.g., "FileText")
   - **Route**: URL path (e.g., "/dashboard/reports")
   - **Order**: Display order (number)
   - **Page Type**: Choose one:
     - **WIDGET_BASED**: Customizable dashboard with widgets
     - **HARDCODED**: Fixed page component
     - **CUSTOM**: Mix of widgets and custom content
     - **EXTERNAL**: External URL
   - **Page Identifier**: For WIDGET_BASED pages (e.g., "reports-dashboard")
   - **Component Path**: For HARDCODED pages (e.g., "/dashboard/reports/page")
   - **Permissions**: Required permissions (optional)
   - **Roles**: Required roles (optional)
   - **Feature Flag**: Feature flag name (optional)
   - **Description**: Menu description
3. Click "Save"

### Edit an Existing Menu

1. Find the menu in the list
2. Click the "Edit" button (pencil icon)
3. Update the fields
4. Click "Save"

### Delete a Menu

1. Find the menu in the list
2. Click the "Delete" button (trash icon)
3. Confirm deletion
4. **Note**: Cannot delete menus with children

### Create Nested Menus

1. Create the parent menu first
2. Create a child menu
3. In the child menu form, select the parent from "Parent Menu" dropdown
4. The child will appear nested under the parent in the sidebar

### Reorder Menus

1. Use drag & drop to reorder menus
2. Changes save automatically
3. Order affects sidebar display

### Toggle Menu Active/Inactive

1. Find the menu in the list
2. Click the toggle switch
3. Inactive menus won't appear in the sidebar

---

## Why Analytics Page Shows Edit Layout

The Analytics page **DOES** support the Edit Layout button because:

1. ✅ It uses `DashboardGrid` component
2. ✅ It has `pageId="analytics"`
3. ✅ A default layout exists in the database
4. ✅ You have the required permissions

**If you don't see the Edit Layout button**:
- Clear your browser cache
- Log out and log back in
- Check browser console for errors
- Verify you're on the correct page (`/dashboard/analytics`)

---

## Menu Configuration Examples

### Example 1: Widget-Based Dashboard

```typescript
{
  key: 'reports',
  label: 'Reports',
  icon: 'FileText',
  route: '/dashboard/reports',
  order: 7,
  pageType: 'WIDGET_BASED',
  pageIdentifier: 'reports-dashboard',
  isActive: true,
  requiredPermissions: ['reports:read'],
  description: 'Customizable reports dashboard'
}
```

### Example 2: Hardcoded Page

```typescript
{
  key: 'users',
  label: 'Users',
  icon: 'Users',
  route: '/dashboard/users',
  order: 8,
  pageType: 'HARDCODED',
  componentPath: '/dashboard/users/page',
  isActive: true,
  requiredPermissions: ['users:read'],
  description: 'User management page'
}
```

### Example 3: Nested Menu

```typescript
// Parent
{
  key: 'reports',
  label: 'Reports',
  icon: 'FileText',
  route: '/dashboard/reports',
  order: 7,
  pageType: 'WIDGET_BASED',
  pageIdentifier: 'reports-dashboard',
  isActive: true
}

// Child
{
  key: 'reports-sales',
  label: 'Sales Reports',
  icon: 'TrendingUp',
  route: '/dashboard/reports/sales',
  order: 1,
  parentId: 'reports', // Links to parent
  pageType: 'HARDCODED',
  componentPath: '/dashboard/reports/sales/page',
  isActive: true
}
```

### Example 4: External Link

```typescript
{
  key: 'documentation',
  label: 'Documentation',
  icon: 'BookOpen',
  route: 'https://docs.example.com',
  order: 9,
  pageType: 'EXTERNAL',
  isActive: true,
  description: 'External documentation link'
}
```

---

## Current Menu Structure

After seeding, your menu structure is:

```
📊 Dashboard (Widget-based)
📈 Analytics (Widget-based)
🛒 E-Commerce (Hardcoded)
  ├─ 📦 Products
  ├─ 🛍️ Orders
  ├─ 👥 Customers
  └─ 🏭 Inventory
📄 Pages (Hardcoded)
📝 Blog (Hardcoded)
⚙️ Settings (Hardcoded)
  ├─ 📋 Menu Management (NEW!)
  └─ 🛒 E-commerce Settings
```

---

## Permissions Required

### Menu Management
- **View**: `menus:view`
- **Create**: `menus:create`
- **Update**: `menus:update`
- **Delete**: `menus:delete`

### Dashboard Customization
- **View Layouts**: `layouts:read`
- **Edit Layouts**: `layouts:write`
- **View Widgets**: `widgets:read`

### Your Current Permissions
As Super Admin, you have:
- ✅ `*:*` (All permissions)
- ✅ All menu management permissions
- ✅ All dashboard customization permissions

---

## Troubleshooting

### "Edit Layout" Button Not Showing

**Possible Causes**:
1. Page is not widget-based
2. No layout exists for the page
3. Missing permissions
4. Frontend cache issue

**Solutions**:
```bash
# 1. Check if layout exists
SELECT * FROM dashboard_layouts WHERE page_id = 'analytics';

# 2. Clear browser cache
# - Hard refresh: Ctrl+Shift+R (Windows) or Cmd+Shift+R (Mac)
# - Clear localStorage
# - Log out and log back in

# 3. Verify permissions
SELECT p.name FROM users u
JOIN user_roles ur ON u.role_id = ur.id
JOIN role_permissions rp ON rp.role_id = ur.id
JOIN permissions p ON p.id = rp.permission_id
WHERE u.email = 'fouad.abt@gmail.com';
```

### Menu Management Page Not Accessible

**Check**:
1. ✅ You're logged in as Super Admin
2. ✅ Menu exists in database
3. ✅ Menu is active
4. ✅ You have `menus:view` permission

**Verify**:
```sql
-- Check menu exists
SELECT * FROM dashboard_menus WHERE key = 'settings-menus';

-- Check your permissions
SELECT p.name FROM users u
JOIN user_roles ur ON u.role_id = ur.id
JOIN role_permissions rp ON rp.role_id = ur.id
JOIN permissions p ON p.id = rp.permission_id
WHERE u.email = 'fouad.abt@gmail.com'
AND p.name LIKE 'menus:%';
```

### Menu Not Appearing in Sidebar

**Possible Causes**:
1. Menu is inactive
2. Missing required permissions
3. Feature flag disabled
4. Parent menu is inactive

**Solutions**:
1. Check menu is active in Menu Management
2. Verify you have required permissions
3. Check feature flags are enabled
4. Ensure parent menus are active

---

## Next Steps

### 1. Access Menu Management
```
1. Go to: http://localhost:3000/dashboard/settings/menus
2. You should see the menu management interface
3. Try creating a test menu
```

### 2. Test Dashboard Customization
```
1. Go to: http://localhost:3000/dashboard/analytics
2. Look for "Edit Layout" button (top right)
3. Click to enter edit mode
4. Try adding/removing widgets
```

### 3. Create a Custom Dashboard
```
1. Go to Menu Management
2. Create new menu with:
   - Label: "My Dashboard"
   - Page Type: WIDGET_BASED
   - Page Identifier: "my-custom-dashboard"
3. Create the page file at: frontend/src/app/dashboard/my-custom/page.tsx
4. Use DashboardGrid component with your page identifier
```

---

## Quick Reference

| Task | Location | Permission |
|------|----------|------------|
| Add/Edit Menus | Settings → Menu Management | `menus:view` |
| Customize Dashboard | Dashboard → Edit Layout | `layouts:write` |
| Customize Analytics | Analytics → Edit Layout | `layouts:write` |
| View Widget Library | Edit Layout → Add Widget | `widgets:read` |
| Manage Settings | Settings | `settings:read` |

---

## Support

If you encounter issues:
1. Check browser console for errors
2. Verify database has required data
3. Confirm permissions are correct
4. Clear cache and try again
5. Check backend logs for API errors

**Your Current Setup**:
- ✅ User: fouad.abt@gmail.com
- ✅ Role: Super Admin
- ✅ Permissions: All (*)
- ✅ Menu Management: Available
- ✅ Dashboard Customization: Available
