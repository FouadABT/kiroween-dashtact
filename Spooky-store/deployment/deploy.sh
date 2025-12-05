#!/bin/bash

# Dashtact Deployment Script
# Deploys full-stack app to kit.dashtact.com

set -e  # Exit on error

# Colors
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m'

# Configuration
SSH_KEY="C:/Users/fabat/Desktop/dashtact/my-ec2-key.pem"
SSH_HOST="ubuntu@ec2-13-53-218-109.eu-north-1.compute.amazonaws.com"
REMOTE_PATH="/home/ubuntu/apps/kit-dashtact"
DB_NAME="kit_dashtact_db"
DB_USER="kit_dashtact_user"
DB_PASS=$(openssl rand -base64 32 | tr -d "=+/" | cut -c1-32)

echo -e "${GREEN}================================${NC}"
echo -e "${GREEN}Dashtact Deployment Script${NC}"
echo -e "${GREEN}================================${NC}"
echo ""

# Step 1: Test SSH Connection
echo -e "${YELLOW}→ Testing SSH connection...${NC}"
ssh -i "$SSH_KEY" -o ConnectTimeout=10 "$SSH_HOST" "echo 'SSH connection successful'" || {
    echo -e "${RED}✗ SSH connection failed${NC}"
    exit 1
}
echo -e "${GREEN}✓ SSH connection successful${NC}"
echo ""

# Step 2: Create remote directory
echo -e "${YELLOW}→ Creating remote directory...${NC}"
ssh -i "$SSH_KEY" "$SSH_HOST" "mkdir -p $REMOTE_PATH/{backend,frontend}"
echo -e "${GREEN}✓ Directory created${NC}"
echo ""

