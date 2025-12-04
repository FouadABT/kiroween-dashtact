#!/bin/bash
set -e

echo "[$(date +'%Y-%m-%d %H:%M:%S')] [FRONTEND] Starting clean deployment..." >> /home/ubuntu/apps/kit-dashtact/deployment.log

# Clean up PM2 processes
pm2 delete kit-frontend 2>/dev/null || true
pm2 save --force

# Remove old frontend directory
rm -rf /home/ubuntu/apps/kit-dashtact/frontend

# Create fresh directory
mkdir -p /home/ubuntu/apps/kit-dashtact/frontend
cd /home/ubuntu/apps/kit-dashtact/frontend

echo "[$(date +'%Y-%m-%d %H:%M:%S')] [FRONTEND] Directory prepared" >> ../deployment.log
