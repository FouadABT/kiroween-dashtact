# Feature Flags System - Testing & Verification Guide

## Overview

This guide provides step-by-step instructions for testing the Feature Flags System across different scenarios. The system allows you to enable/disable features via environment variables and automatically creates a default admin account on fresh installations.

## Quick Start

### Prerequisites
- Backend running on `http://localhost:3001`
- Frontend running on `http://localhost:3000`
- PostgreSQL database running
- Both `.env` files configured with feature flags

### Test Scenarios

---

## Test 1: Fresh Install - All Features Enabled

**Objective**: Verify that a fresh installation with all features enabled creates the default admin account and seeds all data correctly.

### Setup
1. **Reset the database**:
   ```bash
   cd backend
   npx prisma migrate reset
   ```
   - This will delete all data and re-apply migrations
   - When prompted, confirm the reset

2. **Verify environment variables** in `backend/.env`:
   ```env
   ENABLE_LANDING=true
   ENABLE_BLOG=true
   ENABLE_ECOMMERCE=true
   ENABLE_CALENDAR=true
   ENABLE_CRM=false
   ENABLE_NOTIFICATIONS=true
   ENABLE_CUSTOMER_ACCOUNT=true
   ```

3. **Verify environment variables** in `frontend/.env.local`:
   ```env
   NEXT_PUBLIC_ENABLE_LANDING=true
   NEXT_PUBLIC_ENABLE_BLOG=true
   NEXT_PUBLIC_ENABLE_ECOMMERCE=true
   NEXT_PUBLIC_ENABLE_CALENDAR=true
   NEXT_PUBLIC_ENABLE_CRM=false
   NEXT_PUBLIC_ENABLE_NOTIFICATIONS=true
   NEXT_PUBLIC_ENABLE_CUSTOMER_ACCOUNT=true
   ```

### Execution Steps

1. **Run the seed**:
   ```bash
   cd backend
   npm run prisma:seed
   ```
   
   **Expected Output**:
   ```
   🌱 Seeding database...
   📋 Feature Flags:
     ✅ Landing: true
     ✅ Blog: true
     ✅ E-commerce: true
     ✅ Calendar: true
     ✅ CRM: false
     ✅ Notifications: true
     ✅ Customer Account: true
   Creating permissions...
   ✅ Created permission: ...
   ...
   ✅ Default admin account created successfully
   📧 Email: admin@dashtact.com
   🔑 Password: dashtact
   ⚠️  IMPORTANT: Change the default password immediately after first login!
   ```

2. **Verify setup status**:
   ```bash
   curl http://localhost:3001/setup/status
   ```
   
   **Expected Response**:
   ```json
   {
     "isFirstRun": false,
     "setupCompleted": true
   }
   ```

3. **Log in with default credentials**:
   - Navigate to `http://localhost:3000/login`
   - Email: `admin@dashtact.com`
   - Password: `dashtact`
   - Click "Sign In"

4. **Verify dashboard shows all features**:
   - ✅ Blog menu visible in sidebar
   - ✅ E-commerce menu visible in sidebar
   - ✅ Calendar menu visible in sidebar
   - ✅ Notifications menu visible in sidebar
   - ✅ Customer Account menu visible in sidebar
   - ❌ CRM menu NOT visible (disabled)

5. **Verify all data was seeded**:
   - Navigate to `/dashboard/blog` - should show blog management
   - Navigate to `/dashboard/ecommerce/products` - should show products
   - Navigate to `/dashboard/calendar` - should show calendar
   - Navigate to `/dashboard/notifications` - should show notifications

### Verification Checklist
- [ ] Database reset successfully
- [ ] Seed completed without errors
- [ ] Default admin account created
- [ ] Setup status endpoint returns correct values
- [ ] Can log in with default credentials
- [ ] All enabled features visible in dashboard
- [ ] Disabled features (CRM) not visible in dashboard
- [ ] All feature data seeded correctly

---

## Test 2: Selective Features - Some Disabled

**Objective**: Verify that when some features are disabled, only enabled features are seeded and accessible.

### Setup
1. **Reset the database**:
   ```bash
   cd backend
   npx prisma migrate reset
   ```

2. **Update environment variables** in `backend/.env`:
   ```env
   ENABLE_LANDING=true
   ENABLE_BLOG=true
   ENABLE_ECOMMERCE=false
   ENABLE_CALENDAR=true
   ENABLE_CRM=false
   ENABLE_NOTIFICATIONS=true
   ENABLE_CUSTOMER_ACCOUNT=false
   ```

3. **Update environment variables** in `frontend/.env.local`:
   ```env
   NEXT_PUBLIC_ENABLE_LANDING=true
   NEXT_PUBLIC_ENABLE_BLOG=true
   NEXT_PUBLIC_ENABLE_ECOMMERCE=false
   NEXT_PUBLIC_ENABLE_CALENDAR=true
   NEXT_PUBLIC_ENABLE_CRM=false
   NEXT_PUBLIC_ENABLE_NOTIFICATIONS=true
   NEXT_PUBLIC_ENABLE_CUSTOMER_ACCOUNT=false
   ```

