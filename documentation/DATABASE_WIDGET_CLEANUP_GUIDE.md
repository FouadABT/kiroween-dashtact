# Database Widget Cleanup Guide

## Overview

This guide explains how to clean up the 38 old demo widgets from the database and keep only the 2 essential demo widgets (`stats-card` and `activity-feed`).

---

## What Was Changed

### 1. Widget Seed File ✅
**File**: `backend/prisma/seed-data/widgets.seed.ts`

**Before**: 40 widget definitions  
**After**: 2 widget definitions (stats-card, activity-feed)

### 2. Cleanup Script Created ✅
**File**: `backend/scripts/cleanup-widgets.ts`

A script that:
- Removes all widget instances from user layouts
- Removes all widget definitions except the 2 demo widgets
- Provides detailed output of what was deleted

### 3. Package.json Updated ✅
Added new script: `npm run cleanup:widgets`

---

## Step-by-Step Cleanup Process

### Step 1: Backup Your Database (Optional but Recommended)

```bash
# Create a backup
cd backend
npx prisma db pull --force
```

This creates a backup of your current schema.

### Step 2: Run the Cleanup Script

```bash
cd backend
npm run cleanup:widgets
```

**What this does**:
- Finds all widgets in the database
- Identifies widgets to keep (stats-card, activity-feed)
- Deletes widget instances from user layouts
- Deletes widget definitions
- Shows a summary of what was deleted

**Expected Output**:
```
🧹 Starting widget cleanup...

📊 Found 40 widgets in database

✅ Keeping 2 widgets:
   - stats-card
   - activity-feed

🗑️  Deleting 38 widgets:
   - calendar (Calendar)
   - kanban-board (KanbanBoard)
   - timeline (Timeline)
   ... (35 more)

🔄 Deleting widget instances...
   Deleted 15 widget instances

🔄 Deleting widget definitions...
   Deleted 38 widget definitions

✅ Widget cleanup complete!

📝 Summary:
   - Widgets kept: 2
   - Widget instances deleted: 15
   - Widget definitions deleted: 38

💡 Next steps:
   1. Run: npm run prisma:seed
   2. Restart frontend dev server
   3. Test dashboard at http://localhost:3000/dashboard
```

### Step 3: Reseed the Database

```bash
npm run prisma:seed
```

This will:
- Seed the 2 demo widgets with updated metadata
- Ensure widget definitions are correct
- Set up default layouts

### Step 4: Restart Frontend

```bash
cd ../frontend
npm run dev
```

### Step 5: Verify

1. Go to `http://localhost:3000/dashboard`
2. Click "Edit Layout"
3. Click "Add Widget"
4. You should see only 2 widgets:
   - **StatsCard** (core category)
   - **ActivityFeed** (core category)

---

## What Gets Deleted

### Widget Instances
All widget instances in user layouts that reference deleted widgets will be removed. This includes:
- Widget configurations
- Widget positions
- Widget sizes

**Note**: User layouts themselves are NOT deleted, only the widget instances.

### Widget Definitions
The following 38 widgets will be removed from the database:

**Advanced** (4):
- calendar
- kanban-board
- timeline
- tree-view

**Data Display** (4):
- metric-card
- progress-widget
- list-widget
- card-grid

**Interactive** (4):
- quick-actions
- search-bar
- filter-panel
- notification-widget

**Forms** (4):
- form-card
- date-range-picker
- multi-select
- file-upload

**Layout** (4):
- page-header
- empty-state
- skeleton-loader
- error-boundary

**Utility** (4):
- avatar
- badge
- modal
- tooltip

**Integration** (5):
- api-widget
- permission-wrapper
- export-button
- bulk-actions
- theme-preview

**Specialized** (5):
- user-card
- pricing-card
- comparison-table
- chat-widget
- map-widget

**Core** (4):
- chart-widget
- data-table
- stats-grid
- widget-container

---

## What Gets Kept

### 2 Demo Widgets

**1. StatsCard**
- **Purpose**: Display single metrics with icons and trends
- **Category**: core
- **Use Cases**: KPIs, revenue metrics, user growth
- **Example**: Total Users, Revenue, Orders

**2. ActivityFeed**
- **Purpose**: Display timeline of activities
- **Category**: core
- **Use Cases**: Recent actions, system events, audit logs
- **Example**: User registrations, logins, system updates

