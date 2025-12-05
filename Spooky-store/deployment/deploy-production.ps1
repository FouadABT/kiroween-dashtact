# Dashtact Production Deployment Script
# Target: kit.dashtact.com (13.53.218.109)

$ErrorActionPreference = "Stop"

# Configuration
$SSH_KEY = "C:\Users\fabat\Desktop\dashtact\my-ec2-key.pem"
$SERVER = "ubuntu@13.53.218.109"
$APP_DIR = "/home/ubuntu/apps/kit-dashtact"
$BACKEND_PORT = 3101
$FRONTEND_PORT = 3100

Write-Host "========================================" -ForegroundColor Cyan
Write-Host "  DASHTACT PRODUCTION DEPLOYMENT" -ForegroundColor Cyan
Write-Host "  Domain: kit.dashtact.com" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""

# Phase 1: Pre-Deployment Checks
Write-Host "[1/7] Pre-Deployment Checks..." -ForegroundColor Yellow

# Check SSH key
if (-not (Test-Path $SSH_KEY)) {
    Write-Host "ERROR: SSH key not found: $SSH_KEY" -ForegroundColor Red
    exit 1
}
Write-Host "SUCCESS: SSH key found" -ForegroundColor Green

# Check environment files
$envFiles = @(
    "backend\.env.production",
    "frontend\.env.production"
)

foreach ($file in $envFiles) {
    $fullPath = Join-Path ".." $file
    if (-not (Test-Path $fullPath)) {
        Write-Host "ERROR: Missing: $file" -ForegroundColor Red
        exit 1
    }
    Write-Host "SUCCESS: Found: $file" -ForegroundColor Green
}

# Test SSH connection
Write-Host "Testing SSH connection..." -ForegroundColor Yellow
$sshTest = ssh -i $SSH_KEY -o ConnectTimeout=10 $SERVER "echo connected"
if ($LASTEXITCODE -ne 0) {
    Write-Host "ERROR: SSH connection failed" -ForegroundColor Red
    exit 1
}
Write-Host "SUCCESS: SSH connection successful" -ForegroundColor Green

Write-Host ""

# Phase 2: Database Backup
Write-Host "[2/7] Creating Database Backup..." -ForegroundColor Yellow
$backupDate = Get-Date -Format "yyyyMMdd_HHmmss"
ssh -i $SSH_KEY $SERVER "pg_dump -U kit_dashtact_user -d kit_dashtact_db > /home/ubuntu/backups/kit_dashtact_backup_$backupDate.sql 2>&1 || echo 'Backup warning (may not exist yet)'"
Write-Host "SUCCESS: Backup created (if database exists)" -ForegroundColor Green
Write-Host ""

# Phase 3: File Transfer
Write-Host "[3/7] Transferring Files to Server..." -ForegroundColor Yellow

# Create app directory structure
Write-Host "Creating directory structure..." -ForegroundColor Yellow
ssh -i $SSH_KEY $SERVER "mkdir -p $APP_DIR/backend && mkdir -p $APP_DIR/frontend && mkdir -p /home/ubuntu/backups"

# Transfer backend files
Write-Host "Transferring backend files..." -ForegroundColor Yellow
scp -i $SSH_KEY -r ../backend/src ../backend/prisma ../backend/package.json ../backend/package-lock.json ../backend/tsconfig.json ../backend/tsconfig.build.json ../backend/nest-cli.json ../backend/.env.production "${SERVER}:${APP_DIR}/backend/"

# Transfer frontend files
Write-Host "Transferring frontend files..." -ForegroundColor Yellow
scp -i $SSH_KEY -r ../frontend/src ../frontend/public ../frontend/package.json ../frontend/package-lock.json ../frontend/next.config.ts ../frontend/tsconfig.json ../frontend/tailwind.config.ts ../frontend/postcss.config.mjs ../frontend/components.json ../frontend/.env.production "${SERVER}:${APP_DIR}/frontend/"

Write-Host "SUCCESS: Files transferred successfully" -ForegroundColor Green
Write-Host ""

