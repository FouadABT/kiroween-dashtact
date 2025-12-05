# Security Credentials Guide

## 🚨 CRITICAL: Credentials Were Exposed on GitHub

**Date**: November 28, 2025  
**Status**: ✅ FIXED - Credentials removed from repository

### What Happened

Production credentials were accidentally committed to the GitHub repository in:
- `deployment/production.env.backend`
- `deployment/production.env.frontend`

**Exposed Information**:
- Database password
- JWT secret
- Database connection string

### Actions Taken

1. ✅ Removed files from git tracking
2. ✅ Updated `.gitignore` to prevent future commits
3. ✅ Replaced credentials with placeholders in local files
4. ✅ Created `.example` template files for deployment
5. ✅ Pushed changes to GitHub

---

## 🔐 REQUIRED ACTIONS (DO THIS NOW!)

### 1. Change Database Password

**On your production server:**

```bash
# Connect to PostgreSQL as superuser
sudo -u postgres psql

# Change the password
ALTER USER kit_dashtact_user WITH PASSWORD 'NEW_SECURE_PASSWORD_HERE';

# Exit
\q
```

### 2. Generate New Secure Credentials

**Use these commands to generate secure random strings:**

```bash
# Database Password (32 characters)
openssl rand -base64 32

# JWT Secret (64 characters minimum)
openssl rand -base64 64

# Email Encryption Key (32 characters minimum)
openssl rand -base64 48
```

**Or use PowerShell:**

```powershell
# Generate 32-char password
-join ((65..90) + (97..122) + (48..57) | Get-Random -Count 32 | ForEach-Object {[char]$_})

# Generate 64-char JWT secret
-join ((65..90) + (97..122) + (48..57) | Get-Random -Count 64 | ForEach-Object {[char]$_})

# Generate 48-char email key
-join ((65..90) + (97..122) + (48..57) | Get-Random -Count 48 | ForEach-Object {[char]$_})
```

### 3. Update Production Environment Files

**On your production server:**

```bash
cd /var/www/kit.dashtact.com

# Copy example files
cp deployment/production.env.backend.example deployment/production.env.backend
cp deployment/production.env.frontend.example deployment/production.env.frontend

# Edit with new credentials
nano deployment/production.env.backend
```

**Update these values:**
- `DATABASE_URL` - Use new database password
- `JWT_SECRET` - Use new JWT secret (min 64 chars)
- `EMAIL_ENCRYPTION_KEY` - Use new encryption key (min 32 chars)

### 4. Update Local Development Files

**Update `backend/.env`:**

```bash
# Generate new credentials for development
DATABASE_URL="postgresql://postgres:NEW_DEV_PASSWORD@localhost:5432/myapp?schema=public"
JWT_SECRET=NEW_DEV_JWT_SECRET_MIN_64_CHARS
EMAIL_ENCRYPTION_KEY=NEW_DEV_EMAIL_KEY_MIN_32_CHARS
```

### 5. Restart Services

**On production server:**

```bash
# Restart backend
pm2 restart kit-dashtact-backend

# Restart frontend
pm2 restart kit-dashtact-frontend

# Verify services are running
pm2 status
```

**On local development:**

```bash
# Stop dev servers (Ctrl+C)
# Restart backend
cd backend
npm run start:dev

# Restart frontend (in new terminal)
cd frontend
npm run dev
```

### 6. Check Database for SMTP Credentials

Since the database was exposed, check if SMTP credentials are stored:

```bash
# Connect to production database
psql -U kit_dashtact_user -d kit_dashtact_db

# Check email configuration
SELECT "smtpHost", "smtpUsername", "senderEmail" FROM "EmailConfiguration";

# Exit
\q
```

**If SMTP credentials exist:**
1. Change your SMTP password (Gmail, Brevo, etc.)
2. Update credentials in the dashboard: `/dashboard/settings/email`

---

## 🛡️ Prevention Checklist

### Files That Should NEVER Be Committed

- ❌ `.env`
- ❌ `.env.local`
- ❌ `.env.development`
- ❌ `.env.production`
- ❌ `deployment/production.env.backend`
- ❌ `deployment/production.env.frontend`
- ❌ Any file containing passwords, API keys, or secrets

### Files That SHOULD Be Committed

- ✅ `.env.example`
- ✅ `deployment/production.env.backend.example`
- ✅ `deployment/production.env.frontend.example`
- ✅ Configuration templates with placeholder values

### Before Every Git Commit

```bash
# Check what you're committing
git status

# Review changes
git diff

# Make sure no .env files are included
git ls-files | grep "\.env$"

# If any .env files appear, DO NOT COMMIT!
```

### Git Hooks (Optional)

Create `.git/hooks/pre-commit`:

```bash
#!/bin/bash
# Prevent committing .env files

if git diff --cached --name-only | grep -E "\.env$|\.env\..*$"; then
    echo "❌ ERROR: Attempting to commit .env files!"
    echo "These files contain sensitive credentials."
    exit 1
fi
```

Make it executable:
```bash
chmod +x .git/hooks/pre-commit
```

---

## 📋 Verification Checklist

After completing all steps:

- [ ] Database password changed (production)
- [ ] Database password changed (development)
- [ ] JWT secret changed (production)
- [ ] JWT secret changed (development)
- [ ] Email encryption key changed (production)
- [ ] Email encryption key changed (development)
- [ ] SMTP credentials changed (if applicable)
- [ ] Production services restarted
- [ ] Development servers restarted
- [ ] Application works correctly
- [ ] No `.env` files in `git status`
- [ ] `.gitignore` updated
- [ ] Example files created

---

## 🔍 How to Check Git History

To verify credentials are removed from GitHub:

```bash
# Search git history for exposed credentials
git log --all --full-history -- deployment/production.env.backend

# Check if file exists in current commit
git ls-files | grep production.env.backend
```

**Expected result**: File should NOT appear in `git ls-files`

---

## 📞 If You Need Help

1. **GitGuardian Alert**: Mark as resolved after changing credentials
2. **GitHub Security**: Check repository security alerts
3. **Database Access**: Monitor for suspicious activity
4. **Application Logs**: Check for unauthorized access attempts

---

## 🎯 Summary

**What was exposed:**
- Production database credentials
- JWT secrets
- Database connection strings

**What you must do:**
1. Change ALL passwords and secrets
2. Update production environment files
3. Restart all services
4. Verify application works
5. Monitor for suspicious activity

**Prevention:**
- Never commit `.env` files
- Always use `.env.example` templates
- Review changes before committing
- Use git hooks to prevent accidents

---

**Last Updated**: November 28, 2025  
**Status**: Credentials removed from repository, awaiting production updates
