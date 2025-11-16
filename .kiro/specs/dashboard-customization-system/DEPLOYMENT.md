# Dashboard Customization System - Deployment Guide

## Overview

This guide provides step-by-step instructions for deploying the Dashboard Customization System to production.

## Prerequisites

### System Requirements

**Backend**:
- Node.js 18+ or 20+
- PostgreSQL 14+
- 2GB RAM minimum
- 10GB disk space

**Frontend**:
- Node.js 18+ or 20+
- 2GB RAM minimum
- 5GB disk space

### Required Tools

- Git
- npm or yarn
- PostgreSQL client
- PM2 (for process management)
- Nginx (for reverse proxy)

## Pre-Deployment Checklist

- [ ] Database backup created
- [ ] Environment variables configured
- [ ] SSL certificates obtained
- [ ] Domain DNS configured
- [ ] Firewall rules configured
- [ ] Monitoring tools set up
- [ ] Error tracking configured

## Step 1: Database Setup

### 1.1 Create Production Database

```bash
# Connect to PostgreSQL
psql -U postgres

# Create database
CREATE DATABASE dashboard_prod;

# Create user
CREATE USER dashboard_user WITH ENCRYPTED PASSWORD 'your-secure-password';

# Grant privileges
GRANT ALL PRIVILEGES ON DATABASE dashboard_prod TO dashboard_user;

# Exit
\q
```

### 1.2 Configure Database Connection

```bash
# backend/.env.production
DATABASE_URL="postgresql://dashboard_user:your-secure-password@localhost:5432/dashboard_prod?schema=public"
```

### 1.3 Run Migrations

```bash
cd backend
npm run prisma:migrate deploy
```

### 1.4 Seed Database

```bash
cd backend
npm run prisma:seed
```

This will create:
- Default permissions and roles
- Widget definitions (40+ widgets)
- Default dashboard layouts
- Demo layouts for showcasing

## Step 2: Backend Deployment

### 2.1 Install Dependencies

```bash
cd backend
npm ci --production
```

### 2.2 Build Application

```bash
npm run build
```

### 2.3 Configure Environment

```bash
# backend/.env.production
NODE_ENV=production
PORT=3001
DATABASE_URL="postgresql://dashboard_user:password@localhost:5432/dashboard_prod"
JWT_SECRET="your-super-secret-jwt-key-change-this"
JWT_REFRESH_SECRET="your-super-secret-refresh-key-change-this"
CORS_ORIGIN="https://yourdomain.com"
```

### 2.4 Start with PM2

```bash
# Install PM2 globally
npm install -g pm2

# Start application
pm2 start dist/main.js --name dashboard-backend

# Save PM2 configuration
pm2 save

# Setup PM2 startup script
pm2 startup
```

### 2.5 Verify Backend

```bash
# Check status
pm2 status

# View logs
pm2 logs dashboard-backend

# Test endpoint
curl http://localhost:3001/api/health
```

## Step 3: Frontend Deployment

### 3.1 Install Dependencies

```bash
cd frontend
npm ci --production
```

### 3.2 Configure Environment

```bash
# frontend/.env.production
NEXT_PUBLIC_API_URL=https://api.yourdomain.com
NEXT_PUBLIC_APP_URL=https://yourdomain.com
NODE_ENV=production
```

### 3.3 Build Application

```bash
npm run build
```

### 3.4 Start with PM2

```bash
# Start Next.js server
pm2 start npm --name dashboard-frontend -- start

# Or use standalone mode
pm2 start "node .next/standalone/server.js" --name dashboard-frontend

# Save configuration
pm2 save
```

### 3.5 Verify Frontend

```bash
# Check status
pm2 status

# View logs
pm2 logs dashboard-frontend

# Test locally
curl http://localhost:3000
```

## Step 4: Nginx Configuration

### 4.1 Install Nginx

```bash
sudo apt update
sudo apt install nginx
```

### 4.2 Configure Reverse Proxy

```nginx
# /etc/nginx/sites-available/dashboard

# Backend API
server {
    listen 80;
    server_name api.yourdomain.com;

    location / {
        proxy_pass http://localhost:3001;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_cache_bypass $http_upgrade;
    }
}

# Frontend
server {
    listen 80;
    server_name yourdomain.com www.yourdomain.com;

    location / {
        proxy_pass http://localhost:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
    }
}
```

