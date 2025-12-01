# 🚀 Full-Stack Starter Kit - Setup Guide

## Overview

This professional setup CLI helps you configure your full-stack application with:
- ✅ Automated database connection testing
- ✅ PostgreSQL detection and validation
- ✅ Database creation (if needed)
- ✅ Environment-specific configuration (dev/production)
- ✅ Feature flag management
- ✅ Automated migrations and seeding
- ✅ Production security checklist

## Quick Start

```bash
node setup-cli.js
```

The interactive wizard will guide you through the entire setup process.

## Prerequisites

### Required
- **Node.js** (v16 or higher) - [Download](https://nodejs.org/)
- **npm** (comes with Node.js)
- **PostgreSQL** (v12 or higher) - [Download](https://www.postgresql.org/download/)

### Optional
- **psql** command-line tool (for database validation)
- **Git** (for version control)

## Setup Process

### Step 1: Environment Verification

Comprehensive environment check that verifies:

**Required Components**:
- ✅ **Node.js** (v18+ recommended)
- ✅ **npm** package manager
- ✅ **Backend structure** (NestJS, Prisma)
- ✅ **Frontend structure** (Next.js, React)

**Optional Components**:
- ⚠️ **PostgreSQL** client (can use cloud/Docker alternative)

**What Happens**:
1. Checks Node.js version (warns if < v18)
2. Verifies npm is installed
3. Detects PostgreSQL installation
4. Validates backend dependencies (NestJS, Prisma)
5. Validates frontend dependencies (Next.js, React)
6. Provides recommendations if issues found

**PostgreSQL Options**:
If PostgreSQL is not detected locally, you have several options:
- **Install Locally**: https://www.postgresql.org/download/
- **Cloud Services**: 
  - Supabase (https://supabase.com) - Free tier available
  - Railway (https://railway.app) - Easy deployment
  - Neon (https://neon.tech) - Serverless Postgres
  - AWS RDS - Production-grade
- **Docker**: `docker run -p 5432:5432 -e POSTGRES_PASSWORD=password postgres`
- **Continue Setup**: Configure database connection later

**Error Handling**:
- ❌ **Critical Errors**: Missing Node.js, npm, or project files
  - Setup will ask if you want to continue (not recommended)
- ⚠️ **Warnings**: Missing PostgreSQL or outdated versions
  - Setup can continue with recommendations

### Step 2: Environment Selection

Choose your target environment:

#### Development Mode
- Local development with debug features
- Detailed error messages
- Hot reload enabled
- Default credentials provided

#### Production Mode
- Optimized for deployment
- Security warnings and checklist
- SSL enforcement recommendations
- Strong password requirements

### Step 3: Database Configuration

Three options available:

#### Option 1: Use Existing DATABASE_URL
- Reads from `backend/.env` file
- Tests connection automatically
- Validates database accessibility

#### Option 2: Enter New Connection Details
Interactive prompts for:
- **Host**: Database server address (default: `localhost`)
- **Port**: Database port (default: `5432`)
- **User**: Database username (default: `postgres`)
- **Password**: Database password (required)
- **Database Name**: Target database (default: `myapp`)

The CLI will:
1. ✅ Build connection string
2. ✅ Test connection
3. ✅ Check if database exists
4. ✅ Offer to create database if missing
5. ✅ Update `.env` file automatically

#### Option 3: Skip Configuration
- Manual configuration required later
- Useful for custom setups or remote databases

### Step 4: Feature Selection

Choose from pre-configured profiles:

### Step 5: Theme Configuration

Choose the default theme mode for your application:

**Theme Mode Options**:
1. **System (Auto)** - Follows user's OS preference (Recommended)
2. **Light** - Always uses light theme
3. **Dark** - Always uses dark theme

**How It Works**:
- The selected theme mode is set as the global default
- Users can override this in their personal settings
- System mode automatically switches between light/dark based on OS preference

**Database Storage**:
- Stored in `settings` table
- Field: `themeMode` (values: `'system'`, `'light'`, `'dark'`)
- Scope: `'global'` (applies to all users by default)

### Step 6: Branding Configuration

Optional step to configure your brand identity:

**What You Can Configure**:
- **Brand Name**: Your company or application name (default: "Dashboard")
- **Tagline**: Short slogan or tagline (optional)
- **Description**: Longer description of your application (optional)
- **Website URL**: Your company website (optional)
- **Support Email**: Support contact email (optional)

**What's Not Configured Here**:
- Logos (light/dark theme)
- Favicon
- Social media links

**Note**: Logos and favicon can be uploaded later from:
```
Dashboard → Settings → Branding
```

**Skip Option**: You can skip this step and configure branding later from the dashboard.

## About This Skeleton/Template

This is a **full-stack application SKELETON/TEMPLATE** - your foundation for building custom applications. Think of it as the bones of your application, providing the core structure while you add the unique features.

### 🏗️ What is a Skeleton/Template?

A **skeleton** or **template** is:
- ✅ A pre-built foundation with core architecture in place
- ✅ The structural framework ready for customization
- ✅ Not a finished product - it's YOUR starting point
- ✅ The bones of your app - you add the muscles and skin
- ✅ A solid base that saves months of development time

**What's Already Built (The Skeleton)**:
- 🦴 Authentication & authorization system
- 🦴 Database schema and ORM setup
- 🦴 API architecture and routing
- 🦴 Frontend components and layouts
- 🦴 Theme system and styling
- 🦴 Security and best practices

**What You Build (The Flesh)**:
- 💪 Your unique business logic
- 💪 Custom features and workflows
- 💪 Specific integrations
- 💪 Your brand and design
- 💪 Domain-specific functionality

**Key Benefits**:
- 🎯 Pre-configured skeleton profiles for common use cases
- 🔧 Fully customizable - extend the skeleton infinitely
- 📦 Modular architecture - add only what you need
- 🚀 Production-ready foundation with best practices
- ✨ **Powered by Kiro AI** - Your intelligent development partner
- 🏗️ **Skeleton approach** - Structure done, creativity unlimited

## ✨ Flesh Out Your Skeleton with Kiro AI

After setup, leverage **Kiro AI** to build on top of this skeleton/template:

- 🏗️ **Build on the Foundation**: The skeleton is ready - now add your unique features
- 🤖 **Add Custom Features**: Ask Kiro to build features specific to your business needs
- 🎨 **Customize the Template**: Modify designs, workflows, and functionality with AI assistance
- 🔧 **Extend the Skeleton**: Go beyond the base structure - build exactly what you envision
- 💡 **Intelligent Suggestions**: Get smart recommendations for architecture and best practices
- ⚡ **Rapid Development**: Generate code, fix bugs, and implement features faster
- 🎯 **No Limitations**: This skeleton is your canvas - Kiro helps you paint your masterpiece

**Example: Transforming the Skeleton with Kiro**:
- "Add a booking system with calendar integration"
- "Create a custom reporting dashboard with charts"
- "Implement multi-tenant architecture for my SaaS"
- "Add real-time chat between users"
- "Build a custom workflow automation system"
- "Integrate with third-party APIs (Stripe, Twilio, SendGrid)"
- "Add a ticketing system for customer support"
- "Create a custom analytics dashboard"
- "Build a project management module"
- "Add inventory tracking with barcode scanning"

**The skeleton provides the structure - you provide the vision!** 🚀

### 🦴 Skeleton vs Complete Application

**This Template Provides (The Skeleton)**:
- ✅ Authentication system (login, register, JWT)
- ✅ Database structure (Prisma + PostgreSQL)
- ✅ API architecture (NestJS REST endpoints)
- ✅ Frontend framework (Next.js 14 + React)
- ✅ UI components (shadcn/ui)
- ✅ Theme system (light/dark mode)
- ✅ Permission system (RBAC)
- ✅ Basic CRUD operations

**You Build (The Flesh)**:
- 💪 Your specific business logic
- 💪 Custom workflows and processes
- 💪 Unique features for your industry
- 💪 Third-party integrations
- 💪 Custom reports and analytics
- 💪 Specialized user interfaces
- 💪 Domain-specific functionality
- 💪 Your competitive advantages

**With Kiro AI, transforming this skeleton into a complete application is fast and easy!**

Choose from pre-configured profiles:

#### 1. E-commerce Store
Perfect for online retail businesses:

**Features**:
- ✅ Landing page
- ✅ E-commerce (products, orders, payments, shipping)
- ✅ Notifications
- ✅ Customer accounts
- ❌ Blog
- ❌ Calendar
- ❌ CRM

**Real-World Use Cases**:
- Online shop or boutique
- Marketplace platform
- Dropshipping store
- Retail e-commerce site
- Digital products store

#### 2. CRM & Business Management
Customer relationship management system:

**Features**:
- ✅ Landing page
- ✅ Calendar & scheduling
- ✅ CRM (contacts, companies, deals)
- ✅ Notifications
- ❌ Blog
- ❌ E-commerce
- ❌ Customer accounts

**Real-World Use Cases**:
- Sales CRM system
- Client management portal
- Service business dashboard
- Consulting firm platform
- Agency management tool

#### 3. Full-Stack Platform
Everything enabled for maximum flexibility:

**Features**:
- ✅ All features available
- ✅ Maximum functionality
- ✅ Complete toolkit

**Real-World Use Cases**:
- SaaS platform
- Enterprise portal
- Multi-purpose dashboard
- Agency website with all services
- Complex business application

**Note**: Larger bundle size due to all features being enabled.

#### 4. Minimal Dashboard
Core features only for lightweight applications:

**Features**:
- ✅ Dashboard
- ✅ Authentication & authorization
- ✅ Notifications
- ❌ All optional features

**Real-World Use Cases**:
- Admin panel
- Internal company tool
- Simple backend dashboard
- MVP project
- Lightweight management system

## Customization

**Important**: All profiles are starting points. You can:
- ✅ Enable/disable features anytime by editing `.env` files
- ✅ Add custom features specific to your use case
- ✅ Mix and match features as needed
- ✅ Extend with your own modules

**Example**: Start with "Minimal" and add e-commerce later when you're ready.

### Step 7: Environment Files Update

Automatically updates:
- `backend/.env` or `backend/.env.production`
- `frontend/.env.local`

With:
- Database connection string
- Feature flags
- Environment-specific settings

### Step 8: Dependencies Installation

Optional npm install for:
- Backend dependencies (`backend/package.json`)
- Frontend dependencies (`frontend/package.json`)

Skip if you prefer to install manually or use different package managers (yarn, pnpm).

### Step 9: Database Initialization

If database connection is successful:

#### For New Databases
1. Generate Prisma client
2. Deploy migrations
3. Create all tables and schemas

#### For Existing Databases
Choose between:
- **Reset**: Delete all data and recreate (⚠️ destructive)
- **Migrate**: Apply new migrations only (safe)

### Step 10: Database Seeding

Optional seeding with:
- Admin user account
- Sample data (based on enabled features)
- Initial configuration
- **Theme mode** (from Step 5)
- **Branding settings** (from Step 6)

The theme mode and branding data you configured will be automatically inserted into the database during seeding.

Feature-specific seed data:
- Admin user account
- Sample data (based on enabled features)
- Initial configuration

- **E-commerce**: Products, categories, orders
- **Blog**: Sample posts and categories
- **CRM**: Sample contacts and companies
- **Calendar**: Sample events

### Step 11: Production Security Checklist

For production deployments, the CLI reminds you to:
- ☐ Change JWT_SECRET (min 64 characters)
- ☐ Update DATABASE_URL with production credentials
- ☐ Enable SSL for database connections
- ☐ Set CORS_ORIGIN to production domain
- ☐ Review and update all passwords
- ☐ Enable audit logging
- ☐ Set NODE_ENV=production
- ☐ Configure rate limiting
- ☐ Set up SSL certificates
- ☐ Configure backup strategy

## Database Connection Formats

### Local PostgreSQL
```
postgresql://postgres:password@localhost:5432/myapp?schema=public
```

### Remote PostgreSQL
```
postgresql://user:password@db.example.com:5432/database?schema=public
```

### With SSL (Production)
```
postgresql://user:password@db.example.com:5432/database?schema=public&sslmode=require
```

### Cloud Providers

#### Heroku
```
postgres://user:password@host.compute.amazonaws.com:5432/database
```

#### DigitalOcean
```
postgresql://user:password@host.db.ondigitalocean.com:25060/database?sslmode=require
```

#### AWS RDS
```
postgresql://user:password@instance.region.rds.amazonaws.com:5432/database
```

#### Supabase
```
postgresql://postgres:password@db.project.supabase.co:5432/postgres
```

## Manual Database Setup

If you prefer manual setup or the CLI fails:

### 1. Create Database
```bash
# Connect to PostgreSQL
psql -U postgres

# Create database
CREATE DATABASE myapp;

# Create user (optional)
CREATE USER myuser WITH PASSWORD 'mypassword';

# Grant privileges
GRANT ALL PRIVILEGES ON DATABASE myapp TO myuser;

# Exit
\q
```

### 2. Update Environment File
Edit `backend/.env`:
```env
DATABASE_URL="postgresql://myuser:mypassword@localhost:5432/myapp?schema=public"
```

### 3. Run Migrations
```bash
cd backend
npx prisma generate
npx prisma migrate deploy
```

### 4. Seed Database
```bash
npm run prisma:seed
```

## Troubleshooting

### PostgreSQL Not Found
**Error**: `PostgreSQL client not detected`

**Solutions**:
1. Install PostgreSQL: https://www.postgresql.org/download/
2. Add PostgreSQL to PATH
3. Use remote database (skip local check)

### Connection Failed
**Error**: `Database connection failed`

**Check**:
1. PostgreSQL service is running
2. Credentials are correct
3. Database exists
4. Firewall allows connection
5. Port 5432 is not blocked

**Test manually**:
```bash
psql -h localhost -p 5432 -U postgres -d myapp
```

### Database Does Not Exist
**Error**: `Database "myapp" does not exist`

**Solutions**:
1. Let CLI create it automatically
2. Create manually (see Manual Database Setup)

### Migration Failed
**Error**: `Database migration failed`

**Solutions**:
1. Check database connection
2. Verify Prisma schema is valid
3. Try `npx prisma db push` instead
4. Reset database: `npx prisma migrate reset`

### Permission Denied
**Error**: `permission denied for database`

**Solutions**:
1. Grant proper privileges to user
2. Use superuser account (postgres)
3. Check database ownership

### Port Already in Use
**Error**: `Port 3001 already in use`

**Solutions**:
1. Stop existing backend process
2. Change PORT in `.env`
3. Kill process: `lsof -ti:3001 | xargs kill`

## Environment Variables Reference

### Backend (.env)

#### Database
```env
DATABASE_URL="postgresql://user:password@host:5432/database?schema=public"
```

#### Application
```env
PORT=3001
NODE_ENV=development
APP_URL=http://localhost:3001
```

#### JWT Authentication
```env
JWT_SECRET=your-secret-key-min-64-chars
JWT_ACCESS_EXPIRATION=15m
JWT_REFRESH_EXPIRATION=7d
JWT_ISSUER=your-app-name
JWT_AUDIENCE=your-app-users
```

#### Security
```env
BCRYPT_ROUNDS=10
ENABLE_AUDIT_LOGGING=true
ACCOUNT_LOCKOUT_ENABLED=false
ACCOUNT_LOCKOUT_MAX_ATTEMPTS=5
ACCOUNT_LOCKOUT_DURATION=900
```

#### Feature Flags
```env
ENABLE_LANDING=true
ENABLE_BLOG=true
ENABLE_ECOMMERCE=true
ENABLE_CALENDAR=true
ENABLE_CRM=true
ENABLE_NOTIFICATIONS=true
ENABLE_CUSTOMER_ACCOUNT=true
```

#### CORS
```env
CORS_ORIGIN=http://localhost:3000
```

### Frontend (.env.local)

```env
NEXT_PUBLIC_API_URL=http://localhost:3001
NEXT_PUBLIC_APP_URL=http://localhost:3000
NODE_ENV=development

# Feature Flags (must match backend)
NEXT_PUBLIC_ENABLE_LANDING=true
NEXT_PUBLIC_ENABLE_BLOG=true
NEXT_PUBLIC_ENABLE_ECOMMERCE=true
NEXT_PUBLIC_ENABLE_CALENDAR=true
NEXT_PUBLIC_ENABLE_CRM=true
NEXT_PUBLIC_ENABLE_NOTIFICATIONS=true
NEXT_PUBLIC_ENABLE_CUSTOMER_ACCOUNT=true
```

## Post-Setup Tasks

### 1. Start Development Servers

**Backend**:
```bash
cd backend
npm run start:dev
```

**Frontend** (in another terminal):
```bash
cd frontend
npm run dev
```

### 2. Access Application
Open browser: http://localhost:3000

### 3. Default Credentials (Development)
```
Email: admin@dashtact.com
Password: dashtact
```

⚠️ **Change immediately after first login!**

### 4. Verify Setup
- ✅ Login works
- ✅ Dashboard loads
- ✅ Features are enabled/disabled correctly
- ✅ Database operations work

## Useful Commands

### Database Management
```bash
# View database in browser
npx prisma studio

# Generate Prisma client
npx prisma generate

# Create new migration
npx prisma migrate dev --name migration_name

# Apply migrations
npx prisma migrate deploy

# Reset database (⚠️ deletes all data)
npx prisma migrate reset

# Seed database
npm run prisma:seed

# Check migration status
npx prisma migrate status
```

### Development
```bash
# Backend development
cd backend && npm run start:dev

# Frontend development
cd frontend && npm run dev

# Run tests
cd backend && npm test

# Build for production
cd backend && npm run build
cd frontend && npm run build
```

### Production
```bash
# Start production backend
cd backend && npm run start

# Start production frontend
cd frontend && npm run start
```

## Security Best Practices

### Development
- ✅ Use `.env` files (never commit)
- ✅ Keep dependencies updated
- ✅ Use strong local passwords
- ✅ Enable audit logging

### Production
- ✅ Use environment variables (not files)
- ✅ Enable SSL/TLS everywhere
- ✅ Use strong, unique secrets (min 64 chars)
- ✅ Enable rate limiting
- ✅ Configure CORS properly
- ✅ Use database connection pooling
- ✅ Enable audit logging
- ✅ Set up monitoring and alerts
- ✅ Regular backups
- ✅ Keep all dependencies updated

## Support

### Documentation
- `README.md` - Project overview
- `backend/README.md` - Backend documentation
- `frontend/README.md` - Frontend documentation
- `documentation/` - Additional guides

### Common Issues
Check the Troubleshooting section above for solutions to common problems.

### Need Help?
1. Check documentation
2. Review error messages carefully
3. Test database connection manually
4. Verify environment variables
5. Check logs for detailed errors

## Next Steps

After successful setup:
1. ✅ Explore the dashboard
2. ✅ Review enabled features
3. ✅ Customize branding and theme
4. ✅ Configure email settings (if needed)
5. ✅ Set up additional users
6. ✅ Review security settings
7. ✅ Start building your application!

---

**Happy coding! 🚀**
