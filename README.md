# 🏗️ Full-Stack Dashboard Skeleton Template

> **Built for Kiroween Hackathon 2025** - Skeleton Crew Category  
> *Powered by [Kiro AI](https://kiro.dev) - The AI Development Assistant*

A professional, production-ready full-stack dashboard skeleton/template that serves as the foundation for building custom applications. This project demonstrates the versatility of a well-architected skeleton by showcasing **two distinct applications** built from the same foundation.

## 🎯 What is This Project?

This is a **SKELETON/TEMPLATE** - not a finished product, but a solid foundation you build upon. Think of it as the bones of your application, complete with:

- ✅ **Complete Architecture** - Full-stack structure ready to extend
- ✅ **Core Systems** - Authentication, database, API, real-time features
- ✅ **Best Practices** - Security, scalability, maintainability built-in
- ✅ **Modular Design** - Enable/disable features as needed
- ✅ **Production Ready** - Deployment configs, Docker support, security hardened

### 🦴 Skeleton Crew Category

This project demonstrates the **Skeleton Crew** category by:
1. **Main Skeleton** - A comprehensive dashboard template with 30+ features
2. **Application 1** - **Spooky Store** (E-commerce platform)
3. **Application 2** - **CoachDashtact** (Coaching management system)

Both applications are built from the same skeleton, showcasing its flexibility and extensibility.

## 📁 Project Structure

```
skeleton-dashtact/
├── .kiro/                      # Kiro AI Configuration
│   ├── specs/                 # 30+ Feature specifications
│   ├── hooks/                 # 8 Agent automation hooks
│   ├── steering/              # 19 Development guidelines
│   └── settings/              # MCP integrations
├── backend/                    # NestJS Backend (Skeleton Template)
│   ├── src/                   # Source code
│   │   ├── auth/             # JWT authentication
│   │   ├── users/            # User management
│   │   ├── permissions/      # Role-based access control
│   │   ├── products/         # E-commerce products
│   │   ├── orders/           # Order management
│   │   ├── blog/             # Blog system
│   │   ├── pages/            # Custom pages
│   │   ├── calendar/         # Event scheduling
│   │   ├── notifications/    # Real-time notifications
│   │   ├── messaging/        # Direct messaging
│   │   ├── members/          # Coaching members
│   │   └── ...               # 30+ feature modules
│   ├── prisma/               # Database schema & migrations
│   └── package.json
├── frontend/                   # Next.js 14 Frontend (Skeleton Template)
│   ├── src/
│   │   ├── app/              # Next.js App Router
│   │   │   ├── dashboard/   # Admin dashboard
│   │   │   ├── shop/        # E-commerce storefront
│   │   │   ├── blog/        # Blog pages
│   │   │   ├── account/     # Customer accounts
│   │   │   └── ...
│   │   ├── components/       # React components
│   │   ├── lib/             # Utilities & API client
│   │   └── types/           # TypeScript types
│   └── package.json
├── Spooky-store/              # 🎃 Application 1: E-commerce Platform
│   ├── .kiro/                # Kiro config for this app
│   ├── backend/              # Full NestJS backend
│   ├── frontend/             # Full Next.js frontend
│   ├── deployment/           # Deployment configs
│   └── README.md             # App-specific documentation
├── coachdashtact/             # 🎯 Application 2: Coaching Platform
│   ├── .kiro/                # Kiro config for this app
│   ├── backend/              # Full NestJS backend
│   ├── frontend/             # Full Next.js frontend
│   ├── deployment/           # Deployment configs
│   └── README.md             # App-specific documentation
├── setup-cli.js               # Interactive setup wizard
├── LICENSE                    # MIT License
└── README.md                  # This file
```

## 🚀 Quick Start

### Prerequisites

- **Node.js** v18+ ([Download](https://nodejs.org/))
- **PostgreSQL** 14+ ([Download](https://www.postgresql.org/download/))
- **npm** or **yarn**

### Installation

#### Step 1: Clone the Repository

```bash
git clone https://github.com/FouadABT/kiroween-dashtact.git
cd kiroween-dashtact
```

#### Step 2: Run the Interactive Setup Wizard

```bash
node setup-cli.js
```

The setup wizard will guide you through:

1. **Environment Verification** - Checks Node.js, npm, PostgreSQL
2. **Environment Selection** - Development or Production
3. **Feature Selection** - Choose from 5 pre-configured profiles:
   - 🛍️ **E-commerce Store** - Products, orders, payments, shipping
   - 💪 **Fitness & Gym Management** - Members, classes, coaches, tracking
   - 📊 **CRM & Business** - Customer management, calendar, notifications
   - 🚀 **Full-Stack Platform** - All features enabled ⭐ **Recommended for exploring all capabilities**
   - ⚡ **Minimal Dashboard** - Core features only
4. **Theme Configuration** - System, Light, or Dark mode
5. **Branding Setup** - Brand name, tagline, description
6. **Database Configuration** - Connection setup and testing
7. **Database Initialization** - Migrations and seeding
8. **Dependency Installation** - Backend and frontend packages

#### Step 3: Start the Application

**Terminal 1 - Backend:**
```bash
cd backend
npm run start:dev
```

**Terminal 2 - Frontend:**
```bash
cd frontend
npm run dev
```

#### Step 4: Access the Application

- **Frontend**: http://localhost:3000
- **Backend API**: http://localhost:3001
- **Prisma Studio**: `cd backend && npx prisma studio`

**Default Admin Credentials:**
- Email: `admin@dashtact.com`
- Password: `dashtact`

⚠️ **Change the default password immediately after first login!**

## 🎨 Features

### Core Features (Skeleton Foundation)

#### 🔐 Authentication & Authorization

**JWT Token System:**
- Access tokens (15 min) + Refresh tokens (7 days)
- Automatic token refresh before expiration
- Token blacklist for logout/revocation
- Secure bcrypt password hashing (10 rounds)

**Permission System:**

The system uses a flexible `resource:action` permission format:

```
users:read    → View users
users:write   → Create/edit users
users:delete  → Delete users
users:*       → All user operations
*:*           → Super admin (all permissions)
```

**Default Roles:**
- **Super Admin** - Full system access (`*:*`)
- **Admin** - User management, settings, content
- **Manager** - Limited user management, read-only settings
- **User** - Basic access, profile management

**Backend Protection:**
```typescript
@Controller('posts')
@UseGuards(JwtAuthGuard, PermissionsGuard)
export class PostsController {
  @Get()
  @Permissions('posts:read')  // Requires permission
  async findAll() { }
}
```

**Frontend Protection:**
```typescript
// Protect entire page
<PermissionGuard permission="posts:read">
  <PostsList />
</PermissionGuard>

// Conditional UI
const { hasPermission } = useAuth();
{hasPermission('posts:write') && <EditButton />}
```

**Security Features:**
- Two-factor authentication (2FA) via email
- Password reset with secure tokens (1-hour expiration)
- Rate limiting on auth endpoints (5 attempts/15 min)
- Account lockout after failed attempts
- Audit logging for all auth events
- Session invalidation on password change
- IP tracking for security alerts

#### 👥 User Management
- User CRUD operations
- Role assignment
- Profile management
- Avatar upload
- Activity tracking
- User search and filtering

#### 🎨 Design System & Theming
- OKLCH color system
- Dark/Light/System modes
- Dynamic theme switching
- Customizable color palettes
- Typography system
- Responsive design
- Accessibility (WCAG 2.1 AA)

#### 📊 Dashboard System
- Customizable widget system
- Drag-and-drop layout
- 20+ pre-built widgets
- Real-time data updates
- Role-based dashboards
- Analytics and charts

**Dashboard Layout Types:**

The system supports two distinct page rendering approaches:

1. **Widget-Based Dashboards** 🎨
   - Fully customizable with drag-and-drop interface
   - Users can add, remove, resize, and rearrange widgets
   - Layout saved per user/role in database
   - Perfect for: Analytics dashboards, reporting pages, personalized views
   - Examples: Main Dashboard (`/dashboard`), Analytics (`/dashboard/analytics`)

2. **Hardcoded Pages** 🔒
   - Fixed React components with predefined layouts
   - Consistent UI across all users
   - Optimized for specific workflows
   - Perfect for: CRUD operations, forms, data tables, settings
   - Examples: Products, Orders, Users, Settings pages

Both types support the same permission system, theming, and responsive design. Choose widget-based for flexibility or hardcoded for consistency.

#### 📅 Calendar & Events
- Event scheduling
- Recurring events
- Reminders and notifications
- Category management
- Attendee management
- Calendar views (month, week, day, agenda)

#### 💬 Messaging System
- Direct messaging
- Group conversations
- Real-time updates (WebSocket)
- Message notifications
- Read receipts
- File attachments

#### 🔔 Notification System
- Real-time notifications (WebSocket)
- Email notifications
- In-app notifications
- Notification preferences
- Notification history
- Sound alerts

#### 📧 Email System
- SMTP integration
- Email templates
- Transactional emails
- Email queue
- Rate limiting
- Email logs

#### 🔍 Global Search
- Search across all content types
- Advanced filtering
- Real-time search
- Search history
- Keyboard shortcuts (Cmd/Ctrl + K)

#### 📝 Content Management
- **Blog System**
  - Rich text editor (markdown)
  - Categories and tags
  - Featured images
  - SEO optimization
  - Draft/publish workflow
  - Scheduled publishing

- **Custom Pages**
  - Page builder
  - Markdown support
  - SEO settings
  - Page hierarchy
  - Custom slugs

- **Landing Page Builder**
  - Visual editor
  - Pre-built sections
  - Drag-and-drop
  - Responsive preview
  - Theme integration

#### 🛍️ E-commerce Features
- Product management
- Inventory tracking
- Order management
- Customer accounts
- Shopping cart
- Checkout system
- Payment integration (Cash on Delivery)
- Shipping methods
- Order tracking

#### 📱 Additional Features
- Media library
- File upload system
- Menu management
- Legal pages (Terms, Privacy)
- Branding management
- Feature flags
- Cron jobs
- Activity logs
- Audit trails

### 🎯 Two Distinct Applications

#### 1. 🎃 Spooky Store - E-commerce Platform

A complete online store built from the skeleton template.

**Key Features:**
- Modern storefront with product catalog
- Shopping cart and checkout
- Customer accounts and order tracking
- Wishlist functionality
- Product variants (size, color, etc.)
- Category and price filtering
- Search functionality
- Landing page builder
- Blog for content marketing
- Admin dashboard for store management

**Use Cases:** Online shop, marketplace, retail platform, dropshipping store

[View Spooky Store README →](./Spooky-store/README.md)

#### 2. 🎯 CoachDashtact - Coaching Platform

A comprehensive coaching management system built from the skeleton template.

**Key Features:**
- Coach-member relationship management
- Direct booking system with real-time availability
- Session scheduling and management
- Availability management with capacity limits
- Session lifecycle (booking → completion → rating)
- Integrated messaging
- Progress tracking
- Rating and feedback system
- Member onboarding flow
- Coach analytics dashboard

**Use Cases:** Life coaching, business coaching, fitness training, tutoring, consulting, mentorship

[View CoachDashtact README →](./coachdashtact/README.md)

## 🛠️ Tech Stack

### Backend
- **Framework**: NestJS (Node.js + TypeScript)
- **Database**: PostgreSQL
- **ORM**: Prisma
- **Authentication**: JWT + bcrypt
- **Real-time**: WebSocket (Socket.io)
- **Email**: Nodemailer
- **Validation**: class-validator
- **File Upload**: Multer
- **Caching**: In-memory + Redis (optional)

### Frontend
- **Framework**: Next.js 14 (App Router)
- **Language**: TypeScript
- **Styling**: Tailwind CSS + OKLCH colors
- **UI Components**: shadcn/ui + Radix UI
- **Icons**: Lucide React
- **Forms**: React Hook Form + Zod
- **State**: React Context + Hooks
- **Real-time**: WebSocket client
- **HTTP Client**: Fetch API

### Development Tools
- **AI Assistant**: Kiro AI
- **Version Control**: Git
- **Package Manager**: npm
- **Code Quality**: ESLint, Prettier
- **Testing**: Vitest, React Testing Library
- **Database Tools**: Prisma Studio

## 🤖 Kiro AI Integration

This project was built with extensive use of **Kiro AI**, demonstrating advanced AI-assisted development workflows.

### Kiro Features Used

#### 📋 Specs (Spec-Driven Development)
30+ feature specifications in `.kiro/specs/`:
- `dashboard-starter-kit/` - Core dashboard foundation
- `jwt-authentication-system/` - Authentication system
- `ecommerce-system/` - E-commerce features
- `coaching-platform/` - Coaching system (CoachDashtact)
- `landing-page-cms/` - Landing page builder
- `notification-system/` - Real-time notifications
- `messaging-system/` - Direct messaging
- `calendar-planning/` - Event scheduling
- And 22 more feature specs...

**How Specs Were Used:**
- Defined requirements and acceptance criteria
- Guided implementation with clear specifications
- Ensured consistency across features
- Documented design decisions
- Enabled incremental development

#### 🪝 Agent Hooks (Automation)
8 automation hooks in `.kiro/hooks/`:
- `prisma-sync-agent.kiro.hook` - Auto-sync database schema changes
- `run-full-stack.kiro.hook` - Start both backend and frontend
- `frontend-deploy-agent.kiro.hook` - Automated deployment
- `pageheader-breadcrumb-auto.kiro.hook` - Auto-generate breadcrumbs
- `widget-registry-integration.kiro.hook` - Widget system automation
- `nextjs-page-header-agent.kiro.hook` - Page header generation
- `manual-bug-fix.kiro.hook` - Assisted debugging
- `manual-deploy-dashtact.kiro.hook` - Deployment automation

**How Hooks Were Used:**
- Automated repetitive tasks
- Maintained code consistency
- Reduced manual errors
- Accelerated development
- Improved code quality

#### 🎯 Steering Docs (Development Guidelines)
19 steering documents in `.kiro/steering/`:
- `fullstack-structure.md` - Project organization
- `coding-standards.md` - Code quality rules
- `api-routing-system.md` - API conventions
- `database-sync.md` - Prisma workflow
- `nestjs-module-architecture.md` - Backend patterns
- `toast-notification-system.md` - UI notifications
- `mcp-tools-usage.md` - MCP integration guide
- And 12 more guidelines...

**How Steering Was Used:**
- Enforced coding standards
- Guided architectural decisions
- Maintained consistency
- Onboarded team members
- Documented best practices

#### 🔌 MCP (Model Context Protocol)
6 MCP integrations in `.kiro/settings/mcp.json`:

1. **Postgres MCP** - Database operations via AI
   - Query and analyze database
   - Schema insights
   - Performance optimization
   - Index recommendations

2. **GitHub MCP** - Repository operations
   - Search repositories
   - Create issues and PRs
   - Read/write files
   - Manage branches

3. **Fetch MCP** - Web scraping and API calls
   - Fetch web content
   - Parse HTML/JSON
   - Make HTTP requests

4. **Time MCP** - Timezone operations
   - Convert timezones
   - Get current time
   - Schedule calculations

5. **Next.js Devtools MCP** - Next.js optimization
   - Runtime analysis
   - Performance insights

6. **Playwright MCP** - Browser automation
   - E2E testing
   - Screenshots
   - Web scraping

**How MCP Was Used:**
- Direct database queries via AI
- Automated GitHub operations
- Fetched external data
- Timezone calculations
- Performance analysis

### Kiro Development Workflow

```
1. Define Feature (Spec)
   ↓
2. Kiro Generates Code
   ↓
3. Agent Hooks Auto-sync
   ↓
4. Steering Guides Quality
   ↓
5. MCP Provides Context
   ↓
6. Iterate and Refine
```

## 📚 Available Scripts

### Root Level
```bash
node setup-cli.js              # Interactive setup wizard
```

### Backend (`cd backend`)
```bash
npm run start:dev              # Start development server
npm run start:prod             # Start production server
npm run build                  # Build for production
npm run prisma:generate        # Generate Prisma client
npm run prisma:migrate         # Run migrations
npm run prisma:seed            # Seed database
npm run prisma:studio          # Open Prisma Studio
npm test                       # Run tests
npm run test:e2e               # Run E2E tests
```

### Frontend (`cd frontend`)
```bash
npm run dev                    # Start development server
npm run build                  # Build for production
npm run start                  # Start production server
npm run lint                   # Run ESLint
npm run type-check             # TypeScript checking
```

## 🔧 Configuration

### Environment Variables

**Backend** (`backend/.env`):
```env
# Database
DATABASE_URL="postgresql://user:password@localhost:5432/dbname"

# Application
PORT=3001
NODE_ENV=development
APP_URL=http://localhost:3001

# JWT
JWT_SECRET=your-secret-key-min-64-chars
JWT_ACCESS_EXPIRATION=15m
JWT_REFRESH_EXPIRATION=7d

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
```

**Frontend** (`frontend/.env.local`):
```env
# API
NEXT_PUBLIC_API_URL=http://localhost:3001
NEXT_PUBLIC_APP_URL=http://localhost:3000

# Feature Flags
NEXT_PUBLIC_ENABLE_LANDING=true
NEXT_PUBLIC_ENABLE_BLOG=true
NEXT_PUBLIC_ENABLE_ECOMMERCE=true
NEXT_PUBLIC_ENABLE_CALENDAR=true
NEXT_PUBLIC_ENABLE_CRM=true
NEXT_PUBLIC_ENABLE_NOTIFICATIONS=true
NEXT_PUBLIC_ENABLE_CUSTOMER_ACCOUNT=true
```

### Feature Flags

Enable or disable features by setting environment variables:

- `ENABLE_LANDING` - Landing page builder
- `ENABLE_BLOG` - Blog system
- `ENABLE_ECOMMERCE` - E-commerce features
- `ENABLE_CALENDAR` - Calendar and events
- `ENABLE_CRM` - Customer relationship management
- `ENABLE_NOTIFICATIONS` - Notification system
- `ENABLE_CUSTOMER_ACCOUNT` - Customer accounts

## 🚢 Deployment

### Production Build

1. **Build Backend:**
```bash
cd backend
npm run build
```

2. **Build Frontend:**
```bash
cd frontend
npm run build
```

3. **Set Production Environment Variables**

4. **Run Migrations:**
```bash
cd backend
npx prisma migrate deploy
```

5. **Start Services:**
```bash
# Backend
cd backend
npm run start:prod

# Frontend
cd frontend
npm run start
```

### Docker Deployment

Docker configuration files are included for containerized deployment.

```bash
docker-compose up -d
```

## 📖 Documentation

- **Root README** - This file (project overview)
- **Spooky Store README** - [Spooky-store/README.md](./Spooky-store/README.md)
- **CoachDashtact README** - [coachdashtact/README.md](./coachdashtact/README.md)
- **Kiro Specs** - `.kiro/specs/` (30+ feature specifications)
- **Steering Docs** - `.kiro/steering/` (19 development guidelines)
- **Backend Docs** - `backend/README.md`
- **Frontend Docs** - `frontend/README.md`

## 🎓 Learning from This Project

This skeleton template demonstrates:

1. **Full-Stack Architecture** - Complete NestJS + Next.js setup
2. **Modular Design** - Feature-based organization
3. **Authentication & Authorization** - JWT + RBAC implementation
4. **Real-time Features** - WebSocket integration
5. **Database Design** - Prisma schema with 30+ models
6. **API Design** - RESTful endpoints with validation
7. **UI/UX Patterns** - Modern dashboard design
8. **Testing Strategies** - Unit and E2E tests
9. **Deployment** - Production-ready configuration
10. **AI-Assisted Development** - Kiro AI workflow

## 🏆 Kiroween Hackathon - Skeleton Crew Category

This project was built for the **Kiroween Hackathon** by Kiro AI, demonstrating the **Skeleton Crew** category requirements:

### ✅ Requirements Met

- ✅ **Skeleton Template** - Comprehensive full-stack foundation
- ✅ **Two Distinct Applications** - Spooky Store (E-commerce) + CoachDashtact (Coaching)
- ✅ **Versatility** - Same skeleton, completely different use cases
- ✅ **Kiro Usage** - Extensive use of specs, hooks, steering, and MCP
- ✅ **Open Source** - MIT License, public repository
- ✅ **Documentation** - Comprehensive READMEs and guides
- ✅ **`.kiro` Directory** - Tracked and visible in repository

### 🎯 Kiro Features Demonstrated

- **Specs**: 30+ feature specifications for structured development
- **Agent Hooks**: 8 automation hooks for workflow optimization
- **Steering Docs**: 19 guidelines for code quality and consistency
- **MCP Integration**: 6 MCP servers for extended capabilities
- **Vibe Coding**: Natural language feature requests
- **Spec-Driven Development**: Incremental feature implementation

### 🌟 What Makes This Special

1. **Production-Ready** - Not a toy project, but a real foundation
2. **Comprehensive** - 30+ features, 50+ database models
3. **Flexible** - Enable/disable features as needed
4. **Well-Documented** - Extensive documentation and guides
5. **AI-First** - Built with Kiro AI from the ground up
6. **Proven Versatility** - Two completely different applications from one skeleton

## 🤝 Contributing

This is a demonstration project for the Kiroween Hackathon. Feel free to:
- Fork and customize for your needs
- Report issues
- Suggest improvements
- Share your implementations

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](./LICENSE) file for details.

Copyright (c) 2025 Fouad ABATOUY

## 🙏 Acknowledgments

- **Built with** [Kiro AI](https://kiro.dev) - AI-powered development assistant
- **UI Components** from [shadcn/ui](https://ui.shadcn.com)
- **Icons** from [Lucide](https://lucide.dev)
- **Submitted to** [Kiroween Hackathon 2025](https://kiroween.devpost.com)

## 📞 Contact

- **Author**: Fouad ABATOUY
- **GitHub**: [@FouadABT](https://github.com/FouadABT)
- **Repository**: [kiroween-dashtact](https://github.com/FouadABT/kiroween-dashtact)

---

**Built for Kiroween Hackathon 2025** 🎃  
*Demonstrating the power of skeleton templates with Kiro AI* 🤖
