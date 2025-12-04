# Server Configuration Reference

Complete server setup and configuration details for kit.dashtact.com deployment.

## Server Information

### Infrastructure
- **Provider**: AWS EC2
- **Region**: eu-north-1 (Stockholm)
- **Instance IP**: 13.53.218.109
- **Domain**: kit.dashtact.com
- **DNS/SSL**: Cloudflare (Proxy enabled)
- **OS**: Ubuntu Server
- **User**: ubuntu

### SSH Access
```bash
ssh -i "C:\Users\fabat\Desktop\dashtact\my-ec2-key.pem" ubuntu@13.53.218.109
```

## Running Services

### PM2 Processes

| ID | Name | Port | Status | Memory | Restarts |
|----|------|------|--------|--------|----------|
| 1 | kit-backend | 3101 | online | ~107MB | 0 |
| 2 | kit-frontend | 3000 | online | ~60MB | 8 |

**Backend Process**:
- Name: `kit-backend`
- Command: `node dist/main.js`
- Working Directory: `/home/ubuntu/apps/kit-dashtact/backend`
- Version: 0.0.1
- Framework: NestJS

**Frontend Process**:
- Name: `kit-frontend`
- Command: `npm start`
- Working Directory: `/home/ubuntu/apps/kit-dashtact/frontend`
- Framework: Next.js 16.0.1

### Nginx Configuration

**Config File**: `/etc/nginx/sites-available/kit.dashtact.com`

```nginx
server {
    listen 443 ssl http2;
    server_name kit.dashtact.com;
    
    # Frontend (Next.js)
    location / {
        proxy_pass http://localhost:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
    }
    
    # Backend API (NestJS)
    location /api/ {
        rewrite ^/api/(.*) /$1 break;
        proxy_pass http://localhost:3101;
        proxy_http_version 1.1;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        
        proxy_connect_timeout 60s;
        proxy_send_timeout 60s;
        proxy_read_timeout 60s;
    }
}

server {
    listen 80;
    server_name kit.dashtact.com;
    return 301 https://$server_name$request_uri;
}
```

### PostgreSQL Database

- **Port**: 5432 (localhost only)
- **Database**: kit_dashtact_db
- **User**: kit_dashtact_user
- **Connection**: Via DATABASE_URL in backend/.env

## Directory Structure

```
/home/ubuntu/apps/kit-dashtact/
├── backend/
│   ├── dist/                      # Compiled NestJS output
│   │   └── main.js               # Entry point for PM2
│   ├── src/                       # Source code
│   │   ├── auth/                 # Authentication module
│   │   ├── users/                # Users module
│   │   ├── permissions/          # Permissions module
│   │   ├── settings/             # Settings module
│   │   └── uploads/              # File uploads module
│   ├── prisma/
│   │   ├── schema.prisma         # Database schema
│   │   ├── migrations/           # Migration history
│   │   └── seed-data/            # Seed data files
│   ├── generated/
│   │   └── prisma/               # Generated Prisma client
│   ├── uploads/                   # Uploaded files storage
│   ├── .env                       # Production environment
│   ├── .env.production            # Environment template
│   ├── package.json
│   └── nest-cli.json
│
├── frontend/
│   ├── .next/                     # Next.js build output
│   │   ├── static/
│   │   │   └── chunks/           # CSS bundles (~80KB)
│   │   └── server/
│   ├── src/
│   │   ├── app/                  # Next.js 16 App Router
│   │   │   ├── globals.css       # Tailwind v4 + OKLCH colors
│   │   │   ├── layout.tsx        # Root layout
│   │   │   ├── page.tsx          # Home page
│   │   │   ├── login/            # Login page
│   │   │   ├── signup/           # Signup page
│   │   │   ├── forgot-password/  # Password reset
│   │   │   └── dashboard/        # Dashboard pages
│   │   ├── components/           # React components
│   │   │   ├── auth/             # Auth components
│   │   │   ├── dashboard/        # Dashboard components
│   │   │   ├── settings/         # Settings components
│   │   │   ├── ui/               # UI components
│   │   │   └── widgets/          # Widget system
│   │   ├── contexts/             # React contexts
│   │   │   ├── AuthContext.tsx   # Authentication
│   │   │   ├── ThemeContext.tsx  # Theme management
│   │   │   └── NavigationContext.tsx
│   │   ├── hooks/                # Custom hooks
│   │   ├── lib/                  # Utilities
│   │   └── types/                # TypeScript types
│   ├── public/                    # Static assets
│   ├── .env.local                 # Production environment
│   ├── .env.production            # Environment template
│   ├── package.json
│   └── next.config.js
│
└── logs/                          # Application logs

/home/ubuntu/.pm2/
├── logs/
│   ├── kit-backend-out.log       # Backend stdout
│   ├── kit-backend-error.log     # Backend stderr
│   ├── kit-frontend-out.log      # Frontend stdout
│   └── kit-frontend-error.log    # Frontend stderr
└── pids/                          # Process IDs

/etc/nginx/
├── sites-available/
│   └── kit.dashtact.com          # Nginx config
└── sites-enabled/
    └── kit.dashtact.com          # Symlink to above

/var/log/nginx/
├── kit.dashtact.com.access.log   # Access logs
└── kit.dashtact.com.error.log    # Error logs
```

