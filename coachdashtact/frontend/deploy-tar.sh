#!/bin/bash
set -e

cd /home/ubuntu/apps/kit-dashtact/frontend

echo "[$(date +'%Y-%m-%d %H:%M:%S')] [FRONTEND] Extracting tar archive..." >> ../deployment.log
tar -xzf frontend-deploy.tar.gz
rm frontend-deploy.tar.gz frontend-deploy-20251110_174459.zip 2>/dev/null || true

echo "[$(date +'%Y-%m-%d %H:%M:%S')] [FRONTEND] Setting up environment..." >> ../deployment.log
cp .env.production .env.local

echo "[$(date +'%Y-%m-%d %H:%M:%S')] [FRONTEND] Installing dependencies..." >> ../deployment.log
npm install --production --no-optional --silent

echo "[$(date +'%Y-%m-%d %H:%M:%S')] [FRONTEND] Starting PM2 process..." >> ../deployment.log
pm2 start npm --name kit-frontend -- start
pm2 save

echo "[$(date +'%Y-%m-%d %H:%M:%S')] [FRONTEND] Waiting for startup..." >> ../deployment.log
sleep 5

echo "[$(date +'%Y-%m-%d %H:%M:%S')] [FRONTEND] Running health check..." >> ../deployment.log
if curl -f -I http://localhost:3100 > /dev/null 2>&1; then
  echo "[$(date +'%Y-%m-%d %H:%M:%S')] [FRONTEND] ✅ Deployment successful!" >> ../deployment.log
  echo "✅ DEPLOYMENT SUCCESSFUL"
  pm2 list
  echo ""
  echo "Frontend is now running on http://localhost:3100"
  echo "Public URL: https://kit.dashtact.com"
else
  echo "[$(date +'%Y-%m-%d %H:%M:%S')] [FRONTEND] ❌ Health check failed" >> ../deployment.log
  echo "❌ HEALTH CHECK FAILED"
  echo "Checking PM2 logs..."
  pm2 logs kit-frontend --lines 20 --nostream
fi

echo "[$(date +'%Y-%m-%d %H:%M:%S')] [FRONTEND] Deployment complete" >> ../deployment.log
