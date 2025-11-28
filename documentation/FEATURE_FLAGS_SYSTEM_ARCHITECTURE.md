# Feature Flags System Architecture

## Overview

This document describes the complete feature flags system for the dashboard starter kit. It enables users to choose which features to enable/disable on fresh install, with conditional seed data execution and automatic detection of fresh installations.

## System Goals

- ✅ Enable/disable features via environment variables
- ✅ Conditional seed data execution based on enabled features
- ✅ Automatic fresh install detection
- ✅ Setup wizard for first-time users
- ✅ No database schema changes needed
- ✅ Fast implementation (MVP in ~5 hours)

## Architecture Overview

### Three-Layer Approach

```
Layer 1: Environment Variables (.env files)
         ↓
Layer 2: Feature Config (features.config.ts)
         ↓
Layer 3: Application Logic (routes, menus, seeds)
```

### How It Works

1. **Environment variables** define which features are enabled
2. **Feature config** reads env variables and provides typed access
3. **Application** checks feature flags before rendering/executing

## Part 1: Environment Variables

### Frontend (.env.local)

```env
# Feature Flags - Control which features are enabled
NEXT_PUBLIC_ENABLE_LANDING=true
NEXT_PUBLIC_ENABLE_BLOG=true
NEXT_PUBLIC_ENABLE_ECOMMERCE=true
NEXT_PUBLIC_ENABLE_CALENDAR=true
NEXT_PUBLIC_ENABLE_CRM=false
NEXT_PUBLIC_ENABLE_NOTIFICATIONS=true
NEXT_PUBLIC_ENABLE_CUSTOMER_ACCOUNT=true

# Page Visibility - Control which public pages are accessible
NEXT_PUBLIC_SHOW_HOME_PAGE=true
NEXT_PUBLIC_SHOW_SHOP_PAGE=true
NEXT_PUBLIC_SHOW_BLOG_PAGE=true
NEXT_PUBLIC_SHOW_ACCOUNT_PAGE=true

# Setup Detection
NEXT_PUBLIC_SETUP_COMPLETED=false
```

### Backend (.env)

```env
# Feature Flags - Backend mirrors frontend flags
ENABLE_LANDING=true
ENABLE_BLOG=true
ENABLE_ECOMMERCE=true
ENABLE_CALENDAR=true
ENABLE_CRM=false
ENABLE_NOTIFICATIONS=true
ENABLE_CUSTOMER_ACCOUNT=true

# Setup Detection
SETUP_COMPLETED=false
```

### Why Both Frontend and Backend?

- **Frontend flags**: Control UI rendering, routing, navigation
- **Backend flags**: Control API availability, seed execution, permissions
- **Both needed**: Ensures consistency across full stack

## Part 2: Feature Configuration

### Frontend Config (frontend/src/config/features.config.ts)

```typescript
export interface FeatureFlags {
  landing: boolean;
  blog: boolean;
  ecommerce: boolean;
  calendar: boolean;
  crm: boolean;
  notifications: boolean;
  customerAccount: boolean;
}

export interface PageVisibility {
  showHomePage: boolean;
  showShopPage: boolean;
  showBlogPage: boolean;
  showAccountPage: boolean;
}

export const featureFlags: FeatureFlags = {
  landing: process.env.NEXT_PUBLIC_ENABLE_LANDING === 'true',
  blog: process.env.NEXT_PUBLIC_ENABLE_BLOG === 'true',
  ecommerce: process.env.NEXT_PUBLIC_ENABLE_ECOMMERCE === 'true',
  calendar: process.env.NEXT_PUBLIC_ENABLE_CALENDAR === 'true',
  crm: process.env.NEXT_PUBLIC_ENABLE_CRM === 'true',
  notifications: process.env.NEXT_PUBLIC_ENABLE_NOTIFICATIONS === 'true',
  customerAccount: process.env.NEXT_PUBLIC_ENABLE_CUSTOMER_ACCOUNT === 'true',
};

export const pageVisibility: PageVisibility = {
  showHomePage: process.env.NEXT_PUBLIC_SHOW_HOME_PAGE === 'true',
  showShopPage: process.env.NEXT_PUBLIC_SHOW_SHOP_PAGE === 'true',
  showBlogPage: process.env.NEXT_PUBLIC_SHOW_BLOG_PAGE === 'true',
  showAccountPage: process.env.NEXT_PUBLIC_SHOW_ACCOUNT_PAGE === 'true',
};

export function isFeatureEnabled(feature: keyof FeatureFlags): boolean {
  return featureFlags[feature];
}

export function isPageVisible(page: keyof PageVisibility): boolean {
  return pageVisibility[page];
}
```

