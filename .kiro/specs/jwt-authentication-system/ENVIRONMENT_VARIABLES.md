# Environment Variables Documentation

## Table of Contents
- [Overview](#overview)
- [Backend Environment Variables](#backend-environment-variables)
- [Frontend Environment Variables](#frontend-environment-variables)
- [Example Configuration Files](#example-configuration-files)
- [Production Security Considerations](#production-security-considerations)
- [Configuration Options and Defaults](#configuration-options-and-defaults)
- [Troubleshooting](#troubleshooting)

---

## Overview

This authentication system uses environment variables for configuration to keep sensitive data secure and allow easy configuration across different environments (development, staging, production).

### Key Principles

- **Never commit secrets** to version control
- **Use different values** for development and production
- **Validate required variables** on application startup
- **Document all variables** for team members

---

## Backend Environment Variables

### Location

Create a `.env` file in the `backend/` directory:

```
backend/
├── .env          # Your environment variables (DO NOT COMMIT)
├── .env.example  # Template file (safe to commit)
└── src/
```

### Required Variables

These variables **must** be set for the application to run:

#### Database Configuration

```env
# PostgreSQL database connection string
DATABASE_URL="postgresql://username:password@localhost:5432/database_name?schema=public"
```

**Format:** `postgresql://[user]:[password]@[host]:[port]/[database]?schema=[schema]`

**Example Values:**
```env
# Local development
DATABASE_URL="postgresql://postgres:postgres@localhost:5432/myapp_dev?schema=public"

# Production (use environment-specific values)
DATABASE_URL="postgresql://prod_user:secure_password@db.example.com:5432/myapp_prod?schema=public"
```

#### JWT Configuration

```env
# Secret key for signing JWT tokens (MUST be changed in production)
JWT_SECRET="your-super-secret-jwt-key-change-in-production"

# Access token expiration time
JWT_ACCESS_EXPIRATION="15m"

# Refresh token expiration time
JWT_REFRESH_EXPIRATION="7d"
```

**JWT_SECRET Requirements:**
- Minimum 32 characters
- Use random, unpredictable string
- Different for each environment
- Never share or commit to version control

**Generate Secure Secret:**
```bash
# Using Node.js
node -e "console.log(require('crypto').randomBytes(64).toString('hex'))"

# Using OpenSSL
openssl rand -hex 64
```

**Expiration Format:**
- `s` - seconds
- `m` - minutes
- `h` - hours
- `d` - days

**Examples:**
```env
JWT_ACCESS_EXPIRATION="30m"   # 30 minutes
JWT_ACCESS_EXPIRATION="2h"    # 2 hours
JWT_REFRESH_EXPIRATION="30d"  # 30 days
```

### Optional Variables

These variables have defaults but can be customized:

#### Server Configuration

```env
# Port for the backend server (default: 3001)
PORT=3001

# Node environment (default: development)
NODE_ENV=development
```

**NODE_ENV Values:**
- `development` - Development mode with debug features
- `production` - Production mode with optimizations
- `test` - Testing mode

#### Security Configuration

```env
# bcrypt salt rounds for password hashing (default: 10)
BCRYPT_ROUNDS=10

# Rate limiting - time window in seconds (default: 900 = 15 minutes)
RATE_LIMIT_TTL=900

# Rate limiting - max requests per window (default: 5)
RATE_LIMIT_MAX=5
```

**BCRYPT_ROUNDS:**
- Higher = more secure but slower
- Recommended: 10-12 for production
- Development: 10 (faster)
- Production: 12 (more secure)

**Rate Limiting:**
```env
# Strict (production)
RATE_LIMIT_TTL=900    # 15 minutes
RATE_LIMIT_MAX=3      # 3 attempts

# Moderate (default)
RATE_LIMIT_TTL=900    # 15 minutes
RATE_LIMIT_MAX=5      # 5 attempts

# Lenient (development)
RATE_LIMIT_TTL=60     # 1 minute
RATE_LIMIT_MAX=100    # 100 attempts
```

#### CORS Configuration

```env
# Allowed origins for CORS (comma-separated)
CORS_ORIGINS="http://localhost:3000,http://localhost:3001"

# Allow credentials in CORS requests (default: true)
CORS_CREDENTIALS=true
```

**Production Example:**
```env
CORS_ORIGINS="https://app.example.com,https://www.example.com"
```

#### Email Configuration (Optional Features)

```env
# SMTP server for sending emails
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=your-email@gmail.com
SMTP_PASS=your-app-password

# Email sender address
EMAIL_FROM="MyApp <noreply@myapp.com>"

# Application URL for email links
APP_URL=http://localhost:3000
```

#### OAuth Configuration (Optional Features)

```env
# Google OAuth
GOOGLE_CLIENT_ID=your-google-client-id
GOOGLE_CLIENT_SECRET=your-google-client-secret
GOOGLE_CALLBACK_URL=http://localhost:3001/auth/google/callback

# GitHub OAuth
GITHUB_CLIENT_ID=your-github-client-id
GITHUB_CLIENT_SECRET=your-github-client-secret
GITHUB_CALLBACK_URL=http://localhost:3001/auth/github/callback
```

#### Logging Configuration

```env
# Log level (default: info)
LOG_LEVEL=info

# Enable audit logging (default: true)
ENABLE_AUDIT_LOGGING=true
```

**LOG_LEVEL Values:**
- `error` - Only errors
- `warn` - Warnings and errors
- `info` - Info, warnings, and errors (default)
- `debug` - All logs including debug info
- `verbose` - Very detailed logs

---

## Frontend Environment Variables

### Location

Create a `.env.local` file in the `frontend/` directory:

```
frontend/
├── .env.local        # Your environment variables (DO NOT COMMIT)
├── .env.example      # Template file (safe to commit)
└── src/
```

### Required Variables

```env
# Backend API URL
NEXT_PUBLIC_API_URL=http://localhost:3001

# Frontend application URL
NEXT_PUBLIC_APP_URL=http://localhost:3000
```

**Important:** Next.js requires the `NEXT_PUBLIC_` prefix for variables that need to be accessible in the browser.

**Environment-Specific Values:**
```env
# Development
NEXT_PUBLIC_API_URL=http://localhost:3001
NEXT_PUBLIC_APP_URL=http://localhost:3000

# Staging
NEXT_PUBLIC_API_URL=https://api-staging.example.com
NEXT_PUBLIC_APP_URL=https://staging.example.com

# Production
NEXT_PUBLIC_API_URL=https://api.example.com
NEXT_PUBLIC_APP_URL=https://app.example.com
```

### Optional Variables

```env
# Node environment (default: development)
NODE_ENV=development

# Enable debug features (default: false in production)
NEXT_PUBLIC_ENABLE_DEBUG=false

# Analytics tracking ID (optional)
NEXT_PUBLIC_ANALYTICS_ID=UA-XXXXXXXXX-X

# Feature flags
NEXT_PUBLIC_ENABLE_SOCIAL_AUTH=false
NEXT_PUBLIC_ENABLE_2FA=false
```

---

## Example Configuration Files

### Backend `.env.example`

Create this file to help team members set up their environment:

```env
# Database Configuration
DATABASE_URL="postgresql://postgres:postgres@localhost:5432/myapp_dev?schema=public"

# JWT Configuration
JWT_SECRET="change-this-to-a-secure-random-string-in-production"
JWT_ACCESS_EXPIRATION="15m"
JWT_REFRESH_EXPIRATION="7d"

# Server Configuration
PORT=3001
NODE_ENV=development

# Security Configuration
BCRYPT_ROUNDS=10
RATE_LIMIT_TTL=900
RATE_LIMIT_MAX=5

# CORS Configuration
CORS_ORIGINS="http://localhost:3000,http://localhost:3001"
CORS_CREDENTIALS=true

# Logging
LOG_LEVEL=info
ENABLE_AUDIT_LOGGING=true

# Optional: Email Configuration (for email verification, password reset)
# SMTP_HOST=smtp.gmail.com
# SMTP_PORT=587
# SMTP_USER=your-email@gmail.com
# SMTP_PASS=your-app-password
# EMAIL_FROM="MyApp <noreply@myapp.com>"
# APP_URL=http://localhost:3000

# Optional: OAuth Configuration
# GOOGLE_CLIENT_ID=your-google-client-id
# GOOGLE_CLIENT_SECRET=your-google-client-secret
# GOOGLE_CALLBACK_URL=http://localhost:3001/auth/google/callback
# GITHUB_CLIENT_ID=your-github-client-id
# GITHUB_CLIENT_SECRET=your-github-client-secret
# GITHUB_CALLBACK_URL=http://localhost:3001/auth/github/callback
```

### Frontend `.env.example`

```env
# API Configuration
NEXT_PUBLIC_API_URL=http://localhost:3001
NEXT_PUBLIC_APP_URL=http://localhost:3000

# Environment
NODE_ENV=development

# Debug Features (disable in production)
NEXT_PUBLIC_ENABLE_DEBUG=true

# Optional: Analytics
# NEXT_PUBLIC_ANALYTICS_ID=UA-XXXXXXXXX-X

# Optional: Feature Flags
# NEXT_PUBLIC_ENABLE_SOCIAL_AUTH=false
# NEXT_PUBLIC_ENABLE_2FA=false
```

### Development Setup

```bash
# Backend
cd backend
cp .env.example .env
# Edit .env with your values

# Frontend
cd frontend
cp .env.example .env.local
# Edit .env.local with your values
```

---

## Production Security Considerations

### Critical Security Checklist

- [ ] **Change JWT_SECRET** to a strong, random value
- [ ] **Use HTTPS** for all URLs (API and frontend)
- [ ] **Secure database credentials** with strong passwords
- [ ] **Enable rate limiting** with strict limits
- [ ] **Configure CORS** to only allow your domains
- [ ] **Use environment-specific values** (don't use dev values in prod)
- [ ] **Store secrets securely** (use secret management service)
- [ ] **Enable audit logging** for security monitoring
- [ ] **Set NODE_ENV=production** for optimizations
- [ ] **Disable debug features** in production

### Production Environment Variables

```env
# Backend Production .env
DATABASE_URL="postgresql://prod_user:SECURE_PASSWORD@prod-db.example.com:5432/myapp_prod?schema=public"
JWT_SECRET="GENERATED_SECURE_RANDOM_STRING_64_CHARS_OR_MORE"
JWT_ACCESS_EXPIRATION="15m"
JWT_REFRESH_EXPIRATION="7d"
PORT=3001
NODE_ENV=production
BCRYPT_ROUNDS=12
RATE_LIMIT_TTL=900
RATE_LIMIT_MAX=3
CORS_ORIGINS="https://app.example.com"
CORS_CREDENTIALS=true
LOG_LEVEL=warn
ENABLE_AUDIT_LOGGING=true
```

```env
# Frontend Production .env.local
NEXT_PUBLIC_API_URL=https://api.example.com
NEXT_PUBLIC_APP_URL=https://app.example.com
NODE_ENV=production
NEXT_PUBLIC_ENABLE_DEBUG=false
```

### Secret Management

**Don't:**
- ❌ Commit `.env` files to version control
- ❌ Share secrets in chat or email
- ❌ Use the same secrets across environments
- ❌ Use weak or predictable secrets

**Do:**
- ✅ Use a secret management service (AWS Secrets Manager, HashiCorp Vault, etc.)
- ✅ Rotate secrets regularly
- ✅ Use different secrets for each environment
- ✅ Generate strong, random secrets
- ✅ Limit access to production secrets

### Deployment Platforms

#### Vercel

```bash
# Set environment variables in Vercel dashboard or CLI
vercel env add NEXT_PUBLIC_API_URL production
vercel env add NEXT_PUBLIC_APP_URL production
```

#### Heroku

```bash
# Set environment variables using Heroku CLI
heroku config:set JWT_SECRET="your-secret" --app your-app
heroku config:set DATABASE_URL="your-db-url" --app your-app
```

#### AWS

Use AWS Systems Manager Parameter Store or Secrets Manager:

```bash
# Store secret in Parameter Store
aws ssm put-parameter \
  --name "/myapp/prod/jwt-secret" \
  --value "your-secret" \
  --type "SecureString"
```

#### Docker

```yaml
# docker-compose.yml
services:
  backend:
    environment:
      - JWT_SECRET=${JWT_SECRET}
      - DATABASE_URL=${DATABASE_URL}
    env_file:
      - .env.production
```

---

## Configuration Options and Defaults

### Backend Configuration Defaults

| Variable | Default | Description |
|----------|---------|-------------|
| `PORT` | `3001` | Server port |
| `NODE_ENV` | `development` | Environment mode |
| `JWT_ACCESS_EXPIRATION` | `15m` | Access token lifetime |
| `JWT_REFRESH_EXPIRATION` | `7d` | Refresh token lifetime |
| `BCRYPT_ROUNDS` | `10` | Password hashing rounds |
| `RATE_LIMIT_TTL` | `900` | Rate limit window (seconds) |
| `RATE_LIMIT_MAX` | `5` | Max requests per window |
| `CORS_CREDENTIALS` | `true` | Allow credentials in CORS |
| `LOG_LEVEL` | `info` | Logging verbosity |
| `ENABLE_AUDIT_LOGGING` | `true` | Enable audit logs |

### Frontend Configuration Defaults

| Variable | Default | Description |
|----------|---------|-------------|
| `NODE_ENV` | `development` | Environment mode |
| `NEXT_PUBLIC_ENABLE_DEBUG` | `false` (prod) | Enable debug panel |

### Accessing Configuration in Code

#### Backend

```typescript
// backend/src/config/auth.config.ts
export const authConfig = {
  tokens: {
    accessTokenExpiration: process.env.JWT_ACCESS_EXPIRATION || '15m',
    refreshTokenExpiration: process.env.JWT_REFRESH_EXPIRATION || '7d',
  },
  security: {
    bcryptRounds: parseInt(process.env.BCRYPT_ROUNDS || '10'),
    rateLimitTTL: parseInt(process.env.RATE_LIMIT_TTL || '900'),
    rateLimitMax: parseInt(process.env.RATE_LIMIT_MAX || '5'),
  },
};
```

#### Frontend

```typescript
// frontend/src/config/auth.config.ts
export const authConfig = {
  apiUrl: process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001',
  appUrl: process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000',
  ui: {
    enableDebugPanel: process.env.NEXT_PUBLIC_ENABLE_DEBUG === 'true',
  },
};
```

---

## Troubleshooting

### Common Issues

#### Issue: "JWT_SECRET is not defined"

**Cause:** Missing or incorrectly named environment variable

**Solution:**
```bash
# Check if .env file exists
ls backend/.env

# Verify JWT_SECRET is set
cat backend/.env | grep JWT_SECRET

# If missing, add it
echo 'JWT_SECRET="your-secret-here"' >> backend/.env
```

#### Issue: "Cannot connect to database"

**Cause:** Incorrect DATABASE_URL

**Solution:**
```bash
# Verify database is running
psql -h localhost -U postgres -d myapp_dev

# Check DATABASE_URL format
# Should be: postgresql://user:password@host:port/database?schema=public

# Test connection
cd backend
npm run prisma:studio
```

#### Issue: "CORS error in browser"

**Cause:** Frontend URL not in CORS_ORIGINS

**Solution:**
```env
# Backend .env - add frontend URL
CORS_ORIGINS="http://localhost:3000,http://localhost:3001"
```

#### Issue: "Environment variables not updating"

**Cause:** Need to restart server after changing .env

**Solution:**
```bash
# Backend
cd backend
# Stop server (Ctrl+C)
npm run start:dev

# Frontend
cd frontend
# Stop server (Ctrl+C)
npm run dev
```

#### Issue: "NEXT_PUBLIC_ variables not working"

**Cause:** Next.js requires restart after adding new variables

**Solution:**
```bash
cd frontend
# Stop server (Ctrl+C)
npm run dev
# Variables are embedded at build time
```

### Validation Script

Create a script to validate environment variables:

```typescript
// backend/src/config/validate-env.ts
export function validateEnvironment() {
  const required = [
    'DATABASE_URL',
    'JWT_SECRET',
  ];
  
  const missing = required.filter(key => !process.env[key]);
  
  if (missing.length > 0) {
    throw new Error(
      `Missing required environment variables: ${missing.join(', ')}\n` +
      'Please check your .env file.'
    );
  }
  
  // Validate JWT_SECRET strength
  if (process.env.JWT_SECRET.length < 32) {
    console.warn('⚠️  JWT_SECRET should be at least 32 characters for security');
  }
  
  // Warn about production settings
  if (process.env.NODE_ENV === 'production') {
    if (process.env.JWT_SECRET.includes('change-this')) {
      throw new Error('JWT_SECRET must be changed in production!');
    }
    if (!process.env.DATABASE_URL.includes('ssl=true')) {
      console.warn('⚠️  Consider enabling SSL for production database');
    }
  }
  
  console.log('✅ Environment variables validated');
}
```

Call in `main.ts`:
```typescript
// backend/src/main.ts
import { validateEnvironment } from './config/validate-env';

async function bootstrap() {
  validateEnvironment(); // Validate on startup
  
  const app = await NestFactory.create(AppModule);
  // ... rest of bootstrap
}
```

---

## Quick Reference

### Minimum Required Setup

**Backend `.env`:**
```env
DATABASE_URL="postgresql://postgres:postgres@localhost:5432/myapp_dev?schema=public"
JWT_SECRET="your-secret-key-change-in-production"
```

**Frontend `.env.local`:**
```env
NEXT_PUBLIC_API_URL=http://localhost:3001
NEXT_PUBLIC_APP_URL=http://localhost:3000
```

### Production Checklist

- [ ] Generate secure JWT_SECRET (64+ characters)
- [ ] Use HTTPS URLs for API and frontend
- [ ] Set NODE_ENV=production
- [ ] Increase BCRYPT_ROUNDS to 12
- [ ] Reduce RATE_LIMIT_MAX to 3
- [ ] Configure CORS_ORIGINS with production domains
- [ ] Enable audit logging
- [ ] Set up secret management service
- [ ] Test all environment variables
- [ ] Document any custom variables

---

## Additional Resources

- [Backend Configuration](../backend/src/config/auth.config.ts)
- [Frontend Configuration](../frontend/src/config/auth.config.ts)
- [API Documentation](./API_DOCUMENTATION.md)
- [Customization Guide](./CUSTOMIZATION_GUIDE.md)
- [Main README](./README.md)

---

## Support

If you encounter issues with environment variables:

1. Check this documentation
2. Verify `.env` files exist and are not committed
3. Ensure variables are spelled correctly
4. Restart servers after changes
5. Check for typos in variable names
6. Validate required variables are set
