# 🎃 Spooky Store - Modern E-Commerce Platform

> **Built from the Dashboard Skeleton Template** - A complete, production-ready e-commerce solution

Spooky Store is a **fully-functional e-commerce platform** built on top of the full-stack dashboard skeleton template. It demonstrates how the skeleton's foundation can be extended into a modern online store with advanced features including product catalog, shopping cart, checkout, customer accounts, and a powerful admin dashboard.

## 🌟 What Makes This Special?

This isn't just another e-commerce template - it's a **complete business solution** that showcases:

- ✅ **Professional Storefront** - Modern, responsive shopping experience
- ✅ **Advanced Admin Dashboard** - Full control over products, orders, and customers
- ✅ **Dynamic Landing Pages** - Visual editor for creating stunning marketing pages
- ✅ **Content Management** - Built-in blog and custom pages system
- ✅ **Customer Portal** - Self-service order tracking and account management
- ✅ **Real-time Features** - Live notifications, messaging, and inventory updates

## 🏗️ Built on Solid Foundation

Extends the **Dashboard Skeleton Template** with:

### Core Features (From Skeleton)
- 🔐 **JWT Authentication** - Secure user authentication with role-based access
- 👥 **User Management** - Complete user and role management system
- 🎨 **Dynamic Theming** - OKLCH color system with dark/light mode
- 📊 **Dashboard Widgets** - Customizable dashboard with drag-and-drop widgets
- 📅 **Calendar System** - Event scheduling and management
- 💬 **Messaging** - Real-time messaging between users
- 🔔 **Notifications** - WebSocket-powered notification system
- 📧 **Email System** - Transactional emails with templates
- 🔍 **Global Search** - Search across all content types
- 📱 **Responsive Design** - Mobile-first, accessible UI

### E-Commerce Extensions
- 🛍️ **Product Catalog** - Categories, variants, inventory management
- 🛒 **Shopping Cart** - Persistent cart with session support
- 💳 **Checkout System** - Multi-step checkout with address management
- 📦 **Order Management** - Complete order lifecycle tracking
- 👤 **Customer Accounts** - Registration, login, order history
- ❤️ **Wishlist** - Save products for later
- 🎯 **Landing Page Builder** - Visual editor with pre-built sections
- 📝 **Blog System** - Full-featured blog with categories and tags
- 📄 **Custom Pages** - Create and manage custom content pages
- 🎨 **Branding Manager** - Logo, colors, and site-wide branding
- 📊 **Analytics Dashboard** - Sales, revenue, and customer insights

## 🚀 Quick Start

### Prerequisites
- Node.js (v18 or higher)
- PostgreSQL (running and accessible)
- npm or yarn

### 1. Database Setup

```bash
node setup-workspace.js
```

This interactive tool will:
- Test PostgreSQL connection
- Create the database
- Configure environment variables
- Set up initial data

### 2. Backend Setup

```bash
cd backend
npm install
npm run prisma:generate
npm run prisma:migrate
npm run start:dev
```

The backend will start on `http://localhost:3001`

### 3. Frontend Setup

```bash
cd frontend
npm install
npm run dev
```

The storefront will be available at `http://localhost:3000`

### 4. Access the Platform

- **Storefront**: http://localhost:3000
- **Admin Dashboard**: http://localhost:3000/dashboard
- **API**: http://localhost:3001

**Default Admin Credentials** (created during setup):
- Email: admin@example.com
- Password: (set during setup)

## 🛠️ Tech Stack

### Frontend
- **Framework**: Next.js 14 with App Router
- **Language**: TypeScript
- **Styling**: Tailwind CSS + OKLCH colors
- **UI Components**: shadcn/ui + Radix UI
- **Icons**: Lucide React
- **Forms**: React Hook Form + Zod validation
- **State Management**: React Context + Hooks
- **Real-time**: WebSocket client

### Backend
- **Framework**: NestJS
- **Language**: TypeScript
- **Database**: PostgreSQL
- **ORM**: Prisma
- **Authentication**: JWT + bcrypt
- **Real-time**: WebSocket (Socket.io)
- **Email**: Nodemailer
- **File Upload**: Multer
- **Validation**: class-validator

## 📁 Project Structure

```
spooky-store/
├── frontend/
│   ├── src/
│   │   ├── app/                    # Next.js pages
│   │   │   ├── shop/              # Storefront pages
│   │   │   ├── cart/              # Shopping cart
│   │   │   ├── checkout/          # Checkout flow
│   │   │   ├── account/           # Customer account
│   │   │   ├── blog/              # Blog pages
│   │   │   └── dashboard/         # Admin dashboard
│   │   ├── components/            # React components
│   │   │   ├── storefront/        # Storefront components
│   │   │   ├── cart/              # Cart components
│   │   │   ├── checkout/          # Checkout components
│   │   │   ├── products/          # Product management
│   │   │   ├── orders/            # Order management
│   │   │   ├── landing/           # Landing page builder
│   │   │   └── blog/              # Blog components
│   │   ├── lib/                   # Utilities and helpers
│   │   └── types/                 # TypeScript types
│   └── public/                    # Static assets
├── backend/
│   ├── src/
│   │   ├── products/              # Product management
│   │   ├── orders/                # Order processing
│   │   ├── customers/             # Customer management
│   │   ├── cart/                  # Shopping cart
│   │   ├── checkout/              # Checkout logic
│   │   ├── inventory/             # Inventory tracking
│   │   ├── shipping/              # Shipping methods
│   │   ├── payments/              # Payment processing
│   │   ├── blog/                  # Blog system
│   │   ├── pages/                 # Custom pages
│   │   ├── landing/               # Landing page CMS
│   │   └── branding/              # Branding settings
│   └── prisma/
│       ├── schema.prisma          # Database schema
│       └── migrations/            # Database migrations
└── .kiro/
    ├── specs/                     # Feature specifications
    ├── hooks/                     # Kiro agent hooks
    └── steering/                  # Development guidelines
```

