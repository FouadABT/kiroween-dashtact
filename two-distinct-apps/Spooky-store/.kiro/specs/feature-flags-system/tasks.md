# Implementation Plan

- [x] 1. Core Configuration - Feature Flags Setup










- [x] 1.1 Extend Frontend Feature Config



  - Update `frontend/src/config/features.config.ts`
  - Add FeatureFlags interface with 7 features (landing, blog, ecommerce, calendar, crm, notifications, customerAccount)
  - Add PageVisibility interface with 4 pages (showHomePage, showShopPage, showBlogPage, showAccountPage)
  - Add `isFeatureEnabled(feature)` function
  - Add `isPageVisible(page)` function
  - Read from `NEXT_PUBLIC_ENABLE_*` and `NEXT_PUBLIC_SHOW_*` environment variables

  - _Requirements: 1.1, 1.2, 1.3, 1.4, 1.5, 1.6_



- [x] 1.2 Create Backend Feature Config


  - Create `backend/src/config/features.config.ts`
  - Add FeatureFlags interface matching frontend
  - Add `isFeatureEnabled(feature)` function
  - Read from `ENABLE_*` environment variables
  - Ensure consistency with frontend feature names

  - _Requirements: 1.1, 1.2, 1.3, 1.5, 1.6_



- [x] 1.3 Update Environment Files


  - Add feature flags to `frontend/.env.local`
  - Add feature flags to `backend/.env`
  - Include all 7 features with default values (true/false)
  - Include all 4 page visibility flags
  - Add SETUP_COMPLETED flag

  - _Requirements: 1.1, 1.2, 1.3, 1.4_


- [x] 2. Fresh Install Detection





- [x] 2.1 Create Setup Service


  - Create `backend/src/setup/setup.service.ts`
  - Implement `isFirstRun()` - checks if Super Admin user exists
  - Implement `getSetupStatus()` - returns { isFirstRun, setupCompleted }
  - Implement `createDefaultAdminAccount()` - creates admin@dashtact.com with hashed password
  - Use bcrypt with 10 salt rounds for password hashing
  - Log creation details and warning message

  - _Requirements: 2.1, 2.2, 2.3, 3.1, 3.2, 3.3, 3.4, 3.5, 3.6_


- [ ] 2.2 Create Setup Controller

  - Create `backend/src/setup/setup.controller.ts`
  - Implement `GET /setup/status` endpoint
  - Mark endpoint as @Public() (no authentication required)
  - Return setup status from SetupService

  - _Requirements: 2.1, 2.2, 2.3_


- [ ] 2.3 Create Setup Module

  - Create `backend/src/setup/setup.module.ts`
  - Import PrismaModule
  - Provide SetupService
  - Export SetupService for use in seed
  - Register SetupController


  - _Requirements: 2.1, 2.2, 2.3_

- [ ] 2.4 Register Setup Module in App

  - Update `backend/src/app.module.ts`
  - Add SetupModule to imports array
  - Verify module loads without errors

  - _Requirements: 2.1, 2.2, 2.3_

- [-] 3. Conditional Seed Execution



- [x] 3.1 Update Main Seed File



  - Update `backend/prisma/seed.ts`
  - Read feature flags from environment at start
  - Log enabled features
  - Call seedAuth() - always run
  - Call seedDashboardMenus(prisma, featureFlags) - pass flags
  - Conditionally call seedBlog, seedProducts, seedCalendar, seedNotifications based on flags
  - Call seedWidgets(prisma, featureFlags) - pass flags
  - Call setupService.createDefaultAdminAccount() after seeds
  - Add error handling and logging

  - _Requirements: 4.1, 4.2, 4.3, 4.4, 4.5, 4.6, 4.7_

