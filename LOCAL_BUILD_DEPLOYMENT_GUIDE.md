# Local Build Deployment Guide

## Why Build Locally?

**Advantages:**
✅ Uses your working development environment  
✅ Avoids server-side build issues (Tailwind CSS conflicts)  
✅ Faster deployment (no build time on server)  
✅ Consistent builds across deployments  
✅ Less server resources needed  

**The Issue:**
- Your local dev environment works perfectly with Tailwind CSS v4
- Production build on server fails due to environment differences
- Solution: Build on your machine, deploy the compiled `.next` folder

---

## Step-by-Step Deployment Process

### Step 1: Prepare Production Environment File

Create/verify `frontend/.env.production`:

```env
NEXT_PUBLIC_API_URL=https://kit.dashtact.com/api
NEXT_PUBLIC_APP_URL=https://kit.dashtact.com
NODE_ENV=production
```

### Step 2: Build Frontend Locally

```powershell
# Navigate to frontend directory
cd frontend

# Install dependencies (if not already done)
npm install

# Build with production environment
npm run build

# Verify build succeeded
# You should see: "✓ Compiled successfully"
# And a .next folder should be created
```

**Expected Output:**
```
▲ Next.js 16.0.1 (Turbopack)
- Environments: .env.local, .env.production

Creating an optimized production build ...
✓ Compiled successfully
```

### Step 3: Verify Build Output

```powershell
# Check that .next folder exists and has content
dir .next

# Should contain:
# - .next/server/
# - .next/static/
# - .next/BUILD_ID
# - .next/package.json
```

### Step 4: Transfer Build to Server

**Option A: Transfer .next folder only (Fastest)**

```powershell
# From your project root
scp -i "C:\Users\fabat\Desktop\dashtact\my-ec2-key.pem" -r frontend/.next ubuntu@13.53.218.109:/home/ubuntu/apps/kit-dashtact/frontend/
```

**Option B: Transfer entire frontend (Safer)**

```powershell
# Transfer everything including node_modules (production only)
scp -i "C:\Users\fabat\Desktop\dashtact\my-ec2-key.pem" -r frontend/.next frontend/package.json frontend/package-lock.json frontend/.env.production frontend/next.config.ts frontend/public ubuntu@13.53.218.109:/home/ubuntu/apps/kit-dashtact/frontend/
```

### Step 5: Install Production Dependencies on Server

```powershell
ssh -i "C:\Users\fabat\Desktop\dashtact\my-ec2-key.pem" ubuntu@13.53.218.109 "cd /home/ubuntu/apps/kit-dashtact/frontend && npm install --production"
```

**Note:** `--production` flag installs only runtime dependencies, not dev dependencies like Tailwind CSS build tools.

### Step 6: Restart Frontend on Server

```powershell
ssh -i "C:\Users\fabat\Desktop\dashtact\my-ec2-key.pem" ubuntu@13.53.218.109 "cd /home/ubuntu/apps/kit-dashtact/frontend && cp .env.production .env.local && pm2 restart kit-frontend && pm2 save"
```

### Step 7: Verify Deployment

```powershell
# Check PM2 status
ssh -i "C:\Users\fabat\Desktop\dashtact\my-ec2-key.pem" ubuntu@13.53.218.109 "pm2 list"

# Check frontend logs
ssh -i "C:\Users\fabat\Desktop\dashtact\my-ec2-key.pem" ubuntu@13.53.218.109 "pm2 logs kit-frontend --lines 20 --nostream"

# Test frontend endpoint
ssh -i "C:\Users\fabat\Desktop\dashtact\my-ec2-key.pem" ubuntu@13.53.218.109 "curl -I http://localhost:3100"
```

### Step 8: Test Public Access

Open browser and visit: **https://kit.dashtact.com**

---

## Complete Deployment Script

Save this as `deploy-local-build.ps1`:

```powershell
# Local Build & Deploy Script
# Run from project root directory

Write-Host "=== Starting Local Build Deployment ===" -ForegroundColor Green

# Step 1: Build frontend locally
Write-Host "`n[1/6] Building frontend locally..." -ForegroundColor Cyan
cd frontend
npm run build

if ($LASTEXITCODE -ne 0) {
    Write-Host "❌ Build failed! Fix errors before deploying." -ForegroundColor Red
    exit 1
}

Write-Host "✅ Build successful!" -ForegroundColor Green
cd ..

# Step 2: Transfer .next folder
Write-Host "`n[2/6] Transferring .next folder to server..." -ForegroundColor Cyan
scp -i "C:\Users\fabat\Desktop\dashtact\my-ec2-key.pem" -r frontend/.next ubuntu@13.53.218.109:/home/ubuntu/apps/kit-dashtact/frontend/

if ($LASTEXITCODE -ne 0) {
    Write-Host "❌ Transfer failed!" -ForegroundColor Red
    exit 1
}

Write-Host "✅ Transfer complete!" -ForegroundColor Green

# Step 3: Transfer config files
Write-Host "`n[3/6] Transferring configuration files..." -ForegroundColor Cyan
scp -i "C:\Users\fabat\Desktop\dashtact\my-ec2-key.pem" frontend/.env.production frontend/package.json frontend/next.config.ts ubuntu@13.53.218.109:/home/ubuntu/apps/kit-dashtact/frontend/

# Step 4: Install production dependencies
Write-Host "`n[4/6] Installing production dependencies on server..." -ForegroundColor Cyan
ssh -i "C:\Users\fabat\Desktop\dashtact\my-ec2-key.pem" ubuntu@13.53.218.109 "cd /home/ubuntu/apps/kit-dashtact/frontend && npm install --production"

