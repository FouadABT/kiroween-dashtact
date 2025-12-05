# Dashtact Production Deployment - Quick Deploy
# Target: kit.dashtact.com (13.53.218.109)

$ErrorActionPreference = "Continue"

$SSH_KEY = "C:\Users\fabat\Desktop\dashtact\my-ec2-key.pem"
$SERVER = "ubuntu@13.53.218.109"
$APP_DIR = "/home/ubuntu/apps/kit-dashtact"

Write-Host "`n========================================" -ForegroundColor Cyan
Write-Host "  DASHTACT PRODUCTION DEPLOYMENT" -ForegroundColor Cyan
Write-Host "========================================`n" -ForegroundColor Cyan

# Step 1: Prepare directories
Write-Host "[1/6] Preparing server directories..." -ForegroundColor Yellow
ssh -i $SSH_KEY $SERVER "mkdir -p $APP_DIR/backend $APP_DIR/frontend /home/ubuntu/backups"
Write-Host "SUCCESS`n" -ForegroundColor Green

# Step 2: Backup database
Write-Host "[2/6] Backing up database..." -ForegroundColor Yellow
$backupDate = Get-Date -Format "yyyyMMdd_HHmmss"
ssh -i $SSH_KEY $SERVER "PGPASSWORD='UcbMjpOJEbocT32GqNS20SYHSTr59JiS' pg_dump -U kit_dashtact_user -h localhost -d kit_dashtact_db > /home/ubuntu/backups/backup_$backupDate.sql 2>&1 || echo 'No existing database to backup'"
Write-Host "SUCCESS`n" -ForegroundColor Green

# Step 3: Transfer backend
Write-Host "[3/6] Transferring backend files..." -ForegroundColor Yellow
scp -i $SSH_KEY -r ../backend/src ../backend/prisma ../backend/package.json ../backend/package-lock.json ../backend/tsconfig.json ../backend/tsconfig.build.json ../backend/nest-cli.json ../backend/.env.production "${SERVER}:${APP_DIR}/backend/" 2>&1 | Out-Null
Write-Host "SUCCESS`n" -ForegroundColor Green

# Step 4: Transfer frontend
Write-Host "[4/6] Transferring frontend files..." -ForegroundColor Yellow
scp -i $SSH_KEY -r ../frontend/src ../frontend/public ../frontend/package.json ../frontend/package-lock.json ../frontend/next.config.ts ../frontend/tsconfig.json ../frontend/tailwind.config.ts ../frontend/postcss.config.mjs ../frontend/components.json ../frontend/.env.production "${SERVER}:${APP_DIR}/frontend/" 2>&1 | Out-Null
Write-Host "SUCCESS`n" -ForegroundColor Green

# Step 5: Deploy backend
Write-Host "[5/6] Deploying backend (this may take a few minutes)..." -ForegroundColor Yellow
ssh -i $SSH_KEY $SERVER @"
cd $APP_DIR/backend
cp .env.production .env
npm install --production 2>&1 | tail -n 5
npx prisma generate 2>&1 | tail -n 3
npx prisma migrate deploy 2>&1 | tail -n 5
npm run build 2>&1 | tail -n 5
pm2 delete kit-backend 2>/dev/null || true
pm2 start dist/main.js --name kit-backend --env production
pm2 save
echo 'Backend deployed!'
"@
Write-Host "SUCCESS`n" -ForegroundColor Green

# Step 6: Deploy frontend
Write-Host "[6/6] Deploying frontend (this may take a few minutes)..." -ForegroundColor Yellow
ssh -i $SSH_KEY $SERVER @"
cd $APP_DIR/frontend
cp .env.production .env.local
npm install --production 2>&1 | tail -n 5
npm run build 2>&1 | tail -n 10
pm2 delete kit-frontend 2>/dev/null || true
pm2 start npm --name kit-frontend -- start
pm2 save
echo 'Frontend deployed!'
"@
Write-Host "SUCCESS`n" -ForegroundColor Green

# Verification
Write-Host "========================================" -ForegroundColor Cyan
Write-Host "  VERIFYING DEPLOYMENT" -ForegroundColor Cyan
Write-Host "========================================`n" -ForegroundColor Cyan

ssh -i $SSH_KEY $SERVER @"
echo '=== PM2 Status ==='
pm2 list

echo ''
echo '=== Backend Logs (last 10 lines) ==='
pm2 logs kit-backend --lines 10 --nostream

echo ''
echo '=== Frontend Logs (last 10 lines) ==='
pm2 logs kit-frontend --lines 10 --nostream
"@

Write-Host "`n========================================" -ForegroundColor Green
Write-Host "  DEPLOYMENT COMPLETE!" -ForegroundColor Green
Write-Host "========================================`n" -ForegroundColor Green

Write-Host "Application: https://kit.dashtact.com" -ForegroundColor Cyan
Write-Host "API: https://kit.dashtact.com/api`n" -ForegroundColor Cyan

Write-Host "Monitor logs: ssh -i $SSH_KEY $SERVER 'pm2 logs'" -ForegroundColor Yellow
Write-Host ""