# Step 3: Copy files to server
echo -e "${YELLOW}→ Copying backend files...${NC}"
scp -i "$SSH_KEY" -r backend/* "$SSH_HOST:$REMOTE_PATH/backend/"
echo -e "${GREEN}✓ Backend files copied${NC}"

echo -e "${YELLOW}→ Copying frontend files...${NC}"
scp -i "$SSH_KEY" -r frontend/* "$SSH_HOST:$REMOTE_PATH/frontend/"
echo -e "${GREEN}✓ Frontend files copied${NC}"
echo ""

# Step 4: Setup database
echo -e "${YELLOW}→ Setting up PostgreSQL database...${NC}"
ssh -i "$SSH_KEY" "$SSH_HOST" << EOF
sudo -u postgres psql -c "CREATE DATABASE $DB_NAME;" 2>/dev/null || echo "Database already exists"
sudo -u postgres psql -c "CREATE USER $DB_USER WITH PASSWORD '$DB_PASS';" 2>/dev/null || echo "User already exists"
sudo -u postgres psql -c "GRANT ALL PRIVILEGES ON DATABASE $DB_NAME TO $DB_USER;"
sudo -u postgres psql -c "ALTER DATABASE $DB_NAME OWNER TO $DB_USER;"
EOF
echo -e "${GREEN}✓ Database configured${NC}"
echo -e "${YELLOW}Database Password: $DB_PASS${NC}"
echo ""

# Step 5: Configure backend
echo -e "${YELLOW}→ Configuring backend...${NC}"
ssh -i "$SSH_KEY" "$SSH_HOST" << EOF
cd $REMOTE_PATH/backend
cat > .env << 'ENVEOF'
DATABASE_URL="postgresql://$DB_USER:$DB_PASS@localhost:5432/$DB_NAME?schema=public"
PORT=3101
NODE_ENV=production
JWT_SECRET=$(openssl rand -base64 32)
JWT_ACCESS_EXPIRATION=15m
JWT_REFRESH_EXPIRATION=7d
CORS_ORIGIN=https://kit.dashtact.com
ENVEOF

npm install
npm run prisma:generate
npm run prisma:migrate
npm run prisma:seed
npm run build
EOF
echo -e "${GREEN}✓ Backend configured and built${NC}"
echo ""

# Step 6: Configure frontend
echo -e "${YELLOW}→ Configuring frontend...${NC}"
ssh -i "$SSH_KEY" "$SSH_HOST" << EOF
cd $REMOTE_PATH/frontend
cat > .env.local << 'ENVEOF'
NEXT_PUBLIC_API_URL=https://kit.dashtact.com/api
NEXT_PUBLIC_APP_URL=https://kit.dashtact.com
NODE_ENV=production
ENVEOF

npm install
npm run build
EOF
echo -e "${GREEN}✓ Frontend configured and built${NC}"
echo ""

# Step 7: Configure PM2
echo -e "${YELLOW}→ Configuring PM2...${NC}"
ssh -i "$SSH_KEY" "$SSH_HOST" << 'EOF'
cd /home/ubuntu/apps/kit-dashtact

# Stop existing processes if any
pm2 stop kit-backend 2>/dev/null || true
pm2 stop kit-frontend 2>/dev/null || true
pm2 delete kit-backend 2>/dev/null || true
pm2 delete kit-frontend 2>/dev/null || true

# Start backend
cd backend
pm2 start dist/main.js --name kit-backend --env production

# Start frontend
cd ../frontend
pm2 start npm --name kit-frontend -- start

# Save PM2 configuration
pm2 save
EOF
echo -e "${GREEN}✓ PM2 configured and services started${NC}"
echo ""

# Step 8: Configure Nginx
echo -e "${YELLOW}→ Configuring Nginx...${NC}"
ssh -i "$SSH_KEY" "$SSH_HOST" << 'EOF'
sudo tee /etc/nginx/sites-available/kit.dashtact.com > /dev/null << 'NGINXEOF'
# HTTP - Redirect to HTTPS
server {
    listen 80;
    listen [::]:80;
    server_name kit.dashtact.com;
    return 301 https://$server_name$request_uri;
}

# HTTPS - Full-stack app
server {
    listen 443 ssl http2;
    listen [::]:443 ssl http2;
    server_name kit.dashtact.com;

    # Cloudflare Origin Certificate
    ssl_certificate /etc/ssl/cloudflare/dashtact.com.pem;
    ssl_certificate_key /etc/ssl/cloudflare/dashtact.com.key;

    # SSL Configuration
    ssl_protocols TLSv1.2 TLSv1.3;
    ssl_ciphers HIGH:!aNULL:!MD5;
    ssl_prefer_server_ciphers on;

    # Cloudflare Real IP
    set_real_ip_from 173.245.48.0/20;
    set_real_ip_from 103.21.244.0/22;
    set_real_ip_from 103.22.200.0/22;
    set_real_ip_from 103.31.4.0/22;
    set_real_ip_from 141.101.64.0/18;
    set_real_ip_from 108.162.192.0/18;
    set_real_ip_from 190.93.240.0/20;
    set_real_ip_from 188.114.96.0/20;
    set_real_ip_from 197.234.240.0/22;
    set_real_ip_from 198.41.128.0/17;
    set_real_ip_from 162.158.0.0/15;
    set_real_ip_from 104.16.0.0/13;
    set_real_ip_from 104.24.0.0/14;
    set_real_ip_from 172.64.0.0/13;
    set_real_ip_from 131.0.72.0/22;
    real_ip_header CF-Connecting-IP;

    # Frontend (Next.js)
    location / {
        proxy_pass http://localhost:3100;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_cache_bypass $http_upgrade;
    }

    # Backend API (NestJS)
    location /api {
        proxy_pass http://localhost:3101;
        proxy_http_version 1.1;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }
}
NGINXEOF

# Enable site
sudo ln -sf /etc/nginx/sites-available/kit.dashtact.com /etc/nginx/sites-enabled/

# Test and reload
sudo nginx -t && sudo systemctl reload nginx
EOF
echo -e "${GREEN}✓ Nginx configured${NC}"
echo ""

# Step 9: Verification
echo -e "${YELLOW}→ Verifying deployment...${NC}"
ssh -i "$SSH_KEY" "$SSH_HOST" << 'EOF'
echo "PM2 Processes:"
pm2 list

echo ""
echo "Nginx Status:"
sudo systemctl status nginx --no-pager | head -n 5

echo ""
echo "Backend Health:"
curl -s http://localhost:3101/api/health || echo "Backend not responding"

echo ""
echo "Frontend Health:"
curl -s -I http://localhost:3100 | head -n 1
EOF
echo ""

# Summary
echo -e "${GREEN}================================${NC}"
echo -e "${GREEN}Deployment Complete!${NC}"
echo -e "${GREEN}================================${NC}"
echo ""
echo -e "✓ Backend deployed to port 3101"
echo -e "✓ Frontend deployed to port 3100"
echo -e "✓ Database: $DB_NAME"
echo -e "✓ Database User: $DB_USER"
echo -e "✓ Database Password: ${YELLOW}$DB_PASS${NC}"
echo ""
echo -e "${YELLOW}IMPORTANT: Save the database password!${NC}"
echo ""
echo -e "Visit: ${GREEN}https://kit.dashtact.com${NC}"
echo ""
echo -e "To view logs:"
echo -e "  ssh -i \"$SSH_KEY\" $SSH_HOST"
echo -e "  pm2 logs kit-backend"
echo -e "  pm2 logs kit-frontend"
echo ""
