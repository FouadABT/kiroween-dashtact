# Dashtact Server Documentation

**⚠️ CONFIDENTIAL - Contains Sensitive Information**

This document contains complete server configuration, credentials, and deployment procedures for the Dashtact production environment.

---

## Table of Contents

1. [Server Overview](#server-overview)
2. [Server Access](#server-access)
3. [Domain Configuration](#domain-configuration)
4. [Database Configuration](#database-configuration)
5. [Application Architecture](#application-architecture)
6. [Deployment Process](#deployment-process)
7. [Environment Variables](#environment-variables)
8. [Service Management](#service-management)
9. [Troubleshooting](#troubleshooting)
10. [Security Information](#security-information)

---

## Server Overview

### Infrastructure Details

**Provider:** AWS EC2  
**Region:** EU North 1 (Stockholm)  
**Instance Type:** t2.micro (or current type)  
**Operating System:** Ubuntu 22.04 LTS  
**Public IP:** `13.53.218.109`  
**Hostname:** `ec2-13-53-218-109.eu-north-1.compute.amazonaws.com`

### Installed Software

- **Node.js:** 20.x LTS
- **npm:** 10.x
- **PostgreSQL:** 14+ (with database: kit_dashtact_db)
- **Nginx:** Latest stable (reverse proxy)
- **PM2:** Latest (process manager)
- **Certbot:** Latest (SSL management)

### Firewall Configuration (UFW)

```
Port 22   - SSH (OpenSSH)
Port 80   - HTTP (Nginx)
Port 443  - HTTPS (Nginx)
Port 3100 - Frontend (internal, not exposed)
Port 3101 - Backend (internal, not exposed)
Port 5432 - PostgreSQL (internal, not exposed)
```

---

## Server Access

### SSH Connection

**SSH Key Location (Local):**
```
C:\Users\fabat\Desktop\dashtact\my-ec2-key.pem
```

**Connection Command:**
```bash
ssh -i "C:\Users\fabat\Desktop\dashtact\my-ec2-key.pem" ubuntu@ec2-13-53-218-109.eu-north-1.compute.amazonaws.com
```

**Quick Connect (PowerShell):**
```powershell
cd C:\Users\fabat\Desktop\dashtact
ssh -i "my-ec2-key.pem" ubuntu@13.53.218.109
```

**User:** `ubuntu` (default AWS Ubuntu user with sudo privileges)

### Key Permissions

If you get permission errors on Windows, the key file should have restricted permissions. The file is already configured correctly.

---

## Domain Configuration

### DNS Provider

**Provider:** LWS.fr  
**Registrar:** LWS.fr

### CDN/Security

**Provider:** Cloudflare  
**Account:** Your Cloudflare account

### Domain Structure

```
dashtact.com
├── dashtact.com              # Demo/landing page (static HTML)
└── kit.dashtact.com          # Full-stack dashboard application
    ├── Frontend (Next.js)    # Port 3100
    ├── Backend (NestJS)      # Port 3101
    └── Database (PostgreSQL) # Port 5432
```

### DNS Records (Cloudflare)

```
Type    Name    Content             Proxy Status
----    ----    -------             ------------
A       @       13.53.218.109       Proxied (🟠)
A       www     13.53.218.109       Proxied (🟠)
A       *       13.53.218.109       Proxied (🟠)
```

The wildcard `*` record covers all subdomains including `kit.dashtact.com`.

### SSL/TLS Configuration

**SSL Mode:** Full (strict)  
**Certificate Type:** Cloudflare Origin Certificate  
**Certificate Location:** `/etc/ssl/cloudflare/dashtact.com.pem`  
**Private Key Location:** `/etc/ssl/cloudflare/dashtact.com.key`  
**Auto-Renewal:** Managed by Cloudflare (15-year certificate)

---

## Database Configuration

### PostgreSQL Details

**Database Name:** `kit_dashtact_db`  
**Database User:** `kit_dashtact_user`  
**Database Password:** `UcbMjpOJEbocT32GqNS20SYHSTr59JiS`  
**Host:** `localhost`  
**Port:** `5432`

### Connection String

```
postgresql://kit_dashtact_user:UcbMjpOJEbocT32GqNS20SYHSTr59JiS@localhost:5432/kit_dashtact_db?schema=public
```

### Database Access

**Connect to database:**
```bash
psql -U kit_dashtact_user -d kit_dashtact_db -h localhost
```

**Connect as postgres admin:**
```bash
sudo -u postgres psql
```

### Database Schema

The database schema is managed by Prisma ORM. Tables include:
- `users` - User accounts
- `user_roles` - Role definitions
- `permissions` - Permission definitions
- `role_permissions` - Role-permission mappings
- `token_blacklist` - Revoked JWT tokens
- `settings` - Application settings

### Backup Commands

```bash
# Backup database
pg_dump -U kit_dashtact_user -d kit_dashtact_db > backup_$(date +%Y%m%d).sql

# Restore database
psql -U kit_dashtact_user -d kit_dashtact_db < backup_20250109.sql
```

---

## Application Architecture

### Directory Structure

```
/home/ubuntu/apps/
├── kit-dashtact/              # Main application
│   ├── backend/               # NestJS backend
│   │   ├── dist/              # Compiled JavaScript
│   │   ├── src/               # TypeScript source
│   │   ├── prisma/            # Database schema & migrations
│   │   ├── .env               # Production environment variables
│   │   └── package.json
│   └── frontend/              # Next.js frontend
│       ├── .next/             # Built application
│       ├── src/               # Source code
│       ├── .env.local         # Production environment variables
│       └── package.json
└── (future projects here)
```

### Nginx Configuration

**Main domain config:** `/etc/nginx/sites-available/dashtact.com`  
**App subdomain config:** `/etc/nginx/sites-available/kit.dashtact.com`

**Enabled sites:**
```bash
/etc/nginx/sites-enabled/
├── dashtact.com -> /etc/nginx/sites-available/dashtact.com
└── kit.dashtact.com -> /etc/nginx/sites-available/kit.dashtact.com
```

### Request Flow

```
User Browser
    ↓
Cloudflare CDN (SSL termination, caching, DDoS protection)
    ↓
Nginx (Port 443) - kit.dashtact.com
    ↓
    ├─→ / → Next.js Frontend (Port 3100)
    └─→ /api → NestJS Backend (Port 3101)
            ↓
        PostgreSQL (Port 5432)
```

### PM2 Processes

```
┌─────┬──────────────────┬─────────┬─────────┐
│ ID  │ Name             │ Status  │ Port    │
├─────┼──────────────────┼─────────┼─────────┤
│ 0   │ kit-backend      │ online  │ 3101    │
│ 1   │ kit-frontend     │ online  │ 3100    │
└─────┴──────────────────┴─────────┴─────────┘
```

---

## Deployment Process

### Prerequisites

1. **Local project location:** `C:\Users\fabat\Desktop\dashtact`
2. **SSH key ready:** `my-ec2-key.pem` in project root
3. **Environment files configured:** `.env.production` files exist
4. **Code committed:** All changes saved locally

### Method 1: Using Kiro Agent Hook (Recommended)

1. Open Kiro IDE
2. Go to **View → Agent Hooks** (or Command Palette → "Open Kiro Hook UI")
3. Find **"Deploy Dashtact to AWS"** hook
4. Click **"🚀 Deploy to Production"** button
5. Agent will handle entire deployment automatically

### Method 2: Manual Deployment

#### Step 1: Copy Files to Server

**From local machine (PowerShell or Git Bash):**

```bash
# Navigate to project directory
cd C:\Users\fabat\Desktop\dashtact

# Copy backend
scp -i "my-ec2-key.pem" -r backend ubuntu@ec2-13-53-218-109.eu-north-1.compute.amazonaws.com:~/apps/kit-dashtact/

# Copy frontend
scp -i "my-ec2-key.pem" -r frontend ubuntu@ec2-13-53-218-109.eu-north-1.compute.amazonaws.com:~/apps/kit-dashtact/
```

#### Step 2: Deploy Backend

**SSH into server, then:**

```bash
cd ~/apps/kit-dashtact/backend

# Copy production environment
cp .env.production .env

# Install dependencies
npm install --production

# Generate Prisma client
npm run prisma:generate

# Run database migrations
npm run prisma:migrate deploy

# Seed database (first time only)
npm run prisma:seed

# Build application
npm run build

# Restart with PM2
pm2 delete kit-backend 2>/dev/null || true
pm2 start dist/main.js --name kit-backend --env production
pm2 save

# Check logs
pm2 logs kit-backend --lines 20
```

#### Step 3: Deploy Frontend

```bash
cd ~/apps/kit-dashtact/frontend

# Copy production environment
cp .env.production .env.local

# Install dependencies
npm install --production

# Build application
npm run build

# Restart with PM2
pm2 delete kit-frontend 2>/dev/null || true
pm2 start npm --name kit-frontend -- start
pm2 save

# Check logs
pm2 logs kit-frontend --lines 20
```

#### Step 4: Verify Deployment

```bash
# Check PM2 processes
pm2 list

# Test backend locally
curl http://localhost:3101/api/health

# Test frontend locally
curl -I http://localhost:3100

# Check Nginx
sudo nginx -t
sudo systemctl status nginx

# View logs
pm2 logs --lines 50
```

#### Step 5: Test in Browser

Visit: **https://kit.dashtact.com**

---

## Environment Variables

### Backend Environment (.env.production)

**Location:** `backend/.env.production`

```env
# Database
DATABASE_URL="postgresql://kit_dashtact_user:UcbMjpOJEbocT32GqNS20SYHSTr59JiS@localhost:5432/kit_dashtact_db?schema=public"

# Application
PORT=3101
NODE_ENV=production

# JWT Authentication
JWT_SECRET=7KmN9pQrS2tUvW3xY4zA6bC8dE1fG5hJ
JWT_ACCESS_EXPIRATION=15m
JWT_REFRESH_EXPIRATION=7d
JWT_ISSUER=kit-dashtact
JWT_AUDIENCE=kit-dashtact-users

# Password Security
BCRYPT_ROUNDS=10

# Rate Limiting
RATE_LIMIT_TTL=900
RATE_LIMIT_MAX=100

# Security Features
ENABLE_AUDIT_LOGGING=true
ACCOUNT_LOCKOUT_ENABLED=false
ACCOUNT_LOCKOUT_MAX_ATTEMPTS=5
ACCOUNT_LOCKOUT_DURATION=900

# Feature Flags
FEATURE_EMAIL_VERIFICATION=false
FEATURE_TWO_FACTOR_AUTH=false
FEATURE_SOCIAL_AUTH=false
FEATURE_REMEMBER_ME=true
FEATURE_PASSWORD_RESET=true
FEATURE_SESSION_MANAGEMENT=false

# Default Settings
DEFAULT_USER_ROLE=USER

# CORS Configuration
CORS_ORIGIN=https://kit.dashtact.com

# Token Blacklist Cleanup
BLACKLIST_CLEANUP_ENABLED=true
BLACKLIST_CLEANUP_INTERVAL=86400000
```

### Frontend Environment (.env.production)

**Location:** `frontend/.env.production`

```env
# API Configuration
NEXT_PUBLIC_API_URL=https://kit.dashtact.com/api
NEXT_PUBLIC_APP_URL=https://kit.dashtact.com

# Environment
NODE_ENV=production
```

### Updating Environment Variables

**On the server:**

```bash
# Edit backend environment
nano ~/apps/kit-dashtact/backend/.env

# Edit frontend environment
nano ~/apps/kit-dashtact/frontend/.env.local

# Restart services after changes
pm2 restart kit-backend
pm2 restart kit-frontend
```

---

## Service Management

### PM2 Commands

```bash
# List all processes
pm2 list

# View logs (all processes)
pm2 logs

# View logs (specific process)
pm2 logs kit-backend
pm2 logs kit-frontend

# Restart services
pm2 restart kit-backend
pm2 restart kit-frontend
pm2 restart all

# Stop services
pm2 stop kit-backend
pm2 stop kit-frontend
pm2 stop all

# Delete processes
pm2 delete kit-backend
pm2 delete kit-frontend

# Save PM2 configuration
pm2 save

# View process details
pm2 show kit-backend

# Monitor in real-time
pm2 monit
```

### Nginx Commands

```bash
# Test configuration
sudo nginx -t

# Reload configuration
sudo systemctl reload nginx

# Restart Nginx
sudo systemctl restart nginx

# Check status
sudo systemctl status nginx

# View error logs
sudo tail -f /var/log/nginx/error.log

# View access logs
sudo tail -f /var/log/nginx/access.log

# View kit.dashtact.com logs
sudo tail -f /var/log/nginx/kit.dashtact.com.error.log
sudo tail -f /var/log/nginx/kit.dashtact.com.access.log
```

### PostgreSQL Commands

```bash
# Check PostgreSQL status
sudo systemctl status postgresql

# Restart PostgreSQL
sudo systemctl restart postgresql

# Connect to database
psql -U kit_dashtact_user -d kit_dashtact_db -h localhost

# List databases
sudo -u postgres psql -l

# List users
sudo -u postgres psql -c "\du"
```

### System Commands

```bash
# Check disk space
df -h

# Check memory usage
free -h

# Check running processes
htop

# Check system logs
sudo journalctl -xe

# Update system packages
sudo apt update && sudo apt upgrade
```

---

## Troubleshooting

### Backend Won't Start

**Check logs:**
```bash
pm2 logs kit-backend --lines 100
```

**Common issues:**
- Database connection failed → Check DATABASE_URL in .env
- Port already in use → Check if another process is using port 3101
- Missing dependencies → Run `npm install` in backend directory
- Prisma client not generated → Run `npm run prisma:generate`

**Fix:**
```bash
cd ~/apps/kit-dashtact/backend
npm install
npm run prisma:generate
npm run build
pm2 restart kit-backend
```

### Frontend Won't Start

**Check logs:**
```bash
pm2 logs kit-frontend --lines 100
```

**Common issues:**
- Build failed → Check if `.next` directory exists
- Port already in use → Check if another process is using port 3100
- Missing dependencies → Run `npm install` in frontend directory

**Fix:**
```bash
cd ~/apps/kit-dashtact/frontend
npm install
npm run build
pm2 restart kit-frontend
```

### Database Connection Errors

**Test connection:**
```bash
psql -U kit_dashtact_user -d kit_dashtact_db -h localhost -c "SELECT 1;"
```

**Check PostgreSQL is running:**
```bash
sudo systemctl status postgresql
```

**Restart PostgreSQL:**
```bash
sudo systemctl restart postgresql
```

### Nginx Errors

**Test configuration:**
```bash
sudo nginx -t
```

**Check error logs:**
```bash
sudo tail -f /var/log/nginx/error.log
```

**Common issues:**
- Configuration syntax error → Fix syntax in config file
- Port conflict → Check if ports 80/443 are available
- SSL certificate missing → Verify Cloudflare certificate exists

### Site Not Loading

**Check all services:**
```bash
# PM2 processes
pm2 list

# Nginx
sudo systemctl status nginx

# PostgreSQL
sudo systemctl status postgresql

# Test backend
curl http://localhost:3101/api/health

# Test frontend
curl -I http://localhost:3100
```

**Check Cloudflare:**
- Verify DNS records are correct
- Ensure proxy is enabled (orange cloud)
- Check SSL/TLS mode is "Full (strict)"

---

## Security Information

### Credentials Summary

**SSH Access:**
- Key: `C:\Users\fabat\Desktop\dashtact\my-ec2-key.pem`
- User: `ubuntu`
- Host: `ec2-13-53-218-109.eu-north-1.compute.amazonaws.com`

**Database:**
- Name: `kit_dashtact_db`
- User: `kit_dashtact_user`
- Password: `UcbMjpOJEbocT32GqNS20SYHSTr59JiS`

**JWT Secret:**
- Production: `7KmN9pQrS2tUvW3xY4zA6bC8dE1fG5hJ`

**SSL Certificate:**
- Location: `/etc/ssl/cloudflare/dashtact.com.pem`
- Private Key: `/etc/ssl/cloudflare/dashtact.com.key`

### Security Best Practices

1. **Never commit `.env` files to Git**
2. **Keep SSH key secure** - Never share or commit
3. **Rotate passwords regularly** - Update database password every 90 days
4. **Monitor logs** - Check for suspicious activity
5. **Keep system updated** - Run `sudo apt update && sudo apt upgrade` monthly
6. **Backup database** - Weekly backups recommended
7. **Use strong passwords** - All passwords should be 32+ characters
8. **Limit SSH access** - Only connect from trusted networks

### Firewall Rules

```bash
# View current rules
sudo ufw status verbose

# Allow new port (if needed)
sudo ufw allow 8080

# Deny port
sudo ufw deny 8080

# Delete rule
sudo ufw delete allow 8080
```

---

## Quick Reference

### Essential Commands

```bash
# SSH into server
ssh -i "C:\Users\fabat\Desktop\dashtact\my-ec2-key.pem" ubuntu@13.53.218.109

# View all services
pm2 list && sudo systemctl status nginx && sudo systemctl status postgresql

# Restart everything
pm2 restart all && sudo systemctl reload nginx

# View all logs
pm2 logs --lines 50

# Check disk space
df -h

# Check memory
free -h
```

### Important Paths

```
SSH Key:        C:\Users\fabat\Desktop\dashtact\my-ec2-key.pem
App Directory:  /home/ubuntu/apps/kit-dashtact/
Backend:        /home/ubuntu/apps/kit-dashtact/backend/
Frontend:       /home/ubuntu/apps/kit-dashtact/frontend/
Nginx Config:   /etc/nginx/sites-available/kit.dashtact.com
SSL Cert:       /etc/ssl/cloudflare/dashtact.com.pem
Logs:           /var/log/nginx/
```

### Important URLs

```
Production:     https://kit.dashtact.com
Demo Page:      https://dashtact.com
API Health:     https://kit.dashtact.com/api/health
Cloudflare:     https://dash.cloudflare.com
AWS Console:    https://console.aws.amazon.com
```

---

## Maintenance Schedule

### Daily
- Monitor PM2 logs for errors
- Check application is accessible

### Weekly
- Review Nginx access logs
- Check disk space usage
- Backup database

### Monthly
- Update system packages
- Review security logs
- Rotate log files
- Test backup restoration

### Quarterly
- Rotate database password
- Review and update SSL certificates (if not using Cloudflare)
- Security audit
- Performance review

---

**Document Version:** 1.0  
**Last Updated:** 2025-11-09  
**Maintained By:** Dashtact Development Team

**⚠️ KEEP THIS DOCUMENT SECURE - Contains production credentials**

this is the configuratino server
# HTTP - Redirect to HTTPS
server {
    listen 80;
    listen [::]:80;
    server_name kit.dashtact.com;
    return 301 https://$server_name$request_uri;
}

# HTTPS - Full-stack Dashboard App
server {
    listen 443 ssl http2;
    listen [::]:443 ssl http2;
    server_name kit.dashtact.com;

    # Cloudflare Origin Certificate (same as main domain)
    ssl_certificate /etc/ssl/cloudflare/dashtact.com.pem;
    ssl_certificate_key /etc/ssl/cloudflare/dashtact.com.key;

    # SSL Configuration
    ssl_protocols TLSv1.2 TLSv1.3;
    ssl_ciphers HIGH:!aNULL:!MD5;
    ssl_prefer_server_ciphers on;

    # Cloudflare Real IP Configuration
    set_real_ip_from 173.245.48.0/20;
    set_real_ip_from 103.21.244.0/22;
    set_real_ip_from 103.22.200.0/22;
    set_real_ip_from 103.31.4.0/22;
    set_real_ip_from 141.101.64.0/18;
    set_real_ip_from 108.162.192.0/18;
    set_real_ip_from 190.93.240.0/20;
    set_real_ip_from 188.114.96.0/20;
    set_real_ip_from 197.234.240.0/22;
    set_real_ip_from 198.41.128.0/17;
    set_real_ip_from 162.158.0.0/15;
    set_real_ip_from 104.16.0.0/13;
    set_real_ip_from 104.24.0.0/14;
    set_real_ip_from 172.64.0.0/13;
    set_real_ip_from 131.0.72.0/22;
    set_real_ip_from 2400:cb00::/32;
    set_real_ip_from 2606:4700::/32;
    set_real_ip_from 2803:f800::/32;
    set_real_ip_from 2405:b500::/32;
    set_real_ip_from 2405:8100::/32;
    set_real_ip_from 2a06:98c0::/29;
    set_real_ip_from 2c0f:f248::/32;
    real_ip_header CF-Connecting-IP;

    # Frontend (Next.js) - Port 3100
    location / {
        proxy_pass http://localhost:3100;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_set_header CF-Connecting-IP $http_cf_connecting_ip;
        proxy_cache_bypass $http_upgrade;
        
        # Timeouts for Next.js
        proxy_connect_timeout 60s;
        proxy_send_timeout 60s;
        proxy_read_timeout 60s;
    }

    # Backend API (NestJS) - Port 3101
    location /api {
        proxy_pass http://localhost:3101;
        proxy_http_version 1.1;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_set_header CF-Connecting-IP $http_cf_connecting_ip;
        
        # Timeouts for API
        proxy_connect_timeout 60s;
        proxy_send_timeout 60s;
        proxy_read_timeout 60s;
    }

    # Security headers
    add_header X-Frame-Options "SAMEORIGIN" always;
    add_header X-Content-Type-Options "nosniff" always;
    add_header X-XSS-Protection "1; mode=block" always;

    # Logging
    access_log /var/log/nginx/kit.dashtact.com.access.log;
    error_log /var/log/nginx/kit.dashtact.com.error.log;
}