### 4.3 Enable Site

```bash
# Create symbolic link
sudo ln -s /etc/nginx/sites-available/dashboard /etc/nginx/sites-enabled/

# Test configuration
sudo nginx -t

# Reload Nginx
sudo systemctl reload nginx
```

## Step 5: SSL Configuration

### 5.1 Install Certbot

```bash
sudo apt install certbot python3-certbot-nginx
```

### 5.2 Obtain Certificates

```bash
# For API
sudo certbot --nginx -d api.yourdomain.com

# For Frontend
sudo certbot --nginx -d yourdomain.com -d www.yourdomain.com
```

### 5.3 Auto-Renewal

```bash
# Test renewal
sudo certbot renew --dry-run

# Certbot automatically sets up cron job
```

## Step 6: Firewall Configuration

```bash
# Allow SSH
sudo ufw allow 22/tcp

# Allow HTTP and HTTPS
sudo ufw allow 80/tcp
sudo ufw allow 443/tcp

# Enable firewall
sudo ufw enable

# Check status
sudo ufw status
```

## Step 7: Monitoring Setup

### 7.1 PM2 Monitoring

```bash
# Install PM2 monitoring
pm2 install pm2-logrotate

# Configure log rotation
pm2 set pm2-logrotate:max_size 10M
pm2 set pm2-logrotate:retain 7
```

### 7.2 Application Monitoring

Consider setting up:
- **Sentry** for error tracking
- **New Relic** or **DataDog** for APM
- **Prometheus** + **Grafana** for metrics
- **ELK Stack** for log aggregation

## Step 8: Database Backup

### 8.1 Automated Backups

```bash
# Create backup script
cat > /usr/local/bin/backup-dashboard-db.sh << 'EOF'
#!/bin/bash
BACKUP_DIR="/var/backups/dashboard"
DATE=$(date +%Y%m%d_%H%M%S)
mkdir -p $BACKUP_DIR
pg_dump -U dashboard_user dashboard_prod | gzip > $BACKUP_DIR/dashboard_$DATE.sql.gz
# Keep only last 7 days
find $BACKUP_DIR -name "dashboard_*.sql.gz" -mtime +7 -delete
EOF

# Make executable
chmod +x /usr/local/bin/backup-dashboard-db.sh

# Add to crontab (daily at 2 AM)
(crontab -l 2>/dev/null; echo "0 2 * * * /usr/local/bin/backup-dashboard-db.sh") | crontab -
```

### 8.2 Test Backup

```bash
/usr/local/bin/backup-dashboard-db.sh
ls -lh /var/backups/dashboard/
```

## Step 9: Performance Optimization

### 9.1 Enable Compression

```nginx
# Add to nginx configuration
gzip on;
gzip_vary on;
gzip_min_length 1024;
gzip_types text/plain text/css text/xml text/javascript application/x-javascript application/xml+rss application/json;
```

### 9.2 Enable Caching

```nginx
# Add to nginx configuration
location ~* \.(jpg|jpeg|png|gif|ico|css|js|svg|woff|woff2|ttf|eot)$ {
    expires 1y;
    add_header Cache-Control "public, immutable";
}
```

### 9.3 Database Connection Pooling

Already configured in Prisma. Verify settings:

```typescript
// backend/prisma/schema.prisma
datasource db {
  provider = "postgresql"
  url      = env("DATABASE_URL")
  // Connection pool settings
  // ?connection_limit=10&pool_timeout=20
}
```

## Step 10: Security Hardening

### 10.1 Environment Variables

```bash
# Ensure .env files are not in git
echo ".env*" >> .gitignore

# Set proper permissions
chmod 600 backend/.env.production
chmod 600 frontend/.env.production
```

### 10.2 Rate Limiting

Already configured in NestJS. Verify settings:

```typescript
// backend/src/main.ts
app.use(
  rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 100, // limit each IP to 100 requests per windowMs
  }),
);
```

### 10.3 CORS Configuration

```typescript
// backend/src/main.ts
app.enableCors({
  origin: process.env.CORS_ORIGIN || 'https://yourdomain.com',
  credentials: true,
});
```