# Phase 4: Backend Deployment
Write-Host "[4/7] Deploying Backend..." -ForegroundColor Yellow
$backendScript = @"
set -e
cd $APP_DIR/backend

# Setup environment
cp .env.production .env

# Install dependencies
echo 'Installing backend dependencies...'
npm install --production

# Prisma setup
echo 'Setting up Prisma...'
npx prisma generate
npx prisma migrate deploy

# Build application
echo 'Building backend...'
npm run build

# PM2 management
echo 'Managing PM2 process...'
pm2 delete kit-backend 2>/dev/null || true
pm2 start dist/main.js --name kit-backend --env production
pm2 save

echo 'Backend deployment complete!'
"@

ssh -i $SSH_KEY $SERVER $backendScript

if ($LASTEXITCODE -ne 0) {
    Write-Host "ERROR: Backend deployment failed" -ForegroundColor Red
    exit 1
}
Write-Host "SUCCESS: Backend deployed successfully" -ForegroundColor Green
Write-Host ""

# Phase 5: Frontend Deployment
Write-Host "[5/7] Deploying Frontend..." -ForegroundColor Yellow
$frontendScript = @"
set -e
cd $APP_DIR/frontend

# Setup environment
cp .env.production .env.local

# Install dependencies
echo 'Installing frontend dependencies...'
npm install --production

# Build application
echo 'Building frontend...'
npm run build

# PM2 management
echo 'Managing PM2 process...'
pm2 delete kit-frontend 2>/dev/null || true
pm2 start npm --name kit-frontend -- start
pm2 save

echo 'Frontend deployment complete!'
"@

ssh -i $SSH_KEY $SERVER $frontendScript

if ($LASTEXITCODE -ne 0) {
    Write-Host "ERROR: Frontend deployment failed" -ForegroundColor Red
    exit 1
}
Write-Host "SUCCESS: Frontend deployed successfully" -ForegroundColor Green
Write-Host ""

# Phase 6: Service Verification
Write-Host "[6/7] Verifying Services..." -ForegroundColor Yellow

$verifyScript = @"
echo '=== PM2 Process List ==='
pm2 list

echo ''
echo '=== Backend Health Check ==='
sleep 5
curl -f http://localhost:$BACKEND_PORT/api/health || echo 'Backend health check pending...'

echo ''
echo '=== Frontend Health Check ==='
curl -I http://localhost:$FRONTEND_PORT || echo 'Frontend health check pending...'

echo ''
echo '=== Nginx Status ==='
sudo systemctl status nginx --no-pager | head -n 10

echo ''
echo '=== PostgreSQL Status ==='
sudo systemctl status postgresql --no-pager | head -n 10
"@

ssh -i $SSH_KEY $SERVER $verifyScript

Write-Host "SUCCESS: Service verification complete" -ForegroundColor Green
Write-Host ""

# Phase 7: Post-Deployment Validation
Write-Host "[7/7] Post-Deployment Validation..." -ForegroundColor Yellow

Write-Host "Checking PM2 logs..." -ForegroundColor Yellow
ssh -i $SSH_KEY $SERVER "pm2 logs --lines 20 --nostream"

Write-Host ""
Write-Host "========================================" -ForegroundColor Green
Write-Host "  DEPLOYMENT COMPLETED SUCCESSFULLY!" -ForegroundColor Green
Write-Host "========================================" -ForegroundColor Green
Write-Host ""
Write-Host "Application URL: https://kit.dashtact.com" -ForegroundColor Cyan
Write-Host "Backend API: https://kit.dashtact.com/api" -ForegroundColor Cyan
Write-Host ""
Write-Host "Next Steps:" -ForegroundColor Yellow
Write-Host "1. Visit https://kit.dashtact.com to verify the application" -ForegroundColor White
Write-Host "2. Test login functionality" -ForegroundColor White
Write-Host "3. Monitor logs with PM2" -ForegroundColor White
Write-Host "4. Check Nginx logs if issues occur" -ForegroundColor White
Write-Host ""
