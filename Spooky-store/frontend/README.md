# Frontend - Next.js 14 Application

> **Part of the Full-Stack Dashboard Skeleton Template**

A modern Next.js 14 frontend with App Router, TypeScript, Tailwind CSS, shadcn/ui components, and real-time features.

## 🛠️ Tech Stack

- **Framework**: Next.js 14 (App Router)
- **Language**: TypeScript
- **Styling**: Tailwind CSS + OKLCH colors
- **UI Components**: shadcn/ui + Radix UI
- **Icons**: Lucide React
- **Forms**: React Hook Form + Zod validation
- **State Management**: React Context + Hooks
- **Real-time**: WebSocket client
- **HTTP Client**: Fetch API
- **Testing**: Vitest + React Testing Library

## 📁 Project Structure

```
frontend/
├── src/
│   ├── app/                      # Next.js App Router
│   │   ├── dashboard/           # Admin dashboard
│   │   │   ├── page.tsx        # Dashboard home
│   │   │   ├── users/          # User management
│   │   │   ├── blog/           # Blog management
│   │   │   ├── ecommerce/      # E-commerce admin
│   │   │   ├── calendar/       # Calendar
│   │   │   ├── notifications/  # Notifications
│   │   │   ├── settings/       # Settings
│   │   │   └── ...
│   │   ├── shop/               # E-commerce storefront
│   │   ├── blog/               # Public blog
│   │   ├── account/            # Customer accounts
│   │   ├── cart/               # Shopping cart
│   │   ├── checkout/           # Checkout flow
│   │   ├── login/              # Authentication
│   │   ├── layout.tsx          # Root layout
│   │   ├── page.tsx            # Home page
│   │   └── globals.css         # Global styles
│   ├── components/             # React components
│   │   ├── ui/                 # shadcn/ui components
│   │   ├── dashboard/          # Dashboard components
│   │   ├── auth/               # Auth components
│   │   ├── blog/               # Blog components
│   │   ├── storefront/         # E-commerce components
│   │   ├── cart/               # Cart components
│   │   ├── checkout/           # Checkout components
│   │   ├── calendar/           # Calendar components
│   │   ├── notifications/      # Notification components
│   │   ├── messaging/          # Messaging components
│   │   ├── landing/            # Landing page builder
│   │   ├── widgets/            # Dashboard widgets
│   │   └── ...
│   ├── lib/                    # Utilities
│   │   ├── api.ts              # API client
│   │   ├── utils.ts            # Helper functions
│   │   ├── metadata-config.ts  # SEO metadata
│   │   └── ...
│   ├── hooks/                  # Custom React hooks
│   │   ├── use-toast.ts        # Toast notifications
│   │   ├── useAuth.ts          # Authentication
│   │   ├── usePermission.ts    # Permissions
│   │   └── ...
│   ├── contexts/               # React contexts
│   │   ├── AuthContext.tsx     # Auth state
│   │   ├── ThemeContext.tsx    # Theme state
│   │   └── ...
│   ├── types/                  # TypeScript types
│   │   ├── api.ts              # API types
│   │   ├── auth.ts             # Auth types
│   │   └── ...
│   └── styles/                 # Additional styles
├── public/                     # Static assets
│   ├── images/
│   └── ...
├── .env.local                  # Environment variables
├── next.config.ts              # Next.js config
├── tailwind.config.js          # Tailwind config
├── tsconfig.json               # TypeScript config
└── package.json                # Dependencies
```

## 🚀 Getting Started

### Prerequisites

- Node.js 18+
- npm or yarn
- Backend API running on port 3001

### Installation

1. **Install Dependencies:**
```bash
npm install
```

2. **Configure Environment:**
```bash
# Create .env.local file
cp .env.example .env.local

# Edit .env.local with your configuration
```

3. **Start Development Server:**
```bash
npm run dev
```

The application will be available at `http://localhost:3000`

## 📚 Available Scripts

### Development
```bash
npm run dev                # Start development server
npm run build              # Build for production
npm run start              # Start production server
```

