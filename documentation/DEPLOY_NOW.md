# Deploy Dashtact - Step by Step Guide

## Current Status

✅ Server configured  
✅ Nginx configured for kit.dashtact.com  
✅ Cloudflare DNS configured  
✅ SSL certificate configured  

**Next:** Deploy the application!

---

## Step 1: Configure PostgreSQL Database

**On your server, run:**

```bash
# Generate secure password
DB_PASS=$(openssl rand -base64 32 | tr -d "=+/" | cut -c1-32)
echo "Database Password: $DB_PASS"

# Create database and user
sudo -u postgres psql << 'EOF'
CREATE DATABASE kit_dashtact_db;
CREATE USER kit_dashtact_user WITH ENCRYPTED PASSWORD 'PASTE_PASSWORD_HERE';
GRANT ALL PRIVILEGES ON DATABASE kit_dashtact_db TO kit_dashtact_user;
ALTER DATABASE kit_dashtact_db OWNER TO kit_dashtact_user;
\c kit_dashtact_db
GRANT ALL ON SCHEMA public TO kit_dashtact_user;
GRANT ALL PRIVILEGES ON ALL TABLES IN SCHEMA public TO kit_dashtact_user;
GRANT ALL PRIVILEGES ON ALL SEQUENCES IN SCHEMA public TO kit_dashtact_user;
ALTER DEFAULT PRIVILEGES IN SCHEMA public GRANT ALL ON TABLES TO kit_dashtact_user;
ALTER DEFAULT PRIVILEGES IN SCHEMA public GRANT ALL ON SEQUENCES TO kit_dashtact_user;
\q
EOF
```

**Replace `PASTE_PASSWORD_HERE` with the generated password!**

**Verify:**
```bash
sudo -u postgres psql -l | grep kit_dashtact
```

---

## Step 2: Create Production Environment Files

### Backend .env

**On your LOCAL machine**, create `backend/.env.production`:

```env
DATABASE_URL="postgresql://kit_dashtact_user:YOUR_DB_PASSWORD@localhost:5432/kit_dashtact_db?schema=public"
PORT=3101
NODE_ENV=production

# Generate this: openssl rand -base64 32
JWT_SECRET=GENERATE_SECURE_RANDOM_STRING_HERE
JWT_ACCESS_EXPIRATION=15m
JWT_REFRESH_EXPIRATION=7d
JWT_ISSUER=kit-dashtact
JWT_AUDIENCE=kit-dashtact-users

BCRYPT_ROUNDS=10
RATE_LIMIT_TTL=900
RATE_LIMIT_MAX=100

ENABLE_AUDIT_LOGGING=true
ACCOUNT_LOCKOUT_ENABLED=false
FEATURE_EMAIL_VERIFICATION=false
FEATURE_TWO_FACTOR_AUTH=false
DEFAULT_USER_ROLE=USER

CORS_ORIGIN=https://kit.dashtact.com
BLACKLIST_CLEANUP_ENABLED=true
BLACKLIST_CLEANUP_INTERVAL=86400000
```

**Replace:**
- `YOUR_DB_PASSWORD` with database password from Step 1
- `GENERATE_SECURE_RANDOM_STRING_HERE` with output of: `openssl rand -base64 32`

### Frontend .env

**On your LOCAL machine**, create `frontend/.env.production`:

```env
NEXT_PUBLIC_API_URL=https://kit.dashtact.com/api
NEXT_PUBLIC_APP_URL=https://kit.dashtact.com
NODE_ENV=production
```

---

## Step 3: Copy Files to Server

**From your LOCAL machine** (PowerShell or Git Bash):

```bash
# Navigate to your project
cd C:\Users\fabat\Desktop\dashtact

# Create remote directory
ssh -i "my-ec2-key.pem" ubuntu@ec2-13-53-218-109.eu-north-1.compute.amazonaws.com "mkdir -p ~/apps/kit-dashtact"

# Copy backend
scp -i "my-ec2-key.pem" -r backend ubuntu@ec2-13-53-218-109.eu-north-1.compute.amazonaws.com:~/apps/kit-dashtact/

# Copy frontend
scp -i "my-ec2-key.pem" -r frontend ubuntu@ec2-13-53-218-109.eu-north-1.compute.amazonaws.com:~/apps/kit-dashtact/
```

**This will take a few minutes...**

---

## Step 4: Deploy Backend

**SSH into your server:**

```bash
ssh -i "my-ec2-key.pem" ubuntu@ec2-13-53-218-109.eu-north-1.compute.amazonaws.com
```

**Then run:**

```bash
cd ~/apps/kit-dashtact/backend

# Copy production env
cp .env.production .env

# Install dependencies
npm install

# Generate Prisma client
npx prisma generate

# Run database migrations
npx prisma migrate deploy

# Seed database with initial data
npx prisma db seed

# Build application
npm run build

# Start with PM2
pm2 delete kit-backend 2>/dev/null || true
pm2 start dist/main.js --name kit-backend
pm2 save

# Check if running
pm2 list
pm2 logs kit-backend --lines 20
```

