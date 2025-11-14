#!/bin/bash

# Full-Stack App Server Setup Script
# Run this on your Ubuntu AWS server

set -e  # Exit on any error

echo "=================================="
echo "Full-Stack App Server Setup"
echo "=================================="
echo ""

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Function to print colored output
print_success() {
    echo -e "${GREEN}✓ $1${NC}"
}

print_error() {
    echo -e "${RED}✗ $1${NC}"
}

print_info() {
    echo -e "${YELLOW}→ $1${NC}"
}

# Check if running as root
if [ "$EUID" -eq 0 ]; then 
    print_error "Please do not run as root. Run as ubuntu user with sudo privileges."
    exit 1
fi

print_info "Starting server setup..."
echo ""

# 1. Update System
print_info "Step 1/7: Updating system packages..."
sudo apt update && sudo apt upgrade -y
print_success "System updated"
echo ""

# 2. Install Essential Build Tools
print_info "Step 2/7: Installing build essentials..."
sudo apt install -y build-essential curl wget git
print_success "Build tools installed"
echo ""

# 3. Install Node.js 20 LTS
print_info "Step 3/7: Installing Node.js 20 LTS..."
if ! command -v node &> /dev/null; then
    curl -fsSL https://deb.nodesource.com/setup_20.x | sudo -E bash -
    sudo apt install -y nodejs
    print_success "Node.js installed: $(node --version)"
else
    print_success "Node.js already installed: $(node --version)"
fi
echo ""

# 4. Install PostgreSQL
print_info "Step 4/7: Installing PostgreSQL..."
if ! command -v psql &> /dev/null; then
    sudo apt install -y postgresql postgresql-contrib
    sudo systemctl start postgresql
    sudo systemctl enable postgresql
    print_success "PostgreSQL installed and started"
else
    print_success "PostgreSQL already installed"
fi
echo ""

# 5. Install Nginx
print_info "Step 5/7: Installing Nginx..."
if ! command -v nginx &> /dev/null; then
    sudo apt install -y nginx
    sudo systemctl start nginx
    sudo systemctl enable nginx
    print_success "Nginx installed and started"
else
    print_success "Nginx already installed"
fi
echo ""

# 6. Install Certbot for SSL
print_info "Step 6/7: Installing Certbot for SSL..."
if ! command -v certbot &> /dev/null; then
    sudo apt install -y certbot python3-certbot-nginx
    print_success "Certbot installed"
else
    print_success "Certbot already installed"
fi
echo ""

# 7. Configure Firewall
print_info "Step 7/7: Configuring firewall..."
sudo ufw allow OpenSSH
sudo ufw allow 'Nginx Full'
sudo ufw --force enable
print_success "Firewall configured"
echo ""

# Create application directory
print_info "Creating application directory..."
mkdir -p ~/apps
print_success "Application directory created at ~/apps"
echo ""

# Setup PM2 startup
print_info "Configuring PM2 startup..."
pm2 startup | grep -v PM2 | bash || true
print_success "PM2 startup configured"
echo ""

# Display installation summary
echo ""
echo "=================================="
echo "Installation Summary"
echo "=================================="
echo ""
echo "✓ Node.js:     $(node --version)"
echo "✓ npm:         $(npm --version)"
echo "✓ PostgreSQL:  $(psql --version | head -n1)"
echo "✓ Nginx:       $(nginx -v 2>&1)"
echo "✓ PM2:         $(pm2 --version)"
echo "✓ Certbot:     $(certbot --version | head -n1)"
echo ""
echo "=================================="
echo "Next Steps"
echo "=================================="
echo ""
echo "1. Configure PostgreSQL database"
echo "2. Clone your repository to ~/apps"
echo "3. Set up environment variables"
echo "4. Install dependencies and build"
echo "5. Configure PM2 processes"
echo "6. Configure Nginx reverse proxy"
echo "7. Set up SSL certificate"
echo ""
echo "Run the configuration script when ready!"
echo ""
