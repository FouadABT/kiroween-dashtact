#!/bin/bash

# PostgreSQL Database Setup Script for kit.dashtact.com
# Run this on your Ubuntu server

set -e

echo "=================================="
echo "PostgreSQL Database Setup"
echo "=================================="
echo ""

# Generate secure password
DB_PASS=$(openssl rand -base64 32 | tr -d "=+/" | cut -c1-32)

echo "Generated secure password: $DB_PASS"
echo ""
echo "⚠️  SAVE THIS PASSWORD! You'll need it for the .env file"
echo ""

# Create database and user
echo "Creating database and user..."
sudo -u postgres psql << EOF
-- Create database
CREATE DATABASE kit_dashtact_db;

-- Create user with password
CREATE USER kit_dashtact_user WITH ENCRYPTED PASSWORD '$DB_PASS';

-- Grant all privileges
GRANT ALL PRIVILEGES ON DATABASE kit_dashtact_db TO kit_dashtact_user;

-- Make user the owner
ALTER DATABASE kit_dashtact_db OWNER TO kit_dashtact_user;

-- Grant schema permissions (PostgreSQL 15+)
\c kit_dashtact_db
GRANT ALL ON SCHEMA public TO kit_dashtact_user;
GRANT ALL PRIVILEGES ON ALL TABLES IN SCHEMA public TO kit_dashtact_user;
GRANT ALL PRIVILEGES ON ALL SEQUENCES IN SCHEMA public TO kit_dashtact_user;
ALTER DEFAULT PRIVILEGES IN SCHEMA public GRANT ALL ON TABLES TO kit_dashtact_user;
ALTER DEFAULT PRIVILEGES IN SCHEMA public GRANT ALL ON SEQUENCES TO kit_dashtact_user;

\q
EOF

echo ""
echo "✓ Database created successfully!"
echo ""

# Verify
echo "Verifying database..."
sudo -u postgres psql -l | grep kit_dashtact

echo ""
echo "Verifying user..."
sudo -u postgres psql -c "\du" | grep kit_dashtact

echo ""
echo "=================================="
echo "Setup Complete!"
echo "=================================="
echo ""
echo "Database Name: kit_dashtact_db"
echo "Database User: kit_dashtact_user"
echo "Database Password: $DB_PASS"
echo ""
echo "⚠️  IMPORTANT: Save this password!"
echo ""
echo "Connection string for .env:"
echo "DATABASE_URL=\"postgresql://kit_dashtact_user:$DB_PASS@localhost:5432/kit_dashtact_db?schema=public\""
echo ""
echo "Test connection:"
echo "psql -U kit_dashtact_user -d kit_dashtact_db -h localhost"
echo ""
