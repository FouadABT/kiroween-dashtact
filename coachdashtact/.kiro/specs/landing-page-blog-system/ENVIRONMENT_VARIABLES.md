# Environment Variables Reference

## Overview

This document provides a complete reference for all environment variables used by the landing page and blog system.

## Frontend Environment Variables

**Location:** `frontend/.env.local`

### Feature Flags

#### NEXT_PUBLIC_ENABLE_LANDING

**Type:** Boolean (string)  
**Default:** `false`  
**Required:** No

Enables or disables the landing page feature.

```env
NEXT_PUBLIC_ENABLE_LANDING=true
```

**Values:**
- `true` - Landing page enabled, accessible at `/`
- `false` - Landing page disabled, `/` redirects to `/dashboard` or `/login`

**Impact:**
- When enabled: Root route shows landing page with hero, features, and footer
- When disabled: Root route redirects based on authentication state
- Affects middleware routing behavior

---

#### NEXT_PUBLIC_ENABLE_BLOG

**Type:** Boolean (string)  
**Default:** `false`  
**Required:** No

Enables or disables the blog system.

```env
NEXT_PUBLIC_ENABLE_BLOG=true
```

**Values:**
- `true` - Blog enabled, accessible at `/blog`
- `false` - Blog disabled, `/blog` routes return 404

**Impact:**
- When enabled: Blog pages accessible, blog link in dashboard navigation
- When disabled: Blog routes return 404, blog link hidden from navigation
- Affects middleware routing and navigation context

---

### Blog Configuration

#### NEXT_PUBLIC_BLOG_POSTS_PER_PAGE

**Type:** Number (string)  
**Default:** `10`  
**Required:** No

Number of blog posts to display per page in the blog listing.

```env
NEXT_PUBLIC_BLOG_POSTS_PER_PAGE=10
```

**Values:**
- Any positive integer (recommended: 5-20)
- Default: `10` if not specified or invalid

**Impact:**
- Controls pagination on `/blog` page
- Affects API query limit
- Higher values may impact page load time

---

#### NEXT_PUBLIC_BLOG_ENABLE_CATEGORIES

**Type:** Boolean (string)  
**Default:** `true`  
**Required:** No

Enables or disables blog post categories.

```env
NEXT_PUBLIC_BLOG_ENABLE_CATEGORIES=true
```

**Values:**
- `true` - Categories enabled (default)
- `false` - Categories disabled

**Impact:**
- When enabled: Category selection in blog editor, category filtering on blog listing
- When disabled: Category fields hidden in UI
- Database tables still exist, just hidden from UI

---

#### NEXT_PUBLIC_BLOG_ENABLE_TAGS

**Type:** Boolean (string)  
**Default:** `true`  
**Required:** No

Enables or disables blog post tags.

```env
NEXT_PUBLIC_BLOG_ENABLE_TAGS=true
```

**Values:**
- `true` - Tags enabled (default)
- `false` - Tags disabled

**Impact:**
- When enabled: Tag input in blog editor, tag filtering on blog listing
- When disabled: Tag fields hidden in UI
- Database tables still exist, just hidden from UI

---

#### NEXT_PUBLIC_BLOG_REQUIRE_AUTHOR

**Type:** Boolean (string)  
**Default:** `false`  
**Required:** No

Determines if author information is required for blog posts.

```env
NEXT_PUBLIC_BLOG_REQUIRE_AUTHOR=false
```

**Values:**
- `true` - Author fields required
- `false` - Author fields optional (default)

**Impact:**
- When enabled: Author name and email required in blog editor
- When disabled: Author fields optional, can be left blank for SEO flexibility
- Affects form validation

---

### API Configuration

#### NEXT_PUBLIC_API_URL

**Type:** String (URL)  
**Default:** `http://localhost:3001`  
**Required:** Yes (for production)

Base URL for the backend API.

```env
NEXT_PUBLIC_API_URL=http://localhost:3001
```

**Values:**
- Development: `http://localhost:3001`
- Production: `https://api.yourdomain.com`

**Impact:**
- All API calls use this base URL
- Must match backend server URL
- Required for blog API endpoints

---

#### NEXT_PUBLIC_APP_URL

**Type:** String (URL)  
**Default:** `http://localhost:3000`  
**Required:** Yes (for production)

Base URL for the frontend application.

```env
NEXT_PUBLIC_APP_URL=http://localhost:3000
```

**Values:**
- Development: `http://localhost:3000`
- Production: `https://yourdomain.com`

**Impact:**
- Used for canonical URLs in SEO metadata
- Used for Open Graph URLs
- Used for sitemap generation

---

## Backend Environment Variables

**Location:** `backend/.env`

