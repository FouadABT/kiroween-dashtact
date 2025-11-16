---
inclusion: fileMatch
fileMatchPattern: '{frontend/src/components/widgets/**,frontend/src/lib/widget-registry.ts,backend/prisma/seed-data/widgets.seed.ts}'
---

# Widget System - AI Agent Guide

## System Overview
Database-backed dashboard widget system. Widgets are React components registered in frontend, seeded in database, and rendered dynamically.

**Stack**: Next.js 14 + NestJS + Prisma + PostgreSQL

---

## Quick Widget Creation

**IMPORTANT**: Always complete steps 1-3 BEFORE adding to registry (step 2). The registry entry should be the LAST step to avoid triggering validation hooks prematurely.

### 1. Create Component
**Location**: `frontend/src/components/widgets/[category]/[WidgetName].tsx`

**Template**:
```typescript
'use client';
import { WidgetContainer } from '../core/WidgetContainer';
import { EmptyState } from '../layout/EmptyState';
import { SkeletonLoader } from '../layout/SkeletonLoader';

export interface [WidgetName]Props {
  title?: string;
  data?: any[];
  loading?: boolean;
  error?: string;
  permission?: string;
}

export function [WidgetName]({
  title = 'Default Title',
  data = [],
  loading = false,
  error,
  permission,
}: [WidgetName]Props) {
  // Loading
  if (loading) return <WidgetContainer title={title} loading><SkeletonLoader /></WidgetContainer>;
  
  // Error
  if (error) return <WidgetContainer title={title} error={error}><EmptyState title="Error" /></WidgetContainer>;
  
  // Empty
  if (data.length === 0) return <WidgetContainer title={title}><EmptyState title="No data" /></WidgetContainer>;
  
  // Success
  return (
    <WidgetContainer title={title} permission={permission}>
      <div className="space-y-2">
        {data.map((item, i) => (
          <div key={i} className="p-3 border border-border rounded-lg">
            {item.name}
          </div>
        ))}
      </div>
    </WidgetContainer>
  );
}
```

### 2. Add to Database Seed
**File**: `backend/prisma/seed-data/widgets.seed.ts`

```typescript
{
  key: 'widget-key',
  name: 'WidgetName',
  description: 'Brief description',
  component: 'WidgetName',
  category: '[category]',
  icon: 'IconName',
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
    permissions: ['resource:read'],
    endpoints: ['/api/endpoint'],
    dependencies: [],
  },
  useCases: ['Use case 1', 'Use case 2'],
  examples: [],
  tags: ['tag1', 'tag2'],
  isSystemWidget: false,
  isActive: true,
},
```

### 3. Register in Frontend (LAST STEP)
**File**: `frontend/src/lib/widget-registry.ts`

**⚠️ IMPORTANT**: Only add to registry AFTER component and seed are complete. This triggers validation hooks.

```typescript
'widget-key': {
  component: lazy(() => import('@/components/widgets/[category]/[WidgetName]')
    .then(m => ({ default: m.[WidgetName] }))),
  defaultProps: {
    title: 'Default Title',
    data: [],
  },
  category: '[category]',
  lazy: true,
},
```

### 4. Seed Database
```bash
cd backend && npm run prisma:seed
```

---

## Critical Rules

### Always Include
- ✅ Default props for ALL parameters
- ✅ Loading, error, empty states
- ✅ WidgetContainer wrapper
- ✅ Safety checks: `Array.isArray(data) ? data : []`
- ✅ Theme colors: `bg-card`, `text-foreground`, `border-border`
- ✅ Responsive: `grid-cols-1 md:grid-cols-2 lg:grid-cols-3`

### Never Do
- ❌ No undefined props (always provide defaults)
- ❌ No direct array access without checks
- ❌ No hardcoded colors (use theme variables)
- ❌ No missing state handlers

---

## Backend API Integration

### When Widget Needs Backend Data

**If your widget fetches data from backend, you MUST create the API endpoint first!**

#### Step 1: Create Backend Controller & Service
**Location**: `backend/src/[resource]/[resource].controller.ts`

