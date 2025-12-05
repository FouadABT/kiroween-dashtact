#!/bin/bash
# Fix Nginx API routing for kit.dashtact.com

# Backup current config
sudo cp /etc/nginx/sites-available/kit.dashtact.com /etc/nginx/sites-available/kit.dashtact.com.backup

# Create new API location block
sudo tee /tmp/nginx-api-fix.conf > /dev/null << 'EOF'
    # Backend API (NestJS) - Port 3101
    location /api/ {
        rewrite ^/api/(.*) /$1 break;
        proxy_pass http://localhost:3101;
        proxy_http_version 1.1;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_set_header CF-Connecting-IP $http_cf_connecting_ip;

        # Timeouts for API
        proxy_connect_timeout 60s;
        proxy_send_timeout 60s;
        proxy_read_timeout 60s;
    }
EOF

# Replace the location /api block
sudo sed -i '/# Backend API (NestJS)/,/^    }$/d' /etc/nginx/sites-available/kit.dashtact.com
sudo sed -i '/# Frontend (Next.js)/i\' /etc/nginx/sites-available/kit.dashtact.com
sudo sed -i '/# Frontend (Next.js)/r /tmp/nginx-api-fix.conf' /etc/nginx/sites-available/kit.dashtact.com

# Test and reload
sudo nginx -t && sudo systemctl reload nginx

echo "Nginx configuration updated!"