### Backend Config (backend/src/config/features.config.ts)

```typescript
export interface FeatureFlags {
  landing: boolean;
  blog: boolean;
  ecommerce: boolean;
  calendar: boolean;
  crm: boolean;
  notifications: boolean;
  customerAccount: boolean;
}

export const featureFlags: FeatureFlags = {
  landing: process.env.ENABLE_LANDING === 'true',
  blog: process.env.ENABLE_BLOG === 'true',
  ecommerce: process.env.ENABLE_ECOMMERCE === 'true',
  calendar: process.env.ENABLE_CALENDAR === 'true',
  crm: process.env.ENABLE_CRM === 'true',
  notifications: process.env.ENABLE_NOTIFICATIONS === 'true',
  customerAccount: process.env.ENABLE_CUSTOMER_ACCOUNT === 'true',
};

export function isFeatureEnabled(feature: keyof FeatureFlags): boolean {
  return featureFlags[feature];
}
```

## Part 3: Fresh Install Detection

### How to Detect Fresh Install

**Method: Check if admin user exists**

```typescript
// backend/src/setup/setup.service.ts
import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import * as bcrypt from 'bcrypt';

@Injectable()
export class SetupService {
  constructor(private prisma: PrismaService) {}

  async isFirstRun(): Promise<boolean> {
    const adminCount = await this.prisma.user.count({
      where: {
        role: {
          name: 'Super Admin'
        }
      }
    });
    return adminCount === 0;
  }

  async getSetupStatus(): Promise<{
    isFirstRun: boolean;
    setupCompleted: boolean;
  }> {
    const isFirstRun = await this.isFirstRun();
    const setupCompleted = process.env.SETUP_COMPLETED === 'true';
    
    return {
      isFirstRun,
      setupCompleted: isFirstRun ? false : setupCompleted,
    };
  }

  /**
   * Create default super admin account on fresh install
   * Email: admin@dashtact.com
   * Password: dashtact (hashed with bcrypt)
   */
  async createDefaultAdminAccount(): Promise<void> {
    const isFirstRun = await this.isFirstRun();
    
    if (!isFirstRun) {
      console.log('✅ Admin account already exists, skipping default account creation');
      return;
    }

    try {
      // Get Super Admin role
      const superAdminRole = await this.prisma.userRole.findUnique({
        where: { name: 'Super Admin' }
      });

      if (!superAdminRole) {
        throw new Error('Super Admin role not found. Run seed first.');
      }

      // Hash password using bcrypt (10 salt rounds)
      const hashedPassword = await bcrypt.hash('dashtact', 10);

      // Create default admin user
      const adminUser = await this.prisma.user.create({
        data: {
          email: 'admin@dashtact.com',
          name: 'Admin User',
          password: hashedPassword,
          roleId: superAdminRole.id,
          isActive: true,
          emailVerified: true, // Default admin is pre-verified
          authProvider: 'local',
        },
        include: {
          role: {
            include: {
              rolePermissions: {
                include: {
                  permission: true
                }
              }
            }
          }
        }
      });

      console.log('✅ Default admin account created successfully');
      console.log('📧 Email: admin@dashtact.com');
      console.log('🔐 Password: dashtact (hashed)');
      console.log('👤 Role: Super Admin');
      console.log('⚠️  IMPORTANT: Change this password immediately after first login!');

      return adminUser;
    } catch (error) {
      console.error('❌ Failed to create default admin account:', error.message);
      throw error;
    }
  }
}
```

### Frontend Setup Detection

```typescript
// frontend/src/hooks/useSetupStatus.ts
export function useSetupStatus() {
  const [status, setStatus] = useState<{
    isFirstRun: boolean;
    setupCompleted: boolean;
  } | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    async function checkSetup() {
      try {
        const response = await fetch('/api/setup/status');
        const data = await response.json();
        setStatus(data);
      } catch (error) {
        console.error('Failed to check setup status:', error);
      } finally {
        setIsLoading(false);
      }
    }

    checkSetup();
  }, []);

  return { status, isLoading };
}
```