```typescript
// Example: backend/src/orders/orders.controller.ts
@Controller('orders')
@UseGuards(JwtAuthGuard, PermissionsGuard)
export class OrdersController {
  constructor(private readonly ordersService: OrdersService) {}

  @Get('recent')
  @RequirePermissions('orders:read')
  async getRecentOrders(@Query('limit') limit: string = '5') {
    return this.ordersService.findRecent(parseInt(limit));
  }
}
```

**Service**:
```typescript
// backend/src/orders/orders.service.ts
@Injectable()
export class OrdersService {
  constructor(private prisma: PrismaClient) {}

  async findRecent(limit: number = 5) {
    const orders = await this.prisma.order.findMany({
      take: limit,
      orderBy: { createdAt: 'desc' },
      include: { customer: true },
    });
    return { orders };
  }
}
```

#### Step 2: Add to App Module
**File**: `backend/src/app.module.ts`

```typescript
@Module({
  imports: [
    // ... other imports
    OrdersModule, // Add your module
  ],
})
export class AppModule {}
```

#### Step 3: Create Frontend API Client
**Location**: `frontend/src/lib/api/[resource].ts`

```typescript
// frontend/src/lib/api/orders.ts
const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001';

export async function getRecentOrders(limit: number = 5) {
  const token = localStorage.getItem('token');
  const response = await fetch(`${API_URL}/orders/recent?limit=${limit}`, {
    headers: {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json',
    },
  });
  
  if (!response.ok) {
    throw new Error('Failed to fetch orders');
  }
  
  return response.json();
}
```

#### Step 4: Use in Widget Component
```typescript
import { getRecentOrders } from '@/lib/api/orders';

export function RecentOrders({ limit = 5 }: { limit?: number }) {
  const [orders, setOrders] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    getRecentOrders(limit)
      .then(data => setOrders(data.orders || []))
      .catch(err => setError(err.message))
      .finally(() => setLoading(false));
  }, [limit]);

  // ... rest of component
}
```

### Backend API Checklist for Widgets

When creating a widget that needs backend data:

- [ ] **Backend Controller**: Create endpoint in `backend/src/[resource]/[resource].controller.ts`
- [ ] **Backend Service**: Implement business logic in `backend/src/[resource]/[resource].service.ts`
- [ ] **Backend Module**: Create/update module in `backend/src/[resource]/[resource].module.ts`
- [ ] **App Module**: Import module in `backend/src/app.module.ts`
- [ ] **Permissions**: Add required permissions to `backend/prisma/seed-data/auth.seed.ts`
- [ ] **Guards**: Use `@UseGuards(JwtAuthGuard, PermissionsGuard)` on controller
- [ ] **Permission Decorator**: Use `@RequirePermissions('resource:action')` on endpoints
- [ ] **Frontend API Client**: Create API function in `frontend/src/lib/api/[resource].ts`
- [ ] **Error Handling**: Handle errors in both backend and frontend
- [ ] **TypeScript Types**: Define types in `frontend/src/types/[resource].ts`
- [ ] **Widget Seed**: Update `dataRequirements.endpoints` in widget seed
- [ ] **Test Endpoint**: Test API endpoint works before integrating widget

### Common Backend Patterns

#### Query Parameters
```typescript
@Get()
async findAll(
  @Query('limit') limit: string = '10',
  @Query('status') status?: string,
) {
  return this.service.findAll({
    limit: parseInt(limit),
    status,
  });
}
```

#### Pagination
```typescript
@Get()
async findAll(
  @Query('page') page: string = '1',
  @Query('perPage') perPage: string = '10',
) {
  const pageNum = parseInt(page);
  const perPageNum = parseInt(perPage);
  
  const [data, total] = await Promise.all([
    this.prisma.resource.findMany({
      skip: (pageNum - 1) * perPageNum,
      take: perPageNum,
    }),
    this.prisma.resource.count(),
  ]);
  
  return {
    data,
    pagination: {
      page: pageNum,
      perPage: perPageNum,
      total,
      totalPages: Math.ceil(total / perPageNum),
    },
  };
}
```