# Step 5: Restart frontend
Write-Host "`n[5/6] Restarting frontend service..." -ForegroundColor Cyan
ssh -i "C:\Users\fabat\Desktop\dashtact\my-ec2-key.pem" ubuntu@13.53.218.109 "cd /home/ubuntu/apps/kit-dashtact/frontend && cp .env.production .env.local && pm2 restart kit-frontend && pm2 save"

Start-Sleep -Seconds 5

# Step 6: Verify deployment
Write-Host "`n[6/6] Verifying deployment..." -ForegroundColor Cyan
ssh -i "C:\Users\fabat\Desktop\dashtact\my-ec2-key.pem" ubuntu@13.53.218.109 "pm2 list && echo '' && echo 'Testing frontend...' && curl -I http://localhost:3100 2>&1 | head -n 1"

Write-Host "`n=== Deployment Complete! ===" -ForegroundColor Green
Write-Host "Visit: https://kit.dashtact.com" -ForegroundColor Yellow
```

**Usage:**
```powershell
# Make script executable and run
.\deploy-local-build.ps1
```

---

## Troubleshooting

### Build Fails Locally

**Error:** "Cannot apply unknown utility class"
```powershell
# Check if you have the old postcss.config.js
dir frontend/postcss.config.*

# Should only have postcss.config.mjs
# If you have postcss.config.js, delete it
del frontend/postcss.config.js
```

### Transfer Fails

**Error:** "Permission denied"
```powershell
# Verify SSH key permissions
icacls "C:\Users\fabat\Desktop\dashtact\my-ec2-key.pem"

# Test SSH connection
ssh -i "C:\Users\fabat\Desktop\dashtact\my-ec2-key.pem" ubuntu@13.53.218.109 "echo 'Connection OK'"
```

### Frontend Won't Start

**Error:** "MODULE_NOT_FOUND"
```powershell
# Install all dependencies (not just production)
ssh -i "C:\Users\fabat\Desktop\dashtact\my-ec2-key.pem" ubuntu@13.53.218.109 "cd /home/ubuntu/apps/kit-dashtact/frontend && npm install"
```

### Port 3100 Not Responding

```powershell
# Check PM2 logs
ssh -i "C:\Users\fabat\Desktop\dashtact\my-ec2-key.pem" ubuntu@13.53.218.109 "pm2 logs kit-frontend --lines 50"

# Check if process is running
ssh -i "C:\Users\fabat\Desktop\dashtact\my-ec2-key.pem" ubuntu@13.53.218.109 "pm2 describe kit-frontend"
```

---

## Why This Works

### Development vs Production Build

**Development (`npm run dev`):**
- Uses Turbopack for fast hot-reload
- Compiles on-demand
- More lenient with errors
- Uses development optimizations

**Production (`npm run build`):**
- Full compilation and optimization
- Strict error checking
- Minification and tree-shaking
- Static generation where possible

### The Key Difference

Your **local environment** has:
- Windows file system
- Your specific Node.js version
- Your npm cache
- Working Tailwind CSS v4 setup

The **server environment** has:
- Linux file system
- Different Node.js version (possibly)
- Clean npm install
- Potential package version mismatches

By building locally, you use your **working environment** and just deploy the **compiled output**.

---

## Best Practices

### 1. Always Test Build Locally First

```powershell
cd frontend
npm run build
npm run start  # Test production build locally
# Visit http://localhost:3000
```

### 2. Use Environment Variables Correctly

- `.env.local` - Local development
- `.env.production` - Production build
- Never commit `.env` files with secrets

### 3. Version Control Your Builds

```powershell
# Optional: Tag your deployments
git tag -a v1.0.0 -m "Production deployment $(Get-Date -Format 'yyyy-MM-dd')"
git push origin v1.0.0
```

### 4. Keep Deployment Logs

```powershell
# Log deployment
$timestamp = Get-Date -Format "yyyy-MM-dd_HH-mm-ss"
.\deploy-local-build.ps1 | Tee-Object -FilePath "deployment-log-$timestamp.txt"
```

---

## Comparison: Local Build vs Server Build

| Aspect | Local Build | Server Build |
|--------|-------------|--------------|
| **Build Time** | Uses your machine | Uses server resources |
| **Consistency** | ✅ Same environment every time | ⚠️ Depends on server state |
| **Debugging** | ✅ Easy to debug locally | ❌ Hard to debug remotely |
| **Dependencies** | ✅ Uses your working setup | ⚠️ May have version conflicts |
| **Speed** | ⚠️ Transfer time for .next | ✅ No transfer needed |
| **Disk Space** | ✅ Build artifacts local | ⚠️ Build artifacts on server |
| **CI/CD Ready** | ✅ Easy to automate | ✅ Also automatable |

**Recommendation:** Local build is better for your current situation.

---

## Future: Automated CI/CD

Once stable, consider GitHub Actions:

```yaml
# .github/workflows/deploy.yml
name: Deploy to Production

on:
  push:
    branches: [main]

jobs:
  deploy:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - uses: actions/setup-node@v3
      - run: cd frontend && npm install && npm run build
      - name: Deploy to server
        uses: easingthemes/ssh-deploy@main
        with:
          SSH_PRIVATE_KEY: ${{ secrets.SSH_KEY }}
          REMOTE_HOST: 13.53.218.109
          REMOTE_USER: ubuntu
          SOURCE: "frontend/.next/"
          TARGET: "/home/ubuntu/apps/kit-dashtact/frontend/.next/"
```

---

## Summary

**Current Situation:**
- ✅ Backend deployed successfully
- ❌ Frontend build fails on server
- ✅ Frontend works perfectly in local dev

**Solution:**
1. Build frontend locally with `npm run build`
2. Transfer `.next` folder to server
3. Install production dependencies on server
4. Restart PM2 process
5. Done! ✅

**Time Estimate:** 5-10 minutes

**Next Step:** Run the deployment script above!