### Middleware for Setup Redirect

```typescript
// frontend/src/middleware.ts
import { NextRequest, NextResponse } from 'next/server';

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Check if setup is needed
  const setupCompleted = request.cookies.get('setup-completed')?.value === 'true';

  // If not setup and not on setup page, redirect to setup
  if (!setupCompleted && pathname !== '/setup' && pathname !== '/api/setup/status') {
    return NextResponse.redirect(new URL('/setup', request.url));
  }

  // If setup completed and on setup page, redirect to dashboard
  if (setupCompleted && pathname === '/setup') {
    return NextResponse.redirect(new URL('/dashboard', request.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: ['/((?!_next/static|_next/image|favicon.ico).*)'],
};
```

## Part 4: Conditional Seed Data Execution

### Current Seed Structure

```
backend/prisma/seed.ts (main entry)
├── auth.seed.ts (admin user)
├── dashboard-menus.seed.ts (navigation menus)
├── dashboard-widgets.seed.ts (dashboard widgets)
├── products.seed.ts (ecommerce products)
├── calendar.seed.ts (calendar events)
├── blog.seed.ts (blog posts)
└── ... other seeds
```

### Modified Seed Execution

```typescript
// backend/prisma/seed.ts
import { PrismaClient } from '@prisma/client';
import { seedAuth } from './seed-data/auth.seed';
import { seedDashboardMenus } from './seed-data/dashboard-menus.seed';
import { seedProducts } from './seed-data/products.seed';
import { seedBlog } from './seed-data/blog.seed';
import { seedCalendar } from './seed-data/calendar.seed';
import { seedWidgets } from './seed-data/dashboard-widgets.seed';

const prisma = new PrismaClient();

// Read feature flags from environment
const featureFlags = {
  blog: process.env.ENABLE_BLOG === 'true',
  ecommerce: process.env.ENABLE_ECOMMERCE === 'true',
  calendar: process.env.ENABLE_CALENDAR === 'true',
  crm: process.env.ENABLE_CRM === 'true',
  notifications: process.env.ENABLE_NOTIFICATIONS === 'true',
  customerAccount: process.env.ENABLE_CUSTOMER_ACCOUNT === 'true',
};

async function main() {
  console.log('🌱 Starting database seed...');
  console.log('📋 Enabled features:', featureFlags);

  try {
    // Always seed auth (required)
    console.log('👤 Seeding auth...');
    await seedAuth(prisma);

    // Always seed menus (but filter based on features)
    console.log('📍 Seeding dashboard menus...');
    await seedDashboardMenus(prisma, featureFlags);

    // Conditional seeds based on features
    if (featureFlags.blog) {
      console.log('📝 Seeding blog...');
      await seedBlog(prisma);
    }

    if (featureFlags.ecommerce) {
      console.log('🛍️ Seeding products...');
      await seedProducts(prisma);
    }

    if (featureFlags.calendar) {
      console.log('📅 Seeding calendar...');
      await seedCalendar(prisma);
    }

    if (featureFlags.notifications) {
      console.log('🔔 Seeding notifications...');
      await seedNotifications(prisma);
    }

    // Always seed widgets (but filter based on features)
    console.log('🎨 Seeding widgets...');
    await seedWidgets(prisma, featureFlags);

    console.log('✅ Seed completed successfully!');
  } catch (error) {
    console.error('❌ Seed failed:', error);
    process.exit(1);
  } finally {
    await prisma.$disconnect();
  }
}

main();
```

### Modified Dashboard Menus Seed