#### Aggregations (for stats widgets)
```typescript
async getStats() {
  const [total, pending, completed] = await Promise.all([
    this.prisma.order.count(),
    this.prisma.order.count({ where: { status: 'PENDING' } }),
    this.prisma.order.count({ where: { status: 'COMPLETED' } }),
  ]);
  
  return { total, pending, completed };
}
```

---

## API Integration in Widgets

### ⚠️ CRITICAL: Use Existing API Client

**NEVER use raw `fetch()` in widgets!** Always use the existing authenticated API client from `@/lib/api`.

**Why?**
- Authentication is handled automatically (JWT tokens from localStorage/sessionStorage)
- Consistent error handling across the app
- Type safety with TypeScript
- Follows existing patterns used in dashboard pages

### Available API Classes

```typescript
import { 
  OrdersApi,      // Orders management
  ProductsApi,    // Products management
  CustomersApi,   // Customers management
  InventoryApi,   // Inventory management
} from '@/lib/api';
```

### Common Patterns

#### Fetch Orders
```typescript
import { OrdersApi } from '@/lib/api';

const [orders, setOrders] = useState<Order[]>([]);
const [loading, setLoading] = useState(true);
const [error, setError] = useState<string | null>(null);

useEffect(() => {
  const fetchOrders = async () => {
    try {
      setLoading(true);
      const data = await OrdersApi.getAll({
        limit: 5,
        sortBy: 'createdAt',
        sortOrder: 'desc',
      });
      setOrders(data.orders || []);
      setError(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load orders');
      setOrders([]);
    } finally {
      setLoading(false);
    }
  };
  
  fetchOrders();
}, []);
```

#### Fetch Products
```typescript
import { ProductsApi } from '@/lib/api';

const data = await ProductsApi.getAll({
  status: 'PUBLISHED' as any,
  limit: 10,
});
const products = data.products || [];
```

#### Fetch Customers
```typescript
import { CustomersApi } from '@/lib/api';

const data = await CustomersApi.getAll({
  limit: 10,
  sortBy: 'createdAt',
  sortOrder: 'desc',
});
const customers = data.customers || [];
```

#### Fetch Inventory
```typescript
import { InventoryApi } from '@/lib/api';

const lowStockItems = await InventoryApi.getLowStockItems();
```

#### Parallel Requests
```typescript
import { OrdersApi, ProductsApi, CustomersApi } from '@/lib/api';

const [ordersData, productsData, customersData] = await Promise.all([
  OrdersApi.getAll({ limit: 1000 }).catch(() => ({ orders: [] })),
  ProductsApi.getAll({ limit: 1000 }).catch(() => ({ products: [] })),
  CustomersApi.getAll({ limit: 1000 }).catch(() => ({ customers: [] })),
]);
```

### Safety Check
```typescript
const safeData = Array.isArray(data) ? data : [];
const safeUser = user && typeof user === 'object' ? user : null;
```

### Troubleshooting 401 Errors

If widgets return 401 Unauthorized:

1. **Check User Permissions**: User must have required permissions (e.g., `orders:read`, `products:read`)
2. **Verify Token**: User must be logged in with valid JWT token
3. **Grant Permissions**: Run `node backend/scripts/grant-super-admin-ecommerce.js` to grant e-commerce permissions
4. **Re-login**: Log out and log back in to refresh JWT token with new permissions

---

## Categories
- `core` - Essential widgets (stats, charts)
- `ecommerce` - E-commerce widgets (orders, products)
- `analytics` - Analytics widgets (metrics, reports)
- `data-display` - Data visualization
- `interactive` - User interaction
- `forms` - Form inputs
- `layout` - Layout components
- `advanced` - Complex widgets
- `utility` - Helper components

---

## File Locations
- **Components**: `frontend/src/components/widgets/[category]/`
- **Registry**: `frontend/src/lib/widget-registry.ts`
- **Seed**: `backend/prisma/seed-data/widgets.seed.ts`
- **Types**: `frontend/src/types/widgets.ts`

---

## Permissions
Add to `backend/prisma/seed-data/auth.seed.ts`:
```typescript
{
  name: 'resource:read',
  resource: 'resource',
  action: 'read',
  description: 'View resource',
}
```

Then assign to roles and reseed: `npm run prisma:seed`

---