**Expected output:** Backend should be running on port 3101

**Test locally:**
```bash
curl http://localhost:3101/api/health
```

Should return JSON with status.

---

## Step 5: Deploy Frontend

**Still on the server:**

```bash
cd ~/apps/kit-dashtact/frontend

# Copy production env
cp .env.production .env.local

# Install dependencies
npm install

# Build application
npm run build

# Start with PM2
pm2 delete kit-frontend 2>/dev/null || true
pm2 start npm --name kit-frontend -- start
pm2 save

# Check if running
pm2 list
pm2 logs kit-frontend --lines 20
```

**Expected output:** Frontend should be running on port 3100

**Test locally:**
```bash
curl -I http://localhost:3100
```

Should return HTTP 200.

---

## Step 6: Verify Everything

### Check PM2 Processes

```bash
pm2 list
```

Should show:
```
┌─────┬──────────────┬─────────┬─────────┐
│ id  │ name         │ status  │ port    │
├─────┼──────────────┼─────────┼─────────┤
│ 0   │ kit-backend  │ online  │ 3101    │
│ 1   │ kit-frontend │ online  │ 3100    │
└─────┴──────────────┴─────────┴─────────┘
```

### Check Nginx

```bash
sudo nginx -t
sudo systemctl status nginx
```

### Check Logs

```bash
# Backend logs
pm2 logs kit-backend --lines 50

# Frontend logs
pm2 logs kit-frontend --lines 50

# Nginx logs
sudo tail -f /var/log/nginx/kit.dashtact.com.error.log
```

---

## Step 7: Test in Browser

**Open your browser and visit:**

### https://kit.dashtact.com

You should see your dashboard application!

**Test these:**
- ✅ Homepage loads
- ✅ Can navigate to /login
- ✅ Can navigate to /signup
- ✅ API calls work (check browser console)

---

## Troubleshooting

### Backend Not Starting

```bash
# Check logs
pm2 logs kit-backend

# Common issues:
# 1. Database connection failed
psql -U kit_dashtact_user -d kit_dashtact_db -h localhost

# 2. Port already in use
sudo lsof -i :3101

# 3. Build failed
cd ~/apps/kit-dashtact/backend
npm run build
```

### Frontend Not Starting

```bash
# Check logs
pm2 logs kit-frontend

# Common issues:
# 1. Build failed
cd ~/apps/kit-dashtact/frontend
npm run build

# 2. Port already in use
sudo lsof -i :3100

# 3. Missing .env.local
cat .env.local
```

### Database Connection Errors

```bash
# Test connection
psql -U kit_dashtact_user -d kit_dashtact_db -h localhost

# Check if database exists
sudo -u postgres psql -l | grep kit_dashtact

# Check if user exists
sudo -u postgres psql -c "\du" | grep kit_dashtact

# Reset password if needed
sudo -u postgres psql -c "ALTER USER kit_dashtact_user WITH PASSWORD 'new_password';"
```

### Nginx Errors

```bash
# Check configuration
sudo nginx -t

# Check error logs
sudo tail -f /var/log/nginx/error.log

# Restart Nginx
sudo systemctl restart nginx
```

### CORS Errors

Update backend `.env`:
```
CORS_ORIGIN=https://kit.dashtact.com
```

Then restart:
```bash
pm2 restart kit-backend
```

---

## Post-Deployment

### Monitor Services

```bash
# View all processes
pm2 list

# View logs in real-time
pm2 logs

# Restart a service
pm2 restart kit-backend
pm2 restart kit-frontend

# Stop a service
pm2 stop kit-backend
```

### Update Application

```bash
# On local machine, make changes, then:
scp -i "my-ec2-key.pem" -r backend ubuntu@ec2-13-53-218-109.eu-north-1.compute.amazonaws.com:~/apps/kit-dashtact/

# On server:
cd ~/apps/kit-dashtact/backend
npm install
npm run build
pm2 restart kit-backend
```

### Database Backup

```bash
# Backup
pg_dump -U kit_dashtact_user kit_dashtact_db > backup_$(date +%Y%m%d).sql

# Restore
psql -U kit_dashtact_user kit_dashtact_db < backup_20251109.sql
```

---

## Success Checklist

- ✅ PostgreSQL database created
- ✅ Backend deployed and running on port 3101
- ✅ Frontend deployed and running on port 3100
- ✅ PM2 processes running
- ✅ Nginx proxying correctly
- ✅ https://kit.dashtact.com loads
- ✅ Can register/login
- ✅ API calls work
- ✅ Database connected

---

## Quick Commands Reference

```bash
# SSH to server
ssh -i "my-ec2-key.pem" ubuntu@ec2-13-53-218-109.eu-north-1.compute.amazonaws.com

# Check processes
pm2 list

# View logs
pm2 logs

# Restart services
pm2 restart all

# Check Nginx
sudo nginx -t
sudo systemctl status nginx

# Check database
psql -U kit_dashtact_user -d kit_dashtact_db
```

---

**Ready to deploy? Start with Step 1!** 🚀
