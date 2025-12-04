# Feature Flags System - Design

## Architecture

### Three-Layer Design
```
Layer 1: Environment Variables (.env)
         ↓
Layer 2: Feature Config (features.config.ts)
         ↓
Layer 3: Application Logic (routes, seeds, guards)
```

## Data Flow

### Fresh Install Flow
```
App Start
  ↓
Check: Admin user exists?
  ├─ YES → Normal startup
  └─ NO → First run detected
           ↓
           Create default admin (admin@dashtact.com)
           ↓
           Run conditional seeds based on flags
           ↓
           Ready for setup wizard (Phase 2)
```

### Feature Flag Resolution
```
1. Read from environment variable
2. Store in config object
3. Check in application code
4. Return boolean result
```

## Component Design

### Frontend Config (`frontend/src/config/features.config.ts`)
```typescript
- featureFlags object (7 features)
- pageVisibility object (4 pages)
- isFeatureEnabled() function
- isPageVisible() function
```

### Backend Config (`backend/src/config/features.config.ts`)
```typescript
- featureFlags object (7 features)
- isFeatureEnabled() function
- Mirrors frontend for consistency
```

### Setup Service (`backend/src/setup/setup.service.ts`)
```typescript
- isFirstRun(): boolean
- getSetupStatus(): { isFirstRun, setupCompleted }
- createDefaultAdminAccount(): void
```

### Feature Guard (`backend/src/common/guards/feature.guard.ts`)
```typescript
- Checks if feature enabled
- Returns 403 if disabled
- Applied to controllers
```

## Database Changes

### None Required
- Existing schema sufficient
- Feature flags in environment only
- No new tables needed
- Data persists when features disabled

## Seed Execution Flow

### Current Seed Structure
```
seed.ts (main entry)
├── Read feature flags from env
├── seedAuth() - always run
├── seedDashboardMenus(flags) - filter by flags
├── seedBlog(flags) - conditional
├── seedProducts(flags) - conditional
├── seedCalendar(flags) - conditional
├── seedWidgets(flags) - filter by flags
└── seedNotifications(flags) - conditional
```

### Conditional Logic Pattern
```typescript
if (featureFlags.blog) {
  await seedBlog(prisma);
}
```

## API Endpoints

### Setup Status
```
GET /api/setup/status
Response: {
  isFirstRun: boolean,
  setupCompleted: boolean
}
```

### Feature Flags (Optional, for frontend)
```
GET /api/features
Response: {
  landing: boolean,
  blog: boolean,
  ecommerce: boolean,
  calendar: boolean,
  crm: boolean,
  notifications: boolean,
  customerAccount: boolean
}
```

## Environment Variables

### Frontend (.env.local)
```
NEXT_PUBLIC_ENABLE_LANDING=true
NEXT_PUBLIC_ENABLE_BLOG=true
NEXT_PUBLIC_ENABLE_ECOMMERCE=true
NEXT_PUBLIC_ENABLE_CALENDAR=true
NEXT_PUBLIC_ENABLE_CRM=false
NEXT_PUBLIC_ENABLE_NOTIFICATIONS=true
NEXT_PUBLIC_ENABLE_CUSTOMER_ACCOUNT=true
NEXT_PUBLIC_SHOW_HOME_PAGE=true
NEXT_PUBLIC_SHOW_SHOP_PAGE=true
NEXT_PUBLIC_SHOW_BLOG_PAGE=true
NEXT_PUBLIC_SHOW_ACCOUNT_PAGE=true
NEXT_PUBLIC_SETUP_COMPLETED=false
```

### Backend (.env)
```
ENABLE_LANDING=true
ENABLE_BLOG=true
ENABLE_ECOMMERCE=true
ENABLE_CALENDAR=true
ENABLE_CRM=false
ENABLE_NOTIFICATIONS=true
ENABLE_CUSTOMER_ACCOUNT=true
SETUP_COMPLETED=false
```

## Security Design

### Password Hashing
- Algorithm: bcrypt
- Salt rounds: 10
- Default password: `dashtact`
- Hashed before storage

### Default Admin Account
- Email: `admin@dashtact.com`
- Pre-verified (no email confirmation needed)
- Super Admin role (all permissions)
- Created only on first run
- Warning to change password

### Feature Flags
- Not exposed in frontend code
- Read-only at runtime
- Require restart to change
- No sensitive data

## Error Handling

### Seed Errors
```
If seed fails:
1. Log error with context
2. Stop execution
3. Exit with code 1
4. User must fix and retry
```

### Missing Admin Role
```
If Super Admin role missing:
1. Throw error
2. Message: "Run seed first"
3. Exit gracefully
```

### Feature Flag Errors
```
If feature flag invalid:
1. Default to false
2. Log warning
3. Continue execution
```

## Testing Strategy

### Unit Tests
- Feature flag reading
- Fresh install detection
- Admin account creation
- Seed conditional logic

### Integration Tests
- Full seed execution with different flags
- Route protection with disabled features
- Menu filtering with disabled features

### Manual Tests
- Fresh install with all features
- Fresh install with some features disabled
- Existing installation (no admin creation)
- Feature flag changes

## Performance Considerations

### Optimization
- Feature flags in-memory (no DB queries)
- Seed execution parallelizable
- Menu filtering on fetch (not on render)
- Guard checks < 1ms

### Scalability
- Works with any number of features
- Seed time scales with enabled features
- No performance impact when features disabled

## Future Enhancements (Phase 2)

### Setup Wizard
- UI for feature selection
- Admin account creation form
- Automatic seed triggering

### Database-Backed Flags
- Store flags in database
- Hot-reload without restart
- Admin UI to toggle features

### Feature Analytics
- Track feature usage
- Usage statistics
- Recommendations

## Rollback Plan

### If Issues Occur
1. Revert .env changes
2. Restart application
3. Features revert to previous state
4. No data loss (all data persists)

### Database Reset
```bash
npx prisma migrate reset
# Clears all data, resets schema
# Run seed again with desired flags
```