## Troubleshooting

**Widget not in library?**
1. Check registered in `widget-registry.ts`
2. Check seeded in database
3. Check `isActive: true` in seed
4. Restart frontend dev server

**Widget shows error?**
1. Add default props
2. Add safety checks for arrays/objects
3. Check API endpoint exists
4. Check user has permission

**Widget not saving?**
1. User needs `layouts:write` permission
2. Backend must be running on port 3001
3. Check browser console for errors

---

## Complete Widget Creation Workflow

### For Widgets WITHOUT Backend Data
1. [ ] Create component in `frontend/src/components/widgets/[category]/[WidgetName].tsx`
2. [ ] Add default props and all states (loading/error/empty)
3. [ ] Add safety checks and use theme variables
4. [ ] Use WidgetContainer wrapper
5. [ ] Add to `backend/prisma/seed-data/widgets.seed.ts`
6. [ ] Run `cd backend && npm run prisma:seed`
7. [ ] **LAST STEP**: Register in `frontend/src/lib/widget-registry.ts` (triggers validation hook)
8. [ ] Test in dashboard
9. [ ] Verify all states work

### For Widgets WITH Backend Data
1. [ ] **Backend Controller**: Create endpoint in `backend/src/[resource]/[resource].controller.ts`
2. [ ] **Backend Service**: Implement logic in `backend/src/[resource]/[resource].service.ts`
3. [ ] **Backend Module**: Create/update `backend/src/[resource]/[resource].module.ts`
4. [ ] **App Module**: Import module in `backend/src/app.module.ts`
5. [ ] **Permissions**: Add to `backend/prisma/seed-data/auth.seed.ts`
6. [ ] **Guards**: Add `@UseGuards(JwtAuthGuard, PermissionsGuard)` to controller
7. [ ] **Permission Decorator**: Add `@RequirePermissions('resource:action')` to endpoint
8. [ ] **Test Backend**: Test endpoint with Postman/curl
9. [ ] **Frontend API Client**: Create in `frontend/src/lib/api/[resource].ts`
10. [ ] **Widget Component**: Create in `frontend/src/components/widgets/[category]/[WidgetName].tsx`
11. [ ] **Use API Client**: Import and use API client in widget (not raw fetch)
12. [ ] Add default props, states, safety checks, theme variables
13. [ ] Use WidgetContainer wrapper
14. [ ] **Widget Seed**: Add to `backend/prisma/seed-data/widgets.seed.ts` with correct `dataRequirements.endpoints`
15. [ ] Run `cd backend && npm run prisma:seed`
16. [ ] **LAST STEP**: Register in `frontend/src/lib/widget-registry.ts` (triggers validation hook)
17. [ ] Test in dashboard with real data
18. [ ] Verify all states work (loading/error/empty/success)

---

## Example: E-commerce Widget

```typescript
// frontend/src/components/widgets/ecommerce/RecentOrders.tsx
export function RecentOrders({ limit = 5 }: { limit?: number }) {
  const [orders, setOrders] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch(`/api/orders?limit=${limit}`)
      .then(res => res.json())
      .then(data => setOrders(data.orders || []))
      .finally(() => setLoading(false));
  }, [limit]);

  if (loading) return <WidgetContainer title="Recent Orders" loading><SkeletonLoader /></WidgetContainer>;
  if (orders.length === 0) return <WidgetContainer title="Recent Orders"><EmptyState title="No orders" /></WidgetContainer>;

  return (
    <WidgetContainer title="Recent Orders" permission="orders:read">
      <div className="space-y-2">
        {orders.map(order => (
          <div key={order.id} className="p-3 border border-border rounded-lg">
            <p className="font-medium">Order #{order.orderNumber}</p>
            <p className="text-sm text-muted-foreground">{order.customerName}</p>
          </div>
        ))}
      </div>
    </WidgetContainer>
  );
}
```

Register:
```typescript
'recent-orders': {
  component: lazy(() => import('@/components/widgets/ecommerce/RecentOrders').then(m => ({ default: m.RecentOrders }))),
  defaultProps: { limit: 5 },
  category: 'ecommerce',
  lazy: true,
}
```

Seed and done!