### Code Quality
```bash
npm run lint               # Run ESLint
npm run type-check         # TypeScript type checking
```

### Testing
```bash
npm run test               # Run tests
npm run test:watch         # Run tests in watch mode
npm run test:coverage      # Run tests with coverage
```

### UI Components
```bash
npx shadcn@latest add [component]  # Add shadcn/ui component
```

## 🔧 Configuration

### Environment Variables

Create a `.env.local` file in the frontend directory:

```env
# API Configuration
NEXT_PUBLIC_API_URL=http://localhost:3001
NEXT_PUBLIC_APP_URL=http://localhost:3000

# Environment
NODE_ENV=development

# Feature Flags
NEXT_PUBLIC_ENABLE_LANDING=true
NEXT_PUBLIC_ENABLE_BLOG=true
NEXT_PUBLIC_ENABLE_ECOMMERCE=true
NEXT_PUBLIC_ENABLE_CALENDAR=true
NEXT_PUBLIC_ENABLE_CRM=true
NEXT_PUBLIC_ENABLE_NOTIFICATIONS=true
NEXT_PUBLIC_ENABLE_CUSTOMER_ACCOUNT=true

# Page Visibility
NEXT_PUBLIC_SHOW_HOME_PAGE=true
NEXT_PUBLIC_SHOW_SHOP_PAGE=true
NEXT_PUBLIC_SHOW_BLOG_PAGE=true
NEXT_PUBLIC_SHOW_ACCOUNT_PAGE=true

# Dynamic Header/Footer
NEXT_PUBLIC_USE_DYNAMIC_HEADER_FOOTER=true

# Blog Configuration
NEXT_PUBLIC_BLOG_POSTS_PER_PAGE=10
NEXT_PUBLIC_BLOG_ENABLE_CATEGORIES=true
NEXT_PUBLIC_BLOG_ENABLE_TAGS=true
```

## 🎨 Styling

### Tailwind CSS + OKLCH Colors

The project uses Tailwind CSS with OKLCH color system for better color management:

```tsx
// Theme colors (automatically adapt to dark/light mode)
className="bg-background text-foreground"
className="bg-card text-card-foreground"
className="bg-primary text-primary-foreground"
className="bg-secondary text-secondary-foreground"
```

### shadcn/ui Components

Pre-built, accessible components:

```bash
# Add a component
npx shadcn@latest add button
npx shadcn@latest add card
npx shadcn@latest add dialog
```

Available components: button, card, dialog, dropdown-menu, input, select, table, tabs, toast, and 30+ more.

## 🏗️ Architecture

### App Router Structure

Next.js 14 App Router with file-based routing:

```
app/
├── page.tsx              # Route: /
├── layout.tsx            # Root layout
├── dashboard/
│   ├── page.tsx         # Route: /dashboard
│   └── users/
│       └── page.tsx     # Route: /dashboard/users
└── blog/
    ├── page.tsx         # Route: /blog
    └── [slug]/
        └── page.tsx     # Route: /blog/[slug]
```

### Component Patterns

```tsx
'use client'; // Only when needed (state, effects, browser APIs)

import { Button } from '@/components/ui/button';

interface MyComponentProps {
  title: string;
  data?: any[];
}

export function MyComponent({ title, data = [] }: MyComponentProps) {
  return (
    <div className="bg-card p-4 rounded-lg">
      <h2 className="text-lg font-semibold">{title}</h2>
      {/* Content */}
    </div>
  );
}
```

### API Client

```tsx
import { ApiClient } from '@/lib/api';

// GET request
const users = await ApiClient.get('/users');

// POST request
const newUser = await ApiClient.post('/users', { name: 'John' });

// PUT request
await ApiClient.put('/users/123', { name: 'Jane' });

// DELETE request
await ApiClient.delete('/users/123');
```

### Toast Notifications

```tsx
import { toast } from '@/hooks/use-toast';

// Success
toast.success('Operation successful');

// Error
toast.error('Something went wrong');

// Info
toast.info('Information message');

// Warning
toast.warning('Warning message');
```

