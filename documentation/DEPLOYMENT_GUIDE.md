# Dashtact Deployment Guide

## Overview

This guide covers deploying your full-stack dashboard application to AWS EC2 with Cloudflare.

### Architecture

```
dashtact.com (Main Domain)
├─→ dashtact.com              # Demo page (static HTML)
└─→ kit.dashtact.com          # Full-stack dashboard app
    ├─→ Frontend (Next.js)    # Port 3100
    ├─→ Backend (NestJS)      # Port 3101
    └─→ PostgreSQL            # kit_dashtact_db
```

---

## Prerequisites

✅ Server configured with:
- Node.js 20 LTS
- PostgreSQL
- Nginx
- PM2
- Cloudflare with SSL

✅ SSH Key: `C:\Users\fabat\Desktop\dashtact\my-ec2-key.pem`

✅ Server IP: `13.53.218.109`

---

## Deployment Methods

### Method 1: Automated Deployment (Recommended)

Use the Kiro Agent Hook for one-click deployment:

1. **Open Kiro Agent Hooks Panel**
   - View → Agent Hooks
   - Or Command Palette → "Open Kiro Hook UI"

2. **Find "Deploy Dashtact to AWS" Hook**
   - Click the hook to view details
   - Click "🚀 Deploy to Production" button

3. **Agent Will:**
   - Update CORS settings
   - Configure environment variables
   - Setup PostgreSQL database
   - Deploy backend and frontend
   - Configure Nginx
   - Start PM2 processes
   - Verify deployment

### Method 2: Manual Deployment Script

Run the deployment script from your local machine:

```bash
# Make script executable (Git Bash or WSL)
chmod +x deployment/deploy.sh

# Run deployment
./deployment/deploy.sh
```

### Method 3: Manual Step-by-Step

Follow the manual deployment steps below.

---

## Manual Deployment Steps

### Step 1: Add Cloudflare DNS Record

1. Log into Cloudflare dashboard
2. Go to DNS settings for dashtact.com
3. Verify wildcard record exists:
   ```
   Type: A
   Name: *
   Content: 13.53.218.109
   Proxy: ON (orange cloud)
   ```
4. This covers kit.dashtact.com automatically

### Step 2: Connect to Server

```bash
ssh -i "C:\Users\fabat\Desktop\dashtact\my-ec2-key.pem" ubuntu@ec2-13-53-218-109.eu-north-1.compute.amazonaws.com
```

### Step 3: Create Directory Structure

```bash
mkdir -p ~/apps/kit-dashtact/{backend,frontend}
```

### Step 4: Setup PostgreSQL Database

```bash
# Generate secure password
DB_PASS=$(openssl rand -base64 32 | tr -d "=+/" | cut -c1-32)
echo "Database Password: $DB_PASS"  # SAVE THIS!

# Create database and user
sudo -u postgres psql << EOF
CREATE DATABASE kit_dashtact_db;
CREATE USER kit_dashtact_user WITH PASSWORD '$DB_PASS';
GRANT ALL PRIVILEGES ON DATABASE kit_dashtact_db TO kit_dashtact_user;
ALTER DATABASE kit_dashtact_db OWNER TO kit_dashtact_user;
\q
EOF
```

### Step 5: Deploy Backend

**On your local machine:**

```bash
# Copy backend files
scp -i "C:\Users\fabat\Desktop\dashtact\my-ec2-key.pem" -r backend/* ubuntu@ec2-13-53-218-109.eu-north-1.compute.amazonaws.com:~/apps/kit-dashtact/backend/
```

**On the server:**

