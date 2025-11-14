# Migration Guide

## Overview

This guide helps you add the landing page and blog system to an existing dashboard installation.

## Prerequisites

Before starting the migration:

- ✅ Backup your database
- ✅ Commit all changes to git
- ✅ Ensure backend and frontend are working
- ✅ Have database access credentials
- ✅ Review the requirements document

## Migration Steps

### Step 1: Backup Database

**PostgreSQL Backup:**

```bash
# Create backup
pg_dump -U username -d database_name > backup_$(date +%Y%m%d_%H%M%S).sql

# Or with password prompt
pg_dump -U username -d database_name -W > backup.sql
```

**Verify Backup:**

```bash
# Check file size
ls -lh backup.sql

# View first few lines
head -n 20 backup.sql
```

**Store Backup Safely:**
- Copy to secure location
- Keep multiple versions
- Test restore on development database

### Step 2: Update Environment Variables

**Frontend** (`frontend/.env.local`):

```env
# Add these new variables
NEXT_PUBLIC_ENABLE_LANDING=true
NEXT_PUBLIC_ENABLE_BLOG=true
NEXT_PUBLIC_BLOG_POSTS_PER_PAGE=10
NEXT_PUBLIC_BLOG_ENABLE_CATEGORIES=true
NEXT_PUBLIC_BLOG_ENABLE_TAGS=true
NEXT_PUBLIC_BLOG_REQUIRE_AUTHOR=false
```

**Backend** (`backend/.env`):

No changes required unless you want to add optional blog configuration.

### Step 3: Run Database Migrations

**Check Current Migration Status:**

```bash
cd backend
npx prisma migrate status
```

**Run New Migrations:**

```bash
# Generate migration for blog tables
npm run prisma:migrate

# Or manually create migration
npx prisma migrate dev --name add_blog_system
```

**Verify Migration:**

```bash
# Check database tables
npx prisma studio

# Or via SQL
psql -U username -d database_name -c "\dt"
```

**Expected New Tables:**
- `blog_posts`
- `blog_categories`
- `blog_tags`
- `_BlogCategoryToBlogPost` (relation table)
- `_BlogPostToBlogTag` (relation table)

### Step 4: Add Blog Permissions

**Option A: Reseed Database (Recommended)**

```bash
cd backend
npm run prisma:seed
```

This will:
- Add blog permissions if they don't exist
- Preserve existing data
- Update role permissions

**Option B: Manual SQL**

```sql
-- Add blog permissions
INSERT INTO permissions (id, name, resource, action, description, created_at, updated_at)
VALUES 
  (gen_random_uuid(), 'blog:read', 'blog', 'read', 'View blog posts in dashboard', NOW(), NOW()),
  (gen_random_uuid(), 'blog:write', 'blog', 'write', 'Create and edit blog posts', NOW(), NOW()),
  (gen_random_uuid(), 'blog:delete', 'blog', 'delete', 'Delete blog posts', NOW(), NOW()),
  (gen_random_uuid(), 'blog:publish', 'blog', 'publish', 'Publish blog posts', NOW(), NOW());

-- Assign to Admin role
INSERT INTO role_permissions (id, role_id, permission_id, created_at)
SELECT 
  gen_random_uuid(),
  (SELECT id FROM user_roles WHERE name = 'Admin'),
  p.id,
  NOW()
FROM permissions p
WHERE p.name LIKE 'blog:%';
```

**Verify Permissions:**

```sql
-- Check permissions exist
SELECT * FROM permissions WHERE name LIKE 'blog:%';

-- Check admin has permissions
SELECT ur.name as role, p.name as permission
FROM user_roles ur
JOIN role_permissions rp ON ur.id = rp.role_id
JOIN permissions p ON rp.permission_id = p.id
WHERE ur.name = 'Admin' AND p.name LIKE 'blog:%';
```

### Step 5: Generate Prisma Client

```bash
cd backend
npm run prisma:generate
```

**Verify Generation:**

```bash
# Check generated files
ls -la backend/generated/prisma/

# Should see:
# - index.js
# - index.d.ts
# - schema.prisma
```

### Step 6: Update Backend Code

**Check for Conflicts:**

```bash
# Search for existing blog-related code
cd backend/src
grep -r "blog" .
```

**If No Conflicts:**

The blog module should be automatically available after migration.

**If Conflicts Exist:**

Rename or remove conflicting code before proceeding.

### Step 7: Update Frontend Code

**Check for Conflicts:**

```bash
# Search for existing landing/blog code
cd frontend/src
grep -r "landing\|blog" .
```