- [x] 3.2 Update Dashboard Menus Seed



  - Update `backend/prisma/seed-data/dashboard-menus.seed.ts`
  - Add featureFlags parameter to seedDashboardMenus function
  - Use conditional spread operator to include/exclude menus based on flags
  - Only create blog menu if featureFlags.blog === true
  - Only create ecommerce menu if featureFlags.ecommerce === true
  - Only create calendar menu if featureFlags.calendar === true
  - Only create crm menu if featureFlags.crm === true

  - _Requirements: 4.1, 4.2, 4.3, 4.4, 4.5, 4.6_



- [x] 3.3 Update Widgets Seed


  - Update `backend/prisma/seed-data/dashboard-widgets.seed.ts`
  - Add featureFlags parameter to seedWidgets function
  - Conditionally create widgets based on enabled features
  - Only create blog widgets if featureFlags.blog === true
  - Only create ecommerce widgets if featureFlags.ecommerce === true
  - Only create calendar widgets if featureFlags.calendar === true

  - _Requirements: 4.1, 4.2, 4.3, 4.4, 4.5, 4.6_

- [x] 4. Backend Route Protection







- [x] 4.1 Create Feature Guard


  - Create `backend/src/common/decorators/feature-enabled.decorator.ts`
  - Create `@FeatureEnabled(feature)` decorator
  - Create `backend/src/common/guards/feature.guard.ts`
  - Implement FeatureGuard that checks if feature is enabled
  - Return 403 Forbidden if feature disabled
  - Use Reflector to get required feature from decorator

  - _Requirements: 5.1, 5.2, 5.3, 5.4, 5.5, 5.6_


- [x] 4.2 Apply Feature Guard to Blog Controller


  - Update `backend/src/blog/blog.controller.ts`
  - Add @UseGuards(JwtAuthGuard, FeatureGuard) to controller
  - Add @FeatureEnabled('blog') to controller
  - Verify all blog routes protected

  - _Requirements: 5.1, 5.2, 5.3, 5.4, 5.5, 5.6_


- [x] 4.3 Apply Feature Guard to E-commerce Controllers


  - Update `backend/src/products/products.controller.ts`
  - Update `backend/src/orders/orders.controller.ts`
  - Update `backend/src/inventory/inventory.controller.ts`
  - Add @UseGuards(JwtAuthGuard, FeatureGuard) to each
  - Add @FeatureEnabled('ecommerce') to each

  - _Requirements: 5.1, 5.2, 5.3, 5.4, 5.5, 5.6_


- [x] 4.4 Apply Feature Guard to Calendar Controller


  - Update `backend/src/calendar/calendar.controller.ts`
  - Add @UseGuards(JwtAuthGuard, FeatureGuard)
  - Add @FeatureEnabled('calendar')

  - _Requirements: 5.1, 5.2, 5.3, 5.4, 5.5, 5.6_

- [-] 5. Frontend Route Protection




- [x] 5.1 Protect Blog Routes


  - Update `frontend/src/app/blog/layout.tsx`
  - Check `isFeatureEnabled('blog')`
  - Redirect to /dashboard if disabled
  - Redirect to /login if not authenticated

  - _Requirements: 5.1, 5.2, 5.3, 5.4, 5.5_



- [ ] 5.2 Protect Shop Routes

  - Update `frontend/src/app/shop/layout.tsx`
  - Check `isFeatureEnabled('ecommerce')`
  - Redirect to /dashboard if disabled


  - _Requirements: 5.1, 5.2, 5.3, 5.4, 5.5_

- [x] 5.3 Protect Cart and Checkout Routes


  - Update `frontend/src/app/cart/layout.tsx`
  - Update `frontend/src/app/checkout/layout.tsx`
  - Check `isFeatureEnabled('ecommerce')`
  - Redirect if disabled

  - _Requirements: 5.1, 5.2, 5.3, 5.4, 5.5_


- [x] 5.4 Protect Account Routes



  - Update `frontend/src/app/account/layout.tsx`
  - Check `isFeatureEnabled('customerAccount')`
  - Redirect if disabled

  - _Requirements: 5.1, 5.2, 5.3, 5.4, 5.5_

- [-] 6. Navigation Menu Filtering