## 🔐 Authentication

### Auth Context

```tsx
import { useAuth } from '@/contexts/AuthContext';

function MyComponent() {
  const { user, login, logout, isAuthenticated } = useAuth();

  if (!isAuthenticated) {
    return <LoginForm />;
  }

  return <div>Welcome, {user.name}!</div>;
}
```

### Protected Routes

```tsx
import { useRequireAuth } from '@/hooks/useRequireAuth';

function ProtectedPage() {
  useRequireAuth(); // Redirects to login if not authenticated

  return <div>Protected content</div>;
}
```

### Permission Checks

```tsx
import { usePermission } from '@/hooks/usePermission';

function AdminPanel() {
  const hasPermission = usePermission('admin:access');

  if (!hasPermission) {
    return <AccessDenied />;
  }

  return <div>Admin panel</div>;
}
```

## 🎨 Theming

### Theme Provider

The app supports system, light, and dark themes:

```tsx
import { useTheme } from '@/contexts/ThemeContext';

function ThemeToggle() {
  const { theme, setTheme } = useTheme();

  return (
    <button onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}>
      Toggle Theme
    </button>
  );
}
```

### Custom Colors

Customize theme colors in `tailwind.config.js`:

```js
theme: {
  extend: {
    colors: {
      background: 'oklch(var(--background))',
      foreground: 'oklch(var(--foreground))',
      // ... more colors
    }
  }
}
```

## 📱 Responsive Design

Mobile-first approach with Tailwind breakpoints:

```tsx
<div className="
  grid grid-cols-1           // Mobile: 1 column
  md:grid-cols-2             // Tablet: 2 columns
  lg:grid-cols-3             // Desktop: 3 columns
  gap-4
">
  {/* Content */}
</div>
```

## ♿ Accessibility

- Semantic HTML
- ARIA labels and roles
- Keyboard navigation
- Focus management
- Screen reader support
- WCAG 2.1 AA compliance

## 🧪 Testing

```bash
# Run all tests
npm run test

# Watch mode
npm run test:watch

# Coverage report
npm run test:coverage
```

Test example:
```tsx
import { render, screen } from '@testing-library/react';
import { MyComponent } from './MyComponent';

describe('MyComponent', () => {
  it('renders correctly', () => {
    render(<MyComponent title="Test" />);
    expect(screen.getByText('Test')).toBeInTheDocument();
  });
});
```

## 🔌 Real-time Features

WebSocket connection for real-time updates:

```tsx
import { useEffect } from 'react';
import { socket } from '@/lib/socket';

function NotificationBell() {
  useEffect(() => {
    socket.on('notification', (data) => {
      toast.info(data.message);
    });

    return () => {
      socket.off('notification');
    };
  }, []);

  return <BellIcon />;
}
```

## 📖 Documentation

- **Component Library**: `/dashboard/design-system`
- **API Client**: `src/lib/api.ts`
- **Type Definitions**: `src/types/`
- **Feature Specs**: `../.kiro/specs/`

## 🐛 Debugging

### Development Tools

- React DevTools
- Next.js DevTools (built-in)
- Browser DevTools
- Network tab for API calls

### Common Issues

**Issue**: API calls failing
**Solution**: Check `NEXT_PUBLIC_API_URL` in `.env.local`

**Issue**: Components not updating
**Solution**: Ensure you're using `'use client'` directive for client components

**Issue**: Styles not applying
**Solution**: Check Tailwind config and restart dev server

## 🤝 Contributing

This is part of the skeleton template. When extending:

1. Follow Next.js 14 App Router conventions
2. Use TypeScript for all components
3. Use shadcn/ui components when possible
4. Follow the component structure pattern
5. Add proper TypeScript types
6. Write tests for new features
7. Ensure accessibility compliance

## 📄 License

MIT License - See root LICENSE file

---

**Part of the Full-Stack Dashboard Skeleton Template**  
Built with Kiro AI for Kiroween Hackathon 2025