## Technology Stack

### Backend
- **Framework**: NestJS 10.x
- **Runtime**: Node.js 20+
- **Database ORM**: Prisma 5.x
- **Database**: PostgreSQL 14+
- **Authentication**: JWT (access + refresh tokens)
- **Password Hashing**: bcrypt (10 rounds)
- **Validation**: class-validator, class-transformer

### Frontend
- **Framework**: Next.js 16.0.1 (App Router)
- **Runtime**: Node.js 20+
- **UI Library**: React 19
- **Styling**: Tailwind CSS 4.1.16
- **Color System**: OKLCH
- **State Management**: React Context
- **HTTP Client**: Fetch API

### Tailwind CSS v4 Configuration

**IMPORTANT**: This project uses Tailwind CSS v4 with inline configuration!

**Required Packages**:
```json
{
  "@tailwindcss/postcss": "4.1.16",
  "tailwindcss": "4.1.16"
}
```

**NO Config Files**:
- ❌ NO `tailwind.config.js`
- ❌ NO `postcss.config.js`
- ✅ All configuration in `src/app/globals.css`

**globals.css Structure**:
```css
@import "tailwindcss";

@custom-variant dark (&:is(.dark *));

@theme inline {
  --color-background: var(--background);
  --color-foreground: var(--foreground);
  /* ... CSS variable mappings */
}

@layer base {
  :root {
    /* Light mode OKLCH colors */
    --background: oklch(100% 0 0);
    --foreground: oklch(9.84% 0.002 285.82);
    --primary: oklch(45.62% 0.217 264.05);
    /* ... more colors */
  }
  
  .dark {
    /* Dark mode OKLCH colors */
    --background: oklch(0% 0 0);
    --foreground: oklch(98% 0 0);
    --primary: oklch(70% 0.2 250);
    /* ... more colors */
  }
}
```

**Build Output**:
- CSS bundles: `.next/static/chunks/*.css`
- Typical size: ~80KB (minified)
- Contains: Tailwind utilities + OKLCH color definitions

## Environment Variables

### Backend (.env)
```env
DATABASE_URL="postgresql://kit_dashtact_user:PASSWORD@localhost:5432/kit_dashtact_db?schema=public"
PORT=3101
NODE_ENV=production
JWT_SECRET=<32-char-secure-string>
JWT_ACCESS_EXPIRATION=15m
JWT_REFRESH_EXPIRATION=7d
CORS_ORIGIN=https://kit.dashtact.com
BCRYPT_ROUNDS=10
ENABLE_AUDIT_LOGGING=true
```

### Frontend (.env.local)
```env
NEXT_PUBLIC_API_URL=https://kit.dashtact.com/api
NEXT_PUBLIC_APP_URL=https://kit.dashtact.com
NODE_ENV=production
```

