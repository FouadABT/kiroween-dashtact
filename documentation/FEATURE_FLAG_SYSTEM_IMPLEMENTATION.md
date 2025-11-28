# Feature Flag System - Complete Implementation

## Overview

A comprehensive, production-ready feature flag system that controls which features are available in the application. The system works across three layers:

1. **Database Layer** - Feature configuration stored in `feature_flags` table
2. **Backend API Layer** - Feature guards on controllers + Features API endpoints
3. **Frontend Layer** - Feature checks in pages + Feature gates in components

## Database Schema

### FeatureFlag Table

```sql
CREATE TABLE feature_flags (
  id              STRING PRIMARY KEY
  key             STRING UNIQUE          -- landing, blog, ecommerce, calendar, crm, notifications, customerAccount
  name            STRING                 -- Display name
  description     TEXT
  is_enabled      BOOLEAN DEFAULT false
  is_system       BOOLEAN DEFAULT true   -- System features can't be deleted
  category        STRING DEFAULT general -- general, ecommerce, content, communication
  required_modules STRING[]              -- Dependencies
  related_tables  STRING[]               -- Tables to clean up when disabled
  metadata        JSON
  created_at      TIMESTAMP
  updated_at      TIMESTAMP
)
```

### FeatureAuditLog Table

```sql
CREATE TABLE feature_audit_logs (
  id              STRING PRIMARY KEY
  feature_key     STRING
  action          STRING                 -- enabled, disabled, configured
  previous_value  JSON
  new_value       JSON
  changed_by      STRING                 -- User ID
  reason          TEXT
  created_at      TIMESTAMP
)
```

## Backend Implementation

### 1. Features Service

**File**: `backend/src/features/features.service.ts`

Methods:
- `getAllFeatures()` - Get all feature flags
- `getFeature(key)` - Get specific feature
- `isFeatureEnabled(key)` - Check if enabled
- `getEnabledFeatures()` - Get all enabled
- `getDisabledFeatures()` - Get all disabled
- `getFeaturesByCategory(category)` - Filter by category
- `updateFeature(key, isEnabled, reason)` - Update with audit log
- `getRelatedTables(key)` - Get tables to clean up
- `getAuditLogs(featureKey, limit)` - Get audit history

### 2. Features Controller

**File**: `backend/src/features/features.controller.ts`

Endpoints:
- `GET /features` - Get all features (public)
- `GET /features/:key` - Get specific feature (public)
- `GET /features/status/enabled` - Get enabled features (public)
- `GET /features/category/:category` - Filter by category (public)
- `PATCH /features/:key` - Update feature (admin only)
- `GET /features/audit/logs` - Get audit logs (admin only)

### 3. Features Module

**File**: `backend/src/features/features.module.ts`

Registered in `app.module.ts`:
```typescript
import { FeaturesModule } from './features/features.module';

@Module({
  imports: [
    // ... other modules
    FeaturesModule,
  ],
})
export class AppModule {}
```

## Frontend Implementation

### 1. Feature Configuration

**File**: `frontend/src/config/features.config.ts`

Reads from environment variables:
```typescript
export const featureFlags: FeatureFlags = {
  landing: process.env.NEXT_PUBLIC_ENABLE_LANDING === 'true',
  blog: process.env.NEXT_PUBLIC_ENABLE_BLOG === 'true',
  ecommerce: process.env.NEXT_PUBLIC_ENABLE_ECOMMERCE === 'true',
  calendar: process.env.NEXT_PUBLIC_ENABLE_CALENDAR === 'true',
  crm: process.env.NEXT_PUBLIC_ENABLE_CRM === 'true',
  notifications: process.env.NEXT_PUBLIC_ENABLE_NOTIFICATIONS === 'true',
  customerAccount: process.env.NEXT_PUBLIC_ENABLE_CUSTOMER_ACCOUNT === 'true',
};
```

### 2. Route Protection

**Pattern**: Check feature in page component

