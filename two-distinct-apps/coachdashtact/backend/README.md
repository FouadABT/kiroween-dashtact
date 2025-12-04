# Backend - NestJS API

> **Part of the Full-Stack Dashboard Skeleton Template**

A production-ready NestJS backend with PostgreSQL, Prisma ORM, JWT authentication, WebSocket support, and 30+ feature modules.

## 🛠️ Tech Stack

- **Framework**: NestJS (Node.js + TypeScript)
- **Database**: PostgreSQL 14+
- **ORM**: Prisma
- **Authentication**: JWT + bcrypt
- **Real-time**: WebSocket (Socket.io)
- **Email**: Nodemailer
- **Validation**: class-validator + class-transformer
- **File Upload**: Multer
- **Config**: @nestjs/config
- **HTTP Server**: Express

## 📁 Project Structure

```
backend/
├── src/
│   ├── auth/                  # JWT authentication
│   ├── users/                 # User management
│   ├── permissions/           # RBAC system
│   ├── roles/                 # Role management
│   ├── products/              # E-commerce products
│   ├── orders/                # Order management
│   ├── customers/             # Customer management
│   ├── cart/                  # Shopping cart
│   ├── checkout/              # Checkout process
│   ├── blog/                  # Blog system
│   ├── pages/                 # Custom pages
│   ├── landing/               # Landing page CMS
│   ├── calendar/              # Event scheduling
│   ├── notifications/         # Notification system
│   ├── messaging/             # Direct messaging
│   ├── members/               # Coaching members
│   ├── media/                 # Media library
│   ├── email/                 # Email system
│   ├── branding/              # Branding settings
│   ├── menus/                 # Menu management
│   ├── search/                # Global search
│   ├── activity-log/          # Activity tracking
│   ├── cron-jobs/             # Scheduled tasks
│   ├── feature-flags/         # Feature toggles
│   ├── legal-pages/           # Terms & Privacy
│   ├── prisma/                # Prisma service
│   ├── common/                # Shared utilities
│   │   ├── guards/           # Auth guards
│   │   ├── decorators/       # Custom decorators
│   │   ├── filters/          # Exception filters
│   │   └── interceptors/     # Response interceptors
│   ├── config/                # Configuration
│   ├── app.module.ts          # Root module
│   └── main.ts                # Application entry
├── prisma/
│   ├── schema.prisma          # Database schema
│   ├── migrations/            # Database migrations
│   └── seed-data/             # Seed data files
├── test/                      # E2E tests
├── .env                       # Environment variables
├── .env.example               # Environment template
├── nest-cli.json              # NestJS CLI config
├── tsconfig.json              # TypeScript config
└── package.json               # Dependencies
```

## 🚀 Getting Started

### Prerequisites

- Node.js 18+
- PostgreSQL 14+
- npm or yarn

### Installation

1. **Install Dependencies:**
```bash
npm install
```

2. **Configure Environment:**
```bash
# Copy example environment file
cp .env.example .env

# Edit .env with your database credentials
```

3. **Database Setup:**
```bash
# Generate Prisma client
npm run prisma:generate

# Run migrations
npm run prisma:migrate

# Seed database (optional)
npm run prisma:seed
```

4. **Start Development Server:**
```bash
npm run start:dev
```

The API will be available at `http://localhost:3001`

## 📚 Available Scripts

### Development
```bash
npm run start:dev          # Start with hot reload
npm run start:debug        # Start with debugging
npm run start:prod         # Start production build
```

### Database
```bash
npm run prisma:generate    # Generate Prisma client
npm run prisma:migrate     # Run migrations
npm run prisma:seed        # Seed database
npm run prisma:studio      # Open Prisma Studio
npm run prisma:reset       # Reset database (⚠️ deletes all data)
```

### Build & Test
```bash
npm run build              # Build for production
npm run test               # Run unit tests
npm run test:watch         # Run tests in watch mode
npm run test:cov           # Run tests with coverage
npm run test:e2e           # Run E2E tests
```

### Code Quality
```bash
npm run lint               # Run ESLint
npm run format             # Format code with Prettier
```

## 🔧 Configuration

### Environment Variables

Create a `.env` file in the backend directory:

```env
# Database
DATABASE_URL="postgresql://user:password@localhost:5432/dbname?schema=public"

# Application
PORT=3001
NODE_ENV=development
APP_URL=http://localhost:3001
FRONTEND_URL=http://localhost:3000

# JWT Authentication
JWT_SECRET=your-secret-key-min-64-chars
JWT_ACCESS_EXPIRATION=15m
JWT_REFRESH_EXPIRATION=7d
JWT_ISSUER=dashboard-app
JWT_AUDIENCE=dashboard-users

# Security
BCRYPT_ROUNDS=10
CORS_ORIGIN=http://localhost:3000

# Feature Flags
ENABLE_LANDING=true
ENABLE_BLOG=true
ENABLE_ECOMMERCE=true
ENABLE_CALENDAR=true
ENABLE_CRM=true
ENABLE_NOTIFICATIONS=true
ENABLE_CUSTOMER_ACCOUNT=true

# Email (optional)
SMTP_HOST=smtp.example.com
SMTP_PORT=587
SMTP_USER=your-email@example.com
SMTP_PASSWORD=your-password
SMTP_FROM=noreply@example.com
EMAIL_ENCRYPTION_KEY=your-encryption-key-min-32-chars

# Rate Limiting
RATE_LIMIT_TTL=900
RATE_LIMIT_MAX=100

# Audit Logging
ENABLE_AUDIT_LOGGING=true
ACTIVITY_LOG_ENABLED=true
```