### Execution Steps

1. **Run the seed**:
   ```bash
   cd backend
   npm run prisma:seed
   ```
   
   **Expected Output**:
   ```
   📋 Feature Flags:
     ✅ Landing: true
     ✅ Blog: true
     ✅ E-commerce: false
     ✅ Calendar: true
     ✅ CRM: false
     ✅ Notifications: true
     ✅ Customer Account: false
   ```

2. **Log in with default credentials**:
   - Email: `admin@dashtact.com`
   - Password: `dashtact`

3. **Verify only enabled features are visible**:
   - ✅ Blog menu visible
   - ❌ E-commerce menu NOT visible
   - ✅ Calendar menu visible
   - ✅ Notifications menu visible
   - ❌ Customer Account menu NOT visible
   - ❌ CRM menu NOT visible

4. **Test disabled feature routes**:
   - Try to access `/shop` - should redirect to `/dashboard`
   - Try to access `/cart` - should redirect to `/dashboard`
   - Try to access `/checkout` - should redirect to `/dashboard`
   - Try to access `/account` - should redirect to `/dashboard`

5. **Test disabled feature API endpoints**:
   ```bash
   # Get auth token first
   curl -X POST http://localhost:3001/auth/login \
     -H "Content-Type: application/json" \
     -d '{"email":"admin@dashtact.com","password":"dashtact"}'
   
   # Try to access disabled ecommerce API
   curl http://localhost:3001/products \
     -H "Authorization: Bearer <token>"
   ```
   
   **Expected Response**: `403 Forbidden` with message "Feature 'ecommerce' is not enabled"

6. **Verify only enabled data was seeded**:
   - Blog posts should exist
   - Products should NOT exist
   - Calendar events should exist
   - Customer account data should NOT exist

### Verification Checklist
- [ ] Database reset successfully
- [ ] Seed completed with correct feature flags
- [ ] Only enabled features visible in dashboard
- [ ] Disabled feature routes redirect correctly
- [ ] Disabled feature APIs return 403 Forbidden
- [ ] Only enabled feature data was seeded
- [ ] No data for disabled features exists

---

## Test 3: Existing Installation - Admin Account Not Recreated

**Objective**: Verify that when running seed on an existing installation, the default admin account is not recreated.

### Setup
1. **Keep existing database** (from Test 1 or Test 2)
   - Do NOT reset the database
   - Admin account should already exist

2. **Verify admin account exists**:
   ```bash
   curl http://localhost:3001/setup/status
   ```
   
   **Expected Response**:
   ```json
   {
     "isFirstRun": false,
     "setupCompleted": true
   }
   ```

### Execution Steps

1. **Run the seed again**:
   ```bash
   cd backend
   npm run prisma:seed
   ```
   
   **Expected Output**:
   ```
   🌱 Seeding database...
   ...
   ⏭️  Admin account already exists, skipping creation
   ...
   ```

2. **Verify no duplicate admin accounts**:
   ```bash
   # Query the database
   cd backend
   npx prisma studio
   ```
   - Navigate to `User` table
   - Filter by email: `admin@dashtact.com`
   - Should show exactly 1 record

3. **Verify admin account is unchanged**:
   - Email should still be `admin@dashtact.com`
   - Role should still be `Super Admin`
   - Account should still be active and verified

4. **Verify seed completes successfully**:
   - No errors in console output
   - All other seeds complete normally
   - Existing data is preserved

### Verification Checklist
- [ ] Setup status shows `isFirstRun: false`
- [ ] Seed runs without errors
- [ ] Admin account creation is skipped
- [ ] No duplicate admin accounts created
- [ ] Admin account properties unchanged
- [ ] Existing data preserved
- [ ] Seed completes successfully

---

## Test 4: Feature Flag Performance

**Objective**: Verify that feature flag checks are fast (< 1ms per lookup) and don't query the database.

### Execution Steps

1. **Run the performance test**:
   ```bash
   cd backend
   npx ts-node test-feature-flags.ts
   ```

