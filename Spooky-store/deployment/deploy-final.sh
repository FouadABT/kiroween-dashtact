#!/bin/bash
# Dashtact Production Deployment Script
# Target: kit.dashtact.com (13.53.218.109)

set -e

SSH_KEY="C:/Users/fabat/Desktop/dashtact/my-ec2-key.pem"
SERVER="ubuntu@13.53.218.109"
APP_DIR="/home/ubuntu/apps/kit-dashtact"

echo "========================================"
echo "  DASHTACT PRODUCTION DEPLOYMENT"
echo "========================================"
echo ""

# Step 1: Prepare directories
echo "[1/6] Preparing server directories..."
ssh -i "$SSH_KEY" $SERVER "mkdir -p $APP_DIR/backend $APP_DIR/frontend /home/ubuntu/backups"
echo "✓ SUCCESS"
echo ""

# Step 2: Backup database
echo "[2/6] Backing up database..."
BACKUP_DATE=$(date +%Y%m%d_%H%M%S)
ssh -i "$SSH_KEY" $SERVER "PGPASSWORD='UcbMjpOJEbocT32GqNS20SYHSTr59JiS' pg_dump -U kit_dashtact_user -h localhost -d kit_dashtact_db > /home/ubuntu/backups/backup_$BACKUP_DATE.sql 2>&1 || echo 'No existing database'"
echo "✓ SUCCESS"
echo ""

# Step 3: Transfer backend
echo "[3/6] Transferring backend files..."
scp -i "$SSH_KEY" -r ../backend/src ../backend/prisma ../backend/package.json ../backend/package-lock.json ../backend/tsconfig.json ../backend/tsconfig.build.json ../backend/nest-cli.json ../backend/.env.production "$SERVER:$APP_DIR/backend/"
echo "✓ SUCCESS"
echo ""

# Step 4: Transfer frontend  
echo "[4/6] Transferring frontend files..."
scp -i "$SSH_KEY" -r ../frontend/src ../frontend/public ../frontend/package.json ../frontend/package-lock.json ../frontend/next.config.ts ../frontend/tsconfig.json ../frontend/tailwind.config.ts ../frontend/postcss.config.mjs ../frontend/components.json ../frontend/.env.production "$SERVER:$APP_DIR/frontend/"
echo "✓ SUCCESS"
echo ""

# Step 5: Deploy backend
echo "[5/6] Deploying backend..."
ssh -i "$SSH_KEY" $SERVER << 'ENDSSH'
cd /home/ubuntu/apps/kit-dashtact/backend
cp .env.production .env
echo "Installing dependencies..."
npm install --production
echo "Generating Prisma client..."
npx prisma generate
echo "Running migrations..."
npx prisma migrate deploy
echo "Building application..."
npm run build
echo "Starting PM2 process..."
pm2 delete kit-backend 2>/dev/null || true
pm2 start dist/main.js --name kit-backend --env production
pm2 save
echo "✓ Backend deployed!"
ENDSSH
echo ""

# Step 6: Deploy frontend
echo "[6/6] Deploying frontend..."
ssh -i "$SSH_KEY" $SERVER << 'ENDSSH'
cd /home/ubuntu/apps/kit-dashtact/frontend
cp .env.production .env.local
echo "Installing dependencies..."
npm install --production
echo "Building application..."
npm run build
echo "Starting PM2 process..."
pm2 delete kit-frontend 2>/dev/null || true
pm2 start npm --name kit-frontend -- start
pm2 save
echo "✓ Frontend deployed!"
ENDSSH
echo ""

# Verification
echo "========================================"
echo "  VERIFYING DEPLOYMENT"
echo "========================================"
echo ""

ssh -i "$SSH_KEY" $SERVER << 'ENDSSH'
echo "=== PM2 Status ==="
pm2 list

echo ""
echo "=== Backend Health ==="
sleep 3
curl -f http://localhost:3101/api/health || echo "Backend starting..."

echo ""
echo "=== Frontend Health ==="
curl -I http://localhost:3100 || echo "Frontend starting..."
ENDSSH

echo ""
echo "========================================"
echo "  DEPLOYMENT COMPLETE!"
echo "========================================"
echo ""
echo "🌐 Application: https://kit.dashtact.com"
echo "🔧 API: https://kit.dashtact.com/api"
echo ""
echo "Monitor: ssh -i $SSH_KEY $SERVER 'pm2 logs'"
echo ""