```typescript
// backend/prisma/seed-data/dashboard-menus.seed.ts
export async function seedDashboardMenus(
  prisma: PrismaClient,
  featureFlags: FeatureFlags
) {
  const mainMenuItems = [
    {
      key: 'dashboard',
      label: 'Dashboard',
      icon: 'LayoutDashboard',
      route: '/dashboard',
      order: 1,
    },
    // Only add if blog enabled
    ...(featureFlags.blog ? [{
      key: 'blog',
      label: 'Blog',
      icon: 'BookOpen',
      route: '/dashboard/blog',
      order: 15,
    }] : []),
    // Only add if ecommerce enabled
    ...(featureFlags.ecommerce ? [{
      key: 'ecommerce',
      label: 'E-commerce',
      icon: 'ShoppingCart',
      route: '/dashboard/ecommerce',
      order: 25,
    }] : []),
    // Only add if calendar enabled
    ...(featureFlags.calendar ? [{
      key: 'calendar',
      label: 'Calendar',
      icon: 'Calendar',
      route: '/dashboard/calendar',
      order: 20,
    }] : []),
    // Only add if CRM enabled
    ...(featureFlags.crm ? [{
      key: 'crm',
      label: 'CRM',
      icon: 'Users',
      route: '/dashboard/crm',
      order: 30,
    }] : []),
  ];

  // Create menus
  for (const item of mainMenuItems) {
    await prisma.dashboardMenu.upsert({
      where: { key: item.key },
      update: {},
      create: item,
    });
  }
}
```

### Modified Widgets Seed

```typescript
// backend/prisma/seed-data/dashboard-widgets.seed.ts
export async function seedWidgets(
  prisma: PrismaClient,
  featureFlags: FeatureFlags
) {
  const widgets = [
    // Always available
    { key: 'welcome', name: 'Welcome Widget' },
    { key: 'stats', name: 'Stats Widget' },
    
    // Conditional widgets
    ...(featureFlags.blog ? [
      { key: 'recent-posts', name: 'Recent Blog Posts' }
    ] : []),
    
    ...(featureFlags.ecommerce ? [
      { key: 'sales-overview', name: 'Sales Overview' },
      { key: 'top-products', name: 'Top Products' }
    ] : []),
    
    ...(featureFlags.calendar ? [
      { key: 'upcoming-events', name: 'Upcoming Events' }
    ] : []),
  ];

  for (const widget of widgets) {
    await prisma.widget.upsert({
      where: { key: widget.key },
      update: {},
      create: widget,
    });
  }
}
```

## Part 5: Frontend Route Protection

### Public Routes Guard

```typescript
// frontend/src/app/blog/layout.tsx
import { redirect } from 'next/navigation';
import { isFeatureEnabled } from '@/config/features.config';

export default function BlogLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  // Check if blog is enabled
  if (!isFeatureEnabled('blog')) {
    redirect('/dashboard');
  }

  return <>{children}</>;
}
```

### Shop Routes Guard

```typescript
// frontend/src/app/shop/layout.tsx
import { redirect } from 'next/navigation';
import { isFeatureEnabled } from '@/config/features.config';

export default function ShopLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  if (!isFeatureEnabled('ecommerce')) {
    redirect('/dashboard');
  }

  return <>{children}</>;
}
```

### Account Routes Guard

```typescript
// frontend/src/app/account/layout.tsx
import { redirect } from 'next/navigation';
import { isFeatureEnabled } from '@/config/features.config';

export default function AccountLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  if (!isFeatureEnabled('customerAccount')) {
    redirect('/dashboard');
  }

  return <>{children}</>;
}
```

## Part 6: Backend Route Protection

### Feature Guard Decorator

```typescript
// backend/src/common/decorators/feature-enabled.decorator.ts
import { SetMetadata } from '@nestjs/common';

export const FEATURE_KEY = 'feature';

export const FeatureEnabled = (feature: string) =>
  SetMetadata(FEATURE_KEY, feature);
```

### Feature Guard Implementation

```typescript
// backend/src/common/guards/feature.guard.ts
import { Injectable, CanActivate, ExecutionContext, ForbiddenException } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { FEATURE_KEY } from '../decorators/feature-enabled.decorator';
import { isFeatureEnabled } from '@/config/features.config';

@Injectable()
export class FeatureGuard implements CanActivate {
  constructor(private reflector: Reflector) {}

  canActivate(context: ExecutionContext): boolean {
    const requiredFeature = this.reflector.get<string>(
      FEATURE_KEY,
      context.getHandler(),
    );

    if (!requiredFeature) {
      return true; // No feature requirement
    }

    if (!isFeatureEnabled(requiredFeature)) {
      throw new ForbiddenException(
        `Feature "${requiredFeature}" is not enabled`,
      );
    }

    return true;
  }
}
```