## API Endpoints

### Backend Routes (Port 3101)

**Health Check**:
- `GET /` → "Hello World!"

**Authentication**:
- `POST /auth/register` → Register new user
- `POST /auth/login` → Login
- `POST /auth/logout` → Logout
- `POST /auth/refresh` → Refresh token
- `GET /auth/profile` → Get current user

**Users**:
- `GET /users` → List users (requires `users:read`)
- `POST /users` → Create user (requires `users:write`)
- `GET /users/:id` → Get user (requires `users:read`)
- `PATCH /users/:id` → Update user (requires `users:write`)
- `DELETE /users/:id` → Delete user (requires `users:delete`)

**Permissions**:
- `GET /permissions` → List permissions
- `POST /permissions` → Create permission
- `POST /permissions/assign` → Assign to role
- `DELETE /permissions/assign` → Remove from role
- `GET /permissions/role/:roleId` → Get role permissions
- `GET /permissions/user/:userId/check/:permission` → Check user permission

**Settings**:
- `GET /settings` → List all settings
- `GET /settings/global` → Get global settings
- `GET /settings/user/:userId` → Get user settings
- `GET /settings/:id` → Get by ID
- `POST /settings` → Create settings
- `PATCH /settings/:id` → Update settings
- `DELETE /settings/:id` → Delete settings

**Uploads**:
- `POST /uploads` → Upload file

### Frontend Routes (Port 3000)

**Public Pages**:
- `/` → Landing page
- `/login` → Login page
- `/signup` → Signup page
- `/forgot-password` → Password reset

**Protected Pages** (require authentication):
- `/dashboard` → Dashboard home
- `/dashboard/analytics` → Analytics
- `/dashboard/data` → Data management
- `/dashboard/users` → User management (requires `users:read`)
- `/dashboard/permissions` → Permissions (requires `permissions:read`)
- `/dashboard/permissions/roles` → Role management
- `/dashboard/settings` → Settings
- `/dashboard/settings/theme` → Theme customization
- `/dashboard/widgets` → Widget gallery
- `/dashboard/design-system` → Design system showcase

**Error Pages**:
- `/403` → Access denied

## PM2 Commands

### Process Management
```bash
# List all processes
pm2 list

# Restart processes
pm2 restart kit-backend
pm2 restart kit-frontend
pm2 restart all

# Stop processes
pm2 stop kit-backend
pm2 stop kit-frontend

# Delete processes
pm2 delete kit-backend
pm2 delete kit-frontend

# Save process list
pm2 save

# Resurrect saved processes
pm2 resurrect
```

### Monitoring
```bash
# View logs (live)
pm2 logs
pm2 logs kit-backend
pm2 logs kit-frontend

# View logs (last N lines)
pm2 logs kit-backend --lines 50 --nostream
pm2 logs kit-frontend --lines 50 --nostream

# Monitor resources
pm2 monit

# Process info
pm2 info kit-backend
pm2 info kit-frontend
```

### Startup Configuration
```bash
# Generate startup script
pm2 startup

# Save current process list
pm2 save

# Disable startup
pm2 unstartup
```

## Nginx Commands

```bash
# Test configuration
sudo nginx -t

# Reload (no downtime)
sudo systemctl reload nginx

# Restart
sudo systemctl restart nginx

# Status
sudo systemctl status nginx

# View logs
sudo tail -f /var/log/nginx/kit.dashtact.com.access.log
sudo tail -f /var/log/nginx/kit.dashtact.com.error.log
```

## Database Commands

```bash
# Connect to database
psql -U kit_dashtact_user -d kit_dashtact_db

# Run Prisma Studio
cd /home/ubuntu/apps/kit-dashtact/backend
npm run prisma:studio

# Generate Prisma client
npm run prisma:generate

# Run migrations
npm run prisma:migrate deploy

# Seed database
npm run prisma:seed

# View migration status
npm run prisma:migrate status
```

## Monitoring & Logs

### Check Service Status
```bash
# All services at once
pm2 list && \
sudo systemctl status nginx --no-pager | head -5 && \
sudo systemctl status postgresql --no-pager | head -5
```