```bash
cd ~/apps/kit-dashtact/backend

# Create production .env
cat > .env << 'EOF'
DATABASE_URL="postgresql://kit_dashtact_user:YOUR_PASSWORD_HERE@localhost:5432/kit_dashtact_db?schema=public"
PORT=3101
NODE_ENV=production
JWT_SECRET=$(openssl rand -base64 32)
JWT_ACCESS_EXPIRATION=15m
JWT_REFRESH_EXPIRATION=7d
JWT_ISSUER=kit-dashtact
JWT_AUDIENCE=kit-dashtact-users
CORS_ORIGIN=https://kit.dashtact.com
BCRYPT_ROUNDS=10
RATE_LIMIT_TTL=900
RATE_LIMIT_MAX=100
ENABLE_AUDIT_LOGGING=true
DEFAULT_USER_ROLE=USER
BLACKLIST_CLEANUP_ENABLED=true
BLACKLIST_CLEANUP_INTERVAL=86400000
EOF

# Replace YOUR_PASSWORD_HERE with actual password
nano .env

# Install and build
npm install
npm run prisma:generate
npm run prisma:migrate
npm run prisma:seed
npm run build

# Start with PM2
pm2 start dist/main.js --name kit-backend --env production
pm2 save
```

### Step 6: Deploy Frontend

**On your local machine:**

```bash
# Copy frontend files
scp -i "C:\Users\fabat\Desktop\dashtact\my-ec2-key.pem" -r frontend/* ubuntu@ec2-13-53-218-109.eu-north-1.compute.amazonaws.com:~/apps/kit-dashtact/frontend/
```

**On the server:**

```bash
cd ~/apps/kit-dashtact/frontend

# Create production .env.local
cat > .env.local << 'EOF'
NEXT_PUBLIC_API_URL=https://kit.dashtact.com/api
NEXT_PUBLIC_APP_URL=https://kit.dashtact.com
NODE_ENV=production
EOF

# Install and build
npm install
npm run build

# Start with PM2
pm2 start npm --name kit-frontend -- start
pm2 save
```

### Step 7: Configure Nginx

```bash
sudo nano /etc/nginx/sites-available/kit.dashtact.com
```

Paste this configuration:

```nginx
# HTTP - Redirect to HTTPS
server {
    listen 80;
    listen [::]:80;
    server_name kit.dashtact.com;
    return 301 https://$server_name$request_uri;
}

# HTTPS - Full-stack app
server {
    listen 443 ssl http2;
    listen [::]:443 ssl http2;
    server_name kit.dashtact.com;

    # Cloudflare Origin Certificate
    ssl_certificate /etc/ssl/cloudflare/dashtact.com.pem;
    ssl_certificate_key /etc/ssl/cloudflare/dashtact.com.key;

    # SSL Configuration
    ssl_protocols TLSv1.2 TLSv1.3;
    ssl_ciphers HIGH:!aNULL:!MD5;
    ssl_prefer_server_ciphers on;

    # Cloudflare Real IP
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
    real_ip_header CF-Connecting-IP;

    # Frontend (Next.js)
    location / {
        proxy_pass http://localhost:3100;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_cache_bypass $http_upgrade;
    }

    # Backend API (NestJS)
    location /api {
        proxy_pass http://localhost:3101;
        proxy_http_version 1.1;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }
}
```

Enable and reload:

```bash
sudo ln -s /etc/nginx/sites-available/kit.dashtact.com /etc/nginx/sites-enabled/
sudo nginx -t
sudo systemctl reload nginx
```

### Step 8: Verify Deployment

```bash
# Check PM2 processes
pm2 list

# Check logs
pm2 logs kit-backend --lines 50
pm2 logs kit-frontend --lines 50

# Test backend
curl http://localhost:3101/api/health

# Test frontend
curl -I http://localhost:3100

# Check Nginx
sudo systemctl status nginx
```

### Step 9: Test in Browser

Visit: **https://kit.dashtact.com**

You should see your dashboard application!

---

## Post-Deployment

### Monitor Services

```bash
# View all PM2 processes
pm2 list

# View logs
pm2 logs

# Restart services
pm2 restart kit-backend
pm2 restart kit-frontend

# Stop services
pm2 stop kit-backend kit-frontend
```

### Database Management

```bash
# Connect to database
psql -U kit_dashtact_user -d kit_dashtact_db

# Backup database
pg_dump -U kit_dashtact_user kit_dashtact_db > backup.sql

# Restore database
psql -U kit_dashtact_user kit_dashtact_db < backup.sql
```