**Example - Shop Page**:
```typescript
// frontend/src/app/shop/page.tsx
import { notFound } from 'next/navigation';
import { isFeatureEnabled } from '@/config/features.config';

export default async function ShopPage({ searchParams }) {
  if (!isFeatureEnabled('ecommerce')) {
    notFound();
  }
  // Rest of page...
}
```

**Protected Pages**:
- `/shop` - ecommerce
- `/cart` - ecommerce
- `/checkout` - ecommerce
- `/account/*` - customerAccount
- `/blog` - blog
- `/dashboard/calendar` - calendar

### 3. Component Protection

**Hook**: `useFeatureFlag()`
```typescript
const { isEnabled } = useFeatureFlag('ecommerce');
if (!isEnabled) return <div>Feature not available</div>;
```

**Component**: `FeatureGate`
```typescript
<FeatureGate feature="ecommerce">
  <ShopContent />
</FeatureGate>
```

**API Hook**: `useFeatureFlagsAPI()`
```typescript
const { isFeatureEnabled, features, loading } = useFeatureFlagsAPI();
```

## Seed Integration

### Feature Flags Seed

**File**: `backend/prisma/seed-data/feature-flags.seed.ts`

Reads environment variables and seeds feature flags:
```
ENABLE_LANDING=false
ENABLE_BLOG=false
ENABLE_ECOMMERCE=false
ENABLE_CALENDAR=false
ENABLE_CRM=false
ENABLE_NOTIFICATIONS=true
ENABLE_CUSTOMER_ACCOUNT=false
```

### Cleanup Process

When seeding with disabled features:

1. **Menu Cleanup** - Removes dashboard menu items
2. **Data Skipping** - Skips seeding data
3. **Cascade Deletion** - Deletes related tables

Example output:
```
🗑️  Cleaning up menus for disabled features: blog, calendar, ecommerce, ecommerce-products, ecommerce-orders, ecommerce-customers, ecommerce-inventory, ecommerce-categories, ecommerce-payments, ecommerce-shipping, settings-landing-page, settings-calendar, settings-ecommerce
```

## Setup CLI Integration

### Profiles

**Profile 1: E-commerce Store**
```
ENABLE_LANDING=true
ENABLE_BLOG=false
ENABLE_ECOMMERCE=true
ENABLE_CALENDAR=false
ENABLE_CRM=false
ENABLE_NOTIFICATIONS=true
ENABLE_CUSTOMER_ACCOUNT=true
```

**Profile 2: CRM System**
```
ENABLE_LANDING=true
ENABLE_BLOG=false
ENABLE_ECOMMERCE=false
ENABLE_CALENDAR=true
ENABLE_CRM=true
ENABLE_NOTIFICATIONS=true
ENABLE_CUSTOMER_ACCOUNT=false
```

**Profile 3: Full Stack**
```
ENABLE_LANDING=true
ENABLE_BLOG=true
ENABLE_ECOMMERCE=true
ENABLE_CALENDAR=true
ENABLE_CRM=true
ENABLE_NOTIFICATIONS=true
ENABLE_CUSTOMER_ACCOUNT=true
```

**Profile 4: Minimal Setup**
```
ENABLE_LANDING=false
ENABLE_BLOG=false
ENABLE_ECOMMERCE=false
ENABLE_CALENDAR=false
ENABLE_CRM=false
ENABLE_NOTIFICATIONS=true
ENABLE_CUSTOMER_ACCOUNT=false
```

## Testing

### Verify Feature Flags in Database

```bash
cd backend
npx prisma studio
# Check feature_flags table
```

### Test API Endpoints

```bash
# Get all features
curl http://localhost:3001/features

# Get specific feature
curl http://localhost:3001/features/ecommerce

# Get enabled features
curl http://localhost:3001/features/status/enabled

# Get by category
curl http://localhost:3001/features/category/ecommerce
```

### Test Route Protection

1. Run setup CLI with Minimal Setup profile
2. Try to access `/shop` - should show 404
3. Try to access `/dashboard/calendar` - should show 404
4. Try API: `curl http://localhost:3001/storefront/products` - should return 403