### Database Configuration

#### DATABASE_URL

**Type:** String (PostgreSQL connection string)  
**Required:** Yes

PostgreSQL database connection string.

```env
DATABASE_URL="postgresql://username:password@localhost:5432/dbname?schema=public"
```

**Format:**
```
postgresql://[user]:[password]@[host]:[port]/[database]?schema=[schema]
```

**Impact:**
- Required for all database operations
- Used by Prisma for migrations and queries
- Blog system requires this to store posts

---

### Server Configuration

#### PORT

**Type:** Number (string)  
**Default:** `3001`  
**Required:** No

Port number for the backend server.

```env
PORT=3001
```

**Values:**
- Any available port (recommended: 3001)
- Default: `3001` if not specified

**Impact:**
- Backend server listens on this port
- Frontend API_URL must match this port

---

#### NODE_ENV

**Type:** String (enum)  
**Default:** `development`  
**Required:** No

Node environment mode.

```env
NODE_ENV=production
```

**Values:**
- `development` - Development mode
- `production` - Production mode
- `test` - Test mode

**Impact:**
- Affects logging verbosity
- Affects error messages
- Affects performance optimizations

---

### Authentication Configuration

#### JWT_SECRET

**Type:** String  
**Required:** Yes

Secret key for JWT token signing.

```env
JWT_SECRET=your-super-secret-key-change-this-in-production
```

**Values:**
- Any strong random string
- Minimum 32 characters recommended
- Use different values for dev/prod

**Impact:**
- Used to sign and verify JWT tokens
- Critical for security
- Changing this invalidates all existing tokens

---

#### JWT_EXPIRATION

**Type:** String (time duration)  
**Default:** `15m`  
**Required:** No

Access token expiration time.

```env
JWT_EXPIRATION=15m
```

**Values:**
- Format: `[number][unit]` (e.g., `15m`, `1h`, `7d`)
- Units: `s` (seconds), `m` (minutes), `h` (hours), `d` (days)
- Recommended: `15m` for access tokens

**Impact:**
- How long access tokens remain valid
- Shorter = more secure, more frequent refreshes
- Longer = less secure, fewer refreshes

---

#### JWT_REFRESH_EXPIRATION

**Type:** String (time duration)  
**Default:** `7d`  
**Required:** No

Refresh token expiration time.

```env
JWT_REFRESH_EXPIRATION=7d
```

**Values:**
- Format: `[number][unit]`
- Recommended: `7d` for refresh tokens

**Impact:**
- How long refresh tokens remain valid
- Determines how often users must re-login

---

### Blog Configuration (Optional)

#### BLOG_ENABLE_CATEGORIES

**Type:** Boolean (string)  
**Default:** `true`  
**Required:** No

Backend flag for category support (mirrors frontend setting).

```env
BLOG_ENABLE_CATEGORIES=true
```

**Values:**
- `true` - Categories enabled
- `false` - Categories disabled

**Impact:**
- Can be used for backend validation
- Should match frontend setting

---

#### BLOG_ENABLE_TAGS

**Type:** Boolean (string)  
**Default:** `true`  
**Required:** No

Backend flag for tag support (mirrors frontend setting).

```env
BLOG_ENABLE_TAGS=true
```

**Values:**
- `true` - Tags enabled
- `false` - Tags disabled

**Impact:**
- Can be used for backend validation
- Should match frontend setting

---

## Environment File Examples

### Development (.env.local)

**Frontend:**
```env
# Feature Flags
NEXT_PUBLIC_ENABLE_LANDING=true
NEXT_PUBLIC_ENABLE_BLOG=true

# Blog Configuration
NEXT_PUBLIC_BLOG_POSTS_PER_PAGE=10
NEXT_PUBLIC_BLOG_ENABLE_CATEGORIES=true
NEXT_PUBLIC_BLOG_ENABLE_TAGS=true
NEXT_PUBLIC_BLOG_REQUIRE_AUTHOR=false

# API Configuration
NEXT_PUBLIC_API_URL=http://localhost:3001
NEXT_PUBLIC_APP_URL=http://localhost:3000

# Environment
NODE_ENV=development
```

**Backend:**
```env
# Database
DATABASE_URL="postgresql://postgres:password@localhost:5432/dashboard_dev?schema=public"

# Server
PORT=3001
NODE_ENV=development

# Authentication
JWT_SECRET=dev-secret-key-change-in-production
JWT_EXPIRATION=15m
JWT_REFRESH_EXPIRATION=7d

# Blog (optional)
BLOG_ENABLE_CATEGORIES=true
BLOG_ENABLE_TAGS=true
```

---

### Production (.env.production)