## 🏗️ Architecture

### Module Structure

Each feature is organized as a NestJS module:

```
feature/
├── feature.module.ts      # Module definition
├── feature.controller.ts  # HTTP endpoints
├── feature.service.ts     # Business logic
├── feature.gateway.ts     # WebSocket gateway (if needed)
├── dto/                   # Data transfer objects
│   ├── create-feature.dto.ts
│   └── update-feature.dto.ts
└── entities/              # TypeScript entities (optional)
```

### Database Schema

The Prisma schema includes 50+ models:
- User management (User, Role, Permission)
- E-commerce (Product, Order, Customer, Cart)
- Content (BlogPost, Page, LandingPage)
- Communication (Notification, Message, Conversation)
- Scheduling (CalendarEvent, Reminder)
- Coaching (Member, CoachProfile, Session)
- And more...

### Authentication Flow

1. User logs in with email/password
2. Backend validates credentials
3. JWT access token (15min) and refresh token (7d) issued
4. Access token used for API requests
5. Refresh token used to get new access token

### Authorization

Role-Based Access Control (RBAC):
- Permissions defined in database
- Roles have multiple permissions
- Users assigned to roles
- Guards check permissions on routes

## 🔌 API Endpoints

### Authentication
- `POST /auth/login` - User login
- `POST /auth/register` - User registration
- `POST /auth/refresh` - Refresh access token
- `POST /auth/logout` - User logout
- `POST /auth/forgot-password` - Request password reset
- `POST /auth/reset-password` - Reset password

### Users
- `GET /users` - List users
- `GET /users/:id` - Get user details
- `POST /users` - Create user
- `PUT /users/:id` - Update user
- `DELETE /users/:id` - Delete user

### Products (E-commerce)
- `GET /products` - List products
- `GET /products/:id` - Get product details
- `POST /products` - Create product
- `PUT /products/:id` - Update product
- `DELETE /products/:id` - Delete product

### Orders
- `GET /orders` - List orders
- `GET /orders/:id` - Get order details
- `POST /orders` - Create order
- `PUT /orders/:id/status` - Update order status

### Blog
- `GET /blog/posts` - List blog posts
- `GET /blog/posts/:slug` - Get post by slug
- `POST /blog/posts` - Create post
- `PUT /blog/posts/:id` - Update post
- `DELETE /blog/posts/:id` - Delete post

### Calendar
- `GET /calendar/events` - List events
- `POST /calendar/events` - Create event
- `PUT /calendar/events/:id` - Update event
- `DELETE /calendar/events/:id` - Delete event

### Notifications
- `GET /notifications` - List notifications
- `PUT /notifications/:id/read` - Mark as read
- `DELETE /notifications/:id` - Delete notification

*And 20+ more feature endpoints...*

## 🔒 Security

- **JWT Authentication** - Secure token-based auth
- **Password Hashing** - bcrypt with 10 salt rounds
- **CORS Protection** - Configurable origins
- **Rate Limiting** - Prevent abuse
- **Input Validation** - class-validator on all DTOs
- **SQL Injection Protection** - Prisma parameterized queries
- **XSS Protection** - Input sanitization
- **CSRF Protection** - Token validation
- **Audit Logging** - Track all actions

## 🧪 Testing

```bash
# Unit tests
npm run test

# E2E tests
npm run test:e2e

# Test coverage
npm run test:cov
```

## 📖 Documentation

- **API Documentation**: Available at `/api/docs` (Swagger)
- **Database Schema**: `prisma/schema.prisma`
- **Seed Data**: `prisma/seed-data/`
- **Feature Specs**: `../.kiro/specs/`

## 🐛 Debugging

### Prisma Studio
```bash
npm run prisma:studio
```
Opens a visual database browser at `http://localhost:5555`

### Debug Mode
```bash
npm run start:debug
```
Attach debugger on port 9229

### Logs
- Application logs in console
- Error logs with stack traces
- Audit logs in database

## 🤝 Contributing

This is part of the skeleton template. When extending:

1. Follow NestJS module structure
2. Add DTOs for validation
3. Use Prisma for database operations
4. Implement proper error handling
5. Add guards for protected routes
6. Write tests for new features
7. Update Prisma schema if needed

## 📄 License

MIT License - See root LICENSE file

---

**Part of the Full-Stack Dashboard Skeleton Template**  
Built with Kiro AI for Kiroween Hackathon 2024