### Test Backend API Protection

```bash
# Should return 403 Forbidden if ecommerce disabled
curl http://localhost:3001/storefront/products

# Should return 403 Forbidden if calendar disabled
curl http://localhost:3001/calendar/events
```

## Architecture Diagram

```
┌─────────────────────────────────────────────────────────┐
│                    Frontend (Next.js)                    │
├─────────────────────────────────────────────────────────┤
│  Pages (check feature)  │  Components (FeatureGate)     │
│  /shop → notFound()     │  <FeatureGate feature="...">  │
│  /calendar → notFound() │  useFeatureFlag('...')        │
│  /account → notFound()  │  useFeatureFlagsAPI()         │
└────────────────┬────────────────────────────────────────┘
                 │ HTTP Requests
                 ↓
┌─────────────────────────────────────────────────────────┐
│                   Backend (NestJS)                       │
├─────────────────────────────────────────────────────────┤
│  Features API                                            │
│  GET /features (public)                                 │
│  PATCH /features/:key (admin)                           │
│                                                          │
│  Protected Controllers                                   │
│  @FeatureEnabled('ecommerce') → 403 if disabled        │
│  @FeatureEnabled('calendar') → 403 if disabled         │
└────────────────┬────────────────────────────────────────┘
                 │ Database Queries
                 ↓
┌─────────────────────────────────────────────────────────┐
│                  PostgreSQL Database                     │
├─────────────────────────────────────────────────────────┤
│  feature_flags table                                     │
│  feature_audit_logs table                               │
│  Related tables (products, orders, events, etc.)        │
└─────────────────────────────────────────────────────────┘
```

## Key Features

✅ **Database-Driven** - Feature flags stored in database
✅ **Environment Variables** - Read from .env files
✅ **Audit Logging** - Track all feature changes
✅ **API Endpoints** - Public and admin endpoints
✅ **Route Protection** - Pages return 404 if disabled
✅ **API Protection** - Controllers return 403 if disabled
✅ **Component Gates** - Conditional rendering
✅ **Seed Integration** - Automatic cleanup of disabled features
✅ **Setup CLI** - Profile-based configuration
✅ **Real-time Updates** - API hook for dynamic updates

## Best Practices

1. **Always protect both layers** - Backend API AND frontend routes
2. **Use consistent naming** - Match feature names across backend/frontend
3. **Test all profiles** - Run setup CLI with each profile
4. **Document features** - Add comments explaining dependencies
5. **Clean up data** - Seed cleanup removes orphaned data
6. **Provide feedback** - Show 404 or disabled message to users
7. **Audit changes** - Track who enabled/disabled features
8. **Use categories** - Organize features by category
9. **Set dependencies** - Document required modules
10. **Monitor usage** - Check audit logs for changes

## Troubleshooting

### Feature still accessible when disabled

**Cause**: Missing feature check or guard

**Solution**:
1. Verify backend controller has `@FeatureEnabled()` decorator
2. Verify frontend page has `if (!isFeatureEnabled())` check
3. Verify environment variables are set correctly
4. Restart dev servers

### 404 page shows instead of feature disabled message

**Cause**: This is expected behavior

**Solution**: This is correct - disabled features should return 404 to users

### Menu items still showing for disabled features

**Cause**: Seed didn't run or cleanup failed

**Solution**:
1. Run seed again: `npm run prisma:seed`
2. Check environment variables
3. Check database: `npx prisma studio`

### API returns 403 instead of data

**Cause**: Feature is disabled

**Solution**:
1. Check backend `.env` file
2. Verify feature flag is set to `true`
3. Restart backend server

## Summary

The feature flag system provides:
- ✅ Database-driven configuration
- ✅ Backend API protection with guards
- ✅ Frontend route protection with checks
- ✅ Component-level feature gates
- ✅ Setup CLI integration with profiles
- ✅ Automatic data cleanup for disabled features
- ✅ Audit logging for compliance
- ✅ Real-time API for dynamic updates
- ✅ Production-ready implementation