### Using Feature Guard

```typescript
// backend/src/blog/blog.controller.ts
import { Controller, Get, UseGuards } from '@nestjs/common';
import { FeatureEnabled } from '@/common/decorators/feature-enabled.decorator';
import { FeatureGuard } from '@/common/guards/feature.guard';

@Controller('blog')
@UseGuards(FeatureGuard)
@FeatureEnabled('blog')
export class BlogController {
  @Get()
  findAll() {
    // Only accessible if blog feature is enabled
  }
}
```

## Part 7: Navigation Menu Filtering

### Frontend Menu Filter

```typescript
// frontend/src/contexts/NavigationContext.tsx
import { featureFlags } from '@/config/features.config';

function filterMenusByFeatures(menus: MenuItem[]): MenuItem[] {
  return menus.filter(menu => {
    // Map menu keys to feature flags
    const featureMap: Record<string, keyof typeof featureFlags> = {
      'blog': 'blog',
      'ecommerce': 'ecommerce',
      'calendar': 'calendar',
      'crm': 'crm',
    };

    const requiredFeature = featureMap[menu.key];
    
    // If menu has no feature requirement, always show
    if (!requiredFeature) {
      return true;
    }

    // Only show if feature is enabled
    return featureFlags[requiredFeature];
  });
}

export function NavigationProvider({ children }: NavigationProviderProps) {
  // ... existing code ...

  useEffect(() => {
    async function fetchMenus() {
      if (!isAuthenticated) {
        setMenuItems([]);
        setIsLoadingMenus(false);
        return;
      }

      try {
        setIsLoadingMenus(true);
        const menus = await MenuApi.getUserMenus();
        // Filter menus based on feature flags
        const filteredMenus = filterMenusByFeatures(menus);
        setMenuItems(filteredMenus);
      } catch (error) {
        console.error('Failed to fetch menus:', error);
        setMenuItems([]);
      } finally {
        setIsLoadingMenus(false);
      }
    }

    fetchMenus();
  }, [isAuthenticated]);
}
```

## Part 8: Implementation Complexity Analysis

### ✅ EASY (No Changes Needed)

1. **Navigation is already dynamic**
   - Menus loaded from API
   - Just need to filter based on flags
   - ~30 minutes

2. **Feature flags already exist**
   - `features.config.ts` already in place
   - Just need to extend with new features
   - ~15 minutes

3. **Modules are separated**
   - Each feature has own module
   - Easy to conditionally import
   - ~0 minutes (already done)

4. **Database schema**
   - No changes needed
   - Keep as is (good decision!)
   - ~0 minutes

### ⚠️ MEDIUM (Some Work Required)

1. **Extend feature flags**
   - Add new features to config
   - Add env variables
   - ~30 minutes

2. **Protect public routes**
   - Add layout guards
   - Add redirects
   - ~1 hour

3. **Filter dashboard menus**
   - Implement menu filtering logic
   - Test all combinations
   - ~1 hour

4. **Conditional seed data**
   - Modify seed files
   - Add feature checks
   - ~1.5 hours

### 🔴 COMPLEX (More Work Required)

1. **Backend route guards**
   - Create feature guard decorator
   - Apply to controllers
   - ~1 hour

2. **Setup wizard UI**
   - Create setup page
   - Feature selection UI
   - Form handling
   - ~3-4 hours

3. **Setup wizard backend**
   - Create setup API
   - Generate env file or update database
   - Trigger seed execution
   - ~2-3 hours

## Part 9: Implementation Timeline

### Phase 1: Core Feature Flags (2 hours)
- [ ] Extend `features.config.ts` with all features
- [ ] Add env variables to `.env` files
- [ ] Create backend feature config
- [ ] Test feature flag reading

### Phase 2: Route Protection (2 hours)
- [ ] Add layout guards to public routes
- [ ] Create backend feature guard
- [ ] Apply guards to controllers
- [ ] Test disabled routes return 404

### Phase 3: Menu Filtering (1.5 hours)
- [ ] Implement menu filtering logic
- [ ] Test all feature combinations
- [ ] Verify sidebar updates correctly