### View Logs
```bash
# PM2 logs
pm2 logs --lines 100

# Nginx access logs
sudo tail -f /var/log/nginx/kit.dashtact.com.access.log

# Nginx error logs
sudo tail -f /var/log/nginx/kit.dashtact.com.error.log

# System logs
sudo journalctl -u nginx -f
sudo journalctl -u postgresql -f
```

### Test Endpoints
```bash
# Backend health
curl http://localhost:3101

# Frontend health
curl -I http://localhost:3000

# API via Nginx
curl https://kit.dashtact.com/api/settings/global

# Full test
curl -s http://localhost:3101 && \
curl -I http://localhost:3000 2>&1 | head -3 && \
curl -s https://kit.dashtact.com/api/settings/global | head -c 200
```

## Backup & Recovery

### Database Backup
```bash
# Create backup
pg_dump -U kit_dashtact_user kit_dashtact_db > backup_$(date +%Y%m%d_%H%M%S).sql

# Restore backup
psql -U kit_dashtact_user -d kit_dashtact_db < backup_20251110_120000.sql
```

### Application Backup
```bash
# Backup entire application
tar -czf kit-dashtact-backup-$(date +%Y%m%d).tar.gz /home/ubuntu/apps/kit-dashtact

# Backup only source code
tar -czf kit-dashtact-src-$(date +%Y%m%d).tar.gz \
  /home/ubuntu/apps/kit-dashtact/backend/src \
  /home/ubuntu/apps/kit-dashtact/frontend/src
```

## Security Notes

### Firewall Rules
- Port 22 (SSH): Restricted to specific IPs
- Port 80 (HTTP): Open (redirects to HTTPS)
- Port 443 (HTTPS): Open (Cloudflare proxy)
- Port 3000, 3101, 5432: Localhost only

### SSL/TLS
- Managed by Cloudflare
- Full (strict) encryption mode
- Auto-renewing certificates

### Authentication
- JWT tokens (15min access, 7d refresh)
- bcrypt password hashing (10 rounds)
- Token blacklist on logout
- Audit logging enabled

## Performance Metrics

### Current Resource Usage
- **Backend**: ~107MB RAM, 0% CPU (idle)
- **Frontend**: ~60MB RAM, 0% CPU (idle)
- **PostgreSQL**: ~50MB RAM
- **Nginx**: ~10MB RAM
- **Total**: ~230MB RAM usage

### Response Times
- Backend API: <50ms
- Frontend SSR: <200ms
- Static assets: <10ms (Cloudflare cache)

### Build Times
- Backend: ~30s
- Frontend: ~40s
- Total deployment: ~2-3 minutes

## Troubleshooting Quick Reference

| Issue | Check | Fix |
|-------|-------|-----|
| Backend down | `pm2 list` | `pm2 restart kit-backend` |
| Frontend down | `pm2 list` | `pm2 restart kit-frontend` |
| API 404 | Nginx config | Check `/api/` rewrite rule |
| CORS error | Backend .env | Verify `CORS_ORIGIN` |
| DB connection | `psql -U kit_dashtact_user` | Check `DATABASE_URL` |
| No styles | Tailwind version | Must be v4.1.16 |
| Build fails | Node version | Must be v20+ |
| SSL error | Cloudflare | Check proxy status |

## Deployment Checklist

- [ ] SSH connection works
- [ ] PM2 processes running
- [ ] Nginx configuration valid
- [ ] Database accessible
- [ ] Backend responds on :3101
- [ ] Frontend responds on :3000
- [ ] API accessible via /api/
- [ ] HTTPS works on kit.dashtact.com
- [ ] Theme switching works
- [ ] Login/authentication works
- [ ] No console errors

## Contact & Support

- **Server Admin**: ubuntu@13.53.218.109
- **Domain**: kit.dashtact.com
- **Cloudflare**: Proxy enabled, SSL Full (strict)
- **AWS Region**: eu-north-1

---

Last Updated: November 10, 2025
Version: 2.0.0