---

## Troubleshooting

### Script Fails with "Cannot find module"

**Solution**:
```bash
cd backend
npm install
npm run cleanup:widgets
```

### Script Fails with Database Connection Error

**Solution**:
1. Check if PostgreSQL is running
2. Verify `DATABASE_URL` in `backend/.env`
3. Test connection: `npx prisma db pull`

### Widgets Still Showing in Frontend

**Solution**:
1. Clear browser cache (Ctrl+Shift+R)
2. Restart frontend dev server
3. Check if cleanup script ran successfully
4. Verify database: `npx prisma studio`

### User Layouts Are Broken

**Solution**:
User layouts with deleted widgets will show empty spaces. Users can:
1. Click "Edit Layout"
2. Remove empty widget spaces
3. Add new widgets
4. Save changes

Or reset to default:
1. Click "Edit Layout"
2. Click "Reset Layout"
3. Confirm reset

---

## Manual Cleanup (Alternative Method)

If you prefer to clean up manually using Prisma Studio:

### Step 1: Open Prisma Studio
```bash
cd backend
npx prisma studio
```

### Step 2: Delete Widget Instances
1. Go to `widget_instances` table
2. Filter by `widgetKey` NOT IN ('stats-card', 'activity-feed')
3. Select all and delete

### Step 3: Delete Widget Definitions
1. Go to `widget_definitions` table
2. Filter by `key` NOT IN ('stats-card', 'activity-feed')
3. Select all and delete

### Step 4: Reseed
```bash
npm run prisma:seed
```

---

## Verification Queries

Check what's in the database:

### Count Widgets
```sql
SELECT COUNT(*) as total_widgets FROM widget_definitions;
-- Should return: 2
```

### List Widgets
```sql
SELECT key, name, category FROM widget_definitions ORDER BY key;
-- Should return:
-- activity-feed | ActivityFeed | core
-- stats-card    | StatsCard    | core
```

### Count Widget Instances
```sql
SELECT 
  wd.key,
  wd.name,
  COUNT(wi.id) as instance_count
FROM widget_definitions wd
LEFT JOIN widget_instances wi ON wd.key = wi.widget_key
GROUP BY wd.key, wd.name
ORDER BY instance_count DESC;
```

---

## After Cleanup

### Adding New Widgets

Now that the database is clean, you can add your own widgets:

1. **Create Component**: `frontend/src/components/widgets/ecommerce/RecentOrders.tsx`
2. **Register**: Add to `frontend/src/lib/widget-registry.ts`
3. **Add to Seed**: Add to `backend/prisma/seed-data/widgets.seed.ts`
4. **Seed Database**: Run `npm run prisma:seed`
5. **Test**: Add widget to dashboard

See `WIDGET_QUICK_START.md` for detailed instructions.

---

## Rollback (If Needed)

If you need to restore the old widgets:

### Option 1: Restore from Backup
If you created a backup, restore it:
```bash
cd backend
# Restore your backup
```

### Option 2: Regenerate Widgets
```bash
cd backend
npm run discover:widgets
npm run prisma:seed
```

This will regenerate all 40+ widgets from the widget components.

---

## Summary

✅ **Cleanup Script**: Created and ready to use  
✅ **Seed File**: Updated with only 2 demo widgets  
✅ **Package.json**: Added `cleanup:widgets` script  
✅ **Documentation**: Complete guide created  

**To clean up the database, run**:
```bash
cd backend
npm run cleanup:widgets
npm run prisma:seed
```

**Then restart frontend and test!**

---

## Files Created/Modified

**Created**:
- `backend/scripts/cleanup-widgets.ts` - Cleanup script
- `DATABASE_WIDGET_CLEANUP_GUIDE.md` - This guide

**Modified**:
- `backend/prisma/seed-data/widgets.seed.ts` - Reduced to 2 widgets
- `backend/package.json` - Added cleanup script

---

## Support

For issues:
1. Check this guide
2. Review script output for errors
3. Check database with `npx prisma studio`
4. Verify seed file has only 2 widgets
5. Check browser console for frontend errors

---

**Ready to clean up? Run**: `cd backend && npm run cleanup:widgets`