## Step 11: Health Checks

### 11.1 Backend Health Check

```bash
# Test health endpoint
curl https://api.yourdomain.com/api/health

# Expected response:
# {"status":"ok","timestamp":"2024-11-15T..."}
```

### 11.2 Frontend Health Check

```bash
# Test homepage
curl https://yourdomain.com

# Should return HTML
```

### 11.3 Database Health Check

```bash
# Test database connection
cd backend
npm run prisma:studio
# Should open Prisma Studio
```

## Step 12: Post-Deployment Verification

### 12.1 Functional Tests

- [ ] User can log in
- [ ] Dashboard loads correctly
- [ ] Widgets display properly
- [ ] Layout editor works
- [ ] Widget library opens
- [ ] Drag and drop functions
- [ ] Save layout persists
- [ ] Permissions are enforced
- [ ] API endpoints respond
- [ ] Error handling works

### 12.2 Performance Tests

```bash
# Run Lighthouse audit
npx lighthouse https://yourdomain.com --view

# Target scores:
# Performance: 90+
# Accessibility: 90+
# Best Practices: 90+
# SEO: 90+
```

### 12.3 Security Tests

- [ ] HTTPS enabled
- [ ] SSL certificate valid
- [ ] CORS configured correctly
- [ ] Rate limiting active
- [ ] JWT tokens secure
- [ ] Environment variables protected
- [ ] Database credentials secure

## Step 13: Rollback Plan

### 13.1 Database Rollback

```bash
# Restore from backup
gunzip < /var/backups/dashboard/dashboard_YYYYMMDD_HHMMSS.sql.gz | psql -U dashboard_user dashboard_prod
```

### 13.2 Application Rollback

```bash
# Stop current version
pm2 stop dashboard-backend dashboard-frontend

# Checkout previous version
git checkout <previous-commit>

# Rebuild and restart
cd backend && npm run build
cd frontend && npm run build

pm2 restart dashboard-backend dashboard-frontend
```

## Step 14: Monitoring and Maintenance

### 14.1 Daily Checks

- Check PM2 status: `pm2 status`
- Check logs: `pm2 logs`
- Check disk space: `df -h`
- Check database size: `psql -U dashboard_user -d dashboard_prod -c "SELECT pg_size_pretty(pg_database_size('dashboard_prod'));"`

### 14.2 Weekly Checks

- Review error logs
- Check backup integrity
- Review performance metrics
- Update dependencies (security patches)

### 14.3 Monthly Checks

- Database optimization: `VACUUM ANALYZE;`
- Review and archive old logs
- Update SSL certificates (if needed)
- Review and update documentation

## Troubleshooting

### Backend Won't Start

```bash
# Check logs
pm2 logs dashboard-backend

# Common issues:
# - Database connection failed: Check DATABASE_URL
# - Port already in use: Check if another process is using port 3001
# - Missing dependencies: Run npm ci
```

### Frontend Won't Start

```bash
# Check logs
pm2 logs dashboard-frontend

# Common issues:
# - API connection failed: Check NEXT_PUBLIC_API_URL
# - Build failed: Run npm run build and check for errors
# - Port already in use: Check if another process is using port 3000
```

### Database Connection Issues

```bash
# Test connection
psql -U dashboard_user -d dashboard_prod

# Check PostgreSQL status
sudo systemctl status postgresql

# Check connection limits
psql -U postgres -c "SHOW max_connections;"
```

### SSL Certificate Issues

```bash
# Check certificate expiry
sudo certbot certificates

# Renew manually
sudo certbot renew

# Check Nginx configuration
sudo nginx -t
```

## Support

For issues or questions:
1. Check logs: `pm2 logs`
2. Review documentation
3. Check GitHub issues
4. Contact support team

## Additional Resources

- **API Documentation**: https://yourdomain.com/api/docs
- **User Guide**: `.kiro/steering/dashboard-user-guide.md`
- **Widget Development**: `.kiro/steering/widget-development-guide.md`
- **System Documentation**: `.kiro/steering/dashboard-customization-system.md`

---

**Deployment Date**: 2024-11-15
**Version**: 1.0.0
**Last Updated**: 2024-11-15