## 🎯 Key Features

### Storefront Features

#### Product Browsing
- Category-based navigation
- Advanced filtering (price, attributes)
- Search functionality
- Product variants (size, color, etc.)
- Image galleries with zoom
- Related products
- Stock availability indicators

#### Shopping Experience
- Persistent shopping cart
- Guest checkout support
- Wishlist for logged-in users
- Real-time inventory updates
- Mobile-optimized interface
- Fast page loads with SSR

#### Checkout Process
- Multi-step checkout flow
- Address management
- Shipping method selection
- Cash on Delivery payment
- Order confirmation
- Email notifications

#### Customer Portal
- Order history and tracking
- Profile management
- Address book
- Wishlist management
- Reorder functionality
- Account settings

### Admin Dashboard Features

#### Product Management
- Create/edit products
- Manage variants and options
- Bulk operations
- Image upload and gallery
- Inventory tracking
- Category management
- SEO optimization

#### Order Management
- Order list with filters
- Order details and timeline
- Status updates
- Customer information
- Shipping tracking
- Order notes
- Bulk actions

#### Customer Management
- Customer list and search
- Customer profiles
- Order history per customer
- Customer analytics
- Communication tools

#### Content Management
- Landing page builder with visual editor
- Blog with categories and tags
- Custom pages with markdown
- Menu management
- SEO settings
- Media library

#### Analytics & Reports
- Sales dashboard
- Revenue charts
- Top products
- Customer insights
- Inventory alerts
- Order statistics

#### Settings & Configuration
- Store branding (logo, colors)
- Email templates
- Shipping methods
- Payment settings
- Tax configuration
- Feature flags

## 🎨 Landing Page Builder

The visual landing page builder includes:

### Pre-built Sections
- Hero sections (multiple layouts)
- Feature grids
- Product showcases
- Testimonials
- Statistics
- Call-to-action blocks
- Blog post listings
- Custom content sections

### Customization Options
- Drag-and-drop reordering
- Live preview
- Responsive controls
- Color customization
- Image uploads
- Text editing
- Button styling
- Layout options

## 📝 Blog System

Full-featured blog with:
- Rich text editor with markdown support
- Categories and tags
- Featured images
- SEO optimization
- Draft/publish workflow
- Scheduled publishing
- Author management
- Comment system (future)

## 🔧 Configuration

### Environment Variables

**Backend** (`backend/.env`):
```env
DATABASE_URL="postgresql://user:password@localhost:5432/spooky_store"
PORT=3001
NODE_ENV=development
JWT_SECRET=your-secret-key
SMTP_HOST=smtp.example.com
SMTP_PORT=587
SMTP_USER=your-email@example.com
SMTP_PASS=your-password
```

**Frontend** (`frontend/.env.local`):
```env
NEXT_PUBLIC_API_URL=http://localhost:3001
NEXT_PUBLIC_APP_URL=http://localhost:3000
NEXT_PUBLIC_STORE_NAME="Spooky Store"
```

## 📚 Available Scripts

### Backend
```bash
npm run start:dev          # Start development server
npm run build              # Build for production
npm run start:prod         # Start production server
npm run prisma:generate    # Generate Prisma client
npm run prisma:migrate     # Run migrations
npm run prisma:studio      # Open Prisma Studio
npm run test               # Run tests
```

### Frontend
```bash
npm run dev                # Start development server
npm run build              # Build for production
npm run start              # Start production server
npm run lint               # Run ESLint
npm run type-check         # TypeScript type checking
```

## 🚢 Deployment

### Production Build

1. **Build Backend**:
```bash
cd backend
npm run build
```

2. **Build Frontend**:
```bash
cd frontend
npm run build
```

3. **Set Production Environment Variables**

4. **Run Migrations**:
```bash
cd backend
npm run prisma:migrate deploy
```

5. **Start Services**:
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

## 🎓 Learning from This Project

This project demonstrates:

1. **Extending a Skeleton** - How to build on a foundation template
2. **E-commerce Architecture** - Complete online store implementation
3. **Content Management** - Visual editors and dynamic content
4. **Real-time Features** - WebSocket integration
5. **SEO Optimization** - Server-side rendering and meta tags
6. **Performance** - Image optimization, caching, lazy loading
7. **Security** - Authentication, authorization, data validation
8. **Testing** - Unit and integration tests
9. **Deployment** - Production-ready configuration

## 📖 Documentation

Detailed documentation available in:
- `.kiro/specs/` - Feature specifications
- `documentation/` - Implementation guides
- `backend/README.md` - Backend API documentation
- `frontend/README.md` - Frontend component documentation

## 🤝 Contributing

This is a demonstration project built for the Kiroween Hackathon. Feel free to:
- Fork and customize for your needs
- Report issues
- Suggest improvements
- Share your implementations

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](../../LICENSE) file for details.

Copyright (c) 2025 Fouad ABATOUY

## 🙏 Acknowledgments

- Built with [Kiro AI](https://kiro.dev) - AI-powered development assistant
- Based on the Dashboard Skeleton Template
- UI components from [shadcn/ui](https://ui.shadcn.com)
- Icons from [Lucide](https://lucide.dev)

---

**Spooky Store** - Demonstrating the power of the Dashboard Skeleton Template 🎃
