# Ubuntu Server Setup Guide

## Current Status
✅ PM2 installed successfully

## Quick Setup Commands

### 1. Run the Setup Script

Copy the `server-setup.sh` script to your server and run it:

```bash
# On your Ubuntu server
chmod +x server-setup.sh
./server-setup.sh
```

This will install:
- Build essentials (gcc, make, etc.)
- Node.js 20 LTS
- PostgreSQL
- Nginx
- Certbot (for SSL)
- Configure firewall (UFW)

### 2. Manual Installation (Alternative)

If you prefer manual installation, run these commands:

```bash
# Update system
sudo apt update && sudo apt upgrade -y

# Install build tools
sudo apt install -y build-essential curl wget git

# Install Node.js 20 LTS
curl -fsSL https://deb.nodesource.com/setup_20.x | sudo -E bash -
sudo apt install -y nodejs

# Install PostgreSQL
sudo apt install -y postgresql postgresql-contrib
sudo systemctl start postgresql
sudo systemctl enable postgresql

# Install Nginx
sudo apt install -y nginx
sudo systemctl start nginx
sudo systemctl enable nginx

# Install Certbot
sudo apt install -y certbot python3-certbot-nginx

# Configure firewall
sudo ufw allow OpenSSH
sudo ufw allow 'Nginx Full'
sudo ufw --force enable

# Setup PM2 startup
pm2 startup
# Copy and run the command it outputs

# Create app directory
mkdir -p ~/apps
```

## Verification Commands

After installation, verify everything is working:

```bash
# Check Node.js
node --version    # Should show v20.x.x
npm --version     # Should show 10.x.x

# Check PostgreSQL
sudo systemctl status postgresql
psql --version

# Check Nginx
sudo systemctl status nginx
nginx -v

# Check PM2
pm2 --version

# Check Certbot
certbot --version

# Check firewall
sudo ufw status
```

## What's Installed

### Node.js 20 LTS
- Runtime for both backend (NestJS) and frontend (Next.js)
- npm package manager included

### PostgreSQL
- Database server for your application
- Running on default port 5432
- Auto-starts on boot

### Nginx
- Web server and reverse proxy
- Will serve frontend and proxy API requests
- Running on ports 80 (HTTP) and 443 (HTTPS)

### PM2
- Process manager for Node.js apps
- Keeps apps running 24/7
- Auto-restart on crashes
- Configured to start on boot

### Certbot
- Free SSL/TLS certificates from Let's Encrypt
- Auto-renewal configured

### UFW Firewall
- Allows SSH (port 22)
- Allows HTTP (port 80)
- Allows HTTPS (port 443)
- Blocks all other incoming traffic

## Server Architecture

```
Internet
    ↓
Nginx (Port 80/443)
    ↓
    ├─→ Frontend (Next.js) - Port 3000 (PM2)
    └─→ Backend API (NestJS) - Port 3001 (PM2)
            ↓
        PostgreSQL (Port 5432)
```

## Next Phase: Configuration

Once setup is complete, you'll need to:

1. **Configure PostgreSQL**
   - Create database
   - Create user with password
   - Grant permissions

2. **Clone Repository**
   - Clone your app to ~/apps
   - Set up Git credentials if private repo

3. **Environment Variables**
   - Create production .env files
   - Set database credentials
   - Set JWT secrets
   - Configure CORS origins

4. **Build Applications**
   - Install dependencies
   - Run Prisma migrations
   - Build backend and frontend

5. **PM2 Configuration**
   - Create ecosystem.config.js
   - Start both apps with PM2
   - Save PM2 configuration

6. **Nginx Configuration**
   - Configure reverse proxy
   - Set up domain routing
   - Enable gzip compression

7. **SSL Certificate**
   - Run Certbot for your domain
   - Auto-renewal setup

## Troubleshooting

### If Node.js installation fails:
```bash
# Remove existing Node.js
sudo apt remove nodejs npm
# Clean up
sudo apt autoremove
# Try installation again
```

### If PostgreSQL won't start:
```bash
# Check logs
sudo journalctl -u postgresql
# Restart service
sudo systemctl restart postgresql
```

### If Nginx won't start:
```bash
# Check configuration
sudo nginx -t
# Check logs
sudo tail -f /var/log/nginx/error.log
```

### If firewall blocks connections:
```bash
# Check firewall status
sudo ufw status verbose
# Allow specific port if needed
sudo ufw allow 3000
```

## Security Notes

- Change default PostgreSQL password
- Use strong JWT secrets in production
- Keep system updated: `sudo apt update && sudo apt upgrade`
- Monitor logs regularly
- Set up automated backups for database
- Use environment variables for secrets (never commit to Git)

## Ready for Configuration?

Once this setup is complete, let me know and I'll provide the configuration scripts for:
- PostgreSQL database setup
- Application deployment
- PM2 process configuration
- Nginx reverse proxy setup
- SSL certificate installation
