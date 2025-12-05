# Dashboard Starter Kit - Component Documentation

This document provides comprehensive documentation for all reusable components in the dashboard starter kit.

## Table of Contents

- [Installation & Setup](#installation--setup)
- [Authentication Components](#authentication-components)
- [Dashboard Components](#dashboard-components)
- [UI Components](#ui-components)
- [Development Components](#development-components)
- [TypeScript Usage](#typescript-usage)
- [Customization Guide](#customization-guide)

## Installation & Setup

### Basic Import

```tsx
// Import individual components
import { DashboardLayout, LoginForm, AnimatedButton } from '@/components';

// Import from specific categories
import { AuthLayout, LoginForm, SignupForm } from '@/components/auth';
import { DashboardLayout, Sidebar, Header } from '@/components/dashboard';
import { Button, Card, LoadingSpinner } from '@/components/ui';
```

### TypeScript Support

```tsx
import type { 
  DashboardLayoutProps, 
  LoginFormProps, 
  AnimatedButtonProps 
} from '@/types/components';
```

## Authentication Components

### AuthLayout

A responsive layout wrapper for authentication pages (login/signup).

```tsx
import { AuthLayout } from '@/components/auth';

function LoginPage() {
  return (
    <AuthLayout
      title="Sign in to your account"
      description="Welcome back! Please enter your details."
      linkText="Don't have an account?"
      linkHref="/signup"
      linkLabel="Sign up"
    >
      <LoginForm />
    </AuthLayout>
  );
}
```

**Props:**
- `title` (string): Main heading text
- `description` (string): Subtitle text
- `linkText` (string): Text before navigation link
- `linkHref` (string): URL for navigation link
- `linkLabel` (string): Navigation link text
- `children` (ReactNode): Form content

### LoginForm

Complete login form with validation and loading states.

```tsx
import { LoginForm } from '@/components/auth';

function LoginPage() {
  return (
    <LoginForm
      onSuccess={() => console.log('Login successful')}
      onError={(error) => console.error('Login failed:', error)}
      redirectTo="/dashboard"
    />
  );
}
```

**Features:**
- Email and password validation
- Remember me functionality
- Loading states with animations
- Social login placeholders
- Accessibility support

### SignupForm

Registration form with comprehensive validation.

```tsx
import { SignupForm } from '@/components/auth';

function SignupPage() {
  return (
    <SignupForm
      onSuccess={() => console.log('Signup successful')}
      redirectTo="/dashboard"
    />
  );
}
```

**Features:**
- Name, email, password validation
- Password confirmation matching
- Terms of service acceptance
- Strong password requirements
- Real-time validation feedback

### RouteGuard

Protects routes based on authentication status.

```tsx
import { RouteGuard } from '@/components/auth';

function ProtectedPage() {
  return (
    <RouteGuard requireAuth={true} redirectTo="/login">
      <DashboardContent />
    </RouteGuard>
  );
}

// For auth pages (redirect if already logged in)
function LoginPage() {
  return (
    <RouteGuard requireAuth={false} redirectTo="/dashboard">
      <LoginForm />
    </RouteGuard>
  );
}
```

## Dashboard Components

### DashboardLayout

Main layout component for dashboard pages with sidebar and header.

```tsx
import { DashboardLayout } from '@/components/dashboard';

function DashboardPage() {
  return (
    <DashboardLayout>
      <div className="space-y-6">
        <h1 className="text-2xl font-bold">Dashboard</h1>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {/* Dashboard content */}
        </div>
      </div>
    </DashboardLayout>
  );
}
```

**Features:**
- Responsive sidebar with collapse functionality
- Header with breadcrumbs and user menu
- Mobile-friendly navigation
- Keyboard navigation support
- Page transition animations

### Sidebar

Navigation sidebar with collapsible functionality.

```tsx
import { Sidebar } from '@/components/dashboard';

// Used automatically within DashboardLayout
// Can be customized via NavigationContext
```

**Features:**
- Collapsible design
- Active route highlighting
- Mobile overlay mode
- Icon and text navigation
- Badge support for notifications

### Header

Dashboard header with breadcrumbs and user actions.

```tsx
import { Header } from '@/components/dashboard';

// Used automatically within DashboardLayout
// Breadcrumbs are generated automatically based on route
```

**Features:**
- Automatic breadcrumb generation
- Search functionality (placeholder)
- Notifications bell
- User profile dropdown
- Mobile menu toggle

### DataTable

Advanced data table with sorting, filtering, and pagination.

```tsx
import { DataTable } from '@/components/dashboard';

function DataPage() {
  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold">Data Management</h1>
      <DataTable />
    </div>
  );
}
```

**Features:**
- Sortable columns
- Global search
- Status and category filtering
- Row selection
- Pagination
- Column visibility toggle
- Responsive design
- Accessibility support

## UI Components

### AnimatedButton

Enhanced button component with loading states and animations.

```tsx
import { AnimatedButton } from '@/components/ui';

function MyComponent() {
  const [loading, setLoading] = useState(false);

  return (
    <AnimatedButton
      loading={loading}
      loadingText="Saving..."
      animationType="scale"
      onClick={() => setLoading(true)}
    >
      Save Changes
    </AnimatedButton>
  );
}
```

**Animation Types:**
- `scale`: Hover scale effect (default)
- `bounce`: Vertical bounce on hover
- `pulse`: Pulsing scale animation
- `none`: No animations

### LoadingSpinner

Customizable loading spinner component.

```tsx
import { LoadingSpinner } from '@/components/ui';

function LoadingState() {
  return (
    <div className="flex items-center space-x-2">
      <LoadingSpinner size="sm" color="primary" />
      <span>Loading...</span>
    </div>
  );
}
```

**Variants:**
- Sizes: `sm`, `md`, `lg`
- Colors: `primary`, `white`, `gray`

### PageTransition

Smooth page transitions using Framer Motion.

```tsx
import { PageTransition } from '@/components/ui';

function Layout({ children }) {
  return (
    <PageTransition>
      {children}
    </PageTransition>
  );
}
```

## Development Components

### AccessibilityTester

Development tool for testing accessibility compliance.

```tsx
import { AccessibilityTester } from '@/components/dev';

function DevPage() {
  return (
    <AccessibilityTester
      onTestComplete={(results) => console.log(results)}
      testConfig={{
        includeRecommendations: true,
        autoRun: false
      }}
    />
  );
}
```

**Note:** This component is intended for development use only.

## TypeScript Usage

### Component Props

```tsx
import type { DashboardLayoutProps } from '@/types/components';

const MyDashboard: React.FC<DashboardLayoutProps> = ({ children }) => {
  return (
    <DashboardLayout>
      {children}
    </DashboardLayout>
  );
};
```

### Custom Data Types

```tsx
import type { DataTableProps, DataTableItem } from '@/types/components';

interface CustomDataItem extends DataTableItem {
  name: string;
  email: string;
  status: 'active' | 'inactive';
}

const CustomTable: React.FC<DataTableProps<CustomDataItem>> = (props) => {
  return <DataTable {...props} />;
};
```

### Form Handling

```tsx
import type { LoginFormData, FormState } from '@/types/components';

const [formData, setFormData] = useState<LoginFormData>({
  email: '',
  password: '',
  rememberMe: false
});

const [formState, setFormState] = useState<FormState>({
  isLoading: false,
  errors: {}
});
```

## Customization Guide

### Theming

Components use Tailwind CSS classes and can be customized via:

1. **CSS Variables** (recommended):
```css
:root {
  --primary: 220 90% 56%;
  --primary-foreground: 0 0% 100%;
  /* ... other variables */
}
```

2. **Tailwind Config**:
```js
// tailwind.config.js
module.exports = {
  theme: {
    extend: {
      colors: {
        primary: 'hsl(var(--primary))',
        // ... other colors
      }
    }
  }
}
```

### Component Overrides

```tsx
// Custom button with different styling
import { AnimatedButton } from '@/components/ui';

function CustomButton(props) {
  return (
    <AnimatedButton
      {...props}
      className="bg-purple-600 hover:bg-purple-700 text-white"
      animationType="bounce"
    />
  );
}
```

### Navigation Customization

```tsx
import { NavigationProvider } from '@/contexts/NavigationContext';
import { Home, Settings, Users } from 'lucide-react';

const customNavItems = [
  { title: 'Home', href: '/dashboard', icon: Home },
  { title: 'Users', href: '/users', icon: Users },
  { title: 'Settings', href: '/settings', icon: Settings }
];

function App() {
  return (
    <NavigationProvider navigationItems={customNavItems}>
      <DashboardLayout>
        {/* Your content */}
      </DashboardLayout>
    </NavigationProvider>
  );
}
```

### Extending Components

```tsx
// Create a custom dashboard layout
import { DashboardLayout } from '@/components/dashboard';
import type { DashboardLayoutProps } from '@/types/components';

interface CustomDashboardProps extends DashboardLayoutProps {
  showSidebar?: boolean;
  theme?: 'light' | 'dark';
}

export function CustomDashboard({ 
  showSidebar = true, 
  theme = 'light',
  ...props 
}: CustomDashboardProps) {
  return (
    <div className={`dashboard-${theme}`}>
      {showSidebar ? (
        <DashboardLayout {...props} />
      ) : (
        <div className="min-h-screen bg-gray-50">
          {props.children}
        </div>
      )}
    </div>
  );
}
```

## Best Practices

1. **Always use TypeScript interfaces** for component props
2. **Import components from the main index** for consistency
3. **Use the provided context providers** for state management
4. **Follow accessibility guidelines** when extending components
5. **Test components** with the AccessibilityTester in development
6. **Customize via CSS variables** rather than overriding classes
7. **Use semantic HTML** and proper ARIA attributes
8. **Handle loading and error states** appropriately

## Support

For issues or questions about component usage:

1. Check the TypeScript interfaces in `/types/components.ts`
2. Review component source code in `/components/`
3. Test accessibility with the AccessibilityTester component
4. Refer to shadcn/ui documentation for base components