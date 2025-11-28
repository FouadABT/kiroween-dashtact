# Widget System - Quick Start Guide

## 🚀 Add Your First Widget in 5 Minutes

This guide will walk you through creating a simple "Recent Orders" widget for your e-commerce dashboard.

---

## Step 1: Create the Widget Component (2 min)

Create `frontend/src/components/widgets/ecommerce/RecentOrders.tsx`:

```typescript
'use client';

import React, { useEffect, useState } from 'react';
import { WidgetContainer } from '../core/WidgetContainer';
import { EmptyState } from '../layout/EmptyState';
import { ShoppingCart } from 'lucide-react';

export interface RecentOrdersProps {
  limit?: number;
  permission?: string;
}

export function RecentOrders({
  limit = 5,
  permission = 'orders:read',
}: RecentOrdersProps) {
  const [orders, setOrders] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch(`/api/orders?limit=${limit}`)
      .then(res => res.json())
      .then(data => setOrders(data.orders || []))
      .catch(err => console.error(err))
      .finally(() => setLoading(false));
  }, [limit]);

  if (loading) {
    return <WidgetContainer title="Recent Orders" loading={true} />;
  }

  if (orders.length === 0) {
    return (
      <WidgetContainer title="Recent Orders">
        <EmptyState
          icon={ShoppingCart}
          title="No orders yet"
          description="Orders will appear here"
        />
      </WidgetContainer>
    );
  }

  return (
    <WidgetContainer title="Recent Orders" permission={permission}>
      <div className="space-y-2">
        {orders.map((order) => (
          <div key={order.id} className="p-3 border rounded-lg">
            <p className="font-medium">Order #{order.orderNumber}</p>
            <p className="text-sm text-muted-foreground">{order.customerName}</p>
          </div>
        ))}
      </div>
    </WidgetContainer>
  );
}
```

---

## Step 2: Register the Widget (1 min)

Add to `frontend/src/lib/widget-registry.ts`:

```typescript
export const widgetRegistry: Record<string, WidgetRegistryEntry> = {
  // ... existing widgets (stats-card, activity-feed)
  
  'recent-orders': {
    component: lazy(() => import('@/components/widgets/ecommerce/RecentOrders')
      .then(m => ({ default: m.RecentOrders }))),
    defaultProps: {
      limit: 5,
    },
    category: 'ecommerce',
    lazy: true,
  },
};
```

---

## Step 3: Add to Database (1 min)

Add to `backend/prisma/seed-data/widgets.seed.ts`:

```typescript
export const widgetDefinitions = [
  // ... existing widgets
  
  {
    key: 'recent-orders',
    name: 'RecentOrders',
    description: 'Displays recent orders from your e-commerce system',
    component: 'RecentOrders',
    category: 'ecommerce',
    icon: 'ShoppingCart',
    defaultGridSpan: 6,
    minGridSpan: 4,
    maxGridSpan: 12,
    configSchema: {
      type: 'object',
      properties: {
        limit: { type: 'number', default: 5 },
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
    ],
    examples: [],
    tags: ['ecommerce', 'orders'],
    isSystemWidget: false,
    isActive: true,
  },
];
```

---

## Step 4: Seed Database (30 sec)

```bash
cd backend
npm run prisma:seed
```

---

## Step 5: Test It! (30 sec)

1. **Restart frontend** (if needed):
   ```bash
   cd frontend
   npm run dev
   ```

2. **Go to dashboard**: `http://localhost:3000/dashboard`

3. **Add widget**:
   - Click "Edit Layout"
   - Click "Add Widget"
   - Find "RecentOrders" in "ecommerce" category
   - Click to add it
   - Click "Save Changes"

4. **Done!** 🎉 Your widget is now on the dashboard!

---

## What You Just Did

✅ Created a widget component with proper structure  
✅ Registered it in the frontend registry  
✅ Added metadata to the database  
✅ Seeded the database  
✅ Tested it on the dashboard  