- [x] 6.1 Filter Navigation Menus


  - Update `frontend/src/contexts/NavigationContext.tsx`
  - Add filterMenusByFeatures function
  - Map menu keys to feature flags (blog, ecommerce, calendar, crm)
  - Filter menus before rendering
  - Only show menus for enabled features

  - _Requirements: 5.3, 5.6, 6.1, 6.2, 6.3, 6.4, 6.5, 6.6_


- [x] 6.2 Test Menu Filtering















  - Test with all features enabled
  - Test with some features disabled
  - Test with only dashboard enabled
  - Verify correct menus shown/hidden

  - _Requirements: 5.3, 5.6, 6.1, 6.2, 6.3, 6.4, 6.5, 6.6_

- [x] 7. Testing and Verification










- [x] 7.1 Manual Testing - Fresh Install


  - [ ] Delete database or reset with `npx prisma migrate reset`
  - [ ] Set all features to true in .env
  - [ ] Run seed: `npm run prisma:seed`
  - [ ] Verify admin account created (admin@dashtact.com)
  - [ ] Verify all menus created
  - [ ] Verify all widgets created
  - [ ] Log in with default credentials
  - [ ] Verify dashboard shows all features

  - _Requirements: 2.1, 2.2, 2.3, 3.1, 3.2, 3.3, 3.4, 3.5, 3.6, 4.1, 4.2, 4.3, 4.4, 4.5, 4.6, 4.7_


- [x] 7.2 Manual Testing - Selective Features


  - [ ] Reset database
  - [ ] Set only blog and calendar to true, others false
  - [ ] Run seed
  - [ ] Verify only blog and calendar menus created
  - [ ] Verify only blog and calendar widgets created
  - [ ] Verify shop route redirects to dashboard
  - [ ] Verify ecommerce API returns 403

  - _Requirements: 4.1, 4.2, 4.3, 4.4, 4.5, 4.6, 4.7, 5.1, 5.2, 5.3, 5.4, 5.5, 5.6_


- [x] 7.3 Manual Testing - Existing Installation


  - [ ] Keep existing database with admin user
  - [ ] Run seed again
  - [ ] Verify admin account NOT recreated
  - [ ] Verify no duplicate admin accounts
  - [ ] Verify seed completes successfully


  - _Requirements: 2.1, 2.2, 2.3, 3.1, 3.2, 3.3, 3.4, 3.5, 3.6_

- [x] 7.4 Verify Feature Flag Performance


  - [ ] Check feature flag lookup time < 1ms
  - [ ] Verify no database queries for flag checks
  - [ ] Verify in-memory access only

  - _Requirements: 6.1, 6.2, 6.3, 6.4, 6.5, 6.6_

- [ ] 8. Documentation

- [ ] 8.1 Update README

  - [ ] Document feature flags
  - [ ] Document environment variables
  - [ ] Document default credentials
  - [ ] Document how to enable/disable features
  - [ ] Add warning about changing default password

  - _Requirements: 1.1, 1.2, 1.3, 1.4, 2.1, 2.2, 2.3, 3.1, 3.2, 3.3, 3.4, 3.5, 3.6_

- [ ] 8.2 Create Troubleshooting Guide

  - [ ] Document common issues
  - [ ] Document how to reset database
  - [ ] Document how to change feature flags
  - [ ] Document how to recreate admin account

  - _Requirements: 1.1, 1.2, 1.3, 1.4, 2.1, 2.2, 2.3, 3.1, 3.2, 3.3, 3.4, 3.5, 3.6_

## Summary

**Total Tasks**: 24
**Estimated Effort**: ~8 hours
**Key Deliverables**:
- ✅ Feature flags configuration (frontend + backend)
- ✅ Fresh install detection
- ✅ Default admin account creation
- ✅ Conditional seed execution
- ✅ Route protection (frontend + backend)
- ✅ Menu filtering
- ✅ Comprehensive testing
- ✅ Documentation