### Phase 4: Conditional Seeds (1.5 hours)
- [ ] Modify seed files to check flags
- [ ] Update dashboard-menus.seed.ts
- [ ] Update widgets.seed.ts
- [ ] Test seed execution with different flags

### Phase 5: Fresh Install Detection (1 hour)
- [ ] Create setup detection service
- [ ] Add setup status endpoint
- [ ] Create middleware for redirects
- [ ] Test fresh install flow

### Phase 6: Setup Wizard (4-6 hours) - Optional, can do later
- [ ] Create `/setup` page
- [ ] Build feature selection UI
- [ ] Implement form handling
- [ ] Create setup API endpoints
- [ ] Test complete setup flow

**Total MVP Time: ~8 hours**
**Total with Setup Wizard: ~12-14 hours**

## Part 10: What Gets Affected by Feature Flags

### When Blog is Disabled
- ❌ `/blog` routes return 404
- ❌ `/dashboard/blog` hidden from menu
- ❌ Blog API endpoints return 403
- ❌ Blog seed data not created
- ❌ Blog widgets not available

### When E-commerce is Disabled
- ❌ `/shop` routes return 404
- ❌ `/cart` routes return 404
- ❌ `/checkout` routes return 404
- ❌ `/dashboard/ecommerce` hidden from menu
- ❌ E-commerce API endpoints return 403
- ❌ Products seed data not created
- ❌ E-commerce widgets not available

### When Calendar is Disabled
- ❌ `/dashboard/calendar` hidden from menu
- ❌ Calendar API endpoints return 403
- ❌ Calendar seed data not created
- ❌ Calendar widgets not available

### When Customer Account is Disabled
- ❌ `/account` routes return 404
- ❌ Customer account API endpoints return 403
- ❌ Account seed data not created

## Part 11: Environment Variable Examples

### E-commerce Only
```env
NEXT_PUBLIC_ENABLE_LANDING=false
NEXT_PUBLIC_ENABLE_BLOG=false
NEXT_PUBLIC_ENABLE_ECOMMERCE=true
NEXT_PUBLIC_ENABLE_CALENDAR=false
NEXT_PUBLIC_ENABLE_CRM=false
NEXT_PUBLIC_ENABLE_NOTIFICATIONS=true
NEXT_PUBLIC_ENABLE_CUSTOMER_ACCOUNT=true
NEXT_PUBLIC_SHOW_HOME_PAGE=false
NEXT_PUBLIC_SHOW_SHOP_PAGE=true
NEXT_PUBLIC_SHOW_BLOG_PAGE=false
NEXT_PUBLIC_SHOW_ACCOUNT_PAGE=true
```

### CRM Only
```env
NEXT_PUBLIC_ENABLE_LANDING=false
NEXT_PUBLIC_ENABLE_BLOG=false
NEXT_PUBLIC_ENABLE_ECOMMERCE=false
NEXT_PUBLIC_ENABLE_CALENDAR=true
NEXT_PUBLIC_ENABLE_CRM=true
NEXT_PUBLIC_ENABLE_NOTIFICATIONS=true
NEXT_PUBLIC_ENABLE_CUSTOMER_ACCOUNT=false
NEXT_PUBLIC_SHOW_HOME_PAGE=false
NEXT_PUBLIC_SHOW_SHOP_PAGE=false
NEXT_PUBLIC_SHOW_BLOG_PAGE=false
NEXT_PUBLIC_SHOW_ACCOUNT_PAGE=false
```

### Full Featured
```env
NEXT_PUBLIC_ENABLE_LANDING=true
NEXT_PUBLIC_ENABLE_BLOG=true
NEXT_PUBLIC_ENABLE_ECOMMERCE=true
NEXT_PUBLIC_ENABLE_CALENDAR=true
NEXT_PUBLIC_ENABLE_CRM=true
NEXT_PUBLIC_ENABLE_NOTIFICATIONS=true
NEXT_PUBLIC_ENABLE_CUSTOMER_ACCOUNT=true
NEXT_PUBLIC_SHOW_HOME_PAGE=true
NEXT_PUBLIC_SHOW_SHOP_PAGE=true
NEXT_PUBLIC_SHOW_BLOG_PAGE=true
NEXT_PUBLIC_SHOW_ACCOUNT_PAGE=true
```