2. **Expected Output**:
   ```
   🧪 Feature Flags System - Testing & Verification
   
   ============================================================
   ✅ Fresh Install Detection
      ✅ Fresh install detection working correctly...
      ⏱️  45ms
   
   ✅ Feature Flag Configuration
      ✅ Feature flags configured correctly...
      ⏱️  12ms
   
   ✅ Default Admin Account Creation
      ✅ Default admin account created correctly...
      ⏱️  23ms
   
   ✅ Conditional Seed Execution
      ✅ Conditional seed execution working correctly...
      ⏱️  34ms
   
   ✅ Feature Guard Protection
      ✅ Feature guard protection working correctly...
      ⏱️  156ms
   
   ✅ Feature Flag Performance
      ✅ Feature flag performance excellent. Average lookup: 0.0001ms
      ⏱️  89ms
   
   ✅ Dashboard Menu Filtering
      ✅ Dashboard menu filtering working correctly...
      ⏱️  67ms
   
   ============================================================
   
   📊 Test Results
   
   ✅ Fresh Install Detection
      ✅ Fresh install detection working correctly...
      ⏱️  45ms
   
   ✅ Feature Flag Configuration
      ✅ Feature flags configured correctly...
      ⏱️  12ms
   
   ✅ Default Admin Account Creation
      ✅ Default admin account created correctly...
      ⏱️  23ms
   
   ✅ Conditional Seed Execution
      ✅ Conditional seed execution working correctly...
      ⏱️  34ms
   
   ✅ Feature Guard Protection
      ✅ Feature guard protection working correctly...
      ⏱️  156ms
   
   ✅ Feature Flag Performance
      ✅ Feature flag performance excellent. Average lookup: 0.0001ms
      ⏱️  89ms
   
   ✅ Dashboard Menu Filtering
      ✅ Dashboard menu filtering working correctly...
      ⏱️  67ms
   
   ============================================================
   
   📈 Summary: 7 passed, 0 failed out of 7 tests
   
   🎉 All tests passed!
   ```

3. **Verify performance metrics**:
   - Average feature flag lookup: < 1ms ✅
   - No database queries for flag checks ✅
   - All tests pass ✅

### Performance Expectations
- Feature flag lookup: < 0.001ms (in-memory)
- Setup status check: < 100ms (includes DB query)
- Feature guard check: < 50ms (includes auth)
- Menu filtering: < 100ms (includes DB query)
- Seed execution: < 30 seconds (depends on feature count)

### Verification Checklist
- [ ] Performance test script runs successfully
- [ ] All 7 tests pass
- [ ] Feature flag lookup < 1ms
- [ ] No database queries for flag checks
- [ ] Setup status endpoint responsive
- [ ] Feature guard protection working
- [ ] Menu filtering working correctly

---

## Troubleshooting

### Issue: "Admin account already exists" but setup status shows `isFirstRun: true`

**Solution**:
1. Check if Super Admin role exists:
   ```bash
   cd backend
   npx prisma studio
   # Navigate to UserRole table
   # Look for "Super Admin" role
   ```

2. If role doesn't exist, create it:
   ```bash
   npx prisma db execute --stdin < create-super-admin-role.sql
   ```

### Issue: Feature flag changes not taking effect

**Solution**:
1. Restart the backend server:
   ```bash
   # Stop the running server (Ctrl+C)
   npm run start:dev
   ```

2. Feature flags are read at startup, not dynamically

### Issue: Disabled feature still accessible

**Solution**:
1. Verify environment variables are set correctly:
   ```bash
   echo $ENABLE_BLOG  # Should print "true" or "false"
   ```

2. Restart the backend server to pick up changes

3. Clear browser cache and restart frontend dev server

### Issue: Seed fails with "Role not found"

**Solution**:
1. Ensure auth seed runs first:
   ```bash
   cd backend
   npx prisma migrate reset
   npm run prisma:seed
   ```

2. Check that `DEFAULT_ROLES` are defined in `seed-data/auth.seed.ts`

### Issue: Performance test shows slow lookups

**Solution**:
1. Verify feature flags are loaded in-memory:
   ```bash
   # Check that isFeatureEnabled doesn't query database
   grep -n "prisma" src/config/features.config.ts
   # Should return no results
   ```

2. Ensure no middleware is intercepting flag checks

---

## Manual Testing Checklist

### Fresh Install (Test 1)
- [ ] Database reset
- [ ] Seed runs successfully
- [ ] Admin account created
- [ ] Can log in
- [ ] All features visible
- [ ] All data seeded

### Selective Features (Test 2)
- [ ] Database reset
- [ ] Seed runs with correct flags
- [ ] Only enabled features visible
- [ ] Disabled routes redirect
- [ ] Disabled APIs return 403
- [ ] Only enabled data seeded

### Existing Installation (Test 3)
- [ ] Seed runs without reset
- [ ] Admin account not recreated
- [ ] No duplicate accounts
- [ ] Existing data preserved
- [ ] Seed completes successfully

### Performance (Test 4)
- [ ] Performance test passes
- [ ] All 7 tests pass
- [ ] Lookup time < 1ms
- [ ] No database queries for flags

---

## Success Criteria

✅ **All tests pass** when:
1. Fresh install creates admin account and seeds all enabled features
2. Selective features only seed enabled data
3. Existing installations don't recreate admin account
4. Feature flag lookups are < 1ms
5. Disabled features return 403 Forbidden
6. Disabled routes redirect correctly
7. Menu filtering works correctly

---

## Next Steps

After successful testing:
1. Document any issues found
2. Update feature flags as needed
3. Deploy to staging environment
4. Run full integration tests
5. Deploy to production

---

## Support

For issues or questions:
1. Check the troubleshooting section above
2. Review the Feature Flags System design document
3. Check backend logs for errors
4. Run the performance test script for diagnostics