---

## Next Steps

### Make It Better

1. **Add more features**:
   ```typescript
   // Add click handler
   onOrderClick?: (orderId: string) => void;
   
   // Add status display
   showStatus?: boolean;
   
   // Add filtering
   status?: 'pending' | 'completed' | 'all';
   ```

2. **Add error handling**:
   ```typescript
   const [error, setError] = useState<string | null>(null);
   
   // In fetch
   .catch(err => setError(err.message))
   
   // In render
   if (error) {
     return <WidgetContainer title="Recent Orders" error={error} />;
   }
   ```

3. **Add auto-refresh**:
   ```typescript
   useEffect(() => {
     fetchOrders();
     const interval = setInterval(fetchOrders, 30000); // Every 30s
     return () => clearInterval(interval);
   }, [limit]);
   ```

4. **Add loading skeleton**:
   ```typescript
   import { SkeletonLoader } from '../layout/SkeletonLoader';
   
   if (loading) {
     return (
       <WidgetContainer title="Recent Orders" loading={true}>
         <SkeletonLoader variant="list" count={5} />
       </WidgetContainer>
     );
   }
   ```

### Create More Widgets

Use the same pattern for:
- **Low Stock Alert**: Show products running low
- **Revenue Chart**: Display sales trends
- **Top Products**: Show best sellers
- **Customer Stats**: Display customer metrics
- **Inventory Status**: Show stock levels

---

## Common Issues

### Widget Not Showing?

1. **Check registry**: Is it in `widget-registry.ts`?
2. **Check database**: Did you run `npm run prisma:seed`?
3. **Check permissions**: Does user have `orders:read`?
4. **Check console**: Any errors in browser console?
5. **Restart**: Restart frontend dev server

### Widget Shows Error?

1. **Check API**: Is `/api/orders` endpoint working?
2. **Check data**: Is `orders` array being returned?
3. **Check props**: Are default props set?
4. **Check console**: Look for error messages

### Can't Add Widget?

1. **Check permissions**: User needs `layouts:write`
2. **Check backend**: Is it running on port 3001?
3. **Check database**: Is widget marked `isActive: true`?

---

## Template for Your Next Widget

```typescript
'use client';

import React, { useEffect, useState } from 'react';
import { WidgetContainer } from '../core/WidgetContainer';
import { EmptyState } from '../layout/EmptyState';
import { MyIcon } from 'lucide-react';

export interface MyWidgetProps {
  // Your props here
  myProp?: string;
  permission?: string;
}

export function MyWidget({
  myProp = 'default',
  permission = 'my-resource:read',
}: MyWidgetProps) {
  const [data, setData] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetch('/api/my-endpoint')
      .then(res => res.json())
      .then(result => setData(result.data || []))
      .catch(err => setError(err.message))
      .finally(() => setLoading(false));
  }, [myProp]);

  if (loading) {
    return <WidgetContainer title="My Widget" loading={true} />;
  }

  if (error) {
    return <WidgetContainer title="My Widget" error={error} />;
  }

  if (data.length === 0) {
    return (
      <WidgetContainer title="My Widget">
        <EmptyState
          icon={MyIcon}
          title="No data"
          description="Data will appear here"
        />
      </WidgetContainer>
    );
  }

  return (
    <WidgetContainer title="My Widget" permission={permission}>
      <div className="space-y-2">
        {data.map((item) => (
          <div key={item.id} className="p-3 border rounded-lg">
            {item.name}
          </div>
        ))}
      </div>
    </WidgetContainer>
  );
}
```

---

## Resources

- **Full Guide**: See `WIDGET_SYSTEM_GUIDE.md` for complete documentation
- **Demo Widgets**: Check `StatsCard.tsx` and `ActivityFeed.tsx` for examples
- **Widget System**: See `.kiro/steering/widget-system.md` for architecture

---

**Happy Widget Building!** 🎨
