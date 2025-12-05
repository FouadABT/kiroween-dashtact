# Widget System - Complete Guide

## Table of Contents
1. [Overview](#overview)
2. [Architecture](#architecture)
3. [How It Works](#how-it-works)
4. [Adding a New Widget](#adding-a-new-widget)
5. [Widget Best Practices](#widget-best-practices)
6. [Database Integration](#database-integration)
7. [API Integration](#api-integration)
8. [Testing](#testing)
9. [Troubleshooting](#troubleshooting)
10. [Examples](#examples)

---

## Overview

The Widget System is a flexible, database-backed dashboard customization system that allows users to:
- Add, remove, and arrange widgets on their dashboard
- Configure widget settings
- Save personalized layouts
- Share layouts (future feature)

### Key Features
- **Database-Driven**: Widget definitions stored in PostgreSQL
- **Permission-Based**: Widgets can require specific permissions
- **Lazy Loading**: Widgets load on-demand for performance
- **Type-Safe**: Full TypeScript support
- **Theme-Aware**: Automatic theme integration
- **Responsive**: Mobile-friendly layouts

---

## Architecture

### Components

```
┌─────────────────────────────────────────────────────────────┐
│                     Dashboard Page                           │
│  ┌───────────────────────────────────────────────────────┐  │
│  │              DashboardGrid                            │  │
│  │  ┌─────────────────────────────────────────────────┐ │  │
│  │  │         WidgetRenderer                          │ │  │
│  │  │  ┌───────────────────────────────────────────┐ │ │  │
│  │  │  │      Actual Widget Component              │ │ │  │
│  │  │  │  (StatsCard, ActivityFeed, etc.)          │ │ │  │
│  │  │  └───────────────────────────────────────────┘ │ │  │
│  │  └─────────────────────────────────────────────────┘ │  │
│  └───────────────────────────────────────────────────────┘  │
└─────────────────────────────────────────────────────────────┘
```

### Data Flow

```
User Action → WidgetContext → API Call → Database
                    ↓
            Widget Registry → Component Lookup
                    ↓
            WidgetRenderer → Merge Default Props
                    ↓
            Widget Component → Render
```

### File Structure

```
frontend/src/
├── components/
│   ├── dashboard/
│   │   ├── DashboardGrid.tsx          # Grid layout manager
│   │   ├── WidgetRenderer.tsx         # Widget loader & renderer
│   │   └── SortableWidgetWrapper.tsx  # Drag & drop wrapper
│   └── widgets/
│       ├── core/                      # Core widgets
│       │   ├── StatsCard.tsx
│       │   └── ActivityFeed.tsx
│       ├── ecommerce/                 # E-commerce widgets (add yours here)
│       ├── analytics/                 # Analytics widgets (add yours here)
│       └── [your-category]/           # Your custom category
├── contexts/
│   └── WidgetContext.tsx              # Widget state management
├── lib/
│   └── widget-registry.ts             # Widget registration
└── types/
    └── widgets.ts                     # TypeScript types

backend/src/
├── widgets/
│   ├── widget-registry.controller.ts  # Widget API
│   └── widget-registry.service.ts     # Widget business logic
├── dashboard-layouts/
│   ├── dashboard-layouts.controller.ts # Layout API
│   └── dashboard-layouts.service.ts    # Layout business logic
└── prisma/
    └── seed-data/
        └── widgets.seed.ts            # Widget definitions
```

---

## How It Works

### 1. Widget Registration

Widgets are registered in `frontend/src/lib/widget-registry.ts`:

```typescript
export const widgetRegistry: Record<string, WidgetRegistryEntry> = {
  'my-widget': {
    component: lazy(() => import('@/components/widgets/my-category/MyWidget')
      .then(m => ({ default: m.MyWidget }))),
    defaultProps: {
      // Default values for all props
      title: 'Default Title',
      data: [],
      onAction: () => {},
    },
    category: 'my-category',
    lazy: true,
  },
};
```

### 2. Database Seeding

Widget definitions are stored in the database via `backend/prisma/seed-data/widgets.seed.ts`:

```typescript
export const widgetDefinitions = [
  {
    key: 'my-widget',
    name: 'MyWidget',
    description: 'Description of what the widget does',
    component: 'MyWidget',
    category: 'my-category',
    icon: 'Box',
    defaultGridSpan: 6,
    minGridSpan: 3,
    maxGridSpan: 12,
    configSchema: {
      type: 'object',
      properties: {
        title: { type: 'string' },
        data: { type: 'array' },
      },
      required: ['title'],
    },
    dataRequirements: {
      permissions: ['my-resource:read'],
      endpoints: ['/api/my-data'],
      dependencies: [],
    },
    useCases: [
      'Display my data',
      'Track my metrics',
    ],
    examples: [],
    tags: ['my-category', 'data'],
    isSystemWidget: false,
  },
];
```

### 3. Widget Rendering

When a user adds a widget:
1. **WidgetContext** fetches layout from API
2. **DashboardGrid** renders widget instances
3. **WidgetRenderer** looks up component in registry
4. **WidgetRenderer** merges default props with config
5. **Widget Component** renders with merged props

### 4. Layout Persistence

User layouts are saved to the database:
- Per-user layouts (scope: 'user')
- Global layouts (scope: 'global')
- Widget instances with configuration
- Position and size information

---

## Adding a New Widget

### Step-by-Step Guide

#### Step 1: Create the Widget Component

Create your widget in the appropriate category folder:

```typescript
// frontend/src/components/widgets/ecommerce/RecentOrders.tsx

'use client';

import React, { useEffect, useState } from 'react';
import { WidgetContainer } from '../core/WidgetContainer';
import { EmptyState } from '../layout/EmptyState';
import { SkeletonLoader } from '../layout/SkeletonLoader';
import { ShoppingCart } from 'lucide-react';

/**
 * Props interface
 */
export interface RecentOrdersProps {
  /** Number of orders to display */
  limit?: number;
  /** Show order status */
  showStatus?: boolean;
  /** Callback when order is clicked */
  onOrderClick?: (orderId: string) => void;
  /** Loading state */
  loading?: boolean;
  /** Error message */
  error?: string;
  /** Required permission */
  permission?: string;
}

/**
 * RecentOrders Widget
 * 
 * Displays recent orders from the e-commerce system
 */
export function RecentOrders({
  limit = 5,
  showStatus = true,
  onOrderClick,
  loading = false,
  error,
  permission = 'orders:read',
}: RecentOrdersProps) {
  const [orders, setOrders] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [fetchError, setFetchError] = useState<string | null>(null);

  // Fetch orders from API
  useEffect(() => {
    async function fetchOrders() {
      try {
        setIsLoading(true);
        const response = await fetch(`/api/orders?limit=${limit}&sort=createdAt:desc`);
        
        if (!response.ok) {
          throw new Error('Failed to fetch orders');
        }
        
        const data = await response.json();
        setOrders(data.orders || []);
      } catch (err) {
        setFetchError(err instanceof Error ? err.message : 'Unknown error');
      } finally {
        setIsLoading(false);
      }
    }

    fetchOrders();
  }, [limit]);

  // Loading state
  if (loading || isLoading) {
    return (
      <WidgetContainer title="Recent Orders" loading={true}>
        <SkeletonLoader variant="list" count={limit} />
      </WidgetContainer>
    );
  }

  // Error state
  if (error || fetchError) {
    return (
      <WidgetContainer title="Recent Orders" error={error || fetchError}>
        <EmptyState
          icon={ShoppingCart}
          title="Failed to load orders"
          description={error || fetchError || 'Please try again'}
        />
      </WidgetContainer>
    );
  }

  // Empty state
  if (orders.length === 0) {
    return (
      <WidgetContainer title="Recent Orders">
        <EmptyState
          icon={ShoppingCart}
          title="No orders yet"
          description="Orders will appear here once customers start purchasing"
        />
      </WidgetContainer>
    );
  }

  // Main render
  return (
    <WidgetContainer title="Recent Orders" permission={permission}>
      <div className="space-y-3">
        {orders.map((order) => (
          <div
            key={order.id}
            className="flex items-center justify-between p-3 border border-border rounded-lg hover:bg-accent/50 cursor-pointer transition-colors"
            onClick={() => onOrderClick?.(order.id)}
          >
            <div className="flex-1">
              <p className="font-medium">Order #{order.orderNumber}</p>
              <p className="text-sm text-muted-foreground">
                {order.customerName}
              </p>
            </div>
            
            {showStatus && (
              <div className="flex items-center gap-2">
                <span className={`px-2 py-1 text-xs rounded-full ${
                  order.status === 'completed' ? 'bg-green-100 text-green-800' :
                  order.status === 'pending' ? 'bg-yellow-100 text-yellow-800' :
                  'bg-gray-100 text-gray-800'
                }`}>
                  {order.status}
                </span>
                <span className="font-semibold">${order.total}</span>
              </div>
            )}
          </div>
        ))}
      </div>
    </WidgetContainer>
  );
}
```

#### Step 2: Register in Widget Registry

Add to `frontend/src/lib/widget-registry.ts`:

```typescript
export const widgetRegistry: Record<string, WidgetRegistryEntry> = {
  // ... existing widgets
  
  'recent-orders': {
    component: lazy(() => import('@/components/widgets/ecommerce/RecentOrders')
      .then(m => ({ default: m.RecentOrders }))),
    defaultProps: {
      limit: 5,
      showStatus: true,
      onOrderClick: () => {},
    },
    category: 'ecommerce',
    lazy: true,
  },
};
```

#### Step 3: Add to Database Seed

Add to `backend/prisma/seed-data/widgets.seed.ts`:

```typescript
export const widgetDefinitions = [
  // ... existing widgets
  
  {
    key: 'recent-orders',
    name: 'RecentOrders',
    description: 'Displays recent orders from the e-commerce system with status and customer information',
    component: 'RecentOrders',
    category: 'ecommerce',
    icon: 'ShoppingCart',
    defaultGridSpan: 6,
    minGridSpan: 4,
    maxGridSpan: 12,
    configSchema: {
      type: 'object',
      properties: {
        limit: {
          type: 'number',
          description: 'Number of orders to display',
          minimum: 1,
          maximum: 20,
          default: 5,
        },
        showStatus: {
          type: 'boolean',
          description: 'Show order status',
          default: true,
        },
      },
    },
    dataRequirements: {
      permissions: ['orders:read'],
      endpoints: ['/api/orders'],
      dependencies: [],
    },
    useCases: [
      'Monitor recent customer orders',
      'Quick access to order details',
      'Track order status at a glance',
    ],
    examples: [
      {
        title: 'Basic usage',
        code: '```tsx\n<RecentOrders limit={5} />\n```',
      },
    ],
    tags: ['ecommerce', 'orders', 'sales'],
    isSystemWidget: false,
    isActive: true,
  },
];
```

#### Step 4: Seed the Database

```bash
cd backend
npm run prisma:seed
```

#### Step 5: Test the Widget

1. Restart frontend dev server
2. Go to `/dashboard`
3. Click "Edit Layout"
4. Click "Add Widget"
5. Find your widget in the "ecommerce" category
6. Add it to the dashboard
7. Verify it renders correctly

---

## Widget Best Practices

### 1. Always Provide Default Props

```typescript
// ✅ GOOD
export function MyWidget({
  data = [],           // Default empty array
  title = 'Default',   // Default string
  onAction = () => {}, // Default no-op function
}: MyWidgetProps) {
```

```typescript
// ❌ BAD
export function MyWidget({
  data,    // Can be undefined!
  title,   // Can be undefined!
  onAction, // Can be undefined!
}: MyWidgetProps) {
```

### 2. Add Safety Checks

```typescript
// ✅ GOOD
const safeData = Array.isArray(data) ? data : [];

if (!user || typeof user !== 'object') {
  return <EmptyState message="No user data" />;
}
```

```typescript
// ❌ BAD
data.map(item => ...)  // Crashes if data is undefined!
user.name              // Crashes if user is undefined!
```

### 3. Handle All States

```typescript
// Loading state
if (loading) {
  return <SkeletonLoader />;
}

// Error state
if (error) {
  return <EmptyState icon={AlertCircle} title="Error" description={error} />;
}

// Empty state
if (data.length === 0) {
  return <EmptyState icon={Inbox} title="No data" />;
}

// Success state
return <div>{/* Render data */}</div>;
```

### 4. Use WidgetContainer

```typescript
// ✅ GOOD - Consistent styling and features
return (
  <WidgetContainer
    title={title}
    loading={loading}
    error={error}
    permission={permission}
  >
    {/* Content */}
  </WidgetContainer>
);
```

### 5. Make It Responsive

```typescript
// ✅ GOOD - Responsive grid
<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
  {items.map(item => <ItemCard key={item.id} item={item} />)}
</div>
```

### 6. Use Theme Colors

```typescript
// ✅ GOOD - Theme-aware colors
<div className="bg-card text-card-foreground border-border">
  <h3 className="text-foreground">Title</h3>
  <p className="text-muted-foreground">Description</p>
</div>
```

### 7. Add Accessibility

```typescript
// ✅ GOOD - Accessible
<button
  aria-label="Close widget"
  onClick={onClose}
  className="focus:outline-none focus:ring-2 focus:ring-primary"
>
  <X className="h-4 w-4" />
</button>
```

### 8. Optimize Performance

```typescript
// ✅ GOOD - Memoized
const processedData = useMemo(() => {
  return data.map(item => /* expensive operation */);
}, [data]);

export const MyWidget = React.memo(function MyWidget(props) {
  // Component code
});
```

---

## Database Integration

### Fetching Data from Your API

```typescript
export function MyWidget({ limit = 10 }: MyWidgetProps) {
  const [data, setData] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function fetchData() {
      try {
        setLoading(true);
        
        // Fetch from your API
        const response = await fetch(`/api/my-endpoint?limit=${limit}`);
        
        if (!response.ok) {
          throw new Error(`HTTP ${response.status}: ${response.statusText}`);
        }
        
        const result = await response.json();
        setData(result.data || []);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Unknown error');
        console.error('Failed to fetch data:', err);
      } finally {
        setLoading(false);
      }
    }

    fetchData();
    
    // Optional: Auto-refresh every 30 seconds
    const interval = setInterval(fetchData, 30000);
    return () => clearInterval(interval);
  }, [limit]);

  // Render logic...
}
```

### Using React Query (Recommended)

```typescript
import { useQuery } from '@tanstack/react-query';

export function MyWidget({ limit = 10 }: MyWidgetProps) {
  const { data, isLoading, error } = useQuery({
    queryKey: ['my-data', limit],
    queryFn: async () => {
      const response = await fetch(`/api/my-endpoint?limit=${limit}`);
      if (!response.ok) throw new Error('Failed to fetch');
      return response.json();
    },
    refetchInterval: 30000, // Auto-refresh every 30s
  });

  // Render logic...
}
```

---

## API Integration

### Creating a Backend Endpoint

```typescript
// backend/src/my-module/my-module.controller.ts

import { Controller, Get, Query, UseGuards } from '@nestjs/common';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { PermissionsGuard } from '../auth/guards/permissions.guard';
import { Permissions } from '../auth/decorators/permissions.decorator';

@Controller('my-endpoint')
@UseGuards(JwtAuthGuard, PermissionsGuard)
export class MyModuleController {
  constructor(private readonly myService: MyService) {}

  @Get()
  @Permissions('my-resource:read')
  async getData(@Query('limit') limit: number = 10) {
    const data = await this.myService.findAll({ limit });
    return {
      data,
      total: data.length,
    };
  }
}
```

### Adding Permissions

```typescript
// backend/prisma/seed-data/auth.seed.ts

export const DEFAULT_PERMISSIONS = [
  // ... existing permissions
  
  {
    name: 'my-resource:read',
    resource: 'my-resource',
    action: 'read',
    description: 'View my resource data',
  },
];

export const DEFAULT_ROLES = {
  ADMIN: {
    permissions: [
      // ... existing permissions
      'my-resource:read',
    ],
  },
};
```

Then reseed:
```bash
cd backend
npm run prisma:seed
```

---

## Testing

### Unit Test Example

```typescript
// frontend/src/components/widgets/ecommerce/__tests__/RecentOrders.test.tsx

import { render, screen, waitFor } from '@testing-library/react';
import { RecentOrders } from '../RecentOrders';

describe('RecentOrders', () => {
  it('renders loading state', () => {
    render(<RecentOrders loading={true} />);
    expect(screen.getByText('Recent Orders')).toBeInTheDocument();
  });

  it('renders error state', () => {
    render(<RecentOrders error="Failed to load" />);
    expect(screen.getByText('Failed to load orders')).toBeInTheDocument();
  });

  it('renders empty state', async () => {
    global.fetch = jest.fn(() =>
      Promise.resolve({
        ok: true,
        json: () => Promise.resolve({ orders: [] }),
      })
    ) as jest.Mock;

    render(<RecentOrders />);
    
    await waitFor(() => {
      expect(screen.getByText('No orders yet')).toBeInTheDocument();
    });
  });

  it('renders orders', async () => {
    const mockOrders = [
      { id: '1', orderNumber: '1001', customerName: 'John Doe', status: 'completed', total: 99.99 },
    ];

    global.fetch = jest.fn(() =>
      Promise.resolve({
        ok: true,
        json: () => Promise.resolve({ orders: mockOrders }),
      })
    ) as jest.Mock;

    render(<RecentOrders />);
    
    await waitFor(() => {
      expect(screen.getByText('Order #1001')).toBeInTheDocument();
      expect(screen.getByText('John Doe')).toBeInTheDocument();
    });
  });
});
```

---

## Troubleshooting

### Widget Not Appearing in Library

**Checklist**:
- [ ] Widget registered in `widget-registry.ts`
- [ ] Widget seeded in database (`npm run prisma:seed`)
- [ ] Widget marked as `isActive: true` in seed data
- [ ] User has required permissions
- [ ] Frontend dev server restarted
- [ ] Browser cache cleared

### Widget Shows Error

**Common Causes**:
1. **Undefined props**: Add default values
2. **Missing data**: Add safety checks (`Array.isArray()`, null checks)
3. **API errors**: Check backend logs and Network tab
4. **Permission denied**: Grant required permission to user's role

### Widget Not Saving

**Checklist**:
- [ ] User has `layouts:write` permission
- [ ] Backend running on port 3001
- [ ] No validation errors (check console)
- [ ] Database connection working

---

## Examples

### Example 1: Simple Display Widget

```typescript
export function TotalSales({ period = '30d' }: TotalSalesProps) {
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch(`/api/sales/total?period=${period}`)
      .then(res => res.json())
      .then(data => setTotal(data.total))
      .finally(() => setLoading(false));
  }, [period]);

  return (
    <WidgetContainer title="Total Sales" loading={loading}>
      <div className="text-3xl font-bold">${total.toLocaleString()}</div>
      <p className="text-sm text-muted-foreground">Last {period}</p>
    </WidgetContainer>
  );
}
```

### Example 2: Interactive Widget

```typescript
export function ProductSearch({ onProductSelect }: ProductSearchProps) {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<Product[]>([]);

  const debouncedSearch = useMemo(
    () => debounce((q: string) => {
      fetch(`/api/products/search?q=${q}`)
        .then(res => res.json())
        .then(data => setResults(data.products));
    }, 300),
    []
  );

  return (
    <WidgetContainer title="Product Search">
      <input
        type="text"
        value={query}
        onChange={(e) => {
          setQuery(e.target.value);
          debouncedSearch(e.target.value);
        }}
        placeholder="Search products..."
        className="w-full px-3 py-2 border rounded"
      />
      
      <div className="mt-4 space-y-2">
        {results.map(product => (
          <div
            key={product.id}
            onClick={() => onProductSelect?.(product)}
            className="p-2 hover:bg-accent rounded cursor-pointer"
          >
            {product.name}
          </div>
        ))}
      </div>
    </WidgetContainer>
  );
}
```

### Example 3: Chart Widget

```typescript
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

export function SalesChart({ period = '30d' }: SalesChartProps) {
  const [data, setData] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch(`/api/sales/chart?period=${period}`)
      .then(res => res.json())
      .then(result => setData(result.data))
      .finally(() => setLoading(false));
  }, [period]);

  if (loading) {
    return <WidgetContainer title="Sales Chart" loading={true}><SkeletonLoader /></WidgetContainer>;
  }

  return (
    <WidgetContainer title="Sales Chart">
      <ResponsiveContainer width="100%" height={300}>
        <LineChart data={data}>
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis dataKey="date" />
          <YAxis />
          <Tooltip />
          <Line type="monotone" dataKey="sales" stroke="hsl(var(--primary))" />
        </LineChart>
      </ResponsiveContainer>
    </WidgetContainer>
  );
}
```

---

## Quick Reference

### Widget Checklist

When creating a new widget:

- [ ] Create component in `frontend/src/components/widgets/[category]/`
- [ ] Add default props to all parameters
- [ ] Add safety checks for arrays and objects
- [ ] Handle loading, error, and empty states
- [ ] Use `WidgetContainer` wrapper
- [ ] Make responsive with Tailwind classes
- [ ] Use theme colors (`bg-card`, `text-foreground`, etc.)
- [ ] Add accessibility attributes
- [ ] Register in `widget-registry.ts` with default props
- [ ] Add to `widgets.seed.ts` with metadata
- [ ] Run `npm run prisma:seed` in backend
- [ ] Test in dashboard
- [ ] Write unit tests

### Common Patterns

```typescript
// Fetch data
useEffect(() => {
  fetch('/api/endpoint').then(res => res.json()).then(setData);
}, []);

// Safety check
const safeData = Array.isArray(data) ? data : [];

// Empty state
if (safeData.length === 0) return <EmptyState />;

// Theme colors
className="bg-card text-card-foreground border-border"

// Responsive
className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3"
```

---

## Support

For questions or issues:
1. Check this guide
2. Review demo widgets (`StatsCard`, `ActivityFeed`)
3. Check browser console for errors
4. Review backend logs
5. Check database for widget definitions

---

**Version**: 1.0.0  
**Last Updated**: November 16, 2024