**If Conflicts:**

Resolve conflicts by:
- Renaming existing components
- Merging functionality
- Removing old code

### Step 8: Restart Services

**Backend:**

```bash
cd backend
npm run start:dev
```

**Frontend:**

```bash
cd frontend
# Clear Next.js cache
rm -rf .next

# Start dev server
npm run dev
```

### Step 9: Verify Installation

**Check Landing Page:**

1. Visit `http://localhost:3000/`
2. Should see landing page (not redirect)
3. Check hero, features, footer render correctly

**Check Blog:**

1. Visit `http://localhost:3000/blog`
2. Should see empty blog listing
3. No errors in console

**Check Dashboard:**

1. Login to dashboard
2. Look for "Blog" in sidebar navigation
3. Click to access blog management
4. Should see empty post list

**Check Permissions:**

```bash
# Test creating a post
curl -X POST http://localhost:3001/blog \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -d '{
    "title": "Test Post",
    "content": "Test content",
    "status": "DRAFT"
  }'
```

### Step 10: Assign Permissions to Users

**Via Database:**

```sql
-- Get user and role IDs
SELECT id, email, role_id FROM users;
SELECT id, name FROM user_roles;

-- Update user role to Admin (if needed)
UPDATE users 
SET role_id = (SELECT id FROM user_roles WHERE name = 'Admin')
WHERE email = 'user@example.com';
```

**Via Seed Script:**

Edit `backend/prisma/seed-data/auth.seed.ts`:

```typescript
export const DEFAULT_ROLES = {
  ADMIN: {
    permissions: [
      // ... existing permissions
      'blog:read',
      'blog:write',
      'blog:delete',
      'blog:publish',
    ],
  },
  MANAGER: {
    permissions: [
      // ... existing permissions
      'blog:read',
      'blog:write',
    ],
  },
};
```

Then reseed:

```bash
npm run prisma:seed
```

**Important:** Users must logout and login again to get new permissions.

## Rollback Procedure

If something goes wrong, follow these steps to rollback:

### Step 1: Stop Services

```bash
# Stop backend
# Press Ctrl+C in backend terminal

# Stop frontend
# Press Ctrl+C in frontend terminal
```

### Step 2: Restore Database

```bash
# Restore from backup
psql -U username -d database_name < backup.sql

# Or drop and recreate
dropdb database_name
createdb database_name
psql -U username -d database_name < backup.sql
```

### Step 3: Revert Environment Variables

Remove or set to `false`:

```env
NEXT_PUBLIC_ENABLE_LANDING=false
NEXT_PUBLIC_ENABLE_BLOG=false
```

### Step 4: Revert Prisma Schema

```bash
cd backend

# Reset to previous migration
npx prisma migrate reset

# Or manually revert
git checkout HEAD -- prisma/schema.prisma
npm run prisma:generate
```

### Step 5: Restart Services

```bash
cd backend && npm run start:dev
cd frontend && npm run dev
```

## Troubleshooting

### Migration Fails

**Problem:** `npm run prisma:migrate` fails

**Solutions:**

1. **Check database connection:**
   ```bash
   npx prisma db pull
   ```

2. **Check for schema conflicts:**
   ```bash
   npx prisma validate
   ```

3. **Reset and retry:**
   ```bash
   npx prisma migrate reset
   npx prisma migrate dev
   ```

4. **Manual migration:**
   ```bash
   # Create migration file
   npx prisma migrate dev --create-only --name add_blog_system
   
   # Edit migration file if needed
   # Then apply
   npx prisma migrate deploy
   ```

### Permissions Not Working

**Problem:** User can't access blog management

**Solutions:**

1. **Check permissions exist:**
   ```sql
   SELECT * FROM permissions WHERE name LIKE 'blog:%';
   ```

2. **Check role has permissions:**
   ```sql
   SELECT * FROM role_permissions rp
   JOIN permissions p ON rp.permission_id = p.id
   WHERE p.name LIKE 'blog:%';
   ```

3. **Check user role:**
   ```sql
   SELECT u.email, ur.name as role
   FROM users u
   JOIN user_roles ur ON u.role_id = ur.id
   WHERE u.email = 'user@example.com';
   ```

4. **Force user logout:**
   - Clear JWT tokens
   - User must login again

### Landing Page Not Showing

**Problem:** Root route redirects instead of showing landing page

**Solutions:**

1. **Check environment variable:**
   ```bash
   # In frontend directory
   cat .env.local | grep LANDING
   ```