**Frontend:**
```env
# Feature Flags
NEXT_PUBLIC_ENABLE_LANDING=true
NEXT_PUBLIC_ENABLE_BLOG=true

# Blog Configuration
NEXT_PUBLIC_BLOG_POSTS_PER_PAGE=10
NEXT_PUBLIC_BLOG_ENABLE_CATEGORIES=true
NEXT_PUBLIC_BLOG_ENABLE_TAGS=true
NEXT_PUBLIC_BLOG_REQUIRE_AUTHOR=false

# API Configuration
NEXT_PUBLIC_API_URL=https://api.yourdomain.com
NEXT_PUBLIC_APP_URL=https://yourdomain.com

# Environment
NODE_ENV=production
```

**Backend:**
```env
# Database
DATABASE_URL="postgresql://prod_user:secure_password@db.yourdomain.com:5432/dashboard_prod?schema=public"

# Server
PORT=3001
NODE_ENV=production

# Authentication
JWT_SECRET=super-secure-random-string-min-32-chars
JWT_EXPIRATION=15m
JWT_REFRESH_EXPIRATION=7d

# Blog (optional)
BLOG_ENABLE_CATEGORIES=true
BLOG_ENABLE_TAGS=true
```

---

## Configuration Validation

### Required Variables

**Frontend (Minimum):**
- `NEXT_PUBLIC_API_URL` (production)
- `NEXT_PUBLIC_APP_URL` (production)

**Backend (Minimum):**
- `DATABASE_URL`
- `JWT_SECRET`

### Optional Variables

All feature flags and blog configuration variables are optional and have sensible defaults.

---

## Environment Variable Priority

1. **System environment variables** (highest priority)
2. **`.env.local`** (local overrides, gitignored)
3. **`.env.production`** (production defaults)
4. **`.env`** (shared defaults)
5. **Code defaults** (lowest priority)

---

## Security Best Practices

### DO:
- ✅ Use different `JWT_SECRET` for dev/prod
- ✅ Use strong random strings for secrets (32+ characters)
- ✅ Keep `.env.local` in `.gitignore`
- ✅ Use environment variables in deployment platform
- ✅ Rotate secrets periodically

### DON'T:
- ❌ Commit `.env.local` or `.env.production` to git
- ❌ Use weak or predictable secrets
- ❌ Share secrets in plain text
- ❌ Use production secrets in development
- ❌ Hardcode secrets in source code

---

## Deployment Platforms

### Vercel

Set environment variables in project settings:
1. Go to Project Settings → Environment Variables
2. Add each variable with appropriate scope (Production/Preview/Development)
3. Redeploy after changes

### Netlify

Set environment variables in site settings:
1. Go to Site Settings → Build & Deploy → Environment
2. Add each variable
3. Trigger new deploy

### Docker

Pass environment variables via:
- `docker run -e VAR=value`
- `docker-compose.yml` environment section
- `.env` file with `docker-compose`

---

## Troubleshooting

### Variables Not Loading

**Problem**: Environment variables not recognized

**Solutions**:
1. Restart dev server after changing `.env.local`
2. Check variable names (must start with `NEXT_PUBLIC_` for frontend)
3. Verify file is named exactly `.env.local`
4. Check file is in correct directory (`frontend/` or `backend/`)

### Feature Not Enabling

**Problem**: Setting `NEXT_PUBLIC_ENABLE_BLOG=true` doesn't enable blog

**Solutions**:
1. Restart frontend server
2. Clear Next.js cache: `rm -rf .next`
3. Check for typos in variable name
4. Verify value is exactly `true` (lowercase)

### API Connection Failed

**Problem**: Frontend can't connect to backend

**Solutions**:
1. Verify `NEXT_PUBLIC_API_URL` matches backend URL
2. Check backend is running on specified port
3. Check CORS configuration in backend
4. Verify no firewall blocking connection

---

## Quick Reference

```bash
# Frontend feature flags
NEXT_PUBLIC_ENABLE_LANDING=true|false
NEXT_PUBLIC_ENABLE_BLOG=true|false

# Blog configuration
NEXT_PUBLIC_BLOG_POSTS_PER_PAGE=10
NEXT_PUBLIC_BLOG_ENABLE_CATEGORIES=true|false
NEXT_PUBLIC_BLOG_ENABLE_TAGS=true|false
NEXT_PUBLIC_BLOG_REQUIRE_AUTHOR=true|false

# API URLs
NEXT_PUBLIC_API_URL=http://localhost:3001
NEXT_PUBLIC_APP_URL=http://localhost:3000

# Backend essentials
DATABASE_URL="postgresql://..."
JWT_SECRET=your-secret-key
PORT=3001
```