## Part 12: Testing Strategy

### Manual Testing Checklist

**For Each Feature:**
- [ ] Feature enabled: Routes accessible, menu items visible
- [ ] Feature disabled: Routes return 404, menu items hidden
- [ ] Seed data: Created only when feature enabled
- [ ] API endpoints: Return 403 when feature disabled

**Fresh Install Detection:**
- [ ] First run: Redirects to setup
- [ ] After setup: Redirects to dashboard
- [ ] Setup completed flag: Persists correctly

**Menu Filtering:**
- [ ] All features enabled: All menus visible
- [ ] Some features disabled: Correct menus hidden
- [ ] Feature disabled after setup: Menu still hidden

## Part 13: Database Considerations

### Why We Keep Schema As-Is

**Good Reasons:**
1. ✅ No migrations needed
2. ✅ All data stays in database
3. ✅ Can re-enable features later without data loss
4. ✅ Simpler implementation
5. ✅ Faster deployment

**How It Works:**
- All tables exist (blog, products, calendar, etc.)
- Feature flags just control access
- Data persists even if feature disabled
- Re-enable feature = data comes back

**Example:**
```
Scenario: Disable e-commerce, then re-enable later
1. E-commerce disabled: Products table exists but inaccessible
2. Re-enable e-commerce: Products immediately available
3. No data loss, no migration needed
```

## Part 14: Fresh Install Flow

### Step-by-Step

```
1. User deploys app
   ↓
2. App starts, checks if admin user exists
   ↓
3. No admin user found → First run detected
   ↓
4. Middleware redirects to /setup
   ↓
5. User sees setup wizard
   ↓
6. User selects features
   ↓
7. User creates admin account
   ↓
8. Setup wizard:
   - Updates .env file (or database)
   - Triggers seed execution
   - Creates admin user
   - Sets setup-completed flag
   ↓
9. Redirects to login
   ↓
10. User logs in
    ↓
11. Dashboard shows only enabled features
```

### Code Flow

```typescript
// middleware.ts
if (noAdminUserExists && !onSetupPage) {
  redirect('/setup');
}

// /setup/page.tsx
async function handleSetupComplete(features: FeatureFlags) {
  // 1. Update env file or database
  await updateFeatureFlags(features);
  
  // 2. Create admin user
  await createAdminUser(email, password);
  
  // 3. Trigger seed execution
  await triggerSeed(features);
  
  // 4. Set setup completed flag
  setCookie('setup-completed', 'true');
  
  // 5. Redirect to login
  redirect('/login');
}
```

## Part 15: Advantages of This Approach

### ✅ Advantages

1. **Simple**: Just env variables, no complex logic
2. **Fast**: MVP in ~8 hours
3. **Flexible**: Easy to add new features
4. **Safe**: No database schema changes
5. **Reversible**: Can re-enable features anytime
6. **Scalable**: Works for any number of features
7. **Testable**: Easy to test different combinations
8. **Production-ready**: Works in any environment

### ⚠️ Limitations

1. **Env-based**: Requires restart to change (can add database later)
2. **No hot-reload**: Changes don't apply without restart (can add later)
3. **All data persists**: Disabled features still use database space (acceptable)

## Part 16: Future Enhancements

### Phase 2 (After MVP)

1. **Database-backed flags**
   - Store flags in database
   - Hot-reload without restart
   - Admin UI to toggle features

2. **Feature analytics**
   - Track which features are used
   - Usage statistics
   - Recommendations

3. **Gradual rollout**
   - Enable features for % of users
   - A/B testing
   - Canary deployments

4. **Feature dependencies**
   - Some features require others
   - Automatic validation
   - Prevent invalid combinations

## Summary

This feature flags system provides:

- ✅ **Easy MVP**: ~8 hours to implement
- ✅ **No schema changes**: Keep database as-is
- ✅ **Conditional seeds**: Only create data for enabled features
- ✅ **Fresh install detection**: Automatic setup wizard trigger
- ✅ **Full flexibility**: Enable/disable any combination
- ✅ **Production-ready**: Works in any environment

The approach is pragmatic, fast, and scalable for future enhancements.
