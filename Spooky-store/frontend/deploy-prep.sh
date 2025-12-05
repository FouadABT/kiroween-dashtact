#!/bin/bash
echo "[$(date +'%Y-%m-%d %H:%M:%S')] [FRONTEND] Starting fast frontend deployment..." >> /home/ubuntu/apps/kit-dashtact/deployment.log
pm2 stop kit-frontend
if [ -d "/home/ubuntu/apps/kit-dashtact/frontend" ]; then
  mv /home/ubuntu/apps/kit-dashtact/frontend /home/ubuntu/apps/kit-dashtact/frontend.backup.$(date +%Y%m%d_%H%M%S)
  echo "[$(date +'%Y-%m-%d %H:%M:%S')] [FRONTEND] Backed up existing frontend" >> /home/ubuntu/apps/kit-dashtact/deployment.log
fi
mkdir -p /home/ubuntu/apps/kit-dashtact/frontend
echo "[$(date +'%Y-%m-%d %H:%M:%S')] [FRONTEND] Server prepared for deployment" >> /home/ubuntu/apps/kit-dashtact/deployment.log
ls -la /home/ubuntu/apps/kit-dashtact/ | grep frontend
