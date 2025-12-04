#!/bin/bash
cd /home/ubuntu/apps/kit-dashtact/frontend

# Unzip deployment package
echo "[$(date +'%Y-%m-%d %H:%M:%S')] [FRONTEND] Extracting deployment package..." >> ../deployment.log
unzip -q frontend-deploy-20251110_174459.zip
rm frontend-deploy-20251110_174459.zip

# Copy production environment
cp .env.production .env.local

# Log config verification
echo "[$(date +'%Y-%m-%d %H:%M:%S')] [FRONTEND] Config files:" >> ../deployment.log
ls -la tailwind.config.js postcss.config.mjs next.config.ts >> ../deployment.log 2>&1

# Install production dependencies only
echo "[$(date +'%Y-%m-%d %H:%M:%S')] [FRONTEND] Installing dependencies..." >> ../deployment.log
npm install --production --no-optional >> ../deployment.log 2>&1

# Restart PM2 process
echo "[$(date +'%Y-%m-%d %H:%M:%S')] [FRONTEND] Restarting PM2 process..." >> ../deployment.log
pm2 restart kit-frontend || pm2 start npm --name kit-frontend -- start
pm2 save

# Health check
sleep 3
if curl -f -I http://localhost:3100 > /dev/null 2>&1; then
  echo "[$(date +'%Y-%m-%d %H:%M:%S')] [FRONTEND] ✅ Frontend deployed successfully" >> ../deployment.log
  echo "✅ DEPLOYMENT SUCCESSFUL"
else
  echo "[$(date +'%Y-%m-%d %H:%M:%S')] [FRONTEND] ❌ Frontend health check failed" >> ../deployment.log
  echo "❌ DEPLOYMENT FAILED - Rolling back..."
  # Rollback
  pm2 stop kit-frontend
  cd /home/ubuntu/apps/kit-dashtact
  rm -rf frontend
  mv frontend.backup.20251110_164853 frontend
  cd frontend
  pm2 start npm --name kit-frontend -- start
  echo "[$(date +'%Y-%m-%d %H:%M:%S')] [FRONTEND] ❌ Rolled back to previous version" >> ../deployment.log
fi

# Cleanup old backups (keep last 3)
cd /home/ubuntu/apps/kit-dashtact
ls -dt frontend.backup.* 2>/dev/null | tail -n +4 | xargs rm -rf 2>/dev/null

echo "[$(date +'%Y-%m-%d %H:%M:%S')] [FRONTEND] Deployment complete" >> deployment.log