### Update Application

```bash
# Pull latest code
cd ~/apps/kit-dashtact/backend
git pull  # if using git

# Rebuild and restart
npm install
npm run build
pm2 restart kit-backend

# Same for frontend
cd ~/apps/kit-dashtact/frontend
npm install
npm run build
pm2 restart kit-frontend
```

---

## Adding More Domains/Subdomains

### For Another Subdomain (e.g., client1.dashtact.com)

1. **Create directory:**
   ```bash
   mkdir -p ~/apps/client1-dashtact/{backend,frontend}
   ```

2. **Use ports 3200 (frontend) and 3201 (backend)**

3. **Create new database:**
   ```bash
   sudo -u postgres psql -c "CREATE DATABASE client1_dashtact_db;"
   ```

4. **Copy and configure Nginx:**
   ```bash
   sudo cp /etc/nginx/sites-available/kit.dashtact.com /etc/nginx/sites-available/client1.dashtact.com
   # Edit to use ports 3200/3201
   sudo nano /etc/nginx/sites-available/client1.dashtact.com
   ```

5. **Deploy same way as kit.dashtact.com**

### For Another Domain (e.g., anotherdomain.com)

1. **Add domain to Cloudflare**
2. **Point DNS to 13.53.218.109**
3. **Get Cloudflare Origin Certificate**
4. **Use ports 4000 (frontend) and 4001 (backend)**
5. **Create separate Nginx config**
6. **Deploy same process**

---

## Troubleshooting

### Backend Not Starting

```bash
# Check logs
pm2 logs kit-backend

# Check database connection
psql -U kit_dashtact_user -d kit_dashtact_db -c "SELECT 1;"

# Check .env file
cat ~/apps/kit-dashtact/backend/.env
```

### Frontend Not Loading

```bash
# Check logs
pm2 logs kit-frontend

# Check if built
ls -la ~/apps/kit-dashtact/frontend/.next

# Rebuild
cd ~/apps/kit-dashtact/frontend
npm run build
pm2 restart kit-frontend
```

### Nginx Errors

```bash
# Check configuration
sudo nginx -t

# Check error logs
sudo tail -f /var/log/nginx/error.log

# Check access logs
sudo tail -f /var/log/nginx/access.log
```

### CORS Errors

Update backend CORS in `.env`:
```
CORS_ORIGIN=https://kit.dashtact.com,https://anotherdomain.com
```

Then restart:
```bash
pm2 restart kit-backend
```

---

## Security Checklist

- ✅ Change JWT_SECRET to secure random string
- ✅ Use strong database password
- ✅ Enable firewall (UFW)
- ✅ Keep system updated
- ✅ Regular database backups
- ✅ Monitor PM2 logs
- ✅ Use HTTPS only (Cloudflare)
- ✅ Limit CORS to specific domains

---

## Quick Reference

**SSH Connection:**
```bash
ssh -i "C:\Users\fabat\Desktop\dashtact\my-ec2-key.pem" ubuntu@ec2-13-53-218-109.eu-north-1.compute.amazonaws.com
```

**PM2 Commands:**
```bash
pm2 list                    # List all processes
pm2 logs                    # View all logs
pm2 restart all             # Restart all
pm2 stop all                # Stop all
pm2 save                    # Save configuration
```

**Nginx Commands:**
```bash
sudo nginx -t               # Test configuration
sudo systemctl reload nginx # Reload
sudo systemctl restart nginx # Restart
```

**Database Commands:**
```bash
sudo -u postgres psql       # Connect as postgres
psql -U kit_dashtact_user -d kit_dashtact_db  # Connect as app user
```

---

## Support

For issues or questions, check:
- PM2 logs: `pm2 logs`
- Nginx logs: `/var/log/nginx/error.log`
- Application logs in the deployment directory

---

**Deployment Complete!** 🚀

Visit your application at: **https://kit.dashtact.com**