2. **Restart frontend:**
   ```bash
   cd frontend
   rm -rf .next
   npm run dev
   ```

3. **Check middleware:**
   ```typescript
   // frontend/src/middleware.ts
   console.log('Landing enabled:', process.env.NEXT_PUBLIC_ENABLE_LANDING);
   ```

### Blog Routes Return 404

**Problem:** `/blog` returns 404

**Solutions:**

1. **Check environment variable:**
   ```bash
   cat .env.local | grep BLOG
   ```

2. **Check middleware configuration:**
   ```typescript
   // frontend/src/middleware.ts
   export const config = {
     matcher: ['/', '/blog/:path*'],
   };
   ```

3. **Clear Next.js cache:**
   ```bash
   rm -rf .next
   npm run dev
   ```

### Database Connection Issues

**Problem:** Can't connect to database

**Solutions:**

1. **Check PostgreSQL is running:**
   ```bash
   # Linux/Mac
   sudo systemctl status postgresql
   
   # Or
   pg_isready
   ```

2. **Check DATABASE_URL:**
   ```bash
   cat backend/.env | grep DATABASE_URL
   ```

3. **Test connection:**
   ```bash
   psql -U username -d database_name -c "SELECT 1"
   ```

4. **Check firewall:**
   ```bash
   # Allow PostgreSQL port
   sudo ufw allow 5432
   ```

## Post-Migration Checklist

After successful migration:

- [ ] Landing page accessible at `/`
- [ ] Blog listing accessible at `/blog`
- [ ] Blog management accessible at `/dashboard/blog`
- [ ] Can create draft posts
- [ ] Can publish posts
- [ ] Published posts visible on public blog
- [ ] Categories and tags working (if enabled)
- [ ] Image upload working
- [ ] SEO metadata present in page source
- [ ] No console errors
- [ ] No backend errors in logs
- [ ] Permissions working correctly
- [ ] All existing features still working

## Best Practices

### Before Migration

1. **Test on Development First**
   - Never migrate production directly
   - Test full migration on dev/staging
   - Verify all functionality

2. **Backup Everything**
   - Database backup
   - Code backup (git commit)
   - Environment files backup

3. **Plan Downtime**
   - Schedule migration during low traffic
   - Notify users if needed
   - Have rollback plan ready

### During Migration

1. **Follow Steps in Order**
   - Don't skip steps
   - Verify each step before proceeding
   - Document any issues

2. **Monitor Logs**
   - Watch backend logs
   - Check frontend console
   - Look for errors

3. **Test Incrementally**
   - Test after each major step
   - Don't wait until end to test
   - Fix issues immediately

### After Migration

1. **Verify Everything**
   - Test all new features
   - Test all existing features
   - Check performance

2. **Monitor Production**
   - Watch error logs
   - Monitor database performance
   - Check user feedback

3. **Document Changes**
   - Update internal docs
   - Notify team of new features
   - Create user guides if needed

## Production Migration

### Additional Considerations

**1. Downtime Planning:**
- Estimate migration time (usually 5-15 minutes)
- Schedule during low traffic period
- Prepare maintenance page

**2. Database Backup:**
```bash
# Production backup with compression
pg_dump -U username -d database_name | gzip > backup_prod_$(date +%Y%m%d_%H%M%S).sql.gz
```

**3. Environment Variables:**
- Set in deployment platform (Vercel, Netlify, etc.)
- Don't commit to git
- Use secrets management

**4. Build and Deploy:**
```bash
# Backend
cd backend
npm run build
npm run start:prod

# Frontend
cd frontend
npm run build
npm start
```

**5. Post-Deployment:**
- Test all endpoints
- Check error monitoring (Sentry, etc.)
- Monitor performance metrics
- Verify SEO metadata

## Support

If you encounter issues during migration:

1. Check this troubleshooting section
2. Review error logs carefully
3. Consult the setup guide: `SETUP_GUIDE.md`
4. Check configuration guide: `CONFIGURATION_GUIDE.md`
5. Ask Kiro for help with specific errors

## Quick Reference

```bash
# Migration commands
cd backend
pg_dump database_name > backup.sql
npm run prisma:migrate
npm run prisma:generate
npm run prisma:seed
npm run start:dev

cd frontend
rm -rf .next
npm run dev

# Rollback commands
psql database_name < backup.sql
npx prisma migrate reset
git checkout HEAD -- prisma/schema.prisma

# Verification
curl http://localhost:3000/
curl http://localhost:3000/blog
curl http://localhost:3001/blog
```
